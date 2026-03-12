import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import db from "../db.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import authController from "../controller/authController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.get("/register", (req, res) => {
  let grades = db.prepare("SELECT * FROM grades").all();
  res.render("register.ejs", { grades });
});

router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/refresh/token", authController.handleRefreshToken);

export default router;
