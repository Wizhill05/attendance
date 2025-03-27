import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const DBSOURCE = "school.db";

// Pre-hash passwords for teachers
const SAMPLE_PASSWORD = "password123";
const hashedPassword = bcrypt.hashSync(SAMPLE_PASSWORD, 10);

// Sample names for generating student names
const firstNames = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "William",
  "Mia",
  "James",
  "Charlotte",
  "Alexander",
  "Amelia",
  "Michael",
  "Harper",
  "Benjamin",
  "Evelyn",
  "Daniel",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
];

// Function to get random name combinations
const getRandomNames = (count) => {
  const names = [];
  const usedCombinations = new Set();

  while (names.length < count) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const combination = `${firstName}-${lastName}`;

    if (!usedCombinations.has(combination)) {
      usedCombinations.add(combination);
      names.push([firstName, lastName]);
    }
  }

  return names;
};

const db = new sqlite3.Database(DBSOURCE);

// Promisify db.run
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.log("Error running sql " + sql);
        console.log(err);
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

// Initialize database
const initializeDb = async () => {
  try {
    // Create tables
    await run(`CREATE TABLE IF NOT EXISTS teacher (
      teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      contact_number TEXT,
      subject_specialization TEXT
    )`);

    await run(`CREATE TABLE IF NOT EXISTS class (
      class_id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      section TEXT NOT NULL,
      academic_year TEXT NOT NULL
    )`);

    await run(`CREATE TABLE IF NOT EXISTS student (
      student_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      class_id INTEGER NOT NULL,
      email TEXT,
      contact_number TEXT,
      date_of_birth DATE,
      gender TEXT,
      FOREIGN KEY(class_id) REFERENCES class(class_id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS schedule (
      schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 7),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
      FOREIGN KEY(class_id) REFERENCES class(class_id),
      FOREIGN KEY(teacher_id) REFERENCES teacher(teacher_id),
      UNIQUE(class_id, period_number, day_of_week)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS attendance (
      attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
      teacher_id INTEGER NOT NULL,
      remarks TEXT,
      FOREIGN KEY(student_id) REFERENCES student(student_id),
      FOREIGN KEY(schedule_id) REFERENCES schedule(schedule_id),
      FOREIGN KEY(teacher_id) REFERENCES teacher(teacher_id),
      UNIQUE(student_id, schedule_id, date)
    )`);

    // Insert sample teachers
    const teachers = [
      ["John", "Smith", "john.smith@school.com", "Mathematics"],
      ["Sarah", "Johnson", "sarah.johnson@school.com", "Science"],
      ["Michael", "Brown", "michael.brown@school.com", "English"],
      ["Emily", "Davis", "emily.davis@school.com", "History"],
      ["David", "Wilson", "david.wilson@school.com", "Computer Science"],
    ];

    for (const [firstName, lastName, email, subject] of teachers) {
      await run(
        `INSERT OR IGNORE INTO teacher (first_name, last_name, email, password, subject_specialization) 
         VALUES (?, ?, ?, ?, ?)`,
        [firstName, lastName, email, hashedPassword, subject]
      );
    }

    console.log("\nTeacher Login Credentials:");
    console.log("---------------------------");
    teachers.forEach(([firstName, lastName, email]) => {
      console.log(`${firstName} ${lastName}`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${SAMPLE_PASSWORD}`);
      console.log("---------------------------");
    });

    // Insert sample classes
    const classes = [
      ["Class 10A", "10", "A"],
      ["Class 10B", "10", "B"],
      ["Class 11A", "11", "A"],
      ["Class 11B", "11", "B"],
    ];

    for (const [className, grade, section] of classes) {
      await run(
        `INSERT OR IGNORE INTO class (class_name, grade_level, section, academic_year) 
         VALUES (?, ?, ?, '2023-2024')`,
        [className, grade, section]
      );
    }

    // Insert students with realistic names for each class
    for (let classId = 1; classId <= 4; classId++) {
      const studentNames = getRandomNames(20); // Get 20 unique name combinations

      for (let i = 0; i < studentNames.length; i++) {
        const [firstName, lastName] = studentNames[i];
        const rollNumber = `${classId}${(i + 1).toString().padStart(2, "0")}`;

        await run(
          `INSERT OR IGNORE INTO student (first_name, last_name, roll_number, class_id) 
           VALUES (?, ?, ?, ?)`,
          [firstName, lastName, rollNumber, classId]
        );
      }
    }

    // Insert schedules for each class
    const periods = [
      ["08:00", "08:45"],
      ["08:45", "09:30"],
      ["09:45", "10:30"],
      ["10:30", "11:15"],
      ["11:30", "12:15"],
      ["12:15", "13:00"],
      ["13:30", "14:15"],
    ];

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const subjects = [
      "Mathematics",
      "Science",
      "English",
      "History",
      "Computer Science",
    ];

    // Create a schedule for each class, each day
    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      const classId = classIndex + 1;

      for (const day of days) {
        for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
          const teacherId = ((classIndex + periodIndex) % 5) + 1;
          const subject = subjects[(classIndex + periodIndex) % 5];

          await run(
            `INSERT OR IGNORE INTO schedule 
             (class_id, teacher_id, subject, period_number, start_time, end_time, day_of_week)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              classId,
              teacherId,
              subject,
              periodIndex + 1,
              periods[periodIndex][0],
              periods[periodIndex][1],
              day,
            ]
          );
        }
      }
    }

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

// Initialize the database
initializeDb();

export default db;
