import { Request, Response, NextFunction } from "express";
import { UsersType } from "../types/UsersType";
import { SystemError } from "../middlewares/SystemError";
import { UserServices } from "../services/UserServices";

const userServices = new UserServices();
export class UserController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email } = req.body;

            if (!name || !email) {
                throw new SystemError("Dados incompletos");
            }

            const userType = {
                email,
                name,
            } as UsersType

            const user = await userServices.createUser(userType);
            res.status(201).json({
                success: true,
                data: user,
                message: "Usuário criado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { firebaseUid, idToken } = req.body;

            if (!firebaseUid || !idToken) {
                throw new SystemError("Firebase UID e token são obrigatórios");
            }

            const user = await userServices.loginUser(firebaseUid, idToken);
            res.status(200).json({
                success: true,
                data: user,
                message: "Login realizado com sucesso"
            });
        } catch (error) {
            next(error);
        }
    }
}