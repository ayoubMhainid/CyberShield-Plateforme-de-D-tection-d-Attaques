import { useEffect, useState } from 'react';
import '../styles/Pages.css';

const DEFAULT_SETTINGS = {
  notifications: true,
  darkMode: true,
  autoAnalysis: false,
  emailAlerts: true,
  dataRetention: '90',
};

function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cybershield_settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !settings.darkMode);
  }, [settings.darkMode]);

  const handleChange = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('cybershield_settings', JSON.stringify(settings));
    setMessage('✅ Settings saved successfully');
    setTimeout(() => setMessage(''), 2500);
  };

const handlePasswordChange = async () => {
  if (passwords.newPassword.length < 6) {
    setMessage('❌ Password must be at least 6 characters');
    return;
  }

  if (passwords.newPassword !== passwords.confirmPassword) {
    setMessage('❌ Passwords do not match');
    return;
  }

  try {
    const username = localStorage.getItem('username');

    const res = await fetch('http://127.0.0.1:8000/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  username,
  new_password: passwords.newPassword,
}),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || 'Password change failed');

    setPasswords({ newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    setMessage('✅ Password changed successfully');
  } catch (err) {
    setMessage('❌ ' + err.message);
  }
};

  const handleDeleteAccount = async () => {
  const ok = window.confirm('Are you sure you want to delete this account?');
  if (!ok) return;

  try {
    const username = localStorage.getItem('username');

    const res = await fetch('http://127.0.0.1:8000/auth/delete-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Delete failed');

    localStorage.clear();
    window.location.reload();
  } catch (err) {
    setMessage('❌ ' + err.message);
  }
};

  return (
    <div className="page-container">
      <h1>⚙️ Settings</h1>
      <p className="subtitle">Customize your CyberShield experience</p>

      <div className="settings-panel">
        {message && <div className="settings-message">{message}</div>}

        <div className="settings-section">
          <h2>Preferences</h2>

          {[
            ['notifications', 'Enable Notifications'],
            ['darkMode', 'Dark Mode'],
            ['autoAnalysis', 'Auto-Analyze on Upload'],
            // ['emailAlerts', 'Email Alerts for Critical Threats'],
          ].map(([key, label]) => (
            <div className="setting-item" key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={() => handleChange(key)}
                />
                <span>{label}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="settings-section">
          <h2>Data Management</h2>

          <div className="setting-item">
            <label>Data Retention (days)</label>
            <select
              value={settings.dataRetention}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, dataRetention: e.target.value }))
              }
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Account</h2>

          <button
            className="danger-btn"
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            Change Password
          </button>

          <button className="danger-btn" type="button" onClick={handleDeleteAccount}>
            Delete Account
          </button>

          {showPasswordForm && (
            <div className="password-box">
              <input
                type="password"
                placeholder="New password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                }
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />

              <button className="save-btn" type="button" onClick={handlePasswordChange}>
                Save New Password
              </button>
            </div>
          )}
        </div>

        <button className="save-btn" type="button" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;