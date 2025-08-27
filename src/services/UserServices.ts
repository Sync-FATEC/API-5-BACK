import { adminFirebase } from "..";
import { SystemError } from "../middlewares/SystemError";
import { UsersRepository } from "../repository/UsersRepository";
import { UsersType } from "../types/UsersType";

const usersRepository = new UsersRepository();

export class UserServices {
  async loginUser(firebaseUid: string, idToken: string) {
    try {
      const decodedToken = await adminFirebase.auth().verifyIdToken(idToken);

      if (decodedToken.uid !== firebaseUid) {
        throw new SystemError("Token inválido");
      }

      const user = await usersRepository.getUserByFirebaseId(firebaseUid);

      if (!user) {
        throw new SystemError("Usuário não encontrado");
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error("Erro no serviço de login:", error);
      throw error;
    }
  }

  async createUser(user: UsersType) {
    try {
      await usersRepository.isValidUser(user);
      await usersRepository.createFireBaseUser(user);
      return "Usuario cadastrado com sucesso";
    } catch (error) {
      await adminFirebase.auth().deleteUser(user.firebaseUid);
      throw error;
    }
  }
}
