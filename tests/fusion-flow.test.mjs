import assert from 'node:assert/strict';
const all = new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(k,v){this[k]=v},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginPhongLangEncounter,openMonsterReward,selectMonsterReward,selectBloodReward,selectSwordReward,chooseFusion,backFusion,useBloodSlot,usePrimaryFusion}=await import('../src/game/engine.js');
const {game,player,settings}=await import('../src/game/state.js');
const monsterForSkill=id=>({wolf:'phong_lang',eagle:'loi_ung',snake:'hac_hoa_xa',bat:'u_minh_ma_buc'})[id.split('_')[0]];
const {toggleThoThuan,getThoThuan}=await import('../src/game/skills.js');
game.ready=true;settings.fxQuality='off';beginPhongLangEncounter();game.running=true;
openMonsterReward(monsterForSkill('wolf_wind'));assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(game.battlePhase,'fusion');assert.equal(backFusion(),true);assert.equal(game.battlePhase,'monster_reward');assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(chooseFusion('keep'),true);assert.equal(el('lootSlot6Title').textContent,'LỐC XOÁY');
// Incoming Độc Nha and equipped Lốc Xoáy become a single skill in the old slot.
openMonsterReward(monsterForSkill('snake_fang'));assert.equal(selectMonsterReward('snake_fang'),true);assert.equal(chooseFusion('fusion_venom_wind'),true);assert.equal(el('lootSlot6Title').textContent,'ĐỘC PHONG LỐC');assert.equal(el('lootSlot7Title').textContent,'Ô TRỐNG');assert.equal(useBloodSlot(1,'Digit7'),false,'no second ingredient was equipped');
// Consuming a primary skill replaces it directly; no acquired slot is occupied.
openMonsterReward(monsterForSkill('eagle_orb'));assert.equal(selectMonsterReward('eagle_orb'),true);assert.equal(chooseFusion('fusion_water_lightning'),true);assert.equal(el('thuyKiemTitle').textContent,'LÔI THỦY CẦU');assert.equal(el('lootSlot7Title').textContent,'Ô TRỐNG');player.mana=250;assert.equal(usePrimaryFusion(3),true,'primary slot casts fusion');assert.equal(player.mana,200);
// Thổ Thuẫn is warned about and deactivated, without spending remaining mana.
assert.equal(toggleThoThuan(),true);assert.equal(getThoThuan().active,true);const beforeMana=player.mana;openMonsterReward(monsterForSkill('wolf_bite'));assert.equal(selectMonsterReward('wolf_bite'),true);assert.match(el('fusionChoice0Description').textContent,/MẤT.*Thổ Thuẫn.*MẤT KHẢ NĂNG ĐỠ LÔI KIẾP/);assert.equal(chooseFusion('fusion_earth_fang'),true);assert.equal(getThoThuan().active,false);assert.equal(player.shieldActive,false);assert.equal(player.mana,beforeMana);assert.equal(el('skill3Title').textContent,'ĐỊA LIỆT NHA');
// A consumed base cannot be reused by a later recipe; its incoming reward can still be learned separately.
game.battlePhase='loot';assert.equal(selectBloodReward('drain'),true);assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('fusion_blood_earth'),false,'consumed earth cannot be reused');assert.equal(chooseFusion('keep'),true);assert.equal(game.battlePhase,'tribulation');assert.equal(el('lootSlot7Title').textContent,'THÔN LINH HUYẾT');assert.equal(chooseFusion('keep'),false,'cannot choose twice');
console.log('PASS both ingredients consumed, same-slot replacement, unusable base, shield warning and tribulation');

// A full inventory still permits a fusion because the result reuses the owned skill's slot.
el('confirmCharacter').onclick();
for(const skill of ['wolf_bite','eagle_dive','snake_lunge','bat_dive']){openMonsterReward(monsterForSkill(skill));assert.equal(selectMonsterReward(skill),true);assert.equal(chooseFusion('keep'),true);}
openMonsterReward(monsterForSkill('wolf_wind'));assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(el('fusionKeep').disabled,true,'one acquired slot stays reserved for boss');assert.equal(chooseFusion('keep'),false);assert.equal(chooseFusion('fusion_fire_wind'),true);assert.equal(el('skill1Title').textContent,'HỎA PHONG LỐC');assert.equal(el('lootSlot10Title').textContent,'Ô TRỐNG');
game.battlePhase='loot';assert.equal(selectBloodReward('hand'),true);assert.equal(game.battlePhase,'fusion');assert.equal(chooseFusion('fusion_blood_fire'),false,'consumed fire cannot be reused');assert.equal(chooseFusion('keep'),true);assert.equal(game.battlePhase,'tribulation');assert.equal(el('lootSlot10Title').textContent,'HUYẾT THỦ');
// Restart restores all starting techniques and their slots.
el('confirmCharacter').onclick();assert.equal(el('skill1Title').textContent,'HỎA CẦU');assert.equal(el('skill3Title').textContent,'THỔ THUẪN');assert.equal(el('lootSlot6Title').textContent,'Ô TRỐNG');assert.equal(usePrimaryFusion(0),false);
console.log('PASS full inventory fusion, reserved boss slot and full restoration on a new run');

// The fourth displayed recipe combines two monster skills and consumes both.
openMonsterReward(monsterForSkill('snake_fang'));assert.equal(selectMonsterReward('snake_fang'),true);assert.equal(chooseFusion('keep'),true);openMonsterReward(monsterForSkill('wolf_wind'));assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(el('fusionChoice3Name').textContent,'PHONG ĐỘC TOÀN PHONG');el('fusionChoice3').onclick();assert.equal(game.battlePhase,'fight','fourth visible button selects its recipe');assert.equal(el('lootSlot6Title').textContent,'PHONG ĐỘC TOÀN PHONG');assert.equal(el('lootSlot7Title').textContent,'Ô TRỐNG');
// Bidirectional monster x monster and monster x blood fusion work in any acquisition order.
el('confirmCharacter').onclick();
openMonsterReward(monsterForSkill('bat_orb'));assert.equal(selectMonsterReward('bat_orb'),true);assert.equal(chooseFusion('keep'),true);
openMonsterReward(monsterForSkill('wolf_wind'));assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(chooseFusion('fusion_mm_wind_bat_orb'),true);assert.equal(el('lootSlot6Title').textContent,'U MINH PHONG BÃO');
game.battlePhase='loot';assert.equal(selectBloodReward('blast'),true);assert.equal(chooseFusion('fusion_five_blood'),true);assert.equal(el('nguHanhTitle').textContent,'NGŨ HÀNH HUYẾT BẠO');
console.log('PASS fourth menu choice and bidirectional 120-recipe fusion flows');

// Sword boss rewards fuse with core skills, monster skills, blood skills, or equip separately.
el('confirmCharacter').onclick();
game.battlePhase='sword_reward';assert.equal(selectSwordReward('sword_union'),true);assert.equal(game.battlePhase,'fusion');
assert.equal(backFusion(),true);assert.equal(game.battlePhase,'sword_reward');
assert.equal(selectSwordReward('sword_union'),true);assert.equal(chooseFusion('fusion_sword_union_five'),true);
assert.equal(game.battlePhase,'fight');assert.equal(el('nguHanhTitle').textContent,'NGŨ HÀNH KIẾM ĐẾ QUYẾT');
player.mana=250;assert.equal(usePrimaryFusion(4),true);assert.equal(player.mana,165);

// Sword x Monster & Sword x Blood bidirectional fusion and standalone sword equip.
el('confirmCharacter').onclick();
openMonsterReward(monsterForSkill('wolf_bite'));assert.equal(selectMonsterReward('wolf_bite'),true);assert.equal(chooseFusion('keep'),true);
game.battlePhase='sword_reward';assert.equal(selectSwordReward('sword_heart'),true);assert.equal(chooseFusion('fusion_sword_heart_bite'),true);
assert.equal(el('lootSlot6Title').textContent,'CUỒNG LANG KIẾM TRẢM');
game.battlePhase='sword_reward';assert.equal(selectSwordReward('sword_beam'),true);assert.equal(chooseFusion('keep'),true);
assert.equal(el('lootSlot7Title').textContent,'THẬP LA TRẢM THIÊN');
player.mana=250;assert.equal(useBloodSlot(1,'Digit7'),true);assert.equal(player.mana,175);
game.battlePhase='sword_reward';assert.equal(selectSwordReward('skip'),true);assert.equal(game.battlePhase,'fight');
console.log('PASS sword reward selection, back navigation, core/monster fusion, and standalone equip');
