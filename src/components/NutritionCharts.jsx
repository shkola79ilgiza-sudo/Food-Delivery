// Компонент графиков и визуализации БЖУ и калорий
// Показывает круговые диаграммы, линейные графики и цветовые индикаторы

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../App.css';

const NutritionCharts = ({ orderHistory = [], timeRange = 'week' }) => {
  const { t } = useLanguage();
  const [selectedChart, setSelectedChart] = useState('macros'); // macros, calories, trends
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange);

  // Обработка данных заказов
  const processedData = useMemo(() => {
    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      year: 365
    };
    
    const daysBack = periods[selectedPeriod] || 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const filteredOrders = orderHistory.filter(order => {
      const orderDate = new Date(order.date || order.createdAt);
      return orderDate >= startDate;
    });

    // Агрегация данных по дням
    const dailyData = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          orders: 0
        };
      }
      
      dailyData[date].calories += order.calories || 0;
      dailyData[date].protein += order.protein || 0;
      dailyData[date].carbs += order.carbs || 0;
      dailyData[date].fat += order.fat || 0;
      dailyData[date].orders += 1;
    });

    // Общие итоги
    const totals = Object.values(dailyData).reduce((acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
      orders: acc.orders + day.orders
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, orders: 0 });

    // Средние значения
    const daysCount = Object.keys(dailyData).length || 1;
    const averages = {
      calories: Math.round(totals.calories / daysCount),
      protein: Math.round(totals.protein / daysCount),
      carbs: Math.round(totals.carbs / daysCount),
      fat: Math.round(totals.fat / daysCount)
    };

    // Данные для графиков
    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      totals,
      averages,
      chartData,
      dailyData: Object.values(dailyData)
    };
  }, [orderHistory, selectedPeriod]);

  // Расчет процентов для круговой диаграммы
  const macroPercentages = useMemo(() => {
    const { protein, carbs, fat } = processedData.totals;
    const total = protein + carbs + fat;
    
    if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round((protein / total) * 100),
      carbs: Math.round((carbs / total) * 100),
      fat: Math.round((fat / total) * 100)
    };
  }, [processedData.totals]);

  // Цветовые индикаторы
  const getCalorieStatus = (calories) => {
    if (calories < 1200) return { color: '#4CAF50', status: 'Мало', icon: '🟢' };
    if (calories < 2000) return { color: '#FF9800', status: 'Норма', icon: '🟡' };
    return { color: '#F44336', status: 'Много', icon: '🔴' };
  };

  const getMacroStatus = (macro, type) => {
    const ranges = {
      protein: { low: 50, high: 150 },
      carbs: { low: 100, high: 300 },
      fat: { low: 30, high: 80 }
    };
    
    const range = ranges[type];
    if (macro < range.low) return { color: '#4CAF50', status: 'Мало' };
    if (macro > range.high) return { color: '#F44336', status: 'Много' };
    return { color: '#FF9800', status: 'Норма' };
  };

  // Компонент круговой диаграммы
  const PieChart = ({ data, size = 200 }) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    
    let currentAngle = 0;
    const segments = [
      { name: 'Белки', value: data.protein, color: '#4CAF50' },
      { name: 'Углеводы', value: data.carbs, color: '#2196F3' },
      { name: 'Жиры', value: data.fat, color: '#FF9800' }
    ];

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {segments.map((segment, index) => {
            const percentage = segment.value / 100;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -currentAngle * circumference / 360;
            
            currentAngle += percentage * 360;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'all 0.5s ease' }}
              />
            );
          })}
        </svg>
        
        {/* Центральный текст */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {processedData.totals.calories}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>ккал</div>
        </div>
      </div>
    );
  };

  // Компонент линейного графика
  const LineChart = ({ data, type }) => {
    const maxValue = Math.max(...data.map(d => d[type]));
    const minValue = Math.min(...data.map(d => d[type]));
    const range = maxValue - minValue || 1;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 100 - ((point[type] - minValue) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ width: '100%', height: '120px', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox="0 0 300 100">
          {/* Сетка */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="300"
              y2={y}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Линия графика */}
          <polyline
            points={points}
            fill="none"
            stroke={type === 'calories' ? '#F44336' : type === 'protein' ? '#4CAF50' : '#2196F3'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Точки данных */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 300;
            const y = 100 - ((point[type] - minValue) / range) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={type === 'calories' ? '#F44336' : type === 'protein' ? '#4CAF50' : '#2196F3'}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </svg>
        
        {/* Подписи осей */}
        <div style={{ 
          position: 'absolute', 
          bottom: '-20px', 
          left: '0', 
          right: '0',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#666'
        }}>
          {data.map((point, index) => (
            <span key={index}>{point.date}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="nutrition-charts-container" style={{ padding: '20px' }}>
      {/* Заголовок и переключатели */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>📊 Анализ питания</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Переключатель периода */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
          
          {/* Переключатель типа графика */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {[
              { key: 'macros', label: 'БЖУ', icon: '🥗' },
              { key: 'calories', label: 'Калории', icon: '🔥' },
              { key: 'trends', label: 'Тренды', icon: '📈' }
            ].map(chart => (
              <button
                key={chart.key}
                onClick={() => setSelectedChart(chart.key)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: selectedChart === chart.key ? '#2196F3' : 'white',
                  color: selectedChart === chart.key ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{chart.icon}</span>
                {chart.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Круговая диаграмма БЖУ */}
        {selectedChart === 'macros' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Распределение БЖУ</h3>
            <PieChart data={macroPercentages} />
            
            {/* Легенда */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { name: 'Белки', value: macroPercentages.protein, color: '#4CAF50' },
                { name: 'Углеводы', value: macroPercentages.carbs, color: '#2196F3' },
                { name: 'Жиры', value: macroPercentages.fat, color: '#FF9800' }
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }} />
                  <span style={{ fontSize: '14px' }}>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* График калорий */}
        {selectedChart === 'calories' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Калории по дням</h3>
            <LineChart data={processedData.chartData} type="calories" />
          </div>
        )}

        {/* Тренды */}
        {selectedChart === 'trends' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Тренды БЖУ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { type: 'protein', name: 'Белки', color: '#4CAF50' },
                { type: 'carbs', name: 'Углеводы', color: '#2196F3' },
                { type: 'fat', name: 'Жиры', color: '#FF9800' }
              ].map(macro => (
                <div key={macro.type}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '5px' 
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{macro.name}</span>
                    <span style={{ fontSize: '14px', color: macro.color }}>
                      {processedData.averages[macro.type]}г/день
                    </span>
                  </div>
                  <LineChart data={processedData.chartData} type={macro.type} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Сводка и индикаторы */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Сводка за {selectedPeriod === 'week' ? 'неделю' : selectedPeriod === 'month' ? 'месяц' : 'год'}</h3>
          
          {/* Калории */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Калории</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {processedData.averages.calories} ккал/день
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginTop: '5px'
            }}>
              {(() => {
                const status = getCalorieStatus(processedData.averages.calories);
                return (
                  <>
                    <span style={{ fontSize: '16px' }}>{status.icon}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: status.color,
                      fontWeight: 'bold'
                    }}>
                      {status.status}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* БЖУ */}
          {['protein', 'carbs', 'fat'].map(type => {
            const names = { protein: 'Белки', carbs: 'Углеводы', fat: 'Жиры' };
            const status = getMacroStatus(processedData.averages[type], type);
            return (
              <div key={type} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{names[type]}</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {processedData.averages[type]}г/день
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginTop: '5px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: status.color
                  }} />
                  <span style={{ 
                    fontSize: '12px', 
                    color: status.color,
                    fontWeight: 'bold'
                  }}>
                    {status.status}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Общая статистика */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Общая статистика
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
              <div>Заказов: <strong>{processedData.totals.orders}</strong></div>
              <div>Дней: <strong>{processedData.chartData.length}</strong></div>
              <div>Среднее/день: <strong>{Math.round(processedData.totals.calories / processedData.chartData.length)} ккал</strong></div>
              <div>Всего: <strong>{processedData.totals.calories} ккал</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionCharts;
