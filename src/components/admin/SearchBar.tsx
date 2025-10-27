'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string, searchType: 'all' | 'username' | 'email' | 'role') => void;
  onClear: () => void;
  totalResults: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  totalResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'username' | 'email' | 'role'>('all');

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim(), searchType);
    } else if (searchType === 'all') {
      // Si está en "Todo" y no hay término, mostrar todos
      onSearch('', 'all');
    }
  };

  const handleTypeChange = (newType: 'all' | 'username' | 'email' | 'role') => {
    setSearchType(newType);
    // Si cambia a "Todo" y no hay término de búsqueda, mostrar todos automáticamente
    if (newType === 'all' && !searchTerm.trim()) {
      onSearch('', 'all');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Si borra el input y está en "Todo", mostrar todos automáticamente
    if (!value.trim() && searchType === 'all') {
      onSearch('', 'all');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchType('all');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-header">
        <h3 className="search-bar-title">🔍 Buscar Usuarios</h3>
        <span className="search-results-count">
          {totalResults} usuario{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="search-bar-controls">
        <div className="search-input-group">
          <div className="search-type-selector">
            <select
              value={searchType}
              onChange={(e) => handleTypeChange(e.target.value as 'all' | 'username' | 'email' | 'role')}
              className="search-type-select"
              aria-label="Tipo de búsqueda"
            >
              <option value="all">🔍 Todo</option>
              <option value="username">👤 Usuario</option>
              <option value="email">📧 Email</option>
              <option value="role">👑 Rol</option>
            </select>
          </div>
          
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                searchType === 'all' ? 'Buscar en todos los campos...' :
                searchType === 'username' ? 'Buscar por nombre de usuario...' :
                searchType === 'email' ? 'Buscar por email...' :
                'Buscar por rol (admin/user)...'
              }
              className="search-input"
              aria-label="Término de búsqueda"
            />
            <button
              onClick={handleSearch}
              className="search-button"
              aria-label="Buscar"
              disabled={!searchTerm.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="search-actions">
          <button
            onClick={handleClear}
            className="clear-button"
            aria-label="Limpiar búsqueda"
            disabled={!searchTerm.trim() && searchType === 'all'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};
