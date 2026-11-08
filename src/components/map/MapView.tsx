import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { MapCanvasProps } from "./MapCanvas";

const MapCanvas = lazy(() => import("./MapCanvas"));

function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="size-full animate-pulse bg-muted" />
    </div>
  );
}

export function MapView(props: MapCanvasProps) {
  return (
    <ClientOnly fallback={<MapSkeleton className={props.className} />}>
      <Suspense fallback={<MapSkeleton className={props.className} />}>
        <MapCanvas {...props} />
      </Suspense>
    </ClientOnly>
  );
}
