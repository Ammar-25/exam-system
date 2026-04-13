import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import authController from "../src/controller/authController.js";
import studentRouter from "./routes/studentRoutes.js";
import verifyGuest from "./middleware/guestMiddleware.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", verifyGuest, (req, res) => {
  res.render("index");
});

app.use("/student", studentRouter);

app.get("/refresh/token", authController.handleRefreshToken);
app.get("/refresh", authController.handleRefreshTokenAPI);

app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
