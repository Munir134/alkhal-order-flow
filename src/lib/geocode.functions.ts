import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ lat: z.number(), lng: z.number() }).parse(data),
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) {
      throw new Error("Google Maps connector credentials are not configured");
    }

    const url = `${GATEWAY_URL}/maps/api/geocode/json?latlng=${data.lat},${data.lng}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Reverse geocode failed [${res.status}]: ${body}`);
    }

    const json = (await res.json()) as {
      status: string;
      results?: Array<{ formatted_address: string }>;
    };

    if (json.status !== "OK" || !json.results?.length) {
      return { address: "" };
    }

    return { address: json.results[0].formatted_address };
  });
