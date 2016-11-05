//所有需要操作的信息都装到这个对象里边，方便管理
var fisSource = {

    //压缩js和css
    uglify: {
        //压缩开关,为true时才执行压缩
        flag: false,
        //需要压缩的js目录
        js: [
            'static/js/**.js'
        ],
        //需要压缩的css目录
        css: [

        ]
    },

    //打包
    pack: {
        //打包开关
        flag: false,

        /**
         * [content pack resource]
         * @type    {Object}
         * @key     {string}            [打包后存放地方]
         * @value   {array or string}   [需要打包的资源]
         */
        content: {
            '': [

            ]
        }
    }
}

//压缩
var uglifyFlag = fisSource.uglify.flag;
if (uglifyFlag) {
    var uglifyJs = fisSource.uglify.js;
    var uglifyCss = fisSource.uglify.css;

    for (var i = 0; i < uglifyJs.length; i++) {
        fis.match(uglifyJs[i], {
            optimizer: fis.plugin('uglify-js'),
        });
    }

    for (var i = 0; i < uglifyCss.length; i++) {
        fis.match(uglifyCss[i], {
            optimizer: fis.plugin('clean-css'),
        });
    }
}


//打包
var packFlag = fisSource.pack.flag;
if (packFlag) {
    var packs = fisSource.pack.content;
    fis.config.set('pack', packs);
}


fis.match("{package.json,node_modules/**,components/**}", {
    release: false
});


/**
 * 使用babel编译jsx,es
 */
/*fis.match('js/**.{jsx,es}', {
    parser: fis.plugin('babel-5.x'),
    rExt: '.js',
});*/


/**
 * 使用typescript编译ts
 * @type {[type]}
 */
/*fis.match('js/**.ts', {
    parser: fis.plugin('typescript'),
    rExt: '.js'
});*/


fis.match('*.less', {
    // fis-parser-less 插件进行解析
    parser: fis.plugin('less'),
    // .less 文件后缀构建后被改成 .css 文件
    rExt: '.css'
});


//设置html引入资源路径保持相对路径
fis.hook("relative");

//js,css合并后，在发布之后的html文件里，自动引入合并之后的文件
fis.match('::packager', {
    postpackager: fis.plugin('loader', {}),
});

fis.match("**", {
    relative: true,
    deploy: [
        fis.plugin('skip-packed', {
            // 配置项
        }),

        fis.plugin('local-deliver', {
            to: '../release'
        })
    ]
});