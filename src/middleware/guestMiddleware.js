import jwt from "jsonwebtoken";
import db from "../db.js";

const verifyGuest = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next();
  }
  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // check if the user is student or teacher
    const decoded = jwt.decode(accessToken);
    try {
      const sql = db
        .prepare("SELECT type FROM users WHERE id = ?")
        .get(decoded.id);
      if (sql.type === "student") {
        return res.redirect("/student/dashboard");
      } else {
        return res.redirect("/teacher/dashboard");
      }
    } catch (err) {
      console.error("Database error:", err);
      res.clearCookie("accessToken");
      return next();
    }
  } catch (error) {
    res.clearCookie("accessToken");
    return next();
  }
};

export default verifyGuest;
