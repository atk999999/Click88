import assert from 'node:assert/strict';
const cls={add(){},remove(){},toggle(){}};
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem(){}};
const context={save(){},restore(){},clearRect(){},drawImage(){},putImageData(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})};
globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute(){}}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>context})};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,setCombatTargets,motion}=await import('../src/game/state.js');
const {LOI_BAO_SPEC}=await import('../src/game/loi-bao.js');
const {THUY_KIEM_SPEC,drawWaterSwordFx}=await import('../src/game/thuy-kiem.js');
const {NGU_HANH_SPEC,inNguHanhRange,computeVertices}=await import('../src/game/ngu-hanh.js');
const {drawFiveFormation}=await import('../src/game/ngu-hanh-moi-fx.js');
const {castThuyKiem,updateThuyKiem,getThuyKiem,resetSkills,updateNguHanh,getNguHanh}=await import('../src/game/skills.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment}=await import('../src/game/va-cham-ky-nang.js');
game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:()=>false};settings.fxQuality='off';settings.character='diep_tu';
function reset(){resetSkills();setCombatTargets(null);Object.assign(player,{x:100,y:500,hp:1200,maxHp:1200,mana:250,maxMana:250,facing:1,stun:0,visualScale:1,realmTier:2});Object.assign(dummy,{x:500,y:500,hp:3000,maxHp:3000,mana:300,maxMana:300,shieldActive:false,skin:'huyet_du',visible:true,broken:false,recoil:0,stun:0,slow:0,trapped:false,demoTimer:0,realmTier:2,hitSequence:0});motion.action=null;}
assert.equal(LOI_BAO_SPEC.stunSeconds,1.5);assert(THUY_KIEM_SPEC.castSeconds<1);assert(NGU_HANH_SPEC.radiusX*NGU_HANH_SPEC.scale>260);
for(const fps of [30,60,120]){
 reset();assert(castThuyKiem());assert.equal(player.mana,190);
 for(let i=0;i<fps*4;i++){beginSkillCollisionFrame(()=>{});updateThuyKiem(1/fps);endSkillCollisionFrame();}
 assert.equal(getThuyKiem().fired,3);assert.equal(getThuyKiem().hitCount,3);assert(dummy.hp<3000);assert.equal(dummy.slow,3);assert.equal(getThuyKiem().phase,'cooldown');assert(getThuyKiem().cd>23);
 reset();dummy.shieldActive=true;assert(castThuyKiem());for(let i=0;i<fps*4;i++){beginSkillCollisionFrame(()=>{});updateThuyKiem(1/fps);endSkillCollisionFrame();}assert.equal(dummy.hp,3000);assert.equal(dummy.slow,0);assert(dummy.mana<300);
}
reset();const formation=getNguHanh();Object.assign(formation,{phase:'prison',stageX:500,stageY:500,targetId:null,clock:0,lockSec:0,pulses:0,vertices:computeVertices(500,500),particles:[],ripples:[],sequence:[]});const nearby={...dummy,x:740,y:500,hp:3000,_targetId:'near'},far={...dummy,x:1000,y:500,hp:3000,_targetId:'far'};setCombatTargets([nearby,far]);updateNguHanh(.51);assert(nearby.trapped);assert(!far.trapped);assert(nearby.hp<3000);assert.equal(far.hp,3000);assert(inNguHanhRange(formation,{x:500,y:300}));assert(!inNguHanhRange(formation,{x:500,y:200}));
const P=window.PK_PIXELFX;for(const type of ['water','formation']){const frame=P.createFrame(400,220),p=P.painterFor(frame).place(200,175);if(type==='water')drawWaterSwordFx(p,.3);else drawFiveFormation(p,{phase:'prison',now:1,clock:1,sequence:[]},1);assert(frame.color.some(Boolean)||frame.light.some(Boolean),type);}
console.log('PASS lightning 1.5s; three water swords, 30/60/120 FPS and shields; expanded formation area and PixelFX');
reset();assert(castThuyKiem());const barrier={};for(let i=0;i<240;i++){beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:barrier,side:'boss',kind:'blood_hand',x0:300,y0:430,x1:300,y1:430,radius:60,power:9999});updateThuyKiem(1/60);endSkillCollisionFrame();}assert.equal(dummy.hp,3000);assert.equal(getThuyKiem().hitCount,0);assert.equal(getThuyKiem().phase,'cooldown');console.log('PASS water swords collide with hostile skills before reaching target');
