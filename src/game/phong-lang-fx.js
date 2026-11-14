// PixelFX wind vortex: one short lived effect follows each real projectile.
const col=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const DEEP=col(30,92,98),TEAL=col(56,168,157),MINT=col(149,244,213),WHITE=col(232,255,244);
export const WIND_TORNADO_FX={
  meta:{name:'phong-lang-wind',duration:2.8,loop:false,options:{seed:1}},
  draw(p,t){
    const fade=Math.min(1,t/.12)*Math.min(1,(2.8-t)/.2),phase=t*10;
    p.glow(0,-5,36,TEAL,.22*fade);
    p.ellipse(0,-2,13,46,TEAL,.16*fade);
    p.ellipse(0,-2,5,38,MINT,.24*fade);
    p.glow(0,-5,18,WHITE,.22*fade);p.arc(0,-20,49,2,phase,phase+2.7,WHITE,.65*fade);p.arc(0,8,36,2,-phase,-phase+2.7,TEAL,.8*fade);
    for(let row=0;row<8;row++){
      const y=-43+row*12,rx=46-row*5,ry=5+row*.4;
      let lastX,lastY;
      for(let i=0;i<=18;i++){
        const a=i*Math.PI*2/18+phase*(row%2?1:-1),x=Math.cos(a)*rx,yy=y+Math.sin(a)*ry;
        if(i){p.line(lastX+1,lastY+2,x+1,yy+2,DEEP,.7*fade);p.line(lastX,lastY,x,yy,i%4?MINT:WHITE,.9*fade);}
        lastX=x;lastY=yy;
      }
    }
    for(let i=0;i<12;i++){const a=i*2.399+phase*.7,r=18+(i%3)*12,x=Math.cos(a)*r,y=-42+(i*17+phase*3)%82;p.line(x,y,x+Math.cos(a)*9,y-5,i%3?TEAL:WHITE,.82*fade);}
  }
};
// Brief windup gives a readable warning before the projectile is released.
export const WIND_CHARGE_FX={
  meta:{name:'phong-lang-charge',duration:.5,loop:false,options:{seed:1}},
  draw(p,t){const u=Math.min(1,t/.5),k=Math.sin(Math.PI*u);p.glow(0,0,13+u*8,TEAL,.2*k);for(let i=0;i<3;i++)p.arc(0,0,8+i*8+u*4,1,i*2+t*8,i*2+t*8+Math.PI*1.2,i===1?MINT:TEAL,.8*k);p.disc(0,0,2+3*u,WHITE,.8*k);}
};
