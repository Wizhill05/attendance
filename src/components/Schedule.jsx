import React from "react";

function Schedule({ weeklySchedule }) {
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
                          <div className="subject">{classSession.subject}</div>
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
}

export default Schedule;
