import { AppDataSource } from "../database/data-source";
import { User } from "../database/entities/User";
import { SystemError } from "../middlewares/SystemError";
import { UsersType } from "../types/UsersType";
import { RoleEnum } from "../database/enums/RoleEnum";
import { StockResponsibility } from "../database/enums/StockResponsability";
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../index";

const repository = AppDataSource.getRepository(User)

export class UsersRepository {

    // Função para criar o usuarios
    async create(user: UsersType) {
        try {
            const savedUser = await repository.save(user)

            return savedUser
        } catch (error) {
            console.error("Erro ao criar o usuario", error)
            throw error
        }
    }

    // Função para criar o usuario no firebase e no banco de dados
    async createFireBaseUser(user: UsersType) {
        try {
            const userFirebase = await createUserWithEmailAndPassword(firebaseAuth, user.email as string, user.email as string)

            
            const userDB = await this.create({
                email: user.email as string,
                name: user.name as string,
                firebaseUid: userFirebase.user.uid,
                role: user.role as RoleEnum,
            })
            
            await this.forgotPassword(user.email as string)
            
            return userDB
        } catch (error) {
            console.error("Erro ao criar o usuario", error)
            throw error
        }
    }

    async forgotPassword(email: string) {
        try {
            const user = await repository.findOne({
                where: {
                    email
                }
            })

            if(!user) {
                throw new SystemError("Email não cadastrado")
            }

            await sendPasswordResetEmail(firebaseAuth, email)
        } catch (error) {
            console.error("Erro ao resetar a senha", error)
            throw error
        }
    }

    async getUserByEmail(email: string) {
        try {
            return await repository.findOne({
                where: {
                    email
                },
            })
        } catch (error) {
            console.error("Erro ao buscar o usuario", error)
            throw error
        }
    }

    // Função para puxar user pelo firebaseUid
    async getUserByFirebaseId(firebaseUid: string) {
        try {
            const user = await repository.findOne({
                where: {
                    firebaseUid
                },
            })
            return user
        } catch (error) {
            console.error("Erro ao buscar o usuario", error)
            throw error;
        }
    }

    // Função para validar se o usuario pode criar uma conta ou nao
    async isValidUser(user: UsersType) {
        try {
            const haveEmail = await repository.count({
                where: {
                    email: user.email
                }
            })

            if (haveEmail) {
                throw new SystemError("Email ja cadastrado")
            }

            return true
        } catch (error) {
            console.error("Erro ao validar o usuario", error)
            throw error;
        }
    }

    async getUserRole(firebaseUid: string) {
        try {
            const user = await this.getUserByFirebaseId(firebaseUid)

            if(!user) {
                throw new SystemError("Usuario não encontrado")
            }

            return user.role
        } catch (error) {
            console.error("Erro ao buscar o role do usuario", error)
            throw error;
        }
    }

    // Função para buscar todos os usuários
    async getAllUsers() {
        try {
            return await repository.find({
                order: {
                    createdAt: 'DESC'
                }
            });
        } catch (error) {
            console.error("Erro ao buscar todos os usuários", error);
            throw error;
        }
    }

    // Função para atualizar usuário
    async updateUser(userId: string, updateData: { name?: string; email?: string; role?: RoleEnum; isActive?: boolean }) {
        try {
            const user = await repository.findOne({
                where: {
                    id: userId
                }
            });

            if (!user) {
                throw new SystemError("Usuário não encontrado");
            }

            // Atualizar apenas os campos fornecidos
            if (updateData.name !== undefined) user.name = updateData.name;
            if (updateData.email !== undefined) user.email = updateData.email;
            if (updateData.role !== undefined) user.role = updateData.role;
            if (updateData.isActive !== undefined) user.isActive = updateData.isActive;

            return await repository.save(user);
        } catch (error) {
            console.error("Erro ao atualizar usuário", error);
            throw error;
        }
    }

    // Função para deletar usuário
    async deleteUser(userId: string) {
        try {
            const user = await repository.findOne({
                where: {
                    id: userId
                }
            });

            if (!user) {
                throw new SystemError("Usuário não encontrado");
            }

            await repository.remove(user);
            return true;
        } catch (error) {
            console.error("Erro ao deletar usuário", error);
            throw error;
        }
    }

    // Função para vincular usuário a estoque
    async linkUserToStock(userId: string, stockId: string, responsibility: string) {
        try {
            const { UserStock } = require("../database/entities/UserStock");
            const userStockRepository = AppDataSource.getRepository(UserStock);

            // Verificar se o usuário existe
            const user = await repository.findOne({ where: { id: userId } });
            if (!user) {
                throw new SystemError("Usuário não encontrado");
            }

            // Verificar se o estoque existe
            const { Stock } = require("../database/entities/Stock");
            const stockRepository = AppDataSource.getRepository(Stock);
            const stock = await stockRepository.findOne({ where: { id: stockId } });
            if (!stock) {
                throw new SystemError("Estoque não encontrado");
            }

            // Validar e converter responsabilidade para o enum
            let stockResponsibility: StockResponsibility;
            
            switch (responsibility.toUpperCase()) {
                case 'ADMIN':
                    stockResponsibility = StockResponsibility.ADMIN;
                    break;
                case 'MANAGER':
                    stockResponsibility = StockResponsibility.MANAGER;
                    break;
                case 'USER':
                    stockResponsibility = StockResponsibility.USER;
                    break;
                default:
                    throw new SystemError(`Responsabilidade inválida: ${responsibility}. Valores válidos: ADMIN, MANAGER, USER`);
            }

            // Verificar se já existe vinculação
            const existingLink = await userStockRepository.findOne({
                where: { userId, stockId }
            });

            if (existingLink) {
                // Atualizar responsabilidade se já existe
                existingLink.responsibility = stockResponsibility;
                return await userStockRepository.save(existingLink);
            } else {
                // Criar nova vinculação
                const userStock = userStockRepository.create({
                    userId,
                    stockId,
                    responsibility: stockResponsibility
                });
                return await userStockRepository.save(userStock);
            }
        } catch (error) {
            console.error("Erro ao vincular usuário ao estoque", error);
            throw error;
        }
    }

    // Função para desvincular usuário de estoque
    async unlinkUserFromStock(userId: string, stockId: string) {
        try {
            const { UserStock } = require("../database/entities/UserStock");
            const userStockRepository = AppDataSource.getRepository(UserStock);

            const userStock = await userStockRepository.findOne({
                where: { userId, stockId }
            });

            if (!userStock) {
                throw new SystemError("Vinculação não encontrada");
            }

            await userStockRepository.remove(userStock);
            return true;
        } catch (error) {
            console.error("Erro ao desvincular usuário do estoque", error);
            throw error;
        }
    }

    // Função para buscar estoques de um usuário
    async getUserStocks(userId: string) {
        try {
            const { UserStock } = require("../database/entities/UserStock");
            const userStockRepository = AppDataSource.getRepository(UserStock);

            const userStocks = await userStockRepository.find({
                where: { userId },
                relations: ['stock']
            });

            return userStocks.map(us => ({
                stockId: us.stockId,
                stockName: us.stock.name,
                stockLocation: us.stock.location,
                responsibility: us.responsibility
            }));
        } catch (error) {
            console.error("Erro ao buscar estoques do usuário", error);
            throw error;
        }
    }
}