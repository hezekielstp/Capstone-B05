import express from "express";
import notesRoutes from "../src/routes/notesRoutes.js"
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express ()
const PORT = process.env.PORT  || 5001;

app.use("/api/notes", notesRoutes)

connectDB();

app.listen(5001, () =>{
    console.log("Server started on PORT :", PORT)
});

