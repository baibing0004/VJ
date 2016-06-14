//兼容IE7
if(typeof (console) == 'undefined'){
	window.console={
		log:function(e){}
	}
}
//命令注册变量
//很多地方用不了 接驳原型链报错 直接调用逻辑控件的update报错 "use strict"
if (top.location == location) {
    if (!window.top.VJ) {
        //跨域
        window.top.VJ = {cross:false};
    }
    VJ = window.top.VJ;
} else {
    if (!window.VJ) {
        window.VJ = {cross:true};
    }
    VJ = window.VJ
}
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
		//异步处理数组的方法
		V.each = function(data,func,finalF,isSync){
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
		//异步遍历对象的方法
		V.forC = function(data,func,finalf,isSync){
			var ret = [];
			for(var i in data){
				ret.push({key:i,value:data[i]});
			}
			V.whileC(function(){return ret.shift();},function(v){if(func){func(v.key,v.value);}},finalf,isSync);
		};
		//异步链式遍历对象的方法,需要func显式调用传入的next方法
		V.forC2 = function(data,func,finalf,isSync){
			var ret = [];
			for(var i in data){
				ret.push({key:i,value:data[i]});
			}
			V.whileC2(function(){return ret.shift();},function(v,next){if(func){V.tryC(function(){func(v.key,v.value,next);});}},finalf,isSync);
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
		//异步最终处理 其结果集最终处理的方式 function(共享的json对象 {})
		V.finalC = function(){
			var funs = [];
			for(var i=0;i<arguments.length;i++){if(typeof(arguments[i]) == 'function') funs.push({key:funs.length,func:arguments[i]});}
			if(funs.length>1){
				var data = {},finalF = funs.length>0?funs.pop().func:null,len=funs.length,ret={};
				var ff = function(key){ret[key]=true;var retlen=0;for(var k in ret){retlen++;};if(retlen==len){finalF.apply(null,[data]);}};
				V.each(funs,function(v){var value = v;value.func.apply(null,[data,function(){ff(value.key);}]);},null,false);
			} else {finalF.apply(null,[{}]);}
		};
		//异步顺序处理 其结果集最终处理的方式 function(共享的json对象 {})
		V.next = function(){
			var funs = [];
			for(var i=0;i<arguments.length;i++){if(typeof(arguments[i]) == 'function') funs.push({key:funs.length,func:arguments[i]});}
			if(funs.length>1){
				var data = {},finalF = funs.length>0?funs.pop().func:null;
				V.whileC2(function(){return funs.shift();},function(v,next){if(v){v.func.apply(null,[data,next]);}},function(){finalF.apply(null,[data])},false);
			} else { if (funs.length > 0) { funs[0].func.apply(null, [{}]); }}
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
				if(this.__proto__ && !this.__proto__.isF){
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
		V.create = function (type, args) {
            if (typeof (type) == 'function') {
                args = V.isArray(args) ? args : [args];
                var ret = '(new type(';
                if (V.isArray(args)) {
                    for (var i in args) {
                        ret += 'args[' + i + '],'
                    }
                    if (args.length > 0) {
                        ret = ret.substr(0, ret.length - 1);
                    }
                }
                return eval(ret + '))');
            } else V.showException('请传入类定义');
        };
		V.create2 = function(type,args){
			var ret = '(new '+type+'(';
			if(V.isArray(args)){
				for(var i in args){
					ret+='args['+i+'],'
				}
				if(args.length>0){
					ret = ret.substr(0,ret.length-1);
				}
			}
			return eval(ret+'))');
		};
		//用于数组，对象的深度合并功能。moveIndex属性用于设定移动至的位置，mergeIndex只用于合并数组中的第几个对象 需要进入reference 当为true时会发生状态的改变
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
						for (var i in source) {
							aim.push(_clone(source[i]));
						}
						return aim;
					default:
						return source;
						break;
				}
			};
			var _merge = function (aim, source) {				
				if (!(typeof (source) == 'object' && !V.isArray(source))) { return aim; }
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
											if (aim[i].length < (k.mergeIndex + 1)) {
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
			if(argu.length>0 && true == argu[argu.length-1]){
				var _ = argu[0];
				for (var i2 = 1; i2 < argu.length; i2++)
					_ = _merge(_, argu[i2]);
				return _;
			}else{
				var _ = {};
				for (var i2 = 0; i2 < argu.length; i2++)
					_ = _merge(_, argu[i2]);
				return _;
			}
		};
	}
	//自动判断获取userAgent状态
	{
		
		V.userAgent = {
			ie: false,
			firefox: false,
			chrome: false,
			safari: false,
			opera: false,
			mobile:false,
			pc:false,
			pad:false,
			iphone:false,
			android:false,
			refresh:function(){
				V.userAgent.width = (function(){
					//兼容IOS 与 andriod 但是千万不要设置body的高度为定制 应该为100%
					if (document.body && document.body.clientWidth > 0)
						return document.body.clientWidth;
					else
						return document.documentElement.clientWidth;
				})();
				V.userAgent.height = (function(){
					//兼容IOS 与 andriod 但是千万不要设置body的高度为定制 应该为100%
					if (document.body && document.body.clientHeight > 0)
						return document.body.clientHeight;
					else
						return document.documentElement.clientHeight;
				})();
			}
		};
		V.userAgent.refresh();
		var ua = navigator.userAgent.toLowerCase();
		var s;
		(s = ua.match(/msie ([\d]+)/)) ? V.userAgent.ie = s[1] :
		(s = ua.match(/firefox\/([\d.]+)/)) ? V.userAgent.firefox = s[1] :
		(s = ua.match(/chrome\/([\d.]+)/)) ? V.userAgent.chrome = s[1] :
		(s = ua.match(/opera.([\d.]+)/)) ? V.userAgent.opera = s[1] :
		(s = ua.match(/version\/([\d.]+).*safari/)) ? V.userAgent.safari = s[1] : 0;
		(s = ua.match(/(mobile)/)) ? V.userAgent.mobile = true : false;
		(s = ua.match(/(ipad)|(mediapad)/)) ? (V.userAgent.pad = true,V.userAgent.mobile = false) : false;
		(s = ua.match(/(android)|(linux)/)) ? (V.userAgent.android = true) : false;
		(s = ua.match(/(iphone)|(mac)/)) ? (V.userAgent.iphone = true) : false;
		V.userAgent.pc = !(V.userAgent.mobile || V.userAgent.pad);
		for (var key in V.userAgent) { if (key!='pc' && key!='width' && key!='height' && key!='refresh' && V.getValue(V.userAgent[key], false)) { V.userAgent.name = key; } }
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
					content += ("\r\nname:" + e.name + "\r\nmessage:" + e.message + (e.stack ? ("\r\nstack:" + e.stack + (e.fileName?("\r\nfile:" + e.fileName):'') + (e.lineNumber?("\r\nlineNumber:" + e.lineNumber):'')) : (V.userAgent.ie ? ("\r\ndescription:" + e.description) : "")));
				}
				//V.alert('未捕获异常',content);
				//alert('未捕获异常:' + content);
				console.log('未捕获异常:'+content)
				//throw e;
			}
		};
		V.tryC = function (func) {try{func();} catch (e) { V.showException('', e);}};
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
				elm.html(txt);
			}
			if (style != "") {
				elm.addClass(style);
			}
			return elm;
		};
		V.encHtml = function (html) {
			//20120328 白冰 只转换标点符号!    
			//return encodeURIComponent(V.getValue(html, '').replace(/\r\n/g, ''));
			return (V.getValue(html, '').replace(/[\r\n]+/g, '>v>j>').replace(/\s+/g, ' ').replace(/>v>j>/g, '\r\n').replace(new RegExp('~|(\r\n)|!|@|#|\\$|%|\\^|;|\\*|\\(|\\)|_|\\+|\\{|\\}|\\||:|\"|\\?|`|\\-|=|\\[|\\]|\\\|;|\'|,|\\.|/|，|；', 'g'), function (a) { return encodeURIComponent(a); }));
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
					if (V.isValid(chk.get(0))){
						chk.get(0).defaultChecked = value;
						chk.get(0).checked = value;
					}
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
		V.getChecked = function(node){
			if (V.userAgent.ie6 || V.userAgent.ie7) {
				if (V.isValid(node.get(0))){
					return node.get(0).checked;
				}
				return null;
			} else {
				return node.prop?node.prop('checked'):node.attr('checked');
			}
		};
		V.maxlength = function () {
			$("textarea[maxlength]").unbind('change').change(function (event) {
				var _ = $(this);
				_.val(_.val.substring(0, _.attr("maxlength")));
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
				async: true,
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
								data = data.replace(/[\r\n]+/g,'');
								if (data.replace(/^(\[+\]+)/g, '').length === 0) {
									hasFalse = true;
								} else {
									hasFalse = (data.toLowerCase().indexOf('[false') >= 0?
													(data.toLowerCase().indexOf('[false:') >= 0?(function(){
														var _data = data.toLowerCase().match(/\[false:[^\]]+\]/g);
														if(_data && _data.length>0){
															return _data[0].substr(7,_data[0].length-8);
														} else return true;
													})():true):
													false);
								}
								break;
							case "object":
								if(data){
									$(data).each(function (i, v) {
										v=v+'';
										hasFalse = (hasFalse || v == 'False' || v == 'false');
									});
								} else hasFalse = true;
								break;							
							case 'undefined':
							default:
								V.showException('V.Query success方法 name:typeof错误 type:' + typeof (data));
								hasFalse = true;
								break;
						}            
						if (!hasFalse) {
							setTimeout(function () { V.tryC(function () {_this.bindData.apply(_this, [_this.filtData(eval(data))]); }); }, 1);
						} else {
							setTimeout(function () { V.tryC(function () {_this.noData(hasFalse);});}, 1);									
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
			if (V.userAgent.ie) {
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
			var isOpera = ua.indexOf("opera") > -1
			var isIE = !isOpera && ua.indexOf("msie") > -1
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
		var getHost = function(url){
			var ret = (url+'').match(/http:\/\/[^\/]+/g)+'';										
			if(ret && ret.length>0) {return ret.substr(7);}
			else {return '';}
		};
		V.isCrossdomain = function(url){
			var host = getHost(url);
			return !(host.eq('') || host.eq(getHost(window.location.href)+''));
		};
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
				//异步if 
				if(V.isCrossdomain(url) && typeof(XDomainRequest) != 'undefined'){
					V.showException('跨域同步加载仅支持Chrome40以上，IE10以上版本，而且js跨域加载的IIS返回头部添加Access-Control-Allow-Origin: * 版本，如果仍然不可用请在config.js中将可能跨域请求path路径上的js的转入头部，或者在页面onStart时先获取原需要异步获取的对象!');
					var request = new XDomainRequest();
					request.open("GET",url);
					request.timeout = 5000;
					request.send();
					console.log('xdomainrequest');
					_V_AppendScript(request.responseText, callback)
					if(callback){
						callback();
					}
				}else{
					var thisJsDom = new _V_();
					thisJsDom.create(url, "get", null, false, function (data) {
						_V_AppendScript(data, callback)
					});
					if(callback){
						callback();
					}
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
						window.setTimeout(function () {
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
			var caller = arguments.caller;
			var comms = V.getSettings('comms',[]);
			var func = comms[name];
			data = V.isArray(data)?data:[data];
			if (V.isValid(func) && typeof (func) == 'function') {
				V.once(function(){func.apply(caller, data);});
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
		并约定1分钟内 允许注册者多次被触发
		--案例
		V.registEvent('showXXList',getData),V.registEvent(['showXXList',''],getData)
		*/
		V.registEvent = function (name,func,isTop) {
			var fun = function(name,func,isTop){
				var events = V.getSettings('events',[]);
				var funs = events[name];
				if (!V.isValid(funs)) {
					funs = [];
					events[name] = funs;
				}
				if (typeof (func) == 'function') {
					if(isTop && !funs.top){
						funs.top = func;
						funs.unshift(func);
					} else {
						if(isTop && funs.top){V.showException('V.registEvent:'+name+' 事件已经有订阅者被置顶!');}
						funs.push(func);
					}					
					var ecall = V.getSettings('eventcall',{});
					ecall = ecall[name]?ecall[name]:{};
					if(ecall.time && ecall.time>=(new Date().getTime())){
						V.once(function(){
							func.apply(ecall.caller,ecall.data);
						});
					}
				}
			};
			if(V.isArray(name)){
				V.each(name,function(v){
					fun(v,func,isTop);
				},null,true);
			} else {
				fun(name,func,isTop);
			}
		};
		/*
		V用于调用被调用页面注册的事件以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
		并约定1分钟内 允许注册者多次被触发
		--案例
		V.callEvent('showXXList',[{id:1}])
		*/
		V.callEvent = function (name, data) {
			var caller = arguments.caller;
			var events = V.getSettings('events',[]);
			var funs = events[name];
			data = V.isArray(data)?data:[data];
			if (V.isValid(funs) && V.isArray(funs)) {
				V.each(funs,function (func) {
					//报错不下火线
					V.tryC(function () {
						func.apply(caller,data);
					});
				});
			}
			var ecall = V.getSettings('eventcall',{});
			if(!ecall[name]){ecall[name] = {};}
			ecall = ecall[name];
			ecall.time = new Date().add('n',1).getTime();
			ecall.data = data;
			ecall.caller = caller;
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
		String.prototype.eq = function(str,isOri){			
			str = str+'';
			return isOri?(this == str):(this.toLowerCase() == str.toLowerCase());
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
			if(typeof(path) == 'string' && path.indexOf(';')>=0){path = path.split(';');}
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
			try{
				return cm.getConfigValue(KEY,new function(){
					var _ = this;
					{}
					_.getValue = function(config){
						return config.getValueByName(app,name);
					};
				});
			}catch(e){
				V.showException(app+":"+name,e);				
			}
		};
		_.setObjectByAppName = function(app,name,val){
			try{
				return cm.setConfigValue(KEY,new function(){
					var _ = this;
					{}
					_.setValue = function(config,val){
						return config.setValueByName(app,name,val);
					};
				},val);
			} catch(e) {
				V.showException(app+":"+name,e);
			}
		};
		_.getTypeByAppName = function(app,name){
			try{
				return cm.getConfigValue(KEY,new function(){
					var _ = this;
					{}
					_.getValue = function(config){
						return config.getTypeByName(app,name);
					};
				});
			} catch(e) {
				V.showException(app+":"+name,e);
			}
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
			host:'',
			pack:'',
			ObjectName:{type:'',path:'',method:'',mode:'',constractparalength:'',params:[
				{type:'',path:'',method:'',mode:'',constractparalength:''},
				{ref:''},
				{a:1,b:2},
				{a:1},
				{b:2},
				'',
				1,
				{middler:true},
				{self:true}
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
			__.scripts = {},__.spascripts=[];
            __.loadScript = function (key) { if (__.scripts[key]) { console.log(key + '代码已经注入'); } else if (__.scripts._skey) { console.log(__.scripts._skey + '已注册但是尚未有代码注入'); } else if(__.spascripts.length>0){__.scripts[key] = __.spascripts.pop();} else __.scripts._skey = key; };
            __.clearload = function () { delete __.scripts._skey; };
            __.getScript = function (key) { return __.scripts[key]; };
            //切记在代码中使用V.registScript的对象在被继承时必须使用middler重新获取类型方可继承
			V.registScript = __.registScript = function (func) { if (__.scripts._skey) { var key = __.scripts._skey; delete __.scripts._skey; __.scripts[key] = func; } else __.spascripts.push(func); }
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
								app[name] = __.convertContainer(config,val,defParam,app,pcm);
								paras.push({ref:defParam.app,name:name});
							} else if(val.path){
								var name = V.random()+'';
								app[name] = __.convertContainer(config,val,defParam,app,pcm);
								paras.push({ref:defParam.app,name:name});
							} else if(val.self){
								paras.push(pcm);
							} else if(val.middler){
								paras.push(new M.Middler(pcm));
							} else if(val.params){
								var _v = {params:val.params};
								for(var i in val){
									if(i!='params'){									
										if(val[i].type){
											var name = V.random()+'';
											app[name] = __.convertContainer(config,val[i],defParam,app,pcm);
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
							app[name] = __.convertContainer(config,{params:val},defParam,app,pcm);
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
				var spapath = V.getValue(v.spapath,false);
				var host = V.getValue(v.host,defParam.host);
				var type = ((V.isValid(v.type) && v.type.indexOf('\.') == 0) ? defParam.pack : '') + v.type;
                if (type == 'undefined' && !V.isValid(v.ref)) {
                    if(V.isValid(v.path) || V.isValid(v.spapath)) { 
                        type = v.type = '' + V.random(); 
                    } else if (V.isValid(v.params)) {
                        method = "objects";
                    } else {
                        method = "self";
                    }
                }
				var constructorparalength = V.getValue(v.constructorparalength,defParam.constructorparalength);
				//使用Objects的默认配置对下传递 仅仅传递 path 和 pack
				var para = __.convertParas(config,v.params,V.merge(defParam,{path:path,pack:defParam.pack,host:host}),app,pcm);
				if(spapath){__.spaloadScript(type);__.clearload();}
				return new function(){
					var _ = this;
					_.getType = function(){
						if(path) {
							__.loadScript(type);
							V.each(path.split(';'),function(v){
								if(defParam.host && v.toLowerCase().indexOf('../')<0 && v.toLowerCase().indexOf('http://')<0){
									v = defParam.host + v;
								}
								V.include(v);
							}, function () {
							    __.clearload();
							}, true);
						}
						var paras = para.getParas();
						return __.getScript(type)?__.getScript(type):eval('('+type+')');
					};
					_.getValue = function(){
						if(path) {
							//以后可以修改 目前是有缓存的 path改为支持;号隔开的各个路径
						    __.loadScript(type);
							V.each(path.split(';'),function(v){
								if(defParam.host && v.toLowerCase().indexOf('../')<0 && v.toLowerCase().indexOf('http://')<0){
									v = defParam.host + v;
								}
								V.include(v);
							}, function () {
							    __.clearload();
							}, true);
						} else if(spapath){
							__.spaloadScript(type);
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
								return __.getScript(type)?V.create(__.getScript(type),paras):V.create2(type,paras);
								break;
							case 'bean':
								var val = __.getScript(type)?V.create(__.getScript(type),[]):eval('(new '+type+'())');
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
								return __.getScript(type)?__.getScript(type).apply(__.getScript(type),paras):eval('('+type+'.apply('+type+',paras))');
							case 'factorybean':
								var val = __.getScript(type)?__.getScript(type).apply(__.getScript(type),paras):eval('('+type+'.apply('+type+',paras))');						
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
								var val = __.getScript(type)?V.create(__.getScript(type),paras):V.create2(type,paras);
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
										V.tryC(v.dispose);
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
			//转换成App对象 todo app成为默认关键词 不可重复定义
			__.convertApp = function(config,v,app,pcm){
				var keys = {method:'constructor',mode:'static',path:false,pack:false,constructorparalength:false,size:50,app:app,host:''};
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
	M.getObjectByAppName = function(cm,app,name){
		if(!V.middlers){
			V.middlers = {};
		}
		if(!cm.randomid){
			cm.randomid = V.random();
			V.middlers[cm.randomid] = new M.Middler(cm);
		}
		return V.middlers[cm.randomid].getObjectByAppName(app,name);
	};
	M.getTypeByAppName = function(cm,app,name){
		if(!V.middlers){
			V.middlers = {};
		}
		if(!cm.randomid){
			cm.randomid = V.random();
			V.middlers[cm.randomid] = new M.Middler(cm);
		}
		return V.middlers[cm.randomid].getTypeByAppName(app,name);
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
			sqlselect2:{command:'select * from table1 where name=?',dbtype:'json',params:{data:[]},template:'sqltemp'},		
			Name1:{command:'',params:{},dbtype:'json/tjson',template:'仅在Middler中调用NiMultiTemplateDecorator时启用'},
			wstest1: { command: 'abc.json', dbtype: 'json', params: {}, template: 'ws' },
			wstest2: { command: 'bcd.json?_n=MT, dbtype: 'json', params: {}, template: 'ws' }
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
				__.getValue = _.getValue;
			    _.getValue = function () { var ret = __.getValue.apply(this, arguments); if(ret) {ret.merge = V.getValue(ret.merge, V.merge);} return ret; };
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
							if(val[i]){
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
				_.KEY='Ni';
				_._addCommand = function(name,params,func){
					var cmd = cm.getConfigValue(_.KEY,name);
					var command = name;
					var template = "";
					if(cmd){						
						command = cmd.command;
						params = cmd.merge(cmd.params,V.getValue(params,{}));
						template = cmd.template;
					}
					_.lstCmd.push({name:command,params:params,func:func,template:template,key:name,dbtype:(cmd && cmd.dbtype)?cmd.dbtype:"tjson"});
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
								cmd.dbtype = v.dbtype;
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
				_.KEY=V.getValue(appName,'Ni');
				__.middler = new V.middler.Middler(cm);
			}
			_.excute = function(tempName,name,params,func){
				var temp = __.middler.getObjectByAppName(_.KEY,tempName);
				if(temp){
					temp.excute(name,params,function(data){
						V.tryC(function(){
							if(func){func(data);}
						});
						__.middler.setObjectByAppName(_.KEY,tempName,temp);
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
			_.get = function(key){return __.data[key]?__.data[key]:__.kv[key]?__.kv[key][1]:null;};
			_.add = function(data,name){
				if(data && !__.kv[name]){__.data[__.datas.length]=data;__.kv[name]=[__.datas.length,data];__.datas.push(data);}
				else if (__.kv[name]){var id = __.kv[name][0];__.data[id]=data;__.kv[name]=[__.datas.length,data];__.datas[id]=data;}
			};
			_.last = function(){return _.get(__.datas.length-1);};
			_.each = function(key,func){
				var val = _.get(key);
				if(val && V.isArray(val)){
					V.each(val,func);
				}
			};
			_.clear = function(){__.datas = [];__.data = {};__.kv = {};};
			_.hasData = function(key){
				return key?(function(){
					var v = _.get(key);
					if(v) {for(var k in v) return true;}
					return false;
				})():(__.datas.length>0 && (function(){
					var hasData = false;
					V.each(__.datas,function(v){
						if(!hasData && v){
							for(var k in v) hasData = true;
						}
					},null,true);
					return hasData;
				})());
			};
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
				_.params = {};
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
				_.params = {dbtype:'json'};
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
									data = data.replace(/[\r\n]+/g,'');
									if (data.replace(/^(\[+\]+)/g, '').length === 0) {
										hasFalse = true;
									} else {
										hasFalse = (data.toLowerCase().indexOf('[false') >= 0?
													(data.toLowerCase().indexOf('[false:') >= 0?(function(){
														var _data = data.toLowerCase().match(/\[false:[^\]]+\]/g);
														if(_data && _data.length>0){
															return _data[0].substr(7,_data[0].length-8);
														} else return true;
													})():true):
													false);
									} 
									if(!hasFalse){										
										//如何判断tjson
										try{
											data = eval('('+data.replace(/[\r\n]+/g,'')+')');
										}catch(e){console.log(data);}
									}
									break;
								case "object":
										if(data){
											$(data).each(function (i, v) {
												v=v+'';
												hasFalse = (hasFalse || v == 'False' || v == 'false');
											});
										} else hasFalse = true;
										break;							
								case 'undefined':
								default:
									V.showException('V.NiDataCommand success方法 name:typeof错误 type:'+data);
									hasFalse = true;
									break;
							}            
							if(hasFalse){
								data = (hasFalse == true?false:hasFalse);
							} else {
								switch(_.dbtype){
									default:
									case 'json':
										break;
									case 'tjson':
										data = V.evalTJson(data);
										break;
								}
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
							if(typeof(data) == 'function'){
								V.tryC(function(){if(func){data(func);}});
							}else{
								V.tryC(function(){if(func){func(data);}});
							}
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
		N.NiSocketDataFactory = function () {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                var ws = window.WebSocket || window.MozWebSocket;
                if (!ws) {

                    throw new Error(V.userAgent.name + '不支持WebSocket!');
                    return;
                }
                __.SocketConnection = function () {
                    var _ = this, __ = {};
                    {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ url: '', veshurl: '' }, _.params);
                        __.open = _.open;
                        __.close = _.close;
                        __.conn = null;
                        __.datas = [];
                        __.senddatas = [];
                        __.calls = {};
                        //处理接受
                        __.addData = function (data) {
                            __.datas.push(data);
                            __.callback();
                        };
                        __.callback = function () {
                            if (__.datas.length > 0) {
                                V.whileC(function () { return __.datas.shift(); }, function (val) {
                                    if (typeof (val) == 'string') {
                                        val = eval('(' + val + ')');
                                    }
                                    if (val._id && val.response) {
                                        if (__.calls[val._id]) {
                                            __.calls[val._id].datas.push(val.response);
                                        } else {
                                            __.calls[val._id] = { datas: [], func: null, index: val._id };
                                            __.calls[val._id].datas.push(val.response);
                                        }
                                        __.callfunc(val._id);
                                    } else {
                                        V.showException('未找到消息处理者' + V.toJsonString(val));

                                    }
                                });
                            }
                        };
                        __.callfunc = function (index) {
                            var oCall = __.calls[index];
                            if (oCall && oCall.datas.length > 0 && oCall.func) {
                                V.whileC(function () { return oCall.datas.shift(); }, function (val) {									
                                    oCall.func(val, oCall.index);
                                }, function () { //delete __.calls[index]; 
                                });
                            }
                        };
                        //处理发送
                        __.addCalls = function (cmd, func) {
                            var index = cmd.params._id ? cmd.params._id : V.random();
                            if (!__.calls[index]) {
                                __.calls[index] = { datas: [], func: func, index: index };
                            } else if(cmd.params._id) {                            
                                //delete cmd.params._id;
                            } else {
                                __.calls[index].func = func;
                            }
                            //默认conn是Open的
                            var val = { _id: index, request: {} };
                            val.request[cmd.command] = cmd.params;
                            __.senddatas.push(V.toJsonString(val));
                            __.callsend();
                        };
                        __.callsend = function () {
                            if (_.isOpen) {
                                V.whileC(function(){return __.senddatas.shift()}, function (v) { __.conn.send(v); });
                            }
                        };
                    }
                    
                    _.open = function () {
                        if (!_.isOpen && !__.conn) {
                            __.conn = new ws(_.params.url);
                            __.conn.onopen = function () { _.isError=false;__.open(); __.conn.send(V.toJsonString({ cookies: document.cookie })); __.callsend(); };
                            __.conn.onclose = function () { __.close(); __.conn = null;if(_.params.reopen) V.once(_.open,1000); };
                            __.conn.onmessage = function (evt) {
                                try {				
                                    //console.log(evt.data);
                                    _.isError = false;
                                    if (evt.data) { __.addData(evt.data); }
                                } catch (e) {
                                    V.showException('VJ.ni.NiSocketDataFactory.onmessage', e);
                                }
                            };
                            __.conn.onerror = function (e) {
                                try {
                                    if (!_.isError && (e.currentTarget.readyState == 2 || e.currentTarget.readyState == 3) && _.params.veshurl) {
                                        //连接失败 尝试调用veshurl 开启websocket
                                        V.ajax({
                                            url: _.params.veshurl, jsonp: _.params.jsonp, data: {},
                                            success: function (data, status) {
                                                try {
                                                    console.log("--------------------------------------------");
                                                    console.log(data);
                                                    _.open();
                                                    //重新尝试一次连接
                                                } catch (e) {
                                                    V.showException('V._ajaxOption success方法', e);
                                                }
                                            }, error: function (request, status, error) {
                                                V.showException('V._ajaxOption error方法 status:' + status, error);
                                                if (func) { func(false); }
                                            }
                                        });
                                    } else {
                                        __.addData(false);
                                    }
                                    _.isError = true;
                                    __.conn = null;
                                    V.showException('VJ.ni.NiSocketDataFactory.onerror:' + V.toJsonString(e));
                                } catch (e) {
                                    V.showException('VJ.ni.NiSocketDataFactory.onerror', e);
                                }
                            };
                        }
                    };
                    _.close = function () {
						_.params.reopen = false;
                        __.conn.close();
                    };
                    _.invoke = function (cmd, func) {
                        //如何区分新发起的会话 还是 旧有的会话	res._id res.firstregist
                        try {
                            __.addCalls(cmd, func);
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    }
                };
                __.SocketCommand = function () {
                    var _ = this, __ = {};
                    {
                        V.inherit.apply(_, [N.NiDataCommand, []]);
                    }
                    _.excute = function (result, func) {
                        if (!_.connection || _.connection.isError) {
                            V.showException('WebSocket连接失败');
                            if (func) { func(false); }
                            return;
                        } else {
                            _.connection.invoke(_, function (data, _id) {
                                try {
                                    var hasFalse = false;
                                    switch (typeof (data)) {
                                        case "string":
                                            data = data.replace(/[\r\n]+/g, '');
                                            if (data.replace(/^(\[+\]+)/g, '').length === 0) {
                                                hasFalse = true;
                                            } else {
                                                hasFalse = (data.toLowerCase().indexOf('[false') >= 0 ?
													(data.toLowerCase().indexOf('[false:') >= 0 ? (function () {
													    var _data = data.toLowerCase().match(/\[false:[^\]]+\]/g);
													    if (_data && _data.length > 0) {
													        return _data[0].substr(7, _data[0].length - 8);
													    } else return true;
													})() : true) :
													false);
                                            }
                                            if (!hasFalse) {
                                                //如何判断tjson
                                                data = eval('(' + data.replace(/[\r\n]+/g, '').replace(/\\"/g,'"') + ')');
                                            }
                                            break;
                                        case "object":
                                            if (data) {
                                                $(data).each(function (i, v) {
                                                    v = v + '';
                                                    hasFalse = (hasFalse || v == 'False' || v == 'false');
                                                });
                                            } else hasFalse = true;
                                            break;
                                        case 'undefined':
                                        default:
                                            V.showException('V.NiSocketDataCommand success方法 name:typeof错误 type:' + (data));
                                            hasFalse = true;
                                            break;
                                    }
									if(result.firstregist) result.firstregist = false;
                                    if (hasFalse) {
                                        data = false;
                                    } else if(data._regist) {
										//声明注册完成
										result.firstregist = true;
										data = false;
									}  else {
                                        switch (_.dbtype) {
                                            default:
                                            case 'json':
                                                break;
                                            case 'tjson':
                                                data = V.evalTJson(data);
                                                break;
                                        }
                                    }
                                    //特别地当回{close:true}时，关闭websocket
                                    result._id = _id;
                                    if (func) { var val = func(data, _id); if (val && val.close) { __.conn.close(); } }
                                } catch (e) {
                                    V.showException('V.ni.NiSocketCommand invoke方法', e);
                                    if (func) { func(false); }
                                }
                            });
                        }
                    };
                };
            }
            _.createDBConnection = function () { return new __.SocketConnection(); };
            _.backDBConnection = function () { console.log('back conn'); };

            _.createDBCommand = function () { return new __.SocketCommand(); }
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
				_.KEY = 'Ni';
				__._addCommand = _._addCommand;
				__._excute = _._excute;
				_.lstCmd2 = {};
				{
					__.params = V.getValue(params,{});
					//缓存专用默认方法
					_.setCommand = function(res,params){					
						params = V.merge(__.params,params);
						//兼容localStorage不可用的状态
						try {
							/*if(res.setItem){
								res.setItem(params.cacheKey,V.toJsonString({
									data:params.cacheValue,
									date:(params.timeout?new Date().add(params.timeout.interval,params.timeout.number).getTime():false)
								}));
							} else {*/
								res[params.cacheKey] = V.toJsonString({
									data:params.cacheValue,
									date:(params.timeout?new Date().add(params.timeout.interval,params.timeout.number).getTime():false)
								});
							//}
						}catch (error) {console.log('localStorage可能不被支持');}
						return null;
					};
					//可以根据业务逻辑改为根据某个公共字段进行删除
					_.clearCommand = function(res,params){
						if(res.removeItem){
							res.removeItem(params.cacheKey,null);
						} else if(res[params.cacheKey]){
							delete res[params.cacheKey];
						}
						return null;
					};
					_.cacheCommand = function(res,params){						
						var val = null;
						/*if(res.getItem){
							val = V.json(res.getItem(params.cacheKey));
						} else {*/
						if(res[params.cacheKey]){
							val = V.json(res[params.cacheKey]);
						}
						//}						
						if(val){
							if(val.date){
								if(parseFloat(val.date) < new Date().getTime()){
									delete res[params.cacheKey];
									return null;
								}
							}
							return val.data;
						} else return null;
					};
				}
				_._addCommand = function(name,params,func){
					var index = _.lstCmd.length;
					__._addCommand(name,params,func);
					if(_.lstCmd.length!=index){
						var command = null;
						var cmd = cm.getConfigValue(_.KEY,name+'.Cache');
						if(!cmd){
							cmd = cm.getConfigValue(_.KEY,name+'.Clear');
							if(cmd){
								command = V.getValue(cmd.command,_.clearCommand);
							}
						}else{
							command = V.getValue(cmd.command,_.cacheCommand);
						}
						if(cmd){
							_.lstCmd2[index] = {
								name:command,
								key:name,
								params:cmd.merge(_.lstCmd[_.lstCmd.length-1].params,{cacheKey:V.hash(name+'.Set.'+V.toJsonString(_.lstCmd[_.lstCmd.length-1].params))})
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
                                cmd.dbtype = v.dbtype;
								var _func = v.func;
								cmd.excute(_.result,function(data){
									V.tryC(function(){
										if(!data){
											data = false;
										}
										_.result.add(data,v.key);
										if(_func){
											V.tryC(function(){
												_func(_.result);
											});
										}
									});
									if(data && data.length>0 && !(data.length==1 && data[0].length==0)){
										//新增缓存
										var _nicmd = cm.getConfigValue(_.KEY,v.key+'.Set');
										if(_nicmd){
											var _conn = cacheres.getDBConnection();
											var _cmd = cacheres.getDBCommand();
											_cmd.connection = _conn;
											_cmd.command = V.getValue(_nicmd.command,_.setCommand);
											_cmd.params = _nicmd.merge(_nicmd.params,cmd.params,{
													cacheKey:V.hash(v.key+'.Set.'+V.toJsonString(cmd.params)),
													cacheValue:data
												});
											_cmd.excute(_.result,function(data){
												V.tryC(function(){cacheres.backDBConnection(_conn);});
											});
										}
									}
									i++;
									next();
								});
							};
							V.whileC2(function(){return _cms.shift();},function(v,next){	
								var _nicmd = _.lstCmd2[i];
								//准备处理缓存
								if(_nicmd){
									i++;
									var _conn = cacheres.getDBConnection();
									var _cmd = cacheres.getDBCommand();
									_cmd.connection = _conn;
									_cmd.command = _nicmd.name;
									_cmd.params = V.merge(_nicmd.params,v.params);
									_cmd.excute(_.result,function(data){
										V.tryC(function(){
											try{cacheres.backDBConnection(_conn);}catch(e){}
											if(!data){
												data = false;
											}
											if(data){
												_.result.add(data,v.key);
												if(v.func){
													V.tryC(function(){
														v.func(_.result);
													});
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
		//用于先读取缓存同步请求真实数据的情况
		N.NiLazyTemplateDecorator = function(res,cacheres,cm,params){
			var _ = this, __ = {};
			{
				__.lazyExp = V.getValue(params.lazyExp,function(p){return true;});
				params = V.merge({},params);
				if(params && params.lazyExp) {delete params.lazyExp;}
				V.inherit.apply(_,[N.NiTemplateDecorator,[res,cacheres,cm,params]]);
				
				_._excute = function(){
					var _cms = _.lstCmd;
					_.lstCmd = [];
					if(_cms.length>0){					
						V.tryC(function(){							
							var conn = res.getDBConnection();
							var cmd = res.getDBCommand();
							cmd.connection = conn;
							var i = 0;
							var func = function(v){
								cmd.command = v.name;
								cmd.params = v.params;
                                cmd.dbtype = v.dbtype;
								var _func = v.func;
								cmd.excute(_.result,function(data){
									V.tryC(function(){
										if(!data){
											data = false;
										}
										_.result.add(data,v.key);
										if(_func){
											V.tryC(function(){
												_func(_.result);
											});
										}
									});									
									if(data && data.length>0 && !(data.length==1 && data[0].length==0) && __.lazyExp(v.params)){
										//新增缓存
										var _nicmd = cm.getConfigValue(_.KEY,v.key+'.Set');
										if(_nicmd){
											var _conn = cacheres.getDBConnection();
											var _cmd = cacheres.getDBCommand();
											_cmd.connection = _conn;
											_cmd.command = V.getValue(_nicmd.command,_.setCommand);
											_cmd.params = _nicmd.merge(_nicmd.params,cmd.params,{
													cacheKey:V.hash(v.key+'.Set.'+V.toJsonString(cmd.params)),
													cacheValue:data
												});
											_cmd.excute(_.result,function(data){
												V.tryC(function(){cacheres.backDBConnection(_conn);});
											});
										}
									}
								});
							};
							V.whileC2(function(){return _cms.shift();},function(v,next){
								var _nicmd = _.lstCmd2[i];
								//准备处理缓存
								if(_nicmd && __.lazyExp(v.params)){
									i++;
									var _conn = cacheres.getDBConnection();
									var _cmd = cacheres.getDBCommand();
									_cmd.connection = _conn;
									_cmd.command = _nicmd.name;
									_cmd.params = V.merge(_nicmd.params,v.params);
									_cmd.excute(_.result,function(data){
										V.tryC(function(){
											try{cacheres.backDBConnection(_conn);}catch(e){}
											if(!data){
												data = false;
											}
											if(data){
												_.result.add(data,v.key);
												if(v.func){
													V.tryC(function(){
														v.func(_.result);
													});												
												}			
											}
											func(v,next);
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
				_.KEY = V.getValue(appName,'Ni');				
				__.ni = new N.NiTemplateManager(relcm,_.KEY);
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
					_.config = _.v.config;
					_.middler = _.v.middler;
					_.ni = _.v.ni;
					_.session = _.v.session;
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
						//__.node = $(window.document.createDocumentFragment()); 因为在某些页面jQuery无法操作此种节点						
						__.node = $('<div style="display:none;"></div>').appendTo(window.document.body);
					}
					_.addCallback = function(fun){
						if(__.template){
							fun($(__.template));
						}else{
							if(fun){
								__.funs.push(fun);
							}
						}
					};
					_.callback = function(){
						V.whileC(function(){return __.funs.shift()},function(v){v($(__.template));},function(){
							//这里处理加载完成
						});						
					};
					if(path.indexOf('<')>=0){	
						__.node.append(path);
						__.template = __.node[0].innerHTML;
						__.node.remove();
					} else {
						__.node.load(path,function(){
							__.template = __.node[0].innerHTML
							__.node.remove();
							_.callback();
						});
					}					
				};
			}			
			WTemplates[path].addCallback(func);			
		};
		//动画基类，用于提供默认的方法定义 供真实的动画进行处理 譬如抖动 移动 翻转 等等
		W.Action = function(){
			this.go = function(node,func){if(func){func();}};
		};
		//css专用的属性动画设置 默认可使用animate.min.css 进行动画设置
		W.CssAction = function(css){
			var __ = {};
			V.inherit.apply(this,[W.Action,[]]);
			__.go = this.go;
			__.css = V.getValue(css,'');
			this.go = function(node,func){
				if(V.isValid(__.css)){
					node = $(node);      
                    var _f = func		
					{
						node.off('webkitAnimationEnd').on('webkitAnimationEnd',function(){
                            node.off('animationend').css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(_f){var _s=_f;delete _f;_s();};
						});
						node.off('mozAnimationEnd').on('mozAnimationEnd',function(){
                            node.off('animationend').css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(_f){var _s=_f;delete _f;_s()};
						});
						node.off('MSAnimationEnd').on('MSAnimationEnd',function(){
                            node.off('MSAnimationEnd').css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(_f){var _s=_f;delete _f;_s()};
						});
						node.off('oanimationend').on('oanimationend',function(){
                            node.off('oanimationend').css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(_f){var _s=_f;delete _f;_s()};
						});
						node.off('animationend').on('animationend',function(){
                            node.off('animationend').css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(_f){var _s=_f;delete _f;_s()};
						});
					}
                    node.css('animation',css).css('-webkit-animation',css).css('-webkit-animation-play-state','running').css('-moz-animation',css).css('-moz-animation-play-state','running').css('-o-animation',css).css('-o-animation-play-state','running');
				}
			};
		};
		//html与css的加载 其对应的节点的替换 事件的统一触发与处理 update事件的注入 控件均支持先创建 再init 然后bind绑定的过程 再调用onLoad和render事件
		W.Control = function(path,params){
			var _ = this,__ = {};
			{
				_.path = path;
				_.vm = null;
				_.events = {};
				_.params = V.getValue(params,{});
				__.desc="";
				_.addDesc = function(d){__.desc+=(d+"\r\n");};
				_.desc = function(){console.log(__.desc+'VJ.view.Control\r\n数据定义：\r\npath:html模板定义\r\nvm:虚拟控件对象\r\nevents:事件对象\r\nparams:默认参数对象\r\n');};
			}
			_.init = function(parent,node,params){				
				_.parent = parent;
				_.config = _.parent.config;
				_.middler = _.parent.middler;
				_.ni = _.parent.ni;
				_.session = _.parent.session;
				_.node = node;
				_.params = V.merge(_.params,{data:V.getValue(params,{})});
			};
			//初始化viewmodel操作
			_.bind = function(vm){
				{
					//完成配置合并
					_.vm = V.merge(_.params,V.getValue(vm,{data:{}}));
					V.forC(_.vm,function(k,v){
						vm[k] = v;
						if(k.toLowerCase().indexOf('on')==0){
							_.events[k.toLowerCase().substring(2)] = v;
						}
					},function(){
						_.vm = vm;
					},true);
					//用于获取绑定对象的数据
					_.get = function(){return _.vm.data;}
					//完成类型名注入
					_.vm.nodeName = _.nodeName;
					//完成方法注入
					_.vm.update = function () { var as = Array.prototype.slice.call(arguments); as = V.getValue(as, [null]); if (as[0]) V.merge(_.vm.data, as[0], true); as[0] = as[0] ? as[0]:V.merge({}, _.vm.data); _.render.apply(_, as); };
					_.vm.call = function(){_.call.apply(_.parent.vms,arguments);};
					_.vm.add = function(){_.addControl.apply(_,arguments);};
					_.vm.desc = function(){_.desc();};
					_.vm.get = function(key){_.vm.data = V.merge(_.vm.data,_.fill());return key?_.vm.data[key]:_.vm.data;};
					_.vm.bind(_);
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
			//处理控件下载完成后的操作
			_.onLoad = function(node){
				_.render(_.vm.data);
				_.call('load');
			};
			//在更新_.vm.data
			_.fill = function(){
				return {};	
			};
			//可以将数据更新到标签上
			_.render = function(data){
				V.forC(data,function(key,value){
					switch(key){
						case 'dispose':
							if(value) _.dispose();
							break;
						case 'css':
							V.forC(value,function(k,v){_.node.css(k,v);});
                            break;
						case 'attr':
							V.forC(value,function(k,v){_.node.attr(k,v);});
							break;
						case 'enable':
							if(value){_.node.removeAttr('disabled');}else{_.node.attr('disabled','disabled');}
							break;
						case 'invisible':
							if(value){
								_.node.children().show();
							} else {
								_.node.children().hide();
							}
							break;
						case 'visible':
							if(value){_.node.show();} else {_.node.hide();}
							break;
						case 'addclass':
							_.node.addClass(value);
							break;
						case 'removeclass':
							_.node.removeClass(value);
							break;
						case 'animate':
							//仅处理简单类型的动画 譬如一次性调用的动画名或者一个动画名带一个回调函数，可支持多个
							if(typeof(value) == 'string'){
								_.animate(value);
							} else {						
								var ret = [];
								V.forC(value,function(k2,v2){
									ret.push([k2,v2]);
								},function(){
									var i = 0;
									//异步处理
									var _f = function(){
										var v2 = ret[i];
										i++;
										_.animate(v2[0],function(){
											if(typeof(v2[1]) == 'function')
												V.tryC(function(){v2[1]();});
											if(i<ret.length){_f();}
										});
									};
									_f();
								});
							}							
							break;
						case 'globalposition':
							//此方法不支持重复设置
							if(_.node.attr('position')){
								V.showException('W.Control.data.postion 不允许重复设置!'+_.node.attr('position'));
							}else{
								_.node.attr('position',value.toLowerCase());
								_.node.css('position','absolute');
								var parent = $(window);
								switch(value.toLowerCase()){
									case 'top':
										parent.scroll(function(){
											_.node.css('top', document.body.scrollTop+"px");
										});
										_.node.css('top', document.body.scrollTop+"px");
										break;
									case 'bottom':
										parent.scroll(function(){
										console.log(document.body.scrollTop+':'+$(window).height()+':'+_.node.height()+':'+(document.body.scrollTop+$(window).height()-_.node.height()));
											_.node.css('top', (document.body.scrollTop+$(window).height()-_.node.height())+"px");
										});
										_.node.css('top', (document.body.scrollTop+$(window).height()-_.node.height())+"px");
										break;
								}
							}
							break;
						case 'position':
							//此方法不支持重复设置
							if(_.node.attr('position')){
								V.showException('W.Control.data.postion 不允许重复设置!'+_.node.attr('position'));
							}else{
								_.node.attr('position',value.toLowerCase());
								_.node.css('position','absolute');
								var parent = _.node.parent();
								switch(value.toLowerCase()){
									case 'top':
										parent.scroll(function(){
											console.log('scroll');
											_.node.css('top', parent.get(0).scrollTop+"px");
										});
										_.node.css('top', parent.get(0).scrollTop+"px");
										break;
									case 'bottom':										
										parent.scroll(function(){
											_.node.css('top', (parent.get(0).scrollTop+$(document).height()-_.node.height())+"px");
										});
										_.node.css('top', (parent.get(0).scrollTop+$(document).height()-_.node.height())+"px");
										break;
								}
							}
							break;
						case 'valid':
							V.merge(_.get(),_.fill(),true);
							if (_.valid) {_.valid(data.value || _.get().value, value);} else if (value) value();
							break;
						case 'show':
							_.vm.data.visible = true;
							_.animate(value,function(){});
							V.once(function(){_.node.show();},1);
							break;
						case 'hide':
							_.animate(value,function(){_.node.hide();_.vm.data.visible = false;});
							break;
						case 'desc':
							if(value) _.desc();
							break;
					}
				});
				return data;
			};			
			//用于扩展给主要对象绑定事件使用 一般用于bind事件的默认值
			_.bindEvent = function(node,k,v){
				node = $(node);
				if(typeof(node[k]) == 'function'){
					node[k](function(e){
						if(node.parents('[disabled]').length>0) return;
						_.call(k,{e:e});
					});
				}
			};
			_.initControls = function(vm,node){				
				//此处进行内部控件生成需要判定controls属性
				if(vm.controls || node.find('[_]').length>0){
					var cons = V.getValue(vm.controls,{});
					_.controls = [];
					_.vs = {};
					_.vms = cons;_.models = _.vms;
					var p = node.find('[_]').toArray();				
					V.each(p,function(v1){
						var v = $(v1);
						var id = v.attr('id');
						var json = eval("({"+v.attr('_')+"})");
						var type = json.type?json.type:(id && cons[id] && cons[id].type)?cons[id].type:null;
						//对于容器类对象的处理方式
						var nodeName = type?type.toLowerCase():v[0].nodeName.toLowerCase();
						var obj = _.middler.getObjectByAppName(W.APP,nodeName);
						if(!obj) V.showException('配置文件中没有找到对象类型定义:'+nodeName);
						obj.init(_,v,V.isValid(v.attr('_'))?json:null);
						obj.page = _.page;
						_.controls.push(obj);
						if(!id) {
							id = nodeName+V.random();
						}
						obj.nodeName = nodeName;
						if(!cons[id]){
							cons[id] = {data:{}};
						}
						_.vs[id] = obj;
						V.inherit.apply(cons[id],[M.Control,[]]);
						obj.bind(cons[id]);		
					},function(){
						//实现通过type属性完成数据初始化的功能
						V.forC(cons,function(key,v){
							if(v.type && !v.v){
								var obj = _.middler.getObjectByAppName(W.APP,v.type);
								if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
								var node2 = V.newEl('div');
								node.append(node2);
								obj.init(_,node2,null);
								obj.page = _.page;
								_.controls.push(obj);
								_.vs[key] = obj;
								V.inherit.apply(v,[M.Control,[]]);
								obj.bind(v);
							}
						},function(){
							//彻底初始化完成
						});
					},true);
				}
			};
			_.replaceNode = function(node){
				node = $(node);
				var attrs = _.node[0].attributes;
				if(attrs){
					var i = attrs.length;
					V.whileC(function(){i--;return i>=0?{key:attrs[i].name,val:attrs[i].value}:null},function(v){
						var n = v.key.toLowerCase() == 'id'?$(node[0]):node;
						if(n.length>1){
							for(var i=0;i<n.length;i++){
								var _n = $(n[i]);
								if(V.isValid(v.val) && v.val!='false'){
									_n.attr(v.key,((V.isValid(_n.attr(v.key)) && _n.attr(v.key) != v.val)?_n.attr(v.key)+" ":"")+v.val);
								}
							}
						} else {
							if(V.isValid(v.val) && v.val!='false'){
								n.attr(v.key,((V.isValid(n.attr(v.key)) && n.attr(v.key) != v.val)?n.attr(v.key)+" ":"")+v.val);
							}
						}
					},function(){},true);
				}
				_.initControls(_.vm,node);
				node.append(_.node.children());
				if(_.node[0].nodeName.toLowerCase() == 'body'){					
					_.node.empty().append(node);
				}else{
					_.node.after(node).remove();
				}
				_.node = node;
			};
			_.validate = function(input){
				if(_.middler){
					var obj = _.middler.getObjectByAppName(W.APP,'ValidateManager');
					if(obj){obj.validate(_,input);}
				}
			};			
			_.call = function(name,param,imme){
				//所有的事件调用全部采用异步调用方式 V.once				
			    param = V.getValue(param, {});
				V.merge(_.vm.data,_.fill(),param,true);
				param = V.merge(_.vm.data, param);
				name = name.toLowerCase();
				if(_.events[name]){
					V.once(function(){
					    var val = _.events[name].apply(_.parent.vms, [imme?param:_.vm.data, _.vm]);
                        if(imme) V.merge(_.vm.data,param, true);
						if(val && val != {}){
							V.merge(_.vm.data, val, true)
							_.render(val);
						}
					});
				}
			};
			//这里提供子类用于覆盖同名函数，修改动画对象。
			_.animate = function(name,func){
				_._animate(name,null,func);
			};
			//动画方法 用于将middler获取到的动画对象进行动画设置并返回设置函数 而动画对象本身应该仅仅具有业务意义 譬如active hide append等等
			_._animate = function(name,node,func){
				name = name || '';
				var action = _.middler.getObjectByAppName(W.APP,name);
				if(action){
					action.go(node?node:_.node,func || null);
				}
			};
			//用于说明错误提示
			_.onError = function(text){
				_.get().isError = true;
				_.call('error',{error:text});
			};
			//用于清理错误提示
			_.onClearError = function(){_.call('clearerror');};
			//用于说明正确信息
			_.onSuccess = function(){delete _.get().isError;_.call('success')};
			_.dispose = function(){V.tryC(function(){_.call('dispose');_.clearControl();});_.node.remove();};
			_.addControl = function(node,v){
				if(!_.controls){
					_.controls = [];
					_.vs = {};
					_.vms = {};_.models = _.vms;
				}
				var obj = _.middler.getObjectByAppName(W.APP,v.type);
				if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
				node = node?node:V.newEl('div').appendTo(_.node);
				obj.init(_,node,v);
				obj.page = _.page;
				_.controls.push(obj);
				var key = V.getValue(v.id,V.random());
				if(_.vs[key]){V.showException('控件id为'+key+'的子控件已经存在，请更换id名');return;}
				node.attr('id',key);
				_.vs[key] = obj;
				V.inherit.apply(v,[M.Control,[]]);
				_.vms[key]=v;
				obj.bind(v);
				return v;
			};
			_.removeControl = function(id){
				delete _.vms[id];
				if(_.vs[id]){
					var val = _.vs[id];
					delete _.vs[id];
					_.controls = $.grep(_.controls,function(v,i){return v!=val;});
					if(val) val.dispose();
					//V.tryC(function(){_.vs[id].node.remove();});
				}
			};
			_.clearControl = function(){
				if(_.controls){
					var vs=_.vs
					var div = $('<div style="display:none;"></div>').appendTo(window.document.body);
					_.node.children().appendTo(div);
					V.forC(vs,function(k,v){v.dispose();},function(){div.remove();});
				}	
				_.controls = [];_.vs = {};_.vms = {};_.models = _.vms;
			};
		};
	}
	{
		//分别定义view与viewmodel的Page
		M.Page = function(cm,data){
			var _ = this,__ = {};
			{
				_.vms = V.getValue(data,{});_.models = _.vms;
				//默认使用配置作为事件定义
				V.inherit.apply(_,[M.Control,[]]);
				_.page = _.vms.page?_.vms.page:{};
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
				_.getModels = function(id){return id?(_.vms[id]?_.vms[id]:null):_.vms;};
				_.setModels = function(id,v){_.vms[id] = v;};
				__.bind = _.bind;
				_.bind = function(view){__.bind(view);_.page.v = view;}
				{
					//初始化操作
					var _page = _.middler.getObjectByAppName(W.APP,'page');					
					if(!_page){throw new Error('没有找到page对应的页面view层对象'); }					
					_page.ready(function(){
						_page.init(_,$(document.body));
						_page.bind(_);
					});
				}
			}
		};
		W.Page = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path]]);
				_.vs = {};
				_.controls = [];		
				__.render = _.render;
				__.onLoad = _.onLoad;
				__.dispose = _.dispose;
			}
			//一般调用M.Page对象都比较特殊
			_.bind = function(page){
				var vm = page.page;
				_.page = page;
				if(vm){
					//仅针对page节点
					_.vm = vm;
					//完成配置合并
					_.vm.data = V.merge(_.params,V.getValue(_.vm.data,{}));
					//完成方法注入
					_.vm.update = function () { var as = Array.prototype.slice.call(arguments); as = V.getValue(as, [null]); if (as[0]) V.merge(_.vm.data, as[0], true); as[0] = as[0] ? as[0] : V.merge({}, _.vm.data); _.render.apply(_, as); };                    			
					_.vm.call = function(){_.call.apply(_.page.getModels(),arguments);};
					_.vm.add = function(){_.addControl.apply(_,arguments);};
					_.vm.desc = function(){_.desc();};
					_.vm.get = function(key){_.vm.data = V.merge(_.vm.data,_.fill());return key?_.vm.data[key]:_.vm.data;};
					
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
				_.vms = _.page.vms;_.models = _.vms;
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
			_.dispose = function(){_.session.updateAll();_.call('dispose');_.clearControl();$('body').empty();window.close();};
			//用于重载触发方式
			_.ready = function(func){
				$(function(){func();_.bindControl(_.node);});
				window.onbeforeunload = _.dispose;
			};
			//用于覆盖引起页面布局改变
			_.onReady = function(){
			};

			_.call = function(name,param,imme){
				//所有的事件调用全部采用异步调用方式 V.once				
			    param = V.getValue(param, {});
				V.merge(_.vm.data,_.fill(),param,true);
				param = V.merge(_.vm.data, param);
				name = name.toLowerCase();
				if(_.events[name]){
					V.once(function(){						
					    var val = _.events[name].apply(_.parent.getModels(), [imme?param:_.vm.data, _.vm]);
                        if(imme) V.merge(_.vm.data,param, true);
						if(val && val != {}){
							V.merge(_.vm.data, val, true)
							_.render(val);
						}
					});
				}
			};
			//用于绑定对应的控件
			_.bindControl = function(node){
				//这里应该由真实的View层调用使用document.ready实现
				var p = node.find('[_]').toArray();				
				V.whileC(function(){return p.shift();},function(v1){
					var v = $(v1);
					var id = v.attr('id');
					var json = eval("({"+v.attr('_')+"})");
					var type = json.type?json.type:(id && _.page.getModels(id) && _.page.getModels(id).type)?_.page.getModels(id).type:null;
					//对于容器类对象的处理方式
					var nodeName = type?type.toLowerCase():v[0].nodeName.toLowerCase();
					var obj = _.middler.getObjectByAppName(W.APP,nodeName);
					if(!obj) V.showException('配置文件中没有找到对象类型定义:'+nodeName);
					obj.init(_,v,V.isValid(v.attr('_'))?json:null);
					obj.page = _;
					if(!id) {
						id = nodeName+V.random();
					}
					obj.nodeName = nodeName;
					if(!_.page.getModels(id)){
						_.page.setModels(id,{data:{}});
					}
					_.vs[id] = obj;
					V.inherit.apply(_.page.getModels(id),[M.Control,[]]);
					obj.bind(_.page.getModels(id));		
				},function(){
					//实现通过type属性完成数据初始化的功能
					V.forC(_.page.getModels(),function(key,v){
						if(v.type && !v.v){
							var obj = _.middler.getObjectByAppName(W.APP,v.type);
							if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
							var node2 = V.newEl('div');
							node.append(node2);
							obj.init(_,node2,null);
							obj.page = _;
							_.controls.push(obj);
							_.vs[key] = obj;
							V.inherit.apply(v,[M.Control,[]]);
							obj.bind(v);
						}
					},function(){
						_.onReady();
						_.call('start');
					},true);
				});
			};
			//动态添加控件到指定位置 如果不指定那么会添加到最后
			_.addControl = function(node,v){
				var obj = _.middler.getObjectByAppName(W.APP,v.type);
				if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
				node = node?node:V.newEl('div').appendTo(_.node);
				obj.init(_,node,v);
				obj.page = _;
				_.controls.push(obj);				
				var key = V.getValue(v.id,V.random());
				if(_.vs[key]){V.showException('控件id为'+key+'的控件已经存在，请更换id名');return;}
				_.vs[key] = obj;
				V.inherit.apply(v,[M.Control,[]]);
				_.vm.vms[key]=v;
				obj.bind(v);
				return v;
			};
			_.removeControl = function(id){
				delete _.vm.vms[id];
				if(_.vs[id]){
					var val = _.vs[id];
					delete _.vs[id];
					_.controls = $.grep(_.controls,function(v,i){return v!=val;});
					if(val) val.dispose();
					//V.tryC(function(){_.vs[id].node.remove();});
				}
			};
			_.clearControl = function(){
				if(_.controls){
					var vs=_.vs
					var div = $('<div style="display:none;"></div>').appendTo(window.document.body);
					_.node.children().appendTo(div);
					V.forC(vs,function(k,v){v.dispose();},function(){div.remove();},true);
				}	
				_.controls = [];_.vs = {};_.vm.vms = {};_.models = _.vm.vms;				
			};
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k){
						case 'size':
							$(window).resize(function(){
								V.userAgent.refresh();
								_.call('size',{
									height:V.userAgent.height,
									width:V.userAgent.width
								});
							});
							break;
						case 'wheel':
							var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";
							//todo 兼容版本 判断为向下
							node[0].addEventListener(wheelEvent, function (e) { _.call('wheel',{e:e,isDown:e.wheelDelta < 0}) }, false);
						break;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){__.onLoad(node);},true);
			}
			//可以将数据更新
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'title':
							document.title = value;
							if(data != _.vm.data) {delete data[key];}
							break;
						case 'close':
							_.dispose();
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
			_.get = function(name){
				if(!__.data[name]){
					__.data[name] = {};
					__.data[name] = __.ada.fill(name);
				}
				return __.data[name];
			};
			_.data = _.get;
			//支持 session.update('会话key',[data]);
			_.update = function(name,data){
				__.data[name] = V.merge(_.data(name),V.getValue(data,{}));
				__.ada.update(__.data[name],name);
			};
			//支持 session.clear('会话key',[data]);
			_.clear = function(name){
				__.ada.clear(name);
			};
			_.updateAll = function(){
				var ret = [];
				for(var i in __.data){
					ret.push({key:i,value:__.data[i]});
				}
				V.whileC(function(){ret.shift();},function(v){_.update(v.key,v.value);},function(){},true);
			};
			_.isLogin = function(){return false;};
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
			_.clear = function(name){
				_.getResource(name).clear(name);
			}
		};
		//专门用于继承使用
		M.SessionDataResource = function(){
			var _ = this,__ = {};
			{}
			_.load = function(name){return '';};
			_.save = function(name,data){};
			_.clear = function(name){};
		};
		M.SessionDataResourceDecorator = function(){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[M.SessionDataResource,[]]);
				__.res = Array.prototype.slice(arguments,0);
				console.log(__.res);
			}
			_.load = function(name){
				var val = undefined;
				V.each(__.res,function(v){try{val = val?val:v.load(name);}catch(e){}},null,true);
				return val;
			};
			_.save = function(name,data){
				V.each(__.res,function(v){try{v.save(name,data);}catch(e){}});
			};
			_.clear = function(name){
				V.each(__.res,function(v){try{v.clear(name);}catch(e){}});
			};
		};
		//定义时必须说明cookie.js的位置
		M.CookieDataResource = function(param){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[M.SessionDataResource,[]]);
				if(!$.cookie){
					V.include('ref/jquery.cookie.js');
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
					if(args.length==1 && args[0].indexOf("{")==0){
						return eval("("+args[0]+")");
					}else{
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
					}
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
						$.cookie(name,V.encHtml(V.toJsonString(V.getValue(data,{}))),__.param);
						break;
				}
			};
			_.clear = function(name){
				$.cookie(name,'', {expires:-1});
			};
		};
		//处理localStorage与sessionStorage 与 全局对象ObjectDB
		M.StorageDataResource = function(storage,timeout){
			var _ = this,__={};
			{
				V.inherit.apply(_,[M.SessionDataResource,[]]);
				__.storage = V.getValue(storage,window.sessionStorage);
				switch(typeof(__.storage)){
					case 'string':
						__.storage = eval('('+__.storage+')');
						break;
					case 'object':
						if(V.isArray(__.storage)){
							throw new Error('不能使用数组作为资源');
						}
						break;
					default:
						throw new Error('M.StorageDataResource 无法找到<'+storage+'>对象');
						break;
				}
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
							return val.data;
						}
					}
					return null;
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
							date:(__.timeout?new Date().add(__.timeout.interval,__.timeout.number).getTime():false)
						}));
					} else {
						__.storage[name]={
							data:str,
							date:(__.timeout?new Date().add(__.timeout.interval,__.timeout.number).getTime():false)
						};
					}
				};
				_.clear = function(name){_.save(name);};
			}
		};
		//todo 加解密DataResource
		{
			//todo action 对象组
			//ValidateManager对象负责完成view.view控件对于data.validate的属性处理与默认值绑定工作。
			//将data.validate对象按照middler定义转换成真实的判断对象，并由控件主动调用绑定其特有的input对象, 提供render中默认的valid方法只针对value进行验证
			//注入view层对象valid方法 和三种onError,onClearError,onSuccess(因为无法进行联合的验证次数判断)和事件触发 清理异常这种事建议由各个控件自己负责,目前统一处理为下一次验证开始时就调用onClearError方法 其次view.control对象在onLoad中过滤onError事件，在render中提供valide方法支持就是调用被注入的validate(text)方法，调用ValidateManager的validate方法时需要设置node与input对象，由具体的reg决定是否跟随输入测试还是等待调用才测试。
			//针对reg子类允许其异步查询和调用onError事件 一般就是check(func)方法，一般地 允许返回func(true/false)来进行异步判断 false就是报错
			//针对reg子类允许remote验证 提交对应的方法和提示语 或者true false
			//允许 data:{valldate:{IsRequired:'请输入默认的提示语',IsNumber:'',IsFloat:'',Regular:{exp:'',error:''},Remote:{exp:function(){},error:''}}}
			//允许针对form提供统一的判断
			W.ValidateManager = function(){
				var _ = this,__ = {};
				{}
				_.validate = function(control,input){
					var middler = control.middler;
					var datas = control.get();
					if(datas.validate){
						var regs = [];
						V.forC(datas.validate,function(k,v){
							var reg = middler.getObjectByAppName(W.APP,k);
							if(!reg) throw new Error('没找到对应的reg处理对象'+k);
							if(typeof(v) == 'string'){
								v = {reg:'',error:v};
							} else v = V.merge({reg:'',error:''},v);
							reg.init(control,v.reg,v.error,input);
							regs.push(reg);
						},function(){
							control.valid = function(text,func){
								if(control.isError){
									control.onClearError();
								}
								var success = true;
								var data = Array.prototype.slice.call(regs,0);
								V.whileC2(function(){return data.shift();},function(reg,next){
									reg.validate(text,function(suc){
										success = success && (suc && suc.length>0);										
										if (success) {
											next();
										} else {
											//警报
											control.isError = true;
											control.onError(reg.error);
										}
									});
								},function(){if(success){control.isError = false;control.onSuccess();if(func){func();}}});
							};
						});						
					}
				};
			};
			W.Regex = function(reg,error){
				var _ = this, __ = {};
				{
					__.reg = V.getValue(reg,'');
					__.error = V.getValue(error,'');
				}
				_.init = function(control,reg,error,input){
					_.cont = control;
					_.reg = V.getValue(__.reg,reg);
					_.error = V.getValue(error,__.error);
					if(!V.isValid(_.reg)) throw new Error('Regex默认使用reg属性完成判断reg属性不能为空!');
					else if(typeof(_.reg) == 'string'){_.reg = eval(_.reg);};
				};
				_.validate = function(text,func){
					func((text+'').match(_.reg));
				};
			};
		}
	}
})(VJ,jQuery);
(function(V,$,W,M){
	{
		W.Box = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {border:1}]]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}			
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					_.bindEvent(_.node,k,v);					
				},null,true);
				__.onLoad(node);
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'border':
							_.node.css({border:'solid '+v+'px'});
							break;
						case 'key':							
							_.node.css({'text-align':'center','line-height':_.node.height()+'px','vertical-align':'middle',margin:'0 auto','minwidth':'40px','minheight':'20px'}).html(v);
							break;
					}
				});
				return data;
			};
		};
		W.FillControl = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				__.replaceNode = _.replaceNode
			}			
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					if(k.toLowerCase() == 'click'){
						_.node.on('click', 'input', function (e) { var _this = $(this); _.call('click', { e: e, vid: _this.val(), name: _this.attr('name') }); V.stopProp(e); return false;});
						_.node.on('click', 'a,.click', function (e) { var _this = $(this); _.call('click', { e: e, vid: _this.attr('vid') || _this.attr('href'), name: _this.attr('name') }); V.stopProp(e); return false; });
					} else _.bindEvent(_.node,k,v);					
				},null,true);
				__.onLoad(node);
			};
			_.replaceNode = function(){
				//必须覆盖这个方法否则_.node就是替换后的了
				__.content = _.node.html();
				__.replaceNode.apply(_,arguments);
				//_.node.html(__.content);
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'value':							
							_.node.html(V.format(__.content,v));
							break;
					}
				});
				return data;
			};
		};
		W.History = function(path,vm){
			var _ = this,__ ={};
			{
				V.inherit.apply(_,[W.Control,[path || '<span style="display:none;"></span>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
			}
			_.fill = function(){
				return {hash:window.location.hash.replace(/#/g,'')};
			};
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'change':
							$(window).bind('hashchange', function (e) {
								if(_.lastAction != window.location.hash.replace(/#/g,'')){
									_.call('change',{lastAction:_.lastAction});
									_.lastAction = _.get().history.pop();
								}						
							});
							break;
					}
				},function(){__.onLoad(node);});
			};
			_.render = function(data){
				if(data){
					delete data.visible;
					delete data.invisible;
				}
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'add':
							if(!_.get().history){_.get().history = [];}
							if(window.location.hash){
								var his = _.get().history;
								if(!(his.length>0 && his[his.length-1]==window.location.hash.replace(/#/g,''))){
									his.push(window.location.hash.replace(/#/g,''));
								}
							}							
							v = v.replace(/#/g,'');
							if(_.lastAction != v){
								window.location.hash = v;
								_.lastAction = v;
							}
							break;
						case 'remove':
							_.get().history.pop();
							break;
						case 'back':
							if(_.get().history && _.get().history.length>0 && v){
								window.location.hash = _.get().history.pop();
							}
							break;
					}
				});
				return data;
			};
		};
		//识别 上下左右滑动及其动画，同时支持滑入滑出，支持点击或者tap，支持加载动画
		//支持onUp向上滑动/onUpOut向上滑出/onDown向下滑动/onDownOut向下滑出/onLeft向左滑动/onLeftOut向左滑出/onRight向右滑动/onRightOut向右滑出/onDblClick双击/onScale(data(scale),self)双指改变大小/onRotate(data(angle),self)双指旋转 show('animatename')显示动画/hide('animatename')动画隐藏 limit动画事件响应阀值达到阀值后才触发事件，limitBack触发事件后是否立即回复正常
		W.Panel = function(path,vm,limit,limitBack,lock){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				__.hasRender = false;
				__.status = {
					panelid:V.random(),
					transform:{
						tx: 0, ty: 0,
						scale: 1,
						angle: 0,
						rx: 0,
						ry: 0,
						rz: 0
					},
					callevent:{value:false},
					limit:V.getValue(limit,0),
					limitBack:V.getValue(limitBack,true),
					lock:lock?lock:false,
					startX:0,startY:0
				};
				_.status = __.status;
				__.moving = false;
				_.am = function(node,data,timeout){
					if(!__.status.lock && !__.moving) {
						V.once(function(){
							__.status.transform = V.merge(__.status.transform,data);
							var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d(0,0,0,{angle}deg)',__.status.transform);
							node.css('webkitTransform',value).css('mozTransform',value).css('transform',value);
							__.moving = false;
						}, timeout || (1000 / 60));
						__.moving = true;
					}
				};
			}
			//事件处理
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'up':
							V.merge(__.status,{
								vol:true,
								up:true
							},true);
							break;
						case 'down':
							V.merge(__.status,{
								vol:true,
								down:true
							},true);
							break;
						case 'upout':
							V.merge(__.status,{
								vol:true,
								upout:true
							},true);
							break;
						case 'downout':
							V.merge(__.status,{
								vol:true,
								downout:true
							},true);
							break;
						case 'left':
							V.merge(__.status,{
								hor:true,
								left:true
							},true);
							break;
						case 'right':
							V.merge(__.status,{
								hor:true,
								right:true
							},true);
							break;
						case 'leftout':
							V.merge(__.status,{
								hor:true,
								leftout:true
							},true);
							break;			
						case 'rightout':
							V.merge(__.status,{
								hor:true,
								rightout:true
							},true);
							break;
						case 'scale':
							V.merge(__.status,{
								pinch:true
							},true);
							break;
						case 'rotate':
							V.merge(__.status,{
								rotate:true
							},true);
							break;
						case 'dblclick':
							V.merge(__.status,{
								dblclick:true
							},true);
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){node.attr('panelid',__.status.panelid);__.status.panelaction=(function(){
					var ret = [];
					if(__.status.vol){ret.push('vol');}
					if(__.status.hor){ret.push('hor');}
					if(__.status.pinch){ret.push('pinch');}
					if(__.status.rotate){ret.push('rotate');}
					if(__.status.dblclick){ret.push('dblclick');}
					return ret;
				})(); node.attr('panelaction',__.status.panelaction.join(','));__.onLoad(node);});
			};
			_.fill = function(){return {};};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'width':
							_.node.width(v);
							break;
						case 'height':
							_.node.height(v);
							break;
					}
				},null,true);
				if(!__.hasRender){
					__.document = $(document);
					__.hasRender = true;
					//当物理控件的相关事务返回真时，启动提前终止的动画操作
					__.finalMove = false;
					__.mc = new Hammer.Manager(_.node[0]);
					//最终动画方法和事件应该以便后面的控件自己控制移动和回滚的动画
					//应该允许后面的继承控件自己控制
					//事件的触发应该有阀值，在超出阀值时触发事件 并引发或者不引发回滚						
					__.mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));						
					//__.mc.add(new Hammer.Swipe({velocity:0.6})).recognizeWith(__.mc.get('pan'));						
					if(__.status.rotate || __.status.pinch){
						__.mc.add(new Hammer.Rotate({threshold:0})).recognizeWith(__.mc.get('pan'));
					} 
					if(__.status.pinch){
						__.mc.add(new Hammer.Pinch({threshold:0})).recognizeWith([__.mc.get('pan'), __.mc.get('rotate')]);
					}
					if(__.status.dblclick){
						__.mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
					}
					//__.mc.add(new Hammer.Tap());swipeleft swiperight swipeup swipedown 
					__.mc.on(V.format("panleft panright panup pandown {pinorrot} {doubleclick}",{
							//hor:(__.status.hor?'panleft panright':''),
							//vol:(__.status.vol?'panup pandown':''),
							pinorrot:__.status.rotate?'rotatestart rotatemove rotateend rotate':(__.status.pinch?'pinchstart pinchmove pinchend':''),
							doubleclick:__.status.dblclick?'doubletap':''}),
						function(ev) {
							//开始就有一个panelid 判断发生的target是否有panelid 如果有panelid且不是自己则不处理这个事情，否则处理这个事情（解决同向的滚动问题）
							//修改为只要其定义的事件集合不包含我们的事件集合就可以处理
							//需要过滤掉panelid相等但是不是本身的
							var parent = ev.target.hasAttribute('panelid')?$(ev.target):$(ev.target).parents('[panelid]:first');
							parent = parent.length>0?parent:null;
							if(parent && parent.attr('panelid') ==__.status.panelid){							
								switch(ev.type){
									case 'panright':
									case 'panleft':
									case 'swiperight':
									case 'swipeleft':
										if($.inArray('hor',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'panup':
									case 'pandown':
									case 'swipeup':
									case 'swipedown':
										if($.inArray('vol',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'pinchstart':
									case 'pinchmove':
									case 'pinchin':
									case 'pinchout':
									case 'pinchend':
										if($.inArray('pinch',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'rotate':
									case 'rotatestart':
									case 'rotatemove':
									case 'rotateend':							
										if($.inArray('rotate',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'doubletap':								
										if($.inArray('dblclick',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
								}
							}							
							if(parent && parent.attr('panelid') !=__.status.panelid && parent.attr('panelaction') !=''){
								var action = parent.attr('panelaction').split(',');
								switch(ev.type){
									case 'panright':
									case 'panleft':
									case 'swiperight':
									case 'swipeleft':
										if($.inArray('hor',action)>=0) return;
										break;
									case 'panup':
									case 'pandown':
									case 'swipeup':
									case 'swipedown':
										if($.inArray('vol',action)>=0) return;
										break;
									case 'pinchstart':
									case 'pinchmove':
									case 'pinchin':
									case 'pinchout':
									case 'pinchend':
										if($.inArray('pinch',action)>=0) return;
										break;
									case 'rotate':
									case 'rotatestart':
									case 'rotatemove':
									case 'rotateend':											
										if($.inArray('rotate',action)>=0) return;
										break;
									case 'doubletap':											
										if($.inArray('dblclick',action)>=0) return;
										break;
								}									
							}
							if(!__.finalMove){
								//这里会出现闪烁，除非立即设定现在的位置 按理说finalMove应保护最终动画的完成
								_.node.removeClass('animate').find('.animate').removeClass('animate');
								switch(ev.type){
									case 'panright':
									case 'swiperight':										
										if(__.status.hor && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)>Math.abs(ev.deltaY)){
											__.status.lastAction = 'right';
											__.finalMove = false ||	_.onRight(ev,__.status);
										} else if(!__.status.hor && document.body.clientWidth < document.body.scrollWidth){
											//改为以一个固定的起始点+位移为处理方法 这样可以避免移动加倍的问题。
											if(__.status.startX == 0) __.status.startX = __.document.scrollLeft();
											__.document.scrollLeft(Math.max(__.status.startX-ev.deltaX,0));
										}
										break;
									case 'panleft':	
									case 'swipeleft':								
										if(__.status.hor && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)>Math.abs(ev.deltaY)){
											__.status.lastAction = 'left';											
											__.finalMove = false ||	_.onLeft(ev,__.status);
										} else if(!__.status.hor && document.body.clientWidth < document.body.scrollWidth){
											if(__.status.startX == 0) __.status.startX = __.document.scrollLeft();
											__.document.scrollLeft(Math.min(__.status.startX-ev.deltaX,document.body.scrollWidth - document.body.clientWidth));
										}
										break;
									case 'panup':
									case 'swipeup':																
										if(__.status.vol && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)<Math.abs(ev.deltaY)){
											__.status.lastAction = 'up';							
											__.finalMove = false ||	_.onUp(ev,__.status);
										} else if(!__.status.vol && window.screen.availHeight < document.body.scrollHeight){
											if(__.status.startY == 0) __.status.startY = __.document.scrollTop();
											__.document.scrollTop(Math.max(__.status.startY-ev.deltaY,document.body.scrollHeight - document.body.clientHeight));
										}
										break;
									case 'pandown':
									case 'swipedown':	
										if(__.status.vol && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)<Math.abs(ev.deltaY)){
											__.status.lastAction = 'down';			
											__.finalMove = false ||	_.onDown(ev,__.status);
										} else if(!__.status.vol && window.screen.availHeight < document.body.scrollHeight){
											if(__.status.startY == 0) __.status.startY = __.document.scrollTop();
											__.document.scrollTop(Math.min(__.status.startY-ev.deltaY,document.body.scrollHeight));
										}
										break;
									case 'pinchstart':
										__.rotating = true;
									case 'pinchmove':
										__.finalMove = false ||	_.onScale(ev,__.status);
										break;
									case 'pinchin':
									case 'pinchout':
										__.status.lastAction = 'scale';
										__.scale = ev.scale;
										break;
									case 'pinchend':									
										__.rotating = false;
										break;
									case 'rotate':
									case 'rotatestart':
										__.rotating = true;
									case 'rotatemove':
										//完成一个panel基础版本 其事件类应该可以由子类触发 完成一个hswiperpanel版本 完成一个上下移动的SPA初级模块
										__.status.lastAction = 'rotate';
										__.status.angle = ev.angle;
										__.finalMove = false || _.onRotate(ev,__.status);
										if(__.pinch){__.status.scale = ev.scale};
										break;
									case 'rotateend':										
										__.rotating = false;
										break;
								}
								//仅处理还原
								if(__.finalMove){
									V.once(function(){
										if(__.status.callevent.value) _.onFinal(__.status);
										_.onBackAnimate(_.node,__.status);											
										__.status.callevent.value = false;
										V.once(function(){__.finalMove = false;},300);
									},100);
								}
							}
						});
						__.mc.on("hammer.input", function(ev) {
							if(ev.isFinal && !__.finalMove) {
								V.once(function(){
									if(__.status.callevent.value) _.onFinal(__.status);
									_.onBackAnimate(_.node,__.status);
									__.status.callevent.value = false;
									V.once(function(){__.finalMove = false;},300);
								},100);
							}
						});
					/*
					__.mc.on("swipe", onSwipe);
					__.mc.on("tap", onTap);
					*/
				}
				return data;
			};
			
			//以方便继承类覆盖并执行动画
			_.onLeft = function(ev,e){
				//使用速度计算距离不是太合理 Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				if(Math.abs(ev.deltaX) < Math.max(30,_.node.width()* e.limit)) {_.am(_.node,{tx:(e.left||e.leftout)?ev.deltaX:Math.max(0,ev.deltaX),ty:0});}
				else {e.callevent.value = true;return e.limitBack;}
				};
			_.onRight = function(ev,e){
				if(Math.abs(ev.deltaX) < Math.max(30,_.node.width()* e.limit)) _.am(_.node,{tx:(e.right||e.rightout)?ev.deltaX:Math.max(0,ev.deltaX),ty:0});	
				else {e.callevent.value = true;return e.limitBack;}
				};
			_.onUp = function(ev,e){
				if(Math.abs(ev.deltaY) < Math.max(30,_.node.height()* e.limit)) _.am(_.node,{ty:(e.up||e.upout)?ev.deltaY:Math.max(0,ev.deltaY),tx:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onDown = function(ev,e){				
				if(Math.abs(ev.deltaY) < Math.max(30,_.node.height()* e.limit)) _.am(_.node,{ty:(e.down||e.downout)?ev.deltaY:Math.min(0,ev.deltaY),tx:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onScale = function(ev,e){
				if(Math.abs(ev.scale-1)<e.limit) _.am(_.node,{scale:ev.scale});
				else {e.callevent.value = true;}};
			_.onRotate = function(ev,e){_.am(_.node,{angle:ev.rotation,scale:e.pinch?ev.scale:1});e.callevent.value = true;};
			//最终执行动画并触发事件缓冲100毫秒发生			
			_.onBackAnimate = function(node,e){
				V.merge(e.transform,{tx:0,ty:0,scale:1,angle:0,rx:0,ry:0,rz:0,startX:0,startY:0},true);
				switch(e.lastAction){
					case 'left':										
						if(e.leftout){
							e.transform.tx = screen.width*-1;
						}
						break;	
					case 'right':
						if(e.rightout){
							e.transform.tx = screen.width;														
						}
						break;										
					case 'up':										
						if(e.upout){
							e.transform.ty = screen.height*-1;
						}
						break;										
					case 'down':										
						if(e.downout){
							e.transform.ty = screen.height;
						}
						break;
				}
				var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',e.transform);										
				node.addClass('animate').css('webkitTransform',value).css('mozTransform',value).css('transform',value);
				switch(e.lastAction){
					case 'left':		
						if(e.leftout){
							node.hide();
						}
						break;	
					case 'right':		
						if(e.rightout){
							node.hide();
						}
						break;										
					case 'up':
						if(e.upout){
							node.hide();
						}
						break;										
					case 'down':		
						if(e.downout){
							node.hide();
						}
						break;
				}
			};
			//最后触发的事件
			_.onFinal = function(e){	
				switch(e.lastAction){
					case 'left':		
						if(e.leftout){
							_.call('leftout');
						}
						else
							_.call('left');
						break;	
					case 'right':		
						if(e.rightout){
							_.call('rightout');
						}
						else
							_.call('right');
						break;										
					case 'up':
						if(e.upout){
							_.call('upout');
						}
						else
							_.call('up');
						break;										
					case 'down':		
						if(e.downout){
							_.call('downout');
						}
						else
							_.call('down');
						break;
					case 'scale':										
						_.call('scale',{scale:e.scale});
						break;							
					case 'rotate':
						if(e.pinch){
							if(e.scale != 1) {_.call('scale',{scale:e.scale});}
						}
						_.call('rotate',{angle:e.angle});
						break;
				}
			};			
		};
		W.PagePanel = function(middler,path,vm,limit,limitBack){
			var _ = this,__ = {};
			{	

				V.inherit.apply(_,[middler.getTypeByAppName('VESH.view', 'panel'),[V.getValue(path, '<div style="overflow:hidden;"><div style="display:none;"></div></div>'),V.merge(V.getValue(vm,{}),{
					data:{direction:'hor',value:0},						
					onLeft:function(data,self){_.change(true);},
					onRight:function(data,self){_.change(false);},
					onUp:function(data,self){_.change(true);},
					onDown:function(data,self){_.change(false);}
				},true),limit || 0.2,limitBack || true,true]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.lock = false;
			}
			_.onLoad = function(node){
				node.removeClass('animate');
				_.panel = node.find('div:first');
				_.children  = _.panel.siblings();
				//if(_.children.length==0) {}
				_.length = _.children.length;
				_.children.width(node.width()).height(node.height()).css('overflow','hidden').css('position','relative');
				_.children.addClass('noactive');
				_.panel.append(_.children);
				//根据direction覆盖监听操作 同时修改panelaction
				var dir = _.get().direction;
				switch(dir){
					case 'vol':
						_.vol = true;
						delete _.events.left;
						delete _.events.right;
						//取消水平操作动画
						_.panel.css('height',_.length+'00%').css('width','100%');
						break;
					case 'hor':
					default:
						//取消垂直操作动画
						_.hor = true;
						delete _.events.up;
						delete _.events.down;
						_.panel.css('width',_.length+'00%').css('height','100%');//.css('display','flex');						
						_.children.css('float','left');
						break;
				}
				V.forC(_.events,function(k,v){
					k = k.toLowerCase();
					switch(k){
						case 'change':								
							break;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){__.onLoad(node);});
			};
			//以方便继承类覆盖并执行动画
			__.onLeft = _.onLeft;
			_.onLeft = function(ev,e){
				if(_.vol || _.lock) return;
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onLeft(ev,e);
			};
			__.onRight = _.onRight;
			_.onRight = function(ev,e){
				if(_.vol || _.lock) return;
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onRight(ev,e);
			};
			__.onUp = _.onUp;
			_.onUp = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onUp(ev,e);
			};
			__.onDown = _.onDown;
			_.onDown = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onDown(ev,e);
			};
			//low设计需要区别第一次
			__.first = true;
			_.render = function(data){				
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'value':
							_.change(v,true,__.first);
							__.first = false;
							break;
						case 'freeze':
						case 'lock':
							_.lock = v;
							break;
						case 'height':
							_.panel.children().height(v);
							break;
						case 'width':				
							_.panel.children().width(v);
							break;
						case 'values':
							var lst = V.newEl('div','','').css('display','none;');
							V.each(v,function(v2){
								lst.append(v2);
							},function(){
								_.children = lst.children();
								_.length = _.children.length;
								_.children.width(_.node.width()).height(_.node.height()).css('overflow','hidden').css('position','relative');
								_.children.addClass('noactive');						
								_.panel.empty().append(_.children);
								if(_.vol){_.panel.css('height',_.length+'00%').css('width','100%');}else{_.panel.css('width',_.length+'00%').css('height','100%');_.children.css('float','left');}
								_.change(_.index==NaN?0:_.index,true,true);
								lst.remove();								
							},false);
							break;
					}
				},function(){
				},true);
			};
			_.change = function(val,nofire,first){
				val = (''+val).toLowerCase();
				var num = Math.ceil(__.distance/(_.hor?_.node.width():_.node.height()));
				val=Math.max(0,Math.min(_.children.length-1,val=='true'?(_.get().value+num):(val == 'false'?(_.get().value-num):parseInt(val))));
				_.index = val;
				if(!nofire && val != parseInt(_.get().value)) {_.call('change',{value:val});}
				else {_.onBackAnimate(_.panel,_.status,first);}
			};
			_.onBackAnimate = function(node,e,first){
				V.once(function(){
					//等待1秒是希望在触发事件更新Index之后再处理动画才能合理显示
					V.merge(e.transform,{tx:0,ty:0,scale:1,angle:0,rx:0,ry:0,rz:0,startX:0,startY:0},true);
					if(_.hor){e.transform.tx-=(_.node.width()*_.index);} else if(_.vol){e.transform.ty-=(_.node.height()*_.index);}
					var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',e.transform);
					if(!first) {_.panel.addClass('animate')};
					_.panel.css('webkitTransform',value).css('mozTransform',value).css('transform',value).show();//.addClass('animate')
					/*var cur = $(_.children.get(_.index));
					if(cur.hasClass('noactive')){
						cur.removeClass('noactive').addClass('active');
						//不仅仅是动画 需要显示
						_._animate('fadeOut',_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active'),function(){
							_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active').hide().removeClass('active').addClass('noactive');
						})
						_._animate('fadeIn',cur,function(){cur.show();});
					}*/
				},10);
			};
		};
		//上下或者左右滚动的方法的基本类，继承者注意重载onValue(v,func)函数 其中v代表按照value,values,addValues传入的数据，传入时已整理为数组，func是参数为字符串的对象，如果不适用，那么请{}方式添加子控件
		W.ScrollPanel = function(middler,path,vm,limit,limitBack){
			var _ = this,__ = {};
			{	
				V.inherit.apply(_,[middler.getTypeByAppName('VESH.view', 'panel'),[V.getValue(path, '<div style="overflow:hidden;"><div style="display:none;"></div></div>'),V.merge(V.getValue(vm,{}),{
					data:{direction:'vol'},						
					onLeft:function(data,self){_.call('next')},
					onRight:function(data,self){_.call('reload')},
					onUp:function(data,self){_.call('next')},
					onDown:function(data,self){_.call('reload');}
				},true),limit || 0.2,limitBack || true]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.lock = false;
				V.merge(_.status.transform,{x:0,y:0},true);
			}
			_.onLoad = function(node){
				node.removeClass('animate');
				_.panel = node.find('div:first');
				_.children  = _.panel.siblings();
				//if(_.children.length==0) return;
				_.length = _.children.length;					
				_.value = Math.max(0,Math.min(_.children.length,parseInt(_.value)));
				_.children.css('position','relative');
				_.children.addClass('noactive');
				_.panel.append(_.children);
				//根据direction覆盖监听操作 同时修改panelaction
				var dir = _.get().direction;
				switch(dir){
					case 'vol':
						_.vol = true;
						delete _.events.left;
						delete _.events.right;
						//取消水平操作动画
						_.panel.css('width','100%');
						_.children.css('width','100%')
						break;
					case 'hor':
					default:
						//取消垂直操作动画
						_.hor = true;
						delete _.events.up;
						delete _.events.down;
						_.panel.css('height','100%');
                        if(_.children.width()) _.panel.width(_.children.width());//.css('display','flex');					
						_.children.css('height','100%').css('float','left');
						break;
				}
				V.forC(_.events,function(k,v){
					k = k.toLowerCase();
					switch(k){
						case 'next':
						case 'reload':
							break;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){__.onLoad(node);});
			};
			//以方便继承类覆盖并执行动画
			_.onLeft = function(ev,e){
				if(_.vol || _.lock) return;				
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
				var x = e.transform.x+ev.deltaX;
				if(x < (_.node.width()-5-_.panel.width())){e.callevent.value=true;}
				if(x > Math.min(-e.limit,(_.node.width()-e.limit-_.panel.width()))) {_.am(_.panel,{tx:(e.left||e.leftout)?x:Math.max(0,ev.deltaX),ty:0});} else return e.limitBack;
			};
			_.onRight = function(ev,e){
				if(_.vol || _.lock) return;
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
				var x = e.transform.x+ev.deltaX;
				if(x > 5){e.callevent.value=true;}
				if(x < e.limit){_.am(_.panel,{tx:(e.right||e.rightout)?x:Math.max(0,ev.deltaX),ty:0});} else return e.limitBack;
			};
			_.onUp = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				var y = e.transform.y+ev.deltaY;
				if(y < (_.node.height()-5-_.panel.height())){e.callevent.value=true;}
				if(y > Math.min(-e.limit,(_.node.height()-e.limit-_.panel.height()))) {_.am(_.panel,{ty:(e.up||e.upout)?y:Math.max(0,ev.deltaY),tx:0});} else return e.limitBack;
			};
			_.onDown = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
				var y = e.transform.y+ev.deltaY;
				if(y > 5){e.callevent.value=true;}
				if(y < e.limit){_.am(_.panel,{ty:(e.down||e.downout)?y:Math.max(0,ev.deltaY),tx:0});} else return e.limitBack;
			};
			_.onScale = function(ev,e){
				if(Math.abs(ev.scale-1)*Math.min(_.node.width(),_.node.height)<e.limit) _.am(_.panel,{scale:ev.scale});
				else {e.callevent.value = true;}};
			_.addControl = function(node,v){
				if(!_.controls){
					_.controls = [];
					_.vs = {};
					_.vms = {};_.models = _.vms;
				}
				var obj = _.middler.getObjectByAppName(W.APP,v.type);
				if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
				node = node?node:V.newEl('div').appendTo(_.panel);
				obj.init(_,node,v);
				obj.page = _.page;
				_.controls.push(obj);
				var key = V.getValue(v.id,V.random());
				if(_.vs[key]){V.showException('控件id为'+id+'的子控件已经存在，请更换id名');return;}
				_.vs[key] = obj;
				V.inherit.apply(v,[M.Control,[]]);
				_.vms[key]=v;
				obj.bind(v);
				return v;
			};
			_.render = function(data){				
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'value':
							_.onValue([v],function(content){
								switch(typeof(content)){
									case 'string':
										_.panel.empty().append(content)
										break;
									case 'object':
										_.panel.empty();
										_.addControl(null,content);
										break;
								}
							});
							break;
						case 'values':
							_.onValue(v,function(content){
								switch(typeof(content)){
									case 'string':
										_.panel.empty().append(content)
										break;
									case 'object':
										if(!V.isArray(content)){content = [content];}
										_.panel.empty();
										V.each(content,function(v){_.addControl(null,v);});
										break;
								}
							});
							break;
						case 'addvalues':						
							_.onValue(v,function(content){
								switch(typeof(content)){
									case 'string':
										_.panel.append(content)
										break;
									case 'object':
										if(!V.isArray(content)){content = [content];}
										V.each(content,function(v){_.addControl(null,v);});
										break;
								}});
							break;
						case 'top':
							if(v){
								_.get().top = false;
								_.onBackAnimate(_.node,V.merge(_.status,{transform:{tx:0,ty:0}},true));
							}
							break;
						case 'bottom':
							if(v){
								_.get().bottom = false;
								_.onBackAnimate(_.node,V.merge(_.status,{transform:{tx:_.status.vol?0:(_.node.width() - _.panel.width()),ty:_.status.hor?0:(_.node.height() - _.panel.height())}},true));
							}
							break;
						case 'freeze':
						case 'lock':
							_.lock = v;
							break;
					}
				},function(){
				},true);
				_.panel.show();
				return data;
			};
			//一般需要重载此方法即可
			_.onValue = function(v,func){
				if(!V.isArray(v)) v = [v];
				var sb = V.sb();
				V.each(v,function(v2){if(typeof(v2)=='string') {sb.append(v2);} else sb.append(V.toJsonString(v2));},function(){func(sb.clear());sb = null;});
			};			
			_.onBackAnimate = function(node,e){
				V.once(function(){
					if(e.vol && e.transform.ty<0 && e.transform.ty > (_.node.height() - _.panel.height())){e.transform.y = e.transform.ty;return;}
					if(e.hor && e.transform.tx<0 && e.transform.tx > (_.node.width() - _.panel.width())){e.transform.x = e.transform.tx;return;}
					V.merge(e.transform,{
						tx:Math.min(0,Math.max(_.node.width() - _.panel.width(),e.transform.tx)),
						ty:Math.min(0,Math.max(_.node.height() - _.panel.height(),e.transform.ty)),
						scale:1,angle:0,rx:0,ry:0,rz:0,startX:0,startY:0},true);
					V.merge(e.transform,{x:e.transform.tx,y:e.transform.ty},true);
					//等待1秒是希望在触发事件更新Index之后再处理动画才能合理显示
					var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',e.transform);
					_.panel.addClass('animate').css('webkitTransform',value).css('mozTransform',value).css('transform',value).show();
					/*var cur = $(_.children.get(_.index));
					if(cur.hasClass('noactive')){
						cur.removeClass('noactive').addClass('active');
						//不仅仅是动画 需要显示
						_._animate('fadeOut',_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active'),function(){
							_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active').hide().removeClass('active').addClass('noactive');
						})
						_._animate('fadeIn',cur,function(){cur.show();});
					}*/
				},10);
			};
		}
	}
})(VJ,jQuery,VJ.view,VJ.viewmodel);