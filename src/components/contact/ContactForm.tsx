"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL_HREF } from "@/lib/site";
import styles from "./ContactForm.module.css";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/** Field order, so a failed submit lands on the first problem. */
const FIELD_ORDER: (keyof FormErrors)[] = ["name", "email", "subject", "message"];

export function ContactForm() {
  const [data, setData] = useState<FormData>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  // What the API said went wrong, when it said something specific - a rate
  // limit reads very differently from "something went wrong".
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Valid email is required";
    if (!data.subject) errs.subject = "Please select a subject";
    if (!data.message.trim() || data.message.trim().length < 20) errs.message = "Message must be at least 20 characters";
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Move focus to the first invalid field: without this the errors appear
      // silently below a submit button that still holds focus.
      const firstBad = FIELD_ORDER.find((f) => errs[f]);
      if (firstBad) {
        formRef.current
          ?.querySelector<HTMLElement>(`#${firstBad}`)
          ?.focus();
      }
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setServerError(null);
        setStatus("success");
        setData({ name: "", email: "", subject: "", message: "" });
      } else {
        const body = await res.json().catch(() => null);
        setServerError(typeof body?.error === "string" ? body.error : null);
        setStatus("error");
      }
    } catch {
      setServerError(null);
      setStatus("error");
    }
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Name <span className={styles.required}>*</span></label>
        <input
          id="name" type="text" className={styles.input}
          value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <span id="name-error" role="alert" className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Email <span className={styles.required}>*</span></label>
        <input
          id="email" type="email" className={styles.input}
          value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <span id="email-error" role="alert" className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="subject" className={styles.label}>Subject <span className={styles.required}>*</span></label>
        <select
          id="subject" className={styles.select}
          value={data.subject} onChange={(e) => setData({ ...data, subject: e.target.value })}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        >
          <option value="">Select a subject</option>
          <option value="job">Job Opportunity</option>
          <option value="freelance">Freelance/Consulting</option>
          <option value="collaboration">Collaboration</option>
          <option value="other">Other</option>
        </select>
        {errors.subject && <span id="subject-error" role="alert" className={styles.error}>{errors.subject}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Message <span className={styles.required}>*</span></label>
        <textarea
          id="message" className={styles.textarea} rows={5}
          value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "msg-error" : undefined}
        />
        {errors.message && <span id="msg-error" role="alert" className={styles.error}>{errors.message}</span>}
      </div>

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send Message"}
      </Button>

      {status === "success" && <p role="status" className={styles.success}>Message sent successfully! I&apos;ll get back to you soon.</p>}
      {status === "error" && (
        <p role="alert" className={styles.errorMsg}>
          {serverError ?? "Something went wrong."} Please try{" "}
          <a href={CONTACT_EMAIL_HREF}>emailing directly</a>.
        </p>
      )}
    </form>
  );
}
