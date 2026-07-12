import { useId } from 'react';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * The mark: a résumé on a pen tile, with the one line the machine matched
 * swept in `mark` gold — the "written for people, read by machines" thesis in
 * a glyph. The pen→pen-deep tile is the single sanctioned gradient; no sparkle.
 */
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
          <stop offset="0" stopColor="#3A32A8" />
          <stop offset="1" stopColor="#4B41D6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
      {/* the document */}
      <rect x="14" y="17" width="23" height="6" rx="3" fill="#FFFFFF" />
      <rect x="14" y="29" width="36" height="4.5" rx="2.25" fill="#FFFFFF" opacity="0.82" />
      {/* the matched line — the machine's highlighter */}
      <rect x="14" y="38.5" width="27" height="5.5" rx="2" fill="#F7E463" />
      <rect x="14" y="49" width="18" height="4.5" rx="2.25" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

export default function Logo({ size = 36, withWordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-[22px] font-bold tracking-tight text-ink">
          ResumeAI<span className="text-pen"> Pro</span>
        </span>
      )}
    </span>
  );
}
