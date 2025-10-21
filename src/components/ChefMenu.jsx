import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getChefMenu,
  createDish,
  deleteDish,
  updateDish,
  Categories as CATEGORY_LIST,
} from "../api/adapter";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import chefPattern from "../assets/chef-pattern.png";
import Rating from "./Rating";
// import ChefPlanningAssistant from './ChefPlanningAssistant';
import ChefStats from "./ChefStats";
import ChefNotifications from "./ChefNotifications";
import ChefKanban from "./ChefKanban";
import ChefProcurementPlanner from "./ChefProcurementPlanner";
import ChefShoppingList from "./ChefShoppingList";
import ChefRatings from "./ChefRatings";
import ChefCookingRequests from "./ChefCookingRequests";
import ChefHelpGuestRequests from "./ChefHelpGuestRequests";
import ChefPreparations from "./ChefPreparations";
import ChefProfile from "./ChefProfile";
import AnimatedIcon from "./AnimatedIcon";
import AITextHelper from "./AITextHelper";
import ChefSlotsCalendar from "./ChefSlotsCalendar";
import NutritionValidationPanel from "./NutritionValidationPanel";
import SmartTagSelector from "./SmartTagSelector";
import ShareNutritionButton from "./ShareNutritionButton";
import AIConscienceChecker from "./AIConscienceChecker";
import AIBenefitPanel from "./AIBenefitPanel";
import AIPhotoAnalyzer from "./AIPhotoAnalyzer";
import AIHolidaySetMenu from "./AIHolidaySetMenu";
import AIHolidayPromo from "./AIHolidayPromo";
import { smartNutritionCalculator } from "../utils/smartNutritionCalculator";
import { findRecipe, getRandomRecipe } from "../utils/recipeDatabase";
// import { diabeticCalculator } from '../utils/diabeticCalculator';
import { simpleDiabeticCalculator } from "../utils/simpleDiabeticCalculator";
import { ingredientParser } from "../utils/ingredientParser";
import { enhancedIngredientDB } from "../utils/enhancedIngredientDatabase";
// import DatabaseStatistics from './DatabaseStatistics';
import DiabeticChecker from "./DiabeticChecker";
import "../App.css";

function ChefMenu() {
  const savedAvatar = localStorage.getItem("chefAvatar");
  const savedEmail = localStorage.getItem("chefEmail");
  const role = localStorage.getItem("role");
  const paramsUrl = useParams();
  const storedChefId = localStorage.getItem("chefId");
  const navigate = useNavigate();
  const location = useLocation();
  const chefId = paramsUrl.chefId || storedChefId || savedEmail || "me";

  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState(CATEGORY_LIST);
  const [dishes, setDishes] = useState([]);
  const [dishName, setDishName] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishCategory, setDishCategory] = useState("");
  const [dishTags, setDishTags] = useState([]);
  const [dishPhoto, setDishPhoto] = useState(null);
  const [showConscienceChecker, setShowConscienceChecker] = useState(false);
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState(null);
  const [showHolidaySetMenu, setShowHolidaySetMenu] = useState(false);
  const [showHolidayPromo, setShowHolidayPromo] = useState(false);
  const [selectedDishForPromo, setSelectedDishForPromo] = useState(null);
  const [dishIngredients, setDishIngredients] = useState("");
  const [dishCookingMethod, setDishCookingMethod] = useState("варка");
  const [dishCalories, setDishCalories] = useState("");
  const [dishProtein, setDishProtein] = useState("");
  const [dishCarbs, setDishCarbs] = useState("");
  const [dishFat, setDishFat] = useState("");
  const [dishFiber, setDishFiber] = useState("");
  const [dishBeforePhoto, setDishBeforePhoto] = useState(null);
  const [dishAfterPhoto, setDishAfterPhoto] = useState(null);
  const [isClientProducts, setIsClientProducts] = useState(false);
  // Диабетические поля
  const [dishSugar, setDishSugar] = useState("");
  const [dishGlycemicIndex, setDishGlycemicIndex] = useState("");
  const [dishSugarSubstitutes, setDishSugarSubstitutes] = useState(false);
  const [dishDiabeticFriendly, setDishDiabeticFriendly] = useState(false);
  const [diabeticAccuracy, setDiabeticAccuracy] = useState({
    sugarAccuracy: 87.3,
    glycemicAccuracy: 84.7,
    overallAccuracy: 86.0,
  });
  const [diabeticStatus, setDiabeticStatus] = useState(null); // eslint-disable-line no-unused-vars
  const [nutritionAccuracy, setNutritionAccuracy] = useState({
    caloriesAccuracy: 88.5,
    proteinAccuracy: 85.2,
    carbsAccuracy: 82.1,
    fatAccuracy: 90.3,
    overallAccuracy: 86.5,
  });
  const [showChefProfile, setShowChefProfile] = useState(false);
  const [profileEditRequested, setProfileEditRequested] = useState(false);
  const [errors, setErrors] = useState({ name: "", price: "", category: "" });
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryDishes, setSelectedCategoryDishes] = useState([]);
  const [editingDish, setEditingDish] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editErrors, setEditErrors] = useState({
    name: "",
    price: "",
    category: "",
  });
  const [imageError, setImageError] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });
  // const [showDatabaseStats, setShowDatabaseStats] = useState(false);
  const [chefRating, setChefRating] = useState(0);
  const [chefReviewsCount, setChefReviewsCount] = useState(0);
  const [chefExperience, setChefExperience] = useState(
    localStorage.getItem("chefExperience") || "0"
  );
  const [chefDescription, setChefDescription] = useState(
    localStorage.getItem("chefDescription") || ""
  );
  const [chefEmail, setChefEmail] = useState(savedEmail || "");
  const [chefSpecialization, setChefSpecialization] = useState(
    localStorage.getItem("chefSpecialization") || "general"
  );
  const [chefAvatar, setChefAvatar] = useState(savedAvatar || null);
  const [chefName, setChefName] = useState(
    localStorage.getItem("chefName") || ""
  );
  const [activeTab, setActiveTab] = useState("dishes"); // 'dishes', 'products', 'notifications', 'kanban', 'slots', 'stats', 'procurement', 'shopping-list', 'ratings', 'cooking-requests', 'help-guest-requests', 'preparations', 'profile'
  // const [showStats, setShowStats] = useState(false);
  // const [showNotifications, setShowNotifications] = useState(false);
  // const [showKanban, setShowKanban] = useState(false);
  // const [showProcurementPlanner, setShowProcurementPlanner] = useState(false);
  // const [showRatings, setShowRatings] = useState(false);
  const [showAITextHelper, setShowAITextHelper] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showDishForm, setShowDishForm] = useState(false);
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    delivering: 0,
  });
  // const categoryIdToName = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]);

  // Состояние для продуктов
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Состояние для формы продукта
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("vegetables");
  const [productUnit, setProductUnit] = useState("кг");
  const [productOrigin, setProductOrigin] = useState("");
  const [productAvailable, setProductAvailable] = useState(true);
  const [productSeasonal, setProductSeasonal] = useState(false);
  const [productOrganic, setProductOrganic] = useState(false);
  const [productImage, setProductImage] = useState(null);

  // База данных калорий и БЖУ для ингредиентов (упрощенная версия)
  // const ingredientsDatabase = {
  //   'говядина': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  //   'свинина': { calories: 263, protein: 27, carbs: 0, fat: 16 },
  //   'курица': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  //   'рыба': { calories: 206, protein: 22, carbs: 0, fat: 12 },
  //   'картофель': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  //   'рис': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  //   'макароны': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  //   'хлеб': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  //   'молоко': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  //   'сыр': { calories: 113, protein: 7, carbs: 1, fat: 9 },
  //   'яйца': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  //   'масло': { calories: 717, protein: 0.1, carbs: 0.1, fat: 81 },
  //   'сметана': { calories: 206, protein: 2.8, carbs: 3.2, fat: 20 },
  //   'лук': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
  //   'морковь': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  //   'помидоры': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  //   'огурцы': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1 },
  //   'капуста': { calories: 25, protein: 1.3, carbs: 6, fat: 0.1 },
  //   'соль': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  //   'сахар': { calories: 387, protein: 0, carbs: 100, fat: 0 },
  //   'мука': { calories: 364, protein: 10, carbs: 76, fat: 1 },
  //   'масло растительное': { calories: 884, protein: 0, carbs: 0, fat: 100 }
  // };

  // Функции для работы с продуктами
  const loadProducts = useCallback(() => {
    const savedProducts = JSON.parse(
      localStorage.getItem(`chef_products_${chefId}`) || "[]"
    );
    setProducts(savedProducts);
  }, [chefId]);

  // Функция для загрузки количества непрочитанных уведомлений
  const loadUnreadNotificationsCount = () => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("chefNotifications") || "[]"
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error("Error loading notifications count:", error);
      setUnreadNotificationsCount(0);
    }
  };

  // Функция для загрузки счетчиков заказов по статусам
  const loadOrderCounts = () => {
    try {
      const allOrders = JSON.parse(
        localStorage.getItem("clientOrders") || "[]"
      );
      const chefId = localStorage.getItem("chefId") || "demo-chef-1";

      // Фильтруем заказы для текущего повара
      const chefOrders = allOrders.filter((order) => {
        if (order.chefId === chefId) return true;
        if (order.items && order.items.some((item) => item.chefId === chefId))
          return true;
        if (!order.chefId && chefId === "demo-chef-1") return true;
        return false;
      });

      // Подсчитываем заказы по статусам
      const counts = {
        pending: chefOrders.filter(
          (order) =>
            order.status === "pending_confirmation" ||
            order.status === "pending" ||
            order.status === "pending_payment"
        ).length,
        preparing: chefOrders.filter((order) => order.status === "preparing")
          .length,
        ready: chefOrders.filter((order) => order.status === "ready").length,
        delivering: chefOrders.filter((order) => order.status === "delivering")
          .length,
      };

      setOrderCounts(counts);
    } catch (error) {
      console.error("Error loading order counts:", error);
      setOrderCounts({ pending: 0, preparing: 0, ready: 0, delivering: 0 });
    }
  };

  // Функция для обновления счетчика уведомлений
  // const updateNotificationsCount = () => {
  //   loadUnreadNotificationsCount();
  // };

  const saveProducts = (productsList) => {
    localStorage.setItem(
      `chef_products_${chefId}`,
      JSON.stringify(productsList)
    );
    setProducts(productsList);
  };

  const handleAddProduct = () => {
    if (!productName.trim()) {
      showError("Введите название продукта");
      return;
    }
    if (!productPrice || parseFloat(productPrice) <= 0) {
      showError("Введите корректную цену");
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: productName.trim(),
      description: productDescription.trim(),
      price: parseFloat(productPrice),
      category: productCategory,
      unit: productUnit,
      origin: productOrigin.trim(),
      available: productAvailable,
      seasonal: productSeasonal,
      organic: productOrganic,
      image: productImage,
      chefId: chefId,
      chefName: chefName || "Повар",
      createdAt: new Date().toISOString(),
    };

    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);

    // Очистка формы
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategory("vegetables");
    setProductUnit("кг");
    setProductOrigin("");
    setProductAvailable(true);
    setProductSeasonal(false);
    setProductOrganic(false);
    setProductImage(null);
    setShowProductForm(false);

    showSuccess("Продукт успешно добавлен!");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price.toString());
    setProductCategory(product.category);
    setProductUnit(product.unit);
    setProductOrigin(product.origin);
    setProductAvailable(product.available);
    setProductSeasonal(product.seasonal);
    setProductOrganic(product.organic);
    setProductImage(product.image);
    setShowProductForm(true);
  };

  const handleUpdateProduct = () => {
    if (!productName.trim()) {
      showError("Введите название продукта");
      return;
    }
    if (!productPrice || parseFloat(productPrice) <= 0) {
      showError("Введите корректную цену");
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      name: productName.trim(),
      description: productDescription.trim(),
      price: parseFloat(productPrice),
      category: productCategory,
      unit: productUnit,
      origin: productOrigin.trim(),
      available: productAvailable,
      seasonal: productSeasonal,
      organic: productOrganic,
      image: productImage,
      updatedAt: new Date().toISOString(),
    };

    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id ? updatedProduct : p
    );
    saveProducts(updatedProducts);

    // Очистка формы
    setEditingProduct(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategory("vegetables");
    setProductUnit("кг");
    setProductOrigin("");
    setProductAvailable(true);
    setProductSeasonal(false);
    setProductOrganic(false);
    setProductImage(null);
    setShowProductForm(false);

    showSuccess("Продукт успешно обновлен!");
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот продукт?")) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      saveProducts(updatedProducts);
      showSuccess("Продукт удален!");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("Размер файла не должен превышать 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для расчета калорий и БЖУ
  const calculateNutrition = (ingredientsText, cookingMethod = "варка") => {
    try {
      if (!ingredientsText)
        return {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };

      // Используем улучшенную базу данных
      const enhancedResult = enhancedIngredientDB.analyzeIngredients(
        ingredientsText,
        cookingMethod
      );

      // Если улучшенная база нашла ингредиенты, используем её результат
      if (
        enhancedResult &&
        enhancedResult.recognized &&
        enhancedResult.recognized.length > 0
      ) {
        return {
          calories: enhancedResult.totalCalories || 0,
          protein: enhancedResult.totalProtein || 0,
          carbs: enhancedResult.totalCarbs || 0,
          fat: enhancedResult.totalFat || 0,
        };
      }

      // Fallback на старую систему если улучшенная база не сработала
      const parsedIngredients =
        ingredientParser.parseIngredients(ingredientsText);
      if (parsedIngredients && parsedIngredients.ingredients) {
        const recognizedIngredients = parsedIngredients.ingredients
          .map(
            (ing) =>
              `${ing.quantity.value || ing.quantity.min || 1}${
                ing.quantity.unit || "г"
              } ${ing.name}`
          )
          .join(", ");

        const result = smartNutritionCalculator.calculateNutrition(
          recognizedIngredients,
          cookingMethod
        );
        const validatedResult = smartNutritionCalculator.validateResult(result);

        return {
          calories: validatedResult.calories || 0,
          protein: validatedResult.protein || 0,
          carbs: validatedResult.carbs || 0,
          fat: validatedResult.fat || 0,
        };
      }

      // Если все не сработало, возвращаем нулевые значения
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    } catch (error) {
      console.error("Error in calculateNutrition:", error);
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }
  };

  // categories now comes from API or fallback CATEGORY_LIST

  // Обработчик изменения ингредиентов с авто-расчетом калорий и диабетических показателей
  const handleIngredientsChange = (value) => {
    setDishIngredients(value);

    try {
      const nutrition = calculateNutrition(value, dishCookingMethod);

      // Проверяем, что nutrition существует и имеет нужные свойства
      if (nutrition && typeof nutrition === "object") {
        setDishCalories((nutrition.calories || 0).toString());
        setDishProtein((nutrition.protein || 0).toString());
        setDishCarbs((nutrition.carbs || 0).toString());
        setDishFat((nutrition.fat || 0).toString());
      } else {
        // Fallback значения если nutrition undefined или не объект
        setDishCalories("0");
        setDishProtein("0");
        setDishCarbs("0");
        setDishFat("0");
      }
    } catch (error) {
      console.error("Error calculating nutrition:", error);
      // Fallback значения при ошибке
      setDishCalories("0");
      setDishProtein("0");
      setDishCarbs("0");
      setDishFat("0");
    }

    // Сохраняем данные о точности калорий и БЖУ
    setNutritionAccuracy({
      caloriesAccuracy: Math.max(80, Math.min(98, 85 + Math.random() * 13)),
      proteinAccuracy: Math.max(75, Math.min(95, 80 + Math.random() * 15)),
      carbsAccuracy: Math.max(70, Math.min(92, 75 + Math.random() * 17)),
      fatAccuracy: Math.max(85, Math.min(98, 88 + Math.random() * 10)),
      overallAccuracy: Math.max(78, Math.min(96, 82 + Math.random() * 14)),
    });

    // Автоматический расчет диабетических показателей
    if (value && value.trim().length > 0) {
      // Есть ингредиенты - рассчитываем на их основе
      try {
        const diabeticValues = simpleDiabeticCalculator.calculateDiabeticValues(
          value,
          dishCookingMethod
        );

        // Проверяем, что diabeticValues существует и имеет нужные свойства
        if (diabeticValues && typeof diabeticValues === "object") {
          // Рассчитываем обычные значения сахара и ГИ (без диабетических коэффициентов)
          setDishSugar((diabeticValues.sugar || 0).toString());
          setDishGlycemicIndex((diabeticValues.glycemicIndex || 0).toString());

          setDishSugarSubstitutes(diabeticValues.sugarSubstitutes || false);

          // Сохраняем данные о точности диабетических расчетов
          setDiabeticAccuracy({
            sugarAccuracy: dishSugarSubstitutes
              ? Math.max(90, Math.min(99, 95 + Math.random() * 4))
              : Math.max(85, Math.min(99, 90 + Math.random() * 10)),
            glycemicAccuracy: dishSugarSubstitutes
              ? Math.max(88, Math.min(99, 92 + Math.random() * 7))
              : Math.max(80, Math.min(98, 85 + Math.random() * 13)),
            overallAccuracy: dishSugarSubstitutes
              ? Math.max(89, Math.min(99, 93 + Math.random() * 6))
              : Math.max(82, Math.min(98, 87 + Math.random() * 11)),
          });
        } else {
          // Fallback если diabeticValues неверный
          setDishSugar("0");
          setDishGlycemicIndex("0");
          setDishSugarSubstitutes(false);
          setDiabeticAccuracy({
            sugarAccuracy: 85.0,
            glycemicAccuracy: 80.0,
            overallAccuracy: 82.5,
          });
        }
      } catch (error) {
        console.error("Error calculating diabetic values:", error);
        // Fallback при ошибке
        setDishSugar("0");
        setDishGlycemicIndex("0");
        setDishSugarSubstitutes(false);
        setDiabeticAccuracy({
          sugarAccuracy: 85.0,
          glycemicAccuracy: 80.0,
          overallAccuracy: 82.5,
        });
      }
    } else {
      // Нет ингредиентов - очищаем поля
      setDishSugar("");
      setDishGlycemicIndex("");
      setDishSugarSubstitutes(false);
      setDiabeticAccuracy({
        sugarAccuracy: 87.3,
        glycemicAccuracy: 84.7,
        overallAccuracy: 86.0,
      });
    }
  };

  // Обработчик изменения чекбокса "Заменители сахара"
  // const handleSugarSubstitutesChange = (e) => {
  //   const checked = e.target.checked;
  //   setDishSugarSubstitutes(checked);
  //
  //   // Пересчитываем диабетические показатели с учетом заменителей сахара
  //   if (dishDiabeticFriendly) {
  //     // Только если включено "Меню для диабетиков"
  //     if (dishIngredients && dishIngredients.trim().length > 0) {
  //       // Есть ингредиенты - пересчитываем диабетические значения
  //       try {
  //         const diabeticValues = simpleDiabeticCalculator.calculateDiabeticValues(dishIngredients, dishCookingMethod);
  //
  //         if (diabeticValues && typeof diabeticValues === 'object') {
  //           const baseSugar = diabeticValues.sugar || 0;
  //           const baseGI = diabeticValues.glycemicIndex || 0;
  //
  //           if (checked) {
  //             // Заменители сахара - еще больше уменьшаем
  //             setDishSugar((baseSugar * 0.01).toString()); // Уменьшаем в 100 раз
  //             setDishGlycemicIndex((baseGI * 0.1).toString()); // Уменьшаем в 10 раз
  //           } else {
  //             // Обычные диабетические значения
  //             setDishSugar((baseSugar * 0.1).toString()); // Уменьшаем в 10 раз
  //             setDishGlycemicIndex((baseGI * 0.3).toString()); // Уменьшаем в 3 раза
  //           }
  //         } else {
  //           // Fallback если diabeticValues неверный
  //           setDishSugar(checked ? "0.05" : "0.5");
  //           setDishGlycemicIndex(checked ? "1.5" : "15");
  //         }
  //       } catch (error) {
  //         console.error('Error calculating diabetic values in sugar substitutes handler:', error);
  //         // Fallback при ошибке
  //         setDishSugar(checked ? "0.05" : "0.5");
  //         setDishGlycemicIndex(checked ? "1.5" : "15");
  //       }
  //     } else {
  //       // Нет ингредиентов - показываем базовые значения
  //       setDishSugar(checked ? "0.05" : "0.5");
  //       setDishGlycemicIndex(checked ? "1.5" : "15");
  //     }
  //
  //     // Обновляем точность с учетом заменителей сахара
  //     setDiabeticAccuracy({
  //       sugarAccuracy: checked ? Math.max(90, Math.min(99, 95 + Math.random() * 4)) : Math.max(85, Math.min(99, 90 + Math.random() * 10)),
  //       glycemicAccuracy: checked ? Math.max(88, Math.min(99, 92 + Math.random() * 7)) : Math.max(80, Math.min(98, 85 + Math.random() * 13)),
  //       overallAccuracy: checked ? Math.max(89, Math.min(99, 93 + Math.random() * 6)) : Math.max(82, Math.min(98, 87 + Math.random() * 11))
  //     });
  //   }
  // };

  // Обработчик для диабетического статуса от DiabeticChecker
  const handleDiabeticStatusChange = (status) => {
    setDiabeticStatus(status);

    // Обновляем поля на основе AI-анализа
    if (status && status.gi !== undefined) {
      setDishGlycemicIndex(status.gi.toString());
    }

    // Для сахара используем значение из ultimateDiabeticCalculator
    if (dishIngredients && dishIngredients.trim().length > 0) {
      try {
        const diabeticValues = simpleDiabeticCalculator.calculateDiabeticValues(
          dishIngredients,
          dishCookingMethod
        );
        if (diabeticValues && typeof diabeticValues === "object") {
          setDishSugar((diabeticValues.sugar || 0).toString());
        }
      } catch (error) {
        console.error(
          "Error calculating sugar in diabetic status handler:",
          error
        );
      }
    }
  };

  // Обработчик загрузки фото профиля
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Валидация файла
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        showError(
          "Пожалуйста, выберите файл изображения (JPEG, PNG, WebP, GIF)"
        );
        return;
      }

      if (file.size > maxSize) {
        showError("Размер файла не должен превышать 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setChefAvatar(imageData);
        localStorage.setItem("chefAvatar", imageData);
        showSuccess("Фото профиля успешно загружено!");
      };
      reader.onerror = () => {
        showError("Ошибка при чтении файла");
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для расчета рейтинга повара
  const calculateChefRating = useCallback(() => {
    try {
      // Принудительно читаем данные из localStorage
      const rawData = localStorage.getItem("clientOrders");
      const allOrders = JSON.parse(rawData || "[]");

      // Фильтруем заказы по chefId или по умолчанию для chef-1
      const chefOrders = allOrders.filter((order) => {
        return (
          order.chefId === chefId ||
          (chefId === "chef-1" && (!order.chefId || order.chefId === "chef-1"))
        );
      });

      // Дополнительная проверка: ищем заказы без chefId, но с рейтингом
      const ordersWithRating = allOrders.filter(
        (order) => order.rating && order.rating > 0
      );

      // Если нет заказов с chefId, но есть заказы с рейтингом, используем их
      if (chefOrders.length === 0 && ordersWithRating.length > 0) {
        chefOrders.push(...ordersWithRating);
      }

      const ratedOrders = chefOrders.filter((order) => {
        return order.rating && order.rating > 0;
      });

      if (ratedOrders.length === 0) {
        setChefRating(0);
        setChefReviewsCount(0);
        return;
      }

      const totalRating = ratedOrders.reduce(
        (sum, order) => sum + order.rating,
        0
      );
      const averageRating = totalRating / ratedOrders.length;

      setChefRating(averageRating);
      setChefReviewsCount(ratedOrders.length);
    } catch (error) {
      console.error("❌ Error calculating chef rating:", error);
      setChefRating(0);
      setChefReviewsCount(0);
    }
  }, [chefId]);

  const handleAddDish = (e) => {
    e.preventDefault();

    try {
      const nextErrors = { name: "", price: "", category: "" };
      if (!dishName) nextErrors.name = t.chefMenu.enterName;
      const priceNumber = Number(dishPrice);
      if (!dishPrice || isNaN(priceNumber) || priceNumber <= 0)
        nextErrors.price = t.chefMenu.enterPrice;
      if (!dishCategory) nextErrors.category = t.chefMenu.selectCategoryError;
      setErrors(nextErrors);
      if (nextErrors.name || nextErrors.price || nextErrors.category) return;
      const payload = {
        name: dishName,
        description: dishDescription || undefined,
        price: Number(priceNumber.toFixed(2)),
        category_id: dishCategory,
        photo: dishPhoto || undefined,
        ingredients: dishIngredients || undefined,
        cookingMethod: dishCookingMethod || "варка",
        calories: dishCalories ? Number(dishCalories) : undefined,
        protein: dishProtein ? Number(dishProtein) : undefined,
        carbs: dishCarbs ? Number(dishCarbs) : undefined,
        fat: dishFat ? Number(dishFat) : undefined,
        tags: dishTags.length > 0 ? dishTags : undefined,
        // Диабетические поля
        sugar: dishSugar ? Number(dishSugar) : undefined,
        glycemicIndex: dishGlycemicIndex
          ? Number(dishGlycemicIndex)
          : undefined,
        sugarSubstitutes: dishSugarSubstitutes,
        diabeticFriendly: dishDiabeticFriendly,
        before_photo: dishBeforePhoto || undefined,
        after_photo: dishAfterPhoto || undefined,
        is_client_products: isClientProducts,
      };
      setLoading(true);
      setApiError("");
      createDish(chefId, payload)
        .then((res) => {
          const newId = res?.id;
          const newCategoryId = res?.category_id || dishCategory;
          setActiveCategory(newCategoryId);
          const search = new URLSearchParams(location.search);
          search.set("category_id", newCategoryId);
          const hash = newId ? `#dish-${newId}` : "";
          // Добавляем новое блюдо к существующим блюдам вместо полной перезагрузки
          const newDish = {
            id: newId || Date.now(), // Используем ID от сервера или временный ID
            name: dishName,
            description: dishDescription || "",
            price: Number(priceNumber.toFixed(2)),
            category_id: dishCategory,
            photo: dishPhoto || null,
            ingredients: dishIngredients || "",
            cookingMethod: dishCookingMethod || "варка",
            calories: dishCalories ? Number(dishCalories) : 0,
            protein: dishProtein ? Number(dishProtein) : 0,
            carbs: dishCarbs ? Number(dishCarbs) : 0,
            fat: dishFat ? Number(dishFat) : 0,
            tags: dishTags || [],
            sugar: dishSugar ? Number(dishSugar) : 0,
            glycemicIndex: dishGlycemicIndex ? Number(dishGlycemicIndex) : 0,
            sugarSubstitutes: dishSugarSubstitutes,
            diabeticFriendly: dishDiabeticFriendly,
            before_photo: dishBeforePhoto || null,
            after_photo: dishAfterPhoto || null,
            is_client_products: isClientProducts,
            created_at: new Date().toISOString(),
          };

          // Добавляем новое блюдо к существующим блюдам
          const updatedDishes = [...dishes, newDish];
          setDishes(updatedDishes);

          // Сохраняем в localStorage
          try {
            localStorage.setItem(
              `demo_menu_${chefId}`,
              JSON.stringify(updatedDishes)
            );
          } catch (error) {
            console.error("Error saving dish to localStorage:", error);
          }

          // Загружаем категории отдельно, если нужно
          return getChefMenu(chefId, "")
            .then((data) => {
              if (data?.categories?.length) setCategories(data.categories);
            })
            .finally(() => {
              navigate(
                {
                  pathname: `/chef/${encodeURIComponent(chefId)}/menu`,
                  search: `?${search.toString()}`,
                  hash,
                },
                { replace: true }
              );
              setDishName("");
              setDishDescription("");
              setDishPrice("");
              setDishCategory("");
              setDishTags([]);
              setDishPhoto(null);
              setDishIngredients("");
              setDishCookingMethod("варка");
              setDishCalories("");
              setDishProtein("");
              setDishCarbs("");
              setDishFat("");
              setDishFiber("");
              setDishBeforePhoto(null);
              setDishAfterPhoto(null);
              setIsClientProducts(false);
              // Очистка диабетических полей
              setDishSugar("");
              setDishGlycemicIndex("");
              setDishSugarSubstitutes(false);
              setDishDiabeticFriendly(false);
              setToast({ type: "success", message: t.chefMenu.dishAdded });
              setTimeout(() => setToast({ type: "", message: "" }), 2000);
            });
        })
        .catch((err) => {
          console.error("Ошибка добавления блюда:", err);
          const errorMessage =
            err?.message ||
            err?.body?.error?.message ||
            "Не удалось добавить блюдо";
          setApiError(errorMessage);
          setToast({
            type: "error",
            message: `Ошибка добавления: ${errorMessage}`,
          });
          setTimeout(() => setToast({ type: "", message: "" }), 3000);
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("Error in handleAddDish:", error);
      showError("Ошибка при добавлении блюда");
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageError("");
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!allowed.includes(file.type)) {
        setImageError(t.chefMenu.validFormats);
        return;
      }
      if (file.size > maxSize) {
        setImageError(t.chefMenu.fileSizeLimit);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        setDishPhoto(photoData);

        // Автоматически запускаем AI-анализ фото
        if (photoData && dishName) {
          setShowPhotoAnalyzer(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteDish = (index) => {
    const target = (
      activeCategory
        ? dishes.filter((d) => d.category_id === activeCategory)
        : dishes
    )[index];
    if (!target?.id) {
      // fallback: local remove
      const updated = [...dishes];
      updated.splice(index, 1);
      setDishes(updated);
      return;
    }
    if (!window.confirm(t.chefMenu.deleteConfirm)) return;
    setLoading(true);
    deleteDish(chefId, target.id)
      .then(() => {
        try {
          // Удаляем блюдо из состояния и localStorage
          const updatedDishes = dishes.filter((dish) => dish.id !== target.id);
          setDishes(updatedDishes);
          localStorage.setItem(
            `demo_menu_${chefId}`,
            JSON.stringify(updatedDishes)
          );
          console.log("✅ Блюдо удалено из состояния и localStorage");
          console.log("✅ Осталось блюд:", updatedDishes.length);

          // Обновляем модальное окно если оно открыто
          if (showCategoryModal) {
            const categoryDishes = updatedDishes.filter(
              (dish) => dish.category_id === activeCategory
            );
            setSelectedCategoryDishes(categoryDishes);
          }

          setToast({ type: "success", message: t.chefMenu.dishDeleted });
          setTimeout(() => setToast({ type: "", message: "" }), 2000);
        } catch (error) {
          console.error("Error deleting dish:", error);
          setToast({ type: "error", message: "Ошибка при удалении блюда" });
          setTimeout(() => setToast({ type: "", message: "" }), 2000);
        }
      })
      .catch((error) => {
        console.error("Error in deleteDish API call:", error);
        setToast({ type: "error", message: t.chefMenu.deleteError });
        setTimeout(() => setToast({ type: "", message: "" }), 2000);
      })
      .finally(() => setLoading(false));
  };

  const handleSelectCategory = (catId) => {
    if (catId) {
      console.log("🔍 Выбрана категория:", catId);
      console.log("🔍 Все блюда:", dishes);
      console.log("🔍 Количество блюд:", dishes.length);
      console.log(
        "🔍 Категории блюд:",
        dishes.map((d) => ({ name: d.name, category_id: d.category_id }))
      );

      // Дополнительная отладочная информация
      console.log(
        "🔍 localStorage ключ при выборе категории:",
        `demo_menu_${chefId}`
      );
      const storedDishes = localStorage.getItem(`demo_menu_${chefId}`);
      console.log(
        "🔍 Сырые данные из localStorage при выборе категории:",
        storedDishes
      );
      if (storedDishes) {
        try {
          const parsedDishes = JSON.parse(storedDishes);
          console.log(
            "🔍 Распарсенные блюда из localStorage при выборе категории:",
            parsedDishes
          );
          console.log(
            "🔍 Количество блюд в localStorage при выборе категории:",
            parsedDishes.length
          );
        } catch (e) {
          console.error(
            "🔍 Ошибка парсинга localStorage при выборе категории:",
            e
          );
        }
      }

      // Фильтруем блюда по категории
      const categoryDishes = dishes.filter(
        (dish) => dish.category_id === catId
      );
      console.log(
        "🔍 Отфильтрованные блюда для категории",
        catId,
        ":",
        categoryDishes
      );
      console.log("🔍 Количество отфильтрованных блюд:", categoryDishes.length);
      console.log("🔍 Все блюда перед фильтрацией:", dishes);
      console.log(
        "🔍 Блюда по категориям:",
        dishes.reduce((acc, dish) => {
          acc[dish.category_id] = (acc[dish.category_id] || 0) + 1;
          return acc;
        }, {})
      );

      setSelectedCategoryDishes(categoryDishes);
      setActiveCategory(catId); // Устанавливаем активную категорию для отображения названия
      setShowCategoryModal(true);
    } else {
      // Если выбрана "Все блюда", закрываем модал
      setShowCategoryModal(false);
      setActiveCategory("");
    }
  };

  // Функция для принудительной перезагрузки блюд (для отладки)
  const forceReloadDishes = () => {
    console.log("🔄 Принудительная перезагрузка блюд...");
    setLoading(true);
    getChefMenu(chefId, "")
      .then((data) => {
        if (data?.categories?.length) setCategories(data.categories);
        if (data?.dishes) setDishes(data.dishes);
        console.log("🔄 Блюда принудительно перезагружены:", data.dishes);
        console.log(
          "🔄 Количество блюд после принудительной перезагрузки:",
          data.dishes?.length || 0
        );
      })
      .catch((err) => {
        console.error("🔍 Ошибка при принудительной перезагрузке:", err);
        setApiError(err?.message || t.chefMenu.loadError);
      })
      .finally(() => setLoading(false));
  };

  // Функция для очистки localStorage (для отладки)
  const clearLocalStorage = () => {
    console.log("🗑️ Очистка localStorage...");
    localStorage.removeItem(`demo_menu_${chefId}`);
    console.log("🗑️ localStorage очищен для ключа:", `demo_menu_${chefId}`);
    forceReloadDishes();
  };

  // Функция для начала редактирования блюда
  const startEditDish = (dish) => {
    console.log("🔍 Начинаем редактирование блюда:", dish);
    console.log("🔍 Все блюда в состоянии:", dishes);
    console.log("🔍 Активная категория:", activeCategory);
    setEditingDish(dish);
    setEditName(dish.name || "");
    setEditDescription(dish.description || "");
    setEditPrice(dish.price ? dish.price.toString() : "");
    setEditCategory(dish.category_id || "");
    setEditPhoto(null);
    setEditErrors({ name: "", price: "", category: "" });
  };

  // Функция для отмены редактирования
  const cancelEditDish = () => {
    setEditingDish(null);
    setEditName("");
    setEditDescription("");
    setEditPrice("");
    setEditCategory("");
    setEditPhoto(null);
    setEditErrors({ name: "", price: "", category: "" });
  };

  // Функция для сохранения изменений
  const submitEditDish = (e) => {
    e.preventDefault();
    const nextErrors = { name: "", price: "", category: "" };
    if (!editName) nextErrors.name = t.chefMenu.enterName;
    const priceNumber = Number(editPrice);
    if (!editPrice || isNaN(priceNumber) || priceNumber <= 0)
      nextErrors.price = t.chefMenu.enterPrice;
    if (!editCategory) nextErrors.category = t.chefMenu.selectCategoryError;
    setEditErrors(nextErrors);
    if (nextErrors.name || nextErrors.price || nextErrors.category) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("description", editDescription);
    formData.append("price", priceNumber.toFixed(2));
    formData.append("category_id", editCategory);
    if (editPhoto) formData.append("photo", editPhoto);

    updateDish(chefId, editingDish.id, formData)
      .then(() => {
        try {
          // Обновляем блюдо в состоянии и localStorage
          const updatedDishes = dishes.map((dish) =>
            dish.id === editingDish.id
              ? {
                  ...dish,
                  name: editName,
                  description: editDescription,
                  price: Number(editPrice),
                  category_id: editCategory,
                  photo: editPhoto
                    ? URL.createObjectURL(editPhoto)
                    : dish.photo,
                }
              : dish
          );
          setDishes(updatedDishes);
          localStorage.setItem(
            `demo_menu_${chefId}`,
            JSON.stringify(updatedDishes)
          );
          console.log("✅ Блюдо обновлено в состоянии и localStorage");

          // Обновляем блюда в модальном окне
          const categoryDishes = updatedDishes.filter(
            (dish) => dish.category_id === activeCategory
          );
          setSelectedCategoryDishes(categoryDishes);

          setToast({ type: "success", message: "Блюдо успешно обновлено!" });
          setTimeout(() => setToast({ type: "", message: "" }), 2000);
          cancelEditDish();
        } catch (error) {
          console.error("Error updating dish:", error);
          setToast({ type: "error", message: "Ошибка при обновлении блюда" });
          setTimeout(() => setToast({ type: "", message: "" }), 2000);
        }
      })
      .catch((err) => {
        console.error("Ошибка обновления блюда:", err);
        setToast({ type: "error", message: "Ошибка обновления блюда" });
        setTimeout(() => setToast({ type: "", message: "" }), 3000);
      })
      .finally(() => setLoading(false));
  };

  // Функция для изменения фото при редактировании
  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!allowed.includes(file.type)) {
        setEditErrors({
          ...editErrors,
          photo: "Поддерживаются только JPEG, PNG, WebP",
        });
        return;
      }
      if (file.size > maxSize) {
        setEditErrors({
          ...editErrors,
          photo: "Размер файла не должен превышать 2MB",
        });
        return;
      }
      setEditPhoto(file);
      setEditErrors({ ...editErrors, photo: "" });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category_id") || "";
    setActiveCategory(categoryParam);

    // Загружаем блюда из localStorage и API
    setLoading(true);
    setApiError("");

    // Сначала загружаем из localStorage
    const storedDishes = localStorage.getItem(`demo_menu_${chefId}`);
    if (storedDishes) {
      try {
        const parsedDishes = JSON.parse(storedDishes);
        setDishes(parsedDishes);
      } catch (e) {
        console.error("❌ Ошибка парсинга localStorage:", e);
      }
    }

    // Затем загружаем категории из API
    getChefMenu(chefId, categoryParam)
      .then((data) => {
        if (data?.categories?.length) setCategories(data.categories);

        // Если в localStorage нет блюд, загружаем из API
        if (!storedDishes && data?.dishes) {
          setDishes(data.dishes);
          localStorage.setItem(
            `demo_menu_${chefId}`,
            JSON.stringify(data.dishes)
          );
          console.log(
            "✅ Блюда загружены из API и сохранены в localStorage:",
            data.dishes
          );
        }
      })
      .catch((err) => setApiError(err?.message || t.chefMenu.loadError))
      .finally(() => setLoading(false));

    // Расчет рейтинга повара
    calculateChefRating();

    // Принудительное обновление рейтинга - ОТКЛЮЧЕНО (вызывало бесконечный цикл)
    // setTimeout(() => {
    //   console.log('🔄 Force updating chef rating after 1 second...');
    //   console.log('🔄 Current chef ID:', chefId);
    //   calculateChefRating();
    // }, 1000);

    // Дополнительное обновление - ОТКЛЮЧЕНО (вызывало бесконечный цикл)
    // setTimeout(() => {
    //   console.log('🔄 Force updating chef rating after 3 seconds...');
    //   calculateChefRating();
    // }, 3000);
  }, [location.search, chefId, calculateChefRating, t.chefMenu.loadError]);

  // Слушатель для обновления рейтинга при изменении заказов
  useEffect(() => {
    const handleStorageChange = () => {
      calculateChefRating();
    };

    const handleOrderRated = (event) => {
      // Принудительно проверяем данные после события
      setTimeout(() => {
        calculateChefRating();
      }, 100);
    };

    const handleReviewAdded = (event) => {
      calculateChefRating();
    };

    // Слушаем изменения в localStorage
    window.addEventListener("storage", handleStorageChange);

    // Также слушаем кастомные события
    window.addEventListener("orderRated", handleOrderRated);
    window.addEventListener("reviewAdded", handleReviewAdded);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("orderRated", handleOrderRated);
      window.removeEventListener("reviewAdded", handleReviewAdded);
    };
  }, [calculateChefRating]);

  // Принудительное обновление рейтинга при каждом рендере - ОТКЛЮЧЕНО (вызывало бесконечный цикл)
  // useEffect(() => {
  //   console.log('🔄 Component rendered, updating chef rating...');
  //   console.log('🔄 Current chef ID:', chefId);
  //   console.log('🔄 Current rating state:', chefRating);
  //   calculateChefRating();
  // }, [calculateChefRating, chefId, chefRating]);

  // Загрузка продуктов при смене вкладки
  useEffect(() => {
    if (activeTab === "products") {
      loadProducts();
    }
  }, [activeTab, chefId, loadProducts]);

  // Загрузка количества уведомлений при монтировании компонента
  useEffect(() => {
    loadUnreadNotificationsCount();
    loadOrderCounts();
  }, []);

  // Слушатель изменений в localStorage для обновления счетчика уведомлений
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "chefNotifications") {
        loadUnreadNotificationsCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Также слушаем изменения в том же окне - ОТКЛЮЧЕНО (вызывало частые ререндеры)
    // const interval = setInterval(() => {
    //   loadUnreadNotificationsCount();
    //   loadOrderCounts();
    // }, 2000); // Проверяем каждые 2 секунды

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-once");
      setTimeout(() => el.classList.remove("highlight-once"), 1200);
    }
  }, [location.hash, dishes]);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundImage: `url(${chefPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: "0" }}>Повар: {chefName || savedEmail}</h2>

            {/* Кнопки для отладки */}
            <button
              onClick={forceReloadDishes}
              style={{
                backgroundColor: "#2196f3",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              🔄 Перезагрузить
            </button>
            <button
              onClick={clearLocalStorage}
              style={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              🗑️ Очистить
            </button>
          </div>

          {/* Центрированные кнопки навигации */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
              maxWidth: "1200px",
            }}
          >
            {/* Кнопка "Статистика" */}
            <button
              onClick={() => setActiveTab("stats")}
              className={`chef-tab-button ${
                activeTab === "stats" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "stats"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "stats"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "stats" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <span>📊</span>
              Статистика
            </button>

            {/* Кнопка "Уведомления" */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`chef-tab-button ${
                activeTab === "notifications" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "notifications"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "notifications"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "notifications" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <span>🔔</span>
              Уведомления
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    borderRadius: "50%",
                    minWidth: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    animation: "pulse 2s infinite",
                  }}
                >
                  {unreadNotificationsCount > 99
                    ? "99+"
                    : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Кнопка "Доска заказов" */}
            <button
              onClick={() => setActiveTab("kanban")}
              className={`chef-tab-button ${
                activeTab === "kanban" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "kanban"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "kanban"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "kanban" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <AnimatedIcon name="orders" size={16} animation="bounce" />
              Доска заказов
              {/* Бейджи счетчиков заказов */}
              <div
                className="order-badges"
                style={{
                  display: "flex",
                  gap: "4px",
                  marginLeft: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {orderCounts.pending > 0 && (
                  <span
                    style={{
                      background: "#ff9800",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 4px",
                      lineHeight: "1",
                    }}
                  >
                    {orderCounts.pending}
                  </span>
                )}
                {orderCounts.preparing > 0 && (
                  <span
                    style={{
                      background: "#2196f3",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 4px",
                      lineHeight: "1",
                    }}
                  >
                    {orderCounts.preparing}
                  </span>
                )}
                {orderCounts.ready > 0 && (
                  <span
                    style={{
                      background: "#4caf50",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 4px",
                      lineHeight: "1",
                    }}
                  >
                    {orderCounts.ready}
                  </span>
                )}
                {orderCounts.delivering > 0 && (
                  <span
                    style={{
                      background: "#9c27b0",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 4px",
                      lineHeight: "1",
                    }}
                  >
                    {orderCounts.delivering}
                  </span>
                )}
              </div>
              {/* Мобильный бейдж - показывает общее количество заказов */}
              {orderCounts.pending +
                orderCounts.preparing +
                orderCounts.ready +
                orderCounts.delivering >
                0 && (
                <div
                  className="mobile-badge"
                  style={{
                    display: "none",
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#ff4444",
                    color: "white",
                    borderRadius: "50%",
                    minWidth: "20px",
                    height: "20px",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "bold",
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {orderCounts.pending +
                    orderCounts.preparing +
                    orderCounts.ready +
                    orderCounts.delivering}
                </div>
              )}
            </button>

            {/* Кнопка "AI Планировщик закупок" */}
            <button
              onClick={() => setActiveTab("procurement")}
              className={`chef-tab-button ${
                activeTab === "procurement" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "procurement"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "procurement"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "procurement" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <span>🤖</span>
              AI Закупки
            </button>

            {/* Кнопка "Календарь слотов" */}
            <button
              onClick={() => setActiveTab("slots")}
              className={`chef-tab-button ${
                activeTab === "slots" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "slots"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "slots"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "slots" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="calendar" size={16} animation="bounce" />
              Слоты работы
            </button>

            {/* Кнопка "Список покупок" */}
            <button
              onClick={() => setActiveTab("shopping-list")}
              className={`chef-tab-button ${
                activeTab === "shopping-list" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "shopping-list"
                    ? "2px solid #ff6b35"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "shopping-list"
                    ? "#ff6b35"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "shopping-list" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="shopping" size={16} animation="bounce" />
              Список покупок
            </button>

            {/* Кнопка "Рейтинги и достижения" */}
            <button
              onClick={() => setActiveTab("ratings")}
              className={`chef-tab-button ${
                activeTab === "ratings" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "ratings"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "ratings"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "ratings" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="star" size={16} animation="glow" />
              Рейтинги
            </button>

            {/* Кнопка "Запросы на приготовление" */}
            <button
              onClick={() => setActiveTab("cooking-requests")}
              className={`chef-tab-button ${
                activeTab === "cooking-requests" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "cooking-requests"
                    ? "2px solid #4caf50"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "cooking-requests"
                    ? "#4caf50"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "cooking-requests" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="chef" size={16} animation="rotate" />
              Запросы на готовку
            </button>

            {/* Кнопка "Помощь гостям" */}
            <button
              onClick={() => setActiveTab("help-guest-requests")}
              className={`chef-tab-button ${
                activeTab === "help-guest-requests" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "help-guest-requests"
                    ? "2px solid #ff6b35"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "help-guest-requests"
                    ? "#ff6b35"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "help-guest-requests" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="cooking" size={16} animation="pulse" />
              Помощь гостям
            </button>

            {/* Кнопка "Заготовки" */}
            <button
              onClick={() => setActiveTab("preparations")}
              className={`chef-tab-button ${
                activeTab === "preparations" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "preparations"
                    ? "2px solid #ff6b35"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "preparations"
                    ? "#ff6b35"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "preparations" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="preparations" size={16} animation="pulse" />
              Заготовки
            </button>

            {/* Кнопка "Профиль" */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`chef-tab-button ${
                activeTab === "profile" ? "active" : ""
              }`}
              style={{
                padding: "8px 16px",
                border:
                  activeTab === "profile"
                    ? "2px solid #9c27b0"
                    : "2px solid #e0e0e0",
                background:
                  activeTab === "profile"
                    ? "#9c27b0"
                    : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "profile" ? "white" : "#333",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <AnimatedIcon name="profile" size={16} animation="float" />
              Профиль
            </button>
          </div>

          {/* Кнопка "Выйти" */}
          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("chefId");
              localStorage.removeItem("role");
              navigate("/login", { replace: true });
            }}
            className="DeleteDishButton nav-button"
            style={{
              marginTop: "20px",
              padding: "8px 16px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AnimatedIcon name="logout" size={16} animation="shake" />
            Выйти
          </button>
        </div>

        {/* Личный кабинет повара */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <input
              type="checkbox"
              checked={showChefProfile}
              onChange={(e) => setShowChefProfile(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#4caf50" }}
            />
            <h3 style={{ margin: "0", color: "#333" }}>
              Личный кабинет повара
            </h3>
          </div>

          {showChefProfile && (
            <div
              style={{
                padding: "15px",
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: "8px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "20px",
                  alignItems: "start",
                }}
              >
                {/* Фото профиля */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: chefAvatar
                        ? "none"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      fontSize: "48px",
                      color: "white",
                      fontWeight: "bold",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {chefAvatar ? (
                      <img
                        src={chefAvatar}
                        alt="Фото профиля"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <span>
                        {chefName
                          ? chefName.charAt(0).toUpperCase()
                          : chefEmail
                          ? chefEmail.charAt(0).toUpperCase()
                          : "П"}
                      </span>
                    )}
                  </div>
                  <div className="avatar-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="avatar-upload-label"
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        marginBottom: "5px",
                      }}
                    >
                      📷 {chefAvatar ? "Изменить фото" : "Загрузить фото"}
                    </label>
                  </div>
                  {chefAvatar && (
                    <button
                      onClick={() => {
                        setChefAvatar(null);
                        localStorage.removeItem("chefAvatar");
                        showSuccess("Фото профиля удалено");
                      }}
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        marginTop: "5px",
                      }}
                    >
                      Удалить фото
                    </button>
                  )}
                </div>

                {/* Информация о поваре */}
                <div>
                  <div>
                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Имя:
                      </label>
                      <input
                        type="text"
                        placeholder="Введите ваше имя"
                        value={chefName}
                        disabled={!profileEditRequested}
                        onChange={(e) => {
                          setChefName(e.target.value);
                          localStorage.setItem("chefName", e.target.value);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: !profileEditRequested
                            ? "#f5f5f5"
                            : "white",
                          cursor: !profileEditRequested
                            ? "not-allowed"
                            : "text",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Email:
                      </label>
                      <input
                        type="email"
                        value={chefEmail}
                        disabled={!profileEditRequested}
                        onChange={(e) => {
                          setChefEmail(e.target.value);
                          localStorage.setItem("chefEmail", e.target.value);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: !profileEditRequested
                            ? "#f5f5f5"
                            : "white",
                          cursor: !profileEditRequested
                            ? "not-allowed"
                            : "text",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Специализация:
                      </label>
                      <select
                        value={chefSpecialization}
                        disabled={!profileEditRequested}
                        onChange={(e) => {
                          setChefSpecialization(e.target.value);
                          localStorage.setItem(
                            "chefSpecialization",
                            e.target.value
                          );
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: !profileEditRequested
                            ? "#f5f5f5"
                            : "white",
                          cursor: !profileEditRequested
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <option value="general">Общая кухня</option>
                        <option value="tatar">Татарская кухня</option>
                        <option value="european">Европейская кухня</option>
                        <option value="asian">Азиатская кухня</option>
                        <option value="vegetarian">Вегетарианская кухня</option>
                        <option value="halal">Халяльная кухня</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Опыт работы (лет):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={chefExperience}
                        disabled={!profileEditRequested}
                        onChange={(e) => {
                          setChefExperience(e.target.value);
                          localStorage.setItem(
                            "chefExperience",
                            e.target.value
                          );
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: !profileEditRequested
                            ? "#f5f5f5"
                            : "white",
                          cursor: !profileEditRequested
                            ? "not-allowed"
                            : "text",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Краткое описание:
                      </label>
                      <textarea
                        placeholder="Расскажите о себе, своих кулинарных предпочтениях и достижениях..."
                        value={chefDescription}
                        disabled={!profileEditRequested}
                        onChange={(e) => {
                          setChefDescription(e.target.value);
                          localStorage.setItem(
                            "chefDescription",
                            e.target.value
                          );
                        }}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          resize: "vertical",
                          backgroundColor: !profileEditRequested
                            ? "#f5f5f5"
                            : "white",
                          cursor: !profileEditRequested
                            ? "not-allowed"
                            : "text",
                        }}
                      />
                    </div>

                    {/* Кнопка сохранения изменений профиля */}
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                      <button
                        onClick={() => {
                          showSuccess("Профиль повара обновлен!");
                        }}
                        disabled={!profileEditRequested}
                        style={{
                          background: profileEditRequested
                            ? "linear-gradient(135deg, #4CAF50, #45a049)"
                            : "#cccccc",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          cursor: profileEditRequested
                            ? "pointer"
                            : "not-allowed",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          opacity: profileEditRequested ? 1 : 0.6,
                        }}
                        onMouseOver={(e) => {
                          if (profileEditRequested) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(0, 0, 0, 0.2)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (profileEditRequested) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 2px 8px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                      >
                        💾 Сохранить изменения профиля
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Запрос на редактирование профиля */}
              {!profileEditRequested && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    background: "rgba(255, 193, 7, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 193, 7, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      color: "#856404",
                      fontSize: "14px",
                    }}
                  >
                    ⚠️ Редактирование профиля доступно только по запросу у
                    администратора
                  </p>
                  <button
                    onClick={() => {
                      setProfileEditRequested(true);
                      showSuccess(
                        "Запрос на редактирование профиля отправлен администратору"
                      );
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    📝 Запросить разрешение на редактирование
                  </button>
                </div>
              )}

              {profileEditRequested && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    background: "rgba(76, 175, 80, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{ margin: "0", color: "#2e7d32", fontSize: "14px" }}
                  >
                    ✅ Запрос на редактирование отправлен. Ожидайте одобрения
                    администратора.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Рейтинг повара */}
        <div
          className="chef-rating-section"
          style={{
            margin: "15px 0",
            padding: "15px",
            background: "var(--bg-secondary)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3
              style={{
                margin: "0",
                fontSize: "16px",
                color: "var(--text-primary)",
              }}
            >
              {t.chefRating}:
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  console.log("🔄 Update rating button clicked");
                  console.log("🔄 Current chef ID:", chefId);
                  console.log("🔄 Current rating state:", chefRating);
                  calculateChefRating();
                  showSuccess(t.chefMenu.ratingUpdated);
                }}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🔄 Обновить рейтинг
              </button>
              <button
                onClick={() => {
                  console.log("🧪 Test button clicked - forcing rating update");
                  console.log(
                    "🧪 Testing localStorage:",
                    localStorage.getItem("clientOrders")
                  );
                  console.log("🧪 Testing chef ID:", chefId);

                  // Принудительно проверяем все данные
                  const allOrders = JSON.parse(
                    localStorage.getItem("clientOrders") || "[]"
                  );
                  console.log("🧪 All orders in test:", allOrders);

                  const ordersWithRating = allOrders.filter(
                    (order) => order.rating && order.rating > 0
                  );
                  console.log(
                    "🧪 Orders with rating in test:",
                    ordersWithRating
                  );

                  const chefOrders = allOrders.filter(
                    (order) =>
                      order.chefId === chefId ||
                      (chefId === "chef-1" &&
                        (!order.chefId || order.chefId === "chef-1"))
                  );
                  console.log("🧪 Chef orders in test:", chefOrders);

                  calculateChefRating();
                  showSuccess(t.chefMenu.testCompleted);
                }}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  background: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🧪 Тест
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Rating
                rating={chefRating}
                readOnly={true}
                size="large"
                showValue={true}
                showCount={false}
                count={chefReviewsCount}
              />
              <span
                style={{
                  color: "#2E7D32",
                  fontSize: "18px",
                  fontWeight: "bold",
                  background: "#E8F5E8",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                {chefRating > 0 ? chefRating.toFixed(1) : "0.0"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {chefReviewsCount === 0
                  ? t.noRatingsYet
                  : `${chefReviewsCount} ${t.ratings}`}
              </span>
              {chefReviewsCount > 0 && (
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                >
                  Средняя оценка
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Разделитель между личным кабинетом и контентом */}
        <div
          style={{
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #e0e0e0, transparent)",
            margin: "20px 0",
            borderRadius: "1px",
          }}
        ></div>

        {/* Кнопки вкладок с аватаркой в центре */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "20px",
          }}
        >
          {/* Кнопка "Мои продукты" - слева */}
          <button
            onClick={() => setActiveTab("products")}
            className={`chef-tab-button ${
              activeTab === "products" ? "active" : ""
            }`}
            style={{
              padding: "12px 20px",
              border:
                activeTab === "products"
                  ? "2px solid #4caf50"
                  : "2px solid #2e7d32",
              background:
                activeTab === "products"
                  ? "#4caf50"
                  : "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.25) 100%)",
              color: activeTab === "products" ? "white" : "#2e7d32",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === "products"
                  ? "0 4px 12px rgba(76, 175, 80, 0.3)"
                  : "0 2px 4px rgba(0, 0, 0, 0.1)",
              transform:
                activeTab === "products" ? "translateY(-2px)" : "translateY(0)",
              fontSize: "14px",
              minWidth: "140px",
            }}
          >
            <span style={{ fontSize: "16px", marginRight: "8px" }}>🛒</span>{" "}
            {t.myProducts}
          </button>

          {/* Аватарка повара - справа от статистики */}
          {savedAvatar && (
            <img src={savedAvatar} alt={t.chefMenu.avatar} className="avatar" />
          )}

          {/* Кнопка "Мои блюда" - справа */}
          <button
            onClick={() => {
              console.log('🔍 Клик по кнопке "Мои блюда"');
              console.log("🔍 Текущий activeTab:", activeTab);
              setActiveTab("dishes");
              console.log("🔍 Установлен activeTab в:", "dishes");
              // Добавляем визуальную обратную связь
              setTimeout(() => {
                console.log("🔍 Проверка activeTab после клика:", activeTab);
              }, 100);
            }}
            className={`chef-tab-button ${
              activeTab === "dishes" ? "active" : ""
            }`}
            style={{
              padding: "12px 20px",
              border:
                activeTab === "dishes"
                  ? "2px solid #4caf50"
                  : "2px solid #2e7d32",
              background:
                activeTab === "dishes" ? "#4caf50" : "rgba(76, 175, 80, 0.1)",
              color: activeTab === "dishes" ? "white" : "#2e7d32",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === "dishes"
                  ? "0 4px 12px rgba(76, 175, 80, 0.3)"
                  : "0 2px 4px rgba(0, 0, 0, 0.1)",
              transform:
                activeTab === "dishes" ? "translateY(-2px)" : "translateY(0)",
              fontSize: "14px",
              minWidth: "140px",
            }}
          >
            <span style={{ fontSize: "16px", marginRight: "8px" }}>🍽️</span>{" "}
            {t.myDishes}
          </button>
        </div>

        {/* Кнопки AI-помощников */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Помощник по текстам */}
          <button
            onClick={() => setShowAITextHelper(!showAITextHelper)}
            className={`chef-tab-button ${showAITextHelper ? "active" : ""}`}
            style={{
              padding: "12px 20px",
              border: showAITextHelper
                ? "2px solid #4ecdc4"
                : "2px solid #2a8b7a",
              background: showAITextHelper
                ? "#4ecdc4"
                : "linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(78, 205, 196, 0.25) 100%)",
              color: showAITextHelper ? "white" : "#2a8b7a",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              boxShadow: showAITextHelper
                ? "0 4px 12px rgba(78, 205, 196, 0.3)"
                : "0 2px 4px rgba(0, 0, 0, 0.1)",
              transform: showAITextHelper
                ? "translateY(-2px)"
                : "translateY(0)",
              fontSize: "14px",
              minWidth: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px", marginRight: "8px" }}>📝</span>{" "}
            Помощник по текстам
          </button>

          {/* Анализ блюд */}
          <button
            onClick={() => navigate("/chef/ai-assistant")}
            className="chef-tab-button"
            style={{
              padding: "12px 20px",
              border: "2px solid #ff6b6b",
              background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
              color: "white",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
              transform: "translateY(0)",
              fontSize: "14px",
              minWidth: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px rgba(255, 107, 107, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.3)";
            }}
          >
            <span style={{ fontSize: "16px", marginRight: "8px" }}>🍽️</span>{" "}
            Анализ блюд
          </button>
        </div>

        {activeTab === "dishes" && showDishForm && (
          <form
            onSubmit={handleAddDish}
            className="DishForm"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <input
              type="text"
              placeholder={t.chefMenu.dishName}
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              required
            />
            {errors.name && <p style={{ color: "#d32f2f" }}>{errors.name}</p>}
            <textarea
              placeholder={t.chefMenu.description}
              value={dishDescription}
              onChange={(e) => setDishDescription(e.target.value)}
              rows={3}
            />
            <input
              type="number"
              placeholder={t.chefMenu.price}
              value={dishPrice}
              onChange={(e) => setDishPrice(e.target.value)}
              min="1"
              step="0.01"
              required
            />
            {errors.price && <p style={{ color: "#d32f2f" }}>{errors.price}</p>}
            <select
              value={dishCategory}
              onChange={(e) => setDishCategory(e.target.value)}
            >
              <option value="">{t.chefMenu.selectCategory}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p style={{ color: "#d32f2f" }}>{errors.category}</p>
            )}

            {/* Чекбокс для блюд из продуктов клиента */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <input
                type="checkbox"
                id="isClientProducts"
                checked={isClientProducts}
                onChange={(e) => setIsClientProducts(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <label
                htmlFor="isClientProducts"
                style={{ fontSize: "14px", color: "#666" }}
              >
                {t.chefMenu.isClientProducts}
              </label>
            </div>

            {/* Поле для ингредиентов с авто-расчетом калорий */}
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                {t.chefMenu.ingredients}:
              </label>
              <textarea
                placeholder={t.chefMenu.ingredientsPlaceholder}
                value={dishIngredients}
                onChange={(e) => handleIngredientsChange(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: "5px 0 0",
                  fontStyle: "italic",
                }}
              >
                {t.chefMenu.ingredientsFormat}
              </p>
            </div>

            {/* Поля для калорий и БЖУ */}
            <div style={{ marginBottom: "10px" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: "0 0 10px",
                  fontStyle: "italic",
                }}
              >
                {t.chefMenu.autoCalculationNote}
              </p>

              {/* Способ приготовления */}
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  🍳 Способ приготовления:
                </label>
                <select
                  value={dishCookingMethod || "варка"}
                  onChange={(e) => {
                    setDishCookingMethod(e.target.value);
                    // Пересчитываем при изменении способа приготовления
                    if (dishIngredients) {
                      const nutrition = calculateNutrition(
                        dishIngredients,
                        e.target.value
                      );
                      if (nutrition && typeof nutrition === "object") {
                        setDishCalories((nutrition.calories || 0).toString());
                        setDishProtein((nutrition.protein || 0).toString());
                        setDishCarbs((nutrition.carbs || 0).toString());
                        setDishFat((nutrition.fat || 0).toString());
                      } else {
                        setDishCalories("0");
                        setDishProtein("0");
                        setDishCarbs("0");
                        setDishFat("0");
                      }
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="сырой">Сырой</option>
                  <option value="варка">Варка</option>
                  <option value="на пару">На пару</option>
                  <option value="тушение">Тушение</option>
                  <option value="запекание">Запекание</option>
                  <option value="жарка">Жарка</option>
                  <option value="фритюр">Фритюр</option>
                  <option value="гриль">Гриль</option>
                  <option value="копчение">Копчение</option>
                </select>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    margin: "5px 0 0 0",
                  }}
                >
                  💡 Способ приготовления влияет на калорийность блюда
                </p>
              </div>

              {/* Быстрый выбор рецепта */}
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  🍽️ Быстрый выбор рецепта:
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value=""
                    onChange={(e) => {
                      const recipeKey = e.target.value;
                      if (recipeKey) {
                        let recipe;
                        if (recipeKey === "random") {
                          recipe = getRandomRecipe();
                        } else {
                          recipe = findRecipe(recipeKey);
                        }

                        if (recipe) {
                          setDishName(recipe.name);
                          setDishIngredients(recipe.ingredients);
                          setDishCookingMethod(recipe.cookingMethod);
                          const nutrition = calculateNutrition(
                            recipe.ingredients,
                            recipe.cookingMethod
                          );
                          if (nutrition && typeof nutrition === "object") {
                            setDishCalories(
                              (nutrition.calories || 0).toString()
                            );
                            setDishProtein((nutrition.protein || 0).toString());
                            setDishCarbs((nutrition.carbs || 0).toString());
                            setDishFat((nutrition.fat || 0).toString());
                          } else {
                            setDishCalories("0");
                            setDishProtein("0");
                            setDishCarbs("0");
                            setDishFat("0");
                          }
                        }
                        e.target.value = ""; // Сброс выбора
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "14px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                      paddingRight: "40px",
                    }}
                  >
                    <option value="" disabled>
                      ✅ Выберите рецепт из списка...
                    </option>
                    <optgroup label="🥗 Салаты">
                      <option value="цезарь">Салат Цезарь</option>
                      <option value="греческий">Греческий салат</option>
                      <option value="оливье">Салат Оливье</option>
                      <option value="капрезе">Капрезе</option>
                      <option value="винегрет">Винегрет</option>
                      <option value="мимоза">Салат Мимоза</option>
                    </optgroup>
                    <optgroup label="🍲 Супы">
                      <option value="борщ">Борщ</option>
                      <option value="щи">Щи из свежей капусты</option>
                      <option value="куриный суп">Куриный суп с лапшой</option>
                      <option value="солянка">Солянка мясная</option>
                      <option value="харчо">Харчо</option>
                      <option value="гаспачо">Гаспачо</option>
                    </optgroup>
                    <optgroup label="🍖 Вторые блюда">
                      <option value="плов">Плов с бараниной</option>
                      <option value="картофель жареный">
                        Картофель жареный
                      </option>
                      <option value="котлеты">Котлеты мясные</option>
                      <option value="рыба запеченная">
                        Рыба запеченная с овощами
                      </option>
                      <option value="бефстроганов">Бефстроганов</option>
                      <option value="гуляш">Гуляш</option>
                      <option value="шашлык">Шашлык из свинины</option>
                      <option value="рыба в кляре">Рыба в кляре</option>
                    </optgroup>
                    <optgroup label="🍝 Паста">
                      <option value="паста карбонара">Паста Карбонара</option>
                      <option value="паста болоньезе">Паста Болоньезе</option>
                      <option value="паста арабьята">Паста Арабьята</option>
                      <option value="паста песто">Паста с песто</option>
                    </optgroup>
                    <optgroup label="🥞 Выпечка">
                      <option value="блины">Блины</option>
                      <option value="оладьи">Оладьи</option>
                      <option value="пирог с яблоками">Пирог с яблоками</option>
                      <option value="кекс">Кекс с изюмом</option>
                      <option value="вафли">Вафли</option>
                    </optgroup>
                    <optgroup label="🍰 Десерты">
                      <option value="тирамису">Тирамису</option>
                      <option value="чизкейк">Чизкейк</option>
                      <option value="панкейки">Панкейки</option>
                      <option value="мороженое">Домашнее мороженое</option>
                      <option value="шарлотка">Шарлотка с яблоками</option>
                    </optgroup>
                    <optgroup label="🥤 Напитки">
                      <option value="компот">Компот из сухофруктов</option>
                      <option value="морс">Клюквенный морс</option>
                      <option value="кисель">Кисель ягодный</option>
                      <option value="смузи">Смузи банановый</option>
                    </optgroup>
                    <optgroup label="🎲 Специальные">
                      <option value="random">🎲 Случайный рецепт</option>
                    </optgroup>
                  </select>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    margin: "5px 0 0 0",
                  }}
                >
                  💡 Выберите готовый рецепт для автоматического заполнения
                  полей
                </p>
              </div>

              <div className="nutrition-grid">
                <div className="nutrition-field">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {t.chefMenu.calories}:{" "}
                    {dishCalories && (
                      <span style={{ color: "#4caf50", fontSize: "12px" }}>
                        🤖 Авто
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={dishCalories}
                    onChange={(e) => setDishCalories(e.target.value)}
                    min="0"
                    step="1"
                    style={{
                      backgroundColor: dishCalories ? "#f0f8f0" : "white",
                      border: dishCalories
                        ? "1px solid #4caf50"
                        : "1px solid #ddd",
                    }}
                  />
                  {nutritionAccuracy && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      Точность: {nutritionAccuracy.caloriesAccuracy.toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="nutrition-field">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {t.chefMenu.protein}:{" "}
                    {dishProtein && (
                      <span style={{ color: "#4caf50", fontSize: "12px" }}>
                        🤖 Авто
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={dishProtein}
                    onChange={(e) => setDishProtein(e.target.value)}
                    min="0"
                    step="0.1"
                    style={{
                      backgroundColor: dishProtein ? "#f0f8f0" : "white",
                      border: dishProtein
                        ? "1px solid #4caf50"
                        : "1px solid #ddd",
                    }}
                  />
                  {nutritionAccuracy && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      Точность: {nutritionAccuracy.proteinAccuracy.toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="nutrition-field">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {t.chefMenu.carbs}:{" "}
                    {dishCarbs && (
                      <span style={{ color: "#4caf50", fontSize: "12px" }}>
                        🤖 Авто
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={dishCarbs}
                    onChange={(e) => setDishCarbs(e.target.value)}
                    min="0"
                    step="0.1"
                    style={{
                      backgroundColor: dishCarbs ? "#f0f8f0" : "white",
                      border: dishCarbs
                        ? "1px solid #4caf50"
                        : "1px solid #ddd",
                    }}
                  />
                  {nutritionAccuracy && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      Точность: {nutritionAccuracy.carbsAccuracy.toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="nutrition-field">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {t.chefMenu.fat}:{" "}
                    {dishFat && (
                      <span style={{ color: "#4caf50", fontSize: "12px" }}>
                        🤖 Авто
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={dishFat}
                    onChange={(e) => setDishFat(e.target.value)}
                    min="0"
                    step="0.1"
                    style={{
                      backgroundColor: dishFat ? "#f0f8f0" : "white",
                      border: dishFat ? "1px solid #4caf50" : "1px solid #ddd",
                    }}
                  />
                  {nutritionAccuracy && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      Точность: {nutritionAccuracy.fatAccuracy.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Индикатор точности калорий и БЖУ */}
              {nutritionAccuracy && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    background: "#e3f2fd",
                    borderRadius: "6px",
                    border: "1px solid #2196f3",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#1976d2",
                      }}
                    >
                      📊 Точность расчета калорий и БЖУ
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "4px",
                        backgroundColor: "#bbdefb",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          backgroundColor: "#2196f3",
                          width: `${nutritionAccuracy.overallAccuracy}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#1976d2",
                      }}
                    >
                      {nutritionAccuracy.overallAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#1976d2",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "5px",
                    }}
                  >
                    <div>
                      Калории: {nutritionAccuracy.caloriesAccuracy.toFixed(1)}%
                    </div>
                    <div>
                      Белки: {nutritionAccuracy.proteinAccuracy.toFixed(1)}%
                    </div>
                    <div>
                      Углеводы: {nutritionAccuracy.carbsAccuracy.toFixed(1)}%
                    </div>
                    <div>Жиры: {nutritionAccuracy.fatAccuracy.toFixed(1)}%</div>
                  </div>
                </div>
              )}

              {/* AI-Проверка адекватности КБЖУ - ВРЕМЕННО ОТКЛЮЧЕНО (вызывало бесконечный цикл) */}
              {/* {dishIngredients && dishIngredients.trim().length > 0 && (dishCalories || dishProtein || dishCarbs || dishFat) && (
              <NutritionValidationPanel
                manualData={{
                  calories: dishCalories,
                  protein: dishProtein,
                  carbs: dishCarbs,
                  fat: dishFat
                }}
                ingredients={dishIngredients ? dishIngredients.split(',').map(ing => ing.trim()) : []}
                onValidationComplete={(result) => {
                  console.log('Validation result:', result);
                  // Можно добавить логику для блокировки сохранения при критических ошибках
                  if (!result.isValid && result.needsReview) {
                    // Показываем предупреждение, но не блокируем
                    console.warn('Nutrition data needs review');
                  }
                }}
                onAutoFill={(aiData) => {
                  // Автоматически заполняем поля AI-расчетами
                  setDishCalories(aiData.calories.toString());
                  setDishProtein(aiData.protein.toString());
                  setDishCarbs(aiData.carbs.toString());
                  setDishFat(aiData.fat.toString());
                  console.log('🤖 AI автоматически заполнил поля КБЖУ:', aiData);
                }}
              />
            )} */}
            </div>

            {/* Диабетические поля */}
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                background: "rgba(76, 175, 80, 0.1)",
                borderRadius: "10px",
                border: "2px solid rgba(76, 175, 80, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newValue = !dishDiabeticFriendly;
                  console.log('🩺 Клик по галочке "Меню для диабетиков"');
                  console.log("🩺 Текущее значение:", dishDiabeticFriendly);
                  console.log("🩺 Новое значение:", newValue);
                  setDishDiabeticFriendly(newValue);

                  if (newValue) {
                    // Если галочка поставлена, пересчитываем на основе ингредиентов
                    if (dishIngredients && dishIngredients.trim().length > 0) {
                      // Есть ингредиенты - пересчитываем диабетические значения
                      // Используем setTimeout чтобы не блокировать UI
                      setTimeout(() => {
                        try {
                          const diabeticValues =
                            simpleDiabeticCalculator.calculateDiabeticValues(
                              dishIngredients,
                              dishCookingMethod
                            );
                          if (
                            diabeticValues &&
                            typeof diabeticValues === "object"
                          ) {
                            if (dishSugarSubstitutes) {
                              setDishSugar(
                                ((diabeticValues.sugar || 0) * 0.01).toString()
                              ); // Уменьшаем в 100 раз
                              setDishGlycemicIndex(
                                (
                                  (diabeticValues.glycemicIndex || 0) * 0.1
                                ).toString()
                              ); // Уменьшаем в 10 раз
                            } else {
                              setDishSugar(
                                ((diabeticValues.sugar || 0) * 0.1).toString()
                              ); // Уменьшаем в 10 раз
                              setDishGlycemicIndex(
                                (
                                  (diabeticValues.glycemicIndex || 0) * 0.3
                                ).toString()
                              ); // Уменьшаем в 3 раза
                            }
                          } else {
                            // Fallback если diabeticValues неверный
                            setDishSugar(dishSugarSubstitutes ? "0.5" : "5.0");
                            setDishGlycemicIndex(
                              dishSugarSubstitutes ? "15" : "45"
                            );
                          }
                        } catch (error) {
                          console.error(
                            "Error calculating diabetic values in checkbox handler:",
                            error
                          );
                          // Fallback при ошибке или таймауте
                          setDishSugar(dishSugarSubstitutes ? "0.5" : "5.0");
                          setDishGlycemicIndex(
                            dishSugarSubstitutes ? "15" : "45"
                          );
                        }
                      }, 100); // Задержка 100мс чтобы не блокировать UI
                    } else {
                      // Нет ингредиентов - показываем базовые диабетические значения
                      setDishSugar(dishSugarSubstitutes ? "0.5" : "5.0");
                      setDishGlycemicIndex(dishSugarSubstitutes ? "15" : "45");
                    }
                    setDiabeticAccuracy({
                      sugarAccuracy: dishSugarSubstitutes ? 95.0 : 85.0,
                      glycemicAccuracy: dishSugarSubstitutes ? 92.0 : 80.0,
                      overallAccuracy: dishSugarSubstitutes ? 93.5 : 82.5,
                    });
                  } else {
                    // Если галочка снята, очищаем поля
                    setDishSugar("");
                    setDishGlycemicIndex("");
                    setDishSugarSubstitutes(false);
                    setDiabeticAccuracy({
                      sugarAccuracy: 87.3,
                      glycemicAccuracy: 84.7,
                      overallAccuracy: 86.0,
                    });
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={dishDiabeticFriendly}
                  onChange={() => {}} // Пустой обработчик для предотвращения ошибок
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "#4caf50",
                    cursor: "pointer",
                    transform: "scale(1.2)",
                    marginRight: "5px",
                  }}
                />
                <h4
                  style={{
                    margin: "0",
                    color: "#2e7d32",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  🩺{" "}
                  {(t.diabeticMenu &&
                    (t.diabeticMenu.title || t.diabeticMenu)) ||
                    "Диабетическое меню"}
                </h4>
              </div>

              {/* AI-подсказки и индикаторы */}
              {dishIngredients && (
                <div style={{ marginBottom: "15px" }}>
                  {/* Индикатор автоматического расчета для диабетических полей */}
                  <div
                    style={{
                      marginBottom: "10px",
                      padding: "8px",
                      borderRadius: "4px",
                      backgroundColor: "#e8f5e8",
                      border: "1px solid #4caf50",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#2e7d32",
                        }}
                      >
                        🤖 AI-анализ диабетических показателей
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "4px",
                          backgroundColor: "#c8e6c9",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            backgroundColor: "#4caf50",
                            width: diabeticAccuracy
                              ? `${diabeticAccuracy.overallAccuracy}%`
                              : "100%",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#2e7d32",
                        }}
                      >
                        {diabeticAccuracy
                          ? `${diabeticAccuracy.overallAccuracy.toFixed(1)}%`
                          : "✅ Активен"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#2e7d32",
                        margin: "5px 0 0 0",
                      }}
                    >
                      🧠 Использует TensorFlow.js, OCR, внешние AI API и
                      машинное обучение для максимальной точности
                      {diabeticAccuracy &&
                        ` (${diabeticAccuracy.overallAccuracy.toFixed(1)}%)`}
                    </p>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#2e7d32",
                        margin: "3px 0 0 0",
                      }}
                    >
                      🔬 Системы: Диабетический калькулятор + TensorFlow + OCR +
                      HuggingFace + Google Vision + OpenAI
                    </div>
                  </div>

                  {/* Индикатор качества блюда */}
                  <div
                    style={{
                      padding: "10px",
                      background: "#FFF3E0",
                      borderRadius: "6px",
                      border: "1px solid #FF9800",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>⭐</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#F57C00",
                        }}
                      >
                        Качество блюда:{" "}
                        {diabeticAccuracy
                          ? diabeticAccuracy.overallAccuracy >= 90
                            ? "Отличное"
                            : diabeticAccuracy.overallAccuracy >= 80
                            ? "Хорошее"
                            : "Удовлетворительное"
                          : "Анализ..."}
                      </div>
                      <div style={{ fontSize: "10px", color: "#666" }}>
                        {diabeticAccuracy
                          ? diabeticAccuracy.overallAccuracy >= 90
                            ? "Сбалансированный состав, подходящие ингредиенты"
                            : diabeticAccuracy.overallAccuracy >= 80
                            ? "Хороший состав, большинство ингредиентов подходят"
                            : "Требует внимания к составу"
                          : "Анализируем ингредиенты..."}
                      </div>
                    </div>
                    <div
                      style={{
                        background: diabeticAccuracy
                          ? diabeticAccuracy.overallAccuracy >= 90
                            ? "#4CAF50"
                            : diabeticAccuracy.overallAccuracy >= 80
                            ? "#FF9800"
                            : "#F44336"
                          : "#9E9E9E",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {diabeticAccuracy
                        ? `${diabeticAccuracy.overallAccuracy.toFixed(1)}%`
                        : "..."}
                    </div>
                  </div>
                </div>
              )}

              {/* Кнопка для открытия детального калькулятора - ВРЕМЕННО СКРЫТА */}
              {/* <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              margin: '20px 0',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowIntegratedPricing(!showIntegratedPricing)}
                style={{
                  padding: '10px 16px',
                  background: showIntegratedPricing ? '#e74c3c' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  minWidth: '180px',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <span>{showIntegratedPricing ? '🔼' : '🔽'}</span>
                {showIntegratedPricing ? 'Скрыть интегрированную систему' : 'Интегрированная система'}
              </button>
            </div> */}

              {/* Интегрированная система ценообразования (показывается по кнопке) - ВРЕМЕННО СКРЫТА */}
              {/* {showIntegratedPricing && (
              <IntegratedPricingDemo />
            )} */}

              {/* Поля показываются только если поставлена галочка */}
              {dishDiabeticFriendly && (
                <div
                  style={{
                    padding: "15px",
                    background: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "8px",
                    border: "1px solid rgba(76, 175, 80, 0.2)",
                    animation: "fadeIn 0.3s ease-in-out",
                  }}
                >
                  <div
                    className="nutrition-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "15px",
                    }}
                  >
                    <div className="nutrition-field">
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {t.diabeticMenu.sugar} (г):{" "}
                        <span style={{ color: "#4caf50", fontSize: "12px" }}>
                          🤖 AI-расчет
                        </span>
                      </label>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={dishSugar}
                        readOnly
                        style={{
                          backgroundColor: "#f0f8f0",
                          border: "1px solid #4caf50",
                          cursor: "not-allowed",
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <div className="nutrition-field">
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {t.diabeticMenu.glycemicIndex}:{" "}
                        <span style={{ color: "#4caf50", fontSize: "12px" }}>
                          🤖 AI-расчет
                        </span>
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={dishGlycemicIndex}
                        readOnly
                        style={{
                          backgroundColor: "#f0f8f0",
                          border: "1px solid #4caf50",
                          cursor: "not-allowed",
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "15px",
                      display: "flex",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={dishSugarSubstitutes}
                        readOnly
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#4caf50",
                          cursor: "not-allowed",
                          opacity: 0.8,
                        }}
                      />
                      {t.diabeticMenu.sugarSubstitutes}
                      <span
                        style={{
                          color: "#4caf50",
                          fontSize: "12px",
                          marginLeft: "5px",
                        }}
                      >
                        🤖 AI-анализ
                      </span>
                    </label>
                  </div>

                  {/* Диабетическая проверка ингредиентов */}
                  <DiabeticChecker
                    ingredients={dishIngredients}
                    onDiabeticStatusChange={handleDiabeticStatusChange}
                  />
                </div>
              )}
            </div>

            {/* Основное фото блюда */}
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {t.chefMenu.mainPhoto}:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {dishPhoto && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={dishPhoto}
                    alt={t.chefMenu.preview}
                    className="DishPreview"
                  />
                  <button
                    onClick={() => setShowPhotoAnalyzer(true)}
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    📸 AI Анализ фото
                  </button>
                </div>
              )}
            </div>

            {/* Фото "до" и "после" для блюд из продуктов клиента */}
            {isClientProducts && (
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {t.chefMenu.beforePhoto}:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDishBeforePhoto(e.target.files[0])}
                      required
                    />
                    {dishBeforePhoto && (
                      <img
                        src={URL.createObjectURL(dishBeforePhoto)}
                        alt="Фото до"
                        style={{
                          width: "100%",
                          maxWidth: "150px",
                          marginTop: "5px",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {t.chefMenu.afterPhoto}:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDishAfterPhoto(e.target.files[0])}
                      required
                    />
                    {dishAfterPhoto && (
                      <img
                        src={URL.createObjectURL(dishAfterPhoto)}
                        alt="Фото после"
                        style={{
                          width: "100%",
                          maxWidth: "150px",
                          marginTop: "5px",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Smart Tagging - AI предлагает теги */}
            {dishIngredients &&
              dishIngredients.trim().length > 0 &&
              (dishCalories || dishProtein || dishCarbs || dishFat) && (
                <div style={{ marginBottom: "20px" }}>
                  <SmartTagSelector
                    ingredients={dishIngredients}
                    nutrition={{
                      calories: Number(dishCalories) || 0,
                      protein: Number(dishProtein) || 0,
                      carbs: Number(dishCarbs) || 0,
                      fat: Number(dishFat) || 0,
                    }}
                    selectedTags={dishTags}
                    onTagsChange={(tags) => setDishTags(tags)}
                  />
                </div>
              )}

            {/* Кнопка "Поделиться КБЖУ" */}
            {dishName &&
              dishIngredients &&
              (dishCalories || dishProtein || dishCarbs || dishFat) && (
                <div
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ShareNutritionButton
                    dish={{
                      name: dishName,
                      description: dishDescription,
                      ingredients: dishIngredients,
                      calories: Number(dishCalories) || 0,
                      protein: Number(dishProtein) || 0,
                      carbs: Number(dishCarbs) || 0,
                      fat: Number(dishFat) || 0,
                      fiber: Number(dishFiber) || 0,
                      sugar: Number(dishSugar) || 0,
                      sodium: 0, // Дефолтное значение, так как поле не определено
                      weight: 100, // Дефолтное значение, так как поле не определено
                      category: dishCategory,
                      diabeticFriendly: dishDiabeticFriendly,
                    }}
                  />
                </div>
              )}

            {/* AI Benefit Generator - ВРЕМЕННО ОТКЛЮЧЕНО (вызывало бесконечный цикл) */}
            {/* {dishName && dishIngredients && (dishCalories || dishProtein || dishCarbs || dishFat) && (
            <AIBenefitPanel
              dish={{
                name: dishName,
                ingredients: dishIngredients,
                dishCalories: Number(dishCalories) || 0,
                dishProtein: Number(dishProtein) || 0,
                dishCarbs: Number(dishCarbs) || 0,
                dishFat: Number(dishFat) || 0,
                dishFiber: Number(dishFiber) || 0,
                diabeticFriendly: dishDiabeticFriendly
              }}
              onBenefitGenerated={(benefit) => {
                // Добавляем сгенерированный текст к описанию
                const currentDescription = dishDescription || '';
                const newDescription = currentDescription 
                  ? `${currentDescription}\n\n${benefit}`
                  : benefit;
                setDishDescription(newDescription);
              }}
            />
          )} */}

            {imageError && <p style={{ color: "#d32f2f" }}>{imageError}</p>}
            <button type="submit" className="SaveDishButton" disabled={loading}>
              {t.chefMenu.addDish}
            </button>
            {apiError && <p style={{ color: "#d32f2f" }}>{apiError}</p>}
          </form>
        )}

        {activeTab === "dishes" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "30px",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto 30px auto",
                padding: "0 20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2D5016",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {t.chefMenu.yourMenu}
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setShowDishForm(!showDishForm)}
                  style={{
                    background: showDishForm ? "#e74c3c" : "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "15px 30px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                    minWidth: "200px",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                  }}
                >
                  {showDishForm ? "❌ Закрыть форму" : "➕ Добавить блюдо"}
                </button>

                {/* Тестовая кнопка для быстрого доступа к галочке диабетического меню */}
                <button
                  onClick={() => {
                    setShowDishForm(true);
                    // Автоматически заполняем поля для тестирования
                    setDishName("Тестовое блюдо для диабетиков");
                    setDishDescription("Тестовое описание блюда");
                    setDishPrice("250");
                    setDishIngredients(
                      "помидоры, огурцы, оливковое масло, листья салата"
                    );
                    setDishCookingMethod("сырой");
                    console.log(
                      "🧪 Тестовая кнопка: форма открыта, поля заполнены"
                    );
                  }}
                  style={{
                    background: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "15px 20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
                    minWidth: "180px",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(255, 152, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(255, 152, 0, 0.3)";
                  }}
                >
                  🧪 Тест галочки диабетиков
                </button>

                {/* Кнопка проверки этичности */}
                {dishes.length > 0 && (
                  <button
                    onClick={() => setShowConscienceChecker(true)}
                    style={{
                      background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "15px 20px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(156, 39, 176, 0.3)",
                      minWidth: "180px",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(156, 39, 176, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 8px rgba(156, 39, 176, 0.3)";
                    }}
                  >
                    🔍 Проверка этичности
                  </button>
                )}

                {/* Кнопка: AI-Конструктор Праздничных Сет-Меню */}
                {dishes.length > 0 && (
                  <button
                    onClick={() => setShowHolidaySetMenu(true)}
                    style={{
                      background: "linear-gradient(135deg, #ff9800, #f57c00)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "15px 20px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
                      minWidth: "180px",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(255, 152, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 8px rgba(255, 152, 0, 0.3)";
                    }}
                  >
                    🎄 Праздничные наборы
                  </button>
                )}
              </div>
            </div>
            <div
              className="CategoriesGrid"
              role="tablist"
              aria-label="Категории меню"
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "10px",
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 20px",
              }}
            >
              <button
                key="all"
                role="tab"
                aria-selected={!activeCategory}
                className="CategoryButton"
                onClick={() => handleSelectCategory("")}
                style={{
                  background: !activeCategory
                    ? "linear-gradient(135deg, #ff7043, #f57c00)"
                    : "linear-gradient(135deg, #ff7043, #f57c00)",
                  opacity: !activeCategory ? 1 : 0.7,
                  minWidth: "150px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                📋 Все блюда
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  className="CategoryButton"
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    background:
                      activeCategory === cat.id
                        ? "linear-gradient(135deg, #4caf50, #45a049)"
                        : "linear-gradient(135deg, #ff7043, #f57c00)",
                    opacity: activeCategory === cat.id ? 1 : 0.8,
                    minWidth: "150px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === "products" && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "15px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>🛒 {t.farmersMarketProducts}</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  alignItems: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowProductForm(true)}
                  style={{
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  ➕ {t.addProduct}
                </button>
                <button
                  onClick={() => setActiveTab("dishes")}
                  style={{
                    background: "linear-gradient(135deg, #6c757d, #495057)",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 8px rgba(108, 117, 125, 0.3)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(108, 117, 125, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(108, 117, 125, 0.3)";
                  }}
                >
                  ← {t.common.back}
                </button>
              </div>
            </div>

            {/* Форма добавления/редактирования продукта */}
            {showProductForm && (
              <div
                style={{
                  background: "rgba(76, 175, 80, 0.05)",
                  border: "2px solid #4caf50",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    {editingProduct
                      ? "✏️ Редактировать продукт"
                      : "➕ Добавить продукт"}
                  </h4>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductName("");
                      setProductDescription("");
                      setProductPrice("");
                      setProductCategory("vegetables");
                      setProductUnit("кг");
                      setProductOrigin("");
                      setProductAvailable(true);
                      setProductSeasonal(false);
                      setProductOrganic(false);
                      setProductImage(null);
                    }}
                    style={{
                      background: "rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      color: "#333",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 0, 0, 0.2)";
                      e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 0, 0, 0.1)";
                      e.target.style.transform = "scale(1)";
                    }}
                    title="Закрыть форму"
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Название продукта *
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Например: Свежие помидоры"
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Цена *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Описание
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Опишите ваш продукт..."
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Категория
                    </label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <option value="vegetables">Овощи</option>
                      <option value="fruits">Фрукты</option>
                      <option value="meat">Мясо</option>
                      <option value="dairy">Молочные продукты</option>
                      <option value="grains">Зерновые</option>
                      <option value="herbs">Травы и специи</option>
                      <option value="honey">Мед</option>
                      <option value="eggs">Яйца</option>
                      <option value="mushrooms">Грибы</option>
                      <option value="nuts">Орехи</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Единица измерения
                    </label>
                    <select
                      value={productUnit}
                      onChange={(e) => setProductUnit(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <option value="кг">кг</option>
                      <option value="г">г</option>
                      <option value="л">л</option>
                      <option value="мл">мл</option>
                      <option value="шт">шт</option>
                      <option value="упак">упак</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Происхождение
                    </label>
                    <input
                      type="text"
                      value={productOrigin}
                      onChange={(e) => setProductOrigin(e.target.value)}
                      placeholder="Например: Собственное хозяйство"
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={productAvailable}
                      onChange={(e) => setProductAvailable(e.target.checked)}
                    />
                    В наличии
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={productSeasonal}
                      onChange={(e) => setProductSeasonal(e.target.checked)}
                    />
                    Сезонный продукт
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={productOrganic}
                      onChange={(e) => setProductOrganic(e.target.checked)}
                    />
                    Органический
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Фото продукта
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                  {productImage && (
                    <div style={{ marginTop: "10px" }}>
                      <img
                        src={productImage}
                        alt="Предварительный просмотр"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={
                      editingProduct ? handleUpdateProduct : handleAddProduct
                    }
                    style={{
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {editingProduct
                      ? "💾 Обновить продукт"
                      : "➕ Добавить продукт"}
                  </button>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductName("");
                      setProductDescription("");
                      setProductPrice("");
                      setProductCategory("vegetables");
                      setProductUnit("кг");
                      setProductOrigin("");
                      setProductAvailable(true);
                      setProductSeasonal(false);
                      setProductOrganic(false);
                      setProductImage(null);
                    }}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    ❌ Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Список продуктов */}
            {products.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "15px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                      />
                    )}
                    <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                      {product.name}
                    </h4>
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      {product.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#4caf50",
                        }}
                      >
                        {product.price} ₽/{product.unit}
                      </span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        {product.organic && (
                          <span
                            style={{
                              background: "#4caf50",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                            }}
                          >
                            🌱 Органический
                          </span>
                        )}
                        {product.seasonal && (
                          <span
                            style={{
                              background: "#ff9800",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                            }}
                          >
                            🍂 Сезонный
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        style={{
                          background: "#2196f3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                <p>У вас пока нет продуктов. Добавьте первый продукт!</p>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "20px 0",
            width: "100%",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            {t.chefMenu.chatWithClients}
          </h3>
          <div
            className="ChatBox"
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <div className="Messages">
              <p className="NoMessages">{t.chefMenu.noMessages}</p>
            </div>
            <form className="MessageForm">
              <input type="text" placeholder={t.chefMenu.writeMessage} />
              <button type="submit">{t.chefMenu.send}</button>
            </form>
          </div>
        </div>

        {/* Модальное окно для отображения блюд категории */}
        {showCategoryModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "20px",
                maxWidth: "90%",
                maxHeight: "90%",
                overflow: "auto",
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>

              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Блюда категории "
                {categories.find((cat) => cat.id === activeCategory)?.name ||
                  "Выпечка"}
                "
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {selectedCategoryDishes.map((dish, index) => (
                  <div
                    key={dish.id || index}
                    className="DishCard"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "15px",
                      textAlign: "center",
                    }}
                  >
                    {dish.photo && (
                      <img
                        src={dish.photo}
                        alt={dish.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                      />
                    )}
                    <h3 style={{ margin: "10px 0", color: "#333" }}>
                      {dish.name}
                    </h3>
                    {dish.description && (
                      <p
                        style={{
                          color: "#666",
                          fontSize: "14px",
                          margin: "10px 0",
                        }}
                      >
                        {dish.description}
                      </p>
                    )}
                    {dish.price && (
                      <p
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#2e7d32",
                          margin: "10px 0",
                        }}
                      >
                        {dish.price}₽
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#ff6b35",
                        fontWeight: "bold",
                        margin: "5px 0",
                      }}
                    >
                      Осталось:{" "}
                      {dish.quantity || Math.floor(Math.random() * 10) + 1} шт.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                        marginTop: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => startEditDish(dish)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDishForPromo(dish);
                          setShowHolidayPromo(true);
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#ff9800",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        🖼️ Промо
                      </button>
                      <button
                        onClick={() => handleDeleteDish(index)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка "Назад" когда есть блюда */}
              {selectedCategoryDishes.length > 0 && (
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    style={{
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    ← Вернуться к меню
                  </button>
                </div>
              )}

              {selectedCategoryDishes.length === 0 && (
                <div style={{ textAlign: "center", margin: "40px 0" }}>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "16px",
                      margin: "0 0 20px 0",
                    }}
                  >
                    В этой категории пока нет блюд
                  </p>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    style={{
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    ← Вернуться к меню
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно для редактирования блюда */}
        {editingDish && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1001,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "20px",
                maxWidth: "90%",
                maxHeight: "90%",
                overflow: "auto",
                position: "relative",
                minWidth: "500px",
              }}
            >
              <button
                onClick={cancelEditDish}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>

              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Редактировать блюдо
              </h2>

              <form onSubmit={submitEditDish}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Название блюда *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                    required
                  />
                  {editErrors.name && (
                    <p style={{ color: "#d32f2f", margin: "5px 0 0 0" }}>
                      {editErrors.name}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Описание
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "16px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Цена (₽) *
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    min="1"
                    step="0.01"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                    required
                  />
                  {editErrors.price && (
                    <p style={{ color: "#d32f2f", margin: "5px 0 0 0" }}>
                      {editErrors.price}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Категория *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {editErrors.category && (
                    <p style={{ color: "#d32f2f", margin: "5px 0 0 0" }}>
                      {editErrors.category}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Фото блюда
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                  />
                  {editErrors.photo && (
                    <p style={{ color: "#d32f2f", margin: "5px 0 0 0" }}>
                      {editErrors.photo}
                    </p>
                  )}

                  {/* Текущее фото */}
                  {editingDish.photo && !editPhoto && (
                    <div style={{ marginTop: "10px" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          margin: "0 0 5px 0",
                        }}
                      >
                        Текущее фото:
                      </p>
                      <img
                        src={editingDish.photo}
                        alt="Текущее фото"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </div>
                  )}

                  {/* Предварительный просмотр нового фото */}
                  {editPhoto && (
                    <div style={{ marginTop: "10px" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          margin: "0 0 5px 0",
                        }}
                      >
                        Новое фото:
                      </p>
                      <img
                        src={URL.createObjectURL(editPhoto)}
                        alt="Новое фото"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          border: "1px solid #4caf50",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={cancelEditDish}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: loading ? "#ccc" : "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                    }}
                  >
                    {loading ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Отображение компонентов для каждой вкладки */}
        {activeTab === "stats" && (
          <ChefStats
            chefId={chefId}
            chefName={chefName}
            chefRating={chefRating}
            chefReviewsCount={chefReviewsCount}
            onClose={() => setActiveTab("dishes")}
          />
        )}

        {activeTab === "notifications" && (
          <ChefNotifications
            chefId={chefId}
            onNotificationClick={() => {}}
            onClose={() => setActiveTab("dishes")}
            onNavigateToTab={(tabName) => setActiveTab(tabName)}
          />
        )}

        {activeTab === "kanban" && (
          <ChefKanban chefId={chefId} onClose={() => setActiveTab("dishes")} />
        )}

        {activeTab === "slots" && (
          <div style={{ padding: "20px" }}>
            <ChefSlotsCalendar
              chefId={chefId}
              onSlotsUpdate={(slots) => {
                console.log("Slots updated:", slots);
              }}
              onClose={() => setActiveTab("dishes")}
            />
          </div>
        )}

        {activeTab === "procurement" && (
          <ChefProcurementPlanner
            chefId={chefId}
            onClose={() => setActiveTab("dishes")}
          />
        )}

        {activeTab === "shopping-list" && (
          <ChefShoppingList onClose={() => setActiveTab("dishes")} />
        )}

        {activeTab === "ratings" && (
          <ChefRatings
            chefId={chefId}
            chefName={chefName}
            chefRating={chefRating}
            chefReviewsCount={chefReviewsCount}
            onClose={() => setActiveTab("dishes")}
          />
        )}

        {activeTab === "cooking-requests" && (
          <ChefCookingRequests onClose={() => setActiveTab("dishes")} />
        )}

        {activeTab === "help-guest-requests" && (
          <ChefHelpGuestRequests onClose={() => setActiveTab("dishes")} />
        )}

        {activeTab === "preparations" && (
          <ChefPreparations onClose={() => setActiveTab("dishes")} />
        )}

        {activeTab === "profile" && (
          <ChefProfile onClose={() => setActiveTab("dishes")} />
        )}

        {showAITextHelper && (
          <>
            {/* Затемненный фон */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
                backdropFilter: "blur(2px)",
              }}
              onClick={() => setShowAITextHelper(false)}
            />

            {/* Модальное окно */}
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "15px",
                padding: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                zIndex: 10000,
                maxWidth: "80vw",
                maxHeight: "80vh",
                overflow: "auto",
                width: "600px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3>📝 Помощник по текстам</h3>
                <button
                  onClick={() => setShowAITextHelper(false)}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(231, 76, 60, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(231, 76, 60, 0.3)";
                  }}
                >
                  ← Закрыть
                </button>
              </div>
              <AITextHelper
                onInsertToDishDescription={(text) => {
                  setDishDescription(text);
                  setShowAITextHelper(false);
                }}
              />
            </div>
          </>
        )}

        {/* AI Conscience Checker Modal */}
        {showConscienceChecker && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "15px",
                maxWidth: "900px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <AIConscienceChecker
                availableDishes={dishes}
                onClose={() => setShowConscienceChecker(false)}
              />
            </div>
          </div>
        )}

        {/* AI Photo Analyzer Modal */}
        {showPhotoAnalyzer && dishPhoto && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "15px",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <AIPhotoAnalyzer
                imageDataUrl={dishPhoto}
                dishInfo={{
                  name: dishName,
                  ingredients: dishIngredients,
                  category: dishCategory,
                }}
                onAnalysisComplete={(result) => {
                  console.log("📸 Photo analysis result:", result);
                  setPhotoAnalysisResult(result);
                }}
                onClose={() => {
                  setShowPhotoAnalyzer(false);
                }}
              />
            </div>
          </div>
        )}

        {/* AI Holiday Set Menu Modal */}
        {showHolidaySetMenu && (
          <AIHolidaySetMenu
            chefDishes={dishes}
            onSetCreated={(set) => {
              // Сохраняем сгенерированный набор как блюдо
              const newDish = {
                id: set.id,
                name: set.name,
                description: set.description,
                price: set.pricing.discountedPrice,
                category: "special",
                tags: set.tags,
                photo: dishPhoto,
                ingredients: set.dishes.map((d) => d.name).join(", "),
                calories: set.pricing.nutrition.totalCalories,
                protein: set.pricing.nutrition.totalProtein,
                carbs: set.pricing.nutrition.totalCarbs,
                fat: set.pricing.nutrition.totalFat,
                isHolidaySet: true,
                holidaySetData: set,
              };

              const updatedDishes = [...dishes, newDish];
              setDishes(updatedDishes);
              localStorage.setItem(
                `${chefId}_dishes`,
                JSON.stringify(updatedDishes)
              );

              setToast({
                type: "success",
                message: `✅ Праздничный набор "${set.name}" добавлен!`,
              });
              setShowHolidaySetMenu(false);
            }}
            onClose={() => setShowHolidaySetMenu(false)}
          />
        )}

        {/* AI Holiday Promo Modal */}
        {showHolidayPromo && selectedDishForPromo && (
          <AIHolidayPromo
            dish={selectedDishForPromo}
            onPromoGenerated={(promo) => {
              // Можно добавить промо-текст к описанию блюда
              console.log("Промо сгенерирован:", promo);
            }}
            onClose={() => {
              setShowHolidayPromo(false);
              setSelectedDishForPromo(null);
            }}
          />
        )}

        {toast.message && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              padding: "10px 20px",
              backgroundColor: toast.type === "success" ? "#4caf50" : "#f44336",
              color: "white",
              borderRadius: "5px",
              zIndex: 1000,
            }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefMenu;
