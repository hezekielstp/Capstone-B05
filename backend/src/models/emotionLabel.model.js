import mongoose from "mongoose";

const emotionLabelSchema = new mongoose.Schema(
  {
    eegDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EEGData",
      required: true,
    },
    emotionCategory: { type: String, required: true },
    confidenceScore: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

const EmotionLabel = mongoose.model("EmotionLabel", emotionLabelSchema);
export default EmotionLabel;
