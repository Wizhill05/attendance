# Gym Management System

A comprehensive web application for managing gym operations, including member registration, membership management, and attendance tracking.

## Features

- **Dashboard**: View key metrics and statistics about gym operations
- **Member Management**: Register new members and view member information
- **Membership Management**: Create and manage memberships with different types and payment statuses
- **Attendance Tracking**: Record and monitor member check-ins

## Database Schema - ER Diagram

![image](https://github.com/user-attachments/assets/4558403d-747e-4807-a0d3-a82771e8bf34)


## Technology Stack

- **Frontend**: React, Chart.js
- **Backend**: Express.js
- **Database**: SQLite

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd server && npm install
   ```
3. Start the development server:
   ```
   npm run dev:all
   ```
4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Members

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Trainers

- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get trainer by ID
- `POST /api/trainers` - Create new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

### Memberships

- `GET /api/memberships` - Get all memberships
- `GET /api/memberships/:id` - Get membership by ID
- `GET /api/members/:id/membership` - Get membership by member ID
- `POST /api/memberships` - Create new membership
- `PUT /api/memberships/:id` - Update membership
- `DELETE /api/memberships/:id` - Delete membership

### Attendance

- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/today` - Get today's attendance records
- `GET /api/members/:id/attendance` - Get attendance records for a specific member
- `POST /api/attendance` - Record attendance (check-in)

### Statistics

- `GET /api/stats/memberships` - Get membership statistics
- `GET /api/stats/membership-types` - Get membership types distribution
- `GET /api/stats/attendance` - Get attendance statistics
- `GET /api/stats/expiring-memberships` - Get members with expiring memberships
