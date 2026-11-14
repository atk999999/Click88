import { useEffect, useState } from 'react';
import { SkillIcon, SkillIconDefs } from './SkillIcons';
import TangMaPreview from './TangMaPreview';
import { LING_TIEU_X_OFFSETS, lingTieuAlignmentCss } from './game/ling-tieu-alignment.js';
import './game/pixelfx.js';
import './game/game.css';

/**
 * PK LOẠN CHIẾN — v0.1.33
 * Real React/Vite game shell. The original 0.1.32 gameplay logic lives in
 * src/game/engine.js. Change the skill and physics there; change the JSX UI
 * here. All existing 17 Diệp Tu animation strips remain genuine WebP sprites.
 *
 * The game engine owns the DOM behavior after mount; do not add React state to
 * engine-controlled attributes without migrating the corresponding handlers.
 */
const avatarBase = `${import.meta.env.BASE_URL}assets/avatars/`;
const diepTuAvatar = `${avatarBase}Diep_Tu_Avatar_100KB.webp`;
const huyetDuAvatar = `${avatarBase}Huyet_Du_Avatar_100KB.webp`;

const swordMoves = [
  { id:'idle', label:'Đứng', frames:8, duration:'1.2s' },
  { id:'walk', label:'Đi', frames:8, duration:'.9s' },
  { id:'run', label:'Chạy', frames:8, duration:'.65s' },
  { id:'jump_start', label:'Bật nhảy', frames:8, duration:'.48s' },
  { id:'jump_air', label:'Nhảy trên không', frames:8, duration:'.65s' },
  { id:'fall', label:'Rơi', frames:8, duration:'.95s' },
  { id:'land', label:'Đáp đất', frames:8, duration:'.48s' },
  { id:'fly_up', label:'Bay lên', frames:6, duration:'.8s' },
  { id:'hover', label:'Lơ lửng', frames:8, duration:'1.2s' },
  { id:'hand_seal', label:'Kết kiếm quyết', frames:8, duration:'1.2s' },
  { id:'hurt', label:'Trúng đòn', frames:8, duration:'.9s' },
  { id:'knockdown', label:'Bị đánh ngã', frames:8, duration:'1.1s' },
  { id:'down_idle', label:'Nằm', frames:8, duration:'1.5s' },
  { id:'getup', label:'Đứng dậy', frames:8, duration:'1.1s' },
  { id:'charge_raise', label:'Giơ kiếm tụ lực', frames:8, duration:'1.2s' },
  { id:'charge_hold', label:'Giữ kiếm tụ lực', frames:4, duration:'1s' },
  { id:'cast_fire', label:'Thi triển', frames:12, duration:'1.35s' },
  { id:'sword_attack', label:'Chém kiếm', frames:16, duration:'.8s' },
  { id:'teleport', label:'Thuấn di', frames:16, duration:'.8s' },
  { id:'sword_cast', label:'Thi pháp bằng kiếm', frames:12, duration:'1.35s' },
  { id:'sword_guard', label:'Đỡ đòn bằng kiếm', frames:16, duration:'.9s' },
] as const;
function SwordPreview() {
  const [move, setMove] = useState<(typeof swordMoves)[number]>(swordMoves[0]);
  const path = `${import.meta.env.BASE_URL}assets/sprites/ling_tieu/${move.id === 'sword_cast' ? 'cast_fire' : move.id}.webp`;
  const hasAlign = Object.prototype.hasOwnProperty.call(LING_TIEU_X_OFFSETS, move.id);
  const animNames = ['sword-frames', ...(hasAlign ? [`ling-align-${move.id}`] : []), ...(move.id === 'teleport' ? ['sword-fade'] : [])];
  const animTimings = [`steps(${move.frames}, end)`, ...(hasAlign ? ['steps(1, end)'] : []), ...(move.id === 'teleport' ? ['linear'] : [])];
  return <section id="swordPreview" className="menu-card secondary sword-preview hidden" aria-label="Thử hoạt ảnh kiếm tu">
    <style>{lingTieuAlignmentCss()}</style><h2>Lăng Tiêu · Bạch Y Kiếm Tu</h2>
    <p className="sword-preview-note">Xem trước ngoại hình và hoạt ảnh của boss vòng 2</p>
    <div className="sword-preview-stage" role="img" aria-label={`Hoạt ảnh ${move.label}`}>
      <div key={move.id} className={`sword-preview-sprite ${move.id === 'teleport' ? 'is-teleport' : ''}`} style={{backgroundImage: `url("${path}")`, backgroundSize: `${move.frames * 100}% 100%`, animationName: animNames.join(', '), animationDuration: animNames.map(() => move.duration).join(', '), animationTimingFunction: animTimings.join(', '), animationIterationCount: 'infinite', '--sprite-end': `${100 * move.frames / (move.frames - 1)}%`} as React.CSSProperties}></div>
    </div>
    <div className="sword-move-list">{swordMoves.map(item => <button key={item.id} type="button" className={move.id === item.id ? 'selected' : ''} aria-pressed={move.id === item.id} onClick={() => setMove(item)}>{item.label}</button>)}</div>
    <button id="backSwordPreview" type="button">Quay lại</button>
  </section>;
}

export default function App() {
  useEffect(() => {
    // Load AFTER React has mounted every original game control and canvas.
    // The dynamic import runs only once and preserves the original init() flow.
    void import('./game/engine.js');
  }, []);

  return (
    <>
      <SkillIconDefs />
      <main id="game" aria-label="PK Loạn Chiến">
      <canvas id="scene"></canvas>
      <div id="battleIntro" className="battle-intro hidden" aria-live="polite">
        <div id="introRound" className="intro-round">VÒNG 1</div>
        <div id="introBoss" className="intro-boss hidden">
          <div className="intro-boss-portrait-wrap">
            <img id="introBossAvatar" className="intro-boss-avatar" src={huyetDuAvatar} alt="Huyết Dự" />
          </div>
          <div className="intro-boss-info">
            <div className="intro-boss-header">
              <div className="intro-boss-title-group">
                <b id="introBossName">HUYẾT DỰ</b>
                <small id="introBossRound" className="intro-boss-round-pill">VÒNG 1</small>
              </div>
              <span id="introBossRealm">KIM ĐAN CẢNH</span>
            </div>
            <p id="introBossQuote" className="intro-boss-quote">
              “Chỉ bằng cảnh giới Trúc Cơ nhỏ bé mà dám cản đường bản tọa? Hôm nay máu và linh lực của ngươi sẽ tế luyện cho Huyết Đan của ta!”
            </p>
            <div className="intro-boss-footer">
              <small id="introBossHint" className="intro-boss-hint">Nhấn Tiếp tục hoặc phím Space để khai chiến</small>
              <button type="button" id="introContinueBtn" className="intro-continue-btn" aria-label="Tiếp tục vào chiến đấu">TIẾP TỤC ▸</button>
            </div>
          </div>
        </div>
        <div id="introCue" className="intro-cue hidden">KHAI CHIẾN</div>
      </div>
      <div id="hud" className="hud top-right-hud hidden">
        <button id="orientationBtn" className="smallBtn orientBtn" aria-label="Đổi chế độ màn hình dọc hoặc ngang" title="Chuyển chế độ màn hình">NGANG</button>
        <button id="pauseBtn" className="smallBtn" aria-label="Tạm dừng">☰</button>
      </div>

      {/* Thanh máu Boss Huyết Dự dài trên màn hình — Cảnh giới Kim Đan cảnh */}
      <div id="bossHud" className="boss-hud hidden" role="region" aria-label="Thanh máu Boss Huyết Dự - Kim Đan cảnh">
        <div className="boss-bar-shell">
          <div className="boss-portrait-box">
            <img id="bossAvatar" className="boss-avatar" src={huyetDuAvatar} alt="" />
          </div>
          <div className="boss-bar-content">
            <div className="boss-meta-row">
              <div className="boss-name-group">
                <span id="bossRound" className="boss-round-tag">VÒNG 1</span>
                <b id="bossName" className="boss-name-text">HUYẾT DỰ</b>
                <span id="bossEpithet" className="boss-epithet-tag">MA TU NGHỊCH MỆNH</span>
              </div>
              <div className="boss-realm-group">
                <span className="realm-prefix">CẢNH GIỚI:</span>
                <b id="bossRealm" className="realm-badge">KIM ĐAN CẢNH</b>
              </div>
              <div className="boss-hp-counter">
                <b id="bossHpText">3000 / 3000</b>
                <span id="bossHpPercent" className="boss-pct">100%</span>
              </div>
            </div>
            <div className="boss-hp-frame">
              <div className="boss-hp-trough">
                <i id="bossHpGhost" className="boss-hp-ghost"></i>
                <i id="bossHpFill" className="boss-hp-fill"></i>
                <div className="boss-hp-segments" aria-hidden="true">
                  <span></span><span></span><span></span><span></span><span></span>
                  <span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Màn hình thông báo Vòng 1: Boss Huyết Dự - Cảnh giới Kim Đan cảnh */}
      <div id="roundNotice" className="round-notice hidden" aria-live="assertive">
        <div className="round-notice-backdrop" id="closeRoundNoticeBackdrop"></div>
        <div className="round-notice-card">
          <div className="round-filigree-top">✦ ❖ ✦</div>
          <div className="round-phase-tag" id="roundNumText">VÒNG 1</div>
          <h1 className="round-boss-title" id="roundBossNameText">BOSS: HUYẾT DỰ</h1>
          <div className="round-realm-pill">
            <span className="realm-label-sub">CẢNH GIỚI</span>
            <b className="realm-value-main" id="roundRealmText">KIM ĐAN CẢNH</b>
          </div>
          <p className="round-flavor-text">Huyết khí xung thiên · Kiếm ý nghịch thiên quy tông</p>
          <div className="round-filigree-bot">✧ ❖ ✧</div>
          <button id="closeRoundNoticeBtn" type="button" className="round-close-btn" aria-label="Bắt đầu khiêu chiến Vòng 1">VÀO TRẬN QUYẾT ĐẤU</button>
        </div>
      </div>
      <div id="vitals" className="vitals hidden" aria-label="Cảnh giới, thanh máu và linh lực">
        <div className="player-realm-header">
          <span className="player-char-name" id="playerCharName">DIỆP TU</span>
          <b id="playerRealmBadge" className="player-realm-badge">TRÚC CƠ · SƠ KỲ</b>
        </div>
        <div className="vital hp">
          <div className="vital-label"><span>MÁU</span><b id="hpText">1200 / 1200</b></div>
          <div className="vital-track"><i id="hpFill"></i></div>
        </div>
        <div className="vital mp">
          <div className="vital-label"><span>LINH LỰC</span><b id="mpText">250 / 250</b></div>
          <div className="vital-track"><i id="mpFill"></i></div>
        </div>
        <div id="fusionBarrierStatus" className="cultivation-xp hidden" role="status">HỘ THỂ 0</div><div id="cultivationXp" className="cultivation-xp" aria-label="Kinh nghiệm tu luyện">EXP 0 / 100</div>
        <div id="roundMonsterCount" className="cultivation-xp" aria-label="Tiến độ diệt quái">VÒNG 1 · QUÁI 0 / 20</div>
        <span id="poisonStatus" className="poison-status hidden" role="status">☠ NHIỄM ĐỘC</span>
        <span id="playerStunStatus" className="player-stun-status hidden" role="status">✦ CHOÁNG</span>
      </div>
      <div id="controls" className="controls hidden">
      <div id="struggleHud" className="struggle-hud hidden" role="status"><b>GIẰNG CO KỸ NĂNG</b><span id="struggleMana">LINH LỰC</span><button type="button" id="cancelStruggle" aria-label="Hủy phép giằng co">HỦY PHÉP · C</button></div>
      <div className="joystick-block left-block"><div className="joystick" id="moveJoystick" role="group" aria-label="Vòng trái: đi, chạy, bay lên xuống"><span className="joy-ring"></span><span className="joy-mark top">▲</span><span className="joy-mark bottom">▼</span><span className="joy-mark left">◀</span><span className="joy-mark right">▶</span><span className="joy-thumb" id="moveThumb"></span></div><span className="joy-caption" id="moveCaption">ĐI / CHẠY · ĐỘ CAO</span></div>
      <div className="right-controls">
        <div className="charge-stack skill-deck" role="group" aria-label="Bảng kỹ năng nhân vật, ô kỹ năng đoạt được và Thần Thức">
          <div className="skill-row skill-row-rewards" role="group" aria-label="Năm ô kỹ năng đoạt được">
            <button type="button" id="lootSlot6" className="chargeBtn acquired empty" data-loot-slot="0" disabled aria-label="Ô kỹ năng 6 trống"><span className="skill-slot-badge">6</span><SkillIcon name="empty" id="lootSlot6Icon"/><b id="lootSlot6Title">Ô TRỐNG</b><small id="lootSlot6Sub">CHƯA CÓ</small></button>
            <button type="button" id="lootSlot7" className="chargeBtn acquired empty" data-loot-slot="1" disabled aria-label="Ô kỹ năng 7 trống"><span className="skill-slot-badge">7</span><SkillIcon name="empty" id="lootSlot7Icon"/><b id="lootSlot7Title">Ô TRỐNG</b><small id="lootSlot7Sub">CHƯA CÓ</small></button>
            <button type="button" id="lootSlot8" className="chargeBtn acquired empty" data-loot-slot="2" disabled aria-label="Ô kỹ năng 8 trống"><span className="skill-slot-badge">8</span><SkillIcon name="empty" id="lootSlot8Icon"/><b id="lootSlot8Title">Ô TRỐNG</b><small id="lootSlot8Sub">CHƯA CÓ</small></button>
            <button type="button" id="lootSlot9" className="chargeBtn acquired empty" data-loot-slot="3" disabled aria-label="Ô kỹ năng 9 trống"><span className="skill-slot-badge">9</span><SkillIcon name="empty" id="lootSlot9Icon"/><b id="lootSlot9Title">Ô TRỐNG</b><small id="lootSlot9Sub">CHƯA CÓ</small></button>
            <button type="button" id="lootSlot10" className="chargeBtn acquired empty" data-loot-slot="4" disabled aria-label="Ô kỹ năng 10 trống"><span className="skill-slot-badge">10</span><SkillIcon name="empty" id="lootSlot10Icon"/><b id="lootSlot10Title">Ô TRỐNG</b><small id="lootSlot10Sub">CHƯA CÓ</small></button>
          </div>
          <div className="skill-row skill-row-secondary">
            <button type="button" id="thanThucBtn" className="chargeBtn divine-eye" aria-pressed="false" aria-label="Thần Thức (Phím V): Kích hoạt tầm nhìn xa gấp 4 lần và mở rộng khóa mục tiêu lên 3600">
              <span className="skill-slot-badge eye-badge">V</span>
              <SkillIcon name="eye"/>
              <b id="thanThucTitle">THẦN THỨC</b>
              <small id="thanThucSub">TẦM NHÌN 4×</small>
            </button>
            <button type="button" id="thuyKiemBtn" className="chargeBtn water" data-skill-cast="water" aria-label="Kỹ năng 4: Thủy Kiếm">
              <span className="skill-slot-badge">4</span>
              <SkillIcon name="water" id="skill4Icon"/>
              <b id="thuyKiemTitle">THỦY KIẾM</b>
              <small id="thuyKiemSub">TAM KIẾM TRUY KÍCH</small>
            </button>
            <button type="button" id="nguHanhBtn" className="chargeBtn five-elements" data-skill-toggle="five_elements" aria-label="Kỹ năng 5: Ngũ Hành">
              <span className="skill-slot-badge">5</span>
              <SkillIcon name="five" id="skill5Icon"/>
              <b id="nguHanhTitle">NGŨ HÀNH</b>
              <small id="nguHanhSub">BẬT · ĐẠI TRẬN</small>
            </button>
          </div>
          <div className="skill-row skill-row-primary">
            <button type="button" className="chargeBtn fire" data-charge="fire" id="skillBtn1" aria-label="Kỹ năng 1: Hỏa Cầu">
              <span className="skill-slot-badge">1</span>
              <SkillIcon name="fire" id="skill1Icon"/>
              <b id="skill1Title">HỎA CẦU</b>
              <small id="hoaCauSub">GIỮ · CHÁY 10S</small>
            </button>
            <button type="button" className="chargeBtn lightning" data-charge="lightning" id="skillBtn2" aria-label="Kỹ năng 2: Lôi Bạo">
              <span className="skill-slot-badge">2</span>
              <SkillIcon name="lightning" id="skill2Icon"/>
              <b id="skill2Title">LÔI BẠO</b>
              <small id="loiBaoSub">GIỮ · TÊ LIỆT</small>
            </button>
            <button type="button" id="thoThuanBtn" className="chargeBtn earth" data-skill-toggle="earth" aria-label="Kỹ năng 3: Thổ Thuẫn">
              <span className="skill-slot-badge">3</span>
              <SkillIcon name="earth" id="skill3Icon"/>
              <b id="skill3Title">THỔ THUẪN</b>
              <small id="thoThuanSub">BẬT · HỘ THỂ</small>
            </button>
          </div>
        </div>
        <div className="action-stack">
          <button id="charBtn" className="action char-switch hidden" aria-label="Đổi nhân vật (Phím P)"><span className="char-pill tao">ĐẠO</span><b>DIỆP TU</b></button>
          <button data-key="jump" className="action jump" aria-label="Nhảy">NHẢY</button>
          <button id="flightBtn" className="action flight" aria-label="Bật tắt bay">BAY</button>
        </div>
      </div>
      </div>
      <div hidden id="tangMaTestControls" className="tang-combat-tools hidden" aria-label="Điều khiển thử chiêu boss"><span>THỬ CHIÊU BOSS</span><button id="tangMaCast0">1</button><button id="tangMaCast1">2</button><button id="tangMaCast2">3</button><button id="tangMaCast3">4</button></div>
      <div hidden id="fxDemo" className="fx-demo hidden" aria-label="Kiểm thử phản ứng nhân vật"><span className="fx-demo-title">TEST PIXELFX</span><button data-demo="seal">KẾT ẤN</button><button data-demo="hurt">TRÚNG ĐÒN</button><button data-demo="knockdown">NGÃ</button><button data-demo="huyet_thu" className="dummy-test">HUYẾT THỦ</button><button data-demo="huyet_kim_tuyen" className="dummy-test">KIM TUYẾN</button><button data-demo="thon_linh" className="dummy-test">THÔN LINH</button><button data-demo="wound_10" className="dummy-test">HP 10% TEST</button><button data-demo="huyet_bao" className="dummy-test">HUYẾT BẠO</button><button data-demo="shield_atk" className="dummy-test">ĐẠN THỬ THUẪN</button><button data-demo="dummy" className="dummy-test">ĐÁNH NPC</button><button data-demo="round1" className="dummy-test">BÁO VÒNG 1</button><button data-demo="npc" className="dummy-test">NPC GỐC · 17 ĐỘNG TÁC</button><button data-demo="patrol" className="dummy-test" id="patrolBtn">NPC DI CHUYỂN: TẮT</button></div>
      <div id="hint" className="hint hidden">Phím 1–5: KỸ NĂNG · V: THẦN THỨC</div>
      <div id="notice" className="notice hidden"><SkillIcon name="empty" id="noticeSkillIcon" className="notice-skill-art hidden"/><span id="noticeText"></span></div>
      <div id="tribulationHud" className="tribulation-hud hidden" role="status" aria-live="polite">LÔI KIẾP · 0 / 6</div>
      </main>
      <div id="overlay" className="overlay"><section id="menu" className="menu-card">
      <div className="brand-mark">✧</div><div className="eyebrow">TU TIÊN 2D · DI CHUYỂN &amp; VẬT LÝ</div><h1>PK LOẠN CHIẾN</h1><p className="menu-sub">PHIÊN BẢN 0.1.44-AJ1 · U MINH MA VỰC</p>
      <p id="defeatMessage" className="helper hidden" role="status">Sinh mệnh cạn kiệt · Bại trận. Chọn Chơi lại để bắt đầu lượt mới.</p><nav className="menu-actions"><button id="startBtn" className="primary">Bắt đầu</button><button id="restartBtn" className="hidden">Chơi lại từ đầu</button><button hidden id="swordPreviewBtn">Thử hoạt ảnh kiếm tu</button><button hidden id="tangMaPreviewBtn">Thử boss Táng Ma</button><button id="settingsBtn">Cài đặt</button><button id="aboutBtn">Giới thiệu · Phiên bản 0.1.44-AJ1</button></nav>
      <p className="footnote" id="loadStatus">Đang tải nhân vật và background…</p>
      </section>
      <SwordPreview />
      <TangMaPreview />
      <section id="bloodReward" className="menu-card cultivation-card hidden" aria-labelledby="bloodRewardTitle">
        <div className="cultivation-kicker">✦ CHIẾN THẮNG HUYẾT DỰ ✦</div>
        <h2 id="bloodRewardTitle">ĐOẠT KỸ NĂNG</h2>
        <p className="cultivation-subtitle">Chọn kỹ năng để trang bị hoặc dung hợp</p>
        <div className="buff-grid">
          <button id="reward-hand" className="buff-option"><SkillIcon name="hand" className="reward-skill-art"/><span><b>Huyết Thủ</b><small>Bàn tay máu truy kích<br/>Gây chảy máu 8 giây</small></span></button>
          <button id="reward-thread" className="buff-option"><SkillIcon name="thread" className="reward-skill-art"/><span><b>Huyết Kim Tuyến</b><small>Giữ để tụ, thả để phóng<br/>Tiêu hao máu và linh lực</small></span></button>
          <button id="reward-drain" className="buff-option"><SkillIcon name="drain" className="reward-skill-art"/><span><b>Thôn Linh Huyết</b><small>Hút máu và linh lực<br/>trong 6 giây</small></span></button>
          <button id="reward-blast" className="buff-option"><SkillIcon name="blast" className="reward-skill-art"/><span><b>Huyết Bạo</b><small>Dùng khi máu ≤ 10%<br/>Sau bạo phát còn 1% máu</small></span></button>
        </div>
        <p className="cultivation-foot">Kỹ năng giữ trong lượt chơi. Lôi kiếp sẽ khóa mục tiêu; dùng Thổ Thuẫn để đỡ.</p>
      </section>
      <section id="swordReward" className="menu-card cultivation-card hidden" aria-labelledby="swordRewardTitle">
        <div className="cultivation-kicker">✦ CHIẾN THẮNG LĂNG TIÊU ✦</div>
        <h2 id="swordRewardTitle">LĨNH NGỘ KIẾM ĐẠO</h2>
        <p className="cultivation-subtitle">Chọn kiếm kỹ để trang bị, dung hợp (50 tổ hợp mới) hoặc bỏ qua</p>
        <div className="buff-grid">
          <button id="sword-sword_heart" className="buff-option"><SkillIcon name="swordheart" className="reward-skill-art"/><span><b>Kiếm Tâm</b><small>320 ST · tam kiếm nhanh<br/>60 linh lực</small></span></button>
          <button id="sword-sword_beam" className="buff-option"><SkillIcon name="swordbeam" className="reward-skill-art"/><span><b>Thập La Trảm Thiên</b><small>380 ST · choáng 0,8 giây<br/>75 linh lực</small></span></button>
          <button id="sword-sword_array" className="buff-option"><SkillIcon name="swordarray" className="reward-skill-art"/><span><b>Vạn Kiếm Quy Tông</b><small>390 ST · chậm 2 giây<br/>80 linh lực</small></span></button>
          <button id="sword-sword_guard" className="buff-option"><SkillIcon name="swordguard" className="reward-skill-art"/><span><b>Kiếm Khí Hộ Thể</b><small>340 ST · choáng 0,9 giây<br/>70 linh lực</small></span></button>
          <button id="sword-sword_union" className="buff-option"><SkillIcon name="swordunion" className="reward-skill-art"/><span><b>Nhân Kiếm Hợp Nhất</b><small>460 ST · choáng 0,9 giây<br/>100 linh lực</small></span></button>
        </div>
        <p className="cultivation-foot">Kiếm kỹ có thể dung hợp cùng kỹ năng gốc, yêu thuật hoặc huyết kỹ đang sở hữu.</p>
        <button type="button" id="sword-skip" className="monster-skip">Bỏ qua, tiến vào Vòng 3</button>
      </section>
      <section id="tangReward" className="menu-card cultivation-card hidden" aria-labelledby="tangRewardTitle">
        <div className="cultivation-kicker">✦ CHIẾN THẮNG TÁNG MA ✦</div><h2 id="tangRewardTitle">ĐOẠT MA KỸ</h2>
        <div id="tangRewardChoices"><p className="cultivation-subtitle">Chọn một kỹ năng để trang bị</p><div className="buff-grid">
          <button id="tang-tang_dash" className="buff-option"><SkillIcon name="tangdash" className="reward-skill-art"/><span><b>Hoang Diệm Truy Sát</b><small>Lao xuyên · 450 ST · 65 linh lực</small></span></button>
          <button id="tang-tang_rage" className="buff-option"><SkillIcon name="tangrage" className="reward-skill-art"/><span><b>Cuồng Bạo</b><small>Khổng lồ 12 giây · +35% sát thương</small></span></button>
          <button id="tang-tang_devour" className="buff-option"><SkillIcon name="tangdevour" className="reward-skill-art"/><span><b>Phệ Thần</b><small>Ma cầu hút máu và linh lực</small></span></button>
          <button id="tang-tang_combo" className="buff-option"><SkillIcon name="tangcombo" className="reward-skill-art"/><span><b>Dịch Ảnh Liên Kích</b><small>Thuấn di đánh 6 đòn</small></span></button>
        </div></div>
        <div id="tangReplaceChoices" className="hidden"><p className="cultivation-subtitle">Các ô đã đầy. Chọn ô muốn thay thế:</p><div className="buff-grid">{[0,1,2,3,4].map(i=><button type="button" key={i} id={`tangReplace${i}`} className="buff-option" />)}</div><button type="button" id="tangReplaceBack" className="monster-skip">Chọn lại kỹ năng</button></div>
      </section>
      <section id="cultivationChoice" className="menu-card cultivation-card hidden" aria-labelledby="cultivationStage">
        <div className="cultivation-kicker">✦ ĐỘT PHÁ CẢNH GIỚI ✦</div>
        <h2 id="cultivationStage">TRÚC CƠ · TRUNG KỲ</h2>
        <p id="cultivationSubtitle" className="cultivation-subtitle">Chọn 1 buff cho lượt chơi này</p>
        <div className="buff-grid">
          <button id="buff-vitality" className="buff-option"><SkillIcon name="heart" className="reward-skill-art"/><span><b>Sinh mệnh</b><small>+250 máu tối đa<br/>Hồi 250 máu</small></span></button>
          <button id="buff-spirit" className="buff-option"><SkillIcon name="mana" className="reward-skill-art"/><span><b>Linh lực</b><small>+60 linh lực tối đa<br/>Hồi 60 linh lực</small></span></button>
          <button id="buff-recovery" className="buff-option"><SkillIcon name="recovery" className="reward-skill-art"/><span><b>Hồi phục</b><small>Hồi 35% máu, linh lực<br/>+2 máu và +2 linh lực/giây</small></span></button>
          <button id="buff-drain" className="buff-option"><SkillIcon name="drain" className="reward-skill-art"/><span><b>Hút sinh lực</b><small>Kỹ năng hút 6% máu<br/>và 2% linh lực<br/>theo sát thương trực tiếp</small></span></button>
        </div>
        <p className="cultivation-foot">Buff cộng dồn và giữ đến hết lượt chơi.</p>
      </section>
      <section id="monsterReward" className="menu-card cultivation-card hidden" aria-labelledby="monsterRewardTitle">
        <div className="cultivation-kicker">✦ LĨNH NGỘ YÊU THUẬT ✦</div>
        <h2 id="monsterRewardTitle">CHỌN KỸ NĂNG QUÁI</h2>
        <p className="cultivation-subtitle">Chọn kỹ năng của quái vừa tiêu diệt để trang bị, dung hợp hoặc bỏ qua</p>
        <div className="buff-grid">
          <button id="monster-wolf_bite" className="buff-option"><SkillIcon name="wolfbite" className="reward-skill-art"/><span><b>Phong Lang · Cắn Xé</b><small>160 ST cơ bản · 20 linh lực</small></span></button>
          <button id="monster-wolf_wind" className="buff-option"><SkillIcon name="wolfwind" className="reward-skill-art"/><span><b>Phong Lang · Lốc Xoáy</b><small>180 ST cơ bản · 35 linh lực</small></span></button>
          <button id="monster-eagle_orb" className="buff-option"><SkillIcon name="eagleorb" className="reward-skill-art"/><span><b>Lôi Ưng · Lôi Cầu</b><small>180 ST cơ bản · 35 linh lực</small></span></button>
          <button id="monster-eagle_dive" className="buff-option"><SkillIcon name="eagledive" className="reward-skill-art"/><span><b>Lôi Ưng · Lao Xuyên</b><small>220 ST cơ bản · 40 linh lực</small></span></button>
          <button id="monster-snake_fang" className="buff-option"><SkillIcon name="snakefang" className="reward-skill-art"/><span><b>Hắc Hỏa Xà · Độc Nha</b><small>170 ST cơ bản · độc 5 giây · 40 linh lực</small></span></button>
          <button id="monster-snake_lunge" className="buff-option"><SkillIcon name="snakelunge" className="reward-skill-art"/><span><b>Hắc Hỏa Xà · Xà Lao</b><small>220 ST cơ bản · 40 linh lực</small></span></button>
          <button id="monster-bat_orb" className="buff-option"><SkillIcon name="batorb" className="reward-skill-art"/><span><b>Ma Bức · U Minh Ma Cầu</b><small>200 ST cơ bản · 45 linh lực</small></span></button>
          <button id="monster-bat_dive" className="buff-option"><SkillIcon name="batdive" className="reward-skill-art"/><span><b>Ma Bức · U Minh Ảnh Tập</b><small>230 ST cơ bản · 45 linh lực</small></span></button>
        </div>
        <p id="monsterRewardFoot" className="cultivation-foot">Có 5 ô kỹ năng nhận được. Một ô được dành cho phần thưởng Huyết Dự.</p>
        <button type="button" id="monster-skip" className="monster-skip">Bỏ qua kỹ năng</button>
      </section>
      <section id="fusionReward" className="menu-card cultivation-card hidden" aria-labelledby="fusionTitle">
        <div className="cultivation-kicker">✦ DUNG HỢP KỸ NĂNG ✦</div>
        <h2 id="fusionTitle">LĨNH NGỘ TUYỆT KỸ</h2>
        <p id="fusionIncoming" className="cultivation-subtitle"></p>
        <p id="fusionEmpty" className="cultivation-foot hidden">Chưa có hai kỹ năng tương thích. Bạn có thể bỏ qua và tiếp tục.</p>
        <div id="fusionOptions" className="fusion-options">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <button key={i} type="button" id={`fusionChoice${i}`} className="buff-option fusion-option hidden">
              <SkillIcon name="empty" id={`fusionChoice${i}Icon`} className="reward-skill-art"/>
              <span><b id={`fusionChoice${i}Name`}></b><small id={`fusionChoice${i}Description`}></small></span>
            </button>
          ))}
        </div>
        <div id="fusionPagination" className="fusion-pagination hidden"><button type="button" id="fusionPrev">‹ Trước</button><span id="fusionPage">1 / 1</span><button type="button" id="fusionNext">Sau ›</button></div>
          <button type="button" id="fusionKeep" className="buff-option fusion-keep"><SkillIcon name="empty" id="fusionKeepIcon" className="reward-skill-art"/><span><b id="fusionKeepTitle">Trang bị kỹ năng mới</b><small id="fusionKeepSub">Nhận chiêu riêng, không dung hợp</small></span></button>
        <p className="cultivation-foot">Dung hợp tiêu hao cả hai chiêu. Chiêu dung hợp thay thế kỹ năng đang sở hữu trong cùng ô.</p>
        <button type="button" id="fusionBack" className="monster-skip">Quay lại chọn kỹ năng</button>
      </section>
      <section id="characterSelect" className="menu-card secondary hidden"><h2>Chọn nhân vật</h2><p className="helper">Chọn nhân vật xuất chiến</p><button type="button" id="selectDiepTu" className="character-choice" aria-label="Chọn Diệp Tu" aria-pressed="true"><img className="character-portrait" src={diepTuAvatar} alt="Chân dung Diệp Tu" /><div><strong>DIỆP TU</strong><small>Trúc Cơ · Sơ Kỳ (HP 1200 · MP 250 · Công 80)</small><span>ĐÃ CHỌN</span></div></button><div className="menu-actions"><button id="confirmCharacter" className="primary">Xuất chiến</button><button id="backCharacterSelect">Quay lại</button></div></section>
      <section id="battleResult" className="menu-card secondary hidden"><h2 id="resultTitle">CHIẾN THẮNG</h2><p id="resultText" className="helper"></p><div className="menu-actions"><button id="resultContinue" className="primary hidden">Luyện tập với kỹ năng mới</button><button id="resultFusion" className="hidden">Dung hợp kỹ năng</button><button id="resultRetry" className="primary">Chơi lại</button><button id="resultMenu">Về menu</button></div></section>
      <section id="settings" className="menu-card secondary hidden"><div className="settings-head"><h2>Cài đặt</h2><button id="closeSettingsTop" className="icon-close" aria-label="Đóng cài đặt">×</button></div><label className="setting"><span>Tốc độ di chuyển <output id="speedOut">100%</output></span><input id="speedRange" type="range" min="65" max="150" step="5" defaultValue="100" /></label><label className="setting"><span>Góc nhìn camera</span><b id="zoomOut" style={{fontSize: "12px", color: "#f6dcab"}}>53.8% · cố định (+30%)</b></label><label className="setting"><span>Chế độ màn hình</span><select id="orientationMode" defaultValue="landscape"><option value="landscape">Ngang</option><option value="portrait">Dọc</option></select></label><label className="setting"><span>Chất lượng đồ họa</span><select id="quality"><option value="high">Cao</option><option value="medium">Cân bằng</option><option value="low">Tiết kiệm</option></select></label><label className="setting"><span>Hiệu ứng PixelFX</span><select id="fxQuality" defaultValue="medium"><option value="high">Cao</option><option value="medium">Cân bằng</option><option value="low">Thấp</option><option value="off">Tắt</option></select></label><label className="setting"><span>Kích thước joystick</span><select id="joystickSize" defaultValue="normal"><option value="small">Nhỏ</option><option value="normal">Vừa</option><option value="large">Lớn</option></select></label><label className="setting"><span>Âm thanh tổng</span><input id="soundEnabled" type="checkbox" aria-label="Bật hoặc tắt toàn bộ âm thanh" defaultChecked /></label><label className="setting"><span>Âm lượng tổng <output id="soundVolumeOut">70%</output></span><input id="soundVolume" type="range" min="0" max="100" step="5" defaultValue="70" aria-label="Âm lượng tổng" /></label><label className="setting"><span>Nhạc nền</span><input id="musicEnabled" type="checkbox" defaultChecked /></label><label className="setting"><span>Âm lượng nhạc <output id="musicVolumeOut">28%</output></span><input id="musicVolume" type="range" min="0" max="100" step="1" defaultValue="28" aria-label="Âm lượng nhạc nền" /></label><label hidden className="setting"><span>Hiện FPS và tọa độ</span><input id="statsToggle" type="checkbox" /></label><label hidden className="setting"><span>Vùng địa chất (phát hiện lỗi)</span><input id="geoToggle" type="checkbox" /></label><p className="helper">Chọn Dọc hoặc Ngang trong Cài đặt hoặc chạm nút NGANG/DỌC trên thanh trên cùng. Nếu Chrome không cấp quyền xoay thiết bị, game sẽ tự xoay giao diện để phù hợp. Có thể phải xoay điện thoại để thuận mắt.</p><p className="helper">Cảm ứng: vòng trái để đi/chạy; BAY cho phép lên/xuống; NHẢY riêng; 5 ô kỹ năng gồm Kỹ năng 1 HỎA CẦU (giữ tụ lực, thiêu đốt 10s), Kỹ năng 2 LÔI BẠO (giữ tụ thiên lôi, tê liệt 1,5s) và Kỹ năng 3 THỔ THUẪN (bật/tắt hộ thể, chặn 100% sát thương bằng linh lực). Máy tính: A/D hoặc ←/→ để chạy, giữ Shift để đi chậm; Space nhảy; F bật/tắt bay; W/S lên/xuống; giữ phím 1 tụ Hỏa Cầu, giữ phím 2 tụ Lôi Bạo, nhấn phím 3 bật/tắt Thổ Thuẫn, phím 4–5 cho các ô kỹ năng tiếp theo. Sau dung hợp, nút và phím tương ứng dùng kỹ năng mới.</p><button id="backSettings">Quay lại</button></section>
      <section id="about" className="menu-card secondary hidden">
        <h2>Giới thiệu · Phiên bản 0.1.44-AJ1</h2>
        <div className="changelog"><p><b>0.1.44-AJ1 · Dung hợp Táng Ma:</b> Thêm 40 công thức theo bốn nhóm lao xuyên, Cuồng Bạo, Phệ Thần và liên kích; bổ sung PixelFX, âm thanh, hộ thể giới hạn và lựa chọn dung hợp sau chiến thắng.</p><p><b>0.1.44-AI1 · Hoàn thiện đến Táng Ma:</b> Quái vòng 1 xuất hiện 3–4 con; thêm tiểu cảnh giới Kim Đan, lĩnh ngộ Ma Bức và thưởng đúng kỹ năng quái. Sau Táng Ma chọn một ma kỹ, thay ô khi đầy và tiếp tục luyện tập.</p><p><b>0.1.44-AH1 · Kỹ năng theo quái:</b> Sau khi đột phá, bảng chỉ cho chọn kỹ năng của con quái vừa giúp hoàn thành EXP; vẫn có thể bỏ qua hoặc dung hợp.</p><p><b>0.1.44-AG1 · Cân bằng linh lực dung hợp:</b> Giảm tiêu hao cho 170 kỹ năng dung hợp, từ 65–120 xuống 45–85 linh lực; mức giảm tùy từng chiêu. Giữ nguyên sát thương, phạm vi và hồi chiêu.</p><p><b>0.1.44-AF1 · Đại chiêu dung hợp:</b> Làm mới hiệu ứng bay và bùng nổ cho 170 công thức: kiếm trận, lôi điện, độc, huyết, ngũ hành và các hệ khác. Tăng độ rõ ở góc nhìn xa, giới hạn chi tiết theo chất lượng PixelFX.</p><p><b>0.1.44-AE1 · Dung hợp khi đột phá:</b> Mở bảng dung hợp sau mỗi tiểu cảnh giới và sau khi lên Kim Đan; chọn kết hợp kỹ năng hiện có hoặc bỏ qua. Thêm phân trang cho các công thức.</p><p><b>0.1.44-AD1 · Cập nhật H7:</b> Bổ sung lựa chọn kiếm kỹ sau Lăng Tiêu, mở rộng 170 công thức dung hợp, nâng cấp biểu tượng, hiệu ứng PixelFX và âm thanh.</p><p><b>0.1.44-AC1 · Âm thanh dung hợp:</b> Thêm âm riêng khi phóng và nổ cho các hệ dung hợp; âm lượng theo vị trí, giới hạn tiếng đồng thời và tuân theo cài đặt âm thanh.</p><p><b>0.1.44-AB1 · Dung hợp PixelFX:</b> Mở rộng lên 31 công thức; bổ sung đòn bay, kiếm, lốc, huyết khí và bạo nổ theo từng hệ. Màn chọn hiển thị nhiều công thức hơn.</p><p><b>0.1.44-AA1 · Dung hợp tiêu hao:</b> Hai kỹ năng thành phần biến mất khi dung hợp; chiêu mới thay thế kỹ năng đang sở hữu trong cùng ô. Cảnh báo khi dùng Thổ Thuẫn làm nguyên liệu.</p><p><b>0.1.44-Z1 · Thiên kiếp:</b> Sáu tia lôi kiếp bám theo mục tiêu, không thể né bằng di chuyển; sát thương tăng dần và có thể đỡ bằng Thổ Thuẫn. Nâng cấp kiếm lôi và cảnh báo.</p><p><b>0.1.44-Y1 · Dung hợp diện rộng:</b> Mở rộng lên 15 công thức cho yêu thuật và cả bốn huyết kỹ; các chiêu dung hợp phát nổ PixelFX, đánh nhiều mục tiêu và tăng sát thương. Cân bằng linh lực, hồi chiêu và hiệu ứng phụ.</p><p><b>0.1.44-X1 · Dung hợp:</b> Thêm hai ô kỹ năng (tổng năm ô nhận được); chọn dung hợp hoặc trang bị riêng khi nhận kỹ năng tương thích. Thêm Hỏa Phong Lốc, Lôi Thủy Cầu, Độc Phong Lốc và Huyết Hỏa Cầu.</p><p><b>0.1.44-W1 · Vòng 3:</b> Sau Lăng Tiêu, chiến đấu với 30 U Minh Ma Bức rồi đối đầu Táng Ma. Nâng cấp PixelFX và sát thương yêu thuật đoạt được; lõi đạn vẫn hiển thị khi tắt hiệu ứng.</p><p><b>0.1.44-V1 · Hoàn thiện âm thanh:</b> Thêm âm thanh các nhịp ra chiêu của Táng Ma, yêu thuật người chơi đoạt được, cảnh báo thiên kiếp, đột phá và nhận thưởng; sửa âm chiến thắng bị ngắt khi mở phần thưởng.</p><p><b>0.1.44-U1 · Âm thanh yêu thú:</b> Thêm âm thanh xuất hiện, tấn công, kỹ năng, trúng đòn và tử vong riêng cho Phong Lang, Lôi Ưng và Hắc Hỏa Xà; cân bằng âm lượng theo khoảng cách và giới hạn tiếng đồng thời.</p><p><b>0.1.44-T1 · Lăng Tiêu:</b> Hoàn thiện nhịp ngã khi bại trận, đồng bộ kiếm trảm với tư thế boss; nâng cấp kiếm trận, hộ thể và hợp kiếm bằng PixelFX. Kiếm gây sát thương vẫn hiện rõ khi giảm hoặc tắt hiệu ứng.</p><p><b>0.1.44-S1 · Tạo hình Cuồng Bạo:</b> Chuẩn bị hoạt ảnh cởi trần cho Diệp Tu ở trạng thái khổng lồ; ẩn công cụ thử nghiệm và thông tin kiểm lỗi khỏi giao diện. Kỹ năng Cuồng Bạo của người chơi chưa mở trong tiến trình.</p><p><b>0.1.44-R1 · Kỹ năng Diệp Tu:</b> Giảm choáng Lôi Bạo còn 1,5 giây; Thủy Kiếm đổi thành ba kiếm bay truy kích; mở rộng vùng khống chế và thay hiệu ứng Ngũ Hành bằng trận đồ PixelFX năm trụ.</p><p><b>0.1.44-Q1 · Huyết Dự:</b> Khôi phục 17 dải hoạt ảnh 256 px từ hình gốc, giữ tạo hình; đồng bộ động tác kết ấn, tụ và tung chiêu; bổ sung huyết khí PixelFX cho Huyết Thủ, Kim Tuyến, Thôn Linh, Huyết Thuẫn và Huyết Bạo.</p><p><b>0.1.44-P1 · Trận thử Táng Ma:</b> Thêm trận đấu riêng, bốn kỹ năng có sát thương và hồi chiêu, Cuồng Bạo, khống chế, né đòn đầu và hoạt ảnh PixelFX. Chỉnh động tác Phệ Thần và liên kích; thứ tự các vòng chính giữ nguyên.</p><p><b>0.1.44-O1 · Thử boss Táng Ma:</b> Thêm màn xem tạo hình khổng lồ, hoạt ảnh cơ bản và bốn chiêu mô phỏng bằng PixelFX; dùng sprite độ phân giải cao và nền gốc. Boss chưa được đưa vào tiến trình chiến đấu.</p><p><b>0.1.44-N1 · Biểu tượng kỹ năng:</b> Thêm hình riêng cho kỹ năng Diệp Tu, Huyết Dự, Lăng Tiêu và quái; ô kỹ năng đổi hình theo chiêu trang bị. Bộ biểu tượng vector dùng chung, tối ưu dung lượng và sắc nét khi phóng to.</p><p><b>0.1.44-M1 · Lĩnh ngộ yêu thuật:</b> Mỗi lần đột phá tiểu cảnh giới chọn buff và có thể nhận một trong sáu kỹ năng Phong Lang, Lôi Ưng, Hắc Hỏa Xà vào ô trống; giữ một ô cho Huyết Dự. Nâng cấp PixelFX các chiêu quái, có va chạm, độc và hồi chiêu.</p><p><b>0.1.44-L1 · Hắc Hỏa Xà:</b> Sau khi vượt thiên kiếp và đột phá Kim Đan, tiêu diệt 30 Hắc Hỏa Xà theo 8 đợt trước khi gặp Lăng Tiêu. Hắc Hỏa Xà dài khoảng 5 lần chiều cao Diệp Tu, biết bò, bay uốn mình, phóng Độc Nha gây độc, lao cắn, phản ứng khống chế và tử vong.</p><p><b>0.1.44-K1 · Giằng co kỹ năng:</b> Hỏa Cầu có thể giằng co với Huyết Thủ hoặc kiếm quang mạnh. Cả hai tiêu hao linh lực liên tục; bên cạn linh lực hoặc hủy phép sẽ thất thế. Bấm HỦY PHÉP hoặc C để rút lui.</p><p><b>0.1.44-J1 · Va chạm mạnh:</b> Đòn mạnh có thể hất văng hoặc đập người chơi xuống đất, khoét hố thật với bụi và rung camera. Hộ thuẫn chặn hoàn toàn sát thương sẽ ngăn lực hất; nhân vật hồi phục bằng hoạt ảnh ngã và đứng dậy.</p><p><b>0.1.44-I1 · Đoạt kỹ năng và thiên kiếp:</b> Sau Huyết Dự chọn một trong bốn huyết kỹ vào ô trống. Trời tối, sáu tia lôi kiếp PixelFX lần lượt giáng xuống có cảnh báo; sống sót để đột phá Kim Đan rồi gặp Lăng Tiêu. Giữ buff đã chọn trong lượt chơi.</p><p><b>0.1.44-H2 · Các đợt quái:</b> Lôi Ưng xuất hiện xa hơn; 20 Phong Lang và Lôi Ưng chia thành các đợt 1, 2, 3 và tối đa 4 con cùng lúc. Mỗi quái có máu, khống chế và EXP riêng; kỹ năng diện rộng có thể đánh nhiều mục tiêu.</p><p><b>0.1.44-H1 · Lôi Ưng:</b> Thêm quái bay với Lôi Cầu, lao xuyên có báo trước, phản ứng khống chế và rơi xuống khi tử vong. Vòng 1 có 20 quái Phong Lang và Lôi Ưng xuất hiện lần lượt; mỗi 10 con tăng một bậc và được chọn buff trước trận boss.</p><p><b>0.1.44-G1 · Tu luyện Trúc Cơ:</b> Hạ Phong Lang nhận EXP, tiến từ Sơ kỳ đến Trung kỳ và Hậu kỳ. Mỗi lần đột phá chọn một buff; máu, linh lực và hút sinh lực được giữ trong lượt chơi.</p><p><b>0.1.44-F2 · Hoàn thiện Phong Lang:</b> Thêm phản ứng khi trúng đòn, choáng và phong tỏa; chuỗi gục ngã, nằm và tan dần khi tử vong. Lốc Xoáy lớn hơn, có lõi và dải gió rõ nét; vùng va chạm được điều chỉnh theo kích thước.</p><p><b>0.1.44-F1 · Phong Lang:</b> Thêm một quái mặt đất với hoạt ảnh chạy, nhảy, cắn và thi triển kỹ năng; cận chiến Cắn Xé và Lốc Xoáy tầm xa bằng PixelFX, có thể va chạm kỹ năng. Hạ quái để tiến đến vòng Huyết Dự.</p><p><b>0.1.44-E1 · Va chạm kỹ năng:</b> Thiết kế lại hiệu ứng đấu phép bằng PixelFX với màu sắc theo hai chiêu, lõi sáng, xung kích và mảnh năng lượng. Kích thước theo góc nhìn, giới hạn hiệu ứng đồng thời để tối ưu trên điện thoại.</p><p><b>0.1.44-D1 · Sửa hoạt ảnh bay:</b> Huyết Dự phát liên tục động tác bay lên và đổi tư thế khi hạ độ cao; Lăng Tiêu chuyển giữa bay lên, hạ xuống và lơ lửng theo chuyển động thực tế. Đồng bộ phản ứng trúng đòn và giữ nhịp kiếm kỹ.</p><p><b>0.1.44-C1 · Cân bằng chiến đấu:</b> Giảm linh lực tiêu hao khi Thổ Thuẫn và Huyết Thuẫn đỡ đòn; tăng tốc đi bộ và chạy 20%. Sửa Thôn Linh Huyết hút đều theo thời gian, nhịp chảy máu của Huyết Thủ và Huyết Kim Tuyến, mở rộng Huyết Bạo bao phủ toàn vùng chiến đấu.</p><p><b>0.1.44-B1 · Nền trời liền mạch:</b> Thống nhất phong cảnh mặt đất và không trung, thêm sương chuyển tiếp theo địa hình; đồng bộ nền với camera và độ sâu hang động; nối cảnh địa tầng ở mép khi bật Thần Thức, hạn chế bóng kép khi bay.</p><p><b>0.1.44-A1 · Nâng cấp âm thanh:</b> Thêm nhạc nền có thể điều chỉnh, tiếng menu, nhảy, bay, trúng đòn, va chạm và âm thanh riêng theo từng giai đoạn của năm kiếm kỹ Lăng Tiêu. Cân bằng âm, hạn chế số tiếng đồng thời và lưu cài đặt âm thanh.</p><p><b>0.1.44-LT4 · Ngũ Kiếm Kỹ:</b> Thiết kế lại hiệu ứng của năm kiếm kỹ Lăng Tiêu bằng PixelFX: kiếm hai lưỡi rõ chuôi và hộ thủ, kiếm trận, sáu kiếm hộ thể, đại kiếm và vụ nổ đại chiêu. Đồng bộ mũi kiếm với điểm trúng, tối ưu số hiệu ứng theo cài đặt.</p><p><b>0.1.44-LT3 · Kiếm khí và choáng:</b> Sửa hiển thị kỹ năng khi thu xa camera, làm rõ kiếm quang và kiếm trận; cả năm kỹ năng Lăng Tiêu gây choáng 1 giây khi trúng, mỗi lượt một lần. Kiếm Khí Hộ Thể gây choáng khi chạm; Thổ Thuẫn có thể đỡ hiệu ứng này.</p><p><b>0.1.44-LT2 · Hoạt ảnh Lăng Tiêu:</b> Đồng bộ thuấn di, nhịp chém, tụ kiếm, thi pháp, đỡ đòn và hợp kiếm với thời điểm kỹ năng; nhân vật tiếp tục phản ứng khi bị đánh, tối ưu chuyển tiếp hoạt ảnh.</p><p><b>0.1.44 · Boss Lăng Tiêu:</b> Thêm vòng 2, năm kiếm kỹ, Kiếm Khí Hộ Thể và đại chiêu Nhân Kiếm Hợp Nhất với hiệu ứng kiếm khí PixelFX; bổ sung va chạm kỹ năng, hồi máu và linh lực giữa các vòng; sửa lỗi âm thanh khi thiết bị không hỗ trợ hoặc đã tắt âm.</p><p><b>0.1.43-KT4 · Sửa thời gian boss và sprite:</b> Boss Huyết Dự xuất hiện sau đủ 5 giây; căn lại khung hoạt ảnh nằm của Lăng Tiêu, tránh chạm mép ảnh.</p><p><b>0.1.43-KT3 · Thử hoạt ảnh kiếm tu:</b> Căn lại điểm neo đứng, đi, chạy và các động tác kiếm; tăng khung nhảy, đáp đất, chém, đỡ và thuấn di. Có thể xem thử trong menu; chưa có AI và kỹ năng chiến đấu.</p>
          <h3>Nhật ký từng phiên bản</h3>
          <p><b>0.1.43 · Cảnh giới Trúc Cơ &amp; Màn xuất hiện Boss:</b> Nâng Diệp Tu lên Trúc Cơ · Sơ Kỳ (1200 HP, 250 MP), hoàn thiện hệ thống thuộc tính &amp; áp chế cảnh giới, thêm Avatar và hộp thoại cận cảnh Boss Huyết Dự.</p>
          <p><b>0.1.42 · Đấu phép (Va chạm kỹ năng):</b> Hỏa Cầu và Thủy Kiếm va chạm trực diện với Huyết Thủ, Huyết Kim Tuyến; chiêu mạnh hơn xuyên qua, bằng lực thì cùng tan.</p>
          <p><b>0.1.41 · Quyết chiến Vòng 1:</b> Mở màn chọn nhân vật, AI Boss Huyết Dự (Kim Đan Cảnh) tự thi triển bộ kỹ năng Ma Đạo, có thể ngắt chiêu Huyết Bạo.</p>
          <p><b>0.1.40 · Hoàn thiện 5 kỹ năng Huyết Dự:</b> Cân bằng sát thương Huyết Bạo (giữ 1% HP), Huyết Thủ, Huyết Kim Tuyến, Thôn Linh Huyết (hút máu &amp; linh lực) và Huyết Thuẫn.</p>
          <p><b>0.1.39 · Bộ 17 hoạt ảnh Huyết Dự:</b> Bổ sung trọn bộ 119 khung hình WebP riêng cho nhân vật Huyết Dự.</p>
          <p><b>0.1.38 · Tạo hình Huyết Dự:</b> Ra mắt ngoại hình Ma Đạo tóc đỏ, hắc bào viền huyết quang.</p>
          <p><b>0.1.37 · Ngũ Hành Diệt Sát Trận (Skill 5):</b> Khai mở đại trận 5 cột linh trụ giam cầm và giáng sát thương ngũ hành liên hoàn.</p>
          <p><b>0.1.36 · Thần Thức 4× &amp; Thủy Kiếm (Skill 4):</b> Thêm Linh Nhãn nhìn xa gấp 4 lần (khóa mục tiêu 3.600) và tuyệt kỹ Tam Kiếm làm chậm địch.</p>
          <p><b>0.1.35 · Thổ Thuẫn Hộ Thể (Skill 3):</b> Khiên đất xoay quanh người, dùng linh lực chặn 100% sát thương.</p>
          <p><b>0.1.34 · Lôi Bạo Thuật (Skill 2) &amp; Bảng 5 Kỹ năng:</b> Giữ tụ thiên lôi giáng sét gây tê liệt 5 giây; nâng cấp giao diện 5 ô kỹ năng.</p>
          <p><b>0.1.33 · Phiên bản Web chuẩn (React/Vite):</b> Tối ưu hóa cấu trúc game chạy mượt trên cả điện thoại và máy tính.</p>
          <p><b>0.1.32 · Tự khóa mục tiêu &amp; Đạn đuổi:</b> Tự động ngắm địch trong tầm 900; Hỏa Cầu tự uốn quỹ đạo truy đuổi mục tiêu đang bay/chạy.</p>
          <p><b>0.1.31 · Nén ảnh siêu nhẹ:</b> Giảm 70% dung lượng ảnh nhân vật, cố định góc nhìn camera chuẩn 70%.</p>
          <p><b>0.1.30 · Đồng bộ 17 động tác gốc:</b> Hoàn thiện bộ khung hình gốc cho cả người chơi và NPC.</p>
          <p><b>0.1.28 · Va chạm vật lý 2 nhân vật:</b> Chặn đi xuyên người nhau, có thể nhảy đáp lên đầu đối phương và bắn trúng ở cự ly gần.</p>
          <p><b>0.1.27 · NPC Diệp Tu 1.000 HP:</b> Thay cọc gỗ bằng NPC có hoạt ảnh trúng đòn, ngã và chịu hiệu ứng cháy.</p>
          <p><b>0.1.26 · Âm thanh hành động:</b> Thêm tiếng bước chân và tiếp đất thay đổi theo từng tầng đất, cát, đá.</p>
          <p><b>0.1.25 · Chuỗi phản ứng chiến đấu:</b> Mượt hóa động tác lấy đà nhảy, phanh bước, trúng đòn, ngã xuống đất rồi chống tay đứng dậy.</p>
          <p><b>0.1.23 – 0.1.24 · Nâng cấp Hỏa Cầu Thuật:</b> Thêm động tác kết ấn vung tay, quả cầu lửa lớn dần phía trước người và nổ vòng lửa lan trên mặt đất.</p>
          <p><b>0.1.22 · Thanh Máu &amp; Linh Lực:</b> Hiển thị HUD sinh mệnh và linh lực tự hồi phục theo thời gian.</p>
          <p><b>0.1.20 – 0.1.21 · Ra mắt Hỏa Cầu PixelFX (Skill 1):</b> Kỹ năng tụ lực đầu tiên với hiệu ứng lửa cuộn, đạn bay và thiêu đốt mục tiêu.</p>
          <p><b>0.1.17 – 0.1.19 · Địa tầng &amp; Hang động tự nhiên:</b> Mặt đất có lớp cỏ, rễ cây, sỏi đá, mạch khoáng sản và hố đào uốn lượn tự nhiên.</p>
          <p><b>0.1.16 · Cảm ứng đa điểm khi Bay:</b> Vừa kéo Joystick di chuyển vừa bấm Bay/Kỹ năng bằng ngón tay thứ hai mượt mà.</p>
          <p><b>0.1.13 – 0.1.15 · Động tác Giơ tay Tụ lực:</b> Dựng hoạt ảnh giơ tay và thu tay mượt từ ngoại hình Diệp Tu gốc.</p>
          <p><b>0.1.10 · Mục tiêu thử chiêu:</b> Thêm mục tiêu 1.000 HP có hiển thị số sát thương và tự hồi phục khi bị đánh gục.</p>
          <p><b>0.1.7 – 0.1.9 · Cảnh nền Parallax 3 tầng:</b> Nền Bầu trời, Mặt đất và Hang sâu chuyển cảnh mượt theo độ cao của nhân vật.</p>
          <p><b>0.1.4 – 0.1.6 · Xoay màn hình Ngang/Dọc:</b> Hỗ trợ đổi nhanh chế độ cầm máy dọc hoặc ngang ngay trong trận.</p>
          <p><b>0.1 – 0.1.2 · Khởi đầu thế giới Tu Tiên 2D:</b> Nhân vật Diệp Tu với điều khiển Joystick, Nhảy, Bay ngự không, hiệu ứng bụi PixelFX và nền đất phá hủy được.</p>
        </div>
        <button id="backAbout">Quay lại</button>
      </section>
      </div>
    </>
  );
}
