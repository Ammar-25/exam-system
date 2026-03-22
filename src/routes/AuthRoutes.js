import express from "express";
import path from "path";
import db from "../db.js";
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
    type: "success",
    message: isRegistered ? "Registered Successfully" : "",
  });
});

router.get("/register", verifyGuest, (req, res) => {
  let grades = db.prepare("SELECT * FROM grades").all();
  res.render("register.ejs", { grades });
});

router.post("/login", verifyGuest, authController.login);

router.post("/register", verifyGuest, authController.register);

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.sendStatus(200).send({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

export default router;
