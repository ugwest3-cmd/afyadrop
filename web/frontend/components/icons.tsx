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
