# ☁️ CloudBox – Cloud-Based File Storage System

A Google Drive-inspired file storage dashboard built with React (Vite) and Express.

> **Phase 1** – UI dashboard with demo data and a basic Express health endpoint.
> AWS S3 and Google OAuth 2.0 will be integrated in later phases.

---

## Project Structure

```
cloudbox/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── data/         # Demo / sample data
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── backend/           # Express API server
│   ├── server.js
│   └── package.json
├── .gitignore
├── .env.example
└── README.md          # ← you are here
```

---

## Prerequisites

| Tool    | Minimum Version | Check command      |
| ------- | --------------- | ------------------ |
| Node.js | 18+             | `node -v`          |
| npm     | 9+              | `npm -v`           |

---

## Getting Started

### 1. Clone or download the project

```bash
cd "cloud file storage"
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The server starts on **http://localhost:5000**.
Verify it works:

```bash
curl http://localhost:5000/api/health
# → { "status": "ok", "message": "CloudBox API is running" }
```

### 3. Start the frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

The app opens on **http://localhost:5173** (Vite's default port).

---

## Available Scripts

| Folder     | Command         | Description                   |
| ---------- | --------------- | ----------------------------- |
| `backend`  | `npm run dev`   | Start Express with nodemon    |
| `backend`  | `npm start`     | Start Express (production)    |
| `frontend` | `npm run dev`   | Start Vite dev server         |
| `frontend` | `npm run build` | Build for production          |

---

## Phase 1 Checklist

- [x] Professional dashboard UI (Google Drive-inspired)
- [x] Sidebar navigation (My Files, Shared, Recent, Trash, Storage)
- [x] File/folder table with demo data
- [x] Upload area and New Folder button
- [x] Responsive design (desktop + mobile)
- [x] Express backend with `/api/health`
- [ ] AWS S3 integration (Phase 2)
- [ ] Google OAuth 2.0 authentication (Phase 2)

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder and fill in your values
when you reach Phase 2.

```bash
cp .env.example backend/.env
```

---

## License

MIT
