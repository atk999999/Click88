import assert from 'node:assert/strict';
import {createGiantVisual,startGiantVisual,endGiantVisual,resetGiantVisual,updateGiantVisual,giantFrame,drawGiantFrame} from '../src/game/diep-tu-cuong-bao.js';
const v=createGiantVisual();assert.equal(v.mix,0);startGiantVisual(v);for(let i=0;i<30;i++)updateGiantVisual(v,1/60);assert.equal(v.mix,1);endGiantVisual(v);for(let i=0;i<30;i++)updateGiantVisual(v,1/60);assert.equal(v.mix,0);startGiantVisual(v);updateGiantVisual(v,.1);resetGiantVisual(v);assert.deepEqual(v,{active:false,mix:0});
assert.equal(giantFrame('run',1),6);assert.equal(giantFrame('cast_fire',0),11);assert.equal(giantFrame('hurt',0),12);assert.equal(giantFrame('getup',0),14);
let args;const ctx={drawImage(...a){args=a;}};const img={naturalWidth:1293,naturalHeight:1217};assert.equal(drawGiantFrame(ctx,img,'run',1,.52,238),true);assert.equal(args[0],img);assert.equal(args[1],2*1293/4);assert.equal(args[2],1217/4);assert.equal(args[7],256*.52*2);assert.equal(drawGiantFrame(ctx,null,'idle',0,.52,238),false);
console.log('PASS giant visual activation, restoration, run/cast/hurt frames and sprite-sheet cropping');
