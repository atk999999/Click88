import { actionAudio } from './audio.js';
// Lôi Ưng: aerial monster, one orb or one dive at a time.
import {game,player,dummy,camera,settings,clamp,WORLD_W,BASE_ZOOM} from './state.js';
import {receivePlayerDamage,fxEmit} from './skills.js';
import {applyUnblockedPlayerHit} from './character.js';
import {trackSkillSegment,queueSkillImpact,segmentCircleTOI,skillCollisionRatio} from './va-cham-ky-nang.js';
export const LOI_UNG_SPEC=Object.freeze({hp:470,orbDamage:65,orbSpeed:330,orbRadius:26,orbCooldown:4.5,orbLifetime:2.8,diveDamage:85,diveCooldown:4.8,hoverSpeed:125,exp:10});
let eagle=null;
export const getLoiUng=()=>eagle;
export function useLoiUng(instance){eagle=instance;}
export function resetLoiUng(){eagle={time:0,phase:'hover',t:0,orbCooldown:1.25,diveCooldown:2.7,shots:[],hit:false,defeatTime:0,landTime:0,fallSpeed:0,defeatedReady:false};dummy.flying=true;return eagle;}
function damagePlayer(amount,fromX){const hit=receivePlayerDamage(Math.max(1,Math.round(amount)),{fromX,notice:false});if(hit.hpLost>0&&player.hp>0)applyUnblockedPlayerHit('hurt');return hit;}
function shootOrb(){
 actionAudio.monsterCue('eagle_orb',dummy.x);
 const x=dummy.x+dummy.facing*42,y=dummy.y-45;fxEmit('beastAttack',x,y,{style:'lightning'},null,'front',{scale:.85});const dx=player.x-x,dy=player.y-60-y,dist=Math.hypot(dx,dy)||1;
 const s={x,y,vx:dx/dist*LOI_UNG_SPEC.orbSpeed,vy:dy/dist*LOI_UNG_SPEC.orbSpeed,age:0,live:true,fx:fxEmit('thunderOrb',x,y,{},null,'front',{scale:1.65})};
 eagle.shots.push(s);if(eagle.shots.length>2){const old=eagle.shots.shift();old.live=false;old.fx?.fx.stop();}
}
function updateOrbs(dt){
 for(const s of eagle.shots){
  if(!s.live)continue;const x0=s.x,y0=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.age+=dt;if(s.fx){s.fx.x=s.x;s.fx.y=s.y;}
  const hit=segmentCircleTOI(x0,y0,s.x,s.y,player.x,player.y-60,LOI_UNG_SPEC.orbRadius+22);
  trackSkillSegment({ref:s,side:'boss',kind:'lightning',power:90,x0,y0,x1:x0+(s.x-x0)*(hit??1),y1:y0+(s.y-y0)*(hit??1),t1:hit??1,radius:LOI_UNG_SPEC.orbRadius,onDestroy:()=>{s.live=false;s.fx?.fx.stop();}});
  if(hit!==null)queueSkillImpact(s,hit,()=>{if(!s.live)return;s.live=false;s.fx?.fx.stop();damagePlayer(LOI_UNG_SPEC.orbDamage*skillCollisionRatio(s),x0);fxEmit('beastAttack',player.x,player.y-60,{style:'lightning'},null,'front',{scale:1.15});fxEmit('hitSpark',player.x,player.y-60,{palette:['#172c66','#336cff','#8edfff','#fff1ab','#ffffff']},null,'front',{scale:1});});
  if(s.age>=LOI_UNG_SPEC.orbLifetime||s.x<0||s.x>WORLD_W||s.y>2400||s.y<-3000){queueSkillImpact(s,1,()=>{s.live=false;s.fx?.fx.stop();});}
 }
 eagle.shots=eagle.shots.filter(s=>s.live);
}
export function updateLoiUng(dt){
 if(!eagle||!game.running||game.battlePhase!=='fight')return;
 eagle.time+=dt;updateOrbs(dt);
 if(dummy.broken||dummy.hp<=0){
  eagle.defeatTime+=dt;dummy.flying=false;for(const s of eagle.shots){s.live=false;s.fx?.fx.stop();}eagle.shots=[];
  const ground=game.terrain.firstSolidY(dummy.x)-.5;
  if(dummy.y<ground){eagle.fallSpeed=Math.min(1200,eagle.fallSpeed+1200*dt);dummy.y=Math.min(ground,dummy.y+eagle.fallSpeed*dt);}
  else{eagle.landTime+=dt;if(eagle.landTime>=1.1)eagle.defeatedReady=true;}
  return;
 }
 if(!eagle.announced){eagle.announced=true;actionAudio.monsterCue('eagle_spawn',dummy.x);}
 dummy.flying=true;
 eagle.orbCooldown=Math.max(0,eagle.orbCooldown-dt);eagle.diveCooldown=Math.max(0,eagle.diveCooldown-dt);
 if(dummy.stun>0||dummy.trapped||dummy.recoil>0){if(eagle.phase!=='hover'){eagle.phase='hover';eagle.t=0;eagle.orbCooldown=Math.max(eagle.orbCooldown,.8);eagle.diveCooldown=Math.max(eagle.diveCooldown,1.1);}return;}
 const dx=player.x-dummy.x,dy=player.y-dummy.y;dummy.facing=dx>=0?1:-1;
 if(eagle.phase==='hover'){
  if(Math.abs(dx)<400&&Math.abs(dy)<270&&eagle.diveCooldown<=0){eagle.phase='diveWindup';eagle.t=0;eagle.hit=false;fxEmit('beastAttack',dummy.x,dummy.y-45,{style:'lightning'},null,'front',{scale:1.1});fxEmit('thunderWindup',dummy.x,dummy.y-45,{},null,'front',{scale:1.2});return;}
  if(Math.hypot(dx,dy)<900&&eagle.orbCooldown<=0){eagle.phase='orb';eagle.t=0;eagle.hit=false;fxEmit('thunderWindup',dummy.x+dummy.facing*35,dummy.y-45,{},null,'front',{scale:1.45});return;}
  const slow=dummy.slow>0?.45:1;if(Math.abs(dx)>300)dummy.x=clamp(dummy.x+Math.sign(dx)*Math.min(Math.abs(dx)-300,LOI_UNG_SPEC.hoverSpeed*slow*dt),70,WORLD_W-70);
  const ground=game.terrain.firstSolidY(dummy.x)-.5, targetY=Math.min(ground-140,player.y-160)+Math.sin(eagle.time*3)*10;
  dummy.y+=clamp(targetY-dummy.y,-100*dt*slow,100*dt*slow);
 }else{
  eagle.t+=dt;
  if(eagle.phase==='orb'){
   if(!eagle.hit&&eagle.t>=.53){eagle.hit=true;shootOrb();}
   if(eagle.t>=.78){eagle.phase='hover';eagle.orbCooldown=LOI_UNG_SPEC.orbCooldown;}
  }else if(eagle.phase==='diveWindup'){
   if(eagle.t>=.58){actionAudio.monsterCue('eagle_dive',dummy.x);eagle.phase='dive';eagle.t=0;eagle.hit=false;eagle.startX=dummy.x;eagle.startY=dummy.y;const sign=Math.sign(player.x-dummy.x)||dummy.facing;eagle.endX=clamp(player.x+sign*160,60,WORLD_W-60);eagle.endY=player.y-20;}
  }else if(eagle.phase==='dive'){
   const x0=dummy.x,y0=dummy.y-45,u=clamp(eagle.t/.62,0,1);dummy.x=eagle.startX+(eagle.endX-eagle.startX)*u;dummy.y=Math.min(game.terrain.firstSolidY(dummy.x)-5,eagle.startY+(eagle.endY-eagle.startY)*u);
   if(!eagle.hit&&segmentCircleTOI(x0,y0,dummy.x,dummy.y-45,player.x,player.y-60,60)!==null){eagle.hit=true;damagePlayer(LOI_UNG_SPEC.diveDamage,x0);fxEmit('beastAttack',player.x,player.y-60,{style:'lightning'},null,'front',{scale:1.25});fxEmit('hitSpark',player.x,player.y-60,{palette:['#142c64','#2a70d9','#81cfff','#fff5be','#ffffff']},null,'front',{scale:.95});}
   if(u>=1){eagle.phase='recover';eagle.t=0;eagle.diveCooldown=LOI_UNG_SPEC.diveCooldown;}
  }else if(eagle.phase==='recover'&&eagle.t>=.4){eagle.phase='hover';eagle.t=0;}
 }
}
export function loiUngPose(){
 if(!eagle)return {row:0,frame:0};
 if(dummy.broken||dummy.hp<=0)return {row:3,frame:eagle.landTime>0?3:2,alpha:eagle.landTime<.7?1:Math.max(0,1-(eagle.landTime-.7)/.4)};
 if(dummy.stun>0||dummy.trapped||dummy.recoil>0)return {row:3,frame:Math.floor(eagle.time*8)%2,controlled:true};
 // The moving orb is rendered entirely by PixelFX, so use the clean flight frames here.
 if(eagle.phase==='orb')return {row:0,frame:Math.min(3,Math.floor(eagle.t/.78*4))};
 if(eagle.phase==='dive'||eagle.phase==='diveWindup')return {row:2,frame:eagle.phase==='dive'?Math.min(3,Math.floor(eagle.t/.62*4)):0};
 return {row:0,frame:Math.floor(eagle.time*(dummy.slow>0?5:9))%4};
}
export function drawLoiUng(){
 if(!eagle||!game.ctx||!dummy.visible)return;const ctx=game.ctx,img=game.images.loi_ung,x=dummy.x-camera.x+game.viewW/2,y=dummy.y-camera.y+game.viewH/2,pose=loiUngPose();
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=pose.alpha??1;if(pose.controlled)ctx.translate(Math.sin(eagle.time*28)*2,Math.sin(eagle.time*12)*2);if(dummy.facing<0)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;if(img)ctx.drawImage(img,pose.frame*192,pose.row*128,192,128,-96,-110,192,128);ctx.restore();
 if(dummy.broken||dummy.hp<=0)return;
 const z=settings.zoom||.5385,hudScale=clamp(BASE_ZOOM/z,1,2.5);ctx.save();ctx.translate(x,y-108);ctx.scale(hudScale,hudScale);ctx.textAlign='center';ctx.font='bold 11px system-ui,sans-serif';ctx.fillStyle='#e6f5ff';ctx.fillText('LÔI ƯNG',0,-8);
 if(dummy.stun>0||dummy.trapped||dummy.slow>0){ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle=dummy.trapped?'#e3c5ff':dummy.stun>0?'#ffe780':'#a8efff';ctx.fillText(dummy.trapped?'✦ PHONG TỎA ✦':dummy.stun>0?'✦ CHOÁNG ✦':'❄ LÀM CHẬM',0,-23);}
 else if(dummy.monsterPoison){ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle='#b9f97e';ctx.fillText('☠ NHIỄM ĐỘC',0,-23);}
 else if(eagle.phase==='orb'||eagle.phase==='diveWindup'){ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle='#fae89a';ctx.fillText(eagle.phase==='orb'?'LÔI CẦU':'LAO XUYÊN',0,-23);}
 ctx.fillStyle='#101a35';ctx.fillRect(-48,0,96,7);ctx.fillStyle='#7dbdff';ctx.fillRect(-47,1,94*clamp(dummy.hp/dummy.maxHp,0,1),5);ctx.restore();
}
export function finishLoiUng(){if(!eagle)return;for(const s of eagle.shots)s.fx?.fx.stop();eagle.shots=[];}
