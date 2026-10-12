/* Лёгкий клиент Supabase без SDK (fetch). Anon-ключ публичный — безопасность даёт RLS. */
const SUPA_URL = 'https://jutfmqseclffgyfchiqv.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dGZtcXNlY2xmZmd5ZmNoaXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Mjg0ODksImV4cCI6MjEwNzQwNDQ4OX0.yggbeiIyIHDgQ0zHXLNmk-8KcyKah0kFO4sy1bs8V5M';

const Supa = (() => {
    let session = null; // { token, tg_id }

    // В обычном браузере initData пустой — работаем только локально
    const initData = () => (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) || '';
    const enabled = () => !!initData();

    // Достаёт текст ошибки из ответа сервера
    async function errText(res) {
        try {
            const j = await res.json();
            return j.error || j.message || j.msg || '';
        } catch (e) { return ''; }
    }

    async function auth() {
        if (session) return session;
        let res;
        try {
            res = await fetch(`${SUPA_URL}/functions/v1/telegram-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` },
                body: JSON.stringify({ initData: initData() })
            });
        } catch (e) {
            throw new Error('функция входа недоступна (' + e.message + ')');
        }
        if (!res.ok) {
            const t = await errText(res);
            throw new Error('auth ' + res.status + (t ? ': ' + t : ''));
        }
        session = await res.json();
        return session;
    }

    async function rest(path, opts = {}) {
        const s = await auth();
        let res;
        try {
            res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
                ...opts,
                headers: { apikey: SUPA_ANON, Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
            });
        } catch (e) {
            throw new Error('база недоступна (' + e.message + ')');
        }
        if (!res.ok) {
            const t = await errText(res);
            throw new Error('db ' + res.status + (t ? ': ' + t : ''));
        }
        return res;
    }

    return {
        enabled,
        async loadProfile() {
            const s = await auth();
            const res = await rest(`profiles?tg_id=eq.${s.tg_id}&select=name,age,gender,looking,city,intents,bio,photo_url`);
            const rows = await res.json();
            return rows[0] || null;
        },
        // Загружает JPEG-аватарку в bucket avatars/{tg_id}/avatar.jpg, возвращает публичный URL
        async uploadAvatar(blob) {
            const s = await auth();
            const path = `${s.tg_id}/avatar.jpg`;
            let res;
            try {
                res = await fetch(`${SUPA_URL}/storage/v1/object/avatars/${path}`, {
                    method: 'POST',
                    headers: { apikey: SUPA_ANON, Authorization: `Bearer ${s.token}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
                    body: blob
                });
            } catch (e) { throw new Error('хранилище недоступно (' + e.message + ')'); }
            if (!res.ok) { const t = await errText(res); throw new Error('storage ' + res.status + (t ? ': ' + t : '')); }
            return `${SUPA_URL}/storage/v1/object/public/avatars/${path}?v=${Date.now()}`;
        },
        async saveProfile(p) {
            const s = await auth();
            await rest('profiles?on_conflict=tg_id', {
                method: 'POST',
                headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
                body: JSON.stringify({
                    tg_id: s.tg_id, name: p.name, age: p.age, gender: p.gender, looking: p.looking,
                    city: p.city, intents: p.intents, bio: p.bio || null, photo_url: p.photo_url || null,
                    updated_at: new Date().toISOString()
                })
            });
        }
    };
})();