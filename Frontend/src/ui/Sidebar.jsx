import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"; // Added useSetRecoilState
import { sidebarState, userState } from "../store/atoms.js";
import { useNavigate } from "react-router-dom"; // Added useNavigate
import api from "../api"; // Added api import
import { Homeicon } from "../icons/Homeicon";
import { Courses } from "../icons/Couses";
import { Your } from "../icons/Your";
import { Purchased } from "../icons/Purchased";
import Register from "../components/Register";
import Login from "../components/Login";
import { Logout } from "../icons/Logout"; // Added import for Logout
import { Settings, UserCircle, LayoutDashboard, Users, UserCog } from "lucide-react";

const menuItems = {
  common: [
    { title: "Home", icon: <Homeicon />, path: "/" },
    { title: "Courses", icon: <Courses />, path: "/courses" },
  ],
  user: [
    { title: "Purchased", icon: <Purchased />, path: "/purchased" },
    { title: "Profile & Settings", icon: <UserCircle size={20} />, path: "/profile" }
  ],
  admin: [
    { title: "Your Courses", icon: <Your />, path: "/admin/your-courses" },
    { title: "Profile & Settings", icon: <UserCircle size={20} />, path: "/profile" }
  ],
  superadmin: [
    { title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/superadmin/dashboard" },
    { title: "Manage Users", icon: <Users size={20} />, path: "/superadmin/users" },
    { title: "Manage Creators", icon: <UserCog size={20} />, path: "/superadmin/creators" },
    { title: "Profile & Settings", icon: <UserCircle size={20} />, path: "/profile" }
  ]
};

function Items({ title, icon, path, onClick }) {
  const location = useLocation();
  const selected = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <Link to={path} onClick={onClick}>
      <div
        className={`flex items-center justify-start w-43 h-12 px-3 py-2 my-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] ${selected
          ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm border-l-4 border-indigo-600 rounded-l-none"
          : "text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600"
          }`}
      >
        <div className={`mr-3 ${selected ? "text-indigo-600" : "text-slate-400"}`}>{icon}</div>
        <div>{title}</div>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useRecoilState(sidebarState);
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("type");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  let menu;
  if (user === "user") {
    menu = [...menuItems.common, ...menuItems.user];
  } else if (user === "admin") {
    menu = [...menuItems.common, ...menuItems.admin];
  } else if (user === "superadmin") {
    menu = [...menuItems.superadmin];
  } else {
    menu = menuItems.common;
  }

  // Animate content opacity for smoother appearance
  const contentOpacity = open ? "opacity-100" : "opacity-0 pointer-events-none";

  return (
    <div
      className={`absolute top-0 left-0 flex flex-col bg-slate-50 border-r border-slate-200/60 justify-start z-20 ${open ? "w-55 p-4" : "w-0 p-0"
        } h-full overflow-y-auto transition-all duration-400 ease-in-out`}
    >
      <div className={`transition-opacity duration-400 ${contentOpacity}`}>
        <div
          className="mb-3 text-[#475569] text-nowrap font-mono font-bold text-lg"
        >
          MAIN MENU
        </div>
        {menu.map((item) => (
          <Items
            key={item.title}
            icon={item.icon}
            title={item.title}
            path={item.path}
          />
        ))}
        {/* Account Section */}
        <div className="mt-8 border-t border-slate-300 pt-6">
          <div className="mb-3 text-[#475569] text-nowrap font-mono font-bold text-lg">
            ACCOUNT
          </div>
          {!user ? (
            <div className="flex flex-col gap-3 w-42 [&_button]:w-full [&_button]:m-0 [&_div]:w-full">
              <Login />
              <Register />
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-42">
              <Items
                title="Logout"
                icon={<Logout />}
                path="#"
                onClick={handleLogout}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}