const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  // Get the absolute path to the HTML file
  const path = require('path');
  const filePath = 'file://' + path.resolve('index.html');
  
  console.log('Loading:', filePath);
  await page.goto(filePath);
  
  // Wait for the page to load
  await page.waitForSelector('.masonry');
  await page.waitForTimeout(1000);
  
  // Test 1: Check initial state (medium)
  console.log('\n--- Test 1: Initial state (medium) ---');
  let cardSize = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--card-size').trim());
  let columnCount = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--column-count').trim());
  console.log('Card size:', cardSize);
  console.log('Column count:', columnCount);
  
  // Get the actual columns from the masonry element
  let masonryColumns = await page.evaluate(() => {
    const el = document.querySelector('.masonry');
    return getComputedStyle(el).columnCount;
  });
  console.log('Masonry actual column-count:', masonryColumns);
  
  // Test 2: Click small button
  console.log('\n--- Test 2: Click Small (S) button ---');
  await page.click('button[onclick="setCardSize(\'small\')"]');
  await page.waitForTimeout(500);
  
  cardSize = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--card-size').trim());
  columnCount = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--column-count').trim());
  masonryColumns = await page.evaluate(() => getComputedStyle(document.querySelector('.masonry')).columnCount);
  console.log('Card size:', cardSize);
  console.log('Column count:', columnCount);
  console.log('Masonry actual column-count:', masonryColumns);
  
  // Check if S button has active class
  let sBtnActive = await page.evaluate(() => {
    const btn = document.querySelector('button[onclick="setCardSize(\'small\')"]');
    return btn.classList.contains('active');
  });
  console.log('Small button active:', sBtnActive);
  
  // Test 3: Click large button
  console.log('\n--- Test 3: Click Large (L) button ---');
  await page.click('button[onclick="setCardSize(\'large\')"]');
  await page.waitForTimeout(500);
  
  cardSize = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--card-size').trim());
  columnCount = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--column-count').trim());
  masonryColumns = await page.evaluate(() => getComputedStyle(document.querySelector('.masonry')).columnCount);
  console.log('Card size:', cardSize);
  console.log('Column count:', columnCount);
  console.log('Masonry actual column-count:', masonryColumns);
  
  // Test 4: Click medium button
  console.log('\n--- Test 4: Click Medium (M) button ---');
  await page.click('button[onclick="setCardSize(\'medium\')"]');
  await page.waitForTimeout(500);
  
  cardSize = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--card-size').trim());
  columnCount = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--column-count').trim());
  masonryColumns = await page.evaluate(() => getComputedStyle(document.querySelector('.masonry')).columnCount);
  console.log('Card size:', cardSize);
  console.log('Column count:', columnCount);
  console.log('Masonry actual column-count:', masonryColumns);
  
  // Verify the column count changes between sizes
  console.log('\n--- Verification ---');
  await page.click('button[onclick="setCardSize(\'small\')"]');
  await page.waitForTimeout(300);
  let smallCols = await page.evaluate(() => getComputedStyle(document.querySelector('.masonry')).columnCount);
  
  await page.click('button[onclick="setCardSize(\'large\')"]');
  await page.waitForTimeout(300);
  let largeCols = await page.evaluate(() => getComputedStyle(document.querySelector('.masonry')).columnCount);
  
  console.log('Small columns:', smallCols);
  console.log('Large columns:', largeCols);
  
  if (parseInt(smallCols) > parseInt(largeCols)) {
    console.log('✓ SUCCESS: Small size has MORE columns than large (as expected)');
  } else {
    console.log('✗ FAILED: Column count not changing correctly');
  }
  
  await browser.close();
  console.log('\nTest complete!');
})();
