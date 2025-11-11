import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: String,
  seq: Number,
});

const Counter = mongoose.model("CameraCaptureCounter", counterSchema);

const cameraCaptureSchema = new mongoose.Schema(
  {
    captureId: {
      type: Number,
      unique: true,   // nomor urut unik
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EEGSession",
      required: true,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    contextNote: {
      type: String,
    },
  },
  { timestamps: true }
);

// ====== AUTO INCREMENT (seq) ======
cameraCaptureSchema.pre("save", async function (next) {
  if (this.captureId != null) return next(); // jika sudah ada, lewati

  let counter = await Counter.findOne({ name: "cameraCapture" });

  if (!counter) {
    counter = await Counter.create({ name: "cameraCapture", seq: 0 });
  }

  counter.seq += 1;
  await counter.save();

  this.captureId = counter.seq;
  next();
});

const CameraCapture = mongoose.model(
  "CameraCapture",
  cameraCaptureSchema
);

export default CameraCapture;
