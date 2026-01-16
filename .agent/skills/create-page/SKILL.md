---
name: create-page
description: Create a new React page with routing, navigation, and styling
---

# Create Page Skill

This skill scaffolds a new React page following JarWise Web standards.

## Usage

When user says:
- "create page [name]"
- "สร้างหน้า [name]"
- "new page for [feature]"

## Workflow

### Step 1: Gather Requirements
1. **Page Name**: PascalCase (e.g., `ManageJars`, `TransactionDetail`)
2. **Route Path**: URL path (e.g., `/manage-jars`)
3. **Has Navigation**: Need back button?

### Step 2: Create Page Component
Create `src/pages/<PageName>.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import './styles/<PageName>.css';

export default function <PageName>() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="page-title"><Page Title></h1>
        <div className="header-spacer" />
      </header>

      {/* Content */}
      <main className="page-content">
        <p>TODO: Implement page content</p>
      </main>
    </div>
  );
}
```

### Step 3: Create CSS File
Create `src/pages/styles/<PageName>.css`:

```css
/* <PageName> Page Styles */

.page-container {
  min-height: 100vh;
  background: var(--gray-950, #0a0a0a);
  color: white;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--gray-900, #111);
}

.back-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 8px;
}

.back-button:hover {
  background: var(--gray-800, #222);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

.page-content {
  padding: 1rem;
}
```

### Step 4: Add Route
Update `src/App.tsx`:

```tsx
import <PageName> from './pages/<PageName>';

// In Routes:
<Route path="/<route-path>" element={<<PageName> />} />
```

### Step 5: Verify Build
```bash
npm run build
```

### Step 6: Report Summary
```
✅ Page Created Successfully!

Files Created:
- src/pages/<PageName>.tsx
- src/pages/styles/<PageName>.css

Route: /<route-path>

Features:
- Dark theme (var(--gray-950))
- Back navigation header
- CSS variables for theming

Next Steps:
1. Implement page content
2. Add navigation from other pages
3. Test in browser
```

## Standards
- ✅ Use CSS variables for colors
- ✅ Mobile-first responsive design
- ✅ Semantic HTML elements
- ✅ Accessible navigation (aria-labels)
