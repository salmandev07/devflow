# DevFlow – Full Stack Project Management Application

DevFlow is a modern full-stack project management platform designed for teams to collaborate, manage projects, track tasks, organize workflows, and improve productivity.

## Features

### Authentication & Authorization

* JWT Authentication
* User Registration & Login
* Protected Routes
* Role-Based Access

### Project Management

* Create, Update, Delete Projects
* Project Dashboard
* Project Progress Tracking

### Team Management

* Create Teams
* Add/Remove Team Members
* Team Workspace

### Task Management

* Create Tasks
* Assign Tasks to Team Members
* Priority Levels
* Status Tracking

### Kanban Board

* Drag-and-Drop Task Management
* Real-Time Status Updates

### Subtasks

* Create and Manage Subtasks
* Progress Tracking

### Collaboration

* Comments System
* Activity Feed
* Notifications
* File Attachments

### Analytics

* Task Status Charts
* Task Priority Reports
* Dashboard Metrics

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* React Router
* Recharts

### Backend

* Django
* Django REST Framework
* JWT Authentication

### Database

* PostgreSQL

### Tools

* Git
* GitHub
* VS Code

## Project Structure

```text
devflow/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── users/
│   ├── projects/
│   ├── teams/
│   ├── tasks/
│   ├── subtasks/
│   ├── comments/
│   ├── attachments/
│   ├── notifications/
│   ├── activities/
│   └── config/
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/salmandev07/devflow.git
cd devflow
```

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
DJANGO_SECRET_KEY=your-secret-key

DJANGO_DEBUG=True

DB_NAME=devflow_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Run migrations

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

## Screenshots

* Dashboard
* Projects
* Teams
* Tasks
* Kanban Board

## Future Improvements

* Real-time Notifications
* WebSockets
* Email Notifications
* Calendar Integration
* Docker Deployment

## Author

Salman Khan

GitHub: https://github.com/salmandev07

LinkedIn: https://www.linkedin.com/in/salman-khan-944186412

## License

This project is developed for educational and portfolio purposes.
