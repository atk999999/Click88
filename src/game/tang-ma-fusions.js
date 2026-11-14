// Four families of earned Táng Ma techniques; each recipe names both consumed skills.
const CORE={fire:'Hỏa Cầu Thuật',lightning:'Lôi Bạo',earth:'Thổ Thuẫn',water:'Thủy Kiếm',five_elements:'Ngũ Hành Diệt Sát Trận'};
const LABELS={wolf_bite:'Cắn Xé',wolf_wind:'Lốc Xoáy',eagle_orb:'Lôi Cầu',eagle_dive:'Lao Xuyên',snake_fang:'Độc Nha',snake_lunge:'Xà Lao',bat_orb:'U Minh Ma Cầu',bat_dive:'U Minh Ảnh Tập',hand:'Huyết Thủ',thread:'Huyết Kim Tuyến',drain:'Thôn Linh Huyết',sword_heart:'Kiếm Tâm',sword_beam:'Thập La Trảm Thiên',sword_array:'Vạn Kiếm Quy Tông',sword_guard:'Kiếm Khí Hộ Thể',sword_union:'Nhân Kiếm Hợp Nhất'};
const TANG={tang_dash:'Hoang Diệm Truy Sát',tang_rage:'Cuồng Bạo',tang_devour:'Phệ Thần',tang_combo:'Dịch Ảnh Liên Kích'};
// [id, ingredient, name, style, flying shape, impact shape, mana, damage, radius, extra effects]
const GROUPS={
 tang_dash:[
 ['hoang_hoa','fire','HOANG HỎA TRUY SÁT','firewind','spear','nova',65,580,220,{burn:5}],
 ['loi_diem','lightning','LÔI DIỆM PHÁ KHÔNG','lightningfire','spear','thunder_pillar',70,590,220,{stun:.8,thunder:true}],
 ['hoang_tho','earth','HOANG THỔ PHÁ THÀNH','earthfire','pillar_seal','earth_quake',70,590,230,{stun:.6}],
 ['thuong_hai','water','THƯƠNG HẢI DIỆM TRẢM','swordwater','jian_triple','sword_rain',70,590,225,{slow:2}],
 ['pha_thien','five_elements','NGŨ HÀNH PHÁ THIÊN','fivefire','five_wheel','five_prism',90,680,255,{burn:5}],
 ['diem_phong','wolf_wind','DIỆM PHONG LONG QUYỂN','firewind','tornado','vortex',65,580,235,{burn:4,pull:true}],
 ['hac_diem','snake_fang','HẮC DIỆM ĐỘC NHA','venomwind','fang','toxic_bloom',70,570,225,{poison:true,burn:4}],
 ['huyet_diem','hand','HUYẾT DIỆM MA QUYỀN','bloodfire','fang','crimson_cross',75,610,230,{burn:4}],
 ['van_kiem_diem','sword_array','VẠN KIẾM DIỆM XUNG','swordfire','jian_array','sword_storm',85,650,245,{burn:4}],
 ['nhan_kiem_diem','sword_union','NHÂN KIẾM HOANG DIỆM','swordfire','jian_giant','sword_imperial',95,720,260,{burn:5}]],
 tang_rage:[
 ['viem_ma','fire','VIÊM MA CUỒNG THÂN','firewind','orb','nova',70,510,235,{burn:5}],
 ['loi_ma','lightning','LÔI MA CHIẾN THỂ','fivelightning','orb','thunder_pillar',75,520,235,{stun:.7,thunder:true}],
 ['bat_diet','earth','BẤT DIỆT MA GIÁP','earthblood','pillar_seal','earth_quake',80,500,230,{barrier:550}],
 ['hai_ma','water','THƯƠNG HẢI MA THÂN','swordwater','jian_array','sword_rain',75,520,235,{slow:2}],
 ['ngu_hanh_ma','five_elements','NGŨ HÀNH MA THỂ','fiveblood','five_wheel','five_prism',95,640,255,{}],
 ['cuong_lang','wolf_bite','CUỒNG LANG MA THÂN','earthfire','fang','nova',65,510,225,{nextDash:true,speed:950}],
 ['ma_duc','eagle_dive','LÔI ƯNG MA DỰC','fivelightning','wing_dive','thunder_pillar',75,540,230,{stun:.7,thunder:true,speedBoost:1.2}],
 ['phe_huyet','drain','PHỆ HUYẾT MA THỂ','bloodfire','orb','crimson_cross',85,520,230,{lifeSteal:.1,manaSteal:.02}],
 ['ma_kiem_ho','sword_guard','MA KIẾM HỘ THÂN','swordearth','jian_guard','sword_cross',85,550,240,{barrier:650}],
 ['kiem_ma','sword_union','KIẾM MA CHÂN THÂN','swordfive','jian_giant','sword_imperial',100,670,260,{stun:.8}]],
 tang_devour:[
 ['hoa_lien','fire','PHỆ THẦN HỎA LIÊN','bloodfire','orb','nova',70,570,225,{burn:5}],
 ['loi_nguc','lightning','LÔI NGỤC PHỆ THẦN','shadowlightning','orb','thunder_pillar',75,580,230,{stun:.8,thunder:true}],
 ['dia_nguc','earth','ĐỊA NGỤC THÔN LINH','earthblood','pillar_seal','earth_quake',75,560,230,{barrier:350}],
 ['thuy_phe','water','THỦY KIẾM PHỆ HỒN','swordwater','jian_array','sword_rain',75,570,230,{slow:2}],
 ['thon_thien_tran','five_elements','NGŨ HÀNH THÔN THIÊN TRẬN','fiveblood','five_wheel','five_prism',95,680,255,{pull:true}],
 ['phe_loi','eagle_orb','PHỆ LÔI MA CHÂU','fivelightning','orb','thunder_pillar',70,570,235,{stun:.7,thunder:true}],
 ['doc_than','snake_fang','ĐỘC THẦN PHỆ TÂM','shadowvenom','fang','toxic_bloom',75,560,225,{poison:true}],
 ['u_minh_thon','bat_orb','U MINH THÔN THIÊN','shadowwater','orb','vortex',80,600,245,{pull:true}],
 ['huyet_tuyen','thread','HUYẾT TUYẾN PHỆ HỒN','lightningblood','twin_blades','crimson_cross',80,590,235,{manaSteal:.04}],
 ['kiem_tam','sword_heart','KIẾM TÂM THÔN LINH','swordwater','jian_triple','sword_cross',80,600,235,{manaSteal:.04}]],
 tang_combo:[
 ['diem_anh','fire','DIỆM ẢNH LIÊN KÍCH','shadowfire','spear','nova',70,590,220,{burn:5}],
 ['loi_anh','lightning','LÔI ẢNH THIÊN KÍCH','shadowlightning','wing_dive','thunder_pillar',75,600,230,{stun:.8,thunder:true}],
 ['dia_anh','earth','ĐỊA ẢNH PHÁ SƠN','earthshadow','pillar_seal','earth_quake',75,600,235,{stun:.6}],
 ['thuy_anh','water','THỦY ẢNH KIẾM VŨ','swordwater','twin_blades','sword_storm',75,590,230,{slow:2}],
 ['ngu_hanh_anh','five_elements','NGŨ HÀNH ẢNH SÁT','fiveblood','five_wheel','five_prism',95,690,255,{}],
 ['ma_xa','snake_lunge','MA XÀ LIÊN KÍCH','shadowvenom','fang','toxic_bloom',70,590,225,{poison:true}],
 ['thien_anh','bat_dive','U MINH THIÊN ẢNH','shadowwater','wing_dive','vortex',75,610,230,{pull:true}],
 ['huyet_anh','hand','HUYẾT ẢNH MA TRẢO','bloodfire','fang','crimson_cross',75,610,230,{burn:4}],
 ['thap_la','sword_beam','THẬP LA ẢNH TRẢM','swordlightning','jian_beam','sword_cross',85,660,240,{stun:.8}],
 ['van_kiem_anh','sword_array','VẠN KIẾM ẢNH SÁT','swordwater','jian_array','sword_storm',90,690,255,{}]],
};
const entries=[];
for(const [incoming,rows] of Object.entries(GROUPS))for(const [slug,partner,name,style,shape,blast,mana,damage,aoe,extra] of rows){
 const family=incoming.slice(5),attack=family==='devour'?'shot':`fusion_${family}`;
 const spec={name,base:CORE[partner]||LABELS[partner],incoming,incomingName:TANG[incoming],...(CORE[partner]?{}:{requires:partner,symmetric:true}),attack,style,shape,blast,mana,damage,aoe,cooldown:family==='rage'?55:family==='combo'?24:family==='dash'?14:15,speed:family==='dash'?950:430,radius:37,power:230,scale:1.9,fx:'thunderOrb',...extra};
 if(family==='devour'){spec.lifeSteal=spec.lifeSteal||.12;spec.manaSteal=spec.manaSteal||.03;}
 const traits=[family==='rage'?'khổng lồ 12 giây':family==='combo'?'6 đòn':family==='dash'?'lao xuyên':'hút sinh lực'];
 if(spec.burn)traits.push(`cháy ${spec.burn}s`);if(spec.poison)traits.push('độc 5s');if(spec.stun)traits.push(`choáng ${spec.stun}s`);if(spec.slow)traits.push(`chậm ${spec.slow}s`);if(spec.pull)traits.push('kéo gần');if(spec.barrier)traits.push(`lá chắn ${spec.barrier}`);
 if(spec.nextDash)traits.push('bấm lần nữa để lao');if(spec.speedBoost)traits.push('tăng tốc 20%');
 spec.hint=`${damage} ST · ${mana} linh lực · ${traits.join(' · ')}`;
 entries.push([`fusion_tang_${family}_${slug}`,Object.freeze(spec)]);
}
export const TANG_FUSION_SKILLS=Object.freeze(Object.fromEntries(entries));
