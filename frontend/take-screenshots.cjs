const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'src', 'assets', 'screenshots');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('Navigating to register...');
    await page.goto('http://localhost:8080/register');
    
    // Fill out registration form
    const timestamp = Date.now();
    await page.type('input[name="fullName"]', 'Test User');
    await page.type('input[name="email"]', `test${timestamp}@example.com`);
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    console.log('Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Screenshot 1: Dashboard
    console.log('Taking Dashboard screenshot...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard.png') });

    // Screenshot 2: Jobs (Match Analysis)
    console.log('Navigating to jobs...');
    await page.goto('http://localhost:8080/jobs', { waitUntil: 'networkidle0' });
    
    // Click the first "Analyze Match" button
    console.log('Taking Match Analysis screenshot...');
    try {
      await page.waitForTimeout(2000); 
      // Click a button that contains the text "Analyze Match" using evaluate
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const analyzeBtn = buttons.find(b => b.textContent.includes('Analyze Match'));
        if (analyzeBtn) analyzeBtn.click();
      });
      // Wait for modal to appear
      await page.waitForTimeout(2000); 
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'match-analysis.png') });
      
      // Close modal by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
    } catch (e) {
      console.log('No analyze button found, taking generic jobs screenshot');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'match-analysis.png') });
    }

    // Screenshot 3: Smart Job Recommendations (or resume analyzer)
    console.log('Navigating to tools/resume-analyzer...');
    await page.goto('http://localhost:8080/tools/resume-analyzer', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'resume-analyzer.png') });

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
