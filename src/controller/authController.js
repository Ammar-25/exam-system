import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v7 as uuidv7 } from "uuid";
import db from "../db.js";
import tokens from "../utils/tokens.js";

const handleRefreshToken = (req, res) => {
  const cookies = req.cookies;

  const redirectTo =
    req.query.redirectTo && req.query.redirectTo.startsWith("/")
      ? req.query.redirectTo
      : "/";

  if (!cookies || !cookies.refreshToken) {
    return res.redirect("/login");
  }

  const refreshToken = cookies.refreshToken;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.clearCookie("refreshToken");
      return res.redirect("/login");
    }

    let dbUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);

    if (!dbUser || dbUser.refresh_token !== refreshToken) {
      res.clearCookie("refreshToken");
      return res.redirect("/login");
    }

    const newAccessToken = tokens.createAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    return res.redirect(redirectTo);
  });
};

const login = (req, res) => {
  const { email, password, remember_me } = req.body;
  if (!email || !password) {
    app.get("/login", (req, res) => {
      // Check if the query parameter exists
      const isRegistered = req.query.registered === "true";

      res.render("login", {
        toast: isRegistered,
        message: isRegistered ? "Registered Successfully" : "",
      });
    });
    return res
      .status(400)
      .send({ success: false, message: "All fields are required" });
  }
  try {
    const userQuery = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = userQuery.get(email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = tokens.createAccessToken(user);
    const refreshToken = tokens.createRefreshToken(user);

    db.prepare("UPDATE users SET refresh_token = ? WHERE id = ?").run(
      refreshToken,
      user.id,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/refresh",
      sameSite: "strict",
      secure: false,
      ...(remember_me ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).send({ success: true, message: "Login successful" });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

const register = (req, res) => {
  let { first_name, second_name, email, password, grade } = req.body;
  if (!first_name || !second_name || !email || !password || !grade) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }
  try {
    const userId = uuidv7();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userQuery = db.prepare(
      "INSERT INTO users (id, first_name, second_name, email, password) VALUES (?, ?, ?, ?, ?)",
    );
    const user = userQuery.run(
      userId,
      first_name,
      second_name,
      email,
      hashedPassword,
    );
    const student = db.prepare(
      "INSERT INTO students (user_id, grade_id) VALUES (?, ?)",
    );
    student.run(userId, grade);
    return res
      .status(200)
      .send({ success: true, message: "Registerd Successfully!" });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: "User with this email already exists" });
  }
};

export default { handleRefreshToken, login, register };
