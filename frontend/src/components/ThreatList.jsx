import RecommendationList from './RecommendationList';

function ThreatList({ threats }) {
  return (
    <div className="glass-panel alerts-panel">
      <div className="panel-top">
        <div>
          <p className="eyebrow">Intrusion feed</p>
          <h2>Detected attacks</h2>
        </div>
      </div>

      {threats.length > 0 ? (
        <>
          <div className="alert-stack">
            {threats.map((threat, index) => (
              <article
                className="alert-row"
                key={threat.name}
                style={{ '--delay': `${index * 90}ms` }}>
                <div>
                  <strong>{threat.name}</strong>
                  <p>{threat.detail}</p>
                  <p className="recommendation-text">{threat.recommendation}</p>
                </div>

                <span className={`severity ${threat.severity.toLowerCase()}`}>
                  {threat.severity}
                </span>
              </article>
            ))}
          </div>

          <RecommendationList threats={threats} />
        </>
      ) : (
        <div className="empty-state">
          <strong>System clean</strong>
          <p>No suspicious signature is visible in the current stream.</p>
        </div>
      )}
    </div>
  );
}

export default ThreatList;