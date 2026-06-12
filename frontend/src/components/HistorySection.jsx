import { useMemo, useState } from 'react';

function HistorySection({ history, onDelete }) {
  const [attackFilter, setAttackFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const attackOptions = useMemo(() => {
    const setItems = new Set();
    history.forEach((item) => (item.threats || []).forEach((threat) => setItems.add(threat)));
    return ['All', ...Array.from(setItems)];
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchAttack =
        attackFilter === 'All' || (item.threats || []).includes(attackFilter);
      const matchRisk =
        riskFilter === 'All' ||
        (riskFilter === 'Low' && item.risk_score < 40) ||
        (riskFilter === 'Medium' && item.risk_score >= 40 && item.risk_score < 70) ||
        (riskFilter === 'High' && item.risk_score >= 70);
      const matchSearch =
        searchTerm.trim() === '' ||
        item.logs.toLowerCase().includes(searchTerm.trim().toLowerCase());
      return matchAttack && matchRisk && matchSearch;
    });
  }, [history, attackFilter, riskFilter, searchTerm]);

  const clearFilters = () => {
    setAttackFilter('All');
    setRiskFilter('All');
    setSearchTerm('');
  };

  return (
    <section className="history-section">
      <div className="history-header">
        <div>
          <p className="section-kicker">Analysis history</p>
          <h2>Saved MongoDB analyses</h2>
        </div>

        <div className="history-filters">
          <label>
            Attack type
            <select value={attackFilter} onChange={(e) => setAttackFilter(e.target.value)}>
              {attackOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Risk level
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Low">Low (&lt;40)</option>
              <option value="Medium">Medium (40-69)</option>
              <option value="High">High (70+)</option>
            </select>
          </label>

          <label className="history-search">
            Search logs
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs"
            />
          </label>

          <button className="clear-filters" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </div>

      <div className="history-grid">
        {filteredHistory.length === 0 ? (
          <p className="empty-history">No saved analyses match the filter criteria.</p>
        ) : (
          filteredHistory.map((item, index) => (
            <div className="history-card" key={item._id} style={{ '--i': index }}>
              <div className="history-top">
                <strong>Risk {item.risk_score}</strong>
                <span>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : 'No date'}
                </span>
              </div>

              <p>
                <b>Threats:</b>{' '}
                {item.threats && item.threats.length > 0
                  ? item.threats.join(', ')
                  : 'No threats'}
              </p>

              <pre>{item.logs}</pre>

              <button
                className="delete-history"
                type="button"
                onClick={() => onDelete(item._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default HistorySection;
