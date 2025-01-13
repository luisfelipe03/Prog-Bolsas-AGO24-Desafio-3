# Etapa 1: Construção da imagem
FROM node:20 AS build

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie os arquivos de dependência (package.json, yarn.lock) para o contêiner
COPY package.json yarn.lock ./

# Instale as dependências do projeto com Yarn
RUN yarn install

# Copie o restante do código-fonte do projeto para o contêiner
COPY . .

# Compile o projeto NestJS
RUN yarn build

# Etapa 2: Execução do contêiner
FROM node:20

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie os arquivos compilados do estágio de construção para a nova imagem
COPY --from=build /app/dist /app/dist

# Instale apenas as dependências de produção
COPY package.json yarn.lock ./
RUN yarn install --production

# Exponha a porta em que o aplicativo NestJS irá rodar
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["yarn", "start:prod"]
