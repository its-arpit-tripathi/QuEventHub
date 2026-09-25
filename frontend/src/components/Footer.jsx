
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Campus Event Hub</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your ultimate platform for discovering and managing campus events, clubs, and activities. Connect with your community!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-blue-400 transition">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="hover:text-blue-400 transition">
                  Clubs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-blue-400 transition">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>info@campuseventhub.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>Campus Central, Building A</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-slate-800 p-3 rounded-full hover:bg-blue-600 transition"
                title="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-3 rounded-full hover:bg-blue-600 transition"
                title="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-3 rounded-full hover:bg-blue-600 transition"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2025 Campus Event Hub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-400 transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-400 transition">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}