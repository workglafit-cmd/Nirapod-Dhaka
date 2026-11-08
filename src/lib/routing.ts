import { supabase } from "@/integrations/supabase/client";

export type RouteResult = {
  destination: string;
  mode: string;
  route: any;
  all_routes: any[];
  explanation: string;
};

// 1. Geocode destination using Nominatim
export async function geocodeDestination(destination: string, currentLat: number, currentLng: number) {
  try {
    const params = new URLSearchParams({
      q: destination,
      format: "json",
      limit: "1",
      viewbox: `${currentLng - 0.2},${currentLat + 0.2},${currentLng + 0.2},${currentLat - 0.2}`,
      bounded: "1",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { "User-Agent": "NirapodDhaka/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch (e) {
    console.error("Geocoding error:", e);
    return null;
  }
}

// 2. Fetch OSRM candidate routes
export async function fetchCandidateRoutes(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: string = "car"
) {
  try {
    const profile = mode === "walking" ? "foot" : mode === "cycling" ? "bike" : "car";
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=true&steps=false`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.routes || [];
  } catch (e) {
    console.error("OSRM route error:", e);
    return [];
  }
}

// Simple point-to-line segment distance calculation in degrees
function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function routeToPointDistance(geometryCoords: [number, number][], pointLng: number, pointLat: number) {
  let minDistance = Infinity;
  for (let i = 0; i < geometryCoords.length - 1; i++) {
    const [x1, y1] = geometryCoords[i];
    const [x2, y2] = geometryCoords[i + 1];
    const d = pointToSegmentDistance(pointLng, pointLat, x1, y1, x2, y2);
    if (d < minDistance) minDistance = d;
  }
  return minDistance;
}

// Hazard weights
const HAZARD_WEIGHTS: Record<string, number> = {
  crime: 80,
  accident: 50,
  infrastructure: 40,
};

// 3. Client-side route calculation
export async function calculateSafeRoute(
  queryText: string,
  currentLat: number,
  currentLng: number,
  lang: string = "bn"
): Promise<{ status: "success" | "error"; message?: string; data?: RouteResult }> {
  const geoResult = await geocodeDestination(queryText, currentLat, currentLng);
  if (!geoResult) {
    return {
      status: "error",
      message: lang === "bn" ? `"${queryText}" এর অবস্থান খুঁজে পাওয়া যায়নি।` : `Could not locate "${queryText}".`,
    };
  }

  let mode = "car";
  const lowerQuery = queryText.toLowerCase();
  if (lowerQuery.includes("walk") || lowerQuery.includes("হেঁটে") || lowerQuery.includes("পায়ে")) {
    mode = "walking";
  } else if (lowerQuery.includes("cycle") || lowerQuery.includes("সাইকেল")) {
    mode = "cycling";
  }

  const candidates = await fetchCandidateRoutes(currentLat, currentLng, geoResult.lat, geoResult.lng, mode);
  if (!candidates || candidates.length === 0) {
    return {
      status: "error",
      message: lang === "bn" ? "কোনো রুট পাওয়া যায়নি।" : "No route found.",
    };
  }

  let activeReports: any[] = [];
  try {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .in("status", ["sent", "received"]);
    if (data) activeReports = data;
  } catch (err) {
    console.warn("Could not fetch reports for route scoring, continuing without hazards", err);
  }

  const BUFFER_DEG = 0.0005; // ~50m
  let bestRoute = candidates[0];
  let lowestPenalty = Infinity;

  candidates.forEach((route: any) => {
    const coords = route.geometry.coordinates as [number, number][];
    let penalty = (route.duration / 60) * 0.5;
    const hazardsEncountered: any[] = [];

    activeReports.forEach((rep) => {
      const dist = routeToPointDistance(coords, rep.lng, rep.lat);
      if (dist < BUFFER_DEG) {
        const weight = HAZARD_WEIGHTS[rep.type] || 30;
        penalty += weight;
        hazardsEncountered.push(rep);
      }
    });

    route.hazards_encountered = hazardsEncountered;
    route.penalty = penalty;

    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
      bestRoute = route;
    }
  });

  const durationMins = Math.round((bestRoute.duration || 0) / 60);
  const distanceKm = ((bestRoute.distance || 0) / 1000).toFixed(1);
  const hazardsCount = bestRoute.hazards_encountered?.length || 0;

  let explanation = "";
  if (lang === "bn") {
    explanation = `নিরাপদ রুট গণনা করা হয়েছে (${distanceKm} কিমি, ~${durationMins} মিনিট)। `;
    if (hazardsCount === 0) {
      explanation += "এই রুটে কোনো সক্রিয় বিপদ রিপোর্ট নেই।";
    } else {
      explanation += `এই রুটে ${hazardsCount}টি সংবেদনশীল বিপদ এলাকা এড়িয়ে চলা হয়েছে।`;
    }
  } else {
    explanation = `Safest route calculated (${distanceKm} km, ~${durationMins} mins). `;
    if (hazardsCount === 0) {
      explanation += "No active hazards reported along this path.";
    } else {
      explanation += `Avoided ${hazardsCount} reported hazard area(s) along the path.`;
    }
  }

  return {
    status: "success",
    data: {
      destination: geoResult.displayName.split(",")[0],
      mode,
      route: bestRoute,
      all_routes: candidates,
      explanation,
    },
  };
}
