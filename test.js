const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test 1: Check toast container position
  console.log('Test 1: Checking toast container position...');
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  
  const toastContainer = await page.locator('.toast-container');
  const toastBottom = await toastContainer.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.bottom;
  });
  console.log(`Toast container bottom: ${toastBottom}`);
  // Should be around 75px (5-10px above the 64px mobile nav + some margin)
  if (parseInt(toastBottom) <= 80) {
    console.log('✓ Toast position is close to bottom menu');
  } else {
    console.log('✗ Toast position might be too high');
  }
  
  // Test 2: Check Tinder card height
  console.log('\nTest 2: Checking Tinder card height...');
  await page.click('.nav-btn[data-mode="tinder"]');
  await page.waitForTimeout(500);
  
  const tinderStack = await page.locator('.tinder-stack');
  const stackHeight = await tinderStack.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.height;
  });
  console.log(`Tinder stack height: ${stackHeight}`);
  if (parseInt(stackHeight) >= 500) {
    console.log('✓ Tinder card height is increased');
  } else {
    console.log('✗ Tinder card height might not be tall enough');
  }
  
  // Test 3: Check Tinder button color change on click
  console.log('\nTest 3: Checking Tinder button color animation...');
  
  // Click the like button
  const likeBtn = page.locator('.tinder-btn.like');
  await likeBtn.click();
  
  // Check if pressed class is added
  const hasPressedClass = await likeBtn.evaluate(el => el.classList.contains('pressed'));
  console.log(`Like button has pressed class after click: ${hasPressedClass}`);
  
  // Wait for 300ms and check if class is removed
  await page.waitForTimeout(350);
  const hasPressedClassAfter = await likeBtn.evaluate(el => el.classList.contains('pressed'));
  console.log(`Like button has pressed class after 350ms: ${hasPressedClassAfter}`);
  
  if (hasPressedClass && !hasPressedClassAfter) {
    console.log('✓ Button color animation works (300ms)');
  } else {
    console.log('✗ Button color animation might not work correctly');
  }
  
  // Test 4: Check refresh button color animation
  console.log('\nTest 4: Checking refresh button color animation...');
  await page.click('.nav-btn[data-mode="grid"]');
  await page.waitForTimeout(300);
  
  const refreshBtn = page.locator('.action-btn[onclick="refreshAll()"]');
  await refreshBtn.click();
  await page.waitForTimeout(50);
  
  const refreshColor = await refreshBtn.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.color;
  });
  console.log(`Refresh button color after click: ${refreshColor}`);
  
  await page.waitForTimeout(350);
  const refreshColorAfter = await refreshBtn.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.color;
  });
  console.log(`Refresh button color after 350ms: ${refreshColorAfter}`);
  
  // Test 5: Check Nope auto-delete timestamp
  console.log('\nTest 5: Checking nope timestamp storage...');
  
  // Go back to grid and click nope on first card
  await page.click('.nav-btn[data-mode="grid"]');
  await page.waitForTimeout(300);
  
  const firstCardNopeBtn = page.locator('.card .nope-btn').first();
  await firstCardNopeBtn.click();
  await page.waitForTimeout(200);
  
  // Check localStorage for nope timestamp
  const nopeTimestamp = await page.evaluate(() => {
    const timestamps = JSON.parse(localStorage.getItem('mediaPulseNopeTimestamps') || '{}');
    const keys = Object.keys(timestamps);
    return keys.length > 0 ? timestamps[keys[0]] : null;
  });
  
  if (nopeTimestamp) {
    console.log(`✓ Nope timestamp saved: ${nopeTimestamp}`);
    const isRecent = Date.now() - nopeTimestamp < 5000;
    if (isRecent) {
      console.log('✓ Timestamp is recent (within 5 seconds)');
    }
  } else {
    console.log('✗ Nope timestamp not found');
  }
  
  // Test 6: Check mobile nav animation styles
  console.log('\nTest 6: Checking mobile nav animation styles...');
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone size
  await page.waitForTimeout(300);
  
  const mobileNavBtn = await page.locator('.mobile-nav-btn').first();
  const hasTransition = await mobileNavBtn.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.transition;
  });
  console.log(`Mobile nav button transition: ${hasTransition}`);
  
  const mobileNavIcon = await page.locator('.mobile-nav-btn .mobile-nav-icon').first();
  const iconHasTransition = await mobileNavIcon.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.transition;
  });
  console.log(`Mobile nav icon transition: ${iconHasTransition}`);
  
  if (hasTransition.includes('background') && iconHasTransition.includes('transform')) {
    console.log('✓ Mobile nav animations are properly configured');
  } else {
    console.log('✗ Mobile nav animations might not be properly configured');
  }
  
  console.log('\n=== All tests completed ===');
  
  await browser.close();
})();
