import assert from 'node:assert/strict';
const cls={add(){},remove(){},toggle(){}};
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem(){}};
const ctx={save(){},restore(){},clearRect(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})};
globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute(){}}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');
const {game,player,dummy}=await import('../src/game/state.js');
const {codeNpcPose}=await import('../src/game/character.js');
const {resetLangTieuAI,updateLangTieuAI,getLangTieuAI,castLangTieu}=await import('../src/game/lang-tieu-ai.js');
game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500};
function reset(){Object.assign(player,{x:400,y:100,hp:1200,facing:1});Object.assign(dummy,{x:600,y:499.5,vx:0,vy:0,skin:'ling_tieu',visible:true,broken:false,stun:0,recoil:0,trapped:false,demoTimer:0,demoElapsed:0,bossAction:'',bossWalk:false,flying:false,bossClipDuration:0,hitSequence:0});resetLangTieuAI();getLangTieuAI().wait=99;}
reset();dummy.skin='huyet_du';dummy.flying=true;dummy.vy=-120;const frames=[];for(const t of [10,10.1,10.2,10.3]){game.elapsed=t;const p=codeNpcPose();assert.equal(p.name,'fly_up');frames.push(p.f)}assert.ok(new Set(frames).size>1,'sustained ascent should animate after time has passed');
dummy.vy=120;assert.equal(codeNpcPose().name,'fall');dummy.vy=0;assert.equal(codeNpcPose().name,'hover');console.log('PASS Huyết Dự continuously animates ascent, descends and hovers');
for(const dt of [1/30,1/60,1/120]){reset();let initial=dummy.y;updateLangTieuAI(dt);assert.ok(dummy.y<initial);assert.ok(dummy.vy<-35);assert.equal(codeNpcPose().name,'fly_up');player.y=480;dummy.y=180;updateLangTieuAI(dt);assert.ok(dummy.vy>35);assert.equal(codeNpcPose().name,'fall');assert.equal(dummy.flying,true);player.y=dummy.y;updateLangTieuAI(dt);assert.equal(dummy.vy,0);assert.equal(codeNpcPose().name,'hover');}
console.log('PASS Lăng Tiêu ascent, descent and hover follow actual movement at 30/60/120 FPS');
reset();dummy.flying=true;dummy.y=180;dummy.vy=-140;dummy.stun=.5;updateLangTieuAI(1/60);assert.equal(dummy.vy,0);assert.equal(codeNpcPose().name,'hurt');console.log('PASS hit interruption stops the previous flight animation');
reset();dummy.flying=true;dummy.vy=-100;assert.equal(castLangTieu(1),true);for(let i=0;i<90;i++)updateLangTieuAI(1/60);assert.equal(codeNpcPose().name,'sword_cast');console.log('PASS sword casting animation retains priority during flight');
