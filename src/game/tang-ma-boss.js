import { game,player,dummy,camera,settings,clamp,showNotice,addCameraShake } from './state.js';
import { receivePlayerDamage,fxEmit } from './skills.js';
import { applyUnblockedPlayerHit,applyStrongPlayerHit,applyPlayerStun } from './character.js';
import { createTangMaCombat,castTangMa,updateTangMa } from './tang-ma-combat.js';
import { tangMaPose } from './tang-ma-animation.js';
import { actionAudio } from './audio.js';
let ai=null;
export function resetTangMa(){ai=createTangMaCombat();dummy.tmInvulnerable=false;return ai;}
export function getTangMa(){return ai;}
const TANG_SOUND=Object.freeze({gold_charge:'tang_charge',gold_dash:'tang_dash',gold_blast:'tang_impact',rage:'tang_rage',rage_blast:'tang_impact',void:'tang_void',grab:'tang_grab',slam:'tang_impact',blink:'tang_blink',combo_hit:'tang_combo',combo_finish:'tang_impact'});
function emit(kind,x,y){const large=['gold_blast','slam','combo_finish'].includes(kind);fxEmit('tang_'+kind,x,y,{},null,'front',{scale:large?1.45:1.15});if(TANG_SOUND[kind])actionAudio.bossCue(TANG_SOUND[kind],x);if(large)addCameraShake(4,.15);}
function damage(amount,fromX,mode){
 const result=receivePlayerDamage(amount,{fromX,notice:false});
 if(result.hpLost>0&&player.hp>0){if(mode)applyStrongPlayerHit({sourceX:fromX,mode});else if(amount>20)applyUnblockedPlayerHit('hurt');}
 if(result.hpLost>0||result.blocked>0)actionAudio.characterHit(amount>=100,player.x);
 return result;
}
export function forceTangMa(index){if(!ai)return false;const ok=castTangMa(ai,index,dummy,player,emit);if(ok)showNotice('TÁNG MA · '+['HOANG DIỆM','CUỒNG BẠO','PHỆ THẦN','LIÊN KÍCH'][index]);else showNotice('CHIÊU ĐANG HỒI HOẶC BOSS ĐANG RA ĐÒN');return ok;}
export function updateTangMaBoss(dt){if(!ai||!game.running||game.battlePhase!=='fight')return;updateTangMa(ai,dt,{boss:dummy,hero:player,ground:x=>game.terrain.firstSolidY(x)-.5,hit:damage,stun:applyPlayerStun,emit,notice:showNotice});}
export function drawTangMa(){
 if(!ai||!dummy.visible||!game.ctx)return;
 const ctx=game.ctx, x=dummy.x-camera.x+game.viewW/2,y=dummy.y-camera.y+game.viewH/2;
 const action=dummy.broken?'death':game.battlePhase==='arrival'?'fall':game.battlePhase==='focus'?'land':dummy.stun>0||dummy.trapped?'stun':dummy.recoil>0?'hurt':ai.action==='idle'?(dummy.flying?'hover':Math.abs(player.x-dummy.x)>350?'walk':'idle'):ai.action;
 let p=tangMaPose(action,action==='death'?Math.max(0,3-dummy.respawn):ai.action==='idle'?ai.age:ai.t,{berserk:ai.rage>0});
 const im=game.images['tang_ma_'+p.sheet];if(!im)return;
 const scale=ai.rage>0?(ai.action==='skill2'?1+clamp((ai.t-.5)/1.2,0,1):2):1,face=dummy.facing||1;
 let sx=p.index*312,sw=312,dx=-156*scale;
 if(p.sheet==='base'&&p.row===3&&p.index===3){sx-=18;sw+=18;dx-=18*scale;}
 if(p.sheet==='skills'&&p.row===0&&p.index===2)sw+=18;
 ctx.save();ctx.translate(x,y);if(face<0)ctx.scale(-1,1);ctx.globalAlpha=dummy.broken?p.bossOpacity:p.bossOpacity;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,sx,p.row*316,sw,316,dx,-316*scale,sw*scale,316*scale);ctx.restore();
}
