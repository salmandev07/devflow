import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import ProjectsPage from "../pages/dashboard/ProjectsPage";
import TeamsPage from "../pages/dashboard/TeamsPage";
import TasksPage from "../pages/dashboard/TasksPage";
import KanbanPage from "../pages/dashboard/KanbanPage";
import TeamWorkspacePage from "../pages/dashboard/TeamWorkspacePage";
import ProjectDetailsPage from "../pages/dashboard/ProjectDetailsPage";
import TaskDetailsPage from "../pages/dashboard/TaskDetailsPage";
import NotificationsPage from "../pages/dashboard/NotificationsPage";
import ReportsPage from "../pages/dashboard/ReportsPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/register"
          element={<RegisterPage />}
        />
        
        <Route
          path="/kanban"
          element={
            <ProtectedRoute>
              <KanbanPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />


        <Route
        path="/teams/:id"
        element={<TeamWorkspacePage />}
      />
      
      <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailsPage />
            </ProtectedRoute>
          }
        />
      
      <Route
        path="/tasks/:id"
        element={<TaskDetailsPage />}
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={<ReportsPage />}
      />

      </Routes>

      

      
    </BrowserRouter>
  );
}

export default AppRoutes;