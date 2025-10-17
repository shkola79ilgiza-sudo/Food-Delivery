import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import homePattern from "../assets/home-pattern.png";
import "../App.css";

function Home() {
  return (
    <div 
      className="home-container"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 215, 0, 0.7), rgba(255, 215, 0, 0.7)), url(${homePattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#FFD700',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      {/* Навигация */}
      <Navigation />

      {/* Основной контент */}
      <div className="home-content">
        <h1 className="home-title">Food Delivery</h1>
        <div className="home-links">
          <Link to="/register">Регистрация</Link>
          <span>|</span>
          <Link to="/login">Логин</Link>
        </div>
        <p className="home-tagline">Мы выбираем поваров, которые хороши в своём деле</p>
        
        <h2 className="how-it-works-title">КАК РАБОТАЕТ СЕРВИС</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>ПРОХОДИ РЕГИСТРАЦИЮ</h3>
            <p>Получите разрешение на приготовление пищи, зарегистрируйтесь и создайте свое персональное меню.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👨‍🍳</div>
            <h3>СОЗДАВАЙ СВОЁ МЕНЮ</h3>
            <p>Создай блюдо в личном кабинете. Выбери дни, цену и прикрепи качественную фотографию.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>ОТКЛИКАЙСЯ НА ЗАКАЗЫ</h3>
            <p>Клиенты делают заказ как минимум за день, зарабатывай вместе с нами.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
