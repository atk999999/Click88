import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(k,v){this[k]=v},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginPhongLangEncounter,beginRound,finishBattle,selectTangReward,openMonsterReward,selectMonsterReward,selectBloodReward,selectSwordReward,chooseFusion,backFusion,useBloodSlot,usePrimaryFusion}=await import('../src/game/engine.js');
const {game,player,settings}=await import('../src/game/state.js');
const monsterForSkill=id=>({wolf:'phong_lang',eagle:'loi_ung',snake:'hac_hoa_xa',bat:'u_minh_ma_buc'})[id.split('_')[0]];
const {toggleThoThuan,getThoThuan}=await import('../src/game/skills.js');

game.ready=true;settings.fxQuality='off';beginPhongLangEncounter();game.running=true;
openMonsterReward('phong_lang');assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(chooseFusion('keep'),true);
beginRound(4);game.running=true;finishBattle(true);assert.equal(game.battlePhase,'tang_reward');
assert.equal(selectTangReward('tang_dash'),true);assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('fusion_tang_dash_diem_phong'),true);
assert.equal(game.battlePhase,'victory');assert.equal(el('lootSlot6Title').textContent,'DIỆM PHONG LONG QUYỂN');assert.equal(el('lootSlot7Title').textContent,'Ô TRỐNG');
el('resultContinue').onclick();assert.equal(game.battlePhase,'fight');player.mana=250;assert.equal(useBloodSlot(0,'Digit6'),true,'fused reward can be cast in practice');
// Keep the boss reward first, then fuse two owned skills from the victory menu.
el('confirmCharacter').onclick();openMonsterReward('phong_lang');assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(chooseFusion('keep'),true);
beginRound(4);game.running=true;finishBattle(true);assert.equal(selectTangReward('tang_dash'),true);assert.equal(chooseFusion('keep'),true);assert.equal(el('lootSlot7Title').textContent,'HOANG DIỆM TRUY SÁT');
el('resultFusion').onclick();assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('fusion_tang_dash_diem_phong'),true);assert.equal(game.battlePhase,'victory');assert.equal(el('lootSlot6Title').textContent,'Ô TRỐNG');assert.equal(el('lootSlot7Title').textContent,'DIỆM PHONG LONG QUYỂN');
// Consuming a base skill replaces its primary slot and never equips the boss skill separately.
el('confirmCharacter').onclick();beginRound(4);game.running=true;finishBattle(true);assert.equal(selectTangReward('tang_rage'),true);assert.equal(chooseFusion('fusion_tang_rage_viem_ma'),true);assert.equal(game.battlePhase,'victory');assert.equal(el('skill1Title').textContent,'VIÊM MA CUỒNG THÂN');assert.equal(el('lootSlot6Title').textContent,'Ô TRỐNG');
console.log('PASS boss reward fusion, victory-menu fusion, both ingredients consumed, and practice casting');
