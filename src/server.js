import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/AuthRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.use("/", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
