import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, query, orderByKey, limitToLast } from 'firebase/database';

const firebaseConfig = {
  databaseURL: 'https://iot-chamu-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, query, orderByKey, limitToLast };
