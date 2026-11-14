// PixelFX Painter effects for the Táng Ma animation preview, based on the supplied skill demonstrations.
const rgb=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const VOID_BLACK=rgb(9,5,22);
const GOLD=rgb(255,196,54),SUN=rgb(255,235,143),WHITE=rgb(255,250,231),RED=rgb(236,53,67),DARK=rgb(91,17,36),PURPLE=rgb(149,70,244),SMOKE=rgb(111,96,106);
const cap=v=>Math.max(0,Math.min(1,v));const ease=v=>1-(1-cap(v))**3;const noise=i=>{let x=Math.sin(i*127.1+17.33)*43758.545;return x-Math.floor(x)};
const effect=(name,duration,draw)=>({meta:{name,duration,loop:false,options:{seed:1}},draw});
export const TANG_MA_FX={
 gold_charge:effect('tang-ma-charge',.95,(p,t)=>{const u=cap(t/.9);p.glow(0,0,18+14*u,GOLD,.4);for(let i=0;i<7;i++){const a=i*.9+t*5,r=15+8*u;p.arc(0,0,r,2,a,a+.7,i%2?SUN:GOLD,.8);}p.disc(0,0,4+5*u,WHITE,.95);}),
 gold_dash:effect('tang-ma-dash',.65,(p,t)=>{const k=1-cap(t/.65);p.glow(-12,0,30,GOLD,.3*k);for(let i=0;i<9;i++){const y=(i-4)*7;p.beam(-95-i%3*12,y,-5,y-4,2+i%2*2,i%3?GOLD:SUN,.6*k);}}),
 gold_blast:effect('tang-ma-blast',1.15,(p,t)=>{const u=cap(t/1.15),k=1-u;p.glow(0,0,70*ease(u/.2),GOLD,.65*k);if(t<.2)p.disc(0,0,15+35*ease(t/.2),WHITE,.8*(1-t/.2));p.ring(0,0,12+110*ease(u),2+3*k,SUN,.9*k);for(let i=0;i<18;i++){const a=i*2.4,r=(15+150*u)*(.6+noise(i)*.4);p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-25*k),Math.sin(a)*(r-25*k),1+3*k,i%3?GOLD:WHITE,.8*k);}}),
 rage:effect('tang-ma-rage',2.2,(p,t)=>{const k=1-cap(t/2.2);p.glow(0,-35,65,RED,.3*k);for(let i=0;i<14;i++){const u=(t*.6+noise(i))%1,side=i%2?1:-1,x=side*(20+noise(i+9)*35),y=-u*115;p.beam(x,y+16,x-side*5,y-22,2+4*(1-u),i%3?RED:DARK,(1-u)*k*.75);}p.ring(0,0,16+70*ease(t/.8),2+3*k,RED,.65*k);}),
 rage_blast:effect('tang-ma-rage-burst',.8,(p,t)=>{const u=cap(t/.8),k=1-u;p.glow(0,-20,75,RED,.45*k);p.ring(0,-10,10+95*ease(u),2+4*k,RED,.9*k);for(let i=0;i<14;i++){let a=i*2.4,r=15+100*u;p.beam(Math.cos(a)*r,Math.sin(a)*r-20,Math.cos(a)*(r-24*k),Math.sin(a)*(r-24*k)-20,2+2*k,i%3?RED:WHITE,.8*k);}}),
 void:effect('tang-ma-void',2.7,(p,t)=>{const pulse=.5+.5*Math.sin(t*9);p.glow(0,0,42,PURPLE,.35);p.disc(0,0,17,VOID_BLACK,1);for(let i=0;i<4;i++){const a=t*4+i*Math.PI/2;p.arc(0,0,20+i*3,2,a,a+1.5,i%2?PURPLE:WHITE,.65);}for(let i=0;i<8;i++){let a=i*.78+t*3,r=24+(i%3)*9;p.line(Math.cos(a)*r,Math.sin(a)*r*.6,Math.cos(a)*(r+18),Math.sin(a)*(r+18)*.6,PURPLE,.7);}for(let i=0;i<7;i++){const a=i*.9+t*2,r=35+((i*23+t*90)%105);p.beam(Math.cos(a)*r,Math.sin(a)*r*.5,Math.cos(a)*(r-18),Math.sin(a)*(r-18)*.5,1,PURPLE,.55);}p.disc(0,0,8+2*pulse,VOID_BLACK,1);}),
 grab:effect('tang-ma-grab',.65,(p,t)=>{const u=cap(t/.65),k=1-u;p.glow(0,0,35,RED,.4*k);p.ring(0,0,12+38*ease(u),3,RED,.8*k);for(let i=0;i<6;i++){const a=i*Math.PI/3;p.line(Math.cos(a)*35,Math.sin(a)*35,Math.cos(a)*14,Math.sin(a)*14,WHITE,.7*k);}}),
 fly:effect('tang-ma-rise',.8,(p,t)=>{const k=1-cap(t/.8);p.glow(0,0,42,PURPLE,.25*k);for(let i=0;i<9;i++){let x=(i-4)*8;p.beam(x,6,x-3,45*ease(t/.8),2,PURPLE,.65*k);}p.ring(0,0,10+35*ease(t/.8),2,WHITE,.6*k);}),
 slam:effect('tang-ma-ground-slam',1.4,(p,t)=>{const u=cap(t/1.4),k=1-u;p.glow(0,0,95,GOLD,.55*k);p.ring(0,0,15+160*ease(u),2+4*k,SUN,.85*k);p.ellipse(0,0,30+155*ease(u),9+28*ease(u),SMOKE,.25*k);for(let i=0;i<20;i++){let a=i*2.4,r=(20+160*u)*(.6+noise(i)*.5);p.beam(Math.cos(a)*r,Math.sin(a)*r*.55,Math.cos(a)*(r-20*k),Math.sin(a)*(r-20*k)*.55,1+3*k,i%3?GOLD:WHITE,.8*k);}}),
 combo_hit:effect('tang-ma-combo',.35,(p,t)=>{const u=cap(t/.35),k=1-u;p.glow(0,0,35,GOLD,.45*k);p.ring(0,0,6+55*ease(u),2+3*k,SUN,.9*k);for(let i=0;i<9;i++){const a=i*2.4,r=15+80*u;p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-20*k),Math.sin(a)*(r-20*k),1+2*k,i%3?GOLD:WHITE,.75*k);}}),
 blink:effect('tang-ma-blink',.36,(p,t)=>{const u=cap(t/.36),k=1-u;p.glow(0,0,44,PURPLE,.45*k);p.ring(0,0,8+50*ease(u),2+2*k,WHITE,.75*k);for(let i=0;i<7;i++){const x=(i-3)*8;p.beam(x,-55+70*u,x+5,40,2,PURPLE,.6*k);}}),
 hurt:effect('tang-ma-hit',.42,(p,t)=>{const u=cap(t/.42);p.ring(0,0,5+35*u,2,RED,.8*(1-u));}),
 dust:effect('tang-ma-dust',.7,(p,t)=>{const u=cap(t/.7);p.ellipse(0,0,14+70*u,4+12*u,SMOKE,.45*(1-u));}),
};
TANG_MA_FX.combo_finish=TANG_MA_FX.slam;
