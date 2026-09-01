import styles from "./MdxContent.module.css";
import { compileCaseStudyMdx } from "@/lib/mdx";
import { mdxComponents } from "./blocks";
import { LightboxProvider } from "./blocks/Lightbox";
import { LegacyHtmlContent } from "./LegacyHtmlContent";

type MdxContentProps =
  | {
      /** Raw MDX body (frontmatter already stripped by src/lib/content.ts). */
      source: string;
      /** Case-study slug; used for error messages and a data hook on the wrapper. */
      slug: string;
      html?: undefined;
    }
  | {
      /** Pre-rendered HTML from src/lib/markdown.ts. Blog posts still use this path. */
      html: string;
      source?: undefined;
      slug?: undefined;
    };

/**
 * Case-study body. Async server component: compiles the MDX with the block
 * grammar in ./blocks and wraps the result in the lightbox provider so any
 * <Figure>/<Shot>/<Compare> image can open full-size.
 */
export async function MdxContent(props: MdxContentProps) {
  if (props.html !== undefined) {
    return <LegacyHtmlContent html={props.html} />;
  }

  const { source, slug } = props;
  let content: React.ReactElement;
  try {
    content = await compileCaseStudyMdx(source, mdxComponents);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to compile case study "${slug}": ${message}`);
  }

  return (
    <LightboxProvider>
      <div className={styles.prose} data-case-study={slug}>
        {content}
      </div>
    </LightboxProvider>
  );
}
