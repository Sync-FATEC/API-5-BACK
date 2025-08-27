import { RoleEnum } from "../database/enums/RoleEnum";

export type UsersType = {
    email: string,
    name: string,
    firebaseUid: string,
    role: RoleEnum,
}