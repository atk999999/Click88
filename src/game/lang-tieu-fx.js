// PixelFX v0.3 · Ngũ kiếm kỹ của Lăng Tiêu. Chỉ vẽ, không thay đổi sát thương hay va chạm.
import { game, player, dummy, camera, settings, clamp } from './state.js';

const col=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const C={deep:col(10,32,65),edge:col(31,78,118),blue:col(37,125,193),azure:col(57,191,225),cyan:col(104,232,250),pale:col(195,250,255),white:col(255,255,250),silver:col(166,213,225),gold:col(239,202,126),bronze:col(151,105,55)};
const TAU=Math.PI*2;

// Thanh kiếm hai lưỡi, thân thẳng, mũi nhọn, sống kiếm, hộ thủ, chuôi và núm kiếm.
// L là chiều dài toàn bộ kiếm; x/y nằm gần giữa thân kiếm.
export function drawJian(p,x,y,angle,L,alpha=1,ornate=false){
  const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,w=clamp(L*.052,1.2,25);
  const P=(u,v=0)=>[x+dx*u*L+nx*v,y+dy*u*L+ny*v];
  const ln=(a,b,c,k=alpha)=>p.line(a[0],a[1],b[0],b[1],c,k);
  const tri=(a,b,c,color,k=alpha)=>p.tri(a[0],a[1],b[0],b[1],c[0],c[1],color,k);
  const bodyA=P(-.18),a=P(-.18,-w),b=P(-.18,w),c=P(.36,-w*.78),d=P(.36,w*.78),e=P(.50,-w*.40),f=P(.50,w*.40),tip=P(.61),m=P(.36),n=P(.50);
  // Nền viền sẫm giúp hình kiếm nổi trên nền trời sáng và khi phóng nhỏ.
  const oa=P(-.19,-w-1),ob=P(-.19,w+1),oc=P(.37,-w*.78-1),od=P(.37,w*.78+1);
  tri(oa,oc,ob,C.deep,.92*alpha);tri(ob,oc,od,C.deep,.92*alpha);tri(oc,od,tip,C.deep,.92*alpha);
  ln(oa,oc,C.deep,.95*alpha);ln(oc,tip,C.deep,.95*alpha);ln(ob,od,C.deep,.95*alpha);ln(od,tip,C.deep,.95*alpha);
  p.glowLine(bodyA[0],bodyA[1],tip[0],tip[1],Math.max(1.5,w*.85),C.blue,.18*alpha);
  tri(a,c,bodyA,C.silver,.99*alpha);tri(bodyA,c,m,C.pale,.99*alpha);
  tri(bodyA,m,d,C.azure,.99*alpha);tri(bodyA,d,b,C.edge,.99*alpha);
  tri(c,e,m,C.silver,.99*alpha);tri(e,n,m,C.white,.98*alpha);
  tri(m,n,f,C.cyan,.98*alpha);tri(m,f,d,C.blue,.98*alpha);
  tri(e,tip,n,C.white,.99*alpha);tri(n,tip,f,C.silver,.99*alpha);
  ln(a,c,C.pale);ln(c,e,C.white);ln(e,tip,C.white);ln(b,d,C.cyan);ln(d,f,C.pale);ln(f,tip,C.white);ln(bodyA,tip,C.white,.82*alpha);
  // Hộ thủ có quillons hơi cong, không biến thành tam giác mũi tên.
  const g0=P(-.205,-w*1.5),g1=P(-.205,w*1.5),gc=P(-.205),ga=P(-.175,-w*.70),gb=P(-.175,w*.70);
  tri(g0,ga,gc,C.bronze);tri(g1,gb,gc,C.bronze);ln(g0,g1,C.gold);ln(g0,P(-.16,-w*1.45),C.pale);ln(g1,P(-.16,w*1.45),C.pale);
  p.glow(gc[0],gc[1],Math.max(1.3,w*.45),C.cyan,.35*alpha);p.dot(gc[0],gc[1],C.white,alpha);
  const h0=P(-.225),h1=P(-.43),end=P(-.47);
  const hw=Math.max(1,w*.32),ha=P(-.225,-hw),hb=P(-.225,hw),hc=P(-.43,-hw),hd=P(-.43,hw);
  p.glowLine(h0[0],h0[1],h1[0],h1[1],Math.max(1,w*.48),C.deep,.35*alpha);
  tri(ha,hb,hc,C.deep);tri(hb,hd,hc,C.deep);ln(ha,hc,C.silver,.72*alpha);ln(hb,hd,C.edge,.85*alpha);
  for(let i=0;i<4;i++){const u=-.25-i*.044;ln(P(u,-Math.max(.8,w*.24)),P(u-.015,Math.max(.8,w*.24)),C.pale,.74*alpha);}
  ln(P(-.44,-Math.max(1,w*.46)),P(-.44,Math.max(1,w*.46)),C.gold);p.ring(end[0],end[1],Math.max(1,w*.30),1,C.gold,.9*alpha);
  if(ornate && L>35){for(let i=0;i<3;i++){const q=P(-.05+i*.13);p.dot(q[0]+nx*w*.32,q[1]+ny*w*.32,C.gold,.9*alpha);}}
}
// Low-cost but unmistakable blade for every damaging projectile, including FX off.
function drawJianCore(p,x,y,a,L){
  const dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx,w=Math.max(1.1,L*.05);
  const at=(u,v=0)=>[x+dx*L*u+nx*v,y+dy*L*u+ny*v];
  const l=at(-.19,-w),r=at(-.19,w),tip=at(.61),h=at(-.44),g1=at(-.22,-w*1.45),g2=at(-.22,w*1.45);
  p.tri(l[0],l[1],r[0],r[1],tip[0],tip[1],C.deep,1);
  p.line(l[0],l[1],tip[0],tip[1],C.pale,1);p.line(r[0],r[1],tip[0],tip[1],C.cyan,1);
  p.line(g1[0],g1[1],g2[0],g2[1],C.gold,1);p.line(h[0],h[1],x-dx*L*.19,y-dy*L*.19,C.white,.9);
}
function ellipse(p,x,y,rx,ry,rot,color,alpha,count=32){
  let lx,ly;for(let i=0;i<=count;i++){const a=i*TAU/count+rot,xx=x+Math.cos(a)*rx,yy=y+Math.sin(a)*ry;if(i){p.line(lx+1,ly+1,xx+1,yy+1,C.deep,alpha*.65);p.line(lx,ly,xx,yy,color,alpha);}lx=xx;ly=yy;}
}
function star(p,x,y,r,alpha=1){p.glow(x,y,Math.max(1.2,r),C.cyan,.23*alpha);p.line(x-r,y,x+r,y,C.pale,alpha);p.line(x,y-r,x,y+r,C.white,alpha);}
function motes(p,x,y,r,t,n=12,alpha=.7){for(let i=0;i<n;i++){const a=i*2.39996+t*.8,rr=r*(.25+((i*31+t*27)%73)/100);const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr*.64;star(p,xx,yy,(i%4===0?2.2:1),alpha*(.6+.4*Math.sin(t*4+i)**2));}}
function slashArc(p,x,y,r,angle,spread,alpha){
  let lx,ly;for(let i=0;i<=20;i++){const a=angle-spread/2+spread*i/20,rr=r*(1+.08*Math.sin(i*Math.PI/20));const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;if(i){p.glowLine(lx,ly,xx,yy,2.2,C.blue,.22*alpha);p.line(lx,ly,xx,yy,i%3?C.pale:C.white,alpha);}lx=xx;ly=yy;}
}
function crescent(p,x,y,r,width,angle,spread,alpha){
  let ax,ay,bx,by;
  for(let i=0;i<=20;i++){
    const u=i/20,a=angle-spread/2+spread*u,thickness=width*Math.sin(Math.PI*u);
    const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r,xx2=x+Math.cos(a)*(r-thickness),yy2=y+Math.sin(a)*(r-thickness);
    if(i){p.tri(ax,ay,bx,by,xx,yy,C.edge,.72*alpha);p.tri(bx,by,xx2,yy2,xx,yy,C.blue,.68*alpha);p.line(ax+1,ay+1,xx+1,yy+1,C.deep,.82*alpha);p.line(ax,ay,xx,yy,C.pale,.96*alpha);}
    ax=xx;ay=yy;bx=xx2;by=yy2;
  }
}
function warp(p,x,y,scale,t,arrival=false){
  const u=clamp(t/.35,0,1),k=Math.sin(Math.PI*u);if(k<=0)return;
  const rr=(28+42*u)*scale;p.glow(x,y,20*scale,C.azure,.2*k);
  ellipse(p,x,y,rr,rr*.36,0,C.pale,.85*k);ellipse(p,x,y,rr*.7,rr*.9,0,C.cyan,.42*k);
  for(let i=0;i<10;i++){const a=i*TAU/10+t*7,xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr*.5,len=(15+i%4*8)*scale; p.line(xx,yy+(arrival?len:-len),xx,yy,C.cyan,.75*k);}
  star(p,x,y,8*scale,.8*k);
  drawJian(p,x,y,arrival?Math.PI*.75:-Math.PI*.25,120*scale,.58*k);
}
function seal(p,x,y,scale,t,large=false){
  const r=(large?178:122)*scale;
  ellipse(p,x,y,r,r*.48,t*.16,C.azure,.62);ellipse(p,x,y,r*.77,r*.38,-t*.26,C.pale,.82);
  ellipse(p,x,y,r*.50,r*.25,t*.4,C.cyan,.72);
  for(let i=0;i<12;i++){const a=i*TAU/12+t*.16,xx=x+Math.cos(a)*r*.87,yy=y+Math.sin(a)*r*.42;star(p,xx,yy,(i%3===0?3:1.3)*scale,.9);}
}
function energyWake(p,x,y,a,L,sc,t,ultimate=false){
  const dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
  // 由细到粗的重叠剑痕，不使用填满屏幕的白色三角形。
  for(let i=0;i<(ultimate?7:5);i++){
    const side=i%2?1:-1,k=1-Math.floor(i/2)*.20,w=(15+i*9)*sc;
    const A=[x-dx*L*.48+nx*side*w,y-dy*L*.48+ny*side*w];
    const B=[x-dx*(L*.80+i*16*sc)+nx*side*w*.55,y-dy*(L*.80+i*16*sc)+ny*side*w*.55];
    p.glowLine(A[0],A[1],B[0],B[1],2*sc,C.blue,.22*k);p.line(A[0],A[1],B[0],B[1],i===0?C.white:C.cyan,.58*k);
  }
  for(let j=0;j<3;j++){
    const b=x+dx*(L*.25-j*35*sc),c=y+dy*(L*.25-j*35*sc);
    crescent(p,b,c,(90+j*28)*(ultimate?1.20:1)*sc,(20-j*4)*sc,a,1.4,.76-j*.15);
  }
  if(ultimate){
    for(const side of [-1,1]){
      const root=[x-dx*L*.08+nx*side*18*sc,y-dy*L*.08+ny*side*18*sc];
      const tip=[x-dx*L*.38+nx*side*150*sc,y-dy*L*.38+ny*side*150*sc];
      const back=[x-dx*L*.5+nx*side*64*sc,y-dy*L*.5+ny*side*64*sc];
      p.tri(root[0],root[1],tip[0],tip[1],back[0],back[1],C.blue,.18);
      p.line(root[0],root[1],tip[0],tip[1],C.cyan,.72);p.line(tip[0],tip[1],back[0],back[1],C.gold,.65);
    }
  }
  for(let i=0;i<12;i++){const k=(i*19+t*240)%180,off=Math.sin(i*2.9+t*4)*(22+i%4*13)*sc;const xx=x-dx*k*sc+nx*off, yy=y-dy*k*sc+ny*off;p.line(xx,yy,xx-dx*(7+i%4*5)*sc,yy-dy*(7+i%4*5)*sc,i%3?C.azure:C.white,.62);}
}
function detonation(p,x,y,e,sc){
  const u=clamp(e.t/.8,0,1),k=1-u,large=e.big,rad=(large?180:54)*sc*u;
  p.glow(x,y,(large?50:15)*sc,C.blue,.32*k);p.ring(x,y,Math.max(1,rad),Math.max(1,2.2*sc),C.pale,.85*k);p.ring(x,y,Math.max(1,rad*.72),1,C.cyan,.7*k);
  const count=large?22:10;for(let i=0;i<count;i++){const a=i*2.39996,rr=rad*(.45+(i%5)*.14),xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr; p.line(xx,yy,xx+Math.cos(a)*(10+i%4*6)*sc,yy+Math.sin(a)*(10+i%4*6)*sc,i%3?C.cyan:C.white,.85*k);}
  if(large){p.glowLine(x,y-130*sc*u,x,y+130*sc*u,4*sc,C.azure,.3*k);p.line(x,y-130*sc*u,x,y+130*sc*u,C.white,.7*k);}
  if(e.skill===4){
    // Đại chiêu kết thúc bằng hai vết trảm chéo và mảnh kiếm phát tán.
    const R=195*sc*u;
    for(const side of [-1,1]){
      p.glowLine(x-R,y-side*R*.7,x+R,y+side*R*.7,4*sc,C.blue,.28*k);
      p.line(x-R,y-side*R*.7,x+R,y+side*R*.7,side>0?C.white:C.gold,.8*k);
    }
    for(let i=0;i<4;i++){const a=i*TAU/4+u*.4;drawJian(p,x+Math.cos(a)*R*.55,y+Math.sin(a)*R*.55,a,62*sc,k*.8);}
  }
}
let surface;
function getSurface(w,h){
  const sc=Math.min(.5,640/w,360/h),fw=Math.max(1,Math.ceil(w*sc)),fh=Math.max(1,Math.ceil(h*sc));
  if(!surface||surface.w!==fw||surface.h!==fh){const F=window.PK_PIXELFX,c=document.createElement('canvas');c.width=fw;c.height=fh;const ctx=c.getContext('2d');surface={w:fw,h:fh,frame:F.createFrame(fw,fh),canvas:c,ctx,image:ctx.createImageData(fw,fh)};}surface.scale=sc;return surface;
}
export function renderLangTieuFX(ai){
  if(!ai||!game.ctx||!dummy.visible)return;
  if(ai.phase==='idle'&&!ai.shieldTime&&!ai.shots.length&&!ai.sparks.length&&!player.stun)return;
  const zoom=Math.max(.1,settings.zoom||1),worldW=game.viewW/zoom,worldH=game.viewH/zoom,mx=(worldW-game.viewW)/2,my=(worldH-game.viewH)/2;
  const F=window.PK_PIXELFX,q=getSurface(worldW,worldH),p=F.painterFor(q.frame),sc=q.scale;
  const detailed=settings.fxQuality!=='off';
  const interval=settings.fxQuality==='high'?1/30:settings.fxQuality==='low'||!detailed?1/18:1/24;
  if(q.renderedAt===undefined||ai.time<q.renderedAt||ai.time-q.renderedAt>=interval||q.phase!==ai.phase||q.quality!==settings.fxQuality){
    q.renderedAt=ai.time;q.phase=ai.phase;q.quality=settings.fxQuality;F.clearFrame(q.frame);p.reset();
    const X=x=>(x-camera.x+game.viewW/2+mx)*sc,Y=y=>(y-camera.y+game.viewH/2+my)*sc;
    const x=X(dummy.x),y=Y(dummy.y-70),px=X(player.x),py=Y(player.y-70),t=ai.time,s=ai.t;
    if(ai.shieldTime>0 && !detailed){p.ring(x,y,80*sc,Math.max(1,2*sc),C.pale,.95);}
    if(ai.shieldTime>0 && detailed){
      // Kiếm khí hộ thể: 6 thanh kiếm rõ chuôi, xoay quanh vòng chắn.
      const pulse=.72+.14*Math.sin(t*5);p.glow(x,y,30*sc,C.blue,.12);p.ring(x,y,80*sc,Math.max(1,3*sc),C.edge,.85);p.ring(x,y,77*sc,1,C.pale,pulse);
      ellipse(p,x,y,69*sc,38*sc,-t*.4,C.cyan,.58);ellipse(p,x,y,61*sc,76*sc,t*.3,C.azure,.45);
      for(let i=0;i<6;i++){const a=t*.9+i*TAU/6,xx=x+Math.cos(a)*65*sc,yy=y+Math.sin(a)*60*sc;drawJian(p,xx,yy,a,98*sc,.95);}
      for(let i=0;i<6;i++){const a=t*.9+i*TAU/6,b=a+TAU/6;p.line(x+Math.cos(a)*74*sc,y+Math.sin(a)*70*sc,x+Math.cos(b)*74*sc,y+Math.sin(b)*70*sc,C.gold,.36);}
      motes(p,x,y,70*sc,t,8,.45);
    }
    if(player.stun>0){const sy=Y(player.y-125);ellipse(p,px,sy,27*sc,8*sc,0,C.pale,.82);if(detailed)for(let i=0;i<3;i++){const a=t*6+i*TAU/3;star(p,px+Math.cos(a)*26*sc,sy+Math.sin(a)*7*sc,3*sc,.95);}}
    if(!detailed && ['beam_charge','array_charge','array','fusion_charge'].includes(ai.phase))p.ring(x,y,Math.max(2,35*sc),Math.max(1,2*sc),C.cyan,.95);
    if(detailed && ['blink','blink_arrive','return','return_arrive'].includes(ai.phase))warp(p,x,y,sc,s,ai.phase.includes('arrive'));
    if(detailed && ai.phase==='combo'){
      const u=(s%.42)/.42;if(u>.18&&u<.85){const k=Math.sin(Math.PI*(u-.18)/.67),side=dummy.facing||1,angle=side>0?-.45:Math.PI+.45;
        const sx=x+side*52*sc;
        for(let n=0;n<3;n++)crescent(p,sx,y,(82+n*26)*sc,(33-n*6)*sc,angle,1.95,k*(.99-n*.18));
        drawJian(p,sx,y,angle+(u-.5)*.7,175*sc,.80*k,true);star(p,sx,y,13*sc,.9*k);}
    }
    if(detailed && ai.phase==='beam_charge'){
      const u=clamp(s/1.68,0,1);seal(p,x,y,sc,t,false);motes(p,x,y,120*sc,t,12,.75);
      // Kiếm hồn dần hiện phía trên tay trong lúc tụ lực.
      drawJian(p,x+8*sc,y-65*sc,-Math.PI/2,(185+150*u)*sc,.52+.45*u,true);
      const a=Math.atan2(py-y,px-x),dx=Math.cos(a),dy=Math.sin(a);
      p.line(x+dx*50*sc,y+dy*50*sc,x+dx*(150+130*u)*sc,y+dy*(150+130*u)*sc,C.cyan,.4+.35*u);
    }
    if(detailed && ['array_charge','array'].includes(ai.phase)){
      // Lấy thân làm trận: 3 pháp hoàn, 10 kiếm xuất hiện quanh người.
      seal(p,x,y,sc,t,true);p.glow(x,y,34*sc,C.blue,.2);motes(p,x,y,145*sc,t,14,.65);
      for(let i=0;i<10;i++){const a=i*TAU/10-t*.45,xx=x+Math.cos(a)*142*sc,yy=y+Math.sin(a)*65*sc;drawJian(p,xx,yy,a,95*sc,.85);}
      for(let i=0;i<5;i++){const a=i*TAU/5+t*.16,b=(i+2)*TAU/5+t*.16;p.line(x+Math.cos(a)*126*sc,y+Math.sin(a)*58*sc,x+Math.cos(b)*126*sc,y+Math.sin(b)*58*sc,C.gold,.4);}
    }
    if(detailed && ai.phase==='fusion_charge'){
      const u=clamp(s/2.7,0,1),a=Math.atan2(player.y-dummy.y,player.x-dummy.x);
      seal(p,x,y,sc,t,true);ellipse(p,x,y,156*sc,82*sc,t*.2,C.gold,.62);p.glow(x,y,(36+25*u)*sc,C.blue,.18+.15*u);motes(p,x,y,(100+70*u)*sc,t,18,.8);
      for(let i=0;i<8;i++){const th=i*TAU/8-t*.7,xx=x+Math.cos(th)*112*sc,yy=y+Math.sin(th)*60*sc;drawJian(p,xx,yy,th+Math.PI/2,63*sc,.7);}
      drawJian(p,x,y,a,(250+260*u)*sc,.48+.48*u,true);star(p,x,y,(8+u*8)*sc,.8);
      for(const side of [-1,1])slashArc(p,x,y,(90+55*u)*sc,a+side*1.35,1.0,.38+.35*u);
    }
    let swordCount=0;const maxSmall=settings.fxQuality==='low'?8:settings.fxQuality==='medium'?16:detailed?35:0;
    for(const shot of ai.shots){
      if(!shot.live)continue;
      const simple=!detailed||(shot.kind==='sword' && swordCount++>=maxSmall && !shot.final);
      const hx=X(shot.x),hy=Y(shot.y),a=shot.angle,dx=Math.cos(a),dy=Math.sin(a);
      if(simple){const L=(shot.kind==='ultimate'?600:shot.kind==='beam'?430:shot.final?145:91)*sc;drawJianCore(p,hx-dx*L*.61,hy-dy*L*.61,a,L);continue;}
      if(shot.kind==='sword'){
        const L=(shot.final?145:91)*sc,xx=hx-dx*L*.61,yy=hy-dy*L*.61;
        p.glowLine(xx-dx*L*.6,yy-dy*L*.6,xx-dx*L*1.2,yy-dy*L*1.2,2*sc,C.blue,.25);p.line(xx-dx*L*.5,yy-dy*L*.5,xx-dx*L*1.15,yy-dy*L*1.15,C.cyan,.6);
        drawJian(p,xx,yy,a,L,1,shot.final);
      } else {
        // Tọa độ va chạm trùng mũi kiếm; thân và hào quang kéo về sau.
        const ult=shot.kind==='ultimate',L=(ult?600:430)*sc,xx=hx-dx*L*.61,yy=hy-dy*L*.61;
        energyWake(p,xx,yy,a,L,sc,t,ult);p.glowLine(xx-dx*L*.43,yy-dy*L*.43,hx,hy,Math.max(2,12*sc),C.blue,ult?.3:.22);
        drawJian(p,xx,yy,a,L,1,true);
      }
    }
    if(detailed)for(const e of ai.sparks)detonation(p,X(e.x),Y(e.y),e,sc);
    F.composite(q.frame,q.image.data,null,.85);q.ctx.putImageData(q.image,0,0);
  }
  game.ctx.save();game.ctx.imageSmoothingEnabled=false;game.ctx.drawImage(q.canvas,-mx,-my,worldW,worldH);game.ctx.restore();
}
