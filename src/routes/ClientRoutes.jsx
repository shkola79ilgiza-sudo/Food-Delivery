/**
 * Маршруты для клиентов
 */

import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

// Ленивая загрузка компонентов
const ClientMenu = lazy(() => import("../components/ClientMenu"));
const Cart = lazy(() => import("../components/Cart"));
const RealCheckout = lazy(() => import("../components/RealCheckout"));
const OrderConfirmation = lazy(() => import("../components/OrderConfirmation"));
const ClientOrders = lazy(() => import("../components/ClientOrders"));
const ClientChat = lazy(() => import("../components/ClientChat"));
const ClientProfile = lazy(() => import("../components/ClientProfile"));
const DishPassport = lazy(() => import("../components/DishPassport"));
const FarmersMarket = lazy(() => import("../components/FarmersMarket"));
const AICoach = lazy(() => import("../components/AICoach"));

export default function ClientRoutes() {
  return (
    <Routes>
      <Route path="/menu" element={<ClientMenu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<RealCheckout />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/orders" element={<ClientOrders />} />
      <Route path="/chat" element={<ClientChat />} />
      <Route path="/profile" element={<ClientProfile />} />
      <Route path="/dish/:id" element={<DishPassport />} />
      <Route path="/farmers-market" element={<FarmersMarket />} />
      <Route path="/ai-coach" element={<AICoach />} />
    </Routes>
  );
}

