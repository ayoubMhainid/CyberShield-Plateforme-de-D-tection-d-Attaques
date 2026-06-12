import { getRecommendation } from '../utils/threatUtils';

function RecommendationList({ threats }) {
  return (
    <div className="recommendation-list">
      <h3>Security recommendations</h3>
      <ul>
        {threats.map((threat) => {
          const recommendation = getRecommendation(threat.name || threat);
          return (
            <li key={threat.name || threat}>
              <strong>{threat.name || threat}:</strong> {recommendation}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RecommendationList;
