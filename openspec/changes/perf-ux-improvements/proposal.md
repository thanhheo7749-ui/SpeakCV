## Why

SpeakCV hiện có nhiều vấn đề kỹ thuật và UX ảnh hưởng đến chất lượng phần mềm: API service thiếu error handling nhất quán, token JWT lưu trong localStorage dễ bị XSS, file `interview/page.tsx` (639 dòng) quá lớn khó maintain, sidebar actions chưa có optimistic UI, và thiếu hoàn toàn các tính năng accessibility, keyboard shortcuts, dark/light mode toggle. Cần cải thiện ngay để nâng cao trải nghiệm người dùng và bảo mật.

## What Changes

- **API Error Handling**: Tạo wrapper `apiRequest()` trong `api.ts` để xử lý lỗi nhất quán cho tất cả API calls, đặc biệt `endInterview`, `getHint`, `transcribeAudio`, `getHistory`, `upgradeToPro`, `generateCV` hiện không check `res.ok`
- **Token Management**: Chuyển từ `localStorage` sang `sessionStorage` cho JWT token, giảm rủi ro XSS (httpOnly cookies cần thay đổi backend lớn, nên dùng sessionStorage như bước trung gian)
- **Code Splitting**: Tách `interview/page.tsx` thành `useInterviewActions.ts` (business logic), `InterviewLayout.tsx` (render), giữ `page.tsx` chỉ làm orchestrator
- **Optimistic UI**: Áp dụng optimistic update cho sidebar rename/delete, rollback khi API fail
- **Mobile UX**: Thêm swipe gesture đóng hint modal, auto scroll-into-view cho chat box khi keyboard mở
- **Keyboard Shortcuts**: Thêm hotkeys (Space = toggle mic, Enter = gửi, Ctrl+N = phỏng vấn mới, Ctrl+R = mở báo cáo, Ctrl+, = cài đặt, Esc = đóng modal)
- **Dark/Light Mode**: Thêm theme toggle với CSS variables, lưu preference vào localStorage
- **Accessibility**: Thêm `aria-label`, `role="dialog"`, focus trap cho modals, alt text cho avatars

## Capabilities

### New Capabilities
- `api-error-handling`: Wrapper hàm chung cho tất cả API calls với error handling nhất quán
- `session-token-storage`: Chuyển token storage từ localStorage sang sessionStorage
- `interview-code-split`: Tách interview page thành custom hook + layout component
- `optimistic-sidebar`: Optimistic UI pattern cho sidebar rename/delete actions
- `mobile-ux-enhance`: Swipe gesture & scroll-into-view cho mobile experience
- `keyboard-shortcuts`: Global hotkeys cho power users
- `theme-toggle`: Dark/Light mode toggle với CSS variables
- `accessibility-a11y`: Aria labels, dialog roles, focus trap, alt text

### Modified Capabilities
_(Không có specs hiện tại nên không có modified capabilities)_

## Impact

- **Frontend `services/api.ts`**: Thêm `apiRequest` wrapper, refactor 6+ hàm API
- **Frontend `context/AuthContext.tsx`**: Đổi từ `localStorage` sang `sessionStorage`
- **Frontend `app/interview/page.tsx`**: Tách thành 3 files
- **Frontend `components/Interview/Sidebar.tsx`**: Optimistic UI pattern
- **Frontend `components/Interview/ChatBox.tsx`**: Scroll-into-view
- **Frontend CSS (`globals.css`)**: CSS variables cho light/dark theme
- **Frontend `app/layout.tsx`**: ThemeProvider wrapper
- **Tất cả modal components**: Thêm `role`, `aria-label`, focus trap
- **Tất cả icon buttons**: Thêm `aria-label`
