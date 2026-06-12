import jsPDF from 'jspdf';
import { getRecommendation } from '../utils/threatUtils';

function ReportButton({ analysis, logs }) {
  const handleDownload = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const date = new Date();
    const formattedDate = date.toLocaleString();

    doc.setFontSize(22);
    doc.text('CyberShield Security Report', 40, 60);

    doc.setFontSize(12);
    doc.text(`Date: ${formattedDate}`, 40, 100);
    doc.text(`Risk Score: ${analysis.risk_score ?? 0}`, 40, 120);
    doc.text(`Detected Threats: ${analysis.threats?.length ?? 0}`, 40, 140);

    doc.setFontSize(14);
    doc.text('Detected Attacks:', 40, 180);

    const threats = analysis.threats && analysis.threats.length > 0 ? analysis.threats : ['No threats detected'];
    threats.forEach((threat, index) => {
      doc.setFontSize(12);
      doc.text(`- ${threat}`, 52, 200 + index * 18);
      const recommendation = getRecommendation(threat);
      if (recommendation) {
        doc.setFontSize(10);
        doc.text(`  Recommendation: ${recommendation}`, 62, 216 + index * 18, { maxWidth: 500 });
      }
    });

    doc.setFontSize(14);
    doc.text('Logs Analyzed:', 40, 260 + threats.length * 24);
    doc.setFontSize(10);
    const splitLogs = doc.splitTextToSize(logs || 'No logs provided.', 520);
    doc.text(splitLogs, 40, 280 + threats.length * 24);

    doc.setFontSize(14);
    doc.text('Security Recommendations:', 40, 310 + threats.length * 24 + splitLogs.length * 12);
    const recommendations = threats
      .map((threat) => getRecommendation(threat))
      .filter(Boolean);
    const uniqueRecommendations = Array.from(new Set(recommendations));
    doc.setFontSize(10);
    if (uniqueRecommendations.length > 0) {
      const recLines = doc.splitTextToSize(uniqueRecommendations.join('\n\n'), 520);
      doc.text(recLines, 40, 330 + threats.length * 24 + splitLogs.length * 12);
    } else {
      doc.text('No special recommendations at this time.', 40, 330 + threats.length * 24 + splitLogs.length * 12);
    }

    doc.save(`cybershield-report-${date.getTime()}.pdf`);
  };

  return (
    <button className="report-button" type="button" onClick={handleDownload}>
      Download PDF Report
    </button>
  );
}

export default ReportButton;
