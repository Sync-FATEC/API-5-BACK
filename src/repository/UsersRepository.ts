import { AppDataSource } from "../database/data-source";
import { Users } from "../database/entities/User";
import { SystemError } from "../middlewares/SystemError";
import { UsersType } from "../types/UsersType";
import { RoleEnum } from "../database/enums/RoleEnum";
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../index";

const repository = AppDataSource.getRepository(Users)

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

            await this.forgotPassword(user.email as string)

            const userDB = await this.create({
                email: user.email as string,
                name: user.name as string,
                firebaseUid: userFirebase.user.uid,
                role: user.role as RoleEnum,
            })

            return userDB
        } catch (error) {
            console.error("Erro ao criar o usuario", error)
            throw error
        }
    }

    async forgotPassword(email: string) {
        try {
            await sendPasswordResetEmail(firebaseAuth, email)
        } catch (error) {
            console.error("Erro ao resetar a senha", error)
            throw error
        }
    }


    // Função para buscar o usuario pelo email e retornar as compras e configurações
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
            return await repository.findOne({
                where: {
                    firebaseUid
                },
            })
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
}