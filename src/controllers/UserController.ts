import { Request, Response, NextFunction } from "express";
import { UsersType } from "../types/UsersType";
import { SystemError } from "../middlewares/SystemError";
import { UserServices } from "../services/UserServices";

const userServices = new UserServices();
export class UserController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const users = req.body.users;

            if (!users || !Array.isArray(users) || users.length === 0) {
                throw new SystemError("Lista de usuários é obrigatória");
            }

            for (const user of users) {
                if (!user.name || !user.email || !user.role) {
                    throw new SystemError("Dados incompletos em um ou mais usuários");
                }
            }

            const userTypes = users.map(user => ({
                email: user.email,
                name: user.name,
                role: user.role,
            } as UsersType));

            await Promise.all(userTypes.map(userType => userServices.createUser(userType)));

            res.status(201).json({
                success: true,
                data: userTypes,
                message: "Usuários criados com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new SystemError("Email e senha são obrigatórios");
            }

            const loginResult = await userServices.loginWithEmailPassword(email, password);
            res.status(200).json({
                success: true,
                data: loginResult,
                message: "Login realizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            if (!email) {
                throw new SystemError("Email é obrigatório");
            }

            await userServices.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: "Email de redefinição de senha enviado"
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserData(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.params.email;

            if (!email) {
                throw new SystemError("Usuário não autenticado");
            }

            const userData = await userServices.getUserData(email);
            res.status(200).json({
                success: true,
                data: userData,
                message: "Dados do usuário obtidos com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userServices.getAllUsers();
            res.status(200).json({
                success: true,
                data: { users },
                message: "Usuários obtidos com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const { name, email, role, isActive } = req.body;

            if (!userId) {
                throw new SystemError("ID do usuário é obrigatório");
            }

            const userData = await userServices.updateUser(userId, { name, email, role, isActive });
            res.status(200).json({
                success: true,
                data: userData,
                message: "Usuário atualizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;

            if (!userId) {
                throw new SystemError("ID do usuário é obrigatório");
            }

            await userServices.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: "Usuário deletado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async linkUserToStock(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId;
            const { stockId, responsibility } = req.body;

            if (!userId || !stockId || !responsibility) {
                throw new SystemError("Dados incompletos para vincular usuário ao estoque");
            }

            const userStock = await userServices.linkUserToStock(userId, stockId, responsibility);
            res.status(200).json({
                success: true,
                data: userStock,
                message: "Usuário vinculado ao estoque com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async unlinkUserFromStock(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, stockId } = req.params;

            if (!userId || !stockId) {
                throw new SystemError("ID do usuário e estoque são obrigatórios");
            }

            await userServices.unlinkUserFromStock(userId, stockId);
            res.status(200).json({
                success: true,
                message: "Usuário desvinculado do estoque com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserStocks(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                throw new SystemError("ID do usuário é obrigatório");
            }

            const userStocks = await userServices.getUserStocks(userId);
            res.status(200).json({
                success: true,
                data: userStocks,
                message: "Estoques do usuário obtidos com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, currentPassword, newPassword } = req.body;

            if (!email || !currentPassword || !newPassword) {
                throw new SystemError("Email, senha atual e nova senha são obrigatórios");
            }

            const result = await userServices.changePassword(email, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                data: result,
                message: "Senha alterada com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }
}