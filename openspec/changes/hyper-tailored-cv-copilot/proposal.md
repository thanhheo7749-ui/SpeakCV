## Why

Ứng viên hiện tại có thể tạo CV đẹp qua CV Builder hoặc "makeover" CV cũ bằng AI, nhưng **chưa có cách nào tối ưu CV theo từng Job Description (JD) cụ thể**. Điều này khiến CV bị chung chung, dễ bị bộ lọc ATS của HR loại ngay từ vòng đầu. Tính năng "Hyper-Tailored CV Copilot" cho phép người dùng dán/nhập JD, rồi AI sẽ tái cấu trúc CV hiện tại — sắp xếp lại thứ tự ưu tiên, tinh chỉnh từ khóa — mà **tuyệt đối không bịa đặt** kinh nghiệm mới, giúp vượt ATS hiệu quả.

## What Changes

- **Frontend — Nút "Tối ưu theo JD"**: Thêm nút mới trong header của `GenCVModal` (CV Builder). Khi bấm, mở một Modal nhập JD (hỗ trợ dán text).
- **Frontend — TailorJDModal component**: Modal mới cho phép nhập nội dung JD dạng text, hiển thị preview diff trước/sau, trạng thái loading khi chờ AI, và nút xác nhận áp dụng kết quả.
- **Backend — API `/api/cv/tailor`**: Endpoint mới nhận `master_cv_json` (CV hiện tại dạng JSON) + `jd_text` (nội dung JD). Gọi AI với system prompt có guardrails chặt chẽ. Trả về JSON CV mới cùng `tailor_summary` (tóm tắt thay đổi).
- **Backend — AI System Prompt (Guardrails)**: Prompt riêng cho tính năng tailor với rào chắn rõ ràng: KHÔNG bịa đặt kinh nghiệm, CHỈ sắp xếp lại thứ tự + tinh chỉnh từ khóa.
- **Backend — Pydantic Model**: Model request `CVTailorRequest` mới cho endpoint.

## Capabilities

### New Capabilities
- `jd-tailoring`: Khả năng tối ưu hóa CV theo Job Description cụ thể — bao gồm UI modal nhập JD, backend API xử lý, AI prompt với guardrails, và tích hợp kết quả vào CV Builder.

### Modified Capabilities
_(Không có thay đổi requirements của capability hiện có)_

## Impact

- **Backend**: Thêm 1 endpoint mới trong `routers/cv.py`, 1 model mới trong `models.py`, 1 system prompt mới. Không ảnh hưởng đến các endpoint hiện tại.
- **Frontend**: Thêm 1 component modal mới (`TailorJDModal.tsx`), sửa `GenCVModal.tsx` để thêm nút trigger. Reuse hoàn toàn JSON schema `CVMakeoverData` hiện có cho output.
- **AI Service**: Tái sử dụng `call_ai_chat()` hiện có, không cần sửa `ai_service.py`.
- **Dependencies**: Không thêm dependency mới. Sử dụng hoàn toàn stack hiện tại (FastAPI, OpenAI API, Next.js, Tailwind CSS).
