/* =========================================
   WAVE — боковое меню и уведомления
   Зависит от landing.js (show, step, FEED/WAVES/DONE/NOTIFS, profile, editProfile, renderDone, applyBack, dbOn)
   и от feed.js (Feed)
========================================= */
const Nav = (() => {
    const MENU = [
        { go: 'feed',    icon: '🔥', label: 'Анкеты' },
        { go: 'waves',   icon: '🌊', label: 'Волны', badge: 'incoming' },
        { go: 'notifs',  icon: '🔔', label: 'Уведомления', badge: 'unread' },
        { go: 'profile', icon: '👤', label: 'Мой профиль' },
        { go: 'edit',    icon: '✏️', label: 'Изменить анкету' },
        { sep: true },
        { go: 'about',   icon: 'ℹ️', label: 'О нас' },
        { go: 'rules',   icon: '📜', label: 'Правила пользования' }
    ];
    const SCREEN_OF = { feed: FEED, waves: WAVES, notifs: NOTIFS, profile: DONE };
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
            b.append(el('span', 'menu-ico', m.icon), el('span', 'menu-label', m.label));
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
        else Feed.toast(key === 'about' ? 'Раздел «О нас» скоро появится' : 'Раздел «Правила пользования» скоро появится');
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
    async function openNotifs() {
        TG.tap(); show(NOTIFS);
        const body = $('notifsBody');
        body.innerHTML = ''; body.appendChild(el('p', 'feed-empty', 'Загружаем…'));
        if (!dbOn()) { body.innerHTML = ''; body.appendChild(el('p', 'feed-empty', 'Уведомления доступны только внутри Telegram')); return; }
        try {
            const rows = await Supa.rpc('my_notifications', { p_limit: 40 });
            body.innerHTML = '';
            const banner = permissionBanner(); if (banner) body.appendChild(banner);
            if (!rows.length) body.appendChild(el('p', 'feed-empty', 'Пока уведомлений нет. Лайки и волны появятся здесь.'));
            rows.forEach((n) => body.appendChild(notifItem(n)));
            if (rows.some((n) => !n.is_read)) { await Supa.rpc('mark_notifications_read'); Feed.refreshStatus(); }
        } catch (e) {
            console.error('Notifications error:', e);
            body.innerHTML = '';
            body.appendChild(el('p', 'feed-empty', 'Не удалось загрузить уведомления' + (DEBUG ? ' (' + e.message + ')' : '')));
        }
    }

    function init() {
        buildMenu(); renderDrawer();
        document.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', openDrawer));
        $('drawerOverlay').addEventListener('click', closeDrawer);
        $('drawerNav').addEventListener('click', (e) => { const b = e.target.closest('.menu-item'); if (b) go(b.dataset.go); });
        document.addEventListener('wave:status', (e) => updateBadges(e.detail));
    }
    init();
    return { renderDrawer, openNotifs };
})();