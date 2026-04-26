/**
 * Minimal SVG icon library — no emojis, no dependencies.
 * All icons are 16×16 viewBox, stroke-based.
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const base = (size: number, color: string): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: color,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconDoc = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2Z" />
    <path d="M9 2v4h4" />
    <path d="M5 9h6M5 11.5h4" />
  </svg>
);

export const IconBriefcase = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <rect x="2" y="6" width="12" height="8" rx="1.5" />
    <path d="M5.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6" />
    <path d="M2 10h12" />
  </svg>
);

export const IconLayers = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M8 2 L14 5 L8 8 L2 5 Z" />
    <path d="M2 8l6 3 6-3" />
    <path d="M2 11l6 3 6-3" />
  </svg>
);

export const IconShield = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M8 2L3 4.5V8c0 3 2.5 4.5 5 5.5 2.5-1 5-2.5 5-5.5V4.5L8 2Z" />
  </svg>
);

export const IconCode = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M5 4L1 8l4 4" />
    <path d="M11 4l4 4-4 4" />
    <path d="M9 2.5l-2 11" />
  </svg>
);

export const IconChart = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M2 12V7l3-2 3 3 3-4 3 2v6H2Z" />
    <path d="M2 12h12" />
  </svg>
);

export const IconArrowLeft = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M10 12L6 8l4-4" />
  </svg>
);

export const IconArrowUp = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M8 12V4" />
    <path d="M4 8l4-4 4 4" />
  </svg>
);

export const IconMenu = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M2 4h12M2 8h12M2 12h12" />
  </svg>
);

export const IconX = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

export const IconChevronDown = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M4 6l4 4 4-4" />
  </svg>
);

export const IconChevronUp = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M4 10l4-4 4 4" />
  </svg>
);

export const IconSparkle = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
    <path d="M4.22 4.22l1.42 1.42M10.36 10.36l1.42 1.42M4.22 11.78l1.42-1.42M10.36 5.64l1.42-1.42" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

export const IconGrid = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M8 3h5v5H8zM3 3h5M3 3v5h5" />
    <path d="M8 8h5v5H8zM3 8h5v5H3z" />
  </svg>
);

export const IconArch = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg {...base(size, color)} style={style}>
    <path d="M2 12c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M5 12V9.5" />
    <path d="M11 12V9.5" />
    <path d="M2 12h12" />
  </svg>
);
