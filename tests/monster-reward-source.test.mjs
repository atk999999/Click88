import assert from 'node:assert/strict';
const all=new Map();
const ctx={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},clearRect(){},fillRect(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},stroke(){},fill(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
function el(id){
 if(!all.has(id)){
  const classes=new Set();
  all.set(id,{id,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,force){const on=force??!classes.has(x);if(on)classes.add(x);else classes.delete(x);return on;}},style:{},dataset:{},clientWidth:960,clientHeight:540,textContent:'',setAttribute(k,v){this[k]=v},addEventListener(){},querySelector:()=>el('thumb'),getContext:()=>ctx,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})});
 }
 return all.get(id);
}
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=()=>0;
globalThis.document={body:el('body'),documentElement:el('html'),hidden:false,getElementById:el,querySelector:()=>el('thumb'),querySelectorAll:()=>[],addEventListener(){},createElement:()=>el(Math.random())};
globalThis.Image=class{set src(v){this._src=v;this.complete=true;this.naturalWidth=1024;this.width=1024;this.height=128;queueMicrotask(()=>this.onload?.())}};
await import('../src/game/pixelfx.js');
const {beginPhongLangEncounter,openMonsterReward,selectMonsterReward,backFusion}=await import('../src/game/engine.js');
const {game,settings}=await import('../src/game/state.js');
const {MONSTER_SKILLS}=await import('../src/game/ky-nang-quai.js');
game.ready=true;settings.fxQuality='off';beginPhongLangEncounter();game.running=true;
const groups={phong_lang:['wolf_bite','wolf_wind'],loi_ung:['eagle_orb','eagle_dive'],hac_hoa_xa:['snake_fang','snake_lunge'],u_minh_ma_buc:['bat_orb','bat_dive']};
for(const [skin,expected] of Object.entries(groups)){
 assert.equal(openMonsterReward(skin),true);
 for(const id of Object.keys(MONSTER_SKILLS)){
  const button=el('monster-'+id),allowed=expected.includes(id);
  assert.equal(button.classList.contains('hidden'),!allowed,skin+' visibility '+id);
  assert.equal(button.disabled,!allowed,skin+' enabled '+id);
  if(!allowed)assert.equal(selectMonsterReward(id),false,skin+' rejects '+id);
 }
 assert.equal(selectMonsterReward(expected[0]),true,'can pick an allowed skill');
 assert.equal(game.battlePhase,'fusion');
 assert.equal(backFusion(),true,'can return without losing the reward source');
 for(const id of expected)assert.equal(el('monster-'+id).classList.contains('hidden'),false,'allowed skill remains visible after back');
 assert.equal(selectMonsterReward('skip'),true,'can skip when no skill is wanted');
}
openMonsterReward('unknown');
for(const id of Object.keys(MONSTER_SKILLS))assert.equal(el('monster-'+id).classList.contains('hidden'),true,'unknown monster offers no unrelated reward');
assert.equal(selectMonsterReward('wolf_wind'),false);
assert.equal(selectMonsterReward('skip'),true);
console.log('PASS each defeated monster offers only its own skills, rejects other skills, and preserves back/skip');
