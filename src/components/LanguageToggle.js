import React, { useContext } from 'react';
import {useTranslation} from '../context/TranslationContext';
import '../styles/languageToggle.css'; 

import translationIcon from '../assets/media/pics/lang.png'; // Исправлен путь

function LanguageToggle() {
  const { language, setLanguage } = useTranslation(); // Используем хук для доступа к контексту

  return (
    <div className="language-dropdown">
      <img
        src={translationIcon}
        alt="Translate"
        className="translation-icon"
      />
      <ul className="language-options">
        <li onClick={() => setLanguage('en')}>English</li>
        <li onClick={() => setLanguage('ua')}>Українська</li>
      </ul>
    </div>
  );
}

export default LanguageToggle;