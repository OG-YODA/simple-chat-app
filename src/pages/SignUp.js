import React, { useState } from 'react';
import '../styles/signup.css';
import { useNavigate } from 'react-router-dom';
import CustomNotification from '../components/CustomNotification'; // Импортируем уведомлени

function SignUp() {

  const navigate = useNavigate();

  // Стейты для хранения значений полей формы
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null); // Для хранения уведомления

  // Функция для обновления значений полей
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Функция для валидации полей
  const validate = () => {
    let errors = {};

    // Валидация имени и фамилии (без цифр и спецсимволов)
    const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;
    if (!nameRegex.test(formData.firstName)) {
      errors.firstName = 'Имя должно содержать только буквы';
    }
    if (!nameRegex.test(formData.lastName)) {
      errors.lastName = 'Фамилия должна содержать только буквы';
    }

    // Валидация почты (должна содержать домен)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Некорректный формат электронной почты';
    }

    // Валидация пароля (пароли должны совпадать)
    if (formData.password !== formData.confirmPassword) {
      errors.password = 'Пароли не совпадают';
    }

    return errors;
  };

  // Функция для отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:8080/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstname: formData.firstName,
            lastname: formData.lastName,
            gender: formData.gender,
            username: formData.username, 
            email: formData.email,
            password: formData.password,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          setNotification({ message: 'Регистрация успешна!', type: 'success' });
          setTimeout(() => {
            navigate('/login');
          }, 2000); // Через 2 секунды перенаправляем на страницу логина
        } else {
          const errorData = await response.json();
          setNotification({ message: `Ошибка регистрации: ${errorData.message}`, type: 'error' });
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
    <div className="signup-form">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        {/* Имя */}
        <label>Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        {errors.firstName && <p className="error">{errors.firstName}</p>}

        {/* Фамилия */}
        <label>Surname:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        {errors.lastName && <p className="error">{errors.lastName}</p>}

        {/* Пол */}
        <label>Gender:</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Choose</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {/* Никнейм */}
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

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

        {/* Подтверждение пароля */}
        <label>Repeat password:</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}

        {/* Кнопка отправки */}
        <button type="submit">Sign me up!</button>
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

export default SignUp;