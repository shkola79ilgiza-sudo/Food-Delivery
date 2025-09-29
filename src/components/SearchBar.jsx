import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ 
  placeholder = 'Поиск...', 
  onSearch, 
  onClear,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        onSearch?.(query.trim());
        setTimeout(() => setIsLoading(false), 500); // Simulate loading
      } else {
        onClear?.();
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch, onClear, debounceMs]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestionsList(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestionsList(false);
    onSuggestionSelect?.(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestionsList(false);
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <div className="search-icon">
          {isLoading ? '⏳' : '🔍'}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestionsList(true)}
        />
        {query && (
          <button
            className="search-clear"
            onClick={handleClear}
            type="button"
          >
            ×
          </button>
        )}
      </div>
      
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
