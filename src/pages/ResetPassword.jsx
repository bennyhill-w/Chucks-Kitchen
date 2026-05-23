import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import AuthLayout from "../components/AuthLayout";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash
    // We need to let Supabase process it via onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      } else if (event === "SIGNED_IN" && session) {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    // Check for error in URL hash
    const hash = window.location.hash;
    if (
      hash.includes("error=access_denied") ||
      hash.includes("error_code=otp_expired")
    ) {
      setSessionError(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });
    setLoading(false);

    if (error) return toast.error(error.message);
    setDone(true);
    setTimeout(() => navigate("/signin"), 2500);
  };

  // Error state — link expired
  if (sessionError)
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Link Expired
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            This password reset link has expired or already been used. Please
            request a new one.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-100"
          >
            Request New Link
          </button>
        </div>
      </AuthLayout>
    );

  // Loading state — waiting for session
  if (!sessionReady && !done)
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-black text-gray-900 mb-2">
            Verifying your link
          </h2>
          <p className="text-gray-400 text-sm">Please wait a moment...</p>
        </div>
      </AuthLayout>
    );

  return (
    <AuthLayout>
      <Toaster />
      {!done ? (
        <>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">
            Reset Password
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  placeholder="Repeat new password"
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password strength */}
            <div className="space-y-1.5">
              {[
                {
                  label: "At least 6 characters",
                  met: form.password.length >= 6,
                },
                { label: "Contains a number", met: /\d/.test(form.password) },
                {
                  label: "Passwords match",
                  met:
                    form.password === form.confirm && form.confirm.length > 0,
                },
              ].map((rule) => (
                <div
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors ${rule.met ? "text-green-500" : "text-gray-300"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {rule.label}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-100 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Password Updated!
          </h2>
          <p className="text-gray-400 text-sm mb-2">
            Your password has been changed successfully.
          </p>
          <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
        </div>
      )}
    </AuthLayout>
  );
}
