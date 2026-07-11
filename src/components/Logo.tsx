import { useId } from 'react';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="ResumeAI Pro logo"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
      <circle cx="19" cy="23" r="5.5" fill="#FFFFFF" />
      <rect x="28" y="20.5" width="12" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="13" y="35" width="38" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="13" y="45" width="27" height="5" rx="2.5" fill="#FFFFFF" opacity="0.55" />
      <path
        d="M47 11 Q47 17.5 53.5 17.5 Q47 17.5 47 24 Q47 17.5 40.5 17.5 Q47 17.5 47 11 Z"
        fill="#FDE047"
      />
    </svg>
  );
}

export default function Logo({ size = 36, withWordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ResumeAI Pro
        </span>
      )}
    </span>
  );
}
