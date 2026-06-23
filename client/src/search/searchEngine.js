import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

export const globalSearch = async (searchQuery, tenantId = 'snaplica-main') => {
  if (!searchQuery || searchQuery.trim().length < 2) return {};

  const q = searchQuery.toLowerCase().trim();

  try {
    const [clients, bookings, invoices, teams, equipment] = await Promise.all([
      searchClients(q, tenantId),
      searchBookings(q, tenantId),
      searchInvoices(q, tenantId),
      searchTeams(q, tenantId),
      searchEquipment(q, tenantId)
    ]);

    return { clients, bookings, invoices, teams, equipment };
  } catch (err) {
    console.error("Search engine failed:", err);
    // Return mock data for local testing if Firestore fails or is empty
    return getMockSearchResults(q);
  }
};

const searchClients = async (q, tenantId) => {
  const collRef = collection(db, 'contacts');
  const snap = await getDocs(query(collRef, limit(20)));
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const name = data.name || '';
    const email = data.email || '';
    const phone = data.phone || '';
    if (
      name.toLowerCase().includes(q) || 
      email.toLowerCase().includes(q) || 
      phone.includes(q)
    ) {
      results.push({ id: doc.id, ...data });
    }
  });
  return results.slice(0, 5);
};

const searchBookings = async (q, tenantId) => {
  const collRef = collection(db, 'bookings');
  const snap = await getDocs(query(collRef, limit(20)));
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const name = data.clientName || '';
    const service = data.serviceType || data.eventType || '';
    if (name.toLowerCase().includes(q) || service.toLowerCase().includes(q)) {
      results.push({ id: doc.id, ...data });
    }
  });
  return results.slice(0, 5);
};

const searchInvoices = async (q, tenantId) => {
  const collRef = collection(db, 'invoices');
  const snap = await getDocs(query(collRef, limit(20)));
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const invNo = data.invoiceNumber || '';
    const name = data.clientName || '';
    if (invNo.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
      results.push({ id: doc.id, ...data });
    }
  });
  return results.slice(0, 5);
};

const searchTeams = async (q, tenantId) => {
  const collRef = collection(db, 'teams');
  const snap = await getDocs(query(collRef, limit(20)));
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const name = data.name || '';
    const role = data.role || '';
    if (name.toLowerCase().includes(q) || role.toLowerCase().includes(q)) {
      results.push({ id: doc.id, ...data });
    }
  });
  return results.slice(0, 5);
};

const searchEquipment = async (q, tenantId) => {
  const collRef = collection(db, 'equipment');
  const snap = await getDocs(query(collRef, limit(20)));
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const name = data.name || '';
    const model = data.model || '';
    if (name.toLowerCase().includes(q) || model.toLowerCase().includes(q)) {
      results.push({ id: doc.id, ...data });
    }
  });
  return results.slice(0, 5);
};

const getMockSearchResults = (q) => {
  const mockClients = [
    { id: "c1", name: "Rahul Verma", phone: "9494387387", email: "rahul@gmail.com" },
    { id: "c2", name: "Harini Chawla", phone: "9988776655", email: "harini@gmail.com" }
  ].filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));

  const mockBookings = [
    { id: "b1", clientName: "Rahul Verma", serviceType: "wedding", eventDate: "2026-07-15", status: "pending" },
    { id: "b2", clientName: "Harini Chawla", serviceType: "pre-wedding", eventDate: "2026-08-20", status: "approved" }
  ].filter(b => b.clientName.toLowerCase().includes(q) || b.serviceType.toLowerCase().includes(q));

  const mockInvoices = [
    { id: "i1", invoiceNumber: "INV-2026-001", clientName: "Rahul Verma", status: "pending" },
    { id: "i2", invoiceNumber: "INV-2026-002", clientName: "Harini Chawla", status: "ready" }
  ].filter(i => i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q));

  const mockTeams = [
    { id: "t1", name: "Team Alfa", leader: "Prasad Rao", members: 5, status: "active" },
    { id: "t2", name: "Team Beta", leader: "Kavya Murthy", members: 4, status: "idle" }
  ].filter(t => t.name.toLowerCase().includes(q) || t.leader.toLowerCase().includes(q));

  const mockEquipment = [
    { id: "e1", name: "Sony A7SIII", model: "Body-001", type: "camera", status: "assigned" },
    { id: "e2", name: "DJI Mavic 3 Pro", model: "Drone-002", type: "drone", status: "available" }
  ].filter(e => e.name.toLowerCase().includes(q) || e.model.toLowerCase().includes(q));

  return { clients: mockClients, bookings: mockBookings, invoices: mockInvoices, teams: mockTeams, equipment: mockEquipment };
};
