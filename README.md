# Roomeo

Roomeo is a roommate matching application with a React frontend, Express/MongoDB backend, and a separate FastAPI compatibility scoring service.

## Project structure

- `server.js` - backend entrypoint for the Express API
- `config/database.js` - MongoDB connection helper
- `controllers/` - request handlers for auth and profile operations
- `models/` - Mongoose data models
- `routes/` - Express route definitions for auth and profile APIs
- `frontend/` - React + Vite frontend application
- `ml-service/` - standalone FastAPI compatibility scoring service prototype

## Backend

The backend provides:
- user registration (`POST /api/auth/register`)
- user login (`POST /api/auth/login`)
- profile save/update (`PUT /api/profile/:id`)
- profile fetch (`GET /api/profile/:id`)

### Run backend

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root with:

```env
MONGODB_URI=<your mongodb connection string>
JWT_SECRET=<your jwt secret>
PORT=5000
```

3. Start the backend

```bash
npm run dev
```

The backend listens on `http://localhost:5000` by default.

## Frontend

The frontend is a Vite React app using Tailwind CSS and React Router. It currently uses a mock API for most data flows, but login is wired to the backend.

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## ML service

The `ml-service/` folder contains a FastAPI compatibility scoring prototype. It is separate from the main backend and can be run independently.

### Run ML service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn compatibility_service:app --reload
```

Then open `http://127.0.0.1:8000/docs` to view the API docs.

## Notes

- The frontend app currently relies on `frontend/src/api/mockApi.js` for profile, match, and request data.
- Backend auth and profile routes are implemented in Express and MongoDB.
- The ML service's Gemini AI endpoint is integrated directly with the frontend to power the "AI Match Insights" card on the Match Details page.

## Available commands

### Root backend

- `npm run dev` — start backend with `nodemon`
- `npm start` — start backend with Node

### Database Utilities

- `node check_db.js` — print all registered users currently in the database

### Frontend

- `npm run dev` — start Vite development server
- `npm run build` — build frontend for production
- `npm run preview` — preview built frontend

## Recommended workflow

1. Configure `MONGODB_URI` in `.env` (ensure special characters like `@` in the database password are URL-encoded).
2. Start the Express backend: `npm run dev`
3. Start the FastAPI ML service: `cd ml-service && uvicorn compatibility_service:app --reload`
4. Start the React frontend: `cd frontend && npm run dev`

## License

This project is released under ISC.
