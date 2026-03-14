import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { NoiseRecord } from "@/lib/types";

export function useNoiseData() {
  const [allRecords, setAllRecords] = useState<NoiseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const lastDangerKeyRef = useRef<string | null>(null);
  const [newDanger, setNewDanger] = useState(false);

  useEffect(() => {
    const dbRef = ref(database, "noise_monitoring");
    const unsub = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setAllRecords([]);
        setLoading(false);
        return;
      }

      const records: NoiseRecord[] = Object.entries(val).map(([key, value]: [string, any]) => ({
        key,
        avg_db: Number(value.avg_db),
        status: value.status,
        date: value.date,
        time: value.time,
      }));

      records.sort((a, b) => a.key.localeCompare(b.key));

      // Check for new danger
      const lastDanger = [...records].reverse().find((r) => r.status === "DANGER");
      if (lastDanger && lastDanger.key !== lastDangerKeyRef.current) {
        if (lastDangerKeyRef.current !== null) {
          setNewDanger(true);
          // Browser notification
          if (Notification.permission === "granted") {
            new Notification("⚠️ DANGER Alert", {
              body: `Noise level: ${lastDanger.avg_db} dB at ${lastDanger.time}`,
            });
          }
        }
        lastDangerKeyRef.current = lastDanger.key;
      }

      setAllRecords(records);
      setLoading(false);
    });

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => unsub();
  }, []);

  return { allRecords, loading, newDanger, clearDangerAlert: () => setNewDanger(false) };
}
