import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import aiBenefitGenerator from '../utils/aiBenefitGenerator';

const AIBenefitPanel = ({ dish, onBenefitGenerated }) => {
  const [benefits, setBenefits] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('medium');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const { showSuccess } = useToast();

  const formats = [
    { id: 'short', name: 'Короткий', description: 'Краткое описание', icon: '📝' },
    { id: 'medium', name: 'Средний', description: 'Сбалансированное описание', icon: '📄' },
    { id: 'long', name: 'Длинный', description: 'Подробное описание', icon: '📋' }
  ];

  const goals = [
    { id: null, name: 'Без цели', icon: '🌟' },
    { id: 'weight_loss', name: 'Похудение', icon: '🎯' },
    { id: 'muscle_gain', name: 'Набор массы', icon: '💪' },
    { id: 'healthy', name: 'Здоровье', icon: '🌱' },
    { id: 'energy', name: 'Энергия', icon: '⚡' },
    { id: 'immunity', name: 'Иммунитет', icon: '🛡️' }
  ];

  useEffect(() => {
    if (dish) {
      generateBenefits();
    }
  }, [dish, selectedFormat, selectedGoal]);

  const generateBenefits = () => {
    if (!dish) return;

    setIsGenerating(true);
    try {
      // Генерируем тексты всех форматов
      const allBenefits = {
        short: aiBenefitGenerator.generateBenefit(dish, 'short', selectedGoal),
        medium: aiBenefitGenerator.generateBenefit(dish, 'medium', selectedGoal),
        long: aiBenefitGenerator.generateBenefit(dish, 'long', selectedGoal)
      };

      // Генерируем заголовки и хештеги
      const generatedHeadlines = aiBenefitGenerator.generateCatchyHeadlines(dish);
      const generatedHashtags = aiBenefitGenerator.generateHashtags(dish, selectedGoal);

      setBenefits(allBenefits);
      setHeadlines(generatedHeadlines);
      setHashtags(generatedHashtags);
    } catch (error) {
      console.error('Error generating benefits:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyBenefit = (format) => {
    const text = benefits[format];
    navigator.clipboard.writeText(text);
    showSuccess('Текст скопирован в буфер обмена!');
  };

  const handleUseBenefit = (format) => {
    if (onBenefitGenerated && benefits) {
      onBenefitGenerated(benefits[format]);
      showSuccess('Текст добавлен к описанию блюда!');
    }
  };

  if (!dish) return null;

  if (isGenerating) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center',
        border: '2px solid #2196f3'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>💡</div>
        <h4 style={{ margin: '0', color: '#333' }}>AI генерирует продающие тексты...</h4>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
          Анализируем пользу блюда и создаем убедительные описания
        </p>
      </div>
    );
  }

  if (!benefits) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #4caf50',
      marginTop: '15px'
    }}>
      {/* Заголовок */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          margin: '0 0 10px 0',
          color: '#2e7d32',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          💡 AI Генератор пользы
        </h3>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Автоматически созданные продающие тексты о пользе блюда
        </p>
      </div>

      {/* Выбор формата */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Формат текста:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {formats.map(format => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              style={{
                background: selectedFormat === format.id ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'white',
                color: selectedFormat === format.id ? 'white' : '#333',
                border: `2px solid ${selectedFormat === format.id ? '#4caf50' : '#e0e0e0'}`,
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{format.icon}</span>
              {format.name}
            </button>
          ))}
        </div>
      </div>

      {/* Выбор цели */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Цель клиента:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {goals.map(goal => (
            <button
              key={goal.id || 'none'}
              onClick={() => setSelectedGoal(goal.id)}
              style={{
                background: selectedGoal === goal.id ? 'linear-gradient(135deg, #2196f3, #1976d2)' : 'white',
                color: selectedGoal === goal.id ? 'white' : '#333',
                border: `2px solid ${selectedGoal === goal.id ? '#2196f3' : '#e0e0e0'}`,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{goal.icon}</span>
              {goal.name}
            </button>
          ))}
        </div>
      </div>

      {/* Сгенерированный текст */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Сгенерированный текст:</h4>
        <div style={{
          background: 'white',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '10px'
        }}>
          <p style={{
            margin: '0',
            color: '#333',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            {benefits[selectedFormat]}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCopyBenefit(selectedFormat)}
            style={{
              background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            📋 Копировать
          </button>

          {onBenefitGenerated && (
            <button
              onClick={() => handleUseBenefit(selectedFormat)}
              style={{
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
            >
              ✅ Использовать
            </button>
          )}

          <button
            onClick={generateBenefits}
            style={{
              background: 'linear-gradient(135deg, #ff9800, #f57c00)',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Заголовки */}
      {headlines.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Цепляющие заголовки:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {headlines.map((headline, index) => (
              <div
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(headline);
                  showSuccess('Заголовок скопирован!');
                }}
                style={{
                  background: 'white',
                  border: '2px solid #ff9800',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#fff3e0'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                {headline}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Хештеги */}
      {hashtags.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Хештеги для соц. сетей:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hashtags.map((hashtag, index) => (
              <div
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(hashtag);
                  showSuccess('Хештег скопирован!');
                }}
                style={{
                  background: 'white',
                  border: '2px solid #2196f3',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: '#2196f3',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e3f2fd';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {hashtag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Подсказка */}
      <div style={{
        marginTop: '15px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <p style={{
          margin: '0',
          color: '#666',
          fontSize: '12px',
          fontStyle: 'italic'
        }}>
          💡 <strong>Совет:</strong> Используйте эти тексты в описании блюда, социальных сетях или рекламных материалах. Они автоматически подстраиваются под цель клиента!
        </p>
      </div>
    </div>
  );
};

export default AIBenefitPanel;
