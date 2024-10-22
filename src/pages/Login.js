import React, { useState } from 'react';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom'; // Для перенаправления
import CustomNotification from '../components/CustomNotification'; // Для уведомлений

function Login() {
  const navigate = useNavigate(); // Хук для перенаправления
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null); // Для уведомлений

  // Функция для обновления значений полей
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Функция для валидации полей
  const validate = () => {
    let errors = {};

    // Валидация почты (должна содержать домен)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Некорректный формат электронной почты!';
    }

    return errors;
  };

  // Функция для отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
  
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:8080/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
  
        if (response.ok) {
          // Проверяем тип ответа
          const contentType = response.headers.get('content-type');
          let data;
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text(); // Если это строка
          }
  
          setNotification({ message: 'Логин успешен!', type: 'success' });
  
          // Перенаправляем через 1 секунду
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        } else {
          const errorData = await response.json();
          setNotification({ message: `Ошибка: ${errorData.message}`, type: 'error' });
        }
      } catch (error) {
        setNotification({ message: 'Ошибка сервера. Попробуйте позже', type: 'error' });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const closeNotification = () => {
    setNotification(null); // Закрыть уведомление
  };

  return (
    <div className="login-form">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {/* Электронная почта */}
        <label>E-Mail:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        {/* Пароль */}
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Кнопка отправки */}
        <button type="submit">Log me in!</button>
      </form>

      {/* Отображение уведомления */}
      {notification && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}

export default Login;