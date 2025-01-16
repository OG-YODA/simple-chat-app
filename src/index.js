import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; // Импортируем AuthProvider
import { TranslationProvider } from './context/TranslationContext';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationProvider>
        <Router>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </TranslationProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);