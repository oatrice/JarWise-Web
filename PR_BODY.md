# Objective
Implement "Add Transaction" feature for Web.

# Description
This PR implements the transaction creation flow, including form validation, local storage persistence, and the Dashboard "Recent Activity" view.

## Changes
- **AddTransaction Page**: Form with Amount, Jar Selection, Note, and Date.
- **Validation**: Real-time validation for Amount (required, positive number) and Jar (required).
- **Storage**: localStorage implementation for persisting transactions.
- **Dashboard**: Updated "Recent Activity" to show real data.
- **UI**: Responsive design matching the requested dark theme and mobile layout.

## Linked Issue
Resolves oatrice/JarWise-Root#16

## Screenshots
| Dashboard (Mobile) | Add Transaction (Mobile) |
|:---:|:---:|
| <img src="https://github.com/oatrice/JarWise-Web/blob/feat/16-add-transaction-web/screenshots/dashboard_mobile.png?raw=true" width="300" /> | <img src="https://github.com/oatrice/JarWise-Web/blob/feat/16-add-transaction-web/screenshots/add_transaction_mobile.png?raw=true" width="300" /> |

## Verification
- [x] Unit Tests passed (`npm test`)
- [x] Manual verification on Mobile Viewport (390x844)
