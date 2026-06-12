import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title);

function ChartsPanel({ history }) {
  const attacks = history.flatMap((item) => item.threats || []);
  const attackCounts = attacks.reduce((acc, threat) => {
    acc[threat] = (acc[threat] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(attackCounts),
    datasets: [
      {
        data: Object.values(attackCounts),
        backgroundColor: ['#35ffc8', '#28c7ff', '#ff2f6d', '#ffb020', '#8c94ff'],
        borderWidth: 1,
      },
    ],
  };

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const lineData = {
    labels: sortedHistory.map((item) => new Date(item.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Risk Score',
        data: sortedHistory.map((item) => item.risk_score),
        fill: false,
        borderColor: '#35ffc8',
        backgroundColor: '#35ffc8',
        tension: 0.3,
      },
    ],
  };

  const barLabels = Array.from(
    sortedHistory.reduce((map, item) => {
      const dateKey = new Date(item.created_at).toLocaleDateString();
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
      return map;
    }, new Map()).entries(),
    ([label]) => label
  );

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Analyses',
        data: barLabels.map((label) =>
          sortedHistory.filter((item) => new Date(item.created_at).toLocaleDateString() === label).length
        ),
        backgroundColor: 'rgba(40, 199, 255, 0.45)',
      },
    ],
  };

  return (
    <section className="charts-panel">
      <div className="chart-card">
        <h3>Attack distribution</h3>
        {attacks.length > 0 ? <Pie data={pieData} /> : <p className="chart-empty">No history yet.</p>}
      </div>

      <div className="chart-card">
        <h3>Risk evolution</h3>
        {sortedHistory.length > 0 ? <Line data={lineData} /> : <p className="chart-empty">No history yet.</p>}
      </div>

      <div className="chart-card">
        <h3>Analyses over time</h3>
        {sortedHistory.length > 0 ? <Bar data={barData} /> : <p className="chart-empty">No history yet.</p>}
      </div>
    </section>
  );
}

export default ChartsPanel;
