import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function Navbar({ cartCount = 0 }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <>
      <Toaster />
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 lg:px-8 py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl lg:text-2xl font-bold text-amber-500 shrink-0"
            style={{ fontFamily: "cursive" }}
          >
            Chuks Kitchen
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-gray-600 font-medium text-sm">
            {[
              { label: "Home", to: "/home" },
              { label: "Explore", to: "/menu" },
              { label: "My Orders", to: "/orders" },
              { label: "Account", to: "/profile" },
            ].map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `relative group transition-colors duration-200 ${isActive ? "text-amber-500 font-bold" : "text-gray-600 hover:text-amber-500"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart icon — always visible */}
            <Link to="/cart" className="relative p-1">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop auth button */}
            {user ? (
              <button
                onClick={handleSignOut}
                className="hidden lg:block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-xl transition text-sm"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/signin"
                className="hidden lg:block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-xl transition text-sm"
              >
                Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1"
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-5 py-4 space-y-1 shadow-md">
            <Link
              to="/home"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition"
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition"
            >
              Explore
            </Link>
            <Link
              to="/orders"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition"
            >
              My Orders
            </Link>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition"
            >
              Account
            </Link>
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition text-sm"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-center transition text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
