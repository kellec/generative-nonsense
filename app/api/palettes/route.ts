import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const PALETTES_PATH = path.join(process.cwd(), "lib/palettes.json");

export async function GET() {
  const data = await readFile(PALETTES_PATH, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

export async function POST(request: Request) {
  const palettes = await request.json();
  await writeFile(PALETTES_PATH, JSON.stringify(palettes, null, 2) + "\n");
  return NextResponse.json({ ok: true });
}
