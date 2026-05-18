import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import AuthLayout from "../components/AuthLayout";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <AuthLayout>
      <Toaster />

      {!sent ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            No worries. Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-100 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link
            to="/signin"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-semibold mt-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </>
      ) : (
        /* Success state */
        <div className="text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-400 text-sm mb-2">
            We sent a password reset link to
          </p>
          <p className="text-amber-600 font-bold text-base mb-8">{email}</p>
          <p className="text-gray-400 text-xs mb-8">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <button
            onClick={() => setSent(false)}
            className="w-full border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl transition mb-3"
          >
            Try again
          </button>
          <Link
            to="/signin"
            className="flex items-center justify-center gap-2 text-amber-500 hover:text-amber-600 font-semibold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
