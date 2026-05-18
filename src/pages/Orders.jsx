import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShoppingBag,
  Flame,
  Truck,
  MapPin,
  CreditCard,
  RotateCcw,
  HelpCircle,
  TrendingUp,
  Filter,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    barColor: "bg-yellow-400",
    icon: <Clock className="w-4 h-4" />,
    step: 0,
  },
  preparing: {
    label: "Preparing",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    barColor: "bg-orange-400",
    icon: <Flame className="w-4 h-4" />,
    step: 1,
  },
  on_the_way: {
    label: "On the way",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    barColor: "bg-blue-400",
    icon: <Truck className="w-4 h-4" />,
    step: 2,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    barColor: "bg-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
    step: 3,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    barColor: "bg-red-400",
    icon: <XCircle className="w-4 h-4" />,
    step: -1,
  },
};

const DELIVERY_STEPS = [
  { label: "Confirmed", icon: <CheckCircle2 className="w-4 h-4" /> },
  { label: "Preparing", icon: <Flame className="w-4 h-4" /> },
  { label: "On the way", icon: <Truck className="w-4 h-4" /> },
  { label: "Delivered", icon: <Package className="w-4 h-4" /> },
];

const FILTERS = [
  { key: "all", label: "All Orders", icon: <Package className="w-4 h-4" /> },
  { key: "active", label: "Active", icon: <Flame className="w-4 h-4" /> },
  {
    key: "completed",
    label: "Completed",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: <XCircle className="w-4 h-4" />,
  },
];

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchOrders();
      const channel = supabase
        .channel("orders-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === payload.new.id ? { ...o, ...payload.new } : o,
              ),
            );
            if (selected?.id === payload.new.id) {
              setSelected((prev) => ({ ...prev, ...payload.new }));
            }
          },
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const fetchOrderItems = async (orderId) => {
    setLoadingItems(true);
    const { data } = await supabase
      .from("order_items")
      .select("*, meals(*)")
      .eq("order_id", orderId);
    setOrderItems(data || []);
    setLoadingItems(false);
  };

  const openOrder = (order) => {
    setSelected(order);
    fetchOrderItems(order.id);
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active")
      return ["pending", "preparing", "on_the_way"].includes(o.status);
    if (filter === "completed") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalSpent = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your orders...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal { animation: fadeUp 0.5s ease forwards; }
        .stagger-1 { animation-delay: 0.05s; opacity: 0; }
        .stagger-2 { animation-delay: 0.1s; opacity: 0; }
        .stagger-3 { animation-delay: 0.15s; opacity: 0; }
        .stagger-4 { animation-delay: 0.2s; opacity: 0; }
        .stagger-5 { animation-delay: 0.25s; opacity: 0; }
      `}</style>

      <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-8 lg:py-12 flex-1">
        {/* Header */}
        <div className="mb-8 reveal stagger-1">
          <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track and manage all your orders
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: <Package className="w-5 h-5" />,
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
            {
              label: "Active",
              value: orders.filter((o) =>
                ["pending", "preparing", "on_the_way"].includes(o.status),
              ).length,
              icon: <Flame className="w-5 h-5" />,
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
            {
              label: "Total Spent",
              value: `₦${totalSpent.toLocaleString()}`,
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-green-500",
              bg: "bg-green-50",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm reveal stagger-${i + 2}`}
            >
              <div
                className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} mb-3`}
              >
                {stat.icon}
              </div>
              <p className="text-xl lg:text-2xl font-black text-gray-900">
                {stat.value}
              </p>
              <p className="text-gray-400 text-xs font-medium mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                filter === f.key
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10 text-amber-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              No orders found
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              {filter === "all"
                ? "You haven't placed any orders yet."
                : `No ${filter} orders.`}
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-lg shadow-amber-100"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Orders list */}
            <div className="flex-1 w-full space-y-3">
              {filteredOrders.map((order, index) => {
                const config =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const isSelected = selected?.id === order.id;
                const progressWidth =
                  config.step >= 0 ? `${(config.step / 3) * 100}%` : "0%";

                return (
                  <div
                    key={order.id}
                    onClick={() => openOrder(order)}
                    className={`bg-white rounded-2xl lg:rounded-3xl shadow-sm p-5 lg:p-6 cursor-pointer transition-all duration-200 border-2 reveal stagger-${Math.min(index + 1, 5)} ${
                      isSelected
                        ? "border-amber-400 shadow-lg shadow-amber-50"
                        : "border-transparent hover:border-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {/* Left info */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.bg}`}
                        >
                          <span className={config.color}>{config.icon}</span>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-base">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {formatDate(order.created_at)}
                          </p>
                          <p className="text-amber-600 font-black text-sm mt-1">
                            ₦{order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Status + chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${config.color} ${config.bg} ${config.border}`}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isSelected ? "bg-amber-500 text-white rotate-90" : "bg-gray-100 text-gray-400"}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for active orders */}
                    {["pending", "preparing", "on_the_way"].includes(
                      order.status,
                    ) && (
                      <div className="mt-2">
                        {/* Steps */}
                        <div className="relative flex items-center justify-between mb-1">
                          <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-gray-100 z-0">
                            <div
                              className={`h-full ${config.barColor} transition-all duration-700`}
                              style={{ width: progressWidth }}
                            />
                          </div>
                          {DELIVERY_STEPS.map((s, i) => (
                            <div
                              key={s.label}
                              className="flex flex-col items-center gap-1.5 z-10"
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm transition-all duration-300 ${
                                  i <= config.step
                                    ? `${config.barColor} text-white`
                                    : "bg-white border-2 border-gray-200 text-gray-400"
                                }`}
                              >
                                {s.icon}
                              </div>
                              <span
                                className={`text-xs font-semibold hidden sm:block ${i <= config.step ? config.color : "text-gray-300"}`}
                              >
                                {s.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivered tag */}
                    {order.status === "delivered" && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-bold text-xs">
                          Delivered successfully
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/menu");
                          }}
                          className="ml-auto flex items-center gap-1 text-amber-500 text-xs font-bold hover:underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reorder
                        </button>
                      </div>
                    )}

                    {/* Cancelled tag */}
                    {order.status === "cancelled" && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-500 font-bold text-xs">
                          Order was cancelled
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order detail panel */}
            {selected && (
              <div className="lg:w-80 shrink-0 w-full">
                <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
                  {/* Status */}
                  {(() => {
                    const config =
                      STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending;
                    return (
                      <div
                        className={`flex items-center gap-3 ${config.bg} border ${config.border} rounded-2xl px-4 py-3.5 mb-6`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.color} bg-white shadow-sm`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <p className={`font-black text-sm ${config.color}`}>
                            {config.label}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {selected.status === "pending"
                              ? "Waiting for restaurant"
                              : selected.status === "preparing"
                                ? "Kitchen is cooking your food"
                                : selected.status === "on_the_way"
                                  ? "Rider is heading your way"
                                  : selected.status === "delivered"
                                    ? "Enjoy your meal!"
                                    : "Order was cancelled"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Order info */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Order Details
                    </p>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" /> Order ID
                        </span>
                        <span className="font-black text-gray-800 text-xs">
                          #{selected.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Date
                        </span>
                        <span className="font-semibold text-gray-700 text-xs">
                          {formatDate(selected.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Payment
                        </span>
                        <span className="font-semibold text-gray-700 capitalize">
                          {selected.payment_method || "Card"}
                        </span>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div className="flex justify-between items-center">
                        <span className="font-black text-gray-900">Total</span>
                        <span className="font-black text-amber-500 text-lg">
                          ₦{selected.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-5">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Items Ordered
                    </p>
                    {loadingItems ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 group"
                          >
                            <img
                              src={item.meals?.image_url}
                              alt={item.meals?.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">
                                {item.meals?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                x{item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-black text-amber-600 shrink-0">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delivery address */}
                  {selected.delivery_address && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Delivery Address
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        {selected.delivery_address}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2.5">
                    {selected.status === "delivered" && (
                      <button
                        onClick={() => navigate("/menu")}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-100"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reorder
                      </button>
                    )}
                    <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-3 rounded-2xl transition text-sm">
                      <HelpCircle className="w-4 h-4" />
                      Need help with this order?
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
