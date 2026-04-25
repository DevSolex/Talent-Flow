# Talent Flow LMS

A centralized Learning Management System (LMS) for interns, mentors, and administrators at TrueMinds Innovation.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Containerization**: Docker, Docker Compose
- **Frontend**: React (CRA), React Router v6, Axios (served via Nginx)

## User Roles

| Role | Capabilities |
|------|-------------|
| Intern | Enroll in courses, submit assignments with answers, track progress |
| Mentor | Apply for account (admin approval required), create courses (admin approval required), create/grade assignments |
| Admin | Full access — manage users, approve/reject mentors & courses, delete resources |

## Approval Flows

### Mentor Registration
1. Mentor registers → account set to `pending`
2. Admin receives inbox notification
3. Admin approves → mentor can log in; or rejects → account deleted
4. Mentor receives inbox notification of outcome

### Course Creation
1. Mentor creates course → course set to `pending`
2. Admin receives inbox notification
3. Admin approves → course goes live; or rejects → course deleted
4. Mentor receives inbox notification of outcome

> Admins bypass approval — their courses publish immediately.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://talent-flow-frontend.onrender.com |
| Backend API | https://talent-flow-pfub.onrender.com |
| MongoDB | MongoDB Atlas |

## Running Locally

```bash
# Create .env from example
cp .env.example .env
# Edit .env and set JWT_SECRET and CORS_ORIGIN

docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017/talentflow |

## Project Structure

```
Talent-Flow/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # auth, user, course, enrollment, assignment, progress
│   │   ├── middleware/      # auth.middleware.js (verifyToken, verifyRole)
│   │   ├── models/          # User, Role, Course, Module, Enrollment, Assignment, Progress, Notification
│   │   ├── routes/          # auth, users, courses, enrollments, assignments, progress, notifications
│   │   ├── utils/           # swagger (dev only)
│   │   └── server.js
│   └── Technical.md
├── Frontend/
│   ├── src/
│   │   ├── context/         # AuthContext (JWT state, login/logout, unread count)
│   │   ├── services/        # api.js (axios instance + all API calls)
│   │   ├── components/      # ProtectedRoute, BottomNav (with unread badge)
│   │   └── pages/           # Login, Register, Dashboards, Courses, CourseDetail, Profile, Inbox
│   ├── nginx.conf
│   └── package.json
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
└── .env.example
```

## Frontend Pages

| Page | Route | Access |
|------|-------|--------|
| Login | /login | Public |
| Register | /register | Public |
| Intern Dashboard | /dashboard | Intern |
| Mentor Dashboard | /mentor | Mentor, Admin |
| Admin Dashboard | /admin | Admin |
| Course Catalog | /courses | Authenticated |
| Course Detail | /courses/:id | Authenticated |
| Inbox | /inbox | Authenticated |
| Profile | /profile | Authenticated |

## API Overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/users/profile | Authenticated |
| GET | /api/users | Admin |
| DELETE | /api/users/:id | Admin |
| GET | /api/courses | Public (published only) |
| GET | /api/courses?all=true | Mentor, Admin |
| POST | /api/courses | Mentor, Admin |
| PUT | /api/courses/:id | Mentor, Admin |
| DELETE | /api/courses/:id | Admin |
| POST | /api/enrollments | Authenticated |
| GET | /api/enrollments/:userId | Authenticated |
| GET | /api/enrollments | Admin |
| POST | /api/assignments | Mentor, Admin |
| GET | /api/assignments/course/:courseId | Authenticated |
| POST | /api/assignments/:id/submit | Intern (requires answer) |
| POST | /api/assignments/:id/grade | Mentor, Admin |
| GET | /api/progress/student/:studentId | Authenticated |
| GET | /api/notifications | Authenticated |
| PUT | /api/notifications/:id/read | Authenticated |
| POST | /api/notifications/approve/:userId | Admin |
| POST | /api/notifications/reject/:userId | Admin |
| POST | /api/notifications/approve-course/:courseId | Admin |
| POST | /api/notifications/reject-course/:courseId | Admin |

## Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/talentflow
JWT_SECRET=your_strong_secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend `.env`
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### Root `.env` (for Docker Compose)
```env
JWT_SECRET=your_strong_secret
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

## Features

- [x] Authentication (register, login, JWT, RBAC)
- [x] Mentor account approval flow
- [x] Course management with admin approval flow
- [x] Enrollment system
- [x] Assignment creation with answer submission
- [x] Assignment grading with feedback
- [x] Progress tracking
- [x] Inbox with real-time unread badge
- [x] Admin dashboard (user management, course control, enrollment overview)
- [x] Dockerized (backend + frontend + MongoDB)
- [x] Deployed on Render + MongoDB Atlas
- [x] Protected routes with role-based access control
