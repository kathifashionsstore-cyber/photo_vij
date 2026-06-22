import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [tenantId, setTenantId] = useState('snaplica-main');
  const [tenantConfig, setTenantConfig] = useState({
    studioName: "Snaplica Photography",
    phone: "9494387387",
    email: "snaplicaphotography@gmail.com",
    address: "Ibrahimpatnam, Vijayawada, Andhra Pradesh",
    currency: "INR"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'tenants', tenantId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTenantConfig(docSnap.data());
        }
      } catch (e) {
        console.error("Failed to load tenant configuration:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantConfig();
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, tenantConfig, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
export default TenantContext;
