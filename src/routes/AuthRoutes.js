import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "login.html"));
});

router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "register.html"));
});

router.post("/login", async (req, res) => {});

router.post("/register", async (req, res) => {});

export default router;
