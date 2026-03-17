## Why

Theme toggle (dark/light) đã được thêm nhưng khi chuyển sang light mode, trang web không đổi màu vì tất cả các component sử dụng hardcoded Tailwind classes (`bg-slate-900`, `text-slate-300`, v.v.) thay vì CSS variables (`var(--bg-primary)`). Ngoài ra, nút toggle hiện nằm ở góc dưới bên trái sidebar — cần chuyển lên góc trên bên phải của main content cho dễ tiếp cận hơn.

## What Changes

- Migrate các component chính (Sidebar, InterviewLayout, ChatBox) từ hardcoded Tailwind colors sang CSS variables
- Di chuyển nút theme toggle từ sidebar bottom bar lên góc trên bên phải của main content area
- Đảm bảo light mode render đúng: background sáng, text tối, border nhạt

## Capabilities

### New Capabilities
- `theme-migration`: Migrate hardcoded Tailwind dark-mode colors to CSS variable-based theming across key interview page components

### Modified Capabilities
_(none)_

## Impact

- `components/Interview/Sidebar.tsx`: remove theme toggle from bottom bar, replace hardcoded colors with CSS vars
- `components/Interview/InterviewLayout.tsx`: add floating theme toggle button (top-right), replace hardcoded colors with CSS vars
- `components/Interview/ChatBox.tsx`: replace hardcoded colors with CSS vars
- `components/css/globals.css`: add Tailwind utility classes mapped to CSS variables
