# 🌐 JarWise Web

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

## 🛠 Tech Stack
- React
- Vite
- Tailwind CSS (with shared tokens)
- Framer Motion

## 🚀 Getting Started
1. `npm install`
2. `npm run dev`

For full project context and architecture, please refer to the main repository: [JarWise-Root](https://github.com/oatrice/JarWise-Root)
