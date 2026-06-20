import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import FriendSuggestionPopup from "./FriendSuggestionPopup";

const NavIconButton = ({ onClick, to, icon: Icon, label, active, variant = "default" }) => {
  const baseClass =
    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group";
  const variants = {
    default: active
      ? "bg-primary/15 text-primary shadow-inner"
      : "text-base-content/70 hover:bg-base-content/5 hover:text-primary",
    danger: "text-base-content/70 hover:bg-error/10 hover:text-error",
    accent:
      "text-pink-500 hover:bg-pink-500/10 hover:text-pink-600 border border-pink-500/20 hover:border-pink-500/40",
  };

  const className = `${baseClass} ${variants[variant]}`;

  const content = (
    <>
      <Icon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
      <span className="sr-only">{label}</span>
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-base-content text-base-100 text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} title={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label} title={label}>
      {content}
    </button>
  );
};

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [showFriendSuggestion, setShowFriendSuggestion] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authUser?.email === "bey@email.com";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="fixed w-full top-0 z-40 border-b border-white/10 bg-base-100/75 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity group"
            >
              {location.pathname === "/admin-dashboard" ? (
                <img src="/BeyonderAdmin.png" alt="Logo" className="h-12 w-auto" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 text-primary-content" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold leading-none">chatwithme</h1>
                    <p className="text-[10px] text-base-content/50 font-medium tracking-wider uppercase mt-0.5">
                      Stay connected
                    </p>
                  </div>
                </>
              )}
            </Link>

            {authUser && (
              <nav className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-base-200/60 border border-white/10 backdrop-blur-md">
                <NavIconButton
                  icon={Heart}
                  label="Find a friend"
                  variant="accent"
                  onClick={() => setShowFriendSuggestion(true)}
                />
                <NavIconButton
                  to="/interests"
                  icon={Sparkles}
                  label="Interests"
                  active={isActive("/interests")}
                />
                {!isAdmin && (
                  <NavIconButton
                    onClick={() => navigate("/notifications")}
                    icon={Bell}
                    label="Notifications"
                    active={isActive("/notifications")}
                  />
                )}
                {isAdmin && (
                  <NavIconButton
                    onClick={() => navigate("/admin-dashboard")}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={isActive("/admin-dashboard")}
                  />
                )}
                {!isAuthPage && (
                  <NavIconButton
                    to="/settings"
                    icon={Settings}
                    label="Settings"
                    active={isActive("/settings")}
                  />
                )}
                <div className="w-px h-6 bg-base-content/10 mx-0.5 hidden sm:block" />
                <NavIconButton
                  to="/profile"
                  icon={User}
                  label="Profile"
                  active={isActive("/profile")}
                />
                <NavIconButton icon={LogOut} label="Logout" variant="danger" onClick={logout} />
              </nav>
            )}
          </div>
        </div>
      </header>

      <FriendSuggestionPopup
        isOpen={showFriendSuggestion}
        onClose={() => setShowFriendSuggestion(false)}
      />
    </>
  );
};

export default Navbar;
