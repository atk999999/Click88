import assert from 'node:assert/strict';
let rendered=0,visiblePixels=0;
const bufferContext={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(im){visiblePixels+=im.data.filter((v,i)=>i%4===3&&v>0).length;}};
globalThis.window=globalThis;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>bufferContext})};
await import('../src/game/pixelfx.js');
const {game,settings,camera}=await import('../src/game/state.js');
const {drawBeastProjectileCores}=await import('../src/game/beast-projectile-core.js');
game.ctx={save(){},restore(){},translate(){},rotate(){},drawImage(){rendered++;}};game.viewW=960;game.viewH=540;camera.x=400;camera.y=300;settings.fxQuality='off';
for(const style of ['wind','lightning','venom','shadow'])drawBeastProjectileCores([{x:400,y:300,age:.3,live:true},{x:430,y:300,age:.2,live:false}],style);
assert.equal(rendered,4,'one visible core for each live projectile with effects off');assert.ok(visiblePixels>100,'PixelFX cores contain visible pixels');
const {BEAST_ATTACK_FX}=await import('../src/game/quai-skill-fx.js');for(const style of ['wind','lightning','venom','shadow']){const f=window.PK_PIXELFX.createFrame(160,160),fx=window.PK_PIXELFX.createFx(BEAST_ATTACK_FX,{x:80,y:80,style});fx.update(.2);fx.draw(f);assert.ok(f.color.some(c=>c!==0),style+' renders');}
console.log('PASS all four distinct PixelFX styles and projectile cores when cosmetic effects are off');
