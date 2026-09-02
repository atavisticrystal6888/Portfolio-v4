import type { MDXComponents } from "mdx/types";
import { Figure } from "./Figure";
import { Gallery, Shot } from "./Gallery";
import { Compare } from "./Compare";
import { Quote } from "./Quote";
import { Options, Option } from "./Options";
import { Timeline, Milestone } from "./Timeline";
import { UnderTheHood } from "./UnderTheHood";
import { Decision } from "./Decision";
import { Artifact } from "./Artifact";
import { Artifacts, ArtifactLink } from "./Artifacts";
import { MdxLink, MdxPre, MdxImg } from "./primitives";

export {
  Figure,
  Gallery,
  Shot,
  Compare,
  Quote,
  Options,
  Option,
  Timeline,
  Milestone,
  UnderTheHood,
  Decision,
  Artifact,
  Artifacts,
  ArtifactLink,
};

/**
 * Everything a case study can author. Capitalised names are the block grammar;
 * lower-case keys override the markdown primitives MDX emits.
 */
export const mdxComponents: MDXComponents = {
  Figure,
  Gallery,
  Shot,
  Compare,
  Quote,
  Options,
  Option,
  Timeline,
  Milestone,
  UnderTheHood,
  Decision,
  Artifact,
  Artifacts,
  ArtifactLink,
  a: MdxLink,
  pre: MdxPre,
  img: MdxImg,
};
