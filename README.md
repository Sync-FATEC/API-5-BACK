# API-5-BACK
Repositório para o backend
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

### Endpoints de Autenticação
```http
POST /auth/login            # Login do usuário
POST /auth/register         # Registro de novo usuário
PUT  /auth/change-password  # Alterar senha
GET  /auth/profile          # Consultar perfil
# a completar
```

### Endpoints de Produtos
```http
POST   /product/create      # Criar produto
GET    /product/list        # Listar produtos
GET    /product/read/:id    # Detalhes de produto
PUT    /product/update/:id  # Atualizar produto
DELETE /product/delete/:id  # Excluir produto
# a completar
```

### Endpoints de Pedidos
```http
POST   /order/create
GET    /order/list
GET    /order/read/:id
PUT    /order/update/:id
DELETE /order/delete/:id
# a completar
```

### Endpoints de Estoque
```http
POST   /stock/adjust
GET    /stock/history
GET    /stock/alerts
# a completar
```

### Endpoints de Relatórios
```http
GET /report/consumption
GET /report/demand
GET /report/export
# a completar
```

## 🚦 Como Executar

### Pré-requisitos
- Node.js / Python
- PostgreSQL
- npm ou yarn

### Instalação
```bash
git clone https://github.com/seu-usuario/projeto-backend.git
cd projeto-backend
npm install
```

Configure o `.env`:
```bash
cp .env.example .env
```

Rode o servidor:
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
| João Gabriel Solis | Scrum Master |
| Ana Laura Moratelli | Product Owner |
| Arthur Karnas | Desenvolvedora |
| Erik Yokota | Desenvolvedor |
| Filipe Colla | Desenvolvedor |
| José Eduardo Fernandes | Desenvolvedor |
| Kauê Francisco | Desenvolvedor |

## 📄 Licença
MIT
