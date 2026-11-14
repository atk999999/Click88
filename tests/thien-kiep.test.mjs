import assert from 'node:assert/strict';
import {createThienKiep,stepThienKiep,THIEN_KIEP_SPEC} from '../src/game/thien-kiep.js';
for(const dt of [1/30,1/60,1/120]){
 const state=createThienKiep(),hits=[];let pos=100;
 while(state.phase!=='done'){const before=state.phase;stepThienKiep(state,dt,()=>({x:pos,groundY:500}),hit=>{hits.push(hit);return true;});if(before==='gather'&&state.phase==='warning')pos=300;assert.ok(hits.length<=6);}
 assert.equal(hits.length,6);assert.equal(hits[0].x,300,'warning follows the player to the strike');assert.deepEqual(hits.map(h=>h.index),[1,2,3,4,5,6]);assert.deepEqual(hits.map(h=>h.damage),THIEN_KIEP_SPEC.damage);assert.ok(THIEN_KIEP_SPEC.damage.reduce((a,b)=>a+b,0)>1200,'six unblocked bolts threaten a full-health player');assert.ok(THIEN_KIEP_SPEC.damage.every((v,i,a)=>i===0||v>a[i-1]),'strikes grow stronger');
 stepThienKiep(state,100,()=>({x:0,groundY:0}),()=>{throw Error('extra strike')});
}
const tracking=createThienKiep();let point={x:25,groundY:500};stepThienKiep(tracking,2,()=>point,()=>true);point={x:1200,groundY:-350};stepThienKiep(tracking,.7,()=>point,()=>true);assert.equal(tracking.targetX,1200);assert.equal(tracking.groundY,-350,'warning follows altitude');let first;point={x:1600,groundY:-700};stepThienKiep(tracking,.65,()=>point,hit=>{first=hit;return true});assert.equal(first.x,1600);assert.equal(first.groundY,-700,'strike lands at current altitude');
const failed=createThienKiep();let n=0;stepThienKiep(failed,100,()=>({x:0,groundY:500}),()=>{n++;return false;});assert.equal(failed.phase,'failed');assert.equal(n,1);stepThienKiep(failed,100,()=>({}),()=>n++);assert.equal(n,1);
console.log('PASS six timed strikes, target lock, rates and failure termination');
globalThis.window=globalThis;await import('../src/game/pixelfx.js');const {THIEN_KIEP_BOLT}=await import('../src/game/thien-kiep-fx.js');
for(const t of [.05,.2,.48]){const f=window.PK_PIXELFX.createFrame(128,512),fx=window.PK_PIXELFX.createFx(THIEN_KIEP_BOLT,{x:64,y:480});fx.update(t);fx.draw(f);assert.ok(f.color.some(x=>x!==0),'visible bolt pixels');}
console.log('PASS heavenly lightning renders at multiple stages');
