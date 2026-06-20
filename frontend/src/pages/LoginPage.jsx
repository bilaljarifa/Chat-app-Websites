import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, Sparkles } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen relative overflow-hidden grid lg:grid-cols-2">
      <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-200/80 to-base-100" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/25 blur-[100px] animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/20 blur-[100px] animate-pulse" />

      {/* Form */}
      <div className="relative z-10 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-2xl bg-base-100/50 border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 sm:p-10 space-y-8">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-pink-500 shadow-lg shadow-blue-500/25">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary tracking-wide uppercase">chatwithme</p>
                <h1 className="text-3xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/70">
                  Welcome back
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-base-content/80">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-base-200/50 border border-base-content/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-base-content/30"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-base-content/80">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-base-200/50 border border-base-content/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-base-content/30"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-content font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Hero panel */}
      <div className="relative z-10 hidden lg:flex flex-col justify-center items-center p-8 xl:p-12">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/30 via-secondary/15 to-transparent blur-3xl opacity-80" />
          <div className="absolute -inset-2 rounded-3xl border border-white/10 bg-base-100/20 backdrop-blur-sm" />
          <img
            src="/login_illustration.png"
            alt="Chat illustration"
            className="relative w-full max-h-[72vh] object-contain rounded-3xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="mt-10 text-center max-w-lg space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Real-time chat
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
