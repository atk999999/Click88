import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};
const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,motion,setCombatTargets,useDummy}=await import('../src/game/state.js');
const {resetMotion,moveBody,updateAction}=await import('../src/game/character.js');
const {MONSTER_SKILLS,castMonsterSkill,updateMonsterSkills,resetMonsterSkills,getMonsterSkillCooldown,getMonsterDash,updateMonsterDash}=await import('../src/game/ky-nang-quai.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment,resetSkillCollisions}=await import('../src/game/va-cham-ky-nang.js');
function reset(){resetMonsterSkills();resetSkillCollisions();useDummy();setCombatTargets(null);game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:(x,y)=>y>=500};settings.fxQuality='off';Object.assign(player,{x:400,y:499,hp:1200,maxHp:1200,mana:250,maxMana:250,defenseReduction:0,realmTier:2,realmId:'truc_co',facing:1,stun:0,shieldActive:false,grounded:true,flying:false,vx:0,vy:0});Object.assign(dummy,{x:600,y:499,hp:2000,maxHp:2000,skin:'phong_lang',visible:true,broken:false,stun:0,recoil:0,trapped:false,slow:0,shieldActive:false,swordShield:null,realmTier:2,defenseReduction:0});resetMotion();}
function advance(sec,dt=1/60){for(let i=0;i<Math.round(sec/dt);i++){updateAction(dt);const d=getMonsterDash();if(d){let x=player.x,y=player.y;moveBody(d.dir*MONSTER_SKILLS[d.id].speed*Math.min(dt,d.remaining),0,{ignoreNpc:true});updateMonsterDash(dt,x,y);}beginSkillCollisionFrame(()=>{});updateMonsterSkills(dt);endSkillCollisionFrame();}}
for(const id of Object.keys(MONSTER_SKILLS)){for(const dt of [1/30,1/60]){reset();assert.equal(castMonsterSkill(id),true,id);assert.equal(player.mana,250-MONSTER_SKILLS[id].mana);assert.ok(getMonsterSkillCooldown(id)>0);assert.equal(castMonsterSkill(id),false,'cannot spam');advance(1.8,dt);assert.ok(dummy.hp<2000,id+' damages the target');if(MONSTER_SKILLS[id].attack==='dash')assert.ok(player.x>dummy.x,'dash crosses the target');}console.log('PASS player technique '+id+' at 30/60 FPS');}
{reset();assert.equal(castMonsterSkill('snake_fang'),true);advance(1);const after=dummy.hp;assert.ok(dummy.monsterPoison);advance(5.1);assert.ok(dummy.hp<=after-50,'venom damages over time');assert.equal(dummy.monsterPoison,undefined);}
console.log('PASS learned venom applies and expires poison');
{reset();dummy.shieldActive=true;dummy.mana=250;assert.equal(castMonsterSkill('snake_fang'),true);advance(2);assert.equal(dummy.hp,2000);assert.equal(dummy.monsterPoison,undefined);}
console.log('PASS target shield blocks learned venom and poison');
{reset();player.mana=1;assert.equal(castMonsterSkill('wolf_wind'),false);assert.equal(getMonsterSkillCooldown('wolf_wind'),0);}
console.log('PASS insufficient mana never starts cooldown');
const {BEAST_ATTACK_FX}=await import('../src/game/quai-skill-fx.js');for(const style of ['wind','lightning','venom'])for(const t of [.1,.3,.5]){const f=window.PK_PIXELFX.createFrame(160,160),fx=window.PK_PIXELFX.createFx(BEAST_ATTACK_FX,{x:80,y:80,style});fx.update(t);fx.draw(f);assert.ok(f.color.some(x=>x!==0),style);}
console.log('PASS all three monster attack palettes render with PixelFX');

{reset();assert.equal(castMonsterSkill('wolf_wind'),true);beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:{},side:'boss',kind:'blood_hand',power:999,x0:470,y0:434,x1:470,y1:434,radius:45});updateMonsterSkills(.1);endSkillCollisionFrame();advance(2);assert.equal(dummy.hp,2000,'opposing spell destroys learned projectile before reaching target');}
console.log('PASS learned projectile collides with enemy skills');
{reset();const target2={...dummy,x:690,hp:2000,broken:false,_targetId:'second'};setCombatTargets([dummy,target2]);assert.equal(castMonsterSkill('eagle_dive'),true);advance(.8);assert.ok(dummy.hp<2000&&target2.hp<2000,'dash crosses and hits multiple enemies');}
console.log('PASS dash hits separate targets once');
{reset();assert.equal(castMonsterSkill('snake_fang'),true);resetMonsterSkills();advance(2);assert.equal(dummy.hp,2000,'reset clears projectiles');}
console.log('PASS resetting run clears learned projectile');
