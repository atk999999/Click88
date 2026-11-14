import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};
const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,motion}=await import('../src/game/state.js');
const {getThoThuan,fxClear,targetPosition,explodeFireball}=await import('../src/game/skills.js');const {dummyDamage,dummyHitTest,npcShape}=await import('../src/game/character.js');
const {resetHacHoaXa,updateHacHoaXa,hacHoaXaPose,HAC_HOA_XA_SPEC,resetSnakePoison,updateSnakePoison,getSnakePoison,applySnakePoison}=await import('../src/game/hac-hoa-xa.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment}=await import('../src/game/va-cham-ky-nang.js');
function reset(flyer=false){game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:()=>false};settings.fxQuality='off';Object.assign(player,{x:400,y:499.5,hp:1200,maxHp:1200,mana:250,maxMana:250,defenseReduction:0,facing:1,stun:0,shieldActive:false});Object.assign(dummy,{x:740,y:flyer?339.5:499.5,vx:0,vy:0,hp:HAC_HOA_XA_SPEC.hp,maxHp:HAC_HOA_XA_SPEC.hp,skin:'hac_hoa_xa',visible:true,broken:false,stun:0,recoil:0,trapped:false,slow:0,shieldActive:false,swordShield:null,facing:-1});getThoThuan().active=false;motion.action=null;fxClear();resetSnakePoison();return resetHacHoaXa(flyer);}
function advance(s,dt=1/60){for(let i=0;i<Math.round(s/dt);i++){beginSkillCollisionFrame(()=>{});updateHacHoaXa(dt);endSkillCollisionFrame();}}
for(const dt of [1/30,1/60]){let a=reset();a.fangCooldown=0;a.lungeCooldown=99;advance(.65,dt);assert.equal(a.shots.length,1);advance(1.5,dt);assert.equal(player.hp,1145);assert.equal(getSnakePoison().remaining,5);updateSnakePoison(5);assert.equal(player.hp,1085);assert.equal(getSnakePoison().remaining,0);}
console.log('PASS Độc Nha hits once and poison ticks five times at 30/60 FPS');
{let a=reset();getThoThuan().active=true;player.shieldActive=true;a.fangCooldown=0;a.lungeCooldown=99;advance(2);assert.equal(player.hp,1200);assert.equal(getSnakePoison().remaining,0);assert.ok(player.mana<250);}
console.log('PASS shield stops the initial fang and poison');
{reset();applySnakePoison();updateSnakePoison(2);assert.equal(player.hp,1176);applySnakePoison();assert.equal(getSnakePoison().remaining,5);updateSnakePoison(5);assert.equal(player.hp,1116,'refresh does not stack damage');}
console.log('PASS poison refreshes without stacking');
{let a=reset();a.fangCooldown=0;a.lungeCooldown=99;advance(.65);const shot=a.shots[0];beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:{},side:'player',kind:'fireball',power:999,x0:shot.x,y0:shot.y,x1:shot.x,y1:shot.y,radius:30});updateHacHoaXa(1/60);endSkillCollisionFrame();assert.equal(shot.live,false);}
console.log('PASS venom collides with player skills');
for(const dt of [1/30,1/60]){const a=reset();a.fangCooldown=99;a.lungeCooldown=0;advance(dt,dt);assert.equal(a.phase,'lungeWindup');advance(1.3,dt);assert.equal(player.hp,1110);assert.equal(getSnakePoison().remaining,0);advance(.5,dt);assert.equal(player.hp,1110);}
console.log('PASS telegraphed lunge hits once');
for(const control of ['stun','trapped','recoil']){const a=reset(true);a.fangCooldown=0;a.lungeCooldown=99;advance(.2);dummy[control]=control==='trapped'?true:2;advance(.7);assert.equal(a.phase,'move');assert.equal(a.shots.length,0);assert.equal(hacHoaXaPose().mode,'controlled');}
console.log('PASS control interrupts attacks and selects reaction');
{const a=reset(true);assert.equal(npcShape().half,225);assert.equal(dummyHitTest(dummy.x,dummy.y-45),true);assert.equal(targetPosition('dummy').y,dummy.y-85);dummyDamage(9999,{notice:false});assert.equal(dummy.broken,true);const y=dummy.y;advance(.2);assert.ok(dummy.y>y);advance(2);assert.equal(a.defeatedReady,true);assert.equal(hacHoaXaPose().alpha,0);}
console.log('PASS flying death falls, lands and fades');
const {VENOM_FANG_FX}=await import('../src/game/hac-hoa-xa-fx.js');for(const t of [.1,.7,2.5]){const f=window.PK_PIXELFX.createFrame(128,96),fx=window.PK_PIXELFX.createFx(VENOM_FANG_FX,{x:64,y:48});fx.update(t);fx.draw(f);assert.ok(f.color.some(x=>x!==0));}console.log('PASS venom PixelFX renders');

{reset();const x=dummy.x+190,y=dummy.y-80;assert.equal(dummyHitTest(x,y),true);explodeFireball({radius:20,chargeTime:1},x,y);assert.ok(dummy.hp<dummy.maxHp,'fireball deals damage at edge of giant body');}
console.log('PASS enlarged body and outer-edge fireball damage');
