---
name: ui-consistency
description: 'Use when building or reviewing frontend screens, shared components, forms, status labels, colors, or responsive behavior in the customer-service portal.'
---

# UI consistency

## Use when

- Adding or changing a screen or reusable UI component.
- Reviewing palette use, forms, error messages, or responsive layout.

## Procedure

1. Inspect existing screens, styles and shared components before adding new patterns.
2. Prefer shared components for repeated controls, fields, buttons, messages and status/priority labels.
3. Use the project palette as a base: `#FEF3E2`, `#F4AE52`, `#D4621A`, `#2A1A0E`.
4. Keep body text and control labels readable; adjust foreground/background combinations when contrast is insufficient rather than using a low-contrast palette color unchanged.
5. Use semantic HTML, labels, keyboard-operable controls and visible focus states. Communicate errors in clear Swedish.
6. Check narrow and wide layouts. Add or update focused UI tests for observable behavior.
7. Report any manual visual or contrast checks separately from automated test results.
