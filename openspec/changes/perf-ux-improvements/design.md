## Context

SpeakCV là ứng dụng phỏng vấn AI, frontend Next.js + backend FastAPI. Hiện tại có các vấn đề:
- `api.ts` (468 dòng): 6+ hàm API không check `res.ok` → silent failures
- `AuthContext.tsx`: JWT token lưu `localStorage` → XSS risk
- `interview/page.tsx` (639 dòng): Monolithic, chứa cả logic + UI
- `Sidebar.tsx`: Rename/Delete gọi API rồi mới update UI
- Chỉ có dark mode, không có keyboard shortcuts, thiếu a11y

## Goals / Non-Goals

**Goals:**
- Error handling nhất quán cho tất cả API calls
- Giảm XSS risk bằng cách dùng sessionStorage
- Tách interview page thành các module dễ maintain
- UX mượt hơn với optimistic UI, keyboard shortcuts
- Hỗ trợ light mode và accessibility cơ bản

**Non-Goals:**
- Không implement httpOnly cookies (cần thay đổi backend auth flow lớn)
- Không rewrite toàn bộ API layer sang React Query/SWR
- Không implement full WCAG 2.1 AA compliance
- Không thay đổi backend API endpoints

## Decisions

### 1. API Error Handling: Wrapper function vs Interceptor

**Quyết định**: Dùng wrapper function `apiRequest(url, options)`

**Lý do**: Project không dùng axios nên không có interceptor. Wrapper function đơn giản, dễ hiểu, không cần thêm dependency. Mỗi API function gọi `apiRequest()` thay vì `fetch()` trực tiếp.

**Thay thế xem xét**: Tạo custom fetch wrapper class → quá phức tạp cho project này.

### 2. Token Storage: sessionStorage vs httpOnly cookies

**Quyết định**: Dùng `sessionStorage` thay `localStorage`

**Lý do**: httpOnly cookies cần backend thay đổi (set-cookie header, CORS, CSRF token), quá lớn scope. sessionStorage tự clear khi đóng tab, giảm persistence window cho XSS attack. Cần update cả `AuthContext`, `api.ts` (`getAuthHeaders`, các hàm lấy token trực tiếp).

### 3. Interview Page Split Strategy

**Quyết định**: Tạo 2 files mới:
- `hooks/useInterviewActions.ts`: chứa `handleSend`, `handleOpenReport`, `handleRetry`, `handleNewChat`, `handleLoadOldInterview`, `handleConfirmResume`, `startTimedInterview`, `handleInterrupt`, `onMicClick`
- `components/Interview/InterviewLayout.tsx`: chứa JSX return (main content area, không bao gồm modals)

`page.tsx` giữ vai trò orchestrator: import hooks, render `InterviewLayout` + modals.

### 4. Optimistic UI Pattern

**Quyết định**: Update local state trước, gọi API background, rollback bằng `try/catch` với toast error.

Pattern:
```
const previousState = [...currentState];
setCurrentState(optimisticState);
try { await apiCall(); } 
catch { setCurrentState(previousState); toast.error(...); }
```

### 5. Theme System: CSS Variables

**Quyết định**: Dùng CSS custom properties (`--bg-primary`, `--text-primary`, etc.) + `data-theme` attribute trên `<html>`. ThemeContext lưu preference vào localStorage (riêng biệt với auth token).

**Lý do**: CSS variables cho phép switch theme mà không cần re-render React components. TailwindCSS `dark:` class cần thêm config phức tạp.

### 6. Keyboard Shortcuts: Global event listener

**Quyết định**: Custom hook `useKeyboardShortcuts` trong `interview/page.tsx`, dùng `useEffect` + `keydown` event. Disabled khi đang ở input/textarea hoặc modal open.

## Risks / Trade-offs

- **sessionStorage breaks "Remember me"** → Users cần login lại mỗi session. Nên thêm note rõ ràng trên UI login page.
- **Interview page refactor có thể gây regression** → Giữ behavior giống 100%, chỉ tách file. Test kỹ sau khi tách.
- **Theme toggle chỉ CSS** → Components dùng Tailwind hardcoded colors (e.g., `bg-slate-950`) sẽ không tự chuyển. Cần audit và thay bằng CSS variables. Scope lớn, commit riêng.
- **Focus trap cần thêm 1 utility** → Có thể dùng package `focus-trap-react` hoặc tự viết. Tự viết để không thêm dependency.
