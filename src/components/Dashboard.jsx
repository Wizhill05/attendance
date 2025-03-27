import React from "react";

function Dashboard({
  today,
  todayClasses,
  selectedClass,
  setSelectedClass,
  completedClasses,
  absentStudents,
  students,
  attendanceRecords,
  handleAttendanceToggle,
  handleSubmitAttendance,
  isLoading,
}) {
  const renderAttendanceSection = () => (
    <div className="attendance-section">
      <div className="attendance-header">
        <h3>
          {selectedClass.class_name} - Period {selectedClass.period_number}
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
              <span className="roll-number">#{student.roll_number}</span>
              <span className="student-name">
                {student.first_name} {student.last_name}
              </span>
            </div>
            <label className="attendance-toggle">
              <input
                type="checkbox"
                checked={attendanceRecords[student.student_id] === "Present"}
                onChange={() => handleAttendanceToggle(student.student_id)}
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
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Today's Classes ({today})</h2>
      </div>
      <div className="dashboard-content">
        <div className="classes-section">
          {selectedClass ? (
            renderAttendanceSection()
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
      </div>
    </div>
  );
}

export default Dashboard;
