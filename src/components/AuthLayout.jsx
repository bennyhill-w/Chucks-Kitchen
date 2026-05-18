import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Star, Clock, Shield } from "lucide-react";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    label: "Jollof Rice & Fried Chicken",
    desc: "Our most loved dish — rich, smoky and absolutely divine.",
  },
  {
    img: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800&q=80",
    label: "Pounded Yam & Egusi Soup",
    desc: "Traditional comfort food, made fresh every single day.",
  },
  {
    img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80",
    label: "Pepper Soup",
    desc: "Boldly spiced, deeply satisfying. A Nigerian classic.",
  },
  {
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    label: "Suya & Grilled Beef",
    desc: "Street-style suya elevated to its finest form.",
  },
];

export default function AuthLayout({ children }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setAnimating(false);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .auth-fade-up { animation: fadeUp 0.6s ease forwards; }
        .auth-fade-in { animation: fadeIn 0.5s ease forwards; }
        .slide-exit { opacity: 0; transform: scale(1.05); transition: all 0.5s ease; }
        .slide-enter { opacity: 1; transform: scale(1); transition: all 0.5s ease; }
      `}</style>

      <div className="flex flex-1">
        {/* Left — Immersive image panel (desktop only) */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col">
          {/* Background image */}
          <img
            key={current}
            src={slide.img}
            alt={slide.label}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${animating ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Top — Logo */}
          <div className="relative z-10 p-8">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-black text-white">
                Chuks <span className="text-amber-400">Kitchen</span>
              </h1>
            </Link>
          </div>

          {/* Middle — Stats */}
          <div className="relative z-10 flex-1 flex items-center px-8">
            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                {
                  icon: <Star className="w-5 h-5" />,
                  value: "4.8",
                  label: "Rating",
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  value: "30min",
                  label: "Delivery",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  value: "100%",
                  label: "Fresh",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center"
                >
                  <div className="text-amber-400 flex justify-center mb-2">
                    {stat.icon}
                  </div>
                  <p className="text-white font-black text-lg">{stat.value}</p>
                  <p className="text-white/60 text-xs font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Slide info */}
          <div className="relative z-10 p-8">
            {/* Dot indicators */}
            <div className="flex gap-1.5 mb-4">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-amber-400 w-6 h-2"
                      : "bg-white/40 w-2 h-2 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <div
              className={`transition-all duration-500 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
            >
              <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                Now Available
              </span>
              <h3 className="text-white font-black text-xl mb-1">
                {slide.label}
              </h3>
              <p className="text-white/70 text-sm">{slide.desc}</p>
            </div>

            {/* Review card */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-white/90 text-sm italic leading-relaxed">
                "The best Nigerian food I've had delivered. Tastes exactly like
                home cooking!"
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-black">
                  A
                </div>
                <div>
                  <p className="text-white font-semibold text-xs">Adaeze O.</p>
                  <p className="text-white/50 text-xs">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form panel */}
        <div className="w-full lg:w-[55%] flex items-center justify-center bg-gray-50 px-6 py-10 min-h-screen lg:min-h-0 lg:overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-block">
                <h1 className="text-2xl font-black text-gray-900">
                  Chuks <span className="text-amber-500">Kitchen</span>
                </h1>
              </Link>
            </div>

            {/* Desktop logo */}
            <div className="hidden lg:block text-center mb-8">
              <Link to="/" className="inline-block">
                <h1 className="text-2xl font-black text-gray-900">
                  Chuks <span className="text-amber-500">Kitchen</span>
                </h1>
              </Link>
            </div>

            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-black mb-2">
              Chuks <span className="text-amber-500">Kitchen</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bringing the authentic flavors of Nigerian home cooking to your
              table.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 text-gray-300">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>
                <Link
                  to="/home"
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="hover:text-amber-400 transition-colors"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="hover:text-amber-400 transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-amber-400 transition-colors"
                >
                  Account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 text-gray-300">Contact Us</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>+234 801 234 5678</li>
              <li>hello@chukskitchen.com</li>
              <li>123 Taste Blvd, Lagos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 text-gray-300">Follow Us</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              {["Instagram", "Twitter", "Facebook", "TikTok"].map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="hover:text-amber-400 transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800 text-gray-500 text-sm flex flex-col sm:flex-row justify-between gap-4">
          <p>© 2024 Chuks Kitchen. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
