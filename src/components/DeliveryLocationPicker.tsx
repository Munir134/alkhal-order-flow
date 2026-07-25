/// <reference types="google.maps" />
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LocateFixed, MapPin, Search, Check } from "lucide-react";
import { reverseGeocode } from "@/lib/geocode.functions";

type Suggestion = {
  placeId: string;
  primary: string;
  secondary: string;
  prediction: any;
};

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }; // Riyadh

let mapsLoaderPromise: Promise<typeof google> | null = null;

function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject("SSR");
  if ((window as any).google?.maps?.Map) return Promise.resolve((window as any).google);
  if (mapsLoaderPromise) return mapsLoaderPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) return Promise.reject(new Error("Google Maps browser key missing"));

  mapsLoaderPromise = new Promise((resolve, reject) => {
    (window as any).__initAlkhalMap = () => resolve((window as any).google);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=places&callback=__initAlkhalMap${channel ? `&channel=${channel}` : ""}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoaderPromise;
}

export default function DeliveryLocationPicker({
  onConfirm,
}: {
  onConfirm: (loc: { lat: number; lng: number; address: string }) => void;
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const sessionTokenRef = useRef<any>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [addrLoading, setAddrLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const doReverseGeocode = useServerFn(reverseGeocode);

  const updateAddress = useCallback(
    async (lat: number, lng: number) => {
      setAddrLoading(true);
      try {
        const { address } = await doReverseGeocode({ data: { lat, lng } });
        setAddress(address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } catch {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setAddrLoading(false);
      }
    },
    [doReverseGeocode],
  );

  const setLocation = useCallback(
    (lat: number, lng: number, opts?: { pan?: boolean }) => {
      setCoords({ lat, lng });
      if (markerRef.current) markerRef.current.setPosition({ lat, lng });
      if (mapRef.current && opts?.pan !== false) {
        mapRef.current.panTo({ lat, lng });
      }
      void updateAddress(lat, lng);
    },
    [updateAddress],
  );

  // Init map
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapEl.current) return;
        const map = new google.maps.Map(mapEl.current, {
          center: DEFAULT_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          styles: DARK_MAP_STYLE,
        });
        const marker = new google.maps.Marker({
          map,
          position: DEFAULT_CENTER,
          draggable: true,
        });
        mapRef.current = map;
        markerRef.current = marker;

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          setLocation(e.latLng.lat(), e.latLng.lng());
        });
        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          if (!p) return;
          setLocation(p.lat(), p.lng(), { pan: false });
        });

        setLoading(false);
        setLocation(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, { pan: false });
      })
      .catch((e) => {
        setError(e?.message || "Map failed to load");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not available on this device");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) mapRef.current.setZoom(16);
        setLocation(latitude, longitude);
      },
      (err) => {
        setLocating(false);
        setError(err.message || "Couldn't get your location");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [setLocation]);

  // Autocomplete
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = window.setTimeout(async () => {
      try {
        const google = (window as any).google;
        if (!google?.maps?.importLibrary) return;
        const placesLib: any = await google.maps.importLibrary("places");
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        const { suggestions } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: searchInput.slice(0, 200),
            sessionToken: sessionTokenRef.current,
          });
        const mapped: Suggestion[] = (suggestions || [])
          .filter((s: any) => s.placePrediction)
          .slice(0, 5)
          .map((s: any) => ({
            placeId: s.placePrediction.placeId,
            primary: s.placePrediction.mainText?.text || s.placePrediction.text?.text || "",
            secondary: s.placePrediction.secondaryText?.text || "",
            prediction: s.placePrediction,
          }));
        setSuggestions(mapped);
        setShowSuggestions(true);
      } catch (e) {
        // silent
      }
    }, 250);
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  const pickSuggestion = useCallback(
    async (s: Suggestion) => {
      try {
        const place = s.prediction.toPlace();
        await place.fetchFields({ fields: ["location", "formattedAddress"] });
        const loc = place.location;
        if (!loc) return;
        const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
        const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
        if (mapRef.current) mapRef.current.setZoom(16);
        setSearchInput(place.formattedAddress || `${s.primary} ${s.secondary}`.trim());
        setSuggestions([]);
        setShowSuggestions(false);
        sessionTokenRef.current = null;
        setLocation(lat, lng);
        if (place.formattedAddress) setAddress(place.formattedAddress);
      } catch {
        // fallback: nothing
      }
    },
    [setLocation],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--cream)]/40" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => suggestions.length && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search for a street, area, or landmark"
          className="w-full rounded-xl border border-[color:var(--cream)]/10 bg-[color:var(--charcoal-soft)]/60 py-3 pl-10 pr-3 text-sm text-[color:var(--cream)] placeholder:text-[color:var(--cream)]/40 outline-none transition-colors focus:border-[color:var(--gold)]/50"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--charcoal)] shadow-xl">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(s)}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--charcoal-deep)]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-[color:var(--cream)]">
                      {s.primary}
                    </span>
                    {s.secondary && (
                      <span className="block truncate text-xs text-[color:var(--cream)]/55">
                        {s.secondary}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="relative h-64 sm:h-72 overflow-hidden rounded-xl border border-[color:var(--cream)]/10 bg-[color:var(--charcoal-soft)]">
        <div ref={mapEl} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-[color:var(--charcoal)]/70 text-[color:var(--cream)]/70">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" />
          </div>
        )}
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating || loading}
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--charcoal)]/90 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold)] shadow-lg transition-colors hover:bg-[color:var(--charcoal-deep)] disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LocateFixed className="h-3.5 w-3.5" />
          )}
          Use my location
        </button>
      </div>

      {/* Address preview */}
      <div className="flex items-start gap-3 rounded-xl border border-[color:var(--gold)]/20 bg-[color:var(--charcoal-soft)]/40 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--gold)]/40 text-[color:var(--gold)]">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--gold)]/80">
            Delivering to
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-[color:var(--cream)]">
            {addrLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--cream)]/50" />
                <span className="text-[color:var(--cream)]/60">Locating address…</span>
              </>
            ) : (
              <span className="truncate">{address || "Pick a point on the map"}</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[color:var(--cream)]/70">
          <span className="text-[color:var(--gold)]">Note:</span> {error}
        </p>
      )}

      <button
        type="button"
        disabled={!coords || addrLoading}
        onClick={() => coords && onConfirm({ ...coords, address })}
        className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-3.5 text-sm font-semibold text-[color:var(--charcoal-deep)] shadow-[0_10px_30px_-10px_oklch(0.75_0.13_82/0.6)] transition-colors duration-300 hover:bg-[color:var(--gold-deep)] hover:text-[color:var(--cream)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Check className="h-4 w-4" />
        Confirm location
      </button>
    </div>
  );
}

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1f1a16" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0b09" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#d4a24a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a231d" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8a7550" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2a1a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2b2520" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d0b09" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#c9b891" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a2f24" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2b2520" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1a24" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a6a80" }] },
];
