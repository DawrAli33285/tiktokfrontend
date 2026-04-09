const steps = [
  {
    title: "Automated Scanning",
    desc: "Every hour we collect fresh signals from the public Polartrends.io feed (unaffiliated) and cross-reference them with TikTok's official API.",
  },
  {
    title: "Human Review",
    desc: "Editors verify that at least three creators posted around the same idea within 24 hours and had genuine engagement.",
  },
  {
    title: "Approval",
    desc: "If it meets all criteria, the trend is added to TikTokSlang and updated live.",
  },
  {
    title: "Filtering",
    desc: "We only keep topics with high RFCI scores, recent uploads, and repeated creator interest.",
  },
];

function CheckIcon() {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center m-0 flex-shrink-0"
      style={{ background: "#D4F244" }}
    >
      <svg
        width="31"
        height="31"
        viewBox="0 0 31 31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.3517 10.5817C22.8248 11.0548 22.8248 11.8215 22.3517 12.2943L14.228 20.4183C13.755 20.891 12.9885 20.891 12.5155 20.4183L8.64827 16.5508C8.17525 16.078 8.17525 15.3113 8.64827 14.8385C9.12106 14.3655 9.88783 14.3655 10.3606 14.8385L13.3716 17.8495L20.6392 10.5817C21.1122 10.109 21.8789 10.109 22.3517 10.5817ZM31 15.5C31 24.0676 24.0664 31 15.5 31C6.93238 31 0 24.0664 0 15.5C0 6.93238 6.93356 0 15.5 0C24.0676 0 31 6.93356 31 15.5ZM28.5781 15.5C28.5781 8.27103 22.728 2.42188 15.5 2.42188C8.27103 2.42188 2.42188 8.27198 2.42188 15.5C2.42188 22.729 8.27198 28.5781 15.5 28.5781C22.729 28.5781 28.5781 22.728 28.5781 15.5Z"
          fill="black"
        />
      </svg>
    </div>
  );
}

export default function Cards() {
  return (
    <div className="bg-black px-4 sm:px-8 m-0 py-10 sm:py-14">
      <h2
        className="font-[600] text-white mb-8 sm:mb-10 leading-tight"
        style={{ fontSize: "clamp(20px, 5vw, 42px)" }}
      >
        How We Detect
        <br />
        Emerging Trends
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 sm:p-7 flex flex-col"
            style={{ background: "#f5f5f5" }}
          >
            <CheckIcon />
            <h3
              className="font-[600] text-black mb-3 leading-snug"
              style={{ fontSize: "18px" }}
            >
              {step.title}
            </h3>
            <p
              className="text-zinc-600 leading-relaxed"
              style={{ fontSize: "15px" }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
