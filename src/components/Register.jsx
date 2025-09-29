import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import { useLanguage } from "../contexts/LanguageContext";
import { validateKitchenAddress } from "../utils/deliveryZone";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [avatarError, setAvatarError] = useState("");
  
  // Документы повара
  const [documents, setDocuments] = useState({
    passport: null,
    healthBook: null,
    selfEmployment: null,
    kitchenCertificate: null,
    kitchenPhotos: [],
    dishPhotos: [],
    experience: "",
    kitchenDescription: "",
    kitchenAddress: ""
  });
  const [documentErrors, setDocumentErrors] = useState({});
  
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRegister = (e) => {
    e.preventDefault();
    const nextErrors = { email: "", password: "" };
    const docErrors = {};
    
    const emailValid = /.+@.+\..+/.test(email);
    if (!emailValid) nextErrors.email = "Неверный формат email";
    if (password.length < 8) nextErrors.password = "Минимум 8 символов";
    
    // Проверка обязательных документов
    if (!documents.passport) docErrors.passport = "Паспорт обязателен";
    if (!documents.healthBook) docErrors.healthBook = "Медкнижка обязательна";
    if (!documents.selfEmployment) docErrors.selfEmployment = "Документ о самозанятости/ИП обязателен";
    if (!documents.kitchenCertificate) docErrors.kitchenCertificate = "СЭС-сертификат кухни обязателен";
    if (documents.kitchenPhotos.length === 0) docErrors.kitchenPhotos = "Фото кухни обязательны";
    if (documents.dishPhotos.length < 4) docErrors.dishPhotos = "Минимум 4 фото блюд";
    if (!documents.experience.trim()) docErrors.experience = "Описание опыта обязательно";
    if (!documents.kitchenDescription.trim()) docErrors.kitchenDescription = "Описание кухни обязательно";
    if (!documents.kitchenAddress.trim()) {
      docErrors.kitchenAddress = "Адрес кухни обязателен";
    } else {
      const addressValidation = validateKitchenAddress(documents.kitchenAddress);
      if (!addressValidation.isValid) {
        docErrors.kitchenAddress = addressValidation.message;
      }
    }
    
    setErrors(nextErrors);
    setDocumentErrors(docErrors);
    
    if (!emailValid || password.length < 8 || Object.keys(docErrors).length > 0) return;

    // Сохранение данных повара
    const chefData = {
      email,
      password,
      avatar,
      documents: {
        ...documents,
        uploadedAt: new Date().toISOString(),
        status: 'pending_verification'
      },
      createdAt: new Date().toISOString(),
      role: 'chef',
      verified: false
    };

    // Сохранение в localStorage
    localStorage.setItem("chefEmail", email);
    localStorage.setItem("chefPassword", password);
    if (avatar) localStorage.setItem("chefAvatar", avatar);
    localStorage.setItem(`chefDocuments_${email}`, JSON.stringify(chefData.documents));

    // Добавление в общий список пользователей
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    allUsers.push(chefData);
    localStorage.setItem('allUsers', JSON.stringify(allUsers));

    // Demo auth: generate token, role and chefId
    const fakeToken = `demo-token-${Date.now()}`;
    const fakeChefId = email;
    const fakeRole = "chef";
    localStorage.setItem("authToken", fakeToken);
    localStorage.setItem("chefId", fakeChefId);
    localStorage.setItem("role", fakeRole);

    alert("Регистрация успешна! Ваши документы отправлены на проверку. Ожидайте подтверждения от администратора.");
    navigate("/chef");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarError("");
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!allowed.includes(file.type)) {
        setAvatarError("Допустимые форматы: JPG, PNG, WEBP");
        return;
      }
      if (file.size > maxSize) {
        setAvatarError("Размер файла до 2 МБ");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (documentType, file) => {
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB для документов
      
      if (!allowed.includes(file.type)) {
        setDocumentErrors(prev => ({ ...prev, [documentType]: "Допустимые форматы: JPG, PNG, WEBP, PDF" }));
        return;
      }
      if (file.size > maxSize) {
        setDocumentErrors(prev => ({ ...prev, [documentType]: "Размер файла до 5 МБ" }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocuments(prev => ({
          ...prev,
          [documentType]: e.target.result
        }));
        setDocumentErrors(prev => ({ ...prev, [documentType]: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiplePhotosChange = (photoType, files) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 3 * 1024 * 1024; // 3MB для фото
    const maxPhotos = photoType === 'dishPhotos' ? 6 : 10;
    
    if (files.length > maxPhotos) {
      setDocumentErrors(prev => ({ 
        ...prev, 
        [photoType]: `Максимум ${maxPhotos} фотографий` 
      }));
      return;
    }
    
    const validFiles = [];
    const errors = [];
    
    Array.from(files).forEach((file, index) => {
      if (!allowed.includes(file.type)) {
        errors.push(`Файл ${index + 1}: допустимые форматы JPG, PNG, WEBP`);
        return;
      }
      if (file.size > maxSize) {
        errors.push(`Файл ${index + 1}: размер до 3 МБ`);
        return;
      }
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      setDocumentErrors(prev => ({ ...prev, [photoType]: errors.join('; ') }));
      return;
    }
    
    const readers = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers).then(results => {
      setDocuments(prev => ({
        ...prev,
        [photoType]: results
      }));
      setDocumentErrors(prev => ({ ...prev, [photoType]: "" }));
    });
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/backgrounds/register-pattern.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div className="chef-registration-container">
        <h2>Регистрация повара</h2>
        <form onSubmit={handleRegister} className="formBox">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p style={{ color: "#d32f2f" }}>{errors.email}</p>}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p style={{ color: "#d32f2f" }}>{errors.password}</p>}
          <label className="fileLabel">
            {t.register.selectPhoto}
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </label>
          {avatar && <img src={avatar} alt="Предпросмотр" className="avatar" />}
          {avatarError && <p style={{ color: "#d32f2f" }}>{avatarError}</p>}
          
          {/* Секция документов */}
          <div className="documents-section">
            <h3>📋 Обязательные документы</h3>
            
            {/* Паспорт */}
            <div className="document-field">
              <label className="fileLabel">
                📄 Паспорт/Удостоверение личности *
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleDocumentChange('passport', e.target.files[0])} 
                />
              </label>
              {documents.passport && <p style={{ color: "#4caf50" }}>✅ Загружено</p>}
              {documentErrors.passport && <p style={{ color: "#d32f2f" }}>{documentErrors.passport}</p>}
            </div>

            {/* Медкнижка */}
            <div className="document-field">
              <label className="fileLabel">
                🏥 Медкнижка *
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleDocumentChange('healthBook', e.target.files[0])} 
                />
              </label>
              {documents.healthBook && <p style={{ color: "#4caf50" }}>✅ Загружено</p>}
              {documentErrors.healthBook && <p style={{ color: "#d32f2f" }}>{documentErrors.healthBook}</p>}
            </div>

            {/* Самозанятость/ИП */}
            <div className="document-field">
              <label className="fileLabel">
                💼 Документ о самозанятости/ИП *
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleDocumentChange('selfEmployment', e.target.files[0])} 
                />
              </label>
              {documents.selfEmployment && <p style={{ color: "#4caf50" }}>✅ Загружено</p>}
              {documentErrors.selfEmployment && <p style={{ color: "#d32f2f" }}>{documentErrors.selfEmployment}</p>}
            </div>

            {/* СЭС-сертификат */}
            <div className="document-field">
              <label className="fileLabel">
                🏭 СЭС-сертификат кухни *
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => handleDocumentChange('kitchenCertificate', e.target.files[0])} 
                />
              </label>
              {documents.kitchenCertificate && <p style={{ color: "#4caf50" }}>✅ Загружено</p>}
              {documentErrors.kitchenCertificate && <p style={{ color: "#d32f2f" }}>{documentErrors.kitchenCertificate}</p>}
            </div>

            {/* Фото кухни */}
            <div className="document-field">
              <label className="fileLabel">
                🏠 Фото кухни (чистота, холодильник, плита) *
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={(e) => handleMultiplePhotosChange('kitchenPhotos', e.target.files)} 
                />
              </label>
              {documents.kitchenPhotos.length > 0 && (
                <p style={{ color: "#4caf50" }}>✅ Загружено: {documents.kitchenPhotos.length} фото</p>
              )}
              {documentErrors.kitchenPhotos && <p style={{ color: "#d32f2f" }}>{documentErrors.kitchenPhotos}</p>}
            </div>

            {/* Фото блюд */}
            <div className="document-field">
              <label className="fileLabel">
                🍽️ Фото блюд (4-6 штук) *
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={(e) => handleMultiplePhotosChange('dishPhotos', e.target.files)} 
                />
              </label>
              {documents.dishPhotos.length > 0 && (
                <p style={{ color: "#4caf50" }}>✅ Загружено: {documents.dishPhotos.length} фото</p>
              )}
              {documentErrors.dishPhotos && <p style={{ color: "#d32f2f" }}>{documentErrors.dishPhotos}</p>}
            </div>

            {/* Описание опыта */}
            <div className="document-field">
              <label>
                📝 Описание опыта работы *
                <textarea
                  value={documents.experience}
                  onChange={(e) => setDocuments(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Расскажите о своем опыте в кулинарии, образовании, достижениях..."
                  rows="4"
                />
              </label>
              {documentErrors.experience && <p style={{ color: "#d32f2f" }}>{documentErrors.experience}</p>}
            </div>

            {/* Описание кухни */}
            <div className="document-field">
              <label>
                🏠 Описание кухни *
                <textarea
                  value={documents.kitchenDescription}
                  onChange={(e) => setDocuments(prev => ({ ...prev, kitchenDescription: e.target.value }))}
                  placeholder="Опишите вашу кухню: площадь, оборудование, условия хранения продуктов..."
                  rows="3"
                />
              </label>
              {documentErrors.kitchenDescription && <p style={{ color: "#d32f2f" }}>{documentErrors.kitchenDescription}</p>}
            </div>

            {/* Адрес кухни */}
            <div className="document-field">
              <label>
                📍 {t.chefMenu.kitchenAddress} *
                <input
                  type="text"
                  value={documents.kitchenAddress}
                  onChange={(e) => {
                    const newAddress = e.target.value;
                    setDocuments(prev => ({ ...prev, kitchenAddress: newAddress }));
                    
                    // Валидация в реальном времени
                    if (newAddress.trim()) {
                      const validation = validateKitchenAddress(newAddress);
                      if (validation.isValid) {
                        setDocumentErrors(prev => ({ ...prev, kitchenAddress: "" }));
                      } else {
                        setDocumentErrors(prev => ({ ...prev, kitchenAddress: validation.message }));
                      }
                    } else {
                      setDocumentErrors(prev => ({ ...prev, kitchenAddress: "" }));
                    }
                  }}
                  placeholder={t.chefMenu.kitchenAddressPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${documentErrors.kitchenAddress ? '#d32f2f' : '#ced4da'}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginTop: '8px'
                  }}
                />
              </label>
              <p style={{ 
                fontSize: '12px', 
                color: '#6c757d', 
                margin: '5px 0 0 0',
                fontStyle: 'italic'
              }}>
                💡 {t.chefMenu.kitchenAddressHelp}
              </p>
              {documentErrors.kitchenAddress && <p style={{ color: "#d32f2f" }}>{documentErrors.kitchenAddress}</p>}
              {documents.kitchenAddress && !documentErrors.kitchenAddress && (
                <p style={{ color: "#4caf50", fontSize: '12px', margin: '5px 0 0 0' }}>
                  ✅ Адрес корректен для расчета зоны доставки
                </p>
              )}
            </div>

            <div className="legal-notice">
              <p><strong>⚠️ Важно:</strong> Все документы будут проверены администратором. 
              Медкнижка и статус самозанятого должны обновляться каждые 6-12 месяцев.</p>
            </div>
          </div>
          
          <button type="submit">{t.register.submit}</button>
        </form>

        <p>
          {t.register.alreadyRegistered} <Link to="/login" className="link">{t.register.loginLink}</Link>
        </p>

        <h3>{t.features.keyFeatures}</h3>
        <div className="FeaturesSection">
          <div className="FeatureCard">
            <div className="IconWrapper">⭐</div>
            <h4>{t.features.authenticReviews}</h4>
            <p>{t.features.authenticReviewsDesc}</p>
          </div>
          <div className="FeatureCard">
            <div className="IconWrapper">👥</div>
            <h4>{t.features.allClients}</h4>
            <p>{t.features.allClientsDesc}</p>
          </div>
          <div className="FeatureCard">
            <div className="IconWrapper">💰</div>
            <h4>{t.features.incomeSchedule}</h4>
            <p>{t.features.incomeScheduleDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
