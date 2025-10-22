import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EEGSession",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noteContent: { type: String, required: true },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
