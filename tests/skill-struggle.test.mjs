import assert from 'node:assert/strict';
import {beginSkillCollisionFrame as begin,endSkillCollisionFrame as end,trackSkillSegment as track,queueSkillImpact as impact,getSkillStruggle as active,updateSkillStruggle as step,cancelSkillStruggle as cancel,resetSkillCollisions as reset} from '../src/game/va-cham-ky-nang.js';
function start(pm=90,bm=180){
 reset();const p={mana:pm,hp:100},b={mana:bm,hp:100,maxHp:100,visible:true,broken:false}; const refs=[{},{}], destroyed=[],positions=[],hits=[];
 begin(()=>{throw Error('normal collision should not fire')},{player:p,boss:b});
 for(const [i,side] of ['player','boss'].entries()) track({ref:refs[i],side,kind:i?'blood_hand':'fireball',power:100,x0:i?100:0,x1:i?0:100,y0:0,y1:0,radius:2,canStruggle:()=>true,onStruggle:(x,y)=>positions.push([x,y]),onDestroy:()=>destroyed.push(side)});
 impact(refs[0],1,()=>hits.push('player'));impact(refs[1],1,()=>hits.push('boss'));end();assert.ok(active());assert.equal(positions.length,2);assert.deepEqual(hits,[]);return {p,b,refs,destroyed,hits};
}
for(const fps of [30,60,120]){
 const q=start(); for(let i=0;i<fps*3;i++)step(1/fps,q.p,q.b);assert.ok(active());assert.ok(Math.abs(q.p.mana-36)<1e-6);assert.ok(Math.abs(q.b.mana-126)<1e-6);
 for(let i=0;i<fps*3&&active();i++)step(1/fps,q.p,q.b);assert.equal(active(),null);assert.equal(q.p.mana,0);assert.ok(Math.abs(q.b.mana-90)<1e-6);assert.deepEqual(q.destroyed,['player']);assert.equal(q.refs[1].skillClashHeld,false);
}
console.log('PASS mana exhaustion resolves deterministically at 30/60/120 FPS');
{const q=start(120,80);assert.equal(cancel('player'),'player');assert.deepEqual(q.destroyed,['player']);assert.equal(q.refs[1].skillClashHeld,false);assert.equal(cancel('player'),null);}
console.log('PASS player cancellation releases the enemy projectile');
{const q=start(50,50);step(5,q.p,q.b);assert.deepEqual(q.destroyed,['player','boss']);assert.equal(q.p.mana,0);assert.equal(q.b.mana,0);}
console.log('PASS equal exhaustion removes both');
{const q=start();q.b.hp=0;step(.1,q.p,q.b);assert.deepEqual(q.destroyed,['player','boss']);assert.equal(active(),null);}
console.log('PASS defeated caster ends the struggle');
{const q=start();reset();assert.deepEqual(q.destroyed,['player','boss']);assert.equal(active(),null);}
console.log('PASS reset clears both held projectiles');
