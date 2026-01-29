# Changelog

## [0.4.0] - 2026-01-29
### Added
- **Transaction Grouping**: Transactions are now grouped by date with daily income/expense summary displayed.
- **Scroll-to-Hide**: Header and Bottom Navigation hide when scrolling down and reappear when scrolling up.
- **useScrollDirection Hook**: Custom hook for detecting scroll direction.

### Changed
- **BottomNav Component**: Refactored inline bottom navigation into a reusable `BottomNav` component.
- **Transaction History**: Improved layout with daily totals (income in blue, expense in red).

## [0.3.0] - 2026-01-18
### Changed
- **Mock Data**: Updated and diversified the sample data for Jars and Transactions to improve the initial demonstration experience.

## [0.2.0] - 2026-01-18
### Added
- **Global Context**: Implemented `CurrencyContext` and `useCurrency` hook for multi-currency support.
- **Mobile UI**: Added "Import Slip" page with mock Albums dialog.
- **Mobile UI**: Added "Settings" overlay with functional Currency selection.
- **Header**: Updated mobile dashboard header with accessible "Import" and "More" actions.

## [0.1.0] - 2026-01-15
### Added
- Initial project setup with React + Vite + TypeScript.
- Integrated MagicPatterns expense tracker design.
- Implemented `JarCard` with Framer Motion animations.
- Implemented `TransactionCard`.
- Added Tailwind CSS v4 configuration.
