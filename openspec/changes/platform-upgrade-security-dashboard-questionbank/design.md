## Context

SpeakCV là nền tảng phỏng vấn AI + CV tools. Hiện tại:
- Secrets (JWT SECRET_KEY, VNPAY credentials) đang hardcode trong source code
- Chưa có trang thống kê cá nhân — user không thấy tiến bộ qua thời gian
- Không có tính năng unique so với ChatGPT — cần tạo giá trị riêng biệt

Tech stack: FastAPI (Python), Next.js (React/TypeScript), SQLAlchemy + MySQL/PostgreSQL.

## Goals / Non-Goals

**Goals:**
- Chuyển tất cả hardcoded secrets sang `.env`
- Tạo trang Dashboard hiển thị biểu đồ điểm, phân tích AI từ dữ liệu `interview_history` có sẵn
- Tạo hệ thống ngân hàng câu hỏi theo công ty (crowdsourced)
- Mỗi feature commit riêng biệt

**Non-Goals:**
- Không implement AI Career Coach (giống ChatGPT, chưa cần thiết)
- Không thay đổi auth mechanism (vẫn dùng sessionStorage + JWT)
- Không migration database thủ công (SQLAlchemy `create_all` tự tạo table)

## Decisions

**1. Security: `.env` + `os.getenv()` với fallback**
- Dùng `python-dotenv` đã có sẵn trong project
- Giữ fallback values cho dev local, production PHẢI override qua env
- Lý do: Đơn giản, consistent với pattern hiện có trong `config.py`

**2. Dashboard: Recharts cho biểu đồ**
- Recharts nhẹ, React-native, phổ biến nhất
- Alternative: Chart.js (nặng hơn, cần wrapper)
- API endpoint trả về data đã aggregate — không xử lý nặng trên frontend

**3. Question Bank: Bảng `company_questions` đơn giản**
- Không cần voting system phức tạp ban đầu — chỉ cần submit + list + filter
- Admin approve trước khi hiển thị (tránh spam) — dùng trường `is_approved`
- Lý do: MVP trước, thêm features (upvote, comment) sau

**4. Frontend: Thêm page mới, không refactor existing**
- Dashboard: `/dashboard` — new page
- Questions: `/questions` — new page
- Navigation: Thêm link vào Sidebar hiện tại

## Risks / Trade-offs

- [Risk] Thay đổi SECRET_KEY sẽ invalidate tất cả JWT tokens hiện tại → Users phải login lại
  → Mitigation: Giữ cùng giá trị SECRET_KEY trong `.env`, chỉ thay đổi cách load
- [Risk] Recharts tăng bundle size
  → Mitigation: Dynamic import (`next/dynamic`) để lazy-load chart components
- [Risk] Question bank lúc đầu trống (cold start)
  → Mitigation: Seed 20-30 câu hỏi mẫu cho các công ty phổ biến (FPT, VNG, Shopee)
