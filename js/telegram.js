if (
    window.Telegram &&
    window.Telegram.WebApp
) {

    const tg =
        window.Telegram.WebApp;


    tg.ready();

    tg.expand();


    /*
       Устанавливаем цвет
       верхней панели Telegram
    */

    if (tg.setHeaderColor) {

        tg.setHeaderColor(
            '#12051f'
        );

    }


    if (tg.setBackgroundColor) {

        tg.setBackgroundColor(
            '#12051f'
        );

    }

}