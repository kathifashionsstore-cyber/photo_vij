import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestore = (collectionPath) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionPath) return;

    setLoading(true);
    const q = query(collection(db, collectionPath));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore loading error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath]);

  const add = async (item) => {
    return addDoc(collection(db, collectionPath), {
      ...item,
      createdAt: new Date().toISOString()
    });
  };

  const update = async (id, updates) => {
    const docRef = doc(db, collectionPath, id);
    return updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const remove = async (id) => {
    const docRef = doc(db, collectionPath, id);
    return deleteDoc(docRef);
  };

  return { data, loading, error, add, update, remove };
};

export default useFirestore;
