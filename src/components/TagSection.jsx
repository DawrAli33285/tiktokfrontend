import { useNavigate } from "react-router-dom";

export default function CategoriesSection({ categories = [], trends = [], loading, selectedCategory, setSelectedCategory }) {
  const colors = ["#D4F244", "#F5C97A", "#F06C7A"];

  const navigate=useNavigate();
  const handleCategoryClick = (catId) => {
    setSelectedCategory(prev => prev === catId ? null : catId);
  };

  return (
    <div className="bg-black px-4 sm:px-8 py-8 m-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col" style={{ background: "#1a1a1a" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#2a2a2a" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2.5" fill="#555" />
              <rect x="16" y="2" width="10" height="10" rx="2.5" fill="#555" />
              <rect x="2" y="16" width="10" height="10" rx="2.5" fill="#555" />
              <rect x="16" y="16" width="10" height="10" rx="2.5" fill="#555" />
            </svg>
          </div>
          <h2 className="font-[600] text-white mb-3 leading-tight" style={{ fontSize: "32px" }}>
            Popular Categories
          </h2>
          <p className="text-zinc-400 mb-6 leading-relaxed" style={{ fontSize: "16px" }}>
            Click a category to filter trends by topic.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <span
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 rounded-full font-semibold cursor-pointer transition-all"
              style={{
                fontSize: "15px",
                background: selectedCategory === null ? "#fff" : "#2e2e2e",
                color: selectedCategory === null ? "#000" : "#fff",
                border: "1px solid #3a3a3a",
              }}
            >
              All
            </span>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 w-28 bg-zinc-700 rounded-full animate-pulse" />
                ))
              : categories.map((cat, i) => {
                  const isActive = selectedCategory === cat._id;
                  return (
                    <span
                      key={cat._id || i}
                      onClick={() => handleCategoryClick(cat._id)}
                      className="px-4 py-2 rounded-full font-semibold cursor-pointer transition-all"
                      style={{
                        fontSize: "15px",
                        background: isActive ? colors[i % colors.length] : "#2e2e2e",
                        color: isActive ? "#000" : "#fff",
                        border: isActive ? `2px solid ${colors[i % colors.length]}` : "1px solid #3a3a3a",
                      }}
                    >
                      {cat.name}
                    </span>
                  );
                })}
          </div>
        </div>

       
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col" style={{ background: "#1a1a1a" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#2a2a2a" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 2C9.13 2 6 5.13 6 9c0 2.61 1.41 4.89 3.5 6.19V17a.5.5 0 00.5.5h6a.5.5 0 00.5-.5v-1.81C18.59 13.89 20 11.61 20 9c0-3.87-3.13-7-7-7z" fill="#555" />
              <rect x="9.5" y="18.5" width="7" height="1.5" rx="0.75" fill="#555" />
              <rect x="10.5" y="21" width="5" height="1.5" rx="0.75" fill="#555" />
              <rect x="11.5" y="23.5" width="3" height="1" rx="0.5" fill="#555" />
            </svg>
          </div>
          <h2 className="font-[600] text-white mb-3 leading-tight" style={{ fontSize: "32px" }}>
            Trending Now
          </h2>
          <p className="text-zinc-400 mb-6 leading-relaxed" style={{ fontSize: "16px" }}>
            Live trends currently detected from TikTok.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-9 w-28 bg-zinc-700 rounded-full animate-pulse" />
                ))
              : trends.length === 0
              ? <p className="text-zinc-500 text-sm">No trends available right now.</p>
              : trends
    .filter(t => !t.isLocked)
    .map((trend, i) => (
      <span
        key={trend._id || i}
        onClick={() => navigate(`/trends/${trend.slug}`)}
        className="px-4 py-2 rounded-full font-semibold text-white cursor-pointer transition-colors hover:bg-zinc-600"
        style={{
          fontSize: "15px",
          background: "#2e2e2e",
          border: "1px solid #3a3a3a",
        }}
      >
        {trend.title}
      </span>
    ))}
          </div>
        </div>

      </div>
    </div>
  );
}