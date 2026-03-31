export type MigrationPhase =
    | 'validating'
    | 'preview_ready'
    | 'duplicate_blocked'
    | 'importing'
    | 'completed'
    | 'failed'
    | 'expired';

export interface MigrationCounts {
    wallets: number;
    jars: number;
    transactions: number;
    totalIncome: number;
    totalExpense: number;
}

export interface MigrationValidationError {
    code: string;
    message: string;
}

export interface MigrationDuplicateItem {
    sourceId?: string;
    displayName?: string;
    matchedBy?: string;
    fingerprint?: string;
}

export interface MigrationDuplicateSummary {
    wallets: MigrationDuplicateItem[];
    jars: MigrationDuplicateItem[];
    transactions: MigrationDuplicateItem[];
}

export interface MigrationJobStatus {
    jobId: string;
    phase: MigrationPhase;
    message?: string;
    counts?: MigrationCounts;
    validationErrors?: MigrationValidationError[];
    duplicateSummary?: MigrationDuplicateSummary;
    canConfirmImport: boolean;
    expiresAt?: string;
}
