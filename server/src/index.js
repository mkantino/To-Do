import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import listRoutes from "./routes/listRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests (no Origin header) and configured browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res
    .status(200)
    .type("text")
    .send(
      "Backend is running. Use GET /health or call /api/auth/register, /api/auth/login, /api/todos, and /api/lists."
    );
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/todos", todoRoutes);

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    // Fail fast if required env vars are missing.
    throw new Error("MONGO_URI and JWT_SECRET are required in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
