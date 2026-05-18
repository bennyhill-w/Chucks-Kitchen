import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
  Tag,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState("delivery");
  const [promoCode, setPromoCode] = useState("");
  const [restaurantNote, setRestaurantNote] = useState("");

  useEffect(() => {
    if (user) fetchCart();
    else setLoading(false);
  }, [user]);

  const fetchCart = async () => {
    const { data } = await supabase
      .from("cart_items")
      .select("*, meals(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setCartItems(data || []);
    setLoading(false);
  };

  const updateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    setUpdatingId(item.id);
    if (newQty < 1) {
      await removeItem(item);
      return;
    }
    await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", item.id);
    setCartItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i)),
    );
    setUpdatingId(null);
  };

  const removeItem = async (item) => {
    setUpdatingId(item.id);
    await supabase.from("cart_items").delete().eq("id", item.id);
    setCartItems((prev) => prev.filter((i) => i.id !== item.id));
    setUpdatingId(null);
    toast.success("Item removed from cart");
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.meals.price * item.quantity,
    0,
  );
  const deliveryFee = deliveryMode === "pickup" ? 0 : 500;
  const serviceFee = 200;
  const total = subtotal + deliveryFee + serviceFee;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your cart...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Navbar cartCount={cartItems.length} />

      <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-8 lg:py-12 flex-1">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
              Your Cart
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {cartItems.length === 0
                ? "No items yet"
                : `${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your cart`}
            </p>
          </div>
          {cartItems.length > 0 && (
            <Link
              to="/menu"
              className="flex items-center gap-2 text-amber-500 hover:text-amber-600 font-semibold text-xs lg:text-sm border-2 border-amber-200 hover:border-amber-400 px-3 lg:px-4 py-2 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add more
            </Link>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm">
            <div className="relative mb-8">
              <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-14 h-14 text-amber-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-black">0</span>
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-400 text-base mb-10 text-center max-w-xs">
              Looks like you haven't added anything yet. Explore our menu and
              find something delicious!
            </p>
            <Link
              to="/menu"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-4 rounded-2xl transition shadow-lg shadow-amber-100 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Left — Cart Items */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    <div
                      className={`flex items-center gap-3 px-4 py-4 transition-all duration-200 ${updatingId === item.id ? "opacity-50" : "opacity-100"}`}
                    >
                      {/* Image */}
                      <div
                        onClick={() => navigate(`/meal/${item.meal_id}`)}
                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl overflow-hidden shrink-0 cursor-pointer"
                      >
                        <img
                          src={item.meals.image_url}
                          alt={item.meals.name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </div>

                      {/* Name, price, controls */}
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => navigate(`/meal/${item.meal_id}`)}
                          className="font-bold text-gray-900 text-sm lg:text-base truncate cursor-pointer hover:text-amber-600 transition"
                        >
                          {item.meals.name}
                        </h4>
                        <p className="text-gray-400 text-xs mt-0.5 hidden lg:block">
                          {item.meals.category}
                        </p>
                        <p className="text-amber-500 font-bold text-xs mt-0.5">
                          ₦{item.meals.price.toLocaleString()} each
                        </p>

                        {/* Mobile: quantity + total inline */}
                        <div className="flex items-center gap-2 mt-2 lg:hidden">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            disabled={updatingId === item.id}
                            className="w-7 h-7 bg-gray-100 hover:bg-amber-100 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-gray-900 text-sm w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            disabled={updatingId === item.id}
                            className="w-7 h-7 bg-gray-100 hover:bg-amber-100 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-amber-500 font-black text-sm ml-1">
                            ₦
                            {(
                              item.meals.price * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Desktop: quantity controls */}
                      <div className="hidden lg:flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQuantity(item, -1)}
                          disabled={updatingId === item.id}
                          className="w-8 h-8 bg-gray-100 hover:bg-amber-100 hover:text-amber-600 rounded-xl flex items-center justify-center transition disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-gray-900 font-black text-lg w-7 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item, 1)}
                          disabled={updatingId === item.id}
                          className="w-8 h-8 bg-gray-100 hover:bg-amber-100 hover:text-amber-600 rounded-xl flex items-center justify-center transition disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Desktop: line total */}
                      <div className="hidden lg:block text-amber-500 font-black text-lg w-24 text-right shrink-0">
                        ₦{(item.meals.price * item.quantity).toLocaleString()}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item)}
                        disabled={updatingId === item.id}
                        className="w-8 h-8 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-xl flex items-center justify-center transition shrink-0 disabled:opacity-40"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {index < cartItems.length - 1 && (
                      <div className="h-px bg-gray-50 mx-4 lg:mx-6" />
                    )}
                  </div>
                ))}

                {/* Add more */}
                <div className="px-4 lg:px-6 py-4 border-t border-gray-50">
                  <Link
                    to="/menu"
                    className="flex items-center gap-2 text-amber-500 hover:text-amber-600 font-semibold text-sm transition w-fit"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    Add more items from Chuks Kitchen
                  </Link>
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:w-96 shrink-0 w-full">
              <div className="bg-white rounded-3xl shadow-sm p-5 lg:p-6 sticky top-24">
                <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-1">
                  Order Summary
                </h3>
                <p className="text-gray-400 text-xs lg:text-sm mb-5">
                  Review your order before checkout
                </p>

                {/* Delivery / Pickup toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
                  <button
                    onClick={() => setDeliveryMode("delivery")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      deliveryMode === "delivery"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-100"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    🛵 Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryMode("pickup")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      deliveryMode === "pickup"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-100"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    🏃 Pick up
                  </button>
                </div>

                {/* Promo code */}
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-500" />
                    Add a Promo Code
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code here"
                      className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition placeholder-gray-300"
                    />
                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 rounded-xl transition shadow-md shadow-amber-100">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({cartItems.length} item
                      {cartItems.length > 1 ? "s" : ""})
                    </span>
                    <span className="font-semibold text-gray-700">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryMode === "pickup" ? (
                        <span className="text-green-500 font-bold">Free</span>
                      ) : (
                        <span className="text-gray-700">
                          ₦{deliveryFee.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service Fee</span>
                    <span className="font-semibold text-gray-700">
                      ₦{serviceFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-semibold text-gray-700">₦0</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-900 text-base">
                      Total
                    </span>
                    <span className="font-black text-amber-500 text-xl lg:text-2xl">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions for Restaurant
                  </p>
                  <textarea
                    value={restaurantNote}
                    onChange={(e) => setRestaurantNote(e.target.value)}
                    placeholder="E.g no onion, extra spicy, no pepper sauce..."
                    rows={3}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white resize-none transition placeholder-gray-300"
                  />
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full flex items-center justify-between bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 px-5 lg:px-6 rounded-2xl transition-all shadow-lg shadow-amber-100"
                >
                  <span className="text-sm lg:text-base">
                    Proceed to Checkout
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm lg:text-base">
                      ₦{total.toLocaleString()}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  🔒 Secure checkout · Free cancellation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
