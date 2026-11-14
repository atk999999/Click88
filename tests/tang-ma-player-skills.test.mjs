import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};
const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,motion,setCombatTargets,useDummy,getCasterDamageScale,getCasterCollisionScale}=await import('../src/game/state.js');
const {resetMotion,moveBody,updateAction,diepTuGiantVisual}=await import('../src/game/character.js');
const {MONSTER_SKILLS,castMonsterSkill,updateMonsterSkills,resetMonsterSkills,TANG_MA_REWARDS,getMonsterSkillCooldown,getMonsterDash,updateMonsterDash}=await import('../src/game/ky-nang-quai.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment,resetSkillCollisions}=await import('../src/game/va-cham-ky-nang.js');
function reset(){resetMonsterSkills();resetSkillCollisions();useDummy();setCombatTargets(null);game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:(x,y)=>y>=500};settings.fxQuality='off';Object.assign(player,{x:400,y:499,hp:1200,maxHp:1200,mana:250,maxMana:250,defenseReduction:0,realmTier:2,realmId:'truc_co',facing:1,stun:0,shieldActive:false,grounded:true,flying:false,vx:0,vy:0});Object.assign(dummy,{x:600,y:499,hp:2000,maxHp:2000,skin:'phong_lang',visible:true,broken:false,stun:0,recoil:0,trapped:false,slow:0,shieldActive:false,swordShield:null,realmTier:2,defenseReduction:0});resetMotion();}
function advance(sec,dt=1/60){for(let i=0;i<Math.round(sec/dt);i++){updateAction(dt);const d=getMonsterDash();if(d){let x=player.x,y=player.y;moveBody(d.dir*MONSTER_SKILLS[d.id].speed*Math.min(dt,d.remaining),0,{ignoreNpc:true});updateMonsterDash(dt,x,y);}beginSkillCollisionFrame(()=>{});updateMonsterSkills(dt);endSkillCollisionFrame();}}


for(const dt of [1/30,1/60]){
 reset();player.mana=64;assert.equal(castMonsterSkill('tang_dash'),false);player.mana=65;assert.equal(castMonsterSkill('tang_dash'),true);assert.equal(player.mana,0);const hp=dummy.hp;const oldX=player.x;player.x=650;updateMonsterDash(dt,oldX,player.y);assert.ok(dummy.hp<hp,'dash hits crossed target');
 reset();player.hp=500;player.mana=100;assert.equal(castMonsterSkill('tang_devour'),true);advance(1,dt);assert.ok(dummy.hp<2000,'devour projectile hits');assert.ok(player.hp>500,'devour heals');assert.ok(player.mana>30,'devour restores mana');
 reset();const before=dummy.hp;assert.equal(castMonsterSkill('tang_combo'),true);advance(1.4,dt);assert.ok(dummy.hp<before-75,'combo deals repeated damage');assert.ok(getMonsterSkillCooldown('tang_combo')>0);
 reset();player.mana=75;const damageScale=getCasterDamageScale(player,dummy),collisionScale=getCasterCollisionScale(player);assert.equal(castMonsterSkill('tang_rage'),true);assert.equal(player.cuongBaoMultiplier,1.35);assert.ok(Math.abs(getCasterDamageScale(player,dummy)-damageScale*1.35)<1e-9,'rage increases skill damage');assert.equal(getCasterCollisionScale(player),collisionScale,'rage does not change clash power');assert.equal(diepTuGiantVisual.active,true);advance(12.1,dt);assert.equal(player.cuongBaoMultiplier,1);assert.equal(diepTuGiantVisual.active,false);
}
reset();dummy.visible=false;const mana=player.mana;assert.equal(castMonsterSkill('tang_combo'),false,'combo needs a target');assert.equal(player.mana,mana,'no target spends no mana');
console.log('PASS four learned Táng Ma skills, costs, attack and rage lifecycle at 30/60 FPS');
