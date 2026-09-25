import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----- FIXED CHROME PATH -----
// Check if running on Render
const isRender = process.env.RENDER === 'true';

const puppeteerConfig = {
    // Must be headless on Render/Cloud servers
    headless: isRender ? true : false,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote'
    ]
};

// Only use local Chrome executable if NOT on Render
if (!isRender) {
    puppeteerConfig.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    console.log(`[WhatsApp] Using local Chrome at: ${puppeteerConfig.executablePath}`);
} else {
    console.log(`[WhatsApp] Running on Render - Using bundled Chromium in headless mode.`);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerConfig
});

// -------- QR CODE --------
client.on('qr', (qr) => {
    console.log('\n[WhatsApp] Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// -------- EVENTS --------
client.on('authenticated', () => {
    console.log('✅ [WhatsApp] Authentication successful!');
});

client.on('ready', () => {
    console.log('✅ [WhatsApp] Client is Ready!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ [WhatsApp] Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ [WhatsApp] Client disconnected:', reason);
});

// -------- INITIALIZE --------
client.initialize().catch((error) => {
    console.error('❌ [WhatsApp] Failed to initialize:', error.message);
    console.error('[WhatsApp] Possible reasons:');
    console.error('  1. Chrome not found');
    console.error('  2. Broken Puppeteer install');
    console.error('  3. Network blocked');
});

export default client;