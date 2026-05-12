import { useMemo, useState } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/upload';

const sampleLogs = `2026-05-07 09:14:12 failed login admin from 185.23.44.91
2026-05-07 09:14:19 failed login root from 185.23.44.91
2026-05-07 09:18:02 GET /products?id=1 SELECT * FROM users
2026-05-07 09:25:44 TOR proxy handshake from 45.67.11.90
2026-05-07 09:27:10 connection accepted from 10.0.0.42`;

const streamLines = [
  '0x4F2A :: auth probe blocked',
  'packet trace / subnet 10.0.0.0',
  'root access denied',
  'payload signature matched',
  'threat feed synced',
];

function describeThreat(name) {
  const normalized = name.toLowerCase();

  if (normalized.includes('sql')) {
    return {
      name,
      severity: 'Critical',
      detail: 'Backend detected database keywords inside request activity.',
    };
  }

  if (normalized.includes('command') || normalized.includes('xss')) {
    return {
      name,
      severity: 'High',
      detail: 'Backend matched a dangerous payload signature in the log stream.',
    };
  }

  if (normalized.includes('brute')) {
    return {
      name,
      severity: 'High',
      detail: 'Backend found repeated failed authentication attempts.',
    };
  }

  if (normalized.includes('suspicious') || normalized.includes('directory')) {
    return {
      name,
      severity: 'Medium',
      detail: 'Backend flagged an abnormal connection or path pattern.',
    };
  }

  return {
    name,
    severity: 'Medium',
    detail: 'Backend returned a suspicious security event.',
  };
}

function App() {
  const [logs, setLogs] = useState(sampleLogs);
  const [analysis, setAnalysis] = useState({ threats: [], risk_score: 0 });
  const [apiStatus, setApiStatus] = useState('Ready to send logs to FastAPI');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const threats = useMemo(
    () => analysis.threats.filter((threat) => threat !== 'No Threat Detected').map(describeThreat),
    [analysis]
  );
  const totalLines = logs.split('\n').filter(Boolean).length;
  const safeEvents = Math.max(totalLines - threats.length, 0);
  const riskScore = Math.min(analysis.risk_score || 0, 100);

  const analyzeWithBackend = async (content = logs, filename = 'pasted-logs.txt') => {
    const formData = new FormData();
    const file = new File([content], filename, { type: 'text/plain' });

    formData.append('file', file);
    setIsAnalyzing(true);
    setApiStatus('Sending logs to FastAPI...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();
      setAnalysis(result);
      setApiStatus('Backend connected: analysis received');
    } catch (error) {
      setApiStatus(`Backend error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const content = await file.text();
    setLogs(content);
    analyzeWithBackend(content, file.name);
  };

  return (
    <main className="cyber-app">
      <div className="matrix-rain" aria-hidden="true">
        <span>101101001011001011010010110100101100</span>
        <span>010011010110100101101001011011010010</span>
        <span>110010110100101100101101001011010010</span>
      </div>

      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">CyberShield IDS</p>
          <h1>Hacker mode security dashboard</h1>
          <p>
            Scan logs in real time, reveal suspicious activity, and track attack patterns with a
            darker cyber interface.
          </p>
          <div className="hero-actions">
            <label className="primary-upload">
              Upload logs
              <input type="file" accept=".log,.txt" onChange={handleFileUpload} />
            </label>
            <button className="analyze-button" type="button" onClick={() => analyzeWithBackend()} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze with API'}
            </button>
            <span className="live-pill">{apiStatus}</span>
          </div>
        </div>

        <div className="hacker-visual">
          <img src="/assets/hacker-hero.jpg" alt="Cyber security hacker screen" />
          <div className="scanline" aria-hidden="true" />
          <div className="terminal-card">
            {streamLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="signal-grid" aria-label="Security status">
        <article className="signal-card critical-glow">
          <span>Risk</span>
          <strong>{riskScore}</strong>
          <small>adaptive score</small>
        </article>
        <article className="signal-card">
          <span>Threats</span>
          <strong>{threats.length}</strong>
          <small>detected alerts</small>
        </article>
        <article className="signal-card">
          <span>Clean</span>
          <strong>{safeEvents}</strong>
          <small>safe events</small>
        </article>
        <article className="signal-card">
          <span>Lines</span>
          <strong>{totalLines}</strong>
          <small>log entries</small>
        </article>
      </section>

      <section className="command-center">
        <div className="glass-panel analyzer-panel">
          <div className="panel-top">
            <div>
              <p className="eyebrow">Packet console</p>
              <h2>Paste logs and watch detection update</h2>
            </div>
            <div className="window-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <textarea
            value={logs}
            onChange={(event) => setLogs(event.target.value)}
            spellCheck="false"
            aria-label="Security logs"
          />
        </div>

        <div className="glass-panel alerts-panel">
          <div className="panel-top">
            <div>
              <p className="eyebrow">Intrusion feed</p>
              <h2>Detected attacks</h2>
            </div>
          </div>

          {threats.length > 0 ? (
            <div className="alert-stack">
              {threats.map((threat, index) => (
                <article className="alert-row" key={threat.name} style={{ '--delay': `${index * 90}ms` }}>
                  <div>
                    <strong>{threat.name}</strong>
                    <p>{threat.detail}</p>
                  </div>
                  <span className={`severity ${threat.severity.toLowerCase()}`}>
                    {threat.severity}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>System clean</strong>
              <p>No suspicious signature is visible in the current stream.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
