import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    }
  },
  { timestamps: true }
);

listSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("List", listSchema);
