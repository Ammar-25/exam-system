import express from "express";
import studentController from "../controller/studentController.js";
const studentRouter = express.Router();

studentRouter.get("/dashboard", studentController.studentDashboard);

studentRouter.get("/profile", studentController.studentProfile);

studentRouter.post("/updateInfo", (req, res) => {
  console.log(req.body);
  return res.sendStatus(200);
});

export default studentRouter;
