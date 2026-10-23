/* =========================================
   WAVE — колода анкет, волны, слоты, мэтчи
   Зависит от landing.js (INTENTS, show, FEED, WAVES, DONE, DEBUG, dbOn, changeCityFromFeed) и supabase.js
========================================= */
const ICEBREAKERS = {
    sport: 'Каким спортом занимаешься?',
    gaming: 'Во что любишь играть?',
    travel: 'Какое место запомнилось больше всего?',
    events: 'На какие мероприятия ходишь?',
    hobby: 'Чем увлекаешься в свободное время?',
    party: 'Какие тусовки тебе по душе?',
    drives: 'На чём катаешься и какой маршрут любимый?',
    chat: 'О чём тебе интересно поговорить?',
    friendship: 'Что для тебя важно в друзьях?',
    relationship: 'Какие отношения ты ищешь?'
};

const EMPTY_WAVE_SVG = `
<svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
        <filter id="glowStrong" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        <filter id="glowAmbient" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" />
        </filter>
        <linearGradient id="waveMainGrad" x1="20" y1="100" x2="300" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0" />
            <stop offset="22%" stop-color="#A855F7" />
            <stop offset="58%" stop-color="#D9F99D" />
            <stop offset="88%" stop-color="#B5C680" />
            <stop offset="100%" stop-color="#B5C680" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="leftProfileGrad" x1="70" y1="30" x2="155" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.15" />
            <stop offset="45%" stop-color="#C084FC" />
            <stop offset="100%" stop-color="#B5C680" />
        </linearGradient>
        <linearGradient id="rightProfileGrad" x1="190" y1="55" x2="275" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FEF08A" />
            <stop offset="55%" stop-color="#B5C680" />
            <stop offset="100%" stop-color="#B5C680" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id="subWaveGrad" x1="40" y1="115" x2="285" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0" />
            <stop offset="35%" stop-color="#9333EA" stop-opacity="0.55" />
            <stop offset="75%" stop-color="#B5C680" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#B5C680" stop-opacity="0" />
        </linearGradient>
    </defs>

    <!-- Фоновое неоновое свечение -->
    <ellipse cx="115" cy="92" rx="65" ry="42" fill="#7C3AED" fill-opacity="0.28" filter="url(#glowAmbient)" />
    <ellipse cx="195" cy="110" rx="68" ry="36" fill="#B5C680" fill-opacity="0.22" filter="url(#glowAmbient)" />

    <!-- Вторичная полупрозрачная волна -->
    <path d="M22 118 C 68 86, 118 92, 156 116 C 188 136, 226 78, 296 92"
          stroke="url(#subWaveGrad)" stroke-width="2" stroke-linecap="round" />

    <!-- Левый силуэт (профиль девушки, смотрит вправо) -->
    <path d="M58 96
             C 72 52, 96 32, 120 34
             C 136 35, 144 45, 143 56
             C 143 61, 149 66, 149 69
             C 149 72, 144 73, 145 76
             C 146 78, 144 81, 145 83
             C 145 87, 139 91, 134 91
             C 129 91, 127 99, 132 108"
          stroke="url(#leftProfileGrad)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowStrong)" />

    <!-- Правый силуэт (профиль, смотрит влево) -->
    <path d="M214 118
             C 212 112, 205 110, 205 105
             C 205 102, 203 100, 204 98
             C 205 96, 201 94, 201 91
             C 201 88, 206 83, 206 77
             C 206 66, 218 58, 236 62
             C 256 66, 272 82, 292 80"
          stroke="url(#rightProfileGrad)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowStrong)" />

    <!-- Внутренняя линия волос правого силуэта -->
    <path d="M206 76 C 214 66, 232 68, 252 78 C 266 85, 280 86, 294 84"
          stroke="url(#rightProfileGrad)" stroke-width="1.4" stroke-opacity="0.7" stroke-linecap="round" />

    <!-- Главная светящаяся волна, соединяющая профили -->
    <path d="M18 112
             C 56 82, 92 84, 130 112
             C 162 136, 188 148, 222 122
             C 246 103, 268 94, 302 96"
          stroke="url(#waveMainGrad)" stroke-width="4" stroke-linecap="round" filter="url(#glowStrong)" />

    <!-- Светящиеся частицы вокруг волны -->
    <circle cx="48"  cy="84"  r="2"   fill="#FEF08A" opacity="0.85" />
    <circle cx="84"  cy="118" r="2.5" fill="#C084FC" opacity="0.75" />
    <circle cx="154" cy="36"  r="2.2" fill="#C084FC" opacity="0.7" />
    <circle cx="186" cy="58"  r="1.8" fill="#D9F99D" opacity="0.8" />
    <circle cx="168" cy="116" r="1.5" fill="#FEF08A" opacity="0.75" />
    <circle cx="248" cy="52"  r="1.8" fill="#D9F99D" opacity="0.75" />
    <circle cx="258" cy="114" r="2.4" fill="#A855F7" opacity="0.75" />
    <circle cx="232" cy="136" r="1.4" fill="#FEF08A" opacity="0.6" />
</svg>`;

const PIN_ICON_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="#B5C680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
</svg>`;

const GLOBE_PIN_SVG = `
<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="16" cy="19" r="11" stroke="#B5C680" stroke-width="1.7" />
    <ellipse cx="16" cy="19" rx="5.2" ry="11" stroke="#B5C680" stroke-width="1.6" />
    <path d="M5.5 16h19M5.5 22h19" stroke="#B5C680" stroke-width="1.5" stroke-linecap="round" />
    <path d="M25 6c-2.5 0-4.5 1.95-4.5 4.35 0 3.1 4.5 7.15 4.5 7.15s4.5-4.05 4.5-7.15C29.5 7.95 27.5 6 25 6z"
          fill="#160B2A" stroke="#B5C680" stroke-width="1.7" stroke-linejoin="round" />
    <circle cx="25" cy="10.3" r="1.4" fill="#B5C680" />
</svg>`;

const TOAST_ICONS = {
    globe: GLOBE_PIN_SVG,
    wave: `<svg viewBox="0 0 36 36" fill="none" stroke="#B5C680" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18c3.5-4.5 7.5-4.5 11 0s7.5 4.5 11 0 4.5-3 6-1.5"/><path d="M4 24c3.5-4.5 7.5-4.5 11 0s7.5 4.5 11 0 4.5-3 6-1.5" opacity=".55"/></svg>`,
    heart: `<svg viewBox="0 0 36 36" fill="none" stroke="#B5C680" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 29s-10-6.35-10-13.5A5.5 5.5 0 0 1 18 12a5.5 5.5 0 0 1 10 3.5C28 22.65 18 29 18 29z"/></svg>`,
    info: `<svg viewBox="0 0 36 36" fill="none" stroke="#B5C680" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="18" r="11"/><path d="M18 16v7M18 12.5h.01"/></svg>`
};

function pickToastIcon(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('город') || m.includes('поиск') || m.includes('ближайш')) return TOAST_ICONS.globe;
    if (m.includes('волна') || m.includes('взаимно')) return TOAST_ICONS.wave;
    if (m.includes('лайк')) return TOAST_ICONS.heart;
    return TOAST_ICONS.info;
}

const Feed = (() => {
    const st = {
        queue: [], cur: null, intent: null, sameCity: false, lastZone: null,
        loading: false, busy: false, exhausted: false, err: '', gen: 0, nameSent: false,
        status: { used: 0, max: 3, incoming: 0, unread: 0 }
    };
    const urlCache = new Map();
    let toastTimer;

    /* ---------- помощники ---------- */
    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text; // только textContent: тексты пишут пользователи
        return e;
    }
    const dbg = (e) => (DEBUG ? ' (' + e.message + ')' : '');
    function toast(msg, ms = 3000) {
        const t = $('toast');
        t.innerHTML = '';
        const ico = el('div', 'toast-icon');
        ico.innerHTML = pickToastIcon(msg);
        const sep = el('div', 'toast-sep');
        const cleanMsg = (msg || '').replace(/^[💌🌊🎉👋]+\s*|\s*[♥🌊🎉]+$/g, '');
        const txt = el('div', 'toast-text', cleanMsg);
        t.append(ico, sep, txt);
        t.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { t.hidden = true; }, ms);
    }
    async function photoUrl(path) {
        if (!urlCache.has(path)) urlCache.set(path, await Supa.signedUrl(path));
        return urlCache.get(path);
    }
    function avatar(r, cls) {
        const a = el('div', cls, (r.name || '?').slice(0, 1).toUpperCase());
        if (r.photo_path) photoUrl(r.photo_path).then((u) => {
            const im = new Image(); im.alt = ''; im.src = u; a.textContent = ''; a.appendChild(im);
        }).catch(() => {});
        return a;
    }
    function tagsOf(r) {
        const box = el('div', 'tags');
        (r.intents || []).forEach((k) => box.appendChild(el('span', 'tag' + ((r.shared || []).includes(k) ? ' shared' : ''), INTENTS[k] || k)));
        return box;
    }
    const commonKey = (r) => (r.shared || []).find((k) => ICEBREAKERS[k]);

    /* ---------- слоты ---------- */
    // Лайки без ограничений. Слот занимает только ВОЛНА — взаимный мэтч (у обоих людей).
    function renderStatus() {
        const s = st.status, box = $('slots');
        box.innerHTML = '';
        const bars = el('span', 'slots-bars');
        for (let i = 0; i < s.max; i++) bars.appendChild(el('span', 'slot-bar' + (i < s.used ? ' full' : '')));
        box.append(el('span', 'slots-label', 'Слоты'), bars, el('span', 'slots-count', `${s.used}/${s.max}`));
        box.classList.toggle('is-full', s.used >= s.max);
        $('wavesBadge').hidden = !s.incoming;
        $('wavesBadge').textContent = s.incoming;
        document.dispatchEvent(new CustomEvent('wave:status', { detail: s }));
    }
    async function refreshStatus() {
        try { st.status = await Supa.rpc('wave_status'); } catch (e) { console.error('Status error:', e); }
        renderStatus();
    }
    function explainSlots() {
        TG.tap();
        toast(`Слот занимает волна — взаимный лайк. Сейчас занято ${st.status.used} из ${st.status.max}. Лайкать можно сколько угодно, а освободить слот можно, завершив волну в разделе «Волны».`, 7000);
    }

    /* ---------- очередь анкет ---------- */
    async function loadQueue() {
        if (st.loading || st.exhausted) return;
        st.loading = true; st.err = '';
        const gen = st.gen;
        try {
            const rows = await Supa.rpc('discover', { p_intent: st.intent, p_same_city: st.sameCity, p_limit: 20, p_offset: 0 });
            if (gen !== st.gen) return;
            const have = new Set(st.queue.map((r) => r.id));
            if (st.cur) have.add(st.cur.id);
            rows.forEach((r) => { if (!have.has(r.id)) st.queue.push(r); });
            if (rows.length < 20) st.exhausted = true;
        } catch (e) {
            console.error('Feed error:', e);
            if (gen === st.gen) st.err = 'Не удалось загрузить анкеты' + dbg(e);
        } finally {
            if (gen === st.gen) st.loading = false;
        }
        if (gen === st.gen && !st.cur) next();
    }
    // Лента идёт от своего города к ближайшим, затем дальше. При переходе говорим об этом.
    function announceZone() {
        const z = st.cur ? st.cur.zone : null;
        if (z === null || z === undefined) return;
        if (z > 0 && st.lastZone === null) toast('Показываем людей из ближайших городов', 4500);
        else if (z > 0 && st.lastZone === 0) toast('В вашем городе анкеты закончились — показываем людей из ближайших городов', 4500);
        else if (st.lastZone !== null && z > st.lastZone && z > 1) toast('Расширяем поиск — показываем города подальше', 4500);
        st.lastZone = z;
    }
    function next() {
        st.cur = st.queue.shift() || null;
        announceZone();
        renderDeck();
        if (st.cur && st.queue.length < 4) loadQueue();
    }
    function resetDeck() {
        st.queue = []; st.cur = null; st.lastZone = null; st.exhausted = false; st.err = ''; st.loading = false; st.gen++;
        renderDeck(); loadQueue();
    }

    /* ---------- колода ---------- */
    function renderEmptyDeck(deck) {
        const wrap = el('div', 'deck-empty-state');
        if (st.loading) {
            wrap.appendChild(waveLoader('Ищем людей на волне…'));
            deck.appendChild(wrap);
            return;
        }
        const main = el('div', 'empty-main');

        const art = el('div', 'empty-art');
        art.innerHTML = EMPTY_WAVE_SVG;
        main.appendChild(art);

        const titleText = st.err ? 'Что-то пошло не так' : 'Пока тихо на волнах';
        main.appendChild(el('h3', 'empty-title', titleText));

        const desc = el('p', 'empty-desc');
        if (st.err) {
            desc.textContent = st.err;
        } else {
            desc.append(
                document.createTextNode('В твоём городе анкеты закончились.'),
                document.createElement('br'),
                document.createTextNode('Загляни чуть позже — новые люди появляются каждый день.')
            );
        }
        main.appendChild(desc);

        const refreshBtn = el('button', 'empty-refresh-btn', 'Обновить анкеты');
        refreshBtn.type = 'button';
        refreshBtn.addEventListener('click', () => { TG.tap(); resetDeck(); });
        main.appendChild(refreshBtn);

        const cityBtn = el('button', 'empty-city-btn');
        cityBtn.type = 'button';
        cityBtn.innerHTML = PIN_ICON_SVG;
        cityBtn.appendChild(el('span', '', 'Изменить город'));
        cityBtn.addEventListener('click', () => {
            TG.tap();
            if (typeof changeCityFromFeed === 'function') changeCityFromFeed();
            else show(4);
        });
        main.appendChild(cityBtn);

        wrap.appendChild(main);
        deck.appendChild(wrap);
    }

    function renderDeck() {
        const deck = $('deck'), r = st.cur;
        const actions = document.querySelector('#screen-feed .deck-actions');
        if (actions) actions.hidden = !r;
        deck.innerHTML = '';
        if (!r) {
            renderEmptyDeck(deck);
            return;
        }
        const card = el('article', 'deck-card');
        card.appendChild(avatar(r, 'deck-photo'));
        const info = el('div', 'deck-info');
        info.append(el('div', 'deck-name', `${r.name}, ${r.age}`), el('div', 'deck-city', (r.city || '') + (r.distance_km ? ' · ~' + r.distance_km + ' км от вас' : '')), tagsOf(r));
        if (r.bio) info.appendChild(el('p', 'deck-bio', r.bio));
        const k = commonKey(r);
        if (k) {
            const h = el('button', 'hint'); h.type = 'button';
            h.append(el('span', 'hint-top', '🎯 Общий интерес: ' + (INTENTS[k] || k)),
                     el('span', 'hint-ask', 'Спросить: «' + ICEBREAKERS[k] + '»'));
            h.addEventListener('click', () => openSheet(ICEBREAKERS[k]));
            info.appendChild(h);
        }
        card.appendChild(info);
        deck.appendChild(card);
    }
    function leave(dir) {
        return new Promise((res) => {
            const c = document.querySelector('.deck-card');
            if (c) c.classList.add('leave-' + dir);
            setTimeout(res, c ? 260 : 0);
        });
    }

    /* ---------- действия ---------- */
    async function pass() {
        if (!st.cur || st.busy) return;
        st.busy = true; TG.pick();
        Supa.rpc('pass_profile', { p_target: st.cur.id }).catch((e) => console.error('Pass error:', e));
        await leave('left'); next(); st.busy = false;
    }
    async function wave(msg) {
        if (!st.cur || st.busy) return;
        st.busy = true;
        try {
            const res = await Supa.rpc('send_wave', { p_to: st.cur.id, p_message: msg || null });
            const text = {
                sent: 'Лайк отправлен ♥',
                matched: 'Взаимно! Началась волна 🌊 Она занимает слот',
                liked_no_slot: 'Взаимно, но все ваши слоты заняты. Завершите волну в разделе «Волны» — и ответите взаимностью',
                liked_target_full: 'Взаимно! Но у человека пока нет свободного слота — волна начнётся, когда он его освободит',
                exists: ''
            }[res.result];
            if (text === undefined) toast('Не получилось отправить лайк');
            else {
                if (text) { TG.ok(); toast(text, res.result === 'sent' ? 3000 : 5500); }
                await leave('right'); next(); refreshStatus();
            }
        } catch (e) {
            console.error('Wave error:', e); TG.fail(); toast('Не удалось отправить лайк' + dbg(e));
        }
        st.busy = false;
    }

    /* ---------- окно сообщения ---------- */
    function openSheet(prefill) {
        if (!st.cur) return;
        $('sheetText').value = prefill || '';
        $('waveSheet').hidden = false;
        setTimeout(() => $('sheetText').focus(), 60);
    }
    const closeSheet = () => { $('waveSheet').hidden = true; };

    /* ---------- фильтры ---------- */
    function buildChips() {
        const box = $('feedChips'); box.innerHTML = '';
        const mk = (label, key, sel) => {
            const b = el('button', 'chip sm' + (sel ? ' selected' : ''), label);
            b.type = 'button'; b.dataset.key = key; box.appendChild(b);
        };
        const sep = () => {
            const s = el('span', 'chips-sep');
            s.setAttribute('aria-hidden', 'true');
            box.appendChild(s);
        };
        const mine = (profile.intents || []).filter((k) => INTENTS[k]);          // только интересы из вашей анкеты
        if (st.intent && !mine.includes(st.intent)) st.intent = null;            // выбранной темы больше нет в анкете — сбрасываем
        mk((profile.city || 'Мой город'), 'city', st.sameCity);                  // название вашего города
        sep();
        mk('Все', '', st.intent === null);
        if (mine.length) sep();
        mine.forEach((k) => mk(INTENTS[k], k, st.intent === k));
    }
    function onChip(e) {
        const c = e.target.closest('.chip');
        if (!c) return;
        TG.pick();
        if (c.dataset.key === 'city') st.sameCity = !st.sameCity;
        else st.intent = c.dataset.key || null;
        buildChips(); resetDeck();
    }
    function onCityChanged() {
        buildChips();
        resetDeck();
    }

    /* ---------- экран «Волны» ---------- */
    function openChat(username) {
        const url = 'https://t.me/' + encodeURIComponent(username);
        if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank');
    }
    function personCard(r) {
        const card = el('article', 'card');
        card.appendChild(avatar(r, 'card-ava'));
        const body = el('div', 'card-body');
        const title = el('div', 'card-title');
        title.append(el('b', '', `${r.name}, ${r.age}`), el('span', 'card-city', r.city || ''));
        body.appendChild(title);
        card.appendChild(body);
        return { card, body };
    }
    function incomingCard(r) {
        const { card, body } = personCard(r);
        body.appendChild(tagsOf(r));
        if (r.message) body.appendChild(el('p', 'w-msg', '«' + r.message + '»'));
        const btns = el('div', 'w-btns');
        const ok = el('button', 'w-btn ok', 'Ответить взаимностью');
        const no = el('button', 'w-btn', 'Отказать');
        ok.addEventListener('click', () => respond(r.wave_id, true));
        no.addEventListener('click', () => respond(r.wave_id, false));
        btns.append(ok, no); body.appendChild(btns);
        return card;
    }
    function ask(msg) {
        return new Promise((res) => {
            try { if (tg && tg.showConfirm) return tg.showConfirm(msg, (ok) => res(!!ok)); } catch (e) {}
            res(window.confirm(msg));
        });
    }
    function activeCard(r) {
        const { card, body } = personCard(r);
        const btns = el('div', 'w-btns');
        if (r.tg_username) {
            const b = el('button', 'w-btn ok', 'Написать в Telegram');
            b.addEventListener('click', () => { TG.tap(); openChat(r.tg_username); });
            btns.appendChild(b);
        } else body.appendChild(el('p', 'sec-note', 'У человека нет username в Telegram'));
        const end = el('button', 'w-btn danger', 'Завершить волну');
        end.addEventListener('click', () => endWave(r));
        btns.appendChild(end); body.appendChild(btns);
        return card;
    }
    function renderWaves(inc, mat) {
        const body = $('wavesBody'), s = st.status;
        body.innerHTML = '';
        body.appendChild(el('div', 'sec-title', `Активные волны · слоты ${s.used}/${s.max}`));
        body.appendChild(el('p', 'sec-note', 'Волна начинается, когда лайк взаимный, и занимает один слот у вас обоих. Завершите волну — слот освободится.'));
        mat.forEach((r) => body.appendChild(activeCard(r)));
        for (let i = mat.length; i < s.max; i++) body.appendChild(el('div', 'slot-empty', 'Свободный слот — ищите кого-нибудь в ленте'));
        body.appendChild(el('div', 'sec-title', `Вас лайкнули · ${inc.length}`));
        if (!inc.length) body.appendChild(el('p', 'sec-note', 'Пока никто не лайкнул'));
        inc.forEach((r) => body.appendChild(incomingCard(r)));
    }
    async function loadWaves() {
        try {
            const [status, inc, mat] = await Promise.all([Supa.rpc('wave_status'), Supa.rpc('my_incoming'), Supa.rpc('my_matches')]);
            st.status = status; renderStatus(); renderWaves(inc, mat);
        } catch (e) {
            console.error('Waves error:', e);
            const b = $('wavesBody'); b.innerHTML = '';
            b.appendChild(el('p', 'feed-empty', 'Не удалось загрузить' + dbg(e)));
        }
    }
    function openWaves() {
        TG.tap(); show(WAVES);
        $('wavesBody').innerHTML = ''; $('wavesBody').appendChild(waveLoader('Загружаем волны…'));
        loadWaves();
    }
    async function respond(id, accept) {
        try {
            const res = await Supa.rpc('respond_wave', { p_wave_id: id, p_accept: accept });
            if (res.result === 'matched') TG.ok();
            toast({
                matched: 'Взаимно! Началась волна 🌊',
                declined: 'Отклонено',
                no_slots: 'Все ваши слоты заняты. Завершите одну из волн, чтобы ответить взаимностью',
                target_full: 'У человека пока нет свободного слота. Попробуйте позже',
                gone: 'Этот лайк уже неактуален'
            }[res.result] || 'Готово', 4500);
        } catch (e) { console.error('Respond error:', e); toast('Не получилось ответить' + dbg(e)); }
        loadWaves();
    }
    async function endWave(r) {
        if (!(await ask(`Завершить волну с ${r.name}? Слот освободится у вас обоих, вернуть волну будет нельзя.`))) return;
        try {
            const res = await Supa.rpc('end_wave', { p_other: r.id });
            toast(res.result === 'ended' ? 'Волна завершена. Слот свободен' : 'Эта волна уже завершена');
        } catch (e) { console.error('End wave error:', e); toast('Не получилось завершить волну' + dbg(e)); }
        loadWaves();
    }

    // Один раз предлагаем разрешить боту писать — иначе push-уведомления не дойдут
    function askNotifyPermission() {
        const u = TG.user();
        if (!tg || !tg.requestWriteAccess || !tg.showConfirm || !u || u.allows_write_to_pm) return;
        try { if (localStorage.getItem('wave_wa')) return; localStorage.setItem('wave_wa', '1'); } catch (e) { return; }
        setTimeout(() => tg.showConfirm('Присылать уведомления о лайках и волнах в Telegram?', (ok) => { if (ok) tg.requestWriteAccess(() => {}); }), 1800);
    }

    /* ---------- уведомления в реальном времени ---------- */
    function onNotification(n) {
        refreshStatus();
        const name = n.data && n.data.name ? n.data.name : '';
        const msg = {
            like: '💌 Вас лайкнули',
            match: '🌊 Взаимно!' + (name ? ' Волна с ' + name : ' Началась волна'),
            ended: 'Волна' + (name ? ' с ' + name : '') + ' завершена'
        }[n.kind];
        if (msg && step !== NOTIFS) { TG.tap(); toast(msg, 4000); }   // на экране уведомлений список обновится сам
        if (step === WAVES) loadWaves();
        document.dispatchEvent(new CustomEvent('wave:notification', { detail: n }));
    }
    function startRealtime() {
        if (st.rtStarted || !dbOn()) return;
        st.rtStarted = true;
        Supa.subscribeNotifications(onNotification).then((on) => { if (!on) st.rtStarted = false; })
            .catch((e) => { st.rtStarted = false; console.error('Realtime error:', e); });
    }

    /* ---------- вход и привязка ---------- */
    function open() {
        const u = TG.user();
        if (dbOn() && u && u.username && !st.nameSent) {   // username нужен, чтобы после мэтча можно было написать
            st.nameSent = true; Supa.setUsername(u.username).catch(() => {});
        }
        const prevIntent = st.intent;
        buildChips(); renderStatus();
        if (!dbOn()) { st.err = 'Лента доступна только внутри Telegram'; renderDeck(); return; }
        if (prevIntent !== st.intent) resetDeck();
        refreshStatus(); askNotifyPermission(); startRealtime();
        if (!st.cur && !st.queue.length) { st.exhausted = false; renderDeck(); loadQueue(); } else renderDeck();
    }
    function init() {
        $('feedWaves').addEventListener('click', openWaves);
        $('slots').addEventListener('click', explainSlots);
        $('actPass').addEventListener('click', pass);
        $('actLike').addEventListener('click', () => wave(null));       // волна без сообщения
        $('actMsg').addEventListener('click', () => { const k = st.cur && commonKey(st.cur); openSheet(k ? ICEBREAKERS[k] : ''); });
        $('sheetSend').addEventListener('click', () => { const t = $('sheetText').value.trim(); closeSheet(); wave(t); });
        $('sheetCancel').addEventListener('click', closeSheet);
        $('feedChips').addEventListener('click', onChip);
        setInterval(() => { if (dbOn() && isComplete() && document.visibilityState === 'visible') refreshStatus(); }, 30000);
    }
    init();
    return { open, openWaves, toast, refreshStatus, onCityChanged };
})();

// Если лента уже показана при загрузке (вход в приложение с готовым профилем) — запускаем её
if ($('screen-feed').classList.contains('active')) Feed.open();