# Changelog

## [0.10.0] - 2026-02-04
### Added
- **Data Migration**: Implemented a new data migration feature to allow users to easily import their existing financial data. This includes a dedicated upload screen for data files and a status page to monitor the import progress.

## [0.9.0] - 2026-02-02
### Added
- **Authentication**: Introduced a complete user authentication system, including a new login screen and user session management to secure financial data.
- **User Experience**: Added a confirmation modal for logging out to prevent accidental session termination.
- **Data Management**: Implemented a "Restore Backup" modal, allowing users to restore their data upon login.
- **UI**: Added a new Sync Status Indicator to provide visual feedback on data synchronization.

### Fixed
- **Authentication**: Corrected an issue with the logout functionality to ensure user sessions are terminated properly and addressed related UI issues.

## [0.8.0] - 2026-02-01
### Added
- **Wallet Management**: Introduced a comprehensive Wallet Management interface, allowing users to create, edit, and organize their wallets into a hierarchical structure for a clearer financial overview.

### Fixed
- **Wallet Hierarchy**: Enforced structural rules to prevent invalid parent-child relationships, such as a wallet being its own parent.
- **Wallet Hierarchy**: Corrected an issue where wallet levels were not updating properly after changing a parent wallet.

## [0.7.0] - 2026-01-31
### Added
- **Jar Categories**: Implemented hierarchical management, allowing users to organize their savings jars into custom categories for better organization.

### Changed
- **Jar Deletion**: Improved the jar deletion process by adding a confirmation modal to prevent accidental deletions.

## [0.6.0] - 2026-01-31
### Added
- **Jar Management**: Introduced a new dedicated page for managing savings jars, allowing users to:
    - Create new jars with a name and a goal amount.
    - Edit the details of existing jars.
    - Delete jars that are no longer needed.

### Changed
- **Dashboard**: Added a link to the new Jar Management page for easy access.

## [0.5.0] - 2026-01-30
### Added
- **Add Transaction Form**: Enhanced the form with new fields for more detailed entries:
    - **Date Selection**: Users can now specify the date for a new transaction.
    - **Wallet Selection**: Added a dropdown to select the source wallet or jar for the transaction.
    - **Form Validation**: Implemented validation to ensure a wallet is selected before submission.

## [0.4.0] - 2026-01-29
### Added
- **Transaction Grouping**: Transactions are now grouped by date with daily income/expense summary displayed.
- **Scroll-to-Hide**: Header and Bottom Navigation hide when scrolling down and reappear when scrolling up.
- **useScrollDirection Hook**: Custom hook for detecting scroll direction.
- **Draft Transaction Management**: Save imported slips as drafts for later review with visual indicators.
- **Drafts to Review**: Dashboard section showing pending draft transactions with yellow highlight.

### Changed
- **BottomNav Component**: Refactored inline bottom navigation into a reusable `BottomNav` component.
- **Transaction History**: Improved layout with daily totals (income in blue, expense in red).
- **TransactionCard**: Added draft status badge with yellow styling.

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
