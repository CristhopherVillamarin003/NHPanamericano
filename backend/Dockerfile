FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para Prisma (OpenSSL)
RUN apt-get update -y && apt-get install -y openssl

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies para Nest CLI)
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma y compilar NestJS
RUN npx prisma generate
RUN npm run build

# --- Imagen de Producción ---
FROM node:22-bookworm-slim

WORKDIR /app

# Instalar OpenSSL en la imagen final también
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/uploads ./default_plantillas

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
