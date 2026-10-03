import Image from "next/image";
import Link from "next/link";
import dhruvImage from "@/assets/Dhruv_Image.jpg";
import { GITHUB_URL, LINKEDIN_URL, SITE_NAME } from "@/lib/site";
import styles from "./AuthorBio.module.css";

export const BIO_TEXT =
  "Dhruv Singhal has about a year of product experience across internships, most recently as a product intern on the growth team at The Sleep Company (Jul–Oct 2026). He builds small, tested products and writes about AI evaluation, retention analytics and product judgment.";

/**
 * Short, factual author note at the foot of every article. It claims no more
 * than the About page supports; the Article JSON-LD author points at the same
 * person (/about plus these two profiles).
 */
export function AuthorBio() {
  return (
    <section className={styles.bio} aria-labelledby="author-bio-heading" data-testid="author-bio">
      <h2 id="author-bio-heading" className={styles.label}>
        About the author
      </h2>
      <div className={styles.row}>
        {/* Same optimised portrait as the navbar and /about; decorative here
            because the name sits right beside it. */}
        <Image src={dhruvImage} alt="" className={styles.avatar} sizes="56px" />
        <div>
          <p className={styles.name}>{SITE_NAME}</p>
          <p className={styles.text}>
            {/* Dated, past-safe wording: the internship ends 9 Oct 2026. */}
            {BIO_TEXT}
          </p>
          <ul className={styles.links} aria-label="Author profiles">
            <li>
              <Link href="/about" className={styles.link}>
                About Dhruv
              </Link>
            </li>
            <li>
              <a href={LINKEDIN_URL} className={styles.link} rel="me noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={GITHUB_URL} className={styles.link} rel="me noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
