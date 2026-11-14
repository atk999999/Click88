import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(){},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginRound,finishBattle,selectBloodReward,chooseFusion,advanceTribulation}=await import('../src/game/engine.js');
const {game,player,settings}=await import('../src/game/state.js');const {toggleThoThuan}=await import('../src/game/skills.js');
game.ready=true;settings.fxQuality='off';beginRound(1);game.running=true;finishBattle(true);assert.equal(selectBloodReward('hand'),true);assert.equal(chooseFusion('keep'),true);
const originalHp=player.hp,originalMana=player.mana;assert.equal(toggleThoThuan(),true);advanceTribulation(3.4);assert.equal(player.hp,originalHp,'shield blocks tribulation damage');assert.ok(player.mana<originalMana,'shield consumes mana');
assert.equal(toggleThoThuan(),false);player.hp=10;advanceTribulation(3);assert.equal(game.battlePhase,'defeat');assert.equal(game.running,false);assert.match(el('resultText').textContent,/Thiên Kiếp/);
console.log('PASS shield blocks lightning and lethal strike ends the run');

// The warning tracks both horizontal movement and altitude; flight cannot avoid it.
function startAgain(){game.ready=true;beginRound(1);game.running=true;finishBattle(true);assert.equal(selectBloodReward('hand'),true);assert.equal(chooseFusion('keep'),true);}
startAgain();const initialHp=player.hp;advanceTribulation(2);player.x+=950;player.y-=600;player.flying=true;advanceTribulation(1.35);assert.equal(player.hp,initialHp-Math.max(1,Math.round(190*(1-(player.defenseReduction||0)))),'moving far and flying cannot dodge');
// All six strikes can be blocked, with the ordinary shield mana cost.
startAgain();player.mana=player.maxMana=1000;const hp=player.hp;assert.equal(toggleThoThuan(),true);advanceTribulation(24);assert.equal(player.hp,hp,'shield blocks all six');assert.ok(player.mana<1000,'shield consumes mana');assert.equal(game.battlePhase,'tribulation');advanceTribulation(2.1);assert.equal(player.realm,'KIM ĐAN · SƠ KỲ');
// Normal starting mana is enough to survive by maintaining Thổ Thuẫn; a breaking hit is still blocked.
startAgain();player.maxHp=player.hp=1200;player.maxMana=player.mana=250;player.defenseReduction=.08;assert.equal(toggleThoThuan(),true);advanceTribulation(24);assert.ok(player.hp>0,'normal shield can survive six hits');assert.equal(game.battlePhase,'tribulation');
// Without any protection the escalating lightning defeats the player.
startAgain();player.maxHp=player.hp=1200;player.defenseReduction=.08;advanceTribulation(24);assert.equal(game.battlePhase,'defeat');assert.equal(player.hp,0);
console.log('PASS tracking on foot/in flight, six shield blocks, breakthrough and unprotected defeat');
