import { getSkillStruggle } from './va-cham-ky-nang.js';
import { clamp, game, player, dummy, WORLD_W, NPC_HALF, HERO_HALF, settings, showNotice, applyRealmToEntity, getRealmSuppressionScale, isMeleeBoss } from './state.js';
import { receivePlayerDamage, getCharge, getFireballs, getThuyKiem, getNguHanh, fxEmit } from './skills.js';
import { applyUnblockedPlayerHit, applyStrongPlayerHit } from './character.js';
import { createHuyetThuState, castHuyetThu, stepHuyetThu, renderHuyetThuWorld } from './huyet-thu.js';
import { createHuyetKimTuyenState, beginHuyetKimTuyen, releaseHuyetKimTuyen, stepHuyetKimTuyen, renderHuyetKimTuyenWorld } from './huyet-kim-tuyen.js';
import { createThonLinhHuyetState, castThonLinhHuyet, stopThonLinhHuyet, stepThonLinhHuyet, renderThonLinhHuyetWorld } from './thon-linh-huyet.js';
import { createHuyetBaoState, castHuyetBao, stepHuyetBao, renderHuyetBaoWorld } from './huyet-bao.js';
import { renderThoThuanWorld } from './tho-thuan.js';
import { actionAudio } from './audio.js';

// AI Chiến Thuật Kim Đan Cảnh: Phản xạ né đạn, bật Huyết Thuẫn đúng nhịp nguy hiểm, đấu phép và phối hợp combo theo tình huống.
let ai;
function makeDamage(scale, applySuppression = true, strongMode = null) {
  let fractional = 0;
  return (victim, amount, options = {}) => {
    if (victim !== player || player.hp <= 0 || !game.running || game.battlePhase !== 'fight') return 0;
    const realmMod = applySuppression
      ? getRealmSuppressionScale(dummy.realmTier || 3, player.realmTier || 2)
      : 1.0;
    fractional += Math.max(0, amount * scale * realmMod);
    const whole = Math.floor(fractional + 1e-8);
    if (!whole) return 0;
    fractional -= whole;
    const result = receivePlayerDamage(whole, { fromX: dummy.x, notice: false, isDot: !!options.isDot });
    if(result.hpLost>0&&!options.isDot&&player.hp>0){
      if(strongMode&&whole>=75)applyStrongPlayerHit({sourceX:dummy.x,mode:strongMode});
      else if(whole>=45)applyUnblockedPlayerHit('hurt');
    }
    return result.hpLost;
  };
}

// Phân tích mối đe dọa từ kỹ năng & đạn đang bay tới của người chơi
function analyzeIncomingThreat() {
  const bossCenterY = dummy.y - 56;
  let imminentHit = false;
  let incomingProjectile = null;
  let minEta = 999;

  const fireballs = getFireballs?.() || [];
  for (const f of fireballs) {
    const toBossX = dummy.x - f.x;
    const toBossY = bossCenterY - f.y;
    const dist = Math.hypot(toBossX, toBossY);
    const speed = Math.max(1, Math.hypot(f.vx || 0, f.vy || 0));
    const dot = (toBossX * (f.vx || 0) + toBossY * (f.vy || 0)) / (dist * speed || 1);
    if (dot > 0.35 && dist < 520) {
      const eta = dist / speed;
      if (eta < minEta) {
        minEta = eta;
        incomingProjectile = { x: f.x, y: f.y, vx: f.vx, vy: f.vy, dist, eta, power: f.power || 1 };
      }
      if (dist < 250 || eta < 0.42) imminentHit = true;
    }
  }

  const charge = getCharge?.();
  const playerChargingLightning =
    charge && charge.kind === 'lightning' && (charge.chargedSeconds || 0) >= 0.55;
  const playerChargingHeavyFire =
    charge && charge.kind === 'fire' && (charge.chargedSeconds || 0) >= 0.45;

  const tk = getThuyKiem?.();
  const thuyKiemDanger =
    tk && (tk.phase === 'seal' || tk.phase === 'flight');

  const nh = getNguHanh?.();
  const nguHanhDanger = nh && ['launch', 'form', 'prison', 'converge'].includes(nh.phase);

  if (playerChargingLightning || thuyKiemDanger || nguHanhDanger) {
    imminentHit = true;
  }

  return {
    imminentHit,
    incomingProjectile,
    playerCharging: !!charge,
    playerChargeKind: charge?.kind || null,
    playerChargeSec: charge?.chargedSeconds || 0,
    playerChargingLightning,
    playerChargingHeavyFire,
    thuyKiemDanger,
    nguHanhDanger,
  };
}

export function resetBossAI() {
  applyRealmToEntity(dummy, 'kim_dan', true);
  dummy.combatStyle = dummy.combatStyle || 'magic';
  dummy.flying = !isMeleeBoss(dummy);
  dummy.vx = 0;
  dummy.vy = 0;
  ai = {
    thu: createHuyetThuState(),
    kim: createHuyetKimTuyenState(),
    thon: createThonLinhHuyetState(),
    bao: createHuyetBaoState(),
    choice: 0,
    wait: 1.15,
    charge: 0,
    targetChargeTime: 1.15,
    shield: 0,
    shieldCooldown: 4.5,
    sequenceAtBao: 0,
    strafePhase: 0,
    dodgeTimer: 0,
    dodgeDirY: -1,
    dodgeDirX: 0,
    lastSkill: '',
    comboStep: 0,
  };
  ai.thu.damageTarget = makeDamage(.46,true,'launch');
  ai.kim.damageTarget = makeDamage(.46);
  ai.thon.damageTarget = makeDamage(.68);
  ai.bao.damageTarget = makeDamage(1,false,'slam');
  dummy.shieldActive = false; dummy.bossAction = ''; dummy.bossWalk = false; dummy.bossActionTime = 0;
  return ai;
}
export function getBossAI() { return ai; }
function action(name,duration=0,loop=false) { if (dummy.bossAction !== name || dummy.bossClipDuration !== duration || dummy.bossClipLoop !== loop) { dummy.bossAction = name; dummy.bossActionTime = 0; dummy.bossClipDuration=duration; dummy.bossClipLoop=loop; dummy.bossClipStart=0; } }
function cue(name,x=dummy.x+(dummy.facing||1)*34,y=dummy.y-78,scale=1){fxEmit('huyetfx_'+name,x,y,{},null,'front',{scale});}
export function huyetBossAction(a){
 if(['seal','gather','pinch','blast'].includes(a.bao.phase)){if(a.bao.phase==='seal')return ['hand_seal',1.05,false];if(a.bao.phase==='gather')return ['charge_raise',.6,false];if(a.bao.phase==='pinch')return ['charge_hold',.65,true];return a.bao.clock<.45?['cast_fire',.45,false]:['',0,false];}
 if(a.thu.phase==='cast')return a.thu.castTime<.4?['hand_seal',.4,false]:['cast_fire',.55,false];
 if(a.thu.phase==='hand'&&a.thu.hand&&a.thu.hand.life<.24)return ['cast_fire',.55,false];
 if(a.thon.phase==='cast')return a.thon.t<.48?['charge_raise',.48,false]:['charge_hold',.7,true];
 if(a.thon.phase==='drain')return ['charge_hold',.7,true];
 if(a.kim.phase==='charge')return a.kim.chargeTime<.42?['charge_raise',.42,false]:['charge_hold',.7,true];
 if(a.kim.phase==='release'&&a.kim.elapsed<.45)return ['cast_fire',.45,false];
 return ['',0,false];
}

export function updateBossAI(dt) {
  if (!ai || game.battlePhase !== 'fight' || !dummy.visible || dummy.broken || player.hp <= 0 || getSkillStruggle()) return;
  dummy.facing = player.x < dummy.x ? -1 : 1;
  dummy.mana = Math.min(dummy.maxMana, dummy.mana + (dummy.manaRegen || 20) * dt);
  ai.shieldCooldown = Math.max(0, ai.shieldCooldown - dt);
  ai.dodgeTimer = Math.max(0, (ai.dodgeTimer || 0) - dt);
  ai.strafePhase += dt * (dummy.hp < dummy.maxHp * 0.5 ? 1.35 : 1);
  const melee = isMeleeBoss(dummy);
  const enraged = dummy.hp < dummy.maxHp * 0.55;

  if (dummy.shieldActive) {
    ai.shield -= dt;
    dummy.mana = Math.max(0, dummy.mana - 2 * dt);
    if (ai.shield <= 0 || dummy.mana <= 0) dummy.shieldActive = false;
  }
  if (player.shieldActive) {
    ai.thu.targetBleed.active = false;
    ai.thu.targetBleed.timeLeft = 0;
    ai.kim.bleedTimer = 0;
    ai.kim.bleedTickTimer = 0;
    ai.kim.wounds = [];
  }
  if (['seal','gather','pinch'].includes(ai.bao.phase) && dummy.hitSequence !== ai.sequenceAtBao) {
    ai.bao.phase = 'done'; ai.bao.motes = []; ai.bao.flash = 0; ai.bao.radius = 0;
    actionAudio.stopBloodCataclysmGather();
    ai.wait = 1.8; action(''); showNotice('ĐÃ NGẮT HUYẾT BẠO!');
  }
  if (dummy.stun > 0 || dummy.trapped) {
    if (ai.thu.phase === 'cast') { ai.thu.phase = 'cooldown'; ai.thu.cooldown = 5; }
    if (ai.kim.phase === 'charge') { ai.kim.phase = 'cooldown'; ai.kim.cooldown = 8; ai.kim.heldPointerId = null; actionAudio.stopBloodThreadCharge(); }
    if (['cast', 'drain'].includes(ai.thon.phase)) stopThonLinhHuyet(ai.thon, dummy);
    dummy.vx = 0;
    dummy.vy = 0;
    ai.wait = Math.max(ai.wait, 0.85);
  }
  const beforeThu=ai.thu.phase,beforeKim=ai.kim.phase,beforeThon=ai.thon.phase,beforeBao=ai.bao.phase;
  stepHuyetThu(ai.thu, dt, dummy, player);
  stepHuyetKimTuyen(ai.kim, dt, dummy, player);
  stepThonLinhHuyet(ai.thon, dt, dummy, player);
  stepHuyetBao(ai.bao, dt, dummy, player);
  if(beforeThu==='cast'&&ai.thu.phase==='hand')cue('handLaunch');
  if(beforeKim==='charge'&&ai.kim.phase==='release')cue('threadRelease');
  if(beforeThon==='cast'&&ai.thon.phase==='drain')cue('siphon');
  if(beforeBao==='pinch'&&ai.bao.phase==='blast')cue('burst',dummy.x,dummy.y-75,1.4);
  if (player.hp <= 0) return;

  const threat = analyzeIncomingThreat();

  // 1. Phản xạ phòng thủ thông minh: Tự động bật Huyết Thuẫn ngay khi phát hiện đòn hiểm sắp trúng
  const baoCast = ['seal','gather','pinch','blast'].includes(ai.bao.phase);
  if (
    !baoCast &&
    !dummy.shieldActive &&
    dummy.stun <= 0 &&
    !dummy.trapped &&
    ai.shieldCooldown <= 0 &&
    dummy.mana >= 25 &&
    threat.imminentHit
  ) {
    dummy.shieldActive = true;
    cue('shield',dummy.x,dummy.y-65,1.15);
    ai.shield = threat.nguHanhDanger || threat.thuyKiemDanger ? 3.2 : 2.5;
    ai.shieldCooldown = enraged ? 9.5 : 11.5;
    showNotice('HUYẾT DỰ PHẢN XẠ · HUYẾT THUẪN HỘ THỂ!');
  }

  // 2. Điều chỉnh thời gian tụ lực Huyết Kim Tuyến thông minh theo tình huống
  if (ai.kim.phase === 'charge') {
    ai.charge += dt;
    const shouldReleaseEarly = threat.imminentHit && !dummy.shieldActive && ai.charge >= 0.55;
    if (ai.charge >= (ai.targetChargeTime || 1.15) || shouldReleaseEarly) {
      releaseHuyetKimTuyen(ai.kim);
    }
  }

  const busy = baoCast || ai.thu.phase === 'cast' || ai.kim.phase === 'charge' || ['cast','drain'].includes(ai.thon.phase);
  action(...huyetBossAction(ai));
  dummy.bossActionTime += dt;
  dummy.bossWalk = false;
  if (dummy.stun > 0 || dummy.trapped) return;

  const dx = player.x - dummy.x;
  const dy = player.y - dummy.y;
  const distance = Math.hypot(dx, dy);
  const absDx = Math.abs(dx);

  // 3. Kích hoạt cơ động né đạn trên không khi có Hỏa Cầu / Thủy Kiếm bay tới
  if (!melee && (threat.incomingProjectile || threat.thuyKiemDanger) && ai.dodgeTimer <= 0) {
    ai.dodgeTimer = 0.55;
    const proj = threat.incomingProjectile;
    if (proj) {
      // Lách vuông góc với đường đạn (vọt lên cao nếu đạn bắn ngang/thấp, hoặc hạ nhanh nếu đạn từ trên xuống)
      ai.dodgeDirY = proj.y >= dummy.y - 70 ? -1 : 1;
      ai.dodgeDirX = absDx < 320 ? -Math.sign(dx || 1) : Math.sign(dx || 1) * 0.6;
    } else {
      // Né Thủy Kiếm giáng từ trên trời xuống bằng cách lướt ngang tốc độ cao
      ai.dodgeDirY = -0.5;
      ai.dodgeDirX = dummy.x > WORLD_W * 0.5 ? -1 : 1;
    }
  }

  if (!melee && game.terrain) {
    // Boss Pháp Thuật / Tầm Xa: Ngự Không cơ động, né đạn và chiếm vị trí thượng phong trên không
    dummy.flying = true;
    const groundAtBoss = game.terrain.firstSolidY(dummy.x) - 0.5;
    const hoverWave = Math.sin(ai.strafePhase * 2.4) * 24;

    // Giữ độ cao chiến thuật: cao hơn người chơi một khoảng để dễ công kích xuống, hoặc vọt cao khi né đòn
    let desiredAlt = player.flying
      ? clamp(player.y - 55 + hoverWave, -980, groundAtBoss - 140)
      : groundAtBoss - 175 + hoverWave;

    if (ai.dodgeTimer > 0) {
      desiredAlt = clamp(dummy.y + ai.dodgeDirY * 145, -980, groundAtBoss - 120);
    } else if (threat.playerChargingLightning) {
      // Khi người chơi tụ Lôi Bạo, liên tục đảo độ cao để gây nhiễu
      desiredAlt = clamp(groundAtBoss - 230 + Math.cos(ai.strafePhase * 5) * 65, -980, groundAtBoss - 130);
    }

    const baseFlyX = dummy.slow > 0 ? 175 : enraged ? 450 : 395;
    const baseFlyY = dummy.slow > 0 ? 150 : enraged ? 380 : 335;
    const flySpeedX = baseFlyX * (busy ? 0.35 : 1);
    const flySpeedY = baseFlyY * (busy ? 0.42 : 1);

    // Khoảng cách tối ưu thay đổi theo trạng thái kỹ năng
    const idealMinDist = ai.thon.phase === 'drain' ? 220 : player.shieldActive ? 290 : 310;
    const idealMaxDist = ai.thon.phase === 'drain' ? 520 : 540;

    let desiredVx = 0;
    if (ai.dodgeTimer > 0 && !baoCast) {
      desiredVx = ai.dodgeDirX * baseFlyX * 1.15;
    } else if (!busy) {
      if (absDx > idealMaxDist) {
        desiredVx = Math.sign(dx) * flySpeedX;
      } else if (absDx < idealMinDist) {
        // Kéo giãn cự ly thông minh (không lùi kịch biên bản đồ)
        const retreatDir = -Math.sign(dx || 1);
        const nearWall = (retreatDir < 0 && dummy.x < 220) || (retreatDir > 0 && dummy.x > WORLD_W - 220);
        // Nếu bị dồn vào góc bản đồ, vọt qua đầu người chơi để đổi bên!
        desiredVx = nearWall ? Math.sign(dx || 1) * flySpeedX * 1.15 : retreatDir * flySpeedX * 0.85;
        if (nearWall) desiredAlt = Math.min(desiredAlt, player.y - 160);
      } else {
        // Lượn vòng chiến thuật trên không
        desiredVx = Math.cos(ai.strafePhase * 1.7) * flySpeedX * 0.42;
      }
    }

    const altDiff = desiredAlt - dummy.y;
    const desiredVy = clamp(altDiff * 4.6, -flySpeedY, flySpeedY);

    dummy.vx = (dummy.vx || 0) + (desiredVx - (dummy.vx || 0)) * (1 - Math.exp(-dt * 10));
    dummy.vy = (dummy.vy || 0) + (desiredVy - (dummy.vy || 0)) * (1 - Math.exp(-dt * 10));

    const nextX = clamp(dummy.x + dummy.vx * dt, 75, WORLD_W - 75);
    const nextGroundY = game.terrain.firstSolidY(nextX) - 0.5;
    const minSafeY = nextGroundY - 95;
    const nextY = Math.min(minSafeY, Math.max(-1050, dummy.y + dummy.vy * dt));

    if (!game.terrain.solid(nextX, nextY - 40)) {
      dummy.x = nextX;
      dummy.y = nextY;
    }
    const targetLean = clamp((dummy.vx / 420) * 0.09 * dummy.facing, -0.10, 0.10);
    dummy.lean += (targetLean - (dummy.lean || 0)) * (1 - Math.exp(-dt * 10));
  } else if (!busy && absDx > 360 && game.terrain) {
    // Boss Cận Chiến (Kiếm, Quyền, Thể tu): di chuyển áp sát trên mặt đất
    dummy.flying = false;
    const speed = dummy.slow > 0 ? 38 : 108;
    const next = Math.max(65, Math.min(WORLD_W - 65, dummy.x + Math.sign(dx) * speed * dt));
    const foot = game.terrain.firstSolidY(next) - .5;
    const clear = Math.abs(next - player.x) > HERO_HALF + NPC_HALF + 7 && Math.abs(foot - dummy.y) < 25 && !game.terrain.solid(next, foot - 65);
    if (clear) { dummy.x = next; dummy.y = foot; dummy.gait += speed * dt / 50 * 8; dummy.bossWalk = true; }
  }

  if (busy) return;
  ai.wait -= dt;
  if (ai.wait > 0) return;

  // 4. Tuyệt kỹ sinh tử: Huyết Bạo khi HP <= 10%
  if (dummy.hp > 0 && dummy.hp <= dummy.maxHp * 0.10 && !ai.bao.usedOnce) {
    dummy.shieldActive = false;
    if (castHuyetBao(ai.bao, dummy)) {
      ai.sequenceAtBao = dummy.hitSequence;
      cue('handSeal',dummy.x,dummy.y-75,1.4);
      action('hand_seal');
      ai.wait = 1.0;
      showNotice('HUYẾT DỰ KẾT ẤN HUYẾT BẠO! TẤN CÔNG ĐỂ NGẮT CHIÊU!');
      return;
    }
  }

  // 5. Hệ thống quyết định kỹ năng thông minh (Utility & Combo AI)
  const canThu = ai.thu.phase === 'ready' && dummy.mana >= 35;
  const canKim = ai.kim.phase === 'ready' && dummy.mana > 15 && dummy.hp > 25;
  const canThon = ai.thon.phase === 'ready' && distance < 920;
  const canShield = !dummy.shieldActive && ai.shieldCooldown <= 0 && dummy.mana >= 25;

  // Ưu tiên A: Đấu phép / Đánh chặn khi người chơi đang tụ lực Hỏa Cầu, Lôi Bạo hoặc kết ấn Thủy Kiếm
  if ((threat.playerCharging || threat.thuyKiemDanger) && distance < 980) {
    if (canThu && (ai.lastSkill !== 'thu' || !canKim)) {
      dummy.mana -= 35;
      castHuyetThu(ai.thu, dummy, player);
      cue('handSeal');
      action('hand_seal');
      ai.lastSkill = 'thu';
      ai.comboStep = 1;
      ai.wait = enraged ? 1.1 : 1.35;
      showNotice('HUYẾT DỰ ĐẤU PHÁP · HUYẾT THỦ TRẢO HỒN!');
      return;
    }
    if (canKim) {
      ai.charge = 0;
      ai.targetChargeTime = threat.playerChargeSec > 0.7 ? 0.85 : 1.15;
      beginHuyetKimTuyen(ai.kim, dummy, player, 'boss');
      cue('threadCharge');
      action('charge_hold');
      ai.lastSkill = 'kim';
      ai.comboStep = 0;
      ai.wait = enraged ? 1.35 : 1.65;
      showNotice('HUYẾT DỰ ĐẤU PHÁP · HUYẾT KIM TUYẾN!');
      return;
    }
  }

  // Ưu tiên B: Phá Thổ Thuẫn hoặc Hút máu/linh lực khi người chơi bật khiên hoặc Boss hao hụt máu/MP
  const bossNeedsSustain = dummy.hp < dummy.maxHp * 0.78 || dummy.mana < dummy.maxMana * 0.55;
  if (canThon && (player.shieldActive || bossNeedsSustain || absDx < 460) && ai.lastSkill !== 'thon') {
    castThonLinhHuyet(ai.thon, dummy, player);
    cue('siphon');
    action('hand_seal');
    ai.lastSkill = 'thon';
    ai.comboStep = 1;
    ai.wait = enraged ? 1.25 : 1.55;
    showNotice(
      player.shieldActive
        ? 'HUYẾT DỰ PHÁ THUẪN · THÔN LINH HUYẾT!'
        : 'HUYẾT DỰ · THÔN LINH HUYẾT!'
    );
    return;
  }

  // Ưu tiên C: Combo liên hoàn (Sau Huyết Thủ hoặc Thôn Linh Huyết sẽ bồi ngay Huyết Kim Tuyến)
  if (ai.comboStep === 1 && canKim) {
    ai.charge = 0;
    // Nếu người chơi đang bật Thổ Thuẫn, tụ lực sâu để bào mạnh linh lực khiên; nếu không thì bắn nhanh bắt bài
    ai.targetChargeTime = player.shieldActive ? 1.45 : enraged ? 0.92 : 1.1;
    beginHuyetKimTuyen(ai.kim, dummy, player, 'boss');
    cue('threadCharge');
    action('charge_hold');
    ai.lastSkill = 'kim';
    ai.comboStep = 0;
    ai.wait = enraged ? 1.35 : 1.7;
    showNotice('HUYẾT DỰ LIÊN CHIÊU · HUYẾT KIM TUYẾN!');
    return;
  }

  // Ưu tiên D: Chủ động công kích tầm xa bằng Huyết Thủ hoặc Huyết Kim Tuyến
  if (canThu && (absDx >= 340 || !canKim)) {
    dummy.mana -= 35;
    castHuyetThu(ai.thu, dummy, player);
    cue('handSeal');
    action('hand_seal');
    ai.lastSkill = 'thu';
    ai.comboStep = 1;
    ai.wait = enraged ? 1.15 : 1.45;
    showNotice('HUYẾT DỰ · HUYẾT THỦ!');
    return;
  }

  if (canKim) {
    ai.charge = 0;
    ai.targetChargeTime = player.shieldActive ? 1.4 : distance > 620 ? 1.3 : 1.0;
    beginHuyetKimTuyen(ai.kim, dummy, player, 'boss');
    cue('threadCharge');
    action('charge_hold');
    ai.lastSkill = 'kim';
    ai.comboStep = 0;
    ai.wait = enraged ? 1.4 : 1.75;
    showNotice('HUYẾT DỰ · HUYẾT KIM TUYẾN!');
    return;
  }

  if (canThon) {
    castThonLinhHuyet(ai.thon, dummy, player);
    cue('siphon');
    action('hand_seal');
    ai.lastSkill = 'thon';
    ai.wait = enraged ? 1.4 : 1.75;
    showNotice('HUYẾT DỰ · THÔN LINH HUYẾT!');
    return;
  }

  if (canShield && absDx < 380) {
    dummy.shieldActive = true;
    cue('shield',dummy.x,dummy.y-65,1.15);
    ai.shield = 2.6;
    ai.shieldCooldown = 11.5;
    ai.lastSkill = 'shield';
    ai.wait = 1.0;
    showNotice('HUYẾT DỰ · HUYẾT THUẪN!');
    return;
  }

  ai.wait = 0.65;
}

export function drawBossEffects() {
  if (!ai || dummy.visible === false || settings.fxQuality === 'off') return;
  renderHuyetThuWorld(ai.thu);
  renderHuyetKimTuyenWorld(ai.kim);
  renderThonLinhHuyetWorld(ai.thon, dummy, player);
  renderHuyetBaoWorld(ai.bao, dummy);
  if (dummy.shieldActive) renderThoThuanWorld({active:true, blood:true, heroX:dummy.x, heroFeetY:dummy.y, impacts:[], shots:[]});
}
