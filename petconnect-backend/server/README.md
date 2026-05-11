# PetConnect Backend Setup

This document explains how to set up and run the backend server for the **PetConnect** project.

The backend uses:

* **Node.js**
* **Express**
* **Sequelize ORM**
* **PostgreSQL**

---

# 1. Prerequisites

Make sure the following software is installed on your system:

### 1. Node.js

Check installation:

```bash
node -v
npm -v
```

If not installed, download from:

https://nodejs.org

---

### 2. PostgreSQL

Check installation:

```bash
psql --version
```

If not installed, download from:

https://www.postgresql.org/download/

During installation remember the **postgres user password**, because it will be required for database connection.

---

# 2. Clone the Repository

```bash
git clone <repository-url>
cd petconnect-system/server
```

---

# 3. Install Dependencies

Run:

```bash
npm install
```

This installs all required backend packages.

Important dependencies used:

* express
* sequelize
* sequelize-cli
* pg
* pg-hstore
* dotenv
* cors
* nodemon

---

# 4. Create Environment Variables

Create a `.env` file inside the **server** folder.

Example:

```
PORT=5000

DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=petconnect_sequelize
DB_HOST=127.0.0.1
DB_DIALECT=postgres
```

Explanation:

| Variable    | Description         |
| ----------- | ------------------- |
| PORT        | Backend server port |
| DB_USERNAME | PostgreSQL username |
| DB_PASSWORD | PostgreSQL password |
| DB_NAME     | Database name       |
| DB_HOST     | Database host       |
| DB_DIALECT  | Database type       |

---

# 5. Create PostgreSQL Database

Open PostgreSQL terminal:

```bash
psql -U postgres
```

Create database:

```sql
CREATE DATABASE petconnect_sequelize;
```

Verify databases:

```sql
\l
```

Connect to the database:

```sql
\c petconnect_sequelize
```

---

# 6. Run Database Migrations

Sequelize migrations create the database tables.

Run:

```bash
npx sequelize-cli db:migrate
```

If successful, you should see:

```
== create-user: migrating =======
== create-user: migrated =======
```

---

# 7. Verify Tables in PostgreSQL

Open PostgreSQL:

```bash
psql -U postgres
```

Connect to database:

```sql
\c petconnect_sequelize
```

List tables:

```sql
\dt
```

Expected output:

```
SequelizeMeta
Users
```

---

# 8. Check Table Structure

To view the table structure:

```sql
\d "Users"
```

To see all users:

```sql
SELECT * FROM "Users";
```

---

# 9. Running the Backend Server

Start the backend server:

```bash
npm run dev
```

or

```bash
node server.js
```

If successful you should see:

```
Server running on port 5000
```

---

# 10. API Base URL

Backend runs on:

```
http://localhost:5000
```

Example endpoint:

```
POST /api/users
```

---

# 11. Sequelize Migration Table

Sequelize automatically creates a table called:

```
SequelizeMeta
```

This table tracks which migrations have been executed.

Example:

```
SELECT * FROM "SequelizeMeta";
```

---

# 12. Useful PostgreSQL Commands

List databases

```
\l
```

Connect to database

```
\c petconnect_sequelize
```

List tables

```
\dt
```

Describe table

```
\d "Users"
```

Show table data

```
SELECT * FROM "Users";
```

Exit PostgreSQL

```
\q
```

---

# 13. Folder Structure

```
server
│
├── config
│   └── config.json
│
├── migrations
│
├── models
│
├── seeders
│
├── src
│   ├── controllers
│   ├── routes
│   ├── services
│   └── app.js
│
├── server.js
├── .env
└── package.json
```

---

# 14. Development Workflow

Typical workflow:

1. Create model

```
npx sequelize-cli model:generate --name User --attributes username:string,email:string
```

2. Run migration

```
npx sequelize-cli db:migrate
```

3. Start backend server

```
npm run dev
```

---

# 15. Troubleshooting

### Database connection error

```
password authentication failed for user "postgres"
```

Solution: check `.env` password.

---

### Table not found

```
relation "Users" does not exist
```

Solution: run migrations.

```
npx sequelize-cli db:migrate
```

---

# 16. Future Improvements

* User authentication
* Password hashing
* JWT login
* Email verification
* Role based access

---
