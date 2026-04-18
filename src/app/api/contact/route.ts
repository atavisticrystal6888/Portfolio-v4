import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Rate limiting: simple in-memory store (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return false;
  }
  entry.count++;
  return entry.count > 5;
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

    // Sanitize inputs
    const sanitized = {
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      subject: subject.trim().slice(0, 100),
      message: message.trim().slice(0, 5000),
    };

    // Send email via Resend if configured, otherwise log
    if (resend) {
      const toEmail = process.env.CONTACT_EMAIL || "dhruv@example.com";
      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
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
