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
  let toast = false;
  let type = "success";
  let message = "Success";
  if (req.query.toast === "true" && req.query.type && req.query.message) {
    toast = true;
    type = req.query.type;
    message = req.query.message;
  }

  res.render("auth/login", {
    toast: toast,
    type: type,
    message: message,
  });
});

router.get("/register", verifyGuest, (req, res) => {
  let grades = db.prepare("SELECT * FROM grades").all();
  res.render("auth/register", { grades });
});

router.post("/login", verifyGuest, authController.login);

router.post("/register", verifyGuest, authController.register);

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("refreshToken", { path: "/refresh" });
    res.clearCookie("accessToken");
    res.status(200).send({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

export default router;
