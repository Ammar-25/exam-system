import express from "express";
import { verifyAuth, verifyAPIAuth } from "../middleware/authMiddleware.js";
import studentController from "../controller/studentController.js";

const studentRouter = express.Router();

studentRouter.get("/dashboard", verifyAuth, studentController.studentDashboard);

studentRouter.get("/profile", verifyAuth, studentController.studentProfile);

studentRouter.post("/updateInfo", verifyAPIAuth, (req, res) => {
  console.log(req.body);
  return res.sendStatus(200);
});

studentRouter.post(
  "/changePassword",
  verifyAPIAuth,
  studentController.changePassword,
);

export default studentRouter;
