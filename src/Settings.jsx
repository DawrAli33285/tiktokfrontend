import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatJoinDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);


function MiniChart({ status }) {
  const color =
    status === "trending" ? "#D4F244" :
    status === "peaked"   ? "#f5c97a" : "#f87171";
  return (
    <svg viewBox="0 0 80 30" preserveAspectRatio="none" className="w-full h-full">
      <path fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        d={
          status === "trending"
            ? "M0,25 C20,22 40,15 60,8 C70,5 75,3 80,1"
            : status === "peaked"
            ? "M0,15 C20,13 40,12 60,14 C70,16 75,18 80,20"
            : "M0,8 C20,10 40,15 60,22 C70,25 75,27 80,28"
        }
      />
    </svg>
  );
}

function StatusBadge({ status }) {
  const map = {
    trending:       "bg-lime-900 text-[#D4F244]",
    peaked:         "bg-yellow-900 text-yellow-400",
    dead:           "bg-red-900 text-red-400",
    detected:       "bg-blue-900 text-blue-400",
    never_took_off: "bg-zinc-800 text-zinc-400",
  };
  const emoji = {
    trending: "🔥", peaked: "📈", dead: "💀", detected: "🔍", never_took_off: "😶",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${map[status] ?? "bg-zinc-800 text-zinc-400"}`}>
      {emoji[status] ?? ""} {status?.replace("_", " ") ?? "unknown"}
    </span>
  );
}


function Avatar({ name, avatar, size = "w-16 h-16" }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${size} rounded-2xl object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-2xl bg-[#D4F244] flex items-center justify-center flex-shrink-0`}>
      <span className="font-black text-black text-lg">{getInitials(name)}</span>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-8 animate-pulse">
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-900">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-zinc-800 rounded" />
          <div className="h-4 w-48 bg-zinc-900 rounded" />
          <div className="h-4 w-24 bg-zinc-900 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-2xl px-4 py-4 h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-3xl h-48" />
        ))}
      </div>
    </div>
  );
}


function SettingsModal({ user, onClose, onUserUpdate }) {
  const [tab, setTab] = useState("profile");

  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ?? null);
  const [savingAvatar,  setSavingAvatar]  = useState(false);

 
  const [name,          setName]          = useState(user.name  ?? "");
  const [email,         setEmail]         = useState(user.email ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

 
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw,  setSavingPw]  = useState(false);


  const [notifNewTrend,   setNotifNewTrend]   = useState(user.settings?.emailNotifications?.newTrendAlerts      ?? true);
  const [notifPrediction, setNotifPrediction] = useState(user.settings?.emailNotifications?.predictionConfirmed ?? true);
  const [notifWeekly,     setNotifWeekly]     = useState(user.settings?.emailNotifications?.weeklyDigest        ?? false);
  const [savingNotif,     setSavingNotif]     = useState(false);

  const [preferredRfciType, setPreferredRfciType] = useState(user.settings?.preferredRfciType ?? "");
  const [savingPrefs,       setSavingPrefs]       = useState(false);

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition";
  const tabs = ["profile", "password"];


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return toast.error("Please select an image first.", { containerId: "account-toast" });
    setSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await axios.put(`${BASE_URL}/update-avatar`, formData, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
      });
      onUserUpdate(res.data.user);
      setAvatarFile(null);
      toast.success("Avatar updated!", { containerId: "account-toast" });
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update avatar.", { containerId: "account-toast" });
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim())  return toast.error("Name cannot be empty.",  { containerId: "account-toast" });
    if (!email.trim()) return toast.error("Email cannot be empty.", { containerId: "account-toast" });
    setSavingProfile(true);
    try {
      const res = await axios.put(`${BASE_URL}/update-profile`, { name, email }, { headers: getAuthHeaders() });
      onUserUpdate(res.data.user);
      toast.success("Profile updated successfully.", { containerId: "account-toast" });
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update profile.", { containerId: "account-toast" });
    } finally { setSavingProfile(false); }
  };

  const handleSavePassword = async () => {
    if (!currentPw || !newPw || !confirmPw)
      return toast.error("Please fill in all password fields.", { containerId: "account-toast" });
    if (newPw !== confirmPw)
      return toast.error("New passwords do not match.", { containerId: "account-toast" });
    if (newPw.length < 8)
      return toast.error("Password must be at least 8 characters.", { containerId: "account-toast" });
    setSavingPw(true);
    try {
      await axios.put(`${BASE_URL}/update-password`, { currentPassword: currentPw, newPassword: newPw }, { headers: getAuthHeaders() });
      toast.success("Password updated successfully.", { containerId: "account-toast" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update password.", { containerId: "account-toast" });
    } finally { setSavingPw(false); }
  };

  const handleSaveNotifications = async () => {
    setSavingNotif(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/update-profile`,
        { emailNotifications: { newTrendAlerts: notifNewTrend, predictionConfirmed: notifPrediction, weeklyDigest: notifWeekly } },
        { headers: getAuthHeaders() }
      );
      onUserUpdate(res.data.user);
      toast.success("Notification preferences saved.", { containerId: "account-toast" });
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save notifications.", { containerId: "account-toast" });
    } finally { setSavingNotif(false); }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/update-profile`,
        { preferredRfciType: preferredRfciType || null },
        { headers: getAuthHeaders() }
      );
      onUserUpdate(res.data.user);
      toast.success("Preferences saved.", { containerId: "account-toast" });
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save preferences.", { containerId: "account-toast" });
    } finally { setSavingPrefs(false); }
  };

 
  const SaveButton = ({ onClick, loading, label = "Save" }) => (
    <button onClick={onClick} disabled={loading}
      className="w-full cursor-pointer bg-[#D4F244] text-black font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50">
      {loading ? "Saving..." : label}
    </button>
  );

  const Toggle = ({ val, set }) => (
    <button onClick={() => set(!val)}
      className={`w-12 h-6 rounded-full transition relative cursor-pointer ${val ? "bg-[#D4F244]" : "bg-zinc-700"}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${val ? "left-7" : "left-1"}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

       
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
          <h2 className="font-black text-white text-xl">Settings</h2>
          <button onClick={onClose}
            className="w-8 h-8 cursor-pointer rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition">✕</button>
        </div>

       
        <div className="flex gap-1 px-6 py-3 border-b border-zinc-800 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 cursor-pointer py-2 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                tab === t ? "bg-[#D4F244] text-black" : "text-zinc-400 hover:bg-zinc-800"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="px-6 py-6 space-y-5">

          {tab === "profile" && (
            <>
            
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <Avatar name={user.name} avatar={avatarPreview} size="w-16 h-16" />
                 
                  <label htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4F244] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                    title="Change avatar">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M7 1L9 3L3.5 8.5H1.5V6.5L7 1Z" stroke="black" strokeWidth="1.2" strokeLinejoin="round" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{user.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                  {avatarFile && (
                    <p className="text-xs text-[#D4F244] mt-1 truncate max-w-[180px]">
                      {avatarFile.name}
                    </p>
                  )}
                </div>
              </div>

           
              {avatarFile && (
                <SaveButton onClick={handleSaveAvatar} loading={savingAvatar} label="Save Avatar" />
              )}

              
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>

              
              <div className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Current Plan</p>
                  <p className="text-xs text-zinc-500">{user.isPremium ? "Pro — renews monthly" : "Free plan"}</p>
                </div>
                <span className="bg-[#D4F244] text-black text-xs font-bold px-3 py-1 rounded-full">
                  {user.isPremium ? "Pro" : "Free"}
                </span>
              </div>

              <SaveButton onClick={handleSaveProfile} loading={savingProfile} label="Save Changes" />
            </>
          )}

         
          {tab === "password" && (
            <>
              {[
                { label: "Current Password",     val: currentPw, set: setCurrentPw },
                { label: "New Password",         val: newPw,     set: setNewPw     },
                { label: "Confirm New Password", val: confirmPw, set: setConfirmPw },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
                  <input type="password" value={val} onChange={(e) => set(e.target.value)}
                    placeholder="••••••••" className={inputCls} />
                </div>
              ))}
              <div className="bg-zinc-900 rounded-xl px-4 py-3">
                <p className="text-xs text-zinc-500 leading-relaxed">Password must be at least 8 characters.</p>
              </div>
              <SaveButton onClick={handleSavePassword} loading={savingPw} label="Update Password" />
            </>
          )}

          
          {tab === "notifications" && (
            <>
              {[
                { label: "New trend alerts",     desc: "Get notified when a new trend is detected",  val: notifNewTrend,   set: setNotifNewTrend   },
                { label: "Prediction confirmed", desc: "Notify when a watchlisted trend goes viral", val: notifPrediction, set: setNotifPrediction },
                { label: "Weekly digest",        desc: "A weekly summary of top trends",             val: notifWeekly,     set: setNotifWeekly     },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle val={item.val} set={item.set} />
                </div>
              ))}
              <SaveButton onClick={handleSaveNotifications} loading={savingNotif} label="Save Preferences" />
            </>
          )}

          
          {tab === "preferences" && (
            <>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Preferred RFCI Type</label>
                <select value={preferredRfciType} onChange={(e) => setPreferredRfciType(e.target.value)} className={inputCls}>
                  <option value="">No preference</option>
                  <option value="impact">Impact</option>
                  <option value="acceleration">Acceleration</option>
                  <option value="widespread">Widespread</option>
                </select>
              </div>
              <div className="bg-zinc-900 rounded-xl px-4 py-4">
                <p className="text-sm font-semibold text-white mb-1">Subscription</p>
                <p className="text-xs text-zinc-500 mb-3">You are on the {user.isPremium ? "Pro" : "Free"} plan.</p>
                <div className="flex gap-2">
                  <button onClick={() => toast.info("Upgrade flow coming soon.", { containerId: "account-toast" })}
                    className="flex-1 cursor-pointer bg-zinc-800 text-white text-xs font-semibold py-2 rounded-xl hover:bg-zinc-700 transition">
                    {user.isPremium ? "Upgrade to Agency" : "Upgrade to Pro"}
                  </button>
                  {user.isPremium && (
                    <button className="text-xs text-red-400 hover:text-red-300 px-3 transition cursor-pointer">Cancel plan</button>
                  )}
                </div>
              </div>
              <SaveButton onClick={handleSavePreferences} loading={savingPrefs} label="Save Preferences" />
            </>
          )}

        </div>
      </div>
    </div>
  );
}


export default function AccountPage() {
  const [user,         setUser]         = useState(null);
  const [watchlist,    setWatchlist]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [removingId,   setRemovingId]   = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab,    setActiveTab]    = useState("watchlist");

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/getCurrentAccount`, { headers: getAuthHeaders() });
        setUser(res.data.user);
        setWatchlist(res.data.watchlist ?? []);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Please log in to view your account.", { containerId: "account-toast" });
        } else {
          toast.error("Failed to load account details.", { containerId: "account-toast" });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  const removeFromWatchlist = async (trendId, itemId) => {
    setRemovingId(itemId);
    try {
      await axios.delete(`${BASE_URL}/watchlist/${trendId}`, { headers: getAuthHeaders() });
      setWatchlist((prev) => prev.filter((w) => w._id !== itemId));
      toast.success("Removed from watchlist.", { containerId: "account-toast" });
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to remove.", { containerId: "account-toast" });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <AccountSkeleton />;

  if (!user) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <ToastContainer containerId="account-toast" position="top-right" autoClose={4000} />
        <div className="text-center px-6">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-2xl font-black mb-2">Not Logged In</h2>
          <p className="text-zinc-400 text-sm">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  const trendingCount = watchlist.filter((w) => w.trend?.status === "trending").length;

  return (
    <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-8">
      <ToastContainer containerId="account-toast" position="top-right" autoClose={4000} />

      {settingsOpen && (
        <SettingsModal
          user={user}
          onClose={() => setSettingsOpen(false)}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-zinc-900">
        <div className="flex items-center gap-4">
       
          <Avatar name={user.name} avatar={user.avatar} />
          <div>
            <h1 className="text-xl font-black text-white">{user.name}</h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#D4F244] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                {user.isPremium ? "Pro" : "Free"}
              </span>
              <span className="text-xs text-zinc-600">Member since {formatJoinDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 cursor-pointer bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-zinc-800 transition">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 9.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 7.5a5 5 0 11-10 0 5 5 0 0110 0z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
          Settings
        </button>
      </div>

     
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Saved Trends", value: watchlist.length },
          { label: "Trending Now", value: trendingCount    },
          { label: "Categories",   value: new Set(watchlist.map((w) => w.trend?.category?.name).filter(Boolean)).size },
          { label: "Joined",       value: new Date(user.createdAt).getFullYear() },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 rounded-2xl px-4 py-4">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

     
      <div className="flex gap-2 mb-6">
        {["watchlist"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold capitalize transition ${
              activeTab === t ? "bg-[#D4F244] text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
            {t === "watchlist" ? "🔖 Watchlist" : "🕐 Activity"}
          </button>
        ))}
      </div>

   
      {activeTab === "watchlist" && (
        watchlist.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-4xl mb-3">🔖</p>
            <p className="font-semibold">No saved trends yet</p>
            <p className="text-sm mt-1">Browse the Live Trends page and save ones you want to track</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {watchlist.map((item) => {
              const trend      = item.trend;
              const isRemoving = removingId === item._id;
              return (
                <div key={item._id}
                  className={`bg-zinc-900 rounded-3xl p-5 flex flex-col border border-zinc-800 hover:border-zinc-700 transition ${isRemoving ? "opacity-50" : ""}`}>

                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge status={trend?.status} />
                    <button
                      onClick={() => removeFromWatchlist(trend?._id, item._id)}
                      disabled={isRemoving}
                      className="text-zinc-600 cursor-pointer hover:text-red-400 transition text-xs disabled:cursor-not-allowed">
                      {isRemoving ? "..." : "✕"}
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1 leading-snug">{trend?.title}</h3>
                  <p className="text-xs text-zinc-500 mb-3">
                    {trend?.category?.name ?? "—"} · Saved {formatDate(item.createdAt)}
                  </p>

                  <div className="h-8 mb-3">
                    <MiniChart status={trend?.status} />
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
                    <div>
                      <p className="text-xs text-zinc-500">RFCI Score</p>
                      <p className="font-black text-white">{trend?.rfciScore ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Growth</p>
                      <p className={`font-black ${(trend?.growthRate ?? 0) >= 0 ? "text-[#D4F244]" : "text-red-400"}`}>
                        {trend?.growthRate != null ? `+${trend.growthRate}%` : "—"}
                      </p>
                    </div>
                    <a href={`/trends/${trend?.slug}`}
                      className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-white text-sm hover:bg-[#D4F244] hover:text-black transition">
                      ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}


      {activeTab === "activity" && (
        <div className="space-y-3">
          {watchlist.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-12">No activity yet.</p>
          )}
          {watchlist.map((item, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg flex-shrink-0">
                🔖
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  Saved trend — <span className="text-[#D4F244]">{item.trend?.title}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}