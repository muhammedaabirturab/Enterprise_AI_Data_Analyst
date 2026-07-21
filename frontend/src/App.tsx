import { Navigate, Route, Routes } from "react-router-dom";

import ChatWidget from "./components/chat/ChatWidget";
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DatasetProvider } from "./context/DatasetContext";
import { ThemeProvider } from "./context/ThemeContext";
import AIInsights from "./pages/AIInsights";
import Charts from "./pages/Charts";
import Cleaning from "./pages/Cleaning";
import DataPreview from "./pages/DataPreview";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Login from "./pages/Login";
import MachineLearning from "./pages/MachineLearning";
import Profiling from "./pages/Profiling";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Upload from "./pages/Upload";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

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
        <Route path="/preview" element={<DataPreview />} />
        <Route path="/profiling" element={<Profiling />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/ml" element={<MachineLearning />} />
        <Route path="/insights" element={<AIInsights />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DatasetProvider>
          <AppRoutes />
          <ChatWidget />
        </DatasetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
