import { useSetRecoilState, useRecoilValue } from "recoil";
import { userState } from "../store/atoms.js";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export function Logout() {
  const setUser = useSetRecoilState(userState);
  const userType = useRecoilValue(userState);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const url = userType === 'user' ? `/users/logout` : `/admin/logout`;
      await api.post(url);
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="mx-1 hover:scale-110" onClick={handleLogout}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
        />
      </svg>
    </div>
  );
}
