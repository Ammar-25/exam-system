import jwt from "jsonwebtoken";

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

const verifyAPIAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.clearCookie("accessToken");
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export { verifyAuth, verifyAPIAuth };
