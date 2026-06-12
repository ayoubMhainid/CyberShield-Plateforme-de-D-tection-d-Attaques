import { useState } from 'react';
import '../styles/Pages.css';

function ReportsPage() {
  const [reports] = useState([
    {
      id: 1,
      title: 'Security Audit Report',
      date: '2025-06-07',
      threats: 12,
      riskScore: 68,
    },
    {
      id: 2,
      title: 'Log Analysis Report',
      date: '2025-06-06',
      threats: 5,
      riskScore: 32,
    },
    {
      id: 3,
      title: 'Incident Response Report',
      date: '2025-06-05',
      threats: 28,
      riskScore: 89,
    },
  ]);

  const handleDownload = (reportId) => {
    alert(`Downloading report ${reportId}...`);
  };

  return (
    <div className="page-container">
      <h1>📄 Security Reports</h1>
      <p className="subtitle">Generated analysis and security reports</p>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.id} className={`report-card risk-${report.riskScore > 70 ? 'critical' : report.riskScore > 40 ? 'warning' : 'safe'}`}>
            <div className="report-header">
              <h3>{report.title}</h3>
              <span className="report-date">{report.date}</span>
            </div>

            <div className="report-stats">
              <div className="stat">
                <span>Risk Score</span>
                <strong>{report.riskScore}%</strong>
              </div>
              <div className="stat">
                <span>Threats</span>
                <strong>{report.threats}</strong>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${report.riskScore}%` }}></div>
            </div>

            <button className="download-btn" onClick={() => handleDownload(report.id)}>
              📥 Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;
