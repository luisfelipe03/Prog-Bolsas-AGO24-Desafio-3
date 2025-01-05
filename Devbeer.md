# Devbeer

### **1. Admin Service**

- **Função**: Gerenciar dados administrativos e configuração global.
- **Responsabilidades**:
  - CRUD de lojas (stores).
  - Cadastro e gerenciamento de categorias de produtos.
  - Cadastro e gerenciamento de distribuidores e usuários administrativos.
- **Entidades**:
  - Loja (Store): Representa as lojas ou PDVs cadastrados no sistema.
- **Comunicação**:
  - **Freight Service**: Publica eventos como "StoreUpdated" para que o Freight Service possa recalcular tabelas de frete ou distâncias.
  - **Catalog Service**: Notifica quando novas lojas ou produtos são criados.

---

### **2. Catalog Service**

- **Função**: Expor o catálogo de lojas e produtos.
- **Responsabilidades**:
  - Listar lojas e produtos disponíveis.
  - Buscar lojas por ID, CEP ou estado.
  - Gerar e expor dados necessários para cálculos de proximidade e frete.
- **Entidades**:
  - Loja (Store): Inclui localização, tipo (PDV ou Loja), e outros detalhes exibidos no catálogo.
  - Produto: Representa os itens disponíveis para compra.
- **Comunicação**:
  - **Freight Service**: Envia requisições para calcular fretes baseados na localização do cliente e na loja.
  - **Admin Service**: Consome eventos como "StoreCreated" para atualizar o catálogo.

---

### **3. Freight Service**

- **Função**: Gerenciar o cálculo de fretes.
- **Responsabilidades**:
  - Calcular fretes com base na distância entre cliente e loja.
  - Determinar o tipo de frete (fixo ou Correios) com base no tipo da loja e distância.
  - Integrar com APIs externas (ex.: Correios) para obter custos reais de entrega.
- **Entidades**:
  - Tabelas de Distância: Cache ou base de dados com distâncias pré-calculadas para otimizar o cálculo de fretes.
- **Comunicação**:
  - **Catalog Service**: Recebe requisições para calcular fretes para lojas específicas ou múltiplas lojas próximas.
  - **Order Service**: Envia os custos de frete para serem incluídos no cálculo total do pedido.

---

### **4. Order Service**

- **Função**: Gerenciar pedidos e seu ciclo de vida.
- **Responsabilidades**:
  - Criar e atualizar pedidos.
  - Controlar o status de pedidos (em processamento, pago, enviado, etc.).
  - Integrar com serviços de frete e pagamento.
- **Entidades**:
  - Pedido (Order): Inclui os produtos comprados, informações do cliente, frete e status.
- **Comunicação**:
  - **Catalog Service**: Verifica a disponibilidade de produtos e lojas.
  - **Freight Service**: Obtém o custo de frete para o pedido.
  - **Payment Service**: Envia detalhes de pagamento do pedido.
  - **Notification Service**: Notifica o cliente sobre atualizações no status do pedido.

---

### **5. Payment Service**

- **Função**: Processar pagamentos.
- **Responsabilidades**:
  - Validar e processar pagamentos para os pedidos.
  - Retornar o status do pagamento (sucesso ou falha).
- **Entidades**:
  - Pagamento (Payment): Detalhes sobre o método de pagamento e status.
- **Comunicação**:
  - **Order Service**: Atualiza o status do pedido após o pagamento.
  - **Notification Service**: Notifica o cliente sobre o status do pagamento.

---

### **6. Notification Service**

- **Função**: Gerenciar notificações para clientes e outros usuários.
- **Responsabilidades**:
  - Enviar notificações sobre pedidos, pagamentos, e atualizações de frete.
- **Entidades**:
  - Notificação: Representa uma mensagem enviada para o cliente ou administrador.
- **Comunicação**:
  - **Order Service**: Recebe informações para notificar o cliente sobre atualizações do pedido.
  - **Payment Service**: Notifica sobre o status do pagamento.

---

### **7. Customer Service**

- **Função**: Gerenciar os clientes do sistema.
- **Responsabilidades**:
  - Cadastro e autenticação de clientes.
  - Gerenciar informações de perfil, endereços e histórico de pedidos.
- **Entidades**:
  - Cliente (Customer): Representa o ator que realiza compras.
  - Endereço (Address): Endereços associados aos clientes.
- **Comunicação**:
  - **Order Service**: Envia informações do cliente e endereço para o pedido.
  - **Freight Service**: Envia o endereço do cliente para o cálculo de frete.

---

### **Comunicação Entre Microserviços (RabbitMQ)**

#### **Mensagens Publicadas:**

1. **Admin Service → Catalog Service**:

   - "StoreCreated", "StoreUpdated", "StoreDeleted"

2. **Catalog Service → Freight Service**:

   - "CalculateFreight": Requisição para calcular frete de lojas para um cliente.

3. **Freight Service → Order Service**:

   - "FreightCalculated": Retorna o custo de frete para um pedido.

4. **Order Service → Payment Service**:

   - "PaymentRequested": Inicia o pagamento de um pedido.

5. **Payment Service → Notification Service**:

   - "PaymentStatus": Informa o status do pagamento para notificar o cliente.

6. **Order Service → Notification Service**:

   - "OrderStatusUpdated": Notifica o cliente sobre mudanças no pedido.

7. **Customer Service → Order Service**:
   - "CustomerInfo": Envia informações do cliente para associar ao pedido.
