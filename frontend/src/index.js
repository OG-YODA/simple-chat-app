import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import { NotificationProvider } from './context/NotificationProvider';
import { WebSocketProvider } from './context/WebSocketProvider';
import { ChatProvider } from './context/ChatProvider';
import { MessageProvider } from './context/MessageProvider';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <NotificationProvider> 
              <MessageProvider> 
                <ChatProvider>
                  <TranslationProvider>
                    <App />
                  </TranslationProvider>
                </ChatProvider>
              </MessageProvider>
            </NotificationProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);