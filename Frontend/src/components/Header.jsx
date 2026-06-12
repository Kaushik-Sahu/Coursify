import { useRecoilState } from "recoil";
import { sidebarState } from "../store/atoms.js";
import { Menuicon } from "../icons/Menuicon";
import { Search } from "../ui/Search";
import { Logo } from "../icons/Logo";

/**
 * The main header component for the application.
 * It includes the logo, a menu icon to toggle the sidebar, and a search bar.
 */
export function Header() {
  const [open, setOpen] = useRecoilState(sidebarState);

  return (
    <header className="sticky top-0 left-0 w-full bg-white shadow-xl h-16 flex justify-between items-center z-50">
      <div className="px-2 flex items-center">
        <Menuicon onClick={() => setOpen(!open)} />
        <Logo />
      </div>
      <div className="flex items-center mr-5">
        <Search />
      </div>
    </header>
  );
}
