import mongoose from "mongoose";

const eegDataSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EEGSession",
      required: true,
    },
    timestamp: { type: Date, required: true },
    rawSignal: { type: String, required: true },
    filteredSignal: { type: String, required: true },
  },
  { timestamps: true }
);

const EEGData = mongoose.model("EEGData", eegDataSchema);
export default EEGData;
