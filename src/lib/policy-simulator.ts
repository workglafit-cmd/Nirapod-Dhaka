/**
 * Digital Twin Policy & Infrastructure "What-If" Simulation Engine
 * Inspired by Remix & Sidewalk Labs
 *
 * Allows urban planners and municipal officials to model capital interventions,
 * measure real-time risk reduction, and calculate 5-year societal ROI.
 */

import type { WardAnalytics } from "./public-data";

export type InterventionConfig = {
  smartStreetLights: number; // 0 to 400 fixtures
  stormwaterPumps: number; // 0 to 8 high-capacity pump units
  pedestrianCrossings: number; // 0 to 20 raised speed tables & crossings
  smartWasteHubs: number; // 0 to 15 closed compaction points
  rapidResponseKiosks: number; // 0 to 5 emergency neighborhood booths
};

export const DEFAULT_INTERVENTIONS: InterventionConfig = {
  smartStreetLights: 120,
  stormwaterPumps: 2,
  pedestrianCrossings: 6,
  smartWasteHubs: 4,
  rapidResponseKiosks: 1,
};

export type SimulationResults = {
  // Baseline vs Simulated
  baselineRiskScore: number;
  simulatedRiskScore: number;
  riskReductionPct: number;

  baselineFloodRisk: number;
  simulatedFloodRisk: number;
  floodReductionPct: number;

  baselinePedestrianSafety: number;
  simulatedPedestrianSafety: number;
  pedestrianSafetyGainPct: number;

  projectedCrimeReductionPct: number;
  projectedAccidentReductionPct: number;
  projectedResponseTimeMinutes: number; // Drop from ~18 mins baseline

  // Financials & Economics
  estimatedCostBdtLakh: number;
  estimatedCostUsd: number;
  fiveYearSocietalRoiRatio: number; // e.g. 4.2x (Every 1 BDT spent saves 4.2 BDT in healthcare/property damage)
  populationBenefitted: number;

  // Key policy takeaway
  summaryTakeaway: string;
  summaryTakeawayBn: string;
};

// Cost coefficients in BDT Lakh (1 Lakh = 100,000 BDT ≈ $850 USD)
const COSTS = {
  smartStreetLightUnitBdtLakh: 0.25, // 25,000 BDT per solar smart streetlight
  stormwaterPumpUnitBdtLakh: 12.0, // 12 Lakh per heavy-duty 500m3/h diesel-electric pump
  pedestrianCrossingUnitBdtLakh: 3.5, // 3.5 Lakh per raised table + bollards + solar flashers
  smartWasteHubUnitBdtLakh: 4.0, // 4 Lakh per sealed compactor hub
  rapidKioskUnitBdtLakh: 8.0, // 8 Lakh per solar CCTV emergency booth
  usdExchangeRate: 118.0, // 1 USD = 118 BDT
};

export function runPolicySimulation(
  wardAnalytics: WardAnalytics,
  interventions: InterventionConfig,
): SimulationResults {
  const ward = wardAnalytics.ward;

  // 1. Calculate Financials
  const lightCost = interventions.smartStreetLights * COSTS.smartStreetLightUnitBdtLakh;
  const pumpCost = interventions.stormwaterPumps * COSTS.stormwaterPumpUnitBdtLakh;
  const crossingCost = interventions.pedestrianCrossings * COSTS.pedestrianCrossingUnitBdtLakh;
  const wasteCost = interventions.smartWasteHubs * COSTS.smartWasteHubUnitBdtLakh;
  const kioskCost = interventions.rapidResponseKiosks * COSTS.rapidKioskUnitBdtLakh;

  const totalCostLakh = Math.round((lightCost + pumpCost + crossingCost + wasteCost + kioskCost) * 10) / 10;
  const totalCostUsd = Math.round((totalCostLakh * 100000) / COSTS.usdExchangeRate);

  // 2. Flood Impact
  // Pumps + Waste Hubs (preventing drain clog) reduce flood risk
  const pumpEffect = interventions.stormwaterPumps * 9.5;
  const wasteEffect = interventions.smartWasteHubs * 2.8;
  const totalFloodDrop = Math.min(wardAnalytics.floodRiskIndex - 15, pumpEffect + wasteEffect);
  const simulatedFlood = Math.max(12, Math.round(wardAnalytics.floodRiskIndex - totalFloodDrop));
  const floodReductionPct =
    wardAnalytics.floodRiskIndex > 0
      ? Math.round(((wardAnalytics.floodRiskIndex - simulatedFlood) / wardAnalytics.floodRiskIndex) * 100)
      : 0;

  // 3. Pedestrian & Road Safety Impact
  // Crossings + Streetlights improve pedestrian safety
  const crossingEffect = interventions.pedestrianCrossings * 3.2;
  const lightSafetyEffect = (interventions.smartStreetLights / 20) * 2.1;
  const simulatedPedSafety = Math.min(
    96,
    Math.round(wardAnalytics.pedestrianSafetyIndex + crossingEffect + lightSafetyEffect),
  );
  const pedestrianSafetyGainPct = Math.round(
    ((simulatedPedSafety - wardAnalytics.pedestrianSafetyIndex) / wardAnalytics.pedestrianSafetyIndex) * 100,
  );

  // 4. Crime & Nighttime Safety Impact
  // Streetlights + Kiosks directly deter street crimes
  const lightCrimeReduction = Math.min(50, (interventions.smartStreetLights / 250) * 45);
  const kioskCrimeReduction = Math.min(25, interventions.rapidResponseKiosks * 8);
  const projectedCrimeReductionPct = Math.min(68, Math.round(lightCrimeReduction + kioskCrimeReduction));

  // 5. Traffic & Accident Impact
  const crossingAccidentReduction = Math.min(55, (interventions.pedestrianCrossings / 15) * 50);
  const projectedAccidentReductionPct = Math.round(crossingAccidentReduction);

  // 6. Response Time (Baseline ~18.5 mins in Dhaka traffic)
  const kioskTimeDrop = interventions.rapidResponseKiosks * 2.8;
  const floodTimeDrop = (floodReductionPct / 100) * 3.5; // Clearer roads = ambulances move faster
  const projectedResponseTime = Math.max(4.5, Math.round((18.5 - kioskTimeDrop - floodTimeDrop) * 10) / 10);

  // 7. Overall Composite Simulated Risk
  const simulatedRisk = Math.max(
    14,
    Math.round(
      simulatedFlood * 0.4 +
        (100 - simulatedPedSafety) * 0.45 +
        Math.max(5, wardAnalytics.activeReportsCount * 1.2),
    ),
  );
  const riskReductionPct = Math.round(
    ((wardAnalytics.urbanVulnerabilityScore - simulatedRisk) / wardAnalytics.urbanVulnerabilityScore) * 100,
  );

  // 8. 5-Year Societal ROI (Benefit-Cost Ratio)
  // Economic savings from avoided hospitalizations, vehicle repairs, and lost commerce during floods
  const annualSavingsPerCapitaBdt = 850 + (floodReductionPct * 18) + (projectedAccidentReductionPct * 12);
  const fiveYearTotalSavingsLakh = (ward.totalPopulation * annualSavingsPerCapitaBdt * 5) / 100000;
  const rawRoi = totalCostLakh > 0 ? fiveYearTotalSavingsLakh / totalCostLakh : 4.5;
  const fiveYearSocietalRoiRatio = Math.round(Math.min(12.5, Math.max(2.1, rawRoi)) * 10) / 10;

  // English & Bengali takeaways
  const summaryTakeaway = `Investing ৳${totalCostLakh} Lakh in ${ward.name} is projected to yield a ${riskReductionPct}% drop in composite vulnerability, averting ~${Math.round(
    ward.historicalAccidentsAnnual * (projectedAccidentReductionPct / 100),
  )} accidents annually with an estimated ${fiveYearSocietalRoiRatio}x 5-year social ROI.`;

  const summaryTakeawayBn = `${ward.nameBn}-এ ৳${totalCostLakh} লাখ বিনিয়োগে সামগ্রিক ঝুঁকি ${riskReductionPct}% হ্রাস পাবে এবং বছরে প্রায় ${Math.round(
    ward.historicalAccidentsAnnual * (projectedAccidentReductionPct / 100),
  )}টি দুর্ঘটনা প্রতিরোধ করা সম্ভব হবে (${fiveYearSocietalRoiRatio}x সামাজিক রিটার্ন)।`;

  return {
    baselineRiskScore: wardAnalytics.urbanVulnerabilityScore,
    simulatedRiskScore: simulatedRisk,
    riskReductionPct: Math.max(0, riskReductionPct),
    baselineFloodRisk: wardAnalytics.floodRiskIndex,
    simulatedFloodRisk: simulatedFlood,
    floodReductionPct: Math.max(0, floodReductionPct),
    baselinePedestrianSafety: wardAnalytics.pedestrianSafetyIndex,
    simulatedPedestrianSafety: simulatedPedSafety,
    pedestrianSafetyGainPct: Math.max(0, pedestrianSafetyGainPct),
    projectedCrimeReductionPct,
    projectedAccidentReductionPct,
    projectedResponseTimeMinutes: projectedResponseTime,
    estimatedCostBdtLakh: totalCostLakh,
    estimatedCostUsd: totalCostUsd,
    fiveYearSocietalRoiRatio,
    populationBenefitted: ward.totalPopulation,
    summaryTakeaway,
    summaryTakeawayBn,
  };
}
