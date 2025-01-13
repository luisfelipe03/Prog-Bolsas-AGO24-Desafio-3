Aqui está uma versão revisada e melhorada do seu README, com emojis para torná-lo mais atrativo, mas mantendo o profissionalismo:

---

# 🏬 Physical Store - API Backend

Bem-vindo ao repositório da **Physical Store**, uma API backend desenvolvida com **Nest.js** e **TypeScript**. Este projeto tem como objetivo oferecer funcionalidades robustas para cálculos de distância, frete, e gerenciamento de lojas físicas, com integração a APIs externas e armazenamento em **PostgreSQL**. 🚀

---

## ✨ Funcionalidades

1. **📍 Cálculo de Distâncias e Fretes**:
   - Integração com as APIs **ViaCEP**, **Google Maps**, e **Correios** para:
     - Buscar endereços por CEP.
     - Calcular distâncias entre lojas e endereços de clientes.
     - Determinar preços e prazos de frete (PAC, SEDEX, MotoBoy e Retirada).
   - Regras de frete:
     - Distâncias menores que 50 km: frete mínimo de **R$ 15,00**.
     - Distâncias maiores: calculadas com base nos preços dos serviços PAC/SEDEX.

2. **🛒 Gerenciamento de Lojas**:
   - **CRUD Completo**:
     - Criar, listar, atualizar e deletar lojas armazenadas no banco de dados.
   - Retorno de lojas próximas a um CEP informado.

3. **📄 Respostas em JSON**:
   - Informações claras e detalhadas sobre lojas, distâncias, fretes e prazos.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** e **Nest.js**: Backend escalável e modular.
- **TypeScript**: Código tipado para maior segurança.
- **PostgreSQL** com **TypeORM**: Persistência de dados.
- **Axios**: Integração com APIs externas.
- **Dotenv**: Configuração de variáveis de ambiente.
- **Class-validator**: Validação robusta de dados.

---

## 📂 Estrutura do Projeto

```plaintext
src/
├── common/                    # Recursos globais e reutilizáveis
├── config/                    # Configuração da aplicação
├── stores/                    # Módulo de lojas
├── external-integrations/     # Integrações com APIs externas
├── types/                     # Tipos e interfaces globais
├── main.ts                    # Ponto de entrada principal
└── app.module.ts              # Módulo raiz
```

> Detalhes completos sobre os diretórios e arquivos principais podem ser encontrados no código fonte.

---

## 🚀 Como Configurar o Projeto

1. **Clone o Repositório**:

   ```bash
   git clone https://github.com/seu-usuario/physical-store.git
   cd physical-store
   ```

2. **Instale as Dependências**:

   ```bash
   yarn install
   ```

3. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

   ```env
   NODE_ENV=dev
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=physical_store
   DB_USER=postgres
   DB_PASS=senha
   GOOGLE_API_KEY=sua_chave_google_api
   ```

4. **Inicie o Servidor**:

   ```bash
   yarn run start:dev
   ```

---

## 🧪 Testes

- **Como testar**:
  - Use ferramentas como **Postman** ou **Insomnia** para enviar requisições HTTP.
  - Testes automatizados foram implementados para validar as funcionalidades principais.

- **Comando para executar os testes**:

   ```bash
   yarn run test
   ```

---

## 🌐 Endpoints Disponíveis

- `GET /stores`: Lista todas as lojas.
- `GET /stores/id/:id`: Detalhes de uma loja específica.
- `GET /stores/:postalCode`: Lojas próximas a um CEP informado e cálculo de fretes.
- `GET /stores/state/:uf`: Lojas de um estado específico.
- `POST /stores`: Adiciona uma nova loja.
- `PUT /stores/:id`: Atualiza uma loja.
- `DELETE /stores/:id`: Remove uma loja.

