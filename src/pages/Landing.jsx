import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Store,
  Truck,
  Star,
  ChevronRight,
  ChevronLeft,
  ChefHat,
  Zap,
  Leaf,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const CAROUSEL_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    name: "Jollof Rice & Fried Chicken",
    price: "₦3,500",
    tag: "Best Seller 🔥",
  },
  {
    img: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800&q=80",
    name: "Pounded Yam & Egusi Soup",
    price: "₦3,800",
    tag: "Chef's Pick 👨‍🍳",
  },
  {
    img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80",
    name: "Pepper Soup",
    price: "₦2,500",
    tag: "Fan Favourite ❤️",
  },
  {
    img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80",
    name: "Egusi Soup & Eba",
    price: "₦3,200",
    tag: "Must Try 😍",
  },
  {
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    name: "Suya & Grilled Beef",
    price: "₦4,000",
    tag: "Street Classic 🥩",
  },
];

const FOOD_1 =
  "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80";
const FOOD_2 =
  "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=400&q=80";

export default function Landing() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("right");
  const [visible, setVisible] = useState(false);

  // Page entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      goTo((current + 1) % CAROUSEL_SLIDES.length, "right");
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  const goTo = (index, dir = "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 400);
  };

  const prev = () =>
    goTo(current === 0 ? CAROUSEL_SLIDES.length - 1 : current - 1, "left");
  const next = () => goTo((current + 1) % CAROUSEL_SLIDES.length, "right");

  const slide = CAROUSEL_SLIDES[current];

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
        }
        .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
        .animate-fade-up-2 { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; }
        .animate-fade-up-3 { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; }
        .animate-fade-up-4 { animation: fadeUp 0.7s 0.45s ease forwards; opacity: 0; }
        .animate-fade-up-5 { animation: fadeUp 0.7s 0.6s ease forwards; opacity: 0; }
        .animate-slide-right { animation: slideInRight 0.7s 0.2s ease forwards; opacity: 0; }
        .animate-float { animation: floatUp 3s ease-in-out infinite; }
        .animate-float-delay { animation: floatUp 3s 1.5s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }
        .carousel-slide-right { animation: slideInRight 0.4s ease forwards; }
        .carousel-slide-left { animation: slideInLeft 0.4s ease forwards; }
        .carousel-exit { opacity: 0; transition: opacity 0.3s ease; }
      `}</style>

      {/* NAVBAR */}
      <nav
        className={`flex justify-between items-center px-6 lg:px-16 py-5 bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <h1 className="text-2xl font-black text-gray-900">
          Chuks <span className="text-amber-500">Kitchen</span>
        </h1>
        <div className="hidden md:flex items-center gap-8 text-gray-500 font-medium text-sm">
          {["About", "Menu", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-amber-500 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/home"
              className="text-gray-700 font-semibold text-sm hover:text-amber-500 transition-colors hidden sm:block"
            >
              My Account
            </Link>
          ) : (
            <Link
              to="/signin"
              className="text-gray-700 font-semibold text-sm hover:text-amber-500 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
          )}
          <Link
            to={user ? "/home" : "/signup"}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-100"
          >
            {user ? "Go to App" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Left — Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 py-12 lg:py-0">
          {/* Badge */}
          <div
            className={`${visible ? "animate-fade-up" : "opacity-0"} inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2 rounded-full w-fit mb-6`}
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Now delivering across Lagos
          </div>

          <h2
            className={`${visible ? "animate-fade-up-2" : "opacity-0"} text-4xl lg:text-6xl font-black text-gray-900 leading-tight mb-6`}
          >
            Your Authentic
            <br />
            <span className="text-amber-500">Taste of</span>
            <br />
            Nigeria
          </h2>

          <p
            className={`${visible ? "animate-fade-up-3" : "opacity-0"} text-gray-500 text-lg leading-relaxed mb-10 max-w-md`}
          >
            Experience homemade flavors delivered fresh to your desk or home. We
            bring the rich culinary heritage of Nigeria right to your doorstep.
          </p>

          {/* Features */}
          <div
            className={`${visible ? "animate-fade-up-3" : "opacity-0"} grid grid-cols-1 gap-3 mb-10`}
          >
            {[
              {
                icon: <UtensilsCrossed className="w-4 h-4" />,
                text: "Freshly Prepared Every Day",
              },
              {
                icon: <Store className="w-4 h-4" />,
                text: "Supporting Local Nigerian Business",
              },
              {
                icon: <Truck className="w-4 h-4" />,
                text: "Fast & Reliable Delivery",
              },
            ].map((f, i) => (
              <div key={f.text} className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-500 shrink-0 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-300">
                  {f.icon}
                </div>
                <span className="text-gray-600 font-medium text-sm group-hover:text-gray-900 transition-colors">
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className={`${visible ? "animate-fade-up-4" : "opacity-0"} flex flex-col sm:flex-row gap-3 mb-10`}
          >
            <Link
              to={user ? "/home" : "/signup"}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-xl shadow-amber-100 text-base group"
            >
              Start Your Order
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={user ? "/menu" : "/signup"}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 font-bold py-4 px-8 rounded-2xl transition-all duration-200 text-base"
            >
              Explore Menu
            </Link>
          </div>

          {/* Social proof */}
          <div
            className={`${visible ? "animate-fade-up-5" : "opacity-0"} flex items-center gap-4`}
          >
            <div className="flex -space-x-2">
              {[
                "bg-orange-400",
                "bg-amber-500",
                "bg-yellow-400",
                "bg-red-400",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 ${c} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110 hover:z-10`}
                >
                  {["A", "B", "C", "D"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-0.5">
                Loved by 1,200+ customers
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 flex gap-4 flex-wrap">
            <span>© 2024 Chuks Kitchen.</span>
            <a href="#" className="text-amber-500 hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-amber-500 hover:underline">
              Terms of Service
            </a>
          </div>
        </div>

        {/* Right — Carousel */}
        <div
          className={`${visible ? "animate-slide-right" : "opacity-0"} w-full lg:w-1/2 relative  flex items-center justify-center p-6 lg:p-12 min-h-80 overflow-hidden`}
        >
          {/* Background blobs */}
          <div className="absolute top-8 right-8 w-40 h-40 bg-amber-200 rounded-full opacity-30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-48 h-48 bg-orange-200 rounded-full opacity-30 blur-3xl pointer-events-none" />

          <div className="relative w-full max-w-sm lg:max-w-none">
            {/* Main carousel image */}
            <div className="relative w-full aspect-square lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                key={current}
                src={slide.img}
                alt={slide.name}
                className={`w-full h-full object-cover ${animating ? "carousel-exit" : direction === "right" ? "carousel-slide-right" : "carousel-slide-left"}`}
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Slide info */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-5 ${animating ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              >
                <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                  {slide.tag}
                </span>
                <p className="text-white font-black text-lg leading-tight">
                  {slide.name}
                </p>
                <p className="text-amber-300 font-bold text-sm">
                  {slide.price}
                </p>
              </div>

              {/* Prev / Next buttons */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {CAROUSEL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? "right" : "left")}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-amber-500 w-6 h-2"
                      : "bg-gray-300 hover:bg-amber-300 w-2 h-2"
                  }`}
                />
              ))}
            </div>

            {/* Floating card top left — animate-float */}
            <div className="absolute -top-4 -left-4 lg:-left-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 max-w-44 animate-float">
              <img
                src={FOOD_1}
                alt="food"
                className="w-10 h-10 rounded-xl object-cover shrink-0"
              />
              <div>
                <p className="text-xs font-black text-gray-800">Egusi Soup</p>
                <p className="text-xs text-amber-500 font-bold">₦3,500</p>
              </div>
            </div>

            {/* Floating card bottom right — animate-float-delay */}
            <div className="absolute -bottom-4 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 max-w-44 animate-float-delay">
              <img
                src={FOOD_2}
                alt="food"
                className="w-10 h-10 rounded-xl object-cover shrink-0"
              />
              <div>
                <p className="text-xs font-black text-gray-800">Pounded Yam</p>
                <p className="text-xs text-amber-500 font-bold">₦3,800</p>
              </div>
            </div>

            {/* Delivery badge */}
            <div className="absolute top-4 right-14 bg-amber-500 text-white rounded-2xl shadow-lg px-3 py-2 text-center animate-pulse-glow">
              <p className="text-xs font-black">30-45</p>
              <p className="text-xs font-semibold opacity-90">mins</p>
            </div>

            {/* Rating badge */}
            <div className="absolute bottom-14 left-4 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-gray-800">4.8</span>
              <span className="text-xs text-gray-400">(1.2k)</span>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR DISHES */}
      <section id="menu" className="bg-gray-50 px-6 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-amber-500 font-bold text-sm mb-1">
                Our Specialties
              </p>
              <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
                Popular Dishes
              </h3>
            </div>
            <Link
              to="/menu"
              className="flex items-center gap-1 text-amber-500 font-bold text-sm hover:underline group"
            >
              See all{" "}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: "Jollof Rice & Chicken",
                price: "₦3,500",
                tag: "Best Seller 🔥",
                img: CAROUSEL_SLIDES[0].img,
              },
              {
                name: "Egusi Soup & Eba",
                price: "₦3,800",
                tag: "Chef's Pick 👨‍🍳",
                img: CAROUSEL_SLIDES[1].img,
              },
              {
                name: "Suya & Grilled Beef",
                price: "₦4,000",
                tag: "Street Classic 🥩",
                img: CAROUSEL_SLIDES[4].img,
              },
            ].map((dish) => (
              <Link
                to="/signup"
                key={dish.name}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {dish.tag}
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-gray-900 text-base">
                      {dish.name}
                    </h4>
                    <p className="text-amber-500 font-bold text-sm mt-0.5">
                      {dish.price}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-amber-50 group-hover:bg-amber-500 border-2 border-amber-200 group-hover:border-amber-500 rounded-xl flex items-center justify-center text-amber-500 group-hover:text-white transition-all duration-300">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="about" className="px-6 lg:px-16 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-500 font-bold text-sm mb-2">
              Why Choose Us
            </p>
            <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
              The Chuks Kitchen Difference
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <ChefHat className="w-8 h-8" />,
                title: "Home-Style Cooking",
                desc: "Every dish made with the same love and care as your mama's kitchen.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Fast Delivery",
                desc: "Hot food at your door in 30-45 minutes. No excuses, no delays.",
              },
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "Fresh Ingredients",
                desc: "We source fresh, local ingredients daily for the best Nigerian flavors.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-amber-50 hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className="w-16 h-16 bg-amber-100 group-hover:bg-amber-500 rounded-2xl flex items-center justify-center text-amber-500 group-hover:text-white mx-auto mb-6 transition-all duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <h4 className="font-black text-gray-900 text-lg mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-amber-500 px-6 lg:px-16 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-3xl lg:text-4xl font-black text-white mb-4">
            Ready to taste the difference?
          </h3>
          <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
            Join over 1,200 happy customers already enjoying authentic Nigerian
            meals delivered to their door.
          </p>
          <Link
            to={user ? "/home" : "/signup"}
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-black px-10 py-4 rounded-2xl hover:bg-amber-50 active:scale-95 transition-all duration-200 shadow-xl text-lg group"
          >
            Order Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="bg-gray-900 text-white px-6 lg:px-16 py-16"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-black mb-1">
              Chuks <span className="text-amber-500">Kitchen</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">
              Bringing the authentic flavors of Nigerian home cooking to your
              table.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-gray-300">
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
            <h4 className="font-bold text-sm mb-4 text-gray-300">Contact Us</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>+234 801 234 5678</li>
              <li>hello@chukskitchen.com</li>
              <li>123 Taste Blvd, Lagos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-gray-300">Follow Us</h4>
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
        <div className="max-w-6xl mx-auto pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
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
