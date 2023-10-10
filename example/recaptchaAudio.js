const puppeteer = require('puppeteer');
const Solver = require("puppeteer-recaptcha-bypass");

(async () => {
    const browser = await puppeteer.launch({
        headless:false,
        args: [
            "--window-position=000,000",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-web-security",
            "--disable-features=IsolateOrigins",
            " --disable-site-isolation-trials",
          ],
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/recaptcha/api2/demo');
    
    const apiKey = 'WIT.AI API KEY';
    const captchaResponse = await Solver(page, apiKey);
    
    console.log('Solved CAPTCHA:', captchaResponse);

    await browser.close();
})();
