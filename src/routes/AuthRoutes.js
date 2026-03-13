import express from "express";
import path from "path";
import bcrypt from "bcryptjs";
import db from "../db.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import authController from "../controller/authController.js";
import verifyGuest from "../middleware/guestMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get("/login", verifyGuest, (req, res) => {
  const isRegistered = req.query.registered === "true";

  res.render("login", {
    toast: isRegistered,
    message: isRegistered ? "Registered Successfully" : "",
  });
});

router.get("/register", verifyGuest, (req, res) => {
  let grades = db.prepare("SELECT * FROM grades").all();
  res.render("register.ejs", { grades });
});

router.post("/login", verifyGuest, authController.login);

router.post("/register", verifyGuest, authController.register);

export default router;
