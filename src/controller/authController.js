import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v7 as uuidv7 } from "uuid";
import db from "../db.js";
import tokens from "../utils/tokens.js";

const validate = (req) => {
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

  if (
    !first_name ||
    !second_name ||
    !email ||
    !password ||
    !grade ||
    !national_id ||
    !phone_number ||
    !gender ||
    !date_of_birth
  )
    return "All fields are required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{11}$/;
  const nationalIdRegex = /^\d{14}$/;
  const nameRegex = /^[a-zA-Z]+$/;

  if (!emailRegex.test(email)) return "Invalid email format";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (
    first_name < 3 ||
    second_name < 3 ||
    !nameRegex.test(first_name) ||
    !nameRegex.test(second_name)
  )
    return "Invalid name";

  if (!phoneRegex.test(phone_number)) return "Invalid phone number";
  if (!nationalIdRegex.test(national_id)) return "Invalid national ID";

  if (gender !== "male" && gender !== "female") return "Invalid gender";

  // date of birth less than 12 years
  const dob = new Date(date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  if (age < 12) return "You must be at least 12 years old";

  return "true";
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
    app.get("/login", (req, res) => {
      // Check if the query parameter exists
      const isRegistered = req.query.registered === "true";

      res.render("auth/login", {
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

  const valid = validate(req);
  if (validate(req) != "true") {
    return res.status(400).send({
      success: false,
      message: valid,
    });
  }

  try {
    const userId = uuidv7();
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert into 'users' table including the date_of_birth column
    const userQuery = db.prepare(
      "INSERT INTO users (id, first_name, second_name, email, password, national_id, phone_number, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    userQuery.run(
      userId,
      first_name,
      second_name,
      email,
      hashedPassword,
      national_id,
      phone_number,
      gender,
      date_of_birth, // Pass date_of_birth to the query
    );

    // Insert into 'students' table mapping user to grade
    const studentQuery = db.prepare(
      "INSERT INTO students (user_id, grade_id) VALUES (?, ?)",
    );
    studentQuery.run(userId, grade);

    return res.status(200).send({
      success: true,
      message: "Registered Successfully!",
    });
  } catch (error) {
    // ... catch block remains the same ...
  }
};
export default { handleRefreshToken, login, register };
