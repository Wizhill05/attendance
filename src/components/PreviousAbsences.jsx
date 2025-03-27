import React from "react";

function PreviousAbsences({
  dateRange,
  setDateRange,
  previousAbsences,
  handleMarkPresent,
}) {
  return (
    <div className="previous-absences">
      <div className="previous-absences-header">
        <h2>Previous Absences</h2>
        <div className="date-range">
          <input
            type="date"
            className="date-input"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
          <span>to</span>
          <input
            type="date"
            className="date-input"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="absences-list">
        {previousAbsences.length === 0 ? (
          <p className="empty-message">
            No absences found for the selected date range
          </p>
        ) : (
          previousAbsences.map((absence) => (
            <div
              key={absence.attendance_id}
              className={`absence-item ${
                absence.status === "Present" ? "updated" : ""
              }`}
            >
              <div className="absence-info">
                <div className="absence-date">
                  {new Date(absence.date).toLocaleDateString()}
                </div>
                <div className="absence-student">
                  {absence.first_name} {absence.last_name}
                </div>
                <div className="absence-class">
                  {absence.class_name} - Period {absence.period_number}
                </div>
              </div>
              {absence.status === "Absent" && (
                <div className="absence-actions">
                  <button
                    className="mark-present-btn"
                    onClick={() => handleMarkPresent(absence.attendance_id)}
                  >
                    Mark Present
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PreviousAbsences;
