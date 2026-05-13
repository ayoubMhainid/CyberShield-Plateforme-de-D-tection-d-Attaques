function StatsCards({ riskScore, threatsCount, safeEvents, totalLines }) {
  return (
    <section className="signal-grid">
      <article className="signal-card critical-glow">
        <span>Risk</span>
        <strong>{riskScore}</strong>
        <small>adaptive score</small>
      </article>

      <article className="signal-card">
        <span>Threats</span>
        <strong>{threatsCount}</strong>
        <small>detected alerts</small>
      </article>

      <article className="signal-card">
        <span>Clean</span>
        <strong>{safeEvents}</strong>
        <small>safe events</small>
      </article>

      <article className="signal-card">
        <span>Lines</span>
        <strong>{totalLines}</strong>
        <small>log entries</small>
      </article>
    </section>
  );
}

export default StatsCards;