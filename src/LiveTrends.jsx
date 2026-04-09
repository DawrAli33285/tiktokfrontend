import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "./baseurl";
import { useNavigate } from "react-router-dom";

const purposes = ["All", "SEO", "Business Idea", "Content Creation", "Keyword Research"];
const rfciFilters = ["All", "Impact", "Acceleration", "Widespread"];


const statusFilters = [
  { label: "All",            value: "all" },
  { label: "Detected",       value: "detected" },
  { label: "Trending",       value: "trending" },
  { label: "Peaked",         value: "peaked" },
  { label: "Dead",           value: "dead" },
  { label: "Never Took Off", value: "never_took_off" },
];

const FALLBACK_CATEGORIES = [
  "Cooking","Fitness","Finance","Tech",
  "Fashion","Health","Beauty","Business","General",
].map(n => ({ _id: n, name: n }));


function TrendChart({ trend }) {
  const { rfciScore = 50, growthRate = 0, status } = trend;
  const isGrowing = status === "trending" || status === "detected";
  const color = isGrowing ? "#a3e635" : "#f87171";

  const generatePoints = () => {
    const points = [];
    const totalPoints = 12;
    const width = 300;
    const height = 80;
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
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="w-full h-full overflow-visible">
      <path fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" d={toPath(beforePoints)} />
      <path fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" d={toPath(afterPoints)} />
      <circle cx={splitPoint.x} cy={splitPoint.y} r="5" fill="#fff" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const config = {
    trending:       { label: "🔥 Trending",     bg: "bg-lime-400 text-black" },
    detected:       { label: "🔍 Detected",      bg: "bg-blue-900 text-blue-400" },
    peaked:         { label: "✓ Peaked",         bg: "bg-emerald-900 text-emerald-400" },
    dead:           { label: "✗ Dead",           bg: "bg-red-900 text-red-400" },
    never_took_off: { label: "✗ Never Took Off", bg: "bg-red-900 text-red-400" },
  };
  const c = config[status] || config.detected;
  return (
    <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${c.bg}`}>
      {c.label}
    </span>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function LockedCard({ trend }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-black rounded-3xl border border-gray-100 flex flex-col overflow-hidden relative">
      <div className="blur-sm pointer-events-none select-none">
        <div className="px-5 pt-5 pb-0">
          <div className="flex justify-between items-start mb-2">
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-100 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="flex gap-2 mb-1">
            <div className="h-5 w-16 bg-gray-200 rounded-lg" />
            <div className="h-5 w-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="px-2" style={{ height: 80 }}>
          <TrendChart trend={trend} />
        </div>
        <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
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
        <p className="text-xs text-gray-500 mb-3 text-center px-4">
          Unlock all trends with a subscription
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="bg-black cursor-pointer text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition"
        >
          Upgrade →
        </button>
      </div>
    </div>
  );
}

function TrendCard({ trend }) {
  if (trend.isLocked) return <LockedCard trend={trend} />;
  return (
    <Link to={`/trends/${trend.slug}`}>
      <div className="bg-white text-black rounded-3xl border border-gray-100 hover:shadow-xl transition cursor-pointer flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-0">
          <div className="flex justify-between items-start mb-2">
            <StatusBadge status={trend.status} />
            <span className="text-xs text-gray-400">{timeAgo(trend.detectedAt)}</span>
          </div>
          <h3 className="font-semibold text-lg mb-1.5 leading-snug">{trend.title}</h3>
          <div className="flex gap-2 flex-wrap mb-1">
            {trend.category?.name && (
              <span className="bg-black text-white text-xs px-3 py-1 rounded-lg font-medium">
                #{trend.category.name}
              </span>
            )}
            {trend.rfciType && (
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-lg font-medium capitalize">
                {trend.rfciType}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 px-2" style={{ minHeight: 80 }}>
          <TrendChart trend={trend} />
        </div>
        <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">RFCI Score</span>
            <span className="font-semibold text-base">{trend.rfciScore ?? "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Growth</span>
            <span className="font-semibold text-base">+{trend.growthRate ?? 0}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">RFCI</span>
            <span className="font-semibold text-base capitalize">{trend.rfciType ?? "—"}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white text-sm flex-shrink-0">↗</div>
        </div>
      </div>
    </Link>
  );
}

function TrendCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden animate-pulse flex flex-col">
      <div className="px-5 pt-5 pb-0">
        <div className="flex justify-between mb-2">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-100 rounded" />
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="flex gap-2 mb-1">
          <div className="h-5 w-16 bg-gray-200 rounded-lg" />
          <div className="h-5 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex-1 px-2 bg-gray-50" style={{ minHeight: 80 }} />
      <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}


function TrendGrid({ trends }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
      {trends.map((trend) => (
        <div
          key={trend._id}
          className={
            trend.status === "trending" || trend.status === "peaked"
              ? "ring-2 ring-[#D4F244] rounded-3xl"
              : ""
          }
        >
          <TrendCard trend={trend} />
        </div>
      ))}
    </div>
  );
}

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
      active ? "bg-[#D4F244] text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
    }`}
  >
    {label}
  </button>
);

export default function LiveTrends() {
  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

 
  const [showRfciInfo, setShowRfciInfo] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeRFCI, setActiveRFCI] = useState("All");
  
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activePurpose, setActivePurpose] = useState("All");

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  
  const displayCategories = categories.length ? categories : FALLBACK_CATEGORIES;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

 
  const buildParams = (pageNum) => {
    const params = { page: pageNum, limit: 9 };
    if (activeCategory !== "All")
      params.category = displayCategories.find(c => c.name === activeCategory)?._id;
    if (activeRFCI !== "All")
      params.rfciType = activeRFCI.toLowerCase();
   
    if (activeStatus !== "all")
      params.status = activeStatus;
    if (debouncedSearch)
      params.search = debouncedSearch;
   
    if (activePurpose !== "All")
      params.purpose = activePurpose.toLowerCase().replace(/\s+/g, "_");
    return params;
  };

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setPage(1);
      try {
        const res = await axios.get(`${BASE_URL}/trends`, { headers, params: buildParams(1) });
        setTrends(res.data.trends);
        setHasNextPage(res.data.hasNextPage);
      } catch {
        toast.error("Failed to load trends.", { containerId: "live-toast" });
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [activeCategory, activeRFCI, activePurpose, activeStatus, debouncedSearch]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [statsRes, categoriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/trends/stats`, { headers }),
          axios.get(`${BASE_URL}/categories`, { headers }),
        ]);
        setStats(statsRes.data);
        setCategories(categoriesRes.data.categories);
      } catch {
        toast.error("Failed to load page data.", { containerId: "live-toast" });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await axios.get(`${BASE_URL}/trends`, { headers, params: buildParams(nextPage) });
      setTrends(prev => [...prev, ...res.data.trends]);
      setHasNextPage(res.data.hasNextPage);
      setPage(nextPage);
    } catch {
      toast.error("Failed to load more trends.", { containerId: "live-toast" });
    } finally {
      setLoadingMore(false);
    }
  };

  
  const correctTrends  = trends.filter(t => ["trending", "peaked"].includes(t.status));
  const incorrectTrends = trends.filter(t => ["dead", "never_took_off"].includes(t.status));
  const otherTrends    = trends.filter(t => !["trending", "peaked", "dead", "never_took_off"].includes(t.status));

  return (
    <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-8">
      <ToastContainer containerId="live-toast" position="top-right" autoClose={4000} />

      
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#D4F244] animate-pulse" />
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Live</span>
        </div>
        <h1 className="font-[600] text-white leading-tight mb-2" style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>
          Live Trends
        </h1>
        <p className="text-zinc-400 text-sm max-w-lg">
          Every trend we've detected, tracked in real time. See what we called correctly — and what we missed.
        </p>
      </div>

   
      <div className="relative mb-6 max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search trends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-zinc-600 transition"
        />
      </div>

    
      <div className="space-y-3 mb-8">

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterPill label="All" active={activeCategory === "All"} onClick={() => setActiveCategory("All")} />
          {displayCategories.map((c) => (
            <FilterPill key={c._id} label={c.name} active={activeCategory === c.name} onClick={() => setActiveCategory(c.name)} />
          ))}
        </div>

       
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">
            RFCI{" "}
            <button
              onClick={() => setShowRfciInfo(v => !v)}
              className="text-lime-400 underline underline-offset-2 hover:opacity-80"
            >
              (what's this?)
            </button>:
          </span>
          {rfciFilters.map((r) => (
            <FilterPill key={r} label={r} active={activeRFCI === r} onClick={() => setActiveRFCI(r)} />
          ))}
        </div>
        {showRfciInfo && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-300 max-w-md">
            <p className="font-semibold text-white mb-1">What is RFCI?</p>
            <p>RFCI (Rapid Frequency of Content Interaction) measures how quickly engagement is accelerating around a topic — factoring in volume, velocity, and spread across platforms.</p>
          </div>
        )}

       
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 mr-1">Status:</span>
          {statusFilters.map((s) => (
            <FilterPill
              key={s.value}
              label={s.label}
              active={activeStatus === s.value}
              onClick={() => setActiveStatus(s.value)}
            />
          ))}
        </div>

       
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 mr-1">Purpose:</span>
          {purposes.map((p) => (
            <FilterPill key={p} label={p} active={activePurpose === p} onClick={() => setActivePurpose(p)} />
          ))}
        </div>

      </div>

      
      <div className="flex gap-6 mb-6 pb-6 border-b border-zinc-800 flex-wrap">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 w-12 bg-zinc-800 rounded mb-1" />
                <div className="h-3 w-20 bg-zinc-800 rounded" />
              </div>
            ))
          : [
              { label: "Total Trends",       value: stats?.totalTrends ?? "—" },
              { label: "Currently Trending", value: stats?.currentlyTrending ?? "—" },
              { label: "Correct Calls",      value: stats?.correct ?? "—" },
              { label: "Accuracy",           value: `${stats?.accuracyRate ?? 0}%` },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
      </div>

      <p className="text-sm text-zinc-500 mb-4">{loading ? "Loading..." : `${trends.length} trends found`}</p>

      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 9 }).map((_, i) => <TrendCardSkeleton key={i} />)}
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">No trends match your filters</p>
        </div>
      ) : (
        <div className="space-y-10">
          {correctTrends.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-lime-400 uppercase tracking-widest mb-4">
                ✓ Correct Predictions
              </h2>
              <TrendGrid trends={correctTrends} />
            </section>
          )}
          {otherTrends.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                🔍 Detected
              </h2>
              <TrendGrid trends={otherTrends} />
            </section>
          )}
          {incorrectTrends.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-4">
                ✗ Missed Predictions
              </h2>
              <TrendGrid trends={incorrectTrends} />
            </section>
          )}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-10">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full border cursor-pointer border-zinc-700 py-4 rounded-2xl hover:bg-zinc-900 transition font-semibold text-sm text-white disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More Trends"}
          </button>
        </div>
      )}
    </div>
  );
}