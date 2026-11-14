import assert from 'node:assert/strict';
import {createTangMaCombat,castTangMa,updateTangMa,TANG_MA_COMBAT} from '../src/game/tang-ma-combat.js';
function fixture(){const boss={x:500,y:500,maxHp:9000,hp:4500,stun:0,trapped:false,recoil:0,facing:1},hero={x:800,y:500,hp:5000,vx:0,vy:0},events=[],hits=[],stuns=[];const a=createTangMaCombat();a.auto=false;const env={boss,hero,ground:()=>500,hit:(amount,from,mode)=>{hits.push({amount,from,mode});hero.hp-=amount;return {hpLost:amount,blocked:0}},stun:s=>stuns.push(s),emit:(...e)=>events.push(e),notice:()=>{}};return {a,boss,hero,env,events,hits,stuns};}
function step(f,seconds,dt=1/60){for(let t=0;t<seconds-1e-8;t+=dt)updateTangMa(f.a,Math.min(dt,seconds-t),f.env);}
for(const dt of [1/30,1/60]){
 {const f=fixture();assert(castTangMa(f.a,0,f.boss,f.hero,f.env.emit));step(f,1.1,dt);assert.equal(f.boss.tmInvulnerable,true);f.boss.stun=3;f.boss.recoil=1;step(f,.05,dt);assert.equal(f.boss.stun,0);assert.equal(f.boss.recoil,0);step(f,2.45,dt);assert.equal(f.hits.length,1);assert.equal(f.hits[0].mode,'launch');assert.equal(f.a.action,'idle');assert(f.a.cooldown[0]>0);}
 {const f=fixture();castTangMa(f.a,1,f.boss,f.hero);assert.equal(f.boss.maxHp,27000);assert.equal(f.boss.hp,13500);step(f,2.4,dt);assert.equal(castTangMa(f.a,1,f.boss,f.hero),false);f.a.rage=.05;f.boss.hp=6750;step(f,.1,dt);assert.equal(f.boss.maxHp,9000);assert.equal(f.boss.hp,2250);}
 {const f=fixture();castTangMa(f.a,2,f.boss,f.hero,f.env.emit);step(f,6.8,dt);assert(f.events.some(e=>e[0]==='void'));assert(f.events.some(e=>e[0]==='slam'));assert(f.stuns.length===1);assert.equal(f.hits.at(-1).mode,'slam');}
 {const f=fixture();castTangMa(f.a,3,f.boss,f.hero,f.env.emit);step(f,6.2,dt);assert.equal(f.hits.length,16);assert.equal(f.stuns.length,1);assert.equal(f.hits.at(-1).mode,'slam');assert(f.events.filter(e=>e[0]==='blink').length>=15);assert(f.a.cooldown[3]>70);}
 {const f=fixture();castTangMa(f.a,3,f.boss,f.hero,f.env.emit);f.hero.x=1800;step(f,1,dt);assert.equal(f.hits.length,0);assert.equal(f.a.action,'idle');}
 {const f=fixture();f.env.hit=()=>({hpLost:0,blocked:22});castTangMa(f.a,3,f.boss,f.hero,f.env.emit);step(f,1,dt);assert.equal(f.stuns.length,0);assert.equal(f.a.action,'idle');}
 {const f=fixture();castTangMa(f.a,1,f.boss,f.hero);step(f,2.4,dt);castTangMa(f.a,3,f.boss,f.hero,f.env.emit);step(f,3.4,dt);assert.equal(f.hits.length,16);assert.equal(f.hits[0].amount,44);assert.equal(f.a.action,'idle');}
}
console.log('Táng Ma: 4 chiêu, 30/60 FPS, va chạm, né, khiên, 16 đòn, buff/hết buff đạt.');
