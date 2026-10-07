import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// One body for both a genuine send and a honeypot drop, so the two are
// indistinguishable from the client.
const SUCCESS_BODY = { ok: true, success: true, message: "Message received successfully" };

// Mirrors `RESEND_ERROR_CODE_KEY` in resend 6.10.0 (dist/index.d.cts). A name
// outside this set is logged as "unrecognized" rather than echoed.
const RESEND_ERROR_NAMES = new Set<string>([
  "invalid_idempotency_key",
  "validation_error",
  "missing_api_key",
  "restricted_api_key",
  "invalid_api_key",
  "not_found",
  "method_not_allowed",
  "invalid_idempotent_request",
  "concurrent_idempotent_requests",
  "invalid_attachment",
  "invalid_from_address",
  "invalid_access",
  "invalid_parameter",
  "invalid_region",
  "missing_required_field",
  "monthly_quota_exceeded",
  "daily_quota_exceeded",
  "rate_limit_exceeded",
  "security_error",
  "application_error",
  "internal_server_error",
]);

type SendErrorSummary = {
  source: "resend" | "thrown" | "unknown";
  name: string;
  statusCode: number | null;
  requestId: string | null;
};

const THROWN_NAME = /^[A-Za-z][A-Za-z0-9]{0,39}$/;
// Underscore allowed (e.g. "req_..."); no "@", ".", "/" or whitespace, so an
// email address or path cannot pass.
const REQUEST_ID = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * The send-failure log is a bounded contract: a category, an allow-listed
 * error name, a numeric HTTP status and a validated request id - nothing
 * else. Resend hands back the provider's JSON body verbatim on a non-OK
 * response (free-text `message`, possibly echoing the recipient or extra
 * fields), and a thrown error carries `message`/`cause`/`stack`. None of those
 * are read, so Vercel logs can never carry the sender's name, email or message
 * or any provider free text.
 */
function summarizeSendError(
  err: unknown,
  headers?: Record<string, string> | null
): SendErrorSummary {
  let source: SendErrorSummary["source"] = "unknown";
  let name = "unrecognized";
  let statusCode: number | null = null;

  if (err instanceof Error) {
    source = "thrown";
    const raw: unknown = err.name;
    if (typeof raw === "string" && THROWN_NAME.test(raw)) name = raw;
  } else if (
    typeof err === "object" &&
    err !== null &&
    typeof (err as { name?: unknown }).name === "string"
  ) {
    source = "resend";
    const raw = (err as { name: string }).name;
    if (RESEND_ERROR_NAMES.has(raw)) name = raw;
  }

  if (source !== "unknown") {
    const code: unknown = (err as { statusCode?: unknown }).statusCode;
    if (typeof code === "number" && Number.isInteger(code) && code >= 100 && code <= 599) {
      statusCode = code;
    }
  }

  const id: unknown = headers?.["x-request-id"];
  const requestId = typeof id === "string" && REQUEST_ID.test(id) ? id : null;

  return { source, name, statusCode, requestId };
}

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
    const { name, email, subject, message, website } = body;

    // Honeypot: `website` is visually hidden and off the tab order, so only a
    // form-filling bot ever supplies it. Drop the message but answer with the
    // exact success body a real send produces - a distinguishable rejection
    // would just teach the bot to leave the field alone.
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json(SUCCESS_BODY);
    }

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

    // Without a Resend key in production there is no path to the inbox, so a
    // well-formed message gets an honest 503 rather than a fake 200 that loses
    // it silently. This runs *after* validation - a malformed request is a 400
    // whatever the server's mail config is, and 503 would wrongly tell the
    // sender to retry - and *before* the rate limiter, so an outage does not
    // spend the sender's budget.
    if (!resend && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "The contact form is temporarily offline — please email me directly." },
        { status: 503 }
      );
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
      // resend resolves { data, error } rather than throwing, so a rejected
      // send (bad key, unverified sender, sandbox recipient limit) must be read
      // from the result. Either way the sender is told it did not go through.
      let sendError: unknown = null;
      // Response headers only exist when Resend answered; a throw leaves null.
      let sendHeaders: Record<string, string> | null = null;
      try {
        const { error, headers } = await resend.emails.send({
          from: fromEmail,
          to: toEmail,
          subject: `[Portfolio] ${sanitized.subject}`,
          replyTo: sanitized.email,
          text: `Name: ${sanitized.name}\nEmail: ${sanitized.email}\n\n${sanitized.message}`,
        });
        sendError = error;
        sendHeaders = headers ?? null;
      } catch (err) {
        sendError = err;
      }
      if (sendError) {
        console.error(
          "Contact form: Resend did not accept the message",
          summarizeSendError(sendError, sendHeaders)
        );
        return NextResponse.json(
          { error: "The message could not be sent — please email me directly." },
          { status: 502 }
        );
      }
    } else {
      console.log("📧 Contact form submission (Resend not configured):", sanitized);
    }

    return NextResponse.json(SUCCESS_BODY);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
