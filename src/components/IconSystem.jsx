import React from 'react';

const IconSystem = ({ 
  name, 
  size = 24, 
  color = '#2c3e50', 
  animated = false, 
  className = '',
  style = {},
  onClick
}) => {
  const iconStyle = {
    width: size,
    height: size,
    color: color,
    cursor: onClick ? 'pointer' : 'default',
    transition: animated ? 'all 0.3s ease' : 'none',
    display: 'inline-block',
    ...style
  };

  const handleMouseEnter = (e) => {
    if (animated && onClick) {
      e.target.style.transform = 'scale(1.1) rotate(5deg)';
      e.target.style.filter = 'brightness(1.2)';
    }
  };

  const handleMouseLeave = (e) => {
    if (animated && onClick) {
      e.target.style.transform = 'scale(1) rotate(0deg)';
      e.target.style.filter = 'brightness(1)';
    }
  };

  const icons = {
    // Основные навигационные иконки
    home: '🏠',
    menu: '🍽️',
    orders: '📋',
    notifications: '🔔',
    profile: '👤',
    settings: '⚙️',
    logout: '🚪',
    
    // Кулинарные иконки
    chef: '👨‍🍳',
    cooking: '👩‍🍳',
    kitchen: '🍳',
    recipe: '📖',
    ingredients: '🥕',
    shopping: '🛒',
    delivery: '🚚',
    pickup: '📦',
    
    // Категории блюд
    tatar: '🥟',
    russian: '🥘',
    european: '🍝',
    asian: '🍜',
    desserts: '🍰',
    beverages: '🥤',
    soups: '🍲',
    salads: '🥗',
    meat: '🥩',
    fish: '🐟',
    vegetarian: '🥬',
    vegan: '🌱',
    
    // Статусы и действия
    pending: '⏳',
    confirmed: '✅',
    preparing: '👨‍🍳',
    ready: '🍽️',
    delivered: '🚚',
    cancelled: '❌',
    completed: '🎉',
    
    // Фильтры и поиск
    search: '🔍',
    filter: '🔧',
    sort: '📊',
    starIcon: '⭐',
    heart: '❤️',
    like: '👍',
    dislike: '👎',
    
    // Платежи и финансы
    card: '💳',
    cash: '💵',
    wallet: '👛',
    price: '💰',
    discount: '🏷️',
    
    // Коммуникация
    chat: '💬',
    message: '📨',
    call: '📞',
    video: '📹',
    email: '📧',
    
    // Технические
    refresh: '🔄',
    edit: '✏️',
    delete: '🗑️',
    add: '➕',
    remove: '➖',
    close: '❌',
    back: '⬅️',
    next: '➡️',
    up: '⬆️',
    down: '⬇️',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    
    // Специальные
    ai: '🤖',
    magic: '✨',
    fire: '🔥',
    clock: '⏰',
    calendar: '📅',
    location: '📍',
    map: '🗺️',
    phone: '📱',
    computer: '💻',
    tablet: '📱',
    
    // Эмоции и реакции
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    thinking: '🤔',
    wink: '😉',
    cool: '😎',
    love: '😍',
    
    // Сезонные и праздничные
    christmas: '🎄',
    newyear: '🎊',
    birthday: '🎂',
    valentine: '💕',
    halloween: '🎃',
    easter: '🐰',
    
    // Спорт и активность
    fitness: '💪',
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    yoga: '🧘',
    
    // Природа
    sun: '☀️',
    moon: '🌙',
    star: '⭐',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    tree: '🌳',
    flower: '🌸',
    
    // Еда и напитки
    coffee: '☕',
    tea: '🍵',
    water: '💧',
    juice: '🧃',
    wine: '🍷',
    beer: '🍺',
    cocktail: '🍸',
    cake: '🎂',
    cookie: '🍪',
    icecream: '🍦',
    pizza: '🍕',
    burger: '🍔',
    hotdog: '🌭',
    sandwich: '🥪',
    taco: '🌮',
    sushi: '🍣',
    ramen: '🍜',
    pasta: '🍝',
    rice: '🍚',
    bread: '🍞',
    cheese: '🧀',
    egg: '🥚',
    milk: '🥛',
    yogurt: '🥛',
    honey: '🍯',
    salt: '🧂',
    pepper: '🫑',
    garlic: '🧄',
    onion: '🧅',
    tomato: '🍅',
    potato: '🥔',
    carrot: '🥕',
    corn: '🌽',
    bellPepper: '🫑',
    cucumber: '🥒',
    lettuce: '🥬',
    spinach: '🥬',
    broccoli: '🥦',
    mushroom: '🍄',
    avocado: '🥑',
    olive: '🫒',
    coconut: '🥥',
    banana: '🍌',
    apple: '🍎',
    pear: '🍐',
    peach: '🍑',
    cherry: '🍒',
    strawberry: '🍓',
    grape: '🍇',
    watermelon: '🍉',
    pineapple: '🍍',
    mango: '🥭',
    kiwi: '🥝',
    lemon: '🍋',
    orange: '🍊',
    tangerine: '🍊',
    melon: '🍈',
    grapes: '🍇'
  };

  const icon = icons[name] || '❓';

  return (
    <span
      className={className}
      style={iconStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={name}
    >
      {icon}
    </span>
  );
};

export default IconSystem;
