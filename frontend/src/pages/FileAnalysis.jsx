import { useState, useRef } from 'react';
import '../styles/AnalysisPages.css';

const API_URL = 'http://localhost:8000/upload';

function FileAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  const isSupportedFile = (file) =>
    ['.log', '.txt', '.json', '.csv'].some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isSupportedFile);
    handleFiles(droppedFiles);
  };

  const handleFiles = async (selectedFiles) => {
    const validFiles = selectedFiles.filter(isSupportedFile);
    if (!validFiles.length) return;

    setAnalyzing(true);
    setResults([]);

    const analysisResults = [];

    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Backend error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('FILE ANALYSIS RESPONSE:', data);

        const threats = Array.isArray(data.threats) ? data.threats : [];
        const realThreats =
          threats.length && threats[0] !== 'No Threat Detected' ? threats : [];

        analysisResults.push({
          filename: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          risks: realThreats.length,
          riskScore: data.risk_score || 0,
          threats: realThreats,
          threatDetails: data.threat_details || {},
          aiAnalysis: data.ai_analysis || null,
          status:
            data.risk_score > 70
              ? 'Critical'
              : data.risk_score > 40
              ? 'Warning'
              : 'Safe',
        });
      } catch (err) {
        analysisResults.push({
          filename: file.name,
          error: err.message || 'Failed to fetch',
          status: 'Error',
        });
      }
    }

    setResults(analysisResults);
    setAnalyzing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="analysis-container">
      <h1>📁 File Analysis</h1>
      <p className="subtitle">
        Upload log files for threat detection and AI anomaly detection
      </p>

      <div
        className="file-upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="upload-icon">📂</div>
        <h2>Drag & Drop Files Here</h2>
        <p>or</p>

        <button
          className="upload-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          webkitdirectory="true"
          directory="true"
          accept=".log,.txt,.json,.csv"
          onChange={(e) => {
            handleFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
          style={{ display: 'none' }}
        />

        <p className="supported">Supported: .log, .txt, .json, .csv</p>
      </div>

      {analyzing && (
        <div className="loading">
          Analyzing files with rule engine and AI model...
        </div>
      )}

      {results.length > 0 && (
        <div className="results-grid">
          <h2>Analysis Results</h2>

          {results.map((result, idx) => (
            <div
              key={idx}
              className={`result-card status-${
                result.status?.toLowerCase() || 'error'
              }`}
            >
              <div className="result-header">
                <h3>{result.filename}</h3>
                {result.status && (
                  <span className="status-badge">{result.status}</span>
                )}
              </div>

              {result.error ? (
                <p className="error">{result.error}</p>
              ) : (
                <>
                  <p>Size: <strong>{result.size}</strong></p>
                  <p>Risk Score: <strong>{result.riskScore}%</strong></p>
                  <p>Threats Detected: <strong>{result.risks}</strong></p>

                  <p>
                    Threats:{' '}
                    <strong>
                      {result.threats.length
                        ? result.threats.join(', ')
                        : 'No threats'}
                    </strong>
                  </p>

                  {Object.keys(result.threatDetails).length > 0 && (
                    <div className="threat-details-box">
                      <h4>Threat Details</h4>
                      {Object.entries(result.threatDetails).map(([name, score]) => (
                        <p key={name}>
                          <strong>{name}:</strong> {score}%
                        </p>
                      ))}
                    </div>
                  )}

                  {result.aiAnalysis && (
                    <div className="ai-box">
                      <h3>🤖 AI Anomaly Detection</h3>
                      <p>Model: <strong>{result.aiAnalysis.model}</strong></p>
                      <p>Result: <strong>{result.aiAnalysis.ai_result}</strong></p>
                      <p>AI Score: <strong>{result.aiAnalysis.ai_score}%</strong></p>
                      <p>
                        Explanation:{' '}
                        <strong>{result.aiAnalysis.explanation}</strong>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileAnalysis;