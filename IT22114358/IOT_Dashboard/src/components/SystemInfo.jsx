function SystemInfo({ data, mqttStatus, firebaseStatus }) {
  const level = data ? (data['Level'] || 'SAFE').toUpperCase() : '--';
  const fanOn = level === 'DANGER';

  const rows = [
    { label: 'Device', value: data?.device || 'ESP32_GasMonitor' },
    { label: 'Sensor', value: data?.sensor || 'MQ2' },
    { label: 'MQTT Broker', value: 'broker.hivemq.com (WSS:8884)' },
    { label: 'MQTT Topic', value: 'repairbay/gas/2026_21' },
    { label: 'MQTT Status', value: mqttStatus === 'connected' ? 'Connected (Live 3s)' : mqttStatus },
    { label: 'Firebase Status', value: firebaseStatus === 'connected' ? 'Connected (History 60s)' : firebaseStatus },
    { label: 'GPIO Pins', value: 'ADC:35 R:26 B:25 G:14 Bz:13 Rl:27' },
    { label: 'Timestamp', value: data?.time || '--' },
  ];

  return (
    <div className="system-grid">
      {rows.map((row, i) => (
        <div key={i} className="system-row">
          <span className="system-label">{row.label}</span>
          <span className="system-value">{row.value}</span>
        </div>
      ))}
      <div className="system-row">
        <span className="system-label">Exhaust Fan (Relay)</span>
        <span className="system-value">
          <span className="fan-status">
            <span className={`fan-indicator ${fanOn ? 'on' : 'off'}`}></span>
            {fanOn ? 'RUNNING' : 'OFF'}
          </span>
        </span>
      </div>
    </div>
  );
}

export default SystemInfo;
