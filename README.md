# To-Do App

A full-stack MERN to-do list with **user accounts, email verification, and a per-user 30MB storage limit**. Every user only ever sees their own tasks.

## Features
- Sign up / log in with email + password (passwords hashed with bcrypt)
- Email verification required before login
- Sessions handled with a secure, httpOnly JWT cookie
- Each user's tasks are private — fully isolated by account
- 30MB storage cap per user, enforced on the server, with a live usage bar in the UI
- Rate-limited auth endpoints to slow down brute-force attempts

## Tech stack
- **Frontend:** React (Vite), Material UI, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT (httpOnly cookies), bcrypt, nodemailer for verification emails

## Project structure
```
todo-app/
├── client/                # frontend
│   ├── src/               # React frontend
│   │   ├── components/
│   │   │   └── auth/      # Login, Signup, VerifyEmail, ProtectedRoute, AccountBar
│   │   └── context/       # auth-context.jsx, todo-context.jsx
│   ├──.env.example
│   └──package.json 
├── server/                # Express backend
│   ├── models/            # User.js, Todo.js
│   ├── routes/            # authRoutes.js, todoRoutes.js, usageRoutes.js
│   ├── middleware/        # auth.js (JWT check)
│   ├── utils/              # sendEmail.js, storage.js (30MB quota logic)
│   ├── server.js
│   └── .env.example           
└── README.md
```

---

## Prerequisites
Before you start, make sure you have:
- **Node.js** v18 or newer ([download here](https://nodejs.org)) — check with `node -v`
- **npm** (comes with Node) — check with `npm -v`
- A **MongoDB database** — the easiest option is a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- An email account you can use to send verification emails (Gmail works fine for development — see step 4 below)

---

## 1. Get the code onto your machine
If you haven't already, unzip/clone the project and open a terminal in the project's root folder (the one containing `package.json` and the `server/` folder).

## 2. Set up the backend (`server/`)

```bash
cd server
npm install
```

This installs Express, Mongoose, bcrypt, JWT, nodemailer, and everything else the backend needs.

### Create your `.env` file
The backend needs a `.env` file with your secrets — it is **never committed to git** (see `.gitignore`). Copy the example file to get started:

```bash
cp .env.example .env
```

Then open `.env` and fill in real values. Here's what each one means:

| Variable | What it's for | Example |
|---|---|---|
| `MONGO_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/todoapp` |
| `JWT_SECRET` | Random string used to sign login tokens — keep this secret | any long random string |
| `JWT_EXPIRES_IN` | How long a login session lasts | `7d` |
| `CLIENT_URL` | The URL your **frontend** runs on | `http://localhost:5173` (dev) |
| `NODE_ENV` | `development` locally, `production` when deployed | `development` |
| `MAIL_HOST` / `MAIL_PORT` | Your email provider's SMTP server | `smtp.gmail.com` / `587` |
| `MAIL_USER` / `MAIL_PASS` | Login for that email account | see step 4 below |
| `MAIL_FROM` | The "from" name/address on verification emails | `"Todo App <you@gmail.com>"` |
| `MAX_STORAGE_BYTES` | Per-user storage cap in bytes | `31457280` (= 30MB, leave as-is) |

### 3. Get a MongoDB connection string
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free tier is enough).
2. Create a free cluster, then click **Connect → Drivers** and copy the connection string.
3. Replace `<user>` and `<password>` with a database user you create in Atlas (**Database Access** tab).
4. Under **Network Access**, add your current IP (or `0.0.0.0/0` for "allow from anywhere" while testing).
5. Paste the finished string into `MONGO_URI` in your `.env`.

### 4. Set up email sending (for verification links)
The simplest option for testing is Gmail with an **App Password** (not your normal password):
1. Turn on 2-Step Verification on your Google account.
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords) and generate one for "Mail".
3. Put your Gmail address in `MAIL_USER` and the 16-character app password in `MAIL_PASS`.

(In production, a dedicated service like SendGrid, Mailgun, or Resend is more reliable than Gmail — you'd just swap the `MAIL_*` values.)

### 5. Start the backend
```bash
npm run dev
```
You should see:
```
MongoDB Connected
Server is running on port 5000
```
Leave this terminal running. If you see a connection error, double-check `MONGO_URI` and that your IP is allowed in Atlas's Network Access settings.

---

## 3. Set up the frontend

Open a **new terminal** in the project root (not inside `server/`):

```bash
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`. Open it in your browser.

> **Note:** The frontend currently points at a deployed API URL set in `src/context/auth-context.jsx` (`API_BASE`). For local development, change this to `http://localhost:5000/api` so it talks to the backend you just started.

---

## 4. Try it out
1. Go to `/signup`, create an account.
2. Check the inbox of the email you signed up with — you'll get a verification link.
3. Click the link (it opens `/verify-email` in the app).
4. Go to `/login` and log in.
5. Add some to-dos! You'll see your storage usage bar update as you go — it's capped at 30MB per account.

---

## Troubleshooting
- **"MongoDB connection error"** — check `MONGO_URI` is correct and your IP is whitelisted in Atlas.
- **Verification email never arrives** — double check `MAIL_USER`/`MAIL_PASS`, check spam folder, and make sure you used an **App Password**, not your real Gmail password.
- **Login works but todos don't load / "Not authenticated"** — make sure `CLIENT_URL` in the backend `.env` exactly matches the URL your frontend is running on (including `http://` vs `https://`).
- **CORS errors in the browser console** — same as above; `CLIENT_URL` must match exactly, with no trailing slash.

## Deploying
When you're ready to deploy, the backend and frontend go to separate hosts (e.g. Render for the backend, Vercel for the frontend). Key things to update:
- Backend `.env`: set `CLIENT_URL` to your live frontend URL and `NODE_ENV=production`.
- Frontend: update `API_BASE` in `auth-context.jsx` to your live backend URL.

See the inline comments in `server/server.js` and `server/routes/authRoutes.js` for how cookies/CORS are configured for production vs. local dev.