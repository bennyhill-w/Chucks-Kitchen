import { useEffect, useState, useRef, useCallback } from "react";
import SEO from '../components/SEO';
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  SlidersHorizontal,
  X,
  Search,
  Flame,
  Star,
  ChevronRight,
  TrendingUp,
  Soup,
  Beef,
  Coffee,
  Cake,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = [
  { name: "Popular", icon: <TrendingUp className="w-4 h-4" /> },
  { name: "Jollof Delights", icon: <UtensilsCrossed className="w-4 h-4" /> },
  {
    name: "Jollof Rice & Entrees",
    icon: <UtensilsCrossed className="w-4 h-4" />,
  },
  { name: "Swallow & Soups", icon: <Soup className="w-4 h-4" /> },
  { name: "Soups", icon: <Soup className="w-4 h-4" /> },
  { name: "Grills & BBQ", icon: <Beef className="w-4 h-4" /> },
  { name: "Grills & sides", icon: <Beef className="w-4 h-4" /> },
  { name: "Sweet Treats", icon: <Cake className="w-4 h-4" /> },
  { name: "Desserts", icon: <Cake className="w-4 h-4" /> },
  { name: "Beverages", icon: <Coffee className="w-4 h-4" /> },
];

const heroImage = import.meta.env.VITE_FOOD_IMAGE_URL;

export default function Menu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [meals, setMeals] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "Popular",
  );
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealsError, setMealsError] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    fetchMeals();
    if (user) {
      fetchCartCount();
      // Realtime cart subscription
      const channel = supabase
        .channel("cart-changes-menu")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart_items",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchCartCount(),
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [user]);

  // Scroll to category from URL param after meals load
  useEffect(() => {
    if (!mealsLoading && !hasScrolled) {
      const cat = searchParams.get("category");
      if (cat) {
        setTimeout(() => {
          const el = document.getElementById(`cat-${cat}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveCategory(cat);
            setHasScrolled(true);
          }
        }, 300);
      }
    }
  }, [mealsLoading, searchParams]);

  // Scroll spy — update active category as user scrolls
  useEffect(() => {
    if (mealsLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cat = entry.target.id.replace("cat-", "");
            setActiveCategory(cat);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -60% 0px" },
    );

    Object.entries(sectionRefs.current).forEach(([_, ref]) => {
      if (ref) observerRef.current.observe(ref);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [mealsLoading, meals]);

  const setRef = useCallback(
    (id) => (el) => {
      sectionRefs.current[id] = el;
    },
    [],
  );

  const fetchMeals = async () => {
    setMealsLoading(true);
    setMealsError(false);
    try {
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("available", true);
      if (error) throw error;
      if (data) setMeals(data);
    } catch (err) {
      setMealsError(true);
    } finally {
      setMealsLoading(false);
    }
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

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    setShowMobileCategories(false);
    const el = document.getElementById(`cat-${cat}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Get all unique categories from actual meal data
  const allCategories = [...new Set(meals.map((m) => m.category))];

  const grouped = allCategories.reduce((acc, cat) => {
    const items = meals.filter(
      (m) =>
        m.category === cat &&
        m.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  // Skeleton component
  const MealSkeleton = () => (
    <div className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-100">
      <div className="h-28 lg:h-44 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      <div className="p-3 lg:p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );

  const CategorySkeleton = () => (
    <div className="space-y-3 mt-6">
      {/* Section header skeleton */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse mb-1" />
          <div className="h-3 w-16 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        {[...Array(6)].map((_, i) => (
          <MealSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO
        title="Menu — Chuks Kitchen"
        description="Explore our full menu of authentic Nigerian cuisine. Jollof rice, Egusi soup, Suya, Puff Puff and much more."
      />
      <Toaster />
      <Navbar cartCount={cartCount} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .reveal-up { animation: fadeUp 0.6s ease forwards; }
        .reveal-scale { animation: scaleIn 0.4s ease forwards; }
        .stagger-1 { animation-delay: 0.05s; opacity: 0; }
        .stagger-2 { animation-delay: 0.1s; opacity: 0; }
        .stagger-3 { animation-delay: 0.15s; opacity: 0; }
        .stagger-4 { animation-delay: 0.2s; opacity: 0; }
        .stagger-5 { animation-delay: 0.25s; opacity: 0; }
        .stagger-6 { animation-delay: 0.3s; opacity: 0; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); }
      `}</style>

      {/* Hero Banner */}
      <div className="relative w-full h-100 lg:h-164 overflow-hidden">
        <img
          src={heroImage}
          alt="Menu hero"
          className="w-full h-full object-cover scale-105"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-12">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-3">
            <Flame className="w-3.5 h-3.5" /> Fresh Today
          </span>
          <h2 className="text-2xl lg:text-4xl font-black text-white mb-1">
            Chuks Kitchen
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                />
              ))}
              <span className="text-white font-bold text-sm ml-1">4.8</span>
              <span className="text-white/60 text-sm">(1.2k reviews)</span>
            </div>
            <span className="text-white/40">•</span>
            <span className="text-white/80 text-sm font-medium">
              Nigerian Home Cooking
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/80 text-sm font-medium">
              30-45 min delivery
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 lg:px-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-5 py-3.5 border border-gray-100">
            <Search className="text-amber-500 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full focus:outline-none text-gray-700 text-sm placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile category filter */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 mt-6">
        <button
          onClick={() => setShowMobileCategories(!showMobileCategories)}
          className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-700 font-bold px-4 py-2.5 rounded-xl text-sm w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{activeCategory}</span>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${showMobileCategories ? "rotate-90" : ""}`}
          />
        </button>
        {showMobileCategories && (
          <div className="mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {allCategories.map((cat) => {
              const catConfig = CATEGORIES.find((c) => c.name === cat);
              return (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold border-b border-gray-50 last:border-0 transition flex items-center gap-2 ${
                    activeCategory === cat
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{catConfig?.icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-8 lg:py-12 flex gap-8 mt-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h3 className="font-black text-gray-900 text-base mb-1">
              Menu Categories
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              {mealsLoading ? "Loading..." : `${meals.length} items available`}
            </p>
            <ul className="space-y-1">
              {mealsLoading
                ? // Sidebar skeleton
                  [...Array(6)].map((_, i) => (
                    <li key={i}>
                      <div className="h-9 bg-gray-100 rounded-xl animate-pulse mb-1" />
                    </li>
                  ))
                : allCategories.map((cat) => {
                    const catConfig = CATEGORIES.find((c) => c.name === cat);
                    return (
                      <li key={cat}>
                        <button
                          onClick={() => scrollToCategory(cat)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 group ${
                            activeCategory === cat
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                              : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                          }`}
                        >
                          <span>{catConfig?.icon}</span>
                          <span className="flex-1">{cat}</span>
                          {activeCategory === cat && (
                            <ChevronRight className="w-4 h-4 opacity-70" />
                          )}
                        </button>
                      </li>
                    );
                  })}
            </ul>

            {/* Promo card */}
            {!mealsLoading && (
              <div className="mt-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
                <Flame className="w-6 h-6 mb-2 text-white/80" />
                <p className="font-black text-sm mb-1">Free Delivery</p>
                <p className="text-white/70 text-xs">On orders above ₦5,000</p>
              </div>
            )}
          </div>
        </aside>

        {/* Meal sections */}
        <div className="flex-1 space-y-12">
          {/* Error state */}
          {mealsError && (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-gray-700 mb-2">
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

          {/* Loading skeleton */}
          {mealsLoading && !mealsError && (
            <>
              <CategorySkeleton />
              <CategorySkeleton />
            </>
          )}

          {/* No results */}
          {!mealsLoading &&
            !mealsError &&
            Object.entries(grouped).length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-black text-gray-700 mb-2">
                  No meals found
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  No results for "
                  <span className="font-semibold text-gray-600">{search}</span>"
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  Clear Search
                </button>
              </div>
            )}

          {/* Meal sections */}
          {!mealsLoading &&
            !mealsError &&
            Object.entries(grouped).map(([category, items]) => (
              <section
                key={category}
                id={`cat-${category}`}
                ref={setRef(`cat-${category}`)}
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-amber-500 rounded-full" />
                    <div>
                      <h3 className="text-xl lg:text-2xl font-black text-gray-900">
                        {category}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {items.length} item{items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100">
                    {items.length} available
                  </span>
                </div>

                {/* Meal grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
                  {items.map((meal, i) => (
                    <div
                      key={meal.id}
                      onClick={() => navigate(`/meal/${meal.id}`)}
                      className="group bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-100 card-hover cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative h-28 lg:h-44 overflow-hidden">
                        <img
                          src={meal.image_url}
                          alt={meal.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Quick add on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={(e) => addToCart(e, meal)}
                            disabled={addingId === meal.id}
                            className="bg-white text-amber-600 font-black text-xs px-4 py-2 rounded-xl shadow-xl hover:bg-amber-500 hover:text-white transition-all duration-200 disabled:opacity-50 transform translate-y-2 group-hover:translate-y-0"
                          >
                            {addingId === meal.id ? "Adding..." : "+ Quick Add"}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 lg:p-4">
                        <h4 className="font-black text-gray-900 text-xs lg:text-base mb-0.5 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {meal.name}
                        </h4>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2 hidden lg:block leading-relaxed">
                          {meal.description}
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-amber-600 font-black text-sm lg:text-lg">
                            ₦{meal.price.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => addToCart(e, meal)}
                            disabled={addingId === meal.id}
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl w-7 h-7 lg:w-9 lg:h-9 flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-md shadow-amber-100 shrink-0"
                          >
                            {addingId === meal.id ? (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>

      {/* Back to top */}
      <BackToTop />

      <Footer />
    </div>
  );
}

function BackToTop() {
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
