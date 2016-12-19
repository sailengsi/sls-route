(function(field, factory, context) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        context[field] = factory();
    }
})("SlsRoute", function() {

    function lg(msg, type) {
        if (type) {
            var err = new Error(msg);
            console.error(err);
        } else {
            this.config.debug && console.log(msg);
        }
    }


    /**
     * 组装参数
     */
    function getQuery(curParamString) {
        var query = {};
        if (curParamString.indexOf("&") != -1) {
            var curParamArr = curParamString.split("&");
            var paramLen = curParamArr.length;
            for (var i = 0; i < paramLen; i++) {
                var tmp = curParamArr[i].split("=");
                query[tmp[0]] = tmp[1];
            };
        } else {
            if (curParamString.indexOf("=") != -1) {
                var tmp = curParamString.split("=");
                query[tmp[0]] = tmp[1];
            } else {
                var curParamArr = curParamString.split("/");
                for (var i = 0; i < curParamArr.length; i++) {
                    var k, v;
                    if (i % 2 === 0) {
                        k = curParamArr[i];
                    }
                    if (i % 2 === 1) {
                        v = curParamArr[i];
                    }
                    query[k] = v;
                }
            }
        }

        return query;
    }


    function getRouteInfo(hash) {
        var config = this.config,
            routeName = '',
            query = {};

        if (hash) {
            if (hash.indexOf(config.hash) != -1) {
                var start = config.hash.length,
                    end = hash.length,
                    hashLen = hash.length;

                var startParamIndex = hash.indexOf('?');
                if (startParamIndex != -1) {
                    var end = startParamIndex;

                    var curParamString = hash.substring(startParamIndex + 1, hashLen);

                    query = getQuery(curParamString);
                }
                routeName = hash.substring(start, end);
            } else {
                lg('请确保使用的hash定界符和配置的一致。', true);
            }
        }
        return {
            action: routeName,
            query: query
        }
    }


    /**
     * 将当前连接拆分成纯url和hash，组装成对象返回
     * @return {[Object]} [当前连接纯url和hash]
     */
    function getUrlAndHash() {
        var config = this.config;

        var url = window.location.href,
            hash = '',
            hashIndex = url.indexOf(config.hash);

        if (hashIndex != -1) {
            var hash = url.substring(hashIndex);
            var url = url.substring(0, hashIndex);
        } else {
            // lg('没有在你的url中找到hash定界符："' + config.hash + '"。', true);
            return false;
        }

        return {
            url: url,
            hash: hash
        };
    }

    /*k
     * 检测路由函数
     */
    function changeCheck() {

        //获取当前连接的纯url和hash两部分
        var urls = getUrlAndHash.call(this);

        var routeInfo = getRouteInfo.call(this, urls.hash);

        var routeLen = this.routes.length,
            flag = false;
        for (var i = 0; i < routeLen; i++) {
            if (this.config.blur && routeInfo.action.indexOf(this.routes[i] + "/") == 0) {
                this.changeRouteFn && this.changeRouteFn.call(this, routeInfo);
                flag = true;
                break;
            } else if (this.routes[i] === routeInfo.action) {
                this.changeRouteFn && this.changeRouteFn.call(this, routeInfo);
                flag = true;
                break;
            }
        };

        if (!flag) {
            this.defaultRouteFn && this.defaultRouteFn.call(this);
        };
    }



    /**
     * SlsRoute类，用原生javascript的hash机制实现的简易路由操作
     * @class SlsRoute
     * @constructor
     * @author 赛冷思
     */
    var SlsRoute = function(options) {
        if (options.constructor === Object) {
            if (Array.isArray(options.routes) === false) {
                lg("参数对象必须包含route属性，且值为数组。", true);
                return this;
            };

            /**
             * 额外配置信息
             * @type {Object}
             */
            this.config = {
                debug: true,
                blur: false,
                hash: '#',
                activeClass: 'sls-route-active',
                startParam: '?',
                param: '&',
                keyValueSplit: '='
            };

            /**
             * 用户注册的路由
             * @property {Array} routes
             */
            this.routes = options.routes;

            /*
             * 当前路由不在注册的路由中时回调
             * @method defaultRouteFn
             */
            if (options.defaultRouteFn != undefined && options.defaultRouteFn.constructor === Function) {
                this.defaultRouteFn = options.defaultRouteFn;
            }

            /*
             * 当前路由在注册的路由中时回调
             * @method changeRouteFn
             */
            if (options.changeRouteFn != undefined && options.changeRouteFn.constructor === Function) {
                this.changeRouteFn = options.changeRouteFn;
            }

            /**
             * 是否开启模糊匹配路由,默认不开启。
             * 模糊匹配规则:当前路由只要是以注册的路由开头就算匹配成功。
             * @property {Boolean} blur
             */
            this.config.blur = options.blur != undefined && options.blur.constructor === Boolean ? options.blur : false;


            /**
             * 是否开启debug模式。true开启;false关闭
             * @property {Boolean} debug
             */
            this.config.debug = options.debug != undefined && options.debug.constructor === Boolean ? options.debug : false;


            /**
             * hash定界符，必须以#开头
             * @property {String} hash
             */
            this.config.hash = options.hash != undefined && options.hash.constructor === String ? options.hash : '#';


            //初始化检测
            this.check();

        } else {
            lg("实例化时参数必须为对象。", true);
        }

    };

    SlsRoute.prototype = {

        constructor: SlsRoute,

        /**
         * 版本号
         * @property {String} version
         */
        version: "1.0.0",

        /*
         * 注册路由
         * @method check
         */
        check: function() {
            //保存当前作用域
            var self = this;

            //默认先检测一下
            changeCheck.call(self);

            //注册hash事件
            window.addEventListener("hashchange", changeCheck.bind(self));

            return this;
        },


        /**
         * hash跳转
         * @param  {string} to    需要跳转的路由
         * @param  {object} param 需要带的参数
         */
        go: function(to, param) {
            var urls = getUrlAndHash.call(this);
            var url = '';
            if (to && typeof to === 'string') {
                url = this.config.hash + to;
            }

            var paramStr = '';
            if (param && typeof param === 'object') {
                var tempArr = [];
                for (var k in param) {
                    tempArr.push(k + '=' + param[k]);
                }
                paramStr = '?' + tempArr.join('&');
            }
            window.location.hash = url + paramStr;
        },


        /**
         * 重定向
         * @param  {[type]} to    [description]
         * @param  {[type]} param [description]
         */
        redirect: function(to, param) {
            this.go(to, param);
        }
    };
    return SlsRoute;
}, this);