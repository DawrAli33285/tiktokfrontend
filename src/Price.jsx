import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { BASE_URL } from "./baseurl";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Get a taste of what's trending. Limited access to see if it's right for you.",
    cta: "Get Started Free",
    ctaStyle: "border border-zinc-700 text-white hover:bg-zinc-900",
    highlight: false,
    features: [
      { text: "5 trends visible per day", included: true },
      { text: "Basic trend score (RFCI)", included: true },
      { text: "Category filters", included: true },
      { text: "Trend detail page (limited)", included: true },
      { text: "TikTok comments & signals", included: false },
      { text: "Proof of detection screenshots", included: false },
      { text: "Hashtags & SEO keywords", included: false },
      { text: "Early alert notifications", included: false },
      { text: "Watchlist & saved trends", included: false },
      { text: "Past predictions archive", included: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 29, yearly: 19 },
    description: "Full access to every trend we detect. Built for creators, marketers and SEOs.",
    cta: "Start Pro",
    ctaStyle: "bg-[#D4F244] text-black hover:opacity-90",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited trend access", included: true },
      { text: "Full RFCI score breakdown", included: true },
      { text: "All category & purpose filters", included: true },
      { text: "Full trend detail page", included: true },
      { text: "TikTok comments & signals", included: true },
      { text: "Proof of detection screenshots", included: true },
      { text: "Hashtags & SEO keywords", included: true },
      { text: "Early alert notifications", included: true },
      { text: "Watchlist & saved trends", included: true },
      { text: "Past predictions archive", included: false },
    ],
  },
  {
    name: "Agency",
    price: { monthly: 79, yearly: 59 },
    description: "Everything in Pro plus team features and full historical access for serious operators.",
    cta: "Start Agency",
    ctaStyle: "bg-white text-black hover:opacity-90",
    highlight: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Past predictions archive", included: true },
      { text: "Up to 5 team seats", included: true },
      { text: "API access (coming soon)", included: true },
      { text: "Custom category alerts", included: true },
      { text: "White-label trend reports", included: true },
      { text: "Priority support", included: true },
      { text: "Early beta features", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

const faqs = [
  {
    q: "How accurate are the trend predictions?",
    a: "Our system has an accuracy rate of over 78% for trends that go on to hit mainstream coverage within 90 days. We show you both our correct and incorrect calls transparently on the Live Trends page.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime from your account page with no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "What is an RFCI score?",
    a: "RFCI stands for Rapid Frequency Content Index. It measures the speed at which new content and engagement around a topic is accelerating, giving you a score from 0–100.",
  },
  {
    q: "How often are new trends added?",
    a: "Our system scans 1,200 TikTok videos every 5 minutes. New trends are typically published to the platform within 2–6 hours of detection.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day free trial on all paid plans. If you're not happy within the first after your trial ends, contact us and we'll refund you — no hassle.",
  },
];

const ELEMENT_STYLE = {
  style: {
    base: {
      color: "#fff",
      fontSize: "14px",
      fontFamily: "inherit",
      "::placeholder": { color: "#52525b" },
    },
    invalid: { color: "#f87171" },
  },
};

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#D4F244" />
      <path d="M4.5 8.5L7 11L11.5 5.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#27272a" />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#52525b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}


function CardModal({ plan, yearly, onClose, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const amount   = yearly ? plan.price.yearly : plan.price.monthly;
  const interval = yearly ? "year" : "month";

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardNumberElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const email = localStorage.getItem("userEmail");

      await axios.post(
        `${BASE_URL}/create`,
        {
          email,
          amount,
          currency:      "usd",
          interval,
          paymentMethod: paymentMethod.id,
          planName:      plan.name.toLowerCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldCls =
    "bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus-within:border-zinc-600 transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
   
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

     
      <div
        className="relative bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#D4F244] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14L11 19L22 8" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">You're in!</h3>
            <p className="text-zinc-400 text-sm">
              Your {plan.name} trial has started.
            </p>
          </div>
        ) : (
          <>
         
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-black text-white text-xl">
                  Subscribe to {plan.name}
                </h2>
                <p className="text-zinc-500 text-sm mt-0.5">
                  ${amount}/{yearly ? "yr" : "mo"} 
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 cursor-pointer rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition"
              >
                ✕
              </button>
            </div>

         
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D4F244] flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-xs font-black">{plan.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{plan.name} Plan</p>
                  <p className="text-xs text-zinc-500">
                    {yearly ? "Annual billing" : "Monthly billing"}
                  </p>
                </div>
              </div>
              <p className="text-[#D4F244] font-black text-sm">
                ${amount}
                <span className="text-zinc-500 font-normal">/{yearly ? "yr" : "mo"}</span>
              </p>
            </div>

           
            <div className="space-y-3 mb-4">
           
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Card Number</label>
                <div className={fieldCls}>
                  <CardNumberElement options={ELEMENT_STYLE} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Expiry Date</label>
                  <div className={fieldCls}>
                    <CardExpiryElement options={ELEMENT_STYLE} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">CVC</label>
                  <div className={fieldCls}>
                    <CardCvcElement options={ELEMENT_STYLE} />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

           
            <div className="flex items-center gap-2 mb-5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z"
                  fill="#52525b"
                />
              </svg>
              <p className="text-zinc-600 text-xs">
                Secured by Stripe. We never store your card details.
              </p>
            </div>

            
            <button
              onClick={handleSubmit}
              disabled={loading || !stripe}
              className="w-full cursor-pointer bg-[#D4F244] text-black font-black py-3.5 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="40"
                      strokeDashoffset="10"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay $${amount}/${yearly ? "yr" : "mo"}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}


export default function PricingPage() {
  const [yearly,       setYearly]       = useState(false);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanClick = (plan) => {
    if (plan.price.monthly === 0) return; 
    setSelectedPlan(plan);
  };

  return (
    <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-10">

  
      {selectedPlan && (
        <CardModal
          plan={selectedPlan}
          yearly={yearly}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => setSelectedPlan(null)}
        />
      )}

    
      <div className="text-center mb-10">
        <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold px-4 py-2 rounded-full inline-block mb-4">
          Simple Pricing
        </span>
        <h1
          className="font-semibold text-white leading-tight mb-4"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          Spot Trends Before
          <br />
          Everyone Else Does
        </h1>
        <p className="text-zinc-400 text-base max-w-md mx-auto mb-8">
          One subscription. Unlimited early trend access. Cancel anytime.
        </p>

       
        <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 cursor-pointer py-2 rounded-lg text-sm font-semibold transition ${
              !yearly ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 cursor-pointer py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              yearly ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="bg-[#D4F244] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 35%
            </span>
          </button>
        </div>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-16">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-3xl p-6 flex flex-col ${
              plan.highlight
                ? "bg-zinc-900 border-2 border-[#D4F244]"
                : "bg-zinc-900 border border-zinc-800"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#D4F244] text-black text-xs font-[600] px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}

            <p className="text-xs font-[600] uppercase tracking-widest text-zinc-500 mb-2">
              {plan.name}
            </p>

            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-white">
                ${yearly ? plan.price.yearly : plan.price.monthly}
              </span>
              {plan.price.monthly > 0 && (
                <span className="text-zinc-500 text-sm mb-1">/mo</span>
              )}
            </div>
            {yearly && plan.price.monthly > 0 && (
              <p className="text-xs text-zinc-500 mb-3">
                Billed ${(yearly ? plan.price.yearly : plan.price.monthly) * 12}/year
              </p>
            )}

            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              {plan.description}
            </p>

           
            <button
              onClick={() => handlePlanClick(plan)}
              className={`w-full cursor-pointer py-3 rounded-xl font-bold text-sm transition mb-6 ${plan.ctaStyle}`}
            >
              {plan.cta}
            </button>

            <div className="border-t border-zinc-800 mb-5" />

            <ul className="space-y-3 flex-1">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3">
                  {f.included ? <Check /> : <Cross />}
                  <span className={`text-sm ${f.included ? "text-white" : "text-zinc-600"}`}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    
      <div className="max-w-5xl mx-auto mb-16">
        <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { value: "2,400+", label: "Active subscribers" },
              { value: "78%",    label: "Prediction accuracy" },
              { value: "72hrs",  label: "Avg. early detection window" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-black text-[#D4F244]">{s.value}</p>
                <p className="text-zinc-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

     
      <div className="max-w-5xl mx-auto mb-16 hidden md:block">
        <h2 className="text-2xl font-black mb-6 text-center">Full Feature Comparison</h2>
        <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 text-sm font-semibold">
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.name} className="px-6 py-4 text-center">
                    <span
                      className={`text-sm font-black ${
                        p.highlight ? "text-[#D4F244]" : "text-white"
                      }`}
                    >
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Trends per day",    values: ["5",     "Unlimited", "Unlimited"] },
                { label: "RFCI Score",        values: ["Basic", "Full",      "Full"      ] },
                { label: "TikTok comments",   values: [false, true,  true ] },
                { label: "Detection proof",   values: [false, true,  true ] },
                { label: "Hashtags & keywords",values: [false, true,  true ] },
                { label: "Early alerts",      values: [false, true,  true ] },
                { label: "Watchlist",         values: [false, true,  true ] },
                { label: "Past predictions",  values: [false, false, true ] },
                { label: "Team seats",        values: [false, false, "5 seats"] },
                { label: "API access",        values: [false, false, true ] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-zinc-800 last:border-0">
                  <td className="px-6 py-4 text-sm text-zinc-300">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="px-6 py-4 text-center">
                      {typeof v === "boolean" ? (
                        v ? <Check /> : <Cross />
                      ) : (
                        <span className="text-sm font-semibold text-white">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     
      <div className="max-w-2xl mx-auto mb-16">
        <h2 className="text-2xl font-black mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-2xl px-5 py-4 cursor-pointer"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#D4F244" }}
                >
                  {openFaq === i ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7H12" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2V12M2 7H12" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-white text-sm">{faq.q}</span>
              </div>
              {openFaq === i && (
                <p
                  className="text-zinc-400 text-sm mt-3 leading-relaxed"
                  style={{ paddingLeft: "44px" }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}