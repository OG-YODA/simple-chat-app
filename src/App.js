import React, { useContext, useEffect, useState } from 'react';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { useTranslation } from './context/TranslationContext';

import Main from './pages/Main';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AddContact from './pages/AddContact';

import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import AuthContext from './context/AuthContext';
import ThemeContext from './context/ThemeContext';
import './styles/global.css';

import profileIcon from './assets/media/pics/profile.png';
import notificationsIcon from './assets/media/pics/notifications.png';
import settingsIcon from './assets/media/pics/settings.png';
import messagesIcon from './assets/media/pics/messages.png';

function App() {
  const { isAuthenticated, logout } = useContext(AuthContext); //статус авторизації
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.pathname);
  const { translate, setLanguage, language } = useTranslation();

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location]);

  return (
    <div className={`App ${theme}`}>
      <header>

        <LanguageToggle />

        <nav>
          <ul>
            {!isAuthenticated ? (
              <>
                <li><Link to="/">{translate('main')}</Link></li>
                <li><Link to="/faq">{translate('faq')}</Link></li>
                <li><Link to="/login">{translate('login')}</Link></li>
                <li><Link to="/signup">{translate('sign_up')}</Link></li>
              </>
            ) : (
              <>
                {currentPage === '/profile' ? (
                  <li>
                    <Link to="/home">
                      <img src={messagesIcon} alt="Messages" width="32" height="32" />
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/profile">
                      <img src={profileIcon} alt="Profile" width="32" height="32" />
                    </Link>
                  </li>
                )}
                
                {currentPage === '/notifications' ? (
                  <li>
                    <Link to="/home">
                      <img src={messagesIcon} alt="Messages" width="32" height="32" />
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/notifications">
                      <img src={notificationsIcon} alt="Notifications" width="32" height="32" />
                    </Link>
                  </li>
                )}
                
                {currentPage === '/settings' ? (
                  <li>
                    <Link to="/home">
                      <img src={messagesIcon} alt="Messages" width="32" height="32" />
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/settings">
                      <img src={settingsIcon} alt="Settings" width="32" height="32" />
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>
        
        <ThemeToggle />
      
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />

          {/* Доступ тільки для авторизованих кор-ів */}
          {isAuthenticated && <Route path="/add-contact" element={<AddContact />} />}
        </Routes>
      </main>
      
      <footer>
      <h5>{translate('footer_1')}</h5>
      <h6>{translate('footer_2')}</h6>
      </footer>
    </div>
  );
}

export default App;