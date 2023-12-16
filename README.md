
# Role Based Acces Control Using NEST JS & Prisma with JWT Authenticatiom

This repository contains a Role-Based Access Control (RBAC) system implementation. RBAC is a widely used approach in access control systems that restrict system access to authorized users based on their roles within an organization.


## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Docker](https://www.docker.com/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Features

- **User Management:** Easily manage and organize users based on roles.
- **Role Management:** Create, update, and delete roles to control access permissions.
- **Permission Management:** Define and assign specific permissions to roles.
- **Access Control:** Ensure that users can only access resources and perform actions based on their assigned roles and permissions.

## Installation

1. Clone the repository:

   ```bash
    https://github.com/Shivam1272/RoleBaseAccessControl.git
   ```

2. Navigate to the project directory:

    ```bash
    cd RoleBaseAccessControl
    ```

3. Install Dependencie
    ```
    npm install 
    ```

4. Generate Prisma Client
    ```
    npx prisma generate
    npm i @prisma/client
    ```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`
`JWT_SECRET`
`AT_SECRET`
`RT_SECRET`


## Start Project by Running this command

1. To Run Nest Js Server
    ```
    npm run start:dev // development mode
    ```

2. To start the Database

    ```bash
    // Note run this command in your project root directory 
    docker-compose up
    ```

3. To View Data in Database
    ```
    npx prisma studio
    ```

## Implementation

1.  API Endpoint
    - Register User
        - Endpoint: `/auth/local/signup`
        - Method: `POST`
        - Request body:
        ```json
            {
                "email":"YOUR_EMAIL",
                "password":"YOUR_PASS"
            }
        ```
    
    - Login User
        - Endpoint: `/auth/local/signin`
        - Method: `POST`
        - Request body:
        ```json
        {
            "email":"YOUR_EMAIL",
            "password":"YOUR_PASS"
        }
        ```
    - Update User (Only Accessible by Admin)
        - Endpoint: `/auth/local/update/:id`
        - Method: `PATCH`
        - Request body:
        ```json
        {
            Detail to be Updated(Email, Role, etc)
        }
        ```
    - Delete User (Only Accessible by Admin)
        - Endpoint: `/auth/local/delete/:id`
        - Method: `DELETE`
    - Retrive User (Only Accessible by Admin)
        - Endpoint: `/auth/local/user/:id`
        - Method: `GET`
    - Retrive ALL User (Only Accessible by Admin)
        - Endpoint: `/auth/local/users`
        - Method: `GET`
