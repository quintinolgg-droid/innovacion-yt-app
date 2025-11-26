FROM node:20-alpine

WORKDIR /usr/src/app

# Copia los archivos de definición de dependencias
COPY package.json package-lock.json ./

# Instala dependencias de producción usando la forma Shell (Shell Form).
# Esta es la forma más estándar y robusta para esta operación.
RUN sh -c "npm install --omit=dev"

# Copia el código fuente
COPY . .

# Comando de ejecución
CMD ["node", "server.js"]