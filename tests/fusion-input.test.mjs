import assert from 'node:assert/strict';
const all = new Map(), handlers=new Map();
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){if(!all.has(id))all.set(id,{id,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(k,v){this[k]=v},addEventListener(type,fn){handlers.set(id+':'+type,fn)},querySelector:()=>el('thumb'),getContext:()=>context,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});return all.get(id)}
globalThis.window=globalThis;globalThis.addEventListener=(type,fn)=>handlers.set('window:'+type,fn);globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;globalThis.document={body:el("body"),documentElement:el("html"),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:(selector)=>selector==='[data-charge]'?[el('skillBtn1'),el('skillBtn2')]:selector==='[data-skill-toggle]'?[el('thoThuanBtn'),el('nguHanhBtn')]:selector==='[data-skill-cast]'?[el('thuyKiemBtn')]:[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
el('skillBtn1').dataset.charge='fire';el('skillBtn2').dataset.charge='lightning';el('thoThuanBtn').dataset.skillToggle='earth';el('nguHanhBtn').dataset.skillToggle='five_elements';el('thuyKiemBtn').dataset.skillCast='water';
await import('../src/game/pixelfx.js');
const {beginPhongLangEncounter,openMonsterReward,selectMonsterReward,chooseFusion}=await import('../src/game/engine.js');
const {game,player,settings}=await import('../src/game/state.js');
const monsterForSkill=id=>({wolf:'phong_lang',eagle:'loi_ung',snake:'hac_hoa_xa',bat:'u_minh_ma_buc'})[id.split('_')[0]];
const {getCharge}=await import('../src/game/skills.js');
const {resetMonsterSkills}=await import('../src/game/ky-nang-quai.js');const {resetMotion}=await import('../src/game/character.js');
game.ready=true;settings.fxQuality='off';beginPhongLangEncounter();game.running=true;openMonsterReward(monsterForSkill('wolf_wind'));assert.equal(selectMonsterReward('wolf_wind'),true);assert.equal(chooseFusion('fusion_fire_wind'),true);
player.mana=250;handlers.get('skillBtn1:pointerdown')({pointerType:'touch',pointerId:1,preventDefault(){}});assert.equal(player.mana,200,'touch casts new skill');assert.equal(getCharge(),null,'old Hỏa Cầu no longer charges');
resetMonsterSkills();resetMotion();player.mana=250;handlers.get('window:keydown')({code:'Digit1',repeat:false,preventDefault(){}});assert.equal(player.mana,200,'keyboard casts new skill');assert.equal(getCharge(),null,'keyboard cannot charge old skill');
el('confirmCharacter').onclick();handlers.get('window:keydown')({code:'Digit1',repeat:false,preventDefault(){}});assert.equal(getCharge()?.kind,'fire','new run restores original key binding');
console.log('PASS touch and keyboard cast fused primary skill, never the consumed skill; restart restores control');
