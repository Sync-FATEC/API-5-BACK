import { NextFunction, Request, Response } from 'express';
import { auth } from 'firebase-admin';
import { UsersRepository } from '../repository/UsersRepository';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        userData?: any;
      };
    }
  }
}

const userRepository = new UsersRepository();

export class AuthMiddleware {
  /**
   * Middleware de autenticação que verifica o token Firebase e carrega dados do usuário
   */
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (!token) {
        res.status(401).json({ 
          error: 'Token de autorização é obrigatório.',
          code: 'MISSING_TOKEN'
        });
        return;
      }

      const decodedToken = await AuthMiddleware.verifyToken(token);
      const userData = await AuthMiddleware.getUserData(decodedToken.uid);
      
      if (!userData) {
        res.status(401).json({ 
          error: 'Usuário não encontrado ou não autorizado.',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // Anexa informações do usuário à requisição
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        userData
      };

      next();
    } catch (error) {
      AuthMiddleware.handleAuthError(error, res);
    }
  }

  /**
   * Extrai o token Bearer do cabeçalho Authorization
   */
  private static extractToken(req: Request): string | null {
    const authorization = req.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    
    return authorization.split('Bearer ')[1];
  }

  /**
   * Verifica e decodifica o token Firebase
   */
  private static async verifyToken(token: string) {
    try {
      return await auth().verifyIdToken(token, true);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Busca dados do usuário no banco de dados
   */
  private static async getUserData(firebaseUid: string) {
    try {
      return await userRepository.getUserByFirebaseId(firebaseUid);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  /**
   * Trata erros de autenticação de forma centralizada
   */
  private static handleAuthError(error: unknown, res: Response): void {
    console.error('Erro de autenticação:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno de autenticação';
    
    if (errorMessage.includes('Token inválido') || errorMessage.includes('expirado')) {
      res.status(401).json({ 
        error: 'Token inválido ou expirado.',
        code: 'INVALID_TOKEN'
      });
    } else {
      res.status(500).json({ 
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Middleware opcional para verificar se o usuário tem permissões específicas
   */
  static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user?.userData?.role || !roles.includes(req.user.userData.role)) {
        res.status(403).json({ 
          error: 'Permissões insuficientes.',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }
      next();
    };
  }
}

export const authMiddleware = AuthMiddleware.authenticate;