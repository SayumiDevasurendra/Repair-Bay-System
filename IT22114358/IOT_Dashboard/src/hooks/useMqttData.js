import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC = 'repairbay/gas/2026_21';

export function useMqttData() {
  const [liveData, setLiveData] = useState(null);
  const [mqttStatus, setMqttStatus] = useState('connecting');
  const [liveHistory, setLiveHistory] = useState([]);
  const historyRef = useRef([]);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(BROKER_URL, {
      clientId: `react_dashboard_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 10000,
    });

    clientRef.current = client;

    client.on('connect', () => {
      setMqttStatus('connected');
      client.subscribe(TOPIC, { qos: 0 }, (err) => {
        if (err) {
          console.error('MQTT subscribe error:', err);
        }
      });
    });

    client.on('message', (_topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        setLiveData(data);

        // Keep last 100 live readings for the real-time chart
        const entry = { ...data, timestamp: Date.now() };
        historyRef.current = [...historyRef.current.slice(-99), entry];
        setLiveHistory([...historyRef.current]);
      } catch (e) {
        console.error('MQTT parse error:', e);
      }
    });

    client.on('error', (err) => {
      console.error('MQTT error:', err);
      setMqttStatus('error');
    });

    client.on('reconnect', () => {
      setMqttStatus('reconnecting');
    });

    client.on('close', () => {
      setMqttStatus('disconnected');
    });

    return () => {
      if (client) {
        client.end(true);
      }
    };
  }, []);

  return { liveData, mqttStatus, liveHistory };
}
