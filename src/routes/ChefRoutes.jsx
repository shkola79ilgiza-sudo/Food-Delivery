/**
 * Маршруты для поваров
 */

import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

// Ленивая загрузка компонентов
const ChefMenu = lazy(() => import("../components/ChefMenu"));
const ChefOrders = lazy(() => import("../components/ChefOrders"));
const ChefProfile = lazy(() => import("../components/ChefProfile"));
const ChefChat = lazy(() => import("../components/ChefChat"));
const AIChefAssistant = lazy(() => import("../components/AIChefAssistant"));

export default function ChefRoutes() {
  return (
    <Routes>
      <Route path="/menu" element={<ChefMenu />} />
      <Route path="/orders" element={<ChefOrders />} />
      <Route path="/profile" element={<ChefProfile />} />
      <Route path="/chat" element={<ChefChat />} />
      <Route path="/ai-assistant" element={<AIChefAssistant />} />
    </Routes>
  );
}

