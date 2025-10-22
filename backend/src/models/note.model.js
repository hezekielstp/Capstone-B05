import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // Jika note berasal dari hasil sesi EEG
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EEGSession",
      default: null, // boleh kosong jika note tambahan
    },

    // Pemilik catatan
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Isi catatan
    noteContent: {
      type: String,
      required: true,
      trim: true,
    },

    // Jenis catatan: "session" atau "general"
    noteType: {
      type: String,
      enum: ["session", "general"],
      default: "general",
    },
  },
  { timestamps: true } // otomatis menambahkan createdAt dan updatedAt
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
