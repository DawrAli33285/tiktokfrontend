import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useCases = [
  {
    title: "Content Creators",
    icon: "🎬",
    summary: "Post trends before they peak.",
    detail:
      "Discover topics gaining traction before they go mainstream. Post early, ride the algorithm wave, and grow your following faster than creators who wait for trends to surface on their For You Page.",
  },
  {
    title: "SEO & Keyword Research",
    icon: "🔍",
    summary: "Find keywords before they spike.",
    detail:
      "Identify topics showing early demand signals on TikTok — these consistently become high-volume search terms on Google weeks later. Build content around them now and rank when the traffic arrives.",
  },
  {
    title: "Entrepreneurs",
    icon: "💡",
    summary: "Spot business ideas early.",
    detail:
      "Emerging TikTok trends reveal unmet consumer demand. Identify gaps in the market before competitors do and validate business ideas, product launches, or new service offerings with real signal data.",
  },
  {
    title: "Marketers",
    icon: "📣",
    summary: "Run campaigns ahead of the curve.",
    detail:
      "Time your ad campaigns and brand content to align with trends before they explode. Early movers get significantly cheaper CPMs and more organic reach than brands that react after trends peak.",
  },
  {
    title: "E-commerce Sellers",
    icon: "🛒",
    summary: "Stock products before demand spikes.",
    detail:
      "TikTok trends drive massive product demand overnight. Use early trend signals to stock inventory, set up listings, and launch promotions before the rush — not after competitors have already sold out.",
  },
  {
    title: "Journalists & Researchers",
    icon: "📰",
    summary: "Track cultural shifts in real time.",
    detail:
      "Monitor emerging topics, subcultures, and conversations before they reach mainstream media. Get ahead of the news cycle with early data on what's capturing public attention and why.",
  },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();


  return (
    <div className="bg-black px-4 sm:px-8 py-14 sm:py-20">
      <div className="mb-10">
        <span className="text-lime-400 text-sm font-semibold uppercase tracking-widest mb-3 block">
          Use Cases
        </span>
        <h2
          className="font-[600] text-white leading-tight"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          Who uses TikTokSlang?
        </h2>
        <p className="text-zinc-400 mt-3 text-[16px] max-w-lg">
          From creators to entrepreneurs — early trend intelligence creates an
          unfair advantage no matter your industry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 items-start">

        
        <div className="flex flex-col gap-2">
          {useCases.map((uc, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all w-full"
              style={{
                background: active === i ? "#D4F244" : "#1a1a1a",
                color: active === i ? "#000" : "#fff",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{uc.icon}</span>
                <div>
                  <p className="font-[600] text-[15px]">{uc.title}</p>
                  <p
                    className="text-[13px]"
                    style={{ color: active === i ? "#333" : "#71717a" }}
                  >
                    {uc.summary}
                  </p>
                </div>
              </div>
              <span className="text-lg flex-shrink-0">
                {active === i ? "→" : "+"}
              </span>
            </button>
          ))}
        </div>

      
        <div
          className="rounded-3xl p-8 flex flex-col justify-between min-h-[300px] sticky top-8"
          style={{ background: "#1a1a1a" }}
        >
          <div>
            <span className="text-5xl mb-6 block">{useCases[active].icon}</span>
            <h3
              className="font-[600] text-white mb-4 leading-tight"
              style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
            >
              {useCases[active].title}
            </h3>
            <p className="text-zinc-400 text-[16px] leading-relaxed">
              {useCases[active].detail}
            </p>
          </div>

          <button
          onClick={()=>{
            navigate('/livetrends')
          }}
            className="mt-8 cursor-pointer w-fit flex items-center gap-2 bg-lime-400 text-black font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition text-sm"
          >
            See trending topics
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}