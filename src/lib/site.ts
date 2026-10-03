const DEFAULT_SITE_URL = "https://dhruvsinghal.codes";

export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/$/, "");
export const SITE_NAME = "Dhruv Singhal";
export const SITE_TITLE = "Dhruv Singhal — Product Manager & Builder";
/** Default meta description, WebSite and manifest description (claim gate F4; 120-160 chars). */
export const SITE_DESCRIPTION =
	"Portfolio of Dhruv Singhal, Product Manager & Builder: AI evaluation, product scope, D2C retention and ride-sharing design, each with its evidence and limits.";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
export const SITE_HOST = new URL(SITE_URL).host;
export const WWW_SITE_HOST = SITE_HOST.startsWith("www.")
	? SITE_HOST
	: `www.${SITE_HOST}`;
export const PERSON_TITLE = "Product Manager & Builder";
/**
 * Person description for schema.org. Dated and past-safe (owner decision,
 * 3 Oct 2026): the internship ends 9 Oct 2026, so no undated present-tense
 * role. For the same reason the Person carries no schema `jobTitle` and no
 * `worksFor`. About one year of experience, never more.
 */
export const PERSON_DESCRIPTION =
	"About one year of product experience across internships, most recently product intern (growth) at The Sleep Company, Jul–Oct 2026. Writes about AI evaluation, retention and product scope.";
/** The page that describes the person: the target of every author link. */
export const ABOUT_PATH = "/about";
export const CONTACT_EMAIL = "dhruvsinghal6888@gmail.com";
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
/** E.164 — what gets copied to the clipboard and published in schema.org. */
export const CONTACT_PHONE = "+917015131885";
/** Grouped for humans; the display form never goes into an href. */
export const CONTACT_PHONE_DISPLAY = "+91 70151 31885";
export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE}`;
export const GITHUB_URL = "https://github.com/atavisticrystal6888";
export const LINKEDIN_URL = "https://linkedin.com/in/dhruvsinghal6888";
export const RESUME_HREF = "/resume/dhruv-singhal-resume.pdf";
export const RESUME_FILE_NAME = "dhruv-singhal-resume.pdf";
export const HEADSHOT_PATH = "/images/headshot.svg";

export function absoluteUrl(path = "/") {
	if (!path || path === "/") {
		return SITE_URL;
	}

	if (/^https?:\/\//.test(path)) {
		return path;
	}

	return new URL(path.startsWith("/") ? path : `/${path}`, `${SITE_URL}/`).toString();
}