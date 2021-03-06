(function(V, $) {
    V.middler = {};
    V.config.Configs = V.merge(V.config.Configs, { ConfigConverts: { Middler: { type: 'VJ.middler.MiddlerConfigConvert' } } });
    var M = V.middler;
    M.Middler = function(cm) {
        var _ = this;
        var KEY = 'Middler'; {}
        _.getObjectByAppName = function(app, name) {
            try {
                return cm.getConfigValue(KEY, new function() {
                    var _ = this; {}
                    _.getValue = function(config) {
                        return config.getValueByName(app, name);
                    };
                });
            } catch (e) {
                V.showException(app + ":" + name, e);
            }
        };
        _.setObjectByAppName = function(app, name, val) {
            try {
                return cm.setConfigValue(KEY, new function() {
                    var _ = this; {}
                    _.setValue = function(config, val) {
                        return config.setValueByName(app, name, val);
                    };
                }, val);
            } catch (e) {
                V.showException(app + ":" + name, e);
            }
        };
        _.getTypeByAppName = function(app, name) {
            try {
                return cm.getConfigValue(KEY, new function() {
                    var _ = this; {}
                    _.getValue = function(config) {
                        return config.getTypeByName(app, name);
                    };
                });
            } catch (e) {
                V.showException(app + ":" + name, e);
            }
        };
    };
    M.MiddlerConfig = function() {
        var _ = this; {
            V.inherit.apply(_, [V.config.Config, []]);
        }
        _.getValue = function(key) {
            return key.getValue(_);
        };
        _.setValue = function(key, val) {
            return key.setValue(_, val);
        };
        _.merge = function(config) {
            if (config.data) {
                _.data = {};
                for (var i in config.data) {
                    _.data[i] = config.data[i];
                }
            }
        };
        _.getValueByName = function(app, name) {
            if (_.data[app]) {
                if (_.data[app][name])
                    return _.data[app][name].getValue();
                else return _.data[app].getValue(name);
            } else return null;
        };
        _.setValueByName = function(app, name, val) {
            if (_.data[app] && _.data[app][name]) {
                return _.data[app][name].setValue(val);
            } else return null;
        };
        _.getTypeByName = function(app, name) {
            if (_.data[app]) {
                if (_.data[app][name])
                    return _.data[app][name].getType();
                else return _.data[app].getType(name);
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
    M.MiddlerConfigConvert = function() {
        var _ = this;
        //私有
        var __ = {}; {
            //继承关系需要以后由Middler管理	
            V.inherit.apply(_, [V.config.ConfigConvert, []]);
            __.scripts = {}, __.spascripts = [];
            __.loadScript = function(key) {
                if (__.scripts[key]) { console.log(key + '代码已经注入'); } else if (__.scripts._skey) { console.log(__.scripts._skey + '已注册但是尚未有代码注入'); } else if (__.spascripts.length > 0) { __.scripts[key] = __.spascripts.pop(); } else __.scripts._skey = key;
            };
            __.clearload = function() { delete __.scripts._skey; };
            __.hasScript = function(key) { return __.scripts[key] };
            __.getScript = function(key, config) {
                var scr = __.scripts[key];
                if (scr && scr.path) {
                    V.each(scr.path.replace(/,/g, ';').split(';'), function(v) {
                        V.include(v);
                    }, function() { delete scr.path; }, true);
                }
                return (scr && scr.func) ? { inherit: scr.inherit, func: scr.func } : null;
            };
            //切记在代码中使用V.registScript的对象在被继承时必须使用middler重新获取类型方可继承
            //todo 找不到的控件使用host方式默认加载尝试，regist应可说明自己使用前置JS和css
            V.registScript = __.registScript = function() {
                var args = arguments.length > 2 ? { path: arguments[0], inherit: arguments[1].replace(/,/g, ';').split(';'), func: arguments[2], regist: true } : arguments.length > 1 ? { path: arguments[0], func: arguments[1], regist: true } : { func: arguments[0], regist: true };
                if (__.scripts._skey) {
                    var key = __.scripts._skey;
                    delete __.scripts._skey;
                    __.scripts[key] = args;
                } else __.spascripts.push(args);
            }
            _.needConfig = true;
            //生成参数管理器
            __.convertParas = function(config, params, defParam, app, pcm) {
                var _ = this;
                var paras = []; {
                    params = V.getValue(params, []);
                    for (var i in params) {
                        var val = params[i];
                        if (typeof(val) == 'object') {
                            if (val === null || val === undefined) {
                                paras[paras.length] = null;
                            } else if (val.ref) {
                                var index = val.ref.indexOf('/') >= 0 ? val.ref.indexOf('/') : val.ref.indexOf('\\') >= 0 ? val.ref.indexOf('\\') : -1;
                                var appName = index >= 0 ? val.ref.substr(0, index) : defParam.app;
                                var name = appName ? val.ref.substr(index + 1) : val.ref;
                                //paras.push(config.getValueByName(appName,name));
                                paras.push({ ref: appName, name: name });
                            } else if (val.type || val.path) {
                                var name = V.random() + '';
                                app[name] = __.convertContainer(config, val, defParam, app, pcm);
                                paras.push({ ref: defParam.app, name: name });
                            } else if (val.self) {
                                paras.push(pcm);
                            } else if (val.middler) {
                                paras.push(new M.Middler(pcm));
                            } else if (val.params && val.param) {
                                var name = V.random() + '';
                                app[name] = __.convertContainer(config, val, defParam, app, pcm);
                                paras.push({ ref: defParam.app, name: name, param: val.param });
                            } else if (V.isArray(val)) {
                                //objects
                                var name = V.random() + '';
                                app[name] = __.convertContainer(config, { params: val }, defParam, app, pcm);
                                paras.push({ ref: defParam.app, name: name });
                            } else {
                                //普通JSON
                                paras.push(val);
                            }
                        } else {
                            paras.push(val);
                        }
                    }
                }
                return new function() {
                    var _ = this; {}
                    _.getParas = function() {
                        var ret = [];
                        for (var i in paras) {
                            var val = paras[i];
                            (val !== null && val !== undefined && val.ref) && (val = config.getValueByName(val.ref, val.name));
                            ret.push(val);
                        }
                        return ret;
                    };
                };
            };
            __.createValue = function(type, paras, pcm) {
                var script = __.hasScript(type);
                if (script.regist && !paras.length)
                    paras = [null, null];
                script = __.getScript(type);
                if (script.inherit) script.inherit.map(function(v) {
                    paras[paras.length] = pcm.Middler.getTypeByAppName(V.view.APP || 'VESH.view', v);
                    return null;
                });
                script = script.func;
                return V.create2(script, paras)
            };
            //生成生成器
            __.convertCreater = function(config, v, defParam, app, pcm) {
                var method = V.getValue(v.method, defParam.method);
                var path = V.getValue(v.path, defParam.path);
                var spapath = V.getValue(v.spapath, false);
                var host = V.getValue(v.host, defParam.host);
                var type = ((V.isValid(v.type) && v.type.indexOf('\.') == 0) ? defParam.pack : '') + v.type;
                if (type == 'undefined' && !V.isValid(v.ref)) {
                    if (V.isValid(v.path) || V.isValid(v.spapath)) {
                        type = v.type = '' + V.random();
                    } else if (V.isValid(v.params)) {
                        method = "objects";
                    } else {
                        method = "self";
                    }
                }
                var constructorparalength = V.getValue(v.constructorparalength, defParam.constructorparalength);
                //使用Objects的默认配置对下传递 仅仅传递 path 和 pack
                var para = __.convertParas(config, v.params, V.merge(defParam, { path: path, pack: defParam.pack, host: host }), app, pcm);
                if (spapath) {
                    __.spaloadScript(type);
                    __.clearload();
                }
                return new function() {
                    var _ = this;
                    _.getType = function() {
                        if (path) {
                            __.loadScript(type);
                            V.each(path.split(';'), function(v) {
                                if (defParam.host && v.toLowerCase().indexOf('../') < 0 && v.toLowerCase().indexOf('http://') < 0 && v.toLowerCase().indexOf('https://') < 0) {
                                    v = defParam.host + v;
                                }
                                V.include(v);
                            }, function() {
                                __.clearload();
                            }, true);
                        } else if (spapath) {
                            __.spaloadScript(type);
                        }
                        var paras = para.getParas();
                        return __.hasScript(type) ? __.getScript(type).func : eval('(' + type + ')');
                    };
                    _.getValue = function() {
                        if (path) {
                            //以后可以修改 目前是有缓存的 path改为支持;号隔开的各个路径
                            __.loadScript(type);
                            V.each(path.split(';'), function(v) {
                                if (defParam.host && v.toLowerCase().indexOf('../') < 0 && v.toLowerCase().indexOf('http://') < 0 && v.toLowerCase().indexOf('https://') < 0) {
                                    v = defParam.host + v;
                                }
                                V.include(v);
                            }, function() {
                                __.clearload();
                            }, true);
                        } else if (spapath) {
                            __.spaloadScript(type);
                        }
                        var paras = para.getParas();
                        switch (method) {
                            case "self":
                                return v;
                            case "objects":
                                return paras;
                            default:
                            case 'constructor':
                                return __.hasScript(type) ? __.createValue(type, paras, pcm) : V.create3(type, paras);
                            case 'bean':
                                var val = __.hasScript(type) ? __.createValue(type, [], pcm) : eval('(new ' + type + '())');
                                //bean设置出错
                                if (val && paras) {
                                    for (var i in paras) {
                                        if (typeof(paras[i]) === 'object') {
                                            if (v.params[i].name && val['set' + v.params[i].name]) {
                                                val['set' + v.params[i].name].apply(val, [paras[i]]);
                                            } else if (v.params[i].param && val['set' + v.params[i].param]) {
                                                val['set' + v.params[i].param].apply(val, paras[i]);
                                            } else {
                                                val = V.merge(val, paras[i]);
                                            }
                                        }
                                    }
                                }
                                return val;
                            case 'factory':
                                var script = __.hasScript(type);
                                if (script) {
                                    if (script.regist && !paras.length)
                                        paras = [null, null];
                                    script = __.getScript(type);
                                    if (script.inherit) script.inherit.map(function(v) {
                                        paras[paras.length] = pcm.Middler.getTypeByAppName(V.view || 'VESH.view', v);
                                        return null;
                                    });
                                    script = script.func;
                                }
                                return script ? script.apply(script, paras) : eval('(' + type + '.apply(' + type + ',paras))');
                            case 'factorybean':
                                var script = __.hasScript(type);
                                if (script) {
                                    if (script.regist && !paras.length)
                                        paras = [null, null];
                                    script = __.getScript(type);
                                    if (script.inherit) script.inherit.map(function(v) {
                                        paras[paras.length] = pcm.Middler.getTypeByAppName(V.view || 'VESH.view', v);
                                        return null;
                                    });
                                    script = script.func;
                                }
                                var val = script ? script.apply(script, paras) : eval('(' + type + '.apply(' + type + ',paras))');
                                if (paras && val) {
                                    for (var i in paras) {
                                        if ((!constructorparalength || i >= constructorparalength) && typeof(paras[i]) === 'object') {
                                            if (v.params[i].name && val['set' + v.params[i].name]) {
                                                val['set' + v.params[i].name].apply(val, [paras[i]]);
                                            } else if (v.params[i].param && val['set' + v.params[i].param]) {
                                                val['set' + v.params[i].param].apply(val, paras[i]);
                                            } else {
                                                val = V.merge(val, paras[i]);
                                            }
                                        }
                                    }
                                }
                                return val;
                            case 'constructorbean':
                                var val = __.hasScript(type) ? __.createValue(type, paras, pcm) : V.create3(type, paras);
                                if (paras && val) {

                                    for (var i in paras) {
                                        if ((!constructorparalength || i >= constructorparalength) && typeof(paras[i]) === 'object') {
                                            if (v.params[i].name && val['set' + v.params[i].name]) {
                                                val['set' + v.params[i].name].apply(val, [paras[i]]);
                                            } else if (v.params[i].param && val['set' + v.params[i].param]) {
                                                val['set' + v.params[i].param].apply(val, paras[i]);
                                            } else {
                                                val = V.merge(val, paras[i]);
                                            }
                                        }
                                    }
                                }
                                return val;
                        }
                    };
                }
            };
            //转换成Container对象
            __.convertContainer = function(config, v, defParam, app, pcm) {
                    var mode = V.getValue(v.mode, defParam.mode);
                    var size = V.getValue(v.size, defParam.size);
                    var creater = __.convertCreater(config, v, defParam, app, pcm);
                    var getType = function() { return creater.getType(); };
                    //生成保持器
                    {
                        switch (mode) {
                            default:
                                case 'static':
                                return new function() {
                                var obj = null;
                                var _ = this;
                                _.getType = getType;
                                _.getValue = function() {
                                    if (obj == null) {
                                        obj = creater.getValue();
                                    }
                                    return obj;
                                };
                                _.setValue = function(val) {
                                    if (obj === val) {} else {
                                        //todo 彻底删除变量
                                        val = null;
                                    }
                                };
                            };
                            case 'instance':
                                    return new function() {
                                    var _ = this;
                                    _.getType = getType;
                                    _.getValue = function() {
                                        return creater.getValue();
                                    };
                                    _.setValue = function(v) {
                                        if (v.dispose) {
                                            V.tryC(v.dispose);
                                        }
                                    };
                                };
                            case 'pool':
                                    return new function() {
                                    var _ = this;
                                    _.getType = getType;
                                    V.collection && V.include('/scripts/VJ.collection.min.js');
                                    var pool = new V.collection.Pool(size, function() { return creater.getValue(); });
                                    _.getValue = function() {
                                        return pool.getValue();
                                    };
                                    _.setValue = function(v) {
                                        pool.setValue(v);
                                    };
                                };
                        }
                    }
                }
                //转换成App对象 todo app成为默认关键词 不可重复定义
            __.convertApp = function(config, v, app, pcm) {
                var keys = { method: 'constructor', mode: 'static', path: false, pack: false, constructorparalength: false, size: 50, app: app, host: '' };
                return new function() {
                    var _ = this;
                    var defParam = {};
                    for (var i in keys) {
                        defParam[i] = V.getValue(v[i], keys[i]);
                    }
                    defParam['app'] = app;
                    for (var i in v) {
                        if (keys[i] || keys[i] == false) {
                            //console.log('过滤的'+i);
                        } else {
                            //转换成Container对象
                            _[i] = __.convertContainer(config, v[i], defParam, _, pcm);
                        }
                    }
                    //根据name默认计算并添加对象 对应registScirpt使用
                    _.getValue = function(name) {
                        _[name] = __.convertContainer(config, { path: name.replace(/[\._]/g, '/') + '.js' }, defParam, _, pcm);
                        return _[name].getValue();
                    };
                    _.getType = function(name) {
                        _[name] = __.convertContainer(config, { path: name.replace(/[\._]/g, '/') + '.js' }, defParam, _, pcm);
                        return _[name].getType();
                    };
                };
            };
        }
        _.toConfig = function(val, pcm) {
            var config = new M.MiddlerConfig();
            if (!pcm.Middler) pcm.Middler = new M.Middler(pcm);
            for (var i in val) {
                //处理app
                var app = __.convertApp(config, val[i], i, pcm);
                config.data[i] = app;
            }
            return config;
        };
        _.toStrings = function(val) {
            V.showException('Middler 不支持此操作');
        };
    };
    M.getMiddlerFromJS = function(type, path) {
        return new M.Middler(V.config.getApplicationConfigManagerFromJS(type, path));
    };
    M.getMiddlerFromObj = function(obj) {
        return new M.Middler(V.config.getApplicationConfigManagerFromObj(obj));
    };
    M.getObjectByAppName = function(cm, app, name) {
        if (!V.middlers) {
            V.middlers = {};
        }
        if (!cm.randomid) {
            cm.randomid = V.random();
            V.middlers[cm.randomid] = new M.Middler(cm);
        }
        return V.middlers[cm.randomid].getObjectByAppName(app, name);
    };
    M.getTypeByAppName = function(cm, app, name) {
        if (!V.middlers) {
            V.middlers = {};
        }
        if (!cm.randomid) {
            cm.randomid = V.random();
            V.middlers[cm.randomid] = new M.Middler(cm);
        }
        return V.middlers[cm.randomid].getTypeByAppName(app, name);
    };
})(VJ, jQuery);