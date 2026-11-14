import assert from 'node:assert/strict';
import { TANG_MA_ACTIONS, TANG_MA_COMBO_TIMES, tangMaPose } from '../src/game/tang-ma-animation.js';
import { TANG_MA_FX } from '../src/game/tang-ma-fx.js';
import '../src/game/pixelfx.js';
for(const [action,spec] of Object.entries(TANG_MA_ACTIONS)) for(let t=0;t<spec.duration+0.1;t+=1/60){
 const p=tangMaPose(action,t);for(const key of ['bossX','bossY','bossScale','targetX','targetY','cameraX','bossOpacity'])assert(Number.isFinite(p[key]),`${action} ${key}`);
 assert(p.row>=0&&p.row<4&&p.index>=0&&p.index<4);
}
assert(tangMaPose('skill1',1.42).bossX>260);assert(tangMaPose('skill1',1.43).events.some(e=>e.kind==='gold_blast'));
assert.equal(tangMaPose('skill2',2).bossScale,2);
assert(tangMaPose('skill3',2).targetX<715);assert(tangMaPose('skill3',4).bossY<430);assert(tangMaPose('skill3',5).events.some(e=>e.kind==='slam'));
for(const berserk of [false,true]){
 let previous=0;const speed=berserk?2:1;
 for(let i=0;i<16;i++){const t=.52+TANG_MA_COMBO_TIMES[i]/speed+.0001;const p=tangMaPose('skill4',t,{berserk});assert.equal(p.hitCount,i+1);assert.equal(p.events.length,16);assert(p.targetX>=previous);previous=p.targetX;}
}
const P=globalThis.PK_PIXELFX; const frame=P.createFrame(480,270);
for(const [kind,def] of Object.entries(TANG_MA_FX)){
 P.clearFrame(frame);const fx=P.createFx(def,{x:240,y:135});fx.update(Math.min(.15,def.meta.duration/2));fx.draw(frame);assert(frame.color.some(x=>x!==0)||frame.light.some(x=>x!==0),`${kind} drew nothing`);
}
console.log(`Táng Ma: ${Object.keys(TANG_MA_ACTIONS).length} actions, 4 skills, 16 combo hits, ${Object.keys(TANG_MA_FX).length} PixelFX passed.`);
