/**
 * Transaction Validation Utilities
 * 
 * Validates transaction form data before saving.
 */

export interface ValidationResult {
    isValid: boolean;
    errors: {
        amount?: string;
        jar?: string;
    };
}

export interface TransactionData {
    amount: string;
    jarId: string | null;
    note: string;
}

/**
 * Validates transaction form data
 * 
 * Rules:
 * - Amount: Required, must be positive number
 * - Jar: Required, must be selected
 * - Note: Optional
 */
export function validateTransaction(data: TransactionData): ValidationResult {
    const errors: ValidationResult['errors'] = {};

    // Amount validation
    const amountTrimmed = data.amount.trim();

    if (amountTrimmed === '') {
        errors.amount = 'กรุณากรอกจำนวนเงิน';
    } else {
        const amountNum = parseFloat(amountTrimmed);

        if (isNaN(amountNum)) {
            errors.amount = 'กรุณากรอกตัวเลขที่ถูกต้อง';
        } else if (amountNum <= 0) {
            if (amountTrimmed === '0' || amountNum === 0) {
                errors.amount = 'กรุณากรอกจำนวนเงิน';
            } else {
                errors.amount = 'จำนวนเงินต้องมากกว่า 0';
            }
        }
    }

    // Jar validation
    if (!data.jarId || data.jarId.trim() === '') {
        errors.jar = 'กรุณาเลือก Jar';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
