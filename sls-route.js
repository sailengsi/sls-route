(function(field, factory, context) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        context[field] = factory();
    }
})("SlsRoute", function() {

    /**
     * SlsRoute类，用原生javascript的hash机制实现的简易路由操作
     * @class SlsRoute
     * @constructor
     * @author 赛冷思
     *
     * @example
     *     SlsRoute.init(["路由1","路由2",...],function(param){
     *         console.log("路由名称："+param.action);
     *         console.log("路由参数："+param.query);
     *     },function(){
     *         console.log("默认操作");
     *     });
     */
    var SlsRoute = function() {};

    SlsRoute.prototype = {

        constructor: SlsRoute,

        /**
         * 版本号
         * @property {String} version
         */
        // version: "1.0.0",
        /*
         * 此版本修复模糊匹配规则bug
         *     必须以注册的路由+"/"开头才可匹配成功
         *     而不能仅仅是以注册的路由开头就算匹配成功
         */
        version: "1.1.0",

        /**
         * 是否开启debug模式。true开启;false关闭
         * @property {Boolean} debug
         */
        debug: true,

        /**
         * 是否开启默认匹配路由,默认开启。
         * 模糊匹配规则:当前路由只要是以注册的路由开头就算匹配成功。
         * @property {Boolean} blur
         */
        blur: true,

        /**
         * 用户注册的路由
         * @property {Array} routes
         */
        routes: [],

        /*
         * 当前路由在注册的路由中时回调
         * @method changeRouteFn
         */
        changeRouteFn: function() {},

        /*
         * 当前路由不在注册的路由中时回调
         * @method defaultRouteFn
         */
        defaultRouteFn: function() {},

        /*
         * 打印日志
         * @method lg
         * @param  {All} data [打印数据类型]
         * @return {Object}      [当前路由对象]
         */
        lg: function(data) {
            this.debug && console.log(data);
            return this;
        },

        /**
         * 配置参数
         * @method config
         * @param  {Object} obj [配置参数]
         * @param  {Boolean} obj.blur [是否开启默认匹配路由,默认开启。]
         * @return {Object}     [当前路由对象]
         */
        config: function(obj) {
            this.blur = obj && obj.blur;
            return this;
        },

        /**
         * 初始化路由
         * @method init
         * @param  {Array} routes         注册的路由
         * @param  {callback} changeRouteFn  改变路由时的回调函数
         * @param  {callback} defaultRouteFn 匹配不到路由时的默认回调函数
         */
        init: function(routes, changeRouteFn, defaultRouteFn) {
            if (routes.constructor !== Array) {
                this.lg("init方法的第一个参数必须为数组。");
                return this;
            };
            this.routes = routes;
            this.changeRouteFn = changeRouteFn.constructor === Function ? changeRouteFn : null;
            this.defaultRouteFn = defaultRouteFn.constructor === Function ? defaultRouteFn : null;
            this.check();
        },

        /*
         * 注册路由
         * @method check
         */
        check: function() {
            //保存当前作用域
            var self = this;

            //注册hash事件
            window.addEventListener("hashchange", changeCheck);

            //默认先检测一下
            changeCheck();

            /*
             * 检测路由函数
             */
            function changeCheck() {
                //当前hash
                var hash = window.location.hash,

                    //路由名称截取的起始位置
                    start = 1,

                    //默认路由名称截取的结束位置
                    end = hash.length,

                    //hash总长度
                    hashLen = hash.length,

                    //默认当前路由名称
                    curRouteName = hash.substring(start, end),

                    //返回给用户的参数
                    curRouteParam = {
                        action: "",
                        query: {}
                    },

                    //匹配路由标记
                    flag = false;

                //处理参数    
                if (hash.indexOf("?") != -1) {
                    end = hash.indexOf("?");
                    curRouteName = hash.substring(start, end);

                    var curParamString = hash.substring(end + 1, hashLen);
                    if (curParamString) {
                        if (curParamString.indexOf("&") != -1) {
                            var curParamArr = curParamString.split("&");
                            var paramLen = curParamArr.length;
                            for (var i = 0; i < paramLen; i++) {
                                var tmp = curParamArr[i].split("=");
                                curRouteParam.query[tmp[0]] = tmp[1];
                            };
                        } else {
                            if (curParamString.indexOf("=") != -1) {
                                var tmp = curParamString.split("=");
                                curRouteParam.query[tmp[0]] = tmp[1];
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
                                    curRouteParam.query[k] = v;
                                }
                            }
                        }
                    };
                };

                curRouteParam.action = curRouteName;

                var routeLen = self.routes.length;
                for (var i = 0; i < routeLen; i++) {
                    if (self.blur && curRouteParam.action.indexOf(self.routes[i] + "/") == 0) {
                        self.changeRouteFn && self.changeRouteFn(curRouteParam);
                        flag = true;
                        break;
                    } else if (self.routes[i] === curRouteParam.action) {
                        self.changeRouteFn && self.changeRouteFn(curRouteParam);
                        flag = true;
                        break;
                    }
                };

                if (!flag) {
                    self.defaultRouteFn && self.defaultRouteFn();
                };
            }
        },
    };
    return new SlsRoute();
}, this);