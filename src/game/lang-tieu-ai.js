// Lăng Tiêu: năm kiếm kỹ, trạng thái chiến đấu và hiệu ứng PixelFX dùng chung game.
import { game, player, dummy, camera, settings, clamp, WORLD_W, showNotice } from './state.js';
import { receivePlayerDamage, fxEmit, isThoThuanActive } from './skills.js';
import { applyUnblockedPlayerHit, applyPlayerStun, applyStrongPlayerHit } from './character.js';
import { renderLangTieuFX } from './lang-tieu-fx.js';
import { actionAudio } from './audio.js';
import { trackSkillSegment, queueSkillImpact, skillCollisionRatio, segmentCircleTOI, isSkillStruggling, getSkillStruggle } from './va-cham-ky-nang.js';

export const LANG_TIEU_SKILLS = Object.freeze([
  {name:'KIẾM TÂM', cooldown:3}, {name:'THẬP LA TRẢM THIÊN', cooldown:30},
  {name:'VẠN KIẾM QUY TÔNG', cooldown:100}, {name:'KIẾM KHÍ HỘ THỂ', cooldown:25},
  {name:'NHÂN KIẾM HỢP NHẤT', cooldown:150}
]);
const DAMAGE_SCALE = .05; // Các mẫu gốc dùng mục tiêu 22.000 máu; Diệp Tu trong game có 1.200 máu.
let ai = null;
export function getLangTieuAI(){ return ai; }
export function resetLangTieuAI(){
  ai={time:0, phase:'idle', t:0, cooldown:[0,0,0,0,0], wait:2, next:0, shots:[], sparks:[], shield:0, shieldTime:0, origin:null, index:0, hit:0};
  dummy.swordShield=null; dummy.bossAction=''; dummy.bossActionTime=0; dummy.bossClipDuration=0; dummy.bossClipLoop=false; dummy.bossClipStart=0; dummy.bossOpacity=1; dummy.bossWalk=false;
  return ai;
}
function action(name, duration=0, loop=false, startFrame=0){
  if(dummy.bossAction!==name || dummy.bossClipDuration!==duration || dummy.bossClipLoop!==loop || dummy.bossClipStart!==startFrame){
    dummy.bossAction=name;dummy.bossActionTime=0;dummy.bossClipDuration=duration;dummy.bossClipLoop=loop;dummy.bossClipStart=startFrame;
  }
}
const COMBO_HITS=[.17,.20,.23,.59,.62,.65,1.01,1.04,1.07,1.10];
function stunOnce(cast){
  if(!cast || cast.stunApplied || player.hp<=0)return false;
  if(!applyPlayerStun(1))return false;
  cast.stunApplied=true;
  return true;
}
function damage(raw, sourceX=dummy.x, cast=ai?.currentCast,strongMode=null){
  if(player.hp<=0||game.battlePhase!=='fight')return;
  const result=receivePlayerDamage(Math.max(1, Math.round(raw*DAMAGE_SCALE)), {fromX:sourceX,notice:false});
  if (result.hpLost > 0 || result.blocked > 0) actionAudio.swordCue(cast?.index === 4 ? 'sword_ultimate_hit' : 'sword_hit', player.x);
  if(result.hpLost>0&&player.hp>0){
    if(strongMode)applyStrongPlayerHit({sourceX,mode:strongMode});
    else if(result.hpLost>=45)applyUnblockedPlayerHit('hurt');
  }
  if(result.hpLost>0&&player.hp>0)stunOnce(cast);
}
function impact(x,y,big=false,skill=ai?.index){
  if(!ai)return; ai.sparks.push({x,y,t:0,big,skill}); if(ai.sparks.length>10)ai.sparks.shift();
  fxEmit('hitSpark',x,y,{palette:['#18508a','#32b8df','#b1f7ff','#ffffff']},null,'front',{scale:big?1.3:.65});
}
function endCast(index){ ai.cooldown[index]=LANG_TIEU_SKILLS[index].cooldown; ai.phase='idle';ai.t=0;ai.wait=1.4;dummy.bossOpacity=1;if(dummy.flying)dummy.vy=0;action(''); }
export function castLangTieu(index){
  if(!ai||ai.phase!=='idle'||ai.cooldown[index]>0||index<0||index>4)return false;
  ai.index=index;ai.t=0;ai.hit=0;ai.startSequence=dummy.hitSequence;
  ai.currentCast={index,stunApplied:false};
  showNotice('LĂNG TIÊU · '+LANG_TIEU_SKILLS[index].name);
  if(index===0){ actionAudio.swordCue('sword_teleport',dummy.x); ai.phase='blink'; ai.origin={x:dummy.x,y:dummy.y}; action('teleport',.7); }
  if(index===1){ actionAudio.swordCue('sword_charge',dummy.x); ai.phase='beam_charge';action('charge_raise',.4); }
  if(index===2){ actionAudio.swordCue('sword_array',dummy.x); ai.phase='array_charge';action('hand_seal',.86); }
  if(index===3){ actionAudio.swordCue('sword_guard',dummy.x); ai.shield=1800;ai.shieldTime=8;dummy.swordShield=ai;ai.shieldCast=ai.currentCast;ai.phase='guard';action('sword_guard',.6); }
  if(index===4){ actionAudio.swordCue('sword_ultimate_charge',dummy.x); ai.phase='fusion_charge';action('charge_raise',.4); }
  return true;
}
function projectile(raw, speed, kind, angleOffset=0, final=false){
  const x=dummy.x+dummy.facing*42,y=dummy.y-85;
  const angle=Math.atan2(player.y-68-y,player.x-x)+angleOffset;
  ai.shots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,raw,kind,final,cast:ai.currentCast,age:0,live:true});
  if(ai.shots.length>55)ai.shots.shift();
  return ai.shots[ai.shots.length-1];
}
function updateShots(dt){
  for(const s of ai.shots){
    if(!s.live||isSkillStruggling(s))continue;
    const x0=s.x,y0=s.y; s.x+=s.vx*dt;s.y+=s.vy*dt;s.age+=dt;
    const rad=s.kind==='beam'?30:s.kind==='ultimate'?38:9;
    trackSkillSegment({ref:s,side:'boss',kind:s.kind,power:s.kind==='ultimate'?900:s.kind==='beam'?300:45,x0,y0,x1:s.x,y1:s.y,radius:rad,canStruggle:()=>s.live&&(s.kind==='beam'||s.kind==='ultimate'),onStruggle:(x,y)=>{s.x=x;s.y=y;},onDestroy:()=>{s.live=false;impact(s.x,s.y,false,s.cast?.index);}});
    const hit=segmentCircleTOI(x0,y0,s.x,s.y,player.x,player.y-65,rad+27);
    if(hit!==null){queueSkillImpact(s,hit,()=>{if(!s.live)return;s.live=false;const mode=s.kind==='ultimate'||s.final?'slam':s.kind==='beam'?'launch':null;damage(s.raw*skillCollisionRatio(s),x0,s.cast,mode);impact(player.x,player.y-65,s.kind!=='sword'||s.final,s.cast?.index);});}
    if(s.age>3||s.x<0||s.x>WORLD_W||s.y>1800||s.y< -1800)queueSkillImpact(s,1,()=>{s.live=false;});
  }
  ai.shots=ai.shots.filter(s=>s.live);
}
export function updateLangTieuAI(dt){
  if(!ai||game.battlePhase!=='fight'||dummy.broken||!dummy.visible||player.hp<=0||getSkillStruggle())return;
  ai.time+=dt;
  dummy.facing=ai.phase==='fusion_dash' && ai.fusedSword ? Math.sign(ai.fusedSword.vx)||dummy.facing : player.x<dummy.x?-1:1;
  for(let i=0;i<5;i++)ai.cooldown[i]=Math.max(0,ai.cooldown[i]-dt);
  if(ai.shieldTime>0){ai.shieldTime-=dt;if(ai.shieldTime<=0||ai.shield<=0){actionAudio.swordCue(ai.shield<=0?'sword_guard_break':'sword_guard_end',dummy.x);ai.shieldTime=0;ai.shield=0;dummy.swordShield=null;ai.shieldCast=null;ai.cooldown[3]=LANG_TIEU_SKILLS[3].cooldown;}}
  // Kiếm khí hộ thể làm choáng một lần nếu đối thủ chạm vòng trong mỗi lần bật.
  if(ai.shieldTime>0 && ai.shield>0 && ai.shieldCast && !ai.shieldCast.stunApplied &&
     Math.hypot(player.x-dummy.x, player.y-dummy.y)<94 && !(isThoThuanActive() && player.mana>0)){
    if(stunOnce(ai.shieldCast)){actionAudio.swordCue('sword_hit',player.x);impact(player.x,player.y-65);}
  }
  for(const s of ai.sparks)s.t+=dt;ai.sparks=ai.sparks.filter(s=>s.t<.8);
  updateShots(dt);
  // Đang trúng đòn thì dừng động tác và nhịp ra chiêu; đạn đã phóng vẫn tiếp tục bay.
  const interrupted = dummy.recoil > 0 || dummy.stun > 0 || dummy.trapped;
  if (interrupted && ai.phase !== 'fusion_dash' && ai.phase !== 'fusion_recover') { if(dummy.flying)dummy.vy=0; return; }
  ai.t+=dt;dummy.bossActionTime+=dt;
  const t=ai.t;
  if(ai.phase==='idle'){
    ai.wait-=dt; action('');
    if(dummy.stun>0||dummy.trapped)return;
    const dx=player.x-dummy.x,dy=player.y-dummy.y;
    if(Math.abs(dx)>430){dummy.x=clamp(dummy.x+Math.sign(dx)*Math.min(Math.abs(dx)-350,125*dt),35,WORLD_W-35);dummy.bossWalk=true;dummy.gait=(dummy.gait||0)+dt*10;}
    else dummy.bossWalk=false;
    // Đuổi theo mục tiêu trên không, tránh đứng dưới đất không thể đánh người bay.
    const groundY=game.terrain.firstSolidY(dummy.x)-.5;
    const targetY=clamp(player.y,groundY-699.5,groundY);
    const verticalStep=clamp(targetY-dummy.y,-140*dt,140*dt);
    dummy.y+=verticalStep;
    // Expose actual movement to the animation selector; do not invent speed when stationary.
    dummy.vy=dt>0 ? verticalStep/dt : 0;
    dummy.flying=(groundY-dummy.y)>20 || (groundY-targetY)>20;
    if(ai.wait<=0){
      const order=[3,1,0,2,0,4,0,1];let chosen=-1;
      for(let n=0;n<order.length;n++){const k=order[(ai.next+n)%order.length];if(ai.cooldown[k]<=0&&(k!==0||Math.hypot(dx,dy)<800)){chosen=k;ai.next=(ai.next+n+1)%order.length;break;}}
      if(chosen>=0)castLangTieu(chosen);else ai.wait=.5;
    }
  } else if(ai.phase==='guard'){if(t>=.6)endCast(3);}
  else if(ai.phase==='blink'){
    if(t>=.35){dummy.x=clamp(player.x+(player.facing||1)*75,35,WORLD_W-35);dummy.y=player.y;dummy.facing=player.x<dummy.x?-1:1;ai.phase='blink_arrive';ai.t=0;impact(dummy.x,dummy.y-65);}
  } else if(ai.phase==='blink_arrive'){
    if(t>=.35){ai.phase='combo';ai.t=0;action('sword_attack',.42,true);}
  } else if(ai.phase==='combo'){
    // Ba nhịp vung kiếm; sát thương rơi vào các khung kiếm đã vươn tới mục tiêu.
    while(ai.hit<COMBO_HITS.length && t>=COMBO_HITS[ai.hit]){
      ai.hit++;if ([1,4,7,10].includes(ai.hit)) actionAudio.swordCue('sword_slash',dummy.x,ai.hit%3);
      if(Math.hypot(dummy.x-player.x,(dummy.y-player.y)*.7)<160){damage(ai.hit===10?168:48);impact(player.x,player.y-65);}
    }
    if(t>=1.26){actionAudio.swordCue('sword_teleport',dummy.x,1);ai.phase='return';ai.t=0;action('teleport',.6);}
  } else if(ai.phase==='return'){
    if(t>=.3){dummy.x=ai.origin.x;dummy.y=ai.origin.y;ai.phase='return_arrive';ai.t=0;}
  } else if(ai.phase==='return_arrive'){
    if(t>=.3)endCast(0);
  } else if(ai.phase==='beam_charge'){
    if(t>=1.28) action('sword_cast',.6,false,4);
    else if(t>=.4) action('charge_hold',.2,true);
    if(t>=1.68){actionAudio.swordCue('sword_beam',dummy.x);ai.beam=projectile(1600,930,'beam');ai.phase='beam_release';ai.t=0;}
  } else if(ai.phase==='beam_release'){if(t>=.25&&!ai.beam?.live)endCast(1);}
  else if(ai.phase==='array_charge'){if(t>=.86){ai.phase='array';ai.t=0;ai.hit=0;action('sword_cast',.6,true);}}
  else if(ai.phase==='array'){
    // Mỗi lần vung kiếm phát ba kiếm khí, giới hạn vật thể để nhẹ trên điện thoại.
    while(ai.hit<35 && t>=Math.floor(ai.hit/3)*.6+.30+(ai.hit%3)*.055){
      const n=ai.hit++;if(n%3===0)actionAudio.swordCue('sword_fly',dummy.x,n%2);if(n===34)actionAudio.swordCue('sword_beam',dummy.x,1);projectile(n===34?4800:235,760,'sword',Math.sin(n*2.4)*.11,n===34);
    }
    if(t>=7.1&&!ai.shots.some(s=>s.kind==='sword'))endCast(2);
  } else if(ai.phase==='fusion_charge'){
    if(t>=2.3) action('sword_cast',.6,false,4);
    else if(t>=.4) action('charge_hold',.2,true);
    dummy.bossOpacity=1-.85*clamp((t-2.1)/.6,0,1);
    if(t>=2.7){actionAudio.swordCue('sword_ultimate_fire',dummy.x);ai.phase='fusion_dash';ai.t=0;ai.fusedSword=projectile(18000,1450,'ultimate');action('teleport',.7,true);}
  } else if(ai.phase==='fusion_dash'){
    dummy.bossOpacity=.15;
    if(ai.fusedSword?.live){dummy.x=clamp(ai.fusedSword.x,35,WORLD_W-35);dummy.y=ai.fusedSword.y+85;dummy.vy=ai.fusedSword.vy;dummy.flying=true;}
    if(t>=3.2||!ai.fusedSword?.live){ai.phase='fusion_recover';ai.t=0;action('teleport',.35);}
  } else if(ai.phase==='fusion_recover'){
    dummy.bossOpacity=.15+.85*clamp(t/.35,0,1);
    if(t>=.35)endCast(4);
  }
}


export function drawLangTieuEffects(){ if(!dummy.broken) renderLangTieuFX(ai); }
