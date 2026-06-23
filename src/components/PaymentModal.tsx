import { useState } from "react";
import { backend } from "../backend/api";

interface PaymentModalProps {
  userId: string;
  initialPlan: "basic" | "premium";
  onClose: () => void;
  onDone: (m: string) => void;
}

export default function PaymentModal({ userId, initialPlan, onClose, onDone }: PaymentModalProps) {
  const [plan, setPlan] = useState<"basic" | "premium">(initialPlan);
  const [method, setMethod] = useState<"easypaisa" | "jazzcash" | "card">("easypaisa");
  const [phone, setPhone] = useState("0300 1234567");
  const [cardNumber, setCardNumber] = useState("4220 1234 5678 9012");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("313");
  const [loading, setLoading] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500)); // simulate gateway processing
    await backend.users.upgradePlan(userId, plan);

    setLoading(false);
    onDone(`🎉 Payment successful! You are now subscribed to EduBot ${plan.toUpperCase()}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07061d]/85 p-4 backdrop-blur-xl">
      <div className="glass-strong border-gradient animate-scale-in relative w-full max-w-lg overflow-hidden rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h3 className="font-display text-2xl font-bold text-white">Unlock Unlimited AI</h3>
        </div>

        <p className="mt-2 text-xs text-violet-200/70">
          Secure, instant activation. Pay via Pakistan's most trusted wallets or bank cards.
        </p>

        {/* Plan Selection */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { id: "basic" as const, name: "Basic Pass", price: "Rs 1,500", desc: "15 Days Unlimited AI & 100 questions/day" },
            { id: "premium" as const, name: "Premium Pass", price: "Rs 2,800", desc: "30 Days Unlimited AI, Past Papers & 250 questions/day" },
          ].map((p) => {
            const active = plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-amber-300 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-white ring-2 ring-amber-300"
                    : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-display text-base font-bold text-white">{p.name}</span>
                  {p.id === "premium" && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-[#0b0a2b]">BEST</span>}
                </div>
                <div className="mt-1 font-display text-lg font-extrabold text-amber-300">{p.price}</div>
                <div className="mt-2 text-[10px] leading-relaxed text-violet-200/80">{p.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Select Payment Method</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { id: "easypaisa" as const, label: "EasyPaisa", icon: "📱", color: "text-emerald-400" },
              { id: "jazzcash" as const, label: "JazzCash", icon: "⚡", color: "text-amber-400" },
              { id: "card" as const, label: "Bank Card", icon: "💳", color: "text-sky-400" },
            ].map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center rounded-2xl border p-3 text-center transition ${
                    active ? "border-amber-300 bg-white/10 font-bold text-white" : "border-white/10 bg-white/5 text-violet-200 hover:bg-white/10"
                  }`}
                >
                  <span className={`text-2xl ${m.color}`}>{m.icon}</span>
                  <span className="mt-1 text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handlePay} className="mt-6 space-y-4">
          {method !== "card" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">
                {method === "easypaisa" ? "EasyPaisa Mobile Number" : "JazzCash Mobile Number"}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-300 focus:outline-none"
                placeholder="03xx xxxxxxx"
              />
              <p className="mt-1 text-[10px] text-violet-200/60">
                You will receive an MPIN authorization prompt on your mobile phone.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-300 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-violet-200/80">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-8 py-4 font-bold text-[#0b0a2b] shadow-xl shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:opacity-50"
          >
            {loading ? "Authorizing Payment Gateway..." : `Pay ${plan === "basic" ? "Rs 1,500" : "Rs 2,800"} Securely →`}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-violet-200/60">
          🔒 PCI-DSS Encrypted Gateway · Instant Activation · No recurring billing without consent
        </div>
      </div>
    </div>
  );
}
