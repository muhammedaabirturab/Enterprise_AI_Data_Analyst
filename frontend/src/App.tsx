import { Navigate, Route, Routes } from "react-router-dom";

import ChatWidget from "./components/chat/ChatWidget";
import DashboardLayout from "./components/layout/DashboardLayout";
import NetworkStatusListener from "./components/ui/NetworkStatusListener";
import Toaster from "./components/ui/Toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { DatasetProvider } from "./context/DatasetContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import Workspace from "./pages/Workspace";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Legacy standalone-page routes now live as anchored sections inside /workspace.
const LEGACY_WORKSPACE_REDIRECTS = ["/preview", "/profiling", "/cleaning", "/charts", "/ml", "/insights", "/reports"];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ExecutiveDashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/settings" element={<Settings />} />
        {LEGACY_WORKSPACE_REDIRECTS.map((path) => (
          <Route key={path} path={path} element={<Workspace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <DatasetProvider>
              <ChatProvider>
                <AppRoutes />
                <ChatWidget />
                <Toaster />
                <NetworkStatusListener />
              </ChatProvider>
            </DatasetProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
