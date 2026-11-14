import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(){},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginRound,finishBattle,selectBloodReward,selectBreakthroughBuff,selectMonsterReward,chooseFusion,advanceTribulation,updateMonsterWave,processDefeatedMonsters}=await import('../src/game/engine.js');
const {game,player,settings,bossState,getCombatTargets,withCombatTarget}=await import('../src/game/state.js');const {dummyDamage}=await import('../src/game/character.js');
game.ready=true;settings.fxQuality='off';beginRound(1);game.running=true;finishBattle(true);assert.equal(selectBloodReward('hand'),true);assert.equal(chooseFusion('keep'),true);
player.hp=100000;player.maxHp=100000;advanceTribulation(30);assert.equal(game.battlePhase,'tribulation');advanceTribulation(2.1);assert.equal(game.battlePhase,'fusion','major breakthrough fusion board');assert.equal(chooseFusion('fusion_blood_fire'),true);assert.equal(el('skill1Title').textContent,'HUYẾT HỎA CẦU');assert.equal(el('lootSlot6Title').textContent,'Ô TRỐNG');assert.equal(game.battlePhase,'fight');assert.equal(player.realm,'KIM ĐAN · SƠ KỲ');
const sizes=[3,3,4,4,4,4,4,4];let total=0,air=0,ground=0;
for(const [index,size] of sizes.entries()){
 const targets=[...getCombatTargets()];assert.equal(targets.length,size);assert.ok(targets.every(t=>t.skin==='hac_hoa_xa'&&t.hp===680));
 for(const t of targets){if(t.flying)air++;else ground++;assert.ok(Math.abs(t.x-player.x)>=719);withCombatTarget(t,()=>dummyDamage(99999,{notice:false}));}
 if(index===sizes.length-1)assert.equal(game.battlePhase,'fight','boss has not appeared before deaths complete');
 updateMonsterWave(1);updateMonsterWave(1.3);updateMonsterWave(1.2);processDefeatedMonsters();
 while(game.battlePhase==='buff'||getCombatTargets().some(t=>t.broken)){
  if(game.battlePhase==='buff'){assert.equal(selectBreakthroughBuff('recovery'),true);assert.equal(selectMonsterReward('wolf_wind'),false);assert.equal(selectMonsterReward('skip'),true);assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('keep'),true);}
  else processDefeatedMonsters();
 }total+=size;
 if(index<sizes.length-1)assert.equal(game.battlePhase,'fight');
}
assert.equal(total,30);assert.ok(air>0&&ground>0);assert.equal(game.battlePhase,'waiting');assert.equal(bossState.name,'LĂNG TIÊU');assert.equal(player.realm,'KIM ĐAN · HẬU KỲ');console.log('PASS six heavenly strikes → Kim Đan → 30 snakes in eight waves → Lăng Tiêu');
