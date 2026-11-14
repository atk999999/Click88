// PixelFX electricity for the eagle: bounded per-projectile, no particle system.
const rgb=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const BLUE=rgb(70,132,255),CYAN=rgb(138,225,255),WHITE=rgb(244,255,255),GOLD=rgb(255,231,140);
export const THUNDER_ORB_FX={
 meta:{name:'loi-ung-loi-cau',duration:3.2,loop:false,options:{seed:1}},
 draw(p,t){
  const fade=Math.min(1,t/.09)*Math.min(1,(3.2-t)/.2),phase=t*11;
  p.glow(0,0,32,BLUE,.4*fade);p.disc(0,0,18,BLUE,.8*fade);p.disc(0,0,13,CYAN,.9*fade);p.disc(0,0,7,WHITE,.98*fade);
  p.ring(0,0,24,2,CYAN,.8*fade);p.ring(0,0,31,1,GOLD,.5*fade);p.arc(0,0,34,2,phase,phase+1.8,WHITE,.7*fade);p.arc(0,0,28,2,-phase,-phase+1.4,CYAN,.7*fade);
  for(let i=0;i<8;i++){const a=i*Math.PI/4+phase, b=a+.15, c=a-.12;const x=Math.cos(a)*18,y=Math.sin(a)*18,x2=Math.cos(b)*29,y2=Math.sin(b)*29,x3=Math.cos(c)*(37+i%3*4),y3=Math.sin(c)*(37+i%3*4);p.line(x,y,x2,y2,WHITE,.95*fade);p.line(x2,y2,x3,y3,i%3?CYAN:GOLD,.9*fade);}
 }
};
export const THUNDER_WINDUP_FX={
 meta:{name:'loi-ung-tich-dien',duration:.65,loop:false,options:{seed:1}},
 draw(p,t){const u=Math.min(1,t/.65),f=Math.sin(Math.PI*u);p.glow(0,0,17+8*u,BLUE,.28*f);p.ring(0,0,10+14*u,2,CYAN,.8*f);for(let i=0;i<6;i++){const a=i*Math.PI/3+t*7,r=20+6*u;p.line(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a+.16)*8,Math.sin(a+.16)*8,WHITE,.8*f);}p.disc(0,0,3+4*u,WHITE,.9*f);}
};
