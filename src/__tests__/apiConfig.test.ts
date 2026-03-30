import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('API Configuration', () => {
    it('should use port 8081 for API_BASE in ReportsPage', () => {
        const filePath = path.resolve(__dirname, '../pages/ReportsPage.tsx');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // เราคาดหวังว่าพอร์ตจะเป็น 8081
        expect(content).toContain('http://localhost:8081/api/v1');
    });
});
