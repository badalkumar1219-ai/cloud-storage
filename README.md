# ☁️ CloudBox – Cloud-Based File Storage System

A full-featured Google Drive-inspired file storage application built with React, Express, AWS S3, and email/password authentication.

> **The app runs in demo storage mode** when AWS credentials aren't configured.
> Create an account to open the dashboard and explore the demo files.

---

## Features

- ✅ Google Drive-inspired dashboard UI
- ✅ Email/password registration and sign-in
- ✅ File upload to AWS S3 (drag & drop + file picker)
- ✅ File download via presigned URLs
- ✅ Folder creation
- ✅ Move to Trash / Restore / Permanent delete
- ✅ Storage usage indicator
- ✅ Search files and folders
- ✅ Responsive design (desktop + mobile)
- ✅ Toast notifications
- ✅ Demo mode (works without any credentials)

---

## Project Structure

```
cloudbox/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── Sidebar.jsx/css
│   │   │   ├── Header.jsx/css
│   │   │   ├── FileTable.jsx/css
│   │   │   ├── UploadArea.jsx/css
│   │   │   ├── NewFolderModal.jsx/css
│   │   │   └── Toast.jsx/css
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── pages/
│   │   │   └── Login.jsx/css     # Login page
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── utils/
│   │   │   └── format.js         # Formatting helpers
│   │   ├── App.jsx / App.css
│   │   └── main.jsx
│   └── vite.config.js            # Vite config with API proxy
├── backend/                     # Express API
│   ├── config/
│   │   ├── userStore.js          # Local account persistence
│   │   └── s3.js                 # AWS S3 client
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   └── files.js              # File CRUD routes
│   ├── server.js                 # Express entry point
│   └── package.json
├── .gitignore
├── .env.example
└── README.md
```

---

## Quick Start (Demo Mode)

You can run the app immediately **without any cloud credentials**:

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the app

Visit **http://localhost:5173**, create an account, and the dashboard will open with demo data.

---

## Accounts and authentication

Create an account from the sign-in screen with a name, email address, and password
(at least 8 characters). Accounts are stored in `backend/data/users.json`; passwords
are stored as salted scrypt hashes, not as plain text. This local JSON store is
intended for a single backend instance; use a database-backed account store for
multi-instance deployments.

Sessions use an HTTP-only cookie. Set a strong, unique `SESSION_SECRET` in
`backend/.env` before deployment. In production, serve the app over HTTPS.
Accounts created before this change through Google sign-in are not migrated.
Files in S3 remain stored under their previous Google profile IDs and are not
automatically attached to newly registered accounts.

To restrict uploads to one account, set `UPLOAD_AUTHORIZED_EMAIL` to that
registered account's email address. Other registered users can still use the
available file features. If the setting is unset, uploads are denied.

---

## Enabling AWS S3 Storage

1. Sign in to [AWS Console](https://console.aws.amazon.com/)
2. **Create an S3 bucket:**
   - Go to S3 → Create bucket
   - Choose a region and bucket name
   - Keep "Block all public access" enabled
3. **Create an IAM user:**
   - Go to IAM → Users → Create user
   - Attach the `AmazonS3FullAccess` policy (or a custom policy for your bucket)
   - Create an access key (Access Key ID + Secret Access Key)
4. Add to `backend/.env`:
   ```
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=my-cloudbox-bucket
   ```
5. Restart the backend

---

## API Endpoints

| Method | Endpoint                        | Description            | Auth |
|--------|---------------------------------|------------------------|------|
| GET    | `/api/health`                   | Health check           | No   |
| POST   | `/api/auth/register`            | Create an account      | No   |
| POST   | `/api/auth/login`               | Sign in                | No   |
| GET    | `/api/auth/me`                  | Get current user       | No   |
| POST   | `/api/auth/logout`              | Log out                | No   |
| GET    | `/api/files?section=&folder=`   | List files             | Yes  |
| POST   | `/api/files/upload`             | Upload file(s)         | Yes  |
| GET    | `/api/files/download?key=`      | Get download URL       | Yes  |
| DELETE | `/api/files?key=`               | Delete permanently     | Yes  |
| POST   | `/api/files/folder`             | Create folder          | Yes  |
| POST   | `/api/files/trash`              | Move to trash          | Yes  |
| POST   | `/api/files/restore`            | Restore from trash     | Yes  |
| GET    | `/api/files/storage`            | Get storage usage      | Yes  |

---

## Scripts

| Folder     | Command         | Description                |
|------------|-----------------|----------------------------|
| `backend`  | `npm run dev`   | Start with auto-reload     |
| `backend`  | `npm start`     | Start (production)         |
| `frontend` | `npm run dev`   | Vite dev server            |
| `frontend` | `npm run build` | Production build           |

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React 19 + Vite                     |
| Styling        | CSS (responsive, mobile-first)      |
| Backend        | Node.js + Express                   |
| Authentication | Email/password (scrypt + sessions)  |
| Cloud Storage  | AWS S3 (SDK v3)                     |
| File Upload    | Multer (memory storage → S3)        |

---

## License

MIT
