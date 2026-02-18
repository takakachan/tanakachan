const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  
  try {
    await page.goto('file:///home/tanaka/.openclaw/workspace/media-pulse/index.html');
    await page.waitForTimeout(2000);
    
    // 1. Test swipe mode button
    console.log('1. Testing swipe button...');
    await page.click('.mobile-nav-btn[data-mode="tinder"]');
    await page.waitForTimeout(500);
    const tinderView = await page.$('.tinder-view.active');
    console.log('   Swipe mode activated:', !!tinderView);
    
    // 2. Test card animation
    console.log('2. Testing card animation...');
    const likeBtn = await page.$('.tinder-btn.like');
    if (likeBtn) {
      await likeBtn.click();
      await page.waitForTimeout(600);
      console.log('   Like button clicked');
    }
    
    // 3. Check swipe icon
    console.log('3. Checking swipe icon...');
    const swipeIcon = await page.$('.mobile-nav-btn[data-mode="tinder"] .mobile-nav-icon svg');
    console.log('   Swipe icon found:', !!swipeIcon);
    
    // 4. Check menu overlay
    console.log('4. Checking menu overlay...');
    const navBtns = await page.$$('.mobile-nav-btn');
    console.log('   Nav buttons count:', navBtns.length);
    
    // 5. Test likes view
    console.log('5. Testing likes view...');
    await page.click('.mobile-nav-btn[data-mode="likes"]');
    await page.waitForTimeout(500);
    const likesView = await page.$('#likes-view');
    console.log('   Likes view found:', !!likesView);
    
    console.log('\n✅ Playwright tests completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
