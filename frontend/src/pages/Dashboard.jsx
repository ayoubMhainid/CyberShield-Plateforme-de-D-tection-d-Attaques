import { useState } from 'react';
import Navbar from '../components/Navbar';
import FileAnalysis from '../pages/FileAnalysis';
import URLAnalysis from '../pages/URLAnalysis';
import IPAnalysis from '../pages/IPAnalysis';
import HashLookup from '../pages/HashLookup';
import AIAssistant from '../pages/AIAssistant';
import ThreatMap from '../pages/ThreatMap';
import HistorySection from '../components/HistorySection';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import HeroSection from '../components/HeroSection';
import StatsCards from '../components/StatsCards';
import LogEditor from '../components/LogEditor';
import ThreatList from '../components/ThreatList';
import ChartsPanel from '../components/ChartsPanel';
import { describeThreat } from '../utils/threatUtils';
import '../styles/Dashboard.css';

const API_URL = 'http://127.0.0.1:8000/upload';
const HISTORY_URL = 'http://127.0.0.1:8000/history';

function normalizeLogs(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function Dashboard({
  username,
  history,
  setHistory,
  analysis,
  setAnalysis,
  logs,
  setLogs,
  onLogout,
}) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('Ready to send logs to FastAPI');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePageChange = (pageKey) => {
    setCurrentPage(pageKey);
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(HISTORY_URL);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('History error:', error);
    }
  };

  const analyzeWithBackend = async (content = logs, filename = 'logs.txt') => {
    const normalizedContent = normalizeLogs(content);

    if (!normalizedContent) {
      setApiStatus('No logs to analyze');
      return;
    }

    const formData = new FormData();
    const file = new File([normalizedContent], filename, {
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

      if (!response.ok) {
        throw new Error('Backend analysis failed');
      }

      const result = await response.json();

      setLogs(normalizedContent);
      setAnalysis(result);
      setApiStatus('Backend connected: analysis received');
      await loadHistory();
    } catch (error) {
      setApiStatus(`Backend error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    setApiStatus('No file selected');
    return;
  }

  try {
    const content = await file.text();
    const normalized = normalizeLogs(content);

    console.log('Uploaded file:', file.name);
    console.log('Uploaded content length:', normalized.length);
    console.log('Uploaded content:', JSON.stringify(normalized));
    console.log("FILE OBJECT:", file);
console.log("FILE SIZE:", file.size);
console.log("RAW CONTENT:", JSON.stringify(content));

    setLogs(normalized);
    await analyzeWithBackend(normalized, file.name);
  } catch (error) {
    setApiStatus(`File upload error: ${error.message}`);
  }
};

  const handleDeleteHistory = async (id) => {
    if (!id) return;

    try {
      const response = await fetch(`${HISTORY_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert(`Delete error: ${error.message}`);
    }
  };

  const displayedThreats = (analysis.threats || [])
    .filter((threat) => threat !== 'No Threat Detected')
    .map(describeThreat);

  const totalLines = logs.split('\n').filter(Boolean).length;
  const safeEvents = Math.max(totalLines - displayedThreats.length, 0);
  const riskScore = Math.min(analysis.risk_score || 0, 100);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="dashboard-main">
            <HeroSection
              apiStatus={apiStatus}
              isAnalyzing={isAnalyzing}
              onAnalyze={() => analyzeWithBackend()}
              onFileUpload={handleFileUpload}
              streamLines={[
                '0x4F2A :: analysis engine active',
                'threat matrix loaded',
                'ml models running',
                'detection signatures synced',
                'dashboard ready',
              ]}
            />

            <StatsCards
              riskScore={riskScore}
              threatsCount={displayedThreats.length}
              safeEvents={safeEvents}
              totalLines={totalLines}
            />

            <section className="command-center">
              <LogEditor logs={logs} setLogs={setLogs} />
              <ThreatList threats={displayedThreats} />
            </section>

            <ChartsPanel history={history} />

            <HistorySection
              history={history}
              onDelete={handleDeleteHistory}
            />
          </div>
        );

      case 'file-analysis':
        return <FileAnalysis />;
      case 'url-analysis':
        return <URLAnalysis />;
      case 'ip-analysis':
        return <IPAnalysis />;
      case 'hash-lookup':
        return <HashLookup />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'threat-map':
        return <ThreatMap />;
      case 'history':
        return (
          <HistorySection
            history={history}
            onDelete={handleDeleteHistory}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar
        username={username}
        onLogout={onLogout}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <main className="dashboard-content">{renderPage()}</main>
    </div>
  );
}

export default Dashboard;