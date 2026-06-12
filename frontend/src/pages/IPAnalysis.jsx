import { useState } from 'react';
import '../styles/AnalysisPages.css';

function IPAnalysis() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/analysis/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Analysis failed');

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    if (!result) return '';
    if (result.is_private) return '🔒 Private IP';
    if (result.risk_score < 30) return '✓ Clean';
    if (result.risk_score < 60) return '⚠ Suspicious';
    return '🚨 High Risk';
  };

  return (
    <div className="analysis-container">
      <h1>🌐 IP Analysis</h1>
      <p className="subtitle">Analyze IP addresses for threats and real geolocation</p>

      <form className="analysis-form" onSubmit={handleAnalyze}>
        <input
          type="text"
          placeholder="8.8.8.8 or 1.1.1.1"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze IP'}
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className={`result-panel ${result.risk_score < 30 ? 'safe' : 'dangerous'}`}>
          <div className="result-header">
            <h2>{getStatus()}</h2>
            <div className="risk-gauge">
              <div className="gauge-fill" style={{ width: `${result.risk_score}%` }}></div>
            </div>
            <p className="risk-score">Risk: {result.risk_score}%</p>
          </div>

          <div className="ip-info">
            <p><strong>IP Address:</strong> {result.ip}</p>
            <p><strong>Country:</strong> {result.geolocation.country || 'Unknown'}</p>
            <p><strong>Region:</strong> {result.geolocation.region || 'Unknown'}</p>
            <p><strong>City:</strong> {result.geolocation.city || 'Unknown'}</p>
            <p><strong>ISP:</strong> {result.geolocation.isp || 'Unknown'}</p>
            <p><strong>Organization:</strong> {result.geolocation.org || 'Unknown'}</p>
            <p><strong>Timezone:</strong> {result.geolocation.timezone || 'Unknown'}</p>

            {result.geolocation.lat && result.geolocation.lon && (
              <p>
                <strong>Map:</strong>{' '}
                <a
                  href={`https://www.google.com/maps?q=${result.geolocation.lat},${result.geolocation.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open location on Google Maps
                </a>
              </p>
            )}
          </div>

          {result.threats.length > 0 && (
            <div className="threats-list">
              <h3>Detected Threats:</h3>
              <ul>
                {result.threats.map((threat, idx) => (
                  <li key={idx}>{threat}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="recommendation">
            <strong>Recommendation:</strong> {result.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}

export default IPAnalysis;