# Brand theming

Themes are structured, allowlisted design tokens—not CSS. The group default is resolved first, then permitted brand overrides, then profile overrides only when explicitly enabled. Group locks win over lower levels. Missing overrides inherit automatically and can be reset by deleting the override.

Draft and published snapshots live in `BrandThemeVersion`; publishing creates a durable version and invalidates the published-theme cache. Rollback republishes a prior validated snapshot as a new version. Only published values reach public pages.

`themeSchema` validates HEX colours, radii, and enumerated fonts. `themeCssVariables` maps only known properties to CSS variables. Contrast uses WCAG relative luminance and the editor will warn below recommended ratios. A later Theme Editor will preview drafts without publishing and indicate inherited, overridden, and locked values.
