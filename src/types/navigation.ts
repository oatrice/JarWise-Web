export type Page = 
    | 'dashboard' 
    | 'history' 
    | 'scan' 
    | 'add-transaction' 
    | 'login' 
    | 'migration-upload' 
    | 'migration-status' 
    | 'transaction-detail' 
    | 'wallets' 
    | 'profile' 
    | 'reports';

export interface NavigationProps {
    onNavigate: (page: Page) => void;
}
