(function(V, $) {
    V.config = {};
    var C = V.config;
    C.Configs = {
        ConfigConverts: {
            AppSettings: { type: 'VJ.config.AppSettingsConfigConvert' }
        }
    };
    C.Config = function() {
        var _ = this;
        _.data = {};
        _.getValue = function(key) { return _.data[key]; };
        _.setValue = function(key, value) { _.data[key] = value; };
        _.merge = function(config) {
            _.data = V.merge(_.data, config.data);
        };
    };
    //ConfigConvert的基础类模型说明 基本上只有接口定义 未实现任何功能
    C.ConfigConvert = function() {
        var _ = this;
        _.toConfig = function(val) { return null; };
        _.toStrings = function(config) { return ""; };
        _.needConfig = false;
    };
    C.AppSettingsConfigConvert = function() {
        var _ = this; {
            V.inherit.apply(_, [C.ConfigConvert, []]);
        }
        _.toConfig = function(val) {
            var conf = new C.Config();
            val = V.getValue(val, {});
            for (var i in val) {
                conf.data[i] = val[i];
            }
            return conf;
        };
    };
    C.ConfigManager = function(parent, resource) {
        var _ = this;
        var dic = {};
        var data = {};
        var hasUpdate = false;
        _.getConfig = function(key) {
            if (!V.isValid(data[key])) {
                data[key] = new C.ProxyConfig(_, key);
            }
            return data
        };
        _.getConfigValue = function(config, key) {
            var func = function() {
                if (parent) {
                    return parent.getConfigValue(config, key);
                } else return null;
            };
            //console.log(dic);
            if (!dic[config]) {
                return func.apply(_, []);
            } else {
                var value = dic[config].getValue(key);
                return !value ? func.apply(_, []) : value;
            }
        };
        _.setConfigValue = function(config, key, value) {
            hasUpdate = true;
            var func = function() {
                if (parent) {
                    parent.setConfigValue(config, key, value);
                }
            };
            if (!dic[config]) {
                func.apply(_, []);
            } else {
                dic[config].setValue(key, value);
            }
        };
        _.update = function() {
            if (hasUpdate) {
                _.adapter.update(_, dic, resource);
            }
        }; {
            var that = _;
            if (parent == null) {
                //根解析器默认添加类解析器 ConvertsConfig
                //ConfigConverts是一个Config对象 Config对象中包含第一个基础解析器ConfigConverts，基础解析器解析出来的是一个Config对象。
                dic['ConfigConverts'] = new function() {
                    var _ = this; {
                        V.inherit.apply(_, [C.Config, []]);
                        //创建ConfigConverts解析器
                        _.data['ConfigConverts'] = new function() {
                            var _ = this;
                            //根据val获取对应的ConfigConvert, ConfigConverts：{'AppSettings':{type:'',path:''}}
                            _.toConfig = function(val) {
                                return new function() {
                                    var _ = this;
                                    V.inherit.apply(_, [C.Config, []]);
                                    for (var i in val) {
                                        _.data[i] = (function() {
                                            var conf = val[i];
                                            if (conf.path) {
                                                V.include(conf.path);
                                            }
                                            return V.create3(conf.type, []);
                                        })();
                                    }
                                };
                            };
                            _.toStrings = function(config) { V.showException('基础解析器不支持此功能'); };
                        };
                    }
                };
            }
            _.adapter = C.ConfigAdapter.prototype.getInstance();
            _.adapter.fill(_, dic, resource);
        }
    };
    C.ProxyConfig = function(config, confkey) {
        var _ = this;
        V.inhert(C.Config, []);
        _.getValue = function(key) { return config.getConfigValue(confkey, key); };
        _.setValue = function(key, value) { return config.setConfigValue(confkey, key, value); };
        _.merge = function(config) { V.showException('不支持的功能'); };
    };
    C.ConfigAdapter = function() {
        var _ = this;
        _.fill = function(cm, dic, resource) {
            resource = resource.load();
            if (typeof(resource) == 'string') {
                resource = eval('(' + resource + ')');
            }
            for (var i in resource) {
                var convert = cm.getConfigValue('ConfigConverts', i);
                if (!convert) {
                    V.showException('ConfigConverts 没有找到对应的解析器' + i);
                } else {
                    var val = convert.toConfig(resource[i], convert.needConfig ? cm : null);
                    if (!val) {
                        console.log('ConfigConverts 解析失败' + i + ':');
                        console.log(resource[i]);
                    } else {
                        if (dic[i]) {
                            dic[i].merge(val);
                        } else {
                            dic[i] = val;
                        }
                    }
                }
            }
        };
        _.update = function(cm, dic, resource) {
            var data = {};
            for (var i in dic) {
                var convert = cm.getConfigValue('ConfigConverts', i);
                if (!convert) {
                    V.showException('ConfigConverts 没有找到对应的解析器' + i);
                } else {
                    var val = convert.toString(dic[i]);
                    if (!val) {
                        console.log('ConfigConverts 解析失败' + i + ':');
                        console.log(dic[i]);
                    } else {
                        data[i] = val;
                    }
                }
            }
            resource.save((function() {
                var ret = '{';
                for (var i in data) {
                    ret = ret + i + ':' + data[i] + ',';
                }
                if (ret.substr(ret.length - 1) == ',') {
                    ret = ret.substr(0, ret.length - 1);
                }
                return ret + '}';
            })());
        };
    };
    C.ConfigAdapter.prototype.getInstance = function() {
        if (!C.ConfigAdapter.prototype.instance) {
            C.ConfigAdapter.prototype.instance = new C.ConfigAdapter();
        }
        return C.ConfigAdapter.prototype.instance;
    };
    C.getConfigManagerFromObj = function(cm, obj) {
        if (!obj) return cm;
        return new C.ConfigManager(cm, (function() {
            return new function() {
                var _ = this;
                if (typeof(obj) === 'string') {
                    obj = eval('(' + obj + ')');
                }
                _.load = function() { return obj; };
                _.save = function() { V.showException('getConfigManagerFromObj不支持此方式'); }
            };
        })());
    };
    C.getConfigManagerFromJS = function(cm, name, path) {
        if (!name) return cm;
        if (path) {
            if (typeof(path) == 'string' && path.indexOf(';') >= 0) { path = path.split(';'); }
            if (V.isArray(path)) {
                for (var i in path) {
                    V.include(path[i]);
                }
            } else
                V.include(path);
        }
        return new C.ConfigManager(cm, (function() {
            return new function() {
                var _ = this;
                if (typeof(name) === 'string') {
                    name = eval('(' + name + ')');
                }
                _.load = function() { return name; };
                _.save = function() { V.showException('getConfigManagerFromJS不支持此方式'); }
            };
        })());
    };
    C.getBaseConfigManager = function() {
        if (!C.baseConfig) {
            C.baseConfig = C.getConfigManagerFromObj(null, C.Configs);
        }
        return C.baseConfig;
    };
    C.getApplicationConfigManagerFromJS = function(name, path) {
        return C.getConfigManagerFromJS(C.getBaseConfigManager(), name, path);
    };
    C.getApplicationConfigManagerFromObj = function(obj) {
        return C.getConfigManagerFromObj(C.getBaseConfigManager(), obj);
    };
})(VJ, jQuery);