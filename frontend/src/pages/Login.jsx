import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { 
  Loader2, LogIn, User, Lock, 
  Eye, EyeOff, AlertCircle 
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    identifier: "",  // Q-ID or Email or Phone
    password: ""
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      // Save JWT & User
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Role-based Navigation 
      const role = res.data.user.role;
      const destination = role === "admin" ? "/admin" : role === "club" ? "/club" : "/";
      navigate(destination);

    } catch (err) {
      if (err.response?.status === 403) {
        setError("Account not verified. Please verify your email/phone.");
      } else {
        setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white/50">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
            <LogIn className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-blue-100 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 flex items-center gap-3 text-sm animate-pulse">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Identifier Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Q-ID, Email, or Phone"
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg flex justify-center items-center gap-2 transform active:scale-95"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500">
            {/* FIX: Changed class to className */}
            <Link to="/forgot-password" className="text-slate-500 hover:text-blue-600 hover:underline transition-colors">
              Forgot your password?
            </Link>
            
            <div className="w-full h-px bg-gray-200 my-2"></div>
            
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}