export const DHAKA_CENTER: [number, number] = [23.7806, 90.4074];

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(km: number, lang: "bn" | "en"): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return lang === "bn" ? `${toBnDigits(m)} মিটার` : `${m} m`;
  }
  const v = km.toFixed(1);
  return lang === "bn" ? `${toBnDigits(v)} কিমি` : `${v} km`;
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBnDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function nearest<T extends { lat: number; lng: number }>(
  items: T[],
  lat: number,
  lng: number,
): (T & { km: number }) | null {
  if (!items.length) return null;
  return items
    .map((i) => ({ ...i, km: distanceKm(lat, lng, i.lat, i.lng) }))
    .sort((a, b) => a.km - b.km)[0];
}

export function sortByDistance<T extends { lat: number; lng: number }>(
  items: T[],
  lat: number,
  lng: number,
): (T & { km: number })[] {
  return items
    .map((i) => ({ ...i, km: distanceKm(lat, lng, i.lat, i.lng) }))
    .sort((a, b) => a.km - b.km);
}

const AREAS: { name: string; bn: string; lat: number; lng: number }[] = [
  { name: "Gulshan", bn: "গুলশান", lat: 23.7925, lng: 90.4078 },
  { name: "Banani", bn: "বনানী", lat: 23.7937, lng: 90.4066 },
  { name: "Dhanmondi", bn: "ধানমন্ডি", lat: 23.7465, lng: 90.376 },
  { name: "Mirpur", bn: "মিরপুর", lat: 23.806, lng: 90.3685 },
  { name: "Motijheel", bn: "মতিঝিল", lat: 23.733, lng: 90.4172 },
  { name: "Uttara", bn: "উত্তরা", lat: 23.8697, lng: 90.379 },
  { name: "Mohammadpur", bn: "মোহাম্মদপুর", lat: 23.7654, lng: 90.3588 },
  { name: "Tejgaon", bn: "তেজগাঁও", lat: 23.7639, lng: 90.396 },
  { name: "Old Dhaka", bn: "পুরান ঢাকা", lat: 23.7104, lng: 90.4074 },
  { name: "Bashundhara", bn: "বসুন্ধরা", lat: 23.8189, lng: 90.4262 },
  { name: "Farmgate", bn: "ফার্মগেট", lat: 23.7583, lng: 90.3899 },
  { name: "Shahbagh", bn: "শাহবাগ", lat: 23.7387, lng: 90.3956 },
];

export function areaName(lat: number, lng: number): string {
  const n = nearest(AREAS, lat, lng);
  return n ? n.name : "Dhaka";
}

export function areaLabel(area: string | null, lang: "bn" | "en"): string {
  if (!area) return lang === "bn" ? "ঢাকা" : "Dhaka";
  const hit = AREAS.find((a) => a.name === area);
  return hit ? (lang === "bn" ? hit.bn : hit.name) : area;
}
