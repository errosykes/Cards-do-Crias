import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0870720752",
  appId: "1:174132954236:web:27bbb025f66c3a33b6b5f9",
  apiKey: "AIzaSyCb6-k-J3CUPNg4it1_br91KCWNqZraNac",
  authDomain: "gen-lang-client-0870720752.firebaseapp.com",
  storageBucket: "gen-lang-client-0870720752.firebasestorage.app",
  messagingSenderId: "174132954236",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, 'ai-studio-4dfc4035-ae53-40e7-96d1-5a95d5dc8c66');
export const auth = getAuth(app);
