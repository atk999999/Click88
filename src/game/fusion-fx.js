import {drawFusionImpactCrown} from './fusion-detail-fx.js';
// Bounded PixelFX burst renderer with elemental impact morphologies.
const rgb=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
export const FUSION_PALETTES={
 firewind:[rgb(130,28,9),rgb(255,110,24),rgb(255,240,160)],
 waterlightning:[rgb(20,70,180),rgb(60,220,255),rgb(245,255,255)],
 venomwind:[rgb(25,75,28),rgb(126,230,55),rgb(224,255,155)],
 bloodfire:[rgb(100,8,25),rgb(245,55,25),rgb(255,223,130)],
 earthwind:[rgb(95,51,24),rgb(211,155,69),rgb(255,235,158)],
 lightningfire:[rgb(122,33,50),rgb(255,120,33),rgb(235,240,255)],
 venomwater:[rgb(19,90,70),rgb(58,220,129),rgb(188,255,234)],
 shadowlightning:[rgb(55,18,115),rgb(151,100,255),rgb(220,245,255)],
 shadowwater:[rgb(30,32,108),rgb(92,160,255),rgb(224,235,255)],
 lightningblood:[rgb(111,15,65),rgb(240,62,100),rgb(232,219,255)],
 earthblood:[rgb(90,34,26),rgb(200,85,52),rgb(255,216,128)],
 fiveblood:[rgb(115,15,58),rgb(250,95,67),rgb(255,241,178)],
 fivefire:[rgb(138,32,18),rgb(255,158,48),rgb(255,246,184)],
 fivewater:[rgb(22,82,118),rgb(78,228,225),rgb(235,255,248)],
 fiveearth:[rgb(102,68,26),rgb(226,182,78),colOr(255,246,196)],
 fivelightning:[rgb(68,36,142),rgb(168,142,255),rgb(255,245,190)],
 fivevenom:[rgb(32,90,46),rgb(122,232,105),rgb(244,255,186)],
 fivewind:[rgb(30,104,92),rgb(108,236,198),rgb(252,255,210)],
 earthfire:[rgb(116,36,16),rgb(236,122,42),rgb(255,224,142)],
 earthwater:[rgb(38,88,92),rgb(92,196,178),rgb(232,250,235)],
 earthvenom:[rgb(68,78,28),rgb(152,202,66),rgb(235,252,168)],
 earthshadow:[rgb(58,34,68),rgb(164,118,92),rgb(242,218,176)],
 shadowfire:[rgb(88,16,74),rgb(228,68,118),rgb(255,205,160)],
 shadowvenom:[rgb(48,22,78),rgb(124,218,86),rgb(222,255,192)],
 bloodwind:[rgb(92,16,44),rgb(218,74,112),rgb(255,212,216)],
 bloodvenom:[rgb(58,28,36),rgb(148,214,68),rgb(255,186,186)],
 swordfire:[rgb(142,24,18),rgb(255,112,38),rgb(255,244,180)],
 swordlightning:[rgb(24,48,148),rgb(92,206,255),rgb(242,250,255)],
 swordearth:[rgb(98,62,24),rgb(228,176,78),rgb(255,245,188)],
 swordwater:[rgb(16,86,128),rgb(96,232,255),rgb(238,255,255)],
 swordvenom:[rgb(22,82,42),rgb(112,238,92),rgb(228,255,176)],
 swordshadow:[rgb(44,18,98),rgb(154,96,255),rgb(236,220,255)],
 swordblood:[rgb(108,10,32),rgb(245,56,92),rgb(255,222,226)],
 swordfive:[rgb(42,32,102),rgb(255,214,98),rgb(248,252,255)],
};
function colOr(r,g,b){return rgb(r,g,b);}
const FIVE_NODES=[rgb(255,95,55),rgb(255,218,91),rgb(98,218,255),rgb(170,255,125),rgb(222,166,255)];
function drawMiniJian(p,x,y,a,L,c,alpha){
 const dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx,w=Math.max(1.5,L*.07);
 const at=(u,v=0)=>[x+dx*L*u+nx*v,y+dy*L*u+ny*v];
 const l=at(-.18,-w),r=at(-.18,w),tip=at(.62),h=at(-.42),g1=at(-.21,-w*1.6),g2=at(-.21,w*1.6);
 p.tri(l[0],l[1],r[0],r[1],tip[0],tip[1],c[1],alpha);
 p.line(l[0],l[1],tip[0],tip[1],c[2],alpha);p.line(r[0],r[1],tip[0],tip[1],c[0],alpha);
 p.line(g1[0],g1[1],g2[0],g2[1],rgb(239,202,126),alpha);p.line(h[0],h[1],x-dx*L*.18,y-dy*L*.18,c[2],alpha);
}
function defaultBlast(o){
 if(o.blast)return o.blast;
 if(o.style==='swordfive')return 'sword_imperial';
 if(String(o.style||'').startsWith('sword'))return 'sword_cross';
 if(String(o.style||'').startsWith('five'))return 'five_prism';
 if(o.wind||['firewind','venomwind','earthwind'].includes(o.style))return 'vortex';
 if(o.poison||['venomwater','earthvenom','shadowvenom'].includes(o.style))return 'toxic_bloom';
 if(['waterlightning','shadowwater','earthwater'].includes(o.style))return 'sword_rain';
 if(['lightningfire','shadowlightning','lightningblood'].includes(o.style))return 'thunder_pillar';
 if(['earthblood','earthfire','earthshadow'].includes(o.style))return 'earth_quake';
 if(['bloodfire','shadowfire'].includes(o.style))return 'crimson_cross';
 return 'nova';
}
export const FUSION_BLAST_FX={meta:{name:'fusion-area-blast',duration:.9,loop:false,options:{style:'firewind',blast:''}},draw(p,t,o){
 const u=Math.max(0,Math.min(1,t/.9)),f=(1-u)**1.1,r=20+80*(1-(1-u)**2),c=FUSION_PALETTES[o.style]||FUSION_PALETTES.firewind,kind=defaultBlast(o);
 const isFire=!!o.burn||['firewind','bloodfire','lightningfire','fivefire','earthfire','shadowfire','swordfire'].includes(o.style);
 const isVenom=!!o.poison||['venomwind','venomwater','fivevenom','earthvenom','shadowvenom','swordvenom'].includes(o.style);
 const isThunder=!!o.thunder||['waterlightning','lightningfire','shadowlightning','lightningblood','fivelightning','swordlightning'].includes(o.style);
 drawFusionImpactCrown(p,t,o,c,f);
 p.glow(0,0,r*.98,c[1],.5*f);p.disc(0,0,r*.54,c[0],.74*f);p.ring(0,0,r,5,c[1],.95*f);p.ring(0,0,r*.72,3,c[2],.86*f);
 if(kind==='sword_cross'){
  const R=r*1.08;
  for(const s of [-1,1]){p.glowLine(-R,-s*R*.7,R,s*R*.7,5,c[1],.7*f);p.line(-R,-s*R*.7,R,s*R*.7,c[2],f);}
  for(let i=0;i<4;i++){const a=i*Math.PI/2+u*.65;drawMiniJian(p,Math.cos(a)*r*.52,Math.sin(a)*r*.52,a,36,.95*f?c:c,.92*f);}
 }else if(kind==='sword_storm'){
  for(let i=0;i<8;i++){const a=i*Math.PI/4+t*2.4,dist=r*(.32+(i%2)*.42);drawMiniJian(p,Math.cos(a)*dist,Math.sin(a)*dist-10*(1-u),Math.PI/2+(i%2-.5)*.35,34,c,.94*f);}
  p.arc(0,0,r*.64,4,t*6,t*6+2.6,c[2],.92*f);p.arc(0,0,r*.88,3,-t*5,-t*5+2.4,c[1],.86*f);
 }else if(kind==='sword_imperial'){
  for(let i=0;i<5;i++){
   const a=i*Math.PI*2/5+t*.9,b=(i+2)*Math.PI*2/5+t*.9,col=FIVE_NODES[i];
   p.glowLine(Math.cos(a)*r*.9,Math.sin(a)*r*.9,Math.cos(b)*r*.9,Math.sin(b)*r*.9,3,col,.82*f);
   drawMiniJian(p,Math.cos(a)*r*.55,Math.sin(a)*r*.55,a,38,c,.95*f);
  }
  p.beam(0,-105,0,34,12*(1-u*.35),c[1],.85*f);p.line(0,-105,0,34,c[2],f);
 }else if(kind==='five_prism'){
  for(let i=0;i<5;i++){
   const a=i*Math.PI*2/5+t*.9,b=(i+2)*Math.PI*2/5+t*.9,ax=Math.cos(a)*r*.9,ay=Math.sin(a)*r*.9,bx=Math.cos(b)*r*.9,by=Math.sin(b)*r*.9,col=FIVE_NODES[i];
   p.glowLine(ax,ay,bx,by,3,col,.8*f);p.line(ax,ay,bx,by,c[2],.92*f);p.disc(ax,ay,5+3*(1-u),col,.95*f);
   p.tri(Math.cos(a)*r*.28,Math.sin(a)*r*.28,Math.cos(a)*r*1.06,Math.sin(a)*r*1.06,Math.cos(a+.22)*r*.4,Math.sin(a+.22)*r*.4,col,.82*f);
  }
 }else if(kind==='thunder_pillar'){
  const pw=14*(1-u*.4);p.beam(0,-116,0,34,pw*1.8,c[0],.65*f);p.beam(0,-116,0,34,pw,c[1],.9*f);p.beam(0,-116,0,34,pw*.4,c[2],f);
  for(let i=0;i<8;i++){const a=i*Math.PI/4+t*1.2,mx=Math.cos(a)*r*.48+Math.sin(i*3+t*18)*8,my=Math.sin(a)*r*.48;p.line(0,0,mx,my,c[2],f);p.line(mx,my,Math.cos(a)*r,Math.sin(a)*r,c[1],.9*f);}
 }else if(kind==='sword_rain'){
  for(let i=0;i<6;i++){
   const sx=(i-2.5)*r*.28,sy=-62+u*72+(i%2)*14,tx=sx-12,ty=sy+34;
   p.tri(sx-4,sy,tx,ty,sx+4,sy,c[1],.92*f);p.line(sx,sy-8,tx,ty,c[2],f);p.line(sx-7,sy+3,sx+7,sy+3,c[2],.85*f);
  }
  p.arc(0,0,r*.58,4,t*4,t*4+2.5,c[2],.9*f);p.arc(0,0,r*.84,3,Math.PI+t*4,Math.PI+t*4+2.3,c[1],.85*f);
 }else if(kind==='vortex'){
  for(let i=0;i<4;i++)p.arc(0,0,r*(.32+i*.18),3,t*8+i*1.6,t*8+i*1.6+1.8,i%2?c[1]:c[2],.92*f);
  for(let i=0;i<8;i++){const a=i*Math.PI/4+t*5,rx=Math.cos(a)*r*.85,ry=Math.sin(a)*r*.85;p.tri(rx*.4,ry*.4,rx,ry,Math.cos(a+.32)*r*.62,Math.sin(a+.32)*r*.62,c[1],.86*f);}
 }else if(kind==='toxic_bloom'){
  for(let i=0;i<10;i++){const a=i*Math.PI/5+t*.4,dist=r*(.45+(i%2)*.42);p.tri(Math.cos(a-.14)*r*.22,Math.sin(a-.14)*r*.22,Math.cos(a)*dist*1.08,Math.sin(a)*dist*1.08,Math.cos(a+.14)*r*.22,Math.sin(a+.14)*r*.22,c[1],.88*f);p.disc(Math.cos(a)*r*.75,Math.sin(a)*r*.75,4+i%4,rgb(142,250,84),.85*f);}
 }else if(kind==='earth_quake'){
  for(let i=0;i<5;i++){const sx=(i-2)*r*.34,h=r*(.55+(i%2)*.28);p.poly([[sx-8,18],[sx-4,-h],[sx+4,-h],[sx+9,18]],i%2?c[1]:c[0],.9*f);p.line(sx-3,-h,sx+3,-h,c[2],.9*f);}
  p.ellipse(0,14,r*.95,r*.24,c[1],.75*f);
 }else if(kind==='crimson_cross'){
  const len=r*1.05;
  p.tri(-len,-len,0,-12,len,len,c[1],.92*f);p.tri(-len,len,0,12,len,-len,c[1],.92*f);
  p.line(-len,-len,len,len,c[2],f);p.line(-len,len,len,-len,c[2],f);
  for(let i=0;i<6;i++){const a=i*Math.PI/3+t*2;p.disc(Math.cos(a)*r*.8,Math.sin(a)*r*.8,3+i%2,c[1],.9*f);}
 }else{
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6+t*.65,x=Math.cos(a),y=Math.sin(a),tx=-y,ty=x,inner=r*(.24+(i%2)*.09),outer=r*(.78+(i%3)*.12),w=r*(.07+(i%2)*.025),col=c[i%3===0?2:1];
   p.tri(x*inner+tx*w,y*inner+ty*w,x*outer,y*outer,x*inner-tx*w,y*inner-ty*w,col,.87*f);p.disc(x*r*.94,y*r*.94,2+i%3,col,.85*f);
  }
 }
 if(isFire)for(let i=0;i<6;i++){const a=i*Math.PI/3+t,tx=-Math.sin(a),ty=Math.cos(a);p.tri(Math.cos(a)*r*.5+tx*6,Math.sin(a)*r*.5+ty*6,Math.cos(a)*r*1.06,Math.sin(a)*r*1.06,Math.cos(a)*r*.5-tx*6,Math.sin(a)*r*.5-ty*6,c[2],.65*f);}
 if(isVenom)for(let i=0;i<6;i++){const a=i*Math.PI/3-t*1.5;p.disc(Math.cos(a)*r*.68,Math.sin(a)*r*.68,3+i%2,rgb(129,245,76),.78*f);}
 if(isThunder)for(let i=0;i<4;i++){const a=i*Math.PI/2+t*2;p.line(Math.cos(a)*r*.25,Math.sin(a)*r*.25,Math.cos(a+.25)*r*.92,Math.sin(a+.25)*r*.92,c[2],.9*f);}
 p.disc(0,0,r*.22,c[1],.95*f);p.disc(0,0,r*.11,c[2],f);
}};
