## Context

Theme toggle (Sun/Moon) đã được thêm ở sidebar bottom bar cùng ThemeContext + CSS variables. Tuy nhiên, light mode không hoạt động vì tất cả các component dùng hardcoded Tailwind classes (`bg-slate-900`, `text-slate-300`, etc.) thay vì CSS variables.

## Goals / Non-Goals

**Goals:**
- Migrate Sidebar, InterviewLayout, ChatBox từ hardcoded Tailwind dark colors sang CSS variables
- Di chuyển nút theme toggle từ sidebar bottom bar sang floating button ở góc trên bên phải main content
- Light mode phải render đúng: nền trắng/sáng, text tối, border nhạt

**Non-Goals:**
- Migrate tất cả pages/components khác (chỉ focus interview page trước)
- Redesign light mode hoàn toàn mới

## Decisions

1. **Approach**: Thêm Tailwind utility classes trong `tailwind.config.ts` để map CSS variables (e.g., `bg-theme-primary` → `var(--bg-primary)`). Thay thế hardcoded classes ở 3 components chính.
2. **Toggle position**: Floating button ở `absolute top-4 right-4` trong InterviewLayout.tsx, dùng `useTheme` hook.
3. **Sidebar bottom**: Bỏ nút Sun/Moon ở đó, chỉ giữ "Cài đặt" và nút Flag.

## Risks / Trade-offs

- Chỉ migrate 3 component → modals và pages khác vẫn là dark-only. Chấp nhận được vì user chủ yếu ở interview page.
- Thêm custom Tailwind colors tăng config nhưng là best practice cho theming.
