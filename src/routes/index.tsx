import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Bike,
  X,
  Loader2,
  Car,
  Store,
  Edit3,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import PickupFulfillment, {
  Branch,
  PickupType,
  VehicleDetails,
} from "@/components/PickupFulfillment";
import FulfillmentSwitcher, {
  ModeIcon,
  SwitcherMode,
} from "@/components/FulfillmentSwitcher";

const DeliveryLocationPicker = lazy(
  () => import("@/components/DeliveryLocationPicker"),
);


export const Route = createFileRoute("/")({
  component: Index,
});

type Step = "choice" | "pickup" | "delivery";

export type ActiveFulfillment =
  | {
      type: "pickup";
      pickupType: PickupType;
      branch: Branch;
      vehicleDetails?: VehicleDetails;
    }
  | {
      type: "delivery";
      location: { lat: number; lng: number; address: string };
    };

function Index() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choice");
  const [activeFulfillment, setActiveFulfillment] =
    useState<ActiveFulfillment | null>(null);

  // Restore fulfillment from localStorage / sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("alkhal_fulfillment");
      if (saved) {
        setActiveFulfillment(JSON.parse(saved));
      }
    } catch {}

    const seen = sessionStorage.getItem("alkhal_fulfillment_seen");
    if (!seen) {
      setOpen(true);
      sessionStorage.setItem("alkhal_fulfillment_seen", "1");
    }
  }, []);

  // Whether user has already made a choice before (can dismiss modal)
  const hasChosen = activeFulfillment !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && hasChosen) setOpen(false);
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

  const MENU_URL = "https://damascene.vercel.app/";

  const redirectToMenu = (destination: string, fulfillmentData: ActiveFulfillment) => {
    try {
      localStorage.setItem("alkhal_fulfillment", JSON.stringify(fulfillmentData));
    } catch {}
    // Small delay for smooth close animation before redirect
    setTimeout(() => {
      window.location.href = destination;
    }, 300);
  };

  const handleConfirmPickup = (data: {
    branch: Branch;
    pickupType: PickupType;
    vehicleDetails?: VehicleDetails;
  }) => {
    const fulfillmentData: ActiveFulfillment = {
      type: "pickup",
      pickupType: data.pickupType,
      branch: data.branch,
      vehicleDetails: data.vehicleDetails,
    };
    setActiveFulfillment(fulfillmentData);
    setOpen(false);
    redirectToMenu(data.branch.url, fulfillmentData);
  };

  const handleConfirmDelivery = (loc: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    const fulfillmentData: ActiveFulfillment = {
      type: "delivery",
      location: loc,
    };
    setActiveFulfillment(fulfillmentData);
    setOpen(false);
    redirectToMenu(MENU_URL, fulfillmentData);
  };

  return (
    <main className="min-h-screen relative">
      {/* FULFILLMENT MODE INDICATOR — BARN'S / AlBaik style */}
      {activeFulfillment && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[color:var(--charcoal-deep)]/95 backdrop-blur-md border-b border-[color:var(--gold)]/15 animate-in slide-in-from-top duration-300">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2">

            {/* LEFT: Pin icon + mode + address */}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 group min-w-0"
            >
              {/* Location pin SVG — matches reference exactly */}
              <div className="flex-shrink-0 relative">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-[color:var(--cream)]"
                  fill="currentColor"
                >
                  {/* Pin head circle */}
                  <circle cx="12" cy="8" r="5" />
                  {/* Pin stem */}
                  <path d="M12 13 L12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              {/* Mode label + sub-text */}
              <div className="flex flex-col items-start min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[color:var(--cream)] text-sm sm:text-base leading-tight">
                    {activeFulfillment.type === "pickup"
                      ? activeFulfillment.pickupType === "drive_thru"
                        ? "Drive-Thru"
                        : "Pickup"
                      : "Delivery"}
                  </span>
                  {/* Chevron dropdown indicator */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 text-[color:var(--cream)]/70 flex-shrink-0 group-hover:text-[color:var(--gold)] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Sub-text: branch name or truncated address */}
                <span className="text-xs text-[color:var(--cream)]/60 truncate max-w-[160px] sm:max-w-xs leading-tight group-hover:text-[color:var(--gold)]/80 transition-colors">
                  {activeFulfillment.type === "pickup"
                    ? activeFulfillment.branch.name
                    : activeFulfillment.location.address
                        ? activeFulfillment.location.address.split(",")[0]
                        : "Location Selected"}
                </span>
              </div>
            </button>

            {/* RIGHT: subtle gold dot accent (like BARN'S app) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Active mode pill */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/30 text-[color:var(--gold)] text-[0.65rem] font-semibold uppercase tracking-widest">
                {activeFulfillment.type === "pickup" ? (
                  activeFulfillment.pickupType === "drive_thru" ? (
                    <><Car className="h-3 w-3" /> Drive-Thru</>
                  ) : (
                    <><Store className="h-3 w-3" /> Counter</>
                  )
                ) : (
                  <><Bike className="h-3 w-3" /> Delivery</>
                )}
              </span>

              {/* Change button */}
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 text-[color:var(--gold)] text-xs font-medium hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal-deep)] transition-all duration-300"
              >
                <Edit3 className="h-3 w-3" />
                <span className="hidden sm:inline">Change</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HERO SECTION */}
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

          <h1 className="font-display font-medium tracking-tight leading-[0.95] text-6xl sm:text-7xl md:text-8xl">
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
              {activeFulfillment ? (
                <Edit3 className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              {activeFulfillment ? "Change Order Mode" : "Order Now"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <OrderModal
        open={open}
        step={step}
        hasChosen={hasChosen}
        onClose={() => { if (hasChosen) setOpen(false); }}
        onDelivery={() => setStep("delivery")}
        onConfirmDelivery={handleConfirmDelivery}
        onConfirmPickup={handleConfirmPickup}
        onPickup={() => setStep("pickup")}
        onBack={() => setStep("choice")}
      />
    </main>
  );
}

function OrderModal({
  open,
  step,
  hasChosen,
  onClose,
  onDelivery,
  onConfirmDelivery,
  onConfirmPickup,
  onPickup,
  onBack,
}: {
  open: boolean;
  step: Step;
  hasChosen: boolean;
  onClose: () => void;
  onDelivery: () => void;
  onConfirmDelivery: (loc: { lat: number; lng: number; address: string }) => void;
  onConfirmPickup: (data: {
    branch: Branch;
    pickupType: PickupType;
    vehicleDetails?: VehicleDetails;
  }) => void;
  onPickup: () => void;
  onBack: () => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop — only dismissible if user has already chosen */}
      <div
        onClick={hasChosen ? onClose : undefined}
        className={`absolute inset-0 bg-[color:var(--charcoal-deep)]/85 backdrop-blur-sm ${hasChosen ? "cursor-pointer" : "cursor-default"}`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How would you like your order?"
        className={`relative w-full ${
          step === "delivery" || step === "pickup" ? "max-w-2xl" : "max-w-lg"
        } max-h-[92vh] overflow-y-auto rounded-2xl border border-[color:var(--gold)]/25 bg-[color:var(--charcoal)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, oklch(0.75 0.13 82 / 0.08), transparent 55%)",
        }}
      >
        {/* Only show close button if user has already chosen before */}
        {hasChosen && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-[color:var(--cream)]/60 hover:text-[color:var(--cream)] hover:bg-[color:var(--cream)]/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="px-6 sm:px-8 pt-10 pb-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-8 bg-[color:var(--gold)]/50" />
              <span className="text-[color:var(--gold)] text-[0.65rem] tracking-[0.45em] uppercase">
                {step === "choice"
                  ? "Place an order"
                  : step === "pickup"
                    ? "Pickup Experience"
                    : "Delivery Address"}
              </span>
              <span className="h-px w-8 bg-[color:var(--gold)]/50" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[color:var(--cream)]">
              {step === "choice"
                ? "How would you like it?"
                : step === "pickup"
                  ? "Drive-Thru or Takeaway"
                  : "Where should we send it?"}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--cream)]/60">
              {step === "choice"
                ? "Delivered warm to your door, or ready at the counter or drive-thru."
                : step === "pickup"
                  ? "Choose Drive-Thru for curbside service, or In-Store counter pickup."
                  : "Drop the pin on your door, or search for your address."}
            </p>
          </div>

          {step === "delivery" ? (
            <div>
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
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            </div>
          ) : step === "pickup" ? (
            <div>
              <PickupFulfillment onConfirm={onConfirmPickup} />
              <button
                onClick={onBack}
                className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--cream)]/60 hover:text-[color:var(--gold)] transition-colors duration-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Options
              </button>
            </div>
          ) : (
            /* Step 1: Choice */
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ChoiceCard
                  icon={<Car className="h-6 w-6" />}
                  label="Pickup / Drive-Thru"
                  hint="Drive-Thru or Takeaway counter"
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
      <span className="font-display text-2xl leading-none text-center">{label}</span>
      <span className="text-[0.7rem] uppercase tracking-[0.25em] text-[color:var(--cream)]/55 text-center">
        {hint}
      </span>
    </button>
  );
}
