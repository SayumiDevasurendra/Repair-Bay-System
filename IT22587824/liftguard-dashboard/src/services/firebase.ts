import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, limitToLast } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBrI_bp9mRgiElfOX1NVQOZrvhYHm7SoM",
  databaseURL: "https://lift-safe-5da04-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lift-safe-5da04",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

export const startSession = () =>
  signInWithEmailAndPassword(auth, "pprajeshvara@gmail.com", "Abc@123");

export interface LiftRecord {
  id: string;
  leftDistance: number;
  rightDistance: number;
  alignmentDiff: number;
  tiltX: number;
  tiltY: number;
  status: "SAFE" | "UNSAFE";
  timestamp: number;
}

export const subscribeLiftLogs = (callback: (records: LiftRecord[]) => void) => {
  const logsRef = ref(db, "lift_logs");
  return onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const records: LiftRecord[] = Object.entries(data).map(([key, val]: [string, any]) => ({
      id: key,
      leftDistance: val.leftDistance ?? 0,
      rightDistance: val.rightDistance ?? 0,
      alignmentDiff: val.alignmentDiff ?? 0,
      tiltX: val.tiltX ?? 0,
      tiltY: val.tiltY ?? 0,
      status: val.status ?? "SAFE",
      timestamp: val.timestamp ?? 0,
    }));
    records.sort((a, b) => a.timestamp - b.timestamp);
    callback(records);
  });
};
