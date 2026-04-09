import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../baseurl";

const api = axios.create({ baseURL: BASE_URL });

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

const STATUS_COLORS = {
  trending:       { bg: "#1a2e0a", text: "#D4F244", border: "#3a5c14" },
  detected:       { bg: "#1a1f2e", text: "#93c5fd", border: "#2a3a5c" },
  peaked:         { bg: "#2e1a0a", text: "#fb923c", border: "#5c3a14" },
  dead:           { bg: "#2e0a0a", text: "#f87171", border: "#5c1414" },
  never_took_off: { bg: "#1e1e1e", text: "#71717a", border: "#3f3f46" },
};

export default function AdminDashboard() {
  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const { data } = await api.get("/admin/trends", authHeader());
      setTrends(data.trends || []);
 
      const s = { total: data.trends.length, published: 0, hidden: 0, trending: 0 };
      data.trends.forEach((t) => {
        if (t.isPublished) s.published++;
        if (t.isHidden) s.hidden++;
        if (t.status === "trending") s.trending++;
      });
      setStats(s);
    } catch {
        if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
          }
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id, current) => {
    try {
      await api.put(`/admin/trends/${id}`, { isPublished: !current }, authHeader());
      setTrends((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isPublished: !current } : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  const toggleHidden = async (id, current) => {
    try {
      await api.put(`/admin/trends/${id}`, { isHidden: !current }, authHeader());
      setTrends((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isHidden: !current } : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  const deleteTrend = async (id) => {
    if (!confirm("Delete this trend? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/trends/${id}`, authHeader());
      setTrends((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="bg-black text-white min-h-screen">
   
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="font-black text-white text-xl tracking-tight">
          TikTok<span className="text-[#D4F244]">Slang</span>
          <span className="text-zinc-500 text-sm font-normal ml-2">Admin</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/trends/new")}
            className="text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition"
            style={{ background: "#D4F244", color: "#000" }}
          >
            + New Trend
          </button>
          <button
  onClick={() => navigate("/admin/categories")}
  className="text-sm font-medium px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
>
  Categories
</button>

<button
  onClick={() => navigate("/admin/predictions")}
  className="text-sm font-medium px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
>
  Predictions
</button>
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-white transition px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Trends", value: stats.total ?? 0 },
            { label: "Published",    value: stats.published ?? 0 },
            { label: "Trending Now", value: stats.trending ?? 0 },
            { label: "Hidden",       value: stats.hidden ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>

       
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-sm">All Trends</h2>
            <span className="text-zinc-500 text-xs">{trends.length} items</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-zinc-600 text-sm">Loading…</div>
          ) : trends.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm">
              No trends yet.{" "}
              <button
                onClick={() => navigate("/admin/trends/new")}
                className="text-[#D4F244] hover:underline"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Create one →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {trends.map((trend) => {
                const sc = STATUS_COLORS[trend.status] || STATUS_COLORS.detected;
                return (
                  <div
                    key={trend._id}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-zinc-800/40 transition"
                  >
                   
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm truncate">{trend.title}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                        >
                          {trend.status.replace("_", " ")}
                        </span>
                        {trend.isHidden && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                            hidden
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs truncate">/{trend.slug}</p>
                    </div>

                    
                    {trend.rfciScore != null && (
                      <div className="hidden md:block text-center">
                        <p className="text-xs text-zinc-500">RFCI</p>
                        <p className="font-bold text-sm text-[#D4F244]">{trend.rfciScore}</p>
                      </div>
                    )}

                 
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => togglePublish(trend._id, trend.isPublished)}
                        className="text-xs px-3 py-1.5 rounded-lg border transition font-medium"
                        style={{
                          borderColor: trend.isPublished ? "#3a5c14" : "#3f3f46",
                          color: trend.isPublished ? "#D4F244" : "#71717a",
                          background: trend.isPublished ? "#1a2e0a" : "transparent",
                        }}
                      >
                        {trend.isPublished ? "Published" : "Publish"}
                      </button>
                      <button
                        onClick={() => toggleHidden(trend._id, trend.isHidden)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 transition"
                      >
                        {trend.isHidden ? "Unhide" : "Hide"}
                      </button>
                      <button
                        onClick={() => navigate(`/admin/trends/edit/${trend._id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTrend(trend._id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-900 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}