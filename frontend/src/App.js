import { useEffect, useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

const HISTORY_URL = 'http://127.0.0.1:8000/history';

function App() {
  const [authState, setAuthState] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const [logs, setLogs] = useState('');
  const [analysis, setAnalysis] = useState({
    threats: [],
    risk_score: 0,
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  setIsAuthenticated(false);
  setUsername('');
  setAuthState('login');
}, []);

  const loadHistory = async () => {
    try {
      const response = await fetch(HISTORY_URL);
      if (!response.ok) {
        throw new Error(`History fetch failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('History error:', error);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUsername(data.username);
    setAuthState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    setAuthState('login');
  };

  if (!isAuthenticated) {
    if (authState === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthState('register')}
        />
      );
    } else if (authState === 'register') {
      return (
        <RegisterPage
          onRegister={handleLogin}
          onSwitchToLogin={() => setAuthState('login')}
        />
      );
    }
  }

  return (
<Dashboard
  username={username}
  history={history}
  setHistory={setHistory}
  analysis={analysis}
  setAnalysis={setAnalysis}
  logs={logs}
  setLogs={setLogs}
  onLogout={handleLogout}
/>
  );
}

export default App;
