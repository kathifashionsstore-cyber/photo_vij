import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_SERVICES, mergeServiceWithDefault, sortServicesByOrder } from "../data/services";

const servicesRef = () => collection(db, "services");

export const normalizeServiceDocs = (docs = []) => {
  const byId = new Map(DEFAULT_SERVICES.map((service) => [service.id, mergeServiceWithDefault(service)]));
  docs.forEach((service) => {
    if (service?.id) byId.set(service.id, mergeServiceWithDefault(service));
  });
  return sortServicesByOrder(Array.from(byId.values()));
};

export const watchServices = (onNext, onError) =>
  onSnapshot(
    query(servicesRef(), orderBy("order", "asc")),
    (snap) => {
      const docs = snap.docs.map((docSnap) => mergeServiceWithDefault({ id: docSnap.id, ...docSnap.data() }));
      onNext(normalizeServiceDocs(docs));
    },
    (err) => {
      onError?.(err);
      onNext(sortServicesByOrder(DEFAULT_SERVICES));
    },
  );

export const seedDefaultServices = async () => {
  const snap = await getDocs(servicesRef());
  if (!snap.empty) {
    const existingIds = new Set(snap.docs.map((docSnap) => docSnap.id));
    const missing = DEFAULT_SERVICES.filter((service) => !existingIds.has(service.id));
    if (missing.length === 0) return false;

    const batch = writeBatch(db);
    missing.forEach((service) => {
      batch.set(doc(db, "services", service.id), {
        ...mergeServiceWithDefault(service),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return true;
  }

  const batch = writeBatch(db);
  DEFAULT_SERVICES.forEach((service) => {
    batch.set(doc(db, "services", service.id), {
      ...mergeServiceWithDefault(service),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return true;
};
