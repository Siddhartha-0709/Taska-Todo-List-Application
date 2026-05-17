# Taska — Cloud-Native To-Do App

A modern, full-stack to-do application with a React frontend (Vite) and a Node.js/Express/MongoDB backend. Designed for containerized cloud deployment.

---

## Project Structure

```
todoapp/
├── frontend/           # React + Vite app
│   ├── src/
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # Login, Register, Dashboard
│   │   ├── utils/      # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── backend/            # Express REST API
    ├── config/         # MongoDB connection
    ├── middleware/     # auth, errorHandler
    ├── models/         # User, Todo (Mongoose)
    ├── routes/         # /auth, /todos
    ├── server.js
    ├── Dockerfile
    └── docker-compose.yml
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB running locally (or use Docker)

### Backend

```bash
cd backend
cp .env.example .env          # Edit JWT_SECRET!
npm install
npm run dev                   # Starts on :5000
```

### Frontend

```bash
cd frontend
cp .env.example .env          # Set VITE_API_BASE_URL
npm install
npm run dev                   # Starts on :3000
```

---

## Running with Docker

### Backend + MongoDB (docker-compose)

```bash
cd backend

# Create required bind-mount directory on host
sudo mkdir -p /mnt/mongodb-data

# Copy and configure env
cp .env.example .env
# Edit JWT_SECRET in .env!

# Build and start
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop
docker compose down
```

> MongoDB data persists at `/mnt/mongodb-data` on the host.

### Frontend (Docker)

```bash
cd frontend

# Build the image (set API URL at build time or use runtime injection)
docker build -t taska-frontend \
  --build-arg VITE_API_BASE_URL=http://your-backend-host:5000/api .

# Run
docker run -d -p 80:80 --name taska-frontend taska-frontend
```

> Frontend will be available at `http://localhost`

---

## API Reference

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

**Register / Login body:**
```json
{ "name": "Alex", "email": "alex@example.com", "password": "secret123" }
```

**Response:**
```json
{ "token": "eyJ...", "user": { "id": "...", "name": "Alex", "email": "..." } }
```

### Todo Endpoints (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get all todos for user |
| POST | `/api/todos` | Create a todo |
| PATCH | `/api/todos/:id` | Update title or completed |
| DELETE | `/api/todos/:id` | Delete a todo |

---

## Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://mongo:27017/todoapp` | MongoDB connection string |
| `JWT_SECRET` | ⚠️ **required** | Long random secret string |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `NODE_ENV` | `development` | `production` or `development` |
| `CORS_ORIGIN` | `*` | Allowed frontend origin |

### Frontend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## Features

- **Authentication** — JWT-based, bcrypt hashed passwords
- **Todo CRUD** — Create, read, toggle complete, delete
- **Per-user data** — All todos scoped to authenticated user
- **Security** — Helmet, rate limiting, input validation
- **Persistent data** — MongoDB bind mount at `/mnt/mongodb-data`
- **SPA routing** — nginx handles client-side routes
- **Health check** — `GET /health` on backend

---

## Health Check

```bash
curl http://localhost:5000/health
# {"status":"ok","timestamp":"..."}
```
