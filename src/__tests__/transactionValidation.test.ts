import { describe, it, expect } from 'vitest';
import { validateTransaction } from '../utils/validation';

/**
 * Validation Rules for AddTransaction Form
 * 
 * Amount: Required, must be positive number
 * Jar: Required, must be selected
 * Note: Optional
 */

describe('Transaction Validation', () => {
    describe('Amount Validation', () => {
        it('should fail when amount is empty', () => {
            const result = validateTransaction({
                amount: '',
                jarId: 'necessities',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.amount).toBe('กรุณากรอกจำนวนเงิน');
        });

        it('should fail when amount is 0', () => {
            const result = validateTransaction({
                amount: '0',
                jarId: 'necessities',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.amount).toBe('กรุณากรอกจำนวนเงิน');
        });

        it('should fail when amount is negative', () => {
            const result = validateTransaction({
                amount: '-100',
                jarId: 'necessities',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.amount).toBe('จำนวนเงินต้องมากกว่า 0');
        });

        it('should fail when amount is not a number', () => {
            const result = validateTransaction({
                amount: 'abc',
                jarId: 'necessities',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.amount).toBe('กรุณากรอกตัวเลขที่ถูกต้อง');
        });

        it('should pass when amount is a positive number', () => {
            const result = validateTransaction({
                amount: '100',
                jarId: 'necessities',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors.amount).toBeUndefined();
        });

        it('should pass when amount is a decimal number', () => {
            const result = validateTransaction({
                amount: '99.99',
                jarId: 'necessities',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors.amount).toBeUndefined();
        });
    });

    describe('Jar Validation', () => {
        it('should fail when jar is not selected (null)', () => {
            const result = validateTransaction({
                amount: '100',
                jarId: null,
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.jar).toBe('กรุณาเลือก Jar');
        });

        it('should fail when jar is empty string', () => {
            const result = validateTransaction({
                amount: '100',
                jarId: '',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.jar).toBe('กรุณาเลือก Jar');
        });

        it('should pass when jar is selected', () => {
            const result = validateTransaction({
                amount: '100',
                jarId: 'education',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors.jar).toBeUndefined();
        });
    });

    describe('Note Validation', () => {
        it('should pass when note is empty (optional)', () => {
            const result = validateTransaction({
                amount: '100',
                jarId: 'savings',
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(true);
        });

        it('should pass when note has content', () => {
            const result = validateTransaction({
                amount: '100',
                jarId: 'savings',
                walletId: 'wallet-1',
                note: 'Lunch expense',
            });

            expect(result.isValid).toBe(true);
        });
    });

    describe('Combined Validation', () => {
        it('should return multiple errors when both amount and jar are invalid', () => {
            const result = validateTransaction({
                amount: '',
                jarId: null,
                walletId: 'wallet-1',
                note: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.amount).toBe('กรุณากรอกจำนวนเงิน');
            expect(result.errors.jar).toBe('กรุณาเลือก Jar');
        });

        it('should return valid when all required fields are filled', () => {
            const result = validateTransaction({
                amount: '500.50',
                jarId: 'play',
                walletId: 'wallet-1',
                note: 'Movie night',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors.amount).toBeUndefined();
            expect(result.errors.jar).toBeUndefined();
        });
    });
});
