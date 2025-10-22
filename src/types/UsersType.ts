import { RoleEnum } from "../database/enums/RoleEnum";

export type UsersType = {
    email: string,
    name: string,
    stockId: string,
    firebaseUid: string,
    role: RoleEnum,
}