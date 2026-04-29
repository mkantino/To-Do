import express from "express";
import auth from "../middleware/auth.js";
import List from "../models/List.js";
import Todo from "../models/Todo.js";

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.sub }).sort({ createdAt: -1 });
    return res.json(lists);
  } catch {
    return res.status(500).json({ message: "Unable to load lists." });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "List name is required." });

    const created = await List.create({ userId: req.user.sub, name });
    return res.status(201).json(created);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "A list with that name already exists." });
    }
    return res.status(500).json({ message: "Unable to create list." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user.sub });
    if (!list) return res.status(404).json({ message: "List not found." });

    await Todo.deleteMany({ userId: req.user.sub, listId: list._id });
    await List.deleteOne({ _id: list._id });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: "Unable to delete list." });
  }
});

export default router;
