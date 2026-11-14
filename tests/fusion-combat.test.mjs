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

const {FUSION_SKILLS,SWORD_REWARDS,getFusionOptions}=await import('../src/game/fusion-skills.js');
assert.equal(getFusionOptions('snake_fang',[])[0].id,'fusion_venom_water');
assert.equal(getFusionOptions('snake_fang',['wolf_wind'])[0].id,'fusion_venom_wind');
assert.equal(getFusionOptions('hand',[])[0].id,'fusion_blood_fire');
assert.equal(getFusionOptions('wolf_wind',[],'huyet_du').length,0);
assert.equal(Object.keys(SWORD_REWARDS).length,5,'all 5 Lăng Tiêu sword rewards registered');
for(const [id,spec] of Object.entries({...SWORD_REWARDS,...FUSION_SKILLS})){
 for(const dt of [1/30,1/60]){
  reset();assert.equal(castMonsterSkill(id),true,id);assert.equal(player.mana,250-spec.mana);assert.ok(getMonsterSkillCooldown(id)>0);
  advance(1,dt);assert.ok(dummy.hp<2000,id+' deals direct damage');
  if(spec.burn)assert.ok(dummy.burn>0,id+' applies burn');
  if(spec.slow)assert.ok(dummy.slow>0,id+' applies slow');
  if(spec.stun)assert.ok(dummy.stun>0,id+' applies stun');
  if(spec.poison){assert.ok(dummy.monsterPoison,id+' applies poison');const hp=dummy.hp;advance(2,dt);assert.ok(dummy.hp<hp,'poison ticks');}
 }
 reset();dummy.shieldActive=true;dummy.mana=250;assert.equal(castMonsterSkill(id),true);advance(1);assert.equal(dummy.hp,2000,id+' blocked by shield');assert.ok(!dummy.burn&&!dummy.slow&&!dummy.stun&&!dummy.monsterPoison,id+' cannot apply debuff through shield');
 reset();player.mana=1;assert.equal(castMonsterSkill(id),false,id+' cannot cast with insufficient mana');assert.equal(getMonsterSkillCooldown(id),0);
}
console.log('PASS fusion recipes, mana, cooldown, hit effects, poison and shields at 30/60 FPS');

const {BEAST_ATTACK_FX}=await import('../src/game/quai-skill-fx.js');
for(const spec of Object.values(FUSION_SKILLS)){const frame=window.PK_PIXELFX.createFrame(160,160),fx=window.PK_PIXELFX.createFx(BEAST_ATTACK_FX,{x:80,y:80,style:spec.style});fx.update(.2);fx.draw(frame);assert.ok(frame.color.some(Boolean),spec.style+' PixelFX renders');}
console.log('PASS distinct fusion PixelFX palettes render');

// Each fusion explodes once, damaging independent nearby targets but not distant ones.
for(const [id,spec] of Object.entries(FUSION_SKILLS)){
 for(const dt of [1/30,1/60]){
  reset();const near={...dummy,x:740,hp:2000,maxHp:2000,_targetId:'near'},far={...dummy,x:1150,hp:2000,maxHp:2000,_targetId:'far'};setCombatTargets([dummy,near,far]);
  assert.equal(castMonsterSkill(id),true);advance(1,dt);
  assert.ok(dummy.hp<2000&&near.hp<2000,id+' damages multiple targets');assert.equal(far.hp,2000,id+' respects area bounds');
  assert.equal(dummy.lastDamage,near.lastDamage,id+' hits each target once for equal direct damage');
 }
 reset();const shielded={...dummy,x:740,hp:2000,maxHp:2000,shieldActive:true,mana:250,_targetId:'shielded'};setCombatTargets([dummy,shielded]);assert.equal(castMonsterSkill(id),true);advance(1);assert.equal(shielded.hp,2000,id+' area damage respects shields');assert.ok(!shielded.stun&&!shielded.slow&&!shielded.burn&&!shielded.monsterPoison,id+' area debuffs respect shields');
}
console.log('PASS every fusion hits multiple targets once, respects range and shield at 30/60 FPS');
{reset();player.hp=700;const beforeMana=player.mana;assert.equal(castMonsterSkill('fusion_blood_earth'),true);advance(1);assert.ok(player.hp>700,'siphon restores health');assert.ok(player.mana>beforeMana-60,'siphon restores mana');}
{reset();player.hp=700;dummy.shieldActive=true;dummy.mana=250;assert.equal(castMonsterSkill('fusion_blood_earth'),true);advance(1);assert.equal(player.hp,700,'blocked attack restores no health');assert.equal(player.mana,190,'blocked attack restores no mana');}
// Cost shown in both the selection menu and skill bar must match spending.
for(const [id,spec] of Object.entries(FUSION_SKILLS)){
 assert.ok(spec.mana>=45&&spec.mana<=85,id+' balanced mana range');
 assert.match(spec.hint,new RegExp(`\\b${spec.mana} linh lực\\b`,'i'),id+' displayed mana matches combat');
 reset();player.mana=spec.mana-1;assert.equal(castMonsterSkill(id),false,id+' rejects insufficient mana');
 player.mana=spec.mana;assert.equal(castMonsterSkill(id),true,id+' casts at the exact cost');assert.equal(player.mana,0,id+' deducts the displayed cost');
}
const {FUSION_BLAST_FX}=await import('../src/game/fusion-fx.js');
for(const [id,spec] of Object.entries(FUSION_SKILLS)){for(const t of [.12,.4,.65]){const f=window.PK_PIXELFX.createFrame(256,256),fx=window.PK_PIXELFX.createFx(FUSION_BLAST_FX,{x:128,y:128,style:spec.style,blast:spec.blast,five:!!spec.five,earth:!!spec.earth});fx.update(t);fx.draw(f);assert.ok(f.color.some(Boolean),spec.style+' area burst renders');}}
console.log('PASS fixed-cost PixelFX bursts render in each palette');
for(const incoming of ['wolf_bite','wolf_wind','eagle_orb','eagle_dive','snake_fang','snake_lunge','bat_orb','bat_dive','hand','thread','drain','blast','sword_heart','sword_beam','sword_array','sword_guard','sword_union']){
 const choices=getFusionOptions(incoming,['wolf_wind']);assert.ok(choices.length>0&&choices.length<=12,incoming+' has visible and selectable options');
}
for(const id of Object.keys(FUSION_SKILLS)){
 reset();const near={...dummy,x:740,hp:2000,maxHp:2000,_targetId:'near'};setCombatTargets([dummy,near]);assert.equal(castMonsterSkill(id),true);
 beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:{},side:'boss',kind:'blood_hand',power:9999,x0:470,y0:434,x1:470,y1:434,radius:45});updateMonsterSkills(.1);endSkillCollisionFrame();advance(2);
 assert.equal(dummy.hp,2000,id+' cannot explode after being destroyed');assert.equal(near.hp,2000,id+' cannot damage bystanders after being destroyed');
}
console.log('PASS every incoming reward has visible recipes; destroyed spells do not explode');

const {FUSION_FLIGHT_FX}=await import('../src/game/fusion-flight-fx.js');
for(const spec of Object.values({...SWORD_REWARDS,...FUSION_SKILLS})){for(const t of [.1,.5,1.5]){const f=window.PK_PIXELFX.createFrame(192,160),fx=window.PK_PIXELFX.createFx(FUSION_FLIGHT_FX,{x:96,y:80,style:spec.style,shape:spec.shape,wind:spec.fx==='windTornado',thunder:!!(spec.stun||spec.thunder),earth:!!spec.earth,five:!!spec.five});fx.update(t);fx.draw(f);assert.ok(f.color.some(Boolean),spec.name+' projectile renders');}}
assert.equal(Object.keys(FUSION_SKILLS).length,170,'all 170 recipes registered');
console.log('PASS all 170 fusion projectile effects and 5 sword rewards render at different stages');

// The combat path actually emits one new PixelFX projectile at normal quality.
const {getFxInstances,fxClear}=await import('../src/game/skills.js');
reset();fxClear();settings.fxQuality='medium';assert.equal(castMonsterSkill('fusion_water_lightning'),true);assert.equal(getFxInstances().filter(x=>x.fx.meta.name==='fusion-flight').length,1,'combat emits fusion flight');advance(1);assert.equal(getFxInstances().filter(x=>x.fx.meta.name==='fusion-area-blast').length,1,'impact emits area burst');assert.ok(getFxInstances().length<=13,'normal quality respects effect limit');
reset();fxClear();settings.fxQuality='off';assert.equal(castMonsterSkill('fusion_water_lightning'),true);advance(1);assert.equal(getFxInstances().length,0,'effects off allocates no cosmetic instances');assert.ok(dummy.hp<2000,'combat damage remains enabled');
console.log('PASS live PixelFX emission, quality cap and damage with FX off');
