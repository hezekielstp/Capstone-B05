import mongoose from "mongoose";

const eegSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

const EEGSession = mongoose.model("EEGSession", eegSessionSchema);
export default EEGSession;
