# Luma Code Review Report

**Date:** 2026-02-02 15:25:52
**Files Reviewed:** ['.luma_state.json', 'src/App.tsx', 'src/pages/SettingsOverlay.tsx', 'src/hooks/useAuthMock.ts', 'src/components/RestoreBackupModal.tsx', 'src/pages/LoginScreen.tsx', 'src/components/LogoutConfirmModal.tsx', 'src/components/SyncStatusIndicator.tsx']

## 📝 Reviewer Feedback

There are a few issues with the submitted code, ranging from a logic error to best practice violations.

### 1. Critical Logic Error in Logout Functionality

**File**: `src/pages/SettingsOverlay.tsx`

**Problem**: The `LogoutConfirmModal` component correctly provides two distinct options: "Log out & Keep Data" and "Log out & Delete Data". However, in the `SettingsOverlay` component, both of these user choices trigger the exact same action: `onLogout?.()`. This means the user's choice to delete local data is completely ignored, and the parent component has no way of knowing which option was selected.

**Fix**: The `onLogout` handler needs to differentiate between the two actions. Modify the `onLogout` prop to accept a boolean argument indicating whether to delete data.

**Example:**

1.  Update the `onLogout` prop type in `SettingsOverlayProps`:
    ```typescript
    interface SettingsOverlayProps {
        // ... other props
        onLogout?: (deleteData: boolean) => void;
    }
    ```

2.  Update the `LogoutConfirmModal` handlers to pass the correct boolean value:
    ```tsx
    <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogoutKeepData={() => {
            setShowLogoutModal(false);
            onLogout?.(false); // User chose to KEEP data
        }}
        onLogoutDeleteData={() => {
            setShowLogoutModal(false);
            onLogout?.(true); // User chose to DELETE data
        }}
    />
    ```

### 2. Potential Memory Leak in Mock Authentication Hook

**File**: `src/hooks/useAuthMock.ts`

**Problem**: The `triggerBackup` function uses `setTimeout` to simulate an asynchronous operation. If the component using this hook unmounts after `triggerBackup` is called but before the timeout completes, it will attempt to update the state of an unmounted component. This will cause a React warning and is a potential memory leak.

**Fix**: Asynchronous operations with side effects should be managed inside a `useEffect` hook, which provides a cleanup function to cancel the operation (e.g., `clearTimeout`) when the component unmounts. The current implementation inside `useCallback` lacks this cleanup mechanism.

### 3. Non-Functional Links on Login Screen

**File**: `src/pages/LoginScreen.tsx`

**Problem**: The "Terms of Service" and "Privacy Policy" texts are rendered using `<span>` tags, which makes them unclickable. Users expect these to be functional links.

**Fix**: Replace the `<span>` tags with anchor (`<a>`) tags and add an `href` attribute.

**Example:**
```tsx
<p className=\"mt-8 text-xs text-gray-600 text-center max-w-xs\">
    By signing in, you agree to our{' '}
    <a href=\"/terms\" className=\"text-blue-400\">Terms of Service</a>
    {' '}and{' '}
    <a href=\"/privacy\" className=\"text-blue-400\">Privacy Policy</a>
</p>
```

## 🧪 Test Suggestions

*   **Unauthenticated Access to Protected Routes:** Attempt to navigate directly to the 'dashboard' or 'history' pages when the user is not logged in. The application should gracefully redirect the user back to the 'login' page instead of crashing or showing an empty/broken state.
*   **Data Isolation Between User Sessions:** Log in as User A, add a transaction, and then log out. Subsequently, log in as User B. Verify that User B does not see User A's transaction data and that the local state has been correctly cleared and re-initialized for User B's session.
*   **Authentication Flow Failure/Cancellation:** Simulate a failed login attempt (e.g., user closes the Google auth pop-up, network error occurs during authentication, or Google API returns an error). The application should remain on the 'login' page and display an appropriate error message to the user without getting stuck in an intermediate state.

