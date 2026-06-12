import { useState } from 'react';
import '../styles/AnalysisPages.css';

function URLAnalysis() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/analysis/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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

  return (
    <div className="analysis-container">
      <h1>🔗 URL Analysis</h1>
      <p className="subtitle">Analyze URLs for phishing and malicious content</p>

      <form className="analysis-form" onSubmit={handleAnalyze}>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className={`result-panel ${result.safe ? 'safe' : 'dangerous'}`}>
          <div className="result-header">
            <h2>
  {result.risk_score < 30
    ? '✓ Safe'
    : result.risk_score < 70
    ? '⚠ Suspicious'
    : '🚨 Dangerous'}
</h2>
            <div className="risk-gauge">
              <div className="gauge-fill" style={{ width: `${result.risk_score}%` }}></div>
            </div>
            <p className="risk-score">Risk: {result.risk_score}%</p>
          </div>

          <div className="url-info">
            <p><strong>URL:</strong> {result.url}</p>
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
        </div>
      )}
    </div>
  );
}

export default URLAnalysis;
