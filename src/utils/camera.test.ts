
import { describe, it, expect } from 'vitest';
import { getCameraConfig } from './camera';

describe('Camera Config', () => {
    it('should return environment facing mode for mobile', () => {
        const config = getCameraConfig(true); // isMobile = true
        expect(config).toEqual({ facingMode: "environment" });
    });

    it('should return user facing mode for PC', () => {
        const config = getCameraConfig(false); // isMobile = false
        expect(config).toEqual({ facingMode: "user" });
    });
});
