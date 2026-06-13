import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Settings, User, Bell, Heart, Sparkles, MessageSquare } from "lucide-react";
import { useSentimentModel } from "../context/SentimentModelContext";
import FriendSuggestionPopup from "./FriendSuggestionPopup";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { model, setModel } = useSentimentModel(); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showFriendSuggestion, setShowFriendSuggestion] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authUser?.email === "bey@email.com";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      <header className="bg-base-100/60 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] fixed w-full top-0 z-40 backdrop-blur-2xl transition-all duration-300">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Left - Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300 group">
                {location.pathname === "/admin-dashboard" ? (
                  <img src="/BeyonderAdmin.png" alt="Logo" className="h-28 sm:h-28 w-auto" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(var(--p),0.3)] transition-all duration-300 border border-primary/20">
                      <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/70">
                      chatwithme
                    </h1>
                  </>
                )}
              </Link>
            </div>

            {/* Right - Navigation */}
            <div className="flex items-center gap-2 relative">
              {/* Looking for a partner - only show when logged in */}
              {authUser && (
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowFriendSuggestion(true);
                  }}
                  className="btn btn-sm gap-2 rounded-full border border-pink-500/30 hover:border-pink-500/80 hover:bg-pink-500/10 transition-all duration-300 btn-ghost hover:scale-105"
                >
                  <Heart className="size-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent" style={{ fill: 'url(#heartGradient)' }} />
                  <span className="hidden sm:inline bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">
                    Looking for a Friend?
                  </span>
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgb(168, 85, 247)', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </Link>
              )}

              {/* Interests Tab - only show when logged in */}
              {authUser && (
                <Link
                  to="/interests"
                  className="btn btn-sm btn-ghost rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Interests</span>
                </Link>
              )}

              {/* Notification bell for non-admins */}
              {!isAdmin && authUser && (
                <button
                  onClick={() => navigate("/notifications")}
                  className="btn btn-sm btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center justify-center"
                  aria-label="Go to notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
              )}

              {/* Admin Dashboard + Model Switcher */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate("/admin-dashboard")}
                    className="btn btn-sm btn-ghost rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center"
                    aria-label="Go to admin dashboard"
                  >
                    Dashboard
                  </button>
                </>
              )}

              {/* Settings Button */}
              <Link
                to={"/settings"}
                className="btn btn-sm btn-ghost rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              {/* Profile and Logout */}
              {authUser && (
                <>
                  <Link to={"/profile"} className="btn btn-sm btn-ghost rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="btn btn-sm btn-ghost rounded-full gap-2 hover:bg-error/10 hover:text-error transition-all duration-300 flex items-center"
                  >
                    <LogOut className="size-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Friend Suggestion Popup */}
      <FriendSuggestionPopup
        isOpen={showFriendSuggestion}
        onClose={() => setShowFriendSuggestion(false)}
      />
    </>
  );
};

export default Navbar;