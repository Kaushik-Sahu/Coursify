import { useRecoilValue, useSetRecoilState } from "recoil";
import { sidebarState } from "./store/atoms.js";
import { Header } from "./components/Header";
import { Sidebar } from "./ui/Sidebar";
import AppRoutes from "./routes";

function App() {
  const open = useRecoilValue(sidebarState);
  const setOpen = useSetRecoilState(sidebarState);

  return (
    <div className="h-screen flex flex-col">
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
          className={`h-full overflow-y-auto transition-all duration-500 bg-gray-50 ${
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