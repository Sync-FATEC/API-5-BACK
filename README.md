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

## 🗄️ Criar dados iniciais
Após configurar o ambiente e antes de iniciar o servidor, rode o seed para criar o usuário administrador padrão no banco de dados:  
```bash
npm run seed:admin
```

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

---

# Guia das Novas Rotas da API (Agenda e Tipos de Exame)

## 1. Introdução
- Objetivo: disponibilizar funcionalidades de agendamento de exames (CRUD, recibo em PDF, relatório por período) e gestão de tipos de exame com validações e RBAC.
- Requisitos técnicos:
  - `Node.js` 18+ e `npm` ou `yarn`
  - `PostgreSQL` acessível e configurado
  - Credenciais do `Firebase` (Admin SDK e Web SDK)
  - Opcional: SMTP para e-mails (`nodemailer`) e Twilio para SMS
- Versão da API: `1.0.0` (conforme `src/index.ts` Swagger)

## 2. Configuração Inicial
- Variáveis de ambiente `.env` (na raiz):
  - Firebase:
    - `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`
    - Arquivo `firebase/firebase.json` para o Admin SDK
  - SMTP (opcional):
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - Twilio (opcional para SMS):
    - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`
  - Teste de SMS sem telefone em usuário:
    - `APPOINTMENT_SMS_TEST_TO` (ex.: `+5511999999999`)
- Instalação:
  - `npm install`
- Seed (opcional):
  - `npm run seed:admin` para criar usuário admin padrão
- Execução:
  - `npm run dev` e acesse `http://localhost:3000`
  - Swagger: `http://localhost:3000/api-docs`
- Autenticação:
  - Todas as rotas (exceto `/auth`) exigem `Authorization: Bearer <ID_TOKEN_FIREBASE>`
  - Tokens são verificados via Firebase Admin; `req.user.userData` inclui dados e `role`

## 3. Rotas Disponíveis
Base URL: `http://localhost:3000`

### 3.1 Tipos de Exame (`/exam-types`)
- `GET /exam-types`
  - Lista tipos de exame ativos.
  - Acesso: qualquer usuário autenticado.
  - Query (opcional): `q` (nome parcial), `isActive`.
  - Exemplo:
    ```bash
    curl -H "Authorization: Bearer <token>" http://localhost:3000/exam-types
    ```
- `POST /exam-types`
  - Cria novo tipo de exame.
  - Acesso: `COORDENADOR_AGENDA`.
  - Body:
    ```json
    {
      "nome": "Ultrassom Abdômen",
      "descricao": "Exame de imagem",
      "duracaoEstimada": 30,
      "preparoNecessario": "Jejum de 8h",
      "isActive": true
    }
    ```
- `PATCH /exam-types/:id`
  - Atualiza campos do tipo de exame.
  - Acesso: `COORDENADOR_AGENDA`.
- `DELETE /exam-types/:id`
  - Soft delete (inativa o tipo).
  - Acesso: `COORDENADOR_AGENDA`.

### 3.2 Agendamentos (`/appointments`)
- `GET /appointments`
  - Lista agendamentos com filtros.
  - Acesso: autenticados; `PACIENTE` vê apenas seus agendamentos.
  - Query (opcional): `start`, `end` (ISO), `pacienteId`, `examTypeId`, `status` (`AGENDADO|REALIZADO|CANCELADO`).
  - Exemplo:
    ```bash
    curl -H "Authorization: Bearer <token>" "http://localhost:3000/appointments?start=2025-01-01T00:00:00Z&end=2025-01-31T23:59:59Z"
    ```
- `POST /appointments`
  - Cria agendamento.
  - Acesso: `COORDENADOR_AGENDA`.
  - Body:
    ```json
    {
      "pacienteId": "<uuid>",
      "examTypeId": "<uuid>",
      "dataHora": "2025-01-15T14:30:00-03:00",
      "observacoes": "Trazer exames anteriores"
    }
    ```
  - Regras:
    - Horário da clínica: seg–sex, 08:00–18:00.
    - Impede conflitos por tipo de exame (janela de `duracaoEstimada`).
    - Impede conflitos por paciente no mesmo período.
    - Notificações: e-mail sempre que possível; SMS se `APPOINTMENT_SMS_TEST_TO` (ou Twilio configurado).
- `PATCH /appointments/:id`
  - Atualiza `dataHora`, `status`, `observacoes`.
  - Acesso: `COORDENADOR_AGENDA`.
  - Valida novo horário contra regras da clínica e conflitos.
- `DELETE /appointments/:id`
  - Cancela (status passa a `CANCELADO`).
  - Acesso: `COORDENADOR_AGENDA`.
- `GET /appointments/:id/receipt`
  - Gera comprovante PDF.
  - Acesso: `PACIENTE` (apenas do próprio) e `COORDENADOR_AGENDA`.
- `GET /appointments/report`
  - Resumo por período: total, por status e por tipo de exame.
  - Acesso: `COORDENADOR_AGENDA`.
  - Query: `start`, `end` (ISO).
- `GET /appointments/patients`
  - Busca pacientes por nome/email.
  - Acesso: `COORDENADOR_AGENDA`.
  - Query: `q` (opcional).

## 4. Exemplos de Uso

### 4.1 Curl
```bash
# Criar tipo de exame
curl -X POST http://localhost:3000/exam-types \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Raio-X Torax",
    "descricao": "Exame de imagem",
    "duracaoEstimada": 20,
    "preparoNecessario": null,
    "isActive": true
  }'

# Criar agendamento
curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pacienteId": "UUID_PACIENTE",
    "examTypeId": "UUID_EXAMTYPE",
    "dataHora": "2025-01-15T14:30:00-03:00",
    "observacoes": "Trazer exames anteriores"
  }'

# Baixar recibo PDF
curl -L -H "Authorization: Bearer <token>" \
  http://localhost:3000/appointments/UUID_AGENDA/receipt --output recibo.pdf
```

### 4.2 JavaScript (fetch)
```js
const token = '<ID_TOKEN_FIREBASE>';
async function listAppointments() {
  const res = await fetch('http://localhost:3000/appointments?start=2025-01-01T00:00:00Z&end=2025-01-31T23:59:59Z', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  console.log(json);
}
```

### 4.3 Python (requests)
```python
import requests

token = '<ID_TOKEN_FIREBASE>'
headers = { 'Authorization': f'Bearer {token}' }
r = requests.get('http://localhost:3000/exam-types', headers=headers)
print(r.json())
```

### 4.4 Respostas esperadas (JSON)
- `POST /appointments` (201):
```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "pacienteId": "<uuid>",
    "examTypeId": "<uuid>",
    "dataHora": "2025-01-15T17:30:00.000Z",
    "status": "AGENDADO",
    "observacoes": "Trazer exames anteriores"
  },
  "message": "Agendamento criado"
}
```

## 5. Boas Práticas
- Utilize datas em formato ISO 8601 com timezone explícito.
- Respeite o horário da clínica (seg–sex, 08:00–18:00).
- Sempre envie `Authorization: Bearer <token>`; tokens expiram, renove quando necessário.
- Filtre listagens por período para melhor performance.
- Evite sobrecarga em relatórios (use janelas menores e específicas).
- Mantenha tipos de exame atualizados — nome deve ser único.

### Limitações conhecidas
- Usuário não possui campo de telefone; SMS usa `APPOINTMENT_SMS_TEST_TO` para testes.
- PDF gera campos disponíveis; timezone segue do servidor.
- Documentação Swagger dos módulos novos pode ser ampliada.

### Considerações de performance
- Filtros por `start/end` reduzem carga de leitura.
- Índices em `dataHora` e `examTypeId` ajudam consultas (verificar no banco).
- Evite períodos muito amplos em `/appointments/report`.

## 6. FAQ
- 401 Token ausente/inválido:
  - Verifique `Authorization: Bearer <ID_TOKEN_FIREBASE>` e expiração.
- 403 Permissões insuficientes:
  - Confirme `role` do usuário; ações de coordenação exigem `COORDENADOR_AGENDA`.
- Horário fora da clínica:
  - Ajuste `dataHora` dentro de seg–sex, 08:00–18:00.
- Conflito de agendamento:
  - Escolha outro horário respeitando a `duracaoEstimada` do exame.
- E-mail/SMS não enviados:
  - Sem SMTP/Twilio configurados, o envio cai em fallback/console; configure variáveis.
- Recibo PDF não baixa:
  - Confirme o ID e permissões; pacientes só baixam os próprios.

Para mais detalhes, consulte o Swagger em `http://localhost:3000/api-docs`.
