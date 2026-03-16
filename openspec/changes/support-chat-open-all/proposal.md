## Why

Chat hỗ trợ hiện chỉ dành cho user Pro, khiến user Free không có kênh liên hệ trực tiếp khi gặp vấn đề. Mở rộng cho tất cả user (có rate limiting) giúp tăng trải nghiệm, giảm churn, và vẫn giữ incentive nâng cấp Pro.

## What Changes

- Gỡ bỏ giới hạn `plan === "pro"` trên frontend, cho tất cả user đã đăng nhập chat được
- Thêm rate limiting backend: Free user giới hạn 5 tin/ngày, Pro user không giới hạn
- Thêm API endpoint kiểm tra remaining quota cho free user
- Guest user (chưa đăng nhập) thấy nút chat nhưng được yêu cầu đăng nhập
- Badge đỏ hiển thị số tin nhắn chưa đọc từ admin trên icon chat
- Auto-reply khi admin offline: gửi tin tự động "Admin hiện không online, chúng tôi sẽ phản hồi sớm nhất"

## Capabilities

### New Capabilities
- `chat-rate-limiting`: Backend rate limiting cho free user (5 tin/ngày), API kiểm tra quota, frontend hiển thị remaining/upgrade CTA
- `chat-unread-badge`: Badge đỏ trên icon chat hiển thị số tin chưa đọc từ admin, polling định kỳ
- `chat-auto-reply`: Tự động gửi tin nhắn khi admin không online, dựa vào trạng thái admin_connections
- `chat-guest-prompt`: Guest user thấy icon chat nhưng khi click sẽ hiện prompt yêu cầu đăng nhập

### Modified Capabilities
_(Không có)_

## Impact

- **Backend files**: `routers/support.py` (rate limit + auto-reply + unread count endpoint), `models.py` (thêm response models)
- **Frontend files**: `SupportChatWidget.tsx` (gỡ Pro gate, thêm rate limit UI, badge, guest prompt, auto-reply display)
- **Database**: Không thay đổi schema — dùng query count trên bảng `support_messages` hiện có
- **Không có breaking changes**
