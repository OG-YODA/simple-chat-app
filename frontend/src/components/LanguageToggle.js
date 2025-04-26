import React, { useContext } from 'react';
import {useTranslation} from '../context/TranslationContext';
import ThemeContext from '../context/ThemeContext';

import '../styles/languageToggle.css'; 

function LanguageToggle() {
  const { language, setLanguage } = useTranslation(); // Используем хук для доступа к контексту
  const { theme } = useContext(ThemeContext);

  const icons = {
    lang: {
        light: require("../assets/media/pics/lang.png"),
        dark: require("../assets/media/pics/lang_light.png"),
    }
  };

  const translationIcon = icons.lang[theme];

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
        <li onClick={() => setLanguage('pl')}>Polski</li>
        <li onClick={() => setLanguage('fr')}>Français</li>
        <li onClick={() => setLanguage('de')}>Deutsch</li>
        <li onClick={() => setLanguage('es')}>Español</li>
      </ul>
    </div>
  );
}

export default LanguageToggle;