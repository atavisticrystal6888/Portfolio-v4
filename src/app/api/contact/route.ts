import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Rate limiting: simple in-memory store (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  // Opportunistic prune so the per-instance map can't grow without bound.
  if (rateLimitMap.size > 500) {
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    // 5 requests per 15-minute window per IP. (The previous 1-hour window
    // locked out whole NAT'd networks after one person's use.) In-memory =
    // per serverless instance, so this is best-effort abuse damping, not a
    // global cap - acceptable for a personal-site contact form.
    rateLimitMap.set(ip, { count: 1, resetAt: now + 900000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!subject || typeof subject !== "string") {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 20) {
      return NextResponse.json({ error: "Message must be at least 20 characters" }, { status: 400 });
    }

    // Rate limiting runs after validation on purpose: a request that never
    // had a chance of sending an email should not spend the sender's budget.
    // Someone who mistypes their address twice and fixes the message once has
    // already used three of five attempts otherwise, and the next real try is
    // refused.
    if (getRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Sanitize inputs
    const sanitized = {
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      subject: subject.trim().slice(0, 100),
      message: message.trim().slice(0, 5000),
    };

    // Send email via Resend if configured, otherwise log
    if (resend) {
      const toEmail = process.env.CONTACT_EMAIL || CONTACT_EMAIL;
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `[Portfolio] ${sanitized.subject}`,
        replyTo: sanitized.email,
        text: `Name: ${sanitized.name}\nEmail: ${sanitized.email}\n\n${sanitized.message}`,
      });
    } else {
      console.log("📧 Contact form submission (Resend not configured):", sanitized);
    }

    return NextResponse.json({ success: true, message: "Message received successfully" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
