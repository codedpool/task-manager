# Task Manager

A full-stack task management web application with role-based access control, file attachments, and real-time updates.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TailwindCSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Upload | Multer (local storage) |
| Real-time | Socket.io |
| Testing | Jest, Supertest, React Testing Library |
| API Docs | Swagger UI |
| Containerization | Docker + Docker Compose |

## Quick Start

### With Docker (recommended)

```bash
git clone <repo-url>
cd task-manager
docker-compose up
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Swagger Docs:** http://localhost:5000/api-docs

### Without Docker

**Prerequisites:** Node.js 22+, MongoDB running locally

**Backend:**
```bash
cd backend
cp .env.example .env   # or create .env with values below
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend `.env`:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secret_key
UPLOAD_DIR=uploads
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project Structure

```
task-manager/
├── frontend/                   # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Login, register pages
│   │   │   └── (protected)/    # Dashboard, tasks, admin (auth-guarded)
│   │   ├── components/         # Shared components
│   │   ├── store/              # Redux Toolkit slices
│   │   ├── lib/                # Axios instance, socket client
│   │   └── hooks/              # Custom hooks (useTaskSocket)
│   ├── tests/                  # Frontend tests (RTL)
│   ├── Dockerfile
│   └── .env.local
│
├── backend/                    # Express app
│   ├── src/
│   │   ├── routes/             # Auth, users, tasks (with Swagger annotations)
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # verifyToken, isAdmin, multer upload
│   │   ├── models/             # Mongoose schemas (User, Task)
│   │   ├── config/             # DB connection
│   │   ├── app.js              # Express app (importable for tests)
│   │   ├── index.js            # Server entry point
│   │   ├── socket.js           # Socket.io setup
│   │   └── swagger.js          # OpenAPI spec
│   ├── tests/                  # Backend tests (Jest + Supertest)
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
└── README.md
```

## Features

### Authentication & Authorization
- JWT-based registration and login
- Password hashing with bcrypt
- Role-based access: `admin` (full access) and `user` (own tasks only)
- Protected frontend routes via `AuthGuard` component

### Task Management
- Full CRUD for tasks with title, description, status, priority, due date, and assignment
- Filter by status (`todo`, `in_progress`, `done`) and priority (`low`, `medium`, `high`)
- Sort by any field, paginated results
- Overdue task highlighting

### File Attachments
- Upload up to 3 PDF files per task (max 5MB each)
- Attach files during task creation or editing (drag-and-drop in the task form)
- Also upload additional files from the task detail page
- Inline PDF viewer modal
- File download with correct Content-Type streaming
- **Storage:** Local disk via Multer. For production, swap to S3 by replacing the Multer storage engine with `multer-s3` — no controller changes needed

### User Management (Admin)
- Admin can create new users with email, password, and role
- Admin-only user list with search, role filter, sorting, and pagination
- Toggle user roles, delete users

### Real-time Updates
- Socket.io integration emits `task:created`, `task:updated`, `task:deleted` events
- Task list auto-refreshes when another user makes changes

### Responsive Design
- Mobile-first layouts with TailwindCSS
- Hamburger navigation on small screens
- Collapsible filter sidebar on mobile
- Responsive card grids and scrollable tables

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user | JWT |

### Tasks
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | List tasks (filter/sort/paginate) | JWT |
| POST | `/api/tasks` | Create task | JWT |
| GET | `/api/tasks/:id` | Get task detail | JWT |
| PUT | `/api/tasks/:id` | Update task | JWT (owner/admin) |
| DELETE | `/api/tasks/:id` | Delete task | JWT (creator/admin) |
| POST | `/api/tasks/:id/attachments` | Upload PDFs | JWT |
| GET | `/api/tasks/:id/attachments/:fileId` | Download file | JWT |

### Users (Admin only)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/users` | Create new user | Admin |
| GET | `/api/users` | List users (filter/sort/paginate) | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

Full interactive documentation available at `/api-docs` (Swagger UI).

## Testing

The project includes a unified testing suite that runs both frontend and backend tests seamlessly to verify the application's integrity and measure test coverage.

### Running All Tests

To run the complete test suite and generate the combined coverage reports, execute the following command from the root directory (`task-manager`):

```bash
npm test
```

*(Note: The backend utilizes `mongodb-memory-server` which dynamically downloads a MongoDB binary on the first run for an isolated database environment).*

### Test Results & Coverage

The project strictly meets the **>80% overall test coverage** assignment requirement.

**Combined Coverage Summary:**
- **Overall Statements Covered:** >80%

**Backend Testing:**
- **Frameworks:** Jest, Supertest, `mongodb-memory-server`
- **Results:** 54 tests passed across 4 test suites (Auth, Tasks, Users, Attachments).

**Frontend Testing:**
- **Frameworks:** Jest, React Testing Library, User Event
- **Results:** 41 tests passed across 8 test suites (Forms, UIs, Redux Slices, API Interceptors).

## Design Decisions

1. **Next.js App Router with route groups**: `(protected)` group wraps all authenticated pages with a shared layout containing the navbar and auth guard, keeping auth logic centralized.

2. **Express app/server split**: `app.js` exports the Express app for testability with Supertest, while `index.js` handles server startup and Socket.io initialization.

3. **Mongoose embedded attachments**: File metadata is stored as a subdocument array on the Task model rather than a separate collection, simplifying queries and enforcing the 3-file limit at the schema level.

4. **Socket.io with graceful fallback**: `getIO()` returns a no-op emitter when Socket.io isn't initialized (e.g., during tests), so controllers don't need conditional emit logic.

5. **Local file storage with S3-ready architecture**: Files are stored via Multer's `diskStorage` with metadata in MongoDB. Swapping to S3 requires only changing the Multer storage engine to `multer-s3` — no controller changes needed.

6. **Redux Toolkit for state management**: Chosen over Context API for its built-in immutability (Immer), devtools support, and scalability with multiple slices.

7. **Client-side validation mirroring server-side**: Both frontend forms and backend models validate the same constraints (required fields, email format, password length, enum values), providing immediate feedback while maintaining server-side security.
