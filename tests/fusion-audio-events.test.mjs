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

const {FUSION_SKILLS,SWORD_REWARDS}=await import('../src/game/fusion-skills.js');
const {actionAudio}=await import('../src/game/audio.js');let events=[],legacy=[],swordHits=[];
const oldFusion=actionAudio.fusionCue,oldBeast=actionAudio.learnedBeastCue,oldSword=actionAudio.swordCue;
actionAudio.fusionCue=(style,phase,x)=>{events.push({style,phase,x});return true;};actionAudio.learnedBeastCue=(id,x)=>{legacy.push({id,x});return true;};actionAudio.swordCue=(kind,x)=>{swordHits.push({kind,x});return true;};
for(const [id,spec] of Object.entries(FUSION_SKILLS)){for(const dt of [1/30,1/60]){
 reset();settings.fxQuality='off';events=[];legacy=[];assert.equal(castMonsterSkill(id),true);assert.deepEqual(events.map(e=>e.phase),['cast'],id+' cast once');assert.equal(events[0].style,spec.style);assert.equal(events[0].x,player.x);
 advance(1,dt);assert.deepEqual(events.map(e=>e.phase),['cast','impact'],id+' one impact');assert.equal(events[1].style,spec.style);assert.equal(events[1].x,dummy.x);assert.deepEqual(legacy,[],id+' no duplicate monster sound');
}}
for(const id of Object.keys(SWORD_REWARDS)){for(const dt of [1/30,1/60]){
 reset();settings.fxQuality='off';events=[];legacy=[];swordHits=[];assert.equal(castMonsterSkill(id),true);assert.deepEqual(legacy,[{id,x:player.x}],id+' cast sword cue once');assert.equal(events.length,0);
 advance(1,dt);assert.deepEqual(swordHits,[{kind:id==='sword_union'?'sword_ultimate_hit':'sword_hit',x:dummy.x}],id+' impact sword cue once');
}}
reset();events=[];dummy.shieldActive=true;dummy.mana=250;assert.equal(castMonsterSkill('fusion_fire_wind'),true);advance(1);assert.deepEqual(events.map(e=>e.phase),['cast','impact'],'shield collision still sounds');assert.equal(dummy.hp,2000);
reset();events=[];assert.equal(castMonsterSkill('fusion_fire_wind'),true);beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:{},side:'boss',kind:'blood_hand',power:9999,x0:470,y0:434,x1:470,y1:434,radius:45});updateMonsterSkills(.1);endSkillCollisionFrame();advance(2);assert.deepEqual(events.map(e=>e.phase),['cast'],'destroyed spell makes no false impact');
reset();events=[];player.mana=0;assert.equal(castMonsterSkill('fusion_fire_wind'),false);assert.equal(events.length,0,'failed cast is silent');
actionAudio.fusionCue=oldFusion;actionAudio.learnedBeastCue=oldBeast;actionAudio.swordCue=oldSword;console.log('PASS all 170 fusion skills and 5 standalone sword rewards play cast and impact exactly once, independent of visual quality');
