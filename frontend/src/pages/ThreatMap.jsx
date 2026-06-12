import { useEffect, useRef } from 'react';
import '../styles/ThreatMap.css';

function ThreatMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId;
    let time = 0;

    const drawThreatMap = () => {
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid background
      ctx.strokeStyle = 'rgba(53, 255, 200, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Simulated threat locations (lat/lon converted to canvas coords)
      const threats = [
        { x: 150, y: 100, severity: 'critical', label: 'Shanghai' },
        { x: 400, y: 200, severity: 'high', label: 'Moscow' },
        { x: 550, y: 150, severity: 'medium', label: 'Dubai' },
        { x: 200, y: 350, severity: 'high', label: 'London' },
        { x: 100, y: 400, severity: 'critical', label: 'New York' },
        { x: 650, y: 300, severity: 'medium', label: 'Singapore' },
      ];

      threats.forEach((threat, idx) => {
        const pulse = Math.sin(time * 0.05 + idx) * 5 + 10;
        const color =
          threat.severity === 'critical' ? '#ff2f6d' :
          threat.severity === 'high' ? '#ffb020' :
          '#35ffc8';

        // Draw threat point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(threat.x, threat.y, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw outer ring
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(threat.x, threat.y, pulse * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw label
        ctx.fillStyle = color;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(threat.label, threat.x + 15, threat.y);
      });

      // Draw connection lines between nearby threats
      ctx.strokeStyle = 'rgba(40, 199, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < threats.length; i++) {
        for (let j = i + 1; j < threats.length; j++) {
          const dx = threats[j].x - threats[i].x;
          const dy = threats[j].y - threats[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(threats[i].x, threats[i].y);
            ctx.lineTo(threats[j].x, threats[j].y);
            ctx.stroke();
          }
        }
      }

      time += 1;
      animationId = requestAnimationFrame(drawThreatMap);
    };

    drawThreatMap();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="threat-map-container">
      <h1>🗺️ Threat Map</h1>
      <p className="subtitle">Real-time global threat visualization</p>

      <div className="map-canvas-wrapper">
        <canvas ref={canvasRef} className="threat-map-canvas"></canvas>
      </div>

      <div className="threat-legend">
        <div className="legend-item critical">🔴 Critical</div>
        <div className="legend-item high">🟠 High</div>
        <div className="legend-item medium">🟢 Medium</div>
      </div>

      <div className="threat-stats">
        <div className="stat-card">
          <h3>Active Threats</h3>
          <p className="stat-number">1,247</p>
        </div>
        <div className="stat-card">
          <h3>Countries Affected</h3>
          <p className="stat-number">87</p>
        </div>
        <div className="stat-card">
          <h3>Last 24h Attacks</h3>
          <p className="stat-number">3,421</p>
        </div>
      </div>
    </div>
  );
}

export default ThreatMap;
