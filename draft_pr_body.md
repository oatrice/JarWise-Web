# [Feature] Migrate Data from Money Manager App (.mmbak)

<!-- Paste your generated PR description here -->
# 📋 Summary
This PR implements a data migration feature that allows users to import their transaction history from Money Manager App (.mmbak backup files). The feature includes a complete migration workflow with file upload validation, data preview, and import confirmation screens.

## ✅ Checklist
- [x] 🏗️ I have moved the related issue to "In Progress" on the Kanban board

# 🎯 Type
- [ ] 🐛 Bug fix
- [x] ✨ New feature
- [ ] ⚡ Performance improvement
- [ ] 🔧 Refactoring
- [x] 💄 UI/UX Update (Web/Responsive)
- [ ] 📝 Documentation
- [ ] 💥 Breaking change

# 📱 Responsive Design Checks
- [x] Mobile View Verified
- [x] Tablet/Desktop View Verified
- [x] Cross-browser Check (Chrome, Safari, Firefox)

# 📝 Changes

### New Migration Feature
- Added complete migration workflow with two new screens:
  - **MigrationUploadScreen**: File upload interface for .mmbak and .xls files
  - **MigrationStatusScreen**: Multi-stage status display (uploading → validating → preview → importing → success)

### UI/UX Enhancements
- Implemented animated loading states with Framer Motion
- Added validation status indicators (success, error, warning)
- Created data preview cards showing wallets, jars, and transaction counts
- Designed responsive layouts optimized for mobile-first experience

### Routing Updates
- Extended app navigation to support new migration pages (`migration-upload`, `migration-status`)
- Integrated migration entry point in Settings overlay
- Added proper navigation flow between upload, status, and dashboard screens

### Files Modified
- `src/App.tsx`: Added new page routes and navigation logic
- `src/pages/Dashboard.tsx`: Updated page type definitions and settings integration
- `src/pages/SettingsOverlay.tsx`: Added migration feature entry point
- `src/pages/MigrationUploadScreen.tsx`: New component (171 lines)
- `src/pages/MigrationStatusScreen.tsx`: New component (292 lines)

### Statistics
- 10 files changed
- 523 insertions(+)
- 77 deletions(-)

# 📸 UI/UX Screenshots
<!-- Mobile & Desktop Comparisons. MUST include screenshots for UI changes. -->

**Migration Upload Screen**
- Clean file upload interface with drag-and-drop support
- Visual indicators for required files (.mmbak and .xls)
- Disabled state management until both files selected

**Migration Status Screen**
- Loading animations during file processing
- Data validation results with comprehensive preview
- Success/error states with appropriate messaging
- Stats breakdown: wallets, jars (categories), and transactions
- Confirmation flow with clear CTAs

# 🧪 Testing
- [x] Start command: `npm run dev` working
- [x] Build command: `npm run build` passing

### Manual Testing Performed
- File upload functionality (both .mmbak and .xls)
- Navigation flow through all migration states
- Error handling and validation states
- Success completion and return to dashboard
- Debug mode with simulated error states

# 🚀 Migration/Deployment
- [x] Environment variables updated
- [x] Dependencies installed
```bash
# No database migrations required
# Ensure all dependencies are installed
npm install
```

### Dependencies Added
- Already using `framer-motion` for animations
- Lucide-react icons already in place

# 🔗 Related Issues
- Closes https://github.com/oatrice/JarWise-Root/issues/65

**Breaking Changes**: No  
**Migration Required**: No