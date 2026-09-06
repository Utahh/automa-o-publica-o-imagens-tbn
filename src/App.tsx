import type { ReactNode } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { ScrollToTop } from "./components/ScrollToTop";
import { RequireAdmin } from "./components/RequireAdmin";
import { Home } from "./pages/Home";
import { Imoveis } from "./pages/Imoveis";
import { PropertyDetail } from "./pages/PropertyDetail";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/admin/Login";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { PropertyForm } from "./pages/admin/PropertyForm";

function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function PublicSite() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar transparentAtTop={isHome} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageFade><Home /></PageFade>} />
            <Route path="/imoveis" element={<PageFade><Imoveis /></PageFade>} />
            <Route path="/imoveis/:slug" element={<PageFade><PropertyDetail /></PageFade>} />
            <Route path="*" element={<PageFade><NotFound /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppButton variant="floating" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="imoveis/novo" element={<PropertyForm />} />
        <Route path="imoveis/:id" element={<PropertyForm />} />
      </Route>
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}

export default App;
