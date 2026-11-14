// Âm thanh tổng hợp gốc: không cần tải file ngoài, dùng chung WebAudio của game.
const PRESETS={
  ui:{duration:.12,start:560,end:730,noise:.04,metal:.38,body:.06,attack:.004,decay:5,peak:.56},
  jump:{duration:.26,start:235,end:390,noise:.22,metal:.16,body:.10,attack:.008,decay:3.4,peak:.64},
  flight_up:{duration:.46,start:180,end:570,noise:.36,metal:.18,body:.17,attack:.018,decay:2.5,peak:.68},
  flight_down:{duration:.34,start:420,end:140,noise:.31,metal:.10,body:.15,attack:.01,decay:3,peak:.62},
  hurt:{duration:.20,start:150,end:70,noise:.30,metal:.06,body:.48,attack:.002,decay:7,peak:.70},
  heavy_hit:{duration:.38,start:130,end:44,noise:.40,metal:.08,body:.66,attack:.002,decay:5.5,peak:.79},
  collision:{duration:.23,start:740,end:290,noise:.22,metal:.60,body:.18,attack:.002,decay:5.2,peak:.75},
  round:{duration:.92,start:115,end:275,noise:.22,metal:.28,body:.50,attack:.014,decay:2.2,peak:.77},
  victory:{duration:1.05,start:330,end:610,noise:.06,metal:.48,body:.26,attack:.02,decay:2.1,peak:.72},
  defeat:{duration:.92,start:220,end:92,noise:.12,metal:.17,body:.42,attack:.015,decay:2.5,peak:.70},
  sword_teleport:{duration:.34,start:260,end:920,noise:.42,metal:.32,body:.14,attack:.006,decay:2.8,peak:.71},
  sword_slash:{duration:.23,start:580,end:165,noise:.52,metal:.26,body:.21,attack:.003,decay:4.2,peak:.76},
  sword_hit:{duration:.24,start:1050,end:430,noise:.20,metal:.72,body:.20,attack:.0015,decay:5.5,peak:.74},
  sword_charge:{duration:1.05,start:165,end:820,noise:.20,metal:.40,body:.25,attack:.09,decay:1.0,peak:.68},
  sword_beam:{duration:.64,start:540,end:105,noise:.50,metal:.38,body:.58,attack:.003,decay:3,peak:.83},
  sword_array:{duration:.78,start:310,end:780,noise:.14,metal:.58,body:.19,attack:.035,decay:1.9,peak:.72},
  sword_fly:{duration:.18,start:1120,end:420,noise:.30,metal:.52,body:.09,attack:.002,decay:4.5,peak:.62},
  sword_guard:{duration:.68,start:290,end:760,noise:.12,metal:.62,body:.18,attack:.025,decay:2.5,peak:.70},
  sword_guard_end:{duration:.35,start:540,end:240,noise:.14,metal:.44,body:.08,attack:.012,decay:3.3,peak:.60},
  sword_guard_break:{duration:.57,start:900,end:210,noise:.49,metal:.59,body:.30,attack:.002,decay:3.6,peak:.77},
  sword_ultimate_charge:{duration:1.40,start:105,end:710,noise:.24,metal:.42,body:.46,attack:.10,decay:.8,peak:.74},
  sword_ultimate_fire:{duration:.78,start:640,end:70,noise:.50,metal:.45,body:.78,attack:.004,decay:2.6,peak:.87},
  sword_ultimate_hit:{duration:1.0,start:180,end:48,noise:.50,metal:.45,body:.92,attack:.002,decay:2.9,peak:.90},
  // Các quái có âm sắc riêng, ngắn và không cần tải tệp âm thanh ngoài.
  wolf_spawn:{duration:.36,start:260,end:145,noise:.42,metal:.04,body:.60,attack:.018,decay:3.1,peak:.66},
  wolf_bite:{duration:.22,start:260,end:88,noise:.56,metal:.03,body:.55,attack:.003,decay:4.5,peak:.72},
  wolf_wind:{duration:.58,start:180,end:620,noise:.68,metal:.12,body:.23,attack:.018,decay:2.3,peak:.73},
  wolf_hurt:{duration:.23,start:320,end:125,noise:.35,metal:.02,body:.59,attack:.004,decay:4.0,peak:.64},
  wolf_death:{duration:.52,start:210,end:75,noise:.33,metal:.02,body:.67,attack:.012,decay:2.6,peak:.68},
  eagle_spawn:{duration:.39,start:940,end:540,noise:.32,metal:.35,body:.34,attack:.008,decay:2.8,peak:.65},
  eagle_orb:{duration:.52,start:780,end:175,noise:.48,metal:.50,body:.31,attack:.004,decay:3.0,peak:.76},
  eagle_dive:{duration:.42,start:1160,end:310,noise:.58,metal:.23,body:.31,attack:.004,decay:3.1,peak:.73},
  eagle_hurt:{duration:.22,start:1180,end:620,noise:.26,metal:.30,body:.39,attack:.003,decay:4.0,peak:.62},
  eagle_death:{duration:.52,start:850,end:210,noise:.34,metal:.20,body:.51,attack:.008,decay:2.8,peak:.68},
  snake_spawn:{duration:.52,start:115,end:64,noise:.53,metal:.02,body:.74,attack:.025,decay:2.2,peak:.71},
  snake_fang:{duration:.57,start:580,end:135,noise:.70,metal:.06,body:.39,attack:.006,decay:2.5,peak:.77},
  snake_lunge:{duration:.45,start:185,end:52,noise:.62,metal:.03,body:.76,attack:.003,decay:3.3,peak:.79},
  snake_hurt:{duration:.27,start:190,end:75,noise:.47,metal:.02,body:.65,attack:.004,decay:4,peak:.68},
  snake_death:{duration:.72,start:150,end:42,noise:.52,metal:.03,body:.82,attack:.012,decay:2.8,peak:.75},
  bat_spawn:{duration:.42,start:700,end:220,noise:.40,metal:.22,body:.45,attack:.009,decay:2.8,peak:.65},
  bat_orb:{duration:.55,start:440,end:95,noise:.55,metal:.24,body:.45,attack:.008,decay:2.7,peak:.74},
  bat_dive:{duration:.42,start:720,end:150,noise:.58,metal:.16,body:.43,attack:.004,decay:3.1,peak:.73},
  bat_hurt:{duration:.23,start:850,end:250,noise:.34,metal:.15,body:.48,attack:.004,decay:4,peak:.63},
  bat_death:{duration:.58,start:430,end:75,noise:.44,metal:.12,body:.66,attack:.01,decay:2.7,peak:.69},
  tang_charge:{duration:.72,start:110,end:440,noise:.30,metal:.26,body:.50,attack:.025,decay:1.8,peak:.74},
  tang_dash:{duration:.35,start:360,end:90,noise:.61,metal:.12,body:.54,attack:.003,decay:3.4,peak:.78},
  tang_impact:{duration:.68,start:165,end:45,noise:.53,metal:.22,body:.90,attack:.002,decay:3,peak:.84},
  tang_rage:{duration:.93,start:90,end:260,noise:.38,metal:.12,body:.80,attack:.025,decay:1.8,peak:.81},
  tang_void:{duration:.85,start:260,end:70,noise:.40,metal:.32,body:.62,attack:.045,decay:1.8,peak:.75},
  tang_grab:{duration:.40,start:230,end:65,noise:.45,metal:.10,body:.70,attack:.003,decay:3.7,peak:.76},
  tang_blink:{duration:.25,start:380,end:145,noise:.55,metal:.22,body:.30,attack:.003,decay:3.8,peak:.70},
  tang_combo:{duration:.20,start:200,end:60,noise:.54,metal:.08,body:.65,attack:.002,decay:5,peak:.73},
  tang_hurt:{duration:.28,start:155,end:65,noise:.35,metal:.04,body:.70,attack:.004,decay:4,peak:.69},
  tang_death:{duration:.95,start:115,end:38,noise:.45,metal:.10,body:.85,attack:.018,decay:2.2,peak:.79},
  progress_breakthrough:{duration:.90,start:260,end:820,noise:.13,metal:.50,body:.25,attack:.035,decay:1.6,peak:.70},
  progress_reward:{duration:.36,start:430,end:740,noise:.05,metal:.52,body:.19,attack:.008,decay:2.5,peak:.63},
  tribulation_start:{duration:1.10,start:115,end:52,noise:.38,metal:.23,body:.72,attack:.075,decay:1.5,peak:.78},
  tribulation_warning:{duration:.56,start:300,end:690,noise:.27,metal:.42,body:.29,attack:.022,decay:1.8,peak:.69},
};
// Synthesized in memory and cached by WebAudio: no external sound files.
// Different sweeps/noise/body give each combination a recognizable sonic palette.
const FUSION_PROFILES={
 firewind:       {start:240,end:660,noise:.72,metal:.12,body:.31},
 waterlightning: {start:790,end:280,noise:.30,metal:.70,body:.27},
 venomwind:      {start:410,end:120,noise:.75,metal:.07,body:.40},
 bloodfire:      {start:210,end:75,noise:.63,metal:.16,body:.65},
 earthwind:      {start:190,end:62,noise:.55,metal:.08,body:.78},
 lightningfire:  {start:950,end:160,noise:.55,metal:.52,body:.48},
 venomwater:     {start:530,end:185,noise:.55,metal:.36,body:.32},
 shadowlightning:{start:700,end:95,noise:.56,metal:.49,body:.61},
 shadowwater:    {start:460,end:105,noise:.43,metal:.38,body:.54},
 lightningblood: {start:820,end:95,noise:.52,metal:.44,body:.65},
 earthblood:     {start:165,end:48,noise:.53,metal:.12,body:.80},
 fiveblood:      {start:480,end:55,noise:.50,metal:.66,body:.86},
 fivefire:       {start:360,end:95,noise:.62,metal:.44,body:.68},
 fivelightning:  {start:880,end:130,noise:.46,metal:.68,body:.56},
 fivewater:      {start:620,end:210,noise:.34,metal:.62,body:.42},
 fiveearth:      {start:220,end:52,noise:.48,metal:.36,body:.84},
 fivevenom:      {start:470,end:115,noise:.60,metal:.38,body:.52},
 bloodwind:      {start:320,end:145,noise:.70,metal:.24,body:.58},
 bloodvenom:     {start:390,end:98,noise:.64,metal:.20,body:.62},
 shadowfire:     {start:560,end:82,noise:.58,metal:.40,body:.70},
 fivewind:       {start:360,end:520,noise:.66,metal:.48,body:.50},
 earthfire:      {start:200,end:55,noise:.62,metal:.20,body:.82},
 earthwater:     {start:310,end:92,noise:.40,metal:.50,body:.68},
 earthvenom:     {start:270,end:72,noise:.62,metal:.24,body:.70},
 earthshadow:    {start:220,end:52,noise:.52,metal:.34,body:.80},
 shadowvenom:    {start:450,end:88,noise:.66,metal:.28,body:.60},
 swordfire:      {start:680,end:130,noise:.46,metal:.74,body:.56},
 swordlightning: {start:960,end:220,noise:.36,metal:.82,body:.42},
 swordearth:     {start:420,end:76,noise:.42,metal:.66,body:.76},
 swordwater:     {start:760,end:240,noise:.28,metal:.78,body:.38},
 swordvenom:     {start:610,end:145,noise:.52,metal:.68,body:.46},
 swordshadow:    {start:720,end:105,noise:.44,metal:.76,body:.58},
 swordblood:     {start:580,end:85,noise:.48,metal:.72,body:.70},
 swordfive:      {start:840,end:165,noise:.38,metal:.80,body:.66},
};
export const FUSION_AUDIO_STYLES=Object.freeze(Object.keys(FUSION_PROFILES));
for(const [style,c] of Object.entries(FUSION_PROFILES)){
 PRESETS[`fusion_${style}_cast`]={...c,duration:.46,attack:.012,decay:2.8,peak:.73};
 PRESETS[`fusion_${style}_impact`]={...c,start:c.start*.7,end:Math.max(35,c.end*.55),noise:Math.min(.85,c.noise+.10),body:Math.min(.95,c.body+.20),duration:.72,attack:.003,decay:3.5,peak:.82};
}
export const SOUND_EFFECT_NAMES=Object.freeze(Object.keys(PRESETS));
function randomSource(seed){let n=seed>>>0||1;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296)*2-1;}
function safeNormalize(data,target=.78,fadeMs=.02,sampleRate=24000){
  let peak=0;const endFade=Math.max(1,Math.floor(fadeMs*sampleRate)),attack=Math.max(1,Math.floor(.002*sampleRate));
  for(let i=0;i<data.length;i++){const edge=Math.min(1,i/attack,(data.length-1-i)/endFade);data[i]*=Math.max(0,edge);peak=Math.max(peak,Math.abs(data[i]));}
  const g=peak>1e-6?target/peak:1;for(let i=0;i<data.length;i++)data[i]*=g;return data;
}
export function makeEnhancedSound(kind,variant=0,sampleRate=24000){
  const c=PRESETS[kind];if(!c)return null;
  let hash=2166136261;for(const ch of kind)hash=Math.imul(hash^ch.charCodeAt(0),16777619);
  const rng=randomSource(hash+variant*761),n=Math.ceil(c.duration*sampleRate),data=new Float32Array(n);
  let phase=0,phaseMetal=0,low=0,high=0;
  const mod=1+(variant%3-1)*.022;
  for(let i=0;i<n;i++){
    const t=i/sampleRate,u=t/c.duration,noise=rng();low+=(noise-low)*.085;high+=(noise-high)*.36;
    const freq=c.start*Math.pow(c.end/c.start,u)*mod;phase+=TAU*freq/sampleRate;phaseMetal+=TAU*(c.start*2.6+freq*.6)*mod/sampleRate;
    const rise=1-Math.exp(-t/c.attack),fall=Math.exp(-c.decay*u),env=rise*fall;
    const sweep=(high-low)*c.noise*env;
    const body=Math.sin(phase)*c.body*env;
    const chime=(Math.sin(phaseMetal)+.35*Math.sin(phaseMetal*1.53))*.5*c.metal*rise*Math.exp(-u*(c.decay*.7+1));
    const transient=low*c.body*1.1*Math.exp(-u*13);
    data[i]=Math.tanh((sweep+body+chime+transient)*1.15);
  }
  return safeNormalize(data,c.peak,.025,sampleRate);
}
const TAU=Math.PI*2;
// Một đoạn nhạc khí cụ ngũ cung nhẹ, được tổng hợp một lần và lặp liền mạch.
export function makeAmbientMusic(sampleRate=16000){
  const duration=16,n=sampleRate*duration,data=new Float32Array(n);
  for(let i=0;i<n;i++){
    const t=i/sampleRate,breath=.70+.18*Math.sin(TAU*t/8),pad=Math.sin(TAU*110*t)*.10+Math.sin(TAU*165*t)*.055+Math.sin(TAU*220*t)*.035;
    data[i]=pad*breath;
  }
  const notes=[220,261.6256,329.6276,392,329.6276,261.6256,220,196,220,261.6256,329.6276,440,392,329.6276,261.6256,220];
  for(let j=0;j<notes.length;j++){
    const start=Math.floor((j+.18)*sampleRate),length=Math.floor(.78*sampleRate),f=notes[j];
    for(let k=0;k<length&&start+k<n;k++){
      const t=k/sampleRate,env=(1-Math.exp(-t*80))*Math.exp(-t*4.8);
      data[start+k]+=(Math.sin(TAU*f*t)+.34*Math.sin(TAU*f*2*t)+.13*Math.sin(TAU*f*3.01*t))*env*.12;
    }
  }
  let peak=0;for(const x of data)peak=Math.max(peak,Math.abs(x));const gain=.68/Math.max(.001,peak);for(let i=0;i<n;i++)data[i]*=gain;
  // A short crossfade eliminates discontinuity even with floating-point phase rounding.
  const fade=Math.floor(sampleRate*.04);for(let i=0;i<fade;i++){const u=i/fade,mix=(data[i]+data[n-fade+i])*.5;data[i]=mix*(1-u)+data[i]*u;data[n-fade+i]=data[n-fade+i]*u+mix*(1-u);}
  const seam=(data[0]+data[n-1])*.5;data[0]=seam;data[n-1]=seam;return data;
}
