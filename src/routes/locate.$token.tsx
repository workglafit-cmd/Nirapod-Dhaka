import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { MapView } from "@/components/map/MapView";
import { BrandMark, LangToggle } from "@/components/Chrome";
import { useApp } from "@/lib/app-context";
import { DHAKA_CENTER } from "@/lib/geo";

export const Route = createFileRoute("/locate/$token")({
  head: () => ({
    meta: [
      { title: "Lost device location — Nirapod Dhaka" },
      {
        name: "description",
        content: "Shows the last known location of a lost device shared through Nirapod Dhaka.",
      },
      { property: "og:title", content: "Lost device location — Nirapod Dhaka" },
      { property: "og:description", content: "Last known location of a shared lost device." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Locate,
});

function Locate() {
  const { t } = useApp();
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return setFailed(true);
    navigator.geolocation.getCurrentPosition(
      (p) => setPoint({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setFailed(true),
      { enableHighAccuracy: true },
    );
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <BrandMark compact />
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="font-display flex items-center gap-2 text-xl">
          <MapPin className="size-5 text-primary" aria-hidden />
          {t("lastKnown")}
        </h1>

        <div className="mt-4 h-72 overflow-hidden rounded-xl border border-border">
          <MapView
            className="size-full"
            reports={[]}
            center={point ? [point.lat, point.lng] : DHAKA_CENTER}
            zoom={point ? 16 : 12}
            draft={point}
          />
        </div>

        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          {!point && !failed && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {point
            ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
            : failed
              ? t("noItems")
              : t("locating")}
        </p>
      </main>
    </div>
  );
}
