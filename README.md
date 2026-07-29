Here is the complete updated `README.md` as a **single Markdown file**:

```markdown
# To-Do App

A full-stack MERN to-do list application with **user authentication, email verification, AI-powered grammar correction, task searching, sorting, filtering, and a per-user 30MB storage limit**.

Each user has a private workspace where they can manage their own tasks securely. User data is completely isolated between accounts.

---

# Features

## Authentication & Security

- Sign up and log in with email and password
- Passwords securely hashed using bcrypt
- Email verification required before login
- Authentication handled using JWT stored in secure httpOnly cookies
- Protected routes for authenticated users only
- Each user's tasks are completely private
- Rate limiting on authentication endpoints to prevent brute-force attacks

---

## Task Management

- Create, update, delete, and complete tasks
- Edit existing tasks
- Mark tasks as completed or uncompleted
- Search tasks using a search bar
- Sort tasks by:
  - Newest first
  - Oldest first
- Filter tasks by:
  - All tasks
  - Completed tasks
  - Uncompleted tasks

---

## AI Grammar Correction

- Integrated Google Gemini API for grammar and spelling correction
- Automatically fixes grammar mistakes before adding tasks
- Keeps the original meaning of the task unchanged
- Uses Gemini Flash models for fast AI responses

Example:

Before:

```

buy milk tommorow

```

After:

```

Buy milk tomorrow.

```

---

## Storage Management

- Each user has a 30MB storage limit
- Storage quota is enforced on the backend
- Users can see their current storage usage through a live progress bar
- Prevents users from exceeding their allowed storage

---

# Tech Stack

## Frontend

- React (Vite)
- Material UI
- React Router
- React Context API

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication

- JWT (httpOnly cookies)
- bcrypt
- Nodemailer

## AI Integration

- Google Gemini API
- `@google/genai`

---

# Project Structure

```

todo-app/
│
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               # Login, Signup, VerifyEmail, ProtectedRoute
│   │   │   └── todo/               # Todo components
│   │   │
│   │   └── context/
│   │       ├── auth-context.jsx
│   │       └── todo-context.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── server/                         # Express backend
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Todo.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── usageRoutes.js
│   │   └── ai.js                   # Gemini grammar correction route
│   │
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   │
│   ├── utils/
│   │   ├── sendEmail.js
│   │   └── storage.js              # Storage quota logic
│   ├── services/
│   │   └── gemini.js
│   │
│   ├── app.js
│   ├── server.js
│   └── .env.example
│
└── README.md

````

---

# Prerequisites

Before running the project, make sure you have:

- Node.js v18 or newer
- npm
- MongoDB database
- Gmail account for email verification
- Google Gemini API key

---

# Backend Setup

Navigate to the server folder:

```bash
cd server
npm install
````

This installs all backend dependencies including:

* Express
* Mongoose
* JWT
* bcrypt
* Nodemailer
* Gemini API SDK

---

# Environment Variables

Create a `.env` file inside the `server` folder:

```bash
cp .env.example .env
```

Configure the following variables:

| Variable          | Description               | Example                                                 |
| ----------------- | ------------------------- | ------------------------------------------------------- |
| MONGO_URI         | MongoDB connection string | mongodb+srv://user:password@cluster.mongodb.net/todoapp |
| JWT_SECRET        | Secret key for JWT tokens | random secure string                                    |
| JWT_EXPIRES_IN    | JWT expiration time       | 7d                                                      |
| CLIENT_URL        | Frontend URL              | [http://localhost:5173](http://localhost:5173)          |
| NODE_ENV          | Application environment   | development                                             |
| MAIL_HOST         | SMTP server               | smtp.gmail.com                                          |
| MAIL_PORT         | SMTP port                 | 587                                                     |
| MAIL_USER         | Email account             | [example@gmail.com](mailto:example@gmail.com)           |
| MAIL_PASS         | Gmail app password        | generated password                                      |
| MAIL_FROM         | Sender email              | Todo App                                                |
| MAX_STORAGE_BYTES | Storage limit             | 31457280                                                |
| GEMINI_API_KEY    | Google Gemini API key     | your_api_key                                            |

---

# MongoDB Setup

1. Create a MongoDB Atlas account.
2. Create a free cluster.
3. Go to:

```
Connect → Drivers
```

4. Copy the connection string.
5. Replace the username and password.
6. Add your IP address under Network Access.
7. Add the connection string to:

```
MONGO_URI
```

---

# Email Verification Setup

For Gmail:

1. Enable 2-Step Verification.
2. Create a Gmail App Password.
3. Add the credentials:

```
MAIL_USER
MAIL_PASS
```

to your `.env` file.

---

# Gemini API Setup

The application uses Google Gemini to correct grammar mistakes.

Steps:

1. Create a Google AI Studio account.
2. Generate a Gemini API key.
3. Add it to:

```
GEMINI_API_KEY=your_api_key_here
```

The backend exposes:

```
POST /api/ai/correct
```

Example request:

```json
{
  "text": "buy milk tommorow"
}
```

Example response:

```json
{
  "corrected": "Buy milk tomorrow."
}
```

---

# Running the Backend

Start the backend server:

```bash
npm run dev
```

Expected output:

```
MongoDB Connected
Server is running on port 5000
```

---

# Frontend Setup

Open another terminal:

```bash
npm install
npm run dev
```

Vite will start the application:

```
http://localhost:5173
```

---

# Using the Application

1. Open the signup page.
2. Create an account.
3. Verify your email.
4. Login.
5. Start managing your tasks.

Available features:

* Add tasks
* Edit tasks
* Delete tasks
* Complete tasks
* Search tasks
* Sort tasks
* Filter completed/uncompleted tasks
* Fix grammar using Gemini AI

---

# Troubleshooting

## MongoDB Connection Error

Check:

* MongoDB connection string
* Database user credentials
* Network Access settings

---

## Verification Email Not Received

Check:

* Gmail App Password
* SMTP configuration
* Spam folder

---

## Gemini API Error

Check:

* `GEMINI_API_KEY` exists
* API key is valid
* Gemini API quota is available

---

## Not Authenticated Error

Check:

* Frontend and backend URLs
* Cookies enabled
* `CLIENT_URL` configuration

---

## CORS Error

Make sure:

```
CLIENT_URL
```

matches the frontend URL exactly.

---

# Deployment

The application can be deployed separately.

## Frontend

Recommended:

* Vercel

## Backend

Recommended:

* Render

Before deployment update:

Backend:

```
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
```

Frontend:

Update the backend API URL inside:

```
auth-context.jsx
```

---

# Future Improvements

Possible improvements:

* Dark mode
* Task categories
* Due dates and reminders
* Notifications
* More AI-powered productivity features

---

# License

This project is for learning and development purposes.

```
```
