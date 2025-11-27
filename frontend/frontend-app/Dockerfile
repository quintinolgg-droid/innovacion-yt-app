# ----------------------------------------------------------------------
# ETAPA 1: BUILD (Compilación de la aplicación Angular)
# ----------------------------------------------------------------------
FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Compila la aplicación Angular.
RUN npm run build -- --configuration=static-docker

# ----------------------------------------------------------------------
# ETAPA 2: PRODUCTION (Servir con Nginx)
# ----------------------------------------------------------------------
FROM nginx:latest AS production

# Limpia la carpeta HTML por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia tu archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Copia los archivos compilados desde la etapa 'builder'
# IMPORTANTE: Verifica que la ruta sea correcta
# Si Angular genera una carpeta "browser" dentro de dist, usa esa ruta
COPY --from=builder /app/dist/frontend-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]