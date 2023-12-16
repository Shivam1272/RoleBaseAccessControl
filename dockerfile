# #Build Stage
# FROM node:18-alpine AS build

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npx prisma generate

# RUN npm install @prisma/client@latest

# RUN npm run build

# EXPOSE 3333

# CMD ["npm", "dist/main.js"]


# #production
# FROM node:18-alpine

# WORKDIR /app

# COPY --from=build /app/dist ./dist

# COPY package*.json ./

# RUN npm install --only=production

# RUN npx prisma generate

# RUN rm package*.json

# EXPOSE 3333

# CMD [ "node", "dist/main.js" ]

# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Production
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY package*.json ./

RUN npm install --only=production

EXPOSE 3333

CMD [ "node", "dist/main.js" ]
