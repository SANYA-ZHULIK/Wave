/* =========================================
   WAVE — боковое меню и уведомления
   Зависит от landing.js (show, step, FEED/WAVES/DONE/NOTIFS, profile, editProfile, renderDone, applyBack, dbOn)
   и от feed.js (Feed)
========================================= */
const Nav = (() => {
    const SUPPORT_TG_URL = 'https://t.me/zhul1nsky'; // Замените на ваш @username поддержки или бота
    const MENU = [
        { go: 'feed',     label: 'Анкеты' },
        { go: 'waves',    label: 'Волны' },
        { go: 'notifs',   label: 'Уведомления', badge: 'notifs' },
        { go: 'profile',  label: 'Мой профиль' },
        { go: 'edit',     label: 'Изменить анкету' },
        { go: 'settings', label: 'Настройки' },
        { sep: true },
        { go: 'about',    label: 'О нас' },
        { go: 'rules',    label: 'Правила пользования' }
    ];
    const SCREEN_OF = { feed: FEED, waves: WAVES, notifs: NOTIFS, profile: DONE, about: ABOUT, rules: RULES, settings: SETTINGS };
    const NOTIF_ICONS = {
        like: `<svg viewBox="0 0 24 24" fill="none" stroke="#B5C680" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7-4.6-7-9.8A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.1c0 5.2-7 9.8-7 9.8z"/></svg>`,
        match: `<svg viewBox="0 0 24 24" fill="none" stroke="#B5C680" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 11.5c2.5-3.2 5.2-3.2 7.7 0s5.2 3.2 7.7 0 3.1-2.1 4.1-1"/><path d="M2.5 16.5c2.5-3.2 5.2-3.2 7.7 0s5.2 3.2 7.7 0 3.1-2.1 4.1-1" opacity=".6"/></svg>`,
        ended: `<svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>`,
        bell: `<svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
    };
    const EMPTY_NOTIF_BELL_SVG = `
    <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <filter id="nbGlow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="5.5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <filter id="nbSoft" x="-45%" y="-45%" width="190%" height="190%">
                <feGaussianBlur stdDeviation="20" />
            </filter>
            <linearGradient id="nbWaveGrad" x1="16" y1="100" x2="284" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#7C3AED" stop-opacity="0" />
                <stop offset="22%" stop-color="#A855F7" stop-opacity="0.88" />
                <stop offset="52%" stop-color="#C084FC" stop-opacity="0.72" />
                <stop offset="78%" stop-color="#D9F99D" stop-opacity="0.88" />
                <stop offset="100%" stop-color="#B5C680" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="nbWaveDim" x1="20" y1="108" x2="280" y2="102" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#7C3AED" stop-opacity="0" />
                <stop offset="30%" stop-color="#9333EA" stop-opacity="0.34" />
                <stop offset="70%" stop-color="#B5C680" stop-opacity="0.34" />
                <stop offset="100%" stop-color="#B5C680" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="nbBellStroke" x1="92" y1="54" x2="196" y2="152" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#A855F7" />
                <stop offset="38%" stop-color="#D8B4FE" />
                <stop offset="72%" stop-color="#D9F99D" />
                <stop offset="100%" stop-color="#B5C680" />
            </linearGradient>
            <linearGradient id="nbBellFill" x1="100" y1="50" x2="195" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.16" />
                <stop offset="100%" stop-color="#B5C680" stop-opacity="0.1" />
            </linearGradient>
        </defs>

        <!-- Мягкое неоновое свечение за колокольчиком -->
        <ellipse cx="122" cy="100" rx="58" ry="44" fill="#7C3AED" fill-opacity="0.28" filter="url(#nbSoft)" />
        <ellipse cx="176" cy="108" rx="54" ry="40" fill="#B5C680" fill-opacity="0.22" filter="url(#nbSoft)" />

        <!-- Фоновые волны -->
        <path d="M18 112 C 48 134, 72 90, 108 108 C 146 126, 178 86, 214 114 C 244 136, 262 96, 286 106"
              stroke="url(#nbWaveDim)" stroke-width="1.6" stroke-linecap="round" />
        <path d="M16 104 C 42 128, 60 124, 82 94 C 98 72, 114 82, 128 102"
              stroke="url(#nbWaveGrad)" stroke-width="2.4" stroke-linecap="round" filter="url(#nbGlow)" />
        <path d="M174 110 C 194 138, 214 142, 232 104 C 248 72, 266 78, 286 96"
              stroke="url(#nbWaveGrad)" stroke-width="2.4" stroke-linecap="round" filter="url(#nbGlow)" />

        <!-- Наклонённый неоновый колокольчик -->
        <g transform="rotate(14 150 100)">
            <!-- Дуги звонка слева -->
            <path d="M96 68 C 91 79, 91 91, 95 102" stroke="#C084FC" stroke-width="2.2" stroke-linecap="round" opacity="0.82" filter="url(#nbGlow)" />
            <path d="M84 62 C 77 77, 77 95, 83 110" stroke="#A855F7" stroke-width="2" stroke-linecap="round" opacity="0.52" />
            <!-- Дуги звонка справа -->
            <path d="M204 68 C 209 79, 209 91, 205 102" stroke="#D9F99D" stroke-width="2.2" stroke-linecap="round" opacity="0.85" filter="url(#nbGlow)" />
            <path d="M216 62 C 223 77, 223 95, 217 110" stroke="#B5C680" stroke-width="2" stroke-linecap="round" opacity="0.52" />

            <!-- Верхнее колечко -->
            <path d="M142 50 A 8 8 0 0 1 158 50" stroke="url(#nbBellStroke)" stroke-width="2.6" stroke-linecap="round" filter="url(#nbGlow)" />
            <!-- Купол колокольчика -->
            <path d="M150 51
                     C 127 51, 112 69, 112 94
                     L 112 110
                     C 112 121, 104 128, 99 133
                     C 97 135, 98 139, 102 139
                     L 198 139
                     C 202 139, 203 135, 201 133
                     C 196 128, 188 121, 188 110
                     L 188 94
                     C 188 69, 173 51, 150 51 Z"
                  fill="url(#nbBellFill)" stroke="url(#nbBellStroke)" stroke-width="3" stroke-linejoin="round" filter="url(#nbGlow)" />
            <!-- Внутренний блик -->
            <path d="M126 84 C 127 72, 134 64, 143 61" stroke="#F5D0FE" stroke-width="2" stroke-linecap="round" opacity="0.7" />
            <!-- Нижняя кромка -->
            <path d="M107 134 C 132 130, 168 130, 193 134" stroke="url(#nbBellStroke)" stroke-width="1.3" stroke-linecap="round" opacity="0.45" />
            <!-- Язычок -->
            <path d="M139 140 C 139 147, 144 152, 150 152 C 156 152, 161 147, 161 140"
                  stroke="url(#nbBellStroke)" stroke-width="2.8" stroke-linecap="round" filter="url(#nbGlow)" />
        </g>

        <!-- Искры и звёздочки -->
        <path d="M72 130 L74.2 135.8 L80 138 L74.2 140.2 L72 146 L69.8 140.2 L64 138 L69.8 135.8 Z" fill="#C084FC" opacity="0.9" filter="url(#nbGlow)" />
        <path d="M235 66 L236.6 70.4 L241 72 L236.6 73.6 L235 78 L233.4 73.6 L229 72 L233.4 70.4 Z" fill="#D9F99D" opacity="0.88" filter="url(#nbGlow)" />
        <circle cx="72"  cy="66"  r="2.2" fill="#C084FC" opacity="0.75" />
        <circle cx="48"  cy="98"  r="1.4" fill="#E9D5FF" opacity="0.55" />
        <circle cx="212" cy="148" r="2"   fill="#D9F99D" opacity="0.8" />
        <circle cx="256" cy="118" r="1.4" fill="#B5C680" opacity="0.5" />
    </svg>`;
    const NOTIF = {
        like:  ()  => ['like',  'Вас лайкнули', 'Посмотрите анкету сверху и ответьте взаимностью'],
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
            const n = b.dataset.badge === 'notifs'
                ? (s.incoming || 0) + (s.unread || 0)
                : (s[b.dataset.badge] || 0);
            b.hidden = !n; b.textContent = n;
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

        const geoToggle = $('setGeoToggle');
        if (geoToggle) {
            const on = !!prefs.sameCity;
            geoToggle.classList.toggle('on', on);
            geoToggle.setAttribute('aria-checked', on ? 'true' : 'false');
        }
        const geoNote = $('setGeoNote');
        if (geoNote) {
            geoNote.textContent = prefs.sameCity
                ? 'В ленте показываются анкеты только из вашего города'
                : 'Показываются все города (сначала ближайшие)';
        }

        const ageGroup = $('setAgeChips');
        if (ageGroup) {
            ageGroup.querySelectorAll('.chip').forEach((c) => {
                c.classList.toggle('selected', c.dataset.value === (prefs.ageMode || 'peer'));
            });
        }

        const visToggle = $('setVisToggle');
        if (visToggle) {
            const visible = !prefs.isHidden;
            visToggle.classList.toggle('on', visible);
            visToggle.setAttribute('aria-checked', visible ? 'true' : 'false');
        }
        const visNote = $('setVisNote');
        if (visNote) {
            visNote.textContent = prefs.isHidden
                ? 'Анкета на паузе и скрыта из поиска. Активные волны и чаты продолжают работать.'
                : 'Ваша анкета видна другим пользователям в ленте подбора.';
        }

        const bioToggle = $('setBioToggle');
        if (bioToggle) {
            const onlyBio = !!prefs.onlyWithBio;
            bioToggle.classList.toggle('on', onlyBio);
            bioToggle.setAttribute('aria-checked', onlyBio ? 'true' : 'false');
        }
        const bioNote = $('setBioNote');
        if (bioNote) {
            bioNote.textContent = prefs.onlyWithBio
                ? 'В ленте показываются только анкеты с описанием «О себе»'
                : 'Скрывать из ленты анкеты без описания';
        }

        const hapticToggle = $('setHapticToggle');
        if (hapticToggle) {
            const hOn = typeof TG.hapticsOn === 'function' ? TG.hapticsOn() : true;
            hapticToggle.classList.toggle('on', hOn);
            hapticToggle.setAttribute('aria-checked', hOn ? 'true' : 'false');
        }

        renderUsernameSetting();
        if (blacklistOpen) loadBlacklist();
    }

    let blacklistOpen = false;
    let blockedList = [];

    function renderUsernameSetting() {
        const valEl = $('setUsernameVal');
        const subEl = $('setUsernameSub');
        if (!valEl) return;
        const u = TG.user();
        const uname = (u && u.username) || profile.tg_username || '';
        if (uname) {
            valEl.textContent = uname;
            valEl.classList.remove('is-empty');
            if (subEl) subEl.textContent = 'Собеседники смогут перейти по нему в чат после взаимной волны';
        } else {
            valEl.textContent = 'Не задан в Telegram';
            valEl.classList.add('is-empty');
            if (subEl) subEl.textContent = 'Без @username собеседник не сможет написать вам после мэтча. Задайте его в настройках Telegram и нажмите «Обновить».';
        }
    }

    async function onRefreshUsername() {
        TG.tap();
        const btn = $('setRefreshUsernameBtn');
        if (btn) btn.disabled = true;
        try {
            const u = TG.user();
            const uname = (u && u.username) || '';
            if (!uname) {
                if (typeof Feed !== 'undefined') Feed.toast('Username не найден в Telegram — задайте его в настройках профиля Telegram', 4500);
                renderUsernameSetting();
                return;
            }
            profile.tg_username = uname;
            saveProfile();
            if (dbOn()) await Supa.setUsername(uname);
            renderUsernameSetting();
            if (typeof Feed !== 'undefined') Feed.toast('Username обновлён: @' + uname);
        } catch (e) {
            console.error('Refresh username error:', e);
            if (typeof Feed !== 'undefined') Feed.toast('Не удалось обновить username');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    function onSetBio() {
        TG.pick();
        const prefs = typeof Feed !== 'undefined' && Feed.getSearchPrefs ? Feed.getSearchPrefs() : { onlyWithBio: false };
        const onlyWithBio = !prefs.onlyWithBio;
        if (typeof Feed !== 'undefined' && Feed.setSearchPrefs) {
            Feed.setSearchPrefs({ onlyWithBio });
            Feed.toast(onlyWithBio ? 'Показываем только анкеты с разделом «О себе»' : 'Показываем все анкеты');
        }
        renderSettings();
    }

    function renderBlacklist() {
        const listEl = $('setBlacklistList');
        if (!listEl) return;
        listEl.innerHTML = '';
        if (!blockedList.length) {
            listEl.appendChild(el('div', 'set-bl-empty', 'Чёрный список пуст'));
            return;
        }
        blockedList.forEach((b) => {
            const row = el('div', 'set-bl-item');
            const info = el('div', 'set-bl-info');
            const nameText = b.name ? (b.age ? `${b.name}, ${b.age}` : b.name) : 'Пользователь';
            info.appendChild(el('div', 'set-bl-name', nameText));
            if (b.city) info.appendChild(el('div', 'set-bl-city', b.city));
            const btn = el('button', 'set-bl-unblock', 'Разблокировать');
            btn.type = 'button';
            btn.addEventListener('click', () => onUnblockUser(b));
            row.append(info, btn);
            listEl.appendChild(row);
        });
    }

    async function loadBlacklist() {
        const listEl = $('setBlacklistList');
        if (listEl) {
            listEl.innerHTML = '';
            listEl.appendChild(el('div', 'set-bl-empty', 'Загрузка списка…'));
        }
        const local = typeof Feed !== 'undefined' && Feed.getLocalBlocked ? Feed.getLocalBlocked() : [];
        if (dbOn() && typeof Supa.getBlockedUsers === 'function') {
            try {
                const rows = await Supa.getBlockedUsers();
                if (Array.isArray(rows)) {
                    const map = new Map();
                    rows.forEach((r) => map.set(String(r.id), r));
                    local.forEach((r) => { if (!map.has(String(r.id))) map.set(String(r.id), r); });
                    blockedList = [...map.values()];
                    renderBlacklist();
                    return;
                }
            } catch (e) {
                console.warn('Blacklist RPC fallback:', e);
            }
        }
        blockedList = local;
        renderBlacklist();
    }

    function onToggleBlacklist() {
        TG.tap();
        blacklistOpen = !blacklistOpen;
        const wrap = $('setBlacklistWrap');
        const btn = $('setBlacklistToggleBtn');
        if (wrap) wrap.hidden = !blacklistOpen;
        if (btn) btn.textContent = blacklistOpen ? 'Скрыть' : 'Показать';
        if (blacklistOpen) loadBlacklist();
    }

    async function onUnblockUser(b) {
        TG.tap();
        if (!(await ask(`Разблокировать ${b.name || 'пользователя'}?`))) return;
        try {
            if (dbOn() && typeof Supa.unblockUser === 'function') {
                await Supa.unblockUser(b.id).catch((e) => console.error('Unblock error:', e));
            }
            if (typeof Feed !== 'undefined' && Feed.unblockLocal) {
                Feed.unblockLocal(b.id);
                Feed.onCityChanged();
            }
            blockedList = blockedList.filter((item) => String(item.id) !== String(b.id));
            renderBlacklist();
            if (typeof Feed !== 'undefined') Feed.toast('Пользователь разблокирован');
        } catch (e) {
            console.error('Unblock error:', e);
            if (typeof Feed !== 'undefined') Feed.toast('Не удалось разблокировать пользователя');
        }
    }

    function onOpenSupport() {
        TG.tap();
        if (tg && tg.openTelegramLink) {
            tg.openTelegramLink(SUPPORT_TG_URL);
        } else {
            const a = document.createElement('a');
            a.href = SUPPORT_TG_URL;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.click();
        }
    }

    async function onDeleteAccount() {
        TG.tap();
        if (!(await ask('Вы уверены, что хотите удалить анкету? Все активные волны, лайки, уведомления и фото будут удалены навсегда.'))) return;
        if (!(await ask('Подтвердите окончательное удаление профиля Wave. Это действие нельзя отменить.'))) return;
        const btn = $('setDeleteAccountBtn');
        if (btn) btn.disabled = true;
        try {
            if (dbOn() && typeof Supa.deleteAccount === 'function') {
                await Supa.deleteAccount();
            }
            blacklistOpen = false;
            blockedList = [];
            shown.clear();
            if (typeof Feed !== 'undefined' && Feed.resetSession) Feed.resetSession();
            if (typeof resetLocalAccount === 'function') resetLocalAccount();
            TG.ok();
            if (typeof Feed !== 'undefined') Feed.toast('Ваша анкета удалена', 4000);
        } catch (e) {
            console.error('Delete account error:', e);
            TG.fail();
            if (typeof Feed !== 'undefined') Feed.toast('Не удалось удалить анкету' + (DEBUG ? ' (' + e.message + ')' : ''));
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    function onSetHaptic() {
        const cur = typeof TG.hapticsOn === 'function' ? TG.hapticsOn() : true;
        const on = !cur;
        if (typeof TG.setHaptics === 'function') TG.setHaptics(on);
        if (on) TG.pick();
        renderSettings();
        if (typeof Feed !== 'undefined') {
            Feed.toast(on ? 'Тактильный отклик включён' : 'Тактильный отклик выключен');
        }
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

    function onSetGeo() {
        TG.pick();
        const prefs = typeof Feed !== 'undefined' && Feed.getSearchPrefs ? Feed.getSearchPrefs() : { sameCity: false };
        const sameCity = !prefs.sameCity;
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

    async function onSetVis() {
        TG.pick();
        const prefs = typeof Feed !== 'undefined' && Feed.getSearchPrefs ? Feed.getSearchPrefs() : { isHidden: false };
        const isHidden = !prefs.isHidden;
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
        item.append(ico, body);
        item.addEventListener('click', () => {
            TG.tap();
            if (n.kind === 'ended') show(FEED);
            else if (n.kind === 'match') Feed.openWaves();
            else { $('notifsBody').scrollTo({ top: 0, behavior: 'smooth' }); }
        });
        return item;
    }
    /* ---------- история уведомлений ---------- */
    // shown — всё, что загружено за текущее посещение экрана. Новые добавляются к списку, а не заменяют его:
    // так повторный запрос не затирает уже показанное. Подсветка «новое» хранится по первому показу.
    const PAGE = 30;
    const shown = new Map();
    let incomingList = [];
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
    function renderNotifs(st) {
        lastStatus = st || lastStatus;
        const scr = $('screen-notifs');
        const body = $('notifsBody');
        body.innerHTML = '';
        const banner = permissionBanner(); if (banner) body.appendChild(banner);
        // Входящие симпатии показываем прямо здесь с кнопками «Ответить взаимностью» / «Отказать»
        const hasIncoming = incomingList.length > 0;
        if (hasIncoming) {
            body.appendChild(el('div', 'sec-title', `Вас лайкнули · ${incomingList.length}`));
            incomingList.forEach((r) => {
                if (typeof Feed !== 'undefined' && Feed.incomingCard) {
                    body.appendChild(Feed.incomingCard(r, () => loadNotifs()));
                }
            });
        }
        const rows = [...shown.values()].sort((a, b) => b.id - a.id);
        if (!rows.length) {
            if (!hasIncoming && !banner) {
                if (scr) scr.classList.add('is-empty');
                const wrap = el('div', 'notif-empty-state');
                const art = el('div', 'notif-empty-art');
                art.innerHTML = EMPTY_NOTIF_BELL_SVG;
                const title = el('h3', 'notif-empty-title', 'Пока тихо');
                const desc = el('p', 'notif-empty-desc', 'Здесь будут новые лайки и взаимные волны.');
                const cta = el('button', 'notif-empty-cta', 'Перейти к анкетам');
                cta.type = 'button';
                cta.addEventListener('click', () => { TG.tap(); show(FEED); });
                wrap.append(art, title, desc, cta);
                body.appendChild(wrap);
                return;
            }
            if (scr) scr.classList.remove('is-empty');
            body.appendChild(el('p', 'notif-history-empty', 'История уведомлений пуста'));
            return;
        }
        if (scr) scr.classList.remove('is-empty');
        let label = '';
        let listEl = null;
        rows.forEach((n) => {
            const l = dayLabel(n.created_at);
            if (l !== label) {
                label = l;
                body.appendChild(el('div', 'sec-title notif-day-title', l));
                listEl = el('div', 'notif-list');
                body.appendChild(listEl);
            }
            listEl.appendChild(notifItem(n));
        });
        if (hasMore) {
            const more = el('button', 'notif-more-btn', 'Показать ещё'); more.type = 'button';
            more.addEventListener('click', () => { TG.tap(); loadNotifs(true); });
            body.appendChild(more);
        }
        if (rows.length) {
            const clr = el('button', 'notif-clear-btn', 'Очистить историю'); clr.type = 'button';
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
            incomingList = [];
            renderNotifs(lastStatus);
            return;
        }
        if (notifLoading) { notifAgain = true; return; }
        notifLoading = true;
        try {
            let useOlder = older;
            do {
                notifAgain = false;
                const args = useOlder ? { p_limit: PAGE, p_before: Math.min(...shown.keys()) } : { p_limit: PAGE };
                const [rows, st, inc] = await Promise.all([
                    Supa.rpc('my_notifications', args),
                    Supa.rpc('wave_status'),
                    Supa.rpc('my_incoming').catch(() => []),
                    waitMin
                ]);
                rows.forEach((n) => { if (!shown.has(n.id)) shown.set(n.id, n); });
                incomingList = Array.isArray(inc) ? inc : [];
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
            const scr = $('screen-notifs');
            if (scr) scr.classList.remove('is-empty');
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
        const scr = $('screen-notifs');
        if (scr) scr.classList.remove('is-empty');
        shown.clear(); incomingList = []; hasMore = false; firstLoaded = false;
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
        if ($('setGeoRow')) $('setGeoRow').addEventListener('click', onSetGeo);
        if ($('setAgeChips')) $('setAgeChips').addEventListener('click', onSetAge);
        if ($('setVisRow')) $('setVisRow').addEventListener('click', onSetVis);
        if ($('setBioRow')) $('setBioRow').addEventListener('click', onSetBio);
        if ($('setResetPassesBtn')) $('setResetPassesBtn').addEventListener('click', onResetPasses);
        if ($('setHapticRow')) $('setHapticRow').addEventListener('click', onSetHaptic);
        if ($('setClearNotifsBtn')) $('setClearNotifsBtn').addEventListener('click', clearHistory);
        if ($('setRefreshUsernameBtn')) $('setRefreshUsernameBtn').addEventListener('click', onRefreshUsername);
        if ($('setBlacklistToggleBtn')) $('setBlacklistToggleBtn').addEventListener('click', onToggleBlacklist);
        if ($('setSupportBtn')) $('setSupportBtn').addEventListener('click', onOpenSupport);
        if ($('setDeleteAccountBtn')) $('setDeleteAccountBtn').addEventListener('click', onDeleteAccount);
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
    return { renderDrawer, openNotifs, reloadNotifs: loadNotifs, go, renderSettings };
})();