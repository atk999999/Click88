import assert from 'node:assert/strict';
import { backdropPlacement, drawEnvironment, surfaceAt } from '../src/game/map.js';
import { game, camera, settings } from '../src/game/state.js';

const img = { width: 1774, height: 887, name: 'surface' };
for (const [w,h] of [[960,540],[390,844],[844,390],[2560,1080]]) {
  for (const zoom of [0.175,0.5385,1]) {
    for (const x of [0,520,2400,4800]) for (const y of [-2600,-500,230,1200,2400]) {
      const p=backdropPlacement(img,w,h,{x,y},zoom);
      assert.ok(p.x<=1e-8 && p.y<=1e-8 && p.x+p.width>=w-1e-8 && p.y+p.height>=h-1e-8,'landscape covers viewport');
      const next=backdropPlacement(img,w,h,{x,y:y+1},zoom);
      assert.ok(Math.abs(next.y-p.y)<1,'vertical backdrop motion is continuous');
    }
  }
}
console.log('PASS backdrop coverage and smooth movement across camera, zoom and screen sizes');
const calls=[];
function context(name) { return {save(){},restore(){},clearRect(){},fillRect(){},createLinearGradient(x,y,x2,y2){calls.push({type:'gradient',name,y,y2});return {addColorStop(){}}},drawImage(image,...args){calls.push({type:'image',name,image,args})}} }
const main=context('main');
const layer=context('layer');
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>layer})};
game.ctx=main;game.viewW=960;game.viewH=540;game.images={surface:img,sky:{width:1672,height:941,name:'sky'},cave:{width:1664,height:936,name:'cave'}};settings.zoom=.5385;camera.x=520;
function render(y) {calls.length=0;camera.y=y;drawEnvironment();return [...calls]}
let above=render(-1500);assert.ok(above.some(c=>c.image===img));assert.ok(!above.some(c=>c.image===game.images.sky));assert.ok(!above.some(c=>c.image===game.images.cave));
let ground=render(230);assert.ok(ground.some(c=>c.image===img));assert.ok(ground.some(c=>c.image===game.images.cave && c.name==='layer'));assert.ok(!ground.some(c=>c.image===game.images.sky));
let deep=render(1800);assert.ok(deep.some(c=>c.image===game.images.cave && c.name==='main'));
const ySurface=surfaceAt(camera.x), yTransitionStart=ySurface+180;
let near=render(yTransitionStart);const fade=near.find(c=>c.type==='gradient'&&c.name==='layer');assert.ok(fade && Math.abs(fade.y-270)<1e-7);
console.log('PASS single landscape, world-space cave transition and no sky duplication');
const { Terrain } = await import('../src/game/map.js');
const transforms=[];const images=[];
const terrainCtx={drawImage(...a){images.push(a)},save(){},restore(){},translate(...a){transforms.push(['translate',...a])},scale(...a){transforms.push(['scale',...a])},fillRect(){}};
settings.zoom=.175;
Terrain.prototype.draw.call({overviewCanvas:img,cols:480,rows:240},terrainCtx,-1500,-1000,7800,2100);
assert.equal(images.length,3,'wide view paints original plus mirrored terrain on both sides');
assert.equal(transforms.filter(t=>t[0]==='scale'&&t[1]===-1).length,2,'outer tiles mirror the map to meet its edges');
console.log('PASS continuous visual ground beyond both map edges without changing collision');
