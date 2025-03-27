import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db.js";

const app = express();
const port = 5000;
const JWT_SECRET = "your-secret-key"; // In production, use environment variable
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err, teacher) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.teacher = teacher;
    next();
  });
};

// AUTH ENDPOINTS

// Teacher Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get(
    "SELECT * FROM teacher WHERE email = ?",
    [email],
    async (err, teacher) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!teacher) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      try {
        const validPassword = await bcrypt.compare(password, teacher.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
          { id: teacher.teacher_id, email: teacher.email },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          token,
          teacher: {
            id: teacher.teacher_id,
            email: teacher.email,
            firstName: teacher.first_name,
            lastName: teacher.last_name,
          },
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  );
});

// Teacher Registration
app.post("/api/auth/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    subject_specialization,
    contact_number,
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    // Check if email already exists
    db.get(
      "SELECT email FROM teacher WHERE email = ?",
      [email],
      async (err, teacher) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (teacher) {
          return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new teacher
        db.run(
          `INSERT INTO teacher (first_name, last_name, email, password, subject_specialization, contact_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            first_name,
            last_name,
            email,
            hashedPassword,
            subject_specialization,
            contact_number,
          ],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res
              .status(201)
              .json({ message: "Teacher registered successfully" });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's absences for the logged-in teacher
app.get("/api/attendance/today/absences", authenticateToken, (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const query = `
    SELECT DISTINCT 
      s.student_id,
      s.first_name,
      s.last_name,
      c.class_name,
      sch.period_number,
      a.status
    FROM attendance a
    JOIN student s ON a.student_id = s.student_id
    JOIN schedule sch ON a.schedule_id = sch.schedule_id
    JOIN class c ON s.class_id = c.class_id
    WHERE a.teacher_id = ? 
    AND a.date = ?
    AND a.status = 'Absent'
    ORDER BY sch.period_number, s.roll_number
  `;

  db.all(query, [req.teacher.id, today], (err, absences) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(absences);
  });
});

// Get teacher's schedule
app.get("/api/teachers/schedule", authenticateToken, (req, res) => {
  const query = `
    SELECT s.*, c.class_name, c.grade_level, c.section
    FROM schedule s
    JOIN class c ON s.class_id = c.class_id
    WHERE s.teacher_id = ?
    ORDER BY s.day_of_week, s.period_number
  `;

  db.all(query, [req.teacher.id], (err, schedule) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(schedule);
  });
});

// Get students by class
app.get("/api/classes/:id/students", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM student WHERE class_id = ? ORDER BY roll_number",
    [req.params.id],
    (err, students) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(students);
    }
  );
});

// Get attendance for a specific schedule and date
app.get("/api/attendance/:schedule_id/:date", authenticateToken, (req, res) => {
  const query = `
    SELECT a.*, s.first_name, s.last_name, s.roll_number
    FROM attendance a
    JOIN student s ON a.student_id = s.student_id
    WHERE a.schedule_id = ? AND a.date = ?
    ORDER BY s.roll_number
  `;

  db.all(
    query,
    [req.params.schedule_id, req.params.date],
    (err, attendance) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(attendance);
    }
  );
});

// Mark attendance for a class period
app.post("/api/attendance/mark", authenticateToken, (req, res) => {
  const { schedule_id, date, attendance_records } = req.body;

  if (!schedule_id || !date || !attendance_records) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Verify teacher has access to this schedule
  db.get(
    "SELECT * FROM schedule WHERE schedule_id = ? AND teacher_id = ?",
    [schedule_id, req.teacher.id],
    (err, schedule) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!schedule) {
        return res
          .status(403)
          .json({ error: "Unauthorized to mark attendance for this schedule" });
      }

      // Begin transaction
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        let success = true;
        let processed = 0;

        // Process each attendance record
        attendance_records.forEach((record) => {
          const { student_id, status } = record;

          db.run(
            `INSERT OR REPLACE INTO attendance 
             (student_id, schedule_id, date, status, teacher_id)
             VALUES (?, ?, ?, ?, ?)`,
            [student_id, schedule_id, date, status, req.teacher.id],
            (err) => {
              processed++;
              if (err) {
                success = false;
              }

              // If all records have been processed
              if (processed === attendance_records.length) {
                if (success) {
                  db.run("COMMIT", (err) => {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Attendance marked successfully" });
                  });
                } else {
                  db.run("ROLLBACK", (err) => {
                    return res
                      .status(500)
                      .json({ error: "Failed to mark attendance" });
                  });
                }
              }
            }
          );
        });
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
