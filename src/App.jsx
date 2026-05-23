import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import MealDetail from "./pages/MealDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-6xl">🍽️</span>
        </div>
        <h1 className="text-8xl font-black text-amber-500 mb-4">404</h1>
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          Page not found
        </h2>
        <p className="text-gray-400 text-base mb-10 max-w-sm mx-auto">
          Looks like this page went out for delivery and never came back.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/home"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-amber-100"
          >
            Back to Home
          </a>
          <a
            href="/menu"
            className="border-2 border-amber-200 text-amber-600 hover:bg-amber-50 font-bold px-8 py-4 rounded-2xl transition"
          >
            Browse Menu
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/meal/:id" element={<MealDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
