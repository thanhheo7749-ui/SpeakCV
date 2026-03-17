## 1. API Error Handling

- [x] 1.1 Tạo hàm wrapper `apiRequest(url, options)` trong `services/api.ts` với error handling nhất quán (check `res.ok`, parse error JSON, throw standardized Error)
- [x] 1.2 Refactor `endInterview()` để dùng `apiRequest` thay vì `fetch` trực tiếp
- [x] 1.3 Refactor `getHint()` để dùng `apiRequest`
- [x] 1.4 Refactor `transcribeAudio()` để dùng `apiRequest`
- [x] 1.5 Refactor `getHistory()` để dùng `apiRequest`
- [x] 1.6 Refactor `upgradeToPro()` để dùng `apiRequest`
- [x] 1.7 Refactor `generateCV()` để dùng `apiRequest`
- [x] 1.8 Commit: `fix: add consistent API error handling wrapper`

## 2. Token Management - sessionStorage

- [x] 2.1 Update `AuthContext.tsx`: thay `localStorage` bằng `sessionStorage` cho token, userName, userRole
- [x] 2.2 Update `services/api.ts`: thay tất cả `localStorage.getItem("token")` bằng `sessionStorage.getItem("token")`
- [x] 2.3 Update `getAuthHeaders()` để dùng `sessionStorage`
- [x] 2.4 Giữ `localStorage` cho non-sensitive data (guest_msg_count, theme preference)
- [x] 2.5 Commit: `security: migrate JWT token storage to sessionStorage`

## 3. Interview Page Code Splitting

- [x] 3.1 Tạo `hooks/useInterviewActions.ts` - extract `handleSend`, `handleOpenReport`, `handleRetry`, `handleNewChat`, `handleLoadOldInterview`, `handleConfirmResume`, `startTimedInterview`, `handleInterrupt`, `onMicClick`
- [x] 3.2 Tạo `components/Interview/InterviewLayout.tsx` - extract main content JSX (header, mic button, hint popup, chatbox, timer)
- [x] 3.3 Refactor `app/interview/page.tsx` thành orchestrator: import hooks + render layout + modals
- [x] 3.4 Verify behavior giống 100% sau khi tách
- [x] 3.5 Commit: `refactor: split interview page into hook, layout, and orchestrator`

## 4. Optimistic UI cho Sidebar

- [x] 4.1 Refactor `handleRename` trong `Sidebar.tsx`: update UI trước, gọi API background, rollback nếu fail
- [x] 4.2 Refactor `handleDelete` trong `Sidebar.tsx`: remove item trước, gọi API background, re-insert nếu fail
- [x] 4.3 Commit: `feat: add optimistic UI for sidebar rename/delete`

## 5. Mobile UX Enhancements

- [x] 5.1 Thêm swipe-down gesture cho mobile hint modal (touch events: touchstart, touchmove, touchend)
- [x] 5.2 Thêm `scrollIntoView` cho ChatBox textarea khi focus trên mobile
- [x] 5.3 Commit: `feat: improve mobile UX with swipe gesture and scroll-into-view`

## 6. Keyboard Shortcuts

- [x] 6.1 Tạo custom hook `useKeyboardShortcuts` trong `hooks/useKeyboardShortcuts.ts`
- [x] 6.2 Implement shortcuts: Space (mic), Ctrl+N (new), Ctrl+R (report), Ctrl+, (settings), Esc (close modal)
- [x] 6.3 Thêm guard: disable shortcuts khi focus ở input/textarea
- [x] 6.4 Integrate hook vào `interview/page.tsx`
- [x] 6.5 Commit: `feat: add keyboard shortcuts for power users`

## 7. Dark/Light Mode Toggle

- [x] 7.1 Định nghĩa CSS variables cho dark/light themes trong `globals.css` (--bg-primary, --bg-secondary, --text-primary, --text-secondary, --border, etc.)
- [x] 7.2 Tạo `context/ThemeContext.tsx` với toggle function và localStorage persistence
- [x] 7.3 Thêm theme toggle button (sun/moon icon) vào Sidebar settings area
- [x] 7.4 Update `app/layout.tsx` để wrap ThemeProvider và set `data-theme` attribute trên html
- [x] 7.5 Migrate key components (Sidebar, ChatBox, InterviewLayout) từ hardcoded Tailwind colors sang CSS variables
- [x] 7.6 Commit: `feat: add dark/light mode theme toggle`

## 8. Accessibility (a11y)

- [x] 8.1 Thêm `aria-label` cho tất cả icon-only buttons: mic, hint, flag, eraser, refresh, menu, close, settings, plus...
- [x] 8.2 Thêm `role="dialog"` và `aria-modal="true"` cho tất cả modal components (Settings, Report, GenCV, ReviewCV, ResumConfig, Subscription, Checkout, CVMakeover)
- [x] 8.3 Implement focus trap utility function cho modals
- [x] 8.4 Thêm `alt` text có nghĩa cho avatar images (dùng userName)
- [x] 8.5 Commit: `feat: improve accessibility with aria labels, dialog roles, and focus trap`
