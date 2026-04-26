import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          // Fallback if metadata missing
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }

        // Fetch venue config from Firestore if exists
        const venueDoc = await getDoc(doc(db, "venues", firebaseUser.uid));
        if (venueDoc.exists()) {
          setVenue(venueDoc.data());
        }
      } else {
        setUser(null);
        setVenue(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (userData) => {
    const res = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const profile = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      organization: userData.organization,
      createdAt: new Date().toISOString(),
    };

    // Save metadata to Firestore
    await setDoc(doc(db, "users", res.user.uid), profile);
    setUser({ uid: res.user.uid, ...profile });
    return res.user;
  };

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  };

  const saveVenue = async (venueData) => {
    setVenue(venueData);
    if (auth.currentUser) {
      // Save to cloud
      await setDoc(doc(db, "venues", auth.currentUser.uid), venueData);
    }

    // Still send to local backend for the demo logic
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/venue/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venueData)
    }).catch(console.error);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user, venue, loading, register, login, saveVenue, logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
