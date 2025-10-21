import React from "react";
import { useNavigate } from "react-router-dom";
import { setNavigateFunction } from "../utils/navigation";

/**
 * Компонент для установки функции навигации в глобальную утилиту
 * Используется в App.js для обеспечения навигации в API файлах
 */
const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);

  return children;
};

export default NavigationProvider;
