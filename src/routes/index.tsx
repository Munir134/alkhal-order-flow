import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, ShoppingBag, MapPin, Bike, X, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

const DeliveryLocationPicker = lazy(
  () => import("@/components/DeliveryLocationPicker"),
);

export const Route = createFileRoute("/")({
  component: Index,
});

const BRANCHES = [
  {
    id: "al-zahra",
    name: "Al-Zahra",
    tagline: "The flagship — old city quarter",
    url: "https://order.alkhal.com/al-zahra",
  },
  {
    id: "al-andalus",
    name: "Al-Andalus",
    tagline: "Riverside courtyard dining",
    url: "https://order.alkhal.com/al-andalus",
  },
  {
    id: "al-safa",
    name: "Al-Safa",
    tagline: "Modern quarter, heritage kitchen",
    url: "https://order.alkhal.com/al-safa",
  },
];

type Step = "choice" | "pickup";

function Index() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choice");

  // Open the fulfillment modal on first visit (per session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("alkhal_fulfillment_seen");
    if (!seen) {
      setOpen(true);
      sessionStorage.setItem("alkhal_fulfillment_seen", "1");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      // reset step when modal closes (after animation)
      const t = setTimeout(() => setStep("choice"), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const goToMenu = () => {
    setOpen(false);
    window.location.href = "https://damascene.vercel.app/";
  };

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative isolate overflow-hidden min-h-screen flex items-center">
        <img
          src={heroImage}
          alt="A Damascene feast with candlelight and heritage plating"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.75 0.13 82 / 0.4) 0, transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.42 0.14 20 / 0.45) 0, transparent 45%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center text-[color:var(--cream)] w-full">
          <div className="mx-auto flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-14 bg-[color:var(--gold)]/60" />
            <span className="text-[color:var(--gold)] text-[0.7rem] tracking-[0.5em] uppercase font-medium">
              A Taste of Damascus
            </span>
            <span className="h-px w-14 bg-[color:var(--gold)]/60" />
          </div>

          <h1
            className="font-display font-medium tracking-tight leading-[0.95] text-6xl sm:text-7xl md:text-8xl"
          >
            <span className="block">ALKHAL</span>
            <span
              className="block italic"
              style={{
                background:
                  "linear-gradient(120deg, var(--gold) 0%, oklch(0.88 0.11 85) 50%, var(--gold-deep) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ALDIMASHQI
            </span>
          </h1>

          <p className="mt-8 max-w-xl mx-auto text-base sm:text-lg text-[color:var(--cream)]/80 leading-relaxed">
            Heritage recipes, hand-plated. From the old city of Damascus to your table.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-8 py-4 text-sm font-semibold text-[color:var(--charcoal-deep)] shadow-[0_10px_40px_-10px_oklch(0.75_0.13_82/0.6)] hover:bg-[color:var(--gold-deep)] hover:text-[color:var(--cream)] transition-colors duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              Order Now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <OrderModal
        open={open}
        step={step}
        onClose={() => setOpen(false)}
        onDelivery={goToMenu}
        onSelectBranch={goToMenu}
        onPickup={() => setStep("pickup")}
        onBack={() => setStep("choice")}
      />
    </main>
  );
}

function OrderModal({
  open,
  step,
  onClose,
  onDelivery,
  onSelectBranch,
  onPickup,
  onBack,
}: {
  open: boolean;
  step: Step;
  onClose: () => void;
  onDelivery: () => void;
  onSelectBranch: () => void;
  onPickup: () => void;
  onBack: () => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--charcoal-deep)]/85 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How would you like your order?"
        className={`relative w-full max-w-lg rounded-2xl border border-[color:var(--gold)]/25 bg-[color:var(--charcoal)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, oklch(0.75 0.13 82 / 0.08), transparent 55%)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-[color:var(--cream)]/60 hover:text-[color:var(--cream)] hover:bg-[color:var(--cream)]/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-[color:var(--gold)]/50" />
              <span className="text-[color:var(--gold)] text-[0.65rem] tracking-[0.45em] uppercase">
                {step === "choice" ? "Place an order" : "Choose a branch"}
              </span>
              <span className="h-px w-8 bg-[color:var(--gold)]/50" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[color:var(--cream)]">
              {step === "choice" ? "How would you like it?" : "Pickup location"}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--cream)]/60">
              {step === "choice"
                ? "Delivered warm to your door, or ready at the counter."
                : "Select the branch you'd like to collect from."}
            </p>
          </div>

          {/* Sliding stage */}
          <div className="relative mt-8 overflow-hidden">
            <div
              className="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: step === "choice" ? "translateX(0%)" : "translateX(-50%)",
              }}
            >
              {/* Step 1: Choice */}
              <div className="w-1/2 shrink-0 pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ChoiceCard
                    icon={<ShoppingBag className="h-6 w-6" />}
                    label="Pickup"
                    hint="Ready at the counter"
                    onClick={onPickup}
                  />
                  <ChoiceCard
                    icon={<Bike className="h-6 w-6" />}
                    label="Delivery"
                    hint="Straight to your door"
                    onClick={onDelivery}
                  />
                </div>
              </div>

              {/* Step 2: Pickup locations */}
              <div className="w-1/2 shrink-0 pl-1">
                <ul className="space-y-2.5">
                  {BRANCHES.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={onSelectBranch}
                        className="group flex w-full items-center gap-4 rounded-xl border border-[color:var(--cream)]/10 bg-[color:var(--charcoal-soft)]/60 px-4 py-3.5 text-left transition-colors duration-300 hover:bg-[color:var(--charcoal-deep)] hover:border-[color:var(--gold)]/40"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gold)]/40 text-[color:var(--gold)] transition-colors duration-300 group-hover:bg-[color:var(--gold)] group-hover:text-[color:var(--charcoal-deep)]">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-xl leading-tight text-[color:var(--cream)]">
                            {b.name}
                          </span>
                          <span className="block text-xs text-[color:var(--cream)]/55">
                            {b.tagline}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-[color:var(--cream)]/40 transition-all duration-300 group-hover:text-[color:var(--gold)] group-hover:translate-x-1" />
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onBack}
                  className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--cream)]/60 hover:text-[color:var(--gold)] transition-colors duration-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--charcoal-soft)]/60 px-6 py-8 text-[color:var(--cream)] transition-colors duration-300 hover:bg-[color:var(--charcoal-deep)] hover:border-[color:var(--gold)]/60"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--gold)]/40 text-[color:var(--gold)] transition-colors duration-300 group-hover:bg-[color:var(--gold)] group-hover:text-[color:var(--charcoal-deep)]">
        {icon}
      </span>
      <span className="font-display text-2xl leading-none">{label}</span>
      <span className="text-[0.7rem] uppercase tracking-[0.25em] text-[color:var(--cream)]/55">
        {hint}
      </span>
    </button>
  );
}
