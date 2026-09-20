import { type ReactNode, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { ScrollToTop } from "./components/ScrollToTop";
import { RequireAdmin } from "./components/RequireAdmin";
import { Home } from "./pages/Home";
import { Imoveis } from "./pages/Imoveis";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Lancamentos } from "./pages/Lancamentos";
import { LancamentoDetail } from "./pages/LancamentoDetail";
import { Oportunidades } from "./pages/Oportunidades";
import { OportunidadeDetail } from "./pages/OportunidadeDetail";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/admin/Login";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Painel } from "./pages/admin/Painel";
import { PropertyList } from "./pages/admin/PropertyList";
import { PropertyForm } from "./pages/admin/PropertyForm";
import { trackEvent } from "./lib/analytics";

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

  useEffect(() => {
    trackEvent({ type: "page_view", path: location.pathname });
  }, [location.pathname]);

  // Conta como "contato com o corretor" qualquer clique num link do
  // WhatsApp do site — um só ouvinte aqui evita espalhar o rastreio por
  // cada botão. O `path` diz de qual página (e, nos imóveis, de qual
  // imóvel) a pessoa saiu.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a[href^='https://wa.me/']");
      if (link) trackEvent({ type: "whatsapp_click", path: window.location.pathname });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-azul-escritura focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:font-semibold focus:text-cinza-papel"
      >
        Pular para o conteúdo
      </a>
      <ScrollToTop />
      <Navbar transparentAtTop={isHome} />

      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageFade><Home /></PageFade>} />
            <Route path="/imoveis" element={<PageFade><Imoveis /></PageFade>} />
            <Route path="/imoveis/:slug" element={<PageFade><PropertyDetail /></PageFade>} />
            <Route path="/lancamentos" element={<PageFade><Lancamentos /></PageFade>} />
            <Route path="/lancamentos/:slug" element={<PageFade><LancamentoDetail /></PageFade>} />
            <Route path="/oportunidades" element={<PageFade><Oportunidades /></PageFade>} />
            <Route path="/oportunidades/:slug" element={<PageFade><OportunidadeDetail /></PageFade>} />
            <Route path="*" element={<PageFade><NotFound /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppButton variant="floating" className="md:hidden" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Painel />} />
        <Route path="imoveis" element={<PropertyList />} />
        <Route path="imoveis/novo" element={<PropertyForm />} />
        <Route path="imoveis/:id" element={<PropertyForm />} />
        <Route path="estatisticas" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}

export default App;
