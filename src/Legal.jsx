
const content = {
    terms: {
      title: "Terms of Service",
      lastUpdated: "March 1, 2026",
      intro: "Please read these Terms of Service carefully before using TikTokSlang. By accessing or using our platform, you agree to be bound by these terms.",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          body: "By creating an account or using TikTokSlang in any way, you confirm that you are at least 16 years old and agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our platform.",
        },
        {
          heading: "2. Description of Service",
          body: "TikTokSlang is a trend intelligence platform that monitors publicly available TikTok content to identify emerging topics before they become mainstream. We provide trend data, scores, and analysis for informational and commercial research purposes.",
        },
        {
          heading: "3. Subscriptions & Billing",
          body: "TikTokSlang offers both free and paid subscription tiers. Paid plans are billed monthly or annually depending on your selection. You authorise us to charge your payment method on a recurring basis. You may cancel at any time; cancellation takes effect at the end of your current billing period. We do not offer refunds except as described in our Refund Policy.",
        },
        {
          heading: "4. Free Trial",
          body: "New paid subscribers receive a 7-day free trial. If you cancel before the trial ends, you will not be charged. After the trial, your subscription begins automatically unless cancelled.",
        },
        {
          heading: "5. Acceptable Use",
          body: "You agree not to: scrape, copy, or resell data from TikTokSlang without written permission; attempt to reverse-engineer our detection algorithms; use our platform for any unlawful purpose; share your account credentials with others; or interfere with the platform's infrastructure or security.",
        },
        {
          heading: "6. Intellectual Property",
          body: "All content, data, scores, and branding on TikTokSlang are the intellectual property of TikTokSlang Ltd. You may not reproduce, distribute, or create derivative works from our content without prior written consent.",
        },
        {
          heading: "7. Disclaimer of Warranties",
          body: "TikTokSlang provides trend data on an 'as is' basis. We do not guarantee that any trend will go viral or generate revenue. Our predictions are data-driven estimates and do not constitute financial, marketing, or business advice.",
        },
        {
          heading: "8. Limitation of Liability",
          body: "To the maximum extent permitted by law, TikTokSlang shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including lost profits or missed business opportunities.",
        },
        {
          heading: "9. Termination",
          body: "We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may also delete your account at any time from your Account Settings page.",
        },
        {
          heading: "10. Changes to Terms",
          body: "We may update these Terms from time to time. We will notify you via email or a notice on the platform. Continued use after changes constitutes acceptance of the updated terms.",
        },
        {
          heading: "11. Governing Law",
          body: "These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
        },
        {
          heading: "12. Contact",
          body: "For questions about these Terms, contact us at legal@tiktokslang.com.",
        },
      ],
    },
  
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "March 1, 2026",
      intro: "This Privacy Policy explains how TikTokSlang collects, uses, and protects your personal data. We are committed to handling your information responsibly and transparently.",
      sections: [
        {
          heading: "1. Who We Are",
          body: "TikTokSlang is operated by TikTokSlang Ltd, a company registered in England and Wales. We are the data controller for personal data collected through this platform. Contact: privacy@tiktokslang.com.",
        },
        {
          heading: "2. Data We Collect",
          body: "We collect the following types of data: Account data (name, email, password hash); Usage data (pages visited, trends saved, filters used); Payment data (processed securely by Stripe — we never store card details); Technical data (IP address, browser type, device information); Communications (support messages you send us).",
        },
        {
          heading: "3. How We Use Your Data",
          body: "We use your data to: provide and improve the TikTokSlang platform; process payments and manage your subscription; send you trend alerts and notifications (if opted in); respond to support requests; analyse platform usage to improve our product; and comply with legal obligations.",
        },
        {
          heading: "4. Legal Basis for Processing",
          body: "We process your data on the following legal bases under UK GDPR: Contract performance (to provide our service); Legitimate interests (to improve our platform and prevent fraud); Consent (for marketing communications); Legal obligation (for financial record-keeping).",
        },
        {
          heading: "5. Cookies",
          body: "We use essential cookies to keep you logged in and maintain your session. We also use analytics cookies (via a privacy-friendly provider) to understand how users interact with the platform. You can manage cookie preferences in your browser settings.",
        },
        {
          heading: "6. Data Sharing",
          body: "We do not sell your personal data. We share data only with: Stripe (payment processing); our hosting provider (secure infrastructure); analytics providers (anonymised usage data only); and legal authorities if required by law.",
        },
        {
          heading: "7. Data Retention",
          body: "We retain your account data for as long as your account is active. After deletion, we remove your personal data within 30 days, except where retention is required by law (e.g. financial records for 7 years).",
        },
        {
          heading: "8. Your Rights",
          body: "Under UK GDPR, you have the right to: access the data we hold about you; correct inaccurate data; request deletion of your data; object to or restrict processing; data portability; and withdraw consent at any time. To exercise any of these rights, contact privacy@tiktokslang.com.",
        },
        {
          heading: "9. Data Security",
          body: "We use industry-standard security measures including encrypted storage, HTTPS, and access controls. However, no system is completely secure. We recommend using a strong, unique password for your account.",
        },
        {
          heading: "10. Children's Privacy",
          body: "TikTokSlang is not intended for users under the age of 16. We do not knowingly collect data from children. If we become aware of such data, we will delete it promptly.",
        },
        {
          heading: "11. International Transfers",
          body: "Your data is stored on servers within the UK and European Economic Area. If data is transferred outside these regions, we ensure appropriate safeguards are in place.",
        },
        {
          heading: "12. Changes to This Policy",
          body: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a banner on the platform.",
        },
        {
          heading: "13. Contact & Complaints",
          body: "For privacy-related questions, contact privacy@tiktokslang.com. You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk.",
        },
      ],
    },
  };
  
  export default function LegalPage({ type = "terms" }) {
    const page = content[type];
  
    return (
      <div className="bg-black text-white min-h-screen px-4 sm:px-8 py-10">
        <div className="max-w-2xl mx-auto">
  
          
          <div className="mb-10">
            <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold px-4 py-2 rounded-full inline-block mb-4">
              {type === "terms" ? "Legal" : "Privacy"}
            </span>
            <h1
              className="font-black text-white leading-tight mb-3"
              style={{ fontSize: "clamp(28px, 5vw, 42px)" }}
            >
              {page.title}
            </h1>
            <p className="text-zinc-500 text-sm">Last updated: {page.lastUpdated}</p>
          </div>
  
        
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-5 mb-8">
            <p className="text-zinc-300 text-sm leading-relaxed">{page.intro}</p>
          </div>
  
        
          <div className="space-y-6">
            {page.sections.map((section, i) => (
              <div key={i} className="border-b border-zinc-900 pb-6 last:border-0">
                <h2 className="font-black text-white text-base mb-2">{section.heading}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
  
          
          <div className="mt-10 bg-zinc-900 rounded-2xl px-5 py-5 border border-zinc-800">
            <p className="text-zinc-500 text-xs leading-relaxed">
              If you have any questions about this {page.title}, please contact us at{" "}
              <a
                href={`mailto:${type === "terms" ? "legal" : "privacy"}@tiktokslang.com`}
                className="text-[#D4F244] hover:underline"
              >
                {type === "terms" ? "legal" : "privacy"}@tiktokslang.com
              </a>
            </p>
          </div>
  
        </div>
      </div>
    );
  }