
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../baseurl";

const api = axios.create({ baseURL: BASE_URL });
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

const OUTCOME_STYLES = {
  correct: {
    bg: "#1a2e0a", text: "#D4F244", border: "#3a5c14", label: "✓ Correct",
  },
  incorrect: {
    bg: "#2e0a0a", text: "#f87171", border: "#5c1414", label: "✗ Incorrect",
  },
  pending: {
    bg: "#1e1e1e", text: "#71717a", border: "#3f3f46", label: "Pending",
  },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

const toInputDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");


function StatCard({ label, value, accent }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4">
      <p
        className="text-2xl font-black"
        style={{ color: accent ? "#D4F244" : "white" }}
      >
        {value ?? "—"}
      </p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function OutcomePill({ outcome }) {
  const s = OUTCOME_STYLES[outcome] || OUTCOME_STYLES.pending;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-4 border-b border-zinc-800 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-zinc-800 rounded" />
        <div className="h-3 w-24 bg-zinc-800 rounded" />
      </div>
      <div className="h-6 w-20 bg-zinc-800 rounded-full" />
      <div className="h-4 w-24 bg-zinc-800 rounded hidden md:block" />
      <div className="h-4 w-12 bg-zinc-800 rounded hidden md:block" />
      <div className="h-4 w-16 bg-zinc-800 rounded hidden md:block" />
      <div className="flex gap-2">
        <div className="h-7 w-12 bg-zinc-800 rounded-lg" />
        <div className="h-7 w-16 bg-zinc-800 rounded-lg" />
      </div>
    </div>
  );
}


function PredictionModal({ initial, onClose, onSave, trendSearch }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState({
    trendId: initial?.trend?._id || "",
    trendQuery: initial?.trend?.title || "",
    outcome: initial?.outcome || "pending",
    confirmedAt: toInputDate(initial?.confirmedAt),
    peakGrowthRate: initial?.peakGrowthRate ?? "",
    notes: initial?.notes || "",
  });
  const [trendResults, setTrendResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!form.trendQuery || form.trendId) {
      setTrendResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await trendSearch(form.trendQuery);
        setTrendResults(res);
      } catch {
        setTrendResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [form.trendQuery, form.trendId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectTrend = (trend) => {
    set("trendId", trend._id);
    set("trendQuery", trend.title);
    setTrendResults([]);
  };

  const clearTrend = () => {
    set("trendId", "");
    set("trendQuery", "");
  };

  const handleSave = async () => {
    if (!form.trendId) {
      toast.error("Please select a trend.", { containerId: "admin-pred-toast" });
      return;
    }
    setSaving(true);
    try {
      await onSave({
        trendId: form.trendId,
        outcome: form.outcome,
        confirmedAt: form.confirmedAt || null,
        peakGrowthRate: form.peakGrowthRate !== "" ? Number(form.peakGrowthRate) : null,
        notes: form.notes,
      });
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save prediction.",
        { containerId: "admin-pred-toast" }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="font-black text-white text-lg mb-5">
          {isEdit ? "Edit Prediction" : "Create Prediction"}
        </h2>

       
        <div className="mb-4">
          <label className="block text-xs text-zinc-400 mb-1.5">
            Linked Trend <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search trend by title..."
              value={form.trendQuery}
              onChange={(e) => {
                set("trendQuery", e.target.value);
                set("trendId", ""); 
              }}
              disabled={isEdit}
              className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4F244] transition disabled:opacity-50"
            />
           
            {form.trendId && !isEdit && (
              <button
                onClick={clearTrend}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
            {form.trendId && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                style={{ color: "#D4F244" }}
              >
                {!isEdit ? "" : "linked"}
              </span>
            )}
          </div>

          
          {trendResults.length > 0 && (
            <div className="mt-1 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
              {trendResults.map((t) => (
                <button
                  key={t._id}
                  onClick={() => selectTrend(t)}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition text-sm text-white border-b border-zinc-800 last:border-0"
                >
                  <span className="font-medium">{t.title}</span>
                  <span className="text-zinc-500 ml-2 text-xs">/{t.slug}</span>
                </button>
              ))}
            </div>
          )}
          {searchLoading && (
            <p className="text-xs text-zinc-500 mt-1">Searching...</p>
          )}
        </div>

       
        <div className="mb-4">
          <label className="block text-xs text-zinc-400 mb-1.5">Outcome</label>
          <select
            value={form.outcome}
            onChange={(e) => set("outcome", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4F244] cursor-pointer transition"
          >
            <option value="pending">Pending</option>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
          </select>
        </div>

        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Confirmed Date
            </label>
            <input
              type="date"
              value={form.confirmedAt}
              onChange={(e) => set("confirmedAt", e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#D4F244] transition"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Peak Growth Rate (%)
            </label>
            <input
              type="number"
              placeholder="e.g. 340"
              value={form.peakGrowthRate}
              onChange={(e) => set("peakGrowthRate", e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#D4F244] transition"
            />
          </div>
        </div>

       
        <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.trendId}
            className="px-5 py-2 text-sm font-bold rounded-xl disabled:opacity-50 transition"
            style={{ background: "#D4F244", color: "#000" }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Prediction"}
          </button>
        </div>
      </div>
    </div>
  );
}


const TABS = [
  { key: "all", label: "All" },
  { key: "correct", label: "✓ Correct" },
  { key: "incorrect", label: "✗ Incorrect" },
  { key: "pending", label: "Pending" },
];

export default function AdminPredictions() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const fetchPredictions = useCallback(async (outcomeFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (outcomeFilter && outcomeFilter !== "all") params.outcome = outcomeFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/admin/predictions", {
        ...authHeader(),
        params,
      });

      setPredictions(data.predictions || []);
      setStats(data.stats);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }
      toast.error("Failed to load predictions.", { containerId: "admin-pred-toast" });
    } finally {
      setLoading(false);
    }
  }, [search, navigate]);

  useEffect(() => {
    fetchPredictions(tab);
  }, [tab]);

  
  useEffect(() => {
    const t = setTimeout(() => fetchPredictions(tab), 400);
    return () => clearTimeout(t);
  }, [search]);

  
  const searchTrends = async (q) => {
    const { data } = await api.get("/admin/trends", {
      ...authHeader(),
      params: { search: q, limit: 8 },
    });
    return data.trends || [];
  };

 
  const handleCreate = async (payload) => {
    const { data } = await api.post("/admin/predictions", payload, authHeader());
    setPredictions((prev) => [data.prediction, ...prev]);
    toast.success("Prediction created.", { containerId: "admin-pred-toast" });
    fetchPredictions(tab); 
  };

  const handleUpdate = async (id, payload) => {
    const { data } = await api.patch(`/admin/predictions/${id}`, payload, authHeader());
    setPredictions((prev) =>
      prev.map((p) => (p._id === id ? data.prediction : p))
    );
    toast.success("Prediction updated.", { containerId: "admin-pred-toast" });
    fetchPredictions(tab);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this prediction? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/predictions/${id}`, authHeader());
      setPredictions((prev) => prev.filter((p) => p._id !== id));
      toast.success("Prediction deleted.", { containerId: "admin-pred-toast" });
      fetchPredictions(tab);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete.",
        { containerId: "admin-pred-toast" }
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  
  return (
    <div className="bg-black text-white min-h-screen">
      <ToastContainer containerId="admin-pred-toast" position="top-right" autoClose={3500} />

     
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="font-black text-white text-xl tracking-tight">
          TikTok<span className="text-[#D4F244]">Slang</span>
          <span className="text-zinc-500 text-sm font-normal ml-2">Admin</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            ← Trends
          </button>
          <button
            onClick={() => navigate("/admin/categories")}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            Categories
          </button>
          <button
            onClick={() => setModal({ mode: "create", data: null })}
            className="text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition"
            style={{ background: "#D4F244", color: "#000" }}
          >
            + New Prediction
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
          <StatCard label="Total Predictions" value={stats?.total} accent />
          <StatCard label="Correct" value={stats?.totalCorrect} />
          <StatCard label="Incorrect" value={stats?.totalIncorrect} />
          <StatCard
            label="Accuracy Rate"
            value={stats?.accuracyRate != null ? `${stats.accuracyRate}%` : "—"}
            accent
          />
        </div>

        
        <div className="relative mb-5 max-w-sm">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            width="13" height="13" viewBox="0 0 16 16" fill="none"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by trend title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition"
          />
        </div>

        
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === t.key
                  ? "bg-[#D4F244] text-black"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-sm">Predictions</h2>
            <span className="text-zinc-500 text-xs">
              {loading ? "Loading..." : `${predictions.length} items`}
            </span>
          </div>

        
          <div className="hidden md:grid grid-cols-[1fr_110px_120px_80px_90px_160px] gap-4 px-5 py-2.5 bg-zinc-800/50 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <span>Trend</span>
            <span>Outcome</span>
            <span>Confirmed</span>
            <span>Days Early</span>
            <span>Peak Growth</span>
            <span>Actions</span>
          </div>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : predictions.length === 0 ? (
            <div className="py-20 text-center text-zinc-600">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-sm">No predictions found</p>
              <button
                onClick={() => setModal({ mode: "create", data: null })}
                className="mt-3 text-[#D4F244] text-sm hover:underline"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Create the first one →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {predictions.map((p) => (
                <div
                  key={p._id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_110px_120px_80px_90px_160px] gap-4 items-center px-5 py-4 hover:bg-zinc-800/30 transition"
                >
              
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">
                      {p.trend?.title || "—"}
                    </p>
                    <p className="text-zinc-500 text-xs truncate">
                      /{p.trend?.slug}
                      {p.trend?.category?.name && (
                        <span className="ml-2 text-zinc-600">
                          · {p.trend.category.name}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <OutcomePill outcome={p.outcome} />
                  </div>

                  <div className="text-sm text-zinc-400">
                    {formatDate(p.confirmedAt)}
                  </div>

                  <div className="font-bold text-sm">
                    {p.trend?.daysToViral != null ? `${p.trend.daysToViral}d` : "—"}
                  </div>

                  <div className="font-bold text-sm">
                    {p.peakGrowthRate != null ? `+${p.peakGrowthRate}%` : "—"}
                  </div>

                
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModal({ mode: "edit", data: p })}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-900 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => navigate(`/admin/trend/${p.trend?._id}`)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition"
                      title="View public trend page"
                    >
                      ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

     
      {modal && (
        <PredictionModal
          initial={modal.data}
          onClose={() => setModal(null)}
          trendSearch={searchTrends}
          onSave={
            modal.mode === "create"
              ? handleCreate
              : (payload) => handleUpdate(modal.data._id, payload)
          }
        />
      )}
    </div>
  );
}

/*
─────────────────────────────────────────────────────────────
  ADD THIS BUTTON TO AdminDashboard.jsx navbar (next to Categories button):

  <button
    onClick={() => navigate("/admin/predictions")}
    className="text-sm font-medium px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
  >
    Predictions
  </button>
─────────────────────────────────────────────────────────────
*/