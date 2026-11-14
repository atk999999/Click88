// Shared action names match Diệp Tu; the four skill timelines are preview-only.
export const TANG_MA_ACTIONS=Object.freeze({
 idle:{label:'Đứng yên',duration:1.6,loop:true},walk:{label:'Đi bộ',duration:.8,loop:true},run:{label:'Chạy',duration:.56,loop:true},
 jump_start:{label:'Bật nhảy',duration:.8,loop:true},jump_air:{label:'Nhảy trên không',duration:1,loop:true},fall:{label:'Rơi',duration:1,loop:true},land:{label:'Tiếp đất',duration:.8,loop:true},
 fly_up:{label:'Bay lên',duration:1,loop:true},hover:{label:'Lơ lửng',duration:1.5,loop:true},hand_seal:{label:'Kết ấn',duration:1,loop:true},
 hurt:{label:'Trúng đòn',duration:.75,loop:true},stun:{label:'Khống chế',duration:1,loop:true},knockdown:{label:'Đánh ngã',duration:1.1,loop:true},down_idle:{label:'Nằm',duration:1,loop:true},getup:{label:'Đứng dậy',duration:1.2,loop:true},death:{label:'Tử vong',duration:2.6,loop:false},
 charge_raise:{label:'Giơ tay tụ lực',duration:1.2,loop:true},charge_hold:{label:'Giữ tụ lực',duration:1.2,loop:true},cast_fire:{label:'Thi pháp',duration:1,loop:true},teleport:{label:'Dịch ảnh',duration:1.2,loop:true},
 skill1:{label:'1 · Hoang Diệm Truy Sát',duration:3.5,loop:false},skill2:{label:'2 · Cuồng Bạo',duration:4,loop:false},skill3:{label:'3 · Phệ Thần',duration:6.7,loop:false},skill4:{label:'4 · Dịch Ảnh Liên Kích',duration:7.1,loop:false},
});
export const TANG_MA_COMBO_TIMES=Object.freeze([0,.31,.61,.91,1.21,1.51,1.81,2.11,2.41,2.71,3.01,3.31,3.61,4.00,4.43,4.88]);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t);return 1-(1-t)**3;};
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const indexAt=(t,n,d)=>Math.min(n-1,Math.floor(clamp(t/d)*n));
const frame=(sheet,row,index)=>({sheet,row,index});
// Coordinates are normalized to a 960 × 540 view; feet are y=430.
export function tangMaPose(action,elapsed,opts={}){
 const spec=TANG_MA_ACTIONS[action]||TANG_MA_ACTIONS.idle,t=Math.max(0,Number(elapsed)||0),loopT=spec.loop?t%spec.duration:Math.min(t,spec.duration);
 const pose={...frame('base',0,Math.floor(loopT*2.5)%4),bossX:260,bossY:430,bossScale:1,targetX:715,targetY:430,targetRotation:0,bossOpacity:1,bossFacing:1,targetOpacity:1,cameraX:0,phase:spec.label,events:[],hitCount:0,finished:!spec.loop&&t>=spec.duration};
 const f=(r,i,s='base')=>Object.assign(pose,frame(s,r,i));
 if(action==='walk'||action==='run'){f(1,Math.floor(loopT*(action==='run'?7.1:5))%4);pose.bossX=260+Math.sin(loopT/spec.duration*Math.PI*2)*12;}
 if(action==='jump_start'||action==='jump_air'||action==='fly_up'||action==='hover'){f(2,Math.floor(loopT*4)%4);pose.bossY=430-(action==='jump_start'?Math.sin(Math.PI*loopT/spec.duration)*42:action==='fly_up'?40+ease(loopT/spec.duration)*65:72+Math.sin(loopT*5)*7);}
 if(action==='fall'){f(3,2);pose.bossY=365+ease(loopT/spec.duration)*65;}
 if(action==='land'){f(1,3);pose.bossY=430;}
 if(action==='hand_seal'||action==='charge_raise'||action==='charge_hold'||action==='cast_fire'){f(1,action==='charge_hold'?2:indexAt(loopT,4,spec.duration),'skills');}
 if(action==='hurt'||action==='stun'){f(3,Math.floor(loopT*6)%2);pose.bossX+=Math.sin(loopT*35)*(action==='stun'?4:2);}
 if(action==='knockdown'){f(3,loopT<.3?0:loopT<.6?2:3);}
 if(action==='down_idle'){f(3,3);}
 if(action==='getup'){f(3,loopT<.25?3:loopT<.55?2:loopT<.85?1:0);}
 if(action==='death'){f(3,t<.35?0:t<.85?2:3);pose.bossOpacity=t<1.9?1:Math.max(0,1-(t-1.9)/.7);pose.events=[{time:0,kind:'hurt'},{time:.8,kind:'dust'}];}
 if(action==='teleport'){f(1,0,'skills');pose.bossOpacity=loopT<.25?1:loopT<.53?1-(loopT-.25)/.28:loopT<.67?0:Math.min(1,(loopT-.67)/.2);pose.bossX=loopT<.55?260:370;pose.events=[{time:.25,kind:'blink'},{time:.67,kind:'blink'}];}
 if(action==='skill1'){
  f(0,t<.9?0:t<1.43?1:t<1.85?2:3,'skills');pose.phase=t<.9?'Tụ lực · khóa mục tiêu':t<1.43?'Lao tới · miễn khống chế':t<2.15?'Quyền nổ Hoang Hỏa':'Dư hỏa tan dần';
  if(t>=.9)pose.bossX=260+300*smooth((t-.9)/.53);if(t>=1.43)pose.targetX=715+70*ease((t-1.43)/.4);
  pose.events=[{time:.08,kind:'gold_charge'},{time:.9,kind:'gold_dash'},{time:1.43,kind:'gold_blast'}];
 }
 if(action==='skill2'){
  f(1,t<.45?0:t<.95?1:t<2.0?2:3,'skills');pose.phase=t<1.2?'Gồng mình · bộc phát huyết khí':'Cuồng Bạo · thân hình lớn gấp đôi';pose.bossScale=1+smooth((t-.5)/1.2);pose.events=[{time:.2,kind:'rage'},{time:1.25,kind:'rage_blast'}];
 }
 if(action==='skill3'){
  f(2,t<.8?0:t<2.7?1:t<3.25?2:3,'skills');pose.phase=t<.8?'Há miệng · tụ hố đen':t<2.7?'Kéo mục tiêu về phía boss':t<3.25?'Bóp chặt mục tiêu':t<4.25?'Bay lên, giữ mục tiêu':t<5?'Ném xuống mặt đất':'Bùng nổ · hồi phục';
  if(t>=.8&&t<2.7)pose.targetX=715-310*smooth((t-.8)/1.9);
  if(t>=2.7&&t<4.25){pose.targetX=405;pose.targetY=430-70*smooth((t-2.7)/.3);if(t>=3.25){pose.bossY=430-145*ease((t-3.25)/1);pose.targetY=pose.bossY-70;}}
  if(t>=4.25&&t<5){const u=clamp((t-4.25)/.75);pose.bossY=285+145*u;pose.targetX=405+210*u;pose.targetY=215+215*u*u;pose.targetRotation=u*8;}
  if(t>=5){pose.bossY=430;pose.targetX=615;pose.targetY=430;pose.targetRotation=Math.PI/2;if(t>=6.2)f(0,0);}
  pose.events=[{time:.08,kind:'void'},{time:2.7,kind:'grab'},{time:3.25,kind:'fly'},{time:5,kind:'slam'}];
 }
 if(action==='skill4'){
  const speed=opts.berserk?2:1,comboT=Math.max(0,(t-.52)*speed),times=TANG_MA_COMBO_TIMES;
  pose.bossScale=opts.berserk?2:1;
  if(t<.52){f(3,0,'skills');pose.bossX=260+310*smooth(t/.52);pose.phase='Áp sát · có thể né đòn đầu';}
  else {
   let hit=0;for(let i=0;i<times.length;i++)if(comboT>=times[i])hit=i+1;
   pose.hitCount=hit;const idx=Math.max(0,hit-1),next=times[idx+1]??(times[idx]+.6),u=clamp((comboT-times[idx])/(next-times[idx]));
   const worldTarget=715+idx*110+110*ease(u/.72);pose.cameraX=Math.max(0,worldTarget-715-65*u);pose.targetX=worldTarget;
   pose.targetY=430-(idx===15?0:40+25*Math.sin(Math.PI*u));pose.targetRotation=idx===15?Math.PI/2:Math.sin(u*Math.PI)*.55;
   pose.bossX=worldTarget+(u>=.58?115:-115);pose.bossFacing=u>=.58?-1:1;pose.bossOpacity=u>.34&&u<.58?0:1;
   f(3,idx===13?2:idx===14?3:idx===15?1:idx%2,'skills');if(t>=6.2/speed+.52)f(0,0);pose.phase=idx===15?'16 / QUYỀN KẾT LIỄU':`${String(hit).padStart(2,'0')} / 16 · Hất văng → dịch ảnh`;
   pose.events=times.map((x,i)=>({time:.52+x/speed,kind:i===15?'combo_finish':'combo_hit',index:i}));
  }
 }
 return pose;
}
