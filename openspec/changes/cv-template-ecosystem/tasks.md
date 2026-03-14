## 1. Template Components

- [ ] 1.1 Create `CVTealSidebar.tsx` — Teal left sidebar (Avatar, Contact, Skills, Education) + white right column (Experience, Projects). A4 size, forwardRef, print-safe.
- [ ] 1.2 Create `CVBrownElegant.tsx` — Dark brown header (Name, Title) + 2-column body: Left (Skills, Summary), Right (Experience, Education). A4 size, forwardRef, print-safe.
- [ ] 1.3 Create `CVBlueModern.tsx` — Blue left sidebar (large Avatar, Contact, Skills) + white right column with light blue section headers. A4 size, forwardRef, print-safe.

## 2. Template Selector on Makeover

- [ ] 2.1 Add `selectedTheme` state to `CVMakeover.tsx` (values: `'default'`, `'teal'`, `'brown'`, `'blue_modern'`).
- [ ] 2.2 Add inline template selector strip (4 thumbnail buttons) in the result phase, above the CV preview.
- [ ] 2.3 Import new template components and create `TEMPLATE_MAP` for dynamic rendering.
- [ ] 2.4 Replace hardcoded `<CVProTemplate>` with dynamic rendering via `TEMPLATE_MAP[selectedTheme]`.
- [ ] 2.5 Update `handleEditManually()` to save `selectedTheme` to sessionStorage instead of hardcoded `'makeover_blue'`.

## 3. Builder Integration

- [ ] 3.1 Import new template components in `GenCVModal.tsx`.
- [ ] 3.2 Add new theme options (`teal`, `brown`, `blue_modern`) to `changeTheme()` function.
- [ ] 3.3 Add theme selector cards for new templates in the left control panel.
- [ ] 3.4 Create `mapBuilderDataToCVData()` utility function to convert Builder format to `CVData`.
- [ ] 3.5 Add conditional rendering: new templates render as read-only preview with live data binding; legacy themes keep inline editable template.

## 4. Verification

- [ ] 4.1 Verify all 4 templates render correctly in Makeover with sample data.
- [ ] 4.2 Verify template switching works in realtime on Makeover.
- [ ] 4.3 Verify "Chỉnh sửa thủ công" handoff carries correct theme to Builder.
- [ ] 4.4 Verify live data binding works in Builder for all new templates.
- [ ] 4.5 Verify PDF export (Print) works for all templates at A4 size.
