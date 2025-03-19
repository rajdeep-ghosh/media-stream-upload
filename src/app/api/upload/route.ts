import path from "node:path"
import fs from 'node:fs';
import { writeFile } from "node:fs/promises"
import { NextResponse } from "next/server";
import { putObject } from "@/lib/storage";
import type { NextRequest } from "next/server";

let chunks: Blob[] = [];

export async function POST(req: NextRequest) {
  const body = await req.formData();

  const state = body.get("state");
  const chunk = body.get("chunk");

  if (state === "continue" && chunk) {
    chunks.push(chunk as Blob);
  } else if (state === "stop") {
    const audio = new Blob(chunks, { type: "audio/webm" });
    const fileBuffer = Buffer.from(await audio.arrayBuffer());
    const filename = `recording-${Date.now()}.webm`;

    await putObject(filename, fileBuffer);

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, fileBuffer);
    chunks = [];
  }

  return NextResponse.json('ok');
}
