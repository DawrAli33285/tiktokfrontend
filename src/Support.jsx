import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "./baseurl";

const faqs = [
  {
    category: "Account",
    items: [
      { q: "How do I create an account?", a: "Click 'Get Started Free' on the homepage and sign up with your email. No credit card required for the free plan." },
      { q: "How do I change my password?", a: "Go to your Account page, click the Settings button, then navigate to the Password tab to update your password." },
      { q: "How do I cancel my subscription?", a: "Go to Account → Settings → Preferences and click 'Cancel plan'. You'll keep access until the end of your billing period." },
      { q: "Can I change my email address?", a: "Yes. Go to Account → Settings → Profile and update your email address there." },
    ],
  },
  {
    category: "Trends & Data",
    items: [
      { q: "How often are new trends added?", a: "Our system scans 1,200 TikTok videos every 5 minutes. New trends are typically published within 2–6 hours of detection." },
      { q: "What is an RFCI score?", a: "RFCI stands for Rapid Frequency Content Index. It measures how quickly engagement and content around a topic is accelerating on TikTok, scored 0–100." },
      { q: "How accurate are your predictions?", a: "Our current prediction accuracy is approximately 78% for trends that go mainstream within 90 days of detection. We show both correct and incorrect calls transparently." },
      { q: "What does 'detected early' mean?", a: "It means we flagged the trend when fewer than 300 TikTok videos existed on the topic, before any major publications had covered it." },
    ],
  },
  {
    category: "Billing",
    items: [
      { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. We do not store your card details." },
      { q: "Can I get a refund?", a: "If you're unsatisfied with your subscription, contact us and we'll review your case — no questions asked." },
      { q: "Do you offer annual billing?", a: "Yes. Annual billing gives you 35% off compared to monthly pricing. You can switch in Account → Settings → Preferences." },
    ],
  },
];

const contactOptions = [
  { icon: "✉️", title: "Email Support",  desc: "We reply within 24 hours on business days.", action: "support@tiktokslang.com", type: "email"    },
  { icon: "💬", title: "Contact on WhatsApp",      desc: "Available Mon–Fri, 9am–6pm GMT.",            action: "https://wa.me/447700900123", type: "whatsapp" },
  { icon: "X",  title: "Twitter / X",   desc: "DM us for quick questions.",                  action: "@tiktokslang",               type: "link"     },
];

export default function SupportPage() {
  const [openItem,     setOpenItem]     = useState(null);
  const [search,       setSearch]       = useState("");

  
  const [formName,    setFormName]    = useState("");
  const [formEmail,   setFormEmail]   = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState(null);

  const allItems = faqs.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, category: cat.category }))
  );

  const filtered = search
    ? allItems.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const handleSubmit = async () => {
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${BASE_URL}/contact`, {
        name:    formName,
        email:   formEmail,
        message: formMessage,
      });
      setSubmitted(true);
      setFormName("");
      setFormEmail("");
      setFormMessage("");
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition";

  return (
    <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-8">

      
      <div className="text-center mb-10">
        <h1
          className="font-black text-white leading-tight mb-3"
          style={{ fontSize: "clamp(28px, 5vw, 42px)" }}
        >
          How Can We Help?
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
          Search our help docs or get in touch with our team.
        </p>
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-zinc-600 transition"
          />
        </div>
      </div>

     
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
        {contactOptions.map((opt, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center hover:border-zinc-700 transition">
            <p className="text-3xl mb-3">{opt.icon}</p>
            <p className="font-bold text-white text-sm mb-1">{opt.title}</p>
            <p className="text-zinc-500 text-xs mb-3">{opt.desc}</p>
            {opt.type === "email" ? (
              <a href={`mailto:${opt.action}`} className="text-[#D4F244] text-xs font-semibold hover:underline">
                {opt.action}
              </a>
            ) : opt.type === "whatsapp" ? (
              <a href={opt.action} target="_blank" rel="noreferrer">
                <button className="bg-[#D4F244] text-black text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer">
                  Start Chat
                </button>
              </a>
            ) : (
              <a href="#" className="text-[#D4F244] text-xs font-semibold hover:underline">
                {opt.action}
              </a>
            )}
          </div>
        ))}
      </div>

     
      <div className="max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-black mb-6">
          {search ? `Search results for "${search}"` : "Frequently Asked Questions"}
        </h2>

        {search && filtered.length === 0 && (
          <div className="text-center py-10 text-zinc-600">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold">No results found</p>
            <p className="text-sm mt-1">Try different keywords or contact us directly</p>
          </div>
        )}

        {search ? (
          <div className="flex flex-col gap-3">
            {filtered.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 rounded-2xl px-5 py-4 cursor-pointer"
                onClick={() => setOpenItem(openItem === `s-${i}` ? null : `s-${i}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#D4F244" }}>
                    {openItem === `s-${i}` ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12" stroke="#000" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="#000" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-zinc-500 block mb-0.5">{item.category}</span>
                    <span className="font-semibold text-white text-sm">{item.q}</span>
                  </div>
                </div>
                {openItem === `s-${i}` && (
                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed" style={{ paddingLeft: "44px" }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {faqs.map((cat, ci) => (
              <div key={ci}>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{cat.category}</p>
                <div className="flex flex-col gap-3">
                  {cat.items.map((item, ii) => {
                    const key = `${ci}-${ii}`;
                    return (
                      <div
                        key={ii}
                        className="bg-zinc-900 rounded-2xl px-5 py-4 cursor-pointer"
                        onClick={() => setOpenItem(openItem === key ? null : key)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#D4F244" }}>
                            {openItem === key ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12" stroke="#000" strokeWidth="2.2" strokeLinecap="round" /></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="#000" strokeWidth="2.2" strokeLinecap="round" /></svg>
                            )}
                          </div>
                          <span className="font-semibold text-white text-sm">{item.q}</span>
                        </div>
                        {openItem === key && (
                          <p className="text-zinc-400 text-sm mt-3 leading-relaxed" style={{ paddingLeft: "44px" }}>{item.a}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

   
      <div className="max-w-2xl mx-auto mb-10">
        <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800">
          <h2 className="text-xl font-black mb-1">Still need help?</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Send us a message and we'll get back to you within 24 hours.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#D4F244] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12L10 17L19 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-black text-white text-lg mb-1">Message sent!</p>
              <p className="text-zinc-400 text-sm">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Your Name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Alex Johnson"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Message</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {error && (
                <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full cursor-pointer bg-[#D4F244] text-black font-black py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Message →"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}