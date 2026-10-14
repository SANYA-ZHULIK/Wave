/* =========================================
   WAVE — колода анкет, волны, слоты, мэтчи
   Зависит от landing.js (INTENTS, show, FEED, WAVES, DONE, DEBUG, dbOn) и supabase.js
========================================= */
const ICEBREAKERS = {
    sport: 'Каким спортом занимаешься?',
    gaming: 'Во что любишь играть?',
    travel: 'Какое место запомнилось больше всего?',
    events: 'На какие мероприятия ходишь?',
    hobby: 'Чем увлекаешься в свободное время?',
    walks: 'Где в городе любимое место для прогулок?',
    chat: 'О чём тебе интересно поговорить?',
    friendship: 'Что для тебя важно в друзьях?',
    relationship: 'Какие отношения ты ищешь?'
};

const Feed = (() => {
    const st = {
        queue: [], cur: null, intent: null, sameCity: true,
        loading: false, busy: false, exhausted: false, err: '', gen: 0, nameSent: false,
        status: { used: 0, max: 3, incoming: 0, matches: 0, pending: [] }
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
    function toast(msg) {
        const t = $('toast'); t.textContent = msg; t.hidden = false;
        clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3000);
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

    /* ---------- слоты и счётчики ---------- */
    function renderStatus() {
        const s = st.status, box = $('slots');
        box.innerHTML = '';
        for (let i = 0; i < s.max; i++) box.appendChild(el('span', 'slot' + (i < s.used ? ' full' : '')));
        box.title = `Слоты волн: ${s.used}/${s.max}`;
        $('wavesBadge').hidden = !s.incoming;
        $('wavesBadge').textContent = s.incoming;
        $('actLike').classList.toggle('locked', s.used >= s.max);
    }
    async function refreshStatus() {
        try { st.status = await Supa.rpc('wave_status'); } catch (e) { console.error('Status error:', e); }
        renderStatus();
    }
    function showFull() {
        TG.fail();
        toast(`Все ${st.status.max} слота заняты. Слот освободится, когда кто-то ответит или через 48 часов`);
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
    function next() {
        st.cur = st.queue.shift() || null;
        renderDeck();
        if (st.cur && st.queue.length < 4) loadQueue();
    }
    function resetDeck() {
        st.queue = []; st.cur = null; st.exhausted = false; st.err = ''; st.loading = false; st.gen++;
        renderDeck(); loadQueue();
    }

    /* ---------- колода ---------- */
    function renderDeck() {
        const deck = $('deck'), r = st.cur;
        deck.innerHTML = '';
        if (!r) {
            deck.appendChild(el('div', 'deck-empty',
                st.loading ? 'Загружаем…' : (st.err || 'Анкеты закончились. Загляните позже или смените фильтры')));
            return;
        }
        const card = el('article', 'deck-card');
        card.appendChild(avatar(r, 'deck-photo'));
        const info = el('div', 'deck-info');
        info.append(el('div', 'deck-name', `${r.name}, ${r.age}`), el('div', 'deck-city', r.city || ''), tagsOf(r));
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
        if (st.status.used >= st.status.max) {
            await refreshStatus();                       // вдруг слот уже освободился
            if (st.status.used >= st.status.max) return showFull();
        }
        st.busy = true;
        try {
            const res = await Supa.rpc('send_wave', { p_to: st.cur.id, p_message: msg || null });
            if (res.result === 'no_slots') { await refreshStatus(); showFull(); }
            else if (['sent', 'matched', 'exists'].includes(res.result)) {
                if (res.result === 'sent') { TG.ok(); toast('Волна отправлена 🌊'); }
                if (res.result === 'matched') { TG.ok(); toast('Взаимно! Это мэтч 🎉 Он в разделе «Волны»'); }
                await leave('right'); next(); refreshStatus();
            } else toast('Не получилось отправить волну');
        } catch (e) {
            console.error('Wave error:', e); TG.fail(); toast('Не удалось отправить волну' + dbg(e));
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
        mk('📍 Мой город', 'city', st.sameCity);
        mk('Все', '', st.intent === null);
        Object.entries(INTENTS).forEach(([k, v]) => mk(v, k, st.intent === k));
    }
    function onChip(e) {
        const c = e.target.closest('.chip');
        if (!c) return;
        TG.pick();
        if (c.dataset.key === 'city') st.sameCity = !st.sameCity;
        else st.intent = c.dataset.key || null;
        buildChips(); resetDeck();
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
    function matchCard(r) {
        const { card, body } = personCard(r);
        const btns = el('div', 'w-btns');
        if (r.tg_username) {
            const b = el('button', 'w-btn ok', 'Написать в Telegram');
            b.addEventListener('click', () => { TG.tap(); openChat(r.tg_username); });
            btns.appendChild(b);
        } else body.appendChild(el('p', 'sec-note', 'У человека нет username в Telegram'));
        body.appendChild(btns);
        return card;
    }
    function renderWaves(inc, mat) {
        const body = $('wavesBody'), s = st.status;
        body.innerHTML = '';
        body.appendChild(el('div', 'sec-title', `Мои волны · слоты ${s.used}/${s.max}`));
        if (!s.pending.length) body.appendChild(el('p', 'sec-note', 'Все слоты свободны — отправляйте волны в ленте'));
        s.pending.forEach((p) => {
            const h = Math.max(1, Math.ceil((new Date(p.expires_at) - Date.now()) / 3600000));
            body.appendChild(el('div', 'slot-row', `${p.name} — ждём ответа, ещё ${h} ч`));
        });
        body.appendChild(el('div', 'sec-title', `Вам помахали · ${inc.length}`));
        if (!inc.length) body.appendChild(el('p', 'sec-note', 'Пока никто не помахал'));
        inc.forEach((r) => body.appendChild(incomingCard(r)));
        body.appendChild(el('div', 'sec-title', `Мэтчи · ${mat.length}`));
        if (!mat.length) body.appendChild(el('p', 'sec-note', 'Мэтч появляется, когда на волну отвечают взаимностью'));
        mat.forEach((r) => body.appendChild(matchCard(r)));
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
        $('wavesBody').innerHTML = ''; $('wavesBody').appendChild(el('p', 'feed-empty', 'Загружаем…'));
        loadWaves();
    }
    async function respond(id, accept) {
        try {
            const res = await Supa.rpc('respond_wave', { p_wave_id: id, p_accept: accept });
            if (res.result === 'matched') { TG.ok(); toast('Мэтч! 🎉 Теперь можно написать'); }
            else if (res.result === 'declined') toast('Отклонено');
            else toast('Эта волна уже неактуальна');
        } catch (e) { console.error('Respond error:', e); toast('Не получилось ответить' + dbg(e)); }
        loadWaves();
    }

    /* ---------- вход и привязка ---------- */
    function open() {
        const u = TG.user();
        if (dbOn() && u && u.username && !st.nameSent) {   // username нужен, чтобы после мэтча можно было написать
            st.nameSent = true; Supa.setUsername(u.username).catch(() => {});
        }
        buildChips(); renderStatus();
        if (!dbOn()) { st.err = 'Лента доступна только внутри Telegram'; renderDeck(); return; }
        refreshStatus();
        if (!st.cur && !st.queue.length) { st.exhausted = false; renderDeck(); loadQueue(); } else renderDeck();
    }
    function init() {
        $('feedMe').addEventListener('click', () => { TG.tap(); show(DONE); });
        $('feedWaves').addEventListener('click', openWaves);
        $('wavesBack').addEventListener('click', () => { TG.tap(); show(FEED); refreshStatus(); });
        $('actPass').addEventListener('click', pass);
        $('actLike').addEventListener('click', () => wave(null));       // волна без сообщения
        $('actMsg').addEventListener('click', () => { const k = st.cur && commonKey(st.cur); openSheet(k ? ICEBREAKERS[k] : ''); });
        $('sheetSend').addEventListener('click', () => { const t = $('sheetText').value.trim(); closeSheet(); wave(t); });
        $('sheetCancel').addEventListener('click', closeSheet);
        $('feedChips').addEventListener('click', onChip);
    }
    init();
    return { open };
})();