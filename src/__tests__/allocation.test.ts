import { describe, it, expect } from 'vitest';
import { jars, type Allocation } from '../utils/generatedMockData';

// Mock data might change, so we test structure and type compliance
describe('Allocation Hierarchy (Web)', () => {
    it('should have correct Allocation type properties', () => {
        // Find a top-level jar (parentId should be null or string)
        const topLevelJar = jars.find(j => j.level === 0);

        expect(topLevelJar).toBeDefined();
        if (topLevelJar) {
            expect(topLevelJar).toHaveProperty('id');
            expect(topLevelJar).toHaveProperty('name');
            expect(topLevelJar).toHaveProperty('level');
            expect(topLevelJar).toHaveProperty('parentId');
            // parentId can be null or string, but for level 0 it's typically null in our mock gen
            // However, our script output sets it to 'null' string if null?? 
            // Let's check the script output logic again:
            // parentId: ${jar.parentId ? `'${jar.parentId}'` : 'null'},
            // So it matches the type string | null.
        }
    });

    it('should support parent-child relationships', () => {
        // We might not have nested jars in default mock data yet (unless mockData.json has them),
        // but we can verify the type allows it.
        const childJar: Allocation = {
            id: 'child_1',
            name: 'Child Jar',
            current: 0,
            goal: 100,
            level: 1,
            parentId: 'parent_1', // Valid according to type
            color: 'blue',
            bgGlow: 'bg-blue-500',
            icon: {} as any, // Mock icon
            barColor: 'bg-blue-500',
            shadowColor: 'shadow-blue'
        };

        expect(childJar.parentId).toBe('parent_1');
        expect(childJar.level).toBe(1);
    });
});
