// Visual-only adapter for a future acquired Cuồng Bạo skill. The normal atlas
// and combat statistics are untouched; the ability controls activation.
export const GIANT_ATLAS_GRID=4;
export const GIANT_DRAW_SCALE=2;
export function createGiantVisual(){return {active:false,mix:0};}
export function startGiantVisual(state){state.active=true;}
export function endGiantVisual(state){state.active=false;}
export function resetGiantVisual(state){state.active=false;state.mix=0;}
export function updateGiantVisual(state,dt){const target=state.active?1:0,step=Math.max(0,Math.min(dt,0.1))*3;state.mix=target>state.mix?Math.min(target,state.mix+step):Math.max(target,state.mix-step);}
const CLIP_FRAMES={
 idle:[0,1,2,3],walk:[4,5,7,5],run:[5,6,7,6],
 jump_start:[8],jump_air:[9],fall:[9],land:[8],fly_up:[9],hover:[10],
 hand_seal:[11],charge_raise:[15],charge_hold:[15],cast_fire:[11],
 hurt:[12],knockdown:[12,13],down_idle:[13],getup:[14]
};
export function giantFrame(id,frame){const frames=CLIP_FRAMES[id]||CLIP_FRAMES.idle;return frames[Math.abs(frame|0)%frames.length];}
export function drawGiantFrame(ctx,img,id,frame,scale,anchor){
 if(!ctx||!img||!img.naturalWidth||!img.naturalHeight)return false;
 const index=giantFrame(id,frame),w=img.naturalWidth/GIANT_ATLAS_GRID,h=img.naturalHeight/GIANT_ATLAS_GRID;
 // Preserve a stable foot anchor for grounded poses; aerial poses retain their lift.
 const feet=[289,286,287,289,280,277,259,276,282,289,289,275,276,275,272,277];
 const correction=(289-feet[index])/304.25*256*scale*GIANT_DRAW_SCALE;
 ctx.drawImage(img,(index%4)*w,Math.floor(index/4)*h,w,h,-128*scale*GIANT_DRAW_SCALE,-anchor*scale*GIANT_DRAW_SCALE+correction,256*scale*GIANT_DRAW_SCALE,256*scale*GIANT_DRAW_SCALE);return true;
}
