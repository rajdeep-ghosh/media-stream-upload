import path from "node:path"
import fs from 'node:fs';
import { writeFile } from "node:fs/promises"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let chunks: Blob[] = [];

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer()

  const chunk = new Blob([body], { type: "audio/webm" });
  chunks.push(chunk);

  return NextResponse.json('ok');
}

export async function GET() {
  const audio = new Blob(chunks, { type: "audio/webm" });

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, `recording-${Date.now()}.webm`);
  await writeFile(filepath, Buffer.from(await audio.arrayBuffer()));
  chunks = [];

  return NextResponse.json('ok');
}
