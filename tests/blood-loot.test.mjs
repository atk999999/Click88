import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(){},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginRound,finishBattle,selectBloodReward,chooseFusion,useBloodSlot,releaseBloodSlot}=await import('../src/game/engine.js');
const {game,player,dummy,settings}=await import('../src/game/state.js');
const {updateFireballs,getHuyetThu,getHuyetKimTuyen,getThonLinhHuyet,getHuyetBao}=await import('../src/game/skills.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame}=await import('../src/game/va-cham-ky-nang.js');
const id=process.argv[2]||'hand';settings.fxQuality='off';game.ready=true;beginRound(1);game.running=true;finishBattle(true);assert.equal(game.battlePhase,'loot');assert.equal(selectBloodReward(id),true);if(game.battlePhase==='fusion')assert.equal(chooseFusion('keep'),true);assert.equal(game.battlePhase,'tribulation');
Object.assign(dummy,{visible:true,broken:false,x:player.x+240,y:player.y,hp:3000,maxHp:3000,mana:300,maxMana:300,shieldActive:false});game.battlePhase='fight';
if(id==='blast')player.hp=player.maxHp*.09;
assert.equal(useBloodSlot(0,'Digit6'),true,'selected skill activates in slot 6');assert.equal(useBloodSlot(1,'Digit7'),false,'empty slot cannot cast');
function step(sec){for(let i=0;i<Math.round(sec*60);i++){beginSkillCollisionFrame(()=>{});updateFireballs(1/60);endSkillCollisionFrame();}}
if(id==='thread'){step(1);assert.equal(getHuyetKimTuyen().phase,'charge');assert.equal(releaseBloodSlot(0,'Digit6'),true);step(3);assert.ok(dummy.hp<3000,'thread damages target');}
if(id==='hand'){step(4);assert.ok(dummy.hp<3000,'blood hand damages target');}
if(id==='drain'){player.hp-=250;player.mana-=100;const hp=player.hp;step(2);assert.ok(dummy.hp<3000,'siphon damages target');assert.ok(player.hp>hp,'siphon heals');}
if(id==='blast'){step(6);assert.equal(getHuyetBao().usedOnce,true);assert.ok(dummy.hp<3000,'blood blast damages target');assert.ok(player.hp<=player.maxHp*.011,'blood blast keeps 1 percent HP');}
console.log('PASS loot skill '+id+' casts and works in acquired slot');
