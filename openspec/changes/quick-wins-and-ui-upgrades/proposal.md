## Why

Website SpeakCV có một số lỗi nhỏ ảnh hưởng UX (input chat hỗ trợ bị nền xanh khó đọc, thiếu Google Font chuyên nghiệp, SEO metadata thiếu), đồng thời landing page thiếu section giải thích quy trình hoạt động, sidebar lịch sử thiếu tổ chức theo ngày, và các micro-animations chưa đủ để tạo cảm giác "sống động". Cần cải thiện ngay để tăng tỷ lệ chuyển đổi người dùng mới và giữ chân người dùng cũ.

## What Changes

- Fix bug input chat hỗ trợ có background xanh (`bg-blue-500`) khiến text khó đọc
- Tích hợp Google Font (Be Vietnam Pro) vào layout cho toàn bộ ứng dụng
- Bổ sung SEO metadata đầy đủ (Open Graph, Twitter Card, description tiếng Việt)
- Thêm section "Cách hoạt động" (How It Works) 3 bước trên landing page
- Nhóm lịch sử phỏng vấn theo ngày (Hôm nay / Hôm qua / Tuần trước / Cũ hơn) trên sidebar
- Thêm micro-animations cho chat messages (slide-in) và cải thiện loading states

## Capabilities

### New Capabilities
- `how-it-works-section`: Section mới trên landing page giải thích 3 bước sử dụng SpeakCV (Nhập JD → Phỏng vấn AI → Nhận kết quả)
- `sidebar-grouped-history`: Tổ chức lịch sử phỏng vấn trên sidebar theo nhóm ngày (Hôm nay, Hôm qua, Tuần trước, Cũ hơn) với search filter
- `polish-and-fixes`: Sửa lỗi UX (input chat), thêm Google Font, SEO metadata, và micro-animations

### Modified Capabilities
_(Không có thay đổi spec-level trên capability hiện tại)_

## Impact

- **Frontend files thay đổi**:
  - `app/layout.tsx` – Font & SEO metadata
  - `app/page.tsx` – How It Works section
  - `components/Interview/Sidebar.tsx` – Grouped history
  - `components/SupportChatWidget.tsx` – Bug fix input
  - `components/css/globals.css` – Animation classes
- **Không ảnh hưởng Backend** – Tất cả thay đổi chỉ ở frontend
- **Không có breaking changes**
