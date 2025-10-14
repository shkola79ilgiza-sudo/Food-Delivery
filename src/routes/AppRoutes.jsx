/**
 * Основные маршруты приложения
 * Разделены на модули для лучшей организации
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Компоненты загрузки
import LoadingSpinner from "../components/LoadingSpinner";

// Ленивая загрузка компонентов (Code Splitting)
const Home = lazy(() => import("../components/Home"));
const Login = lazy(() => import("../components/Login"));
const Register = lazy(() => import("../components/Register"));
const ClientRoutes = lazy(() => import("./ClientRoutes"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const ChefRoutes = lazy(() => import("./ChefRoutes"));

// Защищенный маршрут
function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  const isAuthenticated = Boolean(token);
  
  if (!isAuthenticated) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}

// Основные маршруты
export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Маршруты клиента */}
        <Route
          path="/client/*"
          element={
            <ProtectedRoute>
              <ClientRoutes />
            </ProtectedRoute>
          }
        />
        
        {/* Маршруты повара */}
        <Route
          path="/chef/*"
          element={
            <ProtectedRoute>
              <ChefRoutes />
            </ProtectedRoute>
          }
        />
        
        {/* Маршруты администратора */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export { ProtectedRoute };

