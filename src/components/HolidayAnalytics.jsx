import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const HolidayAnalytics = ({ onClose }) => {
  const [holidayData, setHolidayData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null); // eslint-disable-line no-unused-vars
  const [selectedRegion, setSelectedRegion] = useState('all'); // 'all', 'Россия', 'Татарстан'
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess } = useToast();

  // База данных праздников России и Татарстана с традиционными блюдами
  const holidaysDatabase = useMemo(() => ({
    // РОССИЙСКИЕ ПРАЗДНИКИ
    'новый год': {
      name: 'Новый год',
      date: '31 декабря - 1 января',
      description: 'Главный праздник года',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Оливье', description: 'Классический салат оливье', price: 280, category: 'салат', emoji: '🥗' },
        { name: 'Селедка под шубой', description: 'Традиционный салат с селедкой', price: 320, category: 'салат', emoji: '🐟' },
        { name: 'Мандарины', description: 'Свежие мандарины', price: 150, category: 'фрукты', emoji: '🍊' },
        { name: 'Шампанское', description: 'Игристое вино для праздника', price: 800, category: 'напиток', emoji: '🍾' },
        { name: 'Торт', description: 'Праздничный торт', price: 1200, category: 'десерт', emoji: '🎂' }
      ],
      recommendations: [
        'Оливье и селедка под шубой - обязательные блюда',
        'Мандарины создают праздничное настроение',
        'Шампанское - символ Нового года',
        'Торт завершит праздничную трапезу'
      ],
      colors: ['#667eea', '#764ba2', '#9c88ff'],
      background: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    'рождество': {
      name: 'Рождество Христово',
      date: '7 января',
      description: 'Православное Рождество',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Кутья', description: 'Рождественская каша с медом и орехами', price: 250, category: 'каша', emoji: '🍯' },
        { name: 'Сочиво', description: 'Постное блюдо из зерен', price: 200, category: 'каша', emoji: '🌾' },
        { name: 'Взвар', description: 'Компот из сухофруктов', price: 150, category: 'напиток', emoji: '🥤' },
        { name: 'Пряники', description: 'Рождественские пряники', price: 300, category: 'десерт', emoji: '🍪' },
        { name: 'Колядки', description: 'Рождественские печенья', price: 180, category: 'выпечка', emoji: '🍪' }
      ],
      recommendations: [
        'Кутья - главное блюдо Рождества',
        'Сочиво готовят в сочельник',
        'Взвар символизирует изобилие',
        'Пряники - традиционное угощение'
      ],
      colors: ['#e91e63', '#f06292', '#f8bbd9'],
      background: 'linear-gradient(135deg, #e91e63, #f06292)'
    },
    'старый новый год': {
      name: 'Старый Новый год',
      date: '14 января',
      description: 'Новый год по старому стилю',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Вареники', description: 'Вареники с творогом', price: 220, category: 'выпечка', emoji: '🥟' },
        { name: 'Кутья', description: 'Новогодняя кутья', price: 250, category: 'каша', emoji: '🍯' },
        { name: 'Блины', description: 'Традиционные блины', price: 180, category: 'выпечка', emoji: '🥞' },
        { name: 'Мед', description: 'Натуральный мед', price: 300, category: 'десерт', emoji: '🍯' },
        { name: 'Чай', description: 'Горячий чай', price: 80, category: 'напиток', emoji: '☕' }
      ],
      recommendations: [
        'Вареники - символ достатка',
        'Кутья приносит благополучие',
        'Блины символизируют солнце',
        'Мед - сладкая жизнь'
      ],
      colors: ['#9c27b0', '#ba68c8', '#ce93d8'],
      background: 'linear-gradient(135deg, #9c27b0, #ba68c8)'
    },
    'масленица': {
      name: 'Масленица',
      date: 'Февраль-март',
      description: 'Проводы зимы и встреча весны',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Блины', description: 'Традиционные русские блины', price: 180, category: 'выпечка', emoji: '🥞' },
        { name: 'Сметана', description: 'Домашняя сметана для блинов', price: 120, category: 'молочные', emoji: '🥛' },
        { name: 'Варенье', description: 'Домашнее варенье', price: 200, category: 'десерт', emoji: '🍯' },
        { name: 'Мед', description: 'Натуральный мед', price: 300, category: 'десерт', emoji: '🍯' },
        { name: 'Чай', description: 'Горячий чай', price: 80, category: 'напиток', emoji: '☕' }
      ],
      recommendations: [
        'Блины - главное блюдо Масленицы',
        'Сметана и варенье - обязательные добавки',
        'Мед придает блинам особый вкус',
        'Чай согреет в холодную погоду'
      ],
      colors: ['#FF9800', '#FFB74D', '#FFCC02'],
      background: 'linear-gradient(135deg, #FF9800, #FFB74D)'
    },
    '8 марта': {
      name: '8 марта',
      date: '8 марта',
      description: 'Международный женский день',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Торт', description: 'Сладкий торт для прекрасных дам', price: 1200, category: 'десерт', emoji: '🎂' },
        { name: 'Конфеты', description: 'Шоколадные конфеты', price: 350, category: 'десерт', emoji: '🍫' },
        { name: 'Фрукты', description: 'Свежие фрукты', price: 200, category: 'фрукты', emoji: '🍓' },
        { name: 'Шампанское', description: 'Игристое вино', price: 800, category: 'напиток', emoji: '🍾' },
        { name: 'Цветы', description: 'Букет цветов', price: 500, category: 'подарок', emoji: '🌹' }
      ],
      recommendations: [
        'Торт - главный подарок для женщин',
        'Конфеты создают сладкое настроение',
        'Фрукты - полезное и красивое угощение',
        'Шампанское - символ праздника'
      ],
      colors: ['#ff6b6b', '#ff8e53', '#ffa726'],
      background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)'
    },
    'пасха': {
      name: 'Пасха',
      date: 'Апрель-май',
      description: 'Православная Пасха',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Кулич', description: 'Пасхальный кулич', price: 400, category: 'выпечка', emoji: '🍞' },
        { name: 'Пасха', description: 'Творожная пасха', price: 350, category: 'десерт', emoji: '🧀' },
        { name: 'Крашеные яйца', description: 'Пасхальные яйца', price: 150, category: 'закуска', emoji: '🥚' },
        { name: 'Курица', description: 'Запеченная курица', price: 500, category: 'мясо', emoji: '🍗' },
        { name: 'Вино', description: 'Красное вино', price: 600, category: 'напиток', emoji: '🍷' }
      ],
      recommendations: [
        'Кулич - главный символ Пасхи',
        'Пасха готовится из творога',
        'Крашеные яйца символизируют воскресение',
        'Курица - традиционное мясное блюдо'
      ],
      colors: ['#4caf50', '#66bb6a', '#81c784'],
      background: 'linear-gradient(135deg, #4caf50, #66bb6a)'
    },
    'день победы': {
      name: 'День Победы',
      date: '9 мая',
      description: 'День Победы в Великой Отечественной войне',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Солдатская каша', description: 'Перловая каша с мясом', price: 200, category: 'каша', emoji: '🍚' },
        { name: 'Тушенка', description: 'Тушеная говядина', price: 300, category: 'мясо', emoji: '🥫' },
        { name: 'Хлеб', description: 'Черный хлеб', price: 80, category: 'выпечка', emoji: '🍞' },
        { name: 'Водка', description: 'Русская водка', price: 400, category: 'напиток', emoji: '🍺' },
        { name: 'Конфеты', description: 'Военные конфеты', price: 250, category: 'десерт', emoji: '🍬' }
      ],
      recommendations: [
        'Солдатская каша - символ военного времени',
        'Тушенка - армейская еда',
        'Хлеб - основа солдатского рациона',
        'Водка - за Победу!'
      ],
      colors: ['#f44336', '#ef5350', '#ffcdd2'],
      background: 'linear-gradient(135deg, #f44336, #ef5350)'
    },
    'день россии': {
      name: 'День России',
      date: '12 июня',
      description: 'День независимости России',
      region: 'Россия',
      traditionalDishes: [
        { name: 'Борщ', description: 'Традиционный русский борщ', price: 280, category: 'суп', emoji: '🍲' },
        { name: 'Пельмени', description: 'Русские пельмени', price: 320, category: 'выпечка', emoji: '🥟' },
        { name: 'Квас', description: 'Традиционный квас', price: 120, category: 'напиток', emoji: '🥤' },
        { name: 'Мед', description: 'Русский мед', price: 300, category: 'десерт', emoji: '🍯' },
        { name: 'Пряники', description: 'Тульские пряники', price: 200, category: 'десерт', emoji: '🍪' }
      ],
      recommendations: [
        'Борщ - визитная карточка русской кухни',
        'Пельмени - национальное блюдо',
        'Квас - традиционный напиток',
        'Мед и пряники - русские сладости'
      ],
      colors: ['#2196f3', '#42a5f5', '#64b5f6'],
      background: 'linear-gradient(135deg, #2196f3, #42a5f5)'
    },

    // ТАТАРСТАНСКИЕ ПРАЗДНИКИ
    'навруз': {
      name: 'Навруз',
      date: '21 марта',
      description: 'Праздник весны и обновления',
      region: 'Татарстан',
      traditionalDishes: [
        { name: 'Сумаляк', description: 'Традиционная сладость из пророщенных зерен пшеницы', price: 450, category: 'десерт', emoji: '🌾' },
        { name: 'Халва', description: 'Восточная сладость из семян подсолнечника', price: 320, category: 'десерт', emoji: '🍯' },
        { name: 'Плов с сухофруктами', description: 'Плов с изюмом, курагой и орехами', price: 380, category: 'основное', emoji: '🍚' },
        { name: 'Компот из сухофруктов', description: 'Традиционный напиток из сушеных фруктов', price: 150, category: 'напиток', emoji: '🥤' },
        { name: 'Орехи и сухофрукты', description: 'Смесь орехов и сушеных фруктов', price: 280, category: 'закуска', emoji: '🥜' }
      ],
      recommendations: [
        'Начните день с зеленого чая и сухофруктов',
        'Сумаляк лучше всего есть утром натощак',
        'Плов с сухофруктами - главное блюдо праздника',
        'Не забудьте про компот - он символизирует обновление'
      ],
      colors: ['#4CAF50', '#66BB6A', '#81C784'],
      background: 'linear-gradient(135deg, #4CAF50, #66BB6A)'
    },
    'ураза': {
      name: 'Ураза-байрам',
      date: 'Конец Рамадана',
      description: 'Праздник разговения после поста',
      region: 'Татарстан',
      traditionalDishes: [
        { name: 'Финики', description: 'Сладкие финики для разговения', price: 200, category: 'закуска', emoji: '🌴' },
        { name: 'Халва', description: 'Восточная сладость', price: 320, category: 'десерт', emoji: '🍯' },
        { name: 'Плов с мясом', description: 'Традиционный плов с бараниной', price: 450, category: 'основное', emoji: '🍚' },
        { name: 'Самса', description: 'Пирожки с мясом и луком', price: 180, category: 'выпечка', emoji: '🥟' },
        { name: 'Чай с молоком', description: 'Традиционный чай с молоком', price: 80, category: 'напиток', emoji: '☕' }
      ],
      recommendations: [
        'Начните разговение с фиников и воды',
        'Плов с мясом - главное блюдо праздника',
        'Самса отлично подходит для угощения гостей',
        'Чай с молоком завершит трапезу'
      ],
      colors: ['#2196F3', '#42A5F5', '#64B5F6'],
      background: 'linear-gradient(135deg, #2196F3, #42A5F5)'
    },
    'курбан': {
      name: 'Курбан-байрам',
      date: '70 дней после Ураза-байрам',
      description: 'Праздник жертвоприношения',
      region: 'Татарстан',
      traditionalDishes: [
        { name: 'Курбан-эт', description: 'Мясо жертвенного животного', price: 600, category: 'мясо', emoji: '🥩' },
        { name: 'Плов с бараниной', description: 'Плов с мясом жертвенного барана', price: 500, category: 'основное', emoji: '🍚' },
        { name: 'Самса с мясом', description: 'Пирожки с мясом', price: 200, category: 'выпечка', emoji: '🥟' },
        { name: 'Чай', description: 'Крепкий чай', price: 80, category: 'напиток', emoji: '☕' },
        { name: 'Халва', description: 'Сладкая халва', price: 320, category: 'десерт', emoji: '🍯' }
      ],
      recommendations: [
        'Курбан-эт - главное блюдо праздника',
        'Плов готовят из мяса жертвенного животного',
        'Самса - традиционная выпечка',
        'Чай подают в конце трапезы'
      ],
      colors: ['#795548', '#8d6e63', '#a1887f'],
      background: 'linear-gradient(135deg, #795548, #8d6e63)'
    },
    'сабантуй': {
      name: 'Сабантуй',
      date: 'Июнь',
      description: 'Праздник плуга и урожая',
      region: 'Татарстан',
      traditionalDishes: [
        { name: 'Эчпочмак', description: 'Треугольные пирожки с мясом', price: 250, category: 'выпечка', emoji: '🥟' },
        { name: 'Бэлиш', description: 'Большой пирог с мясом и картошкой', price: 400, category: 'выпечка', emoji: '🥧' },
        { name: 'Чак-чак', description: 'Татарская сладость', price: 350, category: 'десерт', emoji: '🍯' },
        { name: 'Кумыс', description: 'Кисломолочный напиток', price: 200, category: 'напиток', emoji: '🥛' },
        { name: 'Мед', description: 'Липовый мед', price: 300, category: 'десерт', emoji: '🍯' }
      ],
      recommendations: [
        'Эчпочмак - символ Сабантуя',
        'Бэлиш готовят для большого стола',
        'Чак-чак - главная сладость праздника',
        'Кумыс - традиционный напиток'
      ],
      colors: ['#ff9800', '#ffb74d', '#ffcc02'],
      background: 'linear-gradient(135deg, #ff9800, #ffb74d)'
    },
    'день республики': {
      name: 'День Республики Татарстан',
      date: '30 августа',
      description: 'День образования Республики Татарстан',
      region: 'Татарстан',
      traditionalDishes: [
        { name: 'Азу', description: 'Традиционное татарское мясное блюдо', price: 450, category: 'мясо', emoji: '🥩' },
        { name: 'Плов', description: 'Классический татарский плов', price: 380, category: 'основное', emoji: '🍚' },
        { name: 'Бэккен', description: 'Татарские пирожки', price: 200, category: 'выпечка', emoji: '🥟' },
        { name: 'Чай', description: 'Татарский чай с молоком', price: 80, category: 'напиток', emoji: '☕' },
        { name: 'Чак-чак', description: 'Национальная сладость', price: 350, category: 'десерт', emoji: '🍯' }
      ],
      recommendations: [
        'Азу - гордость татарской кухни',
        'Плов готовят по старинным рецептам',
        'Бэккен - традиционная выпечка',
        'Чак-чак - сладкий символ Татарстана'
      ],
      colors: ['#3f51b5', '#5c6bc0', '#7986cb'],
      background: 'linear-gradient(135deg, #3f51b5, #5c6bc0)'
    },
    'день конституции': {
      name: 'День Конституции Татарстана',
      date: '6 ноября',
      description: 'День принятия Конституции РТ',
      region: 'Татарстан',
      traditionalDishes: [
        { name: 'Кыстыбый', description: 'Татарские лепешки с начинкой', price: 180, category: 'выпечка', emoji: '🥞' },
        { name: 'Токмач', description: 'Татарская лапша', price: 220, category: 'суп', emoji: '🍜' },
        { name: 'Губадия', description: 'Слоеный пирог с рисом и мясом', price: 350, category: 'выпечка', emoji: '🥧' },
        { name: 'Чай', description: 'Крепкий татарский чай', price: 80, category: 'напиток', emoji: '☕' },
        { name: 'Мед', description: 'Цветочный мед', price: 300, category: 'десерт', emoji: '🍯' }
      ],
      recommendations: [
        'Кыстыбый - простое и сытное блюдо',
        'Токмач - традиционная лапша',
        'Губадия - праздничный пирог',
        'Чай с медом - завершение трапезы'
      ],
      colors: ['#607d8b', '#78909c', '#90a4ae'],
      background: 'linear-gradient(135deg, #607d8b, #78909c)'
    }
  }), []);

  // Определение ближайшего праздника
  const getNextHoliday = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const holidays = [
      // Российские праздники
      { key: 'новый год', date: new Date(currentYear, 11, 31) },
      { key: 'рождество', date: new Date(currentYear, 0, 7) },
      { key: 'старый новый год', date: new Date(currentYear, 0, 14) },
      { key: 'масленица', date: new Date(currentYear, 1, 15) }, // Примерная дата
      { key: '8 марта', date: new Date(currentYear, 2, 8) },
      { key: 'пасха', date: new Date(currentYear, 3, 15) }, // Примерная дата
      { key: 'день победы', date: new Date(currentYear, 4, 9) },
      { key: 'день россии', date: new Date(currentYear, 5, 12) },
      
      // Татарстанские праздники
      { key: 'навруз', date: new Date(currentYear, 2, 21) },
      { key: 'ураза', date: new Date(currentYear, 4, 15) }, // Примерная дата
      { key: 'курбан', date: new Date(currentYear, 6, 15) }, // Примерная дата
      { key: 'сабантуй', date: new Date(currentYear, 5, 15) }, // Примерная дата
      { key: 'день республики', date: new Date(currentYear, 7, 30) },
      { key: 'день конституции', date: new Date(currentYear, 10, 6) }
    ];

    // Если Новый год уже прошел, берем следующий год
    if (now > holidays[0].date) {
      holidays[0].date = new Date(currentYear + 1, 11, 31);
    }

    // Сортируем по дате и находим ближайший
    const sortedHolidays = holidays.sort((a, b) => a.date - b.date);
    const nextHoliday = sortedHolidays.find(holiday => holiday.date > now);
    
    return nextHoliday ? nextHoliday.key : 'новый год';
  };

  // Анализ праздничных предпочтений
  const analyzeHolidayPreferences = useCallback(() => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const nextHoliday = getNextHoliday();
      const holiday = holidaysDatabase[nextHoliday];
      
      // Фильтруем по региону, если выбран конкретный регион
      if (selectedRegion !== 'all' && holiday.region !== selectedRegion) {
        // Ищем ближайший праздник в выбранном регионе
        const regionHolidays = Object.entries(holidaysDatabase)
          .filter(([key, data]) => data.region === selectedRegion)
          .map(([key, data]) => ({ key, ...data }));
        
        if (regionHolidays.length > 0) {
          const now = new Date();
          const currentYear = now.getFullYear();
          
          // Создаем даты для праздников выбранного региона
          const regionHolidayDates = regionHolidays.map(holiday => {
            const dateMap = {
              'новый год': new Date(currentYear, 11, 31),
              'рождество': new Date(currentYear, 0, 7),
              'старый новый год': new Date(currentYear, 0, 14),
              'масленица': new Date(currentYear, 1, 15),
              '8 марта': new Date(currentYear, 2, 8),
              'пасха': new Date(currentYear, 3, 15),
              'день победы': new Date(currentYear, 4, 9),
              'день россии': new Date(currentYear, 5, 12),
              'навруз': new Date(currentYear, 2, 21),
              'ураза': new Date(currentYear, 4, 15),
              'курбан': new Date(currentYear, 6, 15),
              'сабантуй': new Date(currentYear, 5, 15),
              'день республики': new Date(currentYear, 7, 30),
              'день конституции': new Date(currentYear, 10, 6)
            };
            
            return {
              key: holiday.key,
              date: dateMap[holiday.key] || new Date(),
              ...holiday
            };
          });
          
          // Если Новый год уже прошел, берем следующий год
          const newYearIndex = regionHolidayDates.findIndex(h => h.key === 'новый год');
          if (newYearIndex !== -1 && now > regionHolidayDates[newYearIndex].date) {
            regionHolidayDates[newYearIndex].date = new Date(currentYear + 1, 11, 31);
          }
          
          // Сортируем по дате и находим ближайший
          const sortedRegionHolidays = regionHolidayDates.sort((a, b) => a.date - b.date);
          const nextRegionHoliday = sortedRegionHolidays.find(holiday => holiday.date > now);
          
          if (nextRegionHoliday) {
            setHolidayData(holidaysDatabase[nextRegionHoliday.key]);
            setSelectedHoliday(nextRegionHoliday.key);
          } else {
            // Если все праздники региона прошли, берем первый в следующем году
            setHolidayData(holidaysDatabase[sortedRegionHolidays[0].key]);
            setSelectedHoliday(sortedRegionHolidays[0].key);
          }
        } else {
          setHolidayData(holiday);
          setSelectedHoliday(nextHoliday);
        }
      } else {
        setHolidayData(holiday);
        setSelectedHoliday(nextHoliday);
      }
      
      setIsAnalyzing(false);
      
      const regionText = selectedRegion !== 'all' ? ` (${selectedRegion})` : '';
      showSuccess(`Анализ завершен! Ближайший праздник${regionText}: ${holidayData?.name || holiday.name}`);
    }, 2000);
  }, [selectedRegion, showSuccess, holidayData?.name, holidaysDatabase]);

  // Генерация праздничного меню
  const generateHolidayMenu = () => {
    if (!holidayData) return;
    
    const menu = holidayData.traditionalDishes.map(dish => ({
      ...dish,
      id: Date.now() + Math.random(),
      quantity: 1
    }));
    
    // Сохраняем в localStorage для использования в корзине
    localStorage.setItem('holidayMenu', JSON.stringify(menu));
    showSuccess(`Праздничное меню "${holidayData.name}" сохранено!`);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    analyzeHolidayPreferences();
  }, [analyzeHolidayPreferences]);

  return (
    <div className="holiday-analytics-container" style={{
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(102, 126, 234, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Декоративные элементы */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
        borderRadius: '50%',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(45deg, rgba(118, 75, 162, 0.1), rgba(102, 126, 234, 0.1))',
        borderRadius: '50%',
        zIndex: 1
      }}></div>
      
      <div className="holiday-analytics-header" style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => onClose ? onClose() : navigate('/client/menu')}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #495057)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
            }}
          >
            ← {t.common.back}
          </button>
          <h3 style={{ 
            margin: 0, 
            color: '#2d3748', 
            fontSize: '20px', 
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            filter: 'brightness(1.3)'
          }}>🎉 AI-аналитика праздников</h3>
        </div>
        
        {/* Кнопки выбора региона */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setSelectedRegion('all')}
            style={{
              background: selectedRegion === 'all' ? '#f8f9fa' : '#ffffff',
              color: selectedRegion === 'all' ? '#333333' : '#666666',
              border: selectedRegion === 'all' ? '2px solid #007bff' : '2px solid #dee2e6',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            🌍 Все регионы
          </button>
          <button
            onClick={() => setSelectedRegion('Россия')}
            style={{
              background: selectedRegion === 'Россия' ? '#f8f9fa' : '#ffffff',
              color: selectedRegion === 'Россия' ? '#333333' : '#666666',
              border: selectedRegion === 'Россия' ? '2px solid #dc3545' : '2px solid #dee2e6',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            🇷🇺 Россия
          </button>
          <button
            onClick={() => setSelectedRegion('Татарстан')}
            style={{
              background: selectedRegion === 'Татарстан' ? '#f8f9fa' : '#ffffff',
              color: selectedRegion === 'Татарстан' ? '#333333' : '#666666',
              border: selectedRegion === 'Татарстан' ? '2px solid #28a745' : '2px solid #dee2e6',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            🏛️ Татарстан
          </button>
        </div>
        <button
          onClick={analyzeHolidayPreferences}
          disabled={isAnalyzing}
          style={{
            background: isAnalyzing ? '#f8f9fa' : '#ffffff',
            color: isAnalyzing ? '#6c757d' : '#333333',
            border: isAnalyzing ? '2px solid #dee2e6' : '2px solid #007bff',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isAnalyzing) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              e.target.style.background = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            if (!isAnalyzing) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              e.target.style.background = '#ffffff';
            }
          }}
        >
          {isAnalyzing ? '🔄 Анализирую...' : '🧠 Анализировать праздники'}
        </button>
      </div>

      {holidayData && (
        <div className="holiday-content" style={{
          background: holidayData.background,
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '15px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              filter: 'brightness(1.3)',
              color: '#2d3748'
            }}>
              {holidayData.region}
            </div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '28px', 
              marginBottom: '10px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              filter: 'brightness(1.3)'
            }}>
              {holidayData.name}
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: '16px', 
              opacity: 1,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              filter: 'brightness(1.3)'
            }}>
              {holidayData.date} • {holidayData.description}
            </p>
          </div>

          <div className="holiday-dishes" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {holidayData.traditionalDishes.map((dish, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '15px',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{dish.emoji}</span>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    filter: 'brightness(1.3)'
                  }}>{dish.price}₽</span>
                </div>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '5px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  filter: 'brightness(1.3)'
                }}>
                  {dish.name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 1, 
                  marginBottom: '5px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  filter: 'brightness(1.3)'
                }}>
                  {dish.description}
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  filter: 'brightness(1.3)',
                  fontWeight: 'bold'
                }}>
                  {dish.category}
                </div>
              </div>
            ))}
          </div>

          <div className="holiday-recommendations" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '18px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              filter: 'brightness(1.3)'
            }}>💡 Рекомендации AI:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {holidayData.recommendations.map((rec, index) => (
                <li key={index} style={{ 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  filter: 'brightness(1.3)'
                }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={generateHolidayMenu}
              style={{
                background: '#ffffff',
                color: '#333333',
                border: '2px solid #007bff',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              🍽️ Создать праздничное меню
            </button>
          </div>
        </div>
      )}

      {!holidayData && !isAnalyzing && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#4a5568',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
          <div style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>AI-аналитика праздников</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Нажмите кнопку для анализа ближайших праздников</div>
        </div>
      )}
    </div>
  );
};

export default HolidayAnalytics;
