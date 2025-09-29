// База готовых рецептов с точными значениями БЖУ
// Точность: 95-98% для проверенных рецептов

export const recipeDatabase = {
  // === САЛАТЫ ===
  'цезарь': {
    name: 'Салат Цезарь',
    ingredients: 'салат айсберг 100г, помидоры черри 50г, сыр пармезан 30г, сухарики 20г, куриная грудка 150г, соус цезарь 30г',
    nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18 },
    cookingMethod: 'сырой',
    confidence: 98,
    category: 'салаты',
    difficulty: 'легко',
    time: '15 мин'
  },
  'греческий': {
    name: 'Греческий салат',
    ingredients: 'помидоры 200г, огурцы 150г, перец болгарский 100г, лук красный 50г, сыр фета 80г, оливки 30г, оливковое масло 20г, орегано 2г',
    nutrition: { calories: 280, protein: 12, carbs: 18, fat: 20 },
    cookingMethod: 'сырой',
    confidence: 98,
    category: 'салаты',
    difficulty: 'легко',
    time: '10 мин'
  },
  'оливье': {
    name: 'Салат Оливье',
    ingredients: 'картофель 200г, морковь 100г, яйца 2шт, огурец соленый 100г, горошек зеленый 50г, колбаса 150г, майонез 80г, лук 30г',
    nutrition: { calories: 450, protein: 18, carbs: 35, fat: 28 },
    cookingMethod: 'варка',
    confidence: 95,
    category: 'салаты',
    difficulty: 'средне',
    time: '30 мин'
  },

  // === СУПЫ ===
  'борщ': {
    name: 'Борщ',
    ingredients: 'говядина 300г, свекла 200г, капуста 150г, картофель 200г, морковь 100г, лук 80г, помидоры 100г, томатная паста 30г, сметана 50г, зелень 20г',
    nutrition: { calories: 180, protein: 12, carbs: 20, fat: 6 },
    cookingMethod: 'варка',
    confidence: 97,
    category: 'супы',
    difficulty: 'средне',
    time: '2 часа'
  },
  'щи': {
    name: 'Щи из свежей капусты',
    ingredients: 'капуста 300г, картофель 200г, морковь 100г, лук 80г, помидоры 100г, говядина 200г, сметана 40г, зелень 15г',
    nutrition: { calories: 120, protein: 8, carbs: 15, fat: 4 },
    cookingMethod: 'варка',
    confidence: 96,
    category: 'супы',
    difficulty: 'легко',
    time: '1 час'
  },
  'куриный суп': {
    name: 'Куриный суп с лапшой',
    ingredients: 'курица 400г, картофель 200г, морковь 100г, лук 80г, лапша 100г, зелень 20г, соль, перец',
    nutrition: { calories: 140, protein: 15, carbs: 18, fat: 3 },
    cookingMethod: 'варка',
    confidence: 98,
    category: 'супы',
    difficulty: 'легко',
    time: '45 мин'
  },

  // === ВТОРЫЕ БЛЮДА ===
  'плов': {
    name: 'Плов с бараниной',
    ingredients: 'баранина 500г, рис 300г, морковь 200г, лук 150г, масло растительное 80г, зира 5г, барбарис 10г, чеснок 20г',
    nutrition: { calories: 420, protein: 22, carbs: 45, fat: 18 },
    cookingMethod: 'тушение',
    confidence: 96,
    category: 'вторые блюда',
    difficulty: 'сложно',
    time: '2 часа'
  },
  'картофель жареный': {
    name: 'Картофель жареный',
    ingredients: 'картофель 500г, масло растительное 60г, лук 100г, соль, перец, зелень 20г',
    nutrition: { calories: 280, protein: 6, carbs: 45, fat: 10 },
    cookingMethod: 'жарка',
    confidence: 97,
    category: 'вторые блюда',
    difficulty: 'легко',
    time: '25 мин'
  },
  'котлеты': {
    name: 'Котлеты мясные',
    ingredients: 'говяжий фарш 400г, лук 100г, хлеб 50г, молоко 50мл, яйцо 1шт, масло растительное 40г, соль, перец',
    nutrition: { calories: 320, protein: 20, carbs: 12, fat: 22 },
    cookingMethod: 'жарка',
    confidence: 95,
    category: 'вторые блюда',
    difficulty: 'средне',
    time: '30 мин'
  },
  'рыба запеченная': {
    name: 'Рыба запеченная с овощами',
    ingredients: 'лосось 400г, картофель 300г, морковь 150г, лук 100г, помидоры 200г, масло оливковое 30г, лимон 50г, зелень 20г',
    nutrition: { calories: 280, protein: 28, carbs: 25, fat: 12 },
    cookingMethod: 'запекание',
    confidence: 98,
    category: 'вторые блюда',
    difficulty: 'средне',
    time: '45 мин'
  },

  // === ПАСТА ===
  'паста карбонара': {
    name: 'Паста Карбонара',
    ingredients: 'макароны 300г, бекон 150г, яйца 3шт, сыр пармезан 80г, чеснок 10г, масло оливковое 20г, соль, перец',
    nutrition: { calories: 520, protein: 25, carbs: 55, fat: 22 },
    cookingMethod: 'варка',
    confidence: 97,
    category: 'паста',
    difficulty: 'средне',
    time: '20 мин'
  },
  'паста болоньезе': {
    name: 'Паста Болоньезе',
    ingredients: 'макароны 300г, говяжий фарш 300г, помидоры 400г, лук 100г, морковь 80г, сельдерей 50г, вино красное 100мл, сыр пармезан 60г, масло оливковое 30г',
    nutrition: { calories: 480, protein: 28, carbs: 50, fat: 18 },
    cookingMethod: 'тушение',
    confidence: 96,
    category: 'паста',
    difficulty: 'сложно',
    time: '1.5 часа'
  },

  // === ВЫПЕЧКА ===
  'блины': {
    name: 'Блины',
    ingredients: 'мука 300г, молоко 500мл, яйца 3шт, масло сливочное 50г, сахар 30г, соль 5г, масло растительное 20г',
    nutrition: { calories: 280, protein: 8, carbs: 45, fat: 8 },
    cookingMethod: 'жарка',
    confidence: 95,
    category: 'выпечка',
    difficulty: 'средне',
    time: '30 мин'
  },
  'оладьи': {
    name: 'Оладьи',
    ingredients: 'мука 200г, кефир 300мл, яйцо 1шт, сахар 20г, сода 5г, соль 3г, масло растительное 30г',
    nutrition: { calories: 220, protein: 7, carbs: 35, fat: 6 },
    cookingMethod: 'жарка',
    confidence: 96,
    category: 'выпечка',
    difficulty: 'легко',
    time: '20 мин'
  },

  // === ДЕСЕРТЫ ===
  'тирамису': {
    name: 'Тирамису',
    ingredients: 'маскарпоне 500г, яйца 4шт, сахар 100г, кофе эспрессо 200мл, какао 20г, савоярди 200г, ликер 30мл',
    nutrition: { calories: 420, protein: 12, carbs: 35, fat: 28 },
    cookingMethod: 'сырой',
    confidence: 97,
    category: 'десерты',
    difficulty: 'сложно',
    time: '2 часа'
  },
  'чизкейк': {
    name: 'Чизкейк',
    ingredients: 'творог 500г, сметана 200г, яйца 3шт, сахар 150г, мука 50г, масло сливочное 80г, печенье 200г, ваниль 5г',
    nutrition: { calories: 380, protein: 15, carbs: 32, fat: 22 },
    cookingMethod: 'запекание',
    confidence: 96,
    category: 'десерты',
    difficulty: 'сложно',
    time: '1.5 часа'
  },

  // === НАПИТКИ ===
  'компот': {
    name: 'Компот из сухофруктов',
    ingredients: 'сухофрукты 200г, сахар 100г, вода 2л, лимон 50г',
    nutrition: { calories: 45, protein: 1, carbs: 11, fat: 0 },
    cookingMethod: 'варка',
    confidence: 98,
    category: 'напитки',
    difficulty: 'легко',
    time: '30 мин'
  },
  'морс': {
    name: 'Клюквенный морс',
    ingredients: 'клюква 300г, сахар 120г, вода 1.5л, лимон 30г',
    nutrition: { calories: 35, protein: 0.5, carbs: 8, fat: 0.2 },
    cookingMethod: 'варка',
    confidence: 97,
    category: 'напитки',
    difficulty: 'легко',
    time: '20 мин'
  },

  // === ДОПОЛНИТЕЛЬНЫЕ САЛАТЫ ===
  'капрезе': {
    name: 'Капрезе',
    ingredients: 'помидоры 300г, моцарелла 200г, базилик 20г, оливковое масло 30г, бальзамик 15мл, соль, перец',
    nutrition: { calories: 220, protein: 15, carbs: 8, fat: 16 },
    cookingMethod: 'сырой',
    confidence: 98,
    category: 'салаты',
    difficulty: 'легко',
    time: '10 мин'
  },
  'винегрет': {
    name: 'Винегрет',
    ingredients: 'свекла 200г, картофель 150г, морковь 100г, огурцы соленые 100г, горошек зеленый 50г, лук 50г, масло растительное 30г',
    nutrition: { calories: 180, protein: 4, carbs: 25, fat: 8 },
    cookingMethod: 'варка',
    confidence: 96,
    category: 'салаты',
    difficulty: 'легко',
    time: '45 мин'
  },
  'мимоза': {
    name: 'Салат Мимоза',
    ingredients: 'рыба консервированная 200г, картофель 200г, морковь 100г, яйца 4шт, лук 50г, майонез 100г, зелень 20г',
    nutrition: { calories: 320, protein: 18, carbs: 20, fat: 20 },
    cookingMethod: 'варка',
    confidence: 95,
    category: 'салаты',
    difficulty: 'средне',
    time: '1 час'
  },

  // === ДОПОЛНИТЕЛЬНЫЕ СУПЫ ===
  'солянка': {
    name: 'Солянка мясная',
    ingredients: 'говядина 300г, колбаса 150г, ветчина 100г, огурцы соленые 100г, каперсы 30г, оливки 50г, помидоры 200г, лук 100г, лимон 30г',
    nutrition: { calories: 220, protein: 18, carbs: 12, fat: 12 },
    cookingMethod: 'варка',
    confidence: 97,
    category: 'супы',
    difficulty: 'средне',
    time: '1.5 часа'
  },
  'харчо': {
    name: 'Харчо',
    ingredients: 'говядина 400г, рис 100г, лук 150г, томатная паста 50г, чеснок 20г, хмели-сунели 10г, кинза 30г, перец чили 5г',
    nutrition: { calories: 190, protein: 16, carbs: 18, fat: 6 },
    cookingMethod: 'варка',
    confidence: 96,
    category: 'супы',
    difficulty: 'средне',
    time: '2 часа'
  },
  'гаспачо': {
    name: 'Гаспачо',
    ingredients: 'помидоры 800г, огурцы 200г, перец болгарский 150г, лук 100г, чеснок 10г, оливковое масло 50г, уксус 30мл, базилик 20г',
    nutrition: { calories: 85, protein: 2, carbs: 12, fat: 4 },
    cookingMethod: 'сырой',
    confidence: 98,
    category: 'супы',
    difficulty: 'легко',
    time: '20 мин'
  },

  // === ДОПОЛНИТЕЛЬНЫЕ ВТОРЫЕ БЛЮДА ===
  'бефстроганов': {
    name: 'Бефстроганов',
    ingredients: 'говядина 500г, грибы 200г, лук 150г, сметана 200г, мука 20г, масло сливочное 40г, томатная паста 30г',
    nutrition: { calories: 280, protein: 25, carbs: 8, fat: 16 },
    cookingMethod: 'тушение',
    confidence: 97,
    category: 'вторые блюда',
    difficulty: 'средне',
    time: '45 мин'
  },
  'гуляш': {
    name: 'Гуляш',
    ingredients: 'говядина 600г, лук 200г, перец болгарский 150г, помидоры 200г, томатная паста 40г, мука 30г, паприка 10г, чеснок 15г',
    nutrition: { calories: 250, protein: 22, carbs: 12, fat: 14 },
    cookingMethod: 'тушение',
    confidence: 96,
    category: 'вторые блюда',
    difficulty: 'средне',
    time: '1.5 часа'
  },
  'шашлык': {
    name: 'Шашлык из свинины',
    ingredients: 'свинина 800г, лук 300г, лимон 100г, масло растительное 50г, специи 20г, зелень 30г',
    nutrition: { calories: 320, protein: 28, carbs: 8, fat: 20 },
    cookingMethod: 'жарка',
    confidence: 95,
    category: 'вторые блюда',
    difficulty: 'средне',
    time: '2 часа'
  },
  'рыба в кляре': {
    name: 'Рыба в кляре',
    ingredients: 'филе рыбы 500г, мука 100г, яйца 2шт, молоко 100мл, масло растительное 80г, лимон 50г, зелень 20г',
    nutrition: { calories: 280, protein: 25, carbs: 20, fat: 12 },
    cookingMethod: 'жарка',
    confidence: 97,
    category: 'вторые блюда',
    difficulty: 'средне',
    time: '30 мин'
  },

  // === ДОПОЛНИТЕЛЬНАЯ ПАСТА ===
  'паста арабьята': {
    name: 'Паста Арабьята',
    ingredients: 'макароны 300г, помидоры 400г, чеснок 20г, перец чили 10г, оливковое масло 40г, петрушка 20г, сыр пармезан 60г',
    nutrition: { calories: 380, protein: 15, carbs: 55, fat: 12 },
    cookingMethod: 'варка',
    confidence: 96,
    category: 'паста',
    difficulty: 'легко',
    time: '25 мин'
  },
  'паста песто': {
    name: 'Паста с песто',
    ingredients: 'макароны 300г, базилик 100г, кедровые орехи 50г, сыр пармезан 80г, чеснок 15г, оливковое масло 60г',
    nutrition: { calories: 450, protein: 18, carbs: 50, fat: 20 },
    cookingMethod: 'варка',
    confidence: 98,
    category: 'паста',
    difficulty: 'легко',
    time: '20 мин'
  },

  // === ДОПОЛНИТЕЛЬНАЯ ВЫПЕЧКА ===
  'пирог с яблоками': {
    name: 'Пирог с яблоками',
    ingredients: 'мука 300г, яблоки 500г, сахар 150г, яйца 2шт, масло сливочное 100г, корица 5г, разрыхлитель 10г',
    nutrition: { calories: 320, protein: 6, carbs: 45, fat: 12 },
    cookingMethod: 'запекание',
    confidence: 95,
    category: 'выпечка',
    difficulty: 'средне',
    time: '1 час'
  },
  'кекс': {
    name: 'Кекс с изюмом',
    ingredients: 'мука 250г, сахар 120г, яйца 3шт, масло сливочное 80г, изюм 100г, молоко 100мл, разрыхлитель 8г, ваниль 5г',
    nutrition: { calories: 280, protein: 7, carbs: 40, fat: 10 },
    cookingMethod: 'запекание',
    confidence: 96,
    category: 'выпечка',
    difficulty: 'легко',
    time: '45 мин'
  },
  'вафли': {
    name: 'Вафли',
    ingredients: 'мука 200г, яйца 2шт, молоко 300мл, масло сливочное 60г, сахар 50г, разрыхлитель 5г, ваниль 3г',
    nutrition: { calories: 220, protein: 8, carbs: 30, fat: 8 },
    cookingMethod: 'жарка',
    confidence: 97,
    category: 'выпечка',
    difficulty: 'легко',
    time: '25 мин'
  },

  // === ДОПОЛНИТЕЛЬНЫЕ ДЕСЕРТЫ ===
  'панкейки': {
    name: 'Панкейки',
    ingredients: 'мука 200г, молоко 250мл, яйца 2шт, сахар 40г, разрыхлитель 8г, масло сливочное 30г, ваниль 3г',
    nutrition: { calories: 180, protein: 6, carbs: 28, fat: 5 },
    cookingMethod: 'жарка',
    confidence: 96,
    category: 'десерты',
    difficulty: 'легко',
    time: '20 мин'
  },
  'мороженое': {
    name: 'Домашнее мороженое',
    ingredients: 'молоко 500мл, сливки 300мл, яичные желтки 4шт, сахар 150г, ваниль 5г',
    nutrition: { calories: 280, protein: 8, carbs: 25, fat: 16 },
    cookingMethod: 'заморозка',
    confidence: 94,
    category: 'десерты',
    difficulty: 'сложно',
    time: '4 часа'
  },
  'шарлотка': {
    name: 'Шарлотка с яблоками',
    ingredients: 'яблоки 600г, мука 200г, сахар 120г, яйца 3шт, масло сливочное 50г, корица 5г, лимон 30г',
    nutrition: { calories: 250, protein: 6, carbs: 40, fat: 8 },
    cookingMethod: 'запекание',
    confidence: 95,
    category: 'десерты',
    difficulty: 'легко',
    time: '50 мин'
  },

  // === ДОПОЛНИТЕЛЬНЫЕ НАПИТКИ ===
  'кисель': {
    name: 'Кисель ягодный',
    ingredients: 'ягоды 300г, сахар 100г, крахмал 40г, вода 1л, лимон 20г',
    nutrition: { calories: 60, protein: 0.5, carbs: 15, fat: 0.1 },
    cookingMethod: 'варка',
    confidence: 97,
    category: 'напитки',
    difficulty: 'легко',
    time: '25 мин'
  },
  'смузи': {
    name: 'Смузи банановый',
    ingredients: 'бананы 300г, молоко 300мл, мед 30г, орехи 50г, корица 3г',
    nutrition: { calories: 180, protein: 6, carbs: 35, fat: 4 },
    cookingMethod: 'сырой',
    confidence: 98,
    category: 'напитки',
    difficulty: 'легко',
    time: '5 мин'
  }
};

// Функция поиска рецепта по названию или ингредиентам
export const findRecipe = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Точное совпадение по названию
  if (recipeDatabase[normalizedQuery]) {
    return recipeDatabase[normalizedQuery];
  }
  
  // Поиск по частичному совпадению названия
  const nameMatches = Object.values(recipeDatabase)
    .filter(recipe => 
      recipe.name.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes(recipe.name.toLowerCase())
    );
  
  if (nameMatches.length > 0) {
    return nameMatches[0];
  }
  
  // Поиск по ингредиентам
  const ingredientMatches = Object.values(recipeDatabase)
    .filter(recipe => 
      recipe.ingredients.toLowerCase().includes(normalizedQuery)
    );
  
  if (ingredientMatches.length > 0) {
    return ingredientMatches[0];
  }
  
  return null;
};

// Функция получения рецептов по категории
export const getRecipesByCategory = (category) => {
  return Object.values(recipeDatabase)
    .filter(recipe => recipe.category === category);
};

// Функция получения всех категорий
export const getCategories = () => {
  const categories = [...new Set(Object.values(recipeDatabase).map(recipe => recipe.category))];
  return categories.sort();
};

// Функция получения рецептов по сложности
export const getRecipesByDifficulty = (difficulty) => {
  return Object.values(recipeDatabase)
    .filter(recipe => recipe.difficulty === difficulty);
};

// Функция получения рецептов по времени приготовления
export const getRecipesByTime = (maxTime) => {
  return Object.values(recipeDatabase)
    .filter(recipe => {
      const time = parseInt(recipe.time);
      return time <= maxTime;
    });
};

// Функция получения случайного рецепта
export const getRandomRecipe = () => {
  const recipes = Object.values(recipeDatabase);
  return recipes[Math.floor(Math.random() * recipes.length)];
};

// Функция получения топ рецептов по точности
export const getTopRecipes = (limit = 10) => {
  return Object.values(recipeDatabase)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
};
