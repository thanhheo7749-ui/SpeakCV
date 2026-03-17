## Why

SpeakCV cần 3 cải tiến quan trọng: (1) bảo mật — secrets đang hardcode trong source code, (2) dashboard cá nhân — giúp user thấy tiến bộ và giữ chân họ, (3) ngân hàng câu hỏi theo công ty — tạo giá trị unique mà ChatGPT không có, tạo network effect.

## What Changes

- **Security**: Chuyển SECRET_KEY, VNPAY credentials từ hardcode sang `.env`. Thêm `.env.example` cho nhà phát triển mới. Thêm `.gitignore` để bảo vệ secrets.
- **Personal Dashboard**: Tạo API endpoint `/api/my-stats` tổng hợp dữ liệu từ `interview_history`. Tạo trang `/dashboard` trên frontend với biểu đồ điểm, phân tích điểm mạnh/yếu.
- **Company Question Bank**: Tạo bảng `company_questions` trong database. Tạo API CRUD + trang frontend `/questions` để xem/submit câu hỏi phỏng vấn theo công ty thực tế.

## Capabilities

### New Capabilities
- `security-hardening`: Di chuyển tất cả hardcoded secrets sang environment variables, thêm `.env.example` và `.gitignore`
- `personal-dashboard`: Trang thống kê cá nhân với biểu đồ điểm theo thời gian, phân tích điểm mạnh/yếu từ lịch sử phỏng vấn
- `company-question-bank`: Hệ thống crowdsource câu hỏi phỏng vấn theo công ty thực tế, cho phép user submit và luyện tập theo công ty

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Backend**: `security.py`, `payment.py`, `config.py` — refactor secrets. Thêm 2 file router mới (`stats.py`, `questions.py`). Thêm 1 SQL model (`CompanyQuestion`). Thêm `.env`, `.env.example`, `.gitignore`.
- **Frontend**: Thêm 2 page mới (`/dashboard`, `/questions`). Thêm navigation links. Thêm chart library (`recharts`).
- **Database**: Thêm bảng `company_questions` (tự migrate via SQLAlchemy `create_all`).
- **Git**: 3 commits riêng biệt theo thứ tự ưu tiên.
