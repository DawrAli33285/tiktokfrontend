import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useNavigate } from "react-router-dom";

function WhiteLineChart() {
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full overflow-visible">
      <polyline
        fill="none" stroke="#fff" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        points="0,50 25,48 50,52 75,44 95,52 115,28 140,18 165,8 190,4 200,2"
      />
      <circle cx="95" cy="52" r="5" fill="#fff" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
    </svg>
  );
}

function TrendChart({ trend }) {
  const { rfciScore = 50, growthRate = 0, status } = trend;

  const isGrowing = status === "trending" || status === "detected";
  const color = isGrowing ? "#a3e635" : "#f87171";

  const generatePoints = () => {
    const points = [];
    const totalPoints = 12;
    const width = 300;
    const height = 145;

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
    <svg viewBox="0 0 300 145" preserveAspectRatio="none" className="w-full h-full overflow-visible">
      <path fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" d={toPath(beforePoints)} />
      <path fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" d={toPath(afterPoints)} />
      <circle cx={splitPoint.x} cy={splitPoint.y} r="5" fill="#fff" stroke="#000" strokeWidth="2" />
    </svg>
  );
}




function TrendCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden animate-pulse flex flex-col">
      <div className="px-5 pt-5 pb-0">
        <div className="h-3 w-16 bg-gray-200 rounded mb-3 ml-auto" />
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-100 rounded mb-1" />
        <div className="h-4 w-2/3 bg-gray-100 rounded mb-3" />
        <div className="flex gap-2 mb-1">
          <div className="h-6 w-16 bg-gray-200 rounded-lg" />
          <div className="h-6 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex-1 px-2 bg-gray-50" style={{ minHeight: 140 }} />
      <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167",
];

export default function TopSection({ trends = [], popularTrends = [],loading, filtering }) {
  const [activeIndex, setActiveIndex] = useState(0);


  const sliderTrends = popularTrends.slice(0, 5);
  const gridTrends = trends.slice(0, 6);
  const navigate=useNavigate();
  return (
    <div className="bg-black text-white px-4 sm:px-8 pt-8 sm:pt-10 m-0">

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-[10px] items-center mb-24 md:mb-0">
        <div className="flex flex-col justify-center">
          <h1 className="bannerheading font-[600] leading-tight mb-6 tracking-tight">
          Discover Polar Trends
            <br />Emerging On
            <br />
            <span className="underline underline-offset-4 decoration-2">Tiktok!</span>
          </h1>

       

          <h2 className="text-lime-400 font-[600] text-[18px] sm:text-[22px] mb-4 leading-snug">
  Strong engagement + lack of content = high seed merit potential
</h2>

<ul className="text-zinc-400 text-[15px] leading-relaxed mb-6 space-y-2 max-w-sm">
  <li className="flex items-start gap-2">
    <span className="text-lime-400 mt-1">✦</span>
    Videos performing unusually well compared to the creator's other videos, where engagement can be attributed to the subject.
  </li>
  <li className="flex items-start gap-2">
    <span className="text-lime-400 mt-1">✦</span>
    Comments which indirectly show that viewers are engaged or interested in the subject.
  </li>
  <li className="flex items-start gap-2">
    <span className="text-lime-400 mt-1">✦</span>
    Very little existing content on the subject.
  </li>
</ul>

<div className="flex items-center gap-2 mt-1">
  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse inline-block" />
  <p className="text-zinc-300 text-[13px] font-medium">
    1,200 TikTok videos scanned at 5-minute intervals.
  </p>
</div>
        </div>

     
        <div className="hero-slider-wrap min-w-0 overflow-hidden">
          {loading ? (
            <div className="w-full h-64 bg-zinc-800 rounded-3xl animate-pulse" />
          ) : sliderTrends.length > 0 ? (
            <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 2500 }}
            loop
            slidesPerView={1.25}
            spaceBetween={12}
            onSlideChange={(swiper) =>
              setActiveIndex(swiper.realIndex % trends.length)
            }
            className="hero-swiper"
            style={{ overflow: "hidden" }}
          >
              {sliderTrends.map((trend, i) => (
                <SwiperSlide key={trend._id || i}>
                  {({ isActive }) => (
                    <div className="hero-slide">
                      <div className="hero-slide-img-wrap">
                      <img src={`${placeholderImages[i % placeholderImages.length]}?auto=format&fit=crop&w=800&q=80`} alt={trend.title} />
                      </div>
                      {isActive && (
                        <div className="hero-float-card">
                          <p className="text-xs text-zinc-400 mb-0.5">RFCI Score</p>
                          <p className="text-xl font-[600] mb-2">{trend.rfciScore ?? "—"}</p>
                          <div className="h-10 mb-2"><WhiteLineChart /></div>
                          <div className="flex gap-1.5 flex-wrap">
                            {trend.category?.name && (
                              <span className="bg-black text-white px-2 py-1 rounded text-[10px]">
                                #{trend.category.name}
                              </span>
                            )}
                            {trend.rfciType && (
                              <span className="bg-black text-white px-2 py-1 rounded text-[10px] capitalize">
                                {trend.rfciType}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : null}
        </div>
      </div>

     
      <h2 className="text-[20px] md:text-[42px] font-[600] mb-5 flex items-center gap-2">
        🔥 Popular TikTok Trends
      </h2>

      <div className="relative">
        {filtering && (
          <div className="absolute inset-0 bg-black/50 rounded-3xl z-10 flex items-center justify-center">
            <span className="text-white text-sm font-semibold animate-pulse">Filtering...</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TrendCardSkeleton key={i} />)
            : gridTrends.map((trend, i) =>
                trend.isLocked ? (
                
                  <div onClick={()=>{
                    navigate('/pricing')
                  }} key={trend._id} className="bg-white cursor-pointer text-black rounded-3xl border border-gray-100 flex flex-col overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 rounded-3xl">
                      <span className="bg-black text-white text-xs px-4 py-2 rounded-full font-semibold">🔒 Premium Only</span>
                    </div>
                    <div className="px-5 pt-5 pb-0 blur-sm select-none">
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-full bg-gray-100 rounded mb-1" />
                      <div className="h-4 w-1/2 bg-gray-100 rounded" />
                    </div>
                    <div className="flex-1 px-2 blur-sm" style={{ minHeight: 140 }}>
                    <TrendChart trend={trend} />
                    </div>
                    <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100 blur-sm">
                      <div className="h-8 w-12 bg-gray-200 rounded" />
                      <div className="h-8 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                ) : (
                  
                  <div
                    key={trend._id}
                    onClick={()=>{
                      navigate(`/trends/${trend.slug}`)
                    }}
                    className="bg-white text-black rounded-3xl border border-gray-100 hover:shadow-xl transition cursor-pointer flex flex-col overflow-hidden"
                  >
                    <div className="px-5 pt-5 pb-0">
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                          {trend.rfciType ?? "—"}
                        </span>
                        <span>{timeAgo(trend.detectedAt)}</span>
                      </div>
                      <h3 className="font-[600] text-lg mb-1.5 leading-snug">{trend.title}</h3>
                      <p className="text-gray-500 text-sm mb-3 leading-relaxed">{trend.description}</p>
                      <div className="flex gap-2 flex-wrap mb-1">
                        {trend.category?.name && (
                          <span className="bg-black text-white text-xs px-3 py-1 rounded-lg font-medium">
                            #{trend.category.name}
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-lg font-medium capitalize">
                          {trend.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 px-2" style={{ minHeight: 140 }}>
                    <TrendChart trend={trend} />
                    </div>

                    <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">RFCI Score</span>
                        <span className="font-[600] text-base">{trend.rfciScore ?? "—"}</span>
                      </div>
                      <div className="flex flex-col">
  <span className="text-xs text-gray-400">Growth</span>
  <span className="font-[600] text-base text-emerald-600">+{trend.growthRate ?? 0}%</span>
</div>
<div className="flex flex-col text-right">
  <span className="text-xs text-gray-400">Anticipated</span>
  <span className="font-[600] text-base text-lime-600">
    +{Math.round((trend.growthRate ?? 0) * 1.4)}%
  </span>
</div>
                      <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white text-sm flex-shrink-0 group-hover:bg-[#D4F244] group-hover:text-black transition">↗</div>
                    </div>
                  </div>
                )
              )}
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <button onClick={()=>{
          navigate('/livetrends')
        }} className="w-full border cursor-pointer border-zinc-700 py-4 sm:py-5 rounded-2xl hover:bg-zinc-900 transition font-semibold text-sm text-white">
          View all Trends
        </button>
      </div>
    </div>
  );
}