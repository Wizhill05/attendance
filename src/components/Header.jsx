import React from "react";

function Header({ page, setPage, teacher, handleLogout }) {
  return (
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
        <button
          className={`nav-btn ${page === "absences" ? "active" : ""}`}
          onClick={() => setPage("absences")}
        >
          Previous Absences
        </button>
      </div>
      <div className="teacher-info">
        <span>
          Welcome, {teacher?.firstName} {teacher?.lastName}
        </span>
        <button className="nav-btn logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
