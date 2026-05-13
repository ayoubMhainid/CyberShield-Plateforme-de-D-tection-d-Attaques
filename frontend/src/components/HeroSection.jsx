function HeroSection({ apiStatus, isAnalyzing, onAnalyze, onFileUpload, streamLines }) {
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
            <input type="file" accept=".log,.txt" onChange={onFileUpload} />
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
        <img src="/assets/hacker-hero.jpg" alt="Cyber security hacker screen" />

        <div className="terminal-card">
          {streamLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;