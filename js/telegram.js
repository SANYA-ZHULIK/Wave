/* Telegram WebApp bridge. Безопасно работает и в обычном браузере. */
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

if (tg) {
    tg.ready();
    tg.expand();

    // Синхронизируем цвета шапки и панелей под единую темную тему приложения (#0C061B),
    // чтобы нативные кнопки Telegram на iOS не заливались белым цветом.
    if (tg.setBackgroundColor) tg.setBackgroundColor('#0C061B');
    if (tg.setBottomBarColor)  tg.setBottomBarColor('#0C061B');
    if (tg.setHeaderColor) {
        try { tg.setHeaderColor('#0C061B'); } catch (e) { tg.setHeaderColor('bg_color'); }
    }

    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes(); // чтобы свайп не закрывал приложение
}

let haptics = true;
try { haptics = localStorage.getItem('wave_haptics') !== '0'; } catch (e) {}

const TG = {
    user: () => (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || null,
    hapticsOn: () => haptics,
    setHaptics: (on) => {
        haptics = !!on;
        try { localStorage.setItem('wave_haptics', haptics ? '1' : '0'); } catch (e) {}
    },
    tap:  () => haptics && tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred('light'),
    pick: () => haptics && tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged(),
    ok:   () => haptics && tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('success'),
    fail: () => haptics && tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('error'),
    back: (fn) => {
        if (!tg || !tg.BackButton) return;
        tg.BackButton.offClick(TG._fn);
        TG._fn = fn;
        if (fn) { tg.BackButton.onClick(fn); tg.BackButton.show(); }
        else tg.BackButton.hide();
    },
    _fn: null
};