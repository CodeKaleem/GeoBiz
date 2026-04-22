import { type NextRequest } from "next/server";
import { fetchBusinesses } from "@/lib/overpass";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";

  if (!city || !type) {
    return Response.json(
      { error: "Both 'city' and 'type' query parameters are required." },
      { status: 400 }
    );
  }

  try {
    const businesses = await fetchBusinesses(city, type);
    return Response.json({ businesses, total: businesses.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
