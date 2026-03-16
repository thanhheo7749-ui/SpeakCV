## Context

SpeakCV là nền tảng phỏng vấn AI với Next.js + Tailwind CSS frontend. Hiện tại app đã có:
- Landing page hoàn chỉnh (Hero, Features, Testimonials, Pricing, CTA, Footer)
- Interview room với mic, chat, timer, hints
- Sidebar với tools và lịch sử phỏng vấn
- Support Chat Widget (WebSocket)
- CV Builder & Makeover

Thay đổi lần này hoàn toàn ở frontend, không ảnh hưởng backend API.

## Goals / Non-Goals

**Goals:**
- Fix bug UX ngay lập tức (input chat nền xanh)
- Tăng tính chuyên nghiệp (Google Font, SEO metadata)
- Tăng tỷ lệ chuyển đổi (How It Works section)
- Cải thiện trải nghiệm sidebar (nhóm lịch sử theo ngày)
- Tăng cảm giác mượt mà (micro-animations)

**Non-Goals:**
- Không thay đổi backend API
- Không thêm tính năng mới phức tạp (Dashboard, Flashcards, Charts...)
- Không thay đổi logic authentication hay subscription
- Không refactor code structure
- Không thêm light mode

## Decisions

### 1. Google Font: Be Vietnam Pro
**Quyết định**: Dùng Be Vietnam Pro thay vì Inter hoặc Roboto.
**Lý do**: Be Vietnam Pro được tối ưu cho tiếng Việt (dấu, tonemark), modern sans-serif, có nhiều weight (400-900). Phù hợp nhất cho app Việt ngữ.
**Phương án khác**: Inter (tốt nhưng thiếu tối ưu tiếng Việt), Roboto (quá phổ biến).

### 2. How It Works: 3-step horizontal layout
**Quyết định**: Layout 3 cột ngang (responsive → stack trên mobile) với icon + tiêu đề + mô tả + đường kết nối giữa các bước.
**Lý do**: Pattern phổ biến nhất trên SaaS landing pages, dễ scan, truyền đạt rõ ràng value proposition.
**Vị trí**: Đặt giữa Hero và Features section (trước `#features`).

### 3. Sidebar History Grouping: Client-side grouping
**Quyết định**: Nhóm lịch sử phỏng vấn ở client-side bằng cách parse `created_at` thành category (Hôm nay / Hôm qua / Tuần trước / Cũ hơn).
**Lý do**: Không cần thay đổi backend API, data `created_at` đã có sẵn. Volume lịch sử thường nhỏ nên không ảnh hưởng performance.
**Phương án khác**: Server-side grouping (overkill cho use case này).

### 4. Animations: CSS @keyframes + Tailwind utilities
**Quyết định**: Dùng CSS `@keyframes` trong `globals.css` + class utilities cho slide-in. Không dùng thư viện animation bên ngoài.
**Lý do**: Keep bundle size nhỏ, Tailwind đã hỗ trợ `animate-in`. Chỉ cần thêm vài keyframe custom.

## Risks / Trade-offs

- **[Risk] Google Font loading**: Có thể gây FOUT (Flash of Unstyled Text) → **Mitigation**: Dùng `next/font/google` với `display: swap` để preload, có fallback `system-ui`.
- **[Risk] SEO metadata thay đổi**: Có thể tạm thời ảnh hưởng Google index → **Mitigation**: Thay đổi metadata là cải thiện, không phải phá vỡ. Google sẽ re-index tự nhiên.
- **[Risk] Sidebar grouping logic phức tạp trên timezone**: `created_at` từ backend có thể là UTC → **Mitigation**: Dùng `new Date()` để parse, tự động convert sang local timezone.
