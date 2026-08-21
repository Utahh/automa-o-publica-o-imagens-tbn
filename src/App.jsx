import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./styles/global.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import StickyBar from "./components/StickyBar";
import Home from "./pages/Home";
import PropertyPage from "./pages/PropertyPage";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/imoveis/:id" element={<PropertyPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <StickyBar />
    </>
  );
}

export default App;
