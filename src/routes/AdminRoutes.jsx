/**
 * Маршруты для администраторов
 */

import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

// Ленивая загрузка компонентов
const AdminLayout = lazy(() => import("../components/AdminLayout"));
const AdminDashboard = lazy(() => import("../components/AdminDashboard"));
const AdminUsers = lazy(() => import("../components/AdminUsers"));
const AdminOrders = lazy(() => import("../components/AdminOrders"));
const AdminChefs = lazy(() => import("../components/AdminChefs"));
const AdminFinance = lazy(() => import("../components/AdminFinance"));
const AdminSettings = lazy(() => import("../components/AdminSettings"));
const AdminOrderDetails = lazy(() => import("../components/AdminOrderDetails"));

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/orders" element={<AdminOrders />} />
        <Route path="/orders/:id" element={<AdminOrderDetails />} />
        <Route path="/chefs" element={<AdminChefs />} />
        <Route path="/finance" element={<AdminFinance />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  );
}

