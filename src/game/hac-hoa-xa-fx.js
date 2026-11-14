const rgb=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const DARK=rgb(31,18,32),PURPLE=rgb(113,39,69),GREEN=rgb(100,192,51),LIGHT=rgb(215,255,153),WHITE=rgb(250,255,210);
export const VENOM_FANG_FX={
 meta:{name:'hac-hoa-xa-doc-nha',duration:3.2,loop:false,options:{seed:1}},
 draw(p,t){const fade=Math.min(1,t/.08)*Math.min(1,(3.2-t)/.2),w=1+.12*Math.sin(t*15);p.glow(-4,0,25,GREEN,.32*fade);p.glow(18,0,14,LIGHT,.22*fade);p.ring(0,0,24,1,GREEN,.45*fade);p.tri(-29,-16,25,0,-29,16,DARK,.95*fade);p.tri(-22,-12,24,0,-22,12,PURPLE,.9*fade);p.tri(-15,-9,27,0,-15,9,GREEN,.95*fade);p.tri(-7,-5,26,0,-7,5,LIGHT,.98*fade);p.line(-33,-17*w,13,-4,WHITE,.85*fade);p.line(-33,17*w,13,4,WHITE,.85*fade);for(let i=0;i<4;i++){let d=-20-i*8;let off=Math.sin(t*11+i*2)*8;p.disc(d,off,2+(i%2),GREEN,.65*fade);}}
};
