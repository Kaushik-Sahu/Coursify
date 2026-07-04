import { useState, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { sidebarState, darkModeState, userState } from "../store/atoms.js";
import { Menuicon } from "../icons/Menuicon";
import { Search } from "../ui/Search";
import { Logo } from "../icons/Logo";
import { Sun, Moon, Bell, CheckCircle2 } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

/**
 * The main header component for the application.
 * It includes the logo, a menu icon to toggle the sidebar, a dark mode toggle, notifications, and a search bar.
 */
export function Header() {
  const [open, setOpen] = useRecoilState(sidebarState);
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);
  const user = useRecoilValue(userState);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem("darkMode", String(nextVal));
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 h-16 flex justify-between items-center z-50">
      <div className="px-2 flex items-center">
        <Menuicon onClick={() => setOpen(!open)} className="size-7 text-slate-700 dark:text-slate-300" />
        <Logo />
      </div>
      <div className="flex items-center gap-2 mr-5">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in origin-top-right">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No notifications right now.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => !notif.read && markAsRead(notif._id)}
                          className={`p-4 border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 transition-colors ${notif.read ? 'bg-white dark:bg-slate-900 opacity-70' : 'bg-indigo-50/30 dark:bg-indigo-950/20 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40'}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${notif.read ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-900 dark:text-white font-bold'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notif.read && (
                              <button onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }} className="text-indigo-500 hover:text-indigo-600 shrink-0" title="Mark as read">
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Search />
      </div>
    </header>
  );
}
