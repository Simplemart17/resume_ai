'use client';

import { FiUser } from 'react-icons/fi';
import type { PersonalInfo } from '@/types/resume';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onFieldChange: (field: keyof PersonalInfo, value: string) => void;
}

export function PersonalInfoForm({ personalInfo, onFieldChange }: PersonalInfoFormProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FiUser className="w-5 h-5" />
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="personal-full-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="personal-full-name"
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => onFieldChange('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="personal-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="personal-email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="personal-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            id="personal-phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="personal-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            id="personal-location"
            type="text"
            value={personalInfo.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New York, NY"
          />
        </div>
      </div>
    </div>
  );
}
