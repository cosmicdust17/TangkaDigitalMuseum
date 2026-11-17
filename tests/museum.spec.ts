import { test,expect } from '@playwright/test'
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
const artworks=JSON.parse(readFileSync('public/artworks.json','utf8'))
async function ready(page:any){await page.goto('./');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('.loading')).toHaveCount(0);await expect(page.locator('.error')).toHaveCount(0);await page.waitForTimeout(1200)}
async function pixels(page:any){return sharp(await page.locator('canvas').screenshot()).resize(200,120).raw().toBuffer()}
function difference(a:Buffer,b:Buffer){let d=0;for(let i=0;i<a.length;i++)d+=Math.abs(a[i]-b[i]);return d/a.length}
test('8 real local images and matching details; no browser errors',async({page,request})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page)
 for(const a of artworks){const response=await request.get(a.image);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/jpeg');await page.locator('.collection-index button').filter({hasText:a.title}).click();await expect(page.locator('.detail h2')).toHaveText(a.title);await expect(page.locator('.detail .english')).toHaveText(a.title_en);await expect(page.locator('.detail')).toContainText(a.accession_number);await expect(page.locator('.source-link')).toHaveAttribute('href',a.source_url);await expect(page.locator('.detail-image img')).toHaveJSProperty('naturalWidth',a.image_hd_width||a.width);await page.getByRole('button',{name:'关闭作品详情'}).click()}
 expect(errors).toEqual([])
})
test('raycaster selects painting, switches selection and closes',async({page})=>{
 await ready(page);await page.locator('.collection-index button').nth(6).click();await page.waitForTimeout(1200);await page.keyboard.press('Escape');await page.waitForTimeout(450)
 const box=(await page.locator('canvas').boundingBox())!;await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await expect(page.locator('.detail h2')).toHaveText(artworks[6].title)
 await page.locator('.collection-index button').nth(7).click();await expect(page.locator('.detail h2')).toHaveText(artworks[7].title);await page.getByRole('button',{name:'关闭作品详情'}).click();await expect(page.locator('.detail')).toHaveCount(0)
})
test('rotation, wheel zoom, right pan, buttons and reset alter real rendered view',async({page})=>{
 await ready(page);const original=await pixels(page);await page.screenshot({path:"verification/reset-original.png"});const box=(await page.locator('canvas').boundingBox())!;const x=box.x+box.width*.65,y=box.y+box.height*.55
 async function reset(){await page.getByRole('button',{name:'恢复初始视角',exact:true}).click();await page.waitForTimeout(1500);await page.screenshot({path:"verification/reset-after.png"});expect(difference(original,await pixels(page))).toBeLessThan(2)}
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+120,y+30,{steps:15});await page.mouse.up();await page.waitForTimeout(650);expect(difference(original,await pixels(page))).toBeGreaterThan(2);await expect(page.locator('.detail')).toHaveCount(0);await reset()
 await page.mouse.move(x,y);await page.mouse.wheel(0,-400);await page.waitForTimeout(700);expect(difference(original,await pixels(page))).toBeGreaterThan(2);await reset()
 await page.mouse.move(x,y);await page.mouse.down({button:'right'});await page.mouse.move(x+100,y,{steps:15});await page.mouse.up({button:'right'});await page.waitForTimeout(650);expect(difference(original,await pixels(page))).toBeGreaterThan(2);await reset()
 await page.getByRole('button',{name:'放大',exact:true}).click();await page.waitForTimeout(400);expect(difference(original,await pixels(page))).toBeGreaterThan(2);await page.getByRole('button',{name:'缩小',exact:true}).click();await reset()
})
test('drag ending over focused painting does not select; fullscreen works',async({page})=>{
 await ready(page);await page.locator('.collection-index button').nth(6).click();await page.waitForTimeout(1200);await page.keyboard.press('Escape');await page.waitForTimeout(450);const box=(await page.locator('canvas').boundingBox())!;const x=box.x+box.width/2,y=box.y+box.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+25,y,{steps:6});await page.mouse.move(x,y,{steps:6});await page.mouse.up();await expect(page.locator('.detail')).toHaveCount(0)
 await page.getByRole('button',{name:'⛶ 全屏'}).click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await page.evaluate(()=>document.exitFullscreen())
})
test('1920, laptop and mobile layout stays within viewport',async({page})=>{
 for(const [width,height] of [[1920,1080],[1366,768],[390,844]]){await page.setViewportSize({width,height});await ready(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`verification/hall-${width}.png`});await page.locator('.collection-index button').nth(0).click();await expect(page.locator('.detail h2')).toHaveText(artworks[0].title);const d=(await page.locator('.detail').boundingBox())!;expect(d.x).toBeGreaterThanOrEqual(0);expect(d.x+d.width).toBeLessThanOrEqual(width+1);await expect(page.locator(".detail-image img")).toHaveJSProperty("naturalWidth",artworks[0].image_hd_width);await page.waitForTimeout(1200);await page.screenshot({path:`verification/detail-${width}.png`})}
})
test('empty collection, invalid data and missing image have visible feedback',async({page})=>{
 await page.route('**/artworks.json',r=>r.fulfill({json:[]}));await page.goto('./');await expect(page.locator('.error')).toContainText('暂无可展示');await page.unroute('**/artworks.json')
 await page.route('**/artworks.json',r=>r.fulfill({json:[{id:'bad'}]}));await page.reload();await expect(page.locator('.error')).toContainText('格式异常');await page.unroute('**/artworks.json')
 await page.route('**/artworks/*.jpg',r=>r.abort());await page.reload();await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('.notice')).toContainText('图片暂未加载')
})
