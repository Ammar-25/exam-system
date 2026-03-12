import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import db from "./db.js";
import authController from "../src/controller/authController.js";
import verifyGuest from "./middleware/guestMiddleware.js";
import verifyAuth from "./middleware/authMiddleware.js";

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
    let user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user);
    let name = user.first_name + " " + user.second_name;
    if (user.type === "teacher") {
      return res.render("teacher-home.ejs", { user });
    }
    return res.send("Hello " + name + "!");
  } catch (err) {
    console.log(err);
  }
});

app.get("/refresh/token", authController.handleRefreshToken);

app.use("/", verifyGuest, authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
