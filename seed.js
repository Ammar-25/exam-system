import db from "./src/db.js";
import bcrypt from "bcryptjs";

const pass = bcrypt.hashSync("password123", 10);

const seed = () => {
  console.log("🌱 Seeding expanded database...");

  try {
    // --- 0. WIPE EXISTING DATA & RESET COUNTERS ---
    // This allows you to run this script safely as many times as you want
    db.exec(`
      PRAGMA foreign_keys = OFF;
      DELETE FROM notifications;
      DELETE FROM exam_session_answers;
      DELETE FROM exam_sessions;
      DELETE FROM options;
      DELETE FROM questions;
      DELETE FROM exams;
      DELETE FROM teachers;
      DELETE FROM students;
      DELETE FROM subjects;
      DELETE FROM grades;
      DELETE FROM users;
      
      -- Reset the auto-increment IDs back to 1
      DELETE FROM sqlite_sequence; 
      
      PRAGMA foreign_keys = ON;
    `);

    // --- 1. GRADES ---
    const insertGrade = db.prepare("INSERT INTO grades (grade) VALUES (?)");
    insertGrade.run("Grade 10"); // id: 1
    insertGrade.run("Grade 11"); // id: 2
    insertGrade.run("Grade 12"); // id: 3

    // --- 2. SUBJECTS ---
    const insertSubject = db.prepare(
      "INSERT INTO subjects (grade_id, name) VALUES (?, ?)",
    );
    insertSubject.run(1, "Grade 10 Mathematics"); // id: 1
    insertSubject.run(1, "Grade 10 Physics"); // id: 2
    insertSubject.run(2, "Grade 11 Chemistry"); // id: 3
    insertSubject.run(2, "Grade 11 Biology"); // id: 4
    insertSubject.run(3, "Grade 12 Computer Science"); // id: 5
    insertSubject.run(3, "Grade 12 Literature"); // id: 6

    // --- 3. USERS ---
    const insertUser = db.prepare(
      "INSERT INTO users (id, first_name, second_name, email, password, type) VALUES (?, ?, ?, ?, ?, ?)",
    );
    // Students
    insertUser.run(
      "s1",
      "Ammar",
      "Mohamed",
      "ammar@gmail.com",
      pass,
      "student",
    );
    insertUser.run("s2", "Sara", "Ahmed", "sara@gmail.com", pass, "student");
    insertUser.run("s3", "Omar", "Hassan", "omar@gmail.com", pass, "student");
    insertUser.run(
      "s4",
      "Laila",
      "Mahmoud",
      "laila@gmail.com",
      pass,
      "student",
    );
    insertUser.run("s5", "Ziad", "Tariq", "ziad@gmail.com", pass, "student");

    // Teachers
    insertUser.run("t1", "John", "Smith", "john@school.com", pass, "teacher");
    insertUser.run("t2", "Emma", "Johnson", "emma@school.com", pass, "teacher");
    insertUser.run(
      "t3",
      "Michael",
      "Brown",
      "michael@school.com",
      pass,
      "teacher",
    );
    insertUser.run(
      "t4",
      "Sophia",
      "Davis",
      "sophia@school.com",
      pass,
      "teacher",
    );

    // --- 4. STUDENTS ---
    const insertStudent = db.prepare(
      "INSERT INTO students (user_id, grade_id) VALUES (?, ?)",
    );
    insertStudent.run("s1", 1); // Ammar -> G10
    insertStudent.run("s3", 1); // Omar -> G10
    insertStudent.run("s2", 2); // Sara -> G11
    insertStudent.run("s5", 2); // Ziad -> G11
    insertStudent.run("s4", 3); // Laila -> G12

    // --- 5. TEACHERS ---
    const insertTeacher = db.prepare(
      "INSERT INTO teachers (user_id, subject_id) VALUES (?, ?)",
    );
    insertTeacher.run("t1", 1); // John -> G10 Math
    insertTeacher.run("t2", 3); // Emma -> G11 Chemistry
    insertTeacher.run("t3", 2); // Michael -> G10 Physics
    insertTeacher.run("t4", 5); // Sophia -> G12 Comp Sci

    // --- 6. EXAMS ---
    const insertExam = db.prepare(
      "INSERT INTO exams (subject_id, title, duration, passing_score, date) VALUES (?, ?, ?, ?, ?)",
    );
    insertExam.run(1, "Math Midterm", 60, 50, "2026-04-15 10:00:00"); // id: 1 (G10 Math)
    insertExam.run(2, "Physics Quiz 1", 30, 10, "2026-04-20 12:00:00"); // id: 2 (G10 Physics)
    insertExam.run(5, "Intro to Algorithms", 90, 60, "2026-05-10 09:00:00"); // id: 3 (G12 CS)

    // --- 7. QUESTIONS ---
    const insertQuestion = db.prepare(
      "INSERT INTO questions (exam_id, question_text, question_type) VALUES (?, ?, ?)",
    );
    // Exam 1 (Math) Questions
    insertQuestion.run(1, "What is the result of 5 * 5?", "multiple_choice"); // id: 1
    insertQuestion.run(1, "Solve for x: 2x = 10", "multiple_choice"); // id: 2

    // Exam 2 (Physics) Questions
    insertQuestion.run(2, "What is the unit of Force?", "multiple_choice"); // id: 3
    insertQuestion.run(2, "Gravity on Earth is approx 9.8 m/s^2", "true_false"); // id: 4

    // Exam 3 (Comp Sci) Questions
    insertQuestion.run(
      3,
      "Which of these is a valid boolean value?",
      "multiple_choice",
    ); // id: 5

    // --- 8. OPTIONS ---
    const insertOption = db.prepare(
      "INSERT INTO options (question_id, option_text, is_correct, marks) VALUES (?, ?, ?, ?)",
    );
    // Q1 Options (Math: 5*5)
    insertOption.run(1, "10", 0, 0);
    insertOption.run(1, "20", 0, 0);
    insertOption.run(1, "25", 1, 5); // Correct (id: 3)
    insertOption.run(1, "30", 0, 0);

    // Q2 Options (Math: 2x=10)
    insertOption.run(2, "x = 5", 1, 5); // Correct (id: 5)
    insertOption.run(2, "x = 8", 0, 0);
    insertOption.run(2, "x = 12", 0, 0);

    // Q3 Options (Physics: Unit of Force)
    insertOption.run(3, "Joule", 0, 0);
    insertOption.run(3, "Newton", 1, 5); // Correct (id: 9)
    insertOption.run(3, "Watt", 0, 0);

    // Q4 Options (Physics: Gravity T/F)
    insertOption.run(4, "True", 1, 5); // Correct (id: 11)
    insertOption.run(4, "False", 0, 0);

    // Q5 Options (Comp Sci: Boolean)
    insertOption.run(5, "String", 0, 0);
    insertOption.run(5, "True", 1, 10); // Correct (id: 14)
    insertOption.run(5, "Integer", 0, 0);

    // --- 9. EXAM SESSIONS ---
    const insertSession = db.prepare(
      "INSERT INTO exam_sessions (exam_id, student_id, start_time, end_time, score) VALUES (?, ?, ?, ?, ?)",
    );
    // Ammar (s1) takes Math and Physics
    insertSession.run(
      1,
      "s1",
      "2026-04-15 10:00:00",
      "2026-04-15 10:45:00",
      10,
    ); // Session id: 1
    insertSession.run(
      2,
      "s1",
      "2026-04-20 12:00:00",
      "2026-04-20 12:20:00",
      10,
    ); // Session id: 2

    // Omar (s3) takes Math
    insertSession.run(1, "s3", "2026-04-15 10:05:00", "2026-04-15 11:00:00", 5); // Session id: 3

    // Laila (s4) takes Comp Sci
    insertSession.run(
      3,
      "s4",
      "2026-05-10 09:00:00",
      "2026-05-10 10:30:00",
      10,
    ); // Session id: 4

    // --- 10. EXAM SESSION ANSWERS ---
    const insertAnswer = db.prepare(
      "INSERT INTO exam_session_answers (exam_session_id, question_id, option_id) VALUES (?, ?, ?)",
    );
    // Session 1: Ammar's Math Answers (100%)
    insertAnswer.run(1, 1, 3); // Picked 25
    insertAnswer.run(1, 2, 5); // Picked x = 5

    // Session 2: Ammar's Physics Answers (100%)
    insertAnswer.run(2, 3, 9); // Picked Newton
    insertAnswer.run(2, 4, 11); // Picked True

    // Session 3: Omar's Math Answers (50%)
    insertAnswer.run(3, 1, 3); // Picked 25 (Correct)
    insertAnswer.run(3, 2, 6); // Picked x = 8 (Incorrect)

    // Session 4: Laila's Comp Sci Answers (100%)
    insertAnswer.run(4, 5, 14); // Picked True

    // --- 11. NOTIFICATIONS ---
    const insertNotification = db.prepare(
      "INSERT INTO notifications (user_id, message, title, read) VALUES (?, ?, ?, ?)",
    );
    // 0 = false (unread), 1 = true (read)
    insertNotification.run(
      "s1",
      "Score Update",
      "Your Math Midterm exam has been graded. You scored 10/10.",
      1,
    );
    insertNotification.run(
      "s1",
      "Exam Reminder",
      "Reminder: Physics Quiz 1 is tomorrow at 12:00 PM.",
      0,
    );
    insertNotification.run(
      "s3",
      "Score Update",
      "Your Math Midterm exam has been graded. You scored 5/10.",
      0,
    );
    insertNotification.run(
      "s4",
      "Exam Reminder",
      "Welcome to Grade 12 Computer Science! Check the syllabus.",
      1,
    );
    insertNotification.run(
      "t1",
      "Student Update",
      "Student Omar Hassan has submitted the Math Midterm.",
      0,
    ); // Teacher notification

    console.log(
      "✅ Expanded database (with notifications) seeded successfully!",
    );
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
  }
};

seed();
