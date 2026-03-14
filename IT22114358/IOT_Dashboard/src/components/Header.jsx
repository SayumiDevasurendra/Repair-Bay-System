function Header({ connectionStatus, lastUpdate, mqttStatus, firebaseStatus }) {
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-GB', { hour12: false });
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-icon">G</div>
        <div className="header-title">
          <h1>Gas Leak Safety Monitor</h1>
          <p>Smart Automotive Repair Bay | Group 2026_21</p>
        </div>
      </div>
      <div className="header-right">
        <span className="last-update">Last update: {formatTime(lastUpdate)}</span>
        <div className="connection-badges">
          <div className={`connection-badge ${mqttStatus === 'connected' ? 'connected' : mqttStatus === 'reconnecting' ? 'connecting' : 'error'}`}>
            <span className="connection-dot"></span>
            Live Sensor: {mqttStatus === 'connected' ? 'Active' : mqttStatus === 'reconnecting' ? 'Reconnecting' : mqttStatus === 'connecting' ? 'Connecting...' : 'Offline'}
          </div>
          <div className={`connection-badge ${firebaseStatus === 'connected' ? 'connected' : firebaseStatus === 'connecting' ? 'connecting' : 'error'}`}>
            <span className="connection-dot"></span>
            History: {firebaseStatus === 'connected' ? 'Saving' : firebaseStatus === 'connecting' ? 'Connecting...' : 'Unavailable'}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
