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
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";

const PROTEINS = [
  { label: "Fried Chicken", extra: 0, note: "Default" },
  { label: "Grilled Fish", extra: 500 },
  { label: "Beef", extra: 700 },
];

const SIDES = [
  { label: "Fried Plantain", extra: 700 },
  { label: "Coleslaw", extra: 500 },
  { label: "Extra Pepper Sauce", extra: 300 },
];

export default function MealDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState(0);
  const [selectedSides, setSelectedSides] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMeal();
    if (user) fetchCartCount();
  }, [user]);

  const fetchMeal = async () => {
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("id", id)
      .single();
    setMeal(data);
    setLoading(false);
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
    const proteinExtra = PROTEINS[selectedProtein].extra;
    const sidesExtra = selectedSides.reduce((sum, label) => {
      const side = SIDES.find((s) => s.label === label);
      return sum + (side?.extra || 0);
    }, 0);
    return proteinExtra + sidesExtra;
  };

  const totalPrice = meal ? (meal.price + extrasTotal()) * quantity : 0;

  const addToCart = async () => {
    if (!user) return toast.error("Please sign in to add items to cart");
    setAdding(true);

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

    setAdding(false);
    toast.success(`${meal.name} added to cart!`);
    fetchCartCount();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading meal details...</p>
        </div>
      </div>
    );

  if (!meal)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Meal not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Navbar cartCount={cartCount} />

      {/* Split layout */}
      <div className="flex flex-1">
        {/* Left — Sticky meal image */}
        <div className="hidden lg:block lg:w-1/2 sticky top-16 h-[calc(100vh-64px)]">
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Category badge on image */}
          <div className="absolute top-6 left-6">
            <span className="bg-white/90 backdrop-blur-sm text-amber-700 font-semibold text-sm px-4 py-1.5 rounded-full shadow-sm">
              {meal.category}
            </span>
          </div>
        </div>

        {/* Right — Scrollable details */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 lg:px-8 pt-6 lg:pt-8 pb-36">
            {/* Top row — close button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => navigate(-1)}
                className="group bg-gray-100 hover:bg-gray-900 text-gray-600 hover:text-white rounded-xl w-9 h-9 flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
              {meal.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-amber-500">
                ₦{meal.price.toLocaleString()}
              </span>
              {extrasTotal() > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  base price
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              {meal.description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5" /> Mildly spicy
              </span>
              <span className="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Leaf className="w-3.5 h-3.5" /> Vegetarian option
              </span>
              <button className="flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-amber-100 transition">
                <AlertCircle className="w-3.5 h-3.5" /> View Allergies
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mb-8" />

            {/* Choose Protein */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Choose Your Protein
                </h3>
                <span className="text-xs font-semibold text-white bg-amber-500 px-2.5 py-1 rounded-full">
                  Required
                </span>
              </div>
              <div className="space-y-3">
                {PROTEINS.map((p, i) => (
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

            {/* Extra Sides */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Extra Sides</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  Optional
                </span>
              </div>
              <div className="space-y-3">
                {SIDES.map((s) => {
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
                        +₦{s.extra.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Special Instructions
              </h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g. no onion, extra spicy, no pepper sauce..."
                rows={4}
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white resize-none text-sm transition-all placeholder-gray-300"
              />
            </div>
          </div>

          {/* Fixed bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-0 lg:left-1/2 lg:w-1/2 bg-white border-t border-gray-100 px-5 lg:px-8 py-4 lg:py-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-50">
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-5 bg-gray-100 rounded-2xl px-4 py-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-gray-500 hover:text-amber-600 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-gray-900 font-bold text-base w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-gray-500 hover:text-amber-600 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={addToCart}
                disabled={adding}
                className="flex-1 flex items-center justify-between bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-3 px-3 rounded-2xl transition-all duration-150 disabled:opacity-60 shadow-lg shadow-amber-200"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>{adding ? "Adding..." : "Add to Cart"}</span>
                </div>
                <span className="text-white/90 font-black text-lg">
                  ₦{totalPrice.toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
