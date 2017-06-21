const gulp = require('gulp'),
    rename = require('gulp-rename'), //重命名
    rev = require('gulp-rev'), //对文件名加MD5后缀
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'), //js压缩
    del = require('del'), //删除文件插件
    named = require('vinyl-named'),
    combiner = require('stream-combiner2');

const paths = { static: ["./VJ.*.js", "!./VJ.view.extend.js", "!./VJ.min.js"], dest: './', destfile: ["./VJ.js", "./VJ.min.js"] };
gulp.task('clean', function(cb) {
    return del(paths.destfile, cb);
});
gulp.task('static', ['clean'], function(cb) {
    cb.force = true;
    const combined = combiner.obj([
        gulp.src(paths.static),
        concat("./VJ.js", { newLine: '' }),
        gulp.dest(paths.dest),
        rename({ extname: ".min.js" }),
        babel({}), //{   presets: ['es2015', 'stage-0'] },
        uglify(),
        gulp.dest(paths.dest),
        notify({ message: 'VJ.min.js 同步生成' })
    ]);

    // any errors in the above streams will get caught
    // by this listener, instead of being thrown:
    combined.on('error', console.error.bind(console));
    return combined;
});
gulp.task('common-js', function(cb) {
    cb.force = true;
    const combined = combiner.obj([
        gulp.src(paths.static),
        concat("VJ.js", { newLine: ';;' }),
        named(),
        rev(),
        rename({ suffi: '.min' }),
        rev.manifest({
            path: 'rev/rev-manifest-common.json',
            merge: true
        }),
        gulp.dest(paths.dest),
        notify({ message: 'VJ.min.map 同步生成成功' })
    ]);
    combined.on('error', console.error.bind(console));
    return combined;
});
gulp.task('default', ['static'], function(cb) {
    var watcher = gulp.watch(paths.static, ['static']);
    watcher.on('error', e => {
        console.log(e.stack);
        notify({ message: "VJ.min.js 同步生成失败:" + e.message })
    });
});