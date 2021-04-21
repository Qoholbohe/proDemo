var gulp = require('gulp');
var sass = require('gulp-sass'); //sass的编译
var ejs = require('gulp-ejs');  //ejs模板
var connect = require('gulp-concat'); //文件合并
var clean = require('gulp-clean');  //清除文件
var rename = require('gulp-rename'); //文件重命名
var htmlmin = require('gulp-htmlmin'); //压缩html
var uglify = require('gulp-uglify'); //压缩js
var minifycss=require('gulp-minify-css');  //css压缩
var runSequence = require('run-sequence'); //执行顺序，避免
var browserSync = require('browser-sync').create();//实时加载
var useref = require('gulp-useref');  //gulp-useref 连接一定数量的CSS和JavaScript文件在一个单独的文件里，通过寻找一个注释
var imagemin = require('gulp-imagemin'); //图片压缩
var fs = require('fs');
var cache = require('gulp-cache') //只压缩修改的图片，没有修改的图片直接从缓存文件读取

var root = './app';    // 开发根目录
var staticDir=root+'/static'; //开发资源目录
var tplDir = root+'/templates';    //开发页面源码
var distDir = './dist';         // 生成目录
var sassDir='./sass'  //sass文件
var distHTML = distDir + "/html";  //发布页面目录
var distStaticDir = distDir + '/static';  // 发布静态资源压缩目录
var distStaticAll=distDir + '/static/uncompressed'  //静态资源目录

gulp.task('browserSync',function(){
    browserSync.init({
        port: 8080,
        server: {
            baseDir:'./',  // 设置服务器的根目录
             index:'/dist/html/index.html' // 指定默认打开的文件
        },
    })
})

gulp.task('gulp-ejs', function(){
    　　gulp.src(root+'/**/*.html')
    　　.pipe(data(function (file) {
    　　var filePath = file.path;
    　　　　// global.json 全局数据，页面中直接通过属性名调用
    　　　　return Object.assign(JSON.parse(fs.readFileSync(模版目录+ '/global.json')), {
    　　　　　　// local: 每个页面对应的数据，页面中通过 local.属性 调用
    　　　　　　local: JSON.parse(fs.readFileSync( path.join(path.dirname(filePath), path.basename(filePath, '.html') + '.json')))
    　　　　}) 
    　　}))
    　　.pipe(ejs().on('error', function(err) {
    　　　　gutil.log(err);
    　　　　this.emit('end');
    　　}))
    　　.pipe(gulp.dest(生成目录));
    });


//sass文件编译
gulp.task('sass', function () {
    gulp.src(sassDir+'/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(staticDir+"/css/views"))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('html', function () {
    gulp.src(root+'/**/*.html')
        .pipe(htmlmin({
            removeComments: true, //清除HTML注释
            collapseWhitespace: true, //压缩HTML
            minfyJS: true,//压缩JS
            minfyCss: true,//压缩CSS
        }))
        .pipe(gulp.dest(distHTML))
        .pipe(browserSync.reload({
            stream: true
        }))
        ;
});
gulp.task('css', function () {
    gulp.src(staticDir+'/css/**/*.css')
        .pipe(gulp.dest(distStaticAll+"/css"))
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss())   //执行压缩
        .pipe(gulp.dest(distStaticDir+"/css"));   //输出文件夹
});
gulp.task('js', function () {
    gulp.src(staticDir+'/js/**/*.js')
        .pipe(gulp.dest(distStaticAll+"/js"))
        .pipe(rename({suffix:'.min'}))   //rename压缩后的文件名
        .pipe(uglify())    //压缩
        .pipe(gulp.dest(distStaticDir+"/js"));  //输出
});
gulp.task('images',function(){
    gulp.src(staticDir+'/images/**/*')
    .pipe(gulp.dest(distStaticAll+'/images'))
     // .pipe(cache(imagemin({
    //     optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
    //     progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
    //     interlaced: true //类型：Boolean 默认：false 隔行扫描gif进行渲染
    //   })))
    .pipe(gulp.dest(distStaticDir+'/images'))
});

gulp.task('fonts', function () {
    return gulp.src(staticDir+'/fonts/**/*')
        .pipe(gulp.dest(distStaticDir + '/fonts'));
});

//删除生成目录下的所有文件
gulp.task('clean-all', function () {
    return gulp.src(distDir, {read: false})
        .pipe(clean());
});

//监听文件改变
gulp.task('watch',['browserSync','html','sass','css',"js"],function(){
    gulp.watch(sassDir+'/**/*.scss',['sass']);
    gulp.watch(tplDir+'**/*.html',['html'],browserSync.reload);
    gulp.watch(staticDir+'/css/**/*.css',['css'],browserSync.reload);
    gulp.watch(staticDir+'/js/**/*.js',['js'],browserSync.reload);
})

gulp.task('default', function (callback) {
    runSequence([
        'clean-all',
        'sass',
        'html',
        'css',
        'js',
        'images',
        'fonts'
       ],
       callback
    );
});