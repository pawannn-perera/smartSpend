import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  DollarSign,
  Receipt,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [sidebarOpen]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    {
      name: "Expenses",
      path: "/expenses",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      name: "Bills",
      path: "/bills",
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      name: "Warranties",
      path: "/warranties",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      name: "About",
      path: "/about",
      icon: <Info className="w-5 h-5" />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-800 text-slate-100 px-4 pt-4 pb-6">
      {/* Logo */}
      <div className="flex items-center space-x-3 px-2 mb-8">
        {" "}
        {/* Increased mb and space-x */}
        <img
          src="/logo.png"
          alt="SmartSpend Logo"
          className="h-9 w-auto rounded-full"
        />{" "}
        {/* Slightly larger logo */}
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold text-white">
            Smart<span className="text-indigo-400">Spend</span>
          </span>{" "}
          {/* Changed blue to indigo */}
          <span className="text-xs text-slate-400 -mt-1">
            Track. Save. Optimize.
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1.5 flex-1">
        {" "}
        {/* Increased space-y */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
              isActive(item.path)
                ? "bg-indigo-600 text-white shadow-md" // Changed blue to indigo, added shadow
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span
              className={`transition-transform duration-200 ease-in-out group-hover:rotate-[5deg]`}
            >
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="mt-6 border-t border-slate-700 pt-6 space-y-3">
        {" "}
        {/* Increased mt, pt, space-y and changed border color */}
        <Link
          to="/profile"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
            isActive("/profile")
              ? "bg-indigo-600 text-white shadow-md" // Changed blue to indigo, added shadow
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-500/50 flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "User Avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-500 flex items-center justify-center text-white text-base font-semibold">
                {" "}
                {/* Changed bg and text size */}
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold truncate text-slate-100">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </Link>
        <button
          onClick={() => {
            setSidebarOpen(false);
            setShowLogoutConfirm(true);
          }}
          className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-700 transition-colors duration-200 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-rose-500" // Changed text color, hover, focus
        >
          <LogOut className="w-5 h-5" /> {/* Increased icon size */}
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100 font-sans">
      {" "}
      {/* Changed bg-gray-50 to bg-slate-100 */}
      {/* Mobile Sidebar with animation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" // Darker backdrop
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="absolute top-0 left-0 w-72 h-full bg-slate-800 shadow-xl" // Increased width and shadow
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} // Adjusted animation
            >
              <div className="flex justify-end p-4">
                {" "}
                {/* Increased padding */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" // Changed styling
                >
                  <X className="w-6 h-6" /> {/* Increased icon size */}
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col bg-slate-800 shadow-lg">
        {" "}
        {/* Increased width and added shadow */}
        {sidebarContent}
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
          {" "}
          {/* Added shadow, changed border */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" // Changed styling
          >
            <Menu className="w-6 h-6" /> {/* Increased icon size */}
          </button>
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out">
          {" "}
          {/* Changed bg-gray-50, updated padding to match Dashboard.tsx */}
          <Outlet />
        </main>
      </div>
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
