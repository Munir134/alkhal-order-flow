import { useState, useEffect } from "react";
import { Car, Store, MapPin, Clock, Check, ChevronRight, AlertCircle, Info } from "lucide-react";

export type PickupType = "drive_thru" | "counter";

export type VehicleDetails = {
  carModel: string;
  carColor: string;
  plateNumber: string;
};

export type Branch = {
  id: string;
  name: string;
  tagline: string;
  url: string;
  lat: number;
  lng: number;
  prepTime: string;
  isOpen: boolean;
  hasDriveThru: boolean;
};

export const BRANCHES_DATA: Branch[] = [
  {
    id: "al-zahra",
    name: "Al-Zahra",
    tagline: "The flagship — old city quarter",
    url: "https://order.alkhal.com/al-zahra",
    lat: 24.7136,
    lng: 46.6753,
    prepTime: "10-15 mins",
    isOpen: true,
    hasDriveThru: true,
  },
  {
    id: "al-andalus",
    name: "Al-Andalus",
    tagline: "Riverside courtyard dining",
    url: "https://order.alkhal.com/al-andalus",
    lat: 24.7436,
    lng: 46.6553,
    prepTime: "8-12 mins",
    isOpen: true,
    hasDriveThru: true,
  },
  {
    id: "al-safa",
    name: "Al-Safa",
    tagline: "Modern quarter, heritage kitchen",
    url: "https://order.alkhal.com/al-safa",
    lat: 24.6836,
    lng: 46.7053,
    prepTime: "12-18 mins",
    isOpen: true,
    hasDriveThru: false,
  },
];

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function PickupFulfillment({
  onConfirm,
}: {
  onConfirm: (data: {
    branch: Branch;
    pickupType: PickupType;
    vehicleDetails?: VehicleDetails;
  }) => void;
}) {
  const [pickupType, setPickupType] = useState<PickupType>("drive_thru");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("al-zahra");
  const [vehicle, setVehicle] = useState<VehicleDetails>({
    carModel: "",
    carColor: "",
    plateNumber: "",
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Try retrieving user location for distance calculations
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 5000 },
      );
    }
  }, []);

  const selectedBranch =
    BRANCHES_DATA.find((b) => b.id === selectedBranchId) || BRANCHES_DATA[0];

  // Auto-switch to counter if selected branch has no drive-thru
  useEffect(() => {
    if (!selectedBranch.hasDriveThru && pickupType === "drive_thru") {
      setPickupType("counter");
    }
  }, [selectedBranchId, selectedBranch.hasDriveThru, pickupType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupType === "drive_thru") {
      if (!vehicle.carModel.trim() || !vehicle.plateNumber.trim()) {
        setFormError("Please provide your Car Model and License Plate Number for Drive-Thru pickup.");
        return;
      }
    }
    setFormError(null);
    onConfirm({
      branch: selectedBranch,
      pickupType,
      vehicleDetails: pickupType === "drive_thru" ? vehicle : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. PICKUP METHOD TOGGLE */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--gold)]/80 mb-3">
          Select Pickup Experience
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!selectedBranch.hasDriveThru}
            onClick={() => {
              setPickupType("drive_thru");
              setFormError(null);
            }}
            className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left ${
              !selectedBranch.hasDriveThru
                ? "border-[color:var(--gold)]/10 bg-[color:var(--charcoal-soft)]/20 opacity-50 cursor-not-allowed"
                : pickupType === "drive_thru"
                ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--cream)] shadow-[0_0_20px_-5px_oklch(0.75_0.13_82/0.3)]"
                : "border-[color:var(--gold)]/20 bg-[color:var(--charcoal-soft)]/50 text-[color:var(--cream)]/70 hover:border-[color:var(--gold)]/40"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="p-2 rounded-lg bg-[color:var(--gold)]/15 text-[color:var(--gold)]">
                <Car className="h-5 w-5" />
              </div>
              {pickupType === "drive_thru" && selectedBranch.hasDriveThru && (
                <div className="h-5 w-5 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span className="font-semibold text-base text-[color:var(--cream)]">
              Drive-Thru / On-The-Go
            </span>
            <span className="text-xs text-[color:var(--cream)]/60 mt-1">
              {selectedBranch.hasDriveThru
                ? "Delivered straight to your vehicle upon arrival"
                : "Not available at this branch"}
            </span>
            {!selectedBranch.hasDriveThru && (
              <span className="flex items-center gap-1 mt-2 text-[0.65rem] text-amber-400/80">
                <Info className="h-3 w-3" /> Select a Drive-Thru Ready branch below
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPickupType("counter");
              setFormError(null);
            }}
            className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left ${
              pickupType === "counter"
                ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--cream)] shadow-[0_0_20px_-5px_oklch(0.75_0.13_82/0.3)]"
                : "border-[color:var(--gold)]/20 bg-[color:var(--charcoal-soft)]/50 text-[color:var(--cream)]/70 hover:border-[color:var(--gold)]/40"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="p-2 rounded-lg bg-[color:var(--gold)]/15 text-[color:var(--gold)]">
                <Store className="h-5 w-5" />
              </div>
              {pickupType === "counter" && (
                <div className="h-5 w-5 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span className="font-semibold text-base text-[color:var(--cream)]">
              In-Store Counter
            </span>
            <span className="text-xs text-[color:var(--cream)]/60 mt-1">
              Pick up at takeaway counter inside branch
            </span>
          </button>
        </div>
      </div>

      {/* 2. VEHICLE DETAILS (IF DRIVE-THRU) */}
      {pickupType === "drive_thru" && (
        <div className="p-4 rounded-xl border border-[color:var(--gold)]/20 bg-[color:var(--charcoal-soft)]/40 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--gold)]">
            <Car className="h-4 w-4" />
            Vehicle Details (For Curbside Delivery)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[color:var(--cream)]/70 mb-1">
                Car Make & Model *
              </label>
              <input
                type="text"
                placeholder="e.g. Toyota Camry"
                value={vehicle.carModel}
                onChange={(e) =>
                  setVehicle((v) => ({ ...v, carModel: e.target.value }))
                }
                className="w-full rounded-lg border border-[color:var(--gold)]/20 bg-[color:var(--charcoal-deep)] px-3 py-2 text-sm text-[color:var(--cream)] placeholder:text-[color:var(--cream)]/30 focus:border-[color:var(--gold)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[color:var(--cream)]/70 mb-1">
                Car Color
              </label>
              <input
                type="text"
                placeholder="e.g. White / Silver"
                value={vehicle.carColor}
                onChange={(e) =>
                  setVehicle((v) => ({ ...v, carColor: e.target.value }))
                }
                className="w-full rounded-lg border border-[color:var(--gold)]/20 bg-[color:var(--charcoal-deep)] px-3 py-2 text-sm text-[color:var(--cream)] placeholder:text-[color:var(--cream)]/30 focus:border-[color:var(--gold)] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-[color:var(--cream)]/70 mb-1">
                License Plate Number *
              </label>
              <input
                type="text"
                placeholder="e.g. ABC 1234"
                value={vehicle.plateNumber}
                onChange={(e) =>
                  setVehicle((v) => ({ ...v, plateNumber: e.target.value }))
                }
                className="w-full rounded-lg border border-[color:var(--gold)]/20 bg-[color:var(--charcoal-deep)] px-3 py-2 text-sm text-[color:var(--cream)] placeholder:text-[color:var(--cream)]/30 focus:border-[color:var(--gold)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. BRANCH SELECTOR */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--gold)]/80 mb-3">
          Select Branch
        </label>
        <div className="space-y-2.5">
          {BRANCHES_DATA.map((branch) => {
            const isSelected = selectedBranchId === branch.id;
            const distance = userLocation
              ? calculateDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  branch.lat,
                  branch.lng,
                )
              : null;

            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => setSelectedBranchId(branch.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--cream)] shadow-[0_0_20px_-5px_oklch(0.75_0.13_82/0.3)]"
                    : "border-[color:var(--gold)]/15 bg-[color:var(--charcoal-soft)]/30 text-[color:var(--cream)]/80 hover:border-[color:var(--gold)]/35"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-[color:var(--cream)]">
                        {branch.name}
                      </span>
                      {branch.hasDriveThru && (
                        <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[color:var(--gold)]/20 text-[color:var(--gold)] font-medium">
                          Drive-Thru Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[color:var(--cream)]/60 mt-0.5">
                      {branch.tagline}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[color:var(--cream)]/50 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[color:var(--gold)]" />
                        Ready in {branch.prepTime}
                      </span>
                      {distance !== null && (
                        <span>• {distance} km away</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <div className="h-6 w-6 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] flex items-center justify-center">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-[color:var(--cream)]/30" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* CONFIRM BUTTON */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] font-semibold text-sm shadow-[0_10px_30px_-10px_oklch(0.75_0.13_82/0.5)] hover:bg-[color:var(--gold-deep)] hover:text-[color:var(--cream)] transition-all duration-300 flex items-center justify-center gap-2"
      >
        Confirm Pickup Selection
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}
