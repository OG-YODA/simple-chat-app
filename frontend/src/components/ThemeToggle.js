import React, { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';
import '../styles/themeToggle.css'; // Подключаем стили для кнопки

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`theme-toggle ${theme}`} onClick={toggleTheme}>
      <div className="toggle-knob"></div>
    </div>
  );
}

export default ThemeToggle;