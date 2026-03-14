import { useMqttData } from '../hooks/useMqttData';
import { useFirebaseHistory } from '../hooks/useGasData';
import Header from '../components/Header';
import StatusBanner from '../components/StatusBanner';
import GasGauge from '../components/GasGauge';
import PpmCard from '../components/PpmCard';
import TrendChart from '../components/TrendChart';
import AnalyticsPanel from '../components/AnalyticsPanel';
import AlertLog from '../components/AlertLog';
import SystemInfo from '../components/SystemInfo';
import { Link } from 'react-router-dom';

function GasDashboard() {
  const { liveData, mqttStatus, liveHistory } = useMqttData();
  const { history: firebaseHistory, firebaseStatus } = useFirebaseHistory();

  const connectionStatus = mqttStatus === 'connected' ? 'connected' :
    mqttStatus === 'reconnecting' ? 'connecting' :
    firebaseStatus === 'connected' ? 'connected' : mqttStatus;

  const lastUpdate = liveData ? new Date() : null;

  return (
    <div className="app">
      <Header
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        mqttStatus={mqttStatus}
        firebaseStatus={firebaseStatus}
      />
      <div className="breadcrumb-bar">
        <Link to="/" className="breadcrumb-link">Dashboard</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Gas Leak Safety Monitoring</span>
      </div>
      <StatusBanner data={liveData} />
      <main className="dashboard">
        <div className="dashboard-grid">
          <div className="card card-gauge">
            <h3 className="card-title">Gas Level (Raw ADC) <span className="live-tag">LIVE</span></h3>
            <GasGauge data={liveData} />
          </div>
          <div className="card card-ppm">
            <h3 className="card-title">Gas Concentration <span className="live-tag">LIVE</span></h3>
            <PpmCard data={liveData} />
          </div>
          <div className="card card-analytics">
            <h3 className="card-title">Edge AI Analytics <span className="live-tag">LIVE</span></h3>
            <AnalyticsPanel data={liveData} />
          </div>
          <div className="card card-chart">
            <h3 className="card-title">
              Real-Time Trend <span className="live-tag">LIVE 3s</span>
            </h3>
            <TrendChart history={liveHistory} />
          </div>
          <div className="card card-chart">
            <h3 className="card-title">
              Historical Trend (Firebase) <span className="history-tag">60s intervals</span>
            </h3>
            <TrendChart history={firebaseHistory} />
          </div>
          <div className="card card-alerts">
            <h3 className="card-title">Alert History</h3>
            <AlertLog history={liveHistory} firebaseHistory={firebaseHistory} />
          </div>
          <div className="card card-system">
            <h3 className="card-title">System Information</h3>
            <SystemInfo
              data={liveData}
              mqttStatus={mqttStatus}
              firebaseStatus={firebaseStatus}
            />
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>IT4021 - Smart Automotive Repair Bay Safety System | Group 2026_21 | Member 1 - Gas Leak Safety Monitoring</p>
      </footer>
    </div>
  );
}

export default GasDashboard;
