import assert from 'node:assert/strict';
const calls=[];
const ctx = new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),drawImage:(...args)=>calls.push(args),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.window={PK_PIXELFX:{}};
globalThis.document={createElement:()=>({getContext:()=>ctx}),getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};
await import('../src/game/pixelfx.js');
const state=await import('../src/game/state.js');
const char=await import('../src/game/character.js');
state.game.ctx=ctx;
for(const [id,n] of state.CLIPS){
 const custom={name:`ling_tieu_${id}`}; state.game.images[`ling_tieu_${id}`]=custom;state.game.images[id]={name:id};
 calls.length=0; assert.equal(char.drawAtlasFrame(id,n-1,.5,220,'ling_tieu'),true,id);
 assert.equal(calls[0][0],custom,id);assert.equal(calls[0][1],(n-1)*128,id);
}
for(const [id,clip] of Object.entries(state.LING_TIEU_SWORD_CLIPS)){
 const custom={name:`ling_tieu_${id}`};state.game.images[`ling_tieu_${id}`]=custom;
 calls.length=0;assert.equal(char.drawAtlasFrame(id,clip.frames-1,.5,220,'ling_tieu'),true,id);
 assert.equal(calls[0][0],custom,id);assert.equal(calls[0][1],(clip.frames-1)*128,id);
}
delete state.game.images.ling_tieu_idle;
assert.equal(char.drawAtlasFrame('idle',0,1,220,'ling_tieu'),false,'không dùng nhầm hình Diệp Tu khi thiếu sprite');
console.log('PASS vẽ 17 hành động chung, 4 động tác kiếm bằng sprite Lăng Tiêu và không lẫn Diệp Tu');
assert.equal(state.LING_TIEU_SHARED_OVERRIDES.jump_start.frames,8);
assert.equal(state.LING_TIEU_SHARED_OVERRIDES.jump_air.frames,8);
assert.equal(state.LING_TIEU_SHARED_OVERRIDES.land.frames,8);
assert.equal(state.LING_TIEU_SWORD_CLIPS.sword_attack.frames,16);
assert.equal(state.LING_TIEU_SWORD_CLIPS.sword_guard.frames,16);
assert.equal(state.LING_TIEU_SWORD_CLIPS.teleport.frames,16);
for(const [id,clip] of Object.entries(state.LING_TIEU_SHARED_OVERRIDES)){
 calls.length=0;assert.equal(char.drawAtlasFrame(id,7,.5,238,'ling_tieu'),true,id);
 assert.equal(calls[0][1],7*128,id);
}
state.motion.action=null; state.player.anim='jump_start';state.player.jumpTime=.08;state.player.vy=-200;
state.settings.character='diep_tu';let before=char.playerPose();assert.equal(before.id,'jump_start');assert.equal(before.f,2);assert.equal(before.anchor,221);
state.settings.character='ling_tieu';let after=char.playerPose();assert.equal(after.id,'jump_start');assert.ok(after.f>2);assert.equal(after.anchor,238);
state.motion.action={name:'land',time:.18,duration:.23};let landing=char.playerPose();assert.equal(landing.id,'land');assert.ok(landing.f>=6 && landing.f<8);
state.motion.action=null;
Object.assign(state.dummy,{skin:'ling_tieu',demoTimer:1,demoAction:'jump_start',demoElapsed:.6,broken:false,recoil:0,stun:0,trapped:false});
const npc=char.codeNpcPose();assert.equal(npc.name,'jump_start');assert.equal(npc.f,4);assert.equal(npc.anchor,238);
console.log('PASS nhảy, đáp đất 8 khung và 16 khung kiếm; giữ nguyên nhịp Diệp Tu');
const align=await import('../src/game/ling-tieu-alignment.js');
assert.equal(align.lingTieuOffset('idle',0),-4);assert.equal(align.lingTieuOffset('missing',0),0);
const names=['idle','down_idle','walk','run','hover','fall','jump_start','jump_air','land','sword_attack','sword_guard'];
for(const name of names){
 const count=state.LING_TIEU_SHARED_OVERRIDES[name]?.frames ?? state.LING_TIEU_SWORD_CLIPS[name]?.frames ?? state.clipMap[name].frames;
 assert.equal(align.LING_TIEU_X_OFFSETS[name].length,count,name);
 assert.match(align.lingTieuAlignmentCss(),new RegExp(`@keyframes ling-align-${name}\\{`));
}
state.game.images.ling_tieu_idle={name:'ling_tieu_idle'};
state.game.images.idle={name:'idle'};
calls.length=0;char.drawAtlasFrame('idle',0,.5,238,'ling_tieu');assert.equal(calls[0][5],-68);
calls.length=0;char.drawAtlasFrame('idle',0,.5,238,'diep_tu');assert.equal(calls[0][5],-64);
console.log('PASS điểm neo xem trước và khi vẽ: Lăng Tiêu dịch riêng, Diệp Tu không đổi');
