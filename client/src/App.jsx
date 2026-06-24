// src/App.jsx — COMPLETE CORRECT VERSION
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDynamicTheme } from "./hooks/useTheme";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import AnnouncementTicker from "./components/layout/AnnouncementTicker";
import { LeftSocialBar, RightSocialBar } from "./components/layout/FloatingSocialBar";
import { NAVBAR_HEIGHT } from "./components/layout/layoutConstants";
import { collection, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

// Lazy imports for ALL pages
import { lazy, Suspense } from "react";
import { useEffect, useState } from "react";

// Public
const Home      = lazy(() => import("./pages/Home"));
const About     = lazy(() => import("./pages/About"));
const Services  = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Booking   = lazy(() => import("./pages/Booking"));   // PUBLIC booking FORM
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const Contact   = lazy(() => import("./pages/Contact"));
const ChatbotWidget = lazy(() => import("./chatbot/ChatbotWidget"));
const SearchOverlay = lazy(() => import("./search/SearchOverlay"));
const FestivalBannerModal = lazy(() => import("./components/layout/FestivalBannerModal"));
const InstallAppBanner = lazy(() => import("./components/layout/InstallAppBanner"));

// Admin login (public)
const AdminLogin = lazy(() => import("./pages/admin/Login"));

// Admin pages (all protected)
const AdminLayout      = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard   = lazy(() => import("./admin/pages/Dashboard"));
const AdminCRM         = lazy(() => import("./admin/pages/CRM"));
const AdminCalendar    = lazy(() => import("./admin/pages/CalendarPage"));
const AdminBookings    = lazy(() => import("./admin/pages/Bookings"));      // ADMIN bookings list
const AdminTeams       = lazy(() => import("./admin/pages/Teams"));
const AdminFinance     = lazy(() => import("./admin/pages/Finance"));
const AdminGallery     = lazy(() => import("./admin/pages/Gallery"));
const AdminAnnounce    = lazy(() => import("./admin/pages/Announcements"));
const AdminBanners     = lazy(() => import("./admin/pages/Banners"));
const AdminAnalytics   = lazy(() => import("./admin/pages/Analytics"));
const AdminChatbot     = lazy(() => import("./admin/pages/Chatbot"));
const AdminWorkflows   = lazy(() => import("./admin/pages/Workflows"));
const AdminSettings    = lazy(() => import("./admin/pages/Settings"));

const Loader = () => (
  <div style={{ minHeight:"100vh", background:"#060608", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
      <img src="/logo.webp" alt="Snaplica" style={{ width:"64px", height:"64px", objectFit:"contain", borderRadius:"16px" }} />
      <div style={{ width:"36px", height:"36px", border:"2px solid rgba(201,162,39,0.15)", borderTop:"2px solid #c9a227", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const PublicLayout = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <AnnouncementTicker />
      <Navbar onSearchOpen={() => setIsSearchOpen(true)} />
      <main style={{ paddingTop: NAVBAR_HEIGHT }}>
        {children}
      </main>
      <Footer />
      <LeftSocialBar />
      <RightSocialBar />
      <Suspense fallback={null}>
        <FestivalBannerModal />
        <InstallAppBanner />
      </Suspense>
      <MobileBottomNav />
      <Suspense fallback={null}>
        <ChatbotWidget />
        {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
      </Suspense>
    </div>
  );
};

function AppContent() {
  useDynamicTheme(); // Hook up Settings Theme on mount

  useEffect(() => {
    const autoCRM = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const snap = await getDocs(collection(db, "leads"));
        const batch = writeBatch(db);
        let changed = 0;

        snap.docs.forEach((docSnap) => {
          const lead = docSnap.data();
          const status = String(lead.status || "");
          const normalized = status.trim().toLowerCase().replace(/\s+/g, "_");
          const shouldComplete = ["booked", "assigned", "confirmed"].includes(normalized);

          if (lead.eventDate && lead.eventDate < today && shouldComplete) {
            batch.update(docSnap.ref, {
              status: "completed",
              autoUpdatedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            changed += 1;
          }
        });

        if (changed > 0) await batch.commit();
      } catch (err) {
        console.warn("CRM auto-update skipped:", err);
      }
    };

    autoCRM();
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* PUBLIC SITE */}
        <Route path="/"          element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about"     element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/services"  element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/services/:serviceId" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
        <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
        <Route path="/booking"   element={<PublicLayout><Booking /></PublicLayout>} />
        <Route path="/booking/success" element={<PublicLayout><BookingSuccess /></PublicLayout>} />
        <Route path="/contact"   element={<PublicLayout><Contact /></PublicLayout>} />

        {/* ADMIN LOGIN — public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN PANEL — all nested routes protected */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="crm"           element={<AdminCRM />} />
          <Route path="calendar"      element={<AdminCalendar />} />
          <Route path="bookings"      element={<AdminBookings />} />   {/* /admin/bookings */}
          <Route path="teams"         element={<AdminTeams />} />
          <Route path="finance"       element={<AdminFinance />} />
          <Route path="gallery"       element={<AdminGallery />} />
          <Route path="announcements" element={<AdminAnnounce />} />
          <Route path="banners"       element={<AdminBanners />} />
          <Route path="analytics"     element={<AdminAnalytics />} />
          <Route path="chatbot"       element={<AdminChatbot />} />
          <Route path="workflows"     element={<AdminWorkflows />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
