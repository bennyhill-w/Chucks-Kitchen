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
  Search,
  LogOut,
  User,
  Filter,
  Download,
  Eye,
  EyeOff,
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
    border: "border-yellow-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  preparing: {
    label: "Preparing",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: <Flame className="w-3.5 h-3.5" />,
  },
  on_the_way: {
    label: "On the way",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const CATEGORIES = [
  "Popular",
  "Jollof Rice & Entrees",
  "Jollof Delights",
  "Swallow & Soups",
  "Soups",
  "Grills & BBQ",
  "Grills & sides",
  "Sweet Treats",
  "Desserts",
  "Beverages",
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [meals, setMeals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealForm, setMealForm] = useState(EMPTY_MEAL);
  const [saving, setSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mealSearch, setMealSearch] = useState("");
  const [mealCategoryFilter, setMealCategoryFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    if (user) checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!data?.is_admin) {
      toast.error("Access denied");
      navigate("/home");
      return;
    }
    setProfile(data);
    fetchAll();
  };

  const fetchAll = async () => {
    const [{ data: ordersData }, { data: mealsData }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("meals").select("*").order("category", { ascending: true }),
    ]);
    setOrders(ordersData || []);
    setMeals(mealsData || []);
    setLoading(false);
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("order_items")
      .select("*, meals(*)")
      .eq("order_id", orderId);
    setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
  };

  const toggleExpandOrder = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
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
    toast.success(`Order marked as ${status.replace("_", " ")}`);
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
    const payload = {
      name: mealForm.name,
      description: mealForm.description,
      price: parseFloat(mealForm.price),
      category: mealForm.category,
      image_url: mealForm.image_url,
      available: mealForm.available,
    };
    if (editingMeal) {
      const { data, error } = await supabase
        .from("meals")
        .update(payload)
        .eq("id", editingMeal.id)
        .select("*")
        .single();
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

  const deleteMeal = (meal) => setDeleteModal(meal);

  const confirmDelete = async () => {
    const meal = deleteModal;
    setDeleteModal(null);
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
    toast.success(
      meal.available ? "Meal hidden from menu" : "Meal visible on menu",
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploadingImage(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("meal-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      toast.error("Failed to upload image: " + uploadError.message);
      setUploadingImage(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("meal-images").getPublicUrl(fileName);
    setMealForm((prev) => ({ ...prev, image_url: publicUrl }));
    setUploadingImage(false);
    toast.success("Image uploaded! Click Save to apply.");
  };

  const exportOrders = () => {
    const csv = [
      ["Order ID", "Date", "Status", "Total", "Address", "Payment"].join(","),
      ...orders.map((o) =>
        [
          o.id.slice(0, 8).toUpperCase(),
          new Date(o.created_at).toLocaleDateString(),
          o.status,
          o.total,
          `"${o.delivery_address || ""}"`,
          o.payment_method || "card",
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chuks-kitchen-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported!");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) =>
    ["pending", "preparing", "on_the_way"].includes(o.status),
  ).length;
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const unavailableMeals = meals.filter((m) => !m.available).length;

  // Filtered meals
  const filteredMeals = meals.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(mealSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(mealSearch.toLowerCase());
    const matchCategory =
      mealCategoryFilter === "All" || m.category === mealCategoryFilter;
    return matchSearch && matchCategory;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.id.slice(0, 8).toUpperCase().includes(orderSearch.toUpperCase()) ||
      (o.delivery_address || "")
        .toLowerCase()
        .includes(orderSearch.toLowerCase());
    const matchStatus =
      orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // Revenue by day for chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const revenueByDay = last7Days.map((day) => ({
    day: new Date(day).toLocaleDateString("en-NG", { weekday: "short" }),
    revenue: orders
      .filter(
        (o) =>
          o.status === "delivered" &&
          new Date(o.created_at).toDateString() === day,
      )
      .reduce((s, o) => s + o.total, 0),
  }));
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

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

      {/* Mobile dropdown */}
      {sidebarOpen && (
        <div className="lg:hidden bg-amber-800 px-4 py-3 space-y-1 sticky top-16 z-30">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${tab === t ? "bg-amber-500 text-white" : "text-amber-200 hover:bg-amber-700"}`}
            >
              {t === "Dashboard" && <LayoutDashboard className="w-4 h-4" />}
              {t === "Orders" && <ShoppingBag className="w-4 h-4" />}
              {t === "Meals" && <UtensilsCrossed className="w-4 h-4" />}
              {t}
            </button>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-300 hover:bg-amber-700 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-amber-900 min-h-screen flex-col fixed top-0 left-0 z-40">
          <div className="px-6 py-8 border-b border-amber-800">
            <h1
              className="text-2xl font-black text-white mb-1"
              style={{ fontFamily: "cursive" }}
            >
              Chuks Kitchen
            </h1>
            <p className="text-amber-300 text-xs font-semibold">
              Admin Dashboard
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${tab === t ? "bg-amber-500 text-white shadow-lg" : "text-amber-200 hover:bg-amber-800 hover:text-white"}`}
              >
                {t === "Dashboard" && <LayoutDashboard className="w-5 h-5" />}
                {t === "Orders" && <ShoppingBag className="w-5 h-5" />}
                {t === "Meals" && <UtensilsCrossed className="w-5 h-5" />}
                {t}
              </button>
            ))}
          </nav>

          {/* Admin profile */}
          <div className="px-4 pb-6 border-t border-amber-800 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                {profile?.full_name?.[0] ||
                  user?.email?.[0]?.toUpperCase() ||
                  "A"}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {profile?.full_name || "Admin"}
                </p>
                <p className="text-amber-300 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/home")}
              className="w-full text-amber-300 hover:text-white text-sm font-semibold py-2 rounded-xl hover:bg-amber-800 transition text-center mb-1"
            >
              ← Back to site
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-red-300 hover:text-white hover:bg-red-500/20 text-sm font-semibold py-2 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" /> Sign Out
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
                  Welcome back
                  {profile?.full_name ? `, ${profile.full_name}` : ""}! Here's
                  what's happening.
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
                {[
                  {
                    label: "Total Revenue",
                    value: `₦${totalRevenue.toLocaleString()}`,
                    icon: <TrendingUp className="w-5 h-5" />,
                    color: "from-amber-400 to-orange-500",
                    sub: "From delivered orders",
                  },
                  {
                    label: "Total Orders",
                    value: orders.length,
                    icon: <ShoppingBag className="w-5 h-5" />,
                    color: "from-blue-400 to-blue-600",
                    sub: `${todayOrders} today`,
                  },
                  {
                    label: "Active Orders",
                    value: activeOrders,
                    icon: <Flame className="w-5 h-5" />,
                    color: "from-orange-400 to-red-500",
                    sub: "Needs attention",
                  },
                  {
                    label: "Menu Items",
                    value: meals.length,
                    icon: <UtensilsCrossed className="w-5 h-5" />,
                    color: "from-green-400 to-emerald-600",
                    sub: `${unavailableMeals} hidden`,
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
                    <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      Revenue — Last 7 Days
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      From delivered orders only
                    </p>
                  </div>
                  <span className="text-amber-500 font-black text-lg">
                    ₦{totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {revenueByDay.map((d, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full relative group">
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                          ₦{d.revenue.toLocaleString()}
                        </div>
                        <div
                          className="w-full rounded-t-xl transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${Math.max((d.revenue / maxRevenue) * 120, d.revenue > 0 ? 8 : 4)}px`,
                            background:
                              d.revenue > 0
                                ? "linear-gradient(to top, #f59e0b, #fbbf24)"
                                : "#f3f4f6",
                          }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs font-medium">
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent orders */}
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
                        <p className="font-black text-amber-600">
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                    Orders
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {orders.length} total · {activeOrders} active
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search orders..."
                      className="border-2 border-gray-100 bg-gray-50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition w-48"
                    />
                  </div>
                  {/* Status filter */}
                  <div className="relative">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="border-2 border-gray-100 bg-gray-50 rounded-xl pl-4 pr-8 py-2.5 text-sm focus:outline-none focus:border-amber-400 appearance-none font-semibold"
                    >
                      <option value="all">All Status</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {/* Export */}
                  <button
                    onClick={exportOrders}
                    className="flex items-center gap-2 border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-600 font-bold px-4 py-2.5 rounded-xl transition text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {[
                          "Order ID",
                          "Date",
                          "Total",
                          "Payment",
                          "Status",
                          "Update",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 lg:px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-12 text-gray-400 text-sm"
                          >
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const config =
                            STATUS_CONFIG[order.status] ||
                            STATUS_CONFIG.pending;
                          const isExpanded = expandedOrder === order.id;
                          return (
                            <>
                              <tr
                                key={order.id}
                                className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                              >
                                <td className="px-4 lg:px-6 py-4">
                                  <p className="font-black text-gray-800 text-sm">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-0.5 max-w-28 truncate">
                                    {order.delivery_address || "N/A"}
                                  </p>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                  <p className="text-gray-600 text-xs font-medium">
                                    {new Date(
                                      order.created_at,
                                    ).toLocaleDateString("en-NG", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {new Date(
                                      order.created_at,
                                    ).toLocaleTimeString("en-NG", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                  <p className="font-black text-amber-600 text-sm">
                                    ₦{order.total.toLocaleString()}
                                  </p>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                  <p className="text-gray-500 text-xs capitalize">
                                    {order.payment_method || "card"}
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
                                        updateOrderStatus(
                                          order.id,
                                          e.target.value,
                                        )
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
                                <td className="px-4 lg:px-6 py-4">
                                  <button
                                    onClick={() => toggleExpandOrder(order.id)}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                  >
                                    {isExpanded ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                              {/* Expanded order items */}
                              {isExpanded && (
                                <tr
                                  key={`${order.id}-expanded`}
                                  className="bg-amber-50/50"
                                >
                                  <td colSpan={7} className="px-6 py-4">
                                    {!orderItems[order.id] ? (
                                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                        Loading items...
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap gap-3">
                                        {orderItems[order.id].map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm"
                                          >
                                            <img
                                              src={item.meals?.image_url}
                                              alt={item.meals?.name}
                                              className="w-8 h-8 rounded-lg object-cover"
                                              onError={(e) => {
                                                e.target.src =
                                                  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100";
                                              }}
                                            />
                                            <div>
                                              <p className="text-xs font-bold text-gray-800">
                                                {item.meals?.name}
                                              </p>
                                              <p className="text-xs text-gray-400">
                                                x{item.quantity} · ₦
                                                {(
                                                  item.price * item.quantity
                                                ).toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MEALS */}
          {tab === "Meals" && (
            <div>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                    Meals
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {filteredMeals.length} of {meals.length} meals ·{" "}
                    {unavailableMeals} hidden
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={mealSearch}
                      onChange={(e) => setMealSearch(e.target.value)}
                      placeholder="Search meals..."
                      className="border-2 border-gray-100 bg-gray-50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition w-44"
                    />
                  </div>
                  {/* Category filter */}
                  <div className="relative">
                    <select
                      value={mealCategoryFilter}
                      onChange={(e) => setMealCategoryFilter(e.target.value)}
                      className="border-2 border-gray-100 bg-gray-50 rounded-xl pl-4 pr-8 py-2.5 text-sm focus:outline-none focus:border-amber-400 appearance-none font-semibold"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {/* Add meal */}
                  <button
                    onClick={openAddMeal}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 lg:px-5 py-2.5 rounded-2xl transition shadow-lg shadow-amber-100 text-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Meal</span>
                  </button>
                </div>
              </div>

              {filteredMeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-black text-gray-700 mb-2">
                    No meals found
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Try a different search or category
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                  {filteredMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-white rounded-2xl lg:rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition group"
                    >
                      <div className="relative">
                        <img
                          src={
                            meal.image_url ||
                            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"
                          }
                          alt={meal.name}
                          className="w-full h-28 lg:h-44 object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400";
                          }}
                        />
                        <button
                          onClick={() => toggleAvailable(meal)}
                          className={`absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition ${meal.available ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                        >
                          {meal.available ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">
                            {meal.available ? "Live" : "Hidden"}
                          </span>
                        </button>
                      </div>
                      <div className="p-3 lg:p-5">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <h4 className="font-black text-gray-900 text-sm truncate flex-1">
                            {meal.name}
                          </h4>
                          <p className="font-black text-amber-500 text-sm shrink-0">
                            ₦{meal.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="inline-block text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-3">
                          {meal.category}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditMeal(meal)}
                            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 text-gray-600 hover:text-amber-600 font-bold py-2 rounded-xl transition text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => deleteMeal(meal)}
                            className="flex items-center justify-center border-2 border-red-50 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 font-bold py-2 px-3 rounded-xl transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Delete Meal?
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              You're about to permanently delete
            </p>
            <p className="text-gray-800 font-bold text-base mb-6">
              "{deleteModal.name}"
            </p>
            <p className="text-gray-400 text-xs mb-8">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Image upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Meal Image
                </label>
                <div
                  onClick={() =>
                    document.getElementById("meal-image-input").click()
                  }
                  className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${mealForm.image_url ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50"}`}
                >
                  {mealForm.image_url ? (
                    <div className="relative">
                      <img
                        src={mealForm.image_url}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMealForm({ ...mealForm, image_url: "" });
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {uploadingImage ? (
                        <>
                          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-amber-600 font-semibold text-sm">
                            Uploading...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-1">
                            <Plus className="w-6 h-6 text-amber-500" />
                          </div>
                          <p className="text-gray-600 font-semibold text-sm">
                            Click to upload image
                          </p>
                          <p className="text-gray-400 text-xs">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  id="meal-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs font-medium">
                    or paste URL
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <input
                  type="text"
                  value={mealForm.image_url}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white transition mt-3 text-sm"
                />
              </div>

              {/* Available toggle */}
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
                {saving
                  ? "Saving..."
                  : editingMeal
                    ? "Update Meal"
                    : "Add Meal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
