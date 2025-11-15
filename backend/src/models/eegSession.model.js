// models/eegSession.model.js
import mongoose from "mongoose";

const eegSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mood: {
      type: String,
      enum: ["Positif", "Netral", "Negatif"],
      required: true,
    },

    probabilities: {
      type: [Number],   // ← hasil prediction probability
      default: [],      // ← aman, tidak wajib
    },

    note: {
      type: String,
      default: "",
    },

    photoPath: {
      type: String,
      required: false,  // ← dibuat FALSE agar inference tanpa foto tetap bisa
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EEGSession ||
  mongoose.model("EEGSession", eegSessionSchema);
