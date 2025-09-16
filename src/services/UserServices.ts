import { adminFirebase, firebaseAuth } from "..";
import { SystemError } from "../middlewares/SystemError";
import { UsersRepository } from "../repository/UsersRepository";
import { UsersType } from "../types/UsersType";
import { signInWithEmailAndPassword } from "firebase/auth";

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

  async loginWithEmailPassword(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const firebaseUser = userCredential.user;
      
      const idToken = await firebaseUser.getIdToken();
      
      const user = await usersRepository.getUserByEmail(email);
      
      if (!user) {
        throw new SystemError("Usuário não encontrado no banco de dados");
      }
      
      if (!user.isActive) {
        throw new SystemError("Usuário inativo");
      }
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: user.firebaseUid,
          createdAt: user.createdAt
        },
        token: idToken,
      };
    } catch (error: any) {
      console.error("Erro no login com email e senha:", error);
      
      if (error.code === 'auth/user-not-found') {
        throw new SystemError("Email não encontrado");
      }
      
      if (error.code === 'auth/wrong-password') {
        throw new SystemError("Senha incorreta");
      }
      
      if (error.code === 'auth/invalid-email') {
        throw new SystemError("Email inválido");
      }
      
      if (error.code === 'auth/user-disabled') {
        throw new SystemError("Usuário desabilitado");
      }
      
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

  async forgotPassword(email: string) {
    try {
      await usersRepository.forgotPassword(email);
      return "Email de redefinição de senha enviado";
    } catch (error) {
      throw error;
    }
  }

  async getUserData(email: string) {
    try {
      const user = await usersRepository.getUserByEmail(email);

      if (!user) {
        throw new SystemError("Usuário não encontrado");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        validUntil: user.validUntil,
        createdAt: user.createdAt,
        isActive: user.isActive
      };
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      throw error;
    }
  }
}
