import gulp from 'gulp';
import gutil from 'gulp-util';
import browserify from 'browserify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import {exec} from 'child_process';

gulp.task('build', () => {
    return browserify({
            entries: './frontend/react/main.jsx',
            extensions: ['.jsx'],
            debug: true
        })
        .transform('babelify', {
            presets: ['es2015', 'react'],
            plugins: ['transform-decorators-legacy', 'transform-class-properties']
        })
        .bundle()
        .on('error', function(err){
            gutil.log(gutil.colors.red.bold('[browserify error]'));
            gutil.log(err.message);
            this.emit('end');
        })
        .pipe(source('./main/static/js/bundle.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('./frontend/**/*.jsx', ['build']);
});

gulp.task('serve', ['watch'], () => {
    var proc = exec('/home/aliestarten/Work/Env/scripts/bin/python /home/aliestarten/Work/Django/scripts/manage.py runserver');
    proc.stdout.on('data', function(data) {
        return process.stdout.write(data);
    });
    proc.stderr.on('data', function(data) {
        return process.stdout.write(data);
    });
});

gulp.task('default', ['serve']);