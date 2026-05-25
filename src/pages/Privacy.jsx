import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16 flex-1">
        <div className="mb-10">
          <Link
            to="/"
            className="text-amber-500 text-sm font-semibold hover:underline"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mt-4 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">Last updated: January 2024</p>
        </div>

        <div className="prose max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when you create
              an account, place an order, or contact us. This includes your
              name, email address, phone number, delivery address, and payment
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to process your orders, send
              order confirmations and updates, improve our services, communicate
              with you about promotions and new menu items, and comply with
              legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              3. Payment Information
            </h2>
            <p>
              All payment transactions are processed securely through Paystack.
              We do not store your card details on our servers. Paystack's
              privacy policy governs the handling of your payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              4. Information Sharing
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with delivery partners
              solely for the purpose of fulfilling your order, and with service
              providers who assist us in operating our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. Your data is stored
              securely using Supabase infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              6. Cookies
            </h2>
            <p>
              We use essential cookies to maintain your session and preferences.
              We do not use tracking or advertising cookies. You can control
              cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              7. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal
              information at any time through your account settings. You may
              also request a copy of the data we hold about you by contacting us
              directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes by email or through a prominent
              notice on our platform. Your continued use of our service after
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              9. Contact Us
            </h2>
            <p>
              For privacy-related questions or requests, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 mt-3">
              <p className="font-semibold text-gray-800">
                Chuks Kitchen — Privacy Team
              </p>
              <p>123 Taste Blvd, Lagos, Nigeria</p>
              <p>Email: hello@chukskitchen.com</p>
              <p>Phone: +234 801 234 5678</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
