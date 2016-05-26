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
					node.css('animation',css).css('-webkit-animation',css).css('-webkit-animation-play-state','running').css('-moz-animation',css).css('-moz-animation-play-state','running').css('-o-animation',css).css('-o-animation-play-state','running');
					{
						node.one('webkitAnimationEnd',function(){
							node.css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(func) func();
						});
						node.one('mozAnimationEnd',function(){
							node.css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(func) func();
						});
						node.one('MSAnimationEnd',function(){
							node.css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(func) func();
						});
						node.one('oanimationend',function(){
							node.css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(func) func();
						});
						node.one('animationend',function(){
							node.css('-webkit-animation','').css('-moz-animation','').css('-o-animation','');
							if(func) func();
						});
					}
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
			_.call = function(name,param){
				//所有的事件调用全部采用异步调用方式 V.once				
			    param = V.getValue(param, {});
				V.merge(_.vm.data,_.fill(),param,true);
				param = V.merge(_.vm.data, param);
				name = name.toLowerCase();
				if(_.events[name]){
					V.once(function(){
					    var val = _.events[name].apply(_.parent.vms, [param, _.vm]);
					    V.merge(_.vm.data,V.getValue(param, {}), true);
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
				if(_.vs[key]){V.showException('控件id为'+id+'的子控件已经存在，请更换id名');return;}
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

			_.call = function(name,param){
				//所有的事件调用全部采用异步调用方式 V.once				
			    param = V.getValue(param, {});
				V.merge(_.vm.data,_.fill(),param,true);
				param = V.merge(_.vm.data, param);
				name = name.toLowerCase();
				if(_.events[name]){
					V.once(function(){
					    var val = _.events[name].apply(_.parent.getModels(), [param, _.vm]);
					    V.merge(_.vm.data,V.getValue(param, {}), true);
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
				if(_.vs[key]){V.showException('控件id为'+id+'的控件已经存在，请更换id名');return;}
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
