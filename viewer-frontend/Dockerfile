# Utiliser l'image officielle de Node.js
FROM node/node:latest

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Compiler l'application
RUN npm run build

# Exposer le port sur lequel l'application sera accessible
EXPOSE 8080

# Lancer l'application
CMD ["npm", "run", "serve"]