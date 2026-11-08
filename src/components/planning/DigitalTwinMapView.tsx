import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { WardAnalytics } from "@/lib/public-data";
import type { Report } from "@/lib/reports";
import type { InterventionConfig } from "@/lib/policy-simulator";

const DigitalTwinMap = lazy(() =>
  import("./DigitalTwinMap").then((m) => ({ default: m.DigitalTwinMap })),
);

type Props = {
  wardAnalytics: WardAnalytics[];
  selectedWardId: string;
  onSelectWard: (wardId: string) => void;
  reports: Report[];
  interventions: InterventionConfig;
  className?: string;
};

export function DigitalTwinMapView(props: Props) {
  return (
    <ClientOnly
      fallback={
        <div className="w-full h-[600px] min-h-[600px] animate-pulse bg-stone-100 rounded-3xl border border-stone-200/80 flex items-center justify-center text-xs font-bold text-stone-500">
          Loading Digital Twin GIS Canvas...
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="w-full h-[600px] min-h-[600px] animate-pulse bg-stone-100 rounded-3xl border border-stone-200/80 flex items-center justify-center text-xs font-bold text-stone-500">
            Initializing Spatial Layers...
          </div>
        }
      >
        <DigitalTwinMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
