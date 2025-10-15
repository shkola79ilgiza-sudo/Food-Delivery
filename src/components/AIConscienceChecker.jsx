import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import AIConscienceCheckerClass from '../utils/aiConscienceChecker';

// Создаем экземпляр класса
const aiConscienceChecker = new AIConscienceCheckerClass();

const AIConscienceChecker = ({ dish = null, onClose }) => {
  const [selectedDish, setSelectedDish] = useState(dish);
  const [claimedStandards, setClaimedStandards] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availableDishes, setAvailableDishes] = useState([]);
  const [analysisMode, setAnalysisMode] = useState('single'); // 'single' or 'multiple'
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const dietaryStandards = [
    { id: 'vegetarian', name: 'Вегетарианское', icon: '🥗', description: 'Без мяса, рыбы и морепродуктов' },
    { id: 'vegan', name: 'Веганское', icon: '🌿', description: 'Без продуктов животного происхождения' },
    { id: 'halal', name: 'Халяль', icon: '☪️', description: 'Соответствует исламским нормам' },
    { id: 'kosher', name: 'Кошерное', icon: '✡️', description: 'Соответствует еврейским нормам' },
    { id: 'gluten_free', name: 'Без глютена', icon: '🌾', description: 'Не содержит глютен' }
  ];

  useEffect(() => {
    // Загружаем доступные блюда
    const dishes = JSON.parse(localStorage.getItem('allDishes') || '[]');
    setAvailableDishes(dishes);
  }, []);

  const toggleStandard = (standardId) => {
    setClaimedStandards(prev => 
      prev.includes(standardId) 
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    );
  };

  const analyzeDish = async () => {
    if (!selectedDish) {
      showError('Выберите блюдо для анализа');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting conscience analysis...', { dish: selectedDish.name, standards: claimedStandards });
      
      const result = await aiConscienceChecker.analyzeDish(selectedDish, claimedStandards);
      console.log('✅ Analysis completed:', result);
      
      setAnalysisResult(result);
      showSuccess('Анализ этичности завершен! Проверьте результаты.');
    } catch (error) {
      console.error('❌ Analysis error:', error);
      showError('Ошибка при анализе блюда. Попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeMultipleDishes = async () => {
    if (availableDishes.length === 0) {
      showError('Нет доступных блюд для анализа');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting multiple dishes analysis...', { count: availableDishes.length, standards: claimedStandards });
      
      const result = await aiConscienceChecker.analyzeMultipleDishes(availableDishes, claimedStandards);
      console.log('✅ Multiple analysis completed:', result);
      
      setAnalysisResult(result);
      showSuccess(`Анализ ${availableDishes.length} блюд завершен!`);
    } catch (error) {
      console.error('❌ Multiple analysis error:', error);
      showError('Ошибка при анализе блюд. Попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  if (isAnalyzing) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>
          AI анализирует этичность блюда...
        </h3>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Проверяем соответствие заявленным стандартам и этическим нормам
        </p>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#f0f0f0',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '75%',
            height: '100%',
            background: 'linear-gradient(90deg, #2196f3, #1976d2)',
            animation: 'loading 2s ease-in-out infinite'
          }}></div>
        </div>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Заголовок */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <div>
            <h2 style={{ color: '#333', margin: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔍 AI Анализ этичности
            </h2>
            <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
              {analysisMode === 'single' ? 
                `Блюдо: ${analysisResult.dishName}` : 
                `Проанализировано блюд: ${analysisResult.summary?.totalDishes || 0}`
              }
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '5px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Общий балл */}
        <div style={{
          background: `linear-gradient(135deg, ${getScoreColor(analysisResult.results?.overallScore || analysisResult.summary?.averageScore || 0)}, ${getScoreColor(analysisResult.results?.overallScore || analysisResult.summary?.averageScore || 0)}dd)`,
          color: 'white',
          borderRadius: '15px',
          padding: '25px',
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
            {analysisResult.results?.overallScore || analysisResult.summary?.averageScore || 0}/100
          </div>
          <h3 style={{ margin: '0', fontSize: '24px' }}>
            {analysisMode === 'single' ? 'Общий балл соответствия' : 'Средний балл соответствия'}
          </h3>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
            {analysisResult.results?.overallScore >= 80 || analysisResult.summary?.averageScore >= 80 ? 
              'Отличное соответствие этическим стандартам' :
              analysisResult.results?.overallScore >= 60 || analysisResult.summary?.averageScore >= 60 ?
              'Удовлетворительное соответствие' :
              'Требует улучшения'
            }
          </p>
        </div>

        {/* Результаты анализа одного блюда */}
        {analysisMode === 'single' && analysisResult.results && (
          <>
            {/* Соответствие диетическим стандартам */}
            {Object.keys(analysisResult.results.dietaryCompliance).length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>🥗 Соответствие диетическим стандартам</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(analysisResult.results.dietaryCompliance).map(([standard, compliance]) => (
                    <div
                      key={standard}
                      style={{
                        background: compliance.compliant ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: `2px solid ${compliance.compliant ? '#4caf50' : '#f44336'}`,
                        borderRadius: '10px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: '0', color: '#333' }}>
                          {dietaryStandards.find(s => s.id === standard)?.icon} {dietaryStandards.find(s => s.id === standard)?.name}
                        </h4>
                        <span style={{
                          background: compliance.compliant ? '#4caf50' : '#f44336',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {compliance.compliant ? '✅ Соответствует' : '❌ Не соответствует'}
                        </span>
                      </div>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {compliance.recommendation}
                      </p>
                      {compliance.violations.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: '#f44336' }}>Нарушения:</strong>
                          <ul style={{ margin: '5px 0 0 20px', color: '#666', fontSize: '14px' }}>
                            {compliance.violations.map((violation, index) => (
                              <li key={index}>{violation.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Этические стандарты */}
            {Object.keys(analysisResult.results.ethicalCompliance).length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>⚖️ Этические стандарты</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(analysisResult.results.ethicalCompliance).map(([standard, compliance]) => (
                    <div
                      key={standard}
                      style={{
                        background: compliance.score >= 70 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: `2px solid ${compliance.score >= 70 ? '#4caf50' : '#f44336'}`,
                        borderRadius: '10px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: '0', color: '#333', textTransform: 'capitalize' }}>
                          {standard.replace('_', ' ')}
                        </h4>
                        <span style={{
                          background: getScoreColor(compliance.score),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {compliance.score}/100
                        </span>
                      </div>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {compliance.recommendation}
                      </p>
                      {compliance.violations.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: '#f44336' }}>Нарушения:</strong>
                          <ul style={{ margin: '5px 0 0 20px', color: '#666', fontSize: '14px' }}>
                            {compliance.violations.map((violation, index) => (
                              <li key={index}>{violation.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Чистота питания */}
            {analysisResult.results.nutritionalPurity && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>🌱 Чистота питания</h3>
                <div style={{
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '15px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0', color: '#333' }}>Общий балл чистоты</h4>
                    <span style={{
                      background: getScoreColor(analysisResult.results.nutritionalPurity.purityScore),
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {analysisResult.results.nutritionalPurity.purityScore}/100
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196f3' }}>
                        {analysisResult.results.nutritionalPurity.processingLevel}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Уровень обработки</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>
                        {analysisResult.results.nutritionalPurity.artificialAdditives.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Искусственные добавки</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                        {analysisResult.results.nutritionalPurity.naturalIndicators.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Натуральные индикаторы</div>
                    </div>
                  </div>

                  {analysisResult.results.nutritionalPurity.artificialAdditives.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <strong style={{ color: '#f44336' }}>Искусственные добавки:</strong>
                      <ul style={{ margin: '5px 0 0 20px', color: '#666', fontSize: '14px' }}>
                        {analysisResult.results.nutritionalPurity.artificialAdditives.map((additive, index) => (
                          <li key={index}>{additive.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Предупреждения о здоровье */}
            {analysisResult.results.healthWarnings && analysisResult.results.healthWarnings.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>⚠️ Предупреждения о здоровье</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisResult.results.healthWarnings.map((warning, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '2px solid #f44336',
                        borderRadius: '10px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <h4 style={{ margin: '0', color: '#333' }}>{warning.message}</h4>
                      </div>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{warning.warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Рекомендации */}
            {analysisResult.results.recommendations && analysisResult.results.recommendations.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>💡 Рекомендации по улучшению</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisResult.results.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      style={{
                        background: rec.priority === 'high' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                        border: `2px solid ${rec.priority === 'high' ? '#f44336' : '#2196f3'}`,
                        borderRadius: '10px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{getSeverityIcon(rec.priority)}</span>
                        <h4 style={{ margin: '0', color: '#333' }}>{rec.message}</h4>
                      </div>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Результаты анализа нескольких блюд */}
        {analysisMode === 'multiple' && analysisResult.summary && (
          <>
            {/* Сводка */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>📊 Сводка анализа</h3>
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                padding: '15px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                      {analysisResult.summary.totalDishes}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Всего блюд</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: getScoreColor(analysisResult.summary.averageScore) }}>
                      {analysisResult.summary.averageScore}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Средний балл</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
                      {analysisResult.summary.criticalIssues.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Критических проблем</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Соответствие по стандартам */}
            {Object.keys(analysisResult.summary.complianceByStandard).length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>📈 Соответствие по стандартам</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(analysisResult.summary.complianceByStandard).map(([standard, compliance]) => (
                    <div
                      key={standard}
                      style={{
                        background: 'white',
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: '0', color: '#333' }}>
                          {dietaryStandards.find(s => s.id === standard)?.icon} {dietaryStandards.find(s => s.id === standard)?.name}
                        </h4>
                        <span style={{
                          background: getScoreColor(compliance.percentage),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {compliance.percentage}%
                        </span>
                      </div>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {compliance.compliant} из {compliance.total} блюд соответствуют стандарту
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Критические проблемы */}
            {analysisResult.summary.criticalIssues.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>🚨 Критические проблемы</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisResult.summary.criticalIssues.map((issue, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '2px solid #f44336',
                        borderRadius: '10px',
                        padding: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: '0', color: '#333' }}>{issue.dishName}</h4>
                        <span style={{
                          background: '#f44336',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {issue.score}/100
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        <strong>Проблемы:</strong>
                        <ul style={{ margin: '5px 0 0 20px' }}>
                          {issue.issues.map((issueItem, issueIndex) => (
                            <li key={issueIndex}>{issueItem.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={() => {
              const reportText = analysisMode === 'single' ? 
                `Отчет об этичности блюда "${analysisResult.dishName}":\nОбщий балл: ${analysisResult.results.overallScore}/100\n\nРекомендации:\n${analysisResult.results.recommendations.map(r => `- ${r.message}`).join('\n')}` :
                `Отчет об этичности ${analysisResult.summary.totalDishes} блюд:\nСредний балл: ${analysisResult.summary.averageScore}/100\n\nКритические проблемы: ${analysisResult.summary.criticalIssues.length}`;
              
              navigator.clipboard.writeText(reportText);
              showSuccess('Отчет скопирован в буфер обмена!');
            }}
            style={{
              background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📋 Копировать отчет
          </button>
        </div>

        {/* Кнопка нового анализа */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setAnalysisResult(null)}
            style={{
              background: 'linear-gradient(135deg, #4caf50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Новый анализ
          </button>
        </div>

        {/* CSS для анимации */}
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Форма настройки анализа
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '15px'
      }}>
        <div>
          <h2 style={{ color: '#333', margin: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔍 AI Анализатор этичности
          </h2>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Проверка соответствия заявленным стандартам и этическим нормам
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '5px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Выбор режима анализа */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>🎯 Режим анализа</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setAnalysisMode('single')}
            style={{
              background: analysisMode === 'single' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'white',
              color: analysisMode === 'single' ? 'white' : '#333',
              border: `2px solid ${analysisMode === 'single' ? '#4caf50' : '#e0e0e0'}`,
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🍽️ Одно блюдо
          </button>
          <button
            onClick={() => setAnalysisMode('multiple')}
            style={{
              background: analysisMode === 'multiple' ? 'linear-gradient(135deg, #2196f3, #1976d2)' : 'white',
              color: analysisMode === 'multiple' ? 'white' : '#333',
              border: `2px solid ${analysisMode === 'multiple' ? '#2196f3' : '#e0e0e0'}`,
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📊 Все блюда ({availableDishes.length})
          </button>
        </div>
      </div>

      {/* Выбор блюда (для режима одного блюда) */}
      {analysisMode === 'single' && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>🍽️ Выберите блюдо</h3>
          <select
            value={selectedDish?.id || ''}
            onChange={(e) => {
              const dish = availableDishes.find(d => d.id === e.target.value);
              setSelectedDish(dish);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">Выберите блюдо для анализа</option>
            {availableDishes.map(dish => (
              <option key={dish.id} value={dish.id}>
                {dish.name} - {dish.chef || 'Неизвестный повар'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Выбор стандартов */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>📋 Заявленные стандарты</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          Выберите стандарты, которые заявлены для блюда(ов)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {dietaryStandards.map(standard => (
            <button
              key={standard.id}
              onClick={() => toggleStandard(standard.id)}
              style={{
                background: claimedStandards.includes(standard.id) ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'white',
                color: claimedStandards.includes(standard.id) ? 'white' : '#333',
                border: `2px solid ${claimedStandards.includes(standard.id) ? '#4caf50' : '#e0e0e0'}`,
                padding: '15px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{standard.icon}</span>
                <span>{standard.name}</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {standard.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Информация о доступных блюдах */}
      <div style={{
        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
        border: '2px solid #2196f3',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <h4 style={{ margin: '0', color: '#333' }}>Доступные блюда</h4>
        </div>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          В меню доступно <strong>{availableDishes.length}</strong> блюд для анализа.
          {claimedStandards.length === 0 && (
            <span> Выберите стандарты для проверки соответствия.</span>
          )}
        </p>
      </div>

      {/* Кнопка анализа */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={analysisMode === 'single' ? analyzeDish : analyzeMultipleDishes}
          disabled={
            (analysisMode === 'single' && !selectedDish) ||
            availableDishes.length === 0 ||
            claimedStandards.length === 0
          }
          style={{
            background: (
              (analysisMode === 'single' && !selectedDish) ||
              availableDishes.length === 0 ||
              claimedStandards.length === 0
            ) ? '#ccc' : 'linear-gradient(135deg, #4caf50, #45a049)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            cursor: (
              (analysisMode === 'single' && !selectedDish) ||
              availableDishes.length === 0 ||
              claimedStandards.length === 0
            ) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: (
              (analysisMode === 'single' && !selectedDish) ||
              availableDishes.length === 0 ||
              claimedStandards.length === 0
            ) ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
        >
          <span>🔍</span>
          {analysisMode === 'single' ? 'Анализировать блюдо' : `Анализировать ${availableDishes.length} блюд`}
        </button>
        
        {(!selectedDish && analysisMode === 'single') && (
          <p style={{ color: '#f44336', fontSize: '14px', marginTop: '10px' }}>
            Выберите блюдо для анализа
          </p>
        )}
        
        {availableDishes.length === 0 && (
          <p style={{ color: '#f44336', fontSize: '14px', marginTop: '10px' }}>
            Нет доступных блюд для анализа
          </p>
        )}
        
        {claimedStandards.length === 0 && (
          <p style={{ color: '#f44336', fontSize: '14px', marginTop: '10px' }}>
            Выберите стандарты для проверки
          </p>
        )}
      </div>
    </div>
  );
};

export default AIConscienceChecker;
