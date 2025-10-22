import mongoose from "mongoose";

const cameraCaptureSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EEGSession",
      required: true,
    },
    timestamp: { type: Date, required: true },
    imageUrl: { type: String, required: true },
    contextNote: { type: String },
  },
  { timestamps: true }
);

const CameraCapture = mongoose.model("CameraCapture", cameraCaptureSchema);
export default CameraCapture;
