/* =========================================
   WAVE — боковое меню и уведомления
   Зависит от landing.js (show, step, FEED/WAVES/DONE/NOTIFS, profile, editProfile, renderDone, applyBack, dbOn)
   и от feed.js (Feed)
========================================= */
const Nav = (() => {
    const MENU = [
        { go: 'feed',     label: 'Анкеты' },
        { go: 'waves',    label: 'Волны', badge: 'incoming' },
        { go: 'notifs',   label: 'Уведомления', badge: 'unread' },
        { go: 'profile',  label: 'Мой профиль' },
        { go: 'edit',     label: 'Изменить анкету' },
        { go: 'settings', label: 'Настройки' },
        { sep: true },
        { go: 'about',    label: 'О нас' },
        { go: 'rules',    label: 'Правила пользования' }
    ];
    const SCREEN_OF = { feed: FEED, waves: WAVES, notifs: NOTIFS, profile: DONE, about: ABOUT, rules: RULES, settings: SETTINGS };
    const NOTIF_ICONS = {
        like: `<svg viewBox="0 0 24 24" fill="none" stroke="#B5C680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7-4.6-7-9.8A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.1c0 5.2-7 9.8-7 9.8z"/></svg>`,
        match: `<svg viewBox="0 0 24 24" fill="none" stroke="#B5C680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 11.5c2.5-3.2 5.2-3.2 7.7 0s5.2 3.2 7.7 0 3.1-2.1 4.1-1"/><path d="M2.5 16.5c2.5-3.2 5.2-3.2 7.7 0s5.2 3.2 7.7 0 3.1-2.1 4.1-1" opacity=".6"/></svg>`,
        ended: `<svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>`,
        bell: `<svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
    };
    const NOTIF = {
        like:  ()  => ['like',  'Вас лайкнули', 'Загляните в «Волны» — возможно, это взаимно'],
        match: (d) => ['match', 'Взаимно! Началась волна' + (d.name ? ' с ' + d.name : ''), 'Откройте «Волны» и напишите первым'],
        ended: (d) => ['ended', 'Волна' + (d.name ? ' с ' + d.name : '') + ' завершена', 'Слот снова свободен для новых знакомств']
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
        else if (key === 'settings') { TG.tap(); renderSettings(); show(SETTINGS); $('settingsBody').scrollTop = 0; }
        else if (key === 'about') { TG.tap(); show(ABOUT); $('aboutBody').scrollTop = 0; }
        else if (key === 'rules') { TG.tap(); show(RULES); $('rulesBody').scrollTop = 0; }
    }

    /* ---------- настройки: 1. параметры поиска ---------- */
    const AGE_LABELS = {
        peer:    'Ровесники (±5 лет)',
        '18-24': '18 – 24 года',
        '25-34': '25 – 34 года',
        any:     'Любой (18+)'
    };

    function renderSettings() {
        const cityEl = $('setCityVal');
        if (cityEl) cityEl.textContent = profile.city || 'Не выбран';

        const lookingGroup = $('setLookingChips');
        if (lookingGroup) {
            lookingGroup.querySelectorAll('.chip').forEach((c) => {
                c.classList.toggle('selected', c.dataset.value === (profile.looking || 'any'));
            });
        }

        const prefs = typeof Feed !== 'undefined' && Feed.getSearchPrefs ? Feed.getSearchPrefs() : { ageMode: 'peer', sameCity: false };

        const geoGroup = $('setGeoChips');
        if (geoGroup) {
            geoGroup.querySelectorAll('.chip').forEach((c) => {
                const isSame = c.dataset.value === 'city';
                c.classList.toggle('selected', isSame === !!prefs.sameCity);
            });
        }

        const ageGroup = $('setAgeChips');
        if (ageGroup) {
            ageGroup.querySelectorAll('.chip').forEach((c) => {
                c.classList.toggle('selected', c.dataset.value === (prefs.ageMode || 'peer'));
            });
        }

        const visGroup = $('setVisChips');
        if (visGroup) {
            visGroup.querySelectorAll('.chip').forEach((c) => {
                const isHid = c.dataset.value === 'hidden';
                c.classList.toggle('selected', isHid === !!prefs.isHidden);
            });
        }
        const visNote = $('setVisNote');
        if (visNote) {
            visNote.textContent = prefs.isHidden
                ? 'Ваша анкета сейчас на паузе и не показывается новым людям в ленте. Активные волны и чаты продолжают работать.'
                : 'Ваша анкета видна другим пользователям в ленте подбора.';
        }

        const hapticGroup = $('setHapticChips');
        if (hapticGroup) {
            const hOn = typeof TG.hapticsOn === 'function' ? TG.hapticsOn() : true;
            hapticGroup.querySelectorAll('.chip').forEach((c) => {
                c.classList.toggle('selected', (c.dataset.value === 'on') === hOn);
            });
        }

        const pushStatus = $('setTgPushStatus');
        const pushDot = $('setTgPushDot');
        const pushBtn = $('setTgPushBtn');
        const pushSub = $('setTgPushSub');
        if (pushStatus && pushDot && pushBtn) {
            const u = TG.user();
            const canAsk = !!(tg && tg.requestWriteAccess && u);
            const allowed = !!(tgWriteGranted || (u && u.allows_write_to_pm));
            if (!u) {
                pushStatus.textContent = 'Доступно в Telegram';
                pushDot.className = 'set-status-dot neutral';
                pushBtn.hidden = true;
                if (pushSub) pushSub.textContent = 'Откройте мини-приложение внутри Telegram для получения push-уведомлений от бота';
            } else if (allowed) {
                pushStatus.textContent = 'Разрешены в личные сообщения';
                pushDot.className = 'set-status-dot on';
                pushBtn.hidden = true;
                if (pushSub) pushSub.textContent = 'Бот мгновенно пришлёт сообщение о новом лайке или взаимной волне';
            } else {
                pushStatus.textContent = 'Ожидают разрешения';
                pushDot.className = 'set-status-dot warn';
                pushBtn.hidden = !canAsk;
                if (pushSub) pushSub.textContent = 'Разрешите боту писать вам, чтобы не пропускать новые симпатии';
            }
        }
    }

    let tgWriteGranted = false;

    function onSetHaptic(e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        const on = chip.dataset.value === 'on';
        if (typeof TG.setHaptics === 'function') TG.setHaptics(on);
        if (on) TG.pick();
        renderSettings();
        if (typeof Feed !== 'undefined') {
            Feed.toast(on ? 'Тактильный отклик включён' : 'Тактильный отклик выключен');
        }
    }

    function onRequestTgPush() {
        TG.tap();
        if (!tg || !tg.requestWriteAccess) return;
        try {
            tg.requestWriteAccess((ok) => {
                if (ok) {
                    tgWriteGranted = true;
                    notifAsked = true;
                    renderSettings();
                    if (typeof Feed !== 'undefined') Feed.toast('Push-уведомления в Telegram включены');
                } else if (typeof Feed !== 'undefined') {
                    Feed.toast('Разрешение не выдано');
                }
            });
        } catch (e) {}
    }

    async function onSetLooking(e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        const val = chip.dataset.value;
        if (!val || val === profile.looking) return;
        TG.pick();
        profile.looking = val;
        saveProfile();
        // Синхронизируем чипы в форме анкеты
        const formGroup = $('lookingChips');
        if (formGroup) {
            formGroup.querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.value === val));
        }
        renderSettings();
        if (typeof Feed !== 'undefined') Feed.onCityChanged();
        if (dbOn() && isComplete()) {
            try {
                await Supa.saveProfile(profile);
                if (typeof Feed !== 'undefined') Feed.toast('Параметры поиска сохранены');
            } catch (err) {
                console.error('Save looking error:', err);
                if (typeof Feed !== 'undefined') Feed.toast('Сохранено локально (нет сети)');
            }
        } else if (typeof Feed !== 'undefined') {
            Feed.toast('Параметры поиска обновлены');
        }
    }

    function onSetGeo(e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        TG.pick();
        const sameCity = chip.dataset.value === 'city';
        if (typeof Feed !== 'undefined' && Feed.setSearchPrefs) {
            Feed.setSearchPrefs({ sameCity });
            Feed.toast(sameCity ? 'Показываем анкеты только из вашего города' : 'Показываем все города (сначала ближайшие)');
        }
        renderSettings();
    }

    function onSetAge(e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        TG.pick();
        const ageMode = chip.dataset.value || 'peer';
        if (typeof Feed !== 'undefined' && Feed.setSearchPrefs) {
            Feed.setSearchPrefs({ ageMode });
            Feed.toast('Возраст в поиске: ' + (AGE_LABELS[ageMode] || ageMode));
        }
        renderSettings();
    }

    async function onSetVis(e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        TG.pick();
        const isHidden = chip.dataset.value === 'hidden';
        if (typeof Feed !== 'undefined' && Feed.setSearchPrefs) {
            Feed.setSearchPrefs({ isHidden });
        }
        renderSettings();
        if (dbOn() && typeof Supa.setHidden === 'function') {
            await Supa.setHidden(isHidden);
        }
        if (typeof Feed !== 'undefined') {
            Feed.toast(isHidden ? 'Анкета поставлена на паузу' : 'Анкета снова видна в поиске');
        }
    }

    async function onResetPasses() {
        TG.tap();
        const btn = $('setResetPassesBtn');
        if (btn) btn.disabled = true;
        try {
            if (dbOn() && typeof Supa.resetPasses === 'function') {
                await Supa.resetPasses();
            }
            if (typeof Feed !== 'undefined') {
                Feed.onCityChanged();
                Feed.toast('Пропущенные анкеты снова доступны в ленте');
            }
        } catch (e) {
            console.error('Reset passes error:', e);
            if (typeof Feed !== 'undefined') Feed.toast('Не удалось сбросить пропущенные анкеты');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    /* ---------- уведомления ---------- */
    function permissionBanner() {
        const u = TG.user();
        if (notifAsked || !tg || !tg.requestWriteAccess || !u || u.allows_write_to_pm) return null;
        const box = el('div', 'notif-banner');
        const head = el('div', 'notif-banner-head');
        const ico = el('span', 'notif-ico kind-bell');
        ico.innerHTML = NOTIF_ICONS.bell;
        const txtWrap = el('div', 'notif-banner-body');
        txtWrap.append(
            el('div', 'notif-title', 'Push-уведомления в Telegram'),
            el('p', 'notif-banner-sub', 'Разрешите боту писать вам, чтобы сразу узнавать о новых лайках и взаимных волнах.')
        );
        head.append(ico, txtWrap);
        const b = el('button', 'w-btn ok', 'Включить уведомления');
        b.type = 'button';
        b.addEventListener('click', () => { notifAsked = true; try { tg.requestWriteAccess(() => {}); } catch (e) {} box.remove(); });
        box.append(head, b);
        return box;
    }
    function notifItem(n) {
        const [kindKey, title, text] = (NOTIF[n.kind] || (() => ['bell', 'Уведомление', '']))(n.data || {});
        const item = el('button', 'notif' + (n.is_read ? '' : ' unread')); item.type = 'button';
        const ico = el('span', 'notif-ico kind-' + kindKey);
        ico.innerHTML = NOTIF_ICONS[kindKey] || NOTIF_ICONS.bell;
        const body = el('div', 'notif-body');
        const top = el('div', 'notif-head');
        top.append(el('div', 'notif-title', title), el('span', 'notif-time', ago(n.created_at)));
        body.append(top, el('div', 'notif-text', text));
        const arr = el('span', 'notif-chevron', '›');
        item.append(ico, body, arr);
        item.addEventListener('click', () => { TG.tap(); if (n.kind === 'ended') show(FEED); else Feed.openWaves(); });
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
        const card = el('button', 'notif unread notif-pending'); card.type = 'button';
        const ico = el('span', 'notif-ico kind-like');
        ico.innerHTML = NOTIF_ICONS.like;
        const body = el('div', 'notif-body');
        const top = el('div', 'notif-head');
        top.append(el('div', 'notif-title', 'Вас лайкнули · ' + n), el('span', 'notif-pill-new', 'Ждут ответа'));
        body.append(top, el('div', 'notif-text', 'Откройте раздел «Волны», чтобы посмотреть анкеты и ответить взаимностью'));
        const arr = el('span', 'notif-chevron', '›');
        card.append(ico, body, arr);
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
        if (waiting) {
            body.appendChild(el('div', 'sec-title', 'Новые симпатии'));
            body.appendChild(pendingLikesCard(lastStatus.incoming));
        }
        const rows = [...shown.values()].sort((a, b) => b.id - a.id);
        if (!rows.length) {
            body.appendChild(el('div', 'sec-title', 'История событий'));
            body.appendChild(el('p', 'sec-note', 'Здесь сохраняются взаимные волны, новые лайки и освободившиеся слоты.'));
            const emptyBox = el('div', 'slot-empty notif-empty-slot');
            emptyBox.textContent = 'Пока новых уведомлений нет — загляните в ленту анкет';
            body.appendChild(emptyBox);
            return;
        }
        let label = '';
        rows.forEach((n) => {
            const l = dayLabel(n.created_at);
            if (l !== label) { label = l; body.appendChild(el('div', 'sec-title', l)); }
            body.appendChild(notifItem(n));
        });
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
        TG.tap();
        if (!(await ask('Удалить всю историю уведомлений? Это действие нельзя отменить.'))) return;
        try {
            if (dbOn()) await Supa.rpc('clear_notifications');
            shown.clear(); hasMore = false;
            if (step === NOTIFS) renderNotifs(lastStatus);
            if (typeof Feed !== 'undefined') {
                Feed.refreshStatus();
                Feed.toast('История уведомлений очищена');
            }
        } catch (e) {
            console.error('Clear error:', e);
            if (typeof Feed !== 'undefined') Feed.toast('Не удалось очистить историю');
        }
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
        if ($('setLookingChips')) $('setLookingChips').addEventListener('click', onSetLooking);
        if ($('setGeoChips')) $('setGeoChips').addEventListener('click', onSetGeo);
        if ($('setAgeChips')) $('setAgeChips').addEventListener('click', onSetAge);
        if ($('setVisChips')) $('setVisChips').addEventListener('click', onSetVis);
        if ($('setResetPassesBtn')) $('setResetPassesBtn').addEventListener('click', onResetPasses);
        if ($('setHapticChips')) $('setHapticChips').addEventListener('click', onSetHaptic);
        if ($('setTgPushBtn')) $('setTgPushBtn').addEventListener('click', onRequestTgPush);
        if ($('setClearNotifsBtn')) $('setClearNotifsBtn').addEventListener('click', clearHistory);
        if ($('setChangeCityBtn')) $('setChangeCityBtn').addEventListener('click', () => {
            TG.tap();
            if (typeof changeCityFromFeed === 'function') changeCityFromFeed(SETTINGS);
            else show(4);
        });
        document.addEventListener('wave:status', (e) => updateBadges(e.detail));
        // пришло новое уведомление, пока открыт экран уведомлений — список обновляется сам
        document.addEventListener('wave:notification', () => { if (step === NOTIFS) loadNotifs(); });
    }
    init();
    return { renderDrawer, openNotifs, go, renderSettings };
})();