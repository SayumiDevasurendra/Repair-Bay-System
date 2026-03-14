import { useState, useEffect, useRef } from 'react';
import { database, ref, onValue, query, orderByKey, limitToLast } from '../config/firebase';

const MAX_HISTORY = 50;

export function useFirebaseHistory() {
  const [history, setHistory] = useState([]);
  const [firebaseStatus, setFirebaseStatus] = useState('connecting');

  useEffect(() => {
    const gasRef = ref(database, 'gas_data');
    const historyQuery = query(gasRef, orderByKey(), limitToLast(MAX_HISTORY));

    // Listen for new Firebase entries (every 60s from ESP32)
    const unsubscribe = onValue(
      historyQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entries = Object.values(data);
          setHistory(entries);
          setFirebaseStatus('connected');
        }
      },
      (error) => {
        console.error('Firebase error:', error);
        setFirebaseStatus('error');
      }
    );

    const timeout = setTimeout(() => {
      setFirebaseStatus((prev) => (prev === 'connecting' ? 'timeout' : prev));
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return { history, firebaseStatus };
}
