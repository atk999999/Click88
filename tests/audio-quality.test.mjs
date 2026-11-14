import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeFoleyPCM,makeSkillPCM,makeActionAudio } from '../src/game/audio.js';
import { SOUND_EFFECT_NAMES,FUSION_AUDIO_STYLES,makeEnhancedSound,makeAmbientMusic } from '../src/game/soundscapes.js';
import {settings,game,player} from '../src/game/state.js';
const source=readFileSync(new URL('../src/game/audio.js',import.meta.url),'utf8');
const legacy=[...source.matchAll(/kind === '([^']+)'/g)].map(m=>m[1]).filter(k=>!['land','step','fire','lightning'].includes(k));
function audit(name,data,{loop=false}={}){
  assert.ok(data&&data.length>100,name+' exists');let peak=0,sum=0,dc=0;
  for(const n of data){assert.ok(Number.isFinite(n),name+' finite');peak=Math.max(peak,Math.abs(n));sum+=n*n;dc+=n;}
  const rms=Math.sqrt(sum/data.length);assert.ok(peak>.05&&peak<=.981,name+' peak '+peak);assert.ok(rms>.005&&rms<.6,name+' audible RMS '+rms);assert.ok(Math.abs(dc/data.length)<.04,name+' DC');
  if(loop)assert.ok(Math.abs(data[0]-data.at(-1))<.12,name+' loop seam');else {assert.ok(Math.abs(data[0])<1e-7,name+' fade-in');assert.ok(Math.abs(data.at(-1))<1e-7,name+' fade-out');}
}
for(const name of legacy)for(const variant of [0,1])audit(name,makeSkillPCM(name,variant),{loop:name.endsWith('_loop')||name==='blood_thread_charge'||name==='blood_cataclysm_gather'});
for(const kind of ['step','land'])for(let material=1;material<=4;material++)audit(`${kind} ${material}`,makeFoleyPCM(kind,material,0));
for(const name of SOUND_EFFECT_NAMES)for(const variant of [0,1])audit(name,makeEnhancedSound(name,variant));
audit('ambient music',makeAmbientMusic(),{loop:true});assert.equal(makeEnhancedSound('absent'),null);console.log(`PASS ${legacy.length} existing cues, 8 footsteps/landings, ${SOUND_EFFECT_NAMES.length} new cues and music: finite, audible, fades and level`);
class Param{constructor(){this.value=0}setTargetAtTime(v){this.value=v}setValueAtTime(v){this.value=v}cancelScheduledValues(){}}
class Gain{constructor(){this.gain=new Param()}connect(){}disconnect(){}}
class Source{constructor(){this.playbackRate=new Param();this.loop=false}connect(){}disconnect(){}start(){this.started=true}stop(){this.stopped=true;this.onended?.()}}
class Panner{constructor(){this.pan=new Param()}connect(){}disconnect(){}}
let lastCtx;
class FakeContext{constructor(){lastCtx=this;this.state='running';this.currentTime=0;this.destination={};this.sources=[]}createGain(){return new Gain()}createStereoPanner(){return new Panner()}createDynamicsCompressor(){return {threshold:new Param(),knee:new Param(),ratio:new Param(),attack:new Param(),release:new Param(),connect(){}}}createBuffer(ch,n,rate){const samples=new Float32Array(n);return {getChannelData:()=>samples,length:n,sampleRate:rate}}createBufferSource(){const s=new Source();this.sources.push(s);return s}resume(){this.state='running';return Promise.resolve()}}
const data=new Map();globalThis.window={AudioContext:FakeContext,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};globalThis.document={hidden:false};Object.assign(settings,{soundEnabled:false,soundVolume:70,musicEnabled:false,musicVolume:28});game.running=true;player.x=100;
const audio=makeActionAudio();assert.equal(audio.unlock(),false);assert.equal(audio.jump(),false);audio.change(true,70);assert.equal(audio.status().state,'running');assert.equal(audio.jump(),true);assert.equal(audio.flight(true),true);assert.equal(audio.swordCue('sword_charge',600),true);assert.equal(audio.swordCue('sword_beam',600),true);assert.equal(audio.status().lastEvent.kind,'sword_beam');assert.ok(audio.status().lastEvent.pan>0);console.log('PASS WebAudio activation, spatial sword cues and disabled sound');
for(let i=0;i<25;i++){lastCtx.currentTime+=.15;audio.swordCue('sword_fly',250,i%2);assert.ok(audio.status().voices<=8,'voices are bounded');}console.log('PASS simultaneous effect voices remain bounded under sword barrage');
audio.stopAll();lastCtx.currentTime+=1;assert.equal(audio.monsterCue('wolf_bite',250),true);assert.ok(audio.status().lastEvent.pan>0);assert.equal(audio.monsterCue('wolf_bite',250),false,'same cue is rate limited');lastCtx.currentTime+=.25;assert.equal(audio.monsterCue('eagle_orb',250),true);lastCtx.currentTime+=.25;assert.equal(audio.monsterCue('snake_fang',250),true);lastCtx.currentTime+=.25;assert.equal(audio.monsterCue('wolf_wind',250),false,'monster voices capped');assert.equal(audio.jump(),true,'player cue is not crowded out');assert.equal(audio.monsterCue('wolf_bite',4000),false,'distant monster is silent');audio.stopAll();console.log('PASS monster cues spatialized, rate-limited, capped and preserve player audio');
// All fusion palettes have distinct cast and impact voices, positional audio and limits.
audio.stopAll();for(const style of FUSION_AUDIO_STYLES){
  lastCtx.currentTime+=.2;assert.equal(audio.fusionCue(style,'cast',100),true,style+' cast');assert.equal(audio.status().lastEvent.kind,`fusion_${style}_cast`);
  lastCtx.currentTime+=.2;assert.equal(audio.fusionCue(style,'impact',500),true,style+' impact');assert.equal(audio.status().lastEvent.kind,`fusion_${style}_impact`);assert.ok(audio.status().lastEvent.pan>0);assert.ok(audio.status().voices<=8);audio.stopAll();
}
assert.equal(audio.fusionCue('unknown','cast',100),false);assert.equal(audio.fusionCue('firewind','wrong',100),false);assert.equal(audio.fusionCue('firewind','cast',5000),false);
lastCtx.currentTime+=1;assert.equal(audio.fusionCue('firewind','cast',100),true);assert.equal(audio.fusionCue('firewind','cast',100),false,'identical sound rate-limited');
audio.stopAll();for(let i=0;i<3;i++){lastCtx.currentTime+=.2;assert.equal(audio.fusionCue(FUSION_AUDIO_STYLES[i],'cast',100),true);}lastCtx.currentTime+=.2;assert.equal(audio.fusionCue('bloodfire','cast',100),false,'fusion voices capped');assert.equal(audio.fusionCue('bloodfire','impact',100),true,'impact takes priority');assert.ok(audio.status().voices<=3);audio.stopAll();
audio.change(false,70);assert.equal(audio.fusionCue('firewind','impact',100),false,'global mute');audio.change(true,70);game.running=false;assert.equal(audio.fusionCue('firewind','impact',100),false,'paused gameplay');game.running=true;
for(const learned of ['wolf_bite','wolf_wind','eagle_orb','eagle_dive','snake_fang','snake_lunge','bat_orb','bat_dive','sword_heart','sword_beam','sword_array','sword_guard','sword_union']){assert.equal(audio.learnedBeastCue(learned,100),true,learned+' learned audio plays');}audio.stopAll();
console.log('PASS fusion cast/impact palettes, volume settings, spatialization and voice limits');
audio.changeMusic(true,35);assert.equal(audio.status().musicPlaying,true);audio.changeMusic(false,35);assert.equal(audio.status().musicPlaying,false);audio.changeMusic(true,35);audio.change(false,70);assert.equal(audio.status().musicPlaying,false);assert.equal(audio.status().voices,0);assert.equal(audio.swordCue('sword_beam',0),false);assert.equal(audio.monsterCue('wolf_bite',250),false);console.log('PASS separate music switch and global mute');
audio.change(true,70);game.running=false;assert.equal(audio.uiSelect(),true);assert.equal(audio.battleResult(true),true);document.hidden=true;audio.stopMusic();assert.equal(audio.unlock(),false);assert.equal(audio.uiSelect(),false);document.hidden=false;console.log('PASS menu and result cues, hidden tab and resume guard');
const copy=makeActionAudio();copy.restore();assert.equal(settings.soundEnabled,true);assert.equal(settings.musicEnabled,true);assert.equal(settings.musicVolume,35);console.log('PASS audio settings persist');
window.AudioContext=undefined;window.webkitAudioContext=undefined;const noDevice=makeActionAudio();game.running=true;assert.equal(noDevice.unlock(),false);for(const fn of ['earthActivate','earthBlock','waterSeal','fiveBlast','bossDialogueOpen','uiSelect','jump','flight','collision','swordCue','monsterCue'])assert.doesNotThrow(()=>noDevice[fn]('sword_hit',100));console.log('PASS unsupported audio does not crash the game');
// Exercise actual boss phases through the shared mixer, without an audio device.
window.AudioContext=FakeContext;Object.assign(settings,{soundEnabled:true,soundVolume:70,musicEnabled:false,musicVolume:28});
const element=()=>({classList:{add(){},remove(){},toggle(){}},style:{},textContent:'',setAttribute(){}});
const drawContext={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},drawImage(){},save(){},restore(){},translate(){},scale(){},rotate(){}};
Object.assign(document,{getElementById:()=>element(),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({getContext:()=>drawContext})});
await import('../src/game/pixelfx.js');
const state=await import('../src/game/state.js');const {dummy,motion}=state;
const {actionAudio}=await import('../src/game/audio.js');const {resetLangTieuAI,castLangTieu,updateLangTieuAI}=await import('../src/game/lang-tieu-ai.js');const {beginSkillCollisionFrame,endSkillCollisionFrame}=await import('../src/game/va-cham-ky-nang.js');
Object.assign(game,{running:true,battlePhase:'fight',terrain:{firstSolidY:()=>500},viewW:960,viewH:540,ctx:drawContext});actionAudio.unlock();
let emitted;const originalSwordCue=actionAudio.swordCue;actionAudio.swordCue=(kind,...rest)=>{const ok=originalSwordCue(kind,...rest);if(ok&&emitted)emitted.add(kind);return ok;};
function phaseAudio(skill,seconds){
  actionAudio.stopAll();Object.assign(player,{x:400,y:500,hp:100000,maxHp:100000,mana:250,maxMana:250,facing:1,stun:0,shieldActive:false});
  Object.assign(dummy,{x:700,y:500,hp:6500,maxHp:6500,skin:'ling_tieu',visible:true,broken:false,stun:0,recoil:0,trapped:false,hitSequence:0,shieldActive:false});motion.action=null;resetLangTieuAI();
  const seen=new Set();emitted=seen;castLangTieu(skill);if(actionAudio.status().lastEvent)seen.add(actionAudio.status().lastEvent.kind);
  for(let i=0;i<seconds*60;i++){lastCtx.currentTime+=1/60;beginSkillCollisionFrame(()=>{});updateLangTieuAI(1/60);endSkillCollisionFrame();const e=actionAudio.status().lastEvent;if(e)seen.add(e.kind);}
  return seen;
}
for(const [skill,sec,expected] of [[0,3,['sword_teleport','sword_slash','sword_hit']],[1,3,['sword_charge','sword_beam','sword_hit']],[2,9,['sword_array','sword_fly','sword_beam']],[3,9,['sword_guard','sword_guard_end']],[4,4,['sword_ultimate_charge','sword_ultimate_fire','sword_ultimate_hit']]]){
  const heard=phaseAudio(skill,sec);for(const kind of expected)assert.ok(heard.has(kind),`skill ${skill+1}: ${kind} was triggered (${[...heard]})`);
}
console.log('PASS all five Lăng Tiêu skill phases trigger their intended audio cues');
