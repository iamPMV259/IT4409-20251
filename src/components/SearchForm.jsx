import { useState } from 'react';
import './SearchForm.css';

function SearchForm({ onSearch, isLoading }) {
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentId.trim().length === 8) {
      onSearch(studentId.trim());
    } else {
      alert('Vui lòng nhập mã số sinh viên 8 chữ số!');
    }
  };

  const handleInputChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/[^0-9]/g, '');
    setStudentId(value);
  };

  return (
    <div className="search-section">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={studentId}
          onChange={handleInputChange}
          placeholder="Nhập mã số sinh viên (VD: 20235252)"
          maxLength="8"
          className="search-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={isLoading}
        >
          {isLoading ? '⏳ Đang tải...' : '🔍 Tra cứu'}
        </button>
      </form>
    </div>
  );
}

export default SearchForm;