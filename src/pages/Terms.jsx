import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
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
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-sm">Last updated: January 2024</p>
        </div>

        <div className="prose max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Chuks Kitchen's online food ordering
              platform, you accept and agree to be bound by these Terms and
              Conditions. If you do not agree to these terms, please do not use
              our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              2. Our Service
            </h2>
            <p>
              Chuks Kitchen provides an online platform for customers to browse
              our menu, place food orders, and arrange delivery or pickup of
              Nigerian cuisine. We reserve the right to modify, suspend, or
              discontinue our service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              3. Orders & Payment
            </h2>
            <p>
              All orders placed through our platform are subject to acceptance
              and availability. Payment is processed securely through Paystack.
              By placing an order, you confirm that the payment information
              provided is accurate and that you are authorized to use the
              payment method.
            </p>
            <p className="mt-2">
              Prices displayed on our platform are in Nigerian Naira (₦) and
              include applicable taxes where stated. We reserve the right to
              change prices at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              4. Delivery
            </h2>
            <p>
              Delivery times are estimates only and may vary based on location,
              weather, and demand. Chuks Kitchen is not liable for delays beyond
              our reasonable control. Delivery is available within our
              designated service areas in Lagos, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              5. Cancellations & Refunds
            </h2>
            <p>
              Orders may be cancelled within 5 minutes of placement. Once an
              order has been confirmed and preparation has begun, cancellations
              may not be accepted. Refunds for eligible cancellations will be
              processed within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              6. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to notify us immediately of any
              unauthorized use of your account. We reserve the right to
              terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              7. Food Allergies
            </h2>
            <p>
              While we take precautions to prevent cross-contamination, we
              cannot guarantee that our food is free from allergens. Customers
              with severe food allergies should contact us directly before
              placing an order. Chuks Kitchen is not liable for allergic
              reactions resulting from undisclosed allergen information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              Chuks Kitchen shall not be liable for any indirect, incidental, or
              consequential damages arising from your use of our service. Our
              total liability to you shall not exceed the amount paid for the
              specific order giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              9. Contact Us
            </h2>
            <p>
              For questions about these Terms & Conditions, please contact us
              at:
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 mt-3">
              <p className="font-semibold text-gray-800">Chuks Kitchen</p>
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
