// Six heavenly strikes track the player throughout the warning and always connect.
// Time advances only while the game is running; shields use the normal damage system.
export const THIEN_KIEP_SPEC=Object.freeze({total:6,gather:2,warning:1.35,impact:.55,gap:.72,hitRadius:75,damage:[190,220,250,280,310,360]});
export function createThienKiep(){return {phase:'gather',clock:0,count:0,targetX:0,groundY:0,flash:0};}
export function stepThienKiep(s,dt,locate,onStrike,onWarning=()=>{}){
 let left=Math.max(0,dt);
 while(left>1e-9 && s.phase!=='done' && s.phase!=='failed'){
  const duration=s.phase==='gather'?THIEN_KIEP_SPEC.gather:s.phase==='warning'?THIEN_KIEP_SPEC.warning:s.phase==='impact'?THIEN_KIEP_SPEC.impact:THIEN_KIEP_SPEC.gap;
  const part=Math.min(left,Math.max(0,duration-s.clock));s.clock+=part;left-=part;s.flash=Math.max(0,s.flash-part*2.5);
  // The warning indicator follows motion, including height; sample once more at impact.
  if(s.phase==='warning'){const point=locate();s.targetX=point.x;s.groundY=point.groundY;}
  if(s.clock<duration-1e-9)break;
  s.clock=0;
  if(s.phase==='gather'||s.phase==='gap'){const point=locate();s.targetX=point.x;s.groundY=point.groundY;s.phase='warning';onWarning({index:s.count+1,x:s.targetX,groundY:s.groundY});}
  else if(s.phase==='warning'){s.count++;s.phase='impact';s.flash=1;if(onStrike({index:s.count,x:s.targetX,groundY:s.groundY,damage:THIEN_KIEP_SPEC.damage[s.count-1]})===false){s.phase='failed';break;}}
  else if(s.phase==='impact')s.phase=s.count>=THIEN_KIEP_SPEC.total?'done':'gap';
  else break;
 }
 return s.phase;
}
