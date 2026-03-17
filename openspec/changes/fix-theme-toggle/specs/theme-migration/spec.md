# Theme Migration

## Overview
Migrate interview page components from hardcoded Tailwind dark-mode classes to CSS variable-based theming.

## Requirements

- All hardcoded `bg-slate-*`, `text-slate-*`, `border-slate-*` colors in Sidebar, InterviewLayout, and ChatBox MUST be replaced with CSS variable equivalents
- Theme toggle button MUST appear at top-right corner of the main content area (InterviewLayout)
- Theme toggle MUST NOT appear in the Sidebar bottom bar
- Switching between dark/light themes via the toggle MUST visibly change the page colors
- Body background, text, borders, and surface colors MUST respond to `data-theme` attribute on `<html>`
- `tailwind.config.ts` MUST include custom color tokens mapped to CSS variables
