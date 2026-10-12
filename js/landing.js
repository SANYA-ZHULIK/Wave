/* =========================================
   WAVE — лендинг + регистрация
========================================= */
const STORAGE_KEY = 'wave_profile';
const STEPS = ['landing', 'screen-name', 'screen-age', 'screen-gender', 'screen-done'];

const profile = { name: '', age: 22, gender: '', looking: '' };
let step = 0;

const $ = (id) => document.getElementById(id);
function setSync(ok, err) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    const len = (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData || '').length;
    const text = ok ? '☁ Профиль сохранён в облаке'
        : err ? 'Ошибка облака: ' + err
        : (dbOn() ? 'Связь с облаком…' : 'Нет данных Telegram — открыто не как Mini App');
    el.textContent = text + ' · v4 · initData ' + len;
}
const dbOn = () => typeof Supa !== 'undefined' && Supa.enabled();

/* ---------- storage (с try/catch: в приватном режиме может падать) ---------- */
function saveProfile() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (e) {}
}
function loadProfile() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
}

/* ---------- навигация ---------- */
function show(n) {
    step = n;
    STEPS.slice(1).forEach((id, i) => $(id).classList.toggle('active', i + 1 === n));
    // Кнопка «Назад» Telegram: на экранах регистрации (кроме финала)
    TG.back(n > 0 && n < STEPS.length - 1 ? () => show(n - 1) : null);
    if (n === 1) setTimeout(() => $('nameInput').focus(), 450);
}

function fail(input, errEl, msg) {
    if (input) {
        input.classList.add('error');
        input.addEventListener('input', () => input.classList.remove('error'), { once: true });
    }
    errEl.textContent = msg;
    TG.fail();
}

/* ---------- шаг 1: имя ---------- */
function submitName() {
    const input = $('nameInput');
    const name = input.value.trim().replace(/\s+/g, ' ');
    $('nameError').textContent = '';
    if (name.length < 2)  return fail(input, $('nameError'), 'Введите имя — минимум 2 символа');
    if (name.length > 20) return fail(input, $('nameError'), 'Имя слишком длинное — максимум 20 символов');
    profile.name = name;
    TG.tap();
    show(2);
}

/* ---------- шаг 2: возраст ---------- */
function setAge(delta) {
    profile.age = Math.min(99, Math.max(18, profile.age + delta));
    $('ageDisplay').textContent = profile.age;
    TG.pick();
}

/* ---------- шаг 3: пол и кого ищу ---------- */
function bindChips(groupId, key) {
    $(groupId).addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        profile[key] = chip.dataset.value;
        $(groupId).querySelectorAll('.chip').forEach((c) => c.classList.toggle('selected', c === chip));
        TG.pick();
    });
}

async function finish() {
    if (!profile.gender || !profile.looking) {
        return fail(null, $('genderError'), 'Выберите оба варианта, чтобы продолжить');
    }
    $('genderError').textContent = '';
    const btn = $('genderNext');
    btn.disabled = true;
    try {
        if (dbOn()) await Supa.saveProfile(profile);
        setSync(dbOn());
        saveProfile(); // локальная копия — для быстрого старта
        renderDone();
        TG.ok();
        show(4);
    } catch (e) {
        console.error('Supabase save error:', e);
        fail(null, $('genderError'), 'Не удалось сохранить профиль (' + (e.message || 'ошибка') + ')');
    } finally {
        btn.disabled = false;
    }
}

function renderDone() {
    $('doneTitle').textContent = `Привет, ${profile.name}!`;
}

/* Подставляет данные профиля в поля форм */
function applyProfile(p) {
    Object.assign(profile, p);
    $('nameInput').value = profile.name || '';
    $('ageDisplay').textContent = profile.age;
    [['genderChips', 'gender'], ['lookingChips', 'looking']].forEach(([id, key]) => {
        $(id).querySelectorAll('.chip').forEach((c) =>
            c.classList.toggle('selected', c.dataset.value === profile[key]));
    });
}

function editProfile() {
    applyProfile(profile);
    show(1);
}

/* ---------- init ---------- */
function init() {
    // Подставляем имя из Telegram
    const u = TG.user();
    if (u && u.first_name) $('nameInput').value = u.first_name.slice(0, 20);

    // Если профиль уже есть — сразу на финальный экран
    const saved = loadProfile();
    if (saved && saved.name) {
        applyProfile(saved);
        renderDone();
        setSync(false);
        show(4);
    }
    $('ageDisplay').textContent = profile.age;

    // Источник правды — БД: подтягиваем профиль оттуда
    if (dbOn()) {
        setSync(false);
        Supa.loadProfile().then(async (remote) => {
            if (remote) {
                applyProfile(remote);
                saveProfile();
                renderDone();
                setSync(true);
                if (step === 0) show(4);
            } else if (saved && saved.name) {
                // локальный профиль есть, а в облаке его нет — отправляем
                await Supa.saveProfile(profile);
                setSync(true);
            }
        }).catch((e) => {
            console.error('Supabase sync error:', e);
            setSync(false, e.message || 'ошибка');
        });
    }

    $('startButton').addEventListener('click', () => { TG.tap(); show(1); });
    $('nameNext').addEventListener('click', submitName);
    $('nameInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitName(); });
    $('ageMinus').addEventListener('click', () => setAge(-1));
    $('agePlus').addEventListener('click',  () => setAge(+1));
    $('ageNext').addEventListener('click',  () => { TG.tap(); show(3); });
    $('genderNext').addEventListener('click', finish);
    $('resetBtn').addEventListener('click', editProfile);

    bindChips('genderChips', 'gender');
    bindChips('lookingChips', 'looking');
}

init();