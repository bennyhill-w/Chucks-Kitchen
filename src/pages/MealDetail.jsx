import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  X,
  Flame,
  Leaf,
  AlertCircle,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Star,
  Clock,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";

// Category-specific protein options
const PROTEIN_OPTIONS = {
  "Jollof Delights": [
    { label: "Fried Chicken", extra: 0, note: "Default" },
    { label: "Grilled Fish", extra: 500 },
    { label: "Beef", extra: 700 },
    { label: "Turkey", extra: 800 },
  ],
  "Jollof Rice & Entrees": [
    { label: "Fried Chicken", extra: 0, note: "Default" },
    { label: "Grilled Fish", extra: 500 },
    { label: "Beef", extra: 700 },
    { label: "Turkey", extra: 800 },
  ],
  "Swallow & Soups": [
    { label: "Assorted Meat", extra: 0, note: "Default" },
    { label: "Goat Meat", extra: 500 },
    { label: "Smoked Fish", extra: 400 },
    { label: "Stockfish", extra: 300 },
  ],
  Soups: [
    { label: "Assorted Meat", extra: 0, note: "Default" },
    { label: "Goat Meat", extra: 500 },
    { label: "Smoked Fish", extra: 400 },
    { label: "Chicken", extra: 600 },
  ],
  "Grills & BBQ": [
    { label: "Beef Suya", extra: 0, note: "Default" },
    { label: "Chicken Suya", extra: 300 },
    { label: "Gizzard", extra: 200 },
    { label: "Fish", extra: 500 },
  ],
  "Grills & sides": [
    { label: "Chicken", extra: 0, note: "Default" },
    { label: "Beef", extra: 300 },
    { label: "Fish", extra: 400 },
  ],
  Popular: [
    { label: "Fried Chicken", extra: 0, note: "Default" },
    { label: "Grilled Fish", extra: 500 },
    { label: "Beef", extra: 700 },
  ],
};

// Category-specific sides
const SIDES_OPTIONS = {
  "Jollof Delights": [
    { label: "Fried Plantain", extra: 700 },
    { label: "Coleslaw", extra: 500 },
    { label: "Extra Pepper Sauce", extra: 300 },
    { label: "Moi Moi", extra: 400 },
  ],
  "Jollof Rice & Entrees": [
    { label: "Fried Plantain", extra: 700 },
    { label: "Coleslaw", extra: 500 },
    { label: "Extra Pepper Sauce", extra: 300 },
    { label: "Moi Moi", extra: 400 },
  ],
  "Swallow & Soups": [
    { label: "Extra Soup", extra: 500 },
    { label: "Extra Swallow", extra: 400 },
    { label: "Extra Meat", extra: 600 },
  ],
  Soups: [
    { label: "Eba", extra: 300 },
    { label: "Fufu", extra: 300 },
    { label: "Pounded Yam", extra: 500 },
    { label: "Amala", extra: 300 },
  ],
  "Grills & BBQ": [
    { label: "Suya Spice", extra: 0 },
    { label: "Extra Onions & Tomatoes", extra: 200 },
    { label: "Fried Plantain", extra: 500 },
  ],
  "Grills & sides": [
    { label: "Chips", extra: 500 },
    { label: "Coleslaw", extra: 400 },
    { label: "Pepper Sauce", extra: 300 },
  ],
  Popular: [
    { label: "Fried Plantain", extra: 700 },
    { label: "Coleslaw", extra: 500 },
    { label: "Extra Pepper Sauce", extra: 300 },
  ],
};

// Categories that don't need protein/sides
const NO_PROTEIN_CATEGORIES = ["Beverages", "Desserts", "Sweet Treats"];

// Category-specific tags
const CATEGORY_TAGS = {
  "Jollof Delights": [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Mildly spicy",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Leaf className="w-3.5 h-3.5" />,
      label: "Vegetarian option",
      color: "bg-green-50 text-green-600",
    },
  ],
  "Jollof Rice & Entrees": [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Mildly spicy",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Leaf className="w-3.5 h-3.5" />,
      label: "Vegetarian option",
      color: "bg-green-50 text-green-600",
    },
  ],
  "Swallow & Soups": [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Spicy",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Made fresh daily",
      color: "bg-blue-50 text-blue-600",
    },
  ],
  Soups: [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Spicy",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Made fresh daily",
      color: "bg-blue-50 text-blue-600",
    },
  ],
  "Grills & BBQ": [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Charcoal grilled",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Star className="w-3.5 h-3.5" />,
      label: "Street classic",
      color: "bg-amber-50 text-amber-600",
    },
  ],
  "Grills & sides": [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Charcoal grilled",
      color: "bg-orange-50 text-orange-600",
    },
  ],
  Beverages: [
    {
      icon: <Leaf className="w-3.5 h-3.5" />,
      label: "Natural ingredients",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <Star className="w-3.5 h-3.5" />,
      label: "Freshly made",
      color: "bg-amber-50 text-amber-600",
    },
  ],
  Desserts: [
    {
      icon: <Star className="w-3.5 h-3.5" />,
      label: "Freshly made",
      color: "bg-amber-50 text-amber-600",
    },
  ],
  "Sweet Treats": [
    {
      icon: <Star className="w-3.5 h-3.5" />,
      label: "Freshly made",
      color: "bg-amber-50 text-amber-600",
    },
  ],
  Popular: [
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      label: "Mildly spicy",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Star className="w-3.5 h-3.5" />,
      label: "Best seller",
      color: "bg-amber-50 text-amber-600",
    },
  ],
};

export default function MealDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [relatedMeals, setRelatedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState(0);
  const [selectedSides, setSelectedSides] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [adding, setAdding] = useState(false);

  const proteins = meal
    ? PROTEIN_OPTIONS[meal.category] || PROTEIN_OPTIONS["Popular"]
    : [];
  const sides = meal ? SIDES_OPTIONS[meal.category] || [] : [];
  const tags = meal ? CATEGORY_TAGS[meal.category] || [] : [];
  const showCustomization = meal
    ? !NO_PROTEIN_CATEGORIES.includes(meal.category)
    : false;

  useEffect(() => {
    fetchMeal();
    if (user) fetchCartCount();
  }, [id, user]);

  // Realtime cart
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("cart-changes-detail")
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
  }, [user]);

  const fetchMeal = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("id", id)
      .single();
    setMeal(data);

    // Fetch related meals from same category
    if (data) {
      const { data: related } = await supabase
        .from("meals")
        .select("*")
        .eq("available", true)
        .eq("category", data.category)
        .neq("id", id)
        .limit(3);
      setRelatedMeals(related || []);
    }
    setLoading(false);
    // Reset customization when meal changes
    setSelectedProtein(0);
    setSelectedSides([]);
    setInstructions("");
    setQuantity(1);
  };

  const fetchCartCount = async () => {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setCartCount(count || 0);
  };

  const toggleSide = (label) => {
    setSelectedSides((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  };

  const extrasTotal = () => {
    if (!showCustomization) return 0;
    const proteinExtra = proteins[selectedProtein]?.extra || 0;
    const sidesExtra = selectedSides.reduce((sum, label) => {
      const side = sides.find((s) => s.label === label);
      return sum + (side?.extra || 0);
    }, 0);
    return proteinExtra + sidesExtra;
  };

  const totalPrice = meal ? (meal.price + extrasTotal()) * quantity : 0;

  const addToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      setTimeout(() => navigate("/signin"), 1500);
      return;
    }
    setAdding(true);
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
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ user_id: user.id, meal_id: meal.id, quantity });
      }
      toast.success(`${meal.name} added to cart!`);
      fetchCartCount();
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  // Loading skeleton
  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden lg:block lg:w-1/2 bg-gray-200 animate-pulse" />
          <div className="w-full lg:w-1/2 p-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded-full w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-full w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse" />
            <div className="space-y-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  if (!meal)
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Meal not found
            </h3>
            <button
              onClick={() => navigate("/menu")}
              className="bg-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-600 transition mt-4"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-right" />
      <Navbar cartCount={cartCount} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal { animation: fadeUp 0.5s ease forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      {/* Split layout */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left — Sticky meal image */}
        <div className="w-full h-64 lg:h-auto lg:w-1/2 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] relative overflow-hidden">
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80";
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-xl shadow-lg transition-all hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Category badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
              {meal.category}
            </span>
          </div>

          {/* Price on image — mobile only */}
          <div className="absolute bottom-4 left-4 lg:hidden">
            <span className="text-3xl font-black text-white drop-shadow-lg">
              ₦{meal.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right — Scrollable details */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col lg:max-h-[calc(100vh-64px)] lg:sticky lg:top-16 lg:overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 lg:px-8 pt-6 lg:pt-8 pb-6">
            {/* Name & Price */}
            <div className="reveal stagger-1 mb-4">
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-2">
                {meal.name}
              </h1>
              <div className="hidden lg:flex items-baseline gap-3">
                <span className="text-3xl font-black text-amber-500">
                  ₦{meal.price.toLocaleString()}
                </span>
                {extrasTotal() > 0 && (
                  <span className="text-sm text-gray-400">
                    + ₦{extrasTotal().toLocaleString()} extras
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-500 text-base leading-relaxed mb-5 reveal stagger-1">
              {meal.description}
            </p>

            {/* Tags — category specific */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap reveal stagger-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${tag.color}`}
                  >
                    {tag.icon}
                    {tag.label}
                  </span>
                ))}
                <button className="flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gray-100 transition">
                  <AlertCircle className="w-3.5 h-3.5" />
                  View Allergies
                </button>
              </div>
            )}

            <div className="h-px bg-gray-100 mb-6" />

            {/* Customization — only for applicable categories */}
            {showCustomization && (
              <>
                {/* Choose Protein */}
                {proteins.length > 0 && (
                  <div className="mb-7 reveal stagger-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-gray-900">
                        Choose Your Protein
                      </h3>
                      <span className="text-xs font-bold text-white bg-amber-500 px-2.5 py-1 rounded-full">
                        Required
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {proteins.map((p, i) => (
                        <button
                          key={p.label}
                          onClick={() => setSelectedProtein(i)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${
                            selectedProtein === i
                              ? "border-amber-500 bg-amber-50"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedProtein === i
                                  ? "border-amber-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedProtein === i && (
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <span
                              className={`font-semibold text-sm ${selectedProtein === i ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {p.label}
                            </span>
                          </div>
                          <span
                            className={`text-sm font-semibold ${selectedProtein === i ? "text-amber-600" : "text-gray-400"}`}
                          >
                            {p.extra === 0 ? (
                              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                                Default
                              </span>
                            ) : (
                              `+₦${p.extra.toLocaleString()}`
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Sides */}
                {sides.length > 0 && (
                  <div className="mb-7 reveal stagger-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-gray-900">
                        Extra Sides
                      </h3>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        Optional
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {sides.map((s) => {
                        const selected = selectedSides.includes(s.label);
                        return (
                          <button
                            key={s.label}
                            onClick={() => toggleSide(s.label)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${
                              selected
                                ? "border-amber-500 bg-amber-50"
                                : "border-gray-100 bg-gray-50 hover:border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  selected
                                    ? "border-amber-500 bg-amber-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {selected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={`font-semibold text-sm ${selected ? "text-gray-900" : "text-gray-600"}`}
                              >
                                {s.label}
                              </span>
                            </div>
                            <span
                              className={`text-sm font-semibold ${selected ? "text-amber-600" : "text-gray-400"}`}
                            >
                              {s.extra === 0
                                ? "Free"
                                : `+₦${s.extra.toLocaleString()}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Special Instructions */}
            <div className="mb-6 reveal stagger-3">
              <h3 className="text-lg font-black text-gray-900 mb-3">
                Special Instructions
              </h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={
                  NO_PROTEIN_CATEGORIES.includes(meal.category)
                    ? "Any special requests? E.g. extra cold, no ice..."
                    : "E.g. no onion, extra spicy, no pepper sauce..."
                }
                rows={3}
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white resize-none transition text-sm placeholder-gray-300"
              />
            </div>

            {/* Related meals */}
            {relatedMeals.length > 0 && (
              <div className="reveal stagger-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-gray-900">
                    You Might Also Like
                  </h3>
                  <button
                    onClick={() =>
                      navigate(
                        `/menu?category=${encodeURIComponent(meal.category)}`,
                      )
                    }
                    className="flex items-center gap-1 text-amber-500 text-sm font-bold hover:underline group"
                  >
                    See all{" "}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {relatedMeals.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => navigate(`/meal/${related.id}`)}
                      className="group cursor-pointer bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="h-20 overflow-hidden">
                        <img
                          src={related.image_url}
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400";
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-gray-900 text-xs line-clamp-1">
                          {related.name}
                        </p>
                        <p className="text-amber-500 font-black text-xs mt-0.5">
                          ₦{related.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixed bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:sticky lg:bottom-0 bg-white border-t border-gray-100 px-5 lg:px-8 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-50">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5 shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-gray-500 hover:text-amber-600 transition w-5 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-gray-900 font-black text-base w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-gray-500 hover:text-amber-600 transition w-5 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={addToCart}
                disabled={adding}
                className="flex-1 flex items-center justify-between bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-3.5 px-5 rounded-2xl transition-all shadow-lg shadow-amber-100 disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  {adding ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  <span className="text-sm lg:text-base">
                    {adding ? "Adding..." : "Add to Cart"}
                  </span>
                </div>
                <span className="font-black text-base lg:text-lg">
                  ₦{totalPrice.toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
