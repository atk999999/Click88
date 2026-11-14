import assert from 'node:assert/strict';
const noop=()=>{},cls={add:noop,remove:noop,toggle:noop};
const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>o[k]??noop});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem:noop};globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute:noop}),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({width:128,height:128,getContext:()=>ctx})};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,motion}=await import('../src/game/state.js');
const {actionAudio}=await import('../src/game/audio.js');
const {dummyDamage}=await import('../src/game/character.js');
const {resetPhongLang,updatePhongLang}=await import('../src/game/phong-lang.js');
const {resetLoiUng,updateLoiUng}=await import('../src/game/loi-ung.js');
const {resetHacHoaXa,updateHacHoaXa}=await import('../src/game/hac-hoa-xa.js');
const {resetUMinh,updateUMinh}=await import('../src/game/u-minh-ma-buc.js');
let heard=[];const previous=actionAudio.monsterCue;actionAudio.monsterCue=(kind,x)=>{heard.push({kind,x});return true;};
function setup(skin,x,y=499.5){heard=[];Object.assign(game,{running:true,battlePhase:'fight',terrain:{firstSolidY:()=>500,solid:()=>false}});settings.fxQuality='off';Object.assign(player,{x:400,y:499.5,hp:100000,maxHp:100000,mana:250,maxMana:250,stun:0,shieldActive:false});Object.assign(dummy,{skin,x,y,hp:1000,maxHp:1000,visible:true,broken:false,stun:0,recoil:0,trapped:false,slow:0,shieldActive:false,swordShield:null,facing:-1});motion.action=null;}
function expectOnce(kind){assert.equal(heard.filter(e=>e.kind===kind).length,1,kind+' occurs once');}
setup('phong_lang',490);let w=resetPhongLang();w.biteCooldown=0;updatePhongLang(.01);updatePhongLang(.3);updatePhongLang(.1);expectOnce('wolf_spawn');expectOnce('wolf_bite');
setup('phong_lang',900);w=resetPhongLang();w.windCooldown=0;updatePhongLang(.01);updatePhongLang(.48);expectOnce('wolf_wind');
setup('loi_ung',740,339.5);let e=resetLoiUng();e.orbCooldown=0;e.diveCooldown=99;updateLoiUng(.01);updateLoiUng(.54);expectOnce('eagle_spawn');expectOnce('eagle_orb');
setup('loi_ung',740,339.5);e=resetLoiUng();e.orbCooldown=99;e.diveCooldown=0;updateLoiUng(.01);updateLoiUng(.6);expectOnce('eagle_dive');
setup('hac_hoa_xa',1000);let s=resetHacHoaXa();s.fangCooldown=0;s.lungeCooldown=99;updateHacHoaXa(.01);updateHacHoaXa(.56);expectOnce('snake_spawn');expectOnce('snake_fang');
setup('hac_hoa_xa',700);s=resetHacHoaXa();s.fangCooldown=99;s.lungeCooldown=0;updateHacHoaXa(.01);updateHacHoaXa(.61);expectOnce('snake_lunge');
setup('u_minh_ma_buc',740,339.5);let b=resetUMinh();b.orbCooldown=0;b.diveCooldown=99;updateUMinh(.01);updateUMinh(.54);expectOnce('bat_spawn');expectOnce('bat_orb');
setup('u_minh_ma_buc',740,339.5);b=resetUMinh();b.orbCooldown=99;b.diveCooldown=0;updateUMinh(.01);updateUMinh(.6);expectOnce('bat_dive');
for(const [skin,prefix] of [['phong_lang','wolf'],['loi_ung','eagle'],['hac_hoa_xa','snake'],['u_minh_ma_buc','bat']]){setup(skin,700);dummyDamage(1,{notice:false});dummyDamage(9999,{isDot:true,notice:false});dummyDamage(20,{notice:false});expectOnce(prefix+'_hurt');expectOnce(prefix+'_death');}
actionAudio.monsterCue=previous;
console.log('PASS all four monsters emit spawn, distinct attack/skill, hurt and death cues exactly once at gameplay events');
