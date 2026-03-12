import jwt from "jsonwebtoken";
import db from "../db.js";
import tokens from "../utils/tokens.js";

const verifyAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const redirectTo = req.originalUrl;

  if (!accessToken) {
    return res.redirect(
      `/refresh/token?redirectTo=${encodeURIComponent(redirectTo)}`,
    );
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.clearCookie("accessToken");
    return res.redirect(
      `/refresh/token?redirectTo=${encodeURIComponent(redirectTo)}`,
    );
  }
};

export default verifyAuth;
