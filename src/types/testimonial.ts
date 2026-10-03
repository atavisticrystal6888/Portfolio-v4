export interface TestimonialMetric {
  value: string;
  label: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  quote: string;
  avatar: string | null;
  projectSlug: string | null;
  /** Not rendered: a metric beside a quote reads as the referee's claim. */
  outcomeMetric?: TestimonialMetric;
  relationship: string;
}
