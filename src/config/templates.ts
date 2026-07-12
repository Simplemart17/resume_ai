export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  features: string[];
}

/**
 * Single source of truth for resume template metadata.
 * Used by the landing page, the template picker, and anywhere else
 * template names/descriptions are shown.
 */
export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'A single column set in a sans-serif face with one accent rule — the safe default for tech and business roles.',
    color: 'pen',
    features: ['Single column', 'Sans-serif', 'One accent rule', 'ATS-safe'],
  },
  {
    id: 'classic-traditional',
    name: 'Classic Traditional',
    description: 'A ruled, centered header over a two-column body. Conservative black-and-white for traditional industries.',
    color: 'ink',
    features: ['Two column', 'Ruled header', 'Black & white', 'ATS-safe'],
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'A single column with an accent sidebar and ruled section headers — structure for portfolio and design roles.',
    color: 'pen',
    features: ['Accent sidebar', 'Ruled sections', 'Single column', 'ATS-safe'],
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Wide margins under a centered small-caps header. Roomy and senior, built for leadership positions.',
    color: 'ink',
    features: ['Wide margins', 'Centered header', 'Small caps', 'ATS-safe'],
  },
];
