import db from "../db.js";

const studentHome = (req, res, user) => {
  if (!user) {
    console.error("Error: user.grade_id is undefined");
    return res.status(400).send("User grade information missing.");
  }

  try {
    const student = db
      .prepare(`SELECT * FROM students WHERE user_id = ?`)
      .get(user.id);
    if (!student || !student.grade_id) {
      console.error("Error: student grade is undefined");
      return res.status(400).send("User grade information missing.");
    }
    const countResult = db
      .prepare(
        `
        SELECT COUNT(exams.id) as count FROM exams
        JOIN subjects ON exams.subject_id = subjects.id
        WHERE subjects.grade_id = ?
        AND exams.id NOT IN (
          SELECT exam_id FROM exam_sessions WHERE student_id = ?
        )
      `,
      )
      .get(student.grade_id, user.id);

    const notification = db
      .prepare("SELECT * FROM notifications WHERE user_id = ?")
      .all(user.id);

    const unreadCount = notification.filter((n) => n.read === 0).length;

    res.render("student-home.ejs", {
      user: user,
      examsToAttend: countResult.count,
      notifications: notification,
      unreadCount: unreadCount,
    });
  } catch (error) {
    return res.render("/login", {
      toast: true,
      message: "Something went wrong",
    });
  }
};

export default { studentHome };
