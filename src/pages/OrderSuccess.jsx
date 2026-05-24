import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  Receipt,
  HelpCircle,
  Home,
  ArrowRight,
  ShoppingBag,
  Flame,
  Truck,
  Gift,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const orderId = state?.orderId;
  const total = state?.total || 0;
  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : null;

  useEffect(() => {
    // If no order data redirect to home
    if (!orderId) {
      navigate("/home", { replace: true });
      return;
    }
    const t1 = setTimeout(() => setLoading(false), 2500);
    const t2 = setTimeout(() => setShowContent(true), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [orderId, navigate]);

  // While redirecting show nothing
  if (!orderId) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {/* LOADER */}
        {loading && (
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
              <div
                className="absolute inset-3 rounded-full border-4 border-transparent border-t-amber-300 animate-spin"
                style={{
                  animationDuration: "0.8s",
                  animationDirection: "reverse",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200 animate-bounce">
                  <ShoppingBag className="w-5 h-5 text-white" />
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
            <div className="flex flex-col gap-3 w-72">
              {[
                { label: "Verifying payment", delay: 0 },
                { label: "Confirming order", delay: 800 },
                { label: "Notifying restaurant", delay: 1600 },
              ].map((step) => (
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
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {/* Green top band */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-8 pt-10 pb-16 text-center relative">
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />
                <div className="relative mb-4 inline-block">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto">
                    <CheckCircle2
                      className="w-12 h-12 text-green-500"
                      strokeWidth={2}
                    />
                  </div>
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
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs">
                      <Flame className="w-3.5 h-3.5" /> Preparing
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
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0">
                      <div className="h-full bg-amber-400 w-1/4 transition-all duration-1000" />
                    </div>
                    {[
                      {
                        label: "Confirmed",
                        icon: <CheckCircle2 className="w-4 h-4 text-grey" />,
                        done: true,
                      },
                      {
                        label: "Preparing",
                        icon: <Flame className="w-4 h-4 text-grey" />,
                        done: false,
                      },
                      {
                        label: "On the way",
                        icon: <Truck className="w-4 h-4 text-grey" />,
                        done: false,
                      },
                      {
                        label: "Delivered",
                        icon: <Gift className="w-4 h-4 text-grey" />,
                        done: false,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col items-center gap-2 z-10"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${s.done ? "bg-amber-500" : "bg-white border-2 border-gray-200"}`}
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

                {/* Actions */}
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
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-green-500" : active ? "bg-amber-500 animate-pulse" : "bg-gray-200"}`}
      >
        {done ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        ) : active ? (
          <div className="w-2 h-2 bg-white rounded-full" />
        ) : null}
      </div>
      <span
        className={`text-sm font-semibold transition-colors duration-300 ${done ? "text-green-600" : active ? "text-amber-600" : "text-gray-300"}`}
      >
        {label}
      </span>
      {done && (
        <span className="text-green-500 text-xs font-bold ml-auto">Done ✓</span>
      )}
    </div>
  );
}
