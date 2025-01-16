import React, { useState, useContext } from 'react'; 
import '../styles/login.css';
import { useNavigate } from 'react-router-dom'; 
import CustomNotification from '../components/CustomNotification'; 
import AuthContext from '../context/AuthContext'; 
import { useTranslation } from '../context/TranslationContext';

function Login() {
  const navigate = useNavigate(); 
  const { login } = useContext(AuthContext); 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null); 
  const { translate } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = translate('email_wrong_format');
    }
    return errors;
  };

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
                const data = await response.json();
                const userId = data.userId; 
                const authToken = "someAuthToken"; 

                setNotification({ message: translate('login_notification_success'), type: 'success' });

                // Передайте оба значения в `login`
                login(authToken, userId);

                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                const errorData = await response.json();
                setNotification({ message: `Error: ${errorData.message}`, type: 'error' });
            }
        } catch (error) {
            setNotification({ message: translate('login_notification_fail'), type: 'error' });
        }
    } else {
        setErrors(validationErrors);
    }
};

  const closeNotification = () => {
    setNotification(null); 
  };

  return (
    <div className="login-form">
      <h1>{translate('login')}</h1>
      <form onSubmit={handleSubmit}>
        <label>{translate('e_mail')}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>{translate('password')}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">{translate('log_me_in_button')}</button>
      </form>

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