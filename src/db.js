import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("database.db");

// users
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        second_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'student',
        refresh_token TEXT
    );
`);

//greades
db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
        id TEXT PRIMARY KEY,
        grade TEXT NOT NULL UNIQUE
    );
`);

//subjects
db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        grade_id TEXT NOT NULL,
        name TEXT NOT NULL UNIQUE,
        FOREIGN KEY (grade_id) REFERENCES grades(id)
    );
`);

//teachers
db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
        user_id TEXT PRIMARY KEY,
        subject_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );
`);

//students
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        user_id TEXT PRIMARY KEY,
        grade_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (grade_id) REFERENCES grades(id)
    );
`);

export default db;
