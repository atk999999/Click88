import { TANG_MA_ACTIONS, tangMaPose } from './tang-ma-animation.js';
import { TANG_MA_FX } from './tang-ma-fx.js';

// Independent preview: the real combat engine and player sprites are untouched.
export function createTangMaPreview(canvas, status, baseUrl) {
  const ctx = canvas.getContext('2d');
  const P = window.PK_PIXELFX;
  const fxFrame = P.createFrame(320, 180);
  const fxCanvas = document.createElement('canvas'); fxCanvas.width=320; fxCanvas.height=180;
  const fxCtx=fxCanvas.getContext('2d'), pixels=fxCtx.createImageData(320,180);
  const images={}; let loaded=false, visible=false, raf=0, last=0, elapsed=0, action='idle', berserk=false, effects=[], fired=new Set(), lastOpacity=1, previousLoop=-1;
  function load(){
    if(loaded)return; loaded=true;
    const sources={base:'assets/sprites/tang_ma/co_ban.webp',skills:'assets/sprites/tang_ma/chieu_thuc.webp',bg:'assets/backgrounds/02_Phong_Canh_Mat_Dat.webp',target:'assets/sprites/idle.webp'};
    for(const [key,path] of Object.entries(sources)){const img=new Image();images[key]=img;img.src=baseUrl+path;}
  }
  function add(kind,x,y){const def=TANG_MA_FX[kind];if(!def)return; if(effects.length>=16)effects.shift();effects.push({instance:P.createFx(def,{x:x/3,y:y/3,light:.8}),x,y});}
  function eventPosition(kind,p){
    if(['gold_blast','grab','slam','combo_hit','combo_finish'].includes(kind))return [p.targetX,p.targetY-(kind==='slam'||kind==='combo_finish'?10:65)];
    if(kind==='void')return [p.bossX+70,p.bossY-185];
    if(kind==='gold_charge')return [p.bossX+72,p.bossY-100];
    return [p.bossX,p.bossY-(kind==='dust'?0:110)];
  }
  function imageReady(im){return im&&im.complete&&im.naturalWidth>0;}
  function cover(img){const s=Math.max(960/img.naturalWidth,540/img.naturalHeight);const w=img.naturalWidth*s,h=img.naturalHeight*s;ctx.drawImage(img,(960-w)/2,(540-h)/2,w,h);}
  function sprite(im,row,index,x,y,scale,opacity,sheet,facing=1){
    if(!imageReady(im))return;
    let sx=index*312, sw=312,dx=x-156*scale;
    if(sheet==='base'&&row===3&&index===3){sx-=18;sw+=18;dx-=18*scale;}
    if(sheet==='skills'&&row===0&&index===2)sw+=18;
    ctx.save();if(facing<0){ctx.translate(x,0);ctx.scale(-1,1);ctx.translate(-x,0);}ctx.globalAlpha=opacity;ctx.drawImage(im,sx,row*316,sw,316,dx,y-316*scale,sw*scale,316*scale);ctx.restore();
  }
  function tick(now){
    if(!visible)return;
    const wallDt=last?(now-last)/1000:0,dt=Math.min(.1,wallDt);last=now;elapsed+=wallDt;
    const loop=Math.floor(elapsed/(TANG_MA_ACTIONS[action].duration||1));if(TANG_MA_ACTIONS[action].loop&&loop!==previousLoop){fired.clear();previousLoop=loop;}
    const p=tangMaPose(action,elapsed,{berserk});
    for(const ev of p.events){const k=`${ev.kind}:${ev.index??''}:${ev.time}`;if((TANG_MA_ACTIONS[action].loop?elapsed%TANG_MA_ACTIONS[action].duration:elapsed)>=ev.time&&!fired.has(k)){fired.add(k);const [x,y]=eventPosition(ev.kind,p);add(ev.kind,x,y);}}
    if(action==='skill4'&&p.bossOpacity!==lastOpacity){add('blink',p.bossX,p.bossY-105);lastOpacity=p.bossOpacity;}
    ctx.clearRect(0,0,960,540);ctx.fillStyle='#151625';ctx.fillRect(0,0,960,540);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    if(imageReady(images.bg))cover(images.bg);
    const shade=ctx.createLinearGradient(0,0,0,540);shade.addColorStop(0,'rgba(9,5,20,.12)');shade.addColorStop(.78,'rgba(10,6,22,.06)');shade.addColorStop(1,'rgba(12,7,19,.72)');ctx.fillStyle=shade;ctx.fillRect(0,0,960,540);
    const earth=ctx.createLinearGradient(0,425,0,540);earth.addColorStop(0,'#4b554d');earth.addColorStop(.12,'#343a37');earth.addColorStop(1,'#141923');ctx.fillStyle=earth;ctx.fillRect(0,430,960,110);ctx.fillStyle='rgba(193,191,145,.32)';ctx.fillRect(0,429,960,2);
    ctx.save();const zoom=1-(p.bossScale-1)*.25;ctx.translate(480,430);ctx.scale(zoom,zoom);ctx.translate(-480,-430);
    ctx.fillStyle='rgba(25,16,25,.62)';ctx.beginPath();ctx.ellipse(p.bossX-p.cameraX,p.bossY-4,94*p.bossScale,15,0,0,Math.PI*2);ctx.fill();
    if(['skill1','skill3','skill4'].includes(action)&&imageReady(images.target)){
      ctx.save();ctx.translate(p.targetX-p.cameraX,p.targetY-60);ctx.rotate(p.targetRotation);ctx.globalAlpha=p.targetOpacity;ctx.drawImage(images.target,0,0,128,128,-60,-60,120,120);ctx.restore();
    }
    sprite(images[p.sheet],p.row,p.index,p.bossX-p.cameraX,p.bossY,p.bossScale,p.bossOpacity,p.sheet,p.bossFacing);
    if(effects.length){P.clearFrame(fxFrame);
    for(const e of effects){e.instance.options.x=(e.x-p.cameraX)/3;e.instance.options.y=e.y/3;e.instance.update(dt);e.instance.draw(fxFrame);}
    effects=effects.filter(e=>!e.instance.done());
    P.composite(fxFrame,pixels.data,null,.85);fxCtx.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(fxCanvas,0,0,960,540);}ctx.restore();
    status.textContent=p.phase;
    if(p.finished&&['skill1','skill3','skill4'].includes(action)){action='idle';elapsed=0;fired.clear();}
    raf=requestAnimationFrame(tick);
  }
  return {
    play(name){if(!TANG_MA_ACTIONS[name])return;action=name;elapsed=0;fired=new Set();effects=[];lastOpacity=1;previousLoop=-1;last=0;},
    setBerserk(value){berserk=value;if(action==='skill4')this.play(action);},
    setVisible(value){if(value===visible)return;visible=value;last=0;if(value){load();raf=requestAnimationFrame(tick);}else cancelAnimationFrame(raf);},
    destroy(){visible=false;cancelAnimationFrame(raf);effects=[];}
  };
}
