// Decorative PixelFX layers shared by fusion techniques. All geometry is bounded
// and deterministic: no particles are allocated or simulated per frame.
const rgb=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const WHITE=rgb(248,252,255),GOLD=rgb(255,218,126);
const FIVE=[rgb(255,99,52),rgb(255,209,80),rgb(83,202,255),rgb(133,238,109),rgb(190,138,255)];
const TAU=Math.PI*2;
function bolt(p,x,y,dx,dy,color,alpha){
 const nx=-dy,ny=dx;
 p.line(x,y,x+dx*.32+nx*.18,y+dy*.32+ny*.18,color,alpha);
 p.line(x+dx*.32+nx*.18,y+dy*.32+ny*.18,x+dx*.57-nx*.14,y+dy*.57-ny*.14,color,alpha);
 p.line(x+dx*.57-nx*.14,y+dy*.57-ny*.14,x+dx,y+dy,color,alpha);
}
function star(p,x,y,r,color,alpha){
 p.line(x-r,y,x+r,y,color,alpha);p.line(x,y-r,x,y+r,color,alpha);
 if(r>3){p.line(x-r*.45,y-r*.45,x+r*.45,y+r*.45,color,alpha*.7);p.line(x-r*.45,y+r*.45,x+r*.45,y-r*.45,color,alpha*.7);}
}
function sword(p,x,y,a,len,c,alpha){
 const dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx,w=Math.max(2,len*.055),tipx=x+dx*len*.72,tipy=y+dy*len*.72,bx=x-dx*len*.27,by=y-dy*len*.27;
 p.tri(bx+nx*w,by+ny*w,bx-nx*w,by-ny*w,tipx,tipy,c[1],alpha);
 p.line(bx+nx*w,by+ny*w,tipx,tipy,c[2],alpha);p.line(bx-nx*w,by-ny*w,tipx,tipy,c[0],alpha);
 p.line(bx-nx*w*1.7,by-ny*w*1.7,bx+nx*w*1.7,by+ny*w*1.7,GOLD,alpha);
 p.line(bx,by,bx-dx*len*.17,by-dy*len*.17,WHITE,alpha);
}
function mode(o){
 const s=String(o.style||'');
 if(o.blast?.startsWith('sword')||o.shape?.startsWith('jian'))return 'sword';
 if(o.blast==='five_prism'||s.startsWith('five'))return 'five';
 if(o.blast==='thunder_pillar'||o.thunder)return 'thunder';
 if(o.blast==='toxic_bloom'||o.poison)return 'venom';
 if(o.blast==='earth_quake'||s.startsWith('earth'))return 'earth';
 if(o.blast==='crimson_cross'||s.includes('blood'))return 'blood';
 if(o.blast==='vortex'||o.wind)return 'wind';
 if(o.burn||s.includes('fire'))return 'fire';
 return 'arcane';
}
export function drawFusionFlightAura(p,t,o,c,fade){
 const q=o.quality==='low'?5:8,shape=o.shape||'',m=mode(o),spin=t*5;
 // Two broken, counter-rotating halos make the projectile readable at zoom.
 p.arc(-6,0,50,2,spin*.55,spin*.55+2.5,c[1],.76*fade);
 p.arc(-6,0,54,2,-spin*.72+2,-spin*.72+3.8,c[2],.72*fade);
 for(let i=0;i<q;i++){
  const phase=(t*(45+i*3)+i*27)%110,x=12-phase,y=Math.sin(t*5+i*2.4)*(13+i%3*5);
  p.tri(x,y-2.5,x-16-i%3*4,y,x,y+2.5,i%3?c[1]:c[2],.8*fade);
  if(i%2===0)star(p,x-8,y,2,c[2],.7*fade);
 }
 if(m==='sword'||shape==='sword'||shape==='twin_blades'){
  for(let i=0;i<3;i++){const a=spin+i*TAU/3; sword(p,-7+Math.cos(a)*43,Math.sin(a)*34,a*.15,33,c,.8*fade);}
 }else if(m==='thunder'){
  for(let i=0;i<4;i++){const y=(i-1.5)*22;bolt(p,-48,y,60,Math.sin(spin+i)*10,c[2],.9*fade);}
 }else if(m==='five'){
  for(let i=0;i<5;i++){const a=spin*.6+i*TAU/5,x=Math.cos(a)*48,y=Math.sin(a)*37;p.disc(x,y,4,FIVE[i],fade);star(p,x,y,7,FIVE[i],.8*fade);}
 }else if(m==='venom'){
  for(let i=0;i<6;i++){const a=spin+i*TAU/6;p.disc(Math.cos(a)*49,Math.sin(a)*38,2+i%2,c[2],.85*fade);}
 }else if(m==='blood'){
  for(let i=0;i<4;i++){const a=spin+i*TAU/4,x=Math.cos(a)*45,y=Math.sin(a)*35;p.tri(x,y-6,x+5,y,x,y+6,c[1],.85*fade);}
 }else if(m==='wind'){
  for(let i=0;i<3;i++)p.arc(0,0,38+i*7,2,spin+i*2,spin+i*2+1.8,c[2],.75*fade);
 }else if(m==='fire'){
  for(let i=0;i<5;i++){const y=(i-2)*14;p.tri(-50,y-5,-86-Math.sin(spin+i)*7,y,-50,y+5,c[1],.8*fade);}
 }
}
export function drawFusionImpactCrown(p,t,o,c,fade){
 const u=Math.max(0,Math.min(1,t/.9)),ease=1-(1-u)**3,r=20+104*ease,m=mode(o),q=o.quality==='low'?8:12;
 // An expanding shockwave and streaks frame the impact; the outer glow is
 // ornamental and does not represent extra collision range.
 p.arc(0,0,r,3,t*2,t*2+4.8,c[1],.84*fade);
 p.arc(0,0,r*.82,2,-t*3,-t*3+4.6,c[2],.9*fade);
 for(let i=0;i<q;i++){
  const a=i*TAU/q+t*.4,cs=Math.cos(a),sn=Math.sin(a),inner=r*.70,outer=r*(.95+(i%3)*.08);
  p.beam(cs*inner,sn*inner,cs*outer,sn*outer,i%3===0?3:2,i%2?c[1]:c[2],.83*fade);
  if(i%3===0)star(p,cs*outer,sn*outer,4,c[2],.8*fade);
 }
 if(m==='sword'){
  for(let i=0;i<6;i++){const a=i*TAU/6+t*.8;sword(p,Math.cos(a)*r*.64,Math.sin(a)*r*.64,a,54,c,.95*fade);}
  p.beam(0,-135,0,105,13,c[1],.65*fade);p.beam(0,-135,0,105,4,c[2],.9*fade);
 }else if(m==='five'){
  for(let i=0;i<5;i++){const a=i*TAU/5+t*.6,b=(i+2)*TAU/5+t*.6,x=Math.cos(a)*r*.78,y=Math.sin(a)*r*.78;
   p.line(x,y,Math.cos(b)*r*.78,Math.sin(b)*r*.78,FIVE[i],.85*fade);p.disc(x,y,5,FIVE[i],fade);star(p,x,y,8,FIVE[i],.8*fade);}
 }else if(m==='thunder'){
  for(let i=0;i<7;i++){const a=i*TAU/7+t*.2;bolt(p,0,0,Math.cos(a)*r*.94,Math.sin(a)*r*.94,i%2?c[1]:c[2],.95*fade);}
  p.beam(0,-138,0,36,22,c[0],.65*fade);p.beam(0,-138,0,36,12,c[1],.8*fade);p.beam(0,-138,0,36,5,c[2],.95*fade);
 }else if(m==='venom'){
  for(let i=0;i<8;i++){const a=i*TAU/8+t*.3,x=Math.cos(a)*r*.7,y=Math.sin(a)*r*.7;p.tri(x,y-8,x+Math.cos(a)*25,y+Math.sin(a)*25,x,y+8,c[1],.8*fade);p.ring(x,y,5+i%3,1,c[2],.85*fade);}
 }else if(m==='earth'){
  for(let i=-3;i<=3;i++){const x=i*28,h=20+(3-Math.abs(i))*14;p.tri(x-10,45,x,-h,x+10,45,c[1],.85*fade);p.line(x,-h,x+6,37,c[2],.8*fade);}
 }else if(m==='blood'){
  for(let i=0;i<8;i++){const a=i*TAU/8+t*.6,x=Math.cos(a)*r*.75,y=Math.sin(a)*r*.75;p.tri(x,y-10,x+7,y,x,y+10,c[1],.9*fade);p.line(0,0,x,y,c[2],.35*fade);}
 }else if(m==='wind'){
  // A vertical cyclone silhouette distinguishes wind from circular impacts.
  for(let i=0;i<6;i++){const y=55-i*27,w=20+i*17;p.ellipse(Math.sin(t*5+i)*7,y,w,7+i*.9,i%2?c[1]:c[2],.85*fade);}
  for(let i=0;i<4;i++)p.arc(0,0,r*(.35+i*.18),3,t*7+i*1.5,t*7+i*1.5+2.4,c[2],.85*fade);
 }else{
  for(let i=0;i<8;i++){const a=i*TAU/8+t*.4,x=Math.cos(a),y=Math.sin(a);p.tri(x*r*.3-y*6,y*r*.3+x*6,x*r*1.02,y*r*1.02,x*r*.3+y*6,y*r*.3-x*6,c[1],.75*fade);}
 }
}
