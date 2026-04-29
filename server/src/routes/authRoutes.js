import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({ message: "Username must be 3+ chars and password 6+ chars." });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = makeToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = makeToken(user);

    return res.status(200).json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login." });
  }
});

export default router;
