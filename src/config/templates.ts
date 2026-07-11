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
    description: 'Clean, contemporary design with accent colors perfect for tech and business roles',
    color: 'from-blue-500 to-purple-600',
    features: ['Clean Layout', 'Modern Typography', 'Accent Colors', 'ATS-Friendly'],
  },
  {
    id: 'classic-traditional',
    name: 'Classic Traditional',
    description: 'Traditional black and white format ideal for conservative industries',
    color: 'from-gray-600 to-gray-800',
    features: ['Traditional Format', 'Conservative Style', 'Black & White', 'Professional'],
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Bold, colorful design great for creative professionals and designers',
    color: 'from-pink-500 to-orange-500',
    features: ['Bold Design', 'Creative Layout', 'Color Accents', 'Visual Appeal'],
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Sophisticated layout perfect for senior-level positions and executives',
    color: 'from-indigo-600 to-blue-700',
    features: ['Executive Style', 'Sophisticated', 'Premium Look', 'Leadership Focus'],
  },
];
