import { useEffect, useState } from "react";
import {
  Building2,
  CloudRain,
  Sliders,
  Sparkles,
  Layers,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Lightbulb,
  Footprints,
  FileText,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReports, type Report } from "@/lib/reports";
import {
  DHAKA_WARDS,
  fetchDhakaWeather,
  computeWardAnalytics,
  type WardAnalytics,
  type DhakaWeather,
  DEFAULT_DHAKA_WEATHER,
} from "@/lib/public-data";
import {
  DEFAULT_INTERVENTIONS,
  runPolicySimulation,
  type InterventionConfig,
  type SimulationResults,
} from "@/lib/policy-simulator";
import {
  generatePolicyBrief,
  type PolicyBrief,
} from "@/lib/policy-brief-generator";
import { DigitalTwinMapView } from "./DigitalTwinMapView";
import { PolicyBriefModal } from "./PolicyBriefModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useApp } from "@/lib/app-context";

export function UrbanPlanningStudio() {
  const { lang } = useApp();
  const [selectedWardId, setSelectedWardId] = useState<string>("mirpur-10");
  const [activeTab, setActiveTab] = useState<"map" | "simulator" | "analytics">(
    () => {
      if (typeof window !== "undefined") {
        const tab = new URLSearchParams(window.location.search).get("tab");
        if (tab === "map" || tab === "gis") return "map";
        if (tab === "analytics" || tab === "comparative") return "analytics";
      }
      return "simulator";
    }
  );
  const [interventions, setInterventions] =
    useState<InterventionConfig>(DEFAULT_INTERVENTIONS);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [activeBrief, setActiveBrief] = useState<PolicyBrief | null>(null);

  // 1. Fetch Reports
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    staleTime: 60_000,
  });

  // 2. Fetch Live Weather
  const { data: weather = DEFAULT_DHAKA_WEATHER } = useQuery({
    queryKey: ["dhaka-weather"],
    queryFn: fetchDhakaWeather,
    staleTime: 300_000,
  });

  // 3. Compute Ward Analytics
  const wardAnalyticsList = computeWardAnalytics(DHAKA_WARDS, reports, weather);
  const selectedWardAnalytics =
    wardAnalyticsList.find((w) => w.ward.id === selectedWardId) ||
    wardAnalyticsList[0];

  // 4. Run Policy Simulation
  const simulationResults: SimulationResults = runPolicySimulation(
    selectedWardAnalytics,
    interventions,
  );

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("brief") === "true") {
      void handleOpenBrief();
    }
  }, []);

  // Generate Policy Brief
  const handleOpenBrief = async () => {
    setGeneratingBrief(true);
    try {
      const brief = await generatePolicyBrief({
        wardAnalytics: selectedWardAnalytics,
        weather,
        interventions,
        simulation: simulationResults,
        lang,
      });
      setActiveBrief(brief);
      setBriefModalOpen(true);
    } finally {
      setGeneratingBrief(false);
    }
  };

  // Chart Data for Comparative View
  const chartData = wardAnalyticsList.map((wa) => ({
    name: wa.ward.name.split("&")[0].trim(),
    vulnerability: wa.urbanVulnerabilityScore,
    floodRisk: wa.floodRiskIndex,
    pedSafety: wa.pedestrianSafetyIndex,
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner: Smart Nation Public-Data Intelligence Header */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgb(0,0,0,0.03)] relative overflow-hidden">
        {/* Subtle authentic civic seal watermark in top-right corner */}
        <div className="pointer-events-none absolute -right-6 -top-10 opacity-[0.05] w-56 h-56 select-none">
          <img
            src="/disaster.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-900 shadow-sm">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                {lang === "bn" ? "স্মার্ট নেশন ডিজিটাল টুইন" : "Smart Nation Digital Twin"}
              </span>
              <span className="text-xs text-stone-500 font-mono font-semibold">
                Integrated Public-Data Intelligence
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.12]">
              {lang === "bn" ? (
                <>
                  ঢাকা আরবান পলিসি ও{" "}
                  <span className="italic font-normal font-editorial text-amber-800">
                    প্ল্যানিং স্টুডিও
                  </span>
                </>
              ) : (
                <>
                  Dhaka Urban Policy &{" "}
                  <span className="italic font-normal font-editorial text-amber-800">
                    Planning Studio
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed font-normal">
              {lang === "bn"
                ? "ওপেনস্ট্রিটম্যাপ অবকাঠামো অডিট, ওপেন-মেটিও বৃষ্টিপাত পূর্বাভাস এবং নাগরিক হ্যাজার্ড টেলিমেট্রি একত্র করে প্রমাণভিত্তিক বাজেট ও সমাধান সিমুলেশন।"
                : "Fusing OpenStreetMap infrastructure audits, Open-Meteo precipitation forecasts, and crowdsourced hazard telemetry to model evidence-based capital interventions."}
            </p>
          </div>

          {/* Live Climate Instrument & Policy Brief CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-[#FAF8F5] px-4 py-3 shadow-sm">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white border border-stone-200 text-sky-600 shadow-xs">
                <CloudRain className="size-5" />
              </div>
              <div>
                <span className="font-editorial text-sm font-bold text-stone-900 block leading-tight">
                  {weather.temperature}°C · {weather.conditionLabel}
                </span>
                <span className="text-[11px] text-stone-500 font-medium block">
                  Rain: {weather.precipitation} mm/h · AQI: {weather.airQualityIndex}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenBrief}
              disabled={generatingBrief}
              className="group tap-target inline-flex items-center gap-2.5 rounded-full bg-[#E29A26] hover:bg-[#D48B17] text-stone-950 font-bold px-6 py-3 text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-stone-950 text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="size-3" />
              </span>
              <span>
                {generatingBrief
                  ? lang === "bn"
                    ? "নীতিমালা তৈরি হচ্ছে..."
                    : "Synthesizing Policy..."
                  : lang === "bn"
                    ? "অফিসিয়াল পলিসি ব্রিফ তৈরি"
                    : "Generate Official Policy Brief"}
              </span>
            </button>
          </div>
        </div>

        {/* Target Precinct Quick Selector Strip */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 shrink-0 font-editorial mr-1">
            {lang === "bn" ? "টার্গেট এলাকা:" : "Target Precinct:"}
          </span>
          {wardAnalyticsList.map((wa) => (
            <button
              key={wa.ward.id}
              onClick={() => setSelectedWardId(wa.ward.id)}
              className={`shrink-0 tap-target rounded-full px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 border ${
                selectedWardId === wa.ward.id
                  ? "bg-stone-950 text-white border-stone-950 shadow-md font-bold scale-[1.02]"
                  : "bg-[#FAF8F5] border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs"
              }`}
            >
              <span>{lang === "bn" ? wa.ward.nameBn : wa.ward.name}</span>
              <span
                className={`size-2 rounded-full ${
                  wa.riskLevel === "Critical"
                    ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]"
                    : wa.riskLevel === "High"
                      ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                      : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-stone-200/70 border border-stone-300/60 shadow-inner">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
              activeTab === "simulator"
                ? "bg-white text-stone-950 shadow-md font-bold"
                : "text-stone-600 hover:text-stone-950 font-semibold"
            }`}
          >
            <Sliders className="size-3.5" />
            <span>"What-If" Policy Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
              activeTab === "map"
                ? "bg-white text-stone-950 shadow-md font-bold"
                : "text-stone-600 hover:text-stone-950 font-semibold"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Digital Twin GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
              activeTab === "analytics"
                ? "bg-white text-stone-950 shadow-md font-bold"
                : "text-stone-600 hover:text-stone-950 font-semibold"
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>City-Wide Comparative</span>
          </button>
        </div>

        {/* Selected Ward Snapshot Pill */}
        <div className="flex items-center gap-3 text-xs bg-white border border-stone-200/90 rounded-full px-4 py-2 shadow-xs">
          <span className="text-stone-500">
            Corporation: <strong className="text-stone-900">{selectedWardAnalytics.ward.corporation}</strong>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-500">
            Pop: <strong className="text-stone-900">{selectedWardAnalytics.ward.totalPopulation.toLocaleString()}</strong>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-500">
            Density: <strong className="text-stone-900">{selectedWardAnalytics.ward.populationDensity.toLocaleString()}/km²</strong>
          </span>
        </div>
      </div>

      {/* Tab 1: Simulator View */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Intervention Sliders */}
          <div className="lg:col-span-5 space-y-6 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className="space-y-1">
              <h3 className="font-editorial text-2xl font-bold text-stone-900 flex items-center gap-2.5">
                <Sliders className="size-5 text-amber-700" />
                Capital Interventions Controls
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-normal">
                Adjust resource sliders to simulate infrastructure deployment in{" "}
                <strong className="text-stone-800">{selectedWardAnalytics.ward.name}</strong>.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Slider 1: Streetlights */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 hover:border-amber-300/80 transition-all shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-stone-900 font-bold">
                    <div className="p-1 rounded-md bg-amber-100 text-amber-800">
                      <Lightbulb className="size-3.5" />
                    </div>
                    Smart Solar Street Lighting Grid
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-900 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full shadow-xs">
                    {interventions.smartStreetLights} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="10"
                  value={interventions.smartStreetLights}
                  onChange={(e) =>
                    setInterventions({
                      ...interventions,
                      smartStreetLights: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#E29A26] cursor-pointer h-2 rounded-lg bg-stone-200"
                />
                <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                  <span>Illumination Forecast:</span>
                  <strong className="text-amber-800 font-mono">
                    {Math.min(98, selectedWardAnalytics.ward.osmLitRoadPct + Math.round(interventions.smartStreetLights * 0.11))}% (+{Math.round(interventions.smartStreetLights * 0.11)}% gain)
                  </strong>
                </div>
              </div>

              {/* Slider 2: Stormwater Pumps */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 hover:border-sky-300/80 transition-all shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-stone-900 font-bold">
                    <div className="p-1 rounded-md bg-sky-100 text-sky-800">
                      <CloudRain className="size-3.5" />
                    </div>
                    High-Capacity Dewatering Pumps
                  </span>
                  <span className="font-mono text-xs font-bold text-sky-900 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full shadow-xs">
                    {interventions.stormwaterPumps} units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={interventions.stormwaterPumps}
                  onChange={(e) =>
                    setInterventions({
                      ...interventions,
                      stormwaterPumps: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-600 cursor-pointer h-2 rounded-lg bg-stone-200"
                />
                <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                  <span>Runoff Extraction:</span>
                  <strong className="text-sky-800 font-mono">
                    {interventions.stormwaterPumps * 500} m³/h suction capacity
                  </strong>
                </div>
              </div>

              {/* Slider 3: Pedestrian Crosswalks */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 hover:border-emerald-300/80 transition-all shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-stone-900 font-bold">
                    <div className="p-1 rounded-md bg-rose-100 text-rose-800">
                      <Footprints className="size-3.5" />
                    </div>
                    Raised Crosswalks & Speed Calming
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-900 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full shadow-xs">
                    {interventions.pedestrianCrossings} sites
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={interventions.pedestrianCrossings}
                  onChange={(e) =>
                    setInterventions({
                      ...interventions,
                      pedestrianCrossings: Number(e.target.value),
                    })
                  }
                  className="w-full accent-rose-600 cursor-pointer h-2 rounded-lg bg-stone-200"
                />
                <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                  <span>Pedestrian Refuge:</span>
                  <strong className="text-rose-800 font-mono">
                    {interventions.pedestrianCrossings} school & transit zones calmed
                  </strong>
                </div>
              </div>

              {/* Slider 4: Sealed Waste Compactor Hubs */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 hover:border-emerald-300/80 transition-all shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-stone-900 font-bold">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                      <Building2 className="size-3.5" />
                    </div>
                    Sealed Smart Waste Compactors
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full shadow-xs">
                    {interventions.smartWasteHubs} hubs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={interventions.smartWasteHubs}
                  onChange={(e) =>
                    setInterventions({
                      ...interventions,
                      smartWasteHubs: Number(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer h-2 rounded-lg bg-stone-200"
                />
                <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                  <span>Culvert Protection:</span>
                  <strong className="text-emerald-800 font-mono">
                    ~{interventions.smartWasteHubs * 12} tons daily waste intercepted
                  </strong>
                </div>
              </div>

              {/* Slider 5: Emergency Response Kiosks */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 hover:border-indigo-300/80 transition-all shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-stone-900 font-bold">
                    <div className="p-1 rounded-md bg-indigo-100 text-indigo-800">
                      <ShieldAlert className="size-3.5" />
                    </div>
                    Emergency Police-Civic Outposts
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-900 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full shadow-xs">
                    {interventions.rapidResponseKiosks} kiosks
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={interventions.rapidResponseKiosks}
                  onChange={(e) =>
                    setInterventions({
                      ...interventions,
                      rapidResponseKiosks: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer h-2 rounded-lg bg-stone-200"
                />
                <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                  <span>Response Target:</span>
                  <strong className="text-indigo-800 font-mono">
                    &lt; {Math.max(4.2, 18.5 - interventions.rapidResponseKiosks * 2.8).toFixed(1)} mins SOS dispatch
                  </strong>
                </div>
              </div>
            </div>

            {/* Total Budget Pill - Prestige Obsidian & Gold Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-950 via-[#151a1e] to-stone-900 text-white shadow-xl border border-stone-800 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/90 block mb-1 font-editorial">
                    Estimated Capital Outlay
                  </span>
                  <span className="font-editorial text-3xl sm:text-4xl font-bold text-amber-400 tracking-tight">
                    ৳{simulationResults.estimatedCostBdtLakh} Lakh
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block mb-1">
                    USD Equivalent
                  </span>
                  <span className="font-mono text-base font-bold text-emerald-300">
                    ${simulationResults.estimatedCostUsd.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400 font-medium relative z-10">
                <span>Co-Financing: <strong className="text-white">65% DNCC / 35% Gov</strong></span>
                <span className="text-amber-300 font-semibold">5-Yr Maintenance Covered</span>
              </div>
            </div>
          </div>

          {/* Right: Simulated Real-Time Policy Impact Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            {/* High-Level Impact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Composite Vulnerability
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-stone-900">
                    {simulationResults.simulatedRiskScore}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 line-through">
                    {simulationResults.baselineRiskScore}
                  </span>
                </div>
                <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                  -{simulationResults.riskReductionPct}% Risk
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Monsoon Flood Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-sky-700">
                    {simulationResults.simulatedFloodRisk}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 line-through">
                    {simulationResults.baselineFloodRisk}
                  </span>
                </div>
                <span className="inline-flex items-center text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                  -{simulationResults.floodReductionPct}% Flood
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Pedestrian Safety (PSI)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-emerald-700">
                    {simulationResults.simulatedPedestrianSafety}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 line-through">
                    {simulationResults.baselinePedestrianSafety}
                  </span>
                </div>
                <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                  +{simulationResults.pedestrianSafetyGainPct}% Safe
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  5-Year Societal ROI
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-[#E29A26]">
                    {simulationResults.fiveYearSocietalRoiRatio}x
                  </span>
                </div>
                <span className="inline-flex items-center text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Benefit-Cost Ratio
                </span>
              </div>
            </div>

            {/* Deep-Dive Impact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-600 font-bold">Crime Deterrence</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    -{simulationResults.projectedCrimeReductionPct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${simulationResults.projectedCrimeReductionPct}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-stone-500 block leading-normal">
                  Driven by smart lighting & rapid response outposts.
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-600 font-bold">Accident Mitigation</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    -{simulationResults.projectedAccidentReductionPct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${simulationResults.projectedAccidentReductionPct}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-stone-500 block leading-normal">
                  Raised speed tables & barrier protection.
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-600 font-bold">Emergency Latency</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {simulationResults.projectedResponseTimeMinutes} mins
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (simulationResults.projectedResponseTimeMinutes / 18.5) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-stone-500 block leading-normal">
                  Down from 18.5 min baseline city congestion.
                </span>
              </div>
            </div>

            {/* Strategic Policy Executive Card - Official Emerald Dispatch */}
            <div className="rounded-3xl border border-emerald-900/30 bg-gradient-to-br from-[#012514] via-[#012b18] to-[#011d10] text-white p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
              {/* Subtle watermark in bottom corner */}
              <div className="pointer-events-none absolute -right-6 -bottom-8 opacity-10 w-44 h-44 select-none">
                <img src="/disaster.png" alt="" className="w-full h-full object-contain filter invert" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-white/20 shadow-xs">
                  <Sparkles className="size-3.5" />
                  Model Executive Recommendation
                </span>
                <span className="text-xs font-bold text-emerald-200/90">
                  {simulationResults.populationBenefitted.toLocaleString()} Citizens Impacted
                </span>
              </div>

              <p className="font-editorial text-base sm:text-lg font-normal leading-relaxed text-emerald-50 italic relative z-10">
                "{lang === "bn"
                  ? simulationResults.summaryTakeawayBn
                  : simulationResults.summaryTakeaway}"
              </p>

              <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <span className="text-xs text-emerald-200/80">
                  Primary Chokepoint:{" "}
                  <strong className="text-white">
                    {selectedWardAnalytics.primaryVulnerability}
                  </strong>
                </span>
                <button
                  onClick={handleOpenBrief}
                  className="group tap-target inline-flex items-center gap-2 rounded-full bg-[#E29A26] hover:bg-[#D48B17] text-stone-950 font-bold px-5 py-2.5 text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <span>Draft Full Cabinet Policy Brief</span>
                  <ArrowRight className="size-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Ward Infrastructure Audit Summary */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-editorial text-lg font-bold text-stone-900 tracking-tight">
                  OpenStreetMap Spatial Baseline ({selectedWardAnalytics.ward.name})
                </h4>
                <span className="text-[11px] font-mono text-stone-500 font-semibold bg-stone-100 px-2.5 py-0.5 rounded-full">
                  OSM Verified
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/70 text-center">
                  <span className="text-stone-500 text-[11px] font-medium block mb-0.5">Road Network</span>
                  <span className="font-editorial text-lg font-bold text-stone-900">{selectedWardAnalytics.ward.osmRoadLengthKm} km</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/70 text-center">
                  <span className="text-stone-500 text-[11px] font-medium block mb-0.5">Lit Corridors</span>
                  <span className="font-editorial text-lg font-bold text-amber-700">{selectedWardAnalytics.ward.osmLitRoadPct}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/70 text-center">
                  <span className="text-stone-500 text-[11px] font-medium block mb-0.5">Sidewalk Presence</span>
                  <span className="font-editorial text-lg font-bold text-emerald-700">{selectedWardAnalytics.ward.osmSidewalkPct}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/70 text-center">
                  <span className="text-stone-500 text-[11px] font-medium block mb-0.5">Elevation</span>
                  <span className="font-editorial text-lg font-bold text-sky-700">{selectedWardAnalytics.ward.elevationMeters}m MSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Digital Twin Map View */}
      {activeTab === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[600px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-md">
            <DigitalTwinMapView
              wardAnalytics={wardAnalyticsList}
              selectedWardId={selectedWardId}
              onSelectWard={setSelectedWardId}
              reports={reports}
              interventions={interventions}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Selected Ward Focus
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  {selectedWardAnalytics.ward.name}
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {selectedWardAnalytics.ward.nameBn}
                </span>
              </div>

              <div className="space-y-3 text-xs divide-y divide-stone-100">
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Vulnerability Score</span>
                  <span className="font-editorial font-bold text-stone-900 text-sm">
                    {selectedWardAnalytics.urbanVulnerabilityScore} / 100
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Flood Risk Index</span>
                  <span className="font-editorial font-bold text-sky-700 text-sm">
                    {selectedWardAnalytics.floodRiskIndex} / 100
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Pedestrian Safety (PSI)</span>
                  <span className="font-editorial font-bold text-emerald-700 text-sm">
                    {selectedWardAnalytics.pedestrianSafetyIndex} / 100
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Active Citizen Signals</span>
                  <span className="font-editorial font-bold text-amber-700 text-sm">
                    {selectedWardAnalytics.activeReportsCount} reports
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-xs font-bold text-stone-900 block">
                  Recommended Action:
                </span>
                <p className="text-xs leading-relaxed text-stone-600 font-normal">
                  {selectedWardAnalytics.recommendedAction}
                </p>
              </div>

              <button
                onClick={() => setActiveTab("simulator")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#E29A26] hover:bg-[#D48B17] px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-950 transition-all shadow-md hover:scale-[1.02] active:scale-95"
              >
                <Sliders className="size-3.5" /> Open What-If Simulator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: City-Wide Comparative Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Cross-Ward Vulnerability & Risk Benchmarks
              </h3>
              <p className="text-xs text-stone-500 font-normal leading-relaxed">
                Comparative analysis across 8 high-density Dhaka corridors fusing OpenStreetMap, live weather, and citizen reports.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FAF8F5",
                      borderColor: "#e7e5e4",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="vulnerability" fill="#dc2626" name="Vulnerability Score" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="floodRisk" fill="#0284c7" name="Flood Risk" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pedSafety" fill="#059669" name="Pedestrian Safety" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Policy Brief Modal */}
      <PolicyBriefModal
        brief={activeBrief}
        open={briefModalOpen}
        onOpenChange={setBriefModalOpen}
      />
    </div>
  );
}
