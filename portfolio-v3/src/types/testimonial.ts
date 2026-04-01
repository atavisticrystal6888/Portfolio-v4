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
  projectSlug: string;
  outcomeMetric: TestimonialMetric;
  relationship: string;
}
