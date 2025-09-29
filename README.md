# Sistema de Controle de Estoque - Backend

<div align="center">
  <h3>📦 Base Administrativa de Caçapava</h3>
  <p>Backend do sistema de gerenciamento de estoque do almoxarifado e farmácia</p>

  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
</div>

## 📋 Sobre
Este backend é responsável por:
- Gerenciamento de usuários e autenticação segura
- Integração com banco de dados relacional (**PostgreSQL**)
- Processamento de dados e relatórios
- Integração com **Firebase** para funcionalidades adicionais
- API para comunicação com o frontend

## 🚀 Tecnologias
- **TypeScript**
- **Python**
- **PostgreSQL**
- **Firebase**

## ⚙️ Funcionalidades
- Autenticação via login seguro
- Cadastro, atualização e exclusão de itens
- Leitura de QR Codes para identificação rápida
- Controle de estoque do almoxarifado e farmácia
- Relatórios estratégicos
- Alertas automáticos

## 📚 Documentação da API

Acesse a documentação da API em:
```bash
http://localhost:3000/api-docs
```
# 🚦 Como Executar

## 📋 Pré-requisitos
- [Node.js](https://nodejs.org/) ou [Python](https://www.python.org/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) instalado  

---

## 📥 Instalação
Clone o repositório e instale as dependências:  
```bash
git clone https://github.com/Sync-FATEC/API-5-BACK
cd API-5-BACK/src
npm install
```

---

## ⚙️ Configuração
Antes de rodar o projeto, é necessário configurar alguns arquivos **não incluídos no repositório** por conterem informações sensíveis:  

- Coloque o arquivo `firebase.json` dentro da pasta:  
  ```
  /firebase
  ```

- Crie ou adicione o arquivo `.env` na **raiz do projeto**:  
  ```
  API-5-BACK/.env
  ```

> ⚠️ Esses arquivos não estão disponíveis neste repositório. Solicite ao responsável pelo projeto ou configure-os conforme a documentação oficial (Firebase e variáveis de ambiente necessárias).  

---

## ▶️ Execução
Rodar servidor em ambiente de desenvolvimento:  
```bash
npm run dev
```


## 📁 Estrutura de Diretórios
```
src/
├── controllers/
├── services/
├── repositories/
├── dtos/
├── routes/
└── utils/
```

## 👥 Time
| Nome | Função |
|------|--------|
| José Eduardo Fernandes | Scrum Master |
| Ana Laura Moratelli | Product Owner |
| Arthur Karnas | Desenvolvedora |
| Erik Yokota | Desenvolvedor |
| Filipe Colla | Desenvolvedor |
| João Gabriel Solis | Desenvolvedor |
| Kauê Francisco | Desenvolvedor |
