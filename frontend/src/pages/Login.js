import React, { useState, useContext } from 'react'; 
import '../styles/login.css';
import { useNavigate } from 'react-router-dom'; 
import { useNotification } from '../context/NotificationProvider';
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
  const { addNotification } = useNotification();
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

  async function getUserIP() {
    try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("IP request error:", error);
        return null;
    }
}
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
        try {
            const response = await fetch('http://192.168.2.100:8080/users/login', {
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
                const username = data.username;
                const accessKey = data.accessKey; 

                async function sendIpOnLogin(userId) {
                  const ip = await getUserIP();
                  if (!ip) return;
              
                  const response = await fetch("http://192.168.2.100:8080/api/user/ip-check", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId, ip })
                  });
              
                  const data = await response.json();
                  if (data.mismatch) {
                      await fetch("http://192.168.2.100:8080/api/user/notify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId, notificationId: 1 })
                      });
                  }
              }

                addNotification(translate('login_notification_success'), 'success');

                login(accessKey, userId, username);

                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                const errorData = await response.json();
                addNotification({ message: `Error: ${errorData.message}`, type: 'error' });
            }
        } catch (error) {
            addNotification(translate('login_notification_fail'), 'error' );
        }
    } else {
        setErrors(validationErrors);
    }
};

  const closeNotification = () => {
    addNotification(null); 
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
    </div>
  );
}

export default Login;