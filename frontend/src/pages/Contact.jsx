import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Loader2, 
  User, 
  MessageSquare 
} from 'lucide-react';
import api from '../api';
import { showToast } from '../utils/toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/contact", formData);
      
      if (res.data.success) {
        showToast(res.data.message || "Your message has been sent successfully. We'll get back to you soon.", "success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        showToast(res.data.message || "Failed to send message. Please try again.", "error");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      showToast(
        err.response?.data?.message || 
        "Failed to send your message. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Contact Information (Dark/Gradient Background) */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-800 p-10 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">Get In Touch</h2>
            <p className="text-blue-100 mb-8 leading-relaxed">
              Have questions about an event or club? We'd love to hear from you. Fill out the form and we'll be in touch shortly.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Mail size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-blue-100 text-sm">info@campuseventhub.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Phone size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-blue-100 text-sm">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Office</h3>
                  <p className="text-blue-100 text-sm">Campus Central, Building A<br/>Room 304</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-0">
             {/* Decorative circles or additional branding can go here */}
             <div className="flex gap-4 opacity-50">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <div className="w-3 h-3 rounded-full bg-white"></div>
             </div>
          </div>
        </div>

        {/* Right Side: Contact Form (White Background) */}
        <div className="w-full md:w-3/5 p-10 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  required 
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  required 
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea 
                  rows="4" 
                  name="message"
                  placeholder="How can we help you?" 
                  value={formData.message}
                  onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                  required
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2"/> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;