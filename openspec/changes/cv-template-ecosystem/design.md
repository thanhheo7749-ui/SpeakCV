## Context

SpeakCV hiện có 1 template CV duy nhất (`CVProTemplate`) dùng chung cho cả Makeover và Builder. CV Builder (`GenCVModal`) có hệ thống theme riêng (topcv, antuong, thamvong, makeover_blue) nhưng chỉ thay đổi màu — không thay đổi layout. Cần thêm 3 template mới với layout hoàn toàn khác biệt mà vẫn giữ nguyên data contract (`CVData` interface).

## Goals / Non-Goals

**Goals:**
- Tạo 3 template CV mới reuse `CVData` + `avatarUrl` interface
- Cho phép user chọn template trên cả Makeover và Builder
- Đồng bộ lựa chọn template khi handoff Makeover → Builder qua sessionStorage
- Đảm bảo tất cả template in PDF chuẩn A4

**Non-Goals:**
- Không thay đổi backend / AI JSON schema
- Không thêm template editor (WYSIWYG)
- Không hỗ trợ custom theme / color picker

## Decisions

### 1. Component Architecture: Standalone Templates vs. Theme-based Skinning

**Chọn: Standalone Template Components**

Mỗi template là 1 React component độc lập (`CVTealSidebar.tsx`, `CVBrownElegant.tsx`, `CVBlueModern.tsx`), cùng nhận props `{ cvData: CVData, avatarUrl?: string }` và dùng `forwardRef` giống `CVProTemplate`.

**Lý do**: Layout các template hoàn toàn khác nhau (2-column trái/phải vs header + 2-column, ratio sidebar khác nhau). Skinning chỉ thay màu không đủ, cần component riêng biệt.

**Alternative bị loại**: Một component chung với config object → quá phức tạp để handle các layout khác nhau, khó maintain.

### 2. Template Selection UI: Inline Selector vs. Modal

**Chọn: Inline Thumbnail Strip**

Trên trang Makeover (result phase), thêm 1 row nhỏ chứa 4 ô thumbnail (Default Blue, Teal, Brown, Blue Modern) ngay phía trên hoặc dưới header "CV Chuyên Nghiệp". Click để switch template realtime.

**Lý do**: Ít friction nhất, user thấy ngay preview thay đổi. Không cần modal riêng (quá nặng cho việc chỉ chọn layout).

### 3. State Management: Local key string

**Chọn: `selectedTheme: string` tại component level**

Makeover: thêm state `selectedTheme` (giá trị: `'default'`, `'teal'`, `'brown'`, `'blue_modern'`).  
Builder: mở rộng `changeTheme()` để handle các theme mới tương ứng.

### 4. Template Rendering: Component Map

Template được render bằng lookup object:

```tsx
const TEMPLATE_MAP: Record<string, React.FC<TemplateProps>> = {
  default: CVProTemplate,
  teal: CVTealSidebar,
  brown: CVBrownElegant,
  blue_modern: CVBlueModern,
};
```

### 5. Builder Integration: Hybrid Approach

Với theme mới (`teal`, `brown`, `blue_modern`), Builder render component template tương ứng ở chế độ **read-only preview** (giống Makeover) thay vì inline editable. Form edit bên trái vẫn hoạt động bình thường, data binding qua state → preview realtime. Với theme cũ (topcv, antuong, thamvong), giữ nguyên inline editable template hiện tại.

## Risks / Trade-offs

- **Print/PDF đa template** → Mitigation: Giữ fixed width 794px (210mm) cho tất cả template, dùng `@media print` và `printColorAdjust: exact`.
- **Builder data mapping khác nhau** → Mitigation: Tạo utility function `mapBuilderToMakeover()` chuyển đổi giữa builder format và CVData format, đảm bảo 2-way sync.
- **Component bloat** → Mitigation: Mỗi template ~ 200-300 lines, tổng cộng chỉ thêm ~900 lines. Có thể lazy import nếu cần.
