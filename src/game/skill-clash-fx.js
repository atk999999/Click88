// PixelFX: short directional skill collisions; damage remains in the collision engine.
const rgb = hex => { const n=parseInt(hex.slice(1),16);return (0xff000000|((n&255)<<16)|(n&0xff00)|((n>>16)&255))>>>0; };
const colors={fireball:['#ff552b','#ffbb59'],lightning:['#588fff','#fff2a1'],water_sword:['#2c99e8','#bbf7ff'],blood_hand:['#9b1238','#ff6074'],blood_thread:['#ad174c','#ff8493'],venom:['#4d9a31','#c8f98c'],wind:['#3cab92','#c7ffdd'],sword:['#419be5','#d7fbff'],beam:['#43b5ee','#e0ffff'],ultimate:['#76dfff','#ffe3a0'],default:['#af7fe5','#f5d5ff']};
const shade=(kind,i)=>rgb((colors[kind]||colors.default)[i]);
const WHITE=rgb('#fffaf0'), INK=rgb('#223050');
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const rand=(i,seed)=>{let x=Math.sin(i*78.233+seed*12.9898)*43758.5453;return x-Math.floor(x)};
export function clashVisual(event, zoom=0.5385, quality='medium') {
  const a=Math.max(0,Number(event?.playerPower)||0), b=Math.max(0,Number(event?.bossPower)||0);
  const energy=clamp(Math.log10(1+Math.min(a,b))/2.9,.32,1);
  return {opts:{playerKind:event?.playerKind||'default',bossKind:event?.bossKind||'default',energy,outcome:event?.outcome||'equal',count:quality==='low'?8:quality==='high'?20:14},visual:{rotation:Number.isFinite(event?.angle)?event.angle:0,scale:clamp((.5385/Math.max(.175,zoom))**.48,.9,1.8)*(0.90+energy*.35)}};
}
export const SKILL_CLASH_FX={
  meta:{name:'skill-clash',duration:.68,loop:false,options:{seed:1,energy:.6,count:14,playerKind:'default',bossKind:'default',outcome:'equal'}},
  draw(p,t,o){
    const u=clamp(t/.68,0,1),fade=(1-u)**1.35,burst=Math.min(1,t/.055),energy=clamp(o.energy,.32,1),a=shade(o.playerKind,0),ah=shade(o.playerKind,1),b=shade(o.bossKind,0),bh=shade(o.bossKind,1),r=(12+90*Math.sqrt(u))*energy;
    const press=(1-u)**2;
    p.glow(-12,0,24,a,.42*fade);p.glow(12,0,24,b,.42*fade);
    p.glowLine(-75*press,0,0,0,4,a,.32*fade);p.glowLine(0,0,75*press,0,4,b,.32*fade);
    const reach=(18+72*press)*energy,width=(5+10*press)*energy;
    p.tri(-reach,0,-4,-width,0,0,INK,.72*fade);p.tri(-reach,0,-4,width,0,0,INK,.72*fade);
    p.tri(-reach+3,0,-4,-width*.72,0,0,a,.88*fade);p.tri(-reach+3,0,-4,width*.72,0,0,ah,.72*fade);
    p.tri(reach,0,4,-width,0,0,INK,.72*fade);p.tri(reach,0,4,width,0,0,INK,.72*fade);
    p.tri(reach-3,0,4,-width*.72,0,0,b,.88*fade);p.tri(reach-3,0,4,width*.72,0,0,bh,.72*fade);
    p.line(-reach,0,-5,0,ah,.95*fade);p.line(5,0,reach,0,bh,.95*fade);
    p.ring(0,0,Math.max(2,r+3),4,INK,.65*fade);
    p.arc(0,0,Math.max(2,r),3,Math.PI/2,Math.PI*1.5,ah,.96*fade);
    p.arc(0,0,Math.max(2,r),3,-Math.PI/2,Math.PI/2,bh,.96*fade);
    if(u>.12){const rr=r*.67;p.arc(0,0,Math.max(2,rr),1,-Math.PI/2,Math.PI/2,b,.55*fade);p.arc(0,0,Math.max(2,rr),1,Math.PI/2,Math.PI*1.5,a,.55*fade);}
    const count=Math.min(20,Math.max(4,o.count|0));
    for(let i=0;i<count;i++){
      const side=i%2?-1:1,q=rand(i+1,o.seed),v=rand(i+31,o.seed),angle=side<0?Math.PI+(q-.5)*2.4:(q-.5)*2.4,dist=(12+u*(34+62*v))*energy,x=Math.cos(angle)*dist,y=Math.sin(angle)*dist,len=(4+10*(1-u)*q)*energy,col=side<0?(i%4?ah:a):(i%4?bh:b);
      p.line(x,y,x-Math.cos(angle)*len,y-Math.sin(angle)*len,INK,.65*fade);p.line(x,y,x+Math.cos(angle)*len,y+Math.sin(angle)*len,col,.9*fade);
      if(i%5===0){p.line(x-2,y,x+2,y,WHITE,.8*fade);p.line(x,y-2,x,y+2,WHITE,.8*fade);}
    }
    if(u<.56){const k=(1-u/.56)*burst;p.glow(0,0,20+10*energy,WHITE,.52*k);p.disc(0,0,2+9*k,WHITE,.95*k);p.line(0,-24*k,0,24*k,WHITE,.9*k);p.line(-24*k,0,24*k,0,WHITE,.9*k);}
    if(o.outcome!=='equal' && u>.10 && u<.60){const side=o.outcome==='player'?1:-1,k=(1-u)*energy;p.line(side*10,0,side*(24+70*u)*energy,0,side>0?ah:bh,.72*k);}
  },
};
