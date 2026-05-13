function LogEditor({ logs, setLogs }) {
  return (
    <div className="glass-panel analyzer-panel">
      <div className="panel-top">
        <div>
          <p className="eyebrow">Packet console</p>
          <h2>Paste logs and watch detection update</h2>
        </div>
      </div>

      <textarea
        value={logs}
        onChange={(e) => setLogs(e.target.value)}
        spellCheck="false"
      />
    </div>
  );
}

export default LogEditor;