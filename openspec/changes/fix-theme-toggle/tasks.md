## 1. Tailwind Config + CSS Variable Mapping

- [x] 1.1 Update `tailwind.config.js`: thêm custom color tokens (`theme-primary`, `theme-secondary`, `theme-surface`, `theme-text`, `theme-text-secondary`, `theme-muted`, `theme-border`, `theme-border-light`) map sang CSS vars
- [x] 1.2 Commit: `feat: fix theme toggle - move to top-right, migrate components to CSS variables`

## 2. Move Theme Toggle Button

- [x] 2.1 Bỏ nút Sun/Moon từ `Sidebar.tsx` bottom bar (giữ lại "Cài đặt" + Flag)
- [x] 2.2 Thêm floating theme toggle button vào `InterviewLayout.tsx` ở `absolute top-4 right-4` (Sun/Moon icon, sử dụng `useTheme`)
- [x] 2.3 Commit: (combined with 1.2)

## 3. Migrate Component Colors

- [x] 3.1 `Sidebar.tsx`: thay `bg-slate-900` → `bg-theme-primary`, `border-slate-800` → `border-theme-border`, `text-slate-300` → `text-theme-text-secondary`, `bg-slate-800` → `bg-theme-surface`, etc.
- [x] 3.2 `InterviewLayout.tsx`: thay gradient background + hardcoded colors sang CSS vars
- [x] 3.3 `ChatBox.tsx`: thay hardcoded dark colors sang CSS vars
- [x] 3.4 Verify light mode render đúng: nền sáng, text tối, borders nhạt ✅
- [x] 3.5 Commit: (combined with 1.2)
