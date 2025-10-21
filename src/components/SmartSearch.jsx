import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useLanguage } from "../contexts/LanguageContext";
import "./SmartSearch.css";

const SmartSearch = ({
  data = [],
  searchFields = [],
  onResults = () => {},
  placeholder = "Поиск...",
  minLength = 2,
  maxResults = 10,
  showSuggestions = true,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  // Функция поиска
  const searchData = useCallback(
    (searchQuery, items, fields) => {
      if (!searchQuery || searchQuery.length < minLength) return [];

      const query = searchQuery.toLowerCase().trim();

      return items.filter((item) => {
        return fields.some((field) => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(query);
        });
      });
    },
    [minLength]
  );

  // Получение вложенного значения по пути
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Мемоизированные результаты поиска
  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minLength) return [];

    const results = searchData(debouncedQuery, data, searchFields);
    return results.slice(0, maxResults);
  }, [debouncedQuery, data, searchFields, minLength, maxResults, searchData]);

  // Обработка изменений запроса
  useEffect(() => {
    onResults(searchResults);
  }, [searchResults, onResults]);

  // Обработка клавиатуры
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          handleSelect(searchResults[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Выбор элемента
  const handleSelect = (item) => {
    setQuery(item.name || item.title || "");
    setIsOpen(false);
    setHighlightedIndex(-1);
    onResults([item]);
  };

  // Подсветка текста
  const highlightText = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="smart-search">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
        />
        <div className="search-icon">🔍</div>
      </div>

      {isOpen && showSuggestions && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((item, index) => (
            <div
              key={item.id || index}
              className={`search-result-item ${
                index === highlightedIndex ? "highlighted" : ""
              }`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="result-content">
                <h4>
                  {highlightText(item.name || item.title || "", debouncedQuery)}
                </h4>
                {item.description && (
                  <p>{highlightText(item.description, debouncedQuery)}</p>
                )}
                {item.category && (
                  <span className="result-category">{item.category}</span>
                )}
              </div>
              {item.price && <div className="result-price">{item.price} ₽</div>}
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= minLength && searchResults.length === 0 && (
        <div className="no-results">
          <p>Ничего не найдено</p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
