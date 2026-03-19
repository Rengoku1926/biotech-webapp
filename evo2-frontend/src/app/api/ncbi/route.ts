import { type NextRequest, NextResponse } from "next/server";

const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const endpoint = searchParams.get("_endpoint");
  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing _endpoint parameter" },
      { status: 400 },
    );
  }

  const ncbiParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "_endpoint") ncbiParams.set(key, value);
  });

  const url = `${NCBI_BASE}/${endpoint}.fcgi?${ncbiParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "GenomeExplorer/1.0" },
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `NCBI request failed: ${response.statusText}` },
        { status: response.status },
      );
    }

    // Cast to avoid unsafe-assignment lint error
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach NCBI", detail: String(err) },
      { status: 502 },
    );
  }
}