import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import aiPhotoAnalyzer from '../utils/aiPhotoAnalyzer';

const AIPhotoAnalyzer = ({ imageDataUrl, dishInfo = {}, onAnalysisComplete, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { showSuccess } = useToast();
  
  // Refs для защиты от устаревших обновлений
  const activeRequestRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (imageDataUrl) {
      analyzePhoto();
    }
  }, [imageDataUrl]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const analyzePhoto = useCallback(async () => {
    // Генерируем уникальный ID для этого запроса
    const requestId = ++activeRequestRef.current;
    
    setIsAnalyzing(true);
    try {
      console.log('📸 Starting AI photo analysis...');
      const result = await aiPhotoAnalyzer.analyzePhoto(imageDataUrl, dishInfo);
      console.log('✅ Analysis completed:', result);
      
      // Проверяем, что компонент еще смонтирован и это актуальный запрос
      if (!isMountedRef.current || activeRequestRef.current !== requestId) {
        console.log('🔄 Skipping stale analysis update');
        return;
      }
      
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('❌ Photo analysis error:', error);
    } finally {
      // Проверяем, что компонент еще смонтирован и это актуальный запрос
      if (isMountedRef.current && activeRequestRef.current === requestId) {
        setIsAnalyzing(false);
      }
    }
  }, [imageDataUrl, dishInfo, onAnalysisComplete]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#f44336';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'fair': return '⚠️';
      case 'poor': return '❌';
      default: return '📊';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#2196f3';
      default: return '#9e9e9e';
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
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📸</div>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>
          AI анализирует фотографию...
        </h3>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Проверяем качество, композицию и аппетитность
        </p>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#f0f0f0',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '80%',
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            animation: 'loading 2s ease-in-out infinite'
          }}></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (!analysis) return null;

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
            📸 AI Анализ фото
          </h2>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            {dishInfo.name ? `Блюдо: ${dishInfo.name}` : 'Анализ качества фотографии'}
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

      {/* Превью фото */}
      <div style={{
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        <img
          src={imageDataUrl}
          alt="Analyzed photo"
          style={{
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>

      {/* Общий балл */}
      <div style={{
        background: `linear-gradient(135deg, ${getScoreColor(analysis.overall.score)}, ${getScoreColor(analysis.overall.score)}dd)`,
        color: 'white',
        borderRadius: '15px',
        padding: '25px',
        textAlign: 'center',
        marginBottom: '25px'
      }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          {getStatusIcon(analysis.overall.status)} {analysis.overall.score}/100
        </div>
        <h3 style={{ margin: '0', fontSize: '20px' }}>
          {analysis.overall.message}
        </h3>
      </div>

      {/* Технические параметры */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ color: '#333', margin: '0' }}>⚙️ Технические параметры</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: '2px solid #667eea',
              color: '#667eea',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {showDetails ? 'Скрыть' : 'Показать детали'}
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          {/* Яркость */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getScoreColor(analysis.technical.brightness.score),
              marginBottom: '5px'
            }}>
              {getStatusIcon(analysis.technical.brightness.status)}
            </div>
            <div style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
              Яркость
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {analysis.technical.brightness.value}
            </div>
          </div>

          {/* Контраст */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getScoreColor(analysis.technical.contrast.score),
              marginBottom: '5px'
            }}>
              {getStatusIcon(analysis.technical.contrast.status)}
            </div>
            <div style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
              Контраст
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {analysis.technical.contrast.value}
            </div>
          </div>

          {/* Резкость */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getScoreColor(analysis.technical.sharpness.score),
              marginBottom: '5px'
            }}>
              {getStatusIcon(analysis.technical.sharpness.status)}
            </div>
            <div style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
              Резкость
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {analysis.technical.sharpness.value}
            </div>
          </div>

          {/* Баланс цветов */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getScoreColor(analysis.technical.colorBalance.score),
              marginBottom: '5px'
            }}>
              {getStatusIcon(analysis.technical.colorBalance.status)}
            </div>
            <div style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
              Цвета
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {analysis.technical.colorBalance.status === 'balanced' ? 'Сбалансировано' : 'Дисбаланс'}
            </div>
          </div>
        </div>

        {/* Детальная информация */}
        {showDetails && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            background: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📊 Детальные метрики:</h4>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
              <div><strong>Разрешение:</strong> {analysis.technical.resolution.width}×{analysis.technical.resolution.height} ({analysis.technical.resolution.megapixels} МП)</div>
              <div><strong>HD качество:</strong> {analysis.technical.resolution.isHD ? '✅ Да' : '❌ Нет'}</div>
              <div><strong>RGB баланс:</strong> R:{analysis.technical.colorBalance.rgb.r} G:{analysis.technical.colorBalance.rgb.g} B:{analysis.technical.colorBalance.rgb.b}</div>
              {analysis.composition.centering && (
                <div><strong>Центрирование:</strong> {analysis.composition.centering.score}% ({analysis.composition.centering.message})</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Рекомендации */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>💡 Рекомендации по улучшению</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  background: rec.priority === 'high' ? 'rgba(244, 67, 54, 0.1)' :
                             rec.priority === 'medium' ? 'rgba(255, 152, 0, 0.1)' :
                             'rgba(33, 150, 243, 0.1)',
                  border: `2px solid ${getPriorityColor(rec.priority)}`,
                  borderRadius: '10px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{rec.icon}</span>
                  <h4 style={{ margin: '0', color: '#333' }}>{rec.message}</h4>
                  <span style={{
                    background: getPriorityColor(rec.priority),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {rec.priority}
                  </span>
                </div>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  <strong>Действие:</strong> {rec.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Автоматические улучшения */}
      {analysis.overall.score < 80 && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
          border: '2px solid #2196f3',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🪄 Автоматические улучшения
          </h4>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            AI предлагает автоматически улучшить фото:
          </p>
          {aiPhotoAnalyzer.suggestAutoEnhancements(analysis).map((enhancement, index) => (
            <div key={index} style={{
              marginTop: '10px',
              padding: '10px',
              background: 'white',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#333'
            }}>
              • {enhancement.description}
            </div>
          ))}
        </div>
      )}

      {/* Кнопки действий */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            const reportText = `Анализ фото "${dishInfo.name || 'блюда'}":\n\nОбщий балл: ${analysis.overall.score}/100\n\nРекомендации:\n${analysis.recommendations.map(r => `• ${r.message}: ${r.action}`).join('\n')}`;
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

        <button
          onClick={analyzePhoto}
          style={{
            background: 'linear-gradient(135deg, #ff9800, #f57c00)',
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
          🔄 Пере-анализировать
        </button>

        {analysis.overall.score >= 70 && (
          <button
            onClick={() => {
              showSuccess('Фото одобрено! Можно публиковать.');
              if (onClose) onClose();
            }}
            style={{
              background: 'linear-gradient(135deg, #4caf50, #45a049)',
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
            ✅ Одобрить фото
          </button>
        )}
      </div>

      {/* Подсказка */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '8px',
        border: '1px solid #667eea'
      }}>
        <p style={{
          margin: '0',
          color: '#666',
          fontSize: '12px',
          fontStyle: 'italic'
        }}>
          💡 <strong>Совет:</strong> Для лучших результатов фотографируйте блюдо при естественном освещении, размещайте его в центре кадра и убедитесь, что фото четкое!
        </p>
      </div>
    </div>
  );
};

export default AIPhotoAnalyzer;
