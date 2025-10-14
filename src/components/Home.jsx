import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/home-pattern.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          maxWidth: '800px',
          width: '100%'
        }}
      >
        <h1>Food Delivery</h1>
        <p>
          <Link to="/register">Регистрация</Link> | <Link to="/login">Логин</Link>
        </p>
        <h2>Мы выбираем поваров, которые хороши в своём деле</h2>

        <h2 style={{ marginTop: "40px", marginBottom: "20px" }}>КАК РАБОТАЕТ СЕРВИС</h2>
        <div className="FeaturesSection">
          <div className="FeatureCard">
            <div className="IconWrapper">📝</div>
            <h4>ПРОХОДИ РЕГИСТРАЦИЮ</h4>
            <p>Зарегистрируйтесь и создайте свое персональное меню.</p>
          </div>

          <div className="FeatureCard">
            <div className="IconWrapper">🍲</div>
            <h4>СОЗДАВАЙ СВОЁ МЕНЮ</h4>
            <p>Создай блюдо в личном кабинете. Выбери дни, цену и фото.</p>
          </div>

          <div className="FeatureCard">
            <div className="IconWrapper">💰</div>
            <h4>ОТКЛИКАЙСЯ НА ЗАКАЗЫ</h4>
            <p>Клиенты делают заказ заранее, зарабатывай вместе с нами.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
