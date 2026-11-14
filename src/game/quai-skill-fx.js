// Bounded PixelFX: separate wind, lightning, venom, shadow, earth and five-element cast shapes.
const col=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const colors={
  wind:[col(30,91,90),col(73,200,171),col(206,255,226)],
  lightning:[col(32,67,160),col(78,158,255),col(236,249,255)],
  venom:[col(44,37,38),col(111,199,61),col(225,255,155)],
  firewind:[col(90,20,10),col(255,103,22),col(255,235,143)],
  waterlightning:[col(20,58,143),col(51,210,255),col(235,255,255)],
  venomwind:[col(25,71,28),col(124,226,54),col(229,255,155)],
  bloodfire:[col(91,10,31),col(224,42,22),col(255,213,117)],
  earthwind:[col(95,51,24),col(211,155,69),col(255,235,158)],
  lightningfire:[col(122,33,50),col(255,120,33),col(235,240,255)],
  venomwater:[col(19,90,70),col(58,220,129),col(188,255,234)],
  shadowlightning:[col(55,18,115),col(151,100,255),col(220,245,255)],
  shadowwater:[col(30,32,108),col(92,160,255),col(224,235,255)],
  lightningblood:[col(111,15,65),col(240,62,100),col(232,219,255)],
  earthblood:[col(90,34,26),col(200,85,52),col(255,216,128)],
  fiveblood:[col(115,15,58),col(250,95,67),col(255,241,178)],
  shadow:[col(30,10,50),col(145,70,215),col(235,200,255)],
  fivefire:[col(138,32,18),col(255,158,48),col(255,246,184)],
  fivewater:[col(22,82,118),col(78,228,225),col(235,255,248)],
  fiveearth:[col(102,68,26),col(226,182,78),col(255,246,196)],
  fivelightning:[col(68,36,142),col(168,142,255),col(255,245,190)],
  fivevenom:[col(32,90,46),col(122,232,105),col(244,255,186)],
  fivewind:[col(30,104,92),col(108,236,198),col(252,255,210)],
  earthfire:[col(116,36,16),col(236,122,42),col(255,224,142)],
  earthwater:[col(38,88,92),col(92,196,178),col(232,250,235)],
  earthvenom:[col(68,78,28),col(152,202,66),col(235,252,168)],
  earthshadow:[col(58,34,68),col(164,118,92),col(242,218,176)],
  shadowfire:[col(88,16,74),col(228,68,118),col(255,205,160)],
  shadowvenom:[col(48,22,78),col(124,218,86),col(222,255,192)],
  bloodwind:[col(92,16,44),col(218,74,112),col(255,212,216)],
  bloodvenom:[col(58,28,36),col(148,214,68),col(255,186,186)],
  swordfire:[col(142,24,18),col(255,112,38),col(255,244,180)],
  swordlightning:[col(24,48,148),col(92,206,255),col(242,250,255)],
  swordearth:[col(98,62,24),col(228,176,78),col(255,245,188)],
  swordwater:[col(16,86,128),col(96,232,255),col(238,255,255)],
  swordvenom:[col(22,82,42),col(112,238,92),col(228,255,176)],
  swordshadow:[col(44,18,98),col(154,96,255),col(236,220,255)],
  swordblood:[col(108,10,32),col(245,56,92),col(255,222,226)],
  swordfive:[col(42,32,102),col(255,214,98),col(248,252,255)],
};
export const BEAST_ATTACK_FX={meta:{name:'beast-attack',duration:.68,loop:false,options:{seed:1,style:'wind',phase:'cast'}},draw(p,t,o){
 const u=Math.min(1,t/.68),f=(1-u)**1.2,c=colors[o.style]||colors.wind;
 p.glow(0,0,28+14*u,c[1],.3*f);p.ring(0,0,8+33*u,2,c[1],.8*f);
 if(['wind','firewind','venomwind','earthwind','fivewind'].includes(o.style)){
  for(let i=0;i<4;i++)p.arc(0,0,12+i*8+u*19,2,i*1.4+t*5,i*1.4+t*5+1.55,c[i%2?1:2],.85*f);
  for(let i=0;i<5;i++){const y=(i-2)*12;p.line(-35-u*20,y,26+u*25,y-8,c[2],.75*f);}
 }else if(['lightning','waterlightning','lightningfire','lightningblood','shadowlightning','fivelightning'].includes(o.style)){
  for(let i=0;i<8;i++){const a=i*Math.PI/4+t*2,r=18+u*27,x=Math.cos(a)*r,y=Math.sin(a)*r;p.line(0,0,x*.48+7,y*.48-5,c[2],.8*f);p.line(x*.48+7,y*.48-5,x,y,c[1],.9*f);}
 }else if(['venom','venomwater','fivevenom','earthvenom','shadowvenom'].includes(o.style)){
  for(let i=0;i<3;i++){const y=(i-1)*13;p.tri(-20,y-4,28+u*30,y,-20,y+4,c[1],.8*f);p.line(-20,y,28+u*30,y,c[2],.9*f);}
  for(let i=0;i<7;i++){const a=i*2.4,r=12+u*(25+i*3);p.disc(Math.cos(a)*r,Math.sin(a)*r,2+i%3,c[1],.8*f);}
 }else if(['fiveblood','fivefire','fivewater','fiveearth'].includes(o.style)){
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*3,b=(i+2)*Math.PI*2/5+t*3,r=16+u*26;p.line(Math.cos(a)*r,Math.sin(a)*r,Math.cos(b)*r,Math.sin(b)*r,c[2],.85*f);p.disc(Math.cos(a)*r,Math.sin(a)*r,3,c[1],.9*f);}
 }else if(String(o.style||'').startsWith('sword')){
  for(let i=0;i<4;i++){const a=i*Math.PI/2+t*4,r=22+u*28,bx=Math.cos(a)*8,by=Math.sin(a)*8,tx=Math.cos(a)*r,ty=Math.sin(a)*r,nx=-Math.sin(a)*4,ny=Math.cos(a)*4;p.tri(bx+nx,by+ny,tx,ty,bx-nx,by-ny,c[1],.9*f);p.line(bx,by,tx,ty,c[2],f);}
  p.ring(0,0,16+u*20,2,c[2],.85*f);
 }else{
  for(let i=0;i<6;i++){const a=i*Math.PI/3+t*5,r=20+u*28;p.line(Math.cos(a)*8,Math.sin(a)*8,Math.cos(a+.3)*r,Math.sin(a+.3)*r,c[2],.8*f);}
  p.ring(0,0,18+u*22,2,c[0],.8*f);
 }
 p.disc(0,0,4+8*(1-u),c[2],.9*f);
}};
