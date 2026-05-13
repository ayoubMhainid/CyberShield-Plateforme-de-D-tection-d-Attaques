import { useMemo, useState } from 'react';
import './App.css';

import HeroSection from './components/HeroSection';
import StatsCards from './components/StatsCards';
import LogEditor from './components/LogEditor';
import ThreatList from './components/ThreatList';
import { describeThreat } from './utils/threatUtils';

const API_URL = 'http://127.0.0.1:8000/upload';

const sampleLogs = `2026-05-07 09:14:12 failed login admin
2026-05-07 09:14:19 failed login root
2026-05-07 09:18:02 GET /products?id=1 SELECT * FROM users`;

const streamLines = [
  '0x4F2A :: auth probe blocked',
  'packet trace / subnet 10.0.0.0',
  'root access denied',
  'payload signature matched',
  'threat feed synced',
];

function App() {
  const [logs, setLogs] = useState(sampleLogs);
  const [analysis, setAnalysis] = useState({
    threats: [],
    risk_score: 0,
  });
  const [apiStatus, setApiStatus] = useState(
    'Ready to send logs to FastAPI'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const threats = useMemo(
    () =>
      analysis.threats
        .filter((threat) => threat !== 'No Threat Detected')
        .map(describeThreat),
    [analysis]
  );

  const totalLines = logs.split('\n').filter(Boolean).length;
  const safeEvents = Math.max(totalLines - threats.length, 0);
  const riskScore = Math.min(analysis.risk_score || 0, 100);

  const analyzeWithBackend = async (
    content = logs,
    filename = 'logs.txt'
  ) => {
    const formData = new FormData();
    const file = new File([content], filename, {
      type: 'text/plain',
    });

    formData.append('file', file);

    setIsAnalyzing(true);
    setApiStatus('Sending logs to FastAPI...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

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

    if (!file) return;

    const content = await file.text();
    setLogs(content);
    analyzeWithBackend(content, file.name);
  };

  return (
    <main className="cyber-app">
      <HeroSection
        apiStatus={apiStatus}
        isAnalyzing={isAnalyzing}
        onAnalyze={() => analyzeWithBackend()}
        onFileUpload={handleFileUpload}
        streamLines={streamLines}
      />

      <StatsCards
        riskScore={riskScore}
        threatsCount={threats.length}
        safeEvents={safeEvents}
        totalLines={totalLines}
      />

      <section className="command-center">
        <LogEditor logs={logs} setLogs={setLogs} />
        <ThreatList threats={threats} />
      </section>
    </main>
  );
}

export default App;