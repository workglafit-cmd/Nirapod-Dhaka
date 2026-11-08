import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import type { Report, ReportType } from "@/lib/reports";
import { isFresh } from "@/lib/reports";
import { dhakaBoundaryPolygon } from "@/data/dhakaBoundary";

const ICON_PATHS: Record<ReportType, string> = {
  crime: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 5.5v5m0 3v.5",
  infrastructure: "M12 3 2 20h20L12 3Zm0 6v5m0 3v.5",
  accident:
    "M5 17h14M6.5 17a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0m8 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M4 13l1.6-4.2A2 2 0 0 1 7.5 7.5h9a2 2 0 0 1 1.9 1.3L20 13v4H4v-4Z",
};

const TOKEN: Record<ReportType, string> = {
  crime: "var(--crime)",
  infrastructure: "var(--infra)",
  accident: "var(--accident)",
};

function pinIcon(type: ReportType, fresh: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    html: `<div class="nd-pin animate-pin-drop">
      ${fresh ? `<span class="nd-pin-ring" style="background:${TOKEN[type]};opacity:.35"></span>` : ""}
      <span class="nd-pin-body" style="background:${TOKEN[type]}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON_PATHS[type]}"/></svg>
      </span>
    </div>`,
  });
}

function draftIcon() {
  return L.divIcon({
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 36],
    html: `<div class="nd-pin" style="width:38px;height:38px">
      <span class="nd-pin-ring" style="background:var(--primary);opacity:.3"></span>
      <span class="nd-pin-body" style="background:var(--primary)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </span>
    </div>`,
  });
}

export type MapCanvasProps = {
  reports: Report[];
  hotspots?: { lat: number; lng: number; report_count: number }[];
  center?: [number, number];
  zoom?: number;
  onSelect?: (r: Report) => void;
  draft?: { lat: number; lng: number } | null;
  onDraftMove?: (lat: number, lng: number, revert?: () => void) => void;
  interactive?: boolean;
  className?: string;
};

export default function MapCanvas({
  reports,
  hotspots = [],
  center = [23.7806, 90.4074],
  zoom = 13,
  onSelect,
  draft,
  onDraftMove,
  interactive = true,
  className,
}: MapCanvasProps) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const hotRef = useRef<L.LayerGroup | null>(null);
  const draftRef = useRef<L.Marker | null>(null);
  const onDraftMoveRef = useRef(onDraftMove);
  onDraftMoveRef.current = onDraftMove;

  useEffect(() => {
    if (!holder.current || mapRef.current) return;
    const map = L.map(holder.current, {
      center,
      zoom,
      zoomControl: false,
      dragging: interactive,

      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: true,
      maxBounds: L.polygon(dhakaBoundaryPolygon as [number, number][]).getBounds().pad(0.3),
      maxBoundsViscosity: 0.8,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
      crossOrigin: true,
    }).addTo(map);

    L.polygon(dhakaBoundaryPolygon as [number, number][], {
      color: "#0f766e",
      weight: 2,
      fillColor: "#14b8a6",
      fillOpacity: 0.05,
      dashArray: "4 4",
      interactive: false,
    }).addTo(map);

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      iconCreateFunction: (c) => {
        const n = c.getChildCount();
        const size = n < 10 ? 36 : n < 50 ? 44 : 52;
        return L.divIcon({
          html: `<div class="nd-cluster" style="width:${size}px;height:${size}px;font-size:${n < 100 ? 14 : 12}px">${n}</div>`,
          className: "",
          iconSize: [size, size],
        });
      },
    });
    map.addLayer(cluster);
    const hot = L.layerGroup().addTo(map);

    mapRef.current = map;
    clusterRef.current = cluster;
    hotRef.current = hot;

    const invalidate = () => map.invalidateSize();
    const timer = window.setTimeout(invalidate, 120);
    // Also re-run a few more times to catch late layout (Suspense fade-in,
    // parent flex settling, font swap). Without these the map can mount into
    // a 0-height container and render blank.
    [200, 400, 800].forEach((d) => window.setTimeout(invalidate, d));
    window.addEventListener("resize", invalidate);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && holder.current) {
      ro = new ResizeObserver(() => invalidate());
      ro.observe(holder.current);
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      hotRef.current = null;
      draftRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    reports.forEach((r) => {
      const m = L.marker([r.lat, r.lng], {
        icon: pinIcon(r.type, isFresh(r.created_at)),
        keyboard: true,
        title: r.description.slice(0, 60),
      });
      m.on("click", () => onSelect?.(r));
      cluster.addLayer(m);
    });
  }, [reports, onSelect]);

  useEffect(() => {
    const hot = hotRef.current;
    if (!hot) return;
    hot.clearLayers();
    hotspots.forEach((h) => {
      // Gentle warning wash
      L.circle([h.lat, h.lng], {
        radius: 500,
        stroke: true,
        color: "#E23350",
        weight: 1,
        fillColor: "#E23350",
        fillOpacity: 0.1,
        className: "animate-wash",
        interactive: false,
      }).addTo(hot);
    });
  }, [hotspots]);

  // Tap-to-place: when a draft pin is active, clicking the map background
  // also moves the pin (in addition to dragging the pin itself). A latest-ref
  // keeps `draft` fresh so the revert callback always points at the latest
  // committed position.
  const latestDraftRef = useRef(draft);
  latestDraftRef.current = draft;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!draft || !onDraftMove || !interactive) return;
    const handler = (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      onDraftMoveRef.current?.(lat, lng, () => {
        const cur = latestDraftRef.current;
        const d = draftRef.current;
        if (d && cur) d.setLatLng([cur.lat, cur.lng]);
      });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [draft, interactive, onDraftMove]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!draft) {
      if (draftRef.current) {
        map.removeLayer(draftRef.current);
        draftRef.current = null;
      }
      return;
    }
    if (!draftRef.current) {
      const m = L.marker([draft.lat, draft.lng], {
        icon: draftIcon(),
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(map);
      m.on("dragend", () => {
        const p = m.getLatLng();
        onDraftMoveRef.current?.(p.lat, p.lng, () => {
          m.setLatLng([draft.lat, draft.lng]);
        });
      });
      draftRef.current = m;
      map.setView([draft.lat, draft.lng], Math.max(map.getZoom(), 16));
    } else {
      draftRef.current.setLatLng([draft.lat, draft.lng]);
    }
  }, [draft]);

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }
  }, [center?.[0], center?.[1]]);

  return <div ref={holder} className={className} role="application" aria-label="Map" />;
}
