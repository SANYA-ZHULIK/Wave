/* Лёгкий клиент Supabase без SDK (fetch). Anon-ключ публичный — безопасность даёт RLS. */
const SUPA_URL = 'https://jutfmqseclffgyfchiqv.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dGZtcXNlY2xmZmd5ZmNoaXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Mjg0ODksImV4cCI6MjEwNzQwNDQ4OX0.yggbeiIyIHDgQ0zHXLNmk-8KcyKah0kFO4sy1bs8V5M';

const Supa = (() => {
    let session = null;   // { token, tg_id, exp }
    let pending = null;   // идущий запрос входа (чтобы не слать несколько одновременно)
    let rt = null;        // подписка realtime

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

    // Срок действия токена (мс). Токен живёт час — без обновления через час все запросы перестали бы проходить.
    const jwtExp = (t) => {
        try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; }
        catch (e) { return 0; }
    };

    async function login() {
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
        const j = await res.json();
        session = { ...j, exp: jwtExp(j.token) };
        if (rt) rt.client.realtime.setAuth(session.token);   // realtime тоже получает свежий токен
        return session;
    }
    async function auth() {
        if (session && session.exp - Date.now() > 120000) return session;   // обновляем за 2 минуты до конца
        if (!pending) pending = login().finally(() => { pending = null; });
        return pending;
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
            const res = await rest(`profiles?tg_id=eq.${s.tg_id}&select=name,age,gender,looking,city,intents,bio,photo_path,is_hidden,tg_username`);
            const rows = await res.json();
            return rows[0] || null;
        },
        // Загружает JPEG-аватарку в приватный bucket avatars/{tg_id}/avatar.jpg, возвращает путь
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
            return path;
        },
        // Временная ссылка на фото из приватного bucket (по умолчанию на 1 час)
        async signedUrl(path, expiresIn = 3600) {
            const s = await auth();
            let res;
            try {
                res = await fetch(`${SUPA_URL}/storage/v1/object/sign/avatars/${path}`, {
                    method: 'POST',
                    headers: { apikey: SUPA_ANON, Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expiresIn })
                });
            } catch (e) { throw new Error('хранилище недоступно (' + e.message + ')'); }
            if (!res.ok) { const t = await errText(res); throw new Error('storage ' + res.status + (t ? ': ' + t : '')); }
            const j = await res.json();
            return `${SUPA_URL}/storage/v1${j.signedURL}`;
        },
        // Пакетная генерация подписанных ссылок (1 запрос вместо N) — резко ускоряет загрузку ленты
        async signedUrls(paths, expiresIn = 3600) {
            const unique = [...new Set((paths || []).filter(Boolean))];
            if (!unique.length) return {};
            const s = await auth();
            const map = {};
            const norm = (u) => (u.startsWith('http') ? u : `${SUPA_URL}/storage/v1${u}`);
            try {
                const res = await fetch(`${SUPA_URL}/storage/v1/object/sign/avatars`, {
                    method: 'POST',
                    headers: { apikey: SUPA_ANON, Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expiresIn, paths: unique })
                });
                if (res.ok) {
                    const arr = await res.json();
                    if (Array.isArray(arr)) {
                        arr.forEach((item) => {
                            if (item && item.path && item.signedURL) {
                                map[item.path] = norm(item.signedURL);
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('Batch sign fallback:', e);
            }
            const restPaths = unique.filter((p) => !map[p]);
            if (restPaths.length) {
                await Promise.all(restPaths.map((p) =>
                    this.signedUrl(p, expiresIn).then((u) => { map[p] = u; }).catch(() => {})
                ));
            }
            return map;
        },
        // Вызов SQL-функции (RPC): подбор анкет, волны, слоты, мэтчи
        async rpc(fn, args = {}) {
            const res = await rest('rpc/' + fn, { method: 'POST', body: JSON.stringify(args) });
            return res.json();
        },
        async setUsername(username) {
            const s = await auth();
            await rest(`profiles?tg_id=eq.${s.tg_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ tg_username: username }) });
        },
        // Уведомления в реальном времени (Supabase Realtime). Если библиотека не загрузилась —
        // просто возвращает false, приложение продолжает работать с периодическим опросом.
        async subscribeNotifications(onInsert) {
            if (rt) return true;
            if (!window.supabase || !window.supabase.createClient) return false;
            const s = await auth();
            const client = window.supabase.createClient(SUPA_URL, SUPA_ANON, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });
            client.realtime.setAuth(s.token);
            const channel = client.channel('wave-notifications-' + s.tg_id)
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${s.tg_id}` },
                    (payload) => { try { onInsert(payload.new); } catch (e) { console.error('Realtime handler:', e); } })
                .subscribe((status, err) => {
                    if (status !== 'SUBSCRIBED') console.warn('Realtime:', status, err || '');
                });
            rt = { client, channel };
            return true;
        },
        // Справочник городов (публичный, читается по anon-ключу — вход не нужен)
        async cities() {
            const res = await fetch(`${SUPA_URL}/rest/v1/cities?select=name,region,population&order=population.desc.nullslast&limit=2000`,
                { headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` } });
            if (!res.ok) throw new Error('cities ' + res.status);
            return res.json();
        },
        async saveProfile(p) {
            const s = await auth();
            await rest('profiles?on_conflict=tg_id', {
                method: 'POST',
                headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
                body: JSON.stringify({
                    tg_id: s.tg_id, name: p.name, age: p.age, gender: p.gender, looking: p.looking,
                    city: p.city, intents: p.intents, bio: p.bio || null, photo_path: p.photo_path || null, tg_username: p.tg_username || null,
                    updated_at: new Date().toISOString()
                })
            });
        },
        async resetPasses() {
            try {
                await this.rpc('reset_my_passes');
            } catch (e) {
                const s = await auth();
                await rest(`passes?user_id=eq.${s.tg_id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }).catch(() => {});
            }
        },
        async setHidden(isHidden) {
            const s = await auth();
            await rest(`profiles?tg_id=eq.${s.tg_id}`, {
                method: 'PATCH',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({ is_hidden: !!isHidden, updated_at: new Date().toISOString() })
            }).catch(() => {});
        },
        async blockUser(targetId) {
            await this.rpc('block_user', { p_target: targetId });
        },
        async unblockUser(targetId) {
            await this.rpc('unblock_user', { p_target: targetId });
        },
        async getBlockedUsers() {
            return await this.rpc('my_blocked_users');
        },
        async reportUser(targetId, reason, details) {
            await this.rpc('report_user', {
                p_target: targetId,
                p_reason: reason || 'other',
                p_details: details || null
            });
        },
        async deleteAccount() {
            const s = await auth();
            // Удаляем аватар из приватного хранилища (если есть)
            try {
                await fetch(`${SUPA_URL}/storage/v1/object/avatars/${s.tg_id}/avatar.jpg`, {
                    method: 'DELETE',
                    headers: { apikey: SUPA_ANON, Authorization: `Bearer ${s.token}` }
                });
            } catch (e) {}
            try {
                await this.rpc('delete_my_account');
            } catch (e) {
                // Фолбэк, если RPC ещё не создана
                await rest(`profiles?tg_id=eq.${s.tg_id}`, {
                    method: 'DELETE',
                    headers: { Prefer: 'return=minimal' }
                });
            }
            if (rt && rt.client) {
                try { rt.client.removeChannel(rt.channel); } catch (e) {}
                rt = null;
            }
            session = null;
        }
    };
})();