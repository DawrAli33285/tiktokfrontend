import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

import { useNavigate } from "react-router-dom";
const TOAST_CONTAINER_ID = "auth-toast-container";

const api = axios.create({
  baseURL: BASE_URL
});

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const navigate=useNavigate();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setAge("");
  };

  const handleSubmit = async () => {
    
    if (!email || !password) {
      toast.error("Email and password are required.", { containerId: TOAST_CONTAINER_ID });
      return;
    }
    if (!isLogin && (!name || !age)) {
      toast.error("All fields are required.", { containerId: TOAST_CONTAINER_ID });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post("/login", { email, password });

      
        localStorage.setItem("token", data.token);

        toast.success("Welcome back! Redirecting…", { containerId: TOAST_CONTAINER_ID });
        setSubmitted(true);

     navigate("/")
      } else {
        const { data } = await api.post("/register", { name, email, password, age });

  localStorage.setItem("token", data.token);

  toast.success("Account created! Welcome to TikTokSlang.", { containerId: TOAST_CONTAINER_ID });
  setSubmitted(true);
  navigate("/");  
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message, { containerId: TOAST_CONTAINER_ID });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setSubmitted(false);
    resetForm();
  };

  return (
    <>
   
      <ToastContainer
        containerId={TOAST_CONTAINER_ID}
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4 py-12">
     
        <div className="mb-8 text-center">
          <h1 className="font-black text-white text-2xl tracking-tight">
            TikTok<span className="text-[#D4F244]">Slang</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Trend detection. Before it blows up.</p>
        </div>

      
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        
          <div className="flex bg-zinc-800 rounded-2xl p-1 mb-8">
            <button
              onClick={() => switchMode("login")}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition"
              style={{
                background: isLogin ? "#D4F244" : "transparent",
                color: isLogin ? "#000" : "#71717a",
                cursor: "pointer",
              }}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode("register")}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition"
              style={{
                background: !isLogin ? "#D4F244" : "transparent",
                color: !isLogin ? "#000" : "#71717a",
                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">{isLogin ? "👋" : "✅"}</p>
              <p className="font-black text-white text-lg mb-1">
                {isLogin ? "Welcome back!" : "Account created!"}
              </p>
              <p className="text-zinc-400 text-sm">
                {isLogin
                  ? "Redirecting you to your dashboard..."
                  : "Redirecting you to your dashboard..."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Age</label>
                    <input
                      type="number"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-zinc-500">Password</label>
                  {isLogin && (
                    <a
                      href="/forget-password"
                      className="text-xs text-[#D4F244] hover:underline"
                      style={{ cursor: "pointer" }}
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                />
              </div>

              {!isLogin && (
                <p className="text-xs text-zinc-600 leading-relaxed">
                  By creating an account you agree to our{" "}
                  <a
                    href="/legal"
                    className="text-[#D4F244] hover:underline"
                    style={{ cursor: "pointer" }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/legal"
                    className="text-[#D4F244] hover:underline"
                    style={{ cursor: "pointer" }}
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
                style={{ background: "#D4F244", color: "#000", cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? (isLogin ? "Logging in…" : "Creating account…") : isLogin ? "Log In" : "Create Account"}
              </button>
            </div>
          )}
        </div>

     
        {!submitted && (
          <p className="text-zinc-600 text-xs mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="text-[#D4F244] font-semibold hover:underline"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {isLogin ? "Sign up free" : "Log in"}
            </button>
          </p>
        )}
      </div>
    </>
  );
}