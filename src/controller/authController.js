import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v7 as uuidv7 } from "uuid";
import db from "../db.js";
import tokens from "../utils/tokens.js";
import registerValidate from "../utils/validatores.js";

const handleRefreshTokenAPI = (req, res) => {
  const cookies = req.cookies;

  if (!cookies || !cookies.refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.refreshToken;

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const userdb = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);

    if (!userdb || userdb.refresh_token !== refreshToken) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const newAccessToken = tokens.createAccessToken(userdb);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token refreshed successfully!",
    });
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

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

    return res
      .status(200)
      .send({ success: true, message: "Login successful", type: user.type });
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
};

const register = (req, res) => {
  let {
    first_name,
    second_name,
    email,
    password,
    grade,
    national_id,
    phone_number,
    gender,
    date_of_birth,
  } = req.body;

  const result = registerValidate.safeParse(req.body);

  if (!result.success) {
    let errors = Object.values(result.error.flatten().fieldErrors).flat();
    return res.status(400).json({
      success: false,
      message: errors,
    });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user) {
      return res
        .status(400)
        .send({ success: false, message: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user_id = uuidv7();
    db.prepare(
      "INSERT INTO users (id, first_name, second_name, email, password, national_id, phone_number, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      user_id,
      first_name,
      second_name,
      email,
      hashedPassword,
      national_id,
      phone_number,
      gender,
      date_of_birth,
    );

    db.prepare("INSERT INTO students (user_id, grade_id) VALUES (?, ?)").run(
      user_id,
      grade,
    );

    return res
      .status(201)
      .send({ success: true, message: "User created successfully" });
  } catch (error) {
    return res.status(500).send({ success: false, message: [error.message] });
  }
};
export default { handleRefreshToken, handleRefreshTokenAPI, login, register };
