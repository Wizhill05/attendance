# Student Attendance Management System

A modern web application for managing student attendance in educational institutions. Built with React for the frontend and Express.js for the backend, using SQLite as the database.

## Features

- **Teacher Authentication**: Secure login system for teachers
- **Real-time Dashboard**: View today's classes and attendance status
- **Attendance Marking**: Easy-to-use interface for marking student attendance
- **Weekly Schedule**: View complete weekly class schedule
- **Previous Absences**: Track and manage historical attendance records
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**:

  - React
  - Vite
  - Modern CSS with Flexbox and Grid
  - Responsive Design

- **Backend**:
  - Node.js
  - Express.js
  - SQLite3
  - JWT Authentication
  - bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/student-attendance-system.git
   cd student-attendance-system
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   npm run setup
   ```

3. Start the development server:
   ```bash
   npm run dev:all
   ```

The application will be available at `http://localhost:5173`, and the backend API will run on `http://localhost:5000`.

## Project Structure

```
student-attendance-system/
├── src/                    # Frontend source files
│   ├── components/         # React components
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   └── main.jsx           # Entry point
├── server/                 # Backend source files
│   ├── db.js              # Database configuration
│   └── index.js           # Express server setup
├── public/                 # Static files
└── package.json           # Project configuration
```

## Database Schema

The system uses the following main tables:

- `teacher`: Stores teacher information and credentials
- `class`: Contains class details
- `student`: Stores student information
- `schedule`: Manages class schedules
- `attendance`: Records attendance data

## Available Scripts

- `npm run dev`: Start frontend development server
- `npm run server`: Start backend server
- `npm run dev:all`: Start both frontend and backend
- `npm run build`: Build frontend for production
- `npm run setup`: Install all dependencies

## Test Accounts

Use these credentials to test the system (all use password: password123):

| Subject          | Email                    |
| ---------------- | ------------------------ |
| Mathematics      | john.smith@school.com    |
| Science          | sarah.johnson@school.com |
| English          | michael.brown@school.com |
| History          | emily.davis@school.com   |
| Computer Science | david.wilson@school.com  |

## Features in Detail

### Dashboard

- View today's classes
- Real-time attendance status
- Quick access to mark attendance
- List of absent students

### Attendance Marking

- Class-wise student list
- Present/Absent toggle
- Bulk attendance submission
- Visual confirmation

### Weekly Schedule

- Complete weekly timetable
- Period-wise class details
- Subject and timing information

### Previous Absences

- Date range filtering
- Detailed absence records
- Ability to update past records
- Status tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the amazing frontend library
- Express.js team for the robust backend framework
- SQLite team for the reliable database engine
