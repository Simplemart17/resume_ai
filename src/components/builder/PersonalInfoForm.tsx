'use client';

import type { PersonalInfo } from '@/types/resume';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onFieldChange: (field: keyof PersonalInfo, value: string) => void;
}

export function PersonalInfoForm({ personalInfo, onFieldChange }: PersonalInfoFormProps) {
  return (
    <div className="mb-8">
      <h3 className="eyebrow eyebrow-rule mb-4">
        <span>Personal information</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="personal-full-name" className="eyebrow block mb-1.5">Full name</label>
          <input
            id="personal-full-name"
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => onFieldChange('fullName', e.target.value)}
            className="input-flat px-3.5 py-2.5 text-sm w-full"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="personal-email" className="eyebrow block mb-1.5">Email</label>
          <input
            id="personal-email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            className="input-flat px-3.5 py-2.5 text-sm w-full"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="personal-phone" className="eyebrow block mb-1.5">Phone</label>
          <input
            id="personal-phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className="input-flat px-3.5 py-2.5 text-sm w-full"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="personal-location" className="eyebrow block mb-1.5">Location</label>
          <input
            id="personal-location"
            type="text"
            value={personalInfo.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            className="input-flat px-3.5 py-2.5 text-sm w-full"
            placeholder="New York, NY"
          />
        </div>
        <div>
          <label htmlFor="personal-website" className="eyebrow block mb-1.5">Website</label>
          <input
            id="personal-website"
            type="url"
            value={personalInfo.website}
            onChange={(e) => onFieldChange('website', e.target.value)}
            className="input-flat px-3.5 py-2.5 text-sm w-full"
            placeholder="portfolio.dev"
          />
        </div>
        <div>
          <label htmlFor="personal-linkedin" className="eyebrow block mb-1.5">LinkedIn</label>
          <input
            id="personal-linkedin"
            type="text"
            value={personalInfo.linkedin}
            onChange={(e) => onFieldChange('linkedin', e.target.value)}
            className="input-flat px-3.5 py-2.5 text-sm w-full"
            placeholder="linkedin.com/in/you"
          />
        </div>
      </div>
    </div>
  );
}
