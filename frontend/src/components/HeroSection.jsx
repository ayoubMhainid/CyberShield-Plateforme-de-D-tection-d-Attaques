import { useState } from 'react';

function HeroSection({ apiStatus, isAnalyzing, onAnalyze, onFileUpload, streamLines }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState(streamLines);

  const handleLockClick = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const scanMessages = [
      '🔓 INITIATING SECURITY SCAN...',
      '🔍 SCANNING FILE SYSTEM...',
      '📊 ANALYZING THREAT SIGNATURES...',
      '🌐 CHECKING IP REPUTATION...',
      '⚡ PROCESSING THREAT DETECTION...',
      '✓ THREAT DATABASE UPDATED',
      '📈 COMPILING RISK SCORES...',
      '🎯 FINALIZING ANALYSIS...',
      '✅ SCAN COMPLETE',
    ];

    let messageIndex = 0;
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 100 / 9, 100));

      if (messageIndex < scanMessages.length) {
        setTerminalOutput((prev) => [...prev.slice(-4), scanMessages[messageIndex]]);
        messageIndex++;
      }

      if (messageIndex >= scanMessages.length) {
        clearInterval(scanInterval);
        setTimeout(() => {
          setIsScanning(false);
          setScanProgress(0);
          setTerminalOutput(streamLines);
        }, 1000);
      }
    }, 600);
  };

  return (
    <section className="hero-shell">
      <div className="hero-copy">
        <p className="eyebrow">CyberShield IDS</p>
        <h1>Hacker mode security dashboard</h1>
        <p>
          Scan logs in real time, reveal suspicious activity, and track attack patterns.
        </p>

        <div className="hero-actions">
          <label className="primary-upload">
            Upload logs
            <input
  type="file"
  accept=".log,.txt"
  onChange={(e) => {
    onFileUpload(e);
    e.target.value = '';
  }}
/>
          </label>

          <button
            className="analyze-button"
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with API'}
          </button>

          <span className="live-pill">{apiStatus}</span>
        </div>
      </div>

      <div className="hacker-visual">
        <div className="lock-container" onClick={handleLockClick} style={{ cursor: isScanning ? 'default' : 'pointer' }}>
<img
  src="/assets/hacker-hero.jpg"
  alt="CyberShield lock"
  className={`lock-image ${isScanning ? 'scanning' : ''}`}
/>
          <div className="scan-indicator">
            {isScanning && (
              <>
                <div className="scan-bar">
                  <div className="scan-progress" style={{ width: `${scanProgress}%` }}></div>
                </div>
                <span className="scan-text">{Math.round(scanProgress)}%</span>
              </>
            )}
            {!isScanning && <span className="click-hint">Click to scan</span>}
          </div>
        </div>

        <div className="terminal-card">
          {terminalOutput.map((line, idx) => (
            <span key={idx} className={isScanning ? 'scanning-line' : ''}>
              {line}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
