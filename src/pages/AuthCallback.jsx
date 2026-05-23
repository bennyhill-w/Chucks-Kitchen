import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus("error");
        setTimeout(() => navigate("/signin"), 3000);
        return;
      }

      if (data.session) {
        setStatus("success");
        setTimeout(() => navigate("/home"), 2000);
      } else {
        setStatus("error");
        setTimeout(() => navigate("/signin"), 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-sm p-10 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Confirming your account
            </h2>
            <p className="text-gray-400 text-sm">Please wait a moment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Email Confirmed!
            </h2>
            <p className="text-gray-400 text-sm">Taking you to the app...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-9 h-9 text-red-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 text-sm">
              Redirecting you to sign in...
            </p>
          </>
        )}

        <div className="mt-6">
          <h1 className="text-lg font-black text-gray-900">
            Chuks <span className="text-amber-500">Kitchen</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
