## sls-route.js使用说明 ##
此路由采用UMD模式编写，所以不用多说,肯定是兼容node。

演示地址：[http://js.sailengsi.com/demos/route/index.html](http://js.sailengsi.com/demos/route/index.html)

使用npm方式安装：npm install sls-route

在浏览器端使用：
	
	<!-- 引入核心sls-route.js -->
    <script src="sls-route.js"></script>

	<a href="#home">#home</a>
	<a href="#home/index">#home/index</a>
	<a href="#home/param?id/1/name/test">#home/param?id/1/name/test</a>
	<a href="#view/param2?id=2&name=test2">#view/param2?id=2&name=test2</a>
	<a href="#list/param3?id=3">#list/param3?id=3</a>

	<script>
		SlsRoute.init(["home","list","view"],function(url){
            console.log("路由："+url.action);
            console.log("参数：",url.query);
        },function(){
            console.log("default");
            window.location.href="#home";
        });	
	</script>

# 解释一下上面代码的意思: #
### HTML中写了五个路由，都是#开头，这是必须的，因为本身就是利用javascript的hash机制实现的。 ###
	

前两个a标签的路由只是纯粹的路由。

而后三个a标签的路由中，则是路由加参数，而加参数的方式只需要用?隔开即可。

参数的书写方式有两种：

`#路由名称?key1/value1/key2/value2...`

`#路由名称?key1=value1&key2=value2...`

### js中使用全局对象SlsRoute来操作路由 ###

SlsRoute中的init方法，接收三个参数，

第一个参数是数组，数组的每一个元素就是每一个路由,不管你有多少路由，都是通过这个数组注册。
第二个参数是回调函数，此回调函数是路由改变时触发，并返回一个URL对象给你，对象的格式如下：

	    {
    		action："当前触发的路由名称",
    		query:{
    			参数1:值1,
    			参数2:值2,
    			...
    		},//当没有参数时，这是个空对象
    	}
有了此对象，你就可以根据不同的路由做不同的事情了。。。
第三个参数也是回调函数，此回调函数是当前触发的路由不在你注册的路由数组中时触发，你可以在这个回调中执行跳转到默认路由，或者其他操作。

也许你会发现，明明你只注册了home，可是上面的#home/index和#home/parma均匹配了，这是因为路由内部做了匹配处理。
处理规则如下：

只要当前触发的路由是以你注册的 路由+"/" 开头便触发，所以#home/index和#home/param都触发了,而#homes/index和#test/home/index不会触发。
如果你想关闭这个模糊匹配，使用精确匹配，只需要在注册路由前，调用config({blur:false})即可，blur为true开启模糊匹配,为false关闭模糊匹配。