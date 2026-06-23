interface LegalModalProps {
  type: "privacy" | "terms";
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  const isPrivacy = type === "privacy";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative my-8 w-full max-w-2xl overflow-hidden rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="text-3xl">{isPrivacy ? "🔒" : "📜"}</span>
          <h3 className="font-display text-2xl font-bold text-white">
            {isPrivacy ? "Privacy Policy" : "Terms of Service"}
          </h3>
        </div>

        <div className="scrollbar-hide mt-5 max-h-[60vh] space-y-5 overflow-y-auto pr-2 text-sm leading-relaxed text-violet-100/90">
          {isPrivacy ? (
            <>
              <p className="text-xs text-violet-200/60">Last updated: {new Date().toLocaleDateString()}</p>
              <Section title="1. Information We Collect">
                EduBot collects your name, email, phone number, city, board, and class
                to provide personalized study services. We also store your quiz results,
                XP, and learning progress.
              </Section>
              <Section title="2. How We Use Your Data">
                Your data is used to: personalize your learning, track progress, send
                OTP for verification, process payments, and improve our AI tutor.
              </Section>
              <Section title="3. Data Security">
                Passwords are encrypted (bcrypt). OTPs are hashed. We use JWT tokens,
                rate limiting, and HTTPS to protect your account. We never sell your data.
              </Section>
              <Section title="4. Third-Party Services">
                We use Google Gemini/OpenAI (AI tutor), Twilio (SMS OTP), and JazzCash/
                EasyPaisa (payments). These services have their own privacy policies.
              </Section>
              <Section title="5. Cookies">
                We use cookies for login sessions and analytics (with your consent).
                You can decline non-essential cookies via the cookie banner.
              </Section>
              <Section title="6. Your Rights">
                You can view, edit, or delete your account data anytime from your profile.
                Contact support@edubot.pk for data requests.
              </Section>
              <Section title="7. Children's Privacy">
                EduBot is designed for students. Users under 13 should use the platform
                with parental guidance.
              </Section>
              <Section title="8. Contact">
                Questions? Email us at support@edubot.pk
              </Section>
            </>
          ) : (
            <>
              <p className="text-xs text-violet-200/60">Last updated: {new Date().toLocaleDateString()}</p>
              <Section title="1. Acceptance of Terms">
                By using EduBot, you agree to these Terms of Service. If you disagree,
                please do not use our platform.
              </Section>
              <Section title="2. Account Responsibility">
                You are responsible for keeping your password secure. You must provide
                accurate information during signup. One account per user.
              </Section>
              <Section title="3. Free Trial & Subscriptions">
                New users get a 10-day free trial (35 questions). Paid plans: Basic
                (Rs 1,500 / 15 days) and Premium (Rs 2,800 / 30 days). Plans auto-expire;
                no automatic renewal without consent.
              </Section>
              <Section title="4. Payment & Refunds">
                Payments are processed via JazzCash/EasyPaisa. All sales are final.
                Refunds are considered case-by-case within 3 days of purchase.
              </Section>
              <Section title="5. Acceptable Use">
                Do not misuse the AI tutor, share your account, attempt to hack the
                platform, or upload harmful content. Violation may result in a ban.
              </Section>
              <Section title="6. Intellectual Property">
                All content (quizzes, notes, AI responses) is for personal study use only.
                Do not copy or resell our content.
              </Section>
              <Section title="7. Disclaimer">
                EduBot is a study aid. We do not guarantee exam results. AI responses
                may contain errors — always verify with official sources.
              </Section>
              <Section title="8. Changes to Terms">
                We may update these terms. Continued use means you accept the changes.
              </Section>
              <Section title="9. Contact">
                Questions? Email support@edubot.pk
              </Section>
            </>
          )}
        </div>

        <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-bold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-600 hover:to-fuchsia-600">
          Samajh gaya / Got it
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-base font-bold text-white">{title}</h4>
      <p className="mt-1">{children}</p>
    </div>
  );
}
