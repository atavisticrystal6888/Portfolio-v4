import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const SUBSCRIBERS_PATH = join(process.cwd(), "content", "subscribers.json");

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

function getSubscribers(): string[] {
  if (!existsSync(SUBSCRIBERS_PATH)) return [];
  try {
    return JSON.parse(readFileSync(SUBSCRIBERS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveSubscribers(subs: string[]) {
  writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subs, null, 2));
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  if (getRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase().slice(0, 200);
    const subscribers = getSubscribers();

    if (subscribers.includes(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409 }
      );
    }

    subscribers.push(sanitizedEmail);
    saveSubscribers(subscribers);

    console.log(`📬 New subscriber: ${sanitizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
