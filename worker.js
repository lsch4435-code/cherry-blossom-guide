/*
 * worker.js — Cloudflare Worker
 * 한국관광공사 TourAPI 벚꽃 축제 데이터 프록시
 *
 * ═══ 배포 방법 ═══
 * 1. https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. 이 코드를 붙여넣고 Deploy
 * 3. Settings → Variables → TOUR_API_KEY 에 공공데이터포털 API 키 입력
 *    (https://www.data.go.kr → 한국관광공사_국문관광정보서비스 신청)
 * 4. 배포된 URL을 script.js의 WORKER_URL에 입력
 *    예: var WORKER_URL = 'https://blossom-api.yourname.workers.dev/festivals';
 *
 * ═══ 엔드포인트 ═══
 * GET /festivals → 벚꽃 축제 목록 (JSON)
 * GET /health    → 상태 확인
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};
const CACHE_SEC = 6 * 3600; // 6시간 캐시

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/festivals') return handleFestivals(env, ctx);
    if (url.pathname === '/health') return json({ status: 'ok', ts: new Date().toISOString() });
    return json({ error: 'Not Found' }, 404);
  }
};

async function handleFestivals(env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request('https://cache-internal/festivals');
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  if (!env.TOUR_API_KEY) return json({ festivals: [], source: 'no-key', message: 'TOUR_API_KEY 미설정' });

  try {
    const festivals = await callTourAPI(env.TOUR_API_KEY);
    const resp = json({ festivals, source: 'tourapi', updated: new Date().toISOString(), count: festivals.length });
    const cr = new Response(resp.body, resp);
    cr.headers.set('Cache-Control', 'public, max-age=' + CACHE_SEC);
    ctx.waitUntil(cache.put(cacheKey, cr.clone()));
    return cr;
  } catch (e) {
    return json({ festivals: [], source: 'error', message: e.message }, 500);
  }
}

async function callTourAPI(key) {
  const base = 'https://apis.data.go.kr/B551011/KorService1/searchFestival1';
  const year = new Date().getFullYear();
  const params = new URLSearchParams({
    serviceKey: key, MobileApp: 'BlossomGuide', MobileOS: 'ETC',
    _type: 'json', numOfRows: '50', pageNo: '1',
    eventStartDate: year + '0301', arrange: 'A'
  });
  const res = await fetch(base + '?' + params);
  if (!res.ok) throw new Error('TourAPI HTTP ' + res.status);
  const data = await res.json();
  const items = data?.response?.body?.items?.item || [];
  const kw = ['벚꽃', '봄꽃', '개화', '군항제', '왕벚', '벚나무'];
  return items
    .filter(i => kw.some(k => (i.title || '').includes(k)))
    .map(i => ({
      id: 'api-' + i.contentid,
      rid: guessRid(i.addr1 || ''),
      region: (i.addr1 || '').split(' ').slice(0, 2).join(' ') || '기타',
      title: i.title || '',
      period: fmtDate(i.eventstartdate) + ' ~ ' + fmtDate(i.eventenddate),
      loc: i.addr1 || '', desc: i.title,
      hl: ['공공데이터'], time: '공식 확인', trans: '공식 사이트 참고',
      park: '현지 확인', crowd: '확인 필요', tags: ['API', '' + year]
    }));
}

function fmtDate(d) {
  if (!d || d.length < 8) return '미정';
  return parseInt(d.substring(4, 6)) + '/' + parseInt(d.substring(6, 8));
}

function guessRid(addr) {
  var m = { '서울':'seoul','인천':'incheon','부산':'busan','대구':'daegu','대전':'daejeon',
    '광주':'gwangju','울산':'ulsan','창원':'changwon','진해':'changwon','전주':'jeonju',
    '여수':'yeosu','목포':'mokpo','포항':'pohang','강릉':'gangneung','춘천':'chuncheon',
    '청주':'cheongju','제주':'seogwipo','서귀포':'seogwipo' };
  for (var k in m) if (addr.includes(k)) return m[k];
  return '';
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: CORS });
}
