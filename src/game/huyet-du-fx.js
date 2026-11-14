// Huyết Dự: bounded PixelFX accents layered over the original skill visuals.
const color=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const BLOOD=color(215,27,55), DEEP=color(106,8,35), ROSE=color(255,111,130), WHITE=color(255,232,218), TEAL=color(78,215,221);
const clamp=v=>Math.max(0,Math.min(1,v));
const effect=(name,duration,draw)=>({meta:{name,duration,loop:false,options:{seed:1}},draw});
export const HUYET_DU_FX={
 handSeal:effect('huyet-hand-seal',.7,(p,t)=>{const u=clamp(t/.7);p.glow(0,0,26+u*13,BLOOD,.35);for(let i=0;i<3;i++){let a=t*4+i*2.09;p.arc(0,0,15+i*7,2,a,a+1.6,i%2?ROSE:BLOOD,.8);}for(let i=0;i<7;i++){let a=i*.9+t*2,r=44-22*u;p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-10),Math.sin(a)*(r-10),2,i%2?BLOOD:ROSE,.8);} }),
 handLaunch:effect('huyet-hand-launch',.55,(p,t)=>{let u=clamp(t/.55),v=1-u;p.glow(0,0,46,BLOOD,.35*v);p.ring(0,0,10+55*u,2+2*v,ROSE,.8*v);for(let i=0;i<9;i++){let a=i*2.4,r=12+65*u;p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-13*v),Math.sin(a)*(r-13*v),2,BLOOD,.7*v);}}),
 threadCharge:effect('huyet-thread-charge',1.2,(p,t)=>{let u=clamp(t/1.2);p.glow(0,0,22+u*20,BLOOD,.3);for(let i=0;i<9;i++){let a=i*2.4+t*3,r=20+((i*17+t*65)%55);p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-12),Math.sin(a)*(r-12),1.4,i%3?BLOOD:ROSE,.7);}p.disc(0,0,4+u*3,WHITE,.9);}),
 threadRelease:effect('huyet-thread-release',.65,(p,t)=>{let u=clamp(t/.65),v=1-u;p.glow(0,0,45,BLOOD,.4*v);p.ring(0,0,10+54*u,3,ROSE,.8*v);for(let i=0;i<10;i++){let a=i*2.4,r=15+75*u;p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-20*v),Math.sin(a)*(r-20*v),2,i%3?BLOOD:WHITE,.8*v);}}),
 siphon:effect('huyet-siphon',.8,(p,t)=>{let u=clamp(t/.8),v=1-u;p.glow(0,0,48,BLOOD,.25*v);for(let i=0;i<4;i++){let a=t*4+i*1.57;p.arc(0,0,14+i*8,2,a,a+1.6,i%2?TEAL:BLOOD,.8*v);}p.disc(0,0,5,WHITE,.8*v);}),
 shield:effect('huyet-shield',.75,(p,t)=>{let u=clamp(t/.75),v=1-u;p.glow(0,0,58,BLOOD,.25*v);p.ring(0,0,24+60*u,2+2*v,ROSE,.8*v);for(let i=0;i<8;i++){let a=i*.785;p.line(Math.cos(a)*48,Math.sin(a)*48,Math.cos(a)*70,Math.sin(a)*70,BLOOD,.7*v);}}),
 burst:effect('huyet-burst',1.05,(p,t)=>{let u=clamp(t/1.05),v=1-u;p.glow(0,0,78,BLOOD,.55*v);if(u<.18)p.disc(0,0,25+u*120,WHITE,.8*(1-u/.18));p.ring(0,0,16+130*u,2+4*v,ROSE,.9*v);for(let i=0;i<16;i++){let a=i*2.4,r=20+140*u;p.beam(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r-22*v),Math.sin(a)*(r-22*v),2+2*v,i%3?BLOOD:WHITE,.8*v);}}),
};
