import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Phone,
  CreditCard,
  Building2,
  ArrowLeftRight,
  ChevronRight,
  ChevronLeft,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import toast, { Toaster } from "react-hot-toast";

const STEPS = ["Delivery", "Payment", "Confirm"];

function PayButton({ amount, email, onSuccess, onClose, disabled }) {
  const config = {
    reference: `ck_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email,
    amount: amount * 100, // Paystack uses kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: "NGN",
    metadata: {
      custom_fields: [
        {
          display_name: "App",
          variable_name: "app",
          value: "Chuks Kitchen",
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      onClick={() =>
        initializePayment(
          (reference) => onSuccess(reference?.reference),
          onClose,
        )
      }
      disabled={disabled}
      className="flex-1 flex items-center justify-between bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-green-100 disabled:opacity-60"
    >
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4" />
        <span>
          {disabled ? "Processing..." : `Pay ₦${amount.toLocaleString()}`}
        </span>
      </div>
      <ChevronRight className="w-5 h-5" />
    </button>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState("card");
  const [saveCard, setSaveCard] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const [delivery, setDelivery] = useState({
    address: "123 Main Street, Victoria Island, Lagos",
    time: "ASAP (30-25 mins)",
    instructions: "",
    phone: "+234 801 234 5678",
  });

  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchProfile();
    } else {
      setLoading(false);
      navigate("/signin");
    }
  }, [user]);

  const fetchCart = async () => {
    const { data } = await supabase
      .from("cart_items")
      .select("*, meals(*)")
      .eq("user_id", user.id);
    if (!data || data.length === 0) {
      navigate("/cart");
      return;
    }
    setCartItems(data);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setDelivery((prev) => ({
        ...prev,
        address: data.address || prev.address,
        phone: data.phone || prev.phone,
      }));
    }
  };

  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.meals.price * i.quantity,
    0,
  );
  const deliveryFee = 500;
  const serviceFee = 200;
  const total = subtotal + deliveryFee + serviceFee;

  const placeOrder = async (paystackReference) => {
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "pending",
        delivery_address: delivery.address,
        phone: delivery.phone,
        payment_method: payMethod,
        payment_reference: paystackReference || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to place order");
      setPlacing(false);
      return;
    }

    const items = cartItems.map((i) => ({
      order_id: order.id,
      meal_id: i.meal_id,
      quantity: i.quantity,
      price: i.meals.price,
    }));

    await supabase.from("order_items").insert(items);
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    setPlacing(false);
    navigate("/order-success", { state: { orderId: order.id, total } });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Preparing checkout...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Navbar cartCount={cartItems.length} />

      <div className="max-w-5xl mx-auto w-full px-6 py-12 flex-1">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                    i < step
                      ? "bg-green-500 text-white shadow-lg shadow-green-100"
                      : i === step
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold mt-1.5 ${
                    i === step
                      ? "text-amber-600"
                      : i < step
                        ? "text-green-500"
                        : "text-gray-400"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-2 mb-5 transition-all duration-500 ${i < step ? "bg-green-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left — Step content */}
          <div className="flex-1 w-full">
            {/* STEP 0 — Delivery Details */}
            {step === 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Delivery Details
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-50 rounded-2xl pointer-events-none" />
                      <div className="relative flex items-start justify-between border-2 border-amber-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-600 mb-0.5">
                              HOME
                            </p>
                            <p className="text-gray-800 font-medium text-sm">
                              {delivery.address}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const addr = prompt(
                              "Enter new address:",
                              delivery.address,
                            );
                            if (addr)
                              setDelivery({ ...delivery, address: addr });
                          }}
                          className="text-amber-500 hover:text-amber-700 font-bold text-sm shrink-0 ml-4"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Delivery Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={delivery.time}
                        onChange={(e) =>
                          setDelivery({ ...delivery, time: e.target.value })
                        }
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-gray-700 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition appearance-none"
                      >
                        <option>ASAP (30-25 mins)</option>
                        <option>Schedule for later</option>
                        <option>Tonight (6pm - 8pm)</option>
                        <option>Tomorrow morning</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Delivery Instructions{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      value={delivery.instructions}
                      onChange={(e) =>
                        setDelivery({
                          ...delivery,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="E.g leave at the front of the door, knock twice..."
                      rows={3}
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-white resize-none transition text-sm placeholder-gray-300"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={delivery.phone}
                        onChange={(e) =>
                          setDelivery({ ...delivery, phone: e.target.value })
                        }
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-gray-700 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-between mt-8 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-amber-100"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-3xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Payment
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Choose how you want to pay
                    </p>
                  </div>
                </div>

                {/* Pay With */}
                <div className="mb-8">
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    Pay With
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: "card",
                        label: "Card",
                        icon: <CreditCard className="w-5 h-5" />,
                      },
                      {
                        id: "bank",
                        label: "Bank",
                        icon: <Building2 className="w-5 h-5" />,
                      },
                      {
                        id: "transfer",
                        label: "Transfer",
                        icon: <ArrowLeftRight className="w-5 h-5" />,
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-150 ${
                          payMethod === m.id
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paystack Payment */}
                {payMethod === "card" && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-800 text-sm">
                            Secured by Paystack
                          </p>
                          <p className="text-blue-500 text-xs">
                            Your payment is 100% secure
                          </p>
                        </div>
                      </div>
                      <p className="text-blue-600 text-sm leading-relaxed">
                        You'll be redirected to Paystack's secure payment page
                        to complete your payment of{" "}
                        <span className="font-black">
                          ₦{total.toLocaleString()}
                        </span>
                        .
                      </p>
                    </div>

                    {/* Accepted cards */}
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-400 font-medium">
                        Accepted:
                      </p>
                      <div className="flex gap-2">
                        {["Visa", "Mastercard", "Verve"].map((card) => (
                          <span
                            key={card}
                            className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-lg"
                          >
                            {card}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === "bank" && (
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 text-center">
                    <Building2 className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <p className="text-blue-700 font-semibold">
                      Bank payment coming soon
                    </p>
                    <p className="text-blue-400 text-sm mt-1">
                      We're working on this feature
                    </p>
                  </div>
                )}

                {payMethod === "transfer" && (
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6">
                    <p className="text-sm font-bold text-gray-700 mb-4">
                      Transfer to this account:
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Bank</span>
                        <span className="font-bold text-gray-800 text-sm">
                          First Bank Nigeria
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">
                          Account Name
                        </span>
                        <span className="font-bold text-gray-800 text-sm">
                          Chuks Kitchen Ltd
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">
                          Account Number
                        </span>
                        <span className="font-black text-amber-600 text-sm tracking-widest">
                          3012345678
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Amount</span>
                        <span className="font-black text-amber-600 text-sm">
                          ₦{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
                  🔒 Your personal data will be used to process your order and
                  support your experience.
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(0)}
                    className="flex items-center gap-2 border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-4 px-6 rounded-2xl transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-between bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-amber-100"
                  >
                    <span>Review Order</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div className="bg-white rounded-3xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Review & Confirm
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Double check everything before placing
                    </p>
                  </div>
                </div>

                {/* Delivery summary */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-800 text-sm">
                      Delivery Details
                    </p>
                    <button
                      onClick={() => setStep(0)}
                      className="text-amber-500 text-xs font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      {delivery.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      {delivery.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-400" />
                      {delivery.phone}
                    </p>
                  </div>
                </div>

                {/* Payment summary */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-800 text-sm">
                      Payment Method
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-amber-500 text-xs font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    {payMethod === "card"
                      ? `Card ending in ${card.number.slice(-4) || "****"}`
                      : payMethod === "bank"
                        ? "Bank Payment"
                        : "Bank Transfer"}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.meals.image_url}
                        alt={item.meals.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.meals.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          x{item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-amber-600 text-sm">
                        ₦{(item.meals.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-4 px-6 rounded-2xl transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <PayButton
                    amount={total}
                    email={user?.email}
                    onSuccess={placeOrder}
                    onClose={() => toast.error("Payment cancelled")}
                    disabled={placing}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right — Order mini summary */}
          <div className="lg:w-80 shrink-0 w-full">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
              <h3 className="font-black text-gray-900 text-lg mb-5">
                Your Order
              </h3>
              <div className="space-y-4 mb-5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.meals.image_url}
                      alt={item.meals.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {item.meals.name}
                      </p>
                      <p className="text-gray-400 text-xs">x{item.quantity}</p>
                    </div>
                    <p className="font-bold text-amber-600 text-sm shrink-0">
                      ₦{(item.meals.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-px bg-gray-100 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-700">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-gray-700">
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Service Fee</span>
                  <span className="font-semibold text-gray-700">
                    ₦{serviceFee.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-amber-500 text-xl">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
}
