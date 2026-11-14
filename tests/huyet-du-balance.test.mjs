import assert from 'node:assert/strict';
const cls={add(){},remove(){},toggle(){}};
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem(){}};
globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute(){}}),querySelector:()=>null,querySelectorAll:()=>[],createElement(){const ctx={save(){},restore(){},clearRect(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})};return {width:1,height:1,getContext:()=>ctx}}};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,motion,movementSpeed}=await import('../src/game/state.js');
const {getThoThuan,receivePlayerDamage}=await import('../src/game/skills.js');
const {dummyDamage}=await import('../src/game/character.js');
const {shieldHitManaCost}=await import('../src/game/tho-thuan.js');
const {createThonLinhHuyetState,stepThonLinhHuyet,THON_LINH_HUYET_SPEC}=await import('../src/game/thon-linh-huyet.js');
const {createHuyetThuState,stepHuyetThu}=await import('../src/game/huyet-thu.js');
const {createHuyetKimTuyenState,stepHuyetKimTuyen}=await import('../src/game/huyet-kim-tuyen.js');
const {createHuyetBaoState,castHuyetBao,stepHuyetBao}=await import('../src/game/huyet-bao.js');
game.running=true;game.battlePhase='fight';settings.character='diep_tu';
function reset(){Object.assign(player,{x:100,y:500,hp:1200,maxHp:1200,mana:250,maxMana:250,shieldActive:false,stun:0,facing:1,defenseReduction:0});Object.assign(dummy,{x:300,y:500,hp:3000,maxHp:3000,mana:300,maxMana:300,shieldActive:false,skin:'huyet_du',swordShield:null,visible:true,broken:false,hitSequence:0,stun:0});motion.action=null;getThoThuan().active=false;}
reset(); assert.equal(shieldHitManaCost(100),25);assert.equal(shieldHitManaCost(100,true),22);
for (const character of ['diep_tu','huyet_du']) {reset();settings.character=character;player.shieldActive=true;getThoThuan().active=true;const hit=receivePlayerDamage(100,{notice:false});assert.equal(hit.manaSpent,25);assert.equal(player.hp,1200);assert.equal(player.mana,225);}
reset();dummy.shieldActive=true;dummyDamage(100,{notice:false});assert.equal(dummy.mana,275);assert.equal(dummy.hp,3000);
reset();player.shieldActive=true;getThoThuan().active=true;player.mana=10;const heavy=receivePlayerDamage(1000,{notice:false});assert.equal(heavy.broken,true);assert.equal(player.hp,1200);assert.equal(player.mana,0);assert.equal(player.shieldActive,false);
console.log('PASS reduced matching shield cost for both characters and enemy; break blocks final hit');
function siphon(fps,shielded=false,boss=false){reset();const s=createThonLinhHuyetState();s.phase='drain';s.t=0;const caster=boss?dummy:player,target=boss?player:dummy;caster.hp=500;caster.mana=100;if(shielded){target.shieldActive=true;if(boss)getThoThuan().active=true;}
if(boss){s.damageTarget=(victim,amount)=>receivePlayerDamage(amount,{isDot:true,notice:false}).hpLost;}
for(let i=0;i<fps*6;i++)stepThonLinhHuyet(s,1/fps,caster,target);
return {hp:target.hp,mp:target.mana,casterHp:caster.hp,casterMp:caster.mana,s};}
for(const boss of [false,true])for(const shielded of [false,true]){const a=siphon(30,shielded,boss),b=siphon(60,shielded,boss),c=siphon(120,shielded,boss);for(const k of ['hp','mp','casterHp','casterMp'])assert.ok(Math.abs(a[k]-b[k])<.01 && Math.abs(a[k]-c[k])<.01,`${k} stable over FPS`);if(shielded){assert.equal(a.hp,boss?1200:3000);assert.equal(a.casterHp,500);assert.ok(a.mp>=189.9);}else {assert.ok(Math.abs(a.s.totalDrainHp-150)<.01);assert.ok(Math.abs(a.s.totalDrainMp-90)<.01);assert.ok(Math.abs(a.casterHp-623)<.01);assert.ok(Math.abs(a.casterMp-173.8)<.01);}}
console.log('PASS siphon 6s damage, mana drain, healing and shield at 30/60/120 FPS');
for (const fps of [30,60,120]) {reset();let count=0;const h=createHuyetThuState();h.targetBleed.active=true;h.targetBleed.targetRef=dummy;h.targetBleed.timeLeft=8;h.damageTarget=()=>{count++;return 1};for(let i=0;i<fps*8+1;i++)stepHuyetThu(h,1/fps,player,dummy);assert.equal(count,10,`Huyet Thu ticks ${fps}`);
count=0;const k=createHuyetKimTuyenState();k.bleedTimer=6;k.targetRef=dummy;k.damageTarget=()=>{count++;return 1};for(let i=0;i<fps*6+1;i++)stepHuyetKimTuyen(k,1/fps,player,dummy);assert.equal(count,8,`Kim Tuyen ticks ${fps}`);}
console.log('PASS Huyết Thủ 8s and Kim Tuyến 6s bleed ticks at 30/60/120 FPS');
reset();const b=createHuyetBaoState();const caster={x:20,y:-1400,hp:90,maxHp:1000};const target={x:4780,y:2380,hp:3000,broken:false};let hits=0;let amount=0;b.damageTarget=(victim,dmg)=>{hits++;amount=dmg;return dmg};assert.equal(castHuyetBao(b,caster),true);assert.equal(castHuyetBao(b,caster),false);for(let i=0;i<60*9;i++)stepHuyetBao(b,1/60,caster,target);assert.equal(hits,1);assert.equal(amount,910);assert.equal(caster.hp,10);assert.equal(b.usedOnce,true);console.log('PASS Huyết Bạo once, lost HP damage, 1% HP and full height/width coverage');

assert.equal(movementSpeed(true,false,100),174);assert.equal(movementSpeed(false,false,100),342);assert.equal(movementSpeed(true,true,100),290);assert.equal(movementSpeed(false,true,100),570);assert.equal(movementSpeed(false,false,150),513);console.log('PASS walking and running are 20% faster, flight unchanged, speed setting applies');
const {castHuyetThu}=await import('../src/game/huyet-thu.js');
const {beginHuyetKimTuyen,releaseHuyetKimTuyen}=await import('../src/game/huyet-kim-tuyen.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame}=await import('../src/game/va-cham-ky-nang.js');
reset();const hand=createHuyetThuState();hand.damageTarget=(victim,amount)=>{victim.hp-=amount;return amount};assert.equal(castHuyetThu(hand,player,dummy),true);for(let i=0;i<180;i++){beginSkillCollisionFrame(()=>{});stepHuyetThu(hand,1/60,player,dummy);endSkillCollisionFrame()}assert.equal(hand.hits,1);assert.ok(dummy.hp<3000);assert.equal(hand.targetBleed.active,true);assert.equal(hand.phase,'cooldown');console.log('PASS Huyết Thủ cast, impact, bleeding and cooldown');
reset();const kim=createHuyetKimTuyenState();kim.damageTarget=(victim,amount)=>{victim.hp-=amount;return amount};assert.equal(beginHuyetKimTuyen(kim,player,dummy,null),true);for(let i=0;i<60;i++)stepHuyetKimTuyen(kim,1/60,player,dummy);assert.ok(Math.abs(player.hp-1194)<.01);assert.ok(Math.abs(player.mana-238)<.01);assert.equal(releaseHuyetKimTuyen(kim),true);for(let i=0;i<180;i++){beginSkillCollisionFrame(()=>{});stepHuyetKimTuyen(kim,1/60,player,dummy);endSkillCollisionFrame()}assert.ok(kim.hits>=4);assert.ok(dummy.hp<3000);assert.ok(kim.bleedTimer>0);assert.equal(kim.phase,'cooldown');console.log('PASS Huyết Kim Tuyến charges at HP/MP rates, releases, hits and cools down');
