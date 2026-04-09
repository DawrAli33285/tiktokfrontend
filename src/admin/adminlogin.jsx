import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../baseurl";
import { useNavigate } from "react-router-dom";

const TOAST_ID = "admin-login-toast";
const api = axios.create({ baseURL: BASE_URL });

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required.", { containerId: TOAST_ID });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin)); 
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials.", { containerId: TOAST_ID });
      setPassword(""); 
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <ToastContainer containerId={TOAST_ID} position="top-center" autoClose={4000} theme="dark" />
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4">
        <div className="mb-8 text-center">
          <h1 className="font-black text-white text-2xl tracking-tight">
            TikTok<span className="text-[#D4F244]">Slang</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Admin Panel</p>
        </div>

        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-lg font-black mb-1">Admin Login</h2>
          <p className="text-zinc-500 text-xs mb-6">Restricted access only.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="admin@tiktokslang.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
              style={{ background: "#D4F244", color: "#000", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}