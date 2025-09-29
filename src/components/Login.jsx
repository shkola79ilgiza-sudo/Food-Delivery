import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import { login as apiLogin, getProfile } from "../api";
import { useLanguage } from "../contexts/LanguageContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Демо-логин для тестирования без бэкенда
    const savedEmail = localStorage.getItem("chefEmail");
    const savedPassword = localStorage.getItem("chefPassword");
    
    if (email === savedEmail && password === savedPassword) {
      // Создаем демо-токен и профиль
      const demoToken = `demo-token-${Date.now()}`;
      const demoChefId = email;
      const demoRole = "chef";
      
      localStorage.setItem("authToken", demoToken);
      localStorage.setItem("chefId", demoChefId);
      localStorage.setItem("role", demoRole);
      
      navigate(`/chef/${encodeURIComponent(demoChefId)}/menu`);
      return;
    }
    
    // Реальный API логин (если есть бэкенд)
    try {
      const res = await apiLogin(email, password);
      const accessToken = res?.accessToken || res?.token || res?.data?.accessToken;
      if (!accessToken) throw new Error("Токен не получен");
      localStorage.setItem("authToken", accessToken);
      const profile = await getProfile();
      if (profile?.id) localStorage.setItem("chefId", profile.id);
      if (profile?.role) localStorage.setItem("role", profile.role);
      const chefId = localStorage.getItem("chefId");
      navigate(chefId ? `/chef/${encodeURIComponent(chefId)}/menu` : "/chef");
    } catch (err) {
      setError(err?.message || "Неверный email или пароль");
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/backgrounds/login-pattern.png)',
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
      <div className="ContentWrapper">
        <h2>{t.login.title}</h2>
        <form onSubmit={handleLogin} className="formBox">
          <input
            type="email"
            placeholder={t.login.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t.login.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{t.login.submit}</button>
        </form>

        {error && (
          <p style={{ color: "#d32f2f" }}>{error}</p>
        )}

        <p>
          {t.login.noAccount} <Link to="/register" className="link">{t.login.registerLink}</Link>
        </p>

        <div className="FeaturesSection">
          <div className="FeatureCard">
            <h4>{t.features.chefSupport}</h4>
            <p>{t.features.chefSupportDesc}</p>
          </div>
          <div className="FeatureCard">
            <h4>{t.features.process}</h4>
            <p>{t.features.processDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
