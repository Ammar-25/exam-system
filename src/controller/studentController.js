import db from "../db.js";

const studentDashboard = (req, res) => {
  let toast = false;
  let type = "success";
  let message = "Success";
  if (req.query.toast === "true" && req.query.type && req.query.message) {
    toast = true;
    type = req.query.type;
    message = req.query.message;
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user);
    if (!user) {
      return res.render("index.ejs", {
        toast: true,
        type: "error",
        message: "User not found.",
      });
    }
    const student = db
      .prepare("SELECT * FROM students WHERE user_id = ?")
      .get(user.id);
    if (!student) {
      return res.render("index.ejs", {
        toast: true,
        type: "error",
        message: "Student profile not found.",
      });
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
      .prepare("SELECT * FROM notifications WHERE user_id = ? AND read = 0")
      .all(user.id);

    res.render("student/student-home", {
      user: user,
      examsToAttend: countResult.count,
      notifications: notification,
      toast: toast,
      type: type,
      message: message,
    });
  } catch (error) {
    console.error(error);
    return res.render("index", {
      toast: true,
      type: "error",
      message: "Something went wrong retrieving the profile.",
    });
  }
};

const studentProfile = (req, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user);

    if (!user) {
      return res.render("index.ejs", {
        toast: true,
        type: "error",
        message: "User not found.",
      });
    }

    const student = db
      .prepare("SELECT * FROM students WHERE user_id = ?")
      .get(user.id);
    if (!student) {
      return res.render("student-home.ejs", {
        toast: true,
        type: "error",
        message: "Student profile not found.",
      });
    }

    const grade = db
      .prepare("SELECT * FROM grades WHERE id = ?")
      .get(student.grade_id);

    const subjects_count = db
      .prepare("SELECT COUNT(*) as count FROM subjects WHERE grade_id = ?")
      .get(student.grade_id);

    const exams = db
      .prepare(
        `SELECT COUNT(DISTINCT exam_id) as count FROM exam_sessions WHERE student_id = ?`,
      )
      .get(user.id);

    const statement = db
      .prepare(
        `
        SELECT 
            AVG(
                (es.score * 100.0) / 
                NULLIF((
                    SELECT SUM(o.marks)
                    FROM questions q
                    JOIN options o ON q.id = o.question_id
                    WHERE q.exam_id = es.exam_id AND o.is_correct = 1
                ), 0)
            ) as average_percentage
        FROM exam_sessions es
        WHERE es.student_id = ? AND es.score IS NOT NULL;
    `,
      )
      .get(user.id);

    const averagePercentage = statement.average_percentage;

    const notifications = db
      .prepare("SELECT * FROM notifications WHERE user_id = ? AND read = 0")
      .all(user.id);

    return res.render("student/student-profile", {
      user: user,
      student: student,
      grade: grade,
      subjects_count: subjects_count.count || 0,
      exams: exams.count || 0,
      averagePercentage: averagePercentage || 0,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error(error);
    return res.render("student/student-home", {
      toast: true,
      type: "error",
      message: "Something went wrong retrieving the profile.",
    });
  }
};
export default { studentDashboard, studentProfile };
