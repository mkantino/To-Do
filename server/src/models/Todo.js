import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
