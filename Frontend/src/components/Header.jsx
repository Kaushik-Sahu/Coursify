import { useRecoilState, useRecoilValue } from "recoil";
import { sidebarState, userState } from "../store/atoms.js";
import { Logout } from "../icons/Logout";
import { Menuicon } from "../icons/Menuicon";
import { Search } from "../ui/Search";
import Login from "./Login";
import Register from "./Register";
import { Logo } from "../icons/Logo";

/**
 * The main header component for the application.
 * It includes the logo, a menu icon to toggle the sidebar, a search bar,
 * and conditional rendering for login/register or logout buttons based on user authentication state.
 */
export function Header() {
  const [open, setOpen] = useRecoilState(sidebarState);
  const user = useRecoilValue(userState);

  return (
    <header className="sticky top-0 left-0 w-full bg-white shadow-xl h-16 flex justify-between items-center z-50">
      <div className="px-2 flex items-center">
        <Menuicon onClick={() => setOpen(!open)} />
        <Logo />
      </div>
      <div className="flex items-center">
        <Search />
        
        {/* Conditionally render auth buttons based on user state */}
        {!user ? (
          // Show Login and Register buttons on medium screens and up when no user is logged in.
          <div className="hidden md:flex gap-4 mr-5 items-center">
            <Register />
            <Login />
          </div>
        ) : (
          // Show Logout button on medium screens and up when a user is logged in.
          <div className="hidden md:flex">
            <Logout />
          </div>
        )}
      </div>
    </header>
  );
}
