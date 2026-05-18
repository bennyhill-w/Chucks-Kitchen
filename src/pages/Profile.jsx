import { useEffect, useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Save,
  ShoppingBag,
  LogOut,
  Camera,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from("orders")
      .select("total")
      .eq("user_id", user.id);
    if (data) {
      setOrderCount(data.length);
      setTotalSpent(data.reduce((sum, o) => sum + o.total, 0));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...form });
    setSaving(false);
    if (error) return toast.error("Failed to save profile");
    toast.success("Profile updated!");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = form.full_name
    ? form.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || "?";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Account</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your profile and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left — Profile card */}
          <div className="lg:w-72 shrink-0 w-full">
            {/* Avatar card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 text-center mb-4">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-100 mx-auto">
                  <span className="text-white font-black text-3xl">
                    {initials}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition">
                  <Camera className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <h2 className="font-black text-gray-900 text-xl">
                {form.full_name || "Your Name"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Verified Account
                </span>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Your Stats
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      Total Orders
                    </span>
                  </div>
                  <span className="font-black text-gray-900 text-lg">
                    {orderCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                      <span className="text-green-500 font-black text-sm">
                        ₦
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      Total Spent
                    </span>
                  </div>
                  <span className="font-black text-amber-500 text-lg">
                    ₦{totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3.5 rounded-2xl transition border-2 border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Right — Edit form */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h3 className="text-xl font-black text-gray-900 mb-1">
                Personal Information
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Update your details below
              </p>

              <div className="space-y-6">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-gray-700 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Email — readonly */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full border-2 border-gray-100 bg-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-gray-400 font-medium cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+234 801 234 5678"
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-gray-700 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Default Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-300 w-5 h-5" />
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="123 Main Street, Victoria Island, Lagos"
                      rows={3}
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-gray-700 font-medium focus:outline-none focus:border-amber-400 focus:bg-white resize-none transition"
                    />
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-100 disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-3xl shadow-sm p-6 mt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/orders")}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 border-2 border-gray-100 rounded-2xl p-4 transition text-left"
                >
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold text-gray-700">
                    My Orders
                  </span>
                </button>
                <button
                  onClick={() => navigate("/menu")}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 border-2 border-gray-100 rounded-2xl p-4 transition text-left"
                >
                  <span className="text-xl">🍽️</span>
                  <span className="text-sm font-bold text-gray-700">
                    Browse Menu
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
