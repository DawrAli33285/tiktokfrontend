import { useState } from "react";
const faqs = [
  {
    question: "Is this affiliated with TikTok?",
    answer: "No, TikTokSlang.com is not affiliated with TikTok or ByteDance in any way. We are an independent trend aggregator.",
  },
  {
    question: "How often is data updated?",
    answer: "Our system scans TikTok every hour. Trend cards and metrics are refreshed continuously so you're always seeing the most current signal data.",
  },
  {
    question: "Why paid subscriptions?",
    answer: "Paid subscriptions help us maintain the infrastructure needed to monitor trends 24/7 and keep the data accurate and up to date.",
  },
  {
    question: "How is TikTokSlang different from Google Trends?",
    answer: "Google Trends shows you what's already popular. TikTokSlang shows you what's about to become popular — weeks before it reaches mainstream search volume.",
  },
  {
    question: "Can I use this for SEO keyword research?",
    answer: "Absolutely. Topics trending on TikTok consistently become high-volume Google search terms weeks later. Finding them early lets you publish content and rank before the competition arrives.",
  },
  {
    question: "What is an RFCI score?",
    answer: "RFCI stands for Rapid Frequency & Cultural Impact. It's our proprietary score that measures how quickly a topic is gaining traction relative to existing content volume — the higher the score, the bigger the opportunity.",
  },
];
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(1);

  return (
    <div className="bg-black m-0 px-4 sm:px-8 py-10 sm:py-14">
      
      <h2
        className="font-semibold text-white mb-8 leading-tight"
        style={{ fontSize: "clamp(20px, 5vw, 42px)" }}
      >
        Frequent Asked
        <br />
        Questions
      </h2>

     
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl px-5 py-4 cursor-pointer"
            style={{ background: "#1a1a1a" }}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="flex items-center gap-4">
          
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#D4F244" }}
              >
                {openIndex === i ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7H12"
                      stroke="#000"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 2V12M2 7H12"
                      stroke="#000"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

             
              <span
                className="text-white font-semibold"
                style={{ fontSize: "16px" }}
              >
                {faq.question}
              </span>
            </div>

         
            {openIndex === i && (
              <p
                className="text-zinc-400 mt-3 leading-relaxed"
                style={{ fontSize: "15px", paddingLeft: "44px" }}
              >
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}