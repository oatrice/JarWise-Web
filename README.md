# 🌐 JarWise Web
![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)









This is the **Web Frontend** for the [JarWise Project](https://github.com/oatrice/JarWise-Root). It serves as the primary UI/UX playground and dashboard.

## 🎨 Design System & Tokens
This project uses a shared design token system managed in the **[JarWise-Root](https://github.com/oatrice/JarWise-Root)** repository.

*   **Local Generated File**: `tailwind.theme.js` (In this repo)
    *   *Status*: **Auto-generated. DO NOT EDIT.**
*   **Source of Truth**: `tokens/colors.json` (In **JarWise-Root** repo)
*   **Sync Utility**: `scripts/sync_tokens.js` (In **JarWise-Root** repo)

**To Update Colors:**
1.  Go to the `JarWise-Root` repository.
2.  Edit `tokens/colors.json`.
3.  Run `node scripts/sync_tokens.js` from the root of `JarWise-Root`.

## ✨ Features
*   **Authentication**: Implemented login/logout flow and user management.
*   **Transaction Management**: Add new transactions (expense, income, transfer) with date/wallet selection and validation. Includes a transaction detail view and transfer functionality.
*   **Transaction Filtering**: Added filters to the transaction history page.
*   **Currency Support**: Multi-currency display (THB, USD, EUR, GBP, JPY) with global context and persistence.
*   **Mobile Parity**: Responsive Dashboard with mobile-specific header actions (Import Slip, Settings).
*   **Mock Functionality**: Import Slip UI and Settings Overlay for mobile demonstration.
*   **Jar Management**: Add and manage budget jars, with support for hierarchical categories.
*   **Wallet Management**: Add and manage wallets with support for hierarchical organization.
*   **Data Migration**: Added screens for uploading and tracking data migration.

## 🛠 Tech Stack
![React](https://img.shields.io/badge/React-19.2.0-20232a?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.26.2-0055FF?style=for-the-badge&logo=framer&logoColor=white)









## 🚀 Getting Started
1. `npm install`
2. `npm run dev`

For full project context and architecture, please refer to the main repository: [JarWise-Root](https://github.com/oatrice/JarWise-Root)