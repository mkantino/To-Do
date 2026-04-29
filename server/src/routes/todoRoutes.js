import express from "express";
import Todo from "../models/Todo.js";
import auth from "../middleware/auth.js";
import List from "../models/List.js";

const router = express.Router();

router.use(auth);

async function ensureDefaultListId(userId) {
  const existing = await List.findOne({ userId }).sort({ createdAt: 1 });
  if (existing) return existing._id;
  const created = await List.create({ userId, name: "My List" });
  return created._id;
}

router.get("/", async (req, res) => {
  try {
    const listId = req.query.listId
      ? req.query.listId
      : (await ensureDefaultListId(req.user.sub)).toString();

    const todos = await Todo.find({ userId: req.user.sub, listId }).sort({ createdAt: -1 });
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load tasks." });
  }
});

router.post("/", async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const listId = req.body.listId
      ? String(req.body.listId)
      : (await ensureDefaultListId(req.user.sub)).toString();

    const todo = await Todo.create({
      userId: req.user.sub,
      listId,
      title,
      completed: false
    });

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create task." });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.sub });
    if (!todo) {
      return res.status(404).json({ message: "Task not found." });
    }

    todo.completed = !todo.completed;
    await todo.save();
    return res.json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update task." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Todo.deleteOne({ _id: req.params.id, userId: req.user.sub });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete task." });
  }
});

export default router;
