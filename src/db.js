import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data.db");

// users
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        second_name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        type TEXT NOT NULL
    );
`);

//teachers
db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
        user_id INTEGER PRIMARY KEY,
        subject_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );
`);

//students
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        user_id INTEGER PRIMARY KEY,
        grade_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (grade_id) REFERENCES grades(id)
    );
`);

//subjects
db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
`);

//greades
db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grade TEXT NOT NULL UNIQUE
    );
`);

export default db;
