import { actionAudio } from './audio.js';
// U Minh Ma Bức: flying shadow monster for round three.
import {game,player,dummy,camera,settings,clamp,WORLD_W,BASE_ZOOM} from './state.js';
import {receivePlayerDamage,fxEmit} from './skills.js';
import {applyUnblockedPlayerHit} from './character.js';
import {trackSkillSegment,queueSkillImpact,segmentCircleTOI,skillCollisionRatio} from './va-cham-ky-nang.js';
export const U_MINH_SPEC=Object.freeze({hp:950,orbDamage:85,orbSpeed:345,orbRadius:28,orbCooldown:4.8,orbLifetime:2.8,diveDamage:105,diveCooldown:5.2,hoverSpeed:135,exp:0});
let bat=null;
export const getUMinh=()=>bat;
export function useUMinh(instance){bat=instance;}
export function resetUMinh(){bat={time:0,phase:'hover',t:0,orbCooldown:1.25,diveCooldown:2.7,shots:[],hit:false,defeatTime:0,landTime:0,fallSpeed:0,defeatedReady:false};dummy.flying=true;return bat;}
function damagePlayer(amount,fromX){const hit=receivePlayerDamage(Math.max(1,Math.round(amount)),{fromX,notice:false});if(hit.hpLost>0&&player.hp>0)applyUnblockedPlayerHit('hurt');return hit;}
function shootOrb(){
 actionAudio.monsterCue('bat_orb',dummy.x);
 const x=dummy.x+dummy.facing*42,y=dummy.y-45;fxEmit('beastAttack',x,y,{style:'shadow'},null,'front',{scale:.85});const dx=player.x-x,dy=player.y-60-y,dist=Math.hypot(dx,dy)||1;
 const s={x,y,vx:dx/dist*U_MINH_SPEC.orbSpeed,vy:dy/dist*U_MINH_SPEC.orbSpeed,age:0,live:true,fx:fxEmit('uminhOrb',x,y,{},null,'front',{scale:1.65})};
 bat.shots.push(s);if(bat.shots.length>2){const old=bat.shots.shift();old.live=false;old.fx?.fx.stop();}
}
function updateOrbs(dt){
 for(const s of bat.shots){
  if(!s.live)continue;const x0=s.x,y0=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.age+=dt;if(s.fx){s.fx.x=s.x;s.fx.y=s.y;}
  const hit=segmentCircleTOI(x0,y0,s.x,s.y,player.x,player.y-60,U_MINH_SPEC.orbRadius+22);
  trackSkillSegment({ref:s,side:'boss',kind:'shadow',power:90,x0,y0,x1:x0+(s.x-x0)*(hit??1),y1:y0+(s.y-y0)*(hit??1),t1:hit??1,radius:U_MINH_SPEC.orbRadius,onDestroy:()=>{s.live=false;s.fx?.fx.stop();}});
  if(hit!==null)queueSkillImpact(s,hit,()=>{if(!s.live)return;s.live=false;s.fx?.fx.stop();damagePlayer(U_MINH_SPEC.orbDamage*skillCollisionRatio(s),x0);fxEmit('beastAttack',player.x,player.y-60,{style:'shadow'},null,'front',{scale:1.15});fxEmit('hitSpark',player.x,player.y-60,{palette:['#221035','#592480','#ab69eb','#e8c7ff','#ffffff']},null,'front',{scale:1});});
  if(s.age>=U_MINH_SPEC.orbLifetime||s.x<0||s.x>WORLD_W||s.y>2400||s.y<-3000){queueSkillImpact(s,1,()=>{s.live=false;s.fx?.fx.stop();});}
 }
 bat.shots=bat.shots.filter(s=>s.live);
}
export function updateUMinh(dt){
 if(!bat||!game.running||game.battlePhase!=='fight')return;
 bat.time+=dt;updateOrbs(dt);
 if(dummy.broken||dummy.hp<=0){
  bat.defeatTime+=dt;dummy.flying=false;for(const s of bat.shots){s.live=false;s.fx?.fx.stop();}bat.shots=[];
  const ground=game.terrain.firstSolidY(dummy.x)-.5;
  if(dummy.y<ground){bat.fallSpeed=Math.min(1200,bat.fallSpeed+1200*dt);dummy.y=Math.min(ground,dummy.y+bat.fallSpeed*dt);}
  else{bat.landTime+=dt;if(bat.landTime>=1.1)bat.defeatedReady=true;}
  return;
 }
 if(!bat.announced){bat.announced=true;actionAudio.monsterCue('bat_spawn',dummy.x);}
 dummy.flying=true;
 bat.orbCooldown=Math.max(0,bat.orbCooldown-dt);bat.diveCooldown=Math.max(0,bat.diveCooldown-dt);
 if(dummy.stun>0||dummy.trapped||dummy.recoil>0){if(bat.phase!=='hover'){bat.phase='hover';bat.t=0;bat.orbCooldown=Math.max(bat.orbCooldown,.8);bat.diveCooldown=Math.max(bat.diveCooldown,1.1);}return;}
 const dx=player.x-dummy.x,dy=player.y-dummy.y;dummy.facing=dx>=0?1:-1;
 if(bat.phase==='hover'){
  if(Math.abs(dx)<400&&Math.abs(dy)<270&&bat.diveCooldown<=0){bat.phase='diveWindup';bat.t=0;bat.hit=false;fxEmit('beastAttack',dummy.x,dummy.y-45,{style:'shadow'},null,'front',{scale:1.1});fxEmit('uminhCharge',dummy.x,dummy.y-45,{},null,'front',{scale:1.2});return;}
  if(Math.hypot(dx,dy)<900&&bat.orbCooldown<=0){bat.phase='orb';bat.t=0;bat.hit=false;fxEmit('uminhCharge',dummy.x+dummy.facing*35,dummy.y-45,{},null,'front',{scale:1.45});return;}
  const slow=dummy.slow>0?.45:1;if(Math.abs(dx)>300)dummy.x=clamp(dummy.x+Math.sign(dx)*Math.min(Math.abs(dx)-300,U_MINH_SPEC.hoverSpeed*slow*dt),70,WORLD_W-70);
  const ground=game.terrain.firstSolidY(dummy.x)-.5, targetY=Math.min(ground-140,player.y-160)+Math.sin(bat.time*3)*10;
  dummy.y+=clamp(targetY-dummy.y,-100*dt*slow,100*dt*slow);
 }else{
  bat.t+=dt;
  if(bat.phase==='orb'){
   if(!bat.hit&&bat.t>=.53){bat.hit=true;shootOrb();}
   if(bat.t>=.78){bat.phase='hover';bat.orbCooldown=U_MINH_SPEC.orbCooldown;}
  }else if(bat.phase==='diveWindup'){
   if(bat.t>=.58){actionAudio.monsterCue('bat_dive',dummy.x);bat.phase='dive';bat.t=0;bat.hit=false;bat.startX=dummy.x;bat.startY=dummy.y;const sign=Math.sign(player.x-dummy.x)||dummy.facing;bat.endX=clamp(player.x+sign*160,60,WORLD_W-60);bat.endY=player.y-20;}
  }else if(bat.phase==='dive'){
   const x0=dummy.x,y0=dummy.y-45,u=clamp(bat.t/.62,0,1);dummy.x=bat.startX+(bat.endX-bat.startX)*u;dummy.y=Math.min(game.terrain.firstSolidY(dummy.x)-5,bat.startY+(bat.endY-bat.startY)*u);
   if(!bat.hit&&segmentCircleTOI(x0,y0,dummy.x,dummy.y-45,player.x,player.y-60,60)!==null){bat.hit=true;damagePlayer(U_MINH_SPEC.diveDamage,x0);fxEmit('beastAttack',player.x,player.y-60,{style:'shadow'},null,'front',{scale:1.25});fxEmit('hitSpark',player.x,player.y-60,{palette:['#27133b','#6a3495','#c681ed','#ecd3ff','#ffffff']},null,'front',{scale:.95});}
   if(u>=1){bat.phase='recover';bat.t=0;bat.diveCooldown=U_MINH_SPEC.diveCooldown;}
  }else if(bat.phase==='recover'&&bat.t>=.4){bat.phase='hover';bat.t=0;}
 }
}
export function uMinhPose(){
 if(!bat)return {row:0,frame:0};
 if(dummy.broken||dummy.hp<=0)return {row:3,frame:bat.landTime>0?3:2,alpha:bat.landTime<.7?1:Math.max(0,1-(bat.landTime-.7)/.4)};
 if(dummy.stun>0||dummy.trapped||dummy.recoil>0)return {row:3,frame:Math.floor(bat.time*8)%2,controlled:true};
 // The moving orb is rendered entirely by PixelFX, so use the clean flight frames here.
 if(bat.phase==='orb')return {row:1,frame:Math.min(3,Math.floor(bat.t/.78*4))};
 if(bat.phase==='dive'||bat.phase==='diveWindup')return {row:2,frame:bat.phase==='dive'?Math.min(3,Math.floor(bat.t/.62*4)):0};
 return {row:0,frame:Math.floor(bat.time*(dummy.slow>0?5:9))%4};
}
export function drawUMinh(){
 if(!bat||!game.ctx||!dummy.visible)return;const ctx=game.ctx,img=game.images.u_minh_ma_buc,x=dummy.x-camera.x+game.viewW/2,y=dummy.y-camera.y+game.viewH/2,pose=uMinhPose();
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=pose.alpha??1;if(pose.controlled)ctx.translate(Math.sin(bat.time*28)*2,Math.sin(bat.time*12)*2);if(dummy.facing<0)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;if(img)ctx.drawImage(img,pose.frame*288,pose.row*192,288,192,-125,-135,250,167);ctx.restore();
 if(dummy.broken||dummy.hp<=0)return;
 const z=settings.zoom||.5385,hudScale=clamp(BASE_ZOOM/z,1,2.5);ctx.save();ctx.translate(x,y-130);ctx.scale(hudScale,hudScale);ctx.textAlign='center';ctx.font='bold 11px system-ui,sans-serif';ctx.fillStyle='#e6f5ff';ctx.fillText('U MINH MA BỨC',0,-8);
 if(dummy.stun>0||dummy.trapped||dummy.slow>0){ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle=dummy.trapped?'#e3c5ff':dummy.stun>0?'#ffe780':'#a8efff';ctx.fillText(dummy.trapped?'✦ PHONG TỎA ✦':dummy.stun>0?'✦ CHOÁNG ✦':'❄ LÀM CHẬM',0,-23);}
 else if(dummy.monsterPoison){ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle='#b9f97e';ctx.fillText('☠ NHIỄM ĐỘC',0,-23);}
 else if(bat.phase==='orb'||bat.phase==='diveWindup'){ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle='#fae89a';ctx.fillText(bat.phase==='orb'?'MA CẦU':'ẢNH TẬP',0,-23);}
 ctx.fillStyle='#101a35';ctx.fillRect(-48,0,96,7);ctx.fillStyle='#7dbdff';ctx.fillRect(-47,1,94*clamp(dummy.hp/dummy.maxHp,0,1),5);ctx.restore();
}
export function finishUMinh(){if(!bat)return;for(const s of bat.shots)s.fx?.fx.stop();bat.shots=[];}
