import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Receipt,
  HelpCircle,
  Home,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const orderId = state?.orderId || "N/A";
  const total = state?.total || 0;
  const shortId = orderId !== "N/A" ? orderId.slice(0, 8).toUpperCase() : "N/A";

  useEffect(() => {
    // Show loader for 2.5s then transition to success
    const t1 = setTimeout(() => setLoading(false), 2500);
    const t2 = setTimeout(() => setShowContent(true), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {/* LOADER */}
        {loading && (
          <div className="flex flex-col items-center gap-8 animate-pulse-slow">
            {/* Animated logo loader */}
            <div className="relative w-32 h-32">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
              {/* Middle ring */}
              <div
                className="absolute inset-3 rounded-full border-4 border-transparent border-t-amber-300 animate-spin"
                style={{
                  animationDuration: "0.8s",
                  animationDirection: "reverse",
                }}
              />
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200 animate-bounce">
                  <span className="text-white text-lg">🍽️</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                Processing your order
              </h2>
              <p className="text-gray-400 text-base">
                Please wait while we confirm your payment...
              </p>
            </div>

            {/* Loading steps */}
            <div className="flex flex-col gap-3 w-72">
              {[
                { label: "Verifying payment", delay: 0 },
                { label: "Confirming order", delay: 800 },
                { label: "Notifying restaurant", delay: 1600 },
              ].map((step, i) => (
                <LoadingStep
                  key={step.label}
                  label={step.label}
                  delay={step.delay}
                />
              ))}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {!loading && showContent && (
          <div
            className={`w-full max-w-lg transition-all duration-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Success card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {/* Top green band */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-8 pt-10 pb-16 text-center relative">
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />

                {/* Check icon */}
                <div className="relative mb-4 inline-block">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto">
                    <CheckCircle2
                      className="w-12 h-12 text-green-500"
                      strokeWidth={2}
                    />
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" />
                </div>

                <h2 className="text-2xl font-black text-white mb-1">
                  Order Placed Successfully!
                </h2>
                <p className="text-green-100 text-base">
                  Your delicious Chuks Kitchen meal is on its way!
                </p>
              </div>

              {/* Body */}
              <div className="px-8 pb-8">
                {/* Order ID badge */}
                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                    Order Confirmed
                  </p>
                  <p className="text-xl font-black text-gray-900 tracking-wide">
                    #{shortId}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Keep this for your reference
                  </p>
                </div>

                {/* Order details */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>Status</span>
                    </div>
                    <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs">
                      🔥 Preparing
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <span>Total Paid</span>
                    </div>
                    <span className="font-black text-gray-900">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Estimated Delivery</span>
                    </div>
                    <span className="font-bold text-gray-700">
                      30 - 45 mins
                    </span>
                  </div>
                </div>

                {/* Delivery progress */}
                <div className="mb-8">
                  <p className="text-sm font-bold text-gray-700 mb-4">
                    Delivery Progress
                  </p>
                  <div className="flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0">
                      <div className="h-full bg-amber-400 w-1/4 transition-all duration-1000" />
                    </div>

                    {[
                      { label: "Confirmed", icon: "✅", done: true },
                      { label: "Preparing", icon: "🍳", done: false },
                      { label: "On the way", icon: "🛵", done: false },
                      { label: "Delivered", icon: "🎉", done: false },
                    ].map((s, i) => (
                      <div
                        key={s.label}
                        className="flex flex-col items-center gap-2 z-10"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${
                            s.done
                              ? "bg-amber-500"
                              : "bg-white border-2 border-gray-200"
                          }`}
                        >
                          {s.icon}
                        </div>
                        <span
                          className={`text-xs font-semibold ${s.done ? "text-amber-600" : "text-gray-400"}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full flex items-center justify-between bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-amber-100"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      <span>Track Order</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 px-6 rounded-2xl transition">
                    <Receipt className="w-4 h-4" />
                    Generate Receipt
                  </button>

                  <Link
                    to="/home"
                    className="w-full flex items-center justify-center gap-2 text-amber-500 hover:text-amber-600 font-semibold py-2 text-sm transition"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Link>
                </div>

                {/* Help */}
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <a
                    href="#"
                    className="flex items-center justify-center gap-1.5 text-amber-500 hover:text-amber-600 font-semibold text-sm transition"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Need help with your order?
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Loading step component with staggered animation
function LoadingStep({ label, delay }) {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setActive(true), delay);
    const t2 = setTimeout(() => setDone(true), delay + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [delay]);

  return (
    <div
      className={`flex items-center gap-3 transition-all duration-500 ${active ? "opacity-100" : "opacity-30"}`}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
          done
            ? "bg-green-500"
            : active
              ? "bg-amber-500 animate-pulse"
              : "bg-gray-200"
        }`}
      >
        {done ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        ) : active ? (
          <div className="w-2 h-2 bg-white rounded-full" />
        ) : null}
      </div>
      <span
        className={`text-sm font-semibold transition-colors duration-300 ${
          done ? "text-green-600" : active ? "text-amber-600" : "text-gray-300"
        }`}
      >
        {label}
      </span>
      {done && (
        <span className="text-green-500 text-xs font-bold ml-auto">Done ✓</span>
      )}
    </div>
  );
}
