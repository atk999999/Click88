import assert from 'node:assert/strict';
import fs from 'node:fs';
const cls={add(){},remove(){},toggle(){}};
let captures=[];
const makeContext=()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),putImageData(img){this.image=img},drawImage(c){if(c?.ctx?.image) captures.push(c.ctx.image)},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},measureText(){return {width:10}}});
globalThis.window=globalThis;window.localStorage={getItem:()=>null,setItem(){}};
globalThis.document={hidden:false,getElementById:()=>({classList:cls,style:{},textContent:'',setAttribute(){}}),querySelector:()=>null,querySelectorAll:()=>[],createElement(tag){const c={width:0,height:0,style:{}};c.ctx=makeContext();c.getContext=()=>c.ctx;return c}};
await import('../src/game/pixelfx.js');
const {game,player,dummy,settings,camera,motion}=await import('../src/game/state.js');
const {dummyDamage,applyPlayerStun,updatePlayerStun,reactionLocked,canMove,updateAction}=await import('../src/game/character.js');
const {getThoThuan,beginCharge,getCharge,toggleThoThuan}=await import('../src/game/skills.js');
const {resetLangTieuAI,castLangTieu,updateLangTieuAI,getLangTieuAI,drawLangTieuEffects,LANG_TIEU_SKILLS}=await import('../src/game/lang-tieu-ai.js');
const {beginSkillCollisionFrame,endSkillCollisionFrame,trackSkillSegment}=await import('../src/game/va-cham-ky-nang.js');
settings.fxQuality='high';game.running=true;game.battlePhase='fight';game.viewW=960;game.viewH=540;game.ctx=makeContext();game.terrain={firstSolidY:()=>500};camera.x=550;camera.y=300;
function reset(){Object.assign(player,{x:400,y:500,hp:100000,maxHp:100000,mana:250,maxMana:250,facing:1,shieldActive:false,stun:0});Object.assign(dummy,{x:700,y:500,hp:6500,maxHp:6500,skin:'ling_tieu',visible:true,broken:false,isBoss:true,stun:0,recoil:0,trapped:false,slow:0,hitSequence:0,shieldActive:false,swordShield:null,visualScale:1,squashX:1,squashY:1});motion.action=null;getThoThuan().active=false;resetLangTieuAI();}
function tick(dt=1/60){beginSkillCollisionFrame(()=>{});updateLangTieuAI(dt);endSkillCollisionFrame();}
function advance(sec,dt=1/60){for(let i=0;i<Math.ceil(sec/dt);i++)tick(dt)}
for(const [i,seconds] of [[0,3],[1,3],[2,9],[4,4]]){
 reset();const start=dummy.x;assert.equal(castLangTieu(i),true);advance(seconds);const ai=getLangTieuAI();assert.ok(player.hp<100000,`skill ${i+1} deals damage`);assert.ok(ai.cooldown[i]>0,`skill ${i+1} starts cooldown`);if(i===0)assert.equal(dummy.x,start,'teleport returns');console.log(`PASS skill ${i+1}: damage ${100000-player.hp}, cooldown ${ai.cooldown[i].toFixed(1)}s`);
}
reset();castLangTieu(3);assert.equal(getLangTieuAI().shield,1800);dummyDamage(900,{notice:false});assert.equal(dummy.hp,6500);assert.equal(getLangTieuAI().shield,900);dummyDamage(1000,{notice:false});assert.equal(dummy.hp,6400);tick();assert.equal(getLangTieuAI().shieldTime,0);assert.ok(getLangTieuAI().cooldown[3]>24);console.log('PASS shield absorbs 1800, excess hits HP and cooldown begins on break');
reset();castLangTieu(3);advance(8.1);assert.equal(getLangTieuAI().shieldTime,0);assert.ok(getLangTieuAI().cooldown[3]>24);console.log('PASS shield expires after 8 seconds');
reset();castLangTieu(1);advance(1.7);let beam=getLangTieuAI().shots[0];assert.ok(beam);const enemy={};beginSkillCollisionFrame(()=>{});trackSkillSegment({ref:enemy,side:'player',kind:'fireball',power:999,x0:beam.x,y0:beam.y,x1:beam.x,y1:beam.y,radius:40});updateLangTieuAI(1/60);endSkillCollisionFrame();assert.equal(beam.live,false);console.log('PASS sword beam clashes with fireball');
reset();castLangTieu(4);advance(2.1);drawLangTieuEffects();assert.ok(captures.length,'PixelFX rendered');let image=captures.at(-1);assert.ok(image.data.some((x,i)=>i%4===3&&x>0));fs.writeFileSync('/tmp/lang-tieu-ultimate.rgba',image.data);fs.writeFileSync('/tmp/lang-tieu-ultimate.json',JSON.stringify({width:image.width,height:image.height}));console.log('PASS PixelFX ultimate frame contains visible pixels');
assert.deepEqual(LANG_TIEU_SKILLS.map(x=>x.cooldown),[3,30,100,25,150]);console.log('PASS all specified cooldowns');

const {codeNpcPose}=await import('../src/game/character.js');
// Kiếm Tâm: thuấn di dùng cả hai nửa dải 16 khung, đòn đánh theo nhịp kiếm.
reset();castLangTieu(0);advance(.30);let pose=codeNpcPose();assert.equal(pose.name,'teleport');assert.ok(pose.f>=6&&pose.f<=7);
advance(.08);pose=codeNpcPose();assert.equal(getLangTieuAI().phase,'blink_arrive');assert.ok(pose.f>=8,'arrival uses second half of teleport clip');
advance(.34);assert.equal(getLangTieuAI().phase,'combo');const hpBefore=player.hp;advance(.12);assert.equal(player.hp,hpBefore,'no damage before sword swing');advance(.08);pose=codeNpcPose();assert.equal(pose.name,'sword_attack');assert.ok(pose.f>=6&&pose.f<=9);assert.ok(player.hp<hpBefore,'damage during extension');
const frameA=pose.f;advance(.2);advance(.07);pose=codeNpcPose();assert.equal(pose.name,'sword_attack');assert.ok(pose.f<frameA,'attack plays next swing instead of freezing');
console.log('PASS skill 1 teleport arrival, three sword swings and hit timing');
// Thập La: nâng kiếm, giữ kiếm, chuyển sang động tác phóng rồi mới tạo kiếm quang.
reset();castLangTieu(1);advance(.5);assert.equal(codeNpcPose().name,'charge_hold');advance(.82);assert.equal(codeNpcPose().name,'sword_cast');assert.equal(getLangTieuAI().shots.length,0);advance(.39);pose=codeNpcPose();assert.equal(pose.name,'sword_cast');assert.ok(pose.f>=7,'beam released at extended sword frame');assert.ok(getLangTieuAI().shots.length>0);
console.log('PASS skill 2 charge, hold and release synchronized');
// Vạn Kiếm: kết ấn rồi phát kiếm theo từng nhịp chém.
reset();castLangTieu(2);advance(.9);assert.equal(codeNpcPose().name,'sword_cast');advance(.20);assert.equal(getLangTieuAI().shots.length,0);advance(.1);pose=codeNpcPose();assert.ok(pose.f>=6);assert.ok(getLangTieuAI().shots.length>0);const lastFrame=pose.f;advance(.36);assert.ok(codeNpcPose().f<lastFrame,'formation performs another stroke');
console.log('PASS skill 3 sword volleys follow repeated casting animation');
reset();castLangTieu(3);advance(.3);pose=codeNpcPose();assert.equal(pose.name,'sword_guard');assert.ok(pose.f>=7&&pose.f<=9);assert.equal(getLangTieuAI().shield,1800);console.log('PASS skill 4 shield guard animation plays through');
// Đại chiêu: nhân vật mờ dần lúc hóa kiếm và trở lại sau khi lao tới.
reset();castLangTieu(4);advance(.5);assert.equal(codeNpcPose().name,'charge_hold');advance(1.87);assert.equal(codeNpcPose().name,'sword_cast');assert.ok(dummy.bossOpacity<1&&dummy.bossOpacity>0);advance(.35);assert.equal(getLangTieuAI().phase,'fusion_dash');assert.ok(dummy.bossOpacity<=.2);advance(1.0);assert.equal(getLangTieuAI().phase,'idle');assert.equal(dummy.bossOpacity,1);console.log('PASS skill 5 charge, merge, dash and reappear');
// Phản ứng trúng đòn dừng nhịp tung chiêu nhưng không phá hồi chiêu hay đạn đang bay.
reset();castLangTieu(1);advance(1.3);dummy.stun=1;const frozen=getLangTieuAI().t;advance(.7);assert.equal(getLangTieuAI().t,frozen);assert.equal(getLangTieuAI().shots.length,0);dummy.stun=0;advance(.45);assert.ok(getLangTieuAI().shots.length>0);console.log('PASS hit reaction pauses skill timing until recovery');
for (const dt of [1/30,1/60]){reset();castLangTieu(0);advance(3,dt);assert.equal(dummy.x,700);assert.equal(100000-player.hp,25);assert.equal(getLangTieuAI().phase,'idle');}console.log('PASS combo timing and damage at 30 and 60 FPS');
reset();castLangTieu(1);advance(.7);dummyDamage(1,{isDot:true,notice:false});assert.equal(dummy.recoil,0);const tBefore=getLangTieuAI().t;advance(.2);assert.ok(getLangTieuAI().t>tBefore);console.log('PASS damage over time does not permanently freeze animations');
// Mỗi lần thi triển gây choáng đúng một giây khi thực sự trúng, không kéo dài vô hạn theo nhiều nhát.
for(const [i,deadline] of [[0,2],[1,3],[2,3],[4,4]]){
  reset();castLangTieu(i);let elapsed=0;
  while(!player.stun&&elapsed<deadline){tick();elapsed+=1/60;}
  assert.ok(player.stun>.99,`skill ${i+1} stuns on hit`);
  assert.equal(reactionLocked(),true);assert.equal(canMove(),false);
  const currentCast=getLangTieuAI().currentCast;
  assert.equal(currentCast.stunApplied,true,`skill ${i+1} only marks actual impact`);
  updatePlayerStun(.55);const remaining=player.stun;
  for(let k=0;k<15;k++)tick();
  assert.equal(player.stun,remaining,`skill ${i+1} does not reapply stun within one cast`);
  updatePlayerStun(.46);assert.equal(player.stun,0);console.log(`PASS skill ${i+1}: one second stun on hit`);
}
reset();player.x=dummy.x-80;castLangTieu(3);tick();assert.equal(player.stun,1);updatePlayerStun(.6);tick();assert.ok(player.stun<.41);updatePlayerStun(.41);tick();assert.equal(player.stun,0);console.log('PASS skill 4 stuns once on shield contact');
reset();player.x=dummy.x-80;getThoThuan().active=true;player.shieldActive=true;castLangTieu(3);tick();assert.equal(player.stun,0);assert.equal(getLangTieuAI().shieldCast.stunApplied,false);console.log('PASS player shield blocks guard contact stun');
reset();getThoThuan().active=true;player.shieldActive=true;castLangTieu(1);advance(2.5);assert.equal(player.stun,0);assert.equal(player.hp,100000);console.log('PASS player shield blocks beam damage and stun');
reset();assert.equal(beginCharge('fire',123),true);assert.ok(getCharge());assert.equal(applyPlayerStun(1),true);assert.equal(getCharge(),null);assert.equal(beginCharge('fire',123),false);assert.equal(toggleThoThuan(),false);assert.equal(canMove(),false);updatePlayerStun(.99);assert.ok(player.stun>0);updatePlayerStun(.02);updateAction(1.1);assert.equal(player.stun,0);assert.equal(reactionLocked(),false);assert.equal(canMove(),true);console.log('PASS stun interrupts charging and blocks input for one second');
reset();settings.zoom=.5;dummy.x=camera.x+750;player.x=0;castLangTieu(4);advance(.5);captures=[];drawLangTieuEffects();assert.ok(captures.length);let wide=captures.at(-1);assert.ok(wide.data.some((v,i)=>i%4===3&&v>0),'zoomed-out visible effect is not cropped');console.log('PASS visible effects cover zoomed-out camera');

// Every damaging sword must remain visible, even when cosmetics are off or limited.
for(const quality of ['off','low']){
 reset();settings.zoom=1;settings.fxQuality=quality;camera.x=550;camera.y=300;
 const a=getLangTieuAI();a.phase='idle';a.time=20;a.shieldTime=0;a.shots=Array.from({length:12},(_,i)=>({x:100+i*70,y:300,angle:0,kind:'sword',live:true,final:false}));
 captures=[];drawLangTieuEffects();assert.ok(captures.length,`${quality}: draws live projectiles`);const pic=captures.at(-1);
 for(let i=0;i<12;i++){
  const x=Math.round((100+i*70-camera.x+game.viewW/2)*.5),y=Math.round((300-camera.y+game.viewH/2)*.5);let visible=false;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const index=((y+dy)*pic.width+x+dx)*4+3;if(pic.data[index]>0)visible=true;}
  assert.ok(visible,`${quality}: sword ${i+1} visible at its collision point`);
 }
 console.log(`PASS ${quality}: all twelve damaging swords visibly reach their collision point`);
}
// Death should play the knockdown frames before the victory screen.
reset();settings.fxQuality='off';const {updateDummy}=await import('../src/game/character.js');
dummyDamage(7000,{notice:false});assert.equal(codeNpcPose().name,'knockdown');assert.equal(codeNpcPose().f,0);updateDummy(.35);assert.ok(codeNpcPose().f>=3&&codeNpcPose().f<7);updateDummy(.4);assert.equal(codeNpcPose().f,7);console.log('PASS Lăng Tiêu death plays the knockdown sequence');
// A projectile reaching its lifetime in the same frame can still hit before expiry.
reset();let a=getLangTieuAI();a.wait=999;a.currentCast={index:1,stunApplied:false};a.shots=[{x:player.x-60,y:player.y-65,vx:900,vy:0,angle:0,kind:'beam',raw:1600,age:2.99,live:true,cast:a.currentCast}];let hp=player.hp;tick(.1);assert.ok(player.hp<hp,'impact occurs before expiry within the same frame');console.log('PASS projectile impact is resolved before same-frame expiry');
