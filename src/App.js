import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Main from './pages/Main';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import ThemeToggle from './components/ThemeToggle';
import { useContext } from 'react';
import ThemeContext from './context/ThemeContext';
import './styles/global.css';

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`App ${theme}`}>
      <header>
        <nav>
          <ul>
            <li><Link to="/">Main</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            {/* <li><Link to="/home">Home</Link></li> */}
          </ul>
        </nav>
        <ThemeToggle />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </main>
      <footer>
        <h5>All rights reserved! 2024</h5>
        <h6><a>Contact HMessenger Support</a></h6>
      </footer>
    </div>
  );
}

export default App;