// PixelFX: five elemental pillars, concentric sigils and a converging explosion.
import {game,camera,settings,clamp} from './state.js';
const P=window.PK_PIXELFX;
const rgba=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const C=[rgba(255,102,49),rgba(62,210,255),rgba(255,226,102),rgba(209,159,93),rgba(91,229,133)], WHT=rgba(250,255,245),INK=rgba(30,25,57);
const W=400,H=220,frame=P.createFrame(W,H),canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(W,H);
const tau=Math.PI*2;
function ellipse(p,rx,ry,rotation,color,alpha,count=48){let x0,y0;for(let i=0;i<=count;i++){const a=i*tau/count+rotation,x=Math.cos(a)*rx,y=Math.sin(a)*ry;if(i)p.line(x0,y0,x,y,color,alpha);x0=x;y0=y;}}
function star(p,x,y,r,col,a){p.glow(x,y,r*1.5,col,.2*a);p.line(x-r,y,x+r,y,col,a);p.line(x,y-r,x,y+r,col,a);}
export function drawFiveFormation(p,state,detail=1){
 const time=state.now||0,phase=state.phase,t=state.clock||0;
 if(phase==='launch'){for(let i=0;i<5;i++){let e=state.sequence[i];if(!e)continue;const x=(e.x-state.stageX)/2,y=(e.y-state.stageY)/2;p.glow(x,y,10,C[i],.38);p.disc(x,y,3,C[i],.95);star(p,x,y,7,WHT,.7);}return;}
 const form=phase==='form'?clamp(t/.85,0,1):phase==='blast'?clamp(1-t/1.7,0,1):1;
 const shrink=phase==='converge'?1-.65*clamp(t/.74,0,1):1, rx=135*shrink,ry=33*shrink;
 p.glow(0,-25,90,INK,.23*form);ellipse(p,rx,ry,time*.16,WHT,.8*form);ellipse(p,rx*.9,ry*.9,-time*.25,C[1],.8*form);ellipse(p,rx*.60,ry*.6,time*.38,C[2],.7*form);
 const verts=Array.from({length:5},(_,i)=>{const a=-Math.PI/2+i*tau/5+time*.08;return [Math.cos(a)*rx*.77,Math.sin(a)*ry*.77];});
 for(let i=0;i<5;i++){const a=verts[i],b=verts[(i+2)%5];p.glowLine(a[0],a[1],b[0],b[1],2,C[i],.12*form);p.line(a[0],a[1],b[0],b[1],C[i],.8*form);}
 for(let i=0;i<20;i++){let a=i*tau/20+time*.16,x=Math.cos(a)*rx*.94,y=Math.sin(a)*ry*.94;star(p,x,y,i%4?1.8:3,C[i%5],.75*form);}
 for(let i=0;i<5;i++){
  const a=i*tau/5-Math.PI/2,v=state.vertices?.[i],x=v?(v.vx-state.stageX)*.5*shrink:Math.cos(a)*rx,y=v?(v.vy-state.stageY)*.5*shrink:Math.sin(a)*ry,height=(115+6*Math.sin(time*2+i))*form;
  p.glow(x,y-height*.45,24,C[i],.18*form);p.glowLine(x,y,x,y-height,13,C[i],.2*form);p.beam(x,y,x,y-height,6,C[i],.65*form);p.line(x-4,y,x-4,y-height,C[i],.85*form);p.line(x+4,y,x+4,y-height,WHT,.65*form);
  p.tri(x,y-height-10,x-7,y-height,x,y-height+8,C[i],.85*form);p.tri(x,y-height-10,x+7,y-height,x,y-height+8,WHT,.8*form);p.ring(x,y,8,2,C[i],.85*form);star(p,x,y-height,5,WHT,.9*form);
  if(detail>0)for(let j=0;j<4;j++){const u=(time*.65+j*.25+i*.13)%1,xx=x+Math.sin(u*8+i)*9,yy=y-height*u;p.disc(xx,yy,1+(j%2),C[i],(1-u)*.7*form);}
 }
 if(phase==='converge'){const u=clamp(t/.74,0,1);p.glow(0,-35,25+u*35,WHT,.35*u);p.ring(0,-35,12+u*24,2,WHT,.8);}
 if(phase==='blast'){const u=clamp(t/1.7,0,1),k=1-u;p.glow(0,-30,70*k,WHT,.5*k);for(let i=0;i<5;i++){let r=25+u*(110+i*7);p.arc(0,-30,r,2,i*tau/5,i*tau/5+1.3,C[i],.85*k);for(let j=0;j<5;j++){const a=i*tau/5+j*.18,r2=25+u*(70+j*12);p.beam(Math.cos(a)*r2,-30+Math.sin(a)*r2*.6,Math.cos(a)*(r2-15*k),-30+Math.sin(a)*(r2-15*k)*.6,2,C[i],.8*k);}}}
}
let lastRender=-Infinity,lastPhase='',lastQuality='';
export function renderFiveFormation(state){
 const g=game.ctx;if(!g||state.phase==='idle')return;
 // Keep a legible area warning even with cosmetic effects disabled.
 const quality=settings.fxQuality,interval=quality==='high'?1/30:quality==='off'?1/12:1/20;
 if(state.phase!==lastPhase||quality!==lastQuality||state.now<lastRender||state.now-lastRender>=interval){
  P.clearFrame(frame);const p=P.painterFor(frame).place(W/2,175);
  if(quality==='off'&&state.phase!=='launch'){ellipse(p,135,33,0,C[1],.85,32);for(let i=0;i<5;i++){const v=state.vertices?.[i],a=i*tau/5-Math.PI/2,x=v?(v.vx-state.stageX)*.5:Math.cos(a)*135,y=v?(v.vy-state.stageY)*.5:Math.sin(a)*33;p.line(x,y,x,y-90,C[i],.75);}}
  else drawFiveFormation(p,state,quality==='low'||quality==='off'?0:1);
  P.composite(frame,pixels.data,null,.8);ctx.putImageData(pixels,0,0);lastRender=state.now;lastPhase=state.phase;lastQuality=quality;
 }
 g.save();g.imageSmoothingEnabled=false;g.drawImage(canvas,state.stageX-(camera.x-game.viewW/2)-W,state.stageY-(camera.y-game.viewH/2)-350,W*2,H*2);g.restore();
}
