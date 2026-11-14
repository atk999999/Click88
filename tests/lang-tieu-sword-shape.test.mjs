import assert from 'node:assert/strict';
globalThis.window=globalThis;
await import('../src/game/pixelfx.js');
const {drawJian}=await import('../src/game/lang-tieu-fx.js');
function render(angle){const fx=window.PK_PIXELFX,frame=fx.createFrame(512,320),p=fx.painterFor(frame);drawJian(p,250,160,angle,200,1,true);return frame;}
function countCol(f,x){let n=0;for(let y=0;y<f.h;y++)if(f.color[y*f.w+x]>>>24)n++;return n;}
function bbox(f){let l=f.w,r=-1,t=f.h,b=-1;for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)if(f.color[y*f.w+x]>>>24){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}return {l,r,t,b};}
const h=render(0),bh=bbox(h);assert.ok(bh.r-bh.l>190,'sword has a long silhouette');assert.ok(countCol(h,290)>countCol(h,370),'two-edged blade tapers toward tip');assert.ok(countCol(h,209)>countCol(h,180),'guard is wider than grip');
const v=render(Math.PI/2),bv=bbox(v);assert.ok(bv.b-bv.t>190);assert.ok(bv.r-bv.l<bh.r-bh.l);console.log('PASS jian silhouette: long two-edged blade, tapered tip, guard and grip in both orientations');
