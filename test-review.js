const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } }); // Mobile size
  
  try {
    // Test local file
    await page.goto('file:///home/tanaka/.openclaw/workspace/media-pulse/index.html');
    await page.waitForTimeout(2000);
    
    // Take screenshot of main view
    await page.screenshot({ path: '/home/tanaka/.openclaw/workspace/media-pulse/test-review-1.png' });
    console.log('Screenshot 1: Main view');
    
    // Click swipe mode button (use nav-btn for desktop or mobile-nav-btn)
    const swipeBtn = await page.$('.mobile-nav-btn[data-mode="tinder"]');
    if (swipeBtn) {
      await swipeBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/tanaka/.openclaw/workspace/media-pulse/test-review-2.png' });
      console.log('Screenshot 2: Swipe mode');
      
      // Click like button
      const likeBtn = await page.$('.tinder-btn.like');
      if (likeBtn) {
        await likeBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: '/home/tanaka/.openclaw/workspace/media-pulse/test-review-3.png' });
        console.log('Screenshot 3: After like');
      }
    }
    
    // Click collected button
    const collectedBtn = await page.$('.mobile-nav-btn[data-mode="likes"]');
    if (collectedBtn) {
      await collectedBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/tanaka/.openclaw/workspace/media-pulse/test-review-4.png' });
      console.log('Screenshot 4: Collected view with size selector');
      
      // Test size buttons
      const sizeLargeBtn = await page.$('button[onclick*="setCardSize"]');
      if (sizeLargeBtn) {
        await sizeLargeBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: '/home/tanaka/.openclaw/workspace/media-pulse/test-review-5.png' });
        console.log('Screenshot 5: After size change');
      }
    }
    
    console.log('\n✅ Tests completed! Check screenshots:');
    console.log('test-review-1.png to 5.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
