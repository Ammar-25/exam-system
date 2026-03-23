import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("database.db");

db.exec("PRAGMA foreign_keys = ON;");

// users
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        second_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'student',
        national_id TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        gender TEXT NOT NULL DEFAULT 'male',
        date_of_birth TEXT NOT NULL,
        refresh_token TEXT
    );
`);

//grades
db.exec(`
        CREATE TABLE IF NOT EXISTS grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grade TEXT NOT NULL UNIQUE
        );
    `);

//subjects
db.exec(`
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grade_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (grade_id) REFERENCES grades(id),
            UNIQUE(grade_id, name)
        );
    `);

//teachers
db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
            user_id TEXT PRIMARY KEY,
            subject_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        );
    `);

//students
db.exec(`
        CREATE TABLE IF NOT EXISTS students (
            user_id TEXT PRIMARY KEY,
            grade_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (grade_id) REFERENCES grades(id)
        );
    `);

// EXAMS
db.exec(`
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            duration INTEGER NOT NULL,
            passing_score INTEGER NOT NULL,
            date DATETIME NOT NULL,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )
    `);

// QUESTIONS
db.exec(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            question_type TEXT NOT NULL,
            FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
        )
    `);

// OPTIONS
db.exec(`
        CREATE TABLE IF NOT EXISTS options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            option_text TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL,
            marks INTEGER NOT NULL,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        )
    `);

// EXAM SESSIONS
db.exec(`
        CREATE TABLE IF NOT EXISTS exam_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            student_id TEXT NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME,
            score INTEGER,
            FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
        )
    `);

// EXAM SESSION ANSWERS
db.exec(`
        CREATE TABLE IF NOT EXISTS exam_session_answers (
            exam_session_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            option_id INTEGER NOT NULL,
            FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
            PRIMARY KEY (exam_session_id, question_id)
        )
    `);

// NOTIFICATIONS
db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT (0),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

export default db;
