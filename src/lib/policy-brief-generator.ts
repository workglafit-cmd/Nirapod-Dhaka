/**
 * Zencity-Style AI Policy Brief Generator
 * Transforms raw citizen telemetry + OSM infrastructure metrics + live weather
 * into executive-ready, evidence-based municipal policy briefs for city planners.
 */

import type { WardAnalytics, DhakaWeather } from "./public-data";
import type { InterventionConfig, SimulationResults } from "./policy-simulator";
import { getGroqApiKey, DEFAULT_GROQ_MODEL } from "./groq";

export type PolicyBrief = {
  documentRef: string;
  generatedAt: string;
  title: string;
  titleBn: string;
  targetEntity: string;
  executiveSummary: string;
  executiveSummaryBn: string;
  problemDossier: {
    category: string;
    evidenceText: string;
    severityLevel: "Low" | "Medium" | "High" | "Critical";
  }[];
  statutoryDirectives: {
    number: number;
    title: string;
    actionDescription: string;
    leadAgency: string;
  }[];
  budgetBreakdown: {
    item: string;
    allocatedLakhBdt: number;
    allocatedUsd: number;
  }[];
  projectedOutcomes: {
    metric: string;
    projectedDelta: string;
    baseline: string;
    target: string;
  }[];
  implementationMilestones: {
    dayRange: string;
    deliverable: string;
  }[];
  signOffAuthorities: string[];
};

export async function generatePolicyBrief(params: {
  wardAnalytics: WardAnalytics;
  weather: DhakaWeather;
  interventions: InterventionConfig;
  simulation: SimulationResults;
  lang?: "bn" | "en";
}): Promise<PolicyBrief> {
  const { wardAnalytics, weather, interventions, simulation } = params;
  const ward = wardAnalytics.ward;
  const groqKey = getGroqApiKey();

  const refNumber = `${ward.corporation}/URBAN-POLICY/${new Date().getFullYear()}/W-${ward.id.toUpperCase()}-${Math.floor(
    100 + Math.random() * 900,
  )}`;

  // Default / Deterministic High-Caliber Civic Policy Brief
  const defaultBrief: PolicyBrief = {
    documentRef: refNumber,
    generatedAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    title: `Evidence-Based Capital & Spatial Safety Directive: ${ward.name}`,
    titleBn: `তথ্য-ভিত্তিক অবকাঠামো ও নিরাপত্তা নীতিমালা নির্দেশিকা: ${ward.nameBn}`,
    targetEntity: `${ward.corporation} Urban Planning & Public Works Directorate, Dhaka`,
    executiveSummary: `Spatial telemetry and crowdsourced hazard reporting indicate an acute composite vulnerability index of ${wardAnalytics.urbanVulnerabilityScore}/100 in the ${ward.name} precinct. Overlapping deficits in OpenStreetMap road illumination (${ward.osmLitRoadPct}% lit) and severe monsoon inundation vulnerability (Flood Risk ${wardAnalytics.floodRiskIndex}/100 under ${weather.precipitation} mm/hr rainfall) mandate an immediate capital allocation of ৳${simulation.estimatedCostBdtLakh} Lakh ($${simulation.estimatedCostUsd.toLocaleString()} USD). Model simulations project an estimated ${simulation.riskReductionPct}% reduction in civic risk and a ${simulation.fiveYearSocietalRoiRatio}x 5-year social ROI across ${ward.totalPopulation.toLocaleString()} citizens.`,
    executiveSummaryBn: `${ward.nameBn} এলাকায় নাগরিক রিপোর্ট ও স্যাটেলাইট ওপেনস্ট্রিটম্যাপ তথ্যের ভিত্তিতে সামগ্রিক ঝুঁকি সূচক ${wardAnalytics.urbanVulnerabilityScore}/100 রেকর্ড করা হয়েছে। রাতের সড়ক বাতির ঘাটতি (${ward.osmLitRoadPct}%) এবং মৌসুমি বৃষ্টিপাতে জলাবদ্ধতার ঝুঁকি (${wardAnalytics.floodRiskIndex}/100) নিরসনে অবিলম্বে ৳${simulation.estimatedCostBdtLakh} লাখ বরাদ্দের সুপারিশ করা হলো। সিমুলেশন অনুযায়ী এর ফলে সার্বিক ঝুঁকি ${simulation.riskReductionPct}% হ্রাস পাবে এবং ৫ বছরে ${simulation.fiveYearSocietalRoiRatio}x সামাজিক রিটার্ন নিশ্চিত হবে।`,
    problemDossier: [
      {
        category: "Drainage & Submersion Hazard",
        evidenceText: `${ward.name} elevation is recorded at ${ward.elevationMeters}m with ${ward.osmDrainageCapacityRating} baseline drainage capacity. Active rain forecast (${weather.precipitation} mm/hr) creates acute chokepoints with ${wardAnalytics.infrastructureCount} active citizen reports.`,
        severityLevel: wardAnalytics.floodRiskIndex > 65 ? "Critical" : "High",
      },
      {
        category: "Pedestrian Collision & Sidewalk Deficit",
        evidenceText: `Only ${ward.osmSidewalkPct}% of corridor segments contain continuous pedestrian sidewalks. ${wardAnalytics.accidentCount} active collision reports corroborate historical annual average of ${ward.historicalAccidentsAnnual} collisions.`,
        severityLevel: wardAnalytics.pedestrianSafetyIndex < 50 ? "High" : "Medium",
      },
      {
        category: "Public Safety & Nighttime Illumination",
        evidenceText: `${100 - ward.osmLitRoadPct}% of tertiary alleyways lack verified lighting. Citizen reports correlate dark stretches with ${wardAnalytics.crimeCount} recent safety alerts.`,
        severityLevel: ward.osmLitRoadPct < 60 ? "High" : "Medium",
      },
    ],
    statutoryDirectives: [
      {
        number: 1,
        title: "Deploy Automated Dewatering Drainage Infrastructure",
        actionDescription: `Deploy ${interventions.stormwaterPumps} high-capacity stormwater pumps at low-elevation runoff nodes (${ward.elevationMeters}m datum) and clear upstream secondary culverts.`,
        leadAgency: `${ward.corporation} Drainage Circle & Dhaka WASA`,
      },
      {
        number: 2,
        title: "Pedestrian Safety Infrastructure Retrofit",
        actionDescription: `Construct ${interventions.pedestrianCrossings} grade-separated speed tables with high-visibility thermoplastic markings, bollards, and pedestrian refuge islands.`,
        leadAgency: `${ward.corporation} Traffic Engineering Department & DMP Traffic`,
      },
      {
        number: 3,
        title: "Smart Solar Street Lighting Grid Expansion",
        actionDescription: `Commission ${interventions.smartStreetLights} smart solar LED streetlights along dark alleys and bus transit approach corridors with automated uptime telemetry.`,
        leadAgency: `${ward.corporation} Electrical Division & Power Grid Company`,
      },
      {
        number: 4,
        title: "Rapid Community Safety & Emergency Kiosk Deployment",
        actionDescription: `Establish ${interventions.rapidResponseKiosks} solar-powered emergency communication kiosks linked directly to Thana dispatchers to slash emergency response delay.`,
        leadAgency: `Bangladesh Police & ${ward.corporation} Emergency Command`,
      },
    ],
    budgetBreakdown: [
      {
        item: `Smart Solar Streetlights (${interventions.smartStreetLights} units)`,
        allocatedLakhBdt: Math.round(interventions.smartStreetLights * 0.25 * 10) / 10,
        allocatedUsd: Math.round(((interventions.smartStreetLights * 0.25) / 1.18) * 1000),
      },
      {
        item: `High-Capacity Stormwater Dewatering Pumps (${interventions.stormwaterPumps} units)`,
        allocatedLakhBdt: Math.round(interventions.stormwaterPumps * 12.0 * 10) / 10,
        allocatedUsd: Math.round(((interventions.stormwaterPumps * 12.0) / 1.18) * 1000),
      },
      {
        item: `Pedestrian Speed Tables & Refuges (${interventions.pedestrianCrossings} sites)`,
        allocatedLakhBdt: Math.round(interventions.pedestrianCrossings * 3.5 * 10) / 10,
        allocatedUsd: Math.round(((interventions.pedestrianCrossings * 3.5) / 1.18) * 1000),
      },
      {
        item: `Sealed Smart Waste Compactor Hubs (${interventions.smartWasteHubs} hubs)`,
        allocatedLakhBdt: Math.round(interventions.smartWasteHubs * 4.0 * 10) / 10,
        allocatedUsd: Math.round(((interventions.smartWasteHubs * 4.0) / 1.18) * 1000),
      },
      {
        item: `Emergency SOS Safety Kiosks (${interventions.rapidResponseKiosks} units)`,
        allocatedLakhBdt: Math.round(interventions.rapidResponseKiosks * 8.0 * 10) / 10,
        allocatedUsd: Math.round(((interventions.rapidResponseKiosks * 8.0) / 1.18) * 1000),
      },
    ],
    projectedOutcomes: [
      {
        metric: "Composite Urban Vulnerability",
        baseline: `${wardAnalytics.urbanVulnerabilityScore} / 100`,
        target: `${simulation.simulatedRiskScore} / 100`,
        projectedDelta: `-${simulation.riskReductionPct}% risk`,
      },
      {
        metric: "Monsoon Flood Inundation Index",
        baseline: `${wardAnalytics.floodRiskIndex} / 100`,
        target: `${simulation.simulatedFloodRisk} / 100`,
        projectedDelta: `-${simulation.floodReductionPct}% flood risk`,
      },
      {
        metric: "Pedestrian Walkability & Safety",
        baseline: `${wardAnalytics.pedestrianSafetyIndex} / 100`,
        target: `${simulation.simulatedPedestrianSafety} / 100`,
        projectedDelta: `+${simulation.pedestrianSafetyGainPct}% safety`,
      },
      {
        metric: "Emergency Police/Ambulance Response Time",
        baseline: "18.5 minutes",
        target: `${simulation.projectedResponseTimeMinutes} minutes`,
        projectedDelta: `-${Math.round(((18.5 - simulation.projectedResponseTimeMinutes) / 18.5) * 100)}% latency`,
      },
    ],
    implementationMilestones: [
      {
        dayRange: "Day 0 - 30",
        deliverable: "Emergency drain culvert desiltation & deployment of mobile stormwater suction pumps.",
      },
      {
        dayRange: "Day 31 - 60",
        deliverable: "Installation of smart solar streetlights on dark secondary corridors with CCTV linkage.",
      },
      {
        dayRange: "Day 61 - 90",
        deliverable: "Civil engineering works for raised pedestrian crosswalks & barrier installations.",
      },
      {
        dayRange: "Day 91 - 180",
        deliverable: "Citizen feedback review, secondary audit against Nirapod telemetry, and final handover.",
      },
    ],
    signOffAuthorities: [
      `Chief Executive Officer, ${ward.corporation}`,
      "Superintending Engineer (Civil & Drainage), Dhaka",
      "Deputy Commissioner of Police (Operations), DMP",
      "Director General, Disaster Management Bureau (DMB)",
    ],
  };

  // If Groq API key is configured, enrich executive summary using live Groq LLM
  if (groqKey) {
    try {
      const prompt = `You are the Chief Urban Policy Strategist for Dhaka City Corporation.
Review the following civic telemetry for Ward "${ward.name}":
- Population: ${ward.totalPopulation}
- OpenStreetMap Lit Road: ${ward.osmLitRoadPct}%
- OpenStreetMap Sidewalks: ${ward.osmSidewalkPct}%
- Live Weather: ${weather.conditionLabel}, ${weather.precipitation} mm/hr rain
- Active Citizen Reports: ${wardAnalytics.activeReportsCount} (Crime: ${wardAnalytics.crimeCount}, Infra: ${wardAnalytics.infrastructureCount}, Accidents: ${wardAnalytics.accidentCount})
- Proposed Interventions: ${interventions.smartStreetLights} streetlights, ${interventions.stormwaterPumps} pumps, ${interventions.pedestrianCrossings} crossings.
- Budget: ৳${simulation.estimatedCostBdtLakh} Lakh ($${simulation.estimatedCostUsd} USD)
- Projected Risk Reduction: ${simulation.riskReductionPct}%

Draft a concise, authoritative 2-paragraph Executive Policy Memorandum justification in high-level government civil service tone explaining why this investment is critical, what evidence supports it, and the societal ROI. Output only the 2 paragraphs.`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: "You write rigorous, data-driven municipal policy memorandums.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 450,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const llmSummary = data.choices?.[0]?.message?.content?.trim();
        if (llmSummary && llmSummary.length > 80) {
          defaultBrief.executiveSummary = llmSummary;
        }
      }
    } catch (err) {
      console.warn("[PolicyBrief] Groq enrichment fallback:", err);
    }
  }

  return defaultBrief;
}
