/* Лёгкий клиент Supabase без SDK (fetch). Anon-ключ публичный — безопасность даёт RLS. */
const SUPA_URL = 'https://jutfmqseclffgyfchiqv.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dGZtcXNlY2xmZmd5ZmNoaXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Mjg0ODksImV4cCI6MjEwNzQwNDQ4OX0.yggbeiIyIHDgQ0zHXLNmk-8KcyKah0kFO4sy1bs8V5M';

const Supa = (() => {
    let session = null; // { token, tg_id }

    // В обычном браузере initData пустой — работаем только локально
    const initData = () => (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) || '';
    const enabled = () => !!initData();

    async function auth() {
        if (session) return session;
        const res = await fetch(`${SUPA_URL}/functions/v1/telegram-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` },
            body: JSON.stringify({ initData: initData() })
        });
        if (!res.ok) throw new Error('auth failed');
        session = await res.json();
        return session;
    }

    async function rest(path, opts = {}) {
        const s = await auth();
        const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
            ...opts,
            headers: { apikey: SUPA_ANON, Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
        });
        if (!res.ok) throw new Error('db error ' + res.status);
        return res;
    }

    return {
        enabled,
        async loadProfile() {
            const s = await auth();
            const res = await rest(`profiles?tg_id=eq.${s.tg_id}&select=name,age,gender,looking`);
            const rows = await res.json();
            return rows[0] || null;
        },
        async saveProfile(p) {
            const s = await auth();
            await rest('profiles?on_conflict=tg_id', {
                method: 'POST',
                headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
                body: JSON.stringify({
                    tg_id: s.tg_id, name: p.name, age: p.age, gender: p.gender, looking: p.looking,
                    updated_at: new Date().toISOString()
                })
            });
        }
    };
})();