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
      
      if (error.code === 'auth/invalid-credential') {
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

  async getAllUsers() {
    try {
      const users = await usersRepository.getAllUsers();
      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        validUntil: user.validUntil,
        createdAt: user.createdAt,
        isActive: user.isActive,
        stocks: user.userStocks.map(userStock => ({
          stockId: userStock.stockId,
          stockName: userStock.stock.name,
          responsibility: userStock.responsibility
        }))
      }));
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: { name?: string; email?: string; role?: any; isActive?: boolean }) {
    try {
      const updatedUser = await usersRepository.updateUser(userId, updateData);
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        validUntil: updatedUser.validUntil,
        createdAt: updatedUser.createdAt,
        isActive: updatedUser.isActive
      };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await usersRepository.deleteUser(userId);
      return "Usuário deletado com sucesso";
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  }

  async linkUserToStock(userId: string, stockId: string, responsibility: string) {
    try {
      const userStock = await usersRepository.linkUserToStock(userId, stockId, responsibility);
      return userStock;
    } catch (error) {
      console.error("Erro ao vincular usuário ao estoque:", error);
      throw error;
    }
  }

  async unlinkUserFromStock(userId: string, stockId: string) {
    try {
      await usersRepository.unlinkUserFromStock(userId, stockId);
      return "Usuário desvinculado do estoque com sucesso";
    } catch (error) {
      console.error("Erro ao desvincular usuário do estoque:", error);
      throw error;
    }
  }

  async getUserStocks(userId: string) {
    try {
      const stocks = await usersRepository.getUserStocks(userId);
      return stocks;
    } catch (error) {
      console.error("Erro ao buscar estoques do usuário:", error);
      throw error;
    }
  }

  async changePassword(email: string, currentPassword: string, newPassword: string) {
    try {
      // Validar se a nova senha atende aos critérios mínimos
      if (!newPassword || newPassword.length < 6) {
        throw new SystemError("A nova senha deve ter pelo menos 6 caracteres");
      }

      if (currentPassword === newPassword) {
        throw new SystemError("A nova senha deve ser diferente da senha atual");
      }

      // Chamar o método do repository para alterar a senha
      return await usersRepository.changePassword(email, currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  }
}
