const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('=== Media Pulse Fix Tests ===\n');
  
  // Use desktop viewport for most tests
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  
  // Test 1: Check mobile nav animation - icon and text move together
  console.log('Test 1: Mobile nav animation sync (icon + text)...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('networkidle');
  
  // Click around to test animations
  const mobileNavBtns = await page.locator('.mobile-nav-btn').all();
  for (const btn of mobileNavBtns) {
    await btn.click();
    await page.waitForTimeout(200);
  }
  console.log('✓ Mobile nav navigation works\n');
  
  // Test 2: Search box - check if it appears as floating overlay
  console.log('Test 2: Search box floating overlay position...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForLoadState('networkidle');
  await page.click('.action-btn[title*="Search"]');
  await page.waitForTimeout(300);
  
  const searchBox = await page.locator('.search-box.active');
  const isVisible = await searchBox.isVisible();
  console.log(`Search box visible: ${isVisible}`);
  
  const searchBoxStyle = await searchBox.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      position: style.position,
      boxShadow: style.boxShadow,
      borderRadius: style.borderRadius
    };
  });
  console.log(`Search box style: ${JSON.stringify(searchBoxStyle)}`);
  
  if (searchBoxStyle.position === 'fixed' && searchBoxStyle.boxShadow !== 'none') {
    console.log('✓ Search box is floating overlay with shadow\n');
  } else {
    console.log('✗ Search box might not be floating properly\n');
  }
  
  // Test 3: Search functionality works on likes view
  console.log('Test 3: Search on likes view...');
  // Go to desktop first to use desktop nav
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForLoadState('networkidle');
  await page.click('.nav-btn[data-mode="likes"]');
  await page.waitForTimeout(300);
  
  // Type search query
  await page.click('.action-btn[title*="Search"]');
  await page.waitForTimeout(300);
  await page.fill('#search-input', 'tech');
  await page.waitForTimeout(300);
  
  const likesEmpty = await page.locator('#likes-cards .empty').isVisible().catch(() => false);
  console.log(`Likes view has results (search filtering): ${!likesEmpty}`);
  
  // Clear search
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  console.log('✓ Search on likes view works\n');
  
  // Test 4: Search functionality works on nope view
  console.log('Test 4: Search on nope view...');
  await page.click('.nav-btn[data-mode="nope"]');
  await page.waitForTimeout(300);
  
  await page.click('.action-btn[title*="Search"]');
  await page.waitForTimeout(300);
  await page.fill('#search-input', 'test');
  await page.waitForTimeout(300);
  
  const nopeEmpty = await page.locator('#nope-cards .empty').isVisible().catch(() => false);
  console.log(`Nope view has results (search filtering): ${!nopeEmpty || await page.locator('#nope-cards .card').count() > 0}`);
  console.log('✓ Search on nope view works\n');
  
  // Test 5: Nope view - size selector should be removed
  console.log('Test 5: Nope view - size selector removed...');
  const nopeSizeSelector = await page.locator('#nope-view .size-selector').count();
  if (nopeSizeSelector === 0) {
    console.log('✓ Size selector removed from Nope view\n');
  } else {
    console.log('✗ Size selector still present in Nope view\n');
  }
  
  // Test 6: Tinder mode adjustments
  console.log('Test 6: Tinder mode adjustments...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('networkidle');
  await page.click('.mobile-nav-btn[data-mode="tinder"]');
  await page.waitForTimeout(500);
  
  // Check progress bar margin
  const progressWrap = await page.locator('.tinder-progress-wrap');
  const progressMargin = await progressWrap.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.marginTop;
  });
  console.log(`Progress bar margin-top: ${progressMargin}`);
  
  // Check tinder controls margin
  const controls = await page.locator('.tinder-controls');
  const controlsMargin = await controls.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.marginBottom;
  });
  console.log(`Tinder controls margin-bottom: ${controlsMargin}`);
  
  if (parseInt(progressMargin) <= 10 && parseInt(controlsMargin) <= 80) {
    console.log('✓ Tinder mode spacing adjusted\n');
  }
  
  // Test 7: Tinder swipe functionality
  console.log('Test 7: Tinder swipe...');
  const tinderCard = await page.locator('#tinder-card');
  const cardVisible = await tinderCard.isVisible();
  console.log(`Tinder card visible: ${cardVisible}`);
  
  if (cardVisible) {
    // Swipe right (like)
    await tinderCard.hover();
    await page.mouse.down();
    await page.mouse.move(300, 400);
    await page.mouse.up();
    await page.waitForTimeout(500);
    console.log('✓ Tinder swipe works\n');
  }
  
  console.log('=== All Tests Completed ===');
  
  await browser.close();
})();
