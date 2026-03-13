import jwt from "jsonwebtoken";

const verifyGuest = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next();
  }

  if (!accessToken) {
    return next();
  }
  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    return res.redirect("/");
  } catch (error) {
    res.clearCookie("accessToken");
    return next();
  }
};

export default verifyGuest;
