import { trackConversion } from "./client";
import { isExperimentsEnabled } from "./config";
import { HERO_CTA_EXPERIMENT } from "./hero";
import { readUid, type UidSource } from "./identity";

export const CONTACT_EVENT = "contact_submitted";

/**
 * A genuine contact submission is the business outcome behind the hero
 * experiment. Call only on the real-send success path — never on the
 * honeypot path, which returns the same body by design.
 */
export async function trackContactSubmission(source: UidSource): Promise<void> {
  if (!isExperimentsEnabled()) return;
  const uid = readUid(source);
  if (!uid) return;
  await trackConversion(uid, HERO_CTA_EXPERIMENT, CONTACT_EVENT);
}
