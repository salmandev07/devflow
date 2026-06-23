# DevFlow

A full-stack project management and team collaboration platform built with Django REST Framework and React. Features role-based permissions, real-time notifications, task tracking with time sessions, and production-ready Docker deployment.

## Features

### Project Management
- Create and manage projects with owner-based permissions
- Assign teams to projects with granular access control
- Project dashboard with task statistics and completion tracking
- Project-scoped reports with CSV and PDF export

### Team Collaboration
- Create teams and assign members with roles (lead, developer, designer, etc.)
- Project-scoped and standalone teams
- Team workspace with member management
- Transfer team ownership

### Task Management
- Full CRUD with priority levels (low, medium, high) and statuses (todo, progress, done)
- Task assignment with field-level permission enforcement
- Inline status updates for assigned users
- Subtask tracking
- Due dates with overdue detection
- Estimated hours tracking

### Time Tracking
- Start/stop timer sessions per task
- Session history with duration logging
- Per-user time tracking

### Notifications
- Real-time unread count with polling
- Notification types: task assigned, completed, status changed, member added/removed, comments
- Mark as read / mark all as read
- Notification filtering

### Authentication & Security
- JWT-based authentication (access + refresh tokens)
- Email verification with OTP
- Forgot password with OTP reset
- Password change for authenticated users
- Role-based permission enforcement at the API level

### Activity Feed
- Automatic activity logging for project, team, and task events
- Chronological activity feed per project

### Comments & Attachments
- Threaded comments on tasks
- File attachments with download support

### Reporting
- Project-level task analytics
- Completion rates, status distribution, estimated hours
- CSV and PDF export

### UI/UX
- Dark/light theme toggle
- Responsive design
- Sidebar navigation
- Dashboard with metrics, charts, and upcoming tasks
- Kanban-style task board
- Settings page for profile management

## Tech Stack

### Backend
- **Python 3.14** + **Django 5.x** + **Django REST Framework**
- **PostgreSQL 17** database
- **SimpleJWT** for authentication
- **Gunicorn** for production WSGI server
- Activity logging, notifications, comments, attachments apps

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Router** for client-side routing
- **Axios** for HTTP requests
- **jsPDF** for PDF export
- **Recharts** for dashboard charts
- **Lucide React** for icons

### Infrastructure
- **Docker** + **Docker Compose** (production + development)
- **Nginx** reverse proxy
- Multi-stage frontend build for optimized production images

## Docker Setup

### Production

```bash
# Clone the repository
git clone https://github.com/salmandev07/devflow.git
cd devflow

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Create superuser (first time only)
docker exec -it devflow-backend-prod python manage.py createsuperuser

# Run migrations (first time only)
docker exec -it devflow-backend-prod python manage.py migrate
```

The application will be available at `http://localhost`.

### Development

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Superuser |
| salman | Salman123 | Project Owner |
| davis | davis123 | Team Member |

## API Overview

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/login/` | POST | Login (returns JWT tokens) |
| `/api/auth/refresh/` | POST | Refresh access token |
| `/api/auth/forgot-password/` | POST | Request password reset OTP |
| `/api/auth/verify-email/` | POST | Verify email with OTP |
| `/api/auth/reset-password/` | POST | Reset password with OTP |

### Projects
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/` | GET/POST | List/Create projects |
| `/api/projects/{id}/` | GET/PATCH/DELETE | Project detail (owner can edit/delete) |
| `/api/projects/{id}/teams/` | GET | List teams in project |
| `/api/projects/{id}/teams/create/` | POST | Create team in project (owner only) |
| `/api/projects/{id}/assign-team/` | POST | Assign existing team (owner only) |
| `/api/projects/{id}/unassign-team/` | POST | Remove team from project (owner only) |
| `/api/projects/{id}/report/` | GET | Project statistics report |

### Teams
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams/` | GET/POST | List/Create teams |
| `/api/teams/{id}/` | GET/PATCH/DELETE | Team detail |
| `/api/teams/{id}/members/` | GET/POST | List/Add team members |
| `/api/teams/memberships/{id}/` | PATCH/DELETE | Update/Remove member |
| `/api/teams/{id}/transfer-ownership/` | POST | Transfer team ownership |

### Tasks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/` | GET/POST | List/Create tasks (owner only for create) |
| `/api/tasks/{id}/` | GET/PATCH/DELETE | Task detail |
| `/api/tasks/{id}/timer/start/` | POST | Start timer session |
| `/api/tasks/{id}/timer/stop/` | POST | Stop timer session |
| `/api/tasks/{id}/timer/status/` | GET | Check timer status |
| `/api/tasks/{id}/sessions/` | GET | List time sessions |

### Notifications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/` | GET | List notifications |
| `/api/notifications/unread-count/` | GET | Get unread count |
| `/api/notifications/mark-all-read/` | POST | Mark all as read |
| `/api/notifications/{id}/` | PATCH | Mark single as read |

### Permissions

| Action | Owner | Member |
|--------|-------|--------|
| Create/Edit/Delete project | Yes | No |
| Create/Assign/Delete tasks | Yes | No |
| Assign/Remove teams | Yes | No |
| Add/Remove team members | Yes | No |
| View project details | Yes | Yes |
| Update task status (own tasks) | Yes | Yes |
| View notifications | Yes | Yes |

## Project Structure

```
devflow/
├── backend/
│   ├── config/          # Django settings, URLs, WSGI
│   ├── projects/        # Project and ProjectTeam models
│   ├── teams/           # Team and TeamMembership models
│   ├── tasks/           # Task and TimeSession models
│   ├── users/           # User profiles, OTP, verification
│   ├── notifications/   # Notification system
│   ├── activities/      # Activity logging
│   ├── comments/        # Task comments
│   ├── attachments/     # File attachments
│   ├── subtasks/        # Subtask tracking
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── package.json
├── nginx/               # Nginx configuration
├── docker-compose.prod.yml
└── docker-compose.yml
```

## License

MIT
