// Heavy hits use world-unit velocities; collision and shields remain the source of truth.
export const STRONG_IMPACT_SPEC=Object.freeze({launch:{horizontal:1320,vertical:-310,radius:125},slam:{horizontal:520,vertical:980,radius:165},airDrag:.58,maxFall:1120,craterDepthOffset:48});
export function makeStrongImpulse({mode='launch',sourceX=0,targetX=0,facing=1}={}){
 const kind=mode==='slam'?'slam':'launch',spec=STRONG_IMPACT_SPEC[kind];
 const direction=Math.abs(targetX-sourceX)<1?-(facing||1):Math.sign(targetX-sourceX);
 return {mode:kind,vx:direction*spec.horizontal,vy:spec.vertical,radius:spec.radius,craterDone:false,elapsed:0};
}
export function advanceStrongImpulse(impact,actor,dt,gravity){
 if(!impact)return false;impact.elapsed+=dt;actor.vx*=Math.exp(-STRONG_IMPACT_SPEC.airDrag*dt);
 actor.vy=Math.min(STRONG_IMPACT_SPEC.maxFall,actor.vy+gravity*dt);return true;
}
export function cutImpactCrater(terrain,x,y,impact){
 if(!terrain||!impact||impact.craterDone||typeof terrain.cut!=='function')return 0;
 impact.craterDone=true;
 return terrain.cut(x,y+STRONG_IMPACT_SPEC.craterDepthOffset,impact.radius)||0;
}
