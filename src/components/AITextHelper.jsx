import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const AITextHelper = ({ onInsertToDishDescription }) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedAction, setSelectedAction] = useState('generateDescription');
  const [selectedLanguage, setSelectedLanguage] = useState('russian');
  const [loading, setLoading] = useState(false);

  // Примеры текстов для разных действий
  const examples = {
    generateDescription: {
      russian: 'Борщ с мясом, картофель, морковь, лук, капуста',
      english: 'Borscht with meat, potatoes, carrots, onions, cabbage',
      tatar: 'Ит белән борщ, картуф, кишер, суган, кәбестә'
    },
    generateTags: {
      russian: 'Традиционный русский суп',
      english: 'Traditional Russian soup',
      tatar: 'Гади рус ашы'
    },
    improveText: {
      russian: 'Вкусный борщ',
      english: 'Tasty borscht',
      tatar: 'Тәмле борщ'
    },
    translateText: {
      russian: 'Домашний борщ по бабушкиному рецепту',
      english: 'Homemade borscht according to grandmother\'s recipe',
      tatar: 'Әби рецепты буенча өй борщы'
    }
  };

  const generateText = async () => {
    if (!inputText.trim()) {
      showError('Введите текст для обработки');
      return;
    }

    setLoading(true);
    
    try {
      // Имитация AI-генерации с задержкой
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let result = '';
      
      switch (selectedAction) {
        case 'generateDescription':
          result = generateDescription(inputText, selectedLanguage);
          break;
        case 'generateTags':
          result = generateTags(inputText, selectedLanguage);
          break;
        case 'improveText':
          result = improveText(inputText, selectedLanguage);
          break;
        case 'translateText':
          result = translateText(inputText, selectedLanguage);
          break;
        default:
          result = inputText;
      }
      
      setOutputText(result);
      showSuccess(t.aiTextHelper.success);
    } catch (error) {
      console.error('Error generating text:', error);
      showError(t.aiTextHelper.error);
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = (text, language) => {
    const descriptions = {
      russian: [
        `Аппетитное блюдо "${text}" приготовлено по традиционному рецепту с использованием свежих ингредиентов. Идеально подходит для семейного ужина.`,
        `Вкуснейшее "${text}" с неповторимым ароматом и нежной текстурой. Готовится с любовью и вниманием к деталям.`,
        `Настоящий кулинарный шедевр "${text}" порадует даже самых взыскательных гурманов. Секретный рецепт передается из поколения в поколение.`
      ],
      english: [
        `Delicious "${text}" prepared according to traditional recipe using fresh ingredients. Perfect for family dinner.`,
        `Tasty "${text}" with unique aroma and tender texture. Cooked with love and attention to detail.`,
        `True culinary masterpiece "${text}" will delight even the most demanding gourmets. Secret recipe passed down from generation to generation.`
      ],
      tatar: [
        `Тәмле "${text}" ашы гади рецепт буенча яңа ингредиентлар кулланып әзерләнә. Гаилә ашлыгы өчен идеаль.`,
        `Сезнең "${text}" ашы уникаль ис һәм нечкә текстура белән. Сөю һәм игътибар белән пешерелә.`,
        `Чын кулинар шедевры "${text}" ашы иң таләпчән гурманнарны да рәхәтләндерәчәк. Яшерен рецепт буыннан буынга күчә.`
      ]
    };
    
    const randomIndex = Math.floor(Math.random() * descriptions[language].length);
    return descriptions[language][randomIndex];
  };

  const generateTags = (text, language) => {
    const tags = {
      russian: [
        'домашняя кухня, традиционный рецепт, свежие ингредиенты, семейный ужин, вкусно, аппетитно',
        'натуральные продукты, ручная работа, проверенный рецепт, для всей семьи, полезно, сытно',
        'авторское блюдо, эксклюзивный рецепт, премиум качество, изысканный вкус, ресторанный уровень'
      ],
      english: [
        'home cooking, traditional recipe, fresh ingredients, family dinner, tasty, appetizing',
        'natural products, handmade, proven recipe, for the whole family, healthy, hearty',
        'author\'s dish, exclusive recipe, premium quality, exquisite taste, restaurant level'
      ],
      tatar: [
        'өй ашы, гади рецепт, яңа ингредиентлар, гаилә ашлыгы, тәмле, аппетитлы',
        'табигый продуктлар, кул эше, сынап каралган рецепт, бөтен гаилә өчен, файдалы, тукымалы',
        'автор ашы, эксклюзив рецепт, премиум сыйфат, изыскан тәм, ресторан дәрәҗәсе'
      ]
    };
    
    const randomIndex = Math.floor(Math.random() * tags[language].length);
    return tags[language][randomIndex];
  };

  const improveText = (text, language) => {
    const improvements = {
      russian: [
        `Восхитительный ${text} - это настоящий кулинарный шедевр, который покорит ваше сердце с первого укуса.`,
        `Изысканный ${text} приготовлен с особой тщательностью и вниманием к каждой детали.`,
        `Невероятно вкусный ${text} станет украшением любого стола и радостью для всей семьи.`
      ],
      english: [
        `Amazing ${text} - this is a true culinary masterpiece that will win your heart from the first bite.`,
        `Exquisite ${text} is prepared with special care and attention to every detail.`,
        `Incredibly tasty ${text} will become a decoration of any table and joy for the whole family.`
      ],
      tatar: [
        `Гашыйк ${text} - бу чын кулинар шедевры, ул беренче ашымнан ук сезнең күңелегезне җиңәчәк.`,
        `Изге ${text} махсус игътибар һәм һәр детальга игътибар белән әзерләнә.`,
        `Гаҗәп тәмле ${text} теләсә нинди өстәлнең бизәге һәм бөтен гаиләнең шатлыгы булачак.`
      ]
    };
    
    const randomIndex = Math.floor(Math.random() * improvements[language].length);
    return improvements[language][randomIndex];
  };

  const translateText = (text, language) => {
    // Простая имитация перевода
    const translations = {
      russian: `Перевод на русский: ${text}`,
      english: `English translation: ${text}`,
      tatar: `Татарча тәрҗемә: ${text}`
    };
    
    return translations[language];
  };

  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      showSuccess('Текст скопирован!');
    }
  };

  const insertToDishDescription = () => {
    if (outputText && onInsertToDishDescription) {
      onInsertToDishDescription(outputText);
      showSuccess('Текст вставлен в описание блюда!');
    }
  };

  const clearText = () => {
    setInputText('');
    setOutputText('');
  };

  const loadExample = () => {
    const example = examples[selectedAction][selectedLanguage];
    setInputText(example);
  };

  return (
    <div className="ai-text-helper-container">
      <h3 className="ai-text-helper-title">{t.aiTextHelper.title}</h3>
      
      <div className="ai-text-helper-controls">
        <div className="action-selector">
          <label>{t.aiTextHelper.examples}:</label>
          <div className="action-buttons">
            <button
              className={`action-btn ${selectedAction === 'generateDescription' ? 'active' : ''}`}
              onClick={() => setSelectedAction('generateDescription')}
            >
              {t.aiTextHelper.generateDescription}
            </button>
            <button
              className={`action-btn ${selectedAction === 'generateTags' ? 'active' : ''}`}
              onClick={() => setSelectedAction('generateTags')}
            >
              {t.aiTextHelper.generateTags}
            </button>
            <button
              className={`action-btn ${selectedAction === 'improveText' ? 'active' : ''}`}
              onClick={() => setSelectedAction('improveText')}
            >
              {t.aiTextHelper.improveText}
            </button>
            <button
              className={`action-btn ${selectedAction === 'translateText' ? 'active' : ''}`}
              onClick={() => setSelectedAction('translateText')}
            >
              {t.aiTextHelper.translateText}
            </button>
          </div>
        </div>

        <div className="language-selector">
          <label>{t.aiTextHelper.selectLanguage}:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-select"
          >
            <option value="russian">{t.aiTextHelper.russian}</option>
            <option value="english">{t.aiTextHelper.english}</option>
            <option value="tatar">{t.aiTextHelper.tatar}</option>
          </select>
        </div>
      </div>

      <div className="text-input-section">
        <label>{t.aiTextHelper.inputText}:</label>
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.aiTextHelper.inputText}
            className="text-input"
            rows="4"
          />
          <button
            onClick={loadExample}
            className="example-btn"
            title="Загрузить пример"
          >
            📝
          </button>
        </div>
      </div>

      <div className="text-output-section">
        <label>{t.aiTextHelper.outputText}:</label>
        <div className="output-container">
          <textarea
            value={outputText}
            readOnly
            className="text-output"
            rows="4"
            placeholder="Результат появится здесь..."
          />
          <div className="output-actions">
            <button
              onClick={insertToDishDescription}
              disabled={!outputText || !onInsertToDishDescription}
              className="copy-btn"
              style={{
                background: onInsertToDishDescription ? 'linear-gradient(135deg, #4caf50, #45a049)' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: onInsertToDishDescription ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              🍽️ Вставить в описание блюда
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!outputText}
              className="clear-btn"
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: outputText ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                marginRight: '8px',
                opacity: outputText ? 1 : 0.5
              }}
            >
              📋 Копировать
            </button>
            <button
              onClick={clearText}
              className="clear-btn"
            >
              {t.aiTextHelper.clear}
            </button>
          </div>
        </div>
      </div>

      <div className="generate-section">
        <button
          onClick={generateText}
          disabled={loading || !inputText.trim()}
          className="generate-btn"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              {t.aiTextHelper.loading}
            </>
          ) : (
            <>
              🤖 {t.aiTextHelper.generate}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AITextHelper;
