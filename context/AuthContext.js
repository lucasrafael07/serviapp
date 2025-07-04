import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { app, db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userServiceId, setUserServiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' });
  const auth = getAuth(app);
  const router = useRouter();

  const fetchUserData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const userRoleRef = doc(db, "users", currentUser.uid);
      const servicesRef = collection(db, "servicos");
      const q = query(servicesRef, where("userId", "==", currentUser.uid));

      const [userRoleSnap, serviceSnapshot] = await Promise.all([
        getDoc(userRoleRef),
        getDocs(q)
      ]);
      
      setIsAdmin(userRoleSnap.exists() && userRoleSnap.data().role === 'admin');
      setUserServiceId(serviceSnapshot.empty ? null : serviceSnapshot.docs[0].id);

    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        setIsAdmin(false);
        setUserServiceId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [auth, fetchUserData]);

  const logoutUser = useCallback(async () => {
    await signOut(auth);
    router.push('/');
  }, [auth, router]);

  useEffect(() => {
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUser, 10 * 60 * 1000);
    };
    if (user) {
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();
    }
    return () => {
      clearTimeout(inactivityTimer);
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, logoutUser]);

  const openAuthModal = (view) => setAuthModal({ isOpen: true, view });
  const closeAuthModal = () => setAuthModal({ isOpen: false, view: 'login' });

  const value = { user, isAdmin, userServiceId, loading, authModal, openAuthModal, closeAuthModal, fetchUserData };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
