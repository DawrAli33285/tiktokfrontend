import { useNavigate } from "react-router-dom";

const types = [
  {
    key: "Impact",
    emoji: "💥",
    color: "#D4F244",
    headline: "High engagement, low content volume",
    desc: "A topic where individual videos are performing dramatically above the creator's average — but very few creators have posted about it yet. This signals massive unmet demand. First movers win big.",
    example: "A niche skincare ingredient suddenly getting 10x a creator's normal views, with under 50 total videos on the subject.",
  },
  {
    key: "Acceleration",
    emoji: "🚀",
    color: "#60a5fa",
    headline: "Rapid upload frequency increase",
    desc: "The number of new videos on a topic is growing faster than normal. Multiple creators are independently discovering the same subject within a short window — a strong signal of an emerging wave.",
    example: "A workout style that had 5 new videos per week suddenly jumping to 80 new videos in 72 hours.",
  },
  {
    key: "Widespread",
    emoji: "🌐",
    color: "#f97316",
    headline: "Cross-niche creator adoption",
    desc: "A topic that started in one niche is being picked up by creators in completely unrelated niches. When a fitness creator, a cooking creator, and a finance creator all post about the same thing — it's about to explode.",
    example: "A slang term originating in gaming communities being used by lifestyle, fashion, and food creators within the same week.",
  },
];

function ScoreBar({ score = 87 }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">RFCI Score</span>
        <span className="text-2xl font-black text-white">{score}</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            background: "linear-gradient(90deg, #a3e635, #D4F244)",
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-zinc-600">Low opportunity</span>
        <span className="text-[10px] text-zinc-600">High opportunity</span>
      </div>
    </div>
  );
}

export default function WhatIsRFCI() {
  const navigate = useNavigate();

  const handleBack = () => {
  
      navigate('/livetrends');
    
    
  };

  return (
    <div className="bg-black text-white min-h-screen w-full">
      <div className="px-4 sm:px-8 py-12 max-w-4xl mx-auto">

        
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition text-sm mb-10 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

      
        <div className="mb-14">
          <span className="text-lime-400 text-xs font-semibold uppercase tracking-widest mb-3 block">
            Methodology
          </span>
          <h1
            className="font-black text-white leading-none mb-6"
            style={{ fontSize: "clamp(40px, 8vw, 80px)", letterSpacing: "-2px" }}
          >
            What is an<br />
            <span className="text-[#D4F244]">RFCI Score?</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            RFCI stands for <strong className="text-white">Rapid Frequency & Cultural Impact</strong>. It's our
            proprietary scoring system that measures how likely a TikTok topic is to go viral —
            before it actually does.
          </p>
        </div>

   
        <div className="bg-zinc-900 rounded-3xl p-8 mb-14 border border-zinc-800">
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Every trend detected on TikTokSlang receives an RFCI score from <strong className="text-white">0 to 100</strong>.
            The higher the score, the stronger the early signal — and the bigger the opportunity for
            creators, marketers, and entrepreneurs who act fast.
          </p>
          <ScoreBar score={87} />
          <p className="text-xs text-zinc-600 mt-4">
            Example: A score of 87 means strong early demand, minimal existing content — prime territory.
          </p>
        </div>

     
        <div className="mb-14">
          <h2 className="text-white font-black text-2xl mb-2">How is it calculated?</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            The RFCI score is derived from three signals we scan for every 5 minutes across 1,200+ TikTok videos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                n: "01",
                label: "Engagement Anomaly",
                desc: "Videos performing unusually well vs. the creator's own historical average, isolated to the subject matter.",
              },
              {
                n: "02",
                label: "Comment Intent Signals",
                desc: "Comments that indirectly reveal viewer interest or demand — questions, saves, shares, and repeated topic mentions.",
              },
              {
                n: "03",
                label: "Content Scarcity",
                desc: "How few total videos exist on this subject. Low supply + high demand = high RFCI.",
              },
            ].map((item) => (
              <div key={item.n} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <span className="text-[#D4F244] font-black text-xs tracking-widest block mb-3">{item.n}</span>
                <h3 className="text-white font-bold text-sm mb-2">{item.label}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

   
        <div className="mb-14">
          <h2 className="text-white font-black text-2xl mb-2">The 3 RFCI Types</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Beyond the score, every trend is classified into one of three types — each representing
            a different pattern of viral emergence.
          </p>
          <div className="flex flex-col gap-4">
            {types.map((t) => (
              <div
                key={t.key}
                className="rounded-2xl p-6 border border-zinc-800 bg-zinc-900"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: t.color + "22" }}
                  >
                    {t.emoji}
                  </span>
                  <div>
                    <span
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: t.color }}
                    >
                      {t.key}
                    </span>
                    <p className="text-white font-bold text-sm">{t.headline}</p>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-3">{t.desc}</p>
                <div className="bg-zinc-800 rounded-xl px-4 py-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Example</span>
                  <p className="text-zinc-300 text-xs leading-relaxed">{t.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

       
        <div
          className="rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ background: "#D4F244" }}
        >
          <div>
            <h3 className="text-black font-black text-xl mb-1">Ready to use RFCI scores?</h3>
            <p className="text-black/60 text-sm">Browse all live trends and filter by RFCI type.</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition text-sm whitespace-nowrap cursor-pointer flex-shrink-0"
          >
            View Live Trends →
          </button>
        </div>

      </div>
    </div>
  );
}