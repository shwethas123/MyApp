# 🐾 PetConnect Backend Setup

**PetConnect** is a platform that connects pet adopters with pet services (shelters). It supports user authentication, real-time messaging, pet profile management, appointment scheduling, and image uploads for pets and profiles.

The backend is built with **Node.js, Express, PostgreSQL, and Socket.IO**.

---

## 📌 Table of Contents

* Prerequisites
* Clone the Repository
* Install Dependencies
* Environment Variables
* Database Setup
* Run the Server
* API Documentation
* Available Scripts
* Folder Structure
* Development Workflow
* PostgreSQL Commands
* Troubleshooting

---

## 1️⃣ Prerequisites

### Node.js

```bash
node -v
npm -v
```

Download: [https://nodejs.org](https://nodejs.org)

### PostgreSQL

```bash
psql --version
```

Download: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

> ⚠️ Remember your **postgres password** during installation.

---

## 2️⃣ Clone the Repository

```bash
git clone https://github.com/nineleaps-training/petconnect-backend.git
cd petconnect-system/server
```

---

## 3️⃣ Install Dependencies

```bash
npm install
npx puppeteer browsers install chrome
```

---

## 4️⃣ Environment Variables

Create a `.env` file inside the **server** folder:

```env
# Server
PORT=5000

# Database
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=petconnect_sequelize
DB_HOST=127.0.0.1
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173

# Nodemailer
EMAIL_USER=smtp.example.com
RESEND_API_KEY=some key
EMAIL_PASS=your_email_password
```

| Variable     | Description                   |
| ------------ | ----------------------------- |
| PORT         | Backend server port           |
| DB_*         | PostgreSQL connection details |
| JWT_SECRET   | Secret key for signing tokens |
| CLOUDINARY_* | Cloudinary credentials        |
| MAIL_*       | SMTP email credentials        |

---

## 5️⃣ Database Setup

### ✅ Recommended (One Command)

```bash
npm run db:setup
```

---

### 🛠 Manual Setup

```bash
psql -U postgres
```

```sql
CREATE DATABASE petconnect_sequelize;
\q
```

```bash
npm run db:migrate
```

---

## 6️⃣ Run the Server

```bash
npm run dev
```

If successful:

```
Server running on port 5000
```

API Base URL:

```
http://localhost:5000
```

---

## 7️⃣ API Documentation (Swagger)

Open in browser:

```
http://localhost:5000/api-docs
```

Regenerate docs:

```bash
npm run swagger
```

---

## 8️⃣ Available Scripts

| Script             | Description               |
| ------------------ | ------------------------- |
| npm run dev        | Start server with nodemon |
| npm run db:create  | Create database           |
| npm run db:migrate | Run migrations            |
| npm run db:setup   | Create DB + migrate       |
| npm run swagger    | Generate API docs         |

---

## 9️⃣ Folder Structure

```
server/
├── config/
│   └── config.json
├── migrations/
├── models/
├── scripts/
│   └── geocodeShelter.js
├── src/
│   ├── controllers/
│   ├── jobs/
│   │   └── adoptionExpiry.cron.js
│   ├── routes/
│   ├── services/
│   ├── app.js
│   ├── socket.js
│   └── swagger-autogen.js
├── utils/
│   ├── certificateTemplate.js
│   ├── geocode.js
│   └── mailer.js
├── .env
├── package.json
└── server.js
```

---

## 🔟 Development Workflow

1. Generate model + migration

```bash
npx sequelize-cli model:generate --name ModelName --attributes field:string
```

2. Run migration

```bash
npm run db:migrate
```

3. Start server

```bash
npm run dev
```

4. Update Swagger

```bash
npm run swagger
```

---

## 1️⃣1️⃣ Useful PostgreSQL Commands

| Command                 | Description    |
| ----------------------- | -------------- |
| \l                      | List databases |
| \c petconnect_sequelize | Connect DB     |
| \dt                     | List tables    |
| \d "Users"              | Describe table |
| SELECT * FROM "Users";  | View data      |
| \q                      | Exit           |

---

## 1️⃣2️⃣ Troubleshooting

### ❌ Password Authentication Failed

```
password authentication failed for user "postgres"
```

✔ Check `DB_PASSWORD` in `.env`

---

### ❌ Table Does Not Exist

```
relation "Users" does not exist
```

✔ Run:

```bash
npm run db:migrate
```

---

### ❌ Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

✔ Fix:

```bash
lsof -ti:5000 | xargs kill
```

---

### ❌ ES Module Error

```
require is not defined
```

✔ Use:

```js
import express from 'express';
```

❌ Not:

```js
const express = require('express');
```

---

## 🚀 You're Ready!

Your backend should now be up and running 🎉
