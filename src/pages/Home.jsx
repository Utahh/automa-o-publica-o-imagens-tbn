import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Listings from "../components/Listings";
import About from "../components/About";
import Highlights from "../components/Highlights";
import Location from "../components/Location";
import ContactCTA from "../components/ContactCTA";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    const timer = setTimeout(scroll, 80);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <Hero />
      <Listings />
      <About />
      <Highlights />
      <Location />
      <ContactCTA />
    </>
  );
}
