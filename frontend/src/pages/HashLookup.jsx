import { useState } from 'react';
import '../styles/AnalysisPages.css';

function HashLookup() {
  const [hashValue, setHashValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/analysis/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_value: hashValue }),
      });

      const data = await response.json();

if (!response.ok) {
  console.log('HASH ERROR:', data);
  throw new Error(data.detail || 'Lookup failed');
}
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const panelClass =
    result?.status === 'Malicious'
      ? 'dangerous'
      : result?.status === 'Suspicious'
      ? 'warning'
      : 'safe';

  return (
    <div className="analysis-container">
      <h1>#️⃣ Hash Lookup</h1>
      <p className="subtitle">Lookup file hashes in real malware databases</p>

      <form className="analysis-form" onSubmit={handleLookup}>
        <input
          type="text"
          placeholder="MD5 32 chars or SHA256 64 chars"
          value={hashValue}
          onChange={(e) => setHashValue(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Looking up...' : 'Lookup Hash'}
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className={`result-panel ${panelClass}`}>
          <div className="result-header">
            <h2>
              {result.status === 'Malicious' && '🚨 Malicious'}
              {result.status === 'Suspicious' && '⚠️ Suspicious'}
              {result.status === 'Clean' && '✓ Clean'}
            </h2>
            <p className="detection-ratio">
              Source: {result.source} | Detection: {result.detection_ratio}
            </p>
          </div>

          <div className="hash-info">
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Hash Type:</strong> {result.hash_type}</p>
            <p className="hash-value"><strong>Hash:</strong> {result.hash}</p>
            <p><strong>MD5:</strong> {result.md5_hash}</p>
            <p><strong>SHA256:</strong> {result.sha256_hash}</p>
            <p><strong>File Type:</strong> {result.file_type}</p>
            <p><strong>File Size:</strong> {result.file_size} bytes</p>
            <p><strong>First Seen:</strong> {result.first_seen}</p>
            <p><strong>Last Seen:</strong> {result.last_seen}</p>
            <p><strong>Signature:</strong> {result.signature}</p>
          </div>

          {result.threat_type !== 'None' && (
            <div className="threat-info">
              <strong>Threat Type:</strong> {result.threat_type}
            </div>
          )}

          {result.tags && result.tags.length > 0 && (
            <div className="threats-list">
              <h3>Tags:</h3>
              <ul>
                {result.tags.map((tag, idx) => (
                  <li key={idx}>{tag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HashLookup;