// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [role,     setRole]     = useState(null);
  const [loading,  setLoading]  = useState(true); // MUST start true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          const data = snap.exists() ? snap.data() : {};
          setUser(firebaseUser);
          setRole(data.role || "customer");
        } catch (err) {
          console.error("Error fetching user role:", err);
          setUser(firebaseUser);
          setRole("customer");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Only false AFTER auth check completes
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return fbSignOut(auth);
  };

  const isAdmin = () => ["admin", "superadmin", "manager"].includes(role);

  return (
    <AuthContext.Provider value={{ user, role, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
