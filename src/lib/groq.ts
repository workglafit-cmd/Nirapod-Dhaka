import type { Report } from "@/lib/reports";
import type { Profile, AppRole } from "@/lib/auth";

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isError?: boolean;
};

export type SiteActivitySummary = {
  totalReports: number;
  openReports: number;
  resolvedReports: number;
  crimeCount: number;
  infrastructureCount: number;
  accidentCount: number;
  activeSosCount: number;
  riskyAreas: { area: string; count: number; types: string[] }[];
  recentIncidents: {
    type: string;
    subtype: string | null;
    area: string | null;
    description: string;
    timeAgo: string;
  }[];
};

/**
 * Retrieves the Groq API key from environment variables.
 */
export function getGroqApiKey(): string {
  const envKey = import.meta.env.VITE_GROQ_API_KEY || "";
  return envKey.trim();
}

/**
 * Formats website activity and reports into a structured context for Groq LLM.
 */
export function buildSiteActivitySummary(
  reports: Report[],
  sosCount: number = 0,
): SiteActivitySummary {
  const totalReports = reports.length;
  const openReports = reports.filter((r) => r.status !== "resolved").length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;

  const crimeCount = reports.filter((r) => r.type === "crime").length;
  const infrastructureCount = reports.filter((r) => r.type === "infrastructure").length;
  const accidentCount = reports.filter((r) => r.type === "accident").length;

  // Aggregate by area name to find top risky areas
  const areaMap = new Map<string, { count: number; types: Set<string> }>();
  for (const r of reports) {
    const area = r.area_name || "Dhaka Central";
    const existing = areaMap.get(area) || { count: 0, types: new Set() };
    existing.count += 1;
    existing.types.add(r.type);
    areaMap.set(area, existing);
  }

  const riskyAreas = Array.from(areaMap.entries())
    .map(([area, data]) => ({
      area,
      count: data.count,
      types: Array.from(data.types),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recentIncidents = reports.slice(0, 10).map((r) => ({
    type: r.type,
    subtype: r.subtype,
    area: r.area_name || "Dhaka Area",
    description: r.description,
    timeAgo: new Date(r.created_at).toLocaleString(),
  }));

  return {
    totalReports,
    openReports,
    resolvedReports,
    crimeCount,
    infrastructureCount,
    accidentCount,
    activeSosCount: sosCount,
    riskyAreas,
    recentIncidents,
  };
}

/**
 * Builds the Groq System Prompt containing live website activity data and rules.
 */
export function buildSystemPrompt(
  summary: SiteActivitySummary,
  userProfile?: Profile | null,
  role?: AppRole | null,
  userLocation?: { lat: number; lng: number } | null,
  lang: "bn" | "en" = "bn",
): string {
  const userName = userProfile?.full_name || "User";
  const userRoleStr = role || "citizen";

  const riskyAreasText = summary.riskyAreas.length
    ? summary.riskyAreas
        .map(
          (a) =>
            `- **${a.area}**: ${a.count} active reported hazards/crimes (Types: ${a.types.join(", ")})`,
        )
        .join("\n")
    : "No major high-risk zones flagged at this moment.";

  const recentIncidentsText = summary.recentIncidents.length
    ? summary.recentIncidents
        .slice(0, 6)
        .map(
          (i) =>
            `- [${i.type.toUpperCase()}${i.subtype ? ` / ${i.subtype}` : ""}] at ${i.area}: "${i.description}" (${i.timeAgo})`,
        )
        .join("\n")
    : "No recent incidents reported.";

  return `You are "Nirapod AI" (Powered by Groq), the official intelligent safety assistant for the Nirapod Dhaka (নিরাপদ ঢাকা) platform.
Your primary role is to assist logged-in users (${userName}, role: ${userRoleStr}) with real-time advice regarding risky areas in Dhaka, active crime and hazard reports on the website, safe navigation, emergency guidance, and platform activity.

### LIVE WEBSITE ACTIVITY & REAL-TIME DATA:
- Total Website Hazard Reports: ${summary.totalReports} (${summary.openReports} open, ${summary.resolvedReports} resolved)
- Crime Reports: ${summary.crimeCount}
- Infrastructure / Road Hazard Reports: ${summary.infrastructureCount}
- Accident / Emergency Reports: ${summary.accidentCount}
- Active Emergency SOS Alerts: ${summary.activeSosCount}
${userLocation ? `- User Location Coordinates: (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : "- User Location: Unknown / Not shared"}

### HIGH RISK & HOTSPOT AREAS ON WEBSITE:
${riskyAreasText}

### RECENT REPORTED INCIDENTS ON WEBSITE:
${recentIncidentsText}

### INSTRUCTIONS:
1. Always communicate politely, clearly, and concisely. Use formatting like bullet points and bold text for key areas or safety precautions.
2. If the user asks about **risky areas** or **high crime spots**, analyze the live data above (e.g., ${summary.riskyAreas.map((a) => a.area).slice(0, 4).join(", ")}) and give detailed, practical safety advice for navigating those locations in Dhaka.
3. If the user asks about **website activities**, summarize the live statistics provided above accurately.
4. Support both **Bengali (বাংলা)** and **English**. Reply in the language the user speaks to you (default to ${lang === "bn" ? "Bengali" : "English"} if ambiguous).
5. Emphasize user safety! If there is an immediate emergency or crime in progress, advise them to use the 🚨 **Emergency SOS button** on the app or dial **999** or contact local Police/Fire service.
6. Always acknowledge that you are powered by Groq's high-speed AI engine. Keep answers engaging and accurate to Dhaka's local context (e.g., Mirpur, Dhanmondi, Gulshan, Uttara, Farmgate, Motijheel, Old Dhaka).`;
}

/**
 * Sends a query to the Groq API (or returns fallback analysis if no key is present).
 */
export async function sendGroqChatRequest({
  messages,
  summary,
  userProfile,
  role,
  userLocation,
  lang = "bn",
  model = DEFAULT_GROQ_MODEL,
}: {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  summary: SiteActivitySummary;
  userProfile?: Profile | null;
  role?: AppRole | null;
  userLocation?: { lat: number; lng: number } | null;
  lang?: "bn" | "en";
  model?: string;
}): Promise<string> {
  const apiKey = getGroqApiKey();

  // If no Groq API Key, provide intelligent local response based on site activity
  if (!apiKey) {
    return generateFallbackResponse(messages[messages.length - 1]?.content || "", summary, lang);
  }

  const systemPrompt = buildSystemPrompt(summary, userProfile, role, userLocation, lang);

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Groq API Error Response:", response.status, errData);

      if (response.status === 401) {
        throw new Error(
          lang === "bn"
            ? "Groq API Key টি অকার্যকর। অনুগ্রহ করে সঠিক API Key প্রদান করুন।"
            : "Invalid Groq API Key. Please check your API Key in Settings.",
        );
      }

      throw new Error(
        errData.error?.message ||
          (lang === "bn"
            ? `Groq API ত্রুটি (${response.status})।`
            : `Groq API Request failed with status ${response.status}.`),
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error("No response received from Groq LLM.");
    }

    return reply.trim();
  } catch (error: unknown) {
    console.warn("Groq API call failed, using intelligent site activity analysis:", error);

    // If API key was supplied but failed (quota/network), explain error and fall back gracefully
    const errMessage = error instanceof Error ? error.message : String(error);
    const fallbackText = generateFallbackResponse(
      messages[messages.length - 1]?.content || "",
      summary,
      lang,
    );

    return (
      (lang === "bn"
        ? `⚠️ *Groq API বিজ্ঞপ্তি: ${errMessage}*\n\n---\n\n`
        : `⚠️ *Groq API Notice: ${errMessage}*\n\n---\n\n`) + fallbackText
    );
  }
}

/**
 * Generates an intelligent, local context response analyzing website activity & risky areas
 * when Groq API key is not yet set or when offline.
 */
function generateFallbackResponse(
  query: string,
  summary: SiteActivitySummary,
  lang: "bn" | "en",
): string {
  const q = query.toLowerCase();
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(query);

  const topRiskyStr = summary.riskyAreas.length
    ? summary.riskyAreas
        .slice(0, 5)
        .map((a, i) => `${i + 1}. **${a.area}** (${a.count}টি রিপোর্ট - ${a.types.join(", ")})`)
        .join("\n")
    : isBn
      ? "বর্তমানে কোনো বড় ঝুঁকিপূর্ণ এলাকা চিহ্নিত নেই।"
      : "No major risky areas currently flagged.";

  const topRiskyStrEn = summary.riskyAreas.length
    ? summary.riskyAreas
        .slice(0, 5)
        .map((a, i) => `${i + 1}. **${a.area}** (${a.count} reports - ${a.types.join(", ")})`)
        .join("\n")
    : "No major high-risk areas currently flagged.";

  // 1. Risky areas query
  if (
    q.includes("risk") ||
    q.includes("risky") ||
    q.includes("hazard") ||
    q.includes("crime") ||
    q.includes("ঝুঁকি") ||
    q.includes("অপরাধ") ||
    q.includes("এলাকা")
  ) {
    if (isBn) {
      return `🤖 **নিরাপদ ঢাকা AI (Groq চালিত) — ঝুঁকিপূর্ণ এলাকা বিশ্লেষণ:**

ওয়েবসাইটের সাম্প্রতিক লাইভ অ্যাক্টিভিটি ও রিপোর্ট অনুযায়ী ঢাকায় ঝুঁকিপূর্ণ এলাকাসমূহ:

${topRiskyStr}

💡 **নিরাপত্তা পরামর্শ:**
- এই এলাকাগুলোতে রাতের বেলা একা চলাচল এড়িয়ে চলুন।
- কোনো অনাকাঙ্ক্ষিত পরিস্থিতি দেখলে সাথে সাথে অ্যাপের 🚨 **এসওএস (SOS)** বোতাম চাপুন বা ৯৯৯ এ কল দিন।
- অ্যাপের লাইভ ম্যাপে নতুন রিপোর্ট আপডেট নিয়মিত দেখুন।

*(পরামর্শ: নিরবচ্ছিন্ন অতি-দ্রুত Groq LLM রেসপন্স পেতে চ্যাট উইজেটের উপরে **🔑 Groq API Key** সেটিংসে আপনার কী যোগ করতে পারেন।)*`;
    } else {
      return `🤖 **Nirapod AI (Powered by Groq) — Risk Area Analysis:**

Based on live website activity and report counts, here are the current top flagged areas in Dhaka:

${topRiskyStrEn}

💡 **Safety Recommendations:**
- Avoid walking alone in these areas late at night.
- If you notice suspicious activity or danger, tap the 🚨 **Emergency SOS** button in the app or call 999 immediately.
- Keep an eye on the live hazard map for real-time updates.

*(Tip: To enable full Groq LLM capabilities, add your Groq API Key in the **🔑 Groq Key** settings above.)*`;
    }
  }

  // 2. Website Activity query
  if (
    q.includes("activity") ||
    q.includes("activities") ||
    q.includes("report") ||
    q.includes("summary") ||
    q.includes("কী হচ্ছে") ||
    q.includes("অ্যাক্টিভিটি") ||
    q.includes("রিপোর্ট") ||
    q.includes("পরিসংখ্যান")
  ) {
    if (isBn) {
      return `📊 **ওয়েবসাইট অ্যাক্টিভিটি ও সাম্প্রতিক রিপোর্টের সারসংক্ষেপ:**

- 📋 **মোট লাইভ রিপোর্ট:** ${summary.totalReports}টি (${summary.openReports}টি চলমান, ${summary.resolvedReports}টি সমাধানকৃত)
- 🚨 **অপরাধ সংক্রান্ত রিপোর্ট:** ${summary.crimeCount}টি
- 🛠️ **অবকাঠামো সমস্যা (ম্যানহোল/রাস্তা/ড্রেন):** ${summary.infrastructureCount}টি
- 🚑 **দুর্ঘটনা ও জরুরি রিপোর্ট:** ${summary.accidentCount}টি
- 🆘 **সক্রিয় জরুরি SOS সেশন:** ${summary.activeSosCount}টি

সবচেয়ে বেশি অ্যাক্টিভ এলাকা: **${summary.riskyAreas[0]?.area || "ঢাকা সেন্ট্রাল"}** (${summary.riskyAreas[0]?.count || 0}টি অ্যাক্টিভ রিপোর্ট)।`;
    } else {
      return `📊 **Website Activity & Live Reports Summary:**

- 📋 **Total Live Reports:** ${summary.totalReports} (${summary.openReports} open, ${summary.resolvedReports} resolved)
- 🚨 **Crime Reports:** ${summary.crimeCount}
- 🛠️ **Infrastructure Hazards:** ${summary.infrastructureCount}
- 🚑 **Accidents & Emergency:** ${summary.accidentCount}
- 🆘 **Active Emergency SOS Alerts:** ${summary.activeSosCount}

Highest Activity Zone: **${summary.riskyAreas[0]?.area || "Dhaka Central"}** (${summary.riskyAreas[0]?.count || 0} active reports).`;
    }
  }

  // 3. General greeting / advice query
  if (isBn) {
    return `👋 **হ্যালো! আমি নিরাপদ ঢাকা AI (Groq Powered)।**

আমি ওয়েবসাইটের লাইভ অ্যাক্টিভিটি ও রিপোর্ট বিশ্লেষণ করে আপনাকে সাহায্য করতে পারি:
- 🚨 **ঝুঁকিপূর্ণ এলাকা ও হটস্পট** সম্পর্কে জানা
- 📊 **ওয়েবসাইটের বর্তমান পরিসংখ্যান ও সাম্প্রতিক ঘটনাবলী**
- 🛡️ **রাস্তায় নিরাপদে চলাচলের নির্দেশিকা ও SOS সহায়তা**

আপনি ঢাকার যেকোনো এলাকা বা নিরাপত্তা নিয়ে প্রশ্ন করতে পারেন!`;
  } else {
    return `👋 **Hello! I am Nirapod AI (Powered by Groq).**

I can assist you based on real-time website activities and report data:
- 🚨 Learn about **risky areas & flagged crime hotspots**
- 📊 View **website report statistics and recent incidents**
- 🛡️ Get **safety guidance and emergency SOS tips**

Feel free to ask me anything about safety in Dhaka!`;
  }
}
