# Talent Flow

Talent Flow is a modern Learning Management System (LMS) scaffolded for the MERN stack with Docker support. It is designed to help organizations and educators manage courses, users, and learning content using a React frontend, Express.js backend, MongoDB database, and Node.js runtime.

## **Current Implementation Status: Sprint 1 & 2 Complete** 

### **Engineer C: Assignments & Progress Tracking** 
**Issue #4: Create Assignments API (Engineer C)** - **COMPLETED** 

#### **Sprint 1: Setup & Core APIs** 
- **Assignment Model**: Complete MongoDB schema with course linking
- **Assignment CRUD Endpoints**: Full REST API for assignment management
- **Course Linking**: Assignments properly linked to courses via ObjectId references
- **Docker Setup**: Complete containerized development environment

#### **Sprint 2: Progress Tracking**
- **Progress Model**: Comprehensive student progress tracking system
- **Status Workflow**: not_started -> in_progress -> submitted -> graded
- **Progress CRUD**: Full REST API for progress management
- **Time & Scoring**: Track time spent, completion percentage, scores, dates
- **Student Views**: Progress by student and by assignment endpoints

### **Implemented API Endpoints**

#### **Assignment Management**
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/course/:courseId` - Get assignments by course
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

#### **Progress Tracking**
- `GET /api/progress/student/:studentId` - Get all progress for a student
- `GET /api/progress/assignment/:assignmentId` - Get all progress for an assignment
- `GET /api/progress/student/:studentId/assignment/:assignmentId` - Get specific progress
- `POST /api/progress` - Create or update progress record
- `PUT /api/progress/:id` - Update progress record
- `DELETE /api/progress/:id` - Delete progress record

#### **Course Management** (Minimal - Required Dependency)
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID

### **Database Models**

#### **Assignment Model**
```javascript
{
  title: String (required),
  description: String (required),
  course: ObjectId (ref: 'Course'),
  dueDate: Date (required),
  status: ['draft', 'published', 'closed'],
  maxScore: Number (default: 100),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Progress Model**
```javascript
{
  student: ObjectId (ref: 'User'),
  assignment: ObjectId (ref: 'Assignment'),
  status: ['not_started', 'in_progress', 'submitted', 'graded'],
  score: Number,
  maxScore: Number,
  completionPercentage: Number (0-100),
  timeSpent: Number (minutes),
  startedAt: Date,
  submissionDate: Date,
  gradedDate: Date,
  feedback: String,
  lastAccessedAt: Date
}
```

#### **Course Model** (Minimal Implementation)
```javascript
{
  title: String (required),
  description: String (required),
  instructor: ObjectId (ref: 'User'),
  status: ['draft', 'published', 'archived'],
  createdAt: Date,
  updatedAt: Date
}
```

## **Testing Results**
- **Docker Environment**: All services running successfully
- **API Endpoints**: All CRUD operations tested and working
- **Database Integration**: MongoDB connection and data persistence confirmed
- **Workflow Validation**: Course -> Assignment -> Progress flow tested
- **Container Orchestration**: Docker Compose configuration validated

## **Development Environment**
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React (Basic setup)
- **Database**: MongoDB with Docker volumes
- **Containerization**: Docker + Docker Compose
- **API Testing**: All endpoints functional

## **Next Steps for Team**
- **Engineer A**: Authentication & User System (Issue #2)
- **Engineer B**: Courses API Enhancement (Issue #3)
- **Frontend Development**: React components for assignment and progress interfaces
- **Integration Testing**: Cross-engineer workflow testing

## 🧱 Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB
- Containerization: Docker & Docker Compose
- Authentication: JWT or session-based auth
- Styling: CSS / Tailwind / UI library (optional)

## 📁 Project Structure

- `Backend/` - API server, business logic, database models, authentication, and routes
- `Frontend/` - React application for the LMS user interface
- `docker-compose.yml` - Docker orchestration file
- `Dockerfile.backend` - Backend container configuration
- `Dockerfile.frontend` - Frontend container configuration

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Talent-Flow
   ```

2. Create environment files:
   ```bash
   cp Backend/.env.example Backend/.env
   cp Frontend/.env.example Frontend/.env
   ```

3. Start all services with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

5. Stop the services:
   ```bash
   docker-compose down
   ```

## ⚙️ Manual Setup (Without Docker)

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed locally
- npm or yarn

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Talent-Flow
   ```

2. Install backend dependencies:
   ```bash
   cd Backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../Frontend
   npm install
   ```

4. Create environment files
   - `Backend/.env`
   - `Frontend/.env`

   Example backend variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/talentflow
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

   Example frontend variables:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENV=development
   ```

5. Start MongoDB (if not running):
   ```bash
   mongod
   ```

6. Start the backend server:
   ```bash
   cd Backend
   npm run dev
   ```

7. Start the frontend app:
   ```bash
   cd ../Frontend
   npm start
   ```

## 🧩 Core Features

- **Authentication and Authorization** - User registration, login, and role-based access
- **Course Management** - Create, edit, and organize courses with lessons
- **Assignment System** - Create assignments, link to courses, manage submissions
- **User Roles** - Students, instructors, and administrators with different permissions
- **Student Dashboard** - Track progress, view enrolled courses and assignments
- **Instructor Tools** - Course creation, assignment management, student tracking
- **Admin Panel** - User management, system configuration
- **Search and Filtering** - Find courses and content easily

## � Docker Services

The Docker setup includes:
- **Frontend Container** - React app served with Nginx
- **Backend Container** - Node.js/Express API server
- **MongoDB Container** - Database with persistent volumes
- **Redis Container** - Session storage and caching (optional)

## 🔧 Development Workflow

### Using Docker (Recommended)
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Access containers
docker-compose exec backend bash
docker-compose exec frontend bash

# Rebuild after changes
docker-compose up --build
```

### Environment Configuration
- `Backend/.env.example` - Backend environment template
- `Frontend/.env.example` - Frontend environment template
- `docker-compose.yml` - Service orchestration

## 💡 Important Notes

- **Docker is recommended** for consistent development environment
- Environment files should be created from `.env.example` templates
- MongoDB data persists in Docker volumes
- Frontend runs on port 3000, Backend on port 5000
- Hot reload is enabled for development

## 📌 Assignment Implementation Focus

For the assignment model implementation:
1. Create Assignment schema in Backend/models/
2. Implement CRUD endpoints in Backend/routes/
3. Link assignments to courses via ObjectId references
4. Add validation for assignment data
5. Test endpoints using Docker environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker setup
5. Submit a pull request

This README provides a complete guide for setting up and developing the Talent Flow LMS with Docker support.
