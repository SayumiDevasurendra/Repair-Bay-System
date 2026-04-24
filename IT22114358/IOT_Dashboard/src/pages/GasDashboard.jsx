import { useEffect } from 'react';
import { useMqttData } from '../hooks/useMqttData';
import { useFirebaseHistory } from '../hooks/useGasData';
import Header from '../components/Header';
import StatusBanner from '../components/StatusBanner';
import TodaySummary from '../components/TodaySummary';
import GasGauge from '../components/GasGauge';
import PpmCard from '../components/PpmCard';
import TrendChart from '../components/TrendChart';
import AnalyticsPanel from '../components/AnalyticsPanel';
import AlertLog from '../components/AlertLog';
import SystemInfo from '../components/SystemInfo';
import ShiftSafety from '../components/ShiftSafety';
import { Link } from 'react-router-dom';

function getGasPpm(entry) {
  return Number(entry?.PPM ?? entry?.ppm ?? entry?.gas_ppm ?? entry?.gasLevel ?? entry?.value ?? 0);
}

function getGasLevel(entry) {
  return String(entry?.Level ?? entry?.level ?? entry?.status ?? '').toUpperCase();
}

function GasDashboard() {
  const { liveData, mqttStatus, liveHistory } = useMqttData();
  const { history: firebaseHistory, firebaseStatus } = useFirebaseHistory();
  const recentHistory = liveHistory.length > 0 ? liveHistory : firebaseHistory;

  const connectionStatus = mqttStatus === 'connected' ? 'connected' :
    mqttStatus === 'reconnecting' ? 'connecting' :
    firebaseStatus === 'connected' ? 'connected' : mqttStatus;

  const lastUpdate = liveData ? new Date() : null;

  useEffect(() => {
    const values = recentHistory
      .map((entry) => getGasPpm(entry))
      .filter((value) => Number.isFinite(value));
    const latestValue = getGasPpm(liveData) || values.at(-1) || 0;
    const maxValue = values.length > 0 ? Math.max(...values) : latestValue;
    const averageValue = values.length > 0
      ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
      : latestValue.toFixed(1);
    const recentAlerts = recentHistory.filter((entry) => {
      const status = getGasLevel(entry);
      return status.includes('WARN') || status.includes('DANGER') || status.includes('CRITICAL');
    }).length;

    const statusText = getGasLevel(liveData) || connectionStatus.toUpperCase();
    const trendText = String(liveData?.Trend ?? liveData?.trend ?? 'UNKNOWN').toUpperCase();
    const averageRaw = Number(liveData?.Average ?? liveData?.average ?? averageValue);
    const deviationRaw = Number(liveData?.Deviation ?? liveData?.deviation ?? 0);
    const lastTimestamp = String(liveData?.time ?? recentHistory.at(-1)?.time ?? 'Unavailable');
    const summary = {
      moduleName: 'Gas Leak Safety Monitoring',
      status: statusText || 'UNKNOWN',
      headline: `Current gas reading is ${latestValue.toFixed(2)} ppm with status ${statusText} and ${recentAlerts} recent elevated events.`,
      metrics: {
        currentPpm: latestValue.toFixed(2),
        averagePpm: averageValue,
        peakPpm: maxValue.toFixed(2),
        recentSamples: values.length,
        liveAverage: Number.isFinite(averageRaw) ? averageRaw.toFixed(2) : averageValue,
        deviation: Number.isFinite(deviationRaw) ? deviationRaw.toFixed(2) : '0.00',
        trend: trendText,
        lastTimestamp,
        mqttStatus,
        firebaseStatus,
      },
      alerts: [
        `${recentAlerts} warning or danger readings in the current history window`,
        `Current gas level is ${statusText}`,
      ],
      recommendedActions: [
        statusText.includes('DANGER') || latestValue >= 18
          ? 'Inspect the bay immediately, isolate the possible leak source, and improve ventilation.'
          : statusText.includes('WARNING') || latestValue >= 10
            ? 'Keep the bay ventilated, investigate the source, and watch for any further increase.'
            : 'Continue monitoring the live trend and verify the gas threshold panel.',
      ],
    };

    window.dispatchEvent(new CustomEvent('repair-bay-dashboard-context', {
      detail: {
        route: '/gas-monitoring',
        context: summary,
      },
    }));
  }, [connectionStatus, firebaseStatus, liveData, liveHistory, mqttStatus, recentHistory]);

  return (
    <div className="app">
      <div className="breadcrumb-bar">
        <Link to="/" className="breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Gas Leak Safety Monitoring</span>
      </div>
      <Header
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        mqttStatus={mqttStatus}
        firebaseStatus={firebaseStatus}
      />
      <StatusBanner data={liveData} />
      <main className="dashboard">
        {/* Today's Summary KPI Bar */}
        <TodaySummary liveHistory={liveHistory} firebaseHistory={firebaseHistory} />

        <div className="dashboard-grid">
          <div className="card card-gauge">
            <h3 className="card-title">Gas Level Meter <span className="live-tag">LIVE</span></h3>
            <GasGauge data={liveData} />
          </div>
          <div className="card card-ppm">
            <h3 className="card-title">Gas Concentration <span className="live-tag">LIVE</span></h3>
            <PpmCard data={liveData} />
          </div>
          <div className="card card-analytics">
            <h3 className="card-title">Smart Analysis <span className="live-tag">LIVE</span></h3>
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
              Historical Trend <span className="history-tag">60s intervals</span>
            </h3>
            <TrendChart history={firebaseHistory} />
          </div>
          <div className="card card-alerts">
            <h3 className="card-title">Alert History</h3>
            <AlertLog history={liveHistory} firebaseHistory={firebaseHistory} />
          </div>
          <div className="card card-system">
            <h3 className="card-title">Safety Guide & Status</h3>
            <SystemInfo
              data={liveData}
              mqttStatus={mqttStatus}
              firebaseStatus={firebaseStatus}
            />
          </div>
          <div className="card card-shift">
            <h3 className="card-title">Shift Safety Score</h3>
            <ShiftSafety liveHistory={liveHistory} firebaseHistory={firebaseHistory} />
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
