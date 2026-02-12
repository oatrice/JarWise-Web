# 📋 Summary
This pull request introduces a powerful filtering system for the reports and transaction history pages, as outlined in issue #68. Users can now refine their data by selecting multiple categories (Jars) and accounts (Wallets) through an intuitive slide-in panel. This feature provides greater control and insight into financial data.

A new reusable `MultiSelectDropdown` component has been created to support this functionality, and comprehensive unit tests have been added to ensure the reliability of the new filter logic.

## ✅ Checklist
- [x] 🏗️ I have moved the related issue to "In Progress" on the Kanban board

# 🎯 Type
- [ ] 🐛 Bug fix
- [x] ✨ New feature
- [ ] ⚡ Performance improvement
- [ ] 🔧 Refactoring
- [ ] 💄 UI/UX Update (Web/Responsive)
- [x] 📝 Documentation
- [ ] 💥 Breaking change

# 📱 Responsive Design Checks
- [ ] Mobile View Verified
- [ ] Tablet/Desktop View Verified
- [ ] Cross-browser Check (Chrome, Safari, Firefox)

# 📝 Changes
- **New Filter Panel Component (`ReportFiltersSheet.tsx`)**: A new slide-in sheet was created to house the filtering options. It maintains a draft state, allowing users to make selections and only apply them upon confirmation. Changes are discarded if the panel is closed without applying.
- **Reusable Multi-Select Dropdown (`MultiSelectDropdown.tsx`)**: A generic and reusable multi-select dropdown component with search functionality was developed to handle the selection of Jars and Wallets.
- **Integration into Transaction History**: The new filter functionality has been integrated into the `TransactionHistory.tsx` page, allowing the transaction list to be updated in real-time based on the applied filters.
- **State Persistence**: The selected filters are persisted within the component's state to be reapplied when the filter panel is reopened during the same session.
- **Unit Testing**: Added comprehensive Vitest unit tests for the new `ReportFiltersSheet` component to cover user interactions like applying, clearing, and discarding filters.
- **Documentation**: Updated `CHANGELOG.md` and `README.md` to reflect the addition of this new feature.

# 📸 UI/UX Screenshots
<!-- Add screenshots of the new filter panel in action on mobile and desktop -->

# 🧪 Testing
- [x] Start command: `npm run dev` working
- [x] Build command: `npm run build` passing

# 🚀 Migration/Deployment
- [ ] Environment variables updated
- [ ] Dependencies installed

```bash
# No migration commands required
```

# 🔗 Related Issues
- Closes https://github.com/oatrice/JarWise-Root/issues/68
- Related to https://github.com/oatrice/JarWise-Root/issues/67
- Related to https://github.com/oatrice/JarWise-Root/issues/59

**Breaking Changes**: No
**Migration Required**: No