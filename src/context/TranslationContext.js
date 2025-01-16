import React, { createContext, useState, useContext } from 'react';

const translations = {
    "ua":{
      "main" : "Головна",
      "faq" : "FAQ",
      "faq_extended" : "Запитання й відповіді",
      "login" : "Вхід",
      "sign_up" : "Реєстрація",
      "e_mail" : "Пошта",
      "password" : "Пароль",
      "f_name" : "Ім'я",
      "l_name" : "Прізвище",
      "gender" : "Стать",
      "male" : "Чоловіча",
      "female" : "Жіноча",
      "username" : "Ім'я користувача",
      "repeat_pass" : "Повторіть пароль",
      "sign_me_in_button" : "Зареєструй мене!",
      "log_me_in_button" : "Вхід",
      "log_me_out_button" : "Вийти",
      "footer_1" : "Всі права захищено! 2024",
      "footer_2" : "Контакт зі службою підтримки HMessenger",
      "login_notification_success" : "Успішний вхід! Переадресовую...",
      "reg_notification_success" : "Вітаємо в сервісі!",
      "login_notification_fail" : "Помилка сервера!",
      "reg_notification_fail" : "Упс, щось пішло не так...",
      "email_wrong_format" : "Неправильний формат пошти!",
      "friends_list_notification_error" : "Помилка завантаження списку друзів!",
      "chat_window_select_to_open" : "Оберіть друга, щоб відкрити чат!",
      "notifications_list" : "Останні сповіщення",
      "settings" : "Налаштування"
    },
    "en":{
      "main" : "Main",
      "faq" : "FAQ",
      "faq_extended" : "Frequently Asked Questions",
      "login" : "Login",
      "sign_up" : "Sign Up",
      "e_mail" : "E-Mail",
      "password" : "Password",
      "f_name" : "First name",
      "l_name" : "Last name",
      "gender" : "Gender",
      "male" : "Male",
      "female" : "Female",
      "username" : "Username",
      "repeat_pass" : "Repeat password",
      "sign_me_in_button" : "Sing me in!",
      "log_me_in_button" : "Log in",
      "log_me_out_button" : "Log out",
      "footer_1" : "All rights reserved! 2024",
      "footer_2" : "Contact HMessenger Support",
      "login_notification_success" : "Logged in successfully!",
      "reg_notification_success" : "Welcome!",
      "login_notification_fail" : "Something went wrong!",
      "reg_notification_fail" : "Something went wrong...",
      "email_wrong_format" : "Wrong e-mail format!",
      "friends_list_notification_error" : "Unable to load friends list!",
      "chat_window_select_to_open" : "Select friend to open the chat!",
      "notifications_list" : "Notifications",
      "settings" : "Settings"
    }
};

const TranslationContext = createContext();

export const useTranslation = () => {
  return useContext(TranslationContext);
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // мова по замовч.

  const translate = (key) => translations[language][key] || key;

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
};