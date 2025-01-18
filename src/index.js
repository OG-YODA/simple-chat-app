import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; // Импортируем AuthProvider
import { TranslationProvider } from './context/TranslationContext';
import { NotificationProvider } from './components/NotificationProvider';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <TranslationProvider>
          <Router>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Router>
        </TranslationProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);