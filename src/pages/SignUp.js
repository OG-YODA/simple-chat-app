import React, { useState } from 'react';
import '../styles/signup.css';
import { useNavigate } from 'react-router-dom';
import CustomNotification from '../components/CustomNotification'; 
import { useTranslation } from '../context/TranslationContext';

function SignUp() {

  const navigate = useNavigate();
  const { translate } = useTranslation();

  // Стейти
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
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};

    // Валідація
    const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;
    if (!nameRegex.test(formData.firstName)) {
      errors.firstName = 'Имя должно содержать только буквы';
    }
    if (!nameRegex.test(formData.lastName)) {
      errors.lastName = 'Фамилия должна содержать только буквы';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Некорректный формат электронной почты';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.password = 'Пароли не совпадают';
    }

    return errors;
  };

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
          setNotification({ message: translate('reg_notification_success'), type: 'success' });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          const errorData = await response.json();
          setNotification({ message: `Ошибка регистрации: ${errorData.message}`, type: 'error' });
        }
      } catch (error) {
        setNotification({ message: translate('reg_notification_fail'), type: 'error' });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="signup-form">
      <h1>{translate('sign_up')}</h1>
      <form onSubmit={handleSubmit}>
        {/* Ім'я */}
        <label>{translate('f_name')}</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        {errors.firstName && <p className="error">{errors.firstName}</p>}

        {/* Прізвище */}
        <label>{translate('l_name')}</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        {errors.lastName && <p className="error">{errors.lastName}</p>}

        {/* Стать */}
        <label>{translate('gender')}</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">-</option>
          <option value="male">{translate('male')}</option>
          <option value="female">{translate('female')}</option>
        </select>

        {/* Нікнейм */}
        <label>{translate('username')}</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        {/* Пошта */}
        <label>{translate('e_mail')}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        {/* Пароль */}
        <label>{translate('password')}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Підтвердження пароля */}
        <label>{translate('repeat_pass')}</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}

        {/* Кнопка відправки */}
        <button type="submit">{translate('sign_me_in_button')}</button>
      </form>

      {/* Сповіщення */}
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