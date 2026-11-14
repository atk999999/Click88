// Combat logic is separate from the established round order. HP/damage 1 and 3 are test values.
import { TANG_MA_COMBO_TIMES } from './tang-ma-animation.js';
export const TANG_MA_COMBAT = Object.freeze({cooldowns:[8,100,12,80],duration:[3.5,2.3,6.7,6.1],rageDuration:50,rageHpMultiplier:3,rageDamageMultiplier:2,rageSpeedMultiplier:2,damage:[180,0,300,22],finalDamage:85});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createTangMaCombat(){return {action:'idle',t:0,age:0,cooldown:[0,0,0,0],rage:0,wait:1.8,next:0,hit:0,locked:false,grab:false,emitted:new Set(),castSpeed:1,auto:true};}
function rageEnd(a,b){if(a.rage<=0)return;a.rage=0;const ratio=b.maxHp>0?b.hp/b.maxHp:0;b.maxHp/=3;b.hp=Math.max(0,Math.min(b.maxHp,b.maxHp*ratio));}
export function castTangMa(a,index,b,h,emit=()=>{}){
 if(!a||a.action!=='idle'||index<0||index>3||a.cooldown[index]>0||b.broken||b.hp<=0)return false;
 if(index===1&&a.rage>0)return false;
 a.action='skill'+(index+1);a.t=0;a.hit=0;a.locked=false;a.grab=false;a.emitted=new Set();a.cooldown[index]=TANG_MA_COMBAT.cooldowns[index];a.castSpeed=index===3&&a.rage>0?2:1;
 a.startX=b.x;a.startY=b.y;a.targetX=h.x;a.targetY=h.y;a.dir=Math.sign(h.x-b.x)||1;b.facing=a.dir;
 if(index===0)emit('gold_charge',b.x+a.dir*85,b.y-100);
 if(index===1){a.rage=TANG_MA_COMBAT.rageDuration;b.maxHp*=3;b.hp*=3;emit('rage',b.x,b.y-100);}
 if(index===2)emit('void',b.x+a.dir*65,b.y-175);
 if(index===3)emit('blink',b.x,b.y-100);
 return true;
}
function event(a,k,at,fn){if(a.t>=at&&!a.emitted.has(k)){a.emitted.add(k);fn();}}
export function updateTangMa(a,dt,env){
 const {boss:b,hero:h,ground,hit,stun,emit=()=>{},notice=()=>{}}=env;
 if(!a||!b||!h)return;dt=Math.max(0,Math.min(dt,.1));a.age+=dt;a.cooldown=a.cooldown.map(n=>Math.max(0,n-dt));
 if(a.rage>0){a.rage-=dt;if(a.rage<=0){a.rage=.001;rageEnd(a,b);notice('TÁNG MA · CUỒNG BẠO KẾT THÚC');}}
 if(b.broken||b.hp<=0){b.tmInvulnerable=false;return;}
 if(a.action==='skill1'&&a.t>=.9&&a.t<1.43){b.stun=0;b.trapped=false;b.recoil=0;}
 if((b.stun>0||b.trapped||b.recoil>0)&&!(a.action==='skill1'&&a.t>=.9&&a.t<1.43)){
  if(a.action!=='idle'){a.action='idle';a.locked=false;a.grab=false;a.wait=.6;} b.tmInvulnerable=false;return;
 }
 if(a.action==='idle'){
  b.tmInvulnerable=false;a.wait-=dt;b.facing=Math.sign(h.x-b.x)||1;
  const dx=h.x-b.x;if(Math.abs(dx)>350)b.x=clamp(b.x+Math.sign(dx)*Math.min(Math.abs(dx)-350,110*(a.rage?2:1)*dt),80,4720);
  const targetY=Math.min(ground(b.x),h.y);b.y+=clamp(targetY-b.y,-130*dt,130*dt);b.flying=b.y<ground(b.x)-15;
  if(a.auto&&a.wait<=0){const order=[0,2,3,1];for(let n=0;n<4;n++){let i=order[(a.next+n)%4];if(castTangMa(a,i,b,h,emit)){a.next=(a.next+n+1)%4;notice('TÁNG MA · '+['HOANG DIỆM TRUY SÁT','CUỒNG BẠO','PHỆ THẦN','DỊCH ẢNH LIÊN KÍCH'][i]);break;}}if(a.action==='idle')a.wait=.4;}
  return;
 }
 const old=a.t;a.t+=dt;const t=a.t,mult=a.rage>0?2:1;
 if(a.action==='skill1'){
  b.tmInvulnerable=t>=.9&&t<1.43;
  event(a,'dash',.9,()=>{a.startX=b.x;a.startY=b.y;a.targetX=h.x-a.dir*110;a.targetY=h.y;emit('gold_dash',b.x,b.y-120);});
  if(t>=.9&&t<1.43){const u=clamp((t-.9)/.53,0,1);b.x=clamp(a.startX+(a.targetX-a.startX)*u,80,4720);b.y=Math.min(ground(b.x),a.startY+(a.targetY-a.startY)*u);}
  event(a,'impact',1.43,()=>{b.tmInvulnerable=false;if(Math.abs(h.x-b.x)<190&&Math.abs(h.y-b.y)<180){hit(TANG_MA_COMBAT.damage[0]*mult,b.x,'launch');emit('gold_blast',h.x,h.y-65);}else emit('gold_blast',b.x+a.dir*120,b.y-90);});
 }
 if(a.action==='skill2')event(a,'burst',1.25,()=>emit('rage_blast',b.x,b.y-120));
 if(a.action==='skill3'){
  if(t>=.8&&t<2.7&&Math.abs(h.x-b.x)<600&&Math.abs(h.y-b.y)<350){const dx=b.x+a.dir*145-h.x;h.x+=clamp(dx,-190*dt,190*dt);}
  event(a,'grab',2.7,()=>{if(Math.abs(h.x-b.x)<200&&Math.abs(h.y-b.y)<180){const res=hit(1,b.x,null);if(res?.hpLost>0){a.grab=true;stun(2.5);emit('grab',h.x,h.y-60);}}});
  if(a.grab&&t>=2.7&&t<4.25){const rise=t<3.25?0:145*clamp((t-3.25),0,1);b.y=Math.min(ground(b.x),a.startY-rise);h.x=b.x+a.dir*145;h.y=b.y-65;h.vx=0;h.vy=0;}
  if(a.grab&&t>=4.25&&t<5){const u=clamp((t-4.25)/.75,0,1);h.x=clamp(b.x+a.dir*(145+170*u),20,4780);h.y=b.y-65+210*u*u;}
  event(a,'slam',5,()=>{if(a.grab){hit(TANG_MA_COMBAT.damage[2]*mult,b.x,'slam');emit('slam',h.x,h.y);a.grab=false;}b.y=ground(b.x);});
 }
 if(a.action==='skill4'){
  const speed=a.castSpeed;const comboTime=(t-.52)*speed;
  if(t<.52){const u=clamp(t/.52,0,1);b.x=clamp(a.startX+(a.targetX-a.dir*140-a.startX)*u,80,4720);b.y=Math.min(ground(b.x),a.startY+(a.targetY-a.startY)*u);}
  while(a.hit<16&&comboTime+1e-9>=TANG_MA_COMBO_TIMES[a.hit]){
   if(a.hit===0){if(Math.abs(h.x-b.x)>210||Math.abs(h.y-b.y)>180){a.action='idle';a.wait=.8;notice('NÉ ĐÒN ĐẦU · THOÁT LIÊN KÍCH');break;}const res=hit(TANG_MA_COMBAT.damage[3]*mult,b.x,null);if(!res||res.hpLost<=0){a.action='idle';a.wait=.8;break;}a.locked=true;stun((4.88+.6)/speed);}
   else{b.x=clamp(h.x+a.dir*135,80,4720);b.facing=-a.dir;emit('blink',b.x,b.y-100);hit((a.hit===15?TANG_MA_COMBAT.finalDamage:TANG_MA_COMBAT.damage[3])*mult,b.x,a.hit===15?'slam':null);}
   emit(a.hit===15?'combo_finish':'combo_hit',h.x,h.y-65);h.vx=a.dir*350;h.vy=-130;h.grounded=false;a.hit++;
  }
 }
 if(a.action!=='idle'){
  const d=a.action==='skill4'?.52+5.5/a.castSpeed:TANG_MA_COMBAT.duration[Number(a.action.slice(-1))-1];
  if(t>=d){a.action='idle';a.wait=1.3;a.grab=false;a.locked=false;b.tmInvulnerable=false;b.y=Math.min(b.y,ground(b.x));}
 }
}
