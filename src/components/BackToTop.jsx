import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-100 flex items-center justify-center transition-all duration-300 z-50 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronRight className="w-5 h-5 -rotate-90" />
    </button>
  );
}
