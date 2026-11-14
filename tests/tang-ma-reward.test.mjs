import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(k,v){this[k]=v},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginPhongLangEncounter,beginRound,finishBattle,selectTangReward,chooseTangReplace,backTangReplace,openMonsterReward,selectMonsterReward,selectBloodReward,selectSwordReward,chooseFusion,backFusion,useBloodSlot,usePrimaryFusion}=await import('../src/game/engine.js');
const {game,player,settings,getCombatTargets}=await import('../src/game/state.js');
const {resetMonsterSkills,castMonsterSkill,updateMonsterSkills,getMonsterSkillCooldown,TANG_MA_REWARDS}=await import('../src/game/ky-nang-quai.js');
const {diepTuGiantVisual,resetMotion,updateAction}=await import('../src/game/character.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame}=await import('../src/game/va-cham-ky-nang.js');
const monsterForSkill=id=>({wolf:'phong_lang',eagle:'loi_ung',snake:'hac_hoa_xa',bat:'u_minh_ma_buc'})[id.split('_')[0]];
const {toggleThoThuan,getThoThuan}=await import('../src/game/skills.js');

game.ready=true;settings.fxQuality='off';beginPhongLangEncounter();game.running=true;
for(const id of ['wolf_bite','wolf_wind','eagle_orb','eagle_dive']){openMonsterReward(monsterForSkill(id));assert.equal(selectMonsterReward(id),true);assert.equal(chooseFusion('keep'),true);}
beginRound(1);game.running=true;finishBattle(true);assert.equal(selectBloodReward('hand'),true);assert.equal(chooseFusion('keep'),true);
beginRound(4);game.running=true;finishBattle(true);assert.equal(game.battlePhase,'tang_reward');
assert.equal(selectTangReward('invalid'),false);assert.equal(selectTangReward('tang_rage'),true);assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('keep'),true);assert.equal(game.battlePhase,'tang_replace');
assert.equal(chooseTangReplace(-1),false);assert.equal(backTangReplace(),true);assert.equal(game.battlePhase,'tang_reward');assert.equal(selectTangReward('tang_rage'),true);assert.equal(chooseFusion('keep'),true);
assert.equal(chooseTangReplace(1),true);assert.equal(game.battlePhase,'victory');assert.equal(el('lootSlot7Title').textContent,'CUỒNG BẠO');
el('resultContinue').onclick();assert.equal(game.battlePhase,'fight');assert.equal(getCombatTargets()[0].skin,'u_minh_ma_buc');assert.equal(el('lootSlot7Title').textContent,'CUỒNG BẠO');
resetMonsterSkills();resetMotion();player.mana=250;assert.equal(castMonsterSkill('tang_rage'),true);assert.equal(player.mana,175);assert.equal(player.cuongBaoMultiplier,1.35);assert.equal(diepTuGiantVisual.active,true);assert.ok(getMonsterSkillCooldown('tang_rage')>0);
for(let i=0;i<721;i++)updateMonsterSkills(1/60);
assert.equal(player.cuongBaoMultiplier,1);assert.equal(diepTuGiantVisual.active,false);
console.log('PASS full slots, replacement, victory, continued practice, rage cost and expiration');
