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
    note: {
      type: String,
      default: "",
    },
    photoPath: {
      type: String, // contoh: "/rekaman/gambarSesi12.png"
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EEGSession ||
  mongoose.model("EEGSession", eegSessionSchema);
