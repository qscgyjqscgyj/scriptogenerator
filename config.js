module.exports = {
    main: 'app.js',  // имя главного файла
    path: './frontend/',  // путь до приложения
    bundle: 'scripts.min.js',         // имя скомпилированного пакета
    dest: './main/static/js/',  // путь до каталога со статикой соответствующего django-приложения
    watch: ['./frontend/**/*.js', './frontend/**/*.jsx']  // список glob-путей для слежения за изменениями (для автоматической перекомпиляции при разработке)
};