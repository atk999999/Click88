import { useEffect, useRef, useState } from 'react';
import { createTangMaPreview } from './game/tang-ma-preview.js';
import { TANG_MA_ACTIONS } from './game/tang-ma-animation.js';

const primary = ['idle','walk','run','jump_start','fly_up','hover','hurt','stun','death','teleport'];
const extra = ['jump_air','fall','land','hand_seal','knockdown','down_idle','getup','charge_raise','charge_hold','cast_fire'];
const skills = ['skill1','skill2','skill3','skill4'];
export default function TangMaPreview(){
  const canvas=useRef<HTMLCanvasElement>(null),status=useRef<HTMLSpanElement>(null),ctrl=useRef<ReturnType<typeof createTangMaPreview>|null>(null);
  const [active,setActive]=useState('idle'),[berserk,setBerserk]=useState(false);
  useEffect(()=>{
    const panel=document.getElementById('tangMaPreview');if(!panel||!canvas.current||!status.current)return;
    const controller=createTangMaPreview(canvas.current,status.current,import.meta.env.BASE_URL);ctrl.current=controller;
    const sync=()=>controller.setVisible(!panel.classList.contains('hidden'));
    const observer=new MutationObserver(sync);observer.observe(panel,{attributes:true,attributeFilter:['class']});sync();
    return ()=>{observer.disconnect();controller.destroy();ctrl.current=null;};
  },[]);
  const choose=(id:string)=>{setActive(id);ctrl.current?.play(id);};
  const buttons=(ids:string[])=>ids.map(id=><button key={id} type="button" className={active===id?'selected':''} aria-pressed={active===id} onClick={()=>choose(id)}>{TANG_MA_ACTIONS[id as keyof typeof TANG_MA_ACTIONS].label}</button>);
  return <section id="tangMaPreview" className="menu-card secondary tang-ma-preview hidden" aria-label="Thử hoạt ảnh boss Táng Ma">
    <div className="tang-heading"><img src={`${import.meta.env.BASE_URL}assets/avatars/Tang_Ma_512.webp`} alt="" loading="lazy"/><div><small>THỬ NGHIỆM BOSS</small><h2>TÁNG MA</h2><span>Ma thân khổng lồ · 4 tuyệt kỹ</span></div></div>
    <div className="tang-stage"><canvas ref={canvas} width="960" height="540" aria-label="Táng Ma biểu diễn hoạt ảnh trên chiến trường"/><div className="tang-stage-label"><span className="tang-live">●</span> <span ref={status}>Đứng yên</span></div></div>
    <div className="tang-section-title">HOẠT ẢNH CƠ BẢN</div><div className="tang-moves">{buttons(primary)}</div>
    <details><summary>Hoạt ảnh bổ sung</summary><div className="tang-moves">{buttons(extra)}</div></details>
    <div className="tang-section-title">TUYỆT KỸ</div><div className="tang-moves tang-skills">{buttons(skills)}</div>
    <div className="tang-tools"><label><input type="checkbox" checked={berserk} onChange={e=>{setBerserk(e.target.checked);ctrl.current?.setBerserk(e.target.checked);}}/> Liên kích khi Cuồng Bạo ×2 tốc độ</label><button type="button" onClick={()=>ctrl.current?.play(active)}>↻ Phát lại</button></div>
    <p className="tang-note">Trận thử bắt đầu một lượt mới. Táng Ma chưa thuộc tiến trình các vòng chính.</p>
    <button id="tangMaBattleBtn" type="button">⚔ Bắt đầu trận thử Táng Ma</button>
    <button id="backTangMaPreview" type="button">Quay lại</button>
  </section>;
}
