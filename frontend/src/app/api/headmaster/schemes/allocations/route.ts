import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALLOCATIONS_FILE = path.join(process.cwd(), "src/data/scheme_allocations.json");

function getStoredData() {
  try {
    if (fs.existsSync(ALLOCATIONS_FILE)) {
      const text = fs.readFileSync(ALLOCATIONS_FILE, "utf-8");
      return JSON.parse(text);
    }
  } catch (e) {
    console.error("Error reading scheme_allocations.json:", e);
  }
  return { allocations: {}, beneficiaries: [] };
}

function saveStoredData(data: any) {
  try {
    const dir = path.dirname(ALLOCATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ALLOCATIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing scheme_allocations.json:", e);
  }
}

export async function GET() {
  const data = getStoredData();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getStoredData();
    const updated = {
      allocations: body.allocations !== undefined ? body.allocations : current.allocations,
      beneficiaries: body.beneficiaries !== undefined ? body.beneficiaries : current.beneficiaries,
      updatedAt: new Date().toISOString(),
    };
    saveStoredData(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
