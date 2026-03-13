import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import db from "./db.js";
import authController from "../src/controller/authController.js";
import verifyAuth from "./middleware/authMiddleware.js";
import studentController from "../src/controller/studentController.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", verifyAuth, (req, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user);
    if (user.type === "student") {
      studentController.studentHome(req, res, user);
    } else {
      res.render("teacher-home.ejs", { user: user });
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

app.get("/refresh/token", authController.handleRefreshToken);

app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
