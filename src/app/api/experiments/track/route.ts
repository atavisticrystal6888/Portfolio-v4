import { NextResponse, type NextRequest } from "next/server";
import { trackConversion } from "@/lib/experiments/client";
import { isExperimentsEnabled } from "@/lib/experiments/config";
import { HERO_CTA_EVENT, HERO_CTA_EXPERIMENT } from "@/lib/experiments/hero";
import { readUid } from "@/lib/experiments/identity";

/** Allow-list: the browser may only report events we defined, for experiments we run. */
const EVENTS: Record<string, { experimentKey: string }> = {
  [HERO_CTA_EVENT]: { experimentKey: HERO_CTA_EXPERIMENT },
};

const MAX_BODY_BYTES = 256;

function badRequest() {
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

function noContent() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  let eventName: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return badRequest();
    eventName = (JSON.parse(text) as { event?: unknown }).event;
  } catch {
    return badRequest();
  }
  if (typeof eventName !== "string") return badRequest();
  if (!Object.hasOwn(EVENTS, eventName)) return badRequest();
  const event = EVENTS[eventName]!;

  // From here on the answer is always 204: the beacon must not become an
  // oracle for whether experiments are on or whether this visitor is enrolled.
  if (!isExperimentsEnabled()) return noContent();
  const uid = readUid(request);
  if (!uid) return noContent();

  await trackConversion(uid, event.experimentKey, eventName);
  return noContent();
}
