import {FUSION_SKILLS,SWORD_REWARDS} from './fusion-skills.js';
import {TANG_FUSION_SKILLS} from './tang-ma-fusions.js';
import {drawBeastProjectileCores} from './beast-projectile-core.js';
import {actionAudio} from './audio.js';
// Monster techniques learned by the player, using the normal collision and damage systems.
import {game,player,dummy,motion,getCombatTargets,withCombatTarget,getCasterDamageScale,spendMana,updateVitals,addCameraShake,WORLD_W} from './state.js';
import {reactionLocked,startAction,dummyDamage,diepTuGiantVisual} from './character.js';
import {startGiantVisual,endGiantVisual} from './diep-tu-cuong-bao.js';
import {fxEmit,castLocked,getCharge,acquireSkillTarget,targetPosition} from './skills.js';
import {trackSkillSegment,queueSkillImpact,segmentCircleTOI,skillCollisionRatio} from './va-cham-ky-nang.js';
export const MONSTER_SKILLS=Object.freeze({
 wolf_bite:{name:'CẮN XÉ',hint:'Cận chiến · 160 ST cơ bản · 20 linh lực',mana:20,cooldown:3.2,damage:160,style:'wind',attack:'bite'},
 wolf_wind:{name:'LỐC XOÁY',hint:'Tầm xa · 180 ST cơ bản · 35 linh lực',mana:35,cooldown:5,damage:180,style:'wind',attack:'shot',fx:'windTornado',speed:430,radius:34,power:130,scale:2.35},
 eagle_orb:{name:'LÔI CẦU',hint:'Tầm xa · 180 ST cơ bản · 35 linh lực',mana:35,cooldown:5,damage:180,style:'lightning',attack:'shot',fx:'thunderOrb',speed:410,radius:26,power:130,scale:1.65},
 eagle_dive:{name:'LAO XUYÊN',hint:'Lao xuyên · 220 ST cơ bản · 40 linh lực',mana:40,cooldown:6,damage:220,style:'lightning',attack:'dash',speed:920},
 snake_fang:{name:'ĐỘC NHA',hint:'170 ST cơ bản · độc 5 giây · 40 linh lực',mana:40,cooldown:6,damage:170,style:'venom',attack:'shot',fx:'venomFang',speed:410,radius:23,power:130,scale:1.45},
 snake_lunge:{name:'XÀ LAO',hint:'Lao cắn · 220 ST cơ bản · 40 linh lực',mana:40,cooldown:6,damage:220,style:'venom',attack:'dash',speed:860},
 bat_orb:{name:'U MINH MA CẦU',hint:'Ma cầu · 200 ST cơ bản · 45 linh lực',mana:45,cooldown:6,damage:200,style:'shadow',attack:'shot',fx:'uminhOrb',speed:430,radius:28,power:150,scale:1.65},
 bat_dive:{name:'U MINH ẢNH TẬP',hint:'Lao xuyên · 230 ST cơ bản · 45 linh lực',mana:45,cooldown:6.5,damage:230,style:'shadow',attack:'dash',speed:920},
});
export const TANG_MA_REWARDS=Object.freeze({
 tang_dash:{name:'HOANG DIỆM TRUY SÁT',hint:'Lao xuyên · 450 ST · 65 linh lực',mana:65,cooldown:12,damage:450,style:'firewind',attack:'dash',speed:1050},
 tang_rage:{name:'CUỒNG BẠO',hint:'Khổng lồ 12 giây · +35% sát thương · 75 linh lực',mana:75,cooldown:60,attack:'rage',style:'earthblood'},
 tang_devour:{name:'PHỆ THẦN',hint:'Ma cầu hút 12% máu · 3% linh lực · 70 linh lực',mana:70,cooldown:16,damage:360,style:'shadow',attack:'shot',fx:'uminhOrb',speed:430,radius:32,power:180,scale:1.8,lifeSteal:.12,manaSteal:.03,stun:.8},
 tang_combo:{name:'DỊCH ẢNH LIÊN KÍCH',hint:'Thuấn di · 6 đòn · 80 linh lực',mana:80,cooldown:35,damage:75,style:'shadow',attack:'combo'},
});
export const getLearnedSkill=id=>MONSTER_SKILLS[id]||TANG_MA_REWARDS[id]||SWORD_REWARDS[id]||FUSION_SKILLS[id]||TANG_FUSION_SKILLS[id];
let cooldowns={},shots=[],pending=[],dash=null,combo=null,rage=0,rageSpec=null,rageFollowUsed=false,barrierTime=0,poisoned=new Set();
export const getMonsterSkillCooldown=id=>(rage>0&&rageSpec===getLearnedSkill(id)&&rageSpec?.nextDash&&!rageFollowUsed)?0:(cooldowns[id]||0);
export const getMonsterDash=()=>dash;
export function cancelMonsterDash(){dash?.fx?.fx.stop();dash=null;}
export function resetMonsterSkills(){ for(const s of shots){s.fx?.fx.stop();s.extra?.fx.stop();}for(const target of poisoned)delete target.monsterPoison;cancelMonsterDash();cooldowns={};shots=[];pending=[];combo=null;rage=0;rageSpec=null;rageFollowUsed=false;barrierTime=0;player.cuongBaoMultiplier=1;player.temporarySpeedMultiplier=1;player.fusionBarrier=0;player.temporaryLifeSteal=0;player.temporaryManaSteal=0;endGiantVisual(diepTuGiantVisual);poisoned=new Set(); }
function giveFusionBarrier(amount){if(amount){player.fusionBarrier=Math.max(player.fusionBarrier||0,amount);barrierTime=12;updateVitals();}}
function targetY(target){return target.y-(target.skin==='hac_hoa_xa'?85:(target.skin==='loi_ung'||target.skin==='u_minh_ma_buc')?45:target.skin==='phong_lang'?50:77);}
function targetRadius(target){return target.skin==='hac_hoa_xa'?210:target.skin==='u_minh_ma_buc'?62:55;}
function hitTarget(target,spec,ratio=1,poison=false){
 if(!target||target.broken||target.hp<=0||target.visible===false)return false;
 return withCombatTarget(target,()=>{
  const oldHp=target.hp;
  const hit=dummyDamage(Math.max(1,Math.round(spec.damage*ratio*getCasterDamageScale(player,dummy))),{notice:false,slowDuration:spec.slow||0});
  if(hit&&spec.stun&&!target.broken)target.stun=Math.max(target.stun||0,spec.stun);
  if(hit&&(spec.lifeSteal||spec.manaSteal)){const dealt=Math.max(0,oldHp-target.hp);player.hp=Math.min(player.maxHp,player.hp+dealt*(spec.lifeSteal||0));player.mana=Math.min(player.maxMana,player.mana+dealt*(spec.manaSteal||0));updateVitals();}
  if(hit&&spec.burn&&!target.broken&&!(target.shieldActive&&target.mana>0)){target.burn=Math.max(target.burn||0,spec.burn);target.burnTick=.25;target.burnPower=Math.max(target.burnPower||0,Math.round(28*ratio*getCasterDamageScale(player,dummy)));}
  if(hit&&poison&&!target.broken){target.monsterPoison={remaining:5,tick:1,damage:Math.max(1,Math.round(22*ratio*getCasterDamageScale(player,dummy)))};poisoned.add(target);}
  if(hit)fxEmit('beastAttack',target.x,targetY(target),{style:spec.style,phase:'hit'},null,'front',{scale:1.2});
  return hit;
 });
}
function fusionOptions(spec){return {style:spec.style,shape:spec.shape,blast:spec.blast,burn:!!spec.burn,poison:!!spec.poison,thunder:!!(spec.thunder||spec.stun),wind:spec.shape==='tornado',lifeSteal:!!spec.lifeSteal};}
function fusionArea(spec,x,y,fraction=1){
 fxEmit('fusionBlast',x,y,fusionOptions(spec),null,'front',{scale:spec.aoe/100});addCameraShake(5,.2);actionAudio.fusionCue(spec.style,'impact',x);
 let hit=false;
 for(const target of new Set(getCombatTargets())){
  if(!target||target.visible===false||target.broken||target.hp<=0||Math.hypot(target.x-x,targetY(target)-y)>spec.aoe+targetRadius(target))continue;
  const result=hitTarget(target,spec,fraction,!!spec.poison);if(result){hit=true;if(spec.pull)target.x=Math.max(80,Math.min(WORLD_W-80,target.x+Math.max(-60,Math.min(60,x-target.x))));}
 }
 if(hit&&spec.barrier)giveFusionBarrier(spec.barrier);
}
export function castMonsterSkill(id){
 const spec=getLearnedSkill(id);const follow=!!(spec&&spec===rageSpec&&rage>0&&spec.nextDash&&!rageFollowUsed);
 if(!spec||!game.running||game.battlePhase!=='fight'||player.hp<=0||(!follow&&cooldowns[id]>0)||dash||combo||getCharge()||castLocked()||reactionLocked()||(motion.action&&!['brake','flight_stop'].includes(motion.action.name)))return false;
 if(follow){const point=targetPosition(acquireSkillTarget()),dir=point&&Math.abs(point.x-player.x)>2?Math.sign(point.x-player.x):player.facing||1;rageFollowUsed=true;player.facing=dir;actionAudio.bossCue('tang_dash',player.x);const fx=fxEmit('fusionFlight',player.x,player.y-65,fusionOptions(spec),null,'front',{scale:1.55,rotation:dir<0?Math.PI:0});dash={id,dir,remaining:.64,hit:new Set(),trail:0,fx,rageFollow:true};return true;}
 const isCombo=spec.attack==='combo'||spec.attack==='fusion_combo';
 const comboTarget=isCombo?getCombatTargets().filter(t=>t.visible!==false&&!t.broken&&t.hp>0&&Math.hypot(t.x-player.x,t.y-player.y)<900).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0]:null;
 if(isCombo&&!comboTarget)return false;
 if(!spendMana(spec.mana))return false;
 cooldowns[id]=spec.cooldown;const targetId=acquireSkillTarget(),point=targetPosition(targetId);
 const dir=point&&Math.abs(point.x-player.x)>2?Math.sign(point.x-player.x):player.facing||1;player.facing=dir;
 const x=player.x+dir*35,y=player.y-65;
 fxEmit('beastAttack',x,y,{style:spec.style,phase:'cast'},null,'front',{scale:1.15,rotation:dir<0?Math.PI:0});
 startAction('hand_seal',{duration:.24});
 if(spec.attack==='rage'||spec.attack==='fusion_rage'){rage=12;rageSpec=spec.attack==='fusion_rage'?spec:null;rageFollowUsed=false;player.cuongBaoMultiplier=1.35;player.temporarySpeedMultiplier=spec.speedBoost||1;player.temporaryLifeSteal=spec.lifeSteal||0;player.temporaryManaSteal=spec.manaSteal||0;giveFusionBarrier(spec.barrier);startGiantVisual(diepTuGiantVisual);fxEmit('tang_rage',player.x,player.y-100,{},null,'front',{scale:1.15});actionAudio.bossCue('tang_rage',player.x);if(rageSpec){actionAudio.fusionCue(spec.style,'cast',player.x);fusionArea(spec,player.x,player.y-65,.65);}return true;}
 if(isCombo){combo={target:comboTarget,remaining:6,timer:.22,dir,spec:spec.attack==='fusion_combo'?spec:null};actionAudio.bossCue('tang_blink',player.x);if(combo.spec)actionAudio.fusionCue(spec.style,'cast',player.x);return true;}
 if(spec.attack==='bite'){pending.push({id,time:.18,originX:player.x,originY:player.y-65,dir});return true;}
 if(spec.attack==='dash'||spec.attack==='fusion_dash'){if(id==='tang_dash'||spec.attack==='fusion_dash'){actionAudio.bossCue('tang_dash',player.x);if(spec.attack==='fusion_dash')actionAudio.fusionCue(spec.style,'cast',player.x);fxEmit('tang_gold_dash',x,y,{},null,'front',{scale:1.1});}else actionAudio.learnedBeastCue(id,player.x);const fx=spec.attack==='fusion_dash'?fxEmit('fusionFlight',x,y,fusionOptions(spec),null,'front',{scale:1.55,rotation:dir<0?Math.PI:0}):null;dash={id,dir,remaining:.64,hit:new Set(),trail:0,fx};return true;}
 const fusion=!!(FUSION_SKILLS[id]||TANG_FUSION_SKILLS[id]),sword=!!SWORD_REWARDS[id];
 if(fusion)actionAudio.fusionCue(spec.style,'cast',player.x);else if(id==='tang_devour')actionAudio.bossCue('tang_void',player.x);else actionAudio.learnedBeastCue(sword?id:(spec.sound||id),player.x);
 const dx=point?point.x-x:dir,dy=point?point.y-y:0,len=Math.hypot(dx,dy)||1,vx=dx/len*spec.speed,vy=dy/len*spec.speed;
 const angle=Math.atan2(vy,vx);
  const fx=(fusion||sword)?fxEmit('fusionFlight',x,y,{style:spec.style,shape:spec.shape||'',burn:!!spec.burn,poison:!!spec.poison,thunder:!!(spec.stun||spec.thunder),wind:spec.fx==='windTornado'||spec.shape==='tornado',slow:!!spec.slow,lifeSteal:!!spec.lifeSteal,earth:!!spec.earth,five:!!spec.five},null,'front',{scale:1.55,rotation:angle}):fxEmit(spec.fx,x,y,{},null,'front',{scale:spec.scale,rotation:angle});
  const extra=!(fusion||sword)&&spec.overlay?fxEmit(spec.overlay,x,y,{},null,'front',{scale:1.1,rotation:angle}):null;
  shots.push({id,x,y,vx,vy,age:0,live:true,fx,extra});return true;
}
export function updateMonsterDash(dt,oldX,oldY){
 if(!dash)return;
 const d=dash,spec=getLearnedSkill(d.id);
 if(!game.running||player.hp<=0||reactionLocked()||motion.strongImpact){cancelMonsterDash();return;}
 if(d.fx){d.fx.x=player.x;d.fx.y=player.y-65;}
 for(const target of getCombatTargets()){
  if(d.hit.has(target)||target.broken||target.hp<=0||target.visible===false)continue;
  const r=targetRadius(target)+25;
  if(segmentCircleTOI(oldX,oldY-65,player.x,player.y-65,target.x,targetY(target),r)!==null){d.hit.add(target);hitTarget(target,spec,(spec.attack==='fusion_dash'||d.rageFollow)?.6:1,!!spec.poison);}
 }
 d.remaining-=dt;d.trail-=dt;if(d.trail<=0){d.trail=.14;fxEmit('beastAttack',player.x,player.y-60,{style:spec.style},null,'front',{scale:.8,rotation:d.dir<0?Math.PI:0});}
 if(d.remaining<=0){if(spec.attack==='fusion_dash'||d.rageFollow)fusionArea(spec,player.x,player.y-65,.4);cancelMonsterDash();player.vx=0;}
}
function tickPoison(dt){
 for(const target of [...poisoned]){
  const q=target.monsterPoison;if(!q||target.broken||target.hp<=0){delete target.monsterPoison;poisoned.delete(target);continue;}
  let left=Math.min(dt,q.remaining);q.remaining=Math.max(0,q.remaining-left);
  while(left+1e-9>=q.tick&&!target.broken){left-=q.tick;q.tick=1;withCombatTarget(target,()=>dummyDamage(q.damage||22,{isDot:true,notice:false,palette:['#244116','#569b31','#a8ea71']}));}
  q.tick-=left;if(q.remaining<=1e-8||target.broken){delete target.monsterPoison;poisoned.delete(target);}
 }
}
const CLASH_KIND_BY_STYLE=Object.freeze({
 wind:'wind',firewind:'wind',venomwind:'wind',earthwind:'wind',fivewind:'wind',bloodwind:'wind',
 venom:'venom',venomwater:'venom',fivevenom:'venom',earthvenom:'venom',shadowvenom:'venom',bloodvenom:'venom',swordvenom:'venom',
 shadow:'shadow',shadowlightning:'shadow',shadowwater:'shadow',earthblood:'shadow',fiveblood:'shadow',earthshadow:'shadow',swordshadow:'shadow',
 bloodfire:'blood_hand',lightningblood:'blood_hand',shadowfire:'blood_hand',swordblood:'blood_hand',
 earthfire:'fireball',fivefire:'fireball',fiveearth:'fireball',swordfire:'fireball',swordearth:'fireball',swordfive:'fireball',
 fivewater:'water_sword',earthwater:'water_sword',swordwater:'water_sword',
 swordlightning:'lightning',
});
const PROJECTILE_CORE_STYLES=['wind','lightning','venom','shadow','firewind','waterlightning','venomwind','bloodfire','earthwind','lightningfire','venomwater','shadowlightning','shadowwater','lightningblood','earthblood','fiveblood','fivefire','fivewater','fiveearth','fivelightning','fivevenom','fivewind','earthfire','earthwater','earthvenom','earthshadow','shadowfire','shadowvenom','bloodwind','bloodvenom','swordfire','swordlightning','swordearth','swordwater','swordvenom','swordshadow','swordblood','swordfive'];
export function updateMonsterSkills(dt){
 if(!game.running)return;
 for(const id of Object.keys(cooldowns))cooldowns[id]=Math.max(0,cooldowns[id]-dt);
 if(barrierTime>0){barrierTime=Math.max(0,barrierTime-dt);if(!barrierTime){player.fusionBarrier=0;updateVitals();}}
 if(rage>0){rage=Math.max(0,rage-dt);if(!rage){if(rageSpec)fusionArea({...rageSpec,barrier:0},player.x,player.y-65,.35);rageSpec=null;player.cuongBaoMultiplier=1;player.temporarySpeedMultiplier=1;player.temporaryLifeSteal=0;player.temporaryManaSteal=0;endGiantVisual(diepTuGiantVisual);}}
 if(combo){
  const c=combo,t=c.target;
  if(!t||t.broken||t.hp<=0||t.visible===false||reactionLocked()){combo=null;}
  else {c.timer-=dt;while(combo&&c.timer<=0&&c.remaining>0){
   const side=c.remaining%2?1:-1;player.x=Math.max(80,Math.min(WORLD_W-80,t.x+side*105));player.facing=-side;
   const ground=game.terrain?.firstSolidY?.(player.x);player.y=Number.isFinite(ground)?Math.min(t.y,ground-.5):t.y;player.vx=0;player.vy=0;player.grounded=Number.isFinite(ground)&&Math.abs(player.y-(ground-.5))<2;
   fxEmit('tang_blink',player.x,player.y-75,{},null,'front',{scale:1});
   hitTarget(t,c.spec||TANG_MA_REWARDS.tang_combo,c.spec?.125:1,!!c.spec?.poison);fxEmit('tang_combo_hit',t.x,targetY(t),{},null,'front',{scale:1.1});
   actionAudio.bossCue('tang_combo',t.x);c.remaining--;c.timer+=.16;if(!c.remaining||t.broken||t.hp<=0){if(c.spec)fusionArea(c.spec,t.x,targetY(t),.25);combo=null;}
  }}
 }
 tickPoison(dt);
 for(const a of pending){a.time-=dt;if(a.time>0)continue;if(reactionLocked()||motion.strongImpact)continue;actionAudio.learnedBeastCue(a.id,player.x);const spec=MONSTER_SKILLS[a.id];for(const target of getCombatTargets()){const dx=target.x-a.originX,dy=targetY(target)-a.originY,r=targetRadius(target);if(dx*a.dir>=-r&&Math.abs(dx)<=155+r&&Math.abs(dy)<90+r*.3)hitTarget(target,spec);}fxEmit('beastAttack',a.originX+a.dir*95,a.originY,{style:spec.style},null,'front',{scale:1.35,rotation:a.dir<0?Math.PI:0});}
 pending=pending.filter(a=>a.time>0);
 for(const s of shots){
  if(!s.live)continue;const spec=getLearnedSkill(s.id),x0=s.x,y0=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.age+=dt;if(s.fx){s.fx.x=s.x;s.fx.y=s.y;}if(s.extra){s.extra.x=s.x;s.extra.y=s.y;}
  let chosen=null,first=1.001;for(const target of getCombatTargets()){if(target.visible===false||target.broken||target.hp<=0)continue;const t=segmentCircleTOI(x0,y0,s.x,s.y,target.x,targetY(target),targetRadius(target)+spec.radius);if(t!==null&&t<first){chosen=target;first=t;}}
  const end=chosen?first:1;trackSkillSegment({ref:s,side:'player',kind:CLASH_KIND_BY_STYLE[spec.style]||'lightning',power:spec.power,x0,y0,x1:x0+(s.x-x0)*end,y1:y0+(s.y-y0)*end,t1:end,radius:spec.radius,onDestroy:()=>{s.live=false;s.fx?.fx.stop();s.extra?.fx.stop();}});
  if(chosen)queueSkillImpact(s,first,()=>{
   if(!s.live)return;s.live=false;s.fx?.fx.stop();s.extra?.fx.stop();
   const ratio=skillCollisionRatio(s),poison=s.id==='snake_fang'||!!spec.poison;
   if(!spec.aoe){hitTarget(chosen,spec,ratio,poison);if(s.id==='tang_devour'){fxEmit('tang_grab',chosen.x,targetY(chosen),{},null,'front',{scale:1.1});actionAudio.bossCue('tang_grab',chosen.x);}return;}
   const cx=chosen.x,cy=targetY(chosen);
   if(FUSION_SKILLS[s.id]||TANG_FUSION_SKILLS[s.id])actionAudio.fusionCue(spec.style,'impact',cx);
   else if(SWORD_REWARDS[s.id])actionAudio.swordCue(s.id==='sword_union'?'sword_ultimate_hit':'sword_hit',cx);
   fxEmit('fusionBlast',cx,cy,{style:spec.style,blast:spec.blast||'',burn:!!spec.burn,poison:!!spec.poison,thunder:!!(spec.stun||spec.thunder),wind:spec.fx==='windTornado'||spec.shape==='tornado',slow:!!spec.slow,lifeSteal:!!spec.lifeSteal,earth:!!spec.earth,five:!!spec.five},null,'front',{scale:spec.aoe/100});addCameraShake(5,.22);
   // A single impact applies once per distinct target; collision power scales every hit.
   for(const target of new Set([chosen,...getCombatTargets()])){
    if(!target||target.visible===false||target.broken||target.hp<=0)continue;
    if(Math.hypot(target.x-cx,targetY(target)-cy)<=spec.aoe+targetRadius(target)){const hit=hitTarget(target,spec,ratio,poison);if(hit&&spec.pull)target.x=Math.max(80,Math.min(WORLD_W-80,target.x+Math.max(-60,Math.min(60,cx-target.x))));if(hit&&spec.barrier)giveFusionBarrier(spec.barrier);}
   }
  });
  if(s.age>3||s.x<0||s.x>WORLD_W||s.y>2400||s.y< -3000){queueSkillImpact(s,1,()=>{s.live=false;s.fx?.fx.stop();s.extra?.fx.stop();});}
 }
 shots=shots.filter(s=>s.live);
}

export function drawMonsterSkillProjectiles(){for(const style of PROJECTILE_CORE_STYLES)drawBeastProjectileCores(shots.filter(s=>getLearnedSkill(s.id)?.style===style),style);}
