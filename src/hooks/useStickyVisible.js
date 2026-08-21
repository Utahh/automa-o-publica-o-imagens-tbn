import { useEffect, useState } from "react";

export default function useStickyVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const footer = document.querySelector("footer");
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      const beforeFooter = footerTop > window.innerHeight;
      setVisible(pastHero && beforeFooter);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return visible;
}
