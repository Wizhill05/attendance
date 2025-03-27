import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // State declarations
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [page, setPage] = useState("login");
  const [message, setMessage] = useState("");
  const [todayClasses, setTodayClasses] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [completedClasses, setCompletedClasses] = useState(new Set());
  const [absentStudents, setAbsentStudents] = useState([]);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    subject_specialization: "",
    contact_number: "",
  });

  const backendUrl = "http://localhost:5000";
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = days[new Date().getDay()];

  // Authentication check on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      setPage("dashboard");
      const teacherData = JSON.parse(localStorage.getItem("teacher"));
      setTeacher(teacherData);
    }
  }, []);

  // Data fetching based on page
  useEffect(() => {
    if (isAuthenticated) {
      if (page === "dashboard") {
        fetchTodayClasses();
        fetchTodayAbsentees();
      } else if (page === "schedule") {
        fetchWeeklySchedule();
      }
    }
  }, [page, isAuthenticated]);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.class_id);
    }
  }, [selectedClass]);

  // API Functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("teacher", JSON.stringify(data.teacher));
        setTeacher(data.teacher);
        setIsAuthenticated(true);
        setPage("dashboard");
        setMessage("");
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Error logging in");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: registerForm.first_name,
          last_name: registerForm.last_name,
          email: registerForm.email,
          password: registerForm.password,
          subject_specialization: registerForm.subject_specialization,
          contact_number: registerForm.contact_number,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Please login.");
        setPage("login");
        setRegisterForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirm_password: "",
          subject_specialization: "",
          contact_number: "",
        });
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Error registering");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacher");
    setIsAuthenticated(false);
    setTeacher(null);
    setPage("login");
    setSelectedClass(null);
    setCompletedClasses(new Set());
    setAbsentStudents([]);
  };

  const fetchTodayClasses = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/teachers/schedule`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      const todaySchedule = data.filter(
        (schedule) => schedule.day_of_week === today
      );
      setTodayClasses(
        todaySchedule.sort((a, b) => a.period_number - b.period_number)
      );
    } catch (err) {
      setMessage("Error fetching today's classes");
      console.error(err);
    }
  };

  const fetchTodayAbsentees = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/attendance/today/absences`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setAbsentStudents(data);
    } catch (err) {
      setMessage("Error fetching today's absences");
      console.error(err);
    }
  };

  const fetchWeeklySchedule = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/teachers/schedule`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setWeeklySchedule(data);
    } catch (err) {
      setMessage("Error fetching schedule");
      console.error(err);
    }
  };

  const fetchStudents = async (classId) => {
    if (!selectedClass) return;

    try {
      const studentsRes = await fetch(
        `${backendUrl}/api/classes/${classId}/students`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      const today = new Date().toISOString().split("T")[0];
      const attendanceRes = await fetch(
        `${backendUrl}/api/attendance/${selectedClass.schedule_id}/${today}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const attendanceData = await attendanceRes.json();

      const initialRecords = {};
      studentsData.forEach((student) => {
        const record = attendanceData.find(
          (a) => a.student_id === student.student_id
        );
        initialRecords[student.student_id] = record ? record.status : "Present";
      });
      setAttendanceRecords(initialRecords);

      if (attendanceData.length > 0) {
        setCompletedClasses(
          (prev) => new Set([...prev, selectedClass.schedule_id])
        );
      }
    } catch (err) {
      setMessage("Error fetching students");
      console.error(err);
    }
  };

  const handleAttendanceToggle = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present",
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    try {
      const attendance_records = Object.entries(attendanceRecords).map(
        ([student_id, status]) => ({
          student_id: parseInt(student_id),
          status,
        })
      );

      const res = await fetch(`${backendUrl}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          schedule_id: selectedClass.schedule_id,
          date: new Date().toISOString().split("T")[0],
          attendance_records,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Attendance marked successfully");
        setCompletedClasses(
          (prev) => new Set([...prev, selectedClass.schedule_id])
        );
        setSelectedClass(null);
        fetchTodayAbsentees();
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Error marking attendance");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Functions
  const renderLogin = () => (
    <div className="login-container">
      <div className="login-form">
        <h2>Teacher Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              required
              className="input"
            />
          </div>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-links">
          <button
            onClick={() => setPage("register")}
            className="button secondary link-button"
          >
            New Teacher? Register here
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="login-container">
      <div className="register-form">
        <h2>Teacher Registration</h2>
        <form onSubmit={handleRegister}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={registerForm.first_name}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    first_name: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={registerForm.last_name}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    last_name: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, email: e.target.value })
              }
              required
              className="input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={registerForm.confirm_password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    confirm_password: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Subject Specialization</label>
              <input
                type="text"
                value={registerForm.subject_specialization}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    subject_specialization: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                value={registerForm.contact_number}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    contact_number: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="auth-links">
          <button
            onClick={() => setPage("login")}
            className="button secondary link-button"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Today's Classes ({today})</h2>
      </div>

      <div className="dashboard-content">
        <div className="classes-section">
          {selectedClass ? (
            <div className="attendance-section">
              <div className="attendance-header">
                <h3>
                  {selectedClass.class_name} - Period{" "}
                  {selectedClass.period_number}
                </h3>
                <button
                  className="button secondary"
                  onClick={() => setSelectedClass(null)}
                >
                  Back to Classes
                </button>
              </div>

              <div className="students-list">
                {students.map((student) => (
                  <div key={student.student_id} className="student-item">
                    <div className="student-info">
                      <span className="roll-number">
                        #{student.roll_number}
                      </span>
                      <span className="student-name">
                        {student.first_name} {student.last_name}
                      </span>
                    </div>
                    <label className="attendance-toggle">
                      <input
                        type="checkbox"
                        checked={
                          attendanceRecords[student.student_id] === "Present"
                        }
                        onChange={() =>
                          handleAttendanceToggle(student.student_id)
                        }
                      />
                      <span className="toggle-label">
                        {attendanceRecords[student.student_id]}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <button
                className="button primary submit-attendance"
                onClick={handleSubmitAttendance}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Attendance"}
              </button>
            </div>
          ) : (
            <div className="classes-list">
              {todayClasses.length === 0 ? (
                <p className="empty-message">No classes scheduled for today</p>
              ) : (
                todayClasses.map((classItem) => (
                  <div
                    key={classItem.schedule_id}
                    className={`class-card ${
                      completedClasses.has(classItem.schedule_id)
                        ? "completed"
                        : ""
                    }`}
                    onClick={() => setSelectedClass(classItem)}
                  >
                    <div className="class-info">
                      <h3>{classItem.class_name}</h3>
                      <p>Period {classItem.period_number}</p>
                      <p>{classItem.subject}</p>
                      <p className="time">
                        {classItem.start_time} - {classItem.end_time}
                      </p>
                    </div>
                    {completedClasses.has(classItem.schedule_id) && (
                      <div className="completion-mark">✓</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {!selectedClass && (
          <div className="absent-students-section">
            <h3>Today's Absent Students</h3>
            {absentStudents.length === 0 ? (
              <p className="empty-message">No absent students today</p>
            ) : (
              <div className="absent-students-list">
                {absentStudents.map((student) => (
                  <div key={student.student_id} className="absent-student-item">
                    <div className="student-info">
                      <span className="student-name">
                        {student.first_name} {student.last_name}
                      </span>
                      <span className="class-info">
                        {student.class_name} - Period {student.period_number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSchedule = () => {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = Array.from({ length: 7 }, (_, i) => i + 1);

    return (
      <div className="schedule-page">
        <h2>Weekly Schedule</h2>
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Time</th>
                {weekDays.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period}>
                  <td>{period}</td>
                  <td>
                    {
                      weeklySchedule.find((s) => s.period_number === period)
                        ?.start_time
                    }{" "}
                    -
                    {
                      weeklySchedule.find((s) => s.period_number === period)
                        ?.end_time
                    }
                  </td>
                  {weekDays.map((day) => {
                    const classSession = weeklySchedule.find(
                      (s) => s.day_of_week === day && s.period_number === period
                    );
                    return (
                      <td key={day} className={classSession ? "has-class" : ""}>
                        {classSession && (
                          <>
                            <div className="class-name">
                              {classSession.class_name}
                            </div>
                            <div className="subject">
                              {classSession.subject}
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {isAuthenticated ? (
        <>
          <header className="header">
            <h1>Student Attendance Management System</h1>
            <div className="nav">
              <button
                className={`nav-btn ${page === "dashboard" ? "active" : ""}`}
                onClick={() => setPage("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={`nav-btn ${page === "schedule" ? "active" : ""}`}
                onClick={() => setPage("schedule")}
              >
                My Schedule
              </button>
              <div className="teacher-info">
                <span>
                  Welcome, {teacher?.firstName} {teacher?.lastName}
                </span>
                <button className="nav-btn logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="main">
            {message && (
              <div
                className={`message ${
                  message.includes("Error") ? "error" : "success"
                }`}
              >
                {message}
                <button className="close-btn" onClick={() => setMessage("")}>
                  ×
                </button>
              </div>
            )}

            {page === "dashboard" && renderDashboard()}
            {page === "schedule" && renderSchedule()}
          </main>
        </>
      ) : (
        <>
          {message && (
            <div
              className={`message floating ${
                message.includes("Error") ? "error" : "success"
              }`}
            >
              {message}
              <button className="close-btn" onClick={() => setMessage("")}>
                ×
              </button>
            </div>
          )}
          {page === "login" && renderLogin()}
          {page === "register" && renderRegister()}
        </>
      )}
    </div>
  );
}

export default App;
