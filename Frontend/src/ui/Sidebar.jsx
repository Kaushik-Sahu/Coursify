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

const menuItems = {
  common: [
    { title: "Home", icon: <Homeicon />, path: "/" },
    { title: "Courses", icon: <Courses />, path: "/courses" },
  ],
  user: [{ title: "Purchased", icon: <Purchased />, path: "/purchased" }],
  admin: [{ title: "Your Courses", icon: <Your />, path: "/admin/your-courses" }],
};

function Items({ title, icon, path, onClick }) {
  const location = useLocation();
  // Simplified and more robust path matching
  const selected = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <Link to={path} onClick={onClick}>
      <div
        className={`flex items-center justify-start w-42 h-12 p-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-200 hover:scale-105 ${
          selected ? "bg-slate-300 font-semibold" : ""
        }`}
      >
        <div className="mr-3">{icon}</div>
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
  } else {
    menu = menuItems.common;
  }

  // Animate content opacity for smoother appearance
  const contentOpacity = open ? "opacity-100" : "opacity-0 pointer-events-none";

  return (
    <div
      className={`absolute top-0 left-0 flex flex-col bg-[#f0f1f6] justify-start z-20 ${
        open ? "w-55 p-4" : "w-0 p-0"
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
        {!user && (
          <div className="flex flex-col md:hidden items-center self-end mt-9">
            <Register />
            <Login />
          </div>
        )}
        {user && ( // Consistent Logout button for mobile
          <div className="flex flex-col md:hidden items-center self-end mt-9">
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
  );
}