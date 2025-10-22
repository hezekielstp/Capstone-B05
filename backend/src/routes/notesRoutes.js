import express from "express";
import { createNote, deleteNote, getAllNotes, updateNote } from "../controllers/userController.js";

const router = express.Router();

router.get("/",getAllNotes);
router.post ("/", createNote);
router.put ("/:id", updateNote);
router.delete ("/:id", deleteNote);

export default router;

// app.get("/api/notes", (req,res) => {
//     res.status(200).send ("you get 10 notes");
// });

// app.post("/api/notes", (req,res) => {
//     res.status(201).json({message : "Post created succesfully"});
// });

// app.put("/api/notes/:id", (req,res) => {
//     res.status(200).json({message : "Post updated succesfully"});
// });

// app.delete("/api/notes/:id", (req,res) => {
//     res.status(200).json({message : "Note deleted succesfully"});
// });