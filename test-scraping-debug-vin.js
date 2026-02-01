require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

puppeteer.use(StealthPlugin());
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: process.env.CAPTCHA_API_KEY || ''
        }
    })
);

const testVIN = 'W0LJC7E89GB611600';

const testSite = async (url, name) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`URL: ${url}`);
    console.log('='.repeat(60));
    
    let browser, page;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Așteaptă și rezolvă reCAPTCHA
        try {
            await page.solveRecaptchas();
            await page.waitForTimeout(3000);
        } catch (e) {
            console.log('reCAPTCHA handling:', e.message);
        }
        
        await page.waitForTimeout(5000);
        
        // Face screenshot pentru debugging
        await page.screenshot({ path: `screenshot-${name.replace(/[^a-z0-9]/gi, '_')}.png`, fullPage: true });
        console.log(`Screenshot saved: screenshot-${name.replace(/[^a-z0-9]/gi, '_')}.png`);
        
        // Extrage tot textul pentru analiză
        const pageText = await page.evaluate(() => document.body.innerText);
        console.log(`\nPage text length: ${pageText.length}`);
        console.log(`Contains VIN: ${pageText.includes(testVIN)}`);
        console.log(`Contains "make": ${pageText.toLowerCase().includes('make')}`);
        console.log(`Contains "model": ${pageText.toLowerCase().includes('model')}`);
        
        // Caută elemente specifice
        const elements = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('*').forEach(el => {
                const text = el.innerText || '';
                if (text.length > 10 && text.length < 200 && (text.includes('make') || text.includes('model') || text.includes('year'))) {
                    results.push({
                        tag: el.tagName,
                        class: el.className,
                        text: text.substring(0, 100)
                    });
                }
            });
            return results.slice(0, 10);
        });
        
        console.log(`\nFound ${elements.length} relevant elements:`);
        elements.forEach((el, i) => {
            console.log(`${i + 1}. <${el.tag}> class="${el.class}"`);
            console.log(`   Text: ${el.text}`);
        });
        
        await browser.close();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (browser) await browser.close();
    }
};

(async () => {
    await testSite(`https://www.freevindecoder.eu/?vin=${testVIN}`, 'freevindecoder');
    // await testSite(`https://bimmer.work/`, 'bimmer.work');
})();
