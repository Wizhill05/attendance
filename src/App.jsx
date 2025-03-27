import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Schedule from "./components/Schedule";
import PreviousAbsences from "./components/PreviousAbsences";

function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [page, setPage] = useState("login");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Dashboard states
  const [todayClasses, setTodayClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [completedClasses, setCompletedClasses] = useState(new Set());
  const [absentStudents, setAbsentStudents] = useState([]);

  // Schedule state
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  // Previous absences states
  const [previousAbsences, setPreviousAbsences] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
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

  // Check authentication on load
  useEffect(() => {
    console.log("Checking auth...");
    const token = localStorage.getItem("token");
    if (token) {
      const teacherData = JSON.parse(localStorage.getItem("teacher"));
      setTeacher(teacherData);
      setIsAuthenticated(true);
      setPage("dashboard");
    }
  }, []);

  // Fetch data based on current page
  useEffect(() => {
    console.log("Page changed:", page);
    if (isAuthenticated) {
      if (page === "dashboard") {
        fetchTodayClasses();
        fetchTodayAbsentees();
      } else if (page === "schedule") {
        fetchWeeklySchedule();
      } else if (page === "absences") {
        fetchPreviousAbsences();
      }
    }
  }, [page, isAuthenticated]);

  // Fetch students when class is selected
  useEffect(() => {
    console.log("Selected class changed:", selectedClass);
    if (selectedClass) {
      fetchStudents(selectedClass.class_id);
    }
  }, [selectedClass]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Attempting login...");
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
      console.error("Login error:", err);
      setMessage("Error logging in");
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
  };

  const fetchTodayClasses = async () => {
    try {
      console.log("Fetching today's classes...");
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
      console.error("Error fetching classes:", err);
      setMessage("Error fetching today's classes");
    }
  };

  const fetchTodayAbsentees = async () => {
    try {
      console.log("Fetching today's absences...");
      const res = await fetch(`${backendUrl}/api/attendance/today/absences`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("Absences data:", data);
      setAbsentStudents(data);
    } catch (err) {
      console.error("Error fetching absences:", err);
      setMessage("Error fetching today's absences");
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

  const fetchPreviousAbsences = async () => {
    try {
      const res = await fetch(
        `${backendUrl}/api/attendance/absences?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      setPreviousAbsences(data);
    } catch (err) {
      setMessage("Error fetching previous absences");
      console.error(err);
    }
  };

  const fetchStudents = async (classId) => {
    if (!selectedClass) return;

    try {
      console.log("Fetching students for class:", classId);
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
      console.error("Error fetching students:", err);
      setMessage("Error fetching students");
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

  const handleMarkPresent = async (attendanceId) => {
    try {
      const res = await fetch(`${backendUrl}/api/attendance/${attendanceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "Present" }),
      });

      if (res.ok) {
        setMessage("Attendance updated successfully");
        fetchPreviousAbsences();
      } else {
        const data = await res.json();
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Error updating attendance");
      console.error(err);
    }
  };

  console.log(
    "Rendering App, page:",
    page,
    "isAuthenticated:",
    isAuthenticated
  );

  return (
    <div className="app">
      {isAuthenticated ? (
        <>
          <Header
            page={page}
            setPage={setPage}
            teacher={teacher}
            handleLogout={handleLogout}
          />
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

            {page === "dashboard" && (
              <Dashboard
                today={today}
                todayClasses={todayClasses}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                completedClasses={completedClasses}
                absentStudents={absentStudents}
                students={students}
                attendanceRecords={attendanceRecords}
                handleAttendanceToggle={handleAttendanceToggle}
                handleSubmitAttendance={handleSubmitAttendance}
                isLoading={isLoading}
              />
            )}
            {page === "schedule" && (
              <Schedule weeklySchedule={weeklySchedule} />
            )}
            {page === "absences" && (
              <PreviousAbsences
                dateRange={dateRange}
                setDateRange={setDateRange}
                previousAbsences={previousAbsences}
                handleMarkPresent={handleMarkPresent}
              />
            )}
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
          <Login
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleLogin={handleLogin}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}

export default App;
