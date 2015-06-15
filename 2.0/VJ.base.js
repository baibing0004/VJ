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
		var funrep1 = function(s,o){
			var reg = /<%=[^(%>)]+%>/gi;
			return s.replace(reg,function(word){
				var prop = word.replace(/<%=/g,'').replace(/%>/g,'');
				if(V.isValid(o[prop])){
					return o[prop];
				}else{
					return "";
				}
			});
		}
		var funrep2 = function(s,o){
			var reg = /\{[^(})]+\}/gi;
			return s.replace(reg,function(word){
				var prop = word.replace(/\{/g,'').replace(/\}/g,'');
				if(V.isValid(o[prop])){
					return o[prop];
				}else{
					return "";
				}
			});
		};
		V.format = function(s,o){
			if(!s || !o) {return V.getValue(s,'');}
			if(s.indexOf('<%='>=0)){s = funrep1(s,o);}
			if(s.indexOf('{'>=0)){s = funrep2(s,o);}
			return s;
		};
		//定义的StringBuilder类
		V.sb = function(){return new function(){
			var _ = this,__ = {};
			{	
				__.data= [];
				__.length = 0;
			}
			_.append = function(str){
				str = V.getValue(str+'','');
				__.data.push(str);
				__.length += str.length;
				return _;
			};
			_.appendFormat = function(format,data){
				return _.append(V.format(format,data));
			};
			_.insert = function(start,data){
				var str = _.toString();
				data = V.getValue(data+'','');
				__.data = [str.substr(0,start),data,str.substr(start)];
				__.length = str.length+data.length;
				return _;
			};
			_.insertFormat = function(start,format,data){
				return _.insert(start,V.format(format,data));
			};
			_.remove = function(start,length){
				var str = _.toString();
				__.data = [str.substr(0,start),str.substr(start+length)];
				__.length = Math.max(0,str.length-length);
				return _;
			};
			_.toString = function(){
				return __.data.join('');
			};
			_.clear = function(){
				var s = _.toString();
				__.data = []
				__.length = 0;
				return s;
			};
			_.length = function(){return __.length;};
		};};
	}
	{
		//数组处理
		V.isArray = function (obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		};
		V.each = function(data,func,finalF,isSync){
			var _ = this;
			var index = 0;
			data = Array.prototype.slice.call(data, 0);
			V.whileC(function(){return data.shift();},func,finalF,isSync);
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
		};		
		V.forC2 = function(data,func,finalf,isSync){
			var ret = [];
			for(var i in data){
				ret.push({key:i,value:data[i]});
			}
			V.whileC(function(){return ret.shift();},function(v,next){if(func){V.tryC(function(){func(v.key,v.value,next);});}},finalf,isSync);
		};
		//whileC 方法要求 四个参数 exp 给出需要处理的值，func进行处理，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的但是不保证前后两次调用是顺序的只能保证是异步的 第四个参数如果为真那么就是同步执行
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
		//whileC2 方法要求 四个参数 exp 给出需要处理的值，func进行处理，同时当处理完成是 调用 第二个参数执行next方法，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的而且保证前后两次调用是顺序的 第四个参数如果为真那么就是同步执行
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
		//VJ.inherit.apply(this,[parent,[……args]])
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
			var ret = {};
			if(typeof(type)=='function'){
				type.apply(ret,V.isArray(args)?args:[args]);
			} else V.showException('请传入类定义');
			return ret;
			//return new function(){var _ = this;V.inherit.apply(_,[type,args]);}
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
					if (source[i] != undefined) {
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
		var start = null;
		V.watch = function(restart){
			if(!start || restart){
				start = new Date();
				console.log('VJ.watch开始'+start);
			} else {
				console.log('VJ.watch 持续了:'+start.diff('ms',new Date()));
			}			
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
				var _ = $(this);
				_.val(_.val.substring(0, _.attr("maxlength")));
			});
		};
		V.fill = function (node, data) {
			$(node.find('[__]')).each(function (i, v) {
				v = $(v);
				var option = V.merge({ formatter: function (val, v, data) { return val; } }, eval('[{' + v.attr('__') + '}]')[0]);
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
			$(sor.find('[__]')).each(function (i, v) {
				V.tryC(function () {
					v = $(v);
					var node2 = func();
					aim.append(node2);
					var option = V.merge({ formatter: function (val, v, data) { return val; } }, eval('[{' + v.attr('__') + '}]')[0]);
					var val = V.getValue(data[option.field], '');
					val = option.formatter.apply(node2, [val, node2, data]);
					if(V.isValid(option.cssClass)){
						node2.addClass(option.cssClass)
					}
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
			var data = (e && e.originalEvent.clipboardData) || window.clipboardData;
			return data.getData('text');
		};
		V.setClipBoardText = function(e,val){
			if(e && e.originalEvent.clipboardData){
				e.originalEvent.clipboardData.setData('text/plain',val);
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
								data = data.replace(/[\r\n]+/g,'');
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
				V.once(function(){func.apply(null, data);});
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
				V.each(funs,function (func) {
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
			//等同_VJ_QueryString.prototype.get
			this.get = function (key, default_) {
				var value = this.params[key];
				return (value != null) ? value : default_;
			};
			this.contains = function (key) {
				var value = this.params[key];
				return (value != null);
			};
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
