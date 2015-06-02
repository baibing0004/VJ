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
						V.while(function(){__.funs.shift()},function(v){v(__.template.clone());},function(){});						
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
					V.for(_.vm,function(key,value){
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
				V.for(data,function(key,value){
					switch(key){
						case 'attr':
							V.for(value,function(key2,value2){_.node.attr(key2,value2);},function(){});
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
					V.while(function(){i--;return i>=0?{key:attrs[i].name,val:attrs[i].value}:null},function(v){node.attr(v.key,v.val);},function(){},true);
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
					V.for(vm,function(key,value){
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
				V.while(function(){return p.shift();},function(v1){
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
					V.for(_.page.getModels(),function(key,v){
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
				V.for(data,function(key,value){
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
				V.while(function(){ret.shift();},function(v){_.update(v.key,v.value);},function(){},true);
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
				V.for(_.events,function(k,v){
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
				V.for(data,function(key,value){
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
				V.for(data,function(key,value){
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
				V.for(_.events,function(k,v){
					_.bindEvent(_.sel,k,v);
				},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {val:_.sel.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.for(data,function(key,value){
					switch(key){
						case 'options':
							_.sel.empty();
							if(V.getType(value) == 'string'){
								value = eval('('+value+')');
							};
							V.for(value,function(k,v){
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
				V.for(_.events,function(k,v){_.bindEvent(node,k,v);},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {val:_.node.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.for(data,function(key,value){
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
				V.for(data,function(key,value){
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
				V.for(data,function(key,value){
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
				V.for(_.events,function(k,v){_.bindEvent(node,k,v)},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {value:_.node.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.for(data,function(key,value){
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
