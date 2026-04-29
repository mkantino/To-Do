# RedBlack Todo App

Simple full-stack todo app with:
- React frontend (JavaScript)
- Express + MongoDB backend
- Login + Register
- Per-user todo lists
- 10-minute session expiry
- Red + Black only UI theme
- Animated checklist strike-through effect

## 1) Install prerequisites

- Install Node.js 18+ (includes npm)
- Install or use a MongoDB database

## 2) Configure backend env

Copy file:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

- `MONGO_URI` = your MongoDB connection link
- `JWT_SECRET` = strong random secret
- `PORT` optional (default `5000`)

## 3) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 4) Run app

In one terminal:

```bash
cd server
npm run dev
```

In second terminal:

```bash
cd client
npm run dev
```

Open:

`http://localhost:5173`

## Authentication details

- Register button on login page creates a new user only if username does not exist.
- Login gives JWT token.
- Token expires in 10 minutes.
- Frontend also auto-logs out user at 10 minutes.
- Todos are filtered by logged-in user (`userId`), so each user only sees their own tasks.
