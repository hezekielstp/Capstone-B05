import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }
  
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia");
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token tidak valid", error: error.message });
    }
  }
  