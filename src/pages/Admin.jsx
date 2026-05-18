import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Clock,
  Flame,
  Truck,
  XCircle,
  ChevronDown,
  Menu,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const TABS = ["Dashboard", "Orders", "Meals"];

const STATUS_OPTIONS = [
  "pending",
  "preparing",
  "on_the_way",
  "delivered",
  "cancelled",
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  preparing: {
    label: "Preparing",
    color: "text-orange-600",
    bg: "bg-orange-50",
    icon: <Flame className="w-3.5 h-3.5" />,
  },
  on_the_way: {
    label: "On the way",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const CATEGORIES = [
  "Popular",
  "Jollof Rice & Entrees",
  "Swallow & Soups",
  "Grills & sides",
  "Beverages",
  "Desserts",
];
const EMPTY_MEAL = {
  name: "",
  description: "",
  price: "",
  category: "Popular",
  image_url: "",
  available: true,
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealForm, setMealForm] = useState(EMPTY_MEAL);
  const [saving, setSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (user) checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!data?.is_admin) {
      toast.error("Access denied");
      navigate("/home");
      return;
    }
    fetchAll();
  };

  const fetchAll = async () => {
    const [{ data: ordersData }, { data: mealsData }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("meals")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    setOrders(ordersData || []);
    setMeals(mealsData || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to update order");
      setUpdatingOrderId(null);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
    toast.success(`Order marked as ${status}`);
    setUpdatingOrderId(null);
  };

  const openAddMeal = () => {
    setEditingMeal(null);
    setMealForm(EMPTY_MEAL);
    setShowMealModal(true);
  };
  const openEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealForm({
      name: meal.name,
      description: meal.description || "",
      price: meal.price,
      category: meal.category,
      image_url: meal.image_url || "",
      available: meal.available,
    });
    setShowMealModal(true);
  };

  const saveMeal = async () => {
    if (!mealForm.name || !mealForm.price)
      return toast.error("Name and price are required");
    setSaving(true);
    const payload = { ...mealForm, price: parseFloat(mealForm.price) };
    if (editingMeal) {
      const { error } = await supabase
        .from("meals")
        .update(payload)
        .eq("id", editingMeal.id);
      if (error) {
        toast.error("Failed to update meal");
        setSaving(false);
        return;
      }
      setMeals((prev) =>
        prev.map((m) => (m.id === editingMeal.id ? { ...m, ...payload } : m)),
      );
      toast.success("Meal updated!");
    } else {
      const { data, error } = await supabase
        .from("meals")
        .insert(payload)
        .select()
        .single();
      if (error) {
        toast.error("Failed to add meal");
        setSaving(false);
        return;
      }
      setMeals((prev) => [data, ...prev]);
      toast.success("Meal added!");
    }
    setSaving(false);
    setShowMealModal(false);
  };

  const deleteMeal = async (meal) => {
    if (!confirm(`Delete "${meal.name}"?`)) return;
    const { error } = await supabase.from("meals").delete().eq("id", meal.id);
    if (error) return toast.error("Failed to delete meal");
    setMeals((prev) => prev.filter((m) => m.id !== meal.id));
    toast.success("Meal deleted");
  };

  const toggleAvailable = async (meal) => {
    await supabase
      .from("meals")
      .update({ available: !meal.available })
      .eq("id", meal.id);
    setMeals((prev) =>
      prev.map((m) =>
        m.id === meal.id ? { ...m, available: !m.available } : m,
      ),
    );
  };

  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) =>
    ["pending", "preparing", "on_the_way"].includes(o.status),
  ).length;

  const switchTab = (t) => {
    setTab(t);
    setSidebarOpen(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Mobile top bar */}
      <div className="lg:hidden bg-amber-900 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1
            className="text-lg font-black text-white"
            style={{ fontFamily: "cursive" }}
          >
            Chuks Kitchen
          </h1>
          <p className="text-amber-300 text-xs font-semibold">
            Admin Dashboard
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-1"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {sidebarOpen && (
        <div className="lg:hidden bg-amber-800 px-4 py-3 space-y-1 sticky top-16 z-30">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                tab === t
                  ? "bg-amber-500 text-white"
                  : "text-amber-200 hover:bg-amber-700"
              }`}
            >
              {t === "Dashboard" && <LayoutDashboard className="w-4 h-4" />}
              {t === "Orders" && <ShoppingBag className="w-4 h-4" />}
              {t === "Meals" && <UtensilsCrossed className="w-4 h-4" />}
              {t}
            </button>
          ))}
          <button
            onClick={() => navigate("/home")}
            className="w-full text-amber-300 text-sm font-semibold py-3 text-center hover:text-white transition"
          >
            ← Back to site
          </button>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-amber-900 min-h-screen flex-col fixed top-0 left-0 z-40">
          <div className="px-6 py-8 border-b border-amber-800">
            <h1
              className="text-2xl font-black text-white"
              style={{ fontFamily: "cursive" }}
            >
              Chuks Kitchen
            </h1>
            <p className="text-amber-300 text-xs mt-1 font-semibold">
              Admin Dashboard
            </p>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  tab === t
                    ? "bg-amber-500 text-white shadow-lg"
                    : "text-amber-200 hover:bg-amber-800 hover:text-white"
                }`}
              >
                {t === "Dashboard" && <LayoutDashboard className="w-5 h-5" />}
                {t === "Orders" && <ShoppingBag className="w-5 h-5" />}
                {t === "Meals" && <UtensilsCrossed className="w-5 h-5" />}
                {t}
              </button>
            ))}
          </nav>
          <div className="px-4 pb-6">
            <button
              onClick={() => navigate("/home")}
              className="w-full text-amber-300 hover:text-white text-sm font-semibold py-3 rounded-2xl hover:bg-amber-800 transition text-center"
            >
              ← Back to site
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="w-full lg:ml-64 p-4 lg:p-8">
          {/* DASHBOARD */}
          {tab === "Dashboard" && (
            <div>
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                  Dashboard
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Welcome back, here's what's happening today
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
                {[
                  {
                    label: "Total Revenue",
                    value: `₦${totalRevenue.toLocaleString()}`,
                    icon: <TrendingUp className="w-5 h-5" />,
                    color: "from-amber-400 to-orange-500",
                    sub: "Delivered orders",
                  },
                  {
                    label: "Total Orders",
                    value: orders.length,
                    icon: <ShoppingBag className="w-5 h-5" />,
                    color: "from-blue-400 to-blue-600",
                    sub: "All time",
                  },
                  {
                    label: "Active Orders",
                    value: activeOrders,
                    icon: <Flame className="w-5 h-5" />,
                    color: "from-orange-400 to-red-500",
                    sub: "Needs attention",
                  },
                  {
                    label: "Total Meals",
                    value: meals.length,
                    icon: <UtensilsCrossed className="w-5 h-5" />,
                    color: "from-green-400 to-emerald-600",
                    sub: `${meals.filter((m) => m.available).length} available`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6 overflow-hidden relative"
                  >
                    <div
                      className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${stat.color} rounded-xl lg:rounded-2xl flex items-center justify-center text-white mb-3 lg:mb-4 shadow-lg`}
                    >
                      {stat.icon}
                    </div>
                    <p className="text-xl lg:text-3xl font-black text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-gray-700 font-bold text-xs lg:text-sm">
                      {stat.label}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5 hidden lg:block">
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-5 lg:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg lg:text-xl font-black text-gray-900">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setTab("Orders")}
                    className="text-amber-500 text-sm font-bold hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => {
                    const config =
                      STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full ${config.color} ${config.bg}`}
                        >
                          {config.icon} {config.label}
                        </span>
                        <p className="font-black text-amber-600 text-sm">
                          ₦{order.total.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === "Orders" && (
            <div>
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                  Orders
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage and update all customer orders
                </p>
              </div>

              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Order ID", "Date", "Total", "Status", "Update"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-4 lg:px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const config =
                          STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        return (
                          <tr
                            key={order.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                          >
                            <td className="px-4 lg:px-6 py-4">
                              <p className="font-black text-gray-800 text-sm">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <p className="text-gray-500 text-xs">
                                {new Date(order.created_at).toLocaleDateString(
                                  "en-NG",
                                  { day: "numeric", month: "short" },
                                )}
                              </p>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <p className="font-black text-amber-600 text-sm">
                                ₦{order.total.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <span
                                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full w-fit ${config.color} ${config.bg}`}
                              >
                                {config.icon} {config.label}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <div className="relative">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateOrderStatus(order.id, e.target.value)
                                  }
                                  disabled={updatingOrderId === order.id}
                                  className="text-xs font-bold border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 transition appearance-none pr-7 disabled:opacity-50"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {s.replace("_", " ")}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MEALS */}
          {tab === "Meals" && (
            <div>
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                    Meals
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Add, edit and manage your menu items
                  </p>
                </div>
                <button
                  onClick={openAddMeal}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 lg:px-6 py-2.5 lg:py-3 rounded-2xl transition shadow-lg shadow-amber-100 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Meal</span>
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-2xl lg:rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    <div className="relative">
                      <img
                        src={
                          meal.image_url ||
                          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"
                        }
                        alt={meal.name}
                        className="w-full h-28 lg:h-44 object-cover"
                      />
                      <button
                        onClick={() => toggleAvailable(meal)}
                        className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full transition ${meal.available ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                      >
                        {meal.available ? "✓" : "✗"}
                      </button>
                    </div>
                    <div className="p-3 lg:p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-black text-gray-900 text-sm truncate flex-1">
                          {meal.name}
                        </h4>
                        <p className="font-black text-amber-500 text-sm ml-1 shrink-0">
                          ₦{meal.price.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {meal.category}
                      </span>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => openEditMeal(meal)}
                          className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 text-gray-600 hover:text-amber-600 font-bold py-2 rounded-xl transition text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => deleteMeal(meal)}
                          className="flex items-center justify-center border-2 border-red-50 bg-red-50 hover:bg-red-100 text-red-400 font-bold py-2 px-3 rounded-xl transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 lg:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingMeal ? "Edit Meal" : "Add New Meal"}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  Fill in the details below
                </p>
              </div>
              <button
                onClick={() => setShowMealModal(false)}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  value={mealForm.name}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, name: e.target.value })
                  }
                  placeholder="e.g. Jollof Rice & Fried Chicken"
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={mealForm.description}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, description: e.target.value })
                  }
                  placeholder="Describe the meal..."
                  rows={3}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white resize-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    value={mealForm.price}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, price: e.target.value })
                    }
                    placeholder="3500"
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={mealForm.category}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, category: e.target.value })
                    }
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white transition appearance-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={mealForm.image_url}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white transition"
                />
                {mealForm.image_url && (
                  <img
                    src={mealForm.image_url}
                    alt="preview"
                    className="w-full h-32 object-cover rounded-2xl mt-2"
                  />
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() =>
                    setMealForm({ ...mealForm, available: !mealForm.available })
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-200 relative ${mealForm.available ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${mealForm.available ? "left-7" : "left-1"}`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Available on menu
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMealModal(false)}
                className="flex-1 border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                onClick={saveMeal}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-100 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : editingMeal ? "Update" : "Add Meal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
