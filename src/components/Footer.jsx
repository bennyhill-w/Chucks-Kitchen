import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-white px-8 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3
            className="text-amber-400 text-2xl font-bold mb-4"
            style={{ fontFamily: "cursive" }}
          >
            Chuks Kitchen
          </h3>
          <p className="text-gray-300 text-base leading-relaxed">
            Bringing the authentic flavors of Nigerian home cooking to your
            table, with passion and care.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-3 text-gray-300 text-base">
            <li>
              <Link to="/home" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-white">
                Explore
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white">
                My Order
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white">
                Account
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
          <ul className="space-y-3 text-gray-300 text-base">
            <li>+234 801 234 5678</li>
            <li>hello@chukskitchen.com</li>
            <li>123 Taste Blvd, Lagos, Nigeria</li>
          </ul>
        </div>
        <div className="mt-2">
          <ul className="space-y-3 text-gray-300 text-base">
            <li>
              <a href="#" className="hover:text-white">
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-amber-800 text-gray-400 text-base">
        © 2020 Lift Media. All rights reserved.
      </div>
    </footer>
  );
}
