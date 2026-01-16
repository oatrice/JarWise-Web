
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
    // --- Mobile Capture ---
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, isMobile: true });

    try {
        console.log('Capturing Mobile...');
        await pageMobile.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await pageMobile.screenshot({ path: path.join(dir, 'dashboard-mobile.png') });

        // Scan Page
        await pageMobile.click('[data-testid="scan-btn-mobile"]');
        await new Promise(r => setTimeout(r, 2000));
        await pageMobile.screenshot({ path: path.join(dir, 'scan-page-mobile.png') });
        console.log('Mobile captured.');
    } catch (e) {
        console.error('Mobile capture error:', e);
    } finally {
        await pageMobile.close();
    }

    // --- Desktop Capture ---
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1920, height: 1080 }); // Desktop 1080p

    try {
        console.log('Capturing Desktop...');
        await pageDesktop.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await pageDesktop.screenshot({ path: path.join(dir, 'dashboard-desktop.png') });

        // Scan Page
        await pageDesktop.waitForSelector('[data-testid="scan-btn-desktop"]');
        await pageDesktop.click('[data-testid="scan-btn-desktop"]');
        await new Promise(r => setTimeout(r, 2000));
        await pageDesktop.screenshot({ path: path.join(dir, 'scan-page-desktop.png') });
        console.log('Desktop captured.');
    } catch (e) {
        console.error('Desktop capture error:', e);
    } finally {
        await pageDesktop.close();
    }

    await browser.close();
}

capture();
