import "reflect-metadata";
import { AppDataSource } from "../database/data-source";
import { Users } from "../database/entities/User";
import { RoleEnum } from "../database/enums/RoleEnum";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { config } from "dotenv";

config();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

async function seedAdminUser() {
  try {
    // Inicializar conexão com o banco de dados
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados estabelecida.");

    // Obter o repositório de usuários
    const userRepository = AppDataSource.getRepository(Users);

    const adminEmail = "admin@admin.com";
    const adminPassword = "admin123456";
    let firebaseUid: string;
    let shouldCreateInDB = true;

    // Verificar se já existe um usuário admin no banco
    const existingAdminInDB = await userRepository.findOne({
      where: { email: adminEmail }
    });

    if (existingAdminInDB) {
      console.log("Usuário admin já existe no banco de dados.");
      return;
    }

    try {
      // Tentar criar usuário no Firebase
      console.log("Criando usuário no Firebase...");
      const userFirebase = await createUserWithEmailAndPassword(firebaseAuth, adminEmail, adminPassword);
      firebaseUid = userFirebase.user.uid;
      console.log("Usuário criado no Firebase com sucesso. UID:", firebaseUid);
    } catch (firebaseError: any) {
      if (firebaseError.code === 'auth/email-already-in-use') {
        console.log("Usuário já existe no Firebase. Fazendo login para obter UID...");
        try {
          // Se já existe, fazer login para obter o UID
          const userCredential = await signInWithEmailAndPassword(firebaseAuth, adminEmail, adminPassword);
          firebaseUid = userCredential.user.uid;
          console.log("Login realizado com sucesso. UID obtido:", firebaseUid);
        } catch (loginError) {
          console.error("Erro ao fazer login no Firebase:", loginError);
          throw loginError;
        }
      } else {
        console.error("Erro ao criar usuário no Firebase:", firebaseError);
        throw firebaseError;
      }
    }

    // Criar usuário no banco de dados
    if (shouldCreateInDB) {
      console.log("Criando usuário no banco de dados...");
      const adminUser = new Users();
      adminUser.email = adminEmail;
      adminUser.name = "Administrador";
      adminUser.firebaseUid = firebaseUid;
      adminUser.role = RoleEnum.ADMIN;
      adminUser.isActive = true;

      // Salvar no banco de dados
      const savedUser = await userRepository.save(adminUser);

      console.log("Usuário admin criado com sucesso no banco de dados:");
      console.log({
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        firebaseUid: savedUser.firebaseUid,
        createdAt: savedUser.createdAt,
        validUntil: savedUser.validUntil,
        isActive: savedUser.isActive
      });
    }

  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
  } finally {
    // Fechar conexão com o banco de dados
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Conexão com o banco de dados fechada.");
    }
  }
}

// Executar o script
seedAdminUser();