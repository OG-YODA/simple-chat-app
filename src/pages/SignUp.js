import React, { useState } from 'react';
import '../styles/signup.css';

function SignUp() {
  // Стейты для хранения значений полей формы
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

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
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Форма отправлена', formData);
    } else {
      setErrors(validationErrors);
    }
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
        <label>Nickname:</label>
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
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
    </div>
  );
}

export default SignUp;