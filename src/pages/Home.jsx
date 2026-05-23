import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Star,
  Clock,
  ChevronRight,
  Flame,
  TrendingUp,
  Award,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = [
  {
    name: "Jollof Delights",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
  },
  {
    name: "Swallow & Soups",
    image: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=400",
  },
  {
    name: "Grills & BBQ",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
  },
  {
    name: "Sweet Treats",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400",
  },
  {
    name: "Soups",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
  },
  {
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400",
  },
];

const STATS = [
  {
    icon: <Star className="w-5 h-5" />,
    value: "4.8",
    label: "Rating",
    color: "text-amber-400",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    value: "30min",
    label: "Avg Delivery",
    color: "text-blue-400",
  },
  {
    icon: <Award className="w-5 h-5" />,
    value: "1.2k+",
    label: "Happy Customers",
    color: "text-green-400",
  },
  {
    icon: <Flame className="w-5 h-5" />,
    value: "50+",
    label: "Menu Items",
    color: "text-red-400",
  },
];

export default function Home() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [dynamicCategories, setDynamicCategories] = useState(CATEGORIES);
  const [addingId, setAddingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroAnimating, setHeroAnimating] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealsError, setMealsError] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    fetchMeals();
    if (user) {
      fetchCartCount();
      // Realtime cart subscription
      const channel = supabase
        .channel("cart-changes-home")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart_items",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchCartCount();
          },
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [user]);

  // Hero auto-rotate
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setHeroAnimating(true);
      setTimeout(() => {
        setHeroSlide((prev) => (prev + 1) % heroSlides.length);
        setHeroAnimating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.15 },
    );
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [meals]);

  const setRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  const fetchMeals = async () => {
    setMealsLoading(true);
    setMealsError(false);
    try {
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("available", true)
        .order("category", { ascending: true });

      if (error) throw error;

      if (data) {
        setMeals(data);

        // Build hero slides from Popular category first, then others
        const popular = data.filter((m) => m.category === "Popular");
        const others = data.filter((m) => m.category !== "Popular");
        const slideSource = [...popular, ...others].slice(0, 5);

        setHeroSlides(
          slideSource.map((m) => ({
            img: m.image_url,
            title: getHeroTitle(m.category),
            sub: m.name,
            id: m.id,
          })),
        );

        // Build category images from real meal data
        const categoryImageMap = {};
        data.forEach((m) => {
          if (!categoryImageMap[m.category] && m.image_url) {
            categoryImageMap[m.category] = m.image_url;
          }
        });

        setDynamicCategories(
          CATEGORIES.map((cat) => ({
            ...cat,
            image: categoryImageMap[cat.name] || cat.image,
          })),
        );
      }
    } catch (err) {
      setMealsError(true);
    } finally {
      setMealsLoading(false);
    }
  };

  const getHeroTitle = (category) => {
    const titles = {
      Popular: "The Heart of Nigerian Home Cooking",
      "Jollof Delights": "Rich. Smoky. Irresistible.",
      "Swallow & Soups": "Comfort in Every Bowl.",
      "Grills & BBQ": "Street Flavours. Elevated.",
      Soups: "Bold. Authentic. Nigerian.",
      "Sweet Treats": "Sweet Endings. Every Time.",
      Beverages: "Refresh Your Soul.",
      "Grills & sides": "Grilled to Perfection.",
      "Jollof Rice & Entrees": "The Classic Nigerian Plate.",
    };
    return titles[category] || "Authentic Nigerian Cuisine";
  };

  const fetchCartCount = async () => {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setCartCount(count || 0);
  };

  const addToCart = async (e, meal) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add items to cart");
      setTimeout(() => navigate("/signin"), 1500);
      return;
    }
    setAddingId(meal.id);
    try {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("meal_id", meal.id)
        .single();
      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ user_id: user.id, meal_id: meal.id, quantity: 1 });
      }
      toast.success(`${meal.name} added to cart!`);
      fetchCartCount();
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Featured meals — Popular first, then others, max 6
  const featuredMeals = [
    ...meals.filter((m) => m.category === "Popular"),
    ...meals.filter((m) => m.category !== "Popular"),
  ].slice(0, 6);

  const filtered = featuredMeals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const slide = heroSlides[heroSlide] || null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .reveal-up { animation: fadeUp 0.7s ease forwards; }
        .reveal-left { animation: slideInLeft 0.7s ease forwards; }
        .reveal-scale { animation: scaleIn 0.5s ease forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .shimmer-btn {
          background: linear-gradient(90deg, #f59e0b, #ea580c, #f59e0b);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-5 lg:px-10 py-4 bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <Link to="/" className="text-xl lg:text-2xl font-black text-gray-900">
          Chuks <span className="text-amber-500">Kitchen</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-gray-600 font-medium text-sm">
          {[
            { label: "Home", to: "/home" },
            { label: "Explore", to: "/menu" },
            { label: "My Orders", to: "/orders" },
            { label: "Account", to: "/profile" },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="relative group">
              <span className="hover:text-amber-500 transition-colors duration-200">
                {item.label}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative p-2 hover:bg-amber-50 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="hidden lg:block bg-gray-900 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-200 text-sm"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/signin"
              className="hidden lg:block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-amber-100"
            >
              Login
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-5 py-4 space-y-1 shadow-lg z-40">
          {[
            { label: "🏠 Home", to: "/home" },
            { label: "🍽️ Explore", to: "/menu" },
            { label: "📦 My Orders", to: "/orders" },
            { label: "👤 Account", to: "/profile" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition text-sm"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMenuOpen(false)}
                className="block w-full bg-amber-500 text-white font-bold py-3 rounded-xl text-center text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden bg-gray-900">
        {/* Background image */}
        {slide ? (
          <img
            key={heroSlide}
            src={slide.img}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${heroAnimating ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80";
            }}
          />
        ) : (
          <div className="absolute inset-0 skeleton" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-20">
          <div
            className={`transition-all duration-500 ${heroAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
          >
            {slide && (
              <>
                <span className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-300 text-xs font-bold px-4 py-2 rounded-full mb-4">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  {slide.sub}
                </span>
                <h2 className="text-3xl lg:text-6xl font-black text-white mb-4 leading-tight max-w-2xl">
                  {slide.title}
                </h2>
              </>
            )}
            <p className="text-gray-300 text-base lg:text-lg mb-8 max-w-md">
              Handcrafted with passion, delivered with care. Fresh Nigerian
              meals at your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/menu"
                className="shimmer-btn flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl text-base group w-fit"
              >
                Order Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/menu"
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base w-fit"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        {heroSlides.length > 0 && (
          <div className="absolute bottom-6 left-6 lg:left-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`rounded-full transition-all duration-300 ${i === heroSlide ? "bg-amber-400 w-8 h-2" : "bg-white/40 w-2 h-2 hover:bg-white/60"}`}
              />
            ))}
          </div>
        )}

        {/* Search bar */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 lg:px-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-5 py-4 border border-gray-100">
            <Search className="text-amber-500 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search for your favourite Nigerian dish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
                }
              }}
              className="w-full focus:outline-none text-gray-700 text-sm lg:text-base placeholder-gray-400"
            />
            {search && (
              <>
                <button
                  onClick={() =>
                    navigate(
                      `/menu?search=${encodeURIComponent(search.trim())}`,
                    )
                  }
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0"
                >
                  Search
                </button>
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div
        id="stats"
        ref={setRef("stats")}
        className="bg-gray-900 px-6 lg:px-20 py-10 mt-6"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${visibleSections["stats"] ? `reveal-up stagger-${i + 1}` : "opacity-0"}`}
            >
              <div className={`flex justify-center mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-white font-black text-2xl lg:text-3xl">
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div
        id="categories"
        ref={setRef("categories")}
        className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-16"
      >
        <div
          className={`flex items-center justify-between mb-8 ${visibleSections["categories"] ? "reveal-up" : "opacity-0"}`}
        >
          <div>
            <p className="text-amber-500 font-bold text-sm mb-1">Browse by</p>
            <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
              Popular Categories
            </h3>
          </div>
          <Link
            to="/menu"
            className="flex items-center gap-1 text-amber-500 font-bold text-sm hover:underline group"
          >
            View All{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {dynamicCategories.map((cat, i) => (
            <Link
              to={`/menu?category=${encodeURIComponent(cat.name)}`}
              key={cat.name}
              className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm card-hover ${visibleSections["categories"] ? `reveal-scale stagger-${i + 1}` : "opacity-0"}`}
            >
              <div className="relative h-32 lg:h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
                  <p className="text-white font-black text-sm lg:text-base">
                    {cat.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CHEF'S SPECIALS */}
      <div id="specials" ref={setRef("specials")} className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div
            className={`flex items-center justify-between mb-8 ${visibleSections["specials"] ? "reveal-up" : "opacity-0"}`}
          >
            <div>
              <p className="text-amber-500 font-bold text-sm mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Trending Now
              </p>
              <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
                Chef's Specials
              </h3>
            </div>
            <Link
              to="/menu"
              className="flex items-center gap-1 text-amber-500 font-bold text-sm hover:underline group"
            >
              View All{" "}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Error state */}
          {mealsError && (
            <div className="text-center py-16 bg-white rounded-3xl">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">
                Failed to load meals
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Something went wrong. Please try again.
              </p>
              <button
                onClick={fetchMeals}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Skeleton loading */}
          {mealsLoading && !mealsError && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm"
                >
                  <div className="skeleton h-32 lg:h-48" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 rounded-full w-3/4" />
                    <div className="skeleton h-3 rounded-full w-1/2" />
                    <div className="flex justify-between items-center">
                      <div className="skeleton h-5 rounded-full w-16" />
                      <div className="skeleton h-8 w-16 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actual meals */}
          {!mealsLoading && !mealsError && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {filtered.length === 0 ? (
                <div className="col-span-2 md:col-span-3 text-center py-16 bg-white rounded-3xl">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-gray-700 mb-2">
                    No meals found
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Try a different search term
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-amber-600 transition"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filtered.map((meal, i) => (
                  <div
                    key={meal.id}
                    onClick={() => navigate(`/meal/${meal.id}`)}
                    className={`group bg-white rounded-3xl overflow-hidden shadow-sm card-hover cursor-pointer ${visibleSections["specials"] ? `reveal-up stagger-${(i % 3) + 1}` : "opacity-0"}`}
                  >
                    <div className="relative h-32 lg:h-48 overflow-hidden">
                      <img
                        src={meal.image_url}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {i === 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Hot
                        </span>
                      )}
                    </div>
                    <div className="p-3 lg:p-4">
                      <h4 className="font-black text-gray-900 text-sm lg:text-base mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {meal.name}
                      </h4>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2 hidden lg:block">
                        {meal.description}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-amber-600 font-black text-sm lg:text-lg">
                          ₦{meal.price.toLocaleString()}
                        </span>
                        <button
                          onClick={(e) => addToCart(e, meal)}
                          disabled={addingId === meal.id}
                          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm transition-all duration-200 disabled:opacity-50 shadow-lg shadow-amber-100"
                        >
                          {addingId === meal.id ? (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span className="hidden lg:inline">
                                Adding...
                              </span>
                            </span>
                          ) : (
                            "Add"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div
        id="howitworks"
        ref={setRef("howitworks")}
        className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-16"
      >
        <div
          className={`text-center mb-12 ${visibleSections["howitworks"] ? "reveal-up" : "opacity-0"}`}
        >
          <p className="text-amber-500 font-bold text-sm mb-2">
            Simple Process
          </p>
          <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
            How It Works
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-amber-200 z-0" />
          {[
            {
              step: "01",
              icon: <Search className="w-8 h-8" />,
              title: "Browse Menu",
              desc: "Explore our wide selection of authentic Nigerian dishes.",
            },
            {
              step: "02",
              icon: <ShoppingBag className="w-8 h-8" />,
              title: "Place Order",
              desc: "Add your favourites to cart and checkout in seconds.",
            },
            {
              step: "03",
              icon: <Bike className="w-8 h-8" />,
              title: "Fast Delivery",
              desc: "Sit back and enjoy. We deliver hot to your doorstep.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`relative text-center group ${visibleSections["howitworks"] ? `reveal-up stagger-${i + 1}` : "opacity-0"}`}
            >
              <div className="relative z-10">
                <div className="w-20 h-20 bg-amber-50 group-hover:bg-amber-500 rounded-3xl flex items-center justify-center text-amber-500 group-hover:text-white mx-auto mb-4 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-amber-100 group-hover:-translate-y-2">
                  {item.icon}
                </div>
                <span className="text-amber-500 font-black text-xs tracking-widest">
                  {item.step}
                </span>
                <h4 className="font-black text-gray-900 text-lg mb-2 mt-1">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROMO BANNER */}
      <div
        id="promo"
        ref={setRef("promo")}
        className="relative w-full h-64 lg:h-80 overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80"
          alt="New menu"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div
          className={`absolute inset-0 flex flex-col justify-center px-6 lg:px-20 ${visibleSections["promo"] ? "reveal-left" : "opacity-0"}`}
        >
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-4">
            <Flame className="w-3.5 h-3.5" /> Limited Time Offer
          </span>
          <h3 className="text-2xl lg:text-4xl font-black text-white mb-2 max-w-lg">
            Introducing Our New Menu Additions!
          </h3>
          <p className="text-gray-300 text-sm lg:text-base mb-6 max-w-md hidden lg:block">
            Explore exciting new dishes, crafted with the freshest ingredients
            and authentic Nigerian flavors.
          </p>
          <Link
            to="/menu"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl w-fit transition-all duration-200 shadow-lg shadow-amber-500/30 group"
          >
            Discover Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div
        id="testimonials"
        ref={setRef("testimonials")}
        className="bg-gray-50 py-16 px-4 lg:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-10 ${visibleSections["testimonials"] ? "reveal-up" : "opacity-0"}`}
          >
            <p className="text-amber-500 font-bold text-sm mb-2">
              What People Say
            </p>
            <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
              Customer Reviews
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Adaeze O.",
                role: "Regular Customer",
                review:
                  "The best Nigerian food I've had delivered. Tastes exactly like home cooking! The jollof rice is absolutely perfect.",
                rating: 5,
                color: "bg-amber-500",
              },
              {
                name: "Emeka N.",
                role: "Food Enthusiast",
                review:
                  "Fast delivery, hot food and incredible taste. Chuks Kitchen never disappoints. My go-to for authentic Nigerian meals.",
                rating: 5,
                color: "bg-blue-500",
              },
              {
                name: "Fatima B.",
                role: "Loyal Customer",
                review:
                  "I moved to Lagos 3 months ago and this is the only food that makes me feel at home. The egusi soup is divine!",
                rating: 5,
                color: "bg-green-500",
              },
            ].map((review, i) => (
              <div
                key={review.name}
                className={`bg-white rounded-3xl p-6 shadow-sm card-hover ${visibleSections["testimonials"] ? `reveal-up stagger-${i + 1}` : "opacity-0"}`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                  "{review.review}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${review.color} rounded-full flex items-center justify-center text-white font-black text-sm`}
                  >
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">
                      {review.name}
                    </p>
                    <p className="text-gray-400 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="bg-amber-500 px-6 lg:px-20 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-2xl lg:text-4xl font-black text-white mb-4">
            Hungry? We've got you covered.
          </h3>
          <p className="text-amber-100 text-base lg:text-lg mb-8 max-w-xl mx-auto">
            Order now and get hot, authentic Nigerian food delivered to your
            door in 30-45 minutes.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-black px-10 py-4 rounded-2xl hover:bg-amber-50 active:scale-95 transition-all duration-200 shadow-xl text-lg group"
          >
            Order Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
}
