import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};
const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');const {game,player,dummy,settings,motion}=await import('../src/game/state.js');const {getThoThuan,fxClear,targetPosition}=await import('../src/game/skills.js');const {dummyDamage,dummyHitTest,npcShape}=await import('../src/game/character.js');const {resetPhongLang,getPhongLang,updatePhongLang,phongLangPose,PHONG_LANG_SPEC}=await import('../src/game/phong-lang.js');const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment}=await import('../src/game/va-cham-ky-nang.js');
function reset(){game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:()=>false};settings.fxQuality='off';settings.character='diep_tu';Object.assign(player,{x:400,y:499.5,hp:1200,maxHp:1200,mana:250,maxMana:250,defenseReduction:0,facing:1,stun:0,shieldActive:false});Object.assign(dummy,{x:700,y:499.5,vx:0,vy:0,hp:PHONG_LANG_SPEC.hp,maxHp:PHONG_LANG_SPEC.hp,skin:'phong_lang',visible:true,broken:false,stun:0,recoil:0,trapped:false,slow:0,shieldActive:false,swordShield:null,facing:-1});getThoThuan().active=false;motion.action=null;fxClear();return resetPhongLang()}
function advance(seconds,dt=1/60){for(let i=0;i<Math.round(seconds/dt);i++){beginSkillCollisionFrame(()=>{});updatePhongLang(dt);endSkillCollisionFrame()}}
for(const dt of [1/30,1/60]){let w=reset();dummy.x=490;w.biteCooldown=0;advance(.32,dt);assert.equal(player.hp,1145,'bite hits once');advance(.2,dt);assert.equal(player.hp,1145,'bite does not repeat');}
console.log('PASS bite telegraph, damage and one hit at 30/60 FPS');
let w=reset();dummy.x=490;w.biteCooldown=0;player.shieldActive=true;getThoThuan().active=true;advance(.5);assert.equal(player.hp,1200);assert.ok(player.mana<250);console.log('PASS shield blocks bite');
for(const dt of [1/30,1/60]){w=reset();dummy.x=900;w.windCooldown=0;advance(.5,dt);assert.equal(w.shots.length,1,'launches tornado');advance(1.5,dt);assert.ok(player.hp<1200,'tornado hits');assert.equal(w.shots.length,0)}console.log('PASS tornado launches at range and reaches player at 30/60 FPS');
w=reset();dummy.x=900;w.windCooldown=0;advance(.5);assert.equal(w.shots.length,1);const shot=w.shots[0];beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:{},side:'player',kind:'fireball',power:999,x0:shot.x,y0:shot.y,x1:shot.x,y1:shot.y,radius:30});updatePhongLang(1/60);endSkillCollisionFrame();assert.equal(shot.live,false,'tornado destroyed by stronger spell');console.log('PASS tornado can clash with player skill');
w=reset();const before=dummy.x;w.windCooldown=99;advance(1);assert.ok(dummy.x<before);assert.ok(dummy.x-player.x>=77);assert.deepEqual(npcShape(),{half:48,height:78});assert.equal(dummyHitTest(dummy.x,dummy.y-40),true);assert.equal(targetPosition('dummy').y,dummy.y-50);dummyDamage(999,{notice:false});assert.equal(dummy.broken,true);advance(.91);assert.ok(w.defeatTime>=.9);console.log('PASS chase, collision shape, targeting and defeat');

for(const dt of [1/30,1/60]){const w=reset();dummy.x=640;w.windCooldown=99;w.leapCooldown=0;advance(dt,dt);assert.equal(w.phase,'leap');const startY=dummy.y;advance(.3,dt);assert.ok(dummy.y<startY-50,'wolf jumps visibly');assert.ok(Math.abs(dummy.x-player.x)>=65,'wolf does not overlap player');advance(.35,dt);assert.equal(w.phase,'idle');assert.equal(dummy.flying,false);assert.ok(Math.abs(dummy.y-499.5)<.001);assert.ok(w.leapCooldown>4);}
console.log('PASS leap approaches, avoids overlap, lands and cools down at 30/60 FPS');

for(const condition of ['stun','trapped','recoil']){
 const w=reset();dummy.x=900;w.windCooldown=0;advance(.2);assert.equal(w.phase,'wind');dummy[condition]=condition==='trapped'?true:2;advance(.6);assert.equal(w.phase,'idle','control interrupts casting');assert.equal(w.shots.length,0,'no projectile while controlled');assert.equal(phongLangPose().row,3);assert.equal(phongLangPose().controlled,true);
}
console.log('PASS control interrupts casting and selects reaction poses');
for(const dt of [1/30,1/60]){
 const w=reset();dummyDamage(999,{notice:false});const frames=[];for(let i=0;i<Math.round(1.08/dt);i++){advance(dt,dt);frames.push(phongLangPose().frame)}assert.ok([0,1,2,3].every(f=>frames.includes(f)),'death plays all four collapse poses');assert.equal(phongLangPose().alpha,1,'body remains visible on the ground');advance(.3,dt);assert.ok(phongLangPose().alpha<1&&phongLangPose().alpha>0,'body fades only after collapse');advance(.2,dt);assert.ok(w.defeatTime>=PHONG_LANG_SPEC.defeatDuration);
}
console.log('PASS defeat plays collapse, holds the body and then fades');
const {WIND_TORNADO_FX}=await import('../src/game/phong-lang-fx.js');
for(const t of [.08,.5,1.5,2.5]){const fx=window.PK_PIXELFX.createFx(WIND_TORNADO_FX,{x:64,y:64});const frame=window.PK_PIXELFX.createFrame(128,128);fx.update(t);fx.draw(frame);assert.ok(frame.color.some(x=>x!==0),'tornado renders visible pixels');}
console.log('PASS expanded tornado renders at several stages');
w=reset();player.hp=600;player.mana=100;player.lifeSteal=.06;player.manaSteal=.02;dummy.hp=30;dummyDamage(100,{notice:false});assert.equal(player.hp,601.8);assert.equal(player.mana,100.6);
w=reset();player.hp=600;player.mana=100;player.lifeSteal=.06;player.manaSteal=.02;dummyDamage(40,{notice:false,isDot:true});assert.equal(player.hp,600);assert.equal(player.mana,100);
w=reset();player.hp=600;player.mana=100;player.lifeSteal=.06;player.manaSteal=.02;dummy.shieldActive=true;dummy.mana=100;dummyDamage(40,{notice:false});assert.equal(player.hp,600);assert.equal(player.mana,100);
console.log('PASS skill drain uses actual HP damage, excludes DoT and blocked damage');
