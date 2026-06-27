import { useRecoilState } from "recoil";
import { sidebarState, darkModeState } from "../store/atoms.js";
import { Menuicon } from "../icons/Menuicon";
import { Search } from "../ui/Search";
import { Logo } from "../icons/Logo";
import { Sun, Moon } from "lucide-react";

/**
 * The main header component for the application.
 * It includes the logo, a menu icon to toggle the sidebar, a dark mode toggle, and a search bar.
 */
export function Header() {
  const [open, setOpen] = useRecoilState(sidebarState);
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem("darkMode", String(nextVal));
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
        <Search />
      </div>
    </header>
  );
}
