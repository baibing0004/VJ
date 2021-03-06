(function(V, $) {
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
    var res = t.execute('aaa.GetProductDetail',{ProductID:111},function(result){
    	var res = result.last();
    });
    middler.setObjectByAppName('Ni','templatename',t);
    */
    //分离NiDataConfig完成Ni格式文件处理
    //分离NiDataConfigConvert完成对Ni格式转成Config
    //用于处理 Ni文件定义
    {
        V.config.Configs = V.merge(V.config.Configs, { ConfigConverts: { Ni: { type: 'VJ.ni.NiDataConfigConvert' } } });
        N.NiDataConfig = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [V.config.Config, []]);
                __.getValue = _.getValue;
                _.getValue = function() { var ret = __.getValue.apply(this, arguments); if (ret) { ret.merge = V.getValue(ret.merge, V.merge); } return ret; };
            }
        };
        N.NiDataConfigConvert = function() {
            var _ = this,
                __ = {}; { V.inherit.apply(_, [V.config.ConfigConvert, []]); }
            _.toConfig = function(val) {
                var ret = new N.NiDataConfig();
                if (val) {
                    if (typeof(val) == 'object') {
                        for (var i in val) {
                            if (val[i]) {
                                ret.data[i] = VJ.merge({ params: {} }, val[i]);
                            }
                        }
                    }
                }
                return ret;
            };
            _.toStrings = function(config) { V.showException('VJ.ni.NiDataConfigConvert不支持此功能'); };
        };
    }
    //分离NiTemplate进行连续事务提交和顺序操作
    {
        /**
         * 
         * @param {数据源} res 
         * @param {ni对象configManager对象} cm 
         * @param {转换URL地址的后缀 默认'.tjson?_n=MT'} defExt 
         */
        N.NiTemplate = function(res, cm, defExt, merge) {
            var _ = this,
                __ = this; {
                _.lstCmd = [];
                _.KEY = 'Ni';
                _.result = new N.NiDataResult();
                _.transaction = false;
                _.res = res;
                _.cm = cm;
                _.defExt = defExt || '.tjson?_n=MT';
                _.dbtype = _.defExt.split('?')[0].trim('.');
                _.jsonp = _.dbtype.indexOf('p') >= 0 ? '_bk' : false;
                _.dbtype = _.dbtype.indexOf('tjson') >= 0 ? 'tjson' : 'json';
                _.merge = merge || function() {
                    var ret = VJ.merge.apply(this, arguments);
                    //mysql特有
                    if (!ret.hasMarge && ret.PageIndex) { ret.hasMarge = true, ret.PageIndex = ret.PageIndex * ret.PageSize; }
                    return ret;
                };
            }
        };
        N.NiTemplate.inherit2 = true;
        V.merge(N.NiTemplate.prototype, {
            _addCommand: function(name, params, func) {
                var _ = this;
                var cmd = _.cm.getConfigValue(_.KEY, name);
                if (cmd) {
                    _.lstCmd.push(V.merge(cmd, {
                        name: cmd.command,
                        params: (cmd.merge || _.merge)(cmd.params, V.getValue(params, {})),
                        func: func,
                        key: name,
                        jsonp: cmd.jsonp || _.jsonp,
                        dbtype: cmd.dbtype || _.dbtype
                    }));
                } else {
                    //如果没有覆盖那么采用默认路径转换
                    _.lstCmd.push({
                        name: (name.indexOf('http') < 0 || name.startWith('/')) ? (name.replace(/[\.\/\\]/g, '/') + _.defExt) : (name || ''),
                        params: _.merge(V.getValue(params, {})),
                        func: func,
                        key: name,
                        jsonp: _.jsonp,
                        dbtype: _.dbtype
                    })
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _.res.getDBConnection();
                        if (_cms.length > 1) { conn.transaction = true; }
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        var i = 0;
                        delete _.result.error;
                        V.whileC2(function() { return _cms[i++]; }, function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                error && (_.result.error = error);
                                _.result.add((!data || (V.isArray(data) && data.length == 0)) ? false : data, v.key);
                                V.tryC(function() { _func(_.result); });
                                next();
                            });
                        }, function() {
                            if (conn.transaction && conn.commit) { conn.commit(); }
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            },
            execute: function(name, params, func) {
                var _ = this;
                _._addCommand(name, params, func);
                if (!_.transaction) {
                    _.commit();
                }
                return _.result;
            },
            excute: function() {
                return this.execute.apply(this, arguments);
            },
            commit: function() {
                var _ = this;
                return _._execute();
            }
        }, true);
        N.NiTemplateManager = function(cm, appName) {
            var _ = this,
                __ = this; {
                _.KEY = V.getValue(appName, 'Ni');
                __.middler = new V.middler.Middler(cm);
            }
        };
        N.NiTemplateManager.prototype.execute = function(tempName, name, params, func) {
            var _ = this,
                __ = this;
            var temp = __.middler.getObjectByAppName(_.KEY, tempName);
            if (temp) {
                temp.execute(name, params, function(data) {
                    V.tryC(function() { func(data); });
                    __.middler.setObjectByAppName(_.KEY, tempName, temp);
                });
            } else { throw new Error('没有找到Template:' + tempName); }
        };

        N.NiTemplateManager.prototype.excute = N.NiTemplateManager.prototype.execute;

        //获取json对象 使得不管json还是tjson都按照最终结果进行使用
        //分离NiDataResult完成获取数据工作	
        N.NiDataResult = function() {
            var _ = this,
                __ = this; {
                __.data = {};
                __.kv = {};
                __.datas = [];
            }
        };
        V.merge(N.NiDataResult.prototype, {
            get: function(key) {
                var _ = this,
                    __ = this;
                return __.data[key] ? __.data[key] : __.kv[key] ? __.kv[key][1] : null;
            },
            add: function(data, name) {
                var _ = this,
                    __ = this;
                if (data && !__.kv[name]) {
                    __.data[__.datas.length] = data;
                    __.kv[name] = [__.datas.length, data];
                    __.datas.push(data);
                } else if (__.kv[name]) {
                    var id = __.kv[name][0];
                    __.data[id] = data;
                    __.kv[name] = [__.datas.length, data];
                    __.datas[id] = data;
                }
            },
            single: function() {
                var _ = this,
                    __ = this;
                return (_.hasData()) ? (function() {
                    var data = _.get(__.datas.length - 1);
                    return (data[0] && data[0][0]) ? data[0][0] : {};
                })() : null;
            },
            last: function() {
                var _ = this,
                    __ = this;
                return _.get(__.datas.length - 1);
            },
            each: function(key, func) {
                var _ = this,
                    __ = this;
                var val = _.get(key);
                if (val && V.isArray(val)) {
                    V.each(val, func);
                }
            },
            clear: function() {
                var _ = this,
                    __ = this;
                __.datas = [];
                __.data = {};
                __.kv = {};
            },
            hasData: function(key) {
                var _ = this,
                    __ = this;
                return key ? (function() {
                    var v = _.get(key);
                    if (v) { for (var k in v) return true; }
                    return false;
                })() : (__.datas.length > 0 && (function() {
                    var hasData = false;
                    __.datas.forEach(function(v) {
                        if (!hasData && v) {
                            for (var k in v) hasData = true;
                        }
                    });
                    return hasData;
                })());
            }
        }, true);
    }
    //分离NiDataResource完成static instance pool各种调用方式
    {
        N.NiDataResource = function(factory, params) {
            var _ = this,
                __ = {}; {
                _.fac = factory;
                _.params = V.getValue(params, {});
            }
            _.getDBConnection = function() {
                var conn = _.fac.createDBConnection();
                conn.params = V.merge(conn.params, _.params);
                conn.params.resource = V.getValue(_.params.resource, conn.params.resource);
                if (!conn.isOpen) {
                    conn.open();
                }
                return conn;
            };
            _.backDBConnection = function(conn) { _.fac.backDBConnection(conn); }
            _.getDBCommand = function() { return _.fac.createDBCommand(); }
        };
        N.NiInstanceDataResource = function(factory, params) {
            var _ = this; {
                V.inherit.apply(_, [N.NiDataResource, [factory, params]]);
            }
        };
        N.NiStaticDataResource = function(factory, params) {
            var _ = this,
                __ = {}; {
                __.conn = null;
                V.inherit.apply(_, [N.NiDataResource, [factory, params]]);
                __.getDBConnection = _.getDBConnection;
            }
            _.getDBConnection = function() {
                if (!__.conn) {
                    __.conn = __.getDBConnection();
                }
                return __.conn;
            };
            _.backDBConnection = function(conn) { if (conn != __.conn) { if (conn.isOpen && conn.close) { conn.close(); } } };
        };
        N.NiPoolDataResource = function(factory, params, size) {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataResource, [factory, params]]);
                __.getDBConnection = _.getDBConnection;
                size = V.getValue(size, 50);
                __.pool = new VJ.collection.Pool(size, function() {
                    var conn = __.getDBConnection();
                    conn.dispose = conn.close;
                    return conn;
                });
            }
            _.getDBConnection = function() {
                var val = __.pool.getValue();
                return val;
            };
            _.backDBConnection = function(conn) {
                __.pool.setValue(conn);
            };
        };
    }
    //DataFactory常用基类
    {
        N.NiDataFactory = function() {
            var _ = this,
                __ = {}; {}
            _.createDBConnection = function() { return new NiDataConnection(); };
            _.createDBCommand = function() { return new N.NiDataCommand(); }
            _.backDBConnection = function(conn) {
                if (conn.isOpen) {
                    conn.close();
                }
            };
        };
        N.NiDataConnection = function() {
            var _ = this,
                __ = {}; {
                _.isOpen = false;
                _.params = {};
            }
            _.open = function() { _.isOpen = true; };
            _.close = function() { _.isOpen = false };
            _.invoke = function(cmd, func) { func(false); };
        };
        N.NiDataCommand = function() {
            var _ = this,
                __ = {}; {
                _.connection = null;
                _.command = '';
                _.params = { dbtype: 'json' };
            }
            _.execute = function(result, func) {
                if (!_.connection || !_.connection.isOpen) {
                    V.showException('数据库未连接');
                    if (func) { func(false); }
                    return;
                } else {
                    _.connection.invoke(_, function(data, error) {
                        try {
                            var hasFalse = false;
                            switch (typeof(data)) {
                                case "string":
                                    data = data.replace(/[\r\n]+/g, '');
                                    if (data.startWith('{')) {
                                        _.dbtype = 'json';
                                        data = '[[' + data + ']]'
                                    };
                                    if (data.replace(/^(\[+\]+)/g, '').length === 0) {
                                        hasFalse = true;
                                    } else {
                                        hasFalse = (data.toLowerCase().indexOf('[false') >= 0 ?
                                            (data.toLowerCase().indexOf('[false:') >= 0 ? (function() {
                                                var _data = data.toLowerCase().match(/\[false:[^\]]+\]/g);
                                                if (_data && _data.length > 0) {
                                                    return _data[0].substr(7, _data[0].length - 8);
                                                } else return true;
                                            })() : true) :
                                            false);
                                    }
                                    if (!hasFalse) {
                                        //如何判断tjson
                                        try {
                                            data = eval('(' + data.replace(/[\r\n]+/g, '') + ')');
                                        } catch (e) { console.log(data); }
                                    }
                                    break;
                                case "object":
                                    if (data) {
                                        $(data).each(function(i, v) {
                                            v = v + '';
                                            hasFalse = (hasFalse || v == 'False' || v == 'false');
                                        });
                                    } else hasFalse = true;
                                    break;
                                case 'undefined':
                                default:
                                    V.showException('V.NiDataCommand success方法 name:typeof错误 type:' + data);
                                    hasFalse = true;
                                    break;
                            }
                            if (hasFalse) {
                                data = (hasFalse == true ? false : hasFalse);
                            } else {
                                switch (_.dbtype) {
                                    default:
                                        case 'json':
                                        break;
                                    case 'tjson':
                                            data = V.evalTJson(data);
                                        break;
                                }
                            }
                            if (func) { func(data, data && data[0] && data[0][0] && data[0][0].error || error); }
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    });
                }
            };
            _.excute = _.execute;
        };
    }
    //NiTemplateDecorator NiMultiTemplateDecorator 装饰类 使得TemplateDecorator可以添加缓存，NiMultiTemplateDecorator可以根据Ni文件中定义的template进行操作
    {
        N.NiTemplateDecorator = function(res, cacheres, cm, params, defExt, merge) {
            var _ = this,
                __ = this; {
                N.NiTemplate.apply(_, [res, cm, defExt, merge]);
                _.KEY = 'Ni';
                _.lstCmd2 = {};
                __.params = V.getValue(params, {});
                _.cacheres = cacheres;
            }
        };
        V.inherit2(N.NiTemplateDecorator, N.NiTemplate, {
            setCommand: function(res, params) {
                var _ = this,
                    __ = this;
                params = V.merge(__.params, params);
                //兼容localStorage不可用的状态
                try {
                    if (res.setItem) {
                        res.setItem(params.cacheKey, V.toJsonString({
                            data: params.cacheValue,
                            date: (params.timeout ? new Date().add(params.timeout.interval, params.timeout.number).getTime() : false)
                        }));
                    } else {
                        res[params.cacheKey] = V.toJsonString({
                            data: params.cacheValue,
                            date: (params.timeout ? new Date().add(params.timeout.interval, params.timeout.number).getTime() : false)
                        });
                    }
                } catch (error) {
                    console.log('localStorage/sessionStorage可能不被支持或者跨域:' + e.message);
                }
                return null;
            },
            //可以根据业务逻辑改为根据某个公共字段进行删除
            clearCommand: function(res, params) {
                try {
                    if (res.removeItem) {
                        res.removeItem(params.cacheKey, null);
                    } else if (res[params.cacheKey]) {
                        delete res[params.cacheKey];
                    }
                    return null;
                } catch (error) {
                    console.log('localStorage/sessionStorage可能不被支持或者跨域:' + e.message);
                }
            },
            cacheCommand: function(res, params) {
                try {
                    var val = null;
                    if (res.getItem) {
                        val = V.json(res.getItem(params.cacheKey));
                    } else {
                        if (res[params.cacheKey]) {
                            val = V.json(res[params.cacheKey]);
                        }
                    }
                    if (val) {
                        if (val.date) {
                            if (parseFloat(val.date) < new Date().getTime()) {
                                delete res[params.cacheKey];
                                return null;
                            }
                        }
                        return val.data;
                    } else return null;
                } catch (error) {
                    console.log('localStorage/sessionStorage可能不被支持或者跨域:' + e.message);
                }
            },
            _addCommand: function(name, params, func) {
                var _ = this,
                    __ = this;
                var index = _.lstCmd.length;
                N.NiTemplateDecorator._addCommand.apply(_, [name, params, func]);
                if (_.lstCmd.length != index) {
                    var command = null;
                    var cmd = _.cm.getConfigValue(_.KEY, name + '.Cache');
                    if (!cmd) {
                        cmd = _.cm.getConfigValue(_.KEY, name + '.Clear');
                        if (cmd) {
                            command = cmd.command || _.clearCommand;
                        }
                    } else {
                        command = cmd.command || _.cacheCommand;
                    }
                    if (cmd) {
                        _.lstCmd2[index] = {
                            name: command,
                            key: name,
                            params: cmd.merge(_.lstCmd[_.lstCmd.length - 1].params, { cacheKey: V.hash(name + '.Set.' + V.toJsonString(_.lstCmd[_.lstCmd.length - 1].params)) })
                        }
                    }
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        delete _.result.error;
                        var func = function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    _.result.add(data ? data : false, v.key);
                                    if (_func) {
                                        V.tryC(function() {
                                            _func(_.result);
                                        });
                                    }
                                });
                                if (data && data.length > 0 && !(data.length == 1 && data[0].length == 0)) {
                                    //新增缓存
                                    var _nicmd = cm.getConfigValue(_.KEY, v.key + '.Set');
                                    if (_nicmd) {
                                        var _conn = _.cacheres.getDBConnection();
                                        var _cmd = _.cacheres.getDBCommand();
                                        _cmd.connection = _conn;
                                        _cmd.command = V.getValue(_nicmd.command, _.setCommand);
                                        _cmd.params = _nicmd.merge(_nicmd.params, cmd.params, {
                                            cacheKey: V.hash(v.key + '.Set.' + V.toJsonString(cmd.params)),
                                            cacheValue: data
                                        });
                                        _cmd.execute(_.result, function(data) {
                                            V.tryC(function() { _.cacheres.backDBConnection(_conn); });
                                        });
                                    }
                                }
                                i++;
                                next();
                            });
                        };
                        var i = 0;
                        V.whileC2(function() { return _cms.shift(); }, function(v, next) {
                            var _nicmd = _.lstCmd2[i];
                            //准备处理缓存
                            if (_nicmd) {
                                i++;
                                var _conn = _.cacheres.getDBConnection();
                                var _cmd = _.cacheres.getDBCommand();
                                _cmd.connection = _conn;
                                _cmd.command = _nicmd.name;
                                _cmd.params = V.merge(_nicmd.params, v.params);
                                delete _.result.error;
                                _cmd.execute(_.result, function(data, error) {
                                    V.tryC(function() {
                                        try { _.cacheres.backDBConnection(_conn); } catch (e) {}
                                        error && (_.result.error = error);
                                        if (data) {
                                            _.result.add(data, v.key);
                                            if (v.func) {
                                                V.tryC(function() {
                                                    v.func(_.result);
                                                });
                                            }
                                            next();
                                        } else {
                                            func(v, next);
                                        }
                                    });
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            }
        });
        /**
         * 使用一致的缓存命令和设置命令 继承自NiTemplateDecorator
         * @param {*} res 
         * @param {*} cacheres 
         * @param {*} cm 
         * @param {*} params 
         * @param {*} defExt 
         * @param {*} merge 
         * @param {*} cachecommand 
         * @param {*} setcommand 
         */
        N.NiTemplateCacheDecorator = function(res, cacheres, cm, params, defExt, merge, cachecommand, setcommand) {
            N.NiTemplateDecorator.apply(_, [res, cacheres, cm, defExt, merge]);
            _.cachecommand = cachecommand;
            _.setcommand = setcommand;
        };
        V.inherit2(N.NiTemplateCacheDecorator, N.NiTemplateDecorator, {
            _addCommand: function(name, params, func) {
                var _ = this,
                    __ = this;
                var index = _.lstCmd.length;
                N.NiTemplate._addCommand.apply(_, [name, params, func]);
                if (_.lstCmd.length != index) {
                    var command = null;
                    var cmd = _.cm.getConfigValue(_.KEY, _.cachecommand);
                    if (cmd) {
                        command = cmd.command || _.cacheCommand;
                        _.lstCmd2[index] = {
                            name: command,
                            key: name,
                            params: cmd.merge(_.lstCmd[_.lstCmd.length - 1].params, { cacheKey: V.hash(name + '.Set.' + V.toJsonString(_.lstCmd[_.lstCmd.length - 1].params)) })
                        }
                    }
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        delete _.result.error;
                        var func = function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    _.result.add(data ? data : false, v.key);
                                    if (_func) {
                                        V.tryC(function() {
                                            _func(_.result);
                                        });
                                    }
                                });
                                if (data && data.length > 0 && !(data.length == 1 && data[0].length == 0)) {
                                    //新增缓存
                                    var _nicmd = cm.getConfigValue(_.KEY, _.setcommand);
                                    if (_nicmd) {
                                        var _conn = _.cacheres.getDBConnection();
                                        var _cmd = _.cacheres.getDBCommand();
                                        _cmd.connection = _conn;
                                        _cmd.command = V.getValue(_nicmd.command, _.setCommand);
                                        _cmd.params = _nicmd.merge(_nicmd.params, cmd.params, {
                                            cacheKey: V.hash(v.key + '.Set.' + V.toJsonString(cmd.params)),
                                            cacheValue: data
                                        });
                                        _cmd.execute(_.result, function(data) {
                                            V.tryC(function() { _.cacheres.backDBConnection(_conn); });
                                        });
                                    }
                                }
                                i++;
                                next();
                            });
                        };
                        var i = 0;
                        V.whileC2(function() { return _cms.shift(); }, function(v, next) {
                            var _nicmd = _.lstCmd2[i];
                            //准备处理缓存
                            if (_nicmd) {
                                i++;
                                var _conn = _.cacheres.getDBConnection();
                                var _cmd = _.cacheres.getDBCommand();
                                _cmd.connection = _conn;
                                _cmd.command = _nicmd.name;
                                _cmd.params = V.merge(_nicmd.params, v.params);
                                delete _.result.error;
                                _cmd.execute(_.result, function(data, error) {
                                    V.tryC(function() {
                                        try {
                                            error && (_.result.error = error);
                                            _.cacheres.backDBConnection(_conn);
                                        } catch (e) {}
                                        if (data) {
                                            _.result.add(data, v.key);
                                            if (v.func) {
                                                V.tryC(function() {
                                                    v.func(_.result);
                                                });
                                            }
                                            next();
                                        } else {
                                            func(v, next);
                                        }
                                    });
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            }
        });
        //用于先读取缓存同步请求真实数据的情况
        N.NiLazyTemplateDecorator = function(res, cacheres, cm, params, defExt, merge) {
            var _ = this,
                __ = this; {
                __.lazyExp = V.getValue(params.lazyExp, function(p) { return true; });
                params = V.merge({}, params);
                if (params && params.lazyExp) { delete params.lazyExp; }
                N.NiTemplateDecorator.apply(_, [res, cacheres, cm, params, defExt, merge]);
            }
        };
        V.inherit2(N.NiLazyTemplateDecorator, N.NiTemplateDecorator, {
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _.res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        var i = 0;
                        delete _.result.error;
                        var func = function(v) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    if (!data) {
                                        data = false;
                                    }
                                    _.result.add(data, v.key);
                                    if (_func) {
                                        V.tryC(function() {
                                            _func(_.result);
                                        });
                                    }
                                });
                                if (data && data.length > 0 && !(data.length == 1 && data[0].length == 0) && __.lazyExp(v.params)) {
                                    //新增缓存
                                    var _nicmd = _.cm.getConfigValue(_.KEY, v.key + '.Set');
                                    if (_nicmd) {
                                        var _conn = _.cacheres.getDBConnection();
                                        var _cmd = _.cacheres.getDBCommand();
                                        _cmd.connection = _conn;
                                        _cmd.command = V.getValue(_nicmd.command, _.setCommand);
                                        _cmd.params = _nicmd.merge(_nicmd.params, cmd.params, {
                                            cacheKey: V.hash(v.key + '.Set.' + V.toJsonString(cmd.params)),
                                            cacheValue: data
                                        });
                                        _cmd.execute(_.result, function(data) {
                                            V.tryC(function() { cacheres.backDBConnection(_conn); });
                                        });
                                    }
                                }
                            });
                        };
                        V.whileC2(function() { return _cms.shift(); }, function(v, next) {
                            var _nicmd = _.lstCmd2[i];
                            //准备处理缓存
                            if (_nicmd && __.lazyExp(v.params)) {
                                i++;
                                var _conn = _.cacheres.getDBConnection();
                                var _cmd = _.cacheres.getDBCommand();
                                _cmd.connection = _conn;
                                _cmd.command = _nicmd.name;
                                _cmd.params = V.merge(_nicmd.params, v.params);
                                delete _.result.error;
                                _cmd.execute(_.result, function(data, error) {
                                    V.tryC(function() {
                                        try {
                                            error && (_.result.error = error);
                                            _.cacheres.backDBConnection(_conn);
                                        } catch (e) {}
                                        if (!data) {
                                            data = false;
                                        }
                                        if (data) {
                                            _.result.add(data, v.key);
                                            if (v.func) {
                                                V.tryC(function() {
                                                    v.func(_.result);
                                                });
                                            }
                                        }
                                        func(v, next);
                                    });
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            },

        });
        /**
         * 使用很多Template来完成相关操作，否则就使用默认值进行处理
         * @param {真实数据源} res 
         * @param {ni.js的ConfigManager} cm 
         * @param {config.js的ConfigManager} relcm 
         * @param {config.js的AppName} appName 
         * @param {自动扩展后缀} defExt 
         * @param {参数过滤方法} merge 
         * @param {默认模板 如果不设置 那么使用真实数据源} template 
         */
        N.NiMultiTemplateDecorator = function(res, cm, relcm, appName, defExt, merge, template) {
            var _ = this,
                __ = this; {
                N.NiTemplate.apply(_, [res, cm, defExt, merge]);
                _.KEY = V.getValue(appName, 'Ni');
                __.ni = new N.NiTemplateManager(relcm, _.KEY);
                //__._addCommand = _._addCommand;
                //__._execute = _._execute;
                __.lstCmd2 = {};
                _.template = template || false;
            }
        };
        V.inherit2(N.NiMultiTemplateDecorator, N.NiTemplate, {
            _addCommand: function(name, params, func) {
                var _ = this,
                    __ = this;
                var index = _.lstCmd.length;
                N.NiMultiTemplateDecorator._addCommand.apply(_, [name, params, func]);
                if (_.lstCmd.length != index) {
                    var cmd = _.lstCmd[_.lstCmd.length - 1];
                    cmd.template = cmd.template || _.template;
                    if (cmd.template) {
                        //调用templdate优先 复用其次
                        __.lstCmd2[index] = true;
                    }
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _.res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        delete _.result.error;
                        var func = function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    _.result.add(data ? data : false, v.key);
                                    if (_func) {
                                        _func(_.result);
                                    }
                                });
                                next();
                            });
                        };
                        var i = 0;
                        var _cms2 = __.lstCmd2;
                        __.lstCmd2 = {};
                        V.whileC2(function() { return _cms.shift(); }, function(_v, next) {
                            var v = _v;
                            //准备处理缓存
                            if (_cms2[i]) {
                                i++;
                                __.ni.execute(v.template, v.key, v.params, function(result) {
                                    V.tryC(function() {
                                        _.result.add((result && result.get(v.key)) ? result.get(v.key) : [], v.key);
                                        v.func(_.result);
                                    });
                                    next();
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                            _cms2 = null;
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            }
        })
    }
    //分离NiDBFactory产生NiDBConnection(Invoke) ajax localStorage sessionStorage js jsonp/getScript websocket Sqlite ObjectDB等各种资源
    {
        //ajax jsonp/getScript 构造参数可修改ajax默认参数并新增host(../|http://www.abc.con)与dbtype(json/tjson)两个属性。
        //默认dbtype为json js 建议static
        N.NiAjaxDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                __.AjaxConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ host: '', dbtype: 'json' }, _.params);
                    }
                    _.invoke = function(cmd, func) {
                        V.ajax(V.merge(_.params, {
                            url: ((cmd.command.indexOf('http:') >= 0 || cmd.command.indexOf('https:') >= 0) ? '' : _.params.host) + cmd.command,
                            data: cmd.params,
                            jsonp: cmd.jsonp,
                            success: function(data, status) {
                                try {
                                    if (func) { func(data); }
                                } catch (e) {
                                    V.showException('V._ajaxOption success方法', e);
                                }
                            },
                            error: function(request, status, error) {
                                V.showException('V._ajaxOption error方法 status:' + status, error);
                                func && func(false, request.responseText ? new Error(request.responseText) : error);
                            }
                        }));
                    }
                };
            }
            _.createDBConnection = function() { return new __.AjaxConnection(); };
            _.backDBConnection = function() { console.log('back conn'); };
        };
        //localStorage sessionStorage js ObjectDB
        N.NiObjectDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                __.ObjectConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ resource: {} }, _.params);
                        __.open = _.open;
                        __.close = _.close;
                    }
                    _.open = function() {
                        switch (typeof(_.params.resource)) {
                            case 'string':
                                _.params.resource = eval('(' + _.params.resource + ')');
                                break;
                            case 'object':
                                if (V.isArray(_.params.resource)) {
                                    throw new Error('不能使用数组作为资源');
                                }
                                break;
                            default:
                                throw new Error('N.NiObjectDataFactory 无法找到<' + _.params.resource + '>对象');
                        }
                        __.open();
                    };
                    _.close = function() {
                        if (_.params.resource) {
                            delete _.params.resource;
                        }
                        __.close();
                    };
                    _.invoke = function(cmd, func) {
                        //如何区分Insert还是select
                        //针对 localStorage,sessionStorage,JS对象 function(res,params){res[params.key] = params.value; return 0;}	
                        //function(res,params){return res[params.key];}	
                        //function(res,p){return res.func(p);}
                        try {
                            var data = null;
                            if (typeof(cmd.command) == 'function') {
                                data = cmd.command(_.params.resource, cmd.params);
                            } else {
                                data = eval('(' + cmd.command + ')(_.params.resource,cmd.params)');
                            }
                            if (typeof(data) == 'function') {
                                V.tryC(function() { if (func) { data(func); } });
                            } else {
                                V.tryC(function() { if (func) { func(data); } });
                            }
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    }
                };
            }
            _.createDBConnection = function() { return new __.ObjectConnection(); };
        };
        //webSocket {url:''}  totest
        N.NiSocketDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                var ws = window.WebSocket || window.MozWebSocket;
                if (!ws) {
                    throw new Error(V.userAgent.name + '不支持WebSocket!');
                }
                __.SocketConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ url: '', veshurl: '' }, _.params);
                        __.open = _.open;
                        __.close = _.close;
                        __.conn = null;
                        __.datas = [];
                        __.senddatas = [];
                        __.calls = {};
                        //处理接受
                        __.addData = function(data) {
                            __.datas.push(data);
                            __.callback();
                        };
                        __.callback = function() {
                            if (__.datas.length > 0) {
                                V.whileC(function() { return __.datas.shift(); }, function(val) {
                                    if (typeof(val) == 'string') {
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
                                    return false;
                                });
                            }
                        };
                        __.callfunc = function(index) {
                            var oCall = __.calls[index];
                            if (oCall && oCall.datas.length > 0 && oCall.func) {
                                V.whileC(function() { return oCall.datas.shift(); }, function(val) {
                                    oCall.func(val, oCall.index);
                                    return false;
                                }, function() { //delete __.calls[index]; 
                                });
                            }
                        };
                        //处理发送
                        __.addCalls = function(cmd, func) {
                            var index = cmd.params._id ? cmd.params._id : V.random();
                            if (!__.calls[index]) {
                                __.calls[index] = { datas: [], func: func, index: index };
                            } else if (cmd.params._id) {
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
                        __.callsend = function() {
                            if (_.isOpen) {
                                V.whileC(function() { return __.senddatas.shift() }, function(v) { __.conn.send(v); return false; });
                            }
                        };
                    }

                    _.open = function() {
                        if (!_.isOpen && !__.conn) {
                            __.conn = new ws(_.params.url);
                            __.conn.onopen = function() {
                                _.isError = false;
                                __.open();
                                __.conn.send(V.toJsonString({ cookies: document.cookie }));
                                __.callsend();
                            };
                            __.conn.onclose = function() {
                                __.close();
                                __.conn = null;
                                if (_.params.reopen) V.once(_.open, 1000);
                            };
                            __.conn.onmessage = function(evt) {
                                try {
                                    //console.log(evt.data);
                                    _.isError = false;
                                    if (evt.data) { __.addData(evt.data); }
                                } catch (e) {
                                    V.showException('VJ.ni.NiSocketDataFactory.onmessage', e);
                                }
                            };
                            __.conn.onerror = function(e) {
                                try {
                                    if (!_.isError && (e.currentTarget.readyState == 2 || e.currentTarget.readyState == 3) && _.params.veshurl) {
                                        //连接失败 尝试调用veshurl 开启websocket
                                        V.ajax({
                                            url: _.params.veshurl,
                                            jsonp: _.params.jsonp,
                                            data: {},
                                            success: function(data, status) {
                                                try {
                                                    console.log("--------------------------------------------");
                                                    console.log(data);
                                                    _.open();
                                                    //重新尝试一次连接
                                                } catch (e) {
                                                    V.showException('V._ajaxOption success方法', e);
                                                }
                                            },
                                            error: function(request, status, error) {
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
                    _.close = function() {
                        _.params.reopen = false;
                        __.conn.close();
                    };
                    _.invoke = function(cmd, func) {
                        //如何区分新发起的会话 还是 旧有的会话	res._id res.firstregist
                        try {
                            __.addCalls(cmd, func);
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    }
                };
                __.SocketCommand = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataCommand, []]);
                    }
                    _.execute = function(result, func) {
                        if (!_.connection || _.connection.isError) {
                            V.showException('WebSocket连接失败');
                            if (func) { func(false); }
                            return;
                        } else {
                            _.connection.invoke(_, function(data, _id) {
                                try {
                                    var hasFalse = false;
                                    switch (typeof(data)) {
                                        case "string":
                                            data = data.replace(/[\r\n]+/g, '');
                                            if (data.replace(/^(\[+\]+)/g, '').length === 0) {
                                                hasFalse = true;
                                            } else {
                                                hasFalse = (data.toLowerCase().indexOf('[false') >= 0 ?
                                                    (data.toLowerCase().indexOf('[false:') >= 0 ? (function() {
                                                        var _data = data.toLowerCase().match(/\[false:[^\]]+\]/g);
                                                        if (_data && _data.length > 0) {
                                                            return _data[0].substr(7, _data[0].length - 8);
                                                        } else return true;
                                                    })() : true) :
                                                    false);
                                            }
                                            if (!hasFalse) {
                                                //如何判断tjson
                                                data = eval('(' + data.replace(/[\r\n]+/g, '').replace(/\\"/g, '"') + ')');
                                            }
                                            break;
                                        case "object":
                                            if (data) {
                                                $(data).each(function(i, v) {
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
                                    if (result.firstregist) result.firstregist = false;
                                    if (hasFalse) {
                                        data = false;
                                    } else if (data._regist) {
                                        //声明注册完成
                                        result.firstregist = true;
                                        data = false;
                                    } else {
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
                    _.excute = _.execute;
                };
            }
            _.createDBConnection = function() { return new __.SocketConnection(); };
            _.backDBConnection = function() { console.log('back conn'); };

            _.createDBCommand = function() { return new __.SocketCommand(); }
        };
        //{name:'',version:'1.0',desc:'',size:2*1024*1024}
        N.NiSqliteDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                __.SqliteConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge(_.params, { name: '', version: '1.0', desc: '', size: 2 * 1024 * 1024 });
                        __.open = _.open;
                        __.close = _.close;
                    }
                    _.open = function() {
                        if (!_.isOpen) {
                            if (openDatabase) {
                                __.conn = openDatabase(_.params.name, _.params.version, _.params.desc, _.params.size);
                                __.open();
                            } else {
                                V.showException(V.userAgent.name + '不支持WebDB!');
                            }
                        }
                    };
                    _.close = function() {
                        delete __.conn;
                        __.close();
                    };
                    _.invoke = function(cmd, func) {
                        if (!_.isOpen || !__.conn) {
                            throw new Error('数据库连接已关闭');
                        }
                        V.tryC(function() {
                            var cms = cmd.command.split(';');
                            var params = V.getValue(cmd.params.data, []);
                            if ((cmd.command.split('?').length - 1) != params.length) {
                                V.showException(cmd.command + '参数数目与输入值数目不符!!');
                                if (func) { func(false); }
                            }
                            var w = 0;
                            var ret = [];
                            var cmslength = cms.length - 1;
                            V.whileC(function() { var command = cms.shift(); return '' == command ? null : command; }, function(command) {
                                //需要计算出这次使用的参数
                                var _w = command.split('?').length - 1;
                                var p = params.slice(w, w + _w);
                                w += _w;
                                __.conn.transaction(function(tx) {
                                    tx.executeSql(command, p, function(tran, data) {
                                        var i = -1;
                                        var _data = [];
                                        V.whileC(
                                            function() {
                                                i++;
                                                return i < data.rows.length ? data.rows.item(i) : null;
                                            },
                                            function(v) {
                                                _data.push(V.merge({}, v));
                                            },
                                            function() {
                                                ret.push(_data);
                                                if (ret.length >= cmslength) {
                                                    if (func) { func(ret); }
                                                }
                                            }, true);
                                    }, function(tran, error) {
                                        console.log(error);
                                        V.showException(error);
                                        if (func) { func(false); }
                                    });
                                });
                            }, function() {}, true);
                        });
                    };
                };
            }
            _.createDBConnection = function() { return new __.SqliteConnection(); };
        };
    }
})(VJ, jQuery);