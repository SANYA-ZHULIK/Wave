/* =========================================
   WAVE — боковое меню и уведомления
   Зависит от landing.js (show, step, FEED/WAVES/DONE/NOTIFS, profile, editProfile, renderDone, applyBack, dbOn)
   и от feed.js (Feed)
========================================= */
const Nav = (() => {
    const MENU = [
        { go: 'feed',    label: 'Анкеты' },
        { go: 'waves',   label: 'Волны', badge: 'incoming' },
        { go: 'notifs',  label: 'Уведомления', badge: 'unread' },
        { go: 'profile', label: 'Мой профиль' },
        { go: 'edit',    label: 'Изменить анкету' },
        { sep: true },
        { go: 'about',   label: 'О нас' },
        { go: 'rules',   label: 'Правила пользования' }
    ];
    const SCREEN_OF = { feed: FEED, waves: WAVES, notifs: NOTIFS, profile: DONE, about: ABOUT, rules: RULES };
    const NOTIF = {
        like:  ()  => ['💌', 'Вас лайкнули', 'Загляните в «Волны» — возможно, это взаимно'],
        match: (d) => ['🌊', 'Взаимно! Началась волна' + (d.name ? ' с ' + d.name : ''), 'Напишите первым'],
        ended: (d) => ['👋', 'Волна' + (d.name ? ' с ' + d.name : '') + ' завершена', 'Слот свободен']
    };
    let notifAsked = false;

    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
    }
    function ago(ts) {
        const m = Math.max(1, Math.round((Date.now() - new Date(ts)) / 60000));
        if (m < 60) return m + ' мин назад';
        if (m < 1440) return Math.round(m / 60) + ' ч назад';
        return Math.round(m / 1440) + ' дн назад';
    }

    /* ---------- меню ---------- */
    function buildMenu() {
        const nav = $('drawerNav'); nav.innerHTML = '';
        MENU.forEach((m) => {
            if (m.sep) return nav.appendChild(el('div', 'drawer-sep'));
            const b = el('button', 'menu-item'); b.type = 'button'; b.dataset.go = m.go;
            b.appendChild(el('span', 'menu-label', m.label));
            if (m.badge) { const bd = el('span', 'badge static', '0'); bd.hidden = true; bd.dataset.badge = m.badge; b.appendChild(bd); }
            nav.appendChild(b);
        });
    }
    function markActive() {
        $('drawerNav').querySelectorAll('.menu-item').forEach((b) =>
            b.classList.toggle('active', SCREEN_OF[b.dataset.go] === step));
    }
    function renderDrawer() {
        $('drawerName').textContent = profile.name || 'Wave';
        $('drawerCity').textContent = [profile.city, profile.age].filter(Boolean).join(' · ');
        const a = $('drawerAva'); a.innerHTML = ''; a.textContent = (profile.name || '🌊').slice(0, 1).toUpperCase();
        if (profile.photo_url) { const im = new Image(); im.alt = ''; im.src = profile.photo_url; a.textContent = ''; a.appendChild(im); }
    }
    function updateBadges(s) {
        document.querySelectorAll('.menu-btn .dot').forEach((d) => { d.hidden = !(s.incoming || s.unread); });
        $('drawerNav').querySelectorAll('.badge[data-badge]').forEach((b) => {
            const n = s[b.dataset.badge] || 0; b.hidden = !n; b.textContent = n;
        });
    }
    function openDrawer() {
        TG.tap(); markActive(); renderDrawer();
        $('drawer').classList.add('open'); $('drawerOverlay').classList.add('open');
        $('drawer').setAttribute('aria-hidden', 'false');
        TG.back(closeDrawer);
    }
    function closeDrawer() {
        $('drawer').classList.remove('open'); $('drawerOverlay').classList.remove('open');
        $('drawer').setAttribute('aria-hidden', 'true');
        applyBack();
    }
    function go(key) {
        closeDrawer();
        if (key === 'feed') show(FEED);
        else if (key === 'waves') Feed.openWaves();
        else if (key === 'notifs') openNotifs();
        else if (key === 'profile') { renderDone(); show(DONE); }
        else if (key === 'edit') editProfile();
        else if (key === 'about') { TG.tap(); show(ABOUT); $('aboutBody').scrollTop = 0; }
        else if (key === 'rules') { TG.tap(); show(RULES); $('rulesBody').scrollTop = 0; }
    }

    /* ---------- уведомления ---------- */
    function permissionBanner() {
        const u = TG.user();
        if (notifAsked || !tg || !tg.requestWriteAccess || !u || u.allows_write_to_pm) return null;
        const box = el('div', 'notif-banner');
        box.appendChild(el('p', '', 'Включите уведомления в Telegram, чтобы не пропустить лайки и волны, когда приложение закрыто.'));
        const b = el('button', 'w-btn ok', 'Включить уведомления');
        b.addEventListener('click', () => { notifAsked = true; try { tg.requestWriteAccess(() => {}); } catch (e) {} box.remove(); });
        box.appendChild(b);
        return box;
    }
    function notifItem(n) {
        const [ico, title, text] = (NOTIF[n.kind] || (() => ['🔔', 'Уведомление', '']))(n.data || {});
        const item = el('button', 'notif' + (n.is_read ? '' : ' unread')); item.type = 'button';
        const body = el('div', 'notif-body');
        body.append(el('div', 'notif-title', title), el('div', 'notif-text', text));
        item.append(el('span', 'notif-ico', ico), body, el('span', 'notif-time', ago(n.created_at)));
        item.addEventListener('click', () => { if (n.kind === 'ended') show(FEED); else Feed.openWaves(); });
        return item;
    }
    /* ---------- история уведомлений ---------- */
    // shown — всё, что загружено за текущее посещение экрана. Новые добавляются к списку, а не заменяют его:
    // так повторный запрос не затирает уже показанное. Подсветка «новое» хранится по первому показу.
    const PAGE = 30;
    const shown = new Map();
    let notifLoading = false, notifAgain = false, hasMore = false, firstLoaded = false, lastStatus = null;

    function ask(msg) {
        return new Promise((res) => {
            try { if (tg && tg.showConfirm) return tg.showConfirm(msg, (ok) => res(!!ok)); } catch (e) {}
            res(window.confirm(msg));
        });
    }
    function dayLabel(ts) {
        const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
        const diff = Math.round((day(new Date()) - day(new Date(ts))) / 86400000);
        if (diff <= 0) return 'Сегодня';
        if (diff === 1) return 'Вчера';
        return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
    function pendingLikesCard(n) {
        const card = el('button', 'notif unread'); card.type = 'button';
        const body = el('div', 'notif-body');
        body.append(el('div', 'notif-title', 'Вас лайкнули: ' + n), el('div', 'notif-text', 'Посмотрите и ответьте в разделе «Волны»'));
        card.append(el('span', 'notif-ico', '💌'), body);
        card.addEventListener('click', () => Feed.openWaves());
        return card;
    }
    function renderNotifs(st) {
        lastStatus = st || lastStatus;
        const body = $('notifsBody');
        body.innerHTML = '';
        const banner = permissionBanner(); if (banner) body.appendChild(banner);
        // лайки, ждущие ответа, остаются в «Волнах» — напоминаем о них здесь, чтобы точка в меню была понятна
        const waiting = lastStatus && lastStatus.incoming > 0;
        if (waiting) body.appendChild(pendingLikesCard(lastStatus.incoming));
        const rows = [...shown.values()].sort((a, b) => b.id - a.id);
        let label = '';
        rows.forEach((n) => {
            const l = dayLabel(n.created_at);
            if (l !== label) { label = l; body.appendChild(el('div', 'sec-title', l)); }
            body.appendChild(notifItem(n));
        });
        if (!rows.length && !waiting) body.appendChild(el('p', 'feed-empty', 'Пока уведомлений нет. Лайки и волны появятся здесь, как только случатся.'));
        if (hasMore) {
            const more = el('button', 'w-btn notif-more', 'Показать ещё'); more.type = 'button';
            more.addEventListener('click', () => { TG.tap(); loadNotifs(true); });
            body.appendChild(more);
        }
        if (rows.length) {
            const clr = el('button', 'w-btn danger notif-more', 'Очистить историю'); clr.type = 'button';
            clr.addEventListener('click', clearHistory);
            body.appendChild(clr);
        }
    }

    // Загрузка идёт по очереди: если во время загрузки пришло ещё одно уведомление, делается повторный проход.
    // older = true — подгрузить более старые. Показанные новые уведомления помечаются прочитанными (остаются в истории).
    async function loadNotifs(older = false) {
        const body = $('notifsBody');
        const waitMin = !firstLoaded ? new Promise((r) => setTimeout(r, 420)) : Promise.resolve();
        if (!dbOn()) {
            await waitMin;
            body.innerHTML = ''; body.appendChild(el('p', 'feed-empty', 'Уведомления доступны только внутри Telegram'));
            return;
        }
        if (notifLoading) { notifAgain = true; return; }
        notifLoading = true;
        try {
            let useOlder = older;
            do {
                notifAgain = false;
                const args = useOlder ? { p_limit: PAGE, p_before: Math.min(...shown.keys()) } : { p_limit: PAGE };
                const [rows, st] = await Promise.all([Supa.rpc('my_notifications', args), Supa.rpc('wave_status'), waitMin]);
                rows.forEach((n) => { if (!shown.has(n.id)) shown.set(n.id, n); });
                if (useOlder || !firstLoaded) hasMore = rows.length === PAGE;
                firstLoaded = true;
                renderNotifs(st);
                const fresh = rows.filter((n) => !n.is_read).map((n) => n.id);
                if (fresh.length) await Supa.rpc('mark_notifications_read', { p_ids: fresh });
                Feed.refreshStatus();
                useOlder = false;
            } while (notifAgain);
        } catch (e) {
            await waitMin;
            console.error('Notifications error:', e);
            body.innerHTML = '';
            body.appendChild(el('p', 'feed-empty', 'Не удалось загрузить уведомления' + (DEBUG ? ' (' + e.message + ')' : '')));
        } finally { notifLoading = false; }
    }
    async function clearHistory() {
        if (!(await ask('Удалить всю историю уведомлений? Это действие нельзя отменить.'))) return;
        try {
            await Supa.rpc('clear_notifications');
            shown.clear(); hasMore = false;
            renderNotifs(lastStatus); Feed.refreshStatus();
            Feed.toast('История очищена');
        } catch (e) { console.error('Clear error:', e); Feed.toast('Не удалось очистить историю'); }
    }
    function openNotifs() {
        TG.tap(); show(NOTIFS);
        shown.clear(); hasMore = false; firstLoaded = false;
        const body = $('notifsBody');
        body.innerHTML = ''; body.appendChild(waveLoader('Загружаем уведомления…'));
        return loadNotifs();
    }

    function init() {
        buildMenu(); renderDrawer();
        document.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', openDrawer));
        document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
        $('drawerOverlay').addEventListener('click', closeDrawer);
        $('drawerNav').addEventListener('click', (e) => { const b = e.target.closest('.menu-item'); if (b) go(b.dataset.go); });
        document.addEventListener('wave:status', (e) => updateBadges(e.detail));
        // пришло новое уведомление, пока открыт экран уведомлений — список обновляется сам
        document.addEventListener('wave:notification', () => { if (step === NOTIFS) loadNotifs(); });
    }
    init();
    return { renderDrawer, openNotifs, go };
})();