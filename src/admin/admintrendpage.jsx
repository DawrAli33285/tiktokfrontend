
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../baseurl";

const api = axios.create({ baseURL: BASE_URL });
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});


const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_STYLES = {
  trending:       { bg: "#1a2e0a", text: "#D4F244", border: "#3a5c14", label: "🔥 Trending" },
  detected:       { bg: "#1a1f2e", text: "#93c5fd", border: "#2a3a5c", label: "🔍 Detected" },
  peaked:         { bg: "#2e1a0a", text: "#fb923c", border: "#5c3a14", label: "📈 Peaked" },
  dead:           { bg: "#2e0a0a", text: "#f87171", border: "#5c1414", label: "💀 Dead" },
  never_took_off: { bg: "#1e1e1e", text: "#71717a", border: "#3f3f46", label: "😶 Never Took Off" },
};

const OUTCOME_STYLES = {
  correct:   { bg: "#0a2e1a", text: "#4ade80", border: "#14532d", label: "✓ Correctly Called" },
  incorrect: { bg: "#2e0a0a", text: "#f87171", border: "#5c1414", label: "✗ Incorrect Call" },
  pending:   { bg: "#1e1e1e", text: "#71717a", border: "#3f3f46", label: "⏳ Pending" },
};

function Pill({ children, style }) {
  return (
    <span
      className="text-xs font-bold px-3 py-1.5 rounded-full"
      style={style}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4">
      <p
        className="text-xl font-black"
        style={{ color: accent ? "#D4F244" : "white" }}
      >
        {value ?? "—"}
      </p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeader({ label, title }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
        {label}
      </p>
      <h2 className="text-xl font-black text-white">{title}</h2>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-black text-white min-h-screen animate-pulse px-6 py-8">
      <div className="h-6 w-32 bg-zinc-800 rounded mb-6" />
      <div className="flex gap-2 mb-4">
        {[80, 64, 72].map((w) => (
          <div key={w} className="h-7 bg-zinc-800 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="h-12 w-2/3 bg-zinc-800 rounded-xl mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-zinc-900 rounded-2xl" />
        ))}
      </div>
      <div className="h-48 bg-zinc-900 rounded-2xl mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 bg-zinc-900 rounded-2xl" />
        <div className="h-40 bg-zinc-900 rounded-2xl" />
      </div>
    </div>
  );
}


function QuickActions({ trend, onUpdate }) {
  const [saving, setSaving] = useState(null);

  const patch = async (fields, label) => {
    setSaving(label);
    try {
      await api.put(`/admin/trends/${trend._id}`, fields, authHeader());
      onUpdate(fields);
      toast.success("Updated.", { containerId: "admin-view-toast" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update.",
        { containerId: "admin-view-toast" }
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
        Quick Actions
      </p>
      <div className="flex flex-wrap gap-3">
       
        <button
          disabled={saving === "publish"}
          onClick={() => patch({ isPublished: !trend.isPublished }, "publish")}
          className="text-sm font-bold px-4 py-2 rounded-xl border transition disabled:opacity-50"
          style={
            trend.isPublished
              ? { borderColor: "#3a5c14", color: "#D4F244", background: "#1a2e0a" }
              : { borderColor: "#3f3f46", color: "#71717a", background: "transparent" }
          }
        >
          {saving === "publish" ? "..." : trend.isPublished ? "✓ Published" : "Publish"}
        </button>

       
        <button
          disabled={saving === "hidden"}
          onClick={() => patch({ isHidden: !trend.isHidden }, "hidden")}
          className="text-sm font-medium px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition disabled:opacity-50"
        >
          {saving === "hidden" ? "..." : trend.isHidden ? "Unhide" : "Hide"}
        </button>

       
        <select
          value={trend.status}
          onChange={(e) => patch({ status: e.target.value }, "status")}
          disabled={saving === "status"}
          className="text-sm px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-white outline-none cursor-pointer disabled:opacity-50"
        >
          <option value="detected">Detected</option>
          <option value="trending">Trending</option>
          <option value="peaked">Peaked</option>
          <option value="dead">Dead</option>
          <option value="never_took_off">Never Took Off</option>
        </select>
      </div>
    </div>
  );
}

export default function AdminTrendView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trend, setTrend] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [comments, setComments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
       
        const { data } = await api.get(`/admin/trend/${id}`, authHeader());
        setTrend(data.trend);

      
        const [predRes, commentsRes, videosRes, evidenceRes] = await Promise.allSettled([
          api.get(`/admin/trends/${id}/prediction`, authHeader()),
          api.get(`/admin/trends/${id}/comments`, authHeader()),
          api.get(`/admin/trends/${id}/videos`, authHeader()),
          api.get(`/admin/trends/${id}/evidence`, authHeader()),
        ]);

        if (predRes.status === "fulfilled") setPrediction(predRes.value.data.prediction);
        if (commentsRes.status === "fulfilled") setComments(commentsRes.value.data.comments || []);
        if (videosRes.status === "fulfilled") setVideos(videosRes.value.data.videos || []);
        if (evidenceRes.status === "fulfilled") setEvidence(evidenceRes.value.data.evidence || []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }
        toast.error("Failed to load trend.", { containerId: "admin-view-toast" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleQuickUpdate = (fields) => {
    setTrend((prev) => ({ ...prev, ...fields }));
  };

  if (loading) return <Skeleton />;
  if (!trend) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Trend not found.</p>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[trend.status] || STATUS_STYLES.detected;
  const outcomeStyle = prediction
    ? OUTCOME_STYLES[prediction.outcome] || OUTCOME_STYLES.pending
    : null;
  const tags = trend.tags ?? [];

  return (
    <div className="bg-black text-white min-h-screen">
      <ToastContainer containerId="admin-view-toast" position="top-right" autoClose={3000} />

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
            ← All Trends
          </button>
          <button
            onClick={() => navigate(`/admin/trends/edit/${trend._id}`)}
            className="text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition"
            style={{ background: "#D4F244", color: "#000" }}
          >
            Edit Trend
          </button>
        </div>
      </div>

     
      <div className="px-6 pt-8 pb-6 border-b border-zinc-900 max-w-6xl mx-auto">

       
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Pill style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
            {statusStyle.label}
          </Pill>
          {trend.category?.name && (
            <Pill style={{ background: "#18181b", color: "#a1a1aa", border: "1px solid #3f3f46" }}>
              {trend.category.name}
            </Pill>
          )}
          {trend.rfciType && (
            <Pill style={{ background: "#18181b", color: "#a1a1aa", border: "1px solid #3f3f46" }}>
              RFCI: {trend.rfciType}
            </Pill>
          )}
          {outcomeStyle && (
            <Pill style={{ background: outcomeStyle.bg, color: outcomeStyle.text, border: `1px solid ${outcomeStyle.border}` }}>
              {outcomeStyle.label}
            </Pill>
          )}
          {trend.isHidden && (
            <Pill style={{ background: "#18181b", color: "#71717a", border: "1px solid #3f3f46" }}>
              Hidden
            </Pill>
          )}
          {!trend.isPublished && (
            <Pill style={{ background: "#18181b", color: "#71717a", border: "1px solid #3f3f46" }}>
              Draft
            </Pill>
          )}
          <span className="text-zinc-600 text-xs ml-auto">
            /{trend.slug}
          </span>
        </div>

        <h1
          className="font-black text-white leading-tight mb-3"
          style={{ fontSize: "clamp(24px, 4vw, 40px)" }}
        >
          {trend.title}
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mb-6">
          {trend.description || "No description provided."}
        </p>

       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="RFCI Score" value={trend.rfciScore} accent />
          <StatCard
            label="Growth Rate"
            value={trend.growthRate != null ? `+${trend.growthRate}%` : "—"}
          />
          <StatCard label="Days to Viral" value={trend.daysToViral != null ? `${trend.daysToViral}d` : "—"} />
          <StatCard label="Detected" value={formatDate(trend.detectedAt)} />
        </div>

       
        <QuickActions trend={trend} onUpdate={handleQuickUpdate} />
      </div>

      
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        
        <div>
          <SectionHeader label="Prediction" title="Prediction Record" />
          {prediction ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Outcome</p>
                <p
                  className="font-black text-base capitalize"
                  style={{ color: outcomeStyle?.text || "#71717a" }}
                >
                  {prediction.outcome}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Confirmed On</p>
                <p className="font-black text-base text-white">
                  {formatDate(prediction.confirmedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Peak Growth Rate</p>
                <p className="font-black text-base text-[#D4F244]">
                  {prediction.peakGrowthRate != null ? `+${prediction.peakGrowthRate}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Days Early</p>
                <p className="font-black text-base text-white">
                  {trend.daysToViral != null ? `${trend.daysToViral}d` : "—"}
                </p>
              </div>
              {prediction.notes && (
                <div className="col-span-2 md:col-span-4 pt-3 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Notes</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{prediction.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
              <p className="text-zinc-500 text-sm">No prediction created yet for this trend.</p>
              <button
                onClick={() => navigate("/admin/predictions")}
                className="text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition"
                style={{ background: "#D4F244", color: "#000" }}
              >
                Create Prediction →
              </button>
            </div>
          )}
        </div>

      
        {tags.length > 0 && (
          <div>
            <SectionHeader label="Tags" title={`${tags.length} Tags Associated`} />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={tag._id ?? i}
                  className="bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-2 rounded-full font-medium capitalize"
                >
                  #{tag.name}
                  {tag.type && (
                    <span className="ml-1 text-zinc-600 text-xs">({tag.type})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

      
        <div>
          <SectionHeader
            label="TikTok Evidence"
            title={`${comments.length} Captured Comments`}
          />
          {comments.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-zinc-500 text-sm">
              No comments captured yet.
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400">
                        @{c.authorHandle || "unknown"}
                      </span>
                      <span className="text-xs text-zinc-600 capitalize bg-zinc-800 px-2 py-0.5 rounded-full">
                        {c.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.likeCount > 0 && (
                        <span className="text-xs text-zinc-500">
                          ♥ {c.likeCount.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        {formatDate(c.capturedAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">{c.commentText}</p>
                  {c.sourceVideoUrl && (
                    <a
                      href={c.sourceVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#D4F244] hover:underline mt-2 inline-block"
                    >
                      View source video ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

       
        <div>
          <SectionHeader
            label="Source Videos"
            title={`${videos.length} Linked Videos`}
          />
          {videos.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-zinc-500 text-sm">
              No videos linked yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map((v) => (
                <div
                  key={v._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate mb-1">
                      @{v.creatorHandle || "unknown"}
                    </p>
                    <div className="flex gap-3 text-xs text-zinc-500 mb-2">
                      {v.viewCount > 0 && <span>👁 {v.viewCount.toLocaleString()} views</span>}
                      {v.commentCount > 0 && <span>💬 {v.commentCount.toLocaleString()}</span>}
                      <span>{formatDate(v.capturedAt)}</span>
                    </div>
                    <a
                      href={v.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#D4F244] hover:underline"
                    >
                      {v.videoUrl}
                    </a>
                  </div>
                  <a
                    href={v.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white hover:bg-[#D4F244] hover:text-black transition"
                  >
                    ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            label="Proof of Detection"
            title={`${evidence.length} Evidence Items`}
          />
          {evidence.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-zinc-500 text-sm">
              No evidence screenshots uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {evidence.map((e) => (
                <div
                  key={e._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  {e.screenshotUrl && (
                    <img
                      src={e.screenshotUrl}
                      alt={`${e.platform} screenshot`}
                      className="w-full object-cover"
                      style={{ maxHeight: 180 }}
                    />
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold capitalize text-zinc-400">
                        {e.platform}
                      </span>
                      <span className="text-xs text-zinc-600">{formatDate(e.capturedAt)}</span>
                    </div>
                    {e.pageUrl && (
                      <a
                        href={e.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#D4F244] hover:underline truncate block"
                      >
                        {e.pageUrl}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div>
          <SectionHeader label="Metadata" title="Trend Details" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {[
              { label: "ID", value: trend._id },
              { label: "Slug", value: `/${trend.slug}` },
              { label: "Category", value: trend.category?.name || "—" },
              { label: "Status", value: trend.status },
              { label: "Published", value: trend.isPublished ? "Yes" : "No" },
              { label: "Hidden", value: trend.isHidden ? "Yes" : "No" },
              { label: "Detected At", value: formatDate(trend.detectedAt) },
              { label: "Created At", value: formatDate(trend.createdAt) },
              { label: "Updated At", value: formatDate(trend.updatedAt) },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3 text-sm ${
                  i !== 0 ? "border-t border-zinc-800" : ""
                }`}
              >
                <span className="text-zinc-500 font-medium">{row.label}</span>
                <span className="text-zinc-300 font-mono text-xs">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

       
        <div>
          <SectionHeader label="Danger Zone" title="Destructive Actions" />
          <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Delete this trend</p>
              <p className="text-xs text-zinc-500">
                Permanently removes this trend and all associated data. Cannot be undone.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!confirm("Delete this trend? This cannot be undone.")) return;
                try {
                  await api.delete(`/admin/trends/${trend._id}`, authHeader());
                  toast.success("Trend deleted.", { containerId: "admin-view-toast" });
                  setTimeout(() => navigate("/admin/dashboard"), 1000);
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Failed to delete.",
                    { containerId: "admin-view-toast" }
                  );
                }
              }}
              className="flex-shrink-0 text-sm font-bold px-4 py-2 rounded-xl border border-red-900 text-red-400 hover:bg-red-900/30 transition"
            >
              Delete Trend
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/*
─────────────────────────────────────────────────────────────
  ADD THIS "View" BUTTON IN AdminDashboard.jsx trend row actions
  (place it before the Edit button):

  <button
    onClick={() => navigate(`/admin/trends/view/${trend._id}`)}
    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
  >
    View
  </button>
─────────────────────────────────────────────────────────────

  ADD THESE BACKEND ROUTES (they may already exist partially):
  GET /admin/trends/:id               → return single trend (populated)
  GET /admin/trends/:id/prediction    → return linked Prediction doc
  GET /admin/trends/:id/comments      → return TrendComment docs
  GET /admin/trends/:id/videos        → return TrendVideo docs
  GET /admin/trends/:id/evidence      → return TrendEvidence docs
─────────────────────────────────────────────────────────────
*/