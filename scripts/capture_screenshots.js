
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function capture() {
    // Ensure directory exists
    const dir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // optimization
    });
    const page = await browser.newPage();

    // Set Mobile Viewport (iPhone 13 Pro dimensions)
    await page.setViewport({ width: 390, height: 844, isMobile: true });

    try {
        // 1. Dashboard
        console.log('Navigating to Dashboard...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        // Wait for a bit (animations, etc)
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(dir, 'dashboard-mobile.png') });
        console.log('Captured dashboard-mobile.png');

        // 2. Transaction History
        console.log('Navigating to Transaction History...');
        await page.goto('http://localhost:5173/history', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(dir, 'history-mobile.png') });
        console.log('Captured history-mobile.png');

    } catch (e) {
        console.error('Error capturing screenshots:', e);
    } finally {
        await browser.close();
    }
}

capture();
