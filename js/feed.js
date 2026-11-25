/* =========================================
   WAVE — колода анкет, волны, слоты, мэтчи
   Зависит от landing.js (INTENTS, show, FEED, WAVES, DONE, DEBUG, dbOn, changeCityFromFeed) и supabase.js
========================================= */
const ICEBREAKERS = {
    sport: [
        'Каким спортом занимаешься?',
        'Утренняя тренировка или вечерняя?',
        'Какой вид спорта давно хочешь попробовать?'
    ],
    gaming: [
        'Во что сейчас чаще всего играешь?',
        'Кооп с друзьями или соло-сюжетки?',
        'Какая игра затянула тебя больше всего?'
    ],
    travel: [
        'Какое место запомнилось больше всего?',
        'Море и пляж или горы и маршруты?',
        'Куда бы улетел(а) хоть завтра?'
    ],
    events: [
        'На какое событие ходил(а) в последний раз?',
        'Концерты, выставки или стендап?',
        'На что хочешь сходить в ближайшее время?'
    ],
    hobby: [
        'Чем увлекаешься в свободное время?',
        'Какое хобби появилось у тебя недавно?',
        'Что может увлечь тебя на несколько часов подряд?'
    ],
    party: [
        'Какие тусовки тебе по душе?',
        'Уютный бар с друзьями или громкий танцпол?',
        'Идеальный вечер пятницы — это…?'
    ],
    drives: [
        'На чём катаешься и какой маршрут любимый?',
        'Ночной город под музыку или трасса за город?',
        'Какой трек обязательно играет в дороге?'
    ],
    chat: [
        'О чём тебе интереснее всего поговорить?',
        'Какая тема может затянуть разговор до ночи?',
        'Что хорошего случилось на этой неделе?'
    ],
    friendship: [
        'Что для тебя важнее всего в друзьях?',
        'Как обычно проводишь выходные с близкими?',
        'Спонтанная встреча или всё по плану?'
    ],
    relationship: [
        'Что для тебя главное в близком человеке?',
        'Идеальное первое свидание — какое оно?',
        'Что сразу подкупает тебя в людях?'
    ]
};

const HINT_NEXT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-13.8-5.5L4 7.7"/><path d="M4 4v3.8h3.8"/><path d="M4 13a8 8 0 0 0 13.8 5.5L20 16.3"/><path d="M20 20v-3.8h-3.8"/></svg>`;
const HINT_SEND_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>`;

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

const MORE_ICON_SVG = `
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="6" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="18" cy="12" r="1.8" />
</svg>`;

const MSG_ICON_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
</svg>`;

const EMPTY_WAVES_SLOTS_SVG = `
<svg viewBox="0 0 300 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
        <filter id="wsGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        <filter id="wsSoft" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="18" />
        </filter>
        <linearGradient id="wsSlotBorder" x1="68" y1="92" x2="232" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#A855F7" />
            <stop offset="50%" stop-color="#C084FC" />
            <stop offset="100%" stop-color="#D9F99D" />
        </linearGradient>
        <linearGradient id="wsBarGrad" x1="80" y1="0" x2="175" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#9333EA" />
            <stop offset="55%" stop-color="#C084FC" />
            <stop offset="100%" stop-color="#D9F99D" />
        </linearGradient>
        <linearGradient id="wsBarShort" x1="80" y1="0" x2="122" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#9333EA" />
            <stop offset="100%" stop-color="#E9D5FF" />
        </linearGradient>
        <linearGradient id="wsWaveGrad" x1="18" y1="96" x2="282" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0" />
            <stop offset="22%" stop-color="#A855F7" stop-opacity="0.9" />
            <stop offset="52%" stop-color="#C084FC" stop-opacity="0.6" />
            <stop offset="78%" stop-color="#D9F99D" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#B5C680" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="wsWaveDim" x1="20" y1="100" x2="280" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0" />
            <stop offset="30%" stop-color="#9333EA" stop-opacity="0.34" />
            <stop offset="70%" stop-color="#B5C680" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#B5C680" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="wsHeartGrad" x1="132" y1="78" x2="168" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#E9D5FF" />
            <stop offset="55%" stop-color="#F5D0FE" />
            <stop offset="100%" stop-color="#D9F99D" />
        </linearGradient>
    </defs>

    <g transform="translate(0 2)">
        <!-- Фоновое неоновое свечение -->
        <ellipse cx="118" cy="92" rx="64" ry="44" fill="#7C3AED" fill-opacity="0.26" filter="url(#wsSoft)" />
        <ellipse cx="184" cy="96" rx="62" ry="42" fill="#B5C680" fill-opacity="0.2" filter="url(#wsSoft)" />

        <!-- Волны за слотами -->
        <path d="M18 98 C 52 124, 80 76, 122 96 C 166 116, 198 76, 232 104 C 254 120, 268 86, 286 96"
              stroke="url(#wsWaveDim)" stroke-width="1.5" stroke-linecap="round" />
        <path d="M16 100 C 44 124, 62 108, 82 78 C 98 54, 114 78, 134 94 C 154 110, 174 84, 194 108 C 210 128, 224 122, 238 92 C 252 64, 268 74, 286 88"
              stroke="url(#wsWaveGrad)" stroke-width="2.2" stroke-linecap="round" filter="url(#wsGlow)" />

        <!-- Слот 1 (верхний) -->
        <rect x="68" y="34" width="164" height="28" rx="14"
              fill="rgba(18, 10, 36, 0.56)" stroke="url(#wsSlotBorder)" stroke-width="1.7" stroke-dasharray="6 4.5" opacity="0.9" />
        <rect x="78" y="43" width="144" height="10" rx="5" fill="rgba(255, 255, 255, 0.08)" />
        <rect x="78" y="43" width="92" height="10" rx="5" fill="url(#wsBarGrad)" filter="url(#wsGlow)" />

        <!-- Слот 2 (средний с неоновым сердцем) -->
        <rect x="68" y="78" width="164" height="28" rx="14"
              fill="rgba(18, 10, 36, 0.56)" stroke="url(#wsSlotBorder)" stroke-width="1.7" stroke-dasharray="6 4.5" opacity="0.9" />
        <rect x="78" y="87" width="144" height="10" rx="5" fill="rgba(255, 255, 255, 0.08)" />
        <rect x="78" y="87" width="40" height="10" rx="5" fill="url(#wsBarShort)" filter="url(#wsGlow)" />

        <!-- Слот 3 (нижний) -->
        <rect x="68" y="122" width="164" height="28" rx="14"
              fill="rgba(18, 10, 36, 0.56)" stroke="url(#wsSlotBorder)" stroke-width="1.7" stroke-dasharray="6 4.5" opacity="0.9" />
        <rect x="78" y="131" width="144" height="10" rx="5" fill="rgba(255, 255, 255, 0.08)" />
        <rect x="78" y="131" width="92" height="10" rx="5" fill="url(#wsBarGrad)" filter="url(#wsGlow)" />

        <!-- Центральное светящееся сердце -->
        <path d="M150 109.5
                 C 150 109.5, 130 97.5, 130 85.2
                 C 130 79.2, 134.8 75, 140.4 75
                 C 144.4 75, 147.8 77.2, 150 80.5
                 C 152.2 77.2, 155.6 75, 159.6 75
                 C 165.2 75, 170 79.2, 170 85.2
                 C 170 97.5, 150 109.5, 150 109.5 Z"
              fill="rgba(18, 10, 36, 0.78)" stroke="url(#wsHeartGrad)" stroke-width="2.6" stroke-linejoin="round" filter="url(#wsGlow)" />

        <!-- Звёздочки и искры -->
        <path d="M52 122 L54 127.5 L59.5 129.5 L54 131.5 L52 137 L50 131.5 L44.5 129.5 L50 127.5 Z" fill="#A855F7" opacity="0.9" filter="url(#wsGlow)" />
        <path d="M248 58 L249.6 62.2 L253.8 63.8 L249.6 65.4 L248 69.6 L246.4 65.4 L242.2 63.8 L246.4 62.2 Z" fill="#D9F99D" opacity="0.88" filter="url(#wsGlow)" />
        <circle cx="58"  cy="50"  r="2"   fill="#C084FC" opacity="0.72" />
        <circle cx="38"  cy="82"  r="1.4" fill="#E9D5FF" opacity="0.52" />
        <circle cx="246" cy="134" r="2"   fill="#D9F99D" opacity="0.78" />
        <circle cx="212" cy="24"  r="1.4" fill="#B5C680" opacity="0.55" />
    </g>
</svg>`;

const Feed = (() => {
    const PREFS_KEY = 'wave_search_prefs';
    const BLOCKED_KEY = 'wave_blocked_local';
    const SEEN_WAVES_KEY = 'wave_seen_waves';
    const SWIPE_HINT_KEY = 'wave_swipe_hint_seen';
    const prefs = { ageMode: 'peer', sameCity: false, isHidden: false, onlyWithBio: false };
    try {
        const savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY));
        if (savedPrefs && typeof savedPrefs === 'object') {
            if (savedPrefs.ageMode) prefs.ageMode = savedPrefs.ageMode;
            if (typeof savedPrefs.sameCity === 'boolean') prefs.sameCity = savedPrefs.sameCity;
            if (typeof savedPrefs.isHidden === 'boolean') prefs.isHidden = savedPrefs.isHidden;
            if (typeof savedPrefs.onlyWithBio === 'boolean') prefs.onlyWithBio = savedPrefs.onlyWithBio;
        }
    } catch (e) {}

    let localBlocked = [];
    try {
        const sb = JSON.parse(localStorage.getItem(BLOCKED_KEY));
        if (Array.isArray(sb)) localBlocked = sb;
    } catch (e) {}

    function saveBlockedLocal() {
        try { localStorage.setItem(BLOCKED_KEY, JSON.stringify(localBlocked)); } catch (e) {}
    }
    function isBlockedLocal(id) {
        return localBlocked.some((b) => String(b.id) === String(id));
    }
    function addBlockedLocal(person) {
        if (!person || person.id === undefined || person.id === null) return;
        if (!isBlockedLocal(person.id)) {
            localBlocked.unshift({
                id: person.id,
                name: person.name || 'Пользователь',
                age: person.age || null,
                city: person.city || '',
                photo_path: person.photo_path || '',
                blocked_at: new Date().toISOString()
            });
            saveBlockedLocal();
        }
    }
    function unblockLocal(id) {
        localBlocked = localBlocked.filter((b) => String(b.id) !== String(id));
        saveBlockedLocal();
    }
    function getLocalBlocked() {
        return localBlocked.slice();
    }

    function savePrefs() {
        try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
    }

    function matchAgePref(age) {
        const a = Number(age) || 22;
        const myAge = Number(profile.age) || 22;
        if (prefs.ageMode === '18-24') return a >= 18 && a <= 24;
        if (prefs.ageMode === '25-34') return a >= 25 && a <= 34;
        if (prefs.ageMode === 'any')   return a >= 18;
        return a >= myAge - 5 && a <= myAge + 5; // 'peer' (±5 лет)
    }

    function matchCardPrefs(r) {
        if (isBlockedLocal(r.id)) return false;
        if (!matchAgePref(r.age)) return false;
        if (prefs.onlyWithBio && !(r.bio && r.bio.trim().length > 0)) return false;
        return true;
    }

    let seenWaves = new Set();
    try {
        const sw = JSON.parse(localStorage.getItem(SEEN_WAVES_KEY));
        if (Array.isArray(sw)) seenWaves = new Set(sw.map(String));
    } catch (e) {}
    function saveSeenWaves() {
        try { localStorage.setItem(SEEN_WAVES_KEY, JSON.stringify([...seenWaves])); } catch (e) {}
    }
    const waveKeyOf = (r) => (r ? String(r.wave_id != null ? r.wave_id : r.id) : '');
    function markWavesSeen(mat) {
        const nextSet = new Set();
        (Array.isArray(mat) ? mat : []).forEach((r) => {
            const k = waveKeyOf(r);
            if (k) nextSet.add(k);
        });
        seenWaves = nextSet;
        saveSeenWaves();
        st.newWaves = 0;
        st.matchesSynced = true;
        st.lastSyncedUsed = nextSet.size;
    }
    function syncUnseenWaves(mat) {
        const list = Array.isArray(mat) ? mat : [];
        const activeKeys = new Set();
        let unseen = 0;
        list.forEach((r) => {
            const k = waveKeyOf(r);
            if (!k) return;
            activeKeys.add(k);
            if (!seenWaves.has(k)) unseen++;
        });
        // Убираем из сохранённых завершённые волны, которых больше нет среди активных
        let pruned = false;
        seenWaves.forEach((k) => {
            if (!activeKeys.has(k)) { seenWaves.delete(k); pruned = true; }
        });
        if (pruned) saveSeenWaves();
        st.newWaves = step === WAVES ? 0 : unseen;
        if (step === WAVES) markWavesSeen(list);
        st.matchesSynced = true;
        st.lastSyncedUsed = list.length;
    }

    const st = {
        queue: [], cur: null, intent: null, sameCity: prefs.sameCity, lastZone: null,
        seenInCity: 0, autoExpandedFromCity: false, cityExhaustedAfterSwipe: false,
        loading: false, busy: false, exhausted: false, err: '', gen: 0, nameSent: false,
        status: { used: 0, max: 3, incoming: 0, unread: 0 },
        newWaves: 0, matchesSynced: false, lastSyncedUsed: -1
    };
    const urlCache = new Map();
    let pendingPass = null;
    let swipeHintTimer = null;
    let toastTimer;
    let toastHideAnimTimer;
    let toastRemainingMs = 3000;
    let toastShownAt = 0;

    /* ---------- помощники ---------- */
    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text; // только textContent: тексты пишут пользователи
        return e;
    }
    const dbg = (e) => (DEBUG ? ' (' + e.message + ')' : '');
    function scheduleToastHide(ms) {
        clearTimeout(toastTimer);
        toastRemainingMs = Math.max(800, ms);
        toastShownAt = Date.now();
        toastTimer = setTimeout(() => {
            const t = $('toast');
            if (t) t.hidden = true;
        }, toastRemainingMs);
    }
    function dismissToast(dir) {
        const t = $('toast');
        if (!t || t.hidden) return;
        clearTimeout(toastTimer);
        clearTimeout(toastHideAnimTimer);
        t.classList.remove('dragging', 'snap-back');
        t.style.transform = '';
        t.style.opacity = '';
        t.classList.add(dir === 'left' ? 'dismiss-left' : 'dismiss-right');
        TG.pick();
        toastHideAnimTimer = setTimeout(() => {
            t.hidden = true;
            t.classList.remove('dismiss-left', 'dismiss-right');
        }, 210);
    }
    function initToastSwipe() {
        const t = $('toast');
        if (!t) return;
        let startX = 0, startY = 0, dx = 0, startTime = 0;
        let tracking = false, dragging = false, pointerId = null;

        t.addEventListener('pointerdown', (e) => {
            if (t.hidden || (e.pointerType === 'mouse' && e.button !== 0)) return;
            tracking = true;
            dragging = false;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            dx = 0;
            startTime = Date.now();
            clearTimeout(toastTimer);
            toastRemainingMs = Math.max(1200, toastRemainingMs - (Date.now() - toastShownAt));
            t.classList.remove('snap-back', 'dismiss-left', 'dismiss-right');
        });

        t.addEventListener('pointermove', (e) => {
            if (!tracking || e.pointerId !== pointerId) return;
            dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (!dragging) {
                if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
                if (Math.abs(dy) > Math.abs(dx) * 1.4) {
                    tracking = false;
                    scheduleToastHide(toastRemainingMs);
                    return;
                }
                dragging = true;
                t.classList.add('dragging');
                try { t.setPointerCapture(pointerId); } catch (err) {}
            }
            e.preventDefault();
            t.style.transform = `translate(calc(-50% + ${dx}px), 0)`;
            t.style.opacity = String(Math.max(0.18, 1 - Math.abs(dx) / 160));
        });

        function onEnd(e) {
            if (!tracking || e.pointerId !== pointerId) return;
            tracking = false;
            if (!dragging) {
                scheduleToastHide(toastRemainingMs);
                return;
            }
            dragging = false;
            try { t.releasePointerCapture(pointerId); } catch (err) {}

            const elapsed = Math.max(1, Date.now() - startTime);
            const velocity = Math.abs(dx) / elapsed;
            if (Math.abs(dx) >= 54 || (velocity > 0.35 && Math.abs(dx) >= 22)) {
                dismissToast(dx < 0 ? 'left' : 'right');
            } else {
                t.classList.remove('dragging');
                t.classList.add('snap-back');
                t.style.transform = '';
                t.style.opacity = '';
                setTimeout(() => t.classList.remove('snap-back'), 250);
                scheduleToastHide(toastRemainingMs);
            }
        }

        t.addEventListener('pointerup', onEnd);
        t.addEventListener('pointercancel', onEnd);
    }
    function toast(msg, ms = 3000) {
        const t = $('toast');
        clearTimeout(toastTimer);
        clearTimeout(toastHideAnimTimer);
        t.classList.remove('dragging', 'snap-back', 'dismiss-left', 'dismiss-right');
        t.style.transform = '';
        t.style.opacity = '';
        t.innerHTML = '';
        const ico = el('div', 'toast-icon');
        ico.innerHTML = pickToastIcon(msg);
        const sep = el('div', 'toast-sep');
        const cleanMsg = (msg || '').replace(/^[💌🌊🎉👋]+\s*|\s*[♥🌊🎉]+$/g, '');
        const txt = el('div', 'toast-text', cleanMsg);
        t.append(ico, sep, txt);
        t.hidden = false;
        scheduleToastHide(ms);
    }
    const imgPreloads = new Map();
    const imgCache = new Map(); // Держим ссылки на декодированные Image, чтобы WebView не выгружал их до свайпа
    const IMG_CACHE_MAX = 18;
    function rememberImage(path, im) {
        if (imgCache.has(path)) imgCache.delete(path);
        imgCache.set(path, im);
        while (imgCache.size > IMG_CACHE_MAX) {
            const oldest = imgCache.keys().next().value;
            imgCache.delete(oldest);
        }
    }
    async function photoUrl(path) {
        if (!urlCache.has(path)) urlCache.set(path, await Supa.signedUrl(path));
        return urlCache.get(path);
    }
    function preloadImage(path) {
        if (!path) return Promise.resolve();
        if (imgCache.has(path)) return Promise.resolve();
        if (imgPreloads.has(path)) return imgPreloads.get(path);
        const p = photoUrl(path).then((u) => new Promise((res) => {
            if (!u) { imgPreloads.delete(path); return res(); }
            const im = new Image();
            im.decoding = 'async';
            const finishOk = () => { rememberImage(path, im); res(); };
            im.onload = () => (im.decode ? im.decode().then(finishOk, finishOk) : finishOk());
            im.onerror = () => { imgPreloads.delete(path); res(); };
            im.src = u;
        })).catch(() => { imgPreloads.delete(path); });
        imgPreloads.set(path, p);
        return p;
    }
    async function preloadPhotos(list, timeoutMs = 0) {
        const paths = [...new Set((list || []).map((r) => r && r.photo_path).filter(Boolean))];
        if (!paths.length) return;
        const missing = paths.filter((p) => !urlCache.has(p));
        const work = (async () => {
            if (missing.length && dbOn() && typeof Supa.signedUrls === 'function') {
                const signed = await Supa.signedUrls(missing);
                Object.keys(signed).forEach((k) => { if (signed[k]) urlCache.set(k, signed[k]); });
            }
            await Promise.all(paths.map((p) => preloadImage(p)));
        })().catch(() => {});
        if (timeoutMs > 0) {
            await Promise.race([work, new Promise((r) => setTimeout(r, timeoutMs))]);
        } else {
            await work;
        }
    }
    const SWIPE_HEART_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    const SWIPE_PASS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

    let viewerSourceEl = null;
    let viewerCloseTimer = null;
    let viewerClosing = false;

    function openPhotoViewer(url, caption, sourceEl = null) {
        const viewer = $('photoViewer');
        const img = $('photoViewerImg');
        const cap = $('photoViewerCaption');
        if (!viewer || !img || !url) return;
        TG.tap();
        clearTimeout(viewerCloseTimer);
        viewerClosing = false;
        viewerSourceEl = sourceEl && sourceEl.isConnected ? sourceEl : null;

        const srcRect = viewerSourceEl ? viewerSourceEl.getBoundingClientRect() : null;
        img.style.transition = 'none';
        img.style.transform = '';
        img.style.borderRadius = '';
        img.style.opacity = '';
        viewer.style.background = '';
        img.src = url;
        if (cap) {
            cap.textContent = caption || '';
            cap.hidden = !caption;
        }
        viewer.classList.remove('is-open', 'is-dragging');
        viewer.hidden = false;

        const runFlip = () => {
            if (viewerClosing || viewer.hidden) return;
            const dst = img.getBoundingClientRect();
            if (srcRect && dst.width > 10 && dst.height > 10) {
                const dx = (srcRect.left + srcRect.width / 2) - (dst.left + dst.width / 2);
                const dy = (srcRect.top + srcRect.height / 2) - (dst.top + dst.height / 2);
                const scale = Math.max(0.14, Math.min(0.85, srcRect.width / dst.width));
                img.style.transition = 'none';
                img.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
                img.style.borderRadius = '50%';
                img.style.opacity = '0.55';
                void img.offsetWidth;
                requestAnimationFrame(() => {
                    if (viewerClosing || viewer.hidden) return;
                    viewer.classList.add('is-open');
                    img.style.transition = 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease';
                    img.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    img.style.borderRadius = '20px';
                    img.style.opacity = '1';
                });
            } else {
                img.style.transition = 'none';
                img.style.transform = 'translate3d(0, 18px, 0) scale(0.86)';
                img.style.opacity = '0';
                void img.offsetWidth;
                requestAnimationFrame(() => {
                    if (viewerClosing || viewer.hidden) return;
                    viewer.classList.add('is-open');
                    img.style.transition = 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease';
                    img.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    img.style.opacity = '1';
                });
            }
        };

        if (img.complete && img.naturalWidth > 0) requestAnimationFrame(runFlip);
        else img.addEventListener('load', () => requestAnimationFrame(runFlip), { once: true });

        TG.back(closePhotoViewer);
    }

    function closePhotoViewer() {
        const viewer = $('photoViewer');
        const img = $('photoViewerImg');
        if (!viewer || viewer.hidden || viewerClosing) return;
        viewerClosing = true;
        viewer.classList.remove('is-open', 'is-dragging');
        viewer.style.background = '';

        if (img) {
            const dst = img.getBoundingClientRect();
            const srcRect = viewerSourceEl && viewerSourceEl.isConnected ? viewerSourceEl.getBoundingClientRect() : null;
            if (srcRect && srcRect.width > 0 && dst.width > 10) {
                const dx = (srcRect.left + srcRect.width / 2) - (dst.left + dst.width / 2);
                const dy = (srcRect.top + srcRect.height / 2) - (dst.top + dst.height / 2);
                const scale = Math.max(0.14, Math.min(0.85, srcRect.width / dst.width));
                img.style.transition = 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.26s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease';
                img.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
                img.style.borderRadius = '50%';
                img.style.opacity = '0';
            } else {
                img.style.transition = 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
                img.style.transform = 'translate3d(0, 26px, 0) scale(0.88)';
                img.style.opacity = '0';
            }
        }

        clearTimeout(viewerCloseTimer);
        viewerCloseTimer = setTimeout(() => {
            viewer.hidden = true;
            viewerClosing = false;
            if (img) {
                img.style.transition = '';
                img.style.transform = '';
                img.style.borderRadius = '';
                img.style.opacity = '';
                img.removeAttribute('src');
            }
            applyBack();
        }, 270);
    }

    function initPhotoViewerDrag() {
        const viewer = $('photoViewer');
        const img = $('photoViewerImg');
        if (!viewer || !img) return;
        let startY = 0, dy = 0, tracking = false, dragging = false, pointerId = null;

        img.addEventListener('pointerdown', (e) => {
            if (viewerClosing || (e.pointerType === 'mouse' && e.button !== 0)) return;
            tracking = true;
            dragging = false;
            pointerId = e.pointerId;
            startY = e.clientY;
            dy = 0;
        });

        img.addEventListener('pointermove', (e) => {
            if (!tracking || e.pointerId !== pointerId) return;
            dy = e.clientY - startY;
            if (!dragging) {
                if (Math.abs(dy) < 10) return;
                dragging = true;
                viewer.classList.add('is-dragging');
                img.style.transition = 'none';
                try { img.setPointerCapture(pointerId); } catch (err) {}
            }
            e.preventDefault();
            const progress = Math.min(1, Math.abs(dy) / 220);
            const scale = Math.max(0.76, 1 - progress * 0.22);
            img.style.transform = `translate3d(0, ${dy}px, 0) scale(${scale})`;
            viewer.style.background = `rgba(8, 4, 18, ${(0.94 * (1 - progress * 0.72)).toFixed(2)})`;
        });

        function onEnd(e) {
            if (!tracking || e.pointerId !== pointerId) return;
            tracking = false;
            if (!dragging) return;
            dragging = false;
            try { img.releasePointerCapture(pointerId); } catch (err) {}
            viewer.classList.remove('is-dragging');

            if (Math.abs(dy) >= 85) {
                closePhotoViewer();
            } else {
                viewer.style.background = '';
                img.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
                img.style.transform = 'translate3d(0, 0, 0) scale(1)';
            }
        }

        img.addEventListener('pointerup', onEnd);
        img.addEventListener('pointercancel', onEnd);
    }

    function avatar(r, cls, zoomable = false) {
        const a = el('div', cls, (r.name || '?').slice(0, 1).toUpperCase());
        if (!r.photo_path) return a;
        const mount = (u) => {
            if (!u) return;
            const ready = imgCache.has(r.photo_path);
            const im = new Image();
            im.alt = r.name || '';
            im.decoding = ready ? 'sync' : 'async';
            im.src = u;
            const isLoaded = ready || (im.complete && im.naturalWidth > 0);
            if (!isLoaded) {
                im.classList.add('is-loading');
                const reveal = () => {
                    rememberImage(r.photo_path, im);
                    im.classList.remove('is-loading');
                };
                im.onload = () => (im.decode ? im.decode().then(reveal, reveal) : reveal());
                im.onerror = () => im.classList.remove('is-loading');
            }
            a.textContent = '';
            a.appendChild(im);
            if (zoomable) {
                a.classList.add('is-zoomable');
                a.setAttribute('role', 'button');
                a.setAttribute('tabindex', '0');
                a.setAttribute('aria-label', 'Открыть фото профиля');
                const cap = [r.name ? (r.age ? `${r.name}, ${r.age}` : r.name) : '', r.city || ''].filter(Boolean).join(' · ');
                a.addEventListener('click', (e) => { e.stopPropagation(); openPhotoViewer(u, cap, a); });
                a.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhotoViewer(u, cap, a); }
                });
            }
        };
        const cached = urlCache.get(r.photo_path);
        if (cached) mount(cached);
        else photoUrl(r.photo_path).then(mount).catch(() => {});
        return a;
    }
    function tagsOf(r) {
        const box = el('div', 'tags');
        (r.intents || []).forEach((k) => box.appendChild(el('span', 'tag' + ((r.shared || []).includes(k) ? ' shared' : ''), INTENTS[k] || k)));
        return box;
    }
    function promptsFor(r) {
        const keys = (r.shared || []).filter((k) => ICEBREAKERS[k]);
        if (!keys.length) return [];
        const list = [];
        const maxLen = Math.max(...keys.map((k) => (Array.isArray(ICEBREAKERS[k]) ? ICEBREAKERS[k].length : 1)));
        for (let i = 0; i < maxLen; i++) {
            keys.forEach((k) => {
                const arr = Array.isArray(ICEBREAKERS[k]) ? ICEBREAKERS[k] : [ICEBREAKERS[k]];
                if (arr[i]) list.push({ key: k, topic: INTENTS[k] || k, text: arr[i] });
            });
        }
        return list;
    }

    /* ---------- слоты ---------- */
    // Лайки без ограничений. Слот занимает только ВОЛНА — взаимный мэтч (у обоих людей).
    function renderStatus() {
        const s = st.status, box = $('slots');
        box.innerHTML = '';
        const bars = el('span', 'slots-bars');
        for (let i = 0; i < s.max; i++) bars.appendChild(el('span', 'slot-bar' + (i < s.used ? ' full' : '')));
        const cnt = el('span', 'slots-count');
        const usedNum = el('b', '', String(s.used));
        cnt.append(usedNum, document.createTextNode('/' + s.max));
        box.append(bars, cnt);
        box.classList.toggle('is-full', s.used >= s.max);
        const newWaves = st.newWaves || 0;
        const wb = $('wavesBadge');
        if (wb) {
            wb.hidden = !newWaves;
            wb.textContent = String(newWaves);
        }
        document.dispatchEvent(new CustomEvent('wave:status', { detail: { ...s, newWaves } }));
    }
    async function refreshStatus(forceMatches = false) {
        try {
            st.status = await Supa.rpc('wave_status');
            const used = st.status.used || 0;
            if (used === 0) {
                if (seenWaves.size || st.newWaves) {
                    seenWaves.clear();
                    saveSeenWaves();
                }
                st.newWaves = 0;
                st.matchesSynced = true;
                st.lastSyncedUsed = 0;
            } else if (step !== WAVES && (forceMatches || !st.matchesSynced || used !== st.lastSyncedUsed)) {
                try {
                    const mat = await Supa.rpc('my_matches');
                    syncUnseenWaves(mat);
                } catch (err) {
                    console.error('Matches sync error:', err);
                }
            }
        } catch (e) { console.error('Status error:', e); }
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
        if (!st.cur) renderDeck();
        const waitMin = !st.cur ? new Promise((r) => setTimeout(r, 420)) : Promise.resolve();
        try {
            if (!dbOn()) {
                await waitMin;
                if (gen === st.gen) st.err = 'Лента доступна только внутри Telegram';
            } else {
                const rows = await Supa.rpc('discover', { p_intent: st.intent, p_same_city: st.sameCity, p_limit: 20, p_offset: 0 });
                if (gen !== st.gen) return;
                const have = new Set(st.queue.map((r) => r.id));
                if (st.cur) have.add(st.cur.id);
                const added = [];
                rows.forEach((r) => {
                    if (!have.has(r.id) && matchCardPrefs(r)) {
                        st.queue.push(r);
                        added.push(r);
                    }
                });
                if (rows.length < 20) st.exhausted = true;

                // Пакетно подписываем URL всех анкет пачки и заранее декодируем ближайшие фото
                if (added.length) {
                    const missing = [...new Set(added.map((r) => r.photo_path).filter((p) => p && !urlCache.has(p)))];
                    const batchSign = (missing.length && typeof Supa.signedUrls === 'function')
                        ? Supa.signedUrls(missing).then((signed) => {
                            Object.keys(signed).forEach((k) => { if (signed[k]) urlCache.set(k, signed[k]); });
                        }).catch(() => {})
                        : Promise.resolve();

                    if (!st.cur && st.queue.length) {
                        const firstReady = batchSign.then(() => {
                            st.queue.slice(1, 6).forEach((r) => preloadImage(r.photo_path));
                            return preloadImage(st.queue[0].photo_path);
                        });
                        await Promise.all([
                            waitMin,
                            Promise.race([firstReady, new Promise((r) => setTimeout(r, 2200))])
                        ]);
                    } else {
                        batchSign.then(() => {
                            st.queue.slice(0, 6).forEach((r) => preloadImage(r.photo_path));
                        });
                        await waitMin;
                    }
                } else {
                    await waitMin;
                }
                if (gen !== st.gen) return;
            }
        } catch (e) {
            await waitMin;
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
        if (z > 0 && st.autoExpandedFromCity) {
            toast(st.cityExhaustedAfterSwipe
                ? 'В вашем городе анкеты закончились — показываем людей из ближайших городов'
                : 'В вашем городе пока нет новых анкет — показываем людей из ближайших городов', 4500);
        } else if (z > 0 && st.lastZone === null) {
            toast('Показываем людей из ближайших городов', 4500);
        } else if (z > 0 && st.lastZone === 0) {
            toast('В вашем городе анкеты закончились — показываем людей из ближайших городов', 4500);
        } else if (st.lastZone !== null && z > st.lastZone && z > 1) {
            toast('Расширяем поиск — показываем города подальше', 4500);
        }
        st.autoExpandedFromCity = false;
        st.cityExhaustedAfterSwipe = false;
        st.lastZone = z;
    }
    function expandToNearbyCities() {
        st.sameCity = false;
        prefs.sameCity = false;
        savePrefs();
        st.exhausted = false;
        st.autoExpandedFromCity = true;
        st.cityExhaustedAfterSwipe = st.seenInCity > 0;
        buildChips();
        if (typeof Nav !== 'undefined' && Nav.renderSettings) Nav.renderSettings();
        loadQueue();
    }
    function next() {
        st.cur = st.queue.shift() || null;
        if (!st.cur && !st.queue.length && st.sameCity && st.exhausted && !st.err && dbOn()) {
            expandToNearbyCities();
            return;
        }
        if (st.cur && (st.cur.zone === 0 || st.sameCity)) st.seenInCity++;
        announceZone();
        renderDeck();
        if (st.queue.length) preloadPhotos(st.queue.slice(0, 5));
        if (st.cur && st.queue.length < 6) loadQueue();
    }
    function resetDeck() {
        flushPendingPass();
        st.queue = []; st.cur = null; st.lastZone = null; st.seenInCity = 0;
        st.autoExpandedFromCity = false; st.cityExhaustedAfterSwipe = false;
        st.exhausted = false; st.err = ''; st.loading = false; st.gen++;
        loadQueue();
    }

    /* ---------- колода ---------- */
    function renderEmptyDeck(deck) {
        const wrap = el('div', 'deck-empty-state');
        if (st.loading) {
            wrap.appendChild(waveLoader('Ищем людей на волне…', 'Подбираем анкеты по интересам и городу'));
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
                document.createTextNode(st.sameCity ? 'В твоём городе анкеты закончились.' : 'Новые анкеты закончились.'),
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

    function attachSwipe(card) {
        const auraLike = card.querySelector('.swipe-aura-like');
        const auraPass = card.querySelector('.swipe-aura-pass');
        const badgeLike = card.querySelector('.swipe-badge-like');
        const badgePass = card.querySelector('.swipe-badge-pass');
        let startX = 0, startY = 0, dx = 0, dy = 0, startTime = 0;
        let tracking = false, dragging = false, pointerId = null, readyDir = null;

        function clearFeedback() {
            readyDir = null;
            if (auraLike) auraLike.style.opacity = '0';
            if (auraPass) auraPass.style.opacity = '0';
            if (badgeLike) {
                badgeLike.style.opacity = '0';
                badgeLike.style.transform = 'translate3d(-50%, -50%, 0) scale(0.55)';
                badgeLike.classList.remove('is-ready', 'is-commit');
            }
            if (badgePass) {
                badgePass.style.opacity = '0';
                badgePass.style.transform = 'translate3d(-50%, -50%, 0) scale(0.55)';
                badgePass.classList.remove('is-ready', 'is-commit');
            }
        }

        function resetCard() {
            card.classList.remove('dragging');
            card.classList.add('snap-back');
            card.style.transform = '';
            card.style.boxShadow = '';
            clearFeedback();
            setTimeout(() => card.classList.remove('snap-back'), 300);
        }

        card.addEventListener('pointerdown', (e) => {
            if (st.busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
            if (e.target.closest('button, a, input, textarea, .hint')) return;
            tracking = true;
            dragging = false;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            dx = 0;
            dy = 0;
            readyDir = null;
            startTime = Date.now();
            card.classList.remove('snap-back');
        });

        card.addEventListener('pointermove', (e) => {
            if (!tracking || e.pointerId !== pointerId) return;
            dx = e.clientX - startX;
            dy = e.clientY - startY;

            if (!dragging) {
                if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
                if (Math.abs(dy) > Math.abs(dx) * 1.25) {
                    tracking = false;
                    return;
                }
                dragging = true;
                card.classList.add('dragging');
                try { card.setPointerCapture(pointerId); } catch (err) {}
            }

            e.preventDefault();
            const rot = Math.max(-16, Math.min(16, dx * 0.05));
            const moveY = dy * 0.14;
            card.style.transform = `translate3d(${dx}px, ${moveY}px, 0) rotate(${rot}deg)`;

            const progress = Math.min(1, Math.abs(dx) / 96);
            const eased = Math.pow(progress, 0.85);
            const scale = 0.56 + eased * 0.5;
            const shiftX = Math.max(-22, Math.min(22, dx * 0.14));
            const isReady = progress >= 0.88;

            if (dx > 0) {
                if (isReady && readyDir !== 'right') { readyDir = 'right'; TG.pick(); }
                else if (!isReady && readyDir === 'right') readyDir = null;

                if (auraLike) auraLike.style.opacity = String(eased);
                if (auraPass) auraPass.style.opacity = '0';
                if (badgeLike) {
                    badgeLike.style.opacity = String(Math.min(1, eased * 1.15));
                    badgeLike.style.transform = `translate3d(calc(-50% + ${shiftX}px), -50%, 0) scale(${scale.toFixed(3)}) rotate(${(-8 * (1 - eased)).toFixed(1)}deg)`;
                    badgeLike.classList.toggle('is-ready', isReady);
                }
                if (badgePass) { badgePass.style.opacity = '0'; badgePass.classList.remove('is-ready'); }
                card.style.boxShadow = `0 0 0 1.5px rgba(181, 198, 128, ${(eased * 0.72).toFixed(2)}), 0 18px 42px rgba(0,0,0,0.48), 0 0 36px rgba(181, 198, 128, ${(eased * 0.24).toFixed(2)})`;
            } else {
                if (isReady && readyDir !== 'left') { readyDir = 'left'; TG.pick(); }
                else if (!isReady && readyDir === 'left') readyDir = null;

                if (auraPass) auraPass.style.opacity = String(eased);
                if (auraLike) auraLike.style.opacity = '0';
                if (badgePass) {
                    badgePass.style.opacity = String(Math.min(1, eased * 1.15));
                    badgePass.style.transform = `translate3d(calc(-50% + ${shiftX}px), -50%, 0) scale(${scale.toFixed(3)}) rotate(${(8 * (1 - eased)).toFixed(1)}deg)`;
                    badgePass.classList.toggle('is-ready', isReady);
                }
                if (badgeLike) { badgeLike.style.opacity = '0'; badgeLike.classList.remove('is-ready'); }
                card.style.boxShadow = `0 0 0 1.5px rgba(255, 107, 107, ${(eased * 0.68).toFixed(2)}), 0 18px 42px rgba(0,0,0,0.48), 0 0 36px rgba(255, 107, 107, ${(eased * 0.22).toFixed(2)})`;
            }
        });

        function onEnd(e) {
            if (!tracking || e.pointerId !== pointerId) return;
            tracking = false;
            if (!dragging) return;
            dragging = false;
            try { card.releasePointerCapture(pointerId); } catch (err) {}

            const elapsed = Math.max(1, Date.now() - startTime);
            const velocity = Math.abs(dx) / elapsed;
            const triggered = Math.abs(dx) >= 92 || (velocity > 0.52 && Math.abs(dx) >= 46);

            if (triggered && dx > 0) {
                card.classList.remove('dragging');
                if (badgeLike) {
                    badgeLike.style.opacity = '1';
                    badgeLike.classList.add('is-ready', 'is-commit');
                }
                wave(null, resetCard);
            } else if (triggered && dx < 0) {
                card.classList.remove('dragging');
                if (badgePass) {
                    badgePass.style.opacity = '1';
                    badgePass.classList.add('is-ready', 'is-commit');
                }
                pass();
            } else {
                resetCard();
            }
        }

        card.addEventListener('pointerup', onEnd);
        card.addEventListener('pointercancel', onEnd);
    }

    const SWIPE_HINT_LEFT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>`;
    const SWIPE_HINT_RIGHT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>`;

    function shouldShowSwipeHint() {
        try { return localStorage.getItem(SWIPE_HINT_KEY) !== '1'; } catch (e) { return false; }
    }
    function markSwipeHintSeen() {
        try { localStorage.setItem(SWIPE_HINT_KEY, '1'); } catch (e) {}
    }
    function maybeShowSwipeHint(card) {
        if (!card || step !== FEED || !shouldShowSwipeHint()) return;
        markSwipeHintSeen();
        clearTimeout(swipeHintTimer);

        const tip = el('div', 'swipe-hint-tip');
        tip.setAttribute('aria-hidden', 'true');
        const leftSide = el('span', 'swipe-hint-side swipe-hint-pass');
        leftSide.innerHTML = SWIPE_HINT_LEFT_SVG;
        leftSide.appendChild(document.createTextNode('Пропустить'));
        const rightSide = el('span', 'swipe-hint-side swipe-hint-like');
        rightSide.appendChild(document.createTextNode('Лайк'));
        rightSide.insertAdjacentHTML('beforeend', SWIPE_HINT_RIGHT_SVG);
        tip.append(leftSide, el('span', 'swipe-hint-dot', '·'), rightSide);
        card.appendChild(tip);

        card.classList.add('is-hint-sway');
        const dismissHint = () => {
            clearTimeout(swipeHintTimer);
            card.classList.remove('is-hint-sway');
            if (!tip.isConnected || tip.classList.contains('is-fading')) return;
            tip.classList.add('is-fading');
            setTimeout(() => { if (tip.isConnected) tip.remove(); }, 280);
        };
        card.addEventListener('pointerdown', dismissHint, { once: true });
        card.addEventListener('animationend', (e) => {
            if (e.animationName === 'cardHintSway') card.classList.remove('is-hint-sway');
        }, { once: true });
        swipeHintTimer = setTimeout(dismissHint, 3600);
    }

    function renderDeck(mode) {
        const deck = $('deck'), r = st.cur;
        deck.innerHTML = '';
        if (!r) {
            renderEmptyDeck(deck);
            return;
        }
        const card = el('article', 'deck-card' + (mode === 'undo' ? ' is-undo-in' : ''));
        card.appendChild(avatar(r, 'deck-photo'));

        const auraLike = el('div', 'swipe-aura swipe-aura-like');
        const auraPass = el('div', 'swipe-aura swipe-aura-pass');
        const badgeLike = el('div', 'swipe-badge swipe-badge-like');
        badgeLike.innerHTML = SWIPE_HEART_SVG;
        const badgePass = el('div', 'swipe-badge swipe-badge-pass');
        badgePass.innerHTML = SWIPE_PASS_SVG;
        card.append(auraLike, auraPass, badgeLike, badgePass);

        const moreBtn = el('button', 'deck-more-btn');
        moreBtn.type = 'button';
        moreBtn.setAttribute('aria-label', 'Действия с анкетой');
        moreBtn.innerHTML = MORE_ICON_SVG;
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPersonMenu(r, false);
        });
        card.appendChild(moreBtn);

        const info = el('div', 'deck-info');
        const headRow = el('div', 'deck-head-row');
        const headMain = el('div', 'deck-head-main');
        headMain.append(
            el('div', 'deck-name', `${r.name}, ${r.age}`),
            el('div', 'deck-city', (r.city || '') + (r.distance_km ? ' · ~' + r.distance_km + ' км от вас' : ''))
        );
        const prompts = promptsFor(r);
        let promptIdx = 0;
        const curPrompt = () => (prompts.length ? prompts[promptIdx % prompts.length] : null);

        const msgBtn = el('button', 'deck-msg-btn');
        msgBtn.type = 'button';
        msgBtn.setAttribute('aria-label', 'Написать сообщение');
        msgBtn.title = 'Написать сообщение';
        msgBtn.innerHTML = MSG_ICON_SVG;
        msgBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            TG.tap();
            openSheet('');
        });
        headRow.append(headMain, msgBtn);
        info.append(headRow, tagsOf(r));

        if (r.bio) {
            const bioWrap = el('div', 'deck-bio-wrap');
            const bioEl = el('p', 'deck-bio', r.bio);
            const bioToggle = el('button', 'deck-bio-toggle', 'Развернуть');
            bioToggle.type = 'button';
            bioToggle.hidden = true;
            const toggleBio = (e) => {
                e.stopPropagation();
                if (!bioEl.classList.contains('is-expandable')) return;
                TG.pick();
                const expanded = bioEl.classList.toggle('is-expanded');
                bioToggle.textContent = expanded ? 'Свернуть' : 'Развернуть';
                bioEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            };
            bioEl.addEventListener('click', toggleBio);
            bioToggle.addEventListener('click', toggleBio);
            bioWrap.append(bioEl, bioToggle);
            info.appendChild(bioWrap);
            requestAnimationFrame(() => {
                if (!bioEl.isConnected) return;
                if (bioEl.scrollHeight > bioEl.clientHeight + 2) {
                    bioEl.classList.add('is-expandable');
                    bioEl.setAttribute('aria-expanded', 'false');
                    bioToggle.hidden = false;
                }
            });
        }
        if (prompts.length) {
            const h = el('div', 'hint');
            h.setAttribute('role', 'button');
            h.setAttribute('tabindex', '0');
            h.setAttribute('aria-label', 'Отправить вопрос по общему интересу');

            const body = el('div', 'hint-body');
            const top = el('div', 'hint-top');
            const topic = el('span', 'hint-topic', prompts[0].topic);
            top.append(el('span', 'hint-label', 'Общий интерес'), el('span', 'hint-dot', '·'), topic);

            const ask = el('div', 'hint-ask', prompts[0].text);
            body.append(top, ask);

            const actions = el('div', 'hint-actions');
            if (prompts.length > 1) {
                const nextBtn = el('button', 'hint-next');
                nextBtn.type = 'button';
                nextBtn.setAttribute('aria-label', 'Другой вопрос');
                nextBtn.title = 'Другой вопрос';
                nextBtn.innerHTML = HINT_NEXT_SVG;
                let spin = 0;
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    TG.pick();
                    promptIdx = (promptIdx + 1) % prompts.length;
                    const nextP = prompts[promptIdx];
                    spin += 180;
                    const svg = nextBtn.querySelector('svg');
                    if (svg) svg.style.transform = `rotate(${spin}deg)`;
                    ask.classList.add('is-swap');
                    setTimeout(() => {
                        topic.textContent = nextP.topic;
                        ask.textContent = nextP.text;
                        ask.classList.remove('is-swap');
                    }, 110);
                });
                actions.append(nextBtn, el('span', 'hint-sep'));
            }

            const sendCue = el('span', 'hint-send');
            sendCue.setAttribute('aria-hidden', 'true');
            sendCue.innerHTML = HINT_SEND_SVG;
            actions.appendChild(sendCue);

            h.append(body, actions);
            const triggerOpen = () => {
                TG.tap();
                const p = curPrompt();
                openSheet(p ? p.text : '');
            };
            h.addEventListener('click', triggerOpen);
            h.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerOpen(); }
            });
            info.appendChild(h);
        }
        card.appendChild(info);
        attachSwipe(card);
        deck.appendChild(card);
        maybeShowSwipeHint(card);
    }
    function leave(dir) {
        return new Promise((res) => {
            const c = document.querySelector('.deck-card');
            if (c) {
                const badge = c.querySelector(dir === 'right' ? '.swipe-badge-like' : '.swipe-badge-pass');
                const aura = c.querySelector(dir === 'right' ? '.swipe-aura-like' : '.swipe-aura-pass');
                if (aura) aura.style.opacity = '1';
                if (badge) { badge.style.opacity = '1'; badge.classList.add('is-ready', 'is-commit'); }
                c.classList.remove('dragging', 'snap-back', 'is-hint-sway');
                c.style.transform = '';
                c.style.boxShadow = '';
                c.classList.add('leave-' + dir);
            }
            setTimeout(res, c ? 280 : 0);
        });
    }

    /* ---------- действия ---------- */
    function hideUndoBtn() {
        const btn = $('undoPassBtn');
        if (btn) btn.hidden = true;
    }
    function flushPendingPass() {
        if (!pendingPass) return;
        const item = pendingPass;
        pendingPass = null;
        clearTimeout(item.timer);
        hideUndoBtn();
        if (item.card && item.card.id !== undefined && item.card.id !== null && dbOn()) {
            Supa.rpc('pass_profile', { p_target: item.card.id }).catch((e) => console.error('Pass error:', e));
        }
    }
    function showUndoPass(card) {
        flushPendingPass();
        if (!card) return;
        pendingPass = {
            card,
            timer: setTimeout(() => flushPendingPass(), 4500)
        };
        const btn = $('undoPassBtn');
        if (btn) {
            btn.hidden = true;
            void btn.offsetWidth;
            btn.hidden = false;
        }
    }
    function undoLastPass() {
        if (!pendingPass || st.busy) return;
        const item = pendingPass;
        pendingPass = null;
        clearTimeout(item.timer);
        hideUndoBtn();
        if (st.cur) st.queue.unshift(st.cur);
        st.cur = item.card;
        TG.tap();
        renderDeck('undo');
    }

    async function pass() {
        if (!st.cur || st.busy) return;
        st.busy = true; TG.pick();
        const skipped = st.cur;
        showUndoPass(skipped);
        await leave('left'); next(); st.busy = false;
    }
    async function wave(msg, onFail) {
        if (!st.cur || st.busy) return;
        flushPendingPass();
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
            if (text === undefined) {
                toast('Не получилось отправить лайк');
                if (onFail) onFail();
            } else {
                if (text) { TG.ok(); toast(text, res.result === 'sent' ? 3000 : 5500); }
                await leave('right'); next(); refreshStatus(res.result === 'matched');
            }
        } catch (e) {
            console.error('Wave error:', e); TG.fail(); toast('Не удалось отправить лайк' + dbg(e));
            if (onFail) onFail();
        }
        st.busy = false;
    }
    let menuTarget = null;
    let menuFromWaves = false;
    let reportTarget = null;
    let reportFromWaves = false;
    let reportReason = 'fake';

    function openPersonMenu(r, fromWaves) {
        if (!r || st.busy) return;
        TG.tap();
        menuTarget = r;
        menuFromWaves = !!fromWaves;
        const title = $('personMenuTitle');
        if (title) title.textContent = r.name ? `${r.name}${r.age ? ', ' + r.age : ''}` : 'Действия с анкетой';
        const sh = $('personMenuSheet');
        if (sh) {
            resetSheetState(sh);
            sh.hidden = false;
        }
    }
    function closePersonMenu() {
        const sh = $('personMenuSheet');
        if (sh) {
            resetSheetState(sh);
            sh.hidden = true;
        }
        menuTarget = null;
    }

    function openReportSheet(r, fromWaves) {
        if (!r) return;
        TG.tap();
        reportTarget = r;
        reportFromWaves = !!fromWaves;
        reportReason = 'fake';
        const sub = $('reportTargetSub');
        if (sub) sub.textContent = `Жалоба на ${r.name || 'пользователя'} — мы проверим анкету и скроем её из вашей ленты`;
        const box = $('reportReasons');
        if (box) {
            box.querySelectorAll('.report-reason').forEach((b) => {
                b.classList.toggle('selected', b.dataset.reason === reportReason);
            });
        }
        const commentEl = $('reportComment');
        if (commentEl) {
            commentEl.value = '';
            commentEl.classList.remove('is-scrollable');
        }
        const sh = $('reportSheet');
        if (sh) {
            resetSheetState(sh);
            sh.hidden = false;
        }
    }
    function closeReportSheet() {
        const commentEl = $('reportComment');
        if (commentEl) commentEl.blur();
        const sh = $('reportSheet');
        if (sh) {
            resetSheetState(sh);
            sh.hidden = true;
        }
        reportTarget = null;
    }
    async function submitReport() {
        if (!reportTarget || st.busy) return;
        const target = reportTarget;
        const fromWaves = reportFromWaves;
        const reason = reportReason || 'other';
        const comment = ($('reportComment') && $('reportComment').value.trim()) || '';
        const btn = $('reportSendBtn');
        if (btn) btn.disabled = true;
        st.busy = true;
        try {
            if (dbOn() && typeof Supa.reportUser === 'function') {
                await Supa.reportUser(target.id, reason, comment).catch((e) => console.error('Report error:', e));
            }
            // Скрываем анкету из ленты, чтобы не попадалась повторно
            if (!fromWaves && dbOn()) {
                Supa.rpc('pass_profile', { p_target: target.id }).catch(() => {});
            }
            closeReportSheet();
            TG.ok();
            toast('Жалоба отправлена на модерацию. Спасибо!', 4000);
            if (!fromWaves && st.cur && String(st.cur.id) === String(target.id)) {
                await leave('left');
                next();
            }
        } finally {
            if (btn) btn.disabled = false;
            st.busy = false;
        }
    }

    async function blockPerson(r, fromWaves) {
        if (!r || st.busy) return;
        TG.tap();
        const ok = await ask(`Заблокировать ${r.name}? Вы больше не увидите друг друга в ленте и волнах.`);
        if (!ok) return;
        st.busy = true;
        try {
            addBlockedLocal(r);
            if (dbOn() && typeof Supa.blockUser === 'function') {
                await Supa.blockUser(r.id).catch((e) => console.error('Block error:', e));
            }
            toast(`${r.name} добавлен(а) в чёрный список`);
            if (fromWaves) {
                if (step === WAVES) loadWaves();
                if (step === NOTIFS && typeof Nav !== 'undefined' && Nav.reloadNotifs) Nav.reloadNotifs();
            } else {
                await leave('left');
                next();
            }
            refreshStatus();
        } finally {
            st.busy = false;
        }
    }

    /* ---------- окно сообщения и свайп-закрытие нижних шторок ---------- */
    function resetSheetState(sheet) {
        if (!sheet) return;
        clearTimeout(sheet._sheetTimer);
        sheet.classList.remove('is-dragging', 'is-snapping', 'is-closing');
        sheet.style.background = '';
        const box = sheet.querySelector('.sheet-box');
        if (box) {
            box.style.transform = '';
            box.style.animation = '';
        }
    }

    function syncTextareaScrollable(ta) {
        if (!ta) return;
        ta.classList.toggle('is-scrollable', ta.scrollHeight > ta.clientHeight + 2);
    }

    function initSheetSwipe(sheet, closeFn) {
        if (!sheet) return;
        const box = sheet.querySelector('.sheet-box');
        if (!box) return;
        let startX = 0, startY = 0, dy = 0, startTime = 0;
        let tracking = false, dragging = false, pointerId = null, fromInput = null;

        box.addEventListener('pointerdown', (e) => {
            if (sheet.hidden || sheet.classList.contains('is-closing')) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            fromInput = e.target.closest('textarea, input');
            if (fromInput && (e.pointerType === 'mouse' || fromInput.scrollTop > 0)) return;
            tracking = true;
            dragging = false;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            dy = 0;
            startTime = Date.now();
        });

        box.addEventListener('pointermove', (e) => {
            if (!tracking || e.pointerId !== pointerId) return;
            const dx = e.clientX - startX;
            const rawDy = e.clientY - startY;

            if (!dragging) {
                if (Math.abs(rawDy) < 8 && Math.abs(dx) < 8) return;
                if (rawDy <= 0 || Math.abs(dx) > rawDy * 1.15) {
                    tracking = false;
                    return;
                }
                if (fromInput && fromInput.scrollTop > 0) {
                    tracking = false;
                    return;
                }
                dragging = true;
                clearTimeout(sheet._sheetTimer);
                const active = document.activeElement;
                if (active && sheet.contains(active) && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
                    active.blur();
                }
                sheet.classList.remove('is-snapping');
                sheet.classList.add('is-dragging');
                box.style.animation = 'none';
                try { box.setPointerCapture(pointerId); } catch (err) {}
            }

            e.preventDefault();
            dy = rawDy < 0 ? rawDy * 0.16 : rawDy;
            box.style.transform = `translate3d(0, ${dy}px, 0)`;
            const h = Math.max(180, box.offsetHeight || 260);
            const progress = Math.min(1, Math.max(0, dy) / h);
            sheet.style.background = `rgba(0, 0, 0, ${(0.58 * (1 - progress * 0.85)).toFixed(3)})`;
        });

        function onEnd(e) {
            if (!tracking || e.pointerId !== pointerId) return;
            tracking = false;
            if (!dragging) return;
            dragging = false;
            try { box.releasePointerCapture(pointerId); } catch (err) {}
            sheet.classList.remove('is-dragging');

            const elapsed = Math.max(1, Date.now() - startTime);
            const velocity = dy / elapsed;
            const h = Math.max(180, box.offsetHeight || 260);

            if (dy >= Math.min(108, h * 0.28) || (velocity > 0.42 && dy >= 34)) {
                TG.pick();
                sheet.classList.add('is-closing');
                sheet.style.background = 'rgba(0, 0, 0, 0)';
                box.style.transform = 'translate3d(0, 105%, 0)';
                clearTimeout(sheet._sheetTimer);
                sheet._sheetTimer = setTimeout(() => closeFn(), 220);
            } else {
                sheet.classList.add('is-snapping');
                sheet.style.background = '';
                box.style.transform = 'translate3d(0, 0, 0)';
                clearTimeout(sheet._sheetTimer);
                sheet._sheetTimer = setTimeout(() => {
                    sheet.classList.remove('is-snapping');
                    box.style.transform = '';
                }, 260);
            }
        }

        box.addEventListener('pointerup', onEnd);
        box.addEventListener('pointercancel', onEnd);
    }

    function openSheet(prefill) {
        if (!st.cur) return;
        const sh = $('waveSheet');
        const ta = $('sheetText');
        resetSheetState(sh);
        if (ta) {
            ta.value = prefill || '';
            syncTextareaScrollable(ta);
        }
        sh.hidden = false;
        setTimeout(() => {
            if (!sh.hidden && ta) {
                ta.focus();
                syncTextareaScrollable(ta);
            }
        }, 60);
    }
    const closeSheet = () => {
        const sh = $('waveSheet');
        const ta = $('sheetText');
        if (ta) ta.blur();
        resetSheetState(sh);
        if (sh) sh.hidden = true;
    };

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
        mk((profile.city || 'Мой город'), 'city', st.sameCity);                  // только ваш город
        mk('Все города', 'all_cities', !st.sameCity);                            // поиск по всем городам
        if (mine.length) sep();
        mine.forEach((k) => mk(INTENTS[k], k, st.intent === k));
    }
    function onChip(e) {
        const c = e.target.closest('.chip');
        if (!c) return;
        TG.pick();
        const key = c.dataset.key;
        if (key === 'city') { st.sameCity = true; prefs.sameCity = true; savePrefs(); }
        else if (key === 'all_cities') { st.sameCity = false; prefs.sameCity = false; savePrefs(); }
        else st.intent = st.intent === key ? null : (key || null);
        buildChips(); resetDeck();
    }
    function onCityChanged() {
        buildChips();
        resetDeck();
    }
    function setSearchPrefs(next) {
        let reload = false;
        if (typeof next.sameCity === 'boolean' && next.sameCity !== st.sameCity) {
            prefs.sameCity = next.sameCity;
            st.sameCity = next.sameCity;
            reload = true;
        }
        if (next.ageMode && next.ageMode !== prefs.ageMode) {
            prefs.ageMode = next.ageMode;
            reload = true;
        }
        if (typeof next.isHidden === 'boolean') {
            prefs.isHidden = next.isHidden;
        }
        if (typeof next.onlyWithBio === 'boolean' && next.onlyWithBio !== prefs.onlyWithBio) {
            prefs.onlyWithBio = next.onlyWithBio;
            reload = true;
        }
        savePrefs();
        buildChips();
        if (reload) resetDeck();
    }
    function getSearchPrefs() {
        return { ageMode: prefs.ageMode, sameCity: st.sameCity, isHidden: !!prefs.isHidden, onlyWithBio: !!prefs.onlyWithBio };
    }

    /* ---------- экран «Волны» ---------- */
    function openChat(username) {
        const url = 'https://t.me/' + encodeURIComponent(username);
        if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank');
    }
    function personCard(r) {
        const card = el('article', 'card');
        card.appendChild(avatar(r, 'card-ava', true));
        const body = el('div', 'card-body');
        const title = el('div', 'card-title');
        title.append(el('b', '', `${r.name}, ${r.age}`), el('span', 'card-city', r.city || ''));
        const more = el('button', 'card-more-btn');
        more.type = 'button';
        more.setAttribute('aria-label', 'Действия');
        more.innerHTML = MORE_ICON_SVG;
        more.addEventListener('click', () => openPersonMenu(r, true));
        title.appendChild(more);
        body.appendChild(title);
        card.appendChild(body);
        return { card, body };
    }
    function incomingCard(r, onDone) {
        const { card, body } = personCard(r);
        if (r.message) body.appendChild(el('p', 'w-msg', '«' + r.message + '»'));
        const btns = el('div', 'w-btns');
        const ok = el('button', 'w-btn ok', 'Ответить взаимностью');
        const no = el('button', 'w-btn', 'Отказать');
        ok.addEventListener('click', () => respond(r.wave_id, true, onDone));
        no.addEventListener('click', () => respond(r.wave_id, false, onDone));
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
    function renderWaves(mat) {
        const scr = $('screen-waves');
        const body = $('wavesBody'), s = st.status;
        body.innerHTML = '';
        if (!mat.length) {
            if (scr) scr.classList.add('is-empty');
            const wrap = el('div', 'notif-empty-state');
            const art = el('div', 'notif-empty-art');
            art.innerHTML = EMPTY_WAVES_SLOTS_SVG;
            const title = el('h3', 'notif-empty-title', 'Пока волн нет');
            const slotsInfo = el('div', 'waves-empty-slots', `Слоты свободны — ${s.used} из ${s.max}`);
            const desc = el('p', 'notif-empty-desc');
            desc.append(
                document.createTextNode('Здесь появятся люди, с которыми совпадут лайки.'),
                document.createElement('br'),
                document.createTextNode('Завершите волну — и слот освободится.')
            );
            const cta = el('button', 'notif-empty-cta', 'Найти людей в ленте');
            cta.type = 'button';
            cta.addEventListener('click', () => { TG.tap(); show(FEED); });
            wrap.append(art, title, slotsInfo, desc, cta);
            body.appendChild(wrap);
            return;
        }
        if (scr) scr.classList.remove('is-empty');
        body.appendChild(el('div', 'sec-title', `Активные волны · слоты ${s.used}/${s.max}`));
        body.appendChild(el('p', 'sec-note', 'Волна начинается, когда лайк взаимный, и занимает один слот у вас обоих. Завершите волну — слот освободится.'));
        mat.forEach((r) => body.appendChild(activeCard(r)));
        for (let i = mat.length; i < s.max; i++) body.appendChild(el('div', 'slot-empty', 'Свободный слот — ищите кого-нибудь в ленте'));
    }
    async function loadWaves(withDelay = false) {
        const waitMin = withDelay ? new Promise((r) => setTimeout(r, 420)) : Promise.resolve();
        if (!dbOn()) {
            await waitMin;
            markWavesSeen([]);
            renderStatus();
            renderWaves([]);
            return;
        }
        try {
            const [status, mat] = await Promise.all([Supa.rpc('wave_status'), Supa.rpc('my_matches'), waitMin]);
            if (Array.isArray(mat) && mat.length) await preloadPhotos(mat, 1500);
            st.status = status;
            markWavesSeen(mat);
            renderStatus();
            renderWaves(mat);
        } catch (e) {
            await waitMin;
            console.error('Waves error:', e);
            const scr = $('screen-waves');
            if (scr) scr.classList.remove('is-empty');
            const b = $('wavesBody'); b.innerHTML = '';
            b.appendChild(el('p', 'feed-empty', 'Не удалось загрузить' + dbg(e)));
        }
    }
    function openWaves() {
        TG.tap(); show(WAVES);
        const scr = $('screen-waves');
        if (scr) scr.classList.remove('is-empty');
        $('wavesBody').innerHTML = ''; $('wavesBody').appendChild(waveLoader('Загружаем волны…'));
        loadWaves(true);
    }
    async function respond(id, accept, onDone) {
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
        if (typeof onDone === 'function') onDone();
        if (step === WAVES) loadWaves();
        refreshStatus(true);
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
        if (n && n.kind === 'match' && step !== WAVES) {
            st.newWaves = Math.max(st.newWaves || 0, 1);
            renderStatus();
        }
        refreshStatus(n && (n.kind === 'match' || n.kind === 'ended'));
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
        if (prevIntent !== st.intent) { resetDeck(); return; }
        if (dbOn()) { refreshStatus(); askNotifyPermission(); startRealtime(); }
        if (!st.cur && !st.queue.length) { st.exhausted = false; loadQueue(); } else renderDeck();
    }
    function resetSession() {
        if (pendingPass) {
            clearTimeout(pendingPass.timer);
            pendingPass = null;
            hideUndoBtn();
        }
        clearTimeout(swipeHintTimer);
        localBlocked = [];
        Object.assign(prefs, { ageMode: 'peer', sameCity: false, isHidden: false, onlyWithBio: false });
        st.queue = []; st.cur = null; st.intent = null; st.sameCity = false; st.lastZone = null;
        st.seenInCity = 0; st.autoExpandedFromCity = false; st.cityExhaustedAfterSwipe = false;
        st.loading = false; st.busy = false; st.exhausted = false; st.err = ''; st.gen++;
        st.nameSent = false; st.rtStarted = false;
        st.status = { used: 0, max: 3, incoming: 0, unread: 0 };
        st.newWaves = 0; st.matchesSynced = false; st.lastSyncedUsed = -1;
        seenWaves.clear();
        urlCache.clear();
        imgPreloads.clear();
        imgCache.clear();
    }
    function init() {
        initToastSwipe();
        if ($('undoPassBtn')) $('undoPassBtn').addEventListener('click', (e) => { e.stopPropagation(); undoLastPass(); });
        window.addEventListener('pagehide', flushPendingPass);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flushPendingPass();
        });
        $('feedWaves').addEventListener('click', openWaves);
        $('slots').addEventListener('click', explainSlots);
        $('sheetSend').addEventListener('click', () => { const t = $('sheetText').value.trim(); closeSheet(); wave(t); });
        $('sheetCancel').addEventListener('click', closeSheet);
        if ($('sheetText')) $('sheetText').addEventListener('input', () => syncTextareaScrollable($('sheetText')));
        if ($('waveSheet')) {
            $('waveSheet').addEventListener('click', (e) => { if (e.target === $('waveSheet') && !$('waveSheet').classList.contains('is-closing')) closeSheet(); });
            initSheetSwipe($('waveSheet'), closeSheet);
        }
        if ($('personMenuCancel')) $('personMenuCancel').addEventListener('click', closePersonMenu);
        if ($('personMenuSheet')) {
            $('personMenuSheet').addEventListener('click', (e) => { if (e.target === $('personMenuSheet') && !$('personMenuSheet').classList.contains('is-closing')) closePersonMenu(); });
            initSheetSwipe($('personMenuSheet'), closePersonMenu);
        }
        if ($('personMenuReport')) $('personMenuReport').addEventListener('click', () => {
            const target = menuTarget;
            const fromWaves = menuFromWaves;
            closePersonMenu();
            if (target) openReportSheet(target, fromWaves);
        });
        if ($('personMenuBlock')) $('personMenuBlock').addEventListener('click', () => {
            const target = menuTarget;
            const fromWaves = menuFromWaves;
            closePersonMenu();
            if (target) blockPerson(target, fromWaves);
        });
        if ($('reportReasons')) $('reportReasons').addEventListener('click', (e) => {
            const b = e.target.closest('.report-reason');
            if (!b) return;
            TG.pick();
            reportReason = b.dataset.reason || 'other';
            $('reportReasons').querySelectorAll('.report-reason').forEach((x) => x.classList.toggle('selected', x === b));
        });
        if ($('reportComment')) $('reportComment').addEventListener('input', () => syncTextareaScrollable($('reportComment')));
        if ($('reportSendBtn')) $('reportSendBtn').addEventListener('click', submitReport);
        if ($('reportCancelBtn')) $('reportCancelBtn').addEventListener('click', closeReportSheet);
        if ($('reportSheet')) {
            $('reportSheet').addEventListener('click', (e) => { if (e.target === $('reportSheet') && !$('reportSheet').classList.contains('is-closing')) closeReportSheet(); });
            initSheetSwipe($('reportSheet'), closeReportSheet);
        }
        if ($('photoViewerClose')) $('photoViewerClose').addEventListener('click', closePhotoViewer);
        if ($('photoViewer')) {
            $('photoViewer').addEventListener('click', (e) => {
                if (e.target === $('photoViewer') || e.target === $('photoViewerStage')) closePhotoViewer();
            });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePhotoViewer(); });
            initPhotoViewerDrag();
        }
        if ($('doneAvatar')) {
            $('doneAvatar').style.cursor = 'pointer';
            $('doneAvatar').addEventListener('click', () => {
                const src = $('doneAvatar').src;
                if (src && !$('doneAvatar').hidden) {
                    const cap = [profile.name ? (profile.age ? `${profile.name}, ${profile.age}` : profile.name) : '', profile.city || ''].filter(Boolean).join(' · ');
                    openPhotoViewer(src, cap, $('doneAvatar'));
                }
            });
        }
        $('feedChips').addEventListener('click', onChip);
        setInterval(() => { if (dbOn() && isComplete() && document.visibilityState === 'visible') refreshStatus(); }, 30000);
    }
    init();
    return { open, openWaves, toast, refreshStatus, onCityChanged, setSearchPrefs, getSearchPrefs, unblockLocal, getLocalBlocked, resetSession, incomingCard, openPhotoViewer, preloadPhotos };
})();

// Если лента уже показана при загрузке (вход в приложение с готовым профилем) — запускаем её
if ($('screen-feed').classList.contains('active')) Feed.open();