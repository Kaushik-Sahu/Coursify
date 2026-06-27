import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { sidebarState, darkModeState } from "./store/atoms.js";
import { Header } from "./components/Header";
import { Sidebar } from "./ui/Sidebar";
import AppRoutes from "./routes";
import { useLocation } from "react-router-dom";

function App() {
  const open = useRecoilValue(sidebarState);
  const setOpen = useSetRecoilState(sidebarState);
  const darkMode = useRecoilValue(darkModeState);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // SuperAdmin login is a full-screen page — hide the app shell.
  const isFullScreenRoute = location.pathname === '/superadmin/login';

  if (isFullScreenRoute) {
    return <AppRoutes />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Header />
      <div className="flex-grow relative overflow-hidden">
        <Sidebar />
        {open && (
          <div
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-10"
          ></div>
        )}
        <div
          className={`h-full overflow-y-auto transition-all duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${
            open ? "md:ml-55" : "ml-0"
          }`}
        >
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

export default App;