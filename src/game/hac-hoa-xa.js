import { actionAudio } from './audio.js';
// Hắc Hỏa Xà: body undulates on the ground or in flight; projectiles use PixelFX.
import { game, player, dummy, camera, settings, clamp, WORLD_W, BASE_ZOOM } from './state.js';
import { receivePlayerDamage, fxEmit } from './skills.js';
import { applyUnblockedPlayerHit } from './character.js';
import { trackSkillSegment, queueSkillImpact, segmentCircleTOI, skillCollisionRatio } from './va-cham-ky-nang.js';

export const HAC_HOA_XA_SPEC = Object.freeze({ hp: 680, fangDamage: 55, fangSpeed: 390, fangRadius: 23, fangCooldown: 4.8, bodyHalf: 225, bodyHeight: 165, lungeDamage: 90, lungeCooldown: 5.3, poisonDamage: 12, poisonDuration: 5, defeatFade: 1.15 });
let snake = null;
let poison = { remaining: 0, tick: 1 };
export const getHacHoaXa = () => snake;
export function useHacHoaXa(instance) { snake = instance; }
export function resetHacHoaXa(flyer = false) { snake = { flyer, time: 0, phase: 'move', t: 0, fangCooldown: 1.7, lungeCooldown: 2.8, shots: [], hit: false, defeatTime: 0, landTime: 0, fallSpeed: 0, defeatedReady: false }; dummy.flying = flyer; return snake; }
export function resetSnakePoison() { poison = { remaining: 0, tick: 1 }; }
export function getSnakePoison() { return { ...poison }; }
export function applySnakePoison() { poison.remaining = HAC_HOA_XA_SPEC.poisonDuration; if (poison.tick <= 0 || poison.tick > 1) poison.tick = 1; }
export function updateSnakePoison(dt) {
 if (!game.running || player.hp <= 0 || poison.remaining <= 0) return;
 let time = Math.min(Math.max(0, dt), poison.remaining);
 poison.remaining = Math.max(0, poison.remaining - time);
 while (time + 1e-9 >= poison.tick && player.hp > 0) { time -= poison.tick; poison.tick = 1; receivePlayerDamage(HAC_HOA_XA_SPEC.poisonDamage, { isDot: true, notice: false }); }
 poison.tick -= time;
 if (poison.remaining <= 1e-8) { poison.remaining = 0; poison.tick = 1; }
}
function hurt(amount, fromX, poisonous = false) {
 const result = receivePlayerDamage(Math.max(1, Math.round(amount)), { fromX, notice: false });
 if (result.hpLost > 0 && player.hp > 0) { applyUnblockedPlayerHit('hurt'); if (poisonous) applySnakePoison(); }
 return result;
}
function shootFang() {
 actionAudio.monsterCue('snake_fang',dummy.x);
 const x = dummy.x + dummy.facing * 200, y = dummy.y - 90, dx = player.x - x, dy = player.y - 60 - y, len = Math.hypot(dx, dy) || 1;
 fxEmit('beastAttack',x,y,{style:'venom'},null,'front',{scale:1.15,rotation:dummy.facing<0?Math.PI:0});
 const vx = dx / len * HAC_HOA_XA_SPEC.fangSpeed, vy = dy / len * HAC_HOA_XA_SPEC.fangSpeed;
 const s = { x, y, vx, vy, age: 0, live: true, fx: fxEmit('venomFang', x, y, {}, null, 'front', { scale: 1.45, rotation: Math.atan2(vy, vx) }) };
 snake.shots.push(s);
 if (snake.shots.length > 2) { const old = snake.shots.shift(); old.live = false; old.fx?.fx.stop(); }
}
function updateFangs(dt) {
 for (const s of snake.shots) {
  if (!s.live) continue;
  const x0 = s.x, y0 = s.y; s.x += s.vx * dt; s.y += s.vy * dt; s.age += dt;
  if (s.fx) { s.fx.x = s.x; s.fx.y = s.y; }
  const hit = segmentCircleTOI(x0, y0, s.x, s.y, player.x, player.y - 60, HAC_HOA_XA_SPEC.fangRadius + 22);
  trackSkillSegment({ ref: s, side: 'boss', kind: 'venom', power: 100, x0, y0, x1: x0 + (s.x - x0) * (hit ?? 1), y1: y0 + (s.y - y0) * (hit ?? 1), t1: hit ?? 1, radius: HAC_HOA_XA_SPEC.fangRadius, onDestroy: () => { s.live = false; s.fx?.fx.stop(); } });
  if (hit !== null) queueSkillImpact(s, hit, () => { if (!s.live) return; s.live = false; s.fx?.fx.stop(); hurt(HAC_HOA_XA_SPEC.fangDamage * skillCollisionRatio(s), x0, true); fxEmit('beastAttack',player.x,player.y-60,{style:'venom'},null,'front',{scale:1.2}); fxEmit('hitSpark', player.x, player.y - 60, { palette: ['#14261b', '#345c2a', '#75b737', '#c8f988', '#ecffb1'] }, null, 'front', { scale: .9 }); });
  if (s.age >= 3 || s.x < 0 || s.x > WORLD_W || s.y > 2400 || s.y < -3000) { queueSkillImpact(s,1,()=>{s.live=false;s.fx?.fx.stop();}); }
 }
 snake.shots = snake.shots.filter(s => s.live);
}
export function updateHacHoaXa(dt) {
 if (!snake || !game.running || game.battlePhase !== 'fight') return;
 snake.time += dt; updateFangs(dt);
 if (dummy.broken || dummy.hp <= 0) {
  snake.defeatTime += dt; dummy.flying = false;
  for (const s of snake.shots) { s.live = false; s.fx?.fx.stop(); } snake.shots = [];
  const ground = game.terrain.firstSolidY(dummy.x) - .5;
  if (dummy.y < ground) { snake.fallSpeed = Math.min(1100, snake.fallSpeed + 1200 * dt); dummy.y = Math.min(ground, dummy.y + snake.fallSpeed * dt); }
  else { snake.landTime += dt; if (snake.landTime >= HAC_HOA_XA_SPEC.defeatFade) snake.defeatedReady = true; }
  return;
 }
 if (!snake.announced) { snake.announced = true; actionAudio.monsterCue('snake_spawn', dummy.x); }
 snake.fangCooldown = Math.max(0, snake.fangCooldown - dt); snake.lungeCooldown = Math.max(0, snake.lungeCooldown - dt);
 if (dummy.stun > 0 || dummy.trapped || dummy.recoil > 0) { if (snake.phase !== 'move') { snake.phase = 'move'; snake.t = 0; snake.fangCooldown = Math.max(snake.fangCooldown, .9); snake.lungeCooldown = Math.max(snake.lungeCooldown, 1.2); } return; }
 const dx = player.x - dummy.x, dy = player.y - dummy.y; if (snake.phase !== 'lunge') dummy.facing = dx >= 0 ? 1 : -1;
 if (snake.phase === 'move') {
  if (Math.abs(dx) < 600 && Math.abs(dy) < 260 && snake.lungeCooldown <= 0) { snake.phase = 'lungeWindup'; snake.t = 0; snake.hit = false; fxEmit('beastAttack',dummy.x+dummy.facing*200,dummy.y-90,{style:'venom'},null,'front',{scale:1.3,rotation:dummy.facing<0?Math.PI:0}); return; }
  if (Math.hypot(dx,dy) < 930 && snake.fangCooldown <= 0) { snake.phase = 'fang'; snake.t = 0; snake.hit = false; fxEmit('venomFang', dummy.x + dummy.facing * 200, dummy.y - 90, {}, null, 'front', { scale: .8, rotation: dummy.facing < 0 ? Math.PI : 0 }); return; }
  const slow = dummy.slow > 0 ? .45 : 1, speed = (snake.flyer ? 150 : 125) * slow;
  if (Math.abs(dx) > 420) dummy.x = clamp(dummy.x + Math.sign(dx) * Math.min(Math.abs(dx) - 420, speed * dt), 75, WORLD_W - 75);
  const ground = game.terrain.firstSolidY(dummy.x) - .5;
  const shouldFly = snake.flyer || player.y < ground - 160;
  const targetY = shouldFly ? Math.min(ground - 150, player.y - 115) + Math.sin(snake.time * 3) * 8 : ground;
  dummy.y += clamp(targetY - dummy.y, -145 * dt * slow, 145 * dt * slow);
  dummy.flying = dummy.y < ground - 8;
 } else {
  snake.t += dt;
  if (snake.phase === 'fang') { if (!snake.hit && snake.t >= .55) { snake.hit = true; shootFang(); } if (snake.t >= .85) { snake.phase = 'move'; snake.fangCooldown = HAC_HOA_XA_SPEC.fangCooldown; } }
  else if (snake.phase === 'lungeWindup' && snake.t >= .6) { actionAudio.monsterCue('snake_lunge', dummy.x); snake.phase = 'lunge'; snake.t = 0; snake.startX = dummy.x; snake.startY = dummy.y; const sign = Math.sign(player.x - dummy.x) || dummy.facing; snake.endX = clamp(player.x + sign * 90, 60, WORLD_W - 60); snake.endY = player.y; }
  else if (snake.phase === 'lunge') {
   const x0 = dummy.x + dummy.facing * 200, y0 = dummy.y - 90, u = clamp(snake.t / .48, 0, 1); dummy.x = snake.startX + (snake.endX - snake.startX) * u; dummy.y = Math.min(game.terrain.firstSolidY(dummy.x) - .5, snake.startY + (snake.endY - snake.startY) * u); dummy.flying = dummy.y < game.terrain.firstSolidY(dummy.x) - 8;
   if (!snake.hit && segmentCircleTOI(x0, y0, dummy.x + dummy.facing * 200, dummy.y - 90, player.x, player.y - 60, 75) !== null) { snake.hit = true; hurt(HAC_HOA_XA_SPEC.lungeDamage, x0); fxEmit('beastAttack',player.x,player.y-60,{style:'venom'},null,'front',{scale:1.3}); fxEmit('hitSpark', player.x, player.y - 60, { palette: ['#260d16', '#713041', '#d26450', '#ffd5ad'] }, null, 'front', { scale: 1 }); }
   if (u >= 1) { snake.phase = 'recover'; snake.t = 0; snake.lungeCooldown = HAC_HOA_XA_SPEC.lungeCooldown; }
  } else if (snake.phase === 'recover' && snake.t >= .45) { snake.phase = 'move'; snake.t = 0; }
 }
}
// One body curve drives movement, aerial flight, casting, hit reactions and collapse.
export function hacHoaXaPose() {
 if (!snake) return { mode: 'idle', alpha: 1 };
 if (dummy.broken || dummy.hp <= 0) return { mode: snake.landTime > 0 ? 'death' : 'fall', alpha: snake.landTime < .65 ? 1 : Math.max(0, 1 - (snake.landTime - .65) / .5) };
 if (dummy.stun > 0 || dummy.trapped || dummy.recoil > 0) return { mode: 'controlled', alpha: 1 };
 return { mode: snake.phase === 'fang' ? 'fang' : snake.phase === 'lunge' || snake.phase === 'lungeWindup' ? 'lunge' : dummy.flying ? 'fly' : 'move', alpha: 1 };
}
export function drawHacHoaXa() {
 if (!snake || !game.ctx || !dummy.visible) return;
 const ctx = game.ctx, x = dummy.x - camera.x + game.viewW / 2, y = dummy.y - camera.y + game.viewH / 2, pose = hacHoaXaPose();
 const t = snake.time, wave = pose.mode === 'controlled' ? .4 : pose.mode === 'death' ? .15 : 1, air = dummy.flying || pose.mode === 'fall';
 ctx.save(); ctx.translate(x, y - 42); ctx.globalAlpha = pose.alpha; if (dummy.facing < 0) ctx.scale(-1, 1); if (pose.mode === 'controlled') ctx.translate(Math.sin(t * 26) * 3, 1);
 const atlas = game.images.hac_hoa_xa;
 if (atlas) {
  let row = air ? 1 : 0, frame = Math.floor(t * (dummy.slow > 0 ? 4 : 7)) % 4;
  if (pose.mode === 'fang') { row = 2; frame = Math.min(2, Math.floor(snake.t / .24)); }
  else if (pose.mode === 'lunge') { row = 2; frame = snake.phase === 'lungeWindup' ? 1 : 2; }
  else if (pose.mode === 'controlled') { row = 3; frame = Math.floor(t * 7) % 2; }
  else if (pose.mode === 'fall' || pose.mode === 'death') { row = 3; frame = pose.mode === 'fall' ? 1 : snake.landTime < .25 ? 2 : 3; }
  ctx.imageSmoothingEnabled = true; ctx.drawImage(atlas, frame * 384, row * 256, 384, 256, -288, -255, 576, 384);
 } else {
 ctx.scale(3, 3); ctx.translate(0, -25);
 // Deep purple edges and red embers give the moving serpent a black-fire silhouette.
 for (let i = 12; i >= 0; i--) {
  const px = -i * 11, py = Math.sin(t * (air ? 5 : 8) - i * .6) * (air ? 17 : 8) * wave + i * (air ? .6 : 1.2), r = Math.max(3, 20 - i * 1.2);
  ctx.fillStyle = '#140d1b'; ctx.beginPath(); ctx.ellipse(px, py, r + 2, r * .78 + 2, -.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = i % 2 ? '#30232f' : '#45303a'; ctx.beginPath(); ctx.ellipse(px, py - 2, r, r * .69, -.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7b4044'; ctx.fillRect(px - r * .42, py - r * .5, Math.max(2, r * .55), Math.max(2, r * .18));
  if (i % 3 === 0 && pose.mode !== 'death') { const flicker = 4 + 5 * (1 + Math.sin(t * 9 + i)); ctx.fillStyle = i % 2 ? '#a33a33' : '#792851'; ctx.beginPath(); ctx.moveTo(px - 7, py - r * .5); ctx.lineTo(px - 3, py - r - flicker); ctx.lineTo(px + 2, py - r * .5); ctx.fill(); }
 }
 // Triangular head, red eyes, horns and opening fangs.
 ctx.fillStyle = '#130f1b'; ctx.beginPath(); ctx.moveTo(-12,-20);ctx.lineTo(18,-29);ctx.lineTo(48,-12);ctx.lineTo(42,8);ctx.lineTo(8,15);ctx.lineTo(-17,5);ctx.closePath();ctx.fill();
 ctx.fillStyle = dummy.flash > 0 ? '#dcc3ba' : '#513239'; ctx.beginPath();ctx.moveTo(2,-17);ctx.lineTo(21,-22);ctx.lineTo(43,-10);ctx.lineTo(28,-1);ctx.lineTo(3,2);ctx.closePath();ctx.fill();
 ctx.fillStyle='#7b4b4a';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(-5,-38);ctx.lineTo(10,-23);ctx.moveTo(12,-24);ctx.lineTo(14,-42);ctx.lineTo(23,-23);ctx.fill();
 ctx.fillStyle='#ff5b40';ctx.fillRect(20,-16,7,4);ctx.fillStyle='#fff3bd';ctx.fillRect(24,-15,2,2);
 if (pose.mode === 'fang' || pose.mode === 'lunge') {ctx.fillStyle='#1a0e13';ctx.beginPath();ctx.moveTo(21,0);ctx.lineTo(43,-5);ctx.lineTo(42,12);ctx.lineTo(19,9);ctx.fill();ctx.fillStyle='#e5e9cf';ctx.beginPath();ctx.moveTo(34,0);ctx.lineTo(39,0);ctx.lineTo(36,9);ctx.fill();ctx.fillStyle='#a0df5f';ctx.fillRect(41,7,4,4);}
 }
 ctx.restore();
 if (dummy.broken || dummy.hp <= 0) return;
 const scale = clamp(BASE_ZOOM / (settings.zoom || .5385), 1, 2.5); ctx.save();ctx.translate(x,y-250);ctx.scale(scale,scale);ctx.textAlign='center';ctx.font='bold 10px system-ui,sans-serif';ctx.fillStyle='#ffe2d6';ctx.fillText('HẮC HỎA XÀ',0,-8);
 if (pose.mode==='controlled'||dummy.slow>0) {ctx.fillStyle='#ffe894';ctx.fillText(dummy.trapped?'✦ PHONG TỎA ✦':dummy.stun>0?'✦ CHOÁNG ✦':'❄ LÀM CHẬM',0,-22);} else if (dummy.monsterPoison) {ctx.fillStyle='#b9f97e';ctx.fillText('☠ NHIỄM ĐỘC',0,-22);} else if (pose.mode==='fang'||snake.phase==='lungeWindup') {ctx.fillStyle='#c5fc8d';ctx.fillText(pose.mode==='fang'?'ĐỘC NHA':'LAO CẮN',0,-22);}
 ctx.fillStyle='#21151e';ctx.fillRect(-48,0,96,7);ctx.fillStyle='#d75950';ctx.fillRect(-47,1,94*clamp(dummy.hp/dummy.maxHp,0,1),5);ctx.restore();
}
export function finishHacHoaXa() { if (!snake) return; for (const s of snake.shots) s.fx?.fx.stop(); snake.shots = []; }
