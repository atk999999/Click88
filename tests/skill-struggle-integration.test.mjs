import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})})})};
await import('../src/game/pixelfx.js');
const {player,dummy,game,settings}=await import('../src/game/state.js');const {resetSkills,getFireballs,updateFireballs}=await import('../src/game/skills.js');const {createHuyetThuState,stepHuyetThu}=await import('../src/game/huyet-thu.js');const {beginSkillCollisionFrame,endSkillCollisionFrame,getSkillStruggle,updateSkillStruggle,cancelSkillStruggle}=await import('../src/game/va-cham-ky-nang.js');
resetSkills();game.running=true;game.battlePhase='fight';game.terrain=null;settings.fxQuality='off';Object.assign(player,{x:100,y:500,hp:1000,mana:90,visible:true});Object.assign(dummy,{x:800,y:500,hp:1000,maxHp:1000,mana:180,visible:true,broken:false});
const fire={x:400,y:400,vx:300,vy:0,speed:300,life:5,radius:15,chargeTime:1,targetId:null};getFireballs().push(fire);
const state=createHuyetThuState();state.damageTarget=()=>1;state.phase='hand';state.hand={x:500,y:400,vx:-300,vy:0,life:0,targetX:100,targetY:400,rot:0};const hand=state.hand;
beginSkillCollisionFrame(()=>{}, {player,boss:dummy});updateFireballs(.15);stepHuyetThu(state,.15,dummy,player);endSkillCollisionFrame();assert.ok(getSkillStruggle(),'real spells collide and enter struggle');const x=fire.x,hx=hand.x;
for(let i=0;i<120;i++){beginSkillCollisionFrame(()=>{}, {player,boss:dummy});updateFireballs(1/60);stepHuyetThu(state,1/60,dummy,player);endSkillCollisionFrame();updateSkillStruggle(1/60,player,dummy);}
assert.equal(fire.x,x);assert.equal(hand.x,hx);assert.ok(getSkillStruggle());cancelSkillStruggle('player');assert.equal(getFireballs().length,0);assert.equal(state.hand,hand);stepHuyetThu(state,.1,dummy,player);assert.ok(hand.x<hx,'enemy hand continues after cancellation');
console.log('PASS actual Hỏa Cầu and Huyết Thủ freeze, drain and resume');
resetSkills();game.terrain={firstSolidY:()=>500,solid:()=>false};Object.assign(player,{x:100,y:500,hp:1000,mana:100});Object.assign(dummy,{x:800,y:500,hp:1000,maxHp:1000,mana:180,visible:true,broken:false,recoil:0,stun:0,trapped:false});
const {resetLangTieuAI,castLangTieu,updateLangTieuAI,getLangTieuAI}=await import('../src/game/lang-tieu-ai.js');resetLangTieuAI();assert.equal(castLangTieu(1),true);
for(let i=0;i<103;i++){beginSkillCollisionFrame(()=>{});updateLangTieuAI(1/60);endSkillCollisionFrame();}
const beam=getLangTieuAI().shots[0];assert.ok(beam?.live);const f2={x:beam.x-75,y:beam.y,vx:300,vy:0,speed:300,life:5,radius:15,chargeTime:1,targetId:null};getFireballs().push(f2);
for(let i=0;i<20&&!getSkillStruggle();i++){beginSkillCollisionFrame(()=>{}, {player,boss:dummy});updateFireballs(1/60);updateLangTieuAI(1/60);endSkillCollisionFrame();}
assert.ok(getSkillStruggle(),'Hỏa Cầu clashes with Lăng Tiêu beam');const oldX=beam.x;updateLangTieuAI(.5);assert.equal(beam.x,oldX);cancelSkillStruggle('player');updateLangTieuAI(.05);assert.ok(beam.x<oldX);console.log('PASS Hỏa Cầu and Lăng Tiêu beam hold and resume');
