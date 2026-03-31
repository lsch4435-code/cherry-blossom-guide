/* ═══════════════════════════════════════════
   2026 한국 벚꽃 가이드 — script.js
   ═══════════════════════════════════════════ */

/* ─── 유틸 ─── */
function parseD(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function fmtD(s){var d=parseD(s);return(d.getMonth()+1)+'.'+d.getDate()}
function todayS(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function esc(s){var el=document.createElement('div');el.textContent=s;return el.innerHTML}
function safe(name){try{return Array.isArray(window[name])?window[name]:[]}catch(e){return[]}}

/* ─── Storage ─── */
function stGet(k,fb){try{return JSON.parse(localStorage.getItem(k))||fb}catch(e){return fb}}
function stSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* ─── 즐겨찾기 ─── */
function getFavs(){return stGet('cb-fav',[])}
function isFav(id){return getFavs().indexOf(id)!==-1}
function togFav(id){var f=getFavs(),i=f.indexOf(id);if(i>=0)f.splice(i,1);else f.push(id);stSet('cb-fav',f);return f.indexOf(id)!==-1}

/* ─── 개화 상태 판정 ─── */
function bStat(bs,bf){
  var now=new Date();now.setHours(0,0,0,0);
  var s=parseD(bs),f=parseD(bf);
  var ew=new Date(f);ew.setDate(ew.getDate()+5);
  var ed=new Date(f);ed.setDate(ed.getDate()+10);
  var ds=Math.ceil((s-now)/864e5);
  if(now<new Date(s.getTime()-5*864e5))return{l:'개화 전 D-'+ds,c:'bdg-b',st:'before'};
  if(now<s)return{l:'곧 개화 D-'+ds,c:'bdg-s',st:'soon'};
  if(now<=f)return{l:'개화 중 🌸',c:'bdg-bl',st:'blooming'};
  if(now<=ew)return{l:'만개 🌸',c:'bdg-f',st:'peak'};
  if(now<=ed)return{l:'막바지 🍃',c:'bdg-e',st:'ending'};
  return{l:'시즌 종료',c:'bdg-x',st:'done'};
}

/* ═══ 탭 전환 ═══ */
function go(t){
  document.querySelectorAll('.panel').forEach(function(p){p.classList.toggle('on',p.id==='p-'+t)});
  document.querySelectorAll('.tb').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-t')===t)});
  var mm=document.getElementById('mmenu');if(mm)mm.classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  if(t==='fav')renderFav();
}

/* ═══════════════════════════════
   DOM Ready
   ═══════════════════════════════ */
document.addEventListener('DOMContentLoaded',function(){

  /* 안전하게 데이터 가져오기 */
  var BD=safe('bloomData'), FD=safe('festivalData'), SD=safe('spotsData'), ED=safe('experienceData'), FO=safe('foodData');

  /* ─── 탭 버튼 ─── */
  document.querySelectorAll('.tb').forEach(function(b){b.addEventListener('click',function(){go(b.getAttribute('data-t'))})});

  /* ─── 햄버거 메뉴 ─── */
  var mm=document.getElementById('mmenu');
  document.getElementById('hamburger').addEventListener('click',function(){mm.classList.toggle('open')});
  document.querySelectorAll('#tabs .tb').forEach(function(b){
    var c=b.cloneNode(true);
    c.addEventListener('click',function(){go(c.getAttribute('data-t'))});
    mm.appendChild(c);
  });

  /* ═══════════════════════════
     지도 렌더링
     ═══════════════════════════ */
  var mapEl=document.getElementById('themap');

  (function renderMap(){
    var paths=safe('koreaMapPaths');
    if(!paths.length){mapEl.innerHTML='<div class="error-msg">지도 데이터를 불러올 수 없습니다.<br>mapData.js 파일을 확인해 주세요.</div>';return}

    /* 시도별 색상 (남→북 그라데이션) */
    var fills={
      gyeonggi:'#f9dce4',seoul:'#f5c6d4',incheon:'#f2bccf',
      gangwon:'#f0d5e5',chungbuk:'#f4cad8',chungnam:'#f7d2df',
      daejeon:'#f2b8cc',gyeongbuk:'#f5d0dc',daegu:'#f0b0c8',
      gyeongnam:'#f2c0d2',ulsan:'#edb0c5',busan:'#eba8c0',
      jeonbuk:'#f7d5e0',jeonnam:'#f4c8d6',gwangju:'#f0b5ca',
      jeju:'#fce0ea'
    };

    var svg='<svg viewBox="0 0 380 480" xmlns="http://www.w3.org/2000/svg">';
    /* 배경 */
    svg+='<rect width="380" height="480" fill="none"/>';
    /* 바다 라벨 */
    svg+='<text x="42" y="55" class="map-sea">서 해</text>';
    svg+='<text x="338" y="120" class="map-sea">동 해</text>';
    svg+='<text x="180" y="395" class="map-sea">남 해</text>';

    /* 시도 path */
    paths.forEach(function(p){
      var col=fills[p.id]||'#f5d0dc';
      svg+='<path d="'+p.d+'" fill="'+col+'" class="map-province" data-pid="'+p.id+'"/>';
      svg+='<path d="'+p.d+'" class="map-stroke"/>';
    });

    /* 시도 라벨 */
    var lbl=[
      [183,112,'서울'],[132,108,'인천'],[182,146,'경기'],
      [278,92,'강원'],[238,186,'충북'],[148,192,'충남'],
      [198,210,'대전'],[290,196,'경북'],[276,238,'대구'],
      [268,282,'경남'],[322,254,'울산'],[308,316,'부산'],
      [148,252,'전북'],[148,318,'전남'],[140,308,'광주'],
      [163,436,'제주']
    ];
    lbl.forEach(function(l){svg+='<text x="'+l[0]+'" y="'+l[1]+'" class="map-label">'+l[2]+'</text>'});

    svg+='</svg>';
    mapEl.innerHTML=svg;

    /* ─── 핀 생성 ─── */
    if(!BD.length){
      var n=document.createElement('div');n.className='error-msg';n.innerHTML='개화 데이터를 불러올 수 없습니다.<br>bloomData.js를 확인해 주세요.';
      mapEl.appendChild(n);return;
    }
    var pinPos=(typeof mapPinPositions!=='undefined')?mapPinPositions:{};

    BD.forEach(function(b){
      var pos=pinPos[b.id];
      if(!pos)return;
      var stat=bStat(b.bloomStart,b.fullBloom);
      var pin=document.createElement('div');
      pin.className='pin';
      pin.style.left=pos.x+'%';
      pin.style.top=pos.y+'%';
      pin.setAttribute('data-rid',b.id);
      pin.setAttribute('data-status',stat.st);
      pin.setAttribute('tabindex','0');
      pin.setAttribute('role','button');
      pin.setAttribute('aria-label',b.title+' '+fmtD(b.bloomStart));
      pin.innerHTML='<div class="pin-c"><span class="pin-n">'+b.region+'</span><span class="pin-d">'+fmtD(b.bloomStart)+'</span></div>';
      pin.addEventListener('click',function(){openRegion(b.id)});
      pin.addEventListener('keydown',function(e){if(e.key==='Enter')openRegion(b.id)});
      mapEl.appendChild(pin);
    });
  })();

  /* ═══════════════════════════
     지역 상세 패널
     ═══════════════════════════ */
  function openRegion(rid){
    var b=BD.find(function(x){return x.id===rid});
    if(!b)return;
    document.querySelectorAll('.pin').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-rid')===rid)});
    var st=bStat(b.bloomStart,b.fullBloom);
    var fests=FD.filter(function(f){return f.rid===rid});
    var spots=SD.filter(function(s){return s.rid===rid});

    var h='<span class="rp-emoji">'+b.emoji+'</span>'
      +'<div class="rp-title">'+b.title+' <span class="bdg '+st.c+'">'+st.l+'</span></div>'
      +'<p class="rp-desc">'+b.desc+'</p>'
      +'<div class="bloom-grid">'
      +'<div class="bloom-item"><div class="bl">🌱 개화 예상</div><div class="bv">'+fmtD(b.bloomStart)+'</div></div>'
      +'<div class="bloom-item"><div class="bl">🌸 만개 예상</div><div class="bv">'+fmtD(b.fullBloom)+'</div></div>'
      +'<div class="bloom-item"><div class="bl">👀 추천 관람</div><div class="bv">'+b.bestView+'</div></div>'
      +(b.diff?'<div class="bloom-item"><div class="bl">📊 평년 대비</div><div class="bv">'+b.diff+'일</div></div>':'')
      +'</div>'
      +'<div class="tags">'+b.tags.map(function(t){return'<span class="tag tp">'+t+'</span>'}).join('')+'</div>';

    /* 축제 */
    if(fests.length){
      h+='<div class="rsub">🎪 축제</div>';
      fests.forEach(function(f){
        h+='<div class="card" style="margin-bottom:12px">'
          +'<div class="card-top"><div class="card-lbl">'+f.region+'</div><button class="fvb '+(isFav(f.id)?'on':'')+'" data-fid="'+f.id+'">⭐</button></div>'
          +'<div class="card-t">'+f.title+'</div>'
          +'<p class="card-d">'+f.desc+'</p>'
          +'<div class="card-i">📅 '+f.period+'<br>📍 '+f.loc+'<br>🕐 '+f.time+'<br>🚗 '+f.trans+'<br>🅿️ '+f.park+'<br>👥 '+f.crowd+'</div>'
          +'<div class="tags">'+f.hl.map(function(x){return'<span class="tag tv">'+x+'</span>'}).join('')+'</div></div>';
      });
    }

    /* 명소 */
    if(spots.length){
      h+='<div class="rsub">📍 명소</div>';
      spots.forEach(function(s){
        h+='<div class="card" style="margin-bottom:12px">'
          +'<div class="card-top"><span class="tag '+(s.cat==='대표'?'tp':'tv')+'">'+s.cat+' 명소</span><button class="fvb '+(isFav(s.id)?'on':'')+'" data-fid="'+s.id+'">⭐</button></div>'
          +'<div class="card-t">'+s.title+'</div>'
          +'<p class="card-d">'+s.desc+'</p>'
          +'<p style="font-size:.8rem;color:var(--tx2)">📸 '+s.photo+'</p>'
          +'<p style="font-size:.8rem;margin-top:3px">🎨 '+s.atmo+' · 👥 '+s.crowd+'</p>'
          +'<div class="trbox">'
          +(s.tr.sub&&s.tr.sub!=='없음'?'<div class="trrow"><span class="trl">지하철</span><span>'+s.tr.sub+'</span></div>':'')
          +'<div class="trrow"><span class="trl">버스</span><span>'+s.tr.bus+'</span></div>'
          +'<div class="trrow"><span class="trl">자차</span><span>'+s.tr.car+'</span></div>'
          +'<div class="trrow"><span class="trl">주차</span><span>'+s.tr.prk+'</span></div>'
          +'<div class="trrow"><span class="trl">당일치기</span><span>'+s.tr.day+'</span></div></div>'
          +'<div class="tags">'+s.tags.map(function(t){return'<span class="tag ts">'+t+'</span>'}).join('')+'</div></div>';
      });
    }

    /* 네이버 검색 링크 */
    h+='<div style="text-align:center"><a href="https://search.naver.com/search.naver?query='+encodeURIComponent(b.title+' 벚꽃 2026')+'" target="_blank" rel="noopener" class="naver-link">🔍 네이버에서 최신 정보 보기</a></div>';

    document.getElementById('rpBody').innerHTML=h;
    var panel=document.getElementById('regionPanel');
    panel.style.display='block';
    panel.scrollIntoView({behavior:'smooth',block:'start'});
    bindFav(panel);
  }

  document.getElementById('rpClose').addEventListener('click',function(){
    document.getElementById('regionPanel').style.display='none';
    document.querySelectorAll('.pin').forEach(function(p){p.classList.remove('on')});
  });

  /* ═══ 즐겨찾기 버튼 바인딩 ═══ */
  function bindFav(ctx){
    ctx.querySelectorAll('.fvb').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var on=togFav(btn.getAttribute('data-fid'));
        btn.classList.toggle('on',on);
        renderFav();
      });
    });
  }

  /* ═══════════════════════════
     축제 탭
     ═══════════════════════════ */
  function renderFest(q,rgn){
    var d=FD.slice();
    if(!d.length){document.getElementById('festGrid').innerHTML='<p class="empty">축제 데이터를 불러올 수 없어요<br><small>festivalData.js를 확인하거나 새로고침해 보세요</small></p>';return}
    if(q){var ql=q.toLowerCase();d=d.filter(function(f){return f.title.toLowerCase().indexOf(ql)>=0||f.region.toLowerCase().indexOf(ql)>=0})}
    if(rgn)d=d.filter(function(f){return f.region===rgn});
    var g=document.getElementById('festGrid');
    if(!d.length){g.innerHTML='<p class="empty">검색 결과가 없습니다</p>';return}
    g.innerHTML=d.map(function(f){
      return'<div class="card"><div class="card-top"><div class="card-lbl">'+f.region+'</div><button class="fvb '+(isFav(f.id)?'on':'')+'" data-fid="'+f.id+'">⭐</button></div>'
        +'<div class="card-t">🎪 '+f.title+'</div><p class="card-d">'+f.desc+'</p>'
        +'<div class="card-i">📅 '+f.period+'<br>📍 '+f.loc+'<br>🕐 '+f.time+'<br>🚗 '+f.trans+'<br>👥 '+f.crowd+'</div>'
        +'<div class="tags">'+f.hl.map(function(x){return'<span class="tag tv">'+x+'</span>'}).join('')+f.tags.map(function(x){return'<span class="tag tp">'+x+'</span>'}).join('')+'</div></div>'
    }).join('');
    bindFav(g);
  }

  /* 지역 필터 옵션 */
  var fRgn=document.getElementById('fRgn');
  var rgnSet={};FD.forEach(function(f){rgnSet[f.region]=1});
  Object.keys(rgnSet).sort().forEach(function(r){var o=document.createElement('option');o.value=r;o.textContent=r;fRgn.appendChild(o)});
  document.getElementById('fSrch').addEventListener('input',function(e){renderFest(e.target.value,fRgn.value)});
  fRgn.addEventListener('change',function(){renderFest(document.getElementById('fSrch').value,fRgn.value)});

  /* ═══════════════════════════
     명소 탭
     ═══════════════════════════ */
  function renderSpot(q,cat){
    var d=SD.slice();
    if(!d.length){document.getElementById('spotGrid').innerHTML='<p class="empty">명소 데이터를 불러올 수 없어요</p>';return}
    if(q){var ql=q.toLowerCase();d=d.filter(function(s){return s.title.toLowerCase().indexOf(ql)>=0||s.region.toLowerCase().indexOf(ql)>=0})}
    if(cat)d=d.filter(function(s){return s.cat===cat});
    var g=document.getElementById('spotGrid');
    if(!d.length){g.innerHTML='<p class="empty">검색 결과가 없습니다</p>';return}
    g.innerHTML=d.map(function(s){
      return'<div class="card"><div class="card-top"><div><span class="tag '+(s.cat==='대표'?'tp':'tv')+'">'+s.cat+' 명소</span> <span class="card-lbl" style="margin-left:4px">'+s.region+'</span></div><button class="fvb '+(isFav(s.id)?'on':'')+'" data-fid="'+s.id+'">⭐</button></div>'
        +'<div class="card-t">📍 '+s.title+'</div><p class="card-d">'+s.desc+'</p>'
        +'<p style="font-size:.8rem;color:var(--tx2)">📸 '+s.photo+'</p>'
        +'<p style="font-size:.8rem;margin-top:3px">🎨 '+s.atmo+' · 👥 '+s.crowd+'</p>'
        +'<div class="trbox">'
        +(s.tr.sub&&s.tr.sub!=='없음'?'<div class="trrow"><span class="trl">지하철</span><span>'+s.tr.sub+'</span></div>':'')
        +'<div class="trrow"><span class="trl">버스</span><span>'+s.tr.bus+'</span></div>'
        +'<div class="trrow"><span class="trl">자차</span><span>'+s.tr.car+'</span></div>'
        +'<div class="trrow"><span class="trl">주차</span><span>'+s.tr.prk+'</span></div>'
        +'<div class="trrow"><span class="trl">당일치기</span><span>'+s.tr.day+'</span></div></div>'
        +'<div class="tags">'+s.tags.map(function(t){return'<span class="tag ts">'+t+'</span>'}).join('')+'</div></div>'
    }).join('');
    bindFav(g);
  }
  document.getElementById('sSrch').addEventListener('input',function(e){renderSpot(e.target.value,document.getElementById('sCat').value)});
  document.getElementById('sCat').addEventListener('change',function(){renderSpot(document.getElementById('sSrch').value,document.getElementById('sCat').value)});

  /* ═══════════════════════════
     체험·음식
     ═══════════════════════════ */
  (function renderExp(){
    var eg=document.getElementById('expGrid');
    if(!ED.length){eg.innerHTML='<p class="empty">체험 데이터를 불러올 수 없어요</p>'}
    else{eg.innerHTML=ED.map(function(e){
      return'<div class="card"><div class="card-icon">'+e.icon+'</div><div class="card-lbl">'+e.region+'</div>'
        +'<div class="card-t">'+e.title+'</div><p class="card-d">'+e.desc+'</p>'
        +'<div class="card-tip">💡 '+e.tip+'</div>'
        +'<div class="tags">'+e.tags.map(function(t){return'<span class="tag tv">'+t+'</span>'}).join('')+'</div></div>'
    }).join('')}
    var fg=document.getElementById('foodGrid');
    if(!FO.length){fg.innerHTML='<p class="empty">음식 데이터를 불러올 수 없어요</p>'}
    else{fg.innerHTML=FO.map(function(f){
      return'<div class="card"><div class="card-icon">'+f.icon+'</div>'
        +'<div class="card-t">'+f.title+'</div><p class="card-d">'+f.desc+'</p>'
        +'<div class="card-i">📍 '+f.where+'<br>🤝 '+f.pair+'</div>'
        +'<div class="tags">'+f.tags.map(function(t){return'<span class="tag tp">'+t+'</span>'}).join('')+'</div></div>'
    }).join('')}
  })();

  /* ═══════════════════════════
     플래너
     ═══════════════════════════ */
  function renderPlan(ds){
    var g=document.getElementById('planGrid');
    if(!BD.length){g.innerHTML='<p class="empty">개화 데이터를 불러올 수 없어요</p>';return}
    if(!ds){g.innerHTML='<p class="empty">📅 날짜를 선택해 주세요</p>';return}
    var tgt=parseD(ds);
    var res=BD.map(function(b){
      var s=parseD(b.bloomStart),f=parseD(b.fullBloom);
      var we=new Date(f);we.setDate(we.getDate()+7);
      var df=Math.ceil((tgt-f)/864e5),dss=Math.ceil((tgt-s)/864e5);
      var m,mc,sc;
      if(tgt>=s&&tgt<=we){if(df>=-1&&df<=4){m='🌸 절정!';mc='m-p';sc=100}else{m='✅ 관람 가능';mc='m-g';sc=70}}
      else if(tgt<s){m='D-'+Math.abs(dss);mc='m-e';sc=Math.max(0,50-Math.abs(dss))}
      else{m='시즌 지남';mc='m-l';sc=0}
      return{id:b.id,emoji:b.emoji,region:b.region,title:b.title,desc:b.desc,bloomStart:b.bloomStart,fullBloom:b.fullBloom,bestView:b.bestView,m:m,mc:mc,sc:sc}
    }).sort(function(a,b){return b.sc-a.sc});
    g.innerHTML=res.map(function(r){
      return'<div class="card"><div class="card-icon">'+r.emoji+'</div><div class="card-lbl">'+r.region+'</div>'
        +'<div class="card-t">'+r.title+' <span class="pmatch '+r.mc+'">'+r.m+'</span></div>'
        +'<p class="card-d">'+r.desc+'</p>'
        +'<div class="card-i">🌱 개화 '+fmtD(r.bloomStart)+' · 🌸 만개 '+fmtD(r.fullBloom)+'<br>👀 '+r.bestView+'</div></div>'
    }).join('');
  }
  document.getElementById('planBtn').addEventListener('click',function(){renderPlan(document.getElementById('planDate').value)});
  document.getElementById('planDate').addEventListener('change',function(){renderPlan(this.value)});

  /* ═══════════════════════════
     블로그
     ═══════════════════════════ */
  function getBlog(){return stGet('cb-blog',[])}
  function setBlog(a){stSet('cb-blog',a)}

  document.querySelectorAll('.btb').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.btb').forEach(function(b){b.classList.remove('on')});
      btn.classList.add('on');
      document.querySelectorAll('.bview').forEach(function(v){v.classList.remove('on')});
      document.getElementById('bv-'+btn.getAttribute('data-bv')).classList.add('on');
      if(btn.getAttribute('data-bv')==='my')renderMyBlog();
      if(btn.getAttribute('data-bv')==='pub')renderPubBlog();
    });
  });

  document.getElementById('bSave').addEventListener('click',function(){
    var txt=document.getElementById('bText').value.trim();
    if(!txt){alert('내용을 입력해주세요!');return}
    var posts=getBlog();
    posts.unshift({id:'p'+Date.now(),title:document.getElementById('bTitle').value.trim()||'제목 없음',date:document.getElementById('bDate').value||todayS(),loc:document.getElementById('bLoc').value.trim(),mood:document.getElementById('bMood').value,text:txt,pub:document.getElementById('bPub').checked,ts:new Date().toISOString()});
    setBlog(posts);
    document.getElementById('bTitle').value='';document.getElementById('bText').value='';document.getElementById('bLoc').value='';
    alert('발행되었습니다! 🌸');
  });

  function blogCard(p,i,mine){
    return'<article class="bpost"><div class="bpost-t">'+esc(p.title)+'</div>'
      +'<div class="bpost-m"><span>'+p.mood+'</span><span>📅 '+p.date+'</span>'+(p.loc?'<span>📍 '+esc(p.loc)+'</span>':'')
      +'<span class="bvis '+(p.pub?'vis-on':'vis-off')+'">'+(p.pub?'공개':'비공개')+'</span></div>'
      +'<div class="bpost-b">'+esc(p.text)+'</div>'
      +(mine?'<div class="bpost-a"><button class="bact" data-bi="'+i+'" data-ba="tog">'+(p.pub?'🔒 비공개로':'🌐 공개로')+'</button><button class="bact del" data-bi="'+i+'" data-ba="del">🗑️ 삭제</button></div>':'')
      +'</article>';
  }
  function renderMyBlog(){
    var el=document.getElementById('blogMy'),posts=getBlog();
    if(!posts.length){el.innerHTML='<p class="empty">아직 작성한 글이 없어요<br><small>글쓰기 탭에서 첫 글을 작성해보세요</small></p>';return}
    el.innerHTML=posts.map(function(p,i){return blogCard(p,i,true)}).join('');
    el.querySelectorAll('.bact').forEach(function(btn){
      btn.addEventListener('click',function(){
        var idx=+btn.getAttribute('data-bi'),act=btn.getAttribute('data-ba'),posts=getBlog();
        if(act==='del'){if(!confirm('삭제할까요?'))return;posts.splice(idx,1)}else{posts[idx].pub=!posts[idx].pub}
        setBlog(posts);renderMyBlog();
      });
    });
  }
  function renderPubBlog(){
    var el=document.getElementById('blogPub'),posts=getBlog().filter(function(p){return p.pub});
    if(!posts.length){el.innerHTML='<p class="empty">공개된 글이 없어요<br><small>글 작성 시 "공개" 체크하면 여기에 표시됩니다</small></p>';return}
    el.innerHTML=posts.map(function(p){return blogCard(p,-1,false)}).join('');
  }

  /* ═══════════════════════════
     즐겨찾기
     ═══════════════════════════ */
  window.renderFav=function(){
    var g=document.getElementById('favGrid'),em=document.getElementById('favEmpty'),ids=getFavs();
    if(!ids.length){g.innerHTML='';em.style.display='block';return}
    em.style.display='none';
    var all=FD.map(function(f){return{id:f.id,type:'축제',icon:'🎪',title:f.title,region:f.region,desc:f.desc}})
      .concat(SD.map(function(s){return{id:s.id,type:s.cat+' 명소',icon:'📍',title:s.title,region:s.region,desc:s.desc}}));
    var items=ids.map(function(id){return all.find(function(x){return x.id===id})}).filter(Boolean);
    if(!items.length){g.innerHTML='';em.style.display='block';return}
    g.innerHTML=items.map(function(it){
      return'<div class="card"><div class="card-top"><span class="tag tv">'+it.type+'</span><button class="fvb on" data-fid="'+it.id+'">⭐</button></div>'
        +'<div class="card-t">'+it.icon+' '+it.title+'</div><div class="card-lbl">'+it.region+'</div>'
        +'<p class="card-d">'+it.desc+'</p></div>'
    }).join('');
    bindFav(g);
  };

  /* ═══════════════════════════
     API 자동 업데이트 (Cloudflare Worker)
     ═══════════════════════════ */
  // ★ Worker URL을 여기에 넣으면 실시간 축제 데이터를 가져옵니다
  // 예: var WORKER_URL = 'https://blossom-api.yourname.workers.dev/festivals';
  var WORKER_URL = null;

  function fetchLive(){
    if(!WORKER_URL)return;
    fetch(WORKER_URL).then(function(r){
      if(!r.ok)throw new Error(r.status);return r.json()
    }).then(function(data){
      if(data&&data.festivals&&data.festivals.length){
        data.festivals.forEach(function(af){
          var ex=FD.find(function(f){return f.id===af.id});
          if(ex){if(af.period)ex.period=af.period;if(af.desc)ex.desc=af.desc}
          else{FD.push(af)}
        });
        var notice=document.getElementById('apiNotice');
        if(notice)notice.style.display='flex';
        renderFest('','');
      }
    }).catch(function(err){console.warn('API 연동 실패, 기본 데이터 사용:',err.message)});
  }
  var refreshBtn=document.getElementById('apiRefresh');
  if(refreshBtn)refreshBtn.addEventListener('click',fetchLive);

  /* ═══════════════════════════
     꽃잎 효과
     ═══════════════════════════ */
  var petBox=document.getElementById('petals-box'),petBtn=document.getElementById('btn-petal');
  var petOn=stGet('cb-pet',true),petTmr=null;
  var pcols=[{c:'#ffc0cb',e:'#ffaabb'},{c:'#ffe0ec',e:'#ffd1e0'},{c:'#ffd6e7',e:'#ffbdd6'},{c:'#fff0f5',e:'#ffe8ef'},{c:'#fce4ec',e:'#f8bbd0'}];
  function mkPetal(){
    var el=document.createElement('div');el.className='ptl';
    var col=pcols[Math.floor(Math.random()*pcols.length)],sz=8+Math.random()*14,dur=4+Math.random()*6,dx=Math.random()*160-80,sd=Math.random()>.5?'360deg':'-360deg',sdur=2+Math.random()*4;
    el.style.left=Math.random()*100+'vw';el.style.setProperty('--dx',dx+'px');el.style.animationDuration=dur+'s';el.style.animationDelay=Math.random()*.8+'s';
    el.innerHTML='<div class="ptl-s" style="--sz:'+sz+'px;--pc:'+col.c+';--pe:'+col.e+';--sd:'+sd+';animation-duration:'+sdur+'s"></div>';
    petBox.appendChild(el);el.addEventListener('animationend',function(){el.remove()});
  }
  function startPet(){if(petTmr)return;petTmr=setInterval(function(){if(document.visibilityState==='visible')mkPetal()},350);for(var i=0;i<10;i++)setTimeout(mkPetal,i*120)}
  function stopPet(){if(petTmr){clearInterval(petTmr);petTmr=null}petBox.innerHTML=''}
  function updPet(){if(petOn){startPet();petBtn.classList.remove('off')}else{stopPet();petBtn.classList.add('off')}}
  petBtn.addEventListener('click',function(){petOn=!petOn;stSet('cb-pet',petOn);updPet()});
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='hidden'&&petTmr){clearInterval(petTmr);petTmr=null}
    else if(document.visibilityState==='visible'&&petOn)startPet();
  });

  /* ═══════════════════════════
     BGM
     ═══════════════════════════ */
  var bgmBtn=document.getElementById('btn-bgm'),actx=null,bgmOn=false,oscs=null,gn=null,ct=null;
  function startBgm(){
    if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();
    var ch=[[261.63,329.63,392,523.25],[293.66,369.99,440,587.33],[246.94,311.13,369.99,493.88],[220,277.18,329.63,440]];
    gn=actx.createGain();gn.gain.setValueAtTime(0,actx.currentTime);gn.gain.linearRampToValueAtTime(.06,actx.currentTime+1);gn.connect(actx.destination);
    oscs=ch[0].map(function(fr,i){var o=actx.createOscillator();o.type='sine';o.frequency.setValueAtTime(fr,actx.currentTime);o.detune.setValueAtTime(Math.random()*8-4,actx.currentTime);var g2=actx.createGain();g2.gain.setValueAtTime(.25-i*.04,actx.currentTime);o.connect(g2);g2.connect(gn);o.start();return o});
    var ci=0;function nx(){if(!bgmOn)return;ci=(ci+1)%ch.length;var c=ch[ci];oscs.forEach(function(o,i){if(c[i])o.frequency.linearRampToValueAtTime(c[i],actx.currentTime+2)});ct=setTimeout(nx,8e3)}
    ct=setTimeout(nx,8e3);
  }
  function stopBgm(){if(gn)gn.gain.linearRampToValueAtTime(0,actx.currentTime+.5);setTimeout(function(){if(oscs){oscs.forEach(function(o){try{o.stop()}catch(e){}});oscs=null}},600);if(ct){clearTimeout(ct);ct=null}}
  bgmBtn.addEventListener('click',function(){bgmOn=!bgmOn;bgmBtn.classList.toggle('playing',bgmOn);if(bgmOn)startBgm();else stopBgm()});

  /* ═══════════════════════════
     초기 렌더
     ═══════════════════════════ */
  document.getElementById('planDate').value=todayS();
  document.getElementById('bDate').value=todayS();
  renderFest('','');
  renderSpot('','');
  renderPlan(todayS());
  renderFav();
  updPet();
  fetchLive();

});
