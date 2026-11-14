import {FUSION_PALETTES} from './fusion-fx.js';
import {drawFusionFlightAura} from './fusion-detail-fx.js';
const rgb=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const FIVE_ORBS=[rgb(255,95,55),rgb(255,218,91),rgb(98,218,255),rgb(170,255,125),rgb(222,166,255)];
const GOLD=rgb(239,202,126);
function drawFusionJian(p,x,y,angle,L,c,alpha){
 const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,w=Math.max(1.4,L*.055);
 const P=(u,v=0)=>[x+dx*u*L+nx*v,y+dy*u*L+ny*v];
 const a=P(-.18,-w),b=P(-.18,w),e=P(.40,-w*.65),f=P(.40,w*.65),tip=P(.62),m=P(-.18);
 p.glowLine(m[0],m[1],tip[0],tip[1],Math.max(2,w),c[1],.28*alpha);
 p.tri(a[0],a[1],e[0],e[1],m[0],m[1],c[1],.96*alpha);p.tri(m[0],m[1],f[0],f[1],b[0],b[1],c[0],.96*alpha);
 p.tri(e[0],e[1],tip[0],tip[1],f[0],f[1],c[2],.98*alpha);
 p.line(a[0],a[1],e[0],e[1],c[2],alpha);p.line(e[0],e[1],tip[0],tip[1],c[2],alpha);
 p.line(b[0],b[1],f[0],f[1],c[1],alpha);p.line(f[0],f[1],tip[0],tip[1],c[2],alpha);
 p.line(m[0],m[1],tip[0],tip[1],c[2],.9*alpha);
 const g0=P(-.21,-w*1.65),g1=P(-.21,w*1.65),h0=P(-.22),h1=P(-.44);
 p.line(g0[0],g0[1],g1[0],g1[1],GOLD,alpha);p.line(h0[0],h0[1],h1[0],h1[1],c[2],alpha);p.ring(h1[0],h1[1],Math.max(1.2,w*.32),1,GOLD,.9*alpha);
}
function resolveShape(o){
 if(o.shape)return o.shape;
 if(o.wind||['firewind','venomwind','earthwind','fivewind'].includes(o.style))return 'tornado';
 if(['waterlightning','shadowwater','earthwater'].includes(o.style))return 'sword';
 if(['bloodfire','lightningblood','earthblood','fiveblood','shadowfire'].includes(o.style))return 'spear';
 if(String(o.style||'').startsWith('five'))return 'five_wheel';
 if(String(o.style||'').startsWith('sword'))return 'jian_beam';
 return 'orb';
}
// Bounded, 30 FPS PixelFX projectile renderer with 15 procedural morphologies; geometry points right.
export const FUSION_FLIGHT_FX={meta:{name:'fusion-flight',duration:3.2,loop:false,options:{style:'firewind',shape:''}},draw(p,t,o){
 const c=FUSION_PALETTES[o.style]||FUSION_PALETTES.firewind,fade=Math.min(1,t/.07)*Math.min(1,Math.max(0,(3.2-t)/.16)),spin=t*6,shape=resolveShape(o);
 const dark=['shadowlightning','shadowwater','earthshadow','shadowfire','shadowvenom','swordshadow'].includes(o.style);
 const thunder=!!o.thunder||['waterlightning','lightningfire','shadowlightning','lightningblood','fivelightning','swordlightning'].includes(o.style);
 drawFusionFlightAura(p,t,o,c,fade);
 p.glow(-6,0,40,c[1],.35*fade);
 for(let i=0;i<5;i++){const y=(i-2)*8+Math.sin(spin+i)*3,x=-42-i%2*9;p.tri(x,y-2,8,y*.45,x-27,y+2,c[i%2?1:0],.68*fade);}
 if(shape==='jian_triple'){
  drawFusionJian(p,8,0,0,84,c,fade);
  drawFusionJian(p,-12,-20,-.12,62,c,.9*fade);
  drawFusionJian(p,-12,20,.12,62,c,.9*fade);
  p.arc(-6,0,34,2,spin,spin+2.2,c[2],.78*fade);
 }else if(shape==='jian_beam'){
  p.beam(-46,0,58,0,10,c[0],.72*fade);p.beam(-40,0,62,0,4,c[2],.95*fade);
  drawFusionJian(p,6,0,0,104,c,fade);
  p.arc(10,0,36,4,-1.05,1.05,c[1],.88*fade);p.arc(-8,0,28,3,-.95,.95,c[2],.85*fade);
 }else if(shape==='jian_array'){
  p.ring(-6,0,32,2,c[2],.85*fade);p.ring(-6,0,20,2,c[1],.8*fade);
  for(let i=0;i<5;i++){const a=spin*.85+i*Math.PI*2/5;drawFusionJian(p,-6+Math.cos(a)*26,Math.sin(a)*26,a*.18,46,c,.92*fade);}
  drawFusionJian(p,14,0,0,66,c,fade);
 }else if(shape==='jian_guard'){
  p.ring(0,0,36,3,c[1],.9*fade);p.ring(0,0,24,2,c[2],.85*fade);p.disc(0,0,10,c[0],.9*fade);
  for(let i=0;i<4;i++){const a=spin+i*Math.PI/2;drawFusionJian(p,Math.cos(a)*28,Math.sin(a)*28,a+Math.PI/2,44,c,.94*fade);}
  p.tri(18,-10,58,0,18,10,c[2],.9*fade);
 }else if(shape==='jian_giant'){
  p.tri(-20,0,-48,-36,24,-14,c[0],.86*fade);p.tri(-20,0,-48,36,24,14,c[0],.86*fade);
  drawFusionJian(p,4,0,0,118,c,fade);
  p.arc(14,0,42,4,-1.15,1.15,c[2],.9*fade);
 }else if(shape==='sword'){
  p.tri(-30,-13,65,0,-30,13,c[1],.92*fade);p.tri(-23,-7,59,0,-23,7,c[2],.95*fade);p.line(-25,0,57,0,c[2],fade);
  p.line(-30,-21,-30,21,c[2],fade);p.line(-34,-18,-34,18,c[1],fade);p.line(-48,0,-31,0,c[2],fade);p.disc(-50,0,3,c[1],fade);
  p.arc(0,0,38,3,spin,spin+1.9,c[1],.8*fade);p.arc(0,0,47,2,-spin,-spin+1.5,c[2],.7*fade);
 }else if(shape==='twin_blades'){
  for(const s of [-1,1]){const oy=s*(14+Math.sin(spin*1.5)*4);p.tri(-34,oy-7,58,oy*.55,-34,oy+7,c[1],.92*fade);p.tri(-24,oy-3,52,oy*.55,-24,oy+3,c[2],.95*fade);p.line(-34,oy-12,-34,oy+12,c[2],fade);}
  p.arc(0,0,34,2,spin,spin+2.3,c[2],.8*fade);
 }else if(shape==='tornado'){
  p.disc(0,0,17,c[0],.9*fade);p.disc(0,0,9,c[2],fade);
  for(let i=0;i<4;i++)p.arc(0,0,18+i*7,3,spin+i*1.4,spin+i*1.4+2.25,c[i%2?1:2],.9*fade);
  for(let i=0;i<4;i++){const a=spin+i*Math.PI/2,x=Math.cos(a)*35,y=Math.sin(a)*35;p.tri(x,y,x-13,y-5,x-8,y+6,c[1],.85*fade);}
 }else if(shape==='spear'){
  p.beam(-48,0,46,0,8,c[0],.82*fade);p.beam(-44,0,48,0,4,c[1],.95*fade);p.tri(24,-14,68,0,24,14,c[1],.96*fade);p.tri(30,-7,63,0,30,7,c[2],fade);
  p.arc(-10,0,28,3,spin,spin+2.2,c[1],.85*fade);p.arc(-10,0,38,2,-spin,-spin+1.8,c[2],.75*fade);
 }else if(shape==='fang'){
  p.tri(-36,-22,56,-4,-14,-4,c[1],.95*fade);p.tri(-36,22,56,4,-14,4,c[1],.95*fade);
  p.tri(-24,-15,49,-4,-10,-6,c[2],fade);p.tri(-24,15,49,4,-10,6,c[2],fade);
  p.disc(-8,0,10,c[0],.9*fade);p.disc(-6,0,5,c[2],fade);
 }else if(shape==='crescent'){
  p.arc(-8,0,39,9,-1.08,1.08,c[0],.9*fade);p.arc(-5,0,37,6,-1.02,1.02,c[1],.95*fade);p.arc(-2,0,35,3,-.92,.92,c[2],fade);
  p.tri(14,-34,44,-14,18,-20,c[2],.9*fade);p.tri(14,34,44,14,18,20,c[2],.9*fade);
 }else if(shape==='five_wheel'){
  p.ring(0,0,31,3,c[2],.9*fade);p.ring(0,0,18,2,c[1],.9*fade);p.disc(0,0,8,c[2],fade);
  for(let i=0;i<5;i++){const a=spin*.8+i*Math.PI*2/5,b=spin*.8+(i+2)*Math.PI*2/5;p.line(Math.cos(a)*29,Math.sin(a)*29,Math.cos(b)*29,Math.sin(b)*29,c[2],.78*fade);p.disc(Math.cos(a)*31,Math.sin(a)*31,6,FIVE_ORBS[i],.95*fade);}
 }else if(shape==='wing_dive'){
  p.tri(-12,0,-48,-40,26,-16,c[0],.95*fade);p.tri(-12,0,-48,40,26,16,c[0],.95*fade);
  p.tri(-6,0,-34,-26,56,0,c[1],.92*fade);p.tri(-6,0,-34,26,56,0,c[1],.92*fade);
  p.tri(6,-5,60,0,6,5,c[2],fade);
 }else if(shape==='pillar_seal'){
  p.rect(-18,-24,36,48,c[0],.92*fade);p.rect(-12,-18,24,36,c[1],.9*fade);p.line(0,-22,0,22,c[2],fade);p.line(-14,0,14,0,c[2],fade);
  p.ring(0,0,34,3,c[2],.85*fade);p.tri(20,-10,56,0,20,10,c[1],.92*fade);
 }else{
  p.disc(0,0,28,c[0],.95*fade);p.disc(0,0,19,c[1],.9*fade);p.disc(0,0,9,c[2],fade);
  for(let i=0;i<4;i++){const a=spin+i*Math.PI/2;p.arc(0,0,34+i%2*8,4,a,a+1.5,c[i%2?1:2],.9*fade);}
 }
 if(dark&&shape!=='wing_dive'){p.tri(-5,-15,-36,-43,15,-24,c[0],.92*fade);p.tri(-5,15,-36,43,15,24,c[0],.92*fade);p.line(-35,-42,9,-20,c[1],fade);p.line(-35,42,9,20,c[1],fade);}
 if(o.poison){for(let i=0;i<5;i++){const a=spin+i*1.9;p.disc(Math.cos(a)*32-5,Math.sin(a)*26,2+i%2,rgb(129,245,76),.85*fade);}}
 if(o.burn){for(let i=0;i<3;i++){const y=(i-1)*12;p.tri(-31,y-4,-58,y,-31,y+4,rgb(255,153,35),.8*fade);}}
 if(thunder){for(let i=0;i<4;i++){const y=(i-1.5)*17,x=-24+i*12;p.line(x,y,x+12,y+5,c[2],fade);p.line(x+12,y+5,x+23,y-6,c[2],fade);}}
 if(o.lifeSteal){p.arc(0,0,42,2,spin+1,spin+2.8,rgb(255,95,128),.85*fade);}
}};
