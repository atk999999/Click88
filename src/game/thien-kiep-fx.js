// PixelFX: a descending sword-shaped bolt of heavenly lightning.
const col=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const DEEP=col(42,42,124),BLUE=col(86,125,255),CYAN=col(151,222,255),WHITE=col(246,253,255),GOLD=col(255,226,151);
export const THIEN_KIEP_BOLT={
 meta:{name:'thien-kiep-kiem-loi',duration:.62,loop:false,options:{seed:1}},
 draw(p,t,o){
  const fade=Math.min(1,t/.035)*Math.max(0,1-t/.62),j=Math.sin(t*44)*4,power=Math.min(6,Math.max(1,o.index||1));
  p.tri(-56,-410,56,-410,0,10,DEEP,.72*fade);p.tri(-38,-410,38,-410,0,8,BLUE,.88*fade);
  p.tri(-18,-405,18,-405,0,4,CYAN,.95*fade);p.line(0,-403,0,0,WHITE,.95*fade);
  p.line(-68,-410,68,-410,GOLD,.95*fade);p.line(-59,-416,59,-416,CYAN,.95*fade);p.line(0,-413,0,-468,WHITE,.92*fade);
  for(let side=-1;side<=1;side+=2){let x=side*30,y=-365;for(let i=0;i<7;i++){const nx=side*(40+(i%2)*32)+j,ny=y+48;p.line(x,y,nx,ny,i%2?CYAN:WHITE,.9*fade);x=nx;y=ny;}}
  for(let i=0;i<8;i++){const side=i%2?1:-1,y=-350+i*39,x=side*(20+(i%3)*7),ex=side*(54+(i%3)*9);p.line(x,y,ex,y+15,i%2?CYAN:WHITE,.85*fade);p.line(ex,y+15,side*(74+(i%2)*6),y+35,GOLD,.7*fade);}
  p.ring(0,4,22+50*(t/.62),4+power*.3,CYAN,.9*fade);p.ring(0,4,12+36*(t/.62),3,GOLD,.7*fade);p.disc(0,0,15+19*(t/.62),WHITE,.95*fade);
 }
};
