//命令注册变量
if (!window.top.VJ) {
	window.top.VJ = {};
}
VJ = window.top.VJ;
(function(V,$){
	//常用基本操作
	{		
		V.isValid = function (data) {
			if (typeof (data) != "undefined" && data != null && data != 'null' && !(data === '')) {
				return true;
			} else {
				return false;
			}
		};
		V.getValue = function (data, defaultData) {
			return V.isValid(data) ? data : defaultData;
		};
		V.format = function(s,o){
			var reg = /<%=[^(%>)]+%>/gi;
			return s.replace(reg,function(word){
				var prop = word.replace(/<%=/g,'').replace(/%>/g,'');
				if(V.isValid(o[prop])){
					return o[prop];
				}else{
					return "";
				}
			});
		};
		//数组处理
		V.isArray = function (obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		};
		V.each = function(data,func){
			var _ = this;
			var index = 0;
			data = Array.prototype.slice.call(data, 0);
			V.whileC(function(){return data.shift();},func);
		};
		V.once = function(func,timeout){
			timeout = timeout || 1;
			if(func.timeoutID){
				window.clearTimeout(func.timeoutID);
			}
			func.timeoutID = window.setTimeout(function(){V.tryC(function(){func();})},timeout);
		};
		V.forC = function(data,func,finalf,isSync){
			var ret = [];
			for(var i in data){
				ret.push({key:i,value:data[i]});
			}
			V.whileC(function(){return ret.shift();},function(v){if(func){func(v.key,v.value);}},finalf,isSync);
		}		
		V.forC2 = function(data,func,finalf,isSync){
			var ret = [];
			for(var i in data){
				ret.push({key:i,value:data[i]});
			}
			V.whileC(function(){return ret.shift();},function(v,next){if(func){V.tryC(function(){func(v.key,v.value);});if(next){next();}}},finalf,isSync);
		}
		//while 方法要求 四个参数 exp 给出需要处理的值，func进行处理，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的但是不保证前后两次调用是顺序的只能保证是异步的 第四个参数如果为真那么就是同步执行
		V.whileC = function(exp,func,finalf,isSync){
			var _ = this;
			var _func = null;
			if(isSync){
				_func = function(val){
					if(val){					
						V.tryC(function(){func(val);});
						_func(exp());
					} else if(finalf){finalf()};
				};
			} else {				
				_func = function(val){
					if(val){
						window.setTimeout(function(){
							V.tryC(function(){func(val);});
							_func(exp());
						},1);
					} else if(finalf){finalf()};
				};
			}
			_func(exp());
		};
		//while2 方法要求 四个参数 exp 给出需要处理的值，func进行处理，同时当处理完成是 调用 第二个参数执行next方法，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的而且保证前后两次调用是顺序的 第四个参数如果为真那么就是同步执行
		V.whileC2 = function(exp,func,finalf,isSync){
			var _ = this;
			var _func = null;
			if(isSync){
				_func = function(val){
					if(val){
						V.tryC(function(){
							func(val,function(){
								_func(exp());
							});
						});
					} else if(finalf){finalf()};
				};
			} else {
				_func = function(val){
					if(val){
						window.setTimeout(function(){
							V.tryC(function(){
								func(val,function(){
									_func(exp());
								});
							});
						},1);
					} else if(finalf){finalf()};
				};
			}			
			_func(exp());
		};
	}	
	//类处理
	{
		V.getType = function (x) {
			if (x == null) {
				return "null";
			}
			var t = typeof x;
			if (t != "object" && t!= 'Object') {
				return t;
			}
			if(V.isArray(x)){
				return 'Array';
			}
			var c = Object.prototype.toString.apply(x);
			c = c.substring(8, c.length - 1);
			if (c != "Object") {
				return c;
			}
			if (x.constructor == Object) {
				return c;
			}
			if (x.prototype && "classname" in x.prototype.constructor
					&& typeof x.prototype.constructor.classname == "string") {
				return x.constructor.prototype.classname;
			}
			return "ukObject";
		};
		//V.inherit.apply(_,parent,[……args])
		V.inherit = function(parent,args){
			//绕过了parent的构造函数，重新链接原型链条
			var _temp = (function(){
				var F = function(){};
				F.prototype = parent.prototype;
				F.prototype.isF = true;
				return new F();
			})();
			_temp.constructor = parent;
			if(!this.prototype){			
				//这里确认是实例
				//确定是打断了原型链 使得this的原型为Object		
				parent.apply(this,args);		
				//从新接驳原型链 使得原型链上的prototype都设置到最早的类的prototype上了
				if(!this.__proto__.isF){
					this.__proto__.constructor.prototype = _temp.__proto__.constructor.prototype;
				}	
				//son.prototype = _temp; //这里可以分层 但是会使得prototype实例变了又变 废弃
				this.__proto__ = _temp;
				//父类方法只能找到静态方法
				this.base = this.__proto__.constructor.prototype;
			} else {
				console.log('如果失败，需要配合子类构造函数中使用parent.apply(this,[***])');
				//这里确认是类定义
				this.prototype = _temp;
			}
		};
		V.create = function(type,args){
			return new function(){var _ = this;V.inherit.apply(_,[type,args]);}
		};
		V.create2 = function(type,args){
			var ret = '(new '+type+'(';
			if(V.isArray(args)){
				for(i in args){
					ret+='args['+i+'],'
				}
				if(args.length>0){
					ret = ret.substr(0,ret.length-1);
				}
			}
			return eval(ret+'))');
		};
		//用于数组，对象的深度合并功能。moveIndex属性用于设定移动至的位置，mergeIndex只用于合并数组中的第几个对象 需要进入reference
		//例如
		//var ret = V.merge({a:22,c:23},{a:34,b:33},{d:"2334",f:true,g:function(){alert("hahaha");}},{h:[1,2,3,4]});
		//var ret = V.merge({a:[{a:2},{b:3}]},{a:[{moveIndex:3,j:3},{k:4}],b:25});
		//var ret = V.merge({a:[{a:2},{b:3}]},{a:[{mergeIndex:3,j:3},{k:4}],b:25});
		V.merge = function () {
			var _clone = function (source) {
				switch (V.getType(source)) {
					case 'Object':
					case 'object':
						return _merge({}, source);
						break;
					case 'array':
					case 'Array':
						var aim = [];
						for (i in source) {
							aim.push(_clone(source[i]));
						}
						return aim;
					default:
						return source;
						break;
				}
			};
			var _merge = function (aim, source) {
				if (!(typeof (source) == 'object' && typeof (source.length) == 'undefined')) { return aim; }
				for (var i in source) {
					if (V.isValid(source[i])) {
						if (!V.isValid(aim[i])) {
							aim[i] = _clone(source[i]);
						} else {
							switch (V.getType(aim[i])) {
								case 'object':
								case 'Object':
									_merge(aim[i], source[i]);
									break;
								case 'Array':
									//处理数组
									var hasmergeIndex = false;
									for (var i3 = 0, k = source[i][i3]; i3 < source[i].length; i3++, k = source[i][i3]) {
										if (typeof (k.mergeIndex) == "number") {
											hasmergeIndex = true;
											if (aim[i].length < (i3 + 1)) {
												aim[i].push(k);
											} else {
												aim[i][i3] = _merge(aim[i][i3], k);
											}
										} else if (typeof (k.moveIndex) == "number") {
											hasmergeIndex = true;
											aim[i].splice(k.moveIndex, 0, k);
										}
									}
									if (!hasmergeIndex) {
										aim[i] = _clone(source[i]);
									}
									break;
								default:
									aim[i] = source[i];
									break;
							}
						}
					}
				}
				return aim;
			};
			var argu = arguments;
			if (argu.length < 2) { return argu[0] ? argu[0] : {} };
			var _ = {};
			for (var i2 = 0; i2 < argu.length; i2++)
				_ = _merge(_, argu[i2]);
			return _;
		};		
	}
	//自动判断获取userAgent状态
	{
		
		V.userAgent = {
			ie: false,
			firefox: false,
			chrome: false,
			safari: false,
			opera: false
		};
		var ua = navigator.userAgent.toLowerCase();
		var s;
		(s = ua.match(/msie ([\d]+)/)) ? V.userAgent.ie = s[1] :
		(s = ua.match(/firefox\/([\d.]+)/)) ? V.userAgent.firefox = s[1] :
		(s = ua.match(/chrome\/([\d.]+)/)) ? V.userAgent.chrome = s[1] :
		(s = ua.match(/opera.([\d.]+)/)) ? V.userAgent.opera = s[1] :
		(s = ua.match(/version\/([\d.]+).*safari/)) ? V.userAgent.safari = s[1] : 0;
		for (key in V.userAgent) { if (V.getValue(V.userAgent[key], false)) { V.userAgent.name = key; } }
		console.log("VJ.userAgent:" + V.userAgent.name);
		if (V.getValue(V.userAgent.ie, false)) {
			var ver = V.userAgent.ie;
			eval('VJ.userAgent.ie' + ver + ' = true;V.userAgent.name=\'ie' + ver + '\';');
		}
	}
	//Bug处理
	{
		V.isDebug = false;
		V.showException = function (name, e) {
			if (V.isDebug) {
				var content = name;
				if (V.isValid(e)) {
					content += ("\r\nname:" + e.name + "\r\nmessage:" + e.message + (e.stack ? ("\r\nstack:" + e.stack + "\r\nfile:" + e.fileName + "\r\nlineNumber:" + e.lineNumber) : (V.userAgent.ie ? ("\r\ndescription:" + e.description) : "")));
				}
				//V.alert('未捕获异常',content);
				//alert('未捕获异常:' + content);
				console.log('未捕获异常:'+content)
				//throw e;
			}
		};
		V.tryC = function (func) {
			try {
				return func();
			} catch (e) { V.showException('', e); }
		};
	}
	//DOM处理
	{
		/* 生成新元素
		*-- 参数1：tag 标签
		*-- 参数2：样式class
		*-- 参数3：标签内内容
		*-- 案例：V.newEl("div","divClass","我的div");
		*/
		V.newEl = function (tag, style, txt) {
			var elm = $(document.createElement(tag));
			if (txt != "") {
				elm.text(txt);
			}
			if (style != "") {
				elm.addClass(style);
			}
			return elm;
		};
		V.encHtml = function (html) {
			//20120328 白冰 只转换标点符号!    
			//return encodeURIComponent(V.getValue(html, '').replace(/\r\n/g, ''));
			console.log((V.getValue(html, '').replace(/\s/g, ' ')));
			return (V.getValue(html, '').replace(/\s/g, ' ').replace(/\r\n/g, '')).replace(new RegExp('~|!|@|#|\\$|%|\\^|;|\\*|\\(|\\)|_|\\+|\\{|\\}|\\||:|\"|\\?|`|\\-|=|\\[|\\]|\\\|;|\'|,|\\.|/|，|；', 'g'), function (a) { return encodeURIComponent(a); });
		};
		//对字符串进行解码
		V.decHtml = function (html) {
			return decodeURIComponent(V.getValue(html, ''));
		};
		V.setChecked = function (node, value) {
			function setCheckBox(node2, value) {
				$(node2).attr('checked', value);
				if (V.userAgent.ie6 || V.userAgent.ie7) {
					var chk = $(node2);
					if (V.isValid(chk.get(0)))
						chk.get(0).defaultChecked = value;
				}
			};
			if (node.length) {
				$(node).each(function (i, v) {
					setCheckBox(v, value);
				});
			} else {
				setCheckBox(node, value);
			}
		};
		V.maxlength = function () {
			$("textarea[maxlength]").unbind('change').change(function (event) {
				this.value = this.value.substring(0, $(this).attr("maxlength"));
				return;
				//先试试看
				var key;
				if ($.browser.msie) {//ie浏览器
					var key = event.keyCode;
				}
				else {//火狐浏览器
					key = event.which;
				}

				//all keys including return.
				if (key >= 33 || key == 13) {
					var maxLength = $(this).attr("maxlength");
					var length = this.value.length;
					if (length >= maxLength) {
						event.preventDefault();
					}
				}
			});
		};
		V.fill = function (node, data) {
			$(node.find('[data-options]')).each(function (i, v) {
				v = $(v);
				var option = V.merge({ formatter: function (val, v, data) { return val; } }, eval('[{' + v.attr('data-options') + '}]')[0]);
				var val = V.getValue(data[option.field], '');
				val = option.formatter.apply(v, [val, v, data]);
				if (V.isValid(val) || val === '') {
					if (V.isArray(val)) {
						if (v[0].tagName.toLowerCase() === 'select' && V.isValid(option.textfield)) {
							v.empty();
							$(val).each(function (i, v3) {
								v.append(V.newEl('option', '', V.getValue(v3[option.textfield], '')).attr('value',v3.value));
							});
						} else { val = val.join(';'); }
					}
					switch (v[0].tagName.toLowerCase()) {
						case 'input':
							if (v.attr('type') == 'checkbox') {
								V.setChecked(v,(val == true || val == 1 || val == "1") ? true : false);
							} else {
								v.val(val);
							}
							break;
						case 'textarea':
						case 'select':
							v.val(val);
							break;
						case 'img':
							v.attr('src',val);
							break;
						default:
							v.html(val);
							break;
					}
				}
			});
		};
		V.fillTo = function (sor, data, aim, func) {
			$(sor.find('[data-options]')).each(function (i, v) {
				V.tryC(function () {
					v = $(v);
					var node2 = func();
					aim.append(node2);
					var option = V.merge({ formatter: function (val, v, data) { return val; } }, eval('[{' + v.attr('data-options') + '}]')[0]);
					var val = V.getValue(data[option.field], '');
					val = option.formatter.apply(node2, [val, node2, data]);
					var css = V.getValue(option.cssClass, '').split(';');
					$(css).each(function (i, v) {
						if (v === '') { } else {
							node2.addClass(v);
						}
					});
					if (V.isValid(option.click)) {
						node2.click(function () {
							option.click.apply($(this), data);
						});
					}
					if (V.isValid(val)) {
						node2.html(val);
					}
				});
			});
		};
		//剪贴板
		V.getClipBoardText = function(e){
			var data = e.clipboardData || window.clipboardData;
			return data.getData('text');
		};
		V.setClipBoardText = function(e,val){
			if(e.clipboardData){
				e.clipboardData.setData('text/plain',val);
			} else if(window.clipboardData){
				window.clipboardData.setData('text',val);
			}
		};
	}
	//注册默认配置
	{
		V._settings = {};
		V._exSettings = {};
		//设置默认配置
		V.getSettings=function(key,data){
			if(!V.isValid(V._settings[key])){				
				if(V.isValid(V._exSettings[key])){
					V._settings[key] = V.merge(V.getValue(data,{}),V._exSettings[key]);
					delete V._exSettings[key];
				} else
					V._settings[key] = V.getValue(data,{});
			}
			return V._settings[key];
		};
		//扩展默认配置
		V.extendSettings = function(key,data){
			if(V.isValid(V._settings[key])) {
				V._settings[key] = V.merge(V._settings[key],data);
			} else {
				if(V.exSettings[key]){
					V._exSettings[key] = V.merge(V._exSettings[key],V.getValue(data,{}));
				}else{
					V._exSettings[key] = V.getValue(data,{});
				}
			}
		};
	}
	//ajax
	{	
		//处理自定义TJson格式 如一般是[包[库[表[行]]]] [['Rindex','ID'],['1','6e014f804b8f46e1b129faa4b923af2d'],['2','6e014f804b8f46e1b129faa4b923a23d']]
		V.evalTJson = function (data) {
			//转换表用的
			var _evalTJson = function (_dt) {
				var res = [];
				$(_dt).each(function (i, v) {
					if (0 == i) return;
					var s = {};
					$(v).each(function (q, v2) {
						s[_dt[0][q]] = v2;
					});
					res[i - 1] = s;
				});
				return res;
			};
			data = data[0];
			var res = [];
			for(var i in data){
				var v = data[i];
				res[i] = _evalTJson(v);
			};
			return res;
		};
		/*
		V.ajax用于使用默认值
		--案例
		V.ajax({
		url:"",
		data:{},
		//已经默认实现处理返回单值的数据，一般不用替换
		//filtData:function(data){
		//  return data[1][0];
		//},
		bindData:function(data){            
		}
		});
		*/
		V.ajax = function (data) {
			var funcsucc = V.merge(V.getSettings("ajax",{
				async: false,
				type: "POST",
				dataType: "text",
				cache: false,
				beforeSend: function (request) {
				}, success: function (data, status) {
					var _this = this;
					try {
						var hasFalse = false;
						switch (typeof (data)) {
							case "string":
								if (data.replace(/^(\[+\]+)/g, '').length === 0) {
									_this.noData();
									hasFalse = true;
								} else {
									hasFalse = (data.indexOf('[False]') >= 0 || data.indexOf('[false]') >= 0)
								}
								break;
							case "object":
								$(eval(data)).each(function (i, v) {
									hasFalse = (hasFalse || v == 'False' || v == 'false');
								});
								break;
							default:
								V.showException('V.Query success方法 name:typeof错误 type:' + typeof (data));
								break;
						}            
						if (!hasFalse) {
							setTimeout(function () { V.tryC(function () {_this.bindData.apply(_this, [_this.filtData(eval(data))]); }); }, 1);
						}            
					} catch (e) {
						V.showException('V._ajaxOption success方法', e);
					}
				}, error: function (request, status, error) {
					V.showException('V._ajaxOption error方法 status:' + status, error);
				}, complete: function (request, status) {
					//手动回收资源
					request = null;
				}, filtData: function (data) {
					//用来处理数据过滤的
					return V.evalTJson(data)[0][0];
				}, bindData: function (data) {
					//这里使用的是过滤后的数据
				}, noData: function () {
					//这里说明没有获取到数据
				}
			}), data);
			if(data.jsonp){
				if(!V._ajaxcall){
					V._ajaxcall = {};
				}
				var random = V.random();
				V._ajaxcall[random] = function(data){
					delete V._ajaxcall[random];
					funcsucc.success(data,null);
				};
				V.getRemoteJSON(data.url+(data.url.indexOf('?')>=0?'&':'?')+(data.jsonp==true?'callback':data.jsonp)+'=VJ._ajaxcall['+random+']&'+$.param(data.data));
			} else {
				$.ajax(funcsucc);
			}
		};
		/*
		获取远程JSON
		--案例
		V.getRemoteJSON("");
		*/
		V.getRemoteJSON = function (url) {
			var data = {filtURI: function (url) { return url; }};
			if ($.browser.msie) {
				//解决IE界面线程停滞，无法显示动画的问题
				window.setTimeout(function () {
					$.getScript(V.getSettings("getRemote",data).filtURI(url), function () { });
				}, 500);
			} else {
				$.getScript(V.getSettings("getRemote",data).filtURI(url), function () { });
			}
		};
		/* 同步获取js模块 */
		function _V_() { }
		/*_V_内部方法
		*-- 参数1：url， js或css的路径
		*-- 参数2：获取方式get，post
		*-- 参数3：post字符串
		*-- 参数4：是否异步，true,false
		*-- 参数5：回调方法
		*/
		_V_.prototype.create = function (URL, fun, pStr, isSyn, callBack) {
			//1为新浏览器，用XMLHttpRequest；2为IE5、6，用ActiveXObject("Microsoft.XMLHTTP")；3为本地（火狐除外，fox还会用type：1来读本地xml）
			this.type = null;
			this.responseObj = null;
			//
			this.xmlURL = URL || null;
			this.xmlFun = fun || "get";
			this.postStr = pStr || "";
			if (!this.xmlURL) return;
			//获取xmlReq对象
			this.xhReq = this.getXMLReq();
			if (this.xhReq == null) {
				alert("Your browser does not support XMLHTTP.");
				return;
			}
			//请求处理函数，分为异步和同步分别处理，同步处理需要放在“提交请求”后，负责无效
			//异步的回调处理
			if (isSyn && (isSyn == true || isSyn == "true") && this.type != 3) {
				//alert("异步")
				//指定响应函数
				this.xhReq.onreadystatechange = function () {
					if (this.readyState == 4 && (this.status == 200 || this.status == 0)) {
						if (callBack) {
							callBack(this.responseXML.documentElement);
						}
						else
							return this.responseXML.documentElement;
					}
				};
			}
			//提交请求
			//alert(this.type)
			if (this.type != 3) {
				this.xhReq.open(this.xmlFun, this.xmlURL, (isSyn && (isSyn == true || isSyn == "true")) ? true : false);
				this.xhReq.send((this.xmlFun && this.xmlFun.toLowerCase() == "post") ? this.postStr : null);
				this.responseObj = this.xhReq.responseText;
			}
			else if (this.type == 3)//这是IE用来读取本地xml的方法
			{
				this.xhReq.open("get", this.xmlURL, "false");
				this.responseObj = this.xhReq;
			}
			//同步的回调处理
			if ((isSyn != null && (isSyn == false || isSyn == "false")) || this.type == 3) {
				if (callBack)
					callBack(this.responseObj);
				else
					return this.responseObj;
			}
		}
		/*获取DOM对象兼容各个浏览器，可能不完善，继续测试
		*/
		_V_.prototype.getXMLReq = function () {
			var xmlhttp = null;
			if (window.XMLHttpRequest) {	// code for all new browsers like IE7/8 & FF
				xmlhttp = new XMLHttpRequest();
				this.type = 1;
			}
			else if (window.ActiveXObject) {	// code for IE5 and IE6
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				this.type = 2;
			}
			//如果读取本地文件，则使用AXObject，因为httpRequest读取本地文件会报拒绝访问
			if (document.location.href.indexOf("http://") < 0 && window.ActiveXObject) {
				xmlhttp = new ActiveXObject("Microsoft._V_");
				this.type = 3;
			}
			return xmlhttp;
		}
		/*请求失败
		*/
		_V_.prototype.abort = function () {
			this.xhReq.abort();
		};
		/*获取js代码后，添加到页面内容下
		*/
		function _V_AppendScript(data, callback) {
			var ua = navigator.userAgent.toLowerCase();
			isOpera = ua.indexOf("opera") > -1
			isIE = !isOpera && ua.indexOf("msie") > -1
			var head = document.getElementsByTagName("head")[0] || document.documentElement, script = document.createElement("script");
			script.type = "text/javascript";
			//不能使用 src 因为其已经获得了JS 只是需要加载入当前页面，所以不会有onload事件。
			/*
			var done = false;
			
			script.type = 'text/javascript';
			script.language = 'javascript';
			script.src = url;
			script.onload = script.onreadystatechange = function(){
			if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
			done = true;
			script.onload = script.onreadystatechange = null;
			if (callback){
			callback(script);
			}
			}
			}
			*/
			if (isIE) script.text = data;
			else script.appendChild(document.createTextNode(data));
			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).	
			head.insertBefore(script, head.firstChild);
			head.removeChild(script);
			if (callback) {
				callback(script);
			}
		};
		/* 添加 js 和 css 引用
		*-- 参数1：url， js或css的路径
		*-- 参数2：tag， 标签名称'head'或'body' ，可以为空，默认加在'head'内
		*-- 案例：V.include("script/jquery1.3/ui.core.js");
		todo 跨域同步
		*/
		V.include = function (url, tag, callback) {
			//如果已经使用本方法加载过 就不再加载。
			if (V.getSettings("include")[url]) return;
			V.getSettings("include")[url] = true;
			if (tag == null) { tag = 'head'; }
			var parentNode = document.getElementsByTagName(tag).item(0);
			var s = url.split('.');
			var styleTag = s[s.length - 1].toLowerCase();
			if (styleTag.indexOf('?') >= 0) {
				styleTag = styleTag.substr(0, styleTag.indexOf('?'));
			}
			if (styleTag == "js") {	
				//异步if(callback){
				//	$.getScript(url,function(res,status){
				//		if(status=='success'){
				//			//TODO 考虑h5缓存机制 可以直接eval
				//			callback();
				//		}
				//	});
				//}else 同步				
				var thisJsDom = new _V_();
				thisJsDom.create(url, "get", null, false, function (data) {
					_V_AppendScript(data, callback)
				});
				if(callback){
					callback();
				}
			}
			if (styleTag == "css") {
				new_element = document.createElement("link");
				new_element.setAttribute("type", "text/css");
				new_element.setAttribute("rel", "stylesheet");
				new_element.setAttribute("href", url);
				new_element.setAttribute("media", 'screen');
				parentNode.appendChild(new_element);
				if(callback){
					callback();
				}
			}
		};		
		if(!V._V_Part_Map){
			V._V_Part_Map=[];
		}
		V.part = function (url, node, mode, callback) {
			var parts = V._V_Part_Map;
			if (!V.isValid(node)) {
				node = $(document.createDocumentFragment());
				node.appendTo($(document.body));
			}
			if ($(node).get(0).tagName.toLowerCase() == "iframe") {
				/* 在iframe中加载url 指定的网页内容*/
				return $(node).attr("src", url);
			} else if (V.getValue(mode, '') == "iframe") {
				//动态创建iframe,追加到指定的node内
				return $(node).append("<IFRAME class=g_iframe border=0 marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=no allowTransparency=true src=\"" + url + "\"></IFRAME>");
			} else if (V.getValue(mode, '') == 'jsonp') {
				var randomid = Math.round(Math.random() * 100000000);
				node = $(node).hide();
				parts[randomid] = function (html) {
					html = decodeURIComponent(html);
					delete parts[randomid];
					node.append(html).show();
					if (callback) callback();
				};
				V.getRemoteJSON(url.replace(/\.html/g, ".jnp") + (url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._V_Part_Map[' + randomid + ']');
			} else {
				node = $(node);
				//一旦有 callback就是 post了
				window.setTimeout(function () {
					node.hide().load(url, function () {
						window.top.setTimeout(function () {
							if (!(node.hasClass('ui-dialog-content') || node.hasClass('g_hide'))) {
								node.show();
							}
						}, 1);
						if (callback) callback();
					});
				}, 1);
				//普通元素
				return node;
				// return $(node).load(url,null,callback);
			}
		};
	}
	//事件处理
	{
		/*
		V用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
		--案例
		V.registCommand('showXXList',getData)
		*/
		V.registCommand = function (name, func) {
			var comms = V.getSettings('comms',[]);
			var data = comms[name];
			if (V.isValid(data) && typeof (data) != 'function') {
				func.apply(null, data);
			}
			comms[name] = func;
		};
		/*
		V用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
		--案例
		V.callCommand('showXXList',[{id:1}])
		*/
		V.callCommand = function (name, data) {		
			var comms = V.getSettings('comms',[]);
			var func = comms[name];
			if (V.isValid(func) && typeof (func) == 'function') {
				func.apply(null, data);
			} else {
				comms[name] = data;
			}
		};
		/*
		用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false;
		--案例
		if (!V.hasCommand('editor.open')) V.part("/FileServer/layout/editor/editor.htm");
		*/
		V.hasCommand = function (name) {
			var comms = V.getSettings('comms',[]);
			var func = comms[name];
			return (V.isValid(func) && typeof (func) == 'function');
		};

		/*
		仅限iframe方式调用时，先取消原页面添加的方法
		//业务逻辑深度交叉，iframe落后的控件连接方式时使用
		一定要在part前
		--案例
		V.cleanCommand('editor.open');
		V.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
		*/
		V.cleanCommand = function (name) {
			var comms = V.getSettings('comms',[]);
			delete comms[name];
		};
		/*
		V用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
		--案例
		V.registEvent('showXXList',getData)
		*/
		V.registEvent = function (name, func) {		
			var events = V.getSettings('events',[]);
			var funs = events[name];
			if (!V.isValid(funs)) {
				funs = [];
				events[name] = funs;
			}
			if (typeof (func) == 'function') {
				funs.push(func);
			}
		};
		/*
		V用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
		--案例
		V.callEvent('showXXList',[{id:1}])
		*/
		V.callEvent = function (name, data) {
			var events = V.getSettings('events',[]);
			var funs = events[name];
			if (V.isValid(funs) && V.isArray(funs)) {
				$(funs).each(function (i, func) {
					//报错不下火线
					V.tryC(function () {
						func.apply(null, data);
					});
				});
			}
		};
		/*
		用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false;
		--案例
		if (!V.hasEvent('editor.open')) V.part("/FileServer/layout/editor/editor.htm");
		*/
		V.hasEvent = function (name) {
			var events = V.getSettings('events',[]);
			var funs = events[name];
			if (V.isValid(funs) && V.isArray(funs)) {
				return true;
			}
			return false;
		};

		/*
		仅限iframe方式调用时，先取消原页面添加的方法
		//业务逻辑深度交叉，iframe落后的控件连接方式时使用
		一定要在part前
		--案例
		V.cleanEvent('editor.open');
		V.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
		*/
		V.cleanEvent = function (name) {
			var events = V.getSettings('events',[]);
			delete events[name];
		};
				
		//TOTest
		V.getEvent = function(event){
			return event?event:window.event;
			//event || window.event;
		};
		V.getTarget = function(event){
			return event.target || event.srcElement;
		};
		V.cancel = function(event){
			if(event.preventDefault){
				event.preventDefault();
			}else{
				event.returnValue = false;
			}
		};
		V.stopProp = function(event){
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBobble = true;
			}
		};
	}
	//业务优化
	{
		V.formatPrice = function (number, decimals, dec_point, thousands_sep) {
			number = (number + '').replace(/[^0-9+-Ee.]/g, '');
			var n = !isFinite(+number) ? 0 : +number,
				prec = !isFinite(+decimals) ? 2 : Math.abs(decimals),
				sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
				dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
				s = '',
				toFixedFix = function (n, prec) {
					var k = Math.pow(10, prec);
					return '' + Math.round(n * k) / k;
				};
			// Fix for IE parseFloat(0.55).toFixed(0) = 0;
			s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
			if (s[0].length > 3) {
				s[0] = s[0].replace(/B(?=(?:d{3})+(?!d))/g, sep);
			}
			if ((s[1] || '').length < prec) {
				s[1] = s[1] || '';
				s[1] += new Array(prec - s[1].length + 1).join('0');
			}
			return s.join(dec);
		};
		V.qs = (function(){return new function(qs) { // optionally pass a querystring to parse
			this.params = {};
			if (qs == null) qs = location.search.substring(1, location.search.length);
			if (qs.length == 0) return;
			// Turn <plus> back to <space>
			// See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
			qs = qs.replace(/\+/g, ' ');
			var args = qs.split('&'); // parse out name/value pairs separated via &

			// split out each name=value pair
			for (var i = 0; i < args.length; i++) {
				var pair = args[i].split('=');
				var name = decodeURIComponent(pair[0]);

				var value = (pair.length == 2)
					? decodeURIComponent(pair[1])
					: name;

				this.params[name] = value;
			}
			//等同_VJ_QueryString.prototype.get
			this.get = function (key, default_) {
				var value = this.params[key];
				return (value != null) ? value : default_;
			};
			this.contains = function (key) {
				var value = this.params[key];
				return (value != null);
			};
		}})();
		/* 得到日期年月日等加数字后的日期 new Date().add('h',1)*/ 
		Date.prototype.add = function(interval,number) 
		{ 
			var d = new Date(this.getTime());
			var k={'y':'FullYear', 'q':'Month', 'm':'Month', 'w':'Date', 'd':'Date', 'h':'Hours', 'n':'Minutes', 's':'Seconds', 'ms':'MilliSeconds'};
			var n={'q':3, 'w':7};
			eval('d.set'+k[interval]+'(d.get'+k[interval]+'()+'+((n[interval]||1)*number)+')');
			return d;
		} 
		/* 计算两日期相差的日期年月日等 new Date().diff('h',new Date().add('d',1)); */ 
		Date.prototype.diff = function(interval,objDate2) 
		{ 
			var d=this, i={}, t=d.getTime(), t2=objDate2.getTime(); 
			i['y']=objDate2.getFullYear()-d.getFullYear(); 
			i['q']=i['y']*4+Math.floor(objDate2.getMonth()/4)-Math.floor(d.getMonth()/4); 
			i['m']=i['y']*12+objDate2.getMonth()-d.getMonth(); 
			i['ms']=objDate2.getTime()-d.getTime(); 
			i['w']=Math.floor((t2+345600000)/(604800000))-Math.floor((t+345600000)/(604800000)); 
			i['d']=Math.floor(t2/86400000)-Math.floor(t/86400000); 
			i['h']=Math.floor(t2/3600000)-Math.floor(t/3600000); 
			i['n']=Math.floor(t2/60000)-Math.floor(t/60000); 
			i['s']=Math.floor(t2/1000)-Math.floor(t/1000); 
			return i[interval]; 
		}
		/* 计算两日期相差的日期年月日等 new Date().diff('h',new Date().add('d',1)); */ 
		Date.prototype.sub = function(interval,objDate2) 
		{ 
			return -1*Date.prototype.diff.apply(this,[interval,objDate2]);
		}
		/* 计算两日期相差的日期年月日等 new Date().toString('yyyy-MM-dd'); */ 
		Date.prototype.toString=function(fmt) {           
			var o = {           
				"M+" : this.getMonth()+1, //月份           
				"d+" : this.getDate(), //日           
				"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时           
				"H+" : this.getHours(), //小时           
				"m+" : this.getMinutes(), //分           
				"s+" : this.getSeconds(), //秒           
				"q+" : Math.floor((this.getMonth()+3)/3), //季度           
				"S" : this.getMilliseconds() //毫秒           
			};           
			var week = {           
				"0" : "/u65e5",           
				"1" : "/u4e00",           
				"2" : "/u4e8c",           
				"3" : "/u4e09",           
				"4" : "/u56db",           
				"5" : "/u4e94",           
				"6" : "/u516d"          
			};           	
			if (fmt) { } else {
				fmt = 'yyyy/MM/dd HH:mm:ss';
			}
			if(/(y+)/.test(fmt)){           
				fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));           
			}           
			if(/(E+)/.test(fmt)){           
				fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);           
			}           
			for(var k in o){           
				if(new RegExp("("+ k +")").test(fmt)){           
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));           
				}           
			}           
			return fmt;           
		};
		//处理永不重复的随机数
		{
			var index = 0;
			V.random = function(){
				return parseInt(''+(new Date()).getTime()+(index++));
			};
		}
		 /**
		 * 获取字符串的哈希值
		 * @param {String} str
		 * @param {Boolean} caseSensitive
		 * @return {Number} hashCode
		 */
		 V.hash = function(str,caseSensitive){
			 caseSensitive = V.getValue(caseSensitive,false);
			if(!caseSensitive){
				str = str.toLowerCase();
			}
			// 1315423911=b'1001110011001111100011010100111'
			var hash  = 1315423911,i,ch;
			for (i = str.length - 1; i >= 0; i--) {
				ch = str.charCodeAt(i);
				hash ^= ((hash << 5) + ch + (hash >> 2));    
			}
			return  (hash & 0x7FFFFFFF);
		}		
		//添加string.endWith与startWith方法
		String.prototype.endWith = function (str) {
			if (str == null || str == "" || this.length == 0 || str.length > this.length)
				return false;
			if (this.substring(this.length - str.length) == str)
				return true;
			else
				return false;
			return true;
		};

		String.prototype.startWith = function (str) {
			if (str == null || str == "" || this.length == 0 || str.length > this.length)
				return false;
			if (this.substr(0, str.length) == str)
				return true;
			else
				return false;
			return true;
		};
	}	
	//json2
	{		
		if (typeof JSON !== 'object') {
			JSON = {};
		}

		(function () {
			'use strict';
			function f(n) {
				// Format integers to have at least two digits.
				return n < 10 ? '0' + n : n;
			}
			if (typeof Date.prototype.toJSON !== 'function') {
				Date.prototype.toJSON = function () {
					return isFinite(this.valueOf())
						? this.getUTCFullYear()     + '-' +
							f(this.getUTCMonth() + 1) + '-' +
							f(this.getUTCDate())      + 'T' +
							f(this.getUTCHours())     + ':' +
							f(this.getUTCMinutes())   + ':' +
							f(this.getUTCSeconds())   + 'Z'
						: null;
				};
				String.prototype.toJSON      =
					Number.prototype.toJSON  =
					Boolean.prototype.toJSON = function () {
						return this.valueOf();
					};
			}
			var cx,
				escapable,
				gap,
				indent,
				meta,
				rep;
			function quote(string) {
				escapable.lastIndex = 0;
				return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
					var c = meta[a];
					return typeof c === 'string'
						? c
						: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' : '"' + string + '"';
			}
			function str(key, holder) {		
				var i,          // The loop counter.
					k,          // The member key.
					v,          // The member value.
					length,
					mind = gap,
					partial,
					value = holder[key];		
				if (value && typeof value === 'object' &&
						typeof value.toJSON === 'function') {
					value = value.toJSON(key);
				}
				if (typeof rep === 'function') {
					value = rep.call(holder, key, value);
				}
				switch (typeof value) {
					case 'string':
						return quote(value);
					case 'number':
						return isFinite(value) ? String(value) : 'null';
					case 'boolean':
					case 'null':
						return String(value);
					case 'object':
						if (!value) {
							return 'null';
						}
						gap += indent;
						partial = [];
						if (Object.prototype.toString.apply(value) === '[object Array]') {
							length = value.length;
							for (i = 0; i < length; i += 1) {
								partial[i] = str(i, value) || 'null';
							}
							v = partial.length === 0
								? '[]'
								: gap
								? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
								: '[' + partial.join(',') + ']';
							gap = mind;
							return v;
						}
						if (rep && typeof rep === 'object') {
							length = rep.length;
							for (i = 0; i < length; i += 1) {
								if (typeof rep[i] === 'string') {
									k = rep[i];
									v = str(k, value);
									if (v) {
										partial.push(quote(k) + (gap ? ': ' : ':') + v);
									}
								}
							}
						} else {
							for (k in value) {
								if (Object.prototype.hasOwnProperty.call(value, k)) {
									v = str(k, value);
									if (v) {
										partial.push(quote(k) + (gap ? ': ' : ':') + v);
									}
								}
							}
						}
						v = partial.length === 0
							? '{}'
							: gap
							? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
							: '{' + partial.join(',') + '}';
						gap = mind;
						return v;
				}
			}

			if (typeof JSON.stringify !== 'function') {
				escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
				meta = {    // table of character substitutions
					'\b': '\\b',
					'\t': '\\t',
					'\n': '\\n',
					'\f': '\\f',
					'\r': '\\r',
					'"' : '\\"',
					'\\': '\\\\'
				};
				JSON.stringify = function (value, replacer, space) {
					var i;
					gap = '';
					indent = '';
					if (typeof space === 'number') {
						for (i = 0; i < space; i += 1) {
							indent += ' ';
						}
					} else if (typeof space === 'string') {
						indent = space;
					}
					rep = replacer;
					if (replacer && typeof replacer !== 'function' &&
							(typeof replacer !== 'object' ||
							typeof replacer.length !== 'number')) {
						throw new Error('JSON.stringify');
					}
					return str('', {'': value});
				};
			}
			if (typeof JSON.parse !== 'function') {
				cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
				JSON.parse = function (text, reviver) {
					var j;
					function walk(holder, key) {
						var k, v, value = holder[key];
						if (value && typeof value === 'object') {
							for (k in value) {
								if (Object.prototype.hasOwnProperty.call(value, k)) {
									v = walk(value, k);
									if (v !== undefined) {
										value[k] = v;
									} else {
										delete value[k];
									}
								}
							}
						}
						return reviver.call(holder, key, value);
					}
					text = String(text);
					cx.lastIndex = 0;
					if (cx.test(text)) {
						text = text.replace(cx, function (a) {
							return '\\u' +
								('0000' + a.charCodeAt(0).toString(16)).slice(-4);
						});
					}
					if (/^[\],:{}\s]*$/
							.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
								.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
								.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
						j = eval('(' + text + ')');
						return typeof reviver === 'function'
							? walk({'': j}, '')
							: j;
					}
					throw new SyntaxError('JSON.parse');
				};
			}
		}());
		V.toJsonString = function (obj) {
			return JSON.stringify(obj);
		};
		V.json = function (txt) {
			return JSON.parse(txt);
		};
	}
})(VJ,jQuery);
(function(V,$){
	V.config = {};
	var C = V.config;
	C.Configs = {
		ConfigConverts:{
			AppSettings:{type:'VJ.config.AppSettingsConfigConvert'}
		}
	};
	C.Config=function(){
		var _ = this;
		_.data = {};
		_.getValue = function(key){return _.data[key];};
		_.setValue = function(key,value){ _.data[key] = value;};
		_.merge = function(config){
			_.data = V.merge(_.data,config.data);
		};
	};
	//ConfigConvert的基础类模型说明 基本上只有接口定义 未实现任何功能
	C.ConfigConvert = function(){
		var _ = this;
		_.toConfig = function(val){return null;};
		_.toStrings = function(config){return "";};
		_.needConfig = false;
	};
	C.AppSettingsConfigConvert = function(){
		var _ = this;
		{
			V.inherit.apply(_,[C.ConfigConvert,[]]);			
		}
		_.toConfig = function(val){
			var conf = new C.Config();
			val = V.getValue(val,{});
			for(var i in val){
				conf.data[i] = val[i];
			}
			return conf;
		};
	};
	C.ConfigManager = function(parent,resource){
		var _ = this;	
		var dic = {};
		var data = {};
		var hasUpdate = false;
		_.getConfig = function(key){
			if(!V.isValid(data[key])){
				data[key]=new C.ProxyConfig(_,key);
			}
			return data
		};
		_.getConfigValue = function(config,key){
			var func = function(){
				if(parent){
					return parent.getConfigValue(config,key);
				} else return null;
			};
			//console.log(dic);
			if(!dic[config]){
				return func.apply(_,[]);
			}else{
				var value = dic[config].getValue(key);
				return !value?func.apply(_,[]):value;
			}
		};		
		_.setConfigValue = function(config,key,value){
			hasUpdate = true;
			var func = function(){
				if(parent){
					parent.setConfigValue(config,key,value);
				}
			};
			if(!dic[config]){
				func.apply(_,[]);
			}else{
				dic[config].setValue(key,value);
			}
		};
		_.update = function(){
			if(hasUpdate){
				_.adapter.update(_,dic,resource);
			}
		};		
		{
			var that = _;
			if(parent == null){
				//根解析器默认添加类解析器 ConvertsConfig
				//ConfigConverts是一个Config对象 Config对象中包含第一个基础解析器ConfigConverts，基础解析器解析出来的是一个Config对象。
				dic['ConfigConverts'] = new function(){
					var _ = this;
					{
						V.inherit.apply(_,[C.Config,[]]);
						//创建ConfigConverts解析器
						_.data['ConfigConverts'] =  new function(){
							var _ = this;
							//根据val获取对应的ConfigConvert, ConfigConverts：{'AppSettings':{type:'',path:''}}
							_.toConfig = function(val){
								return new function(){
									var _ = this;
									V.inherit.apply(_,[C.Config,[]]);
									for(var i in val){
										_.data[i] = (function(){
											var conf = val[i];
											if(conf.path){
												V.include(conf.path);
											}
											return V.create2(conf.type,[]);
										})();
									}
								};
							};
							_.toStrings = function(config){V.showException('基础解析器不支持此功能');};
						};
					}
				};
			}	
			_.adapter = C.ConfigAdapter.prototype.getInstance();
			_.adapter.fill(_,dic,resource);		
		}
	};
	C.ProxyConfig = function(config,confkey){
		var _ = this;
		V.inhert(C.Config,[]);
		_.getValue = function(key){return config.getConfigValue(confkey,key);};
		_.setValue = function(key,value){return config.setConfigValue(confkey,key,value);};
		_.merge = function(config){V.showException('不支持的功能');};
	};
	
	C.ConfigAdapter = function(){
		var _ = this;
		_.fill = function(cm,dic,resource){
			resource = resource.load();
			if(typeof(resource) == 'string'){
				resource = eval('('+resource+')');
			}
			for(var i in resource){
				var convert = cm.getConfigValue('ConfigConverts',i);
				if(!convert){
					V.showException('ConfigConverts 没有找到对应的解析器'+i);
				}else{
					var val = convert.toConfig(resource[i],convert.needConfig?cm:null);
					if(!val){
						console.log('ConfigConverts 解析失败'+i+':');
						console.log(resource[i]);
					}else{
						if(dic[i]){
							dic[i].merge(val);
						}else{
							dic[i] = val;
						}
					}
				}
			}
		};
		_.update = function(cm,dic,resource){
			var data = {};
			for(var i in dic){
				var convert = cm.getConfigValue('ConfigConverts',i);
				if(!convert){
					V.showException('ConfigConverts 没有找到对应的解析器'+i);
				}else{
					var val = convert.toString(dic[i]);
					if(!val){
						console.log('ConfigConverts 解析失败'+i+':');
						console.log(dic[i]);
					}else{
						data[i]=val;
					}
				}
			}
			resource.save((function(){
				var ret = '{';
				for(var i in data){
					ret = ret+i+':'+data[i]+',';
				}
				if(ret.substr(ret.length-1)==','){
					ret = ret.substr(0,ret.length-1);
				}
				return ret+'}';				
			})());
		};
	};
	C.ConfigAdapter.prototype.getInstance = function(){
		if(!C.ConfigAdapter.prototype.instance){
			C.ConfigAdapter.prototype.instance = new C.ConfigAdapter();
		}
		return C.ConfigAdapter.prototype.instance;
	};
	C.getConfigManagerFromObj = function(cm,obj){
		if(!obj) return cm;
		return new C.ConfigManager(cm,(function(){
			return new function(){
				var _ = this;
				if(typeof(obj) === 'string'){
					obj = eval('('+obj+')');
				}
				_.load = function(){return obj;};
				_.save = function(){V.showException('getConfigManagerFromObj不支持此方式');}
			};
		})());
	};
	C.getConfigManagerFromJS = function(cm,name,path){
		if(!name) return cm;
		if(path){
			if(V.isArray(path)){
				for(var i in path){
					V.include(path[i]);
				}
			}else
				V.include(path);
		}
		return new C.ConfigManager(cm,(function(){
			return new function(){
				var _ = this;
				if(typeof(name) === 'string'){
					name = eval('('+name+')');
				}
				_.load = function(){return name;};
				_.save = function(){V.showException('getConfigManagerFromJS不支持此方式');}
			};
		})());
	};
	C.getBaseConfigManager = function(){
		if(!C.baseConfig){
			C.baseConfig = C.getConfigManagerFromObj(null,C.Configs);
		}
		return C.baseConfig;
	};
	C.getApplicationConfigManagerFromJS = function(name,path){
		return C.getConfigManagerFromJS(C.getBaseConfigManager(),name,path);
	};
	C.getApplicationConfigManagerFromObj = function(obj){
		return C.getConfigManagerFromObj(C.getBaseConfigManager(),obj);
	};
})(VJ,jQuery);
(function(V,$){
	V.collection = {};
	var C = V.collection;
	//实现对池类型的管理
	C.Pool = function(size,func,waitTime){
		var _ = this;
		var __ = {};
		{	
			//总数 可用 已用
			__.data = [];
			__.have = [];
			__.use = {};
			__.KEY = '_____poolid';
			__.addUse = function(v){
				if(v){
					if(!V.isValid(v[__.KEY])){
						v[__.KEY] = V.random();
					}
					__.use[v[__.KEY]]=v;
				}
			};
			__.delUse = function(v){
				if(v){
					if(V.isValid(v[__.KEY]) && V.isValid(__.use[v[__.KEY]])){
						delete __.use[v[__.KEY]]
					}
				}
			};		
			waitTime = V.getValue(waitTime,10);
			__.clearer = new function(){
				var _ = this;
				{
					var tid = null;
					_.start = function(){
						tid = window.setTimeout(function(){
							var endDate = __.have.length>0?__.have[0].endDate:null;
							if(V.isValid(endDate) && new Date().diff('ms',endDate)>0){
								_.start();
							} else {
								while(__.have.length>0){
									var val = __.have.shift();
									if(val.dispose){
										val.dispose();
										val = null;
									}
								}								
								__.data = [];
								for(var i in __.use){
									__.data.push(__.use[i]);
								}
								_.start();								
							}
						},500);
					};
					_.stop = function(){
						if(tid){
							window.clearTimeout(tid);
						}
						tid = null;
					};
				}
			};
			__.clearer.start();			
		}
		_.getValue = function(){
			var v = __.have.pop();
			if(v){
				v = v.value;
				__.addUse(v);
				return v;
			} else if(__.data.length<size){
				v = func();
				__.addUse(v);
				__.data.push(v);
				return v;
			} else return null;
		};
		_.setValue = function(v){
			__.delUse(v);
			if(V.isValid(v) && V.isValid(v[__.KEY])){
				__.have.push({endDate:new Date().add('s',waitTime),value:v});
			}
		};
		_.dispose = function(){
			__.clearer.stop();
			while(__.have.length>0){
				var val = __.have.shift();				
				if(val.dispose){
					val.dispose();
					val = null;
				}
			}			
			__.data = [];
			for(var i in use){
				__.data.push(use[i]);
			}
		};
	};
})(VJ,jQuery);
(function(V,$){
	V.middler = {};
	V.config.Configs = V.merge(V.config.Configs,{ConfigConverts:{Middler:{type:'VJ.middler.MiddlerConfigConvert'}}});
	var M = V.middler;	
	M.Middler = function(cm){
		var _ = this;		
		var KEY='Middler';
		{}
		_.getObjectByAppName = function(app,name){
			return cm.getConfigValue(KEY,new function(){
				var _ = this;
				{}
				_.getValue = function(config){
					return config.getValueByName(app,name);
				};
			});
		};
		_.setObjectByAppName = function(app,name,val){
			return cm.setConfigValue(KEY,new function(){
				var _ = this;
				{}
				_.setValue = function(config,val){
					return config.setValueByName(app,name,val);
				};
			},val);
		};
		_.getTypeByAppName = function(app,name){
			return cm.getConfigValue(KEY,new function(){
				var _ = this;
				{}
				_.getValue = function(config){
					return config.getTypeByName(app,name);
				};
			});
		};
	};
	M.MiddlerConfig = function(){
		var _ = this;
		{
			V.inherit.apply(_,[V.config.Config,[]]);
		}
		_.getValue = function(key){
			return key.getValue(_);
		};
		_.setValue = function(key,val){
			return key.setValue(_,val);
		};
		_.merge = function(config){
			if(config.data){
				_.data = {};
				for(var i in config.data){
					_.data[i] = config.data[i];
				}
			}
		};
		_.getValueByName = function(app,name){
			if(_.data[app] && _.data[app][name]){
				return _.data[app][name].getValue();
			} else return null;
		};
		_.setValueByName = function(app,name,val){
			if(_.data[app] && _.data[app][name]){
				return _.data[app][name].setValue(val);
			} else return null;
		};
		_.getTypeByName = function(app,name){
			if(_.data[app] && _.data[app][name]){
				return _.data[app][name].getType();
			} else return null;
		};
	};
	/*
	Middler:{
		appName:{
			method:'',
			mode:'',
			path:'',
			pack:'',
			ObjectName:{type:'',path:'',method:'',mode:'',constractparalength:'',params:[
				{type:'',path:'',method:'',mode:'',constractparalength:''},
				{ref:''},
				{a:1,b:2},
				{a:1},
				{b:2},
				'',
				1,
				{self:"true"}
			]},
			ObjectsName:{path:'',method:'',mode:'',constractparalength:'',params:[
				{type:'',path:'',method:'',mode:'',constractparalength:''},
				{ref:''},
			]}
		}
	}
	*/
	M.MiddlerConfigConvert = function(){
		var _ = this;
		//私有
		var __ = {};
		{
			//继承关系需要以后由Middler管理	
			V.inherit.apply(_,[V.config.ConfigConvert,[]]);
			_.needConfig = true;
			//生成参数管理器
			__.convertParas = function(config,params,defParam,app,pcm){
				var _ = this;
				var paras = [];
				{
					params = V.getValue(params,[]);					
					for(var i in params){
						var val = params[i];
						if(typeof(val)=='object'){
							if(val.ref){
								var index = val.ref.indexOf('/')>=0?val.ref.indexOf('/'):val.ref.indexOf('\\')>=0?val.ref.indexOf('\\'):-1;
								var appName = index>=0?val.ref.substr(0,index):defParam.app;
								var name = appName?val.ref.substr(index+1):val.ref;
								//paras.push(config.getValueByName(appName,name));
								paras.push({ref:appName,name:name});
							} else if(val.type){
								var name = V.random()+'';
								app[name] = __.convertContainer(config,val,defParam,app);
								paras.push({ref:defParam.app,name:name});
							} else if(val.self){
								paras.push(pcm);
							} else if(val.params){
								var _v = {params:val.params};
								for(var i in val){
									if(i!='params'){									
										if(val[i].type){
											var name = V.random()+'';
											app[name] = __.convertContainer(config,val[i],defParam,app);
											_v[i] = {ref:defParam.app,name:name};
										} else if(val[i].ref){
											var index = val[i].ref.indexOf('/')>=0?val[i].ref.indexOf('/'):val[i].ref.indexOf('\\')>=0?val[i].ref.indexOf('\\'):-1;
											var appName = index>=0?val[i].ref.substr(0,index):defParam.app;
											name = appName?val[i].ref.substr(index+1):val[i].ref;
											_v[i] = {ref:defParam.app,name:name};
										} else {
											_v[i] = val[i];
										}
									}
								}
								paras.push(_v);
							} else {
								//普通JSON
								paras.push(val);
							}
						} else if(V.isArray(val)){
							//objects
							var name = V.random()+'';
							app[name] = __.convertContainer(config,{params:val},defParam,app);
							paras.push({ref:defParam.app,name:name});
						} else {
							paras.push(val);
						}
					}
				}
				return new function(){
					var _ = this;
					{}
					_.getParas = function(){
						var ret = [];
						for(var i in paras){
							var val = paras[i];
							if(val.ref){
								val = config.getValueByName(val.ref,val.name);
							} else if(val.params){
								for(var i in val){
									if(i!='params' && val[i].ref){
										val[i] = config.getValueByName(val[i].ref,val[i].name);										
									}
								}
							}
							ret.push(val);
						}
						return ret;
					};
				};			
			};		
			//生成生成器
			__.convertCreater = function(config,v,defParam,app,pcm){
				var method = V.getValue(v.method,defParam.method);
				var path = V.getValue(v.path,defParam.path);
				var type = ((V.isValid(v.type) && v.type.indexOf('\.')==0)?defParam.pack:'')+v.type;
				if(type=='undefined' && !V.isValid(v.ref)) {
					if(V.isValid(v.params)){
						method="objects";
					} else {
						method = 'self';
					}
				}
				var constructorparalength = V.getValue(v.constructorparalength,defParam.constructorparalength);
				//使用Objects的默认配置对下传递 仅仅传递 path 和 pack
				var para = __.convertParas(config,v.params,V.merge(defParam,{path:path,pack:defParam.pack}),app,pcm);
				return new function(){
					var _ = this;
					_.getType = function(){
						return eval('('+type+')');
					};
					_.getValue = function(){
						if(path) {
							//以后可以修改 目前是有缓存的
							V.include(path);
						}
						var paras = para.getParas();
						switch(method){
							case "self":
								return v;
								break;
							case "objects":
								return paras;
								break;
							default:
							case 'constructor':
								//return eval('(VJ.create('+type+',paras))');
								return V.create2(type,paras);
								break;
							case 'bean':
								var val = eval('(new '+type+'())');
								//bean设置出错
								if(paras){
									for(var i in paras){
										if(typeof(paras[i])==='object'){
											if(paras[i].params && val['set'+paras[i].params]){
												var me = '(val["set'+paras[i].params+'"](w,paras[i][w]))';
												for(var w in paras[i]){
													if(w!='params'){
														eval(me);
													}
												}
											} else {
												val = V.merge(val,paras[i]);
											}
										}
									}
								}
								return val;
							case 'factory':
								return eval('('+type+'.apply('+type+',paras))');
							case 'factorybean':
								var val = eval('('+type+'.apply('+type+',paras))');							
								if(paras){
									var q = 0;
									for(var i in paras){
										if((!constructorparalength || q >= constructorparalength) && typeof(paras[i])==='object'){
											if(paras[i].params && val['set'+paras[i].params]){
												var me = '(val["set'+paras[i].params+'"](w,paras[i][w]))';
												for(var w in paras[i]){
													if(w!='params'){
														eval(me);
													}
												}
											} else {
												val = V.merge(val,paras[i]);
											}
										}
										q++;
									}
								}
								return val;
							case 'constructorbean':							
								var val = V.create2(type,paras);
								if(paras){
									var q = 0;
									for(var i in paras){
										if((!constructorparalength || q >= constructorparalength) && typeof(paras[i])==='object'){
											if(paras[i].params && val['set'+paras[i].params]){
												var me = '(val["set'+paras[i].params+'"](w,paras[i][w]))';
												for(var w in paras[i]){
													if(w!='params'){
														eval(me);
													}
												}
											} else {
												val = V.merge(val,paras[i]);
											}
										}
										q++;
									}
								}
								return val;
						}
					};
				}
			};
			//转换成Container对象
			__.convertContainer = function(config,v,defParam,app,pcm){
				var mode = V.getValue(v.mode,defParam.mode);
				var size = V.getValue(v.size,defParam.size);
				var creater = __.convertCreater(config,v,defParam,app,pcm);
				var getType = function(){return creater.getType();};
				//生成保持器
				{
					switch(mode){
						default:
						case 'static':
							return new function(){
								var obj = null;
								var _ = this;
								_.getType = getType;
								_.getValue = function(){
									if(obj==null){
										obj = creater.getValue();
									}
									return obj;
								};
								_.setValue = function(val){
									if(obj===val){}else{
										//todo 彻底删除变量
										val = null;
									}
								};							
							};
							break;
						case 'instance':
							return new function(){
								var _ = this;							
								_.getType = getType;
								_.getValue = function(){
									return creater.getValue();
								};
								_.setValue = function(v){
									if(v.dispose){
										V.tryC(function(){v.dispose();});
									}
								};
							};
							break;
						case 'pool':
							return new function(){
								var _ = this;							
								_.getType = getType;
								var pool = new V.collection.Pool(size,function(){return creater.getValue();});
								_.getValue = function(){
									return pool.getValue();
								};
								_.setValue = function(v){
									pool.setValue(v);
								};
							};
							break;
					}
				}
			}
			//转换成App对象
			__.convertApp = function(config,v,app,pcm){
				var keys = {method:'constructor',mode:'static',path:false,pack:false,constructorparalength:false,size:50,app:app};
				return new function(){
					var _ = this;
					var defParam = {};
					for(var i in keys){
						defParam[i]=V.getValue(v[i],keys[i]);					
					}
					defParam['app'] = app;
					for(var i in v){
						if(keys[i] || keys[i]==false){
							//console.log('过滤的'+i);
						} else {
							//转换成Container对象
							_[i] = __.convertContainer(config,v[i],defParam,_,pcm);
						}
					}
				};
			};
		}
		
		_.toConfig = function(val,pcm){
			var config = new M.MiddlerConfig();
			for(var i in val){
				//处理app
				var app = __.convertApp(config,val[i],i,pcm);
				config.data[i] = app;
			}
			return config;
		};
		_.toStrings = function(val){
			V.showException('Middler 不支持此操作');
		};
	};
	M.getMiddlerFromJS = function(type,path){
		return new M.Middler(V.config.getApplicationConfigManagerFromJS(type,path));
	};
	M.getMiddlerFromObj = function(obj){
		return new M.Middler(V.config.getApplicationConfigManagerFromObj(obj));
	};
})(VJ,jQuery);
(function(V,$){
	V.ni = {};
	var N = V.ni;
	//依托Middler框架完成对数据类型文件的处理，包括ajax jsonp localStorage sessionStorage Sqlite ObjectDB(即自定义function) WebSocket等等数据源类型的操作
	//实现对如下格式文件的处理 分别定义ajax
	/*
		Ni:{
			ajaxtest2:{command:'http://localhost/VESHTest/Module/help/test.tjsonp?_n=recorder',dbtype:'tjson',params:{limit:11},template:'template1'},
			ajaxtest1:{command:'http://localhost/KDAPI/Module/GetOrderTrackItems.tjsonp?_n=Order',dbtype:'tjson',params:{},template:'template1'},
			'ajaxtest1.Cache':{command:function(res,params){return res[params.cacheKey];不写即使用默认值},dbtype:'json',params:{},template:'template2'},
			'ajaxtest1.Set':{command:function(res,params){res[params.cacheKey] = params.cacheValue;不写即使用默认值},dbtype:'json',params:{timeout1:{interval:'s',number:50}},template:'template2'},
			sqlinsert:{command:'create table if not exists table1(name Text,message text,time integer);insert into table1 values(?,?,?);',dbtype:'json',params:{data:[]},template:'sqltemp'},
			sqlselect:{command:'select * from table1;',dbtype:'json',params:{data:[]},template:'sqltemp'},
			sqlselect2:{command:'select * from table1 where name=?',dbtype:'json',params:{data:[]},template:'sqltemp'}		
			Name1:{command:'',params:{},dbtype:'json/tjson',template:'仅在Middler中调用NiMultiTemplateDecorator时启用'}
		}
	*/
	/*
	var t = middler.getObjectByAppName('Ni','templatename');
	var res = t.excute('aaa.GetProductDetail',{ProductID:111},function(result){
		var res = result.last();
	});
	middler.setObjectByAppName('Ni','templatename',t);
	*/
	//分离NiDataConfig完成Ni格式文件处理
	//分离NiDataConfigConvert完成对Ni格式转成Config
	//用于处理 Ni文件定义
	{
		V.config.Configs = V.merge(V.config.Configs,{ConfigConverts:{Ni:{type:'VJ.ni.NiDataConfigConvert'}}});
		N.NiDataConfig = function(){
			var _ = this,__={};
			{
				V.inherit.apply(_,[V.config.Config,[]]);
			}
		};
		N.NiDataConfigConvert = function(){
			var _ = this,__ = {};
			{V.inherit.apply(_,[V.config.ConfigConvert,[]]);}
			_.toConfig = function(val){
				var ret =  new N.NiDataConfig();
				if(val){
					if(typeof(val) == 'object'){
						for(var i in val){
							if(val[i].command || val[i].params){
								ret.data[i] = VJ.merge({params:{}},val[i]);
							}
						}
					}
				}
				return ret;
			};
			_.toStrings = function(config){V.showException('VJ.ni.NiDataConfigConvert不支持此功能');};
		};
	}
	//分离NiTemplate进行连续事务提交和顺序操作
	{
		N.NiTemplate = function(res,cm){
			var _ = this,__ = {};
			{
				_.lstCmd = [];
				__.KEY='Ni';
				_._addCommand = function(name,params,func){
					var cmd = cm.getConfigValue(__.KEY,name);
					var command = name;
					if(cmd){						
						command = cmd.command;
						params = V.merge(cmd.params,V.getValue(params,{}));
					}
					_.lstCmd.push({name:command,params:params,func:func,template:cmd.template,key:name});
				};
				_._excute = function(){
					var _cms = _.lstCmd;
					_.lstCmd = [];
					if(_cms.length>0){
						V.tryC(function(){
							var conn = res.getDBConnection();
							if(_cms.length>1){conn.transaction = true;}
							var cmd = res.getDBCommand();
							cmd.connection = conn;
							V.whileC2(function(){return _cms.shift();},function(v,next){
								cmd.command = v.name;
								cmd.params = v.params;
								var _func = v.func;
								cmd.excute(_.result,function(data){
									V.tryC(function(){
										if(!data){
											data = false;
										}
										_.result.add(data,v.key);
										if(_func){
											_func(_.result);
										}
									});
									next();
								});	
							},function(){
								if(conn.transaction && conn.commit){conn.commit();}
								res.backDBConnection(conn);
							});
						});
					} else { V.showException('不能调用空的命令对象!'); }
					return _.result;
				};
				_.result = new N.NiDataResult();
				_.transaction = false;
			}
			_.excute = function(name,params,func){
				_._addCommand(name,params,func);
				if(!_.transaction){
					_.commit();
				}
				return _.result;
			};
			_.commit = function(){
				return _._excute();
			};
		};
		N.NiTemplateManager = function(cm,appName){
			var _ = this,__ = {};
			{
				__.KEY=V.getValue(appName,'Ni');
				__.middler = new V.middler.Middler(cm);
			}
			_.excute = function(tempName,name,params,func){
				var temp = __.middler.getObjectByAppName(__.KEY,tempName);
				if(temp){
					temp.excute(name,params,function(data){
						V.tryC(function(){
							if(func){func(data);}
						});
						__.middler.setObjectByAppName(__.KEY,tempName,temp);
					});
				}else{throw new Error('没有找到Template:'+tempName);}
			}
		};
		//获取json对象 使得不管json还是tjson都按照最终结果进行使用
		//分离NiDataResult完成获取数据工作	
		N.NiDataResult = function(){
			var _ = this,__={};
			{
				__.data = {};
				__.kv = {};
				__.datas = [];
			}
			_.get = function(key){return __.data[key]?__.data[key]:__.kv[key];};
			_.add = function(data,name){if(data){__.data[__.datas.length]=data;__.kv[name]=data;__.datas.push(data);}};
			_.last = function(){return _.get(__.datas.length-1);};
			_.each = function(key,func){
				var val = _.get(key);
				if(val && V.isArray(val)){
					V.each(val,func);
				}
			};
			_.dispose = function(){__.datas.splice(0,__.datas.length);for(var i in __.data){delete __.data[i];}};
		};
	}
	//分离NiDataResource完成static instance pool各种调用方式
	{
		N.NiDataResource = function(factory,params){
			var _ = this,__= {};
			{	
				_.fac = factory;
				_.params = V.getValue(params,{});
			}
			_.getDBConnection = function(){
				var conn = _.fac.createDBConnection();
				conn.params = V.merge(conn.params,_.params);
				conn.params.resource = V.getValue(_.params.resource,conn.params.resource);
				if(!conn.isOpen){
					conn.open();
				}
				return conn;
			};
			_.backDBConnection = function(conn){_.fac.backDBConnection(conn);}
			_.getDBCommand = function(){return _.fac.createDBCommand();}
		};
		N.NiInstanceDataResource = function(factory,params){
			var _ = this;
			{
				V.inherit.apply(_,[N.NiDataResource,[factory,params]]);
			}
		};
		N.NiStaticDataResource = function(factory,params){
			var _ = this,__ = {};
			{
				__.conn = null;
				V.inherit.apply(_,[N.NiDataResource,[factory,params]]);				
				__.getDBConnection = _.getDBConnection;
			}
			_.getDBConnection = function(){
				if(!__.conn){
					__.conn = __.getDBConnection();
				}
				return __.conn;
			};
			_.backDBConnection = function(conn){if(conn!=__.conn){if(conn.isOpen && conn.close) {conn.close();}}};
		};
		N.NiPoolDataResource = function(factory,params,size){
			var _ = this,__= {};
			{
				V.inherit.apply(_,[N.NiDataResource,[factory,params]]);
				__.getDBConnection = _.getDBConnection;
				size = V.getValue(size,50);
				__.pool = new VJ.collection.Pool(size,function(){var conn = __.getDBConnection();conn.dispose = conn.close;return conn;});
			}
			_.getDBConnection = function(){
				var val =  __.pool.getValue();
				return val;
			};
			_.backDBConnection = function(conn){
				__.pool.setValue(conn);
			};
		};
	}
	//DataFactory常用基类
	{
		N.NiDataFactory = function(){
			var _ = this,__={};
			{}
			_.createDBConnection = function(){return new NiDataConnection();};
			_.createDBCommand = function(){return new N.NiDataCommand();}
			_.backDBConnection = function(conn){
				if(conn.isOpen){
					conn.close();
				}
			};
		};
		N.NiDataConnection = function(){
			var _ = this,__ = {};
			{
				_.isOpen = false;
				_.params = {dbtype:'json'};
			}
			_.open = function(){_.isOpen = true;};
			_.close = function(){_.isOpen = false};
			_.invoke = function(cmd,func){func(false);};
		};
		N.NiDataCommand = function(){
			var _ = this,__={};
			{
				_.connection = null;
				_.command = '';
				_.params = null;
			}
			_.excute = function(result,func){
				if(!_.connection || !_.connection.isOpen){
					V.showException('数据库未连接');
					if(func){func(false);}
					return;
				} else {
					_.connection.invoke(_,function(data){
						try {
							var hasFalse = false;
							switch (typeof (data)) {
								case "string":
									if (data.replace(/^(\[+\]+)/g, '').length === 0) {
										hasFalse = true;
									} else {
										hasFalse = (data.indexOf('False') >= 0 || data.indexOf('false') >= 0)
									} 
									if(!hasFalse){
										//如何判断tjson
										data = eval('('+data+')');	
									}
									break;
								case "object":
									break;
								default:
									V.showException('V.NiDataCommand success方法 name:typeof错误 type:' + typeof (data));
									hasFalse = true;
									break;
							}            
							if(hasFalse){
								data = false;
							}
							switch(_.connection.params.dbtype){
								default:
								case 'json':
									break;
								case 'tjson':
									data = V.evalTJson(data);
									break;
							}
							if(func){func(data);}
						} catch (e) {
							V.showException('V._ajaxOption success方法', e);
							if(func){func(false);}
						}							
					});
				}
			};
		};		
	}
	//分离NiDBFactory产生NiDBConnection(Invoke) ajax localStorage sessionStorage js jsonp/getScript websocket Sqlite ObjectDB等各种资源
	{
		//ajax jsonp/getScript 构造参数可修改ajax默认参数并新增host(../|http://www.abc.con)与dbtype(json/tjson)两个属性。
		//默认dbtype为json js 建议static
		N.NiAjaxDataFactory = function(){
			var _ = this,__= {};
			{
				V.inherit.apply(_,[N.NiDataFactory,[]]);	
				__.AjaxConnection = function(){
					var _ = this,__ = {};
					{ 
						V.inherit.apply(_,[N.NiDataConnection,[]]);
						_.params = V.merge({host:'',dbtype:'json'},_.params);
					}
					_.invoke = function(cmd,func){
						V.ajax(V.merge(_.params,{
							url:(cmd.command.indexOf('http:')>=0?'':_.params.host)+cmd.command,
							data:cmd.params,
							success: function (data, status) {								
								try {
									if(func){func(data);}
								} catch (e) {
									V.showException('V._ajaxOption success方法', e);
								}
							}, error: function (request, status, error) {
								V.showException('V._ajaxOption error方法 status:' + status, error);
								if(func){func(false);}
							}
						}));
					}
				};
			}
			_.createDBConnection = function(){return new __.AjaxConnection();};
			_.backDBConnection = function(){console.log('back conn');};
		};
		//localStorage sessionStorage js ObjectDB
		N.NiObjectDataFactory = function(){
			var _ = this,__= {};
			{
				V.inherit.apply(_,[N.NiDataFactory,[]]);
				__.ObjectConnection = function(){
					var _ = this,__ = {};
					{ 
						V.inherit.apply(_,[N.NiDataConnection,[]]);
						_.params = V.merge({resource:{}},_.params);
						__.open = _.open;
						__.close = _.close;
					}
					_.open = function(){
						switch(typeof(_.params.resource)){
							case 'string':
								_.params.resource = eval('('+_.params.resource+')');
								break;
							case 'object':
								if(V.isArray(_.params.resource)){
									throw new Error('不能使用数组作为资源');
								}
								break;
							default:
								throw new Error('N.NiObjectDataFactory 无法找到<'+_.params.resource+'>对象');
								break;
						}
						__.open();						
					};
					_.close = function(){
						if(_.params.resource){
							delete _.params.resource;
						}
						__.close();
					};
					_.invoke = function(cmd,func){
						//如何区分Insert还是select
						//针对 localStorage,sessionStorage,JS对象 function(res,params){res[params.key] = params.value; return 0;}	
						//function(res,params){return res[params.key];}	
						//function(res,p){return res.func(p);}
						try {
							var data = null;
							if(typeof(cmd.command) == 'function'){
								data = cmd.command(_.params.resource,cmd.params);
							}else{
								data = eval('('+cmd.command+')(_.params.resource,cmd.params)');
							}
							try{if(func){func(data);}}catch(e){}
						} catch (e) {
							V.showException('V._ajaxOption success方法', e);
							if(func){func(false);}
						}						
					}
				};
			}
			_.createDBConnection = function(){return new __.ObjectConnection();};
		};
		//webSocket {url:''}  totest
		N.NiSocketDataFactory = function(){
			var _ = this,__= {};
			{
				V.inherit.apply(_,[N.NiDataFactory,[]]);
				if(!WebSocket){
					throw new Error(V.userAgent.name+'不支持WebSocket!');
					return;
				}
				__.SocketConnection = function(){
					var _ = this,__ = {};
					{ 
						V.inherit.apply(_,[N.NiDataConnection,[]]);
						_.params = V.merge({url:''},_.params);
						__.open = _.open;
						__.close = _.close;
						__.conn = null;
						__.datas = [];
						__.calls = {};						
						__.addData = function(data){
							__.datas.push(data);
							__.callback();
						};
						__.callback = function(){
							if(__.datas.length>0){
								V.whileC(function(){return __.datas.shift();},function(val){
									if(typeof(val) == 'string'){
										val = eval('('+val+')');
									}
									if(val.niid){
										if(__.calls[val.niid]){
											__.calls[val.niid].datas.push(val);
											__.callfunc(val.niid);
										}else{
											__.calls[val.niid] = {datas:[],func:null};
											__.calls[val.niid].datas.push(val);
										}
									}else{
										V.showException('未找到消息处理者'+V.json(val));
									}									
								});
							}
						};
						__.addCalls = function(cmd,func){
							var index = V.random();
							if(!__.calls[index]){
								__.calls[index]={datas:[],func:func};
							} else {
								__.calls[index].func = func;
							}
							//默认conn是Open的
							var val = {niid:index};
							val[cmd.command] = cmd.params;
							__.conn.send(V.toJsonString(val));
							__.callfunc(index);
						};
						__.callfunc = function(index){
							var oCall = __.calls[index];
							if(oCall && oCall.datas.length>0 && oCall.func){								
								V.whileC(function(){return oCall.datas.shift();},function(val){
									if(typeof(val) == 'string'){
										val = eval('('+val+')');
									}
									oCall.func(val);
								},function(){delete __.calls[index];});
							}
						};
					}
					_.open = function(){
						if(!_.isOpen && !__.conn){
							__.conn = new WebSocket(_.params.url);
							__.conn.onopen = function(){__.open();};
							__.conn.onclose = function(){__.close();__.conn = null;};
							__.conn.onmessage = function(evt){
								try {
									if(evt.data){__.addDatas(evt.data);}
								} catch (e) {
									V.showException('VJ.ni.NiSocketDataFactory.onmessage', e);
								}	
							};
							__.conn.onerror = function(evt){
								try {
									__.isError = true;
									__.addDatas(false);
									V.showException('VJ.ni.NiSocketDataFactory.onerror'+evt.data);
								} catch (e) {
									V.showException('VJ.ni.NiSocketDataFactory.onmessage', e);
								}
							};
						}
					};
					_.close = function(){						
						__.conn.close();
					};
					_.invoke = function(cmd,func){
						//如何区分Insert还是select						
						try {				
							__.addCalls(cmd,func);
						} catch (e) {
							V.showException('V._ajaxOption success方法', e);
							if(func){func(false);}
						}						
					}
				};
				__.SocketCommand = function(){
					var _ = this,__ = {};
					{
						V.inherit.apply(_,[N.NiDataCommand,[]]);
					}
					_.excute = function(result,func){
						if(!_.connection || !_.connection.isError){
							V.showException('WebSocket连接失败');
							if(func){func(false);}
							return;
						} else {
							_.connection.invoke(_,function(data){
								try {
									var hasFalse = false;
									switch (typeof (data)) {
										case "string":
											if (data.replace(/^(\[+\]+)/g, '').length === 0) {
												hasFalse = true;
											} else {
												hasFalse = (data.indexOf('False') >= 0 || data.indexOf('false') >= 0)
											} 
											if(!hasFalse){
												//如何判断tjson
												data = eval('('+data+')');	
											}
											break;
										case "object":
											break;
										default:
											V.showException('V.NiDataCommand success方法 name:typeof错误 type:' + typeof (data));
											hasFalse = true;
											break;
									}            
									if(hasFalse){
										data = false;
									}
									switch(_.connection.params.dbtype){
										default:
										case 'json':
											break;
										case 'tjson':
											data = V.evalTJson(data);
											break;
									}
									//特别地当回{close:true}时，关闭websocket
									if(func){if(func(data).close) {__.conn.close();}}
								} catch (e) {
									V.showException('V._ajaxOption success方法', e);
									if(func){func(false);}
								}							
							});
						}
					};					
				};
			}
			_.createDBConnection = function(){return new __.SocketConnection();};
			_.backDBConnection = function(conn){if(__.conn!=conn){if(conn.close && conn.isOpen){conn.close();}};};
			_.createDBCommand = function(){return new __.SocketCommand();}			
		};
		//{name:'',version:'1.0',desc:'',size:2*1024*1024}
		N.NiSqliteDataFactory = function(){
			var _ = this,__= {};
			{
				V.inherit.apply(_,[N.NiDataFactory,[]]);	
				__.SqliteConnection = function(){
					var _ = this,__ = {};
					{ 
						V.inherit.apply(_,[N.NiDataConnection,[]]);
						_.params = V.merge(_.params,{name:'',version:'1.0',desc:'',size:2*1024*1024});						
						__.open = _.open;
						__.close = _.close;						
					}					
					_.open = function(){
						if(!_.isOpen){
							if(openDatabase){
								__.conn = openDatabase(_.params.name,_.params.version,_.params.desc,_.params.size);
								__.open();
							} else {
								V.showException(V.userAgent.name+'不支持WebDB!');
							}
						}
					};
					_.close = function(){
						delete __.conn;
						__.close();
					};
					_.invoke = function(cmd,func){
						if(!_.isOpen || !__.conn){
							throw new Error('数据库连接已关闭');
						}
						V.tryC(function(){
							var cms = cmd.command.split(';');
							var params = V.getValue(cmd.params.data,[]);
							if((cmd.command.split('?').length-1)!=params.length){
								V.showException(cmd.command+'参数数目与输入值数目不符!!');
								if(func){func(false);}
							}
							var w = 0;
							var ret = [];
							var cmslength = cms.length-1;
							V.whileC(function(){var command = cms.shift();return '' == command?null:command;},function(command){
								//需要计算出这次使用的参数
								var _w = command.split('?').length-1;
								var p = params.slice(w,w+_w);
								w+=_w;
								__.conn.transaction(function(tx){
									tx.executeSql(command,p,function(tran,data){
										var i = -1;
										var _data = [];
										V.whileC(
										function(){
											i++;return i<data.rows.length?data.rows.item(i):null;
										},
										function(v){
											_data.push(V.merge({},v));
										},
										function(){
											ret.push(_data);
											if(ret.length>=cmslength){
												if(func){func(ret);}
											}
										},true);										
									},function(tran,error){
										console.log(error);
										V.showException(error);
										if(func){func(false);}
									});
								});
							},function(){
							},true);
						});
					};
				};
			}
			_.createDBConnection = function(){return new __.SqliteConnection();};
		};
	}
	//NiTemplateDecorator NiMultiTemplateDecorator 装饰类 使得TemplateDecorator可以添加缓存，NiMultiTemplateDecorator可以根据Ni文件中定义的template进行操作
	{
		N.NiTemplateDecorator = function(res,cacheres,cm,params){			
			var _ = this, __ = {};
			{
				V.inherit.apply(_,[N.NiTemplate,[res,cm]]);
				__.KEY = 'Ni';
				__._addCommand = _._addCommand;
				__._excute = _._excute;
				__.lstCmd = {};
				{
					__.params = V.getValue(params,{});
					//缓存专用默认方法
					_.setCommand = function(res,params){						
						params = V.merge(__.params,params);
						if(res.setItem){
							res.setItem(params.cacheKey,V.toJsonString({
								data:params.cacheValue,
								date:(params.timeout?new Date().add(params.timeout.interval,params.timeout.number).getTime():false)
							}));
						} else {
							res[params.cacheKey]={
								data:params.cacheValue,
								date:(params.timeout?new Date().add(params.timeout.interval,params.timeout.number).getTime():false)
							};
						}
					};
					//可以根据业务逻辑改为根据某个公共字段进行删除
					_.clearCommand = function(res,params){
						if(res.removeItem){
							res.removeItem(params.cacheKey,null);
						} else if(res[params.cacheKey]){
							delete res[params.cacheKey];
						}
					};
					_.cacheCommand = function(res,params){						
						var val = null;
						if(res.getItem){
							val = V.json(res.getItem(params.cacheKey));
						} else {
							val = res[params.cacheKey];
						}
						
						if(val){
							if(val.date){
								if(parseFloat(val.date) < new Date().getTime()){
									delete res[params.cacheKey];
									return null;
								}
							}
						}
						return val.data;
					};
				}
				_._addCommand = function(name,params,func){
					var index = _.lstCmd.length;
					__._addCommand(name,params,func);
					if(_.lstCmd.length!=index){
						var command = null;
						var cmd = cm.getConfigValue(__.KEY,name+'.Cache');
						if(!cmd){
							cmd = cm.getConfigValue(__.KEY,name+'.Clear');
							if(cmd){
								ommand = V.getValue(cmd.command,_.clearCommand);
							}
						}else{
							command = V.getValue(cmd.command,_.cacheCommand);
						}
						if(cmd){
							__.lstCmd[index] = {
								name:command,
								key:name,
								params:V.merge(cmd.params,{cacheKey:V.hash(name+'.Set.'+V.toJsonString(_.lstCmd[_.lstCmd.length-1].params))})
							}
						}
					}
				};
				_._excute = function(){
					var _cms = _.lstCmd;
					_.lstCmd = [];
					if(_cms.length>0){					
						V.tryC(function(){							
							var conn = res.getDBConnection();
							var cmd = res.getDBCommand();
							cmd.connection = conn;
							var i = 0;
							var func = function(v,next){
								cmd.command = v.name;
								cmd.params = v.params;
								var _func = v.func;
								cmd.excute(_.result,function(data){
									V.tryC(function(){
										if(!data){
											data = false;
										}
										_.result.add(data,v.key);
										if(_func){
											_func(_.result);
										}
									});
									if(data){
										//新增缓存
										var _nicmd = cm.getConfigValue(__.KEY,v.key+'.Set');
										if(_nicmd){
											var _conn = cacheres.getDBConnection();
											var _cmd = cacheres.getDBCommand();
											_cmd.connection = _conn;
											_cmd.command = V.getValue(_nicmd.command,_.setCommand);
											_cmd.params = V.merge(_nicmd.params,{
													cacheKey:V.hash(v.key+'.Set.'+V.toJsonString(cmd.params)),
													cacheValue:data
												});
											_cmd.excute(_.result,function(data){
												V.tryC(function(){
													try{cacheres.backDBConnection(_conn);}catch(e){}												
												});
											});
										}
									}
									i++;
									next();
								});
							};
							V.whileC2(function(){return _cms.shift();},function(v,next){	
								var _nicmd = __.lstCmd[i];
								//准备处理缓存
								if(_nicmd){
									i++;
									var _conn = cacheres.getDBConnection();
									var _cmd = cacheres.getDBCommand();
									_cmd.connection = _conn;
									_cmd.command = _nicmd.name;
									_cmd.params = _nicmd.params;
									_cmd.excute(_.result,function(data){
										V.tryC(function(){
											try{cacheres.backDBConnection(_conn);}catch(e){}
											if(!data){
												data = false;
											}
											if(data){
												_.result.add(data,v.key);
												if(v.func){
													v.func(_.result);
												}
												next();
											} else {
												func(v,next);
											}
										});
									});
								} else {
									i++;
									func(v,next);
								}
							},function(){
								res.backDBConnection(conn);
							});
						});
					} else { V.showException('不能调用空的命令对象!'); }
					return _.result;
				};
			}
		};
		//使用很多Template来完成相关操作，否则就使用默认值进行处理
		N.NiMultiTemplateDecorator = function(res,cm,relcm,appName){
			var _ = this, __ = {};
			{
				V.inherit.apply(_,[N.NiTemplate,[res,cm]]);
				__.KEY = V.getValue(appName,'Ni');				
				__.ni = new N.NiTemplateManager(relcm,__.KEY);
				__._addCommand = _._addCommand;
				__._excute = _._excute;
				__.lstCmd = {};
				_._addCommand = function(name,params,func){
					var index = _.lstCmd.length;
					__._addCommand(name,params,func);
					if(_.lstCmd.length!=index){
						var cmd = _.lstCmd[_.lstCmd.length-1];
						if(cmd.template){
							//调用templdate优先 复用其次
							__.lstCmd[index] = true;
						}
					}
				};
				_._excute = function(){
					var _cms = _.lstCmd;
					_.lstCmd = [];
					if(_cms.length>0){			
						V.tryC(function(){						
							var conn = res.getDBConnection();
							var cmd = res.getDBCommand();
							cmd.connection = conn;
							var i = 0;
							var func = function(v,next){
								cmd.command = v.name;
								cmd.params = v.params;
								var _func = v.func;
								cmd.excute(_.result,function(data){
									V.tryC(function(){
										if(!data){
											data = false;
										}
										_.result.add(data,v.key);
										if(_func){
											_func(_.result);
										}
									});
									next();
								});
							};
							var _cms2 = __.lstCmd;
							__.lstCmd = [];
							V.whileC2(function(){return _cms.shift();},function(_v,next){
								var v = _v;
								//准备处理缓存
								if(_cms2[i]){									
									i++;
									__.ni.excute(v.template,v.key,v.params,function(result){
										V.tryC(function(){
											var data = result.get(v.key);
											_.result.add(data,v.key);
											if(v.func){
												v.func(_.result);
											}
										});	
										next();
									});									
								} else {
									i++;
									func(v,next);
								}						
							},function(){
								res.backDBConnection(conn);
								_cms2 = null;
							});
						});
					} else { V.showException('不能调用空的命令对象!'); }
					return _.result;
				};
			}
		};
	}
})(VJ,jQuery);
(function(V,$){
	V.viewmodel = {APP:'VESH.viewmodel',NIAPP:'Ni'};
	var M = V.viewmodel;
	V.view = {APP:'VESH.view'};
	var W = V.view;
	
	//定义业务逻辑层的两个基本对象页面与控件
	//首先页面实例化M.Page 然后 页面绑定 W.Page 然后W.Page 调用Document.ready 将界面根据middler进行设置，并针对_对象进行初始化设置并进行binding binding完成后直接发布document.ready事件
	//一般的viewmodel层通过type定义其Middler中的控件类型实现与前端的绑定
	//一般的view层生成后通过bind命令绑定viewmodel，并提供fill命令更新viewmodel的相关字段，将自身的render命令注入viewmodel的update命令更新控件，viewmodel定义事件并由view调用，一般会在调用事件时自动调用自身的fill方法更新viewmodel，然后在属性调用时根据返回的参数更新自身。在viewmodel更新状态后，可调用update(更新{})方法完成数据在view层的填充,同时将属性更新viewmodel。
	
	{
		//分别定义view与viewmodel的Control 控件本身只支持先构建，构建与init合并，最后执行bind操作
		M.Control = function(){
			//data属性的定义 on事件的处理 update方法的主动更新
			var _ = this,__ = {};
			{
				_.bind = function(view){
					_.v = view;
				};
				_.data = V.getValue(_.data,{});
			}
		};
		var WTemplates = {};
		W.getTemplate = function(path,func){
			if(!V.isValid(path) || V.getType(path) != 'string') {
				throw new Error('控件模板不能为空或者非字符串!');
			}
			if(!WTemplates[path]){
				WTemplates[path] = new function(){
					var _ = this,__ = {};
					{
						__.funs = [];
						__.node = $(window.document.createDocumentFragment());
					}
					_.addCallback = function(fun){
						if(__.template){
							fun(__.template.clone());
						}else{
							if(fun){
								__.funs.push(fun);
							}
						}
					};
					_.callback = function(){
						V.whileC(function(){__.funs.shift()},function(v){v(__.template.clone());},function(){});						
					};
					if(path.indexOf('<')>=0){	
						__.node.append($(path));
						__.template = __.node.children(':first');
					} else {
						__.node.load(url,function(){
							__.template = __.node.children(':first');
							_.callback();
						});
					}					
				};
			}			
			WTemplates[path].addCallback(func);			
		};
		//html与css的加载 其对应的节点的替换 事件的统一触发与处理 update事件的注入 控件均支持先创建 再init 然后绑定的过程
		W.Control = function(path,params){
			var _ = this,__ = {};
			{		
				_.path = path;
				_.vm = null;
				_.events = {};
				_.params = V.getValue(params,{});
			}
			_.init = function(page,node,params){				
				_.page = page;		
				_.node = node;
				_.params = V.merge(_.params,V.getValue(params,{}));
			};
			_.call = function(name,param){
				//所有的事件调用全部采用异步调用方式 V.once
				if(param){
					_.vm.data = V.merge(_.vm.data,param);
				}
				_.vm.data = V.merge(_.vm.data,_.fill());
				name = name.toLowerCase();
				if(_.events[name]){
					V.once(function(){
						var val = _.events[name].apply(_.page.page.models,[_.vm.data,_.vm]);
						if(val && val != {}){
							_.render(val);
						}
					});
				}
			};
			//初始化viewmodel操作
			_.bind = function(vm){
				if(vm){			
					_.vm = vm;
					//完成配置合并
					_.vm.data = V.merge(_.params,V.getValue(_.vm.data,{}));
					//完成类型名注入
					_.vm.nodeName = _.nodeName;
					//完成方法注入
					_.vm.update = function(){_.render.apply(_,arguments);};
					V.forC(_.vm,function(key,value){
						key = key.toLowerCase();
						if(key.indexOf('on')==0){
							//事件注册
							_.events[key.substring(2)] = value;
						}
					},function(){_.vm.bind(_);},true);						
				} else{
					_.vm = {data:V.merge(_.params,{})};
				}
				if(_.path){
					W.getTemplate(_.path,function(node){
						_.replaceNode(node);
						_.onLoad(node);
					});
				} else {
					_.node.show();
					_.onLoad(_.node);
				}
			};
			//在更新_.vm.data
			_.fill = function(){
				return {};	
			};
			//可以将数据更新
			_.render = function(data){
				if(data){
					_.vm.data = V.merge(_.vm.data,data);
				} else {
					data = V.merge({},_.vm.data);
					//专门用于初始化操作
				}
				V.forC(data,function(key,value){
					switch(key){
						case 'attr':
							V.forC(value,function(key2,value2){_.node.attr(key2,value2);},function(){});
							break;
						case 'enable':
							if(value){_.node.removeAttr('disabled');}else{_node.attr('disabled','disabled');}
							break;
						case 'visible':
							if(value){_.node.show();} else {_.node.hide();}
							break;
					}
				});
				return data;
			};
			//处理控件下载完成后的操作
			_.onLoad = function(node){
				_.call('Ready');
				_.render();
			};
			//用于扩展给主要对象绑定事件使用 一般用于bind事件的默认值
			_.bindEvent = function(node,k,v){
				node = $(node);
				if(typeof(node[k]) == 'function'){
					node[k](function(e){
						_.call(k,{e:e});
					});
				}
			};
			_.replaceNode = function(node){
				node = $(node);
				var attrs = _.node[0].attributes;
				if(attrs){
					var i = attrs.length;
					V.whileC(function(){i--;return i>=0?{key:attrs[i].name,val:attrs[i].value}:null},function(v){node.attr(v.key,v.val);},function(){},true);
				}
				node.append(_.node.children());				
				if(_.node[0].nodeName.toLowerCase() == 'body'){					
					_.node.empty().append(node);
				}else{
					_.node.after(node).remove();
				}
				_.node = node;
			};
			_.dispose = function(){};
		};
	}
	{
		//分别定义view与viewmodel的Page
		M.Page = function(cm,data){
			var _ = this,__ = {};
			{
				_.models = V.getValue(data,{});
				//默认使用配置作为事件定义
				V.inherit.apply(_,[M.Control,[]]);
				_.page = _.models.page?_.models.page:{};
				_.data = _.page.data?_.page.data:{};
				if(cm){
					switch(V.getType(cm)){
						case 'object':
						case 'Object':
							if(cm.getConfigValue){
								_.config = cm;
							} else {
								_.config = V.config.getApplicationConfigManagerFromObj(cm);
							}
							break;
						case 'string':
							cm = eval('('+cm+')');
							_.config = V.config.getApplicationConfigManagerFromObj(cm);
					}
				} else {
					_.config = V.config.getApplicationConfigManagerFromObj();
				}
				_.middler = new V.middler.Middler(_.config);
				_.ni = new V.ni.NiTemplateManager(_.config,M.NIAPP);
				_.session = _.middler.getObjectByAppName(M.APP,'SessionDataManager');
				_.hasRight = function(name,isAdmin){
					//TO修改
					if (V.getValue(isAdmin, false) && (typeof (User) == 'undefined' || !V.isValid(User))) { return false; }
					if (User) {
						//添加后门
						if (!V.isValid(Pers)) { V.showException("permission.js不存在"); return false; }
						//if(VJ.getValue(checkAdmin,true) && (V.isValid(pers))) return true;
						var id = V.getValue(Pers[name], '_');
						return (V.getValue(User.PIDS, '').indexOf(',' + id + ',') >= 0);
					}
					return false;
				};
				_.getModels = function(id){return id?(_.models[id]?_.models[id]:null):_.models;};
				_.setModels = function(id,v){_.models[id] = v;};
				__.bind = _.bind;
				_.bind = function(view){__.bind(view);_.page.v = view;}
				{
					//初始化操作
					var _page = _.middler.getObjectByAppName(W.APP,'page');					
					if(!_page){throw new Error('没有找到page对应的页面view层对象'); }					
					_page.ready(function(){
						_page.init(_page,$(document.body));
						_page.bind(_);
					});
				}
			}
		};
		W.Page = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path]]);
				_.views = {};
				_.controls = [];		
				__.render = _.render;
			}
			//一般调用M.Page对象都比较特殊
			_.bind = function(page){
				var vm = page.page;
				_.page = page;
				if(vm){
					_.vm = vm;
					//完成配置合并
					_.vm.data = V.merge(_.params,V.getValue(_.vm.data,{}));
					//完成方法注入
					_.vm.update = function(){_.render.apply(_,arguments);};
					V.forC(vm,function(key,value){
						key = key.toLowerCase();
						if(key.indexOf('on')==0){
							//事件注册
							_.events[key.substring(2)] = value;
						}
					},function(){page.bind(_);},true);								
				} else {
					_.vm = {data:V.merge(_.params,{})};
				}				
				if(_.path){
					W.getTemplate(_.path,function(node){
						_.replaceNode(node);
						_.onLoad(node);
					});
				} else {
					_.node.show();
					_.onLoad(_.node);
				}
				_.middler = page.middler
				_.ni = page.ni;
				_.session = page.session;
				_.config = page.config;
			}
			_.dispose = function(){_.call('dispose');_.session.updateAll();};
			//用于重载触发方式
			_.ready = function(func){
				$(function(){func();_.bindControl();});
				window.onbeforeunload = _.dispose;
			};
			//用于覆盖引起页面布局改变
			_.onReady = function(){
			};			
			_.call = function(name,param){
				//所有的事件调用全部采用异步调用方式 V.once
				if(param){
					_.vm.data = V.merge(_.vm.data,param);
				}
				_.vm.data = V.merge(_.vm.data,_.fill());
				name = name.toLowerCase();
				if(_.events[name]){
					V.once(function(){
						var val = _.events[name].apply(_.page.getModels(),[_.vm.data,_.vm]);
						if(val && val != {}){
							_.render(val);
						}
					});
				}
			};
			//用于绑定对应的控件
			_.bindControl = function(){
				//这里应该由真实的View层调用使用document.ready实现
				var p = _.node.find('[_]').toArray();				
				V.whileC(function(){return p.shift();},function(v1){
					v = $(v1);
					var nodeName = v[0].nodeName.toLowerCase();
					var obj = _.middler.getObjectByAppName(W.APP,nodeName);
					if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+nodeName);
					obj.init(_,v,V.isValid(v.attr('_'))?eval('({'+v.attr('_')+'})'):null);
					_.controls.push(obj);
					var id = v.attr('id');
					if(!id) {
						id = nodeName+V.random();
					}
					obj.nodeName = nodeName;
					if(!_.page.getModels(id)){
						_.page.setModels(id,{data:{}});
						_.controls.push(_.page.getModels(id));
					}
					_.views[v.attr['id']] = obj;
					V.inherit.apply(_.page.getModels(id),[M.Control,[]]);
					obj.bind(_.page.getModels(id));		
				},function(){
					//实现通过type属性完成数据初始化的功能
					V.forC(_.page.getModels(),function(key,v){
						if(v.type && !v.v){
							var obj = _.middler.getObjectByAppName(W.APP,v.type);
							if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
							var node = V.newEl('div');
							_.node.append(node);
							obj.init(_,node,null);
							_.controls.push(obj);
							_.views[key] = obj;
							V.inherit.apply(v,[M.Control,[]]);
							obj.bind(v);
						}
					},function(){
						_.onReady();
						_.call('start');
					});
				});
			};
			//动态添加控件到指定位置 如果不指定那么会添加到最后
			_.addControl = function(node,v){
				var obj = _.middler.getObjectByAppName(W.APP,v.type);
				if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
				node = node?node:V.newEl('div');
				_.node.append(node);
				obj.init(_,node,null);
				_.controls.push(obj);
				var key = V.random();
				_.views[key] = obj;
				V.inherit.apply(v,[M.Control,[]]);
				_.vm.models = V.merge(_.vm.models,{key:v});
				obj.bind(v);
				return v;
			};
			//可以将数据更新
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'title':
							document.title = value;
							if(data != _.vm.data) {delete data[key];}
							break;						
					}
				});
				return data;
			};
		};
	}
	{
		//sessionAdapter添加处理业务逻辑 供人重新赋值
		M.SessionDataManager = function(ada){
			var _ = this,__ = {};
			{
				__.ada = ada;
				__.data = {};
				if(!__.ada){throw new Error('SessionDataManager 需要设置SessionDataAdapter');}
			}
			_.data = function(name){
				if(!__.data[name]){
					__.data[name] = {};
					__.data[name] = __.ada.fill(name);
				}
				return __.data[name];
			};
			//支持 session.update('会话key',[data]);
			_.update = function(name,data){
				__.data[name] = V.merge(_.data(name),V.getValue(data,{}));
				__.ada.update(__.data[name],name);
			};
			_.updateAll = function(){
				var ret = [];
				for(var i in __.data){
					ret.push({key:i,value:__.data[i]});
				}
				V.whileC(function(){ret.shift();},function(v){_.update(v.key,v.value);},function(){},true);
			};
			_.clear = function(){};
			_.isLogin = function(){};
		};
		M.SessionDataAdapter = function(resource){
			var _ = this,__ = {};
			{
				__.resource = resource;
				__.ress = {};
			}
			_.setResource = function(name,res){				
				__.ress[name] = res;
			};
			_.getResource = function(name){
				return __.ress[name]?__.ress[name]:__.resource;
			};
			_.fill = function(name){
				return V.getValue(_.getResource(name).load(name),{});
			};
			_.update = function(data,name){
				_.getResource(name).save(name,V.getValue(data,{}));
			};
		};
		//专门用于继承使用
		M.SessionDataResource = function(){
			var _ = this,__ = {};
			{}
			_.load = function(name){return '';};
			_.save = function(name,data){};
		};
		//定义时必须说明cookie.js的位置
		M.CookieDataResource = function(param){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[M.SessionDataResource,[]]);
				if(!$.cookie){
					V.include('jquery.cookie.js');
				}
				if(!$.cookie){
					V.showException('下载不到jquery.cookie.js')
				}
				__.param = V.getValue(param,{});
			}
			_.load = function(name){
				var val = $.cookie(name);
				var data = {};
				if(val) {
					var args = decodeURIComponent(val).replace(/\+/g, ' ').split('&'); // parse out name/value pairs separated via &
					// split out each name=value pair
					for (var i = 0; i < args.length; i++) {
						var pair = args[i].split('=');
						var name = decodeURIComponent(pair[0]);

						var value = (pair.length == 2)
							? decodeURIComponent(pair[1])
							: name;
						data[name] = value;
					}
					return data;
				} else return {};
			};
			_.save = function(name,data){
				//处理json变str
				switch(typeof(data)){
					case 'string':
					case 'String':
						$.cookie(name,data,__.param);
						break;
					default:
					case 'object':
					case 'Object':
						$.cookie(name,$.param(V.getValue(data,{})),__.param);
						break;
				}
			};
		};
		//处理localStorage与sessionStorage 与 全局对象ObjectDB
		M.StorageDataResource = function(storage,timeout){
			var _ = this,__={};
			{
				V.inherit.apply(_,[M.SessionDataResource,[]]);
				__.storage = V.getValue(storage,window.sessionStorage);
				//默认缓存8个小时
				__.timeout = V.getValue(timeout,{interval:'h',number:'8'});
				if(!storage){
					throw new Error('不可使用此对象缓存，当前浏览器版本不支持!');
				}				
				_.load = function(name){
					var val = null;
					if(__.storage.getItem){
						val = V.json(__.storage.getItem(name));
					} else {
						val = __.storage[name];
					}					
					if(val){
						if(val.date){
							if(parseFloat(val.date) < new Date().getTime()){
								delete __.storage[name];
								return null;
							}
						}
					}
					return val.data;
				};
				_.save = function(name,str){
					str = V.getValue(str,'');
					if(!str){  
						if(__.storage.removeItem){
							__.storage.removeItem(name);
						} else {
							delete __.storage[name];
						}
						return;
					}
					if(__.storage.setItem){
						__.storage.setItem(name,V.toJsonString({
							data:str,
							date:(timeout?new Date().add(timeout.interval,timeout.number).getTime():false)
						}));
					} else {
						__.storage[name]={
							data:str,
							date:(timeout?new Date().add(timeout.interval,timeout.number).getTime():false)
						};
					}
				};
			}
		};
		//todo 加解密DataResource
	}
	{
		W.TextBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<span><span style="display:none;"></span><input type="text"></input></span>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				_.txt = node.find('span:first');
				_.input = node.find('input:first');
				V.forC(_.events,function(k,v){
					switch(k){
						case 'hover':
							_.node.hover(function(){
								_.call('Hover',{hover:true});
							},function(){
								_.call('Hover',{hover:false});
							});
							break;
						default:
							_.bindEvent(_.input,k,v);
							break;
					}
				},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {text:_.input.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'text':
							_.input.val(value);
							delete data[key];
							break;
						case 'name':
							_.input.attr('name',value);
							delete data[key];
							break;
						case 'key':
							_.txt.text(value).show();
							delete data[key];
							break;
						case 'size':
							_.input.attr('size',value);
							delete data[key];
							break;
					}
				});
				return data;
			};			
		};
		W.RadioBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="radio"></input></span>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.fill = function(){
				return {checked:_.input.attr('checked')?true:false};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'checked':
							V.setChecked(_.input,value);
							delete data[key];
							break;
					}
				});
				return data;
			};
		};
		W.CheckBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.RadioBox,[path || '<span><span style="display:none;"></span><input type="checkbox"></input></span>']]);
			}
		};
		W.Select = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<span><span style="display:none;"></span><select></select></span>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				_.txt = node.find('span:first');
				_.sel = node.find('select:first');
				V.forC(_.events,function(k,v){
					_.bindEvent(_.sel,k,v);
				},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {val:_.sel.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'options':
							_.sel.empty();
							if(V.getType(value) == 'string'){
								value = eval('('+value+')');
							};
							V.forC(value,function(k,v){
								_.sel.append('<option value="'+v+'">'+k+'</option>');
							});
							break;
						case 'name':
							_.sel.attr('name',value);
							break;
						case 'key':
							_.txt.text(value).show();
							break;
					}
				});
				return data;
			};
		};
		W.Hidden = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<input type="hidden"></input>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){_.bindEvent(node,k,v);},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {val:_.node.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'value':
							_.node.val(value);
							break;
						case 'name':
							_.node.attr('name',value);
							break;
					}
				});
				return data;
			};
		};		
		W.PasswordBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="password"></input></span>']]);
				__.render = _.render;
			}
			_.render = function(data){
				data = __.render(data);				
				V.forC(data,function(key,value){
					switch(key){
						case 'alt':
						case 'passchar':
							_.input.attr('alt',value);							
							break;
					}
				});
				return data;
			};
		};		
		W.Button = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="button"></input></span>']]);
				__.render = _.render;
			}
			_.fill = function(){return {};};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'name':
							_.input.attr('name',value);
							break;
						case 'key':
							_.txt.text(value).show();
							break;
						case 'text':
							_.input.val(value);
							break;
					}
				});
				return data;
			};
		};
		W.Submit = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Button,[path || '<span><span style="display:none;"></span><input type="submit"></input></span>']]);
			}
		};
		W.Reset = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Button,[path || '<span><span style="display:none;"></span><input type="reset"></input></span>']]);
			}
		};
		W.Form = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<form method="get" action=""></form>',{enctype:'multipart/form-data'}]]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){_.bindEvent(node,k,v)},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {value:_.node.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'method':
							_.node.attr('method',value);
							break;
						case 'action':
							_.node.attr('action',value);
							break;
						case 'target':
							_.node.attr('target',value);
							break;
						case 'name':
							_.node.attr('name',value);
							break;
						case 'enctype':
							_.node.attr('enctype',value);
							break;							
						case 'enctype':
							_.node.attr('enctype',value);
							break;
					}
				});
				return data;
			};
		};
		//todo file
	}
})(VJ,jQuery);
