import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import ChefMenu from "./components/ChefMenu";
import ClientLogin from "./components/ClientLogin";
import ClientRegister from "./components/ClientRegister";
import ClientMenu from "./components/ClientMenu";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import ClientOrders from "./components/ClientOrders";
import ClientProfile from "./components/ClientProfile";
import AdminLogin from "./components/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminOrders from "./components/AdminOrders";
import AdminChefs from "./components/AdminChefs";
import AdminFinance from "./components/AdminFinance";
import AdminSettings from "./components/AdminSettings";
import AdminOrderDetails from "./components/AdminOrderDetails";
import DishPassport from "./components/DishPassport";
import FarmersMarket from "./components/FarmersMarket";
import AICoach from "./components/AICoach";
import AIChefAssistant from "./components/AIChefAssistant";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./contexts/ToastContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import IconShowcase from "./components/IconShowcase";

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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <WebSocketProvider>
              <Router>
                <div className="AppWrapper">
                  {/* Навигация */}
                  <Navigation />

        {/* Маршрутизация */}
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Поварские маршруты */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chef" element={<ChefRedirect />} />
          <Route
            path="/chef/:chefId/menu"
            element={
              <ProtectedRoute>
                <ChefMenu />
              </ProtectedRoute>
            }
          />
          
          {/* Клиентские маршруты */}
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client" element={<ClientRedirect />} />
          <Route
            path="/client/menu"
            element={
              <ProtectedRoute>
                <ClientMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/farmers-market"
            element={
              <ProtectedRoute>
                <FarmersMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/order-confirmation"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/orders"
            element={
              <ProtectedRoute>
                <ClientOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute>
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dish/:chefId/:dishId/passport"
            element={<DishPassport />}
          />
          <Route
            path="/client/ai-coach"
            element={
              <ProtectedRoute>
                <AICoach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef/ai-assistant"
            element={
              <ProtectedRoute>
                <AIChefAssistant />
              </ProtectedRoute>
            }
          />
          
          {/* Демонстрация иконок */}
          <Route path="/icons" element={<IconShowcase />} />
          
          {/* Админские маршруты */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chefs"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminChefs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminOrderDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminFinance />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
                </div>
              </Router>
            </WebSocketProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function ChefRedirect() {
  const token = localStorage.getItem("authToken");
  const chefId = localStorage.getItem("chefId");
  if (!token) return <Navigate to="/login" replace />;
  const target = chefId ? `/chef/${encodeURIComponent(chefId)}/menu` : "/login";
  return <Navigate to={target} replace />;
}

function ClientRedirect() {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  if (!token || role !== "client") return <Navigate to="/client/login" replace />;
  return <Navigate to="/client/menu" replace />;
}

export default App;
