# PetConnect Frontend

**PetConnect** is a platform that connects **animal shelters** with **pet adopters**. Shelters can list pets available for adoption, and adopters can browse, communicate with shelters, and manage adoption requests. This is the frontend client built with React and Vite.

---

## 1. Prerequisites

### Node.js

```bash
node -v
npm -v
```

Download from: https://nodejs.org

---

## 2. Clone the Repository

```bash
git clone https://github.com/nineleaps-training/petconnect-frontend.git
cd petconnect-system/client
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Create Environment Variables

Create a `.env` file inside the **client** folder:

```env
VITE_API_URL=http://localhost:5000

```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |


> All frontend environment variables must be prefixed with `VITE_` to be accessible in the app.

---

## 5. Start the Development Server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## 6. Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 7. Folder Structure

```
client/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
|   ├── containers/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── App.jsx
|   ├── Routes.jsx
│   └── main.jsx
│
├── .env
├── index.html
├── vite.config.js
└── package.json
```

---

## 8. Tech Stack

| Library | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool / dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | HTTP requests |
| Socket.IO Client | Real-time communication |
| Recharts | Charts and data visualization |
| Lucide React | Icons |
| jsPDF + html2canvas | PDF generation |

---

## 9. Troubleshooting

### Blank page or API errors

Make sure the backend server is running on the URL set in `VITE_API_URL`.

---

### Environment variables not working

Ensure all variables in `.env` are prefixed with `VITE_`. Restart the dev server after any `.env` changes.

---

### Port already in use

Vite will automatically try the next available port. To set a fixed port, update `vite.config.js`:

```js
export default {
  server: {
    port: 5173
  }
}
```
