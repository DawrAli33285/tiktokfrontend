import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";


const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusColor = (status) => {
  switch (status) {
    case "trending":      return "bg-[#D4F244] text-black";
    case "peaked":        return "bg-orange-400 text-black";
    case "dead":          return "bg-zinc-600 text-white";
    case "never_took_off":return "bg-red-900 text-red-300";
    default:              return "bg-zinc-800 text-zinc-300";
  }
};

const statusLabel = (status) => {
  switch (status) {
    case "trending":       return "🔥 Trending";
    case "peaked":         return "📈 Peaked";
    case "dead":           return "💀 Dead";
    case "detected":       return "🔍 Detected";
    case "never_took_off": return "😶 Never Took Off";
    default:               return status ?? "Unknown";
  }
};

const platformIcon = (platform) => {
  switch (platform) {
    case "tiktok":   return "🎵";
    case "reddit":   return "🔴";
    case "google":   return "🔍";
    case "youtube":  return "▶️";
    default:         return "🌐";
  }
};

const platformColor = (platform) => {
  switch (platform) {
    case "tiktok":  return "text-pink-400 border-pink-900 bg-pink-950/40";
    case "reddit":  return "text-orange-400 border-orange-900 bg-orange-950/40";
    case "google":  return "text-blue-400 border-blue-900 bg-blue-950/40";
    case "youtube": return "text-red-400 border-red-900 bg-red-950/40";
    default:        return "text-zinc-400 border-zinc-800 bg-zinc-900/40";
  }
};


function TrendChart({ trend }) {
  const { rfciScore = 50, growthRate = 0, status } = trend || {};
  const isGrowing = status === "trending" || status === "detected";
  const color = isGrowing ? "#a3e635" : "#f87171";
  const W = 700, H = 280;

  const generatePoints = () => {
    const points = [];
    const totalPoints = 12;
    const peakStrength = Math.min(rfciScore / 100, 1);
    const growthFactor = Math.min(growthRate / 100, 1);
    for (let i = 0; i < totalPoints; i++) {
      const t = i / (totalPoints - 1);
      const x = t * W;
      let y;
      if (status === "trending") {
        y = H - (Math.pow(t, 1.5) * H * 0.85 * peakStrength + growthFactor * 10 * t);
      } else if (status === "peaked") {
        const peak = 0.6;
        y = t < peak
          ? H - (t / peak) * H * 0.8 * peakStrength
          : H - ((1 - (t - peak) / (1 - peak)) * H * 0.6 * peakStrength);
      } else if (status === "dead" || status === "never_took_off") {
        y = H - (Math.sin(t * Math.PI) * H * 0.3 * peakStrength);
      } else {
        y = H - (Math.pow(t, 2) * H * 0.6 * peakStrength);
      }
      y = Math.max(4, Math.min(H - 4, y));
      points.push({ x, y });
    }
    return points;
  };

  const points = generatePoints();
  const splitIndex = Math.floor(points.length * 0.43);
  const beforePoints = points.slice(0, splitIndex + 1);
  const afterPoints = points.slice(splitIndex);

  const toPath = (pts) =>
    pts.map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

  const splitPoint = points[splitIndex];
  const gridLines = [
    { y: H * 0.25, label: "High" },
    { y: H * 0.5,  label: "Mid" },
    { y: H * 0.75, label: "Low" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map(({ y, label }) => (
        <g key={label}>
          <line x1="0" y1={y} x2={W} y2={y} stroke="#1a1a1a" strokeWidth="1" />
          <text x="8" y={y - 4} fill="#333" fontSize="10" fontFamily="sans-serif">{label}</text>
        </g>
      ))}
      <path
        fill="url(#chartGrad)"
        d={`${toPath(afterPoints)} L${W},${H} L${splitPoint.x.toFixed(1)},${H} Z`}
      />
      <path fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" d={toPath(beforePoints)} />
      <path fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" d={toPath(afterPoints)} />
      <circle cx={splitPoint.x} cy={splitPoint.y} r="7" fill="#fff" stroke="#000" strokeWidth="2" />
      <line x1={splitPoint.x} y1={splitPoint.y - 8} x2={splitPoint.x} y2={40} stroke="#444" strokeWidth="1" strokeDasharray="4 4" />
      <rect x={splitPoint.x + 8} y="30" width="76" height="20" rx="6" fill="#1a1a1a" />
      <text x={splitPoint.x + 46} y="44" textAnchor="middle" fill="#D4F244" fontSize="11" fontFamily="sans-serif" fontWeight="700">Detected</text>
      <text x="10"      y={H - 5} fill="#444" fontSize="10" fontFamily="sans-serif">Before</text>
      <text x={splitPoint.x - 20} y={H - 5} fill="#666" fontSize="10" fontFamily="sans-serif">Detected</text>
      <text x={W - 30} y={H - 5} fill="#444" fontSize="10" fontFamily="sans-serif">Now</text>
    </svg>
  );
}


function TrendPageSkeleton() {
  return (
    <div className="bg-black text-white min-h-screen animate-pulse">
      <div className="px-4 sm:px-8 pt-8 pb-6 border-b border-zinc-900">
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-24 bg-zinc-800 rounded-full" />
          <div className="h-6 w-20 bg-zinc-800 rounded-full" />
        </div>
        <div className="h-12 w-3/4 bg-zinc-800 rounded-xl mb-4" />
        <div className="h-4 w-full bg-zinc-900 rounded mb-2" />
        <div className="h-4 w-2/3 bg-zinc-900 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl px-4 py-4 h-20" />
          ))}
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 h-72" />
      </div>
    </div>
  );
}


function WatchlistButton({ trendId, headers }) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !trendId) { setLoading(false); return; }
    axios.get(`${BASE_URL}/watchlist/check/${trendId}`, { headers })
      .then((res) => setInWatchlist(res.data.inWatchlist))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trendId]);

  const handleToggle = async () => {
    if (!token) {
      toast.warn("Sign in to use your watchlist.", { containerId: "trend-toast" });
      return;
    }
    setToggling(true);
    try {
      if (inWatchlist) {
        await axios.delete(`${BASE_URL}/watchlist/${trendId}`, { headers });
        setInWatchlist(false);
        toast.success("Removed from watchlist.", { containerId: "trend-toast" });
      } else {
        await axios.post(`${BASE_URL}/watchlist`, { trendId }, { headers });
        setInWatchlist(true);
        toast.success("Saved to watchlist! 🔖", { containerId: "trend-toast" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.", { containerId: "trend-toast" });
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed">
        🔖 Watchlist
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border disabled:opacity-60 disabled:cursor-not-allowed ${
        inWatchlist
          ? "bg-[#D4F244] text-black border-[#D4F244] hover:bg-[#c8e83a]"
          : "bg-transparent text-zinc-300 border-zinc-700 hover:border-[#D4F244] hover:text-[#D4F244]"
      }`}
    >
      {toggling ? "..." : inWatchlist ? "🔖 Saved to Watchlist" : "🔖 Add to Watchlist"}
    </button>
  );
}


function ProofSection({ trendId, detectedAt }) {
  const [evidence, setEvidence] = useState([]);
  const [comments, setComments] = useState([]);
  const [videos,   setVideos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab, setTab]           = useState("screenshots");

  const token   = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchProof = async () => {
      setLoading(true);
      try {
        const [evRes, coRes, viRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/trends/${trendId}/evidence`, { headers }),
          axios.get(`${BASE_URL}/trends/${trendId}/comments`, { headers }),
          axios.get(`${BASE_URL}/trends/${trendId}/videos`,   { headers }),
        ]);
        if (evRes.status === "fulfilled") setEvidence(evRes.value.data.evidence || []);
        if (coRes.status === "fulfilled") setComments(coRes.value.data.comments || []);
        if (viRes.status === "fulfilled") setVideos(viRes.value.data.videos || []);
      } catch {
       
      } finally {
        setLoading(false);
      }
    };
    if (trendId) fetchProof();
  }, [trendId]);

  const hasEvidence = evidence.length > 0;
  const hasComments = comments.length > 0;
  const hasVideos   = videos.length > 0;
  const hasAny      = hasEvidence || hasComments || hasVideos;

  const tabs = [
    { key: "screenshots", label: `📸 Screenshots`, count: evidence.length },
    { key: "comments",    label: `💬 Comments`,    count: comments.length },
    { key: "videos",      label: `🎥 Videos`,      count: videos.length   },
  ];

  return (
    <div>
    
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4F244]/10 border border-[#D4F244]/30 flex items-center justify-center text-xl flex-shrink-0">
            🕵️
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#D4F244] mb-1">Verified Detection</p>
            <h3 className="text-lg font-black text-white mb-2">
              Proof This Was Detected On {formatDate(detectedAt)}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
              When we first flagged this trend, there was barely any coverage online — that's the whole point.
              Below are real screenshots, comments, and videos we captured at the time of detection, timestamped
              as evidence that we identified it <span className="text-white font-semibold">before it blew up</span>.
            </p>
          </div>
        </div>

       
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#D4F244] animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">Detected before viral spike</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2">
            <span className="text-xs">📅</span>
            <span className="text-xs font-semibold text-zinc-300">Captured: {formatDate(detectedAt)}</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2">
            <span className="text-xs">🔒</span>
            <span className="text-xs font-semibold text-zinc-300">Timestamped evidence</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : !hasAny ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-8 text-center">
          <p className="text-3xl mb-3">📂</p>
          <p className="text-zinc-500 text-sm">No proof media uploaded yet for this trend.</p>
        </div>
      ) : (
        <>
       
          <div className="flex gap-2 mb-5 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  tab === t.key
                    ? "bg-[#D4F244] text-black"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                }`}
              >
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-black/20" : "bg-zinc-800"}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

         
          {tab === "screenshots" && (
            <div>
              {!hasEvidence ? (
                <p className="text-zinc-600 text-sm">No screenshots for this trend yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evidence.map((ev) => (
                    <div
                      key={ev._id}
                      className={`rounded-2xl border overflow-hidden ${platformColor(ev.platform)}`}
                    >
                      {ev.screenshotUrl && (
                        <a href={ev.screenshotUrl} target="_blank" rel="noreferrer">
                          <img
                            src={ev.screenshotUrl}
                            alt={`${ev.platform} screenshot`}
                            className="w-full object-cover"
                            style={{ maxHeight: 220 }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        </a>
                      )}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold capitalize flex items-center gap-1">
                            {platformIcon(ev.platform)} {ev.platform}
                          </span>
                          <span className="text-[10px] opacity-60">{formatDate(ev.capturedAt)}</span>
                        </div>
                        {ev.pageUrl && (
                          <a
                            href={ev.pageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] opacity-70 hover:opacity-100 hover:underline truncate block"
                          >
                            🔗 View original page
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          
          {tab === "comments" && (
            <div>
              {!hasComments ? (
                <p className="text-zinc-600 text-sm">No comments captured for this trend yet.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div
                      key={c._id}
                      className={`rounded-2xl border p-4 ${platformColor(c.platform)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{platformIcon(c.platform)}</span>
                        <span className="text-xs font-bold">@{c.authorHandle || "unknown"}</span>
                        <span className="text-[10px] opacity-50 capitalize">{c.platform}</span>
                        {c.likeCount > 0 && (
                          <span className="text-[10px] opacity-60 ml-auto">♥ {c.likeCount.toLocaleString()}</span>
                        )}
                        <span className="text-[10px] opacity-40">{formatDate(c.capturedAt)}</span>
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">"{c.commentText}"</p>
                      {c.sourceVideoUrl && (
                        <a
                          href={c.sourceVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] opacity-60 hover:opacity-100 hover:underline"
                        >
                          🔗 Source video
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          
          {tab === "videos" && (
            <div>
              {!hasVideos ? (
                <p className="text-zinc-600 text-sm">No videos attached to this trend yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((v) => (
                    <a
                      key={v._id}
                      href={v.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group bg-zinc-900 border border-zinc-800 hover:border-[#D4F244]/50 rounded-2xl p-4 flex items-center gap-4 transition"
                    >
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-[#D4F244]/10 transition">
                        🎵
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">
                          @{v.creatorHandle || "unknown"}
                        </p>
                        <div className="flex gap-3 text-xs text-zinc-500 mt-0.5">
                          {v.viewCount > 0   && <span>👁 {v.viewCount.toLocaleString()}</span>}
                          {v.commentCount > 0 && <span>💬 {v.commentCount.toLocaleString()}</span>}
                          {v.capturedAt      && <span>📅 {formatDate(v.capturedAt)}</span>}
                        </div>
                        <p className="text-[11px] text-zinc-600 truncate mt-1">{v.videoUrl}</p>
                      </div>
                      <span className="text-zinc-600 group-hover:text-[#D4F244] transition text-lg">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}


function SimilarTrendVideos({ currentTrendId, categoryId }) {
  const [similarTrend, setSimilarTrend] = useState(null);
  const [videos, setVideos]             = useState([]);
  const [loading, setLoading]           = useState(true);

  const token   = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/trends`, {
          headers,
          params: {
            category: categoryId,
            limit: 10,
            page: 1,
          },
        });
  
        const candidates = (res.data.trends || []).filter(
          (t) => t._id !== currentTrendId && !t.isLocked
        );
  
        if (candidates.length === 0) {
          setLoading(false);
          return;
        }
  
        const picked = candidates[0];
        setSimilarTrend(picked);
  
        const vidRes = await axios.get(`${BASE_URL}/trends/${picked._id}/videos`, { headers });
        setVideos(vidRes.data.videos || []);
      } catch {
     
      } finally {
        setLoading(false);
      }
    };
  
    if (currentTrendId && categoryId) fetchSimilar();
  }, [currentTrendId, categoryId]);


  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-2xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!similarTrend) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
            Currently Trending — Similar Topic
          </p>
          <h3 className="text-xl font-black text-white">{similarTrend.title}</h3>
        </div>
        <span className="ml-auto bg-[#D4F244] text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          🔥 Live
        </span>
      </div>

      <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
        This topic is comparable to the one you're reading about. It's <strong className="text-white">currently going viral</strong> — 
        study these videos to understand the format, hooks, and audience reaction patterns you can apply.
      </p>

      {videos.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-6 text-center">
          <p className="text-zinc-500 text-sm">No video links available for this comparable trend yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((v) => (
            <a
              key={v._id}
              href={v.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 rounded-2xl p-4 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-950/50 border border-pink-900/50 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                🎵
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">@{v.creatorHandle || "unknown"}</p>
                <div className="flex gap-2 text-xs text-zinc-500 mt-0.5">
                  {v.viewCount > 0    && <span>👁 {v.viewCount.toLocaleString()}</span>}
                  {v.commentCount > 0 && <span>💬 {v.commentCount.toLocaleString()}</span>}
                </div>
              </div>
              <span className="text-zinc-600 group-hover:text-pink-400 transition text-base flex-shrink-0">↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}



const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">{children}</p>
);


export default function TrendPage() {
  const { slug } = useParams();

  const [trend,      setTrend]      = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [locked,     setLocked]     = useState(false);

  const token   = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/trends/${slug}`, { headers });
        setTrend(res.data.trend);
        setPrediction(res.data.prediction);
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Trend not found.", { containerId: "trend-toast" });
        } else if (err.response?.status === 403) {
          setLocked(true);
          toast.warn("This trend is for premium members only.", { containerId: "trend-toast" });
        } else {
          toast.error("Failed to load trend. Please try again.", { containerId: "trend-toast" });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [slug]);

  if (loading) return <TrendPageSkeleton />;

  if (locked) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <ToastContainer containerId="trend-toast" position="top-right" autoClose={4000} />
        <div className="text-center px-6">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-2xl font-black mb-2">Premium Only</h2>
          <p className="text-zinc-400 text-sm">Upgrade to access this trend and all hidden insights.</p>
        </div>
      </div>
    );
  }

  if (!trend) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <ToastContainer containerId="trend-toast" position="top-right" autoClose={4000} />
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-2">Trend not found</p>
          <p className="text-zinc-700 text-xs">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  const tags         = trend.tags ?? [];
  const categoryName = trend.category?.name ?? "—";
  const categoryId   = trend.category?._id ?? trend.category;

  
  const hashtagTags = tags.filter((t) => !t.type || t.type === "hashtag");
  const keywordTags = tags.filter((t) => t.type === "keyword");
  const otherTags   = tags.filter((t) => t.type && t.type !== "hashtag" && t.type !== "keyword");

  return (
    <div className="bg-black text-white min-h-screen">
      <ToastContainer containerId="trend-toast" position="top-right" autoClose={4000} />

     
      <div className="px-4 sm:px-8 pt-8 pb-6 border-b border-zinc-900">

      
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(trend.status)}`}>
            {statusLabel(trend.status)}
          </span>
          <span className="bg-zinc-900 text-zinc-400 text-xs font-semibold px-3 py-1 rounded-full">
            {categoryName}
          </span>
          {trend.rfciType && (
            <span className="bg-zinc-900 text-zinc-400 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              RFCI: {trend.rfciType}
            </span>
          )}
          {trend.purpose && (
            <span className="bg-zinc-900 text-[#D4F244] text-xs font-semibold px-3 py-1 rounded-full capitalize">
              🎯 {trend.purpose.replace(/_/g, " ")}
            </span>
          )}
          {prediction?.outcome && prediction.outcome !== "pending" && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              prediction.outcome === "correct"
                ? "bg-green-900 text-green-300"
                : "bg-red-900 text-red-300"
            }`}>
              {prediction.outcome === "correct" ? "✓ Correctly Called" : "✗ Incorrect Call"}
            </span>
          )}
          <span className="text-zinc-600 text-xs ml-auto">
            Detected: {formatDate(trend.detectedAt)}
          </span>
        </div>

      
        <h1
          className="font-black text-white leading-tight mb-4"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          {trend.title}
        </h1>

       
        <div className="mb-6">
          <WatchlistButton trendId={trend._id} headers={headers} />
        </div>

       
        <p className="text-zinc-400 text-base leading-relaxed max-w-2xl mb-6">
          {trend.description}
        </p>

        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "RFCI Score",  value: trend.rfciScore ?? "—" },
            { label: "Growth Rate", value: trend.growthRate != null ? `+${trend.growthRate}%` : "—" },
            {
              label: "Confirmed",
              value: prediction?.confirmedAt ? formatDate(prediction.confirmedAt) : "Pending",
            },
            {
              label: "Peak Growth Rate",
              value:
                prediction?.peakGrowthRate != null
                  ? `+${prediction.peakGrowthRate}%`
                  : trend.growthRate != null
                  ? `+${trend.growthRate}%`
                  : "—",
            },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 rounded-2xl px-4 py-4">
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

       
        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-3">Interest over time</p>
          <TrendChart trend={trend} />
        </div>
      </div>

     
      <div className="px-4 sm:px-8 py-8 space-y-14">

        
        <div className="bg-[#D4F244] rounded-3xl p-6 text-black">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">⚡ Early Opportunity</p>
          <h2 className="text-xl font-black mb-3">This Trend Was Detected Before It Blew Up</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/10 rounded-2xl p-4">
              <p className="text-2xl font-black">{formatDate(trend.detectedAt)}</p>
              <p className="text-sm opacity-70">Date first detected</p>
            </div>
            <div className="bg-black/10 rounded-2xl p-4">
              <p className="text-2xl font-black capitalize">{trend.rfciType ?? "—"}</p>
              <p className="text-sm opacity-70">RFCI type at detection</p>
            </div>
            <div className="bg-black/10 rounded-2xl p-4">
              <p className="text-2xl font-black">{trend.rfciScore ?? "—"}</p>
              <p className="text-sm opacity-70">RFCI score at detection</p>
            </div>
          </div>
          <p className="text-sm mt-4 opacity-70 leading-relaxed">
            Our system flagged this trend early based on rapid engagement signals. Content creators and brands
            who act early capture the majority of organic reach. At the time of detection, there was
            <strong className="opacity-100"> minimal coverage online</strong> — creating a prime window for first-mover advantage.
          </p>
        </div>

        
        <div>
          <SectionLabel>Verified Evidence</SectionLabel>
          <h2 className="text-2xl font-black mb-6">
            Proof That This Was Detected On {formatDate(trend.detectedAt)}
          </h2>
          <ProofSection trendId={trend._id} detectedAt={trend.detectedAt} />
        </div>

       
        {tags.length > 0 && (
          <div>
            <SectionLabel>Capitalize on This Trend</SectionLabel>
            <h2 className="text-2xl font-black mb-2">Hashtags & Keywords to Use</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xl">
              Use these across your content, captions, and SEO strategy to tap into the existing
              search momentum around this topic.
            </p>

         
            {hashtagTags.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {hashtagTags.map((tag, i) => (
                    <span
                      key={tag._id ?? i}
                      className="bg-zinc-900 border border-zinc-700 text-[#D4F244] text-sm px-4 py-2 rounded-full font-medium hover:bg-zinc-800 cursor-pointer transition capitalize"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

       
            {keywordTags.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywordTags.map((tag, i) => (
                    <span
                      key={tag._id ?? i}
                      className="bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-2 rounded-full font-medium hover:border-[#D4F244] hover:text-[#D4F244] cursor-pointer transition capitalize"
                    >
                      🔍 {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

        
            {otherTags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Other Tags</p>
                <div className="flex flex-wrap gap-2">
                  {otherTags.map((tag, i) => (
                    <span
                      key={tag._id ?? i}
                      className="bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-2 rounded-full font-medium hover:border-zinc-400 cursor-pointer transition capitalize"
                    >
                      {tag.name}
                      {tag.type && (
                        <span className="ml-1 text-zinc-600 text-xs">({tag.type})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

         
            <button
              onClick={() => {
                const allNames = tags.map((t) => `#${t.name}`).join(" ");
                navigator.clipboard.writeText(allNames);
                toast.success("Copied all hashtags to clipboard!", { containerId: "trend-toast" });
              }}
              className="mt-5 flex items-center gap-2 text-xs font-semibold text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white rounded-xl px-4 py-2 transition"
            >
              📋 Copy all as hashtags
            </button>
          </div>
        )}

    
        {categoryId && (
          <div>
            <SectionLabel>Related Trend</SectionLabel>
            <h2 className="text-2xl font-black mb-6">A Similar Topic That's Currently Trending</h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
              <SimilarTrendVideos currentTrendId={trend._id} categoryId={categoryId} />
            </div>
          </div>
        )}

    
        {prediction && (
          <div>
            <SectionLabel>Prediction Record</SectionLabel>
            <h2 className="text-2xl font-black mb-4">How This Call Played Out</h2>
            <div className="bg-zinc-900 rounded-3xl p-6 flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">Outcome</p>
                <p className={`text-lg font-black capitalize ${
                  prediction.outcome === "correct"   ? "text-green-400"
                  : prediction.outcome === "incorrect" ? "text-red-400"
                  : "text-zinc-400"
                }`}>
                  {prediction.outcome === "correct"
                    ? "✓ Correctly Called"
                    : prediction.outcome === "incorrect"
                    ? "✗ Incorrect"
                    : "⏳ Pending"}
                </p>
              </div>
              {prediction.confirmedAt && (
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-1">Confirmed On</p>
                  <p className="text-lg font-black text-white">{formatDate(prediction.confirmedAt)}</p>
                </div>
              )}
              {(prediction.peakGrowthRate != null || trend.growthRate != null) && (
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-1">Peak Growth Rate</p>
                  <p className="text-lg font-black text-[#D4F244]">
                    +{prediction.peakGrowthRate ?? trend.growthRate}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}