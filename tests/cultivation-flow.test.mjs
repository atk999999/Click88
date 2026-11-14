import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(k,v){this[k]=v},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginPhongLangEncounter,updateMonsterWave,processDefeatedMonsters,selectBreakthroughBuff,selectMonsterReward,finishBattle,selectBloodReward,chooseFusion}=await import('../src/game/engine.js');
const {game,player,dummy,bossState,getCombatTargets,withCombatTarget}=await import('../src/game/state.js');
const {dummyDamage}=await import('../src/game/character.js');
const {explodeFireball,acquireSkillTarget,targetPosition}=await import('../src/game/skills.js');
game.ready=true;beginPhongLangEncounter();game.running=true;assert.equal(player.realm,'TRÚC CƠ · SƠ KỲ');
let total=0;const waveSizes=[3,3,3,3,4,4];
for(const size of waveSizes){
 const targets=[...getCombatTargets()];assert.equal(targets.length,size,`wave size ${size}`);
 for(const t of targets){assert.ok(Math.abs(t.x-player.x)>=(t.skin==='loi_ung'?999:719),'spawn far from player');}
 if(size>1){assert.ok(new Set(targets).size===size,'separate health per entity');const first=targets[0],second=targets[1],hp=second.hp;withCombatTarget(first,()=>dummyDamage(30,{notice:false}));assert.ok(first.hp<first.maxHp);assert.equal(second.hp,hp,'damage does not change other HP');assert.ok(acquireSkillTarget());assert.ok(targetPosition(first._targetId));}
 if(total===9){
  withCombatTarget(targets[0],()=>dummyDamage(9999,{notice:false}));
  updateMonsterWave(1);updateMonsterWave(1.3);updateMonsterWave(1.2);processDefeatedMonsters();
  assert.equal(game.battlePhase,'buff','10th kill pauses during the active wave');assert.equal(getCombatTargets().length,2);
  assert.equal(selectBreakthroughBuff('drain'),true);assert.equal(game.battlePhase,'monster_reward');assert.equal(selectMonsterReward('eagle_orb'),true);assert.equal(chooseFusion('keep'),true);assert.equal(el('lootSlot6Title').textContent,'LÔI CẦU');assert.equal(el('lootSlot6Icon').href,'#sk-eagleorb');assert.equal(game.battlePhase,'fusion','breakthrough fusion board');assert.equal(chooseFusion('keep'),true);assert.equal(game.battlePhase,'fight');assert.equal(getCombatTargets().length,2,'living monsters resume after choice');
 }
 for(const t of targets.filter(t=>!t.broken))withCombatTarget(t,()=>dummyDamage(9999,{notice:false}));
 updateMonsterWave(1);updateMonsterWave(1.3);updateMonsterWave(1.2);
 // Multiple finished monsters must be awarded once, even when a choice pauses midway.
 while(getCombatTargets().some(t=>t.broken)){
  processDefeatedMonsters();
  if(game.battlePhase==='buff'){assert.equal(selectBreakthroughBuff('vitality'),true);assert.equal(selectMonsterReward('eagle_orb'),false,'duplicate skill not selectable');assert.equal(selectMonsterReward('snake_fang'),false,'unrelated monster cannot be selected');assert.equal(selectMonsterReward('eagle_dive'),true);assert.equal(chooseFusion('keep'),true);assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('keep'),true);}
  if(game.battlePhase==='waiting')break;
 }
 total+=size;
}
assert.equal(game.battlePhase,'waiting');assert.equal(bossState.name,'HUYẾT DỰ');assert.equal(player.realm,'TRÚC CƠ · HẬU KỲ');assert.equal(player.maxHp,1450);assert.equal(player.lifeSteal,.06);
assert.equal(el('lootSlot7Title').textContent,'LAO XUYÊN');assert.equal(el('lootSlot7Icon').href,'#sk-eagledive');finishBattle(true);assert.equal(selectBloodReward('hand'),true);assert.equal(chooseFusion('keep'),true);assert.equal(el('lootSlot8Title').textContent,'HUYẾT THỦ');assert.equal(el('lootSlot8Icon').href,'#sk-hand');console.log('PASS 20 monsters, buffs plus monster skills, reserved boss skill slot and tribulation');
