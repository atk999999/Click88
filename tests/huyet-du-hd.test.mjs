import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const cls={add(){},remove(){},toggle(){}};
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem(){}};
globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute(){}}),querySelector:()=>null,querySelectorAll:()=>[],createElement(){return {width:1,height:1,getContext:()=>({save(){},restore(){},clearRect(){},drawImage(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})})}}};
await import('../src/game/pixelfx.js');
const {CLIPS,game}=await import('../src/game/state.js');const {drawAtlasFrame}=await import('../src/game/character.js');
for(const [id,n] of CLIPS){const path=new URL(`../public/assets/sprites/huyet_du_${id}.webp`,import.meta.url);const bytes=readFileSync(path);assert.equal(bytes.toString('ascii',0,4),'RIFF');const mode=bytes.toString('ascii',12,16);assert(['VP8 ','VP8L','VP8X'].includes(mode));game.images['huyet_du_'+id]={naturalWidth:n*256,naturalHeight:256};}
let drawn;game.ctx={drawImage(...args){drawn=args;}};assert(drawAtlasFrame('idle',2,.52,238,'huyet_du'));assert.equal(drawn[3],256);assert.equal(drawn[4],256);assert.equal(drawn[7],256*.52);
const {huyetBossAction}=await import('../src/game/boss-ai.js');
const a={bao:{phase:'idle'},thu:{phase:'ready'},kim:{phase:'ready'},thon:{phase:'ready'}};
a.thu={phase:'cast',castTime:.1};assert.equal(huyetBossAction(a)[0],'hand_seal');a.thu.castTime=.6;assert.equal(huyetBossAction(a)[0],'cast_fire');
a.thu.phase='ready';a.kim={phase:'charge',chargeTime:.1};assert.equal(huyetBossAction(a)[0],'charge_raise');a.kim.chargeTime=.7;assert.equal(huyetBossAction(a)[0],'charge_hold');a.kim={phase:'release',elapsed:.2};assert.equal(huyetBossAction(a)[0],'cast_fire');
a.kim.phase='ready';a.thon={phase:'cast',t:.1};assert.equal(huyetBossAction(a)[0],'charge_raise');a.thon.phase='drain';assert.equal(huyetBossAction(a)[0],'charge_hold');
a.bao={phase:'seal'};assert.equal(huyetBossAction(a)[0],'hand_seal');a.bao.phase='gather';assert.equal(huyetBossAction(a)[0],'charge_raise');a.bao.phase='pinch';assert.equal(huyetBossAction(a)[0],'charge_hold');a.bao={phase:'blast',clock:.1};assert.equal(huyetBossAction(a)[0],'cast_fire');
const {HUYET_DU_FX}=await import('../src/game/huyet-du-fx.js');const P=globalThis.PK_PIXELFX;for(const [name,mod] of Object.entries(HUYET_DU_FX)){const frame=P.createFrame(384,384),fx=P.createFx(mod,{x:192,y:192});fx.update(.1);fx.draw(frame);assert(frame.color.some(Boolean)||frame.light.some(Boolean),name);}
console.log('PASS: 17 Huyết Dự 256px atlases, rendering, four skill animations and 7 PixelFX accents');
const {player,dummy}=await import('../src/game/state.js');const {resetBossAI,updateBossAI,getBossAI}=await import('../src/game/boss-ai.js');
const {castHuyetThu}=await import('../src/game/huyet-thu.js');const {beginHuyetKimTuyen,releaseHuyetKimTuyen}=await import('../src/game/huyet-kim-tuyen.js');const {castThonLinhHuyet}=await import('../src/game/thon-linh-huyet.js');
game.running=true;game.battlePhase='fight';game.terrain={firstSolidY:()=>500,solid:()=>false};
function combat(){Object.assign(player,{x:350,y:500,hp:1200,maxHp:1200,mana:250,maxMana:250,shieldActive:false,realmTier:2,broken:false});Object.assign(dummy,{x:650,y:400,hp:3000,maxHp:3000,mana:300,maxMana:300,shieldActive:false,visible:true,broken:false,recoil:0,stun:0,trapped:false,skin:'huyet_du',facing:-1,hitSequence:0,demoTimer:0,combatStyle:'magic'});resetBossAI();let ai=getBossAI();ai.wait=999;return ai;}
let ai=combat();castHuyetThu(ai.thu,dummy,player);updateBossAI(.05);assert.equal(dummy.bossAction,'hand_seal');for(let i=0;i<10;i++)updateBossAI(.05);assert.equal(dummy.bossAction,'cast_fire');
ai=combat();beginHuyetKimTuyen(ai.kim,dummy,player);updateBossAI(.05);assert.equal(dummy.bossAction,'charge_raise');for(let i=0;i<10;i++)updateBossAI(.05);assert.equal(dummy.bossAction,'charge_hold');releaseHuyetKimTuyen(ai.kim);updateBossAI(.05);assert.equal(dummy.bossAction,'cast_fire');
ai=combat();castThonLinhHuyet(ai.thon,dummy,player);updateBossAI(.05);assert.equal(dummy.bossAction,'charge_raise');for(let i=0;i<15;i++)updateBossAI(.05);assert.equal(dummy.bossAction,'charge_hold');
ai=combat();dummy.hp=dummy.maxHp*.105;ai.wait=0;updateBossAI(.01);assert.equal(ai.bao.usedOnce,false);ai=combat();dummy.hp=dummy.maxHp*.1;ai.wait=0;updateBossAI(.01);assert.equal(ai.bao.usedOnce,true);console.log('PASS boss actual casting transitions and Huyết Bạo 10% threshold');
