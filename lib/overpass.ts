import { Business } from "./types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter"
];

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const WIKIDATA_URL = "https://query.wikidata.org/sparql";

const WIKIDATA_CATEGORIES: Record<string, string> = {
  restaurant: "Q11707",
  hospital: "Q16917",
  hotel: "Q166164",
  pharmacy: "Q12140",
  school: "Q3914",
  bank: "Q22687",
  cafe: "Q102229",
  bar: "Q187429",
  museum: "Q33506",
  library: "Q7075",
  university: "Q3918",
  park: "Q22698",
  dentist: "Q214152",
  supermarket: "Q180735"
};

// --- Cache Implementation ---
// Memory cache to optimize performance for repeated searches
const locationCache = new Map<string, { data: ResolvedLocation, ts: number }>();
const resultsCache = new Map<string, { data: Business[], ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour TTL

interface ResolvedLocation { areaId: number | null; lat: number; lon: number; }

async function resolveLocation(city: string): Promise<ResolvedLocation | null> {
  const normCity = city.trim().toLowerCase();
  const cached = locationCache.get(normCity);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(city.trim())}&format=json&limit=1`, { 
      headers: { "User-Agent": "GeoBiz/1.3" }, signal: AbortSignal.timeout(8000) 
    });
    const data = await res.json();
    if (!data?.[0]) return null;
    const r = data[0];
    const osmId = parseInt(r.osm_id);
    const resolved = { 
      areaId: r.osm_type === "relation" ? 3600000000 + osmId : (r.osm_type === "way" ? 2400000000 + osmId : null),
      lat: parseFloat(r.lat), 
      lon: parseFloat(r.lon) 
    };
    locationCache.set(normCity, { data: resolved, ts: Date.now() });
    return resolved;
  } catch { return null; }
}

async function fetchWikidata(lat: number, lon: number, category: string): Promise<Business[]> {
  const qid = WIKIDATA_CATEGORIES[category.toLowerCase()];
  if (!qid) return [];

  const sparql = `
SELECT ?place (SAMPLE(?label) AS ?name) (SAMPLE(?web) AS ?website) (SAMPLE(?tel) AS ?phone) ?coord WHERE {
  SERVICE wikibase:around {
    ?place wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "12" .
  }
  ?place wdt:P31/wdt:P279* wd:${qid} .
  OPTIONAL { ?place wdt:P856 ?web }
  OPTIONAL { ?place wdt:P1329 ?tel }
  ?place rdfs:label ?label .
  FILTER(LANG(?label) = "en" || LANG(?label) = "uk" || LANG(?label) = "pk" || LANG(?label) = "ur")
} GROUP BY ?place ?coord LIMIT 100
  `.trim();

  try {
    const res = await fetch(`${WIKIDATA_URL}?query=${encodeURIComponent(sparql)}`, {
      headers: { "Accept": "application/sparql-results+json", "User-Agent": "GeoBiz/1.3" },
      signal: AbortSignal.timeout(15000)
    });
    const data = await res.json();
    return (data.results.bindings || []).map((b: any) => {
      const coords = (b.coord?.value || "").match(/Point\(([^ ]+) ([^ ]+)\)/);
      return {
        id: b.place.value.split("/").pop() || Math.random().toString(),
        name: b.name?.value || "Unknown",
        category,
        phone: b.phone?.value || "",
        email: "",
        website: b.website?.value || "",
        address: "",
        lat: coords ? parseFloat(coords[2]) : lat,
        lon: coords ? parseFloat(coords[1]) : lon,
      };
    });
  } catch { return []; }
}

async function fetchOverpass(areaId: number | null, city: string, type: string): Promise<Business[]> {
  const cat = type.trim().toLowerCase();
  const areaPart = areaId ? `area(${areaId})->.a;` : `area["name"~"${city.trim()}",i]->.a;`;
  const q = `[out:json][timeout:30]; ${areaPart} ( node(area.a)["amenity"="${cat}"]; node(area.a)["shop"="${cat}"]; node(area.a)["amenity"~"${cat}",i]; ); out center 100;`;

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "GeoBiz/1.3" },
        body: `data=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(35000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      return (data.elements || []).map((el: any) => ({
        id: `${el.type}-${el.id}`,
        name: el.tags?.name || el.tags?.brand || el.tags?.operator || "Unknown Business",
        category: el.tags?.amenity || el.tags?.shop || type,
        phone: el.tags?.phone || el.tags?.["contact:phone"] || "",
        email: el.tags?.email || el.tags?.["contact:email"] || "",
        website: el.tags?.website || el.tags?.url || "",
        address: el.tags?.["addr:full"] || `${el.tags?.["addr:street"] || ""} ${el.tags?.["addr:housenumber"] || ""}`.trim(),
        lat: el.lat || el.center?.lat || 0,
        lon: el.lon || el.center?.lon || 0,
      }));
    } catch { continue; }
  }
  return [];
}

export async function fetchBusinesses(city: string, type: string): Promise<Business[]> {
  const cacheKey = `${city.trim().toLowerCase()}_${type.trim().toLowerCase()}`;
  const cached = resultsCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    console.log(`Cache Hit for ${cacheKey}`);
    return cached.data;
  }

  const loc = await resolveLocation(city);
  const [osm, wiki] = await Promise.all([
    fetchOverpass(loc?.areaId || null, city, type),
    loc ? fetchWikidata(loc.lat, loc.lon, type) : Promise.resolve([])
  ]);

  const merged = new Map<string, Business>();

  [...wiki, ...osm].forEach(b => {
    const nameKey = b.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
    const key = `${nameKey}_${b.lat.toFixed(3)}_${b.lon.toFixed(3)}`;
    const ex = merged.get(key);
    if (!ex) merged.set(key, b);
    else merged.set(key, { ...ex, website: ex.website || b.website, phone: ex.phone || b.phone });
  });

  const final = Array.from(merged.values());
  resultsCache.set(cacheKey, { data: final, ts: Date.now() });
  
  // Clean up cache if too large
  const firstResultKey = resultsCache.keys().next().value;
  if (resultsCache.size > 100 && firstResultKey) resultsCache.delete(firstResultKey);
  const firstLocationKey = locationCache.keys().next().value;
  if (locationCache.size > 200 && firstLocationKey) locationCache.delete(firstLocationKey);

  return final;
}
