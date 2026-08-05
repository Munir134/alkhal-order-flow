import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, ShoppingBag, MapPin, Bike, X, Loader2, Languages, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

const DeliveryLocationPicker = lazy(
  () => import("@/components/DeliveryLocationPicker"),
);

export const Route = createFileRoute("/")({
  component: Index,
});

type Lang = "en" | "ar";

const BRANCHES = [
  {
    id: "al-zahra",
    name: { en: "Al-Zahra", ar: "الزهراء" },
    tagline: { en: "The flagship — old city quarter", ar: "الفرع الرئيسي — حي المدينة القديمة" },
    url: "https://order.alkhal.com/al-zahra",
  },
  {
    id: "al-andalus",
    name: { en: "Al-Andalus", ar: "الأندلس" },
    tagline: { en: "Riverside courtyard dining", ar: "طعام في فناء على ضفة النهر" },
    url: "https://order.alkhal.com/al-andalus",
  },
  {
    id: "al-safa",
    name: { en: "Al-Safa", ar: "الصفا" },
    tagline: { en: "Modern quarter, heritage kitchen", ar: "حي عصري، مطبخ تراثي" },
    url: "https://order.alkhal.com/al-safa",
  },
];

const T = {
  en: {
    tagline: "A Taste of Damascus",
    heroSub: "Heritage recipes, hand-plated. From the old city of Damascus to your table.",
    orderNow: "Order Now",
    switchLang: "العربية",
    eyebrowChoice: "Place an order",
    eyebrowPickup: "Choose a branch",
    eyebrowDelivery: "Delivery address",
    titleChoice: "How would you like it?",
    titlePickup: "Pickup location",
    titleDelivery: "Where should we send it?",
    subChoice: "Delivered warm to your door, or ready at the counter.",
    subPickup: "Select the branch you'd like to collect from.",
    subDelivery: "Drop the pin on your door, or search for your address.",
    pickup: "Pickup",
    pickupHint: "Ready at the counter",
    delivery: "Delivery",
    deliveryHint: "Straight to your door",
    back: "Back",
    close: "Close",
    change: "Change",
  },
  ar: {
    tagline: "نكهة من دمشق",
    heroSub: "وصفات تراثية، تُقدَّم بعناية. من مدينة دمشق القديمة إلى مائدتك.",
    orderNow: "اطلب الآن",
    switchLang: "English",
    eyebrowChoice: "اطلب الآن",
    eyebrowPickup: "اختر الفرع",
    eyebrowDelivery: "عنوان التوصيل",
    titleChoice: "كيف تحب أن تستلم طلبك؟",
    titlePickup: "موقع الاستلام",
    titleDelivery: "إلى أين نرسله؟",
    subChoice: "يصل ساخناً إلى باب بيتك، أو جاهز عند المطعم.",
    subPickup: "اختر الفرع الذي تود الاستلام منه.",
    subDelivery: "حرّك الدبوس على بابك، أو ابحث عن عنوانك.",
    pickup: "استلام",
    pickupHint: "جاهز عند المطعم",
    delivery: "توصيل",
    deliveryHint: "إلى باب بيتك",
    back: "رجوع",
    close: "إغلاق",
    change: "تغيير",
  },
} as const;

type Step = "choice" | "pickup" | "delivery";

function Index() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choice");
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  const isRTL = lang === "ar";

  // Open the fulfillment modal on first visit (per session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("alkhal_fulfillment_seen");
    if (!seen) {
      setOpen(true);
      sessionStorage.setItem("alkhal_fulfillment_seen", "1");
    }
    const savedLang = localStorage.getItem("alkhal_lang");
    if (savedLang === "ar" || savedLang === "en") setLang(savedLang);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    try {
      localStorage.setItem("alkhal_lang", lang);
    } catch {}
  }, [lang, isRTL]);

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
      const t = setTimeout(() => setStep("choice"), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const goToMenu = () => {
    setOpen(false);
    window.location.href = "https://damascene.vercel.app/";
  };

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  return (
    <main className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
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

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          aria-label="Toggle language"
          className={`absolute top-6 z-20 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--charcoal-deep)]/60 backdrop-blur px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--cream)] hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal-deep)] transition-colors duration-300 ${
            isRTL ? "left-6" : "right-6"
          }`}
        >
          <Languages className="h-3.5 w-3.5" />
          {t.switchLang}
        </button>

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center text-[color:var(--cream)] w-full">
          <div className="mx-auto flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-14 bg-[color:var(--gold)]/60" />
            <span className="text-[color:var(--gold)] text-[0.7rem] tracking-[0.5em] uppercase font-medium">
              {t.tagline}
            </span>
            <span className="h-px w-14 bg-[color:var(--gold)]/60" />
          </div>

          <h1
            className="font-display font-medium tracking-tight leading-[0.95] text-6xl sm:text-7xl md:text-8xl"
          >
            <span className="block">{isRTL ? "الخال" : "ALKHAL"}</span>
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
              {isRTL ? "الدمشقي" : "ALDIMASHQI"}
            </span>
          </h1>

          <p className="mt-8 max-w-xl mx-auto text-base sm:text-lg text-[color:var(--cream)]/80 leading-relaxed">
            {t.heroSub}
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-8 py-4 text-sm font-semibold text-[color:var(--charcoal-deep)] shadow-[0_10px_40px_-10px_oklch(0.75_0.13_82/0.6)] hover:bg-[color:var(--gold-deep)] hover:text-[color:var(--cream)] transition-colors duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              {t.orderNow}
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 ${isRTL ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <OrderModal
        open={open}
        step={step}
        lang={lang}
        t={t}
        isRTL={isRTL}
        onToggleLang={toggleLang}
        onClose={() => setOpen(false)}
        onDelivery={() => setStep("delivery")}
        onConfirmDelivery={(loc) => {
          try {
            sessionStorage.setItem("alkhal_delivery", JSON.stringify(loc));
          } catch {}
          goToMenu();
        }}
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
  lang,
  t,
  isRTL,
  onToggleLang,
  onClose,
  onDelivery,
  onConfirmDelivery,
  onSelectBranch,
  onPickup,
  onBack,
}: {
  open: boolean;
  step: Step;
  lang: Lang;
  t: (typeof T)[Lang];
  isRTL: boolean;
  onToggleLang: () => void;
  onClose: () => void;
  onDelivery: () => void;
  onConfirmDelivery: (loc: { lat: number; lng: number; address: string }) => void;
  onSelectBranch: () => void;
  onPickup: () => void;
  onBack: () => void;
}) {
  const isDelivery = step === "delivery";
  return (
    <div
      aria-hidden={!open}
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-opacity duration-300 ${
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
        aria-label={t.titleChoice}
        className={`relative w-full ${
          isDelivery ? "max-w-2xl" : "max-w-lg"
        } max-h-[92vh] overflow-y-auto rounded-2xl border border-[color:var(--gold)]/25 bg-[color:var(--charcoal)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, oklch(0.75 0.13 82 / 0.08), transparent 55%)",
        }}
      >
        {/* Lang toggle inside modal */}
        <button
          onClick={onToggleLang}
          aria-label="Toggle language"
          className={`absolute top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)]/30 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--cream)]/80 hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal-deep)] hover:border-[color:var(--gold)] transition-colors ${
            isRTL ? "right-4" : "left-4"
          }`}
        >
          <Languages className="h-3 w-3" />
          {t.switchLang}
        </button>

        <button
          onClick={onClose}
          aria-label={t.close}
          className={`absolute top-4 z-10 rounded-full p-2 text-[color:var(--cream)]/60 hover:text-[color:var(--cream)] hover:bg-[color:var(--cream)]/10 transition-colors ${
            isRTL ? "left-4" : "right-4"
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`${isDelivery ? "px-6 sm:px-8" : "px-8"} pt-14 pb-8`}>
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-[color:var(--gold)]/50" />
              <span className="text-[color:var(--gold)] text-[0.65rem] tracking-[0.45em] uppercase">
                {step === "choice"
                  ? t.eyebrowChoice
                  : step === "pickup"
                    ? t.eyebrowPickup
                    : t.eyebrowDelivery}
              </span>
              <span className="h-px w-8 bg-[color:var(--gold)]/50" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[color:var(--cream)]">
              {step === "choice"
                ? t.titleChoice
                : step === "pickup"
                  ? t.titlePickup
                  : t.titleDelivery}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--cream)]/60">
              {step === "choice"
                ? t.subChoice
                : step === "pickup"
                  ? t.subPickup
                  : t.subDelivery}
            </p>
          </div>

          {isDelivery ? (
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="grid h-72 place-items-center rounded-xl border border-[color:var(--cream)]/10 bg-[color:var(--charcoal-soft)]/40">
                    <Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" />
                  </div>
                }
              >
                <DeliveryLocationPicker onConfirm={onConfirmDelivery} />
              </Suspense>
              <button
                onClick={onBack}
                className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--cream)]/60 hover:text-[color:var(--gold)] transition-colors duration-300"
              >
                <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
                {t.back}
              </button>
            </div>
          ) : (
            <div className="relative mt-8 overflow-hidden">
              <div
                className="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform:
                    step === "pickup"
                      ? isRTL
                        ? "translateX(50%)"
                        : "translateX(-50%)"
                      : "translateX(0%)",
                }}
              >
                {/* Step 1: Choice */}
                <div className="w-1/2 shrink-0 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ChoiceCard
                      icon={<ShoppingBag className="h-6 w-6" />}
                      label={t.pickup}
                      hint={t.pickupHint}
                      onClick={onPickup}
                    />
                    <ChoiceCard
                      icon={<Bike className="h-6 w-6" />}
                      label={t.delivery}
                      hint={t.deliveryHint}
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
                              {b.name[lang]}
                            </span>
                            <span className="block text-xs text-[color:var(--cream)]/55">
                              {b.tagline[lang]}
                            </span>
                          </span>
                          <ArrowRight className={`h-4 w-4 text-[color:var(--cream)]/40 transition-all duration-300 group-hover:text-[color:var(--gold)] group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onBack}
                    className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--cream)]/60 hover:text-[color:var(--gold)] transition-colors duration-300"
                  >
                    <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
                    {t.back}
                  </button>
                </div>
              </div>
            </div>
          )}
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
