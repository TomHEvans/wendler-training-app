import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebase = firebaseConfig.apiKey && firebaseConfig.projectId;

let db = null;
if (hasFirebase) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

const storage = {
  async getPlan(weekId) {
    if (db) {
      const snap = await getDoc(doc(db, 'plans', weekId));
      return snap.exists() ? snap.data() : null;
    }
    const stored = localStorage.getItem(`plan-${weekId}`);
    return stored ? JSON.parse(stored) : null;
  },

  async savePlan(weekId, planData) {
    if (db) {
      await setDoc(doc(db, 'plans', weekId), planData);
    }
    localStorage.setItem(`plan-${weekId}`, JSON.stringify(planData));
  },

  async getAllPlans() {
    if (db) {
      const snap = await getDocs(query(collection(db, 'plans'), orderBy('__name__')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    const plans = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('plan-')) {
        const plan = JSON.parse(localStorage.getItem(key));
        plans.push({ id: key.replace('plan-', ''), ...plan });
      }
    }
    return plans.sort((a, b) => a.id.localeCompare(b.id));
  },

  async getCompletions(dayDate) {
    if (db) {
      const snap = await getDoc(doc(db, 'completions', dayDate));
      return snap.exists() ? snap.data() : {};
    }
    const stored = localStorage.getItem(`completions-${dayDate}`);
    return stored ? JSON.parse(stored) : {};
  },

  async toggleCompletion(exerciseKey, dayDate, completed) {
    const completions = await this.getCompletions(dayDate);
    completions[exerciseKey] = completed;
    if (db) {
      await setDoc(doc(db, 'completions', dayDate), completions);
    }
    localStorage.setItem(`completions-${dayDate}`, JSON.stringify(completions));
  },

  async addChangelog(action, details, weekId) {
    const entry = {
      action,
      details: details || '',
      week_id: weekId || '',
      created_at: new Date().toISOString(),
    };
    if (db) {
      await addDoc(collection(db, 'changelog'), entry);
    }
    const logs = JSON.parse(localStorage.getItem('changelog') || '[]');
    logs.unshift({ id: crypto.randomUUID(), ...entry });
    localStorage.setItem('changelog', JSON.stringify(logs));
  },

  async getChangelog() {
    if (db) {
      const snap = await getDocs(
        query(collection(db, 'changelog'), orderBy('created_at', 'desc'), limit(100))
      );
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return JSON.parse(localStorage.getItem('changelog') || '[]');
  },
};

export { db, storage, hasFirebase };
