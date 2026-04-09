import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  TrendingUp,
  Clock,
  DollarSign,
  Menu,
  Settings,
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../baseurl";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Live Trends", icon: TrendingUp, path: "/livetrends" },
    { name: "History", icon: Clock, path: "/history" },
    { name: "Pricing", icon: DollarSign, path: "/pricing" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/getCurrentAccount`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1a1a1a] p-2 rounded-lg"
        onClick={() => setOpen(!open)}
      >
        <Menu size={20} />
      </button>

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-[#0b0b0b] border-r border-gray-800 p-5 flex flex-col justify-between transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 bg-lime-400 rounded-full"></div>
            <h1 className="text-lg font-semibold text-white">TikTokSlang</h1>
          </div>

          <nav className="space-y-2">
            {menu.map((item, i) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={i}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-lime-400 text-black font-medium"
                      : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.name}
                  </div>
                  {isActive && <span>→</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-500 space-y-2 px-2">
            <Link to="/support">
              <p className="hover:text-white cursor-pointer">Support</p>
            </Link>
            <Link to="/legal">
              <p className="hover:text-white cursor-pointer">Terms & Privacy</p>
            </Link>
          </div>

          <Link to="/account" className="cursor-pointer">
            <div className="flex items-center justify-between bg-[#111] p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || "https://i.pravatar.cc/40"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full"
                />
                <div className="text-sm">
                  <p className="text-white font-medium">
                    {user?.name || "Loading..."}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {user?.isPremium ? "Premium" : "Regular"}
                  </p>
                </div>
              </div>
              <Settings
                size={18}
                className="text-gray-400 hover:text-white cursor-pointer"
              />
            </div>
          </Link>

          <p
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/signup");
            }}
            className="text-center text-gray-500 text-sm cursor-pointer hover:text-white"
          >
            Logout
          </p>
        </div>
      </aside>
    </>
  );
}