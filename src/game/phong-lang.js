import { actionAudio } from './audio.js';
// Phong Lang: single ground monster for the first test encounter.
import {game,player,dummy,camera,settings,clamp,WORLD_W,BASE_ZOOM} from './state.js';
import {receivePlayerDamage,fxEmit} from './skills.js';
import {applyUnblockedPlayerHit} from './character.js';
import {trackSkillSegment,queueSkillImpact,segmentCircleTOI,skillCollisionRatio} from './va-cham-ky-nang.js';
export const PHONG_LANG_SPEC=Object.freeze({hp:420,speed:130,biteDamage:55,biteRange:110,biteCooldown:1.8,windDamage:65,windSpeed:335,windCooldown:4.2,windLifetime:2.6,windRadius:34,defeatDuration:1.5,leapCooldown:4.5});
let wolf=null;
export const getPhongLang=()=>wolf;
export function usePhongLang(instance){wolf=instance;}
export function resetPhongLang(){wolf={time:0,phase:'idle',t:0,biteCooldown:.7,windCooldown:1.6,leapCooldown:2,hit:false,shots:[],defeatTime:0};return wolf;}
function damagePlayer(amount,fromX){const hit=receivePlayerDamage(Math.max(1,Math.round(amount)),{fromX,notice:false});if(hit.hpLost>0&&player.hp>0)applyUnblockedPlayerHit('hurt');return hit;}
function windShot(){
 actionAudio.monsterCue('wolf_wind',dummy.x);
 const x=dummy.x+dummy.facing*45,y=dummy.y-50;fxEmit('beastAttack',x,y,{style:'wind'},null,'front',{scale:.8,rotation:dummy.facing<0?Math.PI:0});const dx=player.x-x,dy=(player.y-60)-y,dist=Math.hypot(dx,dy)||1;
 const s={x,y,vx:dx/dist*PHONG_LANG_SPEC.windSpeed,vy:dy/dist*PHONG_LANG_SPEC.windSpeed,age:0,live:true,fx:fxEmit('windTornado',x,y,{},null,'front',{scale:2.35})};
 wolf.shots.push(s);if(wolf.shots.length>2){const old=wolf.shots.shift();old.live=false;old.fx?.fx.stop();}
}
function updateShots(dt){
 for(const s of wolf.shots){
  if(!s.live)continue;const x0=s.x,y0=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.age+=dt;if(s.fx){s.fx.x=s.x;s.fx.y=s.y;}
  const hit=segmentCircleTOI(x0,y0,s.x,s.y,player.x,player.y-60,PHONG_LANG_SPEC.windRadius+22);
  trackSkillSegment({ref:s,side:'boss',kind:'wind',power:90,x0,y0,x1:x0+(s.x-x0)*(hit??1),y1:y0+(s.y-y0)*(hit??1),t1:hit??1,radius:PHONG_LANG_SPEC.windRadius,onDestroy:()=>{s.live=false;s.fx?.fx.stop();}});
  if(hit!==null)queueSkillImpact(s,hit,()=>{if(!s.live)return;s.live=false;s.fx?.fx.stop();damagePlayer(PHONG_LANG_SPEC.windDamage*skillCollisionRatio(s),x0);fxEmit('beastAttack',player.x,player.y-60,{style:'wind'},null,'front',{scale:1.2});fxEmit('hitSpark',player.x,player.y-60,{palette:['#174b51','#308f88','#71d9bc','#d2ffea','#ffffff']},null,'front',{scale:.8});});
  if(s.age>=PHONG_LANG_SPEC.windLifetime||s.x<0||s.x>WORLD_W||s.y>2400||s.y<-1600){queueSkillImpact(s,1,()=>{s.live=false;s.fx?.fx.stop();});}
 }
 wolf.shots=wolf.shots.filter(s=>s.live);
}
export function updatePhongLang(dt){
 if(!wolf||!game.running||game.battlePhase!=='fight')return;
 wolf.time+=dt;updateShots(dt);
 if(dummy.broken||dummy.hp<=0){wolf.defeatTime+=dt;dummy.flying=false;const floor=game.terrain.firstSolidY(dummy.x)-.5;if(dummy.y<floor)dummy.y=Math.min(floor,dummy.y+500*dt);for(const s of wolf.shots){s.live=false;s.fx?.fx.stop();}wolf.shots=[];return;}
 if(!wolf.announced){wolf.announced=true;actionAudio.monsterCue('wolf_spawn',dummy.x);}
 wolf.biteCooldown=Math.max(0,wolf.biteCooldown-dt);wolf.windCooldown=Math.max(0,wolf.windCooldown-dt);wolf.leapCooldown=Math.max(0,wolf.leapCooldown-dt);
 if(dummy.stun>0||dummy.trapped||dummy.recoil>0){dummy.bossWalk=false;if(wolf.phase==='leap')dummy.flying=false;if(wolf.phase!=='idle'){wolf.phase='idle';wolf.t=0;wolf.biteCooldown=Math.max(wolf.biteCooldown,.5);wolf.windCooldown=Math.max(wolf.windCooldown,.8);}return;}
 const dx=player.x-dummy.x,dy=player.y-dummy.y;dummy.facing=dx>=0?1:-1;
 if(wolf.phase==='idle'){
  if(Math.abs(dx)<=PHONG_LANG_SPEC.biteRange&&Math.abs(dy)<85&&wolf.biteCooldown<=0){wolf.phase='bite';wolf.t=0;wolf.hit=false;dummy.bossWalk=false;fxEmit('beastAttack',dummy.x+dummy.facing*55,dummy.y-55,{style:'wind'},null,'front',{scale:.85,rotation:dummy.facing<0?Math.PI:0});return;}
  if((Math.abs(dx)>185||Math.abs(dy)>90)&&Math.hypot(dx,dy)<900&&wolf.windCooldown<=0){wolf.phase='wind';wolf.t=0;wolf.hit=false;dummy.bossWalk=false;fxEmit('windCharge',dummy.x+dummy.facing*42,dummy.y-55,{},null,'front',{scale:1.7});return;}
  if(Math.abs(dx)>145&&Math.abs(dx)<300&&Math.abs(dy)<85&&wolf.leapCooldown<=0){wolf.phase='leap';wolf.t=0;wolf.leapFrom=dummy.x;wolf.leapTo=clamp(player.x-Math.sign(dx)*80,45,WORLD_W-45);dummy.flying=true;dummy.bossWalk=false;return;}
  dummy.bossWalk=false;
  if(Math.abs(dx)>78){const nx=clamp(dummy.x+Math.sign(dx)*Math.min(Math.abs(dx)-78,PHONG_LANG_SPEC.speed*(dummy.slow>0?.4:1)*dt),45,WORLD_W-45),foot=game.terrain.firstSolidY(nx)-.5;
   if(Math.abs(foot-dummy.y)<26&&!game.terrain.solid(nx,foot-62)){dummy.bossWalk=Math.abs(nx-dummy.x)>.01;dummy.x=nx;dummy.y=foot;}}
 }else{
  wolf.t+=dt;
  if(wolf.phase==='leap'){
   const u=clamp(wolf.t/.60,0,1), nx=wolf.leapFrom+(wolf.leapTo-wolf.leapFrom)*u;
   const foot=game.terrain.firstSolidY(nx)-.5,ny=foot-Math.sin(Math.PI*u)*75;
   const overlap=Math.abs(nx-player.x)<65 && ny>player.y-100 && ny-78<player.y;
   if(!game.terrain.solid(nx,ny-55)&&!overlap){dummy.x=nx;dummy.y=ny;}else{dummy.y=game.terrain.firstSolidY(dummy.x)-.5-Math.sin(Math.PI*u)*75;}
   if(u>=1){dummy.flying=false;dummy.vy=0;wolf.phase='idle';wolf.leapCooldown=PHONG_LANG_SPEC.leapCooldown;}
  }else if(wolf.phase==='bite'){
   if(!wolf.hit&&wolf.t>=.28){wolf.hit=true;actionAudio.monsterCue('wolf_bite',dummy.x);if(Math.abs(player.x-dummy.x)<PHONG_LANG_SPEC.biteRange+10&&Math.abs(player.y-dummy.y)<85){damagePlayer(PHONG_LANG_SPEC.biteDamage,dummy.x);fxEmit('beastAttack',player.x,player.y-55,{style:'wind'},null,'front',{scale:1});fxEmit('hitSpark',player.x,player.y-55,{palette:['#20554f','#3e9d87','#93e3c1','#e8fff0','#ffffff']},null,'front',{scale:.75});}}
   if(wolf.t>=.56){wolf.phase='idle';wolf.biteCooldown=PHONG_LANG_SPEC.biteCooldown;}
  }else if(wolf.phase==='wind'){
   if(!wolf.hit&&wolf.t>=.46){wolf.hit=true;windShot();}
   if(wolf.t>=.72){wolf.phase='idle';wolf.windCooldown=PHONG_LANG_SPEC.windCooldown;}
  }
 }
}
// Explicit poses keep control and defeat readable at the normal zoom level.
export function phongLangPose(){
 if(!wolf)return {row:0,frame:0};
 if(dummy.broken||dummy.hp<=0){const t=wolf.defeatTime;return {row:3,frame:t<.16?0:t<.42?1:t<.75?2:3,alpha:t<1.15?1:Math.max(0,1-(t-1.15)/(PHONG_LANG_SPEC.defeatDuration-1.15))};}
 if(dummy.stun>0||dummy.trapped||dummy.recoil>0)return {row:3,frame:Math.floor(wolf.time*8)%2,controlled:true};
 if(wolf.phase==='leap')return {row:1,frame:Math.min(3,Math.floor(wolf.t/.60*4))};
 if(wolf.phase==='bite'||wolf.phase==='wind')return {row:2,frame:Math.min(3,Math.floor(wolf.t/(wolf.phase==='bite'?.56:.72)*4))};
 return dummy.bossWalk?{row:1,frame:Math.floor(wolf.time*(dummy.slow>0?5:10))%4}:{row:0,frame:Math.floor(wolf.time*6)%4};
}
export function drawPhongLang(){
 if(!wolf||!game.ctx||!dummy.visible)return;const ctx=game.ctx,img=game.images.phong_lang;
 const x=dummy.x-camera.x+game.viewW/2,y=dummy.y-camera.y+game.viewH/2;
 const pose=phongLangPose();ctx.save();ctx.translate(x,y);ctx.globalAlpha=pose.alpha??1;if(pose.controlled)ctx.translate(Math.sin(wolf.time*28)*2,Math.sin(wolf.time*12)*1.5);if(dummy.facing<0)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;
 if(img)ctx.drawImage(img,pose.frame*192,pose.row*128,192,128,-96,-110,192,128);
 ctx.restore();
 if(dummy.broken)return;
 const z=settings.zoom||.5385,hudScale=clamp(BASE_ZOOM/z,1,2.5);ctx.save();ctx.translate(x,y-100);ctx.scale(hudScale,hudScale);ctx.textAlign='center';ctx.font='bold 11px system-ui,sans-serif';ctx.fillStyle='#e6fff1';ctx.fillText('PHONG LANG',0,-8);if(dummy.stun>0||dummy.trapped||dummy.slow>0){ctx.fillStyle=dummy.trapped?'#dcbaff':dummy.stun>0?'#ffe680':'#9eefff';ctx.font='bold 10px system-ui,sans-serif';ctx.fillText(dummy.trapped?'✦ PHONG TỎA ✦':dummy.stun>0?'✦ CHOÁNG ✦':'❄ LÀM CHẬM',0,-23);}else if(dummy.monsterPoison){ctx.fillStyle='#b9f97e';ctx.font='bold 10px system-ui,sans-serif';ctx.fillText('☠ NHIỄM ĐỘC',0,-22);}else if(wolf.phase==='bite'||wolf.phase==='wind'){ctx.fillStyle='#baffdf';ctx.font='bold 9px system-ui,sans-serif';ctx.fillText(wolf.phase==='bite'?'CẮN XÉ':'LỐC XOÁY',0,-22);}ctx.fillStyle='#102128';ctx.fillRect(-48,0,96,7);ctx.fillStyle='#69db9a';ctx.fillRect(-47,1,94*clamp(dummy.hp/dummy.maxHp,0,1),5);ctx.restore();
}
export function finishPhongLang(){if(!wolf)return;for(const s of wolf.shots)s.fx?.fx.stop();wolf.shots=[];}
