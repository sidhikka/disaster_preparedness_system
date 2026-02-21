import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ModuleManagement from "./pages/admin/ModuleManagement";
import QuizManagement from "./pages/admin/QuizManagement";
import QuizQuestions from "./pages/admin/QuizQuestions";
import DrillManagement from "./pages/admin/DrillManagement";
import EmergencyContacts from "./pages/admin/EmergencyContacts";
import StudentReports from "./pages/admin/StudentReports";

import StudentDashboard from "./pages/student/StudentDashboard";
import LearningHub from "./pages/student/LearningHub";
import ModuleViewer from "./pages/student/ModuleViewer";
import QuizPage from "./pages/student/QuizPage";
import EmergencyInfo from "./pages/student/EmergencyInfo";
import Leaderboard from "./pages/student/Leaderboard"; // ✅ ADDED

const queryClient = new QueryClient();

function AuthRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Landing />;

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          No role assigned. Contact administrator.
        </p>
      </div>
    );
  }

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "student") return <Navigate to="/student" replace />;

  return <Landing />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors />

          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/auth" element={<Auth />} />

            {/* ================= ADMIN ROUTES ================= */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/modules"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ModuleManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/quizzes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <QuizManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/quizzes/:quizId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <QuizQuestions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/drills"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DrillManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/contacts"
              element={
                <ProtectedRoute requiredRole="admin">
                  <EmergencyContacts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="admin">
                  <StudentReports />
                </ProtectedRoute>
              }
            />

            {/* ================= STUDENT ROUTES ================= */}

            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/modules"
              element={
                <ProtectedRoute requiredRole="student">
                  <LearningHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/modules/:moduleId"
              element={
                <ProtectedRoute requiredRole="student">
                  <ModuleViewer />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/quiz/:quizId"
              element={
                <ProtectedRoute requiredRole="student">
                  <QuizPage />
                </ProtectedRoute>
              }
            />

            {/* ✅ NEW LEADERBOARD ROUTE */}
            <Route
              path="/student/leaderboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/emergency"
              element={
                <ProtectedRoute requiredRole="student">
                  <EmergencyInfo />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;