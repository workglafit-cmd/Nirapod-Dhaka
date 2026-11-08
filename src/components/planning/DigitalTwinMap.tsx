import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { WardAnalytics } from "@/lib/public-data";
import type { Report } from "@/lib/reports";
import type { InterventionConfig } from "@/lib/policy-simulator";
import { DHAKA_CENTER } from "@/lib/geo";
import { dhakaBoundaryPolygon } from "@/data/dhakaBoundary";
import { Layers, CloudRain, Lightbulb, Shield, Footprints, Sparkles } from "lucide-react";

type Props = {
  wardAnalytics: WardAnalytics[];
  selectedWardId: string;
  onSelectWard: (wardId: string) => void;
  reports: Report[];
  interventions: InterventionConfig;
  className?: string;
};

export function DigitalTwinMap({
  wardAnalytics,
  selectedWardId,
  onSelectWard,
  reports,
  interventions,
  className = "w-full h-[600px] min-h-[600px]",
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    wards: L.LayerGroup;
    flood: L.LayerGroup;
    lighting: L.LayerGroup;
    pedestrian: L.LayerGroup;
    reports: L.LayerGroup;
    interventions: L.LayerGroup;
  } | null>(null);

  // Layer Visibility State
  const [showFlood, setShowFlood] = useState(true);
  const [showLightingDeficit, setShowLightingDeficit] = useState(true);
  const [showPedestrianSafety, setShowPedestrianSafety] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showSimulated, setShowSimulated] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DHAKA_CENTER,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Reliable OpenStreetMap base layer
    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    ).addTo(map);

    // Draw Dhaka City Boundary
    try {
      L.polygon(dhakaBoundaryPolygon, {
        color: "#059669",
        weight: 2,
        dashArray: "6, 6",
        fillColor: "#10b981",
        fillOpacity: 0.03,
      }).addTo(map);
    } catch (e) {
      console.warn("Could not draw dhakaBoundaryPolygon", e);
    }

    const wardsLayer = L.layerGroup().addTo(map);
    const floodLayer = L.layerGroup().addTo(map);
    const lightingLayer = L.layerGroup().addTo(map);
    const pedestrianLayer = L.layerGroup().addTo(map);
    const reportsLayer = L.layerGroup().addTo(map);
    const interventionsLayer = L.layerGroup().addTo(map);

    layersRef.current = {
      wards: wardsLayer,
      flood: floodLayer,
      lighting: lightingLayer,
      pedestrian: pedestrianLayer,
      reports: reportsLayer,
      interventions: interventionsLayer,
    };

    mapRef.current = map;

    // Critical Leaflet resize fix: Invalidate size multiple times after mounting
    const invalidate = () => {
      try {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      } catch (err) {}
    };

    [50, 150, 300, 600, 1000, 1500].forEach((d) => window.setTimeout(invalidate, d));

    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Ward Circles & Risk Polygons
  useEffect(() => {
    if (!layersRef.current || !mapRef.current) return;
    const { wards, flood, lighting, pedestrian, reports: repLayer, interventions: intLayer } =
      layersRef.current;

    wards.clearLayers();
    flood.clearLayers();
    lighting.clearLayers();
    pedestrian.clearLayers();
    repLayer.clearLayers();
    intLayer.clearLayers();

    // 1. Draw Wards
    wardAnalytics.forEach((wa) => {
      const isSelected = wa.ward.id === selectedWardId;
      const color =
        wa.riskLevel === "Critical"
          ? "#ef4444"
          : wa.riskLevel === "High"
            ? "#f97316"
            : wa.riskLevel === "Moderate"
              ? "#eab308"
              : "#10b981";

      const circle = L.circle([wa.ward.lat, wa.ward.lng], {
        radius: isSelected ? 1400 : 1100,
        color: color,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.18,
        weight: isSelected ? 3 : 1.5,
      });

      circle.on("click", () => {
        onSelectWard(wa.ward.id);
      });

      circle.bindTooltip(
        `<div class="p-1">
          <strong class="text-xs">${wa.ward.name}</strong><br/>
          <span class="text-[11px] text-muted-foreground">Vulnerability: ${wa.urbanVulnerabilityScore}/100</span><br/>
          <span class="text-[10px] font-bold" style="color:${color}">Risk: ${wa.riskLevel}</span>
        </div>`,
        { direction: "top", sticky: true },
      );

      circle.addTo(wards);

      // 2. Flood Risk Rings (if enabled)
      if (showFlood && wa.floodRiskIndex > 45) {
        L.circle([wa.ward.lat, wa.ward.lng], {
          radius: (wa.floodRiskIndex / 100) * 1600,
          color: "#0284c7",
          fillColor: "#38bdf8",
          fillOpacity: 0.12,
          weight: 1,
          dashArray: "4, 6",
        }).addTo(flood);
      }

      // 3. Dark Corridor / Streetlight Deficit
      if (showLightingDeficit && wa.ward.osmLitRoadPct < 65) {
        L.circle([wa.ward.lat + 0.003, wa.ward.lng - 0.003], {
          radius: 600,
          color: "#8b5cf6",
          fillColor: "#a855f7",
          fillOpacity: 0.2,
          weight: 1,
        }).addTo(lighting);
      }

      // 4. Pedestrian Collision Hazard Zone
      if (showPedestrianSafety && wa.pedestrianSafetyIndex < 50) {
        L.circle([wa.ward.lat - 0.003, wa.ward.lng + 0.003], {
          radius: 500,
          color: "#f43f5e",
          fillColor: "#fb7185",
          fillOpacity: 0.22,
          weight: 1,
          dashArray: "3, 4",
        }).addTo(pedestrian);
      }

      // 5. Simulated Capital Interventions (on selected ward)
      if (showSimulated && isSelected) {
        // Draw simulated intervention pins around the selected ward
        if (interventions.smartStreetLights > 0) {
          L.circleMarker([wa.ward.lat + 0.004, wa.ward.lng + 0.002], {
            radius: 8,
            color: "#eab308",
            fillColor: "#facc15",
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindPopup(`<strong>Simulated: Smart Lighting Grid</strong><br/>${interventions.smartStreetLights} Solar LED Units Active`)
            .addTo(intLayer);
        }
        if (interventions.stormwaterPumps > 0) {
          L.circleMarker([wa.ward.lat - 0.004, wa.ward.lng - 0.003], {
            radius: 9,
            color: "#0284c7",
            fillColor: "#38bdf8",
            fillOpacity: 0.95,
            weight: 2,
          })
            .bindPopup(`<strong>Simulated: High-Capacity Dewatering</strong><br/>${interventions.stormwaterPumps} Pumps Operational`)
            .addTo(intLayer);
        }
        if (interventions.pedestrianCrossings > 0) {
          L.circleMarker([wa.ward.lat + 0.002, wa.ward.lng - 0.004], {
            radius: 8,
            color: "#10b981",
            fillColor: "#34d399",
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindPopup(`<strong>Simulated: Pedestrian Speed Tables</strong><br/>${interventions.pedestrianCrossings} Safe Crossings`)
            .addTo(intLayer);
        }
      }
    });

    // 6. Citizen Incident Reports
    if (showReports) {
      reports.slice(0, 150).forEach((r) => {
        const dotColor =
          r.type === "crime"
            ? "#dc2626"
            : r.type === "accident"
              ? "#f97316"
              : "#0284c7";

        L.circleMarker([r.lat, r.lng], {
          radius: 4,
          color: dotColor,
          fillColor: dotColor,
          fillOpacity: 0.8,
          weight: 1,
        })
          .bindTooltip(`<span class="text-[10px] font-bold">${r.subtype || r.type}</span>`, {
            direction: "top",
          })
          .addTo(repLayer);
      });
    }
  }, [
    wardAnalytics,
    selectedWardId,
    reports,
    interventions,
    showFlood,
    showLightingDeficit,
    showPedestrianSafety,
    showReports,
    showSimulated,
    onSelectWard,
  ]);

  // Pan to selected ward smoothly
  useEffect(() => {
    if (!mapRef.current) return;
    const selected = wardAnalytics.find((w) => w.ward.id === selectedWardId);
    if (selected) {
      mapRef.current.flyTo([selected.ward.lat, selected.ward.lng], 13.5, {
        duration: 1.2,
      });
    }
  }, [selectedWardId, wardAnalytics]);

  return (
    <div className={`relative w-full h-[600px] min-h-[600px] ${className}`}>
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[600px] rounded-3xl overflow-hidden shadow-inner bg-[#F4F1EA]" />

      {/* Floating Layer Controls */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 max-w-xl bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-stone-200/90 shadow-md text-xs">
        <button
          onClick={() => setShowFlood(!showFlood)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            showFlood
              ? "bg-sky-50 border-sky-300 text-sky-800 shadow-2xs"
              : "bg-white border-stone-200 text-stone-400 opacity-70"
          }`}
        >
          <CloudRain className="size-3.5" />
          Flood Contours
        </button>

        <button
          onClick={() => setShowLightingDeficit(!showLightingDeficit)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            showLightingDeficit
              ? "bg-purple-50 border-purple-300 text-purple-800 shadow-2xs"
              : "bg-white border-stone-200 text-stone-400 opacity-70"
          }`}
        >
          <Lightbulb className="size-3.5" />
          Dark Corridors
        </button>

        <button
          onClick={() => setShowPedestrianSafety(!showPedestrianSafety)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            showPedestrianSafety
              ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
              : "bg-white border-stone-200 text-stone-400 opacity-70"
          }`}
        >
          <Footprints className="size-3.5" />
          Pedestrian Risk
        </button>

        <button
          onClick={() => setShowReports(!showReports)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            showReports
              ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
              : "bg-white border-stone-200 text-stone-400 opacity-70"
          }`}
        >
          <Shield className="size-3.5" />
          Citizen Reports
        </button>

        <button
          onClick={() => setShowSimulated(!showSimulated)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            showSimulated
              ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
              : "bg-white border-stone-200 text-stone-400 opacity-70"
          }`}
        >
          <Sparkles className="size-3.5" />
          Simulated Capital
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-200/90 shadow-md text-xs space-y-1.5">
        <span className="font-bold text-stone-600 block text-[10px] uppercase tracking-wider font-editorial">
          Ward Vulnerability Level
        </span>
        <div className="flex items-center gap-3 font-semibold text-stone-700 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-yellow-500" /> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" /> Low
          </span>
        </div>
      </div>
    </div>
  );
}

export default DigitalTwinMap;
