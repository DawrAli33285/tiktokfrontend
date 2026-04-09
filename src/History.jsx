import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";
import { useNavigate } from "react-router-dom";
const categoryList = ["All"];

function TrendChart({ trend }) {
  const { rfciScore = 50, growthRate = 0, status } = trend || {};

  const isGrowing = status === "trending" || status === "detected";
  const color = isGrowing ? "#a3e635" : "#f87171";

  const generatePoints = () => {
    const points = [];
    const totalPoints = 12;
    const width = 300;
    const height = 60;

    const peakStrength = Math.min(rfciScore / 100, 1);
    const growthFactor = Math.min(growthRate / 100, 1);

    for (let i = 0; i < totalPoints; i++) {
      const t = i / (totalPoints - 1);
      const x = t * width;

      let y;
      if (status === "trending") {
        y = height - (Math.pow(t, 1.5) * height * 0.85 * peakStrength + growthFactor * 10 * t);
      } else if (status === "peaked") {
        const peak = 0.6;
        y = t < peak
          ? height - (t / peak) * height * 0.8 * peakStrength
          : height - ((1 - (t - peak) / (1 - peak)) * height * 0.6 * peakStrength);
      } else if (status === "dead" || status === "never_took_off") {
        y = height - (Math.sin(t * Math.PI) * height * 0.3 * peakStrength);
      } else {
        y = height - (Math.pow(t, 2) * height * 0.6 * peakStrength);
      }

      y = Math.max(4, Math.min(height - 4, y));
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

  return (
    <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-full overflow-visible">
      <path fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" d={toPath(beforePoints)} />
      <path fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" d={toPath(afterPoints)} />
      <circle cx={splitPoint.x} cy={splitPoint.y} r="4" fill="#fff" stroke="#000" strokeWidth="2" />
    </svg>
  );
}


function PredictionCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden animate-pulse flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between mb-3">
          <div className="h-5 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-100 rounded mb-1" />
        <div className="h-4 w-2/3 bg-gray-100 rounded mb-3" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-gray-200 rounded-lg" />
          <div className="h-5 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="px-3 bg-gray-50" style={{ height: 60 }} />
      <div className="px-5 py-3 border-t border-gray-100">
        <div className="h-4 w-full bg-gray-100 rounded" />
      </div>
      <div className="flex justify-between px-5 pb-5 pt-2 border-t border-gray-100">
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 cursor-pointer py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
      active ? "bg-[#D4F244] text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
    }`}
  >
    {label}
  </button>
);

export default function PastPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState(["All"]);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const navigate=useNavigate();
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setPage(1);
      try {
        const params = { page: 1, limit: 9 };

        const res = await axios.get(`${BASE_URL}/past-predictions`, { headers, params });

        setPredictions(res.data.predictions);
        setStats(res.data.stats);
        setHasNextPage(res.data.hasNextPage);

     
        const cats = ["All", ...new Set(
          res.data.predictions
            .map(p => p.trend?.category?.name)
            .filter(Boolean)
        )];
        setCategories(cats);
      } catch (e) {
        toast.error("Failed to load past predictions.", { containerId: "predictions-toast" });
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await axios.get(`${BASE_URL}/past-predictions`, {
        headers,
        params: { page: nextPage, limit: 9 },
      });
      console.log(res.data)
console.log("RES")
      setPredictions(prev => [...prev, ...res.data.predictions]);
      setHasNextPage(res.data.hasNextPage);
      setPage(nextPage);
    } catch (e) {
      toast.error("Failed to load more predictions.", { containerId: "predictions-toast" });
    } finally {
      setLoadingMore(false);
    }
  };

 
  const filtered = predictions
    .filter((p) => {
      if (activeCategory !== "All" && p.trend?.category?.name !== activeCategory) return false;
      if (search && !p.trend?.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "daysToViral") return (a.trend?.daysToViral ?? 999) - (b.trend?.daysToViral ?? 999);
      if (sortBy === "peakScore") return (b.trend?.rfciScore ?? 0) - (a.trend?.rfciScore ?? 0);
      if (sortBy === "newest") return new Date(b.prediction?.confirmedAt) - new Date(a.prediction?.confirmedAt);
      return 0;
    });

  const formatDate = (date) => date
    ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-8">
      <ToastContainer containerId="predictions-toast" position="top-right" autoClose={4000} />

    
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#D4F244] text-sm font-bold">✓</span>
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Verified Calls</span>
        </div>
        <h1 className="font-black text-white leading-tight mb-3" style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>
          Past Predictions
        </h1>
        <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
          Every trend we correctly called — before it hit the mainstream. These are verified predictions with timestamps to prove we detected them early.
        </p>
      </div>

     
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Correct Predictions", value: loading ? "—" : stats?.totalCorrect ?? "—" },
          { label: "Incorrect Predictions", value: loading ? "—" : stats?.totalIncorrect ?? "—" },
          { label: "Accuracy Rate", value: loading ? "—" : stats?.accuracyRate != null ? `${stats.accuracyRate}%` : "—" },
          {
            label: "Avg. Days Before Viral",
            value: loading ? "—" : (() => {
              const valid = predictions.filter(p => p.trend?.daysToViral != null);
              if (!valid.length) return "—";
              return `${Math.round(valid.reduce((a, b) => a + b.trend.daysToViral, 0) / valid.length)}d`;
            })(),
          },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 rounded-2xl px-4 py-4 border border-zinc-800">
            <p className="text-2xl font-black text-[#D4F244]">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

     
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search predictions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-zinc-600 transition"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-zinc-900 border cursor-pointer border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition"
        >
          <option value="newest">Sort: Most Recent</option>
          <option value="daysToViral">Sort: Fastest to Viral</option>
          <option value="peakScore">Sort: Highest RFCI Score</option>
        </select>
      </div>

      
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8">
        {categories.map((c) => (
          <FilterPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
        ))}
      </div>

      <p className="text-xs text-zinc-500 mb-4">{loading ? "Loading..." : `${filtered.length} verified predictions`}</p>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <PredictionCardSkeleton key={i} />)
          :filtered.map((p, i) => (
            p.trend?.isLocked ? (
              <div key={p.trend?._id || i} className="bg-white text-black rounded-3xl flex flex-col overflow-hidden relative">
              
                <div className="blur-sm pointer-events-none select-none">
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-black text-[#D4F244] text-[10px] font-bold px-2 py-1 rounded-lg">✓ Correctly Called</span>
                      <span className="text-xs text-gray-400">{p.trend?.category?.name ?? "—"}</span>
                    </div>
                    <h3 className="font-black text-lg leading-snug mb-2">{p.trend?.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{p.trend?.description}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {p.trend?.rfciType && (
                        <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-lg font-medium capitalize">{p.trend.rfciType}</span>
                      )}
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2.5 py-1 rounded-lg font-medium capitalize">{p.trend?.status}</span>
                    </div>
                  </div>
                  <div className="px-3" style={{ height: 60 }}>
                  <TrendChart trend={p.trend} />
                  </div>
                  <div className="flex items-center justify-between px-5 pb-5 pt-4 border-t border-gray-100">
                    <div className="h-8 w-10 bg-gray-200 rounded" />
                    <div className="h-8 w-10 bg-gray-200 rounded" />
                    <div className="h-8 w-10 bg-gray-200 rounded" />
                  </div>
                </div>
          
              
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-3xl">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mb-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="8" rx="2" fill="white" />
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="font-semibold text-sm text-black mb-1">Members Only</p>
                  <p className="text-xs text-gray-500 mb-3 text-center px-4">Unlock all trends with a subscription</p>
                  <button onClick={()=>{
navigate('/pricing')
                  }} className="bg-black cursor-pointer text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition">
                    Upgrade →
                  </button>
                </div>
              </div>
            ) : (
              <Link key={p.trend?._id || i} to={`/trends/${p.trend?.slug}`}>
                <div className="bg-white text-black rounded-3xl flex flex-col overflow-hidden hover:shadow-2xl transition cursor-pointer group">
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-black text-[#D4F244] text-[10px] font-bold px-2 py-1 rounded-lg">✓ Correctly Called</span>
                      <span className="text-xs text-gray-400">{p.trend?.category?.name ?? "—"}</span>
                    </div>
                    <h3 className="font-black text-lg leading-snug mb-2">{p.trend?.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{p.trend?.description}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {p.trend?.rfciType && (
                        <span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-lg font-medium capitalize">{p.trend.rfciType}</span>
                      )}
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2.5 py-1 rounded-lg font-medium capitalize">{p.trend?.status}</span>
                    </div>
                  </div>
                  <div className="px-3" style={{ height: 60 }}>
                  <TrendChart trend={p.trend} />
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                      <span>Detected <strong className="text-black">{formatDate(p.trend?.detectedAt)}</strong></span>
                      <span className="mx-1 text-gray-300">→</span>
                      <span className="w-2 h-2 rounded-full bg-[#D4F244] border border-black flex-shrink-0" />
                      <span>Confirmed <strong className="text-black">{formatDate(p.prediction?.confirmedAt)}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400">Days Early</span>
                      <span className="font-black text-base">{p.trend?.daysToViral != null ? `${p.trend.daysToViral}d` : "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400">RFCI Score</span>
                      <span className="font-black text-base">{p.trend?.rfciScore ?? "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400">Growth Rate</span>
                      <span className="font-black text-base">{p.trend?.growthRate != null ? `+${p.trend.growthRate}%` : "—"}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white text-sm flex-shrink-0 group-hover:bg-[#D4F244] group-hover:text-black transition">↗</div>
                  </div>
                </div>
              </Link>
            )
          ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">No predictions match your search</p>
        </div>
      )}

      {hasNextPage && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full border cursor-pointer border-zinc-700 py-4 rounded-2xl hover:bg-zinc-900 transition font-semibold text-sm text-white disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}