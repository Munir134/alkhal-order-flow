import { useEffect, useRef } from "react";
import { Car, Store, Bike, Check, ChevronRight } from "lucide-react";

export type SwitcherMode = "pickup" | "delivery";

type Props = {
  open: boolean;
  activeMode: SwitcherMode;
  activeLabel: string;
  onClose: () => void;
  onSelect: (mode: SwitcherMode) => void;
};

/**
 * Light / white themed popover (matches the menu site look, not the dark hero
 * theme) that lets the guest switch between Pickup and Delivery.
 */
export default function FulfillmentSwitcher({
  open,
  activeMode,
  activeLabel,
  onClose,
  onSelect,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // defer so the opening click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const rows: { mode: SwitcherMode; label: string; hint: string; icon: React.ReactNode }[] = [
    {
      mode: "pickup",
      label: "Pickup / Drive-Thru",
      hint: "Choose a branch",
      icon: <Car className="h-5 w-5" />,
    },
    {
      mode: "delivery",
      label: "Delivery",
      hint: "Set your address",
      icon: <Bike className="h-5 w-5" />,
    },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Change order mode"
      className="absolute left-0 top-full mt-2 w-[19rem] overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/10 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="px-4 pt-4 pb-3 border-b border-black/5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-neutral-400">
          Order mode
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-800 truncate">{activeLabel}</p>
      </div>

      <div className="p-2">
        {rows.map((r) => {
          const active = r.mode === activeMode;
          return (
            <button
              key={r.mode}
              role="menuitem"
              onClick={() => onSelect(r.mode)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 ${
                active
                  ? "bg-[color:var(--gold)]/12 text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                  active
                    ? "bg-[color:var(--gold)] text-neutral-900"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {r.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">{r.label}</span>
                <span className="block text-xs text-neutral-500 leading-tight">{r.hint}</span>
              </span>
              {active ? (
                <Check className="h-4 w-4 flex-shrink-0 text-[color:var(--gold-deep)]" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const ModeIcon = ({
  mode,
  driveThru,
  className,
}: {
  mode: SwitcherMode;
  driveThru?: boolean;
  className?: string;
}) => {
  if (mode === "delivery") return <Bike className={className} />;
  return driveThru ? <Car className={className} /> : <Store className={className} />;
};
