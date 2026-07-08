import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | undefined;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (unsubSnapshot) unsubSnapshot();
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Initial setup check
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const statusRef = doc(db, 'system', 'status');
          const statusDoc = await getDoc(statusRef);
          const isFirstUser = !statusDoc.exists();
          if (isFirstUser) {
             await setDoc(statusRef, { initialized: true });
          }
          const newUser: User = {
            uid: user.uid,
            email: user.email || '',
            username: user.email?.split('@')[0] || 'Player',
            role: (isFirstUser || user.email === 'adm@admin.com' || user.email === 'errosykes@gmail.com') ? 'admin' : 'player', 
            inventory: [],
            deck: []
          };
          await setDoc(userDocRef, newUser);
        } else {
          const data = userDoc.data() as User;
          if ((user.email === 'adm@admin.com' || user.email === 'errosykes@gmail.com') && data.role !== 'admin') {
            data.role = 'admin';
            await setDoc(userDocRef, data, { merge: true });
          }
        }

        // Set up snapshot listener
        unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
           if (docSnap.exists()) {
             setUserData(docSnap.data() as User);
           }
        });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
