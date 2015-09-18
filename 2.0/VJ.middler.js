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
				var host = V.getValue(v.host,defParam.host);
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
				var para = __.convertParas(config,v.params,V.merge(defParam,{path:path,pack:defParam.pack,host:host}),app,pcm);
				return new function(){
					var _ = this;
					_.getType = function(){
						if(path) {
							V.each(path.split(';'),function(v){
								if(defParam.host && v.toLowerCase().indexOf('../')<0 && v.toLowerCase().indexOf('http://')<0){
									v = defParam.host + v;
								}
								V.include(v);
							},null,true);
						}
						var paras = para.getParas();
						return eval('('+type+')');
					};
					_.getValue = function(){
						if(path) {
							//以后可以修改 目前是有缓存的 path改为支持;号隔开的各个路径
							V.each(path.split(';'),function(v){
								if(defParam.host && v.toLowerCase().indexOf('../')<0 && v.toLowerCase().indexOf('http://')<0){
									v = defParam.host + v;
								}
								V.include(v);
							},null,true);
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
