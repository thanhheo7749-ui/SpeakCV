## Why

Hiện tại hệ thống chỉ có **1 template CV duy nhất** (`CVProTemplate` - layout xanh dương header + 2 cột). Người dùng không có lựa chọn giao diện CV nào khác, dẫn đến tất cả CV được tạo ra đều có cùng một diện mạo. Cần mở rộng "hệ sinh thái template" đa dạng hơn để tăng giá trị sản phẩm và trải nghiệm người dùng — mà **không cần thay đổi cấu trúc dữ liệu JSON** từ AI.

## What Changes

- **3 template CV mới**: `CVTealSidebar` (cột trái teal), `CVBrownElegant` (header nâu 2 cột), `CVBlueModern` (cột trái xanh dương). Tất cả reuse interface `CVData` và prop `avatarUrl` từ `CVProTemplate`.
- Thêm **UI chọn template** (Theme Selector) trên trang CV Makeover — hiển thị sau khi AI generate xong, cho phép người dùng chuyển đổi giao diện realtime trước khi tải PDF.
- Cập nhật **sessionStorage handoff** để lưu kèm `selectedTheme` khi chuyển sang CV Builder.
- Cập nhật **CV Builder** (GenCVModal) để nhận và hiển thị template mới tương ứng với theme được chọn, đảm bảo **live data binding** khi sửa form.

## Capabilities

### New Capabilities
- `cv-template-components`: Ba component template CV mới (Teal Sidebar, Brown Elegant, Blue Modern) với giao diện đa dạng, kích thước A4 chuẩn, sẵn sàng in PDF.
- `cv-template-selector`: UI cho phép chọn template trên trang Makeover và Builder, state quản lý `selectedTheme`, dynamic rendering dựa trên lựa chọn.
- `cv-template-handoff`: Đồng bộ lựa chọn template giữa Makeover → Builder qua sessionStorage, auto-apply theme khi mở Builder.

### Modified Capabilities
_(Không có spec hiện tại nào cần thay đổi requirement)_

## Impact

- **Frontend Components**: Tạo 3 file mới trong `src/frontend/components/Modals/` (`CVTealSidebar.tsx`, `CVBrownElegant.tsx`, `CVBlueModern.tsx`).
- **CVMakeover.tsx**: Thêm state `selectedTheme`, UI selector, dynamic template rendering.
- **GenCVModal.tsx**: Cập nhật `changeTheme()`, thêm import 3 template mới, render preview theo theme.
- **Backend**: Không thay đổi — JSON schema giữ nguyên.
- **Dependencies**: Không thêm thư viện mới — reuse Tailwind CSS + lucide-react hiện có.
