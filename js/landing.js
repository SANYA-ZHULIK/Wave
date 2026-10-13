/* =========================================
   WAVE — лендинг + регистрация
========================================= */
// Отладка (технический статус облака и тексты ошибок на экране).
// Скрыта от пользователей. Включить/выключить: 5 быстрых нажатий на логотип WAVE
// (или на приветствие «Привет, …» на финальном экране). Настройка запоминается.
let DEBUG = false;
try { DEBUG = localStorage.getItem('wave_debug') === '1'; } catch (e) {}

const STORAGE_KEY = 'wave_profile';
const STEPS = ['landing', 'screen-name', 'screen-age', 'screen-gender', 'screen-city',
               'screen-intents', 'screen-photo', 'screen-bio', 'screen-done'];
const FORM_STEPS = 7, DONE = 8, MAX_INTENTS = 5;

const INTENTS = {
    relationship: 'Отношения', friendship: 'Дружба', chat: 'Общение',
    gaming: 'Напарник для игр', walks: 'Прогулки', sport: 'Спорт',
    travel: 'Путешествия', events: 'Мероприятия', hobby: 'Хобби'
};
const CITIES = ['Минск', 'Гомель', 'Могилёв', 'Витебск', 'Гродно', 'Брест', 'Бобруйск', 'Барановичи',
    'Борисов', 'Пинск', 'Орша', 'Мозырь', 'Солигорск', 'Новополоцк', 'Лида', 'Молодечно', 'Полоцк',
    'Жлобин', 'Светлогорск', 'Речица', 'Слуцк', 'Жодино', 'Слоним', 'Кобрин', 'Волковыск',
    'Калинковичи', 'Сморгонь', 'Осиповичи', 'Новогрудок', 'Вилейка', 'Дзержинск', 'Заславль'];

const profile = { name: '', age: 22, gender: '', looking: '', city: '', intents: [], photo_url: '', photo_path: '', bio: '' };
let step = 0;

const $ = (id) => document.getElementById(id);
const dbOn = () => typeof Supa !== 'undefined' && Supa.enabled();

/* ---------- отладочный статус (виден только при DEBUG = true) ---------- */
function setSync(ok, err) {
    const el = $('syncStatus');
    if (!el) return;
    if (!DEBUG) { el.textContent = ''; return; }
    const len = (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData || '').length;
    el.textContent = (ok ? '☁ Профиль сохранён в облаке'
        : err ? 'Ошибка облака: ' + err
        : (typeof Supa === 'undefined' ? 'Файл js/supabase.js не загружен'
        : dbOn() ? 'Связь с облаком…' : 'Нет данных Telegram — открыто не как Mini App')) + ' · v7 · initData ' + len;
}

/* ---------- локальное хранилище ---------- */
function saveProfile() {
    // Временную (подписанную) ссылку локально не храним — она протухает; храним только путь
    const copy = { ...profile };
    if (copy.photo_url && !copy.photo_url.startsWith('data:')) copy.photo_url = '';
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(copy)); } catch (e) {}
}
function loadProfile() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; } }
const isComplete = () => !!(profile.name && profile.gender && profile.looking && profile.city && profile.intents.length);

/* ---------- навигация ---------- */
function buildDots() {
    document.querySelectorAll('.auth-screen').forEach((el) => {
        const box = el.querySelector('.auth-progress');
        if (!box) return;
        const i = STEPS.indexOf(el.id);
        box.innerHTML = '';
        for (let k = 1; k <= FORM_STEPS; k++) {
            const d = document.createElement('span');
            d.className = 'auth-dot' + (k === i ? ' active' : k < i ? ' done' : '');
            box.appendChild(d);
        }
    });
}

function show(n) {
    step = n;
    STEPS.slice(1).forEach((id, i) => $(id).classList.toggle('active', i + 1 === n));
    TG.back(n > 0 && n < DONE ? () => show(n - 1) : null);
    if (n === 1) setTimeout(() => $('nameInput').focus(), 450);
}

// Куда вести человека с уже сохранённым профилем
function route() {
    if (isComplete()) { renderDone(); show(DONE); }
    else show(profile.city ? 5 : 4);
}

function fail(input, errEl, msg) {
    if (input) {
        input.classList.add('error');
        input.addEventListener('input', () => input.classList.remove('error'), { once: true });
    }
    errEl.textContent = msg;
    TG.fail();
}
const clearErr = (id) => { $(id).textContent = ''; };

/* ---------- 1. имя ---------- */
function submitName() {
    const input = $('nameInput');
    const name = input.value.trim().replace(/\s+/g, ' ');
    clearErr('nameError');
    if (name.length < 2)  return fail(input, $('nameError'), 'Введите имя — минимум 2 символа');
    if (name.length > 20) return fail(input, $('nameError'), 'Имя слишком длинное — максимум 20 символов');
    profile.name = name; TG.tap(); show(2);
}

/* ---------- 2. возраст (колесо как в iPhone) ---------- */
const AGE_MIN = 18, AGE_MAX = 99, ITEM_H = 44;

function paintWheel(age) {
    const items = $('ageList').children;
    for (let i = 0; i < items.length; i++) items[i].classList.toggle('selected', AGE_MIN + i === age);
}
function setWheel(age) {
    profile.age = age;
    $('ageList').scrollTop = (age - AGE_MIN) * ITEM_H;
    paintWheel(age);
}
function buildAgeWheel() {
    const list = $('ageList');
    let html = '';
    for (let a = AGE_MIN; a <= AGE_MAX; a++) html += `<div class="wheel-item">${a}</div>`;
    list.innerHTML = html;
    list.addEventListener('scroll', () => {
        const idx = Math.min(AGE_MAX - AGE_MIN, Math.max(0, Math.round(list.scrollTop / ITEM_H)));
        const age = AGE_MIN + idx;
        if (age !== profile.age) { profile.age = age; paintWheel(age); TG.pick(); }
    }, { passive: true });
    list.addEventListener('click', (e) => {
        const i = Array.prototype.indexOf.call(list.children, e.target.closest('.wheel-item'));
        if (i >= 0) list.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
    });
    setWheel(profile.age);
}

/* ---------- 3. пол ---------- */
function bindChips(groupId, key) {
    $(groupId).addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        profile[key] = chip.dataset.value;
        $(groupId).querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c === chip));
        TG.pick();
    });
}
function submitGender() {
    if (!profile.gender || !profile.looking) return fail(null, $('genderError'), 'Выберите оба варианта, чтобы продолжить');
    clearErr('genderError'); TG.tap(); show(4);
}

/* ---------- 4. город ---------- */
function renderCities() {
    const q = $('cityInput').value.trim().toLowerCase();
    $('cityList').innerHTML = CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6)
        .map((c) => `<button type="button" class="city-item" data-city="${c}">${c}</button>`).join('');
}
function submitCity() {
    const input = $('cityInput');
    const v = input.value.trim().replace(/\s+/g, ' ');
    clearErr('cityError');
    if (v.length < 2) return fail(input, $('cityError'), 'Укажите город — минимум 2 символа');
    profile.city = v; TG.tap(); show(5);
}

/* ---------- 5. что ищете ---------- */
function paintIntents() {
    $('intentChips').querySelectorAll('.chip').forEach((c) =>
        c.classList.toggle('selected', profile.intents.includes(c.dataset.value)));
}
function toggleIntent(key) {
    const i = profile.intents.indexOf(key);
    clearErr('intentError');
    if (i >= 0) profile.intents.splice(i, 1);
    else if (profile.intents.length >= MAX_INTENTS) return fail(null, $('intentError'), 'Можно выбрать не больше ' + MAX_INTENTS);
    else profile.intents.push(key);
    paintIntents(); TG.pick();
}
function submitIntents() {
    if (!profile.intents.length) return fail(null, $('intentError'), 'Выберите хотя бы один вариант');
    TG.tap(); show(6);
}

/* ---------- 6. фото ---------- */
async function toSquareJpeg(file, size = 512) {
    let img;
    try { img = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) {
        img = await new Promise((res, rej) => {
            const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file);
        });
    }
    const w = img.width, h = img.height, s = Math.min(w, h);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    c.getContext('2d').drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL('image/jpeg', 0.85);
}
function paintPhoto() {
    const has = !!profile.photo_url;
    $('avatarImg').hidden = !has;
    $('avatarPlus').hidden = has;
    if (has) $('avatarImg').src = profile.photo_url;
    $('photoNext').textContent = has ? 'Далее' : 'Пропустить';
}
async function onPhotoChosen(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    clearErr('photoError');
    try { profile.photo_url = await toSquareJpeg(file); paintPhoto(); TG.pick(); }
    catch (err) { fail(null, $('photoError'), 'Не удалось открыть фото. Попробуйте другое'); }
}

/* ---------- 7. описание ---------- */
function onBioInput() {
    const v = $('bioInput').value;
    $('bioCount').textContent = v.length;
    $('bioNext').textContent = v.trim() ? 'Создать профиль' : 'Пропустить';
}

/* ---------- сохранение ---------- */
async function pushRemote() {
    if (profile.photo_url.startsWith('data:')) {
        const blob = await (await fetch(profile.photo_url)).blob();
        profile.photo_path = await Supa.uploadAvatar(blob);
        profile.photo_url = '';
    }
    await Supa.saveProfile(profile);
    await refreshPhoto();
}

// Фото лежит в приватном bucket: получаем временную ссылку по сохранённому пути
async function refreshPhoto() {
    if (!profile.photo_path || profile.photo_url || !dbOn()) return;
    try {
        profile.photo_url = await Supa.signedUrl(profile.photo_path);
        paintPhoto(); renderDone();
    } catch (e) { console.error('Photo error:', e); }
}

async function finish() {
    profile.bio = $('bioInput').value.trim();
    const btn = $('bioNext');
    clearErr('bioError');
    btn.disabled = true;
    try {
        if (dbOn()) await pushRemote();
        saveProfile();
        renderDone();
        setSync(dbOn());
        TG.ok();
        show(DONE);
    } catch (e) {
        console.error('Save error:', e);
        fail(null, $('bioError'), 'Не удалось сохранить профиль. Проверьте интернет и попробуйте ещё раз' + (DEBUG ? ' (' + e.message + ')' : ''));
    } finally { btn.disabled = false; }
}

/* ---------- финальный экран ---------- */
function renderDone() {
    $('doneTitle').textContent = `Привет, ${profile.name}!`;
    $('doneMeta').textContent = [profile.city, profile.age].filter(Boolean).join(' · ');
    const has = !!profile.photo_url;
    $('doneAvatar').hidden = !has;
    $('doneEmoji').hidden = has;
    if (has) $('doneAvatar').src = profile.photo_url;
    $('doneIntents').innerHTML = '';
    profile.intents.forEach((k) => {
        const t = document.createElement('span');
        t.className = 'tag'; t.textContent = INTENTS[k] || k;
        $('doneIntents').appendChild(t);
    });
    $('doneBio').textContent = profile.bio || '';
}

/* ---------- профиль <-> форма ---------- */
function applyProfile(p) {
    Object.assign(profile, {
        name: p.name || '', age: p.age || 22, gender: p.gender || '', looking: p.looking || '',
        city: p.city || '', intents: Array.isArray(p.intents) ? p.intents : [],
        photo_path: p.photo_path || '',
        photo_url: (p.photo_url || '').startsWith('data:') ? p.photo_url : '', bio: p.bio || ''
    });
    $('nameInput').value = profile.name;
    setWheel(profile.age);
    [['genderChips', 'gender'], ['lookingChips', 'looking']].forEach(([id, key]) =>
        $(id).querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c.dataset.value === profile[key])));
    $('cityInput').value = profile.city;
    $('bioInput').value = profile.bio;
    onBioInput(); paintIntents(); paintPhoto();

    // 💡 ЕСЛИ ЕСТЬ ПУТЬ К ФОТО, НО НЕТ ССЫЛКИ — СРАЗУ ЗАПРАШИВАЕМ ИЗ SUPABASE
    if (profile.photo_path && !profile.photo_url && dbOn()) {
        refreshPhoto();
    }
}
function editProfile() { 
    applyProfile(profile); 
    show(1); 
    // Если картинка была, но ссылка протухла/очистилась — обновляем
    if (profile.photo_path && !profile.photo_url) {
        refreshPhoto();
    }
}

/* ---------- init ---------- */
function bindDebugToggle() {
    const logo = document.querySelector('.logo-area h1');
    const paint = () => { if (logo) logo.textContent = DEBUG ? 'WAVE·dev' : 'WAVE'; };
    let taps = 0, timer;
    const onTap = () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1500);
        if (taps < 5) return;
        taps = 0; DEBUG = !DEBUG;
        try { localStorage.setItem('wave_debug', DEBUG ? '1' : '0'); } catch (e) {}
        paint(); setSync(false); TG.ok();
    };
    [logo, $('doneTitle')].forEach((el) => el && el.addEventListener('click', onTap));
    paint();
}

function init() {
    buildDots();
    bindDebugToggle();
    buildAgeWheel();
    $('intentChips').innerHTML = Object.entries(INTENTS)
        .map(([k, v]) => `<button type="button" class="chip sm" data-value="${k}">${v}</button>`).join('');
    renderCities();

    const u = TG.user();
    if (u && u.first_name) $('nameInput').value = u.first_name.slice(0, 20);

    // Кнопки подключаем первыми — работают, даже если что-то дальше не загрузится
    $('startButton').addEventListener('click', () => { TG.tap(); show(1); });
    $('nameNext').addEventListener('click', submitName);
    $('nameInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitName(); });
    $('ageNext').addEventListener('click', () => { TG.tap(); show(3); });
    bindChips('genderChips', 'gender');
    bindChips('lookingChips', 'looking');
    $('genderNext').addEventListener('click', submitGender);

    $('cityInput').addEventListener('input', renderCities);
    $('cityInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitCity(); });
    $('cityList').addEventListener('click', (e) => {
        const b = e.target.closest('.city-item');
        if (!b) return;
        $('cityInput').value = b.dataset.city; clearErr('cityError'); TG.pick(); renderCities();
    });
    $('cityNext').addEventListener('click', submitCity);

    $('intentChips').addEventListener('click', (e) => {
        const c = e.target.closest('.chip');
        if (c) toggleIntent(c.dataset.value);
    });
    $('intentsNext').addEventListener('click', submitIntents);

    $('avatarPick').addEventListener('click', () => $('photoFile').click());
    $('photoFile').addEventListener('change', onPhotoChosen);
    $('photoNext').addEventListener('click', () => { TG.tap(); show(7); });

    $('bioInput').addEventListener('input', onBioInput);
    $('bioNext').addEventListener('click', finish);
    $('resetBtn').addEventListener('click', editProfile);

    // Сохранённый локально профиль
    const saved = loadProfile();
    if (saved && saved.name) { applyProfile(saved); route(); setSync(false); refreshPhoto(); }

    // Источник правды — БД
    if (dbOn()) {
        Supa.loadProfile().then(async (remote) => {
            if (remote) {
                applyProfile(remote); saveProfile();
                if (step === 0) route();
                setSync(true);
                refreshPhoto();
            } else if (saved && isComplete()) {
                await pushRemote(); saveProfile(); setSync(true);
            }
        }).catch((e) => { console.error('Sync error:', e); setSync(false, e.message); });
    }
}

init();