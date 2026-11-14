import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};
const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,motion,setCombatTargets,useDummy}=await import('../src/game/state.js');
const {receivePlayerDamage}=await import('../src/game/skills.js');
const {resetMotion,moveBody,updateAction}=await import('../src/game/character.js');
const {MONSTER_SKILLS,getLearnedSkill,castMonsterSkill,updateMonsterSkills,resetMonsterSkills,getMonsterSkillCooldown,getMonsterDash,updateMonsterDash}=await import('../src/game/ky-nang-quai.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment,resetSkillCollisions}=await import('../src/game/va-cham-ky-nang.js');
function reset(){resetMonsterSkills();resetSkillCollisions();useDummy();setCombatTargets(null);game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:(x,y)=>y>=500};settings.fxQuality='off';Object.assign(player,{x:400,y:499,hp:1200,maxHp:1200,mana:250,maxMana:250,defenseReduction:0,realmTier:2,realmId:'truc_co',facing:1,stun:0,shieldActive:false,grounded:true,flying:false,vx:0,vy:0});Object.assign(dummy,{x:600,y:499,hp:2000,maxHp:2000,skin:'phong_lang',visible:true,broken:false,stun:0,recoil:0,trapped:false,slow:0,shieldActive:false,swordShield:null,realmTier:2,defenseReduction:0});resetMotion();}
function advance(sec,dt=1/60){for(let i=0;i<Math.round(sec/dt);i++){updateAction(dt);const d=getMonsterDash();if(d){let x=player.x,y=player.y;moveBody(d.dir*getLearnedSkill(d.id).speed*Math.min(dt,d.remaining),0,{ignoreNpc:true});updateMonsterDash(dt,x,y);}beginSkillCollisionFrame(()=>{});updateMonsterSkills(dt);endSkillCollisionFrame();}}


const {TANG_FUSION_SKILLS}=await import('../src/game/tang-ma-fusions.js');
const {getFusionOptions}=await import('../src/game/fusion-skills.js');
assert.equal(Object.keys(TANG_FUSION_SKILLS).length,40);
const {FUSION_FLIGHT_FX}=await import('../src/game/fusion-flight-fx.js');
const {FUSION_BLAST_FX,FUSION_PALETTES}=await import('../src/game/fusion-fx.js');
const {FUSION_AUDIO_STYLES}=await import('../src/game/soundscapes.js');
for(const spec of Object.values(TANG_FUSION_SKILLS)){
 assert.ok(FUSION_PALETTES[spec.style]&&FUSION_AUDIO_STYLES.includes(spec.style),spec.name+' has matching palette and sound');
 for(const def of [FUSION_FLIGHT_FX,FUSION_BLAST_FX]){const f=window.PK_PIXELFX.createFrame(288,288),fx=window.PK_PIXELFX.createFx(def,{x:144,y:144,...spec});fx.update(.35);fx.draw(f);assert.ok(f.color.some(Boolean),spec.name+' renders '+def.meta.name);}
}

for(const [id,s] of Object.entries(TANG_FUSION_SKILLS)){
 const other=s.requires?[s.requires]:[];
 assert.ok(getFusionOptions(s.incoming,other).some(x=>x.id===id),id+' available from boss reward');
 if(s.requires)assert.ok(getFusionOptions(s.requires,[s.incoming]).some(x=>x.id===id),id+' available in reverse order');
 for(const dt of [1/30,1/60]){
  reset();dummy.hp=dummy.maxHp=100000;player.hp=700;const before=player.mana;
  assert.equal(castMonsterSkill(id),true,id+' casts');assert.ok(player.mana>=before-s.mana&&player.mana<=before,id+' spends mana');assert.equal(getMonsterSkillCooldown(id)>0,!s.nextDash,id+' cooldown or follow-up');
  advance(s.attack==='fusion_combo'?1.5:1,dt);
  assert.ok(dummy.hp<100000,id+' damages target');
  reset();player.mana=1;assert.equal(castMonsterSkill(id),false,id+' rejects insufficient mana');assert.equal(getMonsterSkillCooldown(id),0);
 }
}
for(const [id,s] of Object.entries(TANG_FUSION_SKILLS)){
 reset();dummy.hp=dummy.maxHp=100000;const nearby={...dummy,x:650,hp:100000,maxHp:100000,_targetId:'near'};const far={...dummy,x:1800,hp:100000,maxHp:100000,_targetId:'far'};setCombatTargets([dummy,nearby,far]);
 assert.equal(castMonsterSkill(id),true);advance(s.attack==='fusion_combo'?1.5:1);
 assert.ok(nearby.hp<100000,id+' area hits nearby target');assert.equal(far.hp,100000,id+' respects area boundary');
}
reset();dummy.hp=dummy.maxHp=100000;assert.equal(castMonsterSkill('fusion_tang_rage_bat_diet'),true);assert.equal(player.fusionBarrier,550);const hp=player.hp;let hit=receivePlayerDamage(100,{notice:false});assert.equal(hit.hpLost,0);assert.equal(hit.blocked,100);assert.equal(player.hp,hp);hit=receivePlayerDamage(500,{notice:false});assert.ok(hit.hpLost>0);assert.equal(player.fusionBarrier,0);
reset();dummy.hp=dummy.maxHp=100000;assert.equal(castMonsterSkill('fusion_tang_rage_ma_kiem_ho'),true);assert.equal(player.fusionBarrier,650);advance(12.1);assert.equal(player.fusionBarrier,0,'shield expires');assert.equal(player.cuongBaoMultiplier,1,'giant transformation expires');
reset();dummy.hp=dummy.maxHp=100000;assert.equal(castMonsterSkill('fusion_tang_rage_cuong_lang'),true);advance(.35);const beforeFollow=player.mana;assert.equal(getMonsterSkillCooldown('fusion_tang_rage_cuong_lang'),0);assert.equal(castMonsterSkill('fusion_tang_rage_cuong_lang'),true);assert.equal(player.mana,beforeFollow,'follow-up dash costs no extra mana');assert.ok(getMonsterSkillCooldown('fusion_tang_rage_cuong_lang')>0);advance(1);assert.equal(castMonsterSkill('fusion_tang_rage_cuong_lang'),false,'follow-up only once');
reset();dummy.hp=dummy.maxHp=100000;assert.equal(castMonsterSkill('fusion_tang_rage_ma_duc'),true);assert.equal(player.temporarySpeedMultiplier,1.2);advance(12.1);assert.equal(player.temporarySpeedMultiplier,1);
console.log('PASS 40 recipes, matching, actual costs, four attack types, AoE and bounded shields at 30/60 FPS');
