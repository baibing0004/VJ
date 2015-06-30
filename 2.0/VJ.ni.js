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
						params = V.merge(cmd.params,V.getValue(params,{}));
						template = cmd.template;
					}
					_.lstCmd.push({name:command,params:params,func:func,template:template,key:name});
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
								switch(_.connection.params.dbtype){
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
												data = eval('('+data.replace(/[\r\n]+/g,'')+')');	
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
										V.showException('V.NiSocketDataCommand success方法 name:typeof错误 type:' + (data));
										hasFalse = true;
										break;
									}            
									if(hasFalse){
										data = false;
									} else {
										switch(_.connection.params.dbtype){
											default:
											case 'json':
												break;
											case 'tjson':
												data = V.evalTJson(data);
												break;
										}
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
				_.KEY = 'Ni';
				__._addCommand = _._addCommand;
				__._excute = _._excute;
				_.lstCmd2 = {};
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
								ommand = V.getValue(cmd.command,_.clearCommand);
							}
						}else{
							command = V.getValue(cmd.command,_.cacheCommand);
						}
						if(cmd){
							_.lstCmd2[index] = {
								name:command,
								key:name,
								params:V.merge(_.lstCmd[_.lstCmd.length-1].params,{cacheKey:V.hash(name+'.Set.'+V.toJsonString(_.lstCmd[_.lstCmd.length-1].params))})
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
											_cmd.params = V.merge(cmd.params,{
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
								var _nicmd = _.lstCmd2[i];
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
				params = VJ.merge({},params);
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
											_cmd.params = V.merge(cmd.params,{
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
