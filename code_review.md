# Luma Code Review Report

**Date:** 2026-02-01 11:44:15
**Files Reviewed:** ['.luma_state.json', 'src/pages/SettingsOverlay.tsx', 'src/pages/ManageWallets.tsx', 'src/utils/generatedMockData.ts']

## 📝 Reviewer Feedback

The code does not pass the review due to several logic errors and anti-patterns in `src/pages/ManageWallets.tsx`.

### 1. Critical Logic Error: Parent Selection is Overly Restrictive

**Problem:** In both the wallet editor and the "Add Wallet" modal, the dropdown for selecting a parent wallet is populated only with `rootWallets`. This makes it impossible to create or move a wallet to be a child of another sub-wallet (e.g., creating a level 2 wallet). The feature is meant to support a hierarchy, but this implementation limits it to a maximum of two levels (root and child).

**File:** `src/pages/ManageWallets.tsx`

**Location 1 (Editor Panel, line ~188):**
```typescript
<select ...>
    <option value="">(No Parent)</option>
    {rootWallets.filter(p => p.id !== wallet.id).map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
    ))}
</select>
```

**Location 2 (Add Modal, line ~320):**
```typescript
<select ...>
    <option value="">No Parent</option>
    {rootWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
</select>
```

**Fix:** The dropdown should be populated from the main `wallets` array, filtering out only the wallet being edited and its own descendants to prevent circular dependencies.

**Example Fix (for the editor panel):**
```typescript
// Inside the renderWalletItem function, before the return statement:
const potentialParents = wallets.filter(p => {
    // Cannot be its own parent
    if (p.id === wallet.id) return false;
    // Cannot be a descendant of itself
    const isDescendant = (potentialDescendantId: string, currentWalletId: string): boolean => {
        const children = wallets.filter(w => w.parentId === currentWalletId);
        if (children.some(child => child.id === potentialDescendantId)) return true;
        return children.some(child => isDescendant(potentialDescendantId, child.id));
    };
    if (isDescendant(p.id, wallet.id)) return false;
    
    return true;
});

// Then in the JSX:
<select ...>
    <option value="">(No Parent)</option>
    {potentialParents.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
    ))}
</select>
```
A similar change is needed for the "Add Wallet" modal, although it doesn't need the circular dependency check.

---

### 2. Critical Logic Error: Descendant `level` Property Not Updated

**Problem:** When a wallet's parent is changed, the code correctly updates the `level` of the wallet being moved. However, it fails to recursively update the `level` property for all of that wallet's descendants. The code for this (`updateChildrenLevels`) is commented out or incomplete. This leads to inconsistent data in the state, where a wallet's `level` no longer matches its actual depth in the hierarchy. This will break other logic that depends on an accurate `level`, such as the "Max Depth Check".

**File:** `src/pages/ManageWallets.tsx`

**Location:** Inside the `onChange` handler for the parent selector `select` element (around line ~220).

**Fix:** You must implement the recursive update of descendant levels. The current approach of calling `updateWallet` (which calls `setWallets`) inside a loop is inefficient and can be buggy. A better approach is to compute the new state for all affected wallets and then call `setWallets` once.

**Example Fix:**
```typescript
// Inside the parent selector's onChange handler
// ... after all validation checks pass ...

setWallets(prevWallets => {
    // Create a mutable copy of the wallets array
    const newWallets = prevWallets.map(w => ({ ...w }));

    // Find the wallet to update
    const movedWallet = newWallets.find(w => w.id === wallet.id);
    if (!movedWallet) return prevWallets; // Should not happen

    // Update the moved wallet
    movedWallet.parentId = newParentId;
    movedWallet.level = newLevel;

    // Recursively update levels of all descendants
    const updateChildrenLevels = (parentId: string, parentLevel: number) => {
        newWallets
            .filter(w => w.parentId === parentId)
            .forEach(child => {
                child.level = parentLevel + 1;
                updateChildrenLevels(child.id, child.level);
            });
    };

    updateChildrenLevels(movedWallet.id, movedWallet.level);

    return newWallets;
});
```

---

### 3. Bad Practice: Direct DOM Manipulation in React

**Problem:** The "Add Wallet" modal uses `document.getElementById` to retrieve input values. This is a React anti-pattern that bypasses React's state management and declarative nature. Forms should be handled using controlled components.

**File:** `src/pages/ManageWallets.tsx`

**Location:** Inside the `onClick` handler for the "Create Wallet" button (around line ~325).

**Fix:** Use React state (`useState`) to manage the form inputs.

**Example Fix:**
```typescript
// At the top of the ManageWallets component
const [newWalletName, setNewWalletName] = useState('');
const [newWalletParentId, setNewWalletParentId] = useState('');

// ... inside the modal JSX
<input 
    placeholder="Wallet Name" 
    className="..." 
    value={newWalletName}
    onChange={(e) => setNewWalletName(e.target.value)}
/>
<select 
    className="..." 
    value={newWalletParentId}
    onChange={(e) => setNewWalletParentId(e.target.value)}
>
    {/* options */}
</select>
<button
    onClick={() => {
        if (newWalletName) {
            const parent = wallets.find(w => w.id === newWalletParentId);
            // ... rest of the logic using newWalletName and parent ...
            handleAddWallet({ ... });
            // Reset form state
            setNewWalletName('');
            setNewWalletParentId('');
        }
    }}
>
    Create Wallet
</button>
```

## 🧪 Test Suggestions

*   **Deleting a parent wallet with sub-wallets:** Verify that the application prompts the user to reassign the child wallets. Test the flow where children are successfully reassigned to another parent, and also test the case where the user cancels the deletion, ensuring the original hierarchy remains intact.
*   **Creating a circular dependency:** Attempt to make a parent wallet a child of one of its own descendants (e.g., Wallet A is parent of B; try to make B the parent of A). The system should prevent this action and display a user-friendly error message to maintain data integrity.
*   **Deeply nested hierarchies:** Create a wallet structure with multiple levels of nesting (e.g., 5+ levels deep). Confirm that the UI renders the tree correctly without visual bugs, and that actions like moving a wallet from the middle of the hierarchy to a new parent correctly move its entire sub-tree along with it.

