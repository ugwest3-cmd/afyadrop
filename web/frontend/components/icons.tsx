// Simple, consistent line icons for the "What Afya Drop helps you do" grid.
// Single-color strokes so they render crisply at any size, unlike emoji.
import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      {...props}
    />
  );
}

export function StethoscopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M6 3v6a4 4 0 0 0 8 0V3" />
      <path d="M10 15v2a5 5 0 0 0 10 0v-2.5" />
      <circle cx="20" cy="10.5" r="1.75" />
      <path d="M6 9a2 2 0 1 0 0-4" />
    </Base>
  );
}

export function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8.5 11h7M8.5 15h7M8.5 19h4" />
    </Base>
  );
}

export function PillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3.5" y="9.5" width="17" height="8" rx="4" transform="rotate(-45 12 13.5)" />
      <path d="M9.5 10.5 14.5 15.5" />
    </Base>
  );
}

export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 3 2 21h20L12 3z" />
      <path d="M12 10v4" />
      <path d="M12 17.5h.01" />
    </Base>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.35-4.35" />
    </Base>
  );
}

export function SirenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M7 18v-4a5 5 0 0 1 10 0v4" />
      <path d="M5 18h14" />
      <path d="M5 21h14" />
      <path d="M12 4v2" />
      <path d="m8.5 5.5.7 1.7" />
      <path d="m15.5 5.5-.7 1.7" />
    </Base>
  );
}

// Multi-color "G" mark used on Google sign-in buttons — kept as a flat
// SVG (not stroke-based like the icons above) to match Google's brand mark.
export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.42-.22-2.05H12v3.87h6.44c-.13 1.03-.83 2.6-2.4 3.65l-.02.14 3.48 2.62.24.02c2.21-2.02 3.75-5 3.75-8.25z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.05 7.93-2.87l-3.78-2.9c-1.01.7-2.37 1.19-4.15 1.19-3.18 0-5.88-2.09-6.84-4.98l-.14.01-3.62 2.72-.05.13C3.36 21.3 7.35 24 12 24z" />
      <path fill="#FBBC05" d="M5.16 14.44a7.4 7.4 0 0 1-.4-2.44c0-.85.15-1.67.39-2.44l-.01-.16-3.66-2.76-.12.06A12 12 0 0 0 0 12c0 1.93.47 3.76 1.36 5.3z" />
      <path fill="#EA4335" d="M12 4.75c2.26 0 3.78.93 4.65 1.71l3.4-3.24C17.94 1.19 15.24 0 12 0 7.35 0 3.36 2.7 1.36 6.7l3.79 2.86c.97-2.89 3.67-4.81 6.85-4.81z" />
    </svg>
  );
}
