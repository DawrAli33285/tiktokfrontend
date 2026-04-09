import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";
import { useNavigate } from "react-router-dom";

const TOAST_CONTAINER_ID = "change-password-toast";

const api = axios.create({
  baseURL: BASE_URL,
});

export default function ChangePasswordPage() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !oldPassword || !newPassword) {
      toast.error("All fields are required.", { containerId: TOAST_CONTAINER_ID });
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password.", { containerId: TOAST_CONTAINER_ID });
      return;
    }

    setLoading(true);

    try {
      await api.put(
        "/change-password",
        { email, oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccess(true);
      toast.success("Password updated successfully!", { containerId: TOAST_CONTAINER_ID });

      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message, { containerId: TOAST_CONTAINER_ID });
    } finally {
      setLoading(false);
    }
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
    
          <div className="mb-8">
            <h2 className="text-xl font-black text-white">Change Password</h2>
            <p className="text-zinc-500 text-xs mt-1">Update your account password below.</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🔐</p>
              <p className="font-black text-white text-lg mb-1">Password Updated!</p>
              <p className="text-zinc-400 text-sm">Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <div className="space-y-4">
          
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
                <label className="text-xs text-zinc-500 block mb-1.5">Old Password</label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                />
              </div>

           
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition"
                />
              </div>

          
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
                style={{
                  background: "#D4F244",
                  color: "#000",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Updating…" : "Update Password"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-zinc-500 hover:text-white transition"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                ← Go Back
              </button>
            </div>
          )}
        </div>

        <p className="text-zinc-600 text-xs mt-6">
          Remembered your password?{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-[#D4F244] font-semibold hover:underline"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Log in
          </button>
        </p>
      </div>
    </>
  );
}