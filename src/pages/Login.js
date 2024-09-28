import React, {useState} from 'react';
import '../styles/login.css';

function Login() {
  // Стейты для хранения значений полей формы
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

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
    <div class="login-form">
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
    </div>
  );
}

export default Login;