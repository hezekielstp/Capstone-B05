import CameraCapture from "../models/cameraCapture.model.js";

/**
 * CREATE new camera capture record
 * ESP32 should already send/upload image (URL/path obtained by server)
 */
export const createCameraCapture = async (req, res) => {
  try {
    const { sessionId, timestamp, imageUrl, contextNote } = req.body;

    if (!sessionId || !timestamp || !imageUrl) {
      return res.status(400).json({
        message: "sessionId, timestamp, and imageUrl are required",
      });
    }

    const newCapture = await CameraCapture.create({
      sessionId,
      timestamp,
      imageUrl,
      contextNote,
    });

    return res.status(201).json({
      message: "Capture created successfully",
      data: newCapture,
    });
  } catch (error) {
    console.error("createCameraCapture Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * GET all captures (sorted by captureId ASC)
 */
export const getAllCaptures = async (req, res) => {
  try {
    const captures = await CameraCapture.find().sort({ captureId: 1 });

    return res.status(200).json({
      message: "All captures retrieved",
      data: captures,
    });
  } catch (error) {
    console.error("getAllCaptures Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * GET capture by captureId (not _id)
 */
export const getCaptureById = async (req, res) => {
  try {
    const { captureId } = req.params;

    const capture = await CameraCapture.findOne({ captureId: Number(captureId) });

    if (!capture) {
      return res.status(404).json({ message: "Capture not found" });
    }

    return res.status(200).json({
      message: "Capture retrieved",
      data: capture,
    });
  } catch (error) {
    console.error("getCaptureById Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * GET captures by sessionId
 */
export const getCapturesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const captures = await CameraCapture.find({ sessionId }).sort({ captureId: 1 });

    return res.status(200).json({
      message: "Captures retrieved",
      data: captures,
    });
  } catch (error) {
    console.error("getCapturesBySession Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * DELETE capture by captureId
 */
export const deleteCapture = async (req, res) => {
  try {
    const { captureId } = req.params;

    const deleted = await CameraCapture.findOneAndDelete({ captureId: Number(captureId) });

    if (!deleted) {
      return res.status(404).json({ message: "Capture not found" });
    }

    return res.status(200).json({
      message: "Capture deleted",
      data: deleted,
    });
  } catch (error) {
    console.error("deleteCapture Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * DELETE all (optional, for resetting)
 */
export const deleteAllCaptures = async (req, res) => {
  try {
    await CameraCapture.deleteMany({});

    return res.status(200).json({
      message: "All captures deleted",
    });
  } catch (error) {
    console.error("deleteAllCaptures Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
