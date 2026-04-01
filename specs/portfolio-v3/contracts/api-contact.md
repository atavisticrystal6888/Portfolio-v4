# API Contract: Contact Form Submission

**Endpoint**: `POST /api/contact`  
**Handler**: `src/app/api/contact/route.ts`  
**Service**: Resend SDK  
**Auth**: Server-side only (`RESEND_API_KEY` environment variable)

---

## Request

### Method & URL

```
POST /api/contact
Content-Type: application/json
```

### Request Body

```typescript
interface ContactFormRequest {
  name: string;      // Required, 1-100 characters, trimmed
  email: string;     // Required, valid email format (RFC 5322)
  subject?: string;  // Optional, max 200 characters, defaults to "Portfolio Contact: {name}"
  message: string;   // Required, 20-5000 characters, trimmed
}
```

### Example Request

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Collaboration Opportunity",
  "message": "Hi Dhruv, I came across your portfolio and would love to discuss a potential collaboration on a data analytics project."
}
```

---

## Response

### Success (200 OK)

```typescript
interface ContactFormResponse {
  success: true;
  message: string;   // User-facing success message
}
```

```json
{
  "success": true,
  "message": "Message sent successfully. I'll get back to you soon!"
}
```

### Validation Error (400 Bad Request)

```typescript
interface ContactFormError {
  success: false;
  message: string;          // Summary error message
  errors: {
    field: string;          // Field name that failed validation
    message: string;        // Human-readable error message
  }[];
}
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "message", "message": "Message must be at least 20 characters" }
  ]
}
```

### Rate Limited (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errors": []
}
```

**Rate limit**: 5 submissions per IP address per hour.  
**Headers**: `Retry-After: <seconds>` included in 429 responses.

### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to send message. Please try the direct email link below.",
  "errors": []
}
```

---

## Server-Side Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required, string, 1-100 chars after trim | "Name is required" / "Name must be under 100 characters" |
| `email` | Required, matches RFC 5322 email regex | "Please provide a valid email address" |
| `subject` | Optional, max 200 chars after trim | "Subject must be under 200 characters" |
| `message` | Required, string, 20-5000 chars after trim | "Message must be at least 20 characters" / "Message must be under 5000 characters" |
| (all fields) | HTML entities escaped, script tags stripped | — (silent sanitization) |

## Security Measures

1. **Input sanitization**: All string inputs trimmed, HTML entities escaped, `<script>` tags stripped
2. **Rate limiting**: 5 requests per IP per hour (tracked via Vercel KV or in-memory Map with TTL)
3. **CORS**: Only accept requests from the portfolio domain (configured in Next.js middleware)
4. **Environment variable**: `RESEND_API_KEY` never exposed to client — server-side only in Route Handler
5. **No PII storage**: Form data sent via Resend and discarded — not persisted in any database

## Email Template

**To**: Configured recipient (Dhruv's email via `CONTACT_EMAIL` env var)  
**From**: `noreply@yourdomain.com` (Resend verified domain)  
**Reply-To**: `{submitter's email}`  
**Subject**: `Portfolio Contact: {subject || name}`  

**Body** (HTML via React Email):
```
New message from {name} ({email})

Subject: {subject}

{message}

---
Sent via portfolio contact form
```

---

## Client-Side Integration

```typescript
// In ContactForm.tsx (client component)
const handleSubmit = async (formData: ContactFormRequest) => {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  const data = await res.json();
  
  if (data.success) {
    // Show success toast, reset form
  } else if (res.status === 429) {
    // Show rate limit message
  } else if (res.status === 400) {
    // Show field-level validation errors
  } else {
    // Show fallback mailto: link
  }
};
```

## Fallback Behavior

If the API route returns 500 or is unreachable:
1. Client shows: "Something went wrong. You can reach me directly at:"
2. Renders a `mailto:` link with pre-filled subject and body from form data
3. Logs error to console (development) / Vercel function logs (production)
