const DEFAULT_SITE_URL = "https://dhruvsinghal.codes";

export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/$/, "");
export const SITE_NAME = "Dhruv Singhal";
export const SITE_TITLE = "Dhruv Singhal — Product Manager & Builder";
export const SITE_DESCRIPTION =
	"Portfolio of Dhruv Singhal — Product Manager & Builder. Aviation product management, AI diagnostics, churn prediction, and operational analytics.";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
export const SITE_HOST = new URL(SITE_URL).host;
export const WWW_SITE_HOST = SITE_HOST.startsWith("www.")
	? SITE_HOST
	: `www.${SITE_HOST}`;
export const PERSON_TITLE = "Product Manager & Builder";
export const CONTACT_EMAIL = "dhruvsinghal6888@gmail.com";
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
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