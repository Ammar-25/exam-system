import db from "../db.js";

const studentHome = (req, res, user) => {
  const query = db
    .prepare(
      `
        SELECT s.id AS subject_id, s.name AS subject_name
        FROM subjects s
        JOIN students st ON s.grade_id = st.grade_id
        WHERE st.user_id = ?
      `,
    )
    .all(user.id);
  res.render("student-home.ejs", { user: user, subjects: query });
};

export default { studentHome };
