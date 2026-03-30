```markdown
# 📋 Summary
This PR implements the comprehensive financial reporting and data export feature for both Web and Android platforms, addressing issue #59. The update includes new charts, dynamic date range selection, and CSV export functionality, moving from mock data to live API integration.

## ✅ Checklist
- [x] 🏗️ I have moved the related issue to "In Progress" on the Kanban board

# 🎯 Type
- [ ] 🐛 Bug fix
- [x] ✨ New feature
- [ ] ⚡ Performance improvement
- [x] 🔧 Refactoring
- [x] 💄 UI/UX Update (Web/Responsive)
- [ ] 📝 Documentation
- [ ] 💥 Breaking change

# 📱 Responsive Design Checks
- [x] Mobile View Verified
- [x] Tablet/Desktop View Verified
- [x] Cross-browser Check (Chrome, Safari, Firefox)

# 📝 Changes
- **API Integration:** Replaced mock data with actual API calls to `http://localhost:8081/api/v1/reports` and `/reports/export` for fetching report data and exporting CSV.
- **Dynamic Date Range Selection:** Implemented a new segmented control for selecting predefined date ranges ('month', 'quarter', 'year', 'all') and a 'custom' option.
- **Custom Date Range Selector:** Introduced a UI for selecting custom start and end dates, complete with quick preset buttons (7, 30, 90 days) for convenience.
- **CSV Export Functionality:** Added a download button to allow users to export the current report data as a CSV file.
- **Enhanced UI/UX on ReportsPage.tsx:**
    - Updated summary cards to display income, expense, and net values with animated percentage change comparisons against the previous period.
    - Integrated an Area Chart for visualizing income and expense trends over time.
    - Improved Pie Charts for a clearer breakdown of income and expense by category or jar, including handling for uncategorized transactions.
    - Implemented a rotating metric comparison (income, expense, net) with smooth animations to highlight key financial changes.
    - Refactored the component structure for better readability, maintainability, and error handling.
- **Testing:** Added `src/__tests__/apiConfig.test.ts` to ensure the correct API base port (8081) is used for reports.

# 📸 UI/UX Screenshots
<!-- Mobile & Desktop Comparisons. MUST include screenshots for UI changes. -->
(Please add screenshots here to showcase the new reports page, date range selection, and chart visualizations.)

# 🧪 Testing
- [x] Start command: `npm run dev` working
- [x] Build command: `npm run build` passing

# 🚀 Migration/Deployment
- [ ] Environment variables updated
- [x] Dependencies installed (package.json and package-lock.json updated)

```bash
# Migration commands if applicable
# No specific migration commands required beyond dependency installation.
```

# 🔗 Related Issues
- Closes https://github.com/oatrice/JarWise-Root/issues/59
- Related to #
- Fixes #

**Breaking Changes**: No
**Migration Required**: No
```