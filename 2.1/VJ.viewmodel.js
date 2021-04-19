(function(V, $) {
    V.viewmodel = { APP: 'VESH.viewmodel', NIAPP: 'Ni' };
    var M = V.viewmodel;
    V.view = { APP: 'VESH.view' };
    var W = V.view;
    V.hasRight = function(name, isAdmin) {
        if (V.getValue(isAdmin, false) && (typeof(User) == 'undefined' || !V.isValid(User))) { return false; }
        if (User) {
            //添加后门
            if (!V.isValid(Pers)) { V.showException("permission.js不存在"); return false; }
            if (V.getValue(isAdmin, false) && Pers) return true;
            var id = V.getValue(Pers[name], '_');
            return ((',' + V.getValue(User.PIDS, '') + ',').indexOf(',' + id + ',') >= 0);
        }
        return false;
    };
    //定义业务逻辑层的两个基本对象页面与控件
    //首先页面实例化M.Page 然后 页面绑定 W.Page 然后W.Page 调用Document.ready 将界面根据middler进行设置，并针对_对象进行初始化设置并进行binding binding完成后直接发布document.ready事件
    //一般的viewmodel层通过type定义其Middler中的控件类型实现与前端的绑定
    //一般的view层生成后通过bind命令绑定viewmodel，并提供fill命令更新viewmodel的相关字段，将自身的render命令注入viewmodel的update命令更新控件，viewmodel定义事件并由view调用，一般会在调用事件时自动调用自身的fill方法更新viewmodel，然后在属性调用时根据返回的参数更新自身。在viewmodel更新状态后，可调用update(更新{})方法完成数据在view层的填充,同时将属性更新viewmodel。


    //分别定义view与viewmodel的Control 控件本身只支持先构建，构建与init合并，最后执行bind操作
    M.Control = function() {
        //data属性的定义 on事件的处理 update方法的主动更新
        var _ = this,
            __ = {}; {
            _.bind = function(view) {
                _.v = view;
                _.config = _.v.config;
                _.middler = _.v.middler;
                _.ni = _.v.ni;
                _.session = _.v.session;
            };
            _.data = _.data || {};
        }
    };
    var WTemplates = {};
    var FuncTmp = function() {
        var _ = this;
        _.__ = { funs: [], node: $('<div style="display:none;"></div>').appendTo(window.document.body) }
    };
    V.merge(FuncTmp.prototype, {
        addCallback: function(fun) {
            var _ = this,
                __ = _.__;
            (__.template) ? fun($(__.template)): fun && __.funs.push(fun);
        },
        callback: function() {
            var __ = this.__;
            V.whileC(function() { return __.funs.shift() }, function(v) { v($(__.template)); });
        },
        init: function(path) {
            var _ = this,
                __ = this.__;
            if (path.indexOf('<') >= 0) {
                __.node.append(path);
                __.template = __.node[0].innerHTML;
                __.node.remove();
            } else {
                if ((path || '').startWith('~') && V.getSettings("include")['last']) {
                    var prefix = V.getSettings("include")['last'].split('/');
                    prefix.pop();
                    path = prefix.join('/') + path.replace(/~/, '');
                }
                __.node.load(path, function() {
                    __.template = __.node[0].innerHTML
                    __.node.remove();
                    _.callback();
                });
            }
        }
    }, true);
    W.getTemplate = function(path, func) {
        if (!V.isValid(path) || V.getType(path) != 'string') {
            throw new Error('控件模板不能为空或者非字符串!');
        }
        if (!WTemplates[path]) {
            WTemplates[path] = new FuncTmp();
            WTemplates[path].init(path);
        }
        WTemplates[path].addCallback(func);
    };
    //动画基类，用于提供默认的方法定义 供真实的动画进行处理 譬如抖动 移动 翻转 等等
    W.Action = function() {
        this.go = function(node, func) { if (func) { func(); } };
    };
    //css专用的属性动画设置 默认可使用animate.min.css 进行动画设置
    W.CssAction = function(css) {
        var __ = {};
        V.inherit.apply(this, [W.Action, []]);
        __.go = this.go;
        __.css = V.getValue(css, '');
        this.go = function(node, func) {
            if (V.isValid(__.css)) {
                node = $(node);
                var _f = func;
                var _c = function() {
                    node.off('animationend').css('-webkit-animation', '').css('-moz-animation', '').css('-o-animation', '');
                    if (_f) {
                        var _s = _f;
                        _f = null;
                        _s();
                    };
                };
                node.off('webkitAnimationEnd').on('webkitAnimationEnd', _c);
                node.off('mozAnimationEnd').on('mozAnimationEnd', _c);
                node.off('MSAnimationEnd').on('MSAnimationEnd', _c);
                node.off('oanimationend').on('oanimationend', _c);
                node.off('animationend').on('animationend', _c);
                node.css('animation', css).css('-webkit-animation', css).css('-webkit-animation-play-state', 'running').css('-moz-animation', css).css('-moz-animation-play-state', 'running').css('-o-animation', css).css('-o-animation-play-state', 'running');
            }
        };
    };

    W.readyLoad = function(_) {
        //_.readyLoad.wait唯一判断是否出现子控件 当出现子控件时 需要子控件全部完成（有异步加载的需要判断 父控件的wait为false而且本级全部子控件的ready为真，无异步加载的需要父控件判断 本级全部子控件的ready为真）才能启动onload方法调用并确定父控件的ready为真 并开始启动上级判断。 应确保父控件的ready
        if (!_.readyLoad.ready && _.controls && _.controls.length) {
            //此为本级无异步加载的父控件判断
            if (!_.controls.filter(function(v) { return !v.readyLoad.ready }).length) {
                //console.log('readyLoad', _, _.readyLoad.ready ? '' : '', _.readyLoad.wait ? '锁定' : '不锁');
                // _.controls.forEach(function(v) {
                //     console.log('readyLoad2', v, v.readyLoad.ready);
                // });
                _.controls.forEach(function(v) {
                    try {
                        //特别注意 必须首先设置hasLoad为真，否则onLoad会无限循环
                        !v.readyLoad.hasLoad && (v.readyLoad.hasLoad = true, v.readyLoad.onLoad(v.readyLoad.node));
                    } catch (e) {
                        console.log('W.readyLoad Error:', v, e.stack);
                    }
                });
                _.readyLoad.ready = true;
                //console.log('非叶子控件 全部完成!', _, _.parent);
                (_.parent && _.parent.readyLoad && !_.parent.readyLoad.wait) && W.readyLoad(_.parent);
            }
            // else console.log('无异步但是有未完成', _.controls.filter(function(v) {
            //     if (!v.readyLoad.ready)
            //         console.log(v, v.readyLoad.ready);
            //     return !v.readyLoad.ready;
            // }).length);
        } else {
            //console.log('叶子节点判断', _, !_.readyLoad.ready, _.controls, _.controls && _.controls.length);
            //有异步加载的需要判断 父控件的wait为false而且本级全部子控件的ready为真，无异步加载的需要父控件判断 本级全部子控件的ready为真
            //叶子控件
            _.readyLoad.ready = true;
            //(_.parent && _.parent.readyLoad && !_.parent.readyLoad.wait) && console.log('readyLoad parent', _.parent, _.parent ? '有父亲' : '无父亲', _.parent.readyLoad ? "父亲有readyLoad" : '', _.parent.readyLoad.wait ? "父亲被锁定" : '');
            (_.parent && _.parent.readyLoad && !_.parent.readyLoad.wait) && W.readyLoad(_.parent);
        }
    };
    //html与css的加载 其对应的节点的替换 事件的统一触发与处理 update事件的注入 控件均支持先创建 再init 然后bind绑定的过程 再调用onLoad和render事件
    W.Control = function(path, params) {
        var _ = this,
            __ = { drag: {}, drop: {} }; {
            _.path = path;
            _.vm = null;
            _.events = {};
            _.params = V.getValue(params, {});
            __.desc = "";
            _.addDesc = function(d) { __.desc += (d + "\r\n"); };
            _.desc = function() { console.log(__.desc + 'VJ.view.Control\r\n数据定义：\r\npath:html模板定义\r\nvm:虚拟控件对象\r\nevents:事件对象\r\nparams:默认参数对象\r\n'); };
        }
        //处理控件下载完成后的操作
        _.onLoad = function(node) {
            _.render(V.merge({}, _.vm.data));
            _.call('load');
        };
        //在更新_.vm.data
        _.fill = function() {
            return {};
        };
        //可以将数据更新到标签上
        _.render = function(data) {
            V.forC(data, function(key, value) {
                switch (key.toLowerCase()) {
                    case 'dispose':
                        (value) && _.dispose();
                        break;
                    case 'css':
                        V.forC(value, function(k, v) { _.node.css(k, v); });
                        break;
                    case 'attr':
                        V.forC(value, function(k, v) { _.node.attr(k, v); });
                        break;
                    case 'hasright':
                        if (true === value || V.hasRight(value)) {
                            if (__.ebbody) {
                                _.node.show().append(__.ebbody.children());
                                __.ebbody.remove();
                                delete __.ebbody;
                            }
                        } else {
                            __.ebbody = V.newEl('div').append(_.node.children());
                            _.node.hide().empty();
                        };
                        break;
                    case 'enable':
                        if (value) { _.node.removeAttr('disabled'); } else { _.node.attr('disabled', 'disabled'); }
                        break;
                    case 'invisible':
                        if (value) {
                            _.node.children().show();
                        } else {
                            _.node.children().hide();
                        }
                        break;
                    case 'visible':
                        if (value) { _.node.show(); } else { _.node.hide(); }
                        break;
                    case 'addclass':
                        _.node.addClass(value);
                        break;
                    case 'removeclass':
                        _.node.removeClass(value);
                        break;
                    case 'drag':
                        //drag node说明可移动的对象,mode true,false是否许可继续进行 move,copy,none(默认),func可产生移动对象
                        value = typeof(value) === 'string' ? { mode: { helper: value } } : { node: value.node || _.node, mode: value };
                        delete value.mode.node;
                        if (value.mode.mode && !value.mode.helper) value.mode.helper = value.mode.mode;
                        !!value.mode ? _.setDrag(value.node, value.mode) : _.clearDrag(value.node);
                        break;
                    case 'drop':
                        //drop node说明可移动的对象,mode true,false是否许可继续进行 move,copy,none(默认)可产生移动对象
                        value = typeof(value) === 'string' ? { mode: { helper: value } } : { node: value.node || _.node, mode: value };
                        delete value.mode.node;
                        if (value.mode.mode && !value.mode.helper) value.mode.helper = value.mode.mode;
                        !!value.mode ? _.setDrop(value.node || _.node, value.mode) : _.clearDrop(value.node || _.node);
                        break;
                    case 'animate':
                        //仅处理简单类型的动画 譬如一次性调用的动画名或者一个动画名带一个回调函数，可支持多个
                        if (typeof(value) == 'string') {
                            _.animate(value);
                        } else {
                            var ret = [];
                            V.forC(value, function(k2, v2) {
                                ret.push([k2, v2]);
                            }, function() {
                                var i = 0;
                                //异步处理
                                var _f = function() {
                                    var v2 = ret[i];
                                    i++;
                                    _.animate(v2[0], function() {
                                        if (typeof(v2[1]) == 'function')
                                            V.tryC(function() { v2[1](); });
                                        if (i < ret.length) { _f(); }
                                    });
                                };
                                _f();
                            });
                        }
                        break;
                    case 'globalposition':
                        {
                            value += '';
                            _.node.attr('position', value.toLowerCase());
                            _.node.css('position', 'absolute');
                            var parent = $(window);
                            switch (value.toLowerCase()) {
                                case 'top':
                                    parent.scroll(function() {
                                        _.node.css('top', document.body.scrollTop + "px");
                                    });
                                    _.node.css('top', document.body.scrollTop + "px");
                                    break;
                                case 'bottom':
                                    parent.scroll(function() {
                                        _.node.css('top', (document.body.scrollTop + $(window).height() - _.node.height()) + "px");
                                    });
                                    _.node.css('top', (document.body.scrollTop + $(window).height() - _.node.height()) + "px");
                                    break;
                            }
                        }
                        break;
                    case 'position':
                        //此方法不支持重复设置 
                        {
                            value += '';
                            _.node.attr('position', value.toLowerCase());
                            _.node.css('position', 'absolute');
                            var parent = _.node.parent();
                            switch (value.toLowerCase()) {
                                case 'top':
                                    parent.scroll(function() {
                                        _.node.css('top', parent[0].scrollTop + "px");
                                    });
                                    _.node.css('top', parent[0].scrollTop + "px");
                                    break;
                                case 'bottom':
                                    parent.scroll(function() {
                                        _.node.css('top', (parent[0].scrollTop + $(document).height() - _.node.height()) + "px");
                                    });
                                    _.node.css('top', (parent[0].scrollTop + $(document).height() - _.node.height()) + "px");
                                    break;
                            }
                        }
                        break;
                    case 'valid':
                        V.merge(_.get(), _.fill(), true);
                        if (_.valid) { _.valid(data.value || _.get().value, value); } else if (value) value();
                        break;
                    case 'validate':
                        {
                            var inputs = _.node.find('input');
                            _.validate(_, inputs.length ? inputs : _.node);
                        }
                        break;
                    case 'show':
                        _.vm.data.visible = true;
                        _.animate(value, function() {});
                        V.once(function() { _.node.show(); }, 1);
                        break;
                    case 'hide':
                        _.animate(value, function() {
                            _.node.hide();
                            _.vm.data.visible = false;
                        });
                        break;
                    case 'desc':
                        (value) && _.desc();
                        break;
                }
            });
            return data;
        };
        _.init = function(parent, node, params) {
            _.parent = parent;
            _.config = _.parent.config;
            _.middler = _.parent.middler;
            _.ni = _.parent.ni;
            _.session = _.parent.session;
            _.node = node;
            _.params = V.merge(_.params, { data: V.getValue(params, {}) });
        };
        //初始化viewmodel操作
        _.bind = function(vm) {
            //完成配置合并
            _.vm = V.merge(_.params, vm || { data: {} });
            V.forC(_.vm, function(k, v) {
                vm[k] = v;
                (k.toLowerCase().indexOf('on') == 0) && (
                    _.events[k.toLowerCase().substring(2)] = v
                )
            }, null, true);
            _.vm = vm;
            //用于获取绑定对象的数据
            _.get = function() { return _.vm.data; }
                //完成类型名注入
            _.vm.nodeName = _.nodeName;
            //完成方法注入
            _.vm.update = function() {
                if (arguments.length == 0) {
                    _.vm.data = V.lightMerge(_.vm.data, _.fill());
                } else {
                    var as = Array.prototype.slice.call(arguments);
                    //as = V.getValue(as, [null]);
                    if (as[0]) V[!!as[1] ? 'merge' : 'lightMerge'](_.vm.data, as[0], true);
                    as[0] = as[0] ? as[0] : V.lightMerge({}, _.vm.data);
                    _.render.apply(_, as);
                }
                return _.vm.data;
            };
            _.vm.call = function() { return _.call.apply(_.parent.vms, arguments); };
            _.vm.add = function() { _.addControl.apply(_, arguments); };
            _.vm.remove = function() { _.removeControl.apply(_, arguments); };
            _.vm.desc = _.desc;
            _.vm.get = function(key) { _.vm.data = V.merge(_.vm.data, _.fill()); return key ? _.vm.data[key] : _.vm.data; };
            _.vm.bind(_);
            _.readyLoad = {
                ready: false,
                node: null,
                onLoad: _.onLoad,
                path: _.path,
                wait: false //等待递归调用readyLoad方法时等待父类的replaceNode执行完成
            };
            if (_.path) {
                W.getTemplate(_.path, function(node) {
                    _.replaceNode(node);
                    _.readyLoad.wait = false;
                    _.readyLoad.node = node;
                    _.preonload && _.preonload(node);
                    W.readyLoad(_);
                    //_.onLoad(node);
                });
            } else {
                _.node.show();
                _.readyLoad.wait = false;
                _.readyLoad.node = _.node;
                _.preonload && _.preonload(_.node);
                W.readyLoad(_);
                //_.onLoad(_.node);
            }
        };
        //用于扩展给主要对象绑定事件使用 一般用于bind事件的默认值
        _.bindEvent = function(node, k, v) {
            node = $(node);
            try {
                ($._data(node[0], "events"));
            } catch (e) { console.log('发现有极端情况会报nodeName错误!', k); return; }
            if (typeof(node[k]) == 'function' && (!$._data(node[0], "events") || !$._data(node[0], "events")[k])) {
                switch (k.toLowerCase()) {
                    case 'hover':
                        if ((!$._data(node[0], "events") || (!$._data(node[0], "events")['mouseenter']) && !$._data(node[0], "events")['mouseleave']))
                            node[k](function(e) {
                                if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                                _.call(k, { e: e, hover: true });
                            }, function(e) {
                                if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                                _.call(k, { e: e, hover: false });
                            });
                        break;
                    case 'resize':
                        node[0].onresize = function(e) {
                            if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                            _.call(k, { e: e, width: node.width(), height: node.height() });
                        }
                        break;
                    default:
                        node[k](function(e) {
                            if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                            _.call(k, { e: e });
                        });
                }
            }
        };
        _.initControls = function(vm, node) {
            //此处进行内部控件生成需要判定controls属性
            (vm.controls || node.find('[_]').length > 0) && (function() {
                _.readyLoad.wait = true;
                var cons = vm.controls || {};
                _.controls = [];
                _.vs = {};
                _.vms = cons;
                _.models = _.vms;
                V.each(node.find('[_]').toArray(), function(v1) {
                    var v = $(v1);
                    var id = v.attr('id');
                    var json = eval("({" + v.attr('_') + "})");
                    var type = json.type ? json.type : (id && cons[id] && cons[id].type) ? cons[id].type : null;
                    //对于容器类对象的处理方式
                    var nodeName = type ? type.toLowerCase() : v[0].nodeName.toLowerCase();
                    var obj = _.middler.getObjectByAppName(W.APP, nodeName);
                    if (!obj) V.showException('配置文件中没有找到对象类型定义:' + nodeName);
                    obj.init(_, v, V.isValid(v.attr('_')) ? json : null);
                    obj.page = _.page;
                    _.controls.push(obj);
                    if (!id) {
                        id = nodeName + V.random();
                    }
                    obj.nodeName = nodeName;
                    if (!cons[id]) {
                        cons[id] = { data: {} };
                    }
                    _.vs[id] = obj;
                    V.inherit.apply(cons[id], [M.Control, []]);
                    obj.bind(cons[id]);
                }, function() {
                    //实现通过type属性完成数据初始化的功能
                    V.forC(cons, function(key, v) {
                        if (v.type && !v.v) {
                            var obj = _.middler.getObjectByAppName(W.APP, v.type);
                            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
                            var node2 = V.newEl('div');
                            node.append(node2);
                            obj.init(_, node2, null);
                            obj.page = _.page;
                            _.controls.push(obj);
                            _.vs[key] = obj;
                            V.inherit.apply(v, [M.Control, []]);
                            obj.bind(v);
                        }
                    }, null, true)
                }, true);
            })();
        };
        _.replaceNode = function(node) {
            node = $(node);
            var attrs = _.node[0].attributes;
            if (attrs) {
                var i = attrs.length;
                V.whileC(function() { i--; return i >= 0 ? { key: attrs[i].name, val: attrs[i].value } : null }, function(v) {
                    var n = v.key.toLowerCase() == 'id' ? $(node[0]) : node;
                    if (n.length > 1) {
                        for (var i = 0; i < n.length; i++) {
                            var _n = $(n[i]);
                            if (V.isValid(v.val) && v.val != 'false') {
                                _n.attr(v.key, ((V.isValid(_n.attr(v.key)) && _n.attr(v.key) != v.val) ? _n.attr(v.key) + " " : "") + v.val);
                            }
                        }
                    } else {
                        if (V.isValid(v.val) && v.val != 'false') {
                            n.attr(v.key, ((V.isValid(n.attr(v.key)) && n.attr(v.key) != v.val) ? n.attr(v.key) + " " : "") + v.val);
                        }
                    }
                }, null, true);
            }
            _.initControls(_.vm, node);
            node.append(_.node.children());
            if (_.node[0].nodeName.toLowerCase() == 'body') {
                _.node.empty().append(node);
            } else {
                _.node.after(node).remove();
            }
            _.node = node;
        };
        _.call = function(name, param, tparam) {
            name = name.toLowerCase();
            var val = null;
            //所有的事件调用全部采用异步调用方式 V.once
            V.lightMerge(_.vm.data, _.fill(), param || {}, true);
            param = V.merge(_.vm.data, tparam || {});
            (_.events[name]) && V.tryC(function() {
                val = _.events[name].apply(_.parent.vms, [param, _.vm]);
                if (val && V.toJsonString(val).length > 2) {
                    V.merge(_.vm.data, val, true)
                    _.render(val);
                }
            });
            return val;
        };
        _.dispose = function(e) {
            V.tryC(function() {
                _.call('dispose', { e: e });
                _.clearControl();
            });
            _.node.remove();
        };
        //这里提供子类用于覆盖同名函数，修改动画对象。
        _.animate = function(name, func) {
            _._animate(name, null, func);
        };
        //动画方法 用于将middler获取到的动画对象进行动画设置并返回设置函数 而动画对象本身应该仅仅具有业务意义 譬如active hide append等等
        _._animate = function(name, node, func) {
            name = name || '';
            var action = _.middler.getObjectByAppName(W.APP, name);
            if (action) {
                action.go(node ? node : _.node, func || null);
            }
        };
        //用于绑定验证控件
        _.validate = function(input) {
            if (_.middler) {
                var obj = _.middler.getObjectByAppName(W.APP, 'ValidateManager');
                if (obj) { obj.validate(_, input); }
            }
        };
        //用于说明错误提示
        _.onError = function(text) {
            _.get().isError = true;
            _.call('error', { error: text });
        };
        //用于清理错误提示
        _.onClearError = function() { _.call('clearerror'); };
        //用于说明正确信息
        _.onSuccess = function() {
            delete _.get().isError;
            _.call('success')
        };
        //控件处理
        _.addControl = function(node, v) {
            if (!_.controls) {
                _.controls = [];
                _.vs = {};
                _.vms = {};
                _.models = _.vms;
            }
            var obj = _.middler.getObjectByAppName(W.APP, v.type);
            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
            node = node ? node : V.newEl('div').appendTo(_.node);
            obj.init(_, node, v.data);
            obj.page = _.page;
            _.controls.push(obj);
            var key = V.getValue(v.id, V.random());
            if (_.vs[key]) { V.showException('控件id为' + key + '的子控件已经存在，请更换id名'); return; }
            node.attr('id', key);
            _.vs[key] = obj;
            V.inherit.apply(v, [M.Control, []]);
            _.vms[key] = v;
            _.readyLoad.ready = false;
            obj.bind(v);
            return v;
        };
        _.removeControl = function(id) {
            delete _.vms[id];
            if (_.vs[id]) {
                var val = _.vs[id];
                delete _.vs[id];
                _.controls = $.grep(_.controls, function(v, i) { return v != val; });
                if (val) val.dispose();
                V.tryC(function() { val.node.remove(); });
            }
        };
        _.clearControl = function() {
            if (_.controls) {
                var vs = _.vs;
                _.controls = [];
                _.vms = {};
                _.models = _.vms;
                _.vs = {};
                var div = $('<div style="display:none;"></div>').appendTo(window.document.body);
                _.node.children().appendTo(div);
                _.node.empty();
                V.forC(vs, function(k, v) { v.dispose(); }, function() { div.remove(); }, true);
            } else {
                _.controls = [];
                _.vms = {};
                _.models = _.vms;
                _.vs = {};
            }
        };
        V.applyCommandAndEvent(this);
        _.getPosition = function(node, isLast) {
            var docs = node;
            var pos = { x: 0, y: 0 };
            while (docs) {
                var off = [];
                if (docs.style && docs.style.transform && docs.style.transform.indexOf('translate3d') >= 0) {
                    docs.style.transform.replace(/[+-]\d+(px)/g, function(v) {
                        //一般第一个是 x 第二个是y
                        off.push(parseInt(v));
                    });
                }
                pos.x += (off[0] ? off[0] : 0) + docs.offsetLeft; //不断叠加与祖先级的距离
                pos.y += (off[1] ? off[1] : 0) + docs.offsetTop;
                docs = docs.offsetParent;
                if (isLast && docs && (docs == isLast || (typeof(isLast) == 'boolean' && !!docs.getAttribute('_dragid')))) docs = null;
            }
            return pos;
        };
        _.setDrag = function(node, option) {
            node = $(node);
            var point = { x: 0, y: 0 };
            if (!node.draggable) console.log('setDrag不生效，请先引入jquery.ui.js');
            var id = node.attr('_dragid') || V.random();
            if (option.helper && typeof(option.helper) == "string")
                switch (option.helper.toLowerCase()) {
                    case 'move':
                        delete option.helper;
                        break;
                    case 'copy':
                        option.helper = 'clone';
                        break;
                    case 'none':
                        option.helper = function(e) {
                            point = { x: e.offsetX, y: e.offsetY };
                            return V.newEl('div', '', '').css({
                                width: 10,
                                height: 10,
                                left: 0,
                                top: 0,
                                background: 'transaction'
                            }).appendTo(node);
                        }
                        break;
                }
            if (W.Control.drag[id]) {
                node.draggable('option', option);
            } else {
                W.Control.drag[id] = { node: node, vm: _.vm };
                node.attr('_dragid', id);
                //https://www.runoob.com/jqueryui/api-draggable.html
                option = V.merge({
                    start: function(e, ui) {
                        var pos = { left: ui.position.left + point.x, top: ui.position.top + point.y },
                            off = { left: ui.offset.left + point.x, top: ui.offset.top + point.y };
                        var val = _.call('dragstart', { e: e, target: ui.helper, position: pos, offset: off, dragData: { oriposition: pos, orioffset: off } });
                        W.Control.dragSession = {
                            id: id,
                            vm: _.vm,
                            data: V.merge(_.vm.data.drag || _.vm.data.innerdrag || {}, val || {}, { dragid: id, oriposition: pos, orioffset: off })
                        };
                    },
                    drag: function(e, ui) {
                        var pos = { left: ui.position.left + point.x, top: ui.position.top + point.y },
                            off = { left: ui.offset.left + point.x, top: ui.offset.top + point.y };
                        var val = _.call('drag', { e: e, target: ui.helper, position: pos, offset: off, dragData: W.Control.dragSession.data });
                        val && V.merge(W.Control.dragSession.data, val, true);
                    },
                    stop: function(e, ui) {
                        var pos = { left: ui.position.left + point.x, top: ui.position.top + point.y },
                            off = { left: ui.offset.left + point.x, top: ui.offset.top + point.y };
                        var val = _.call('dragend', { e: e, target: ui.helper, position: pos, offset: off, dragData: W.Control.dragSession.data });
                        val && V.merge(W.Control.dragSession.data, val, true);
                    },
                    //配置文件 https://www.runoob.com/jqueryui/api-draggable.html#event-start
                    //同级
                    appendTo: 'parent',
                    delay: 300,
                    distance: 10,
                    //限制 containment
                    //helper:'clone',
                    iframeFix: true,
                    //revert: 'invalid',
                    //revertDuration: 100,
                    scroll: true,
                    scrollSensitivity: 100,
                    snap: true,
                    snapMode: 'both',
                    //会要求如下对象遮挡在拖动框前面
                    //stack:
                    //拖动对象的Index
                    zIndex: 9999
                }, option);
                node.draggable(option);
            }
        };
        _.setDrop = function(node, option) {
            node = $(node);
            if (!node.droppable) console.log('setDrop不生效，请先引入jquery.ui.js');
            var id = node.attr('_dropid') || V.random();
            if (option.helper && typeof(option.helper) == "string") {
                _.vm.data.drop = option.helper.toLowerCase();
                switch (option.helper.toLowerCase()) {
                    case 'move':
                        delete option.helper;
                        break;
                    case 'copy':
                        option.helper = 'clone';
                        break;
                    case 'none':
                        option.helper = function() {
                            return V.newEl('div', '', '').css({
                                width: 10,
                                height: 10,
                                background: "transparent"
                            });
                        }
                        break;
                }
            }


            if (W.Control.drop[id]) {
                node.droppable('option', option);
            } else {
                W.Control.drop[id] = { node: node, vm: _.vm };
                node.attr('_dropid', id);
                //https://www.runoob.com/jqueryui/api-droppable.html
                var func = function(e, ui, key) {
                    var pos = _.getPosition(e.target, true);
                    var dropPosition = {
                        left: ui.offset.left - pos.x,
                        top: ui.offset.top - pos.y
                    };
                    return V.merge(_.call(key, { e: e, target: ui.helper, draggable: ui.draggable, position: ui.position, offset: ui.offset, dragData: W.Control.dragSession.data, dropPosition: dropPosition }) || {}, { dropPosition: dropPosition });
                };
                option = V.merge({
                    over: function(e, ui) {
                        func(e, ui, 'dropover');
                    },
                    out: function(e, ui) {
                        func(e, ui, 'dropout');
                    },
                    drop: function(e, ui) {
                        if (e.target == ui.draggable[0] || e.target == ui.draggable.parent()[0]) return;
                        //这个方法后触发dragend
                        var val = func(e, ui, 'drop') || _.vm.data.drop.mode || _.vm.data.drop;
                        if (e.target == (val.node || ui.draggable)[0] || e.target == (val.node || ui.draggable).parent()[0]) return;
                        switch ((val.mode || val) + '') {
                            case 'clone':
                                $(e.target).append((val.node || ui.draggable).clone().css(val.dropPosition));
                                break;
                            case 'move':
                                $(e.target).append((val.node || ui.draggable).css(val.dropPosition));
                                break;
                            case 'none':
                            default:
                                break;
                        }
                    },
                    //然而，通过设置该选项为 true，任何父元素的 droppable 将无法接收该元素
                    greedy: true
                }, option);
                node.droppable(option);
            }
        };
        //实现自定义拖拽
        _.clearDrag = function(node) {
            node = $(node);
            if (!node.draggable) console.log('clearDrag不生效，请先引入jquery.ui.js');
            else {
                node.draggable('destroy');
                delete W.Control.drag[node.attr('_dragid')];
                node.removeAttr('_dragid');
            }
        };
        _.clearDrop = function(node) {
            node = $(node);
            if (!node.droppable) console.log('clearDrop不生效，请先引入jquery.ui.js');
            else {
                node.droppable('destroy');
                delete W.Control.drop[node.attr('_dropid')];
                node.removeAttr('_dropid');
            }
        };

        _.wheel = function(node, func) {
            var $node = $(node);
            //不兼容FF
            $node.on('mousewheel', function(e) {
                V.cancel(e);
                var data = Math.abs(e.originalEvent.deltaY);
                (Math.floor(data) == data) ?
                func({ name: 'wheel', e: e, deltaX: e.originalEvent.deltaX, deltaY: e.originalEvent.deltaY }):
                    func({ name: 'scale', e: e, scale: e.originalEvent.wheelDelta > 0 ? 1 : -1 });
            });
            $node.on('mousemove', function(e) { $node.select(); })
        }
    };
    W.Control.drag = {};
    W.Control.drop = {};

    {

        //配置JSON数据格式定义的控件
        /**
     * 
     * VJ.registScript(path,function(){
    var __ = {};
    var _ = this;
    VJ.inherit.apply(_,[VJ.view.WControl,	{
		template:'',
		vm:{
			data:{},
			controls:{}
			onLoad:function(D,I){}
		},
		onLoad:{k:function(node){}}, // {}
		fill:function(){ return {} },// {}
		render:{k:function(v,data){}},//{}
	}]);
})
     * @param {*} json 
     */

        W.Control2 = function(json) {
            var __ = V.merge({
                template: '',
                vm: {},
                onLoad: {},
                render: {}
            }, json);
            __.event = __.event || __.onLoad;
            var _ = this; {
                V.inherit.apply(this, [W.Control, [__.template, __.vm]]);
                __.prerender = _.render;
                //__.preonLoad = _.onLoad;
                _.fill = __.fill || _.fill;
                //todo 定义所有可监听的事件 默认这里未添加BindEvent的默认内容
                _.Events = {};
                //todo 定义所有属性 默认这里属性和方法必须决定是否同步或者异步执行 应该先取代再瘦身
                //todo 父子类无法简单继承 要求 父类的json和子类的json不是覆盖关系
                _.Propertis = {};
                _.desc = function() { return { Event: _.Events, Propertis: _.Propertis }; };
                __.async = {};
                __.sync = {};
                __.finally = {};
                __.merge = {};
                V.forC(__.render || {}, function(k, v) {
                    var k2 = k.toLowerCase();
                    v = typeof(v) === 'function' ? {
                        Desc: '属性没有任何描述',
                        sync: true, //默认为同步处理,
                        finally: false, //finally一定是异步的
                        override: false, //是否覆盖父类方法
                        merge: false, //是否采用深度复制
                        Method: v
                    } : V.merge({
                        Desc: '属性没有任何描述',
                        sync: true, //默认为同步处理,
                        finally: false, //finally一定是异步的
                        override: false, //是否覆盖父类方法
                        merge: false, //是否采用深度复制
                    }, v);
                    //Method为false或者未定义则不可作为可用属性出现
                    v && (function() {
                        v.Method = v.Method || function() {};
                        _.Propertis[k] = { Desc: v.Desc || '属性没有任何描述', all: v.all };
                        var poi = v.finally ? 'finally' : v.sync ? 'sync' : 'async';
                        __[poi][k2] = v;
                        v.merge === true && (__.merge[k2] = true);
                        v.as && (v.as = V.isArray(v.as) ? v.as : [v.as]) && v.as.forEach(function(v2) {
                            __[poi][v2.toLowerCase()] = v;
                            _.Propertis[v2] = v.Desc;
                        });
                    })();
                }, null, true);
            }
            _.call = function(name, param, tparam) {
                name = name.toLowerCase();
                var val = null;
                V.lightMerge(_.vm.data, _.fill(), param || {}, true);
                param = V.merge(_.vm.data, tparam || {});
                (_.events[name]) && V.tryC(function() {
                    val = _.events[name].apply(_.parent.vms, [param, _.vm]);
                    if (val && V.toJsonString(val).length > 2) {
                        V.merge(_.vm.data, val, true)
                        _.render(val);
                    }
                });
                return val;
            };
            _.preonload = function(node) {
                var em = V.merge({}, __.event);
                V.forC(em, function(k, v) {
                    v = typeof(v) === 'function' ? {
                        Desc: '没有任何描述',
                        Method: v
                    } : v;
                    em[k.toLowerCase()] = v;
                    !'init'.eq(k) && (_.Events[k] = v.Desc || '没有任何描述');
                }, function() {
                    //提供load方法作为控件初始化使用
                    em['init'] && em['init'].Method.apply(_, [node]);
                    V.forC(_.events, function(k, v) {
                        k = k.toLowerCase();
                        ((em[k] && em[k].Method) ? em[k].Method : _.bindEvent).apply(_, [node, k, v]);
                    }, function() {
                        //__.preonLoad(node); 不再调用父类的onLoad方法由Control统一控制完成
                        em['finally'] && em['finally'].Method.apply(_, [node]);
                    }, true);
                }, true);
            };
            _.render = function(data) {
                //如何实现在这种情况下对父类方法的覆盖和复用?
                var ret = { async: [], sync: [], finally: [] };
                var rdata = {};
                V.forC(data, function(k, v) {
                    var k2 = k.toLowerCase();
                    var name = !!__.sync[k2] ? 'sync' : (!!__.async[k2] ? 'async' : !!__.finally[k2] ? 'finally' : false);
                    name && ret[name].push({ func: __[name][k2].Method, data: v, name: k2 });
                    !(name && __[name][k2].override) && (rdata[k2] = (v && v.Method) || v);
                    //保证完整赋值
                    !__.merge[k2] && (_.vm.data[k] = v);
                }, function() {
                    rdata = __.prerender(rdata);
                    //保证同异步同时启动 一般会是同步先执行完 然后 执行异步 最后是finally方法
                    ret.sync.forEach(function(v) {
                        try {
                            v.func.apply(_, [v.data, data, v.name]);
                        } catch (e) {
                            console.log(v, _, e.stack);
                        }
                    });
                    V.each(ret.async, function(v) {
                        try {
                            v.func.apply(_, [v.data, data, v.name]);
                        } catch (e) {
                            console.log(v, _, e.stack);
                        }
                    }, function() {
                        V.each(ret.finally, function(v) {
                            try {
                                v.func.apply(_, [v.data, data, v.name]);
                            } catch (e) {
                                console.log(v, _, e.stack);
                            }
                        })
                    });
                }, true);
                return rdata;
            };
        };
        //专门为Control2继承而使用
        var _mergefunc = function(_, ret, json, json2, name) {
                ret[name] = !!json[name] && !!json2[name] ? (function() {
                    var em = json[name];
                    var em2 = json2[name];
                    var data = {};
                    V.forC(em, function(k, v) {
                        data[k] = !!em2[k] ? (function() {
                            var v1 = typeof(v) == 'function' ? { Method: v, override: false } : v,
                                v2 = typeof(em2[k]) == 'function' ? { Method: em2[k], override: false } : em2[k];
                            delete em2[k];
                            var data2 = V.merge(v1, v2);
                            data2.Method = v2.override ? data2.Method : function() {
                                return v1.Method.apply(this, arguments) & v2.Method.apply(this, arguments);
                            };
                            return data2;
                        })() : v;
                    }, function() {
                        data = V.merge(data, em2);
                    }, true);
                    return data;
                })() : (json[name] || ret[name]);
            }
            /**
             * 专门为Control2继承而使用
             * @param {*} json 
             * @param {*} json 
             */
        var _merge = function(json, json2) {
            var _ = this;
            var ret = V.merge(json, json2);
            ret.template = json2.template || json.template;
            _mergefunc(_, ret, json, json2, 'onLoad');
            _mergefunc(_, ret, json, json2, 'fill');
            _mergefunc(_, ret, json, json2, 'render');
            ret.fill && (ret.fill = (ret.fill.Method || ret.fill));
            return ret;
        };
        W.Control2.merge = function() {
            var _ = this;
            var as = (arguments.length > 0 ? Array.prototype.slice.call(arguments) : [{}])
            as.forEach(function(v, i) {
                i > 0 && (as[0] = _merge.apply(_, [as[0], v]));
            });
            return as[0];
        };
    }
    //分别定义view与viewmodel的Page
    M.Page = function(cm, data) {
        var _ = this,
            __ = {};
        _.vms = V.getValue(data, {});
        _.models = _.vms;
        //默认使用配置作为事件定义
        V.inherit.apply(_, [M.Control, []]);
        _.page = _.vms.page || {};
        _.data = _.page.data || {};
        if (cm) {
            switch (V.getType(cm)) {
                case 'object':
                case 'Object':
                    if (cm.getConfigValue) {
                        _.config = cm;
                    } else {
                        _.config = V.config.getApplicationConfigManagerFromObj(cm);
                    }
                    break;
                case 'string':
                    cm = eval('(' + cm + ')');
                    _.config = V.config.getApplicationConfigManagerFromObj(cm);
            }
        } else {
            _.config = V.config.getApplicationConfigManagerFromObj();
        }
        _.middler = new V.middler.Middler(_.config);
        _.ni = new V.ni.NiTemplateManager(_.config, M.NIAPP);
        _.session = _.middler.getObjectByAppName(M.APP, 'SessionDataManager');
        _.getModels = function(id) { return id ? (_.vms[id] ? _.vms[id] : null) : _.vms; };
        _.setModels = function(id, v) { _.vms[id] = v; };
        __.bind = _.bind;
        _.bind = function(view) {
                __.bind(view);
                _.page.v = view;
            }
            //初始化操作
        var _page = _.middler.getObjectByAppName(W.APP, 'page');
        if (!_page) { throw new Error('没有找到page对应的页面view层对象'); }
        //所有页面的操作起点
        _page.ready(function() {
            _page.init(_, $(document.body));
            _page.bind(_);
        });
    };
    W.Page = function(path) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control, [path]]);
            _.vs = {};
            _.controls = [];
            __.render = _.render;
            __.onLoad = _.onLoad;
            __.dispose = _.dispose;
        }
        //用于重载触发方式 ready{init,bind(replace,onload),bindControl{onReady}}
        _.ready = function(func) {
            $(function() {
                func();
                _.bindControl(_.node);
            });
            window.onbeforeunload = function(e) {
                _.events['close'] ? (e.returnValue = _.vm.get().close || '请稍等……', _.call('close', { e: e })) : _.dispose();
            };
        };
        //一般调用M.Page对象都比较特殊
        _.bind = function(page) {
            var vm = page.page;
            _.page = page;
            if (vm) {
                //仅针对page节点
                _.vm = vm;
                //完成配置合并
                _.vm.data = V.merge(_.params, V.getValue(_.vm.data, {}));
                //完成方法注入
                _.vm.update = function() {
                    if (arguments.length == 0) {
                        _.vm.data = V.lightMerge(_.vm.data, _.fill());
                    } else {
                        var as = Array.prototype.slice.call(arguments);
                        as[0] = (as.length > 0 && as[0]) ? (function() {
                            V[!!as[1] ? 'merge' : 'lightMerge'](_.vm.data, as[0], true);
                            return as[0];
                        })() : V.lightMerge({}, _.vm.data);
                        _.render.apply(_, as);
                    }
                    return _.vm.data;
                };
                _.vm.call = function() { return _.call.apply(_.page.getModels(), arguments); };
                _.vm.add = function() { _.addControl.apply(_, arguments); };
                _.vm.remove = function() { _.removeControl.apply(_, arguments); };
                _.vm.desc = _.desc;
                _.vm.get = function(key) { _.vm.data = V.merge(_.vm.data, _.fill()); return key ? _.vm.data[key] : _.vm.data; };
                _.page.registEvent = _.registEvent;
                _.page.callEvent = _.callEvent;
                _.page.hasEvent = _.hasEvent;
                _.page.clearEvent = _.clearEvent;
                _.page.registCommand = _.registCommand;
                _.page.callCommand = _.callCommand;
                _.page.hasCommand = _.hasCommand;
                _.page.clearCommand = _.clearCommand;

                V.forC(vm, function(key, value) {
                    key = key.toLowerCase();
                    if (key.indexOf('on') == 0) {
                        //事件注册
                        _.events[key.substring(2)] = value;
                    }
                }, function() { page.bind(_); }, true);
            } else {
                _.vm = { data: V.merge(_.params, {}) };
            }
            _.vms = _.page.vms;
            _.models = _.vms;
            _.middler = page.middler
            _.ni = page.ni;
            _.session = page.session;
            _.config = page.config;
            _.readyLoad = {
                ready: false,
                node: null,
                onLoad: _.onLoad,
                path: _.path,
                wait: false //等待递归调用readyLoad方法时等待父类的replaceNode执行完成
            };
            if (_.path) {
                W.getTemplate(_.path, function(node) {
                    _.replaceNode(node);
                    _.readyLoad.wait = false;
                    _.readyLoad.node = node;
                    _.preonload && _.preonload(node);
                    W.readyLoad({
                        readyLoad: _.readyLoad,
                        controls: _.controls
                    });
                    //_.onLoad(node);
                });
            } else {
                _.node.show();
                _.readyLoad.wait = false;
                _.readyLoad.node = _.node;
                _.preonload && _.preonload(_.node);
                // W.readyLoad({
                //     readyLoad: _.readyLoad,
                //     controls: _.controls
                // });
                //_.onLoad(_.node);
            }
        };
        _.preonload = function(node) {
            V.forC(_.events, function(k, v) {
                switch (k) {
                    case 'close':
                        break;
                    case 'size':
                        $(window).resize(function() {
                            V.userAgent.refresh();
                            _.call('size', {
                                height: V.userAgent.height,
                                width: V.userAgent.width
                            });
                        });
                        break;
                    case 'wheel':
                        var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";
                        //todo 兼容版本 判断为向下
                        node[0].addEventListener(wheelEvent, function(e) { _.call('wheel', { e: e, isDown: e.wheelDelta < 0 }) }, false);
                        break;
                    default:
                        _.bindEvent(node, k, v);
                        break;
                }
            }, null, true);
        };
        //用于绑定对应的控件
        _.bindControl = function(node) {
            //这里应该由真实的View层调用使用document.ready实现
            V.each(node.find('[_]').toArray(), function(v1) {
                _.readyLoad.wait = true;
                var v = $(v1);
                var id = v.attr('id');
                var json = eval("({" + v.attr('_') + "})");
                var type = json.type ? json.type : (id && _.page.getModels(id) && _.page.getModels(id).type) ? _.page.getModels(id).type : null;
                //对于容器类对象的处理方式
                var nodeName = type ? type.toLowerCase() : v[0].nodeName.toLowerCase();
                var obj = _.middler.getObjectByAppName(W.APP, nodeName);
                if (!obj) V.showException('配置文件中没有找到对象类型定义:' + nodeName);
                obj.init(_, v, V.isValid(v.attr('_')) ? json : null);
                obj.page = _;
                _.controls.push(obj);
                if (!id) {
                    id = nodeName + V.random();
                }
                obj.nodeName = nodeName;
                if (!_.page.getModels(id)) {
                    _.page.setModels(id, { data: {} });
                }
                _.vs[id] = obj;
                V.inherit.apply(_.page.getModels(id), [M.Control, []]);
                obj.bind(_.page.getModels(id));
            }, function() {
                //实现通过type属性完成数据初始化的功能
                V.forC(_.page.getModels(), function(key, v) {
                    if (v.type && !v.v) {
                        _.readyLoad.wait = true;
                        var obj = _.middler.getObjectByAppName(W.APP, v.type);
                        if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
                        var node2 = V.newEl('div');
                        node.append(node2);
                        obj.init(_, node2, null);
                        obj.page = _;
                        _.controls.push(obj);
                        _.vs[key] = obj;
                        V.inherit.apply(v, [M.Control, []]);
                        obj.bind(v);
                    }
                }, function() {
                    _.onReady();
                    _.readyLoad.wait = false;
                    W.readyLoad({
                        readyLoad: _.readyLoad,
                        controls: _.controls
                    });
                    _.call('start');
                }, true);
            });
        };
        _.dispose = function(e) {
            _.session.updateAll();
            _.call('dispose');
            $('body').empty();
        };
        //用于覆盖引起页面布局改变
        _.onReady = function() {};
        _.call = function(name, param, imme) {
            //所有的事件调用全部采用异步调用方式 V.once				
            param = V.lightMerge(_.vm.data, param || {});
            name = name.toLowerCase();
            var val = null;
            (_.events[name]) && V.tryC(function() {
                val = _.events[name].apply(_.parent.getModels(), [imme ? param : _.vm.data, _.vm]);
                imme && V.merge(_.vm.data, param, true);
                if (val && V.toJsonString(val).length > 2) {
                    V.merge(_.vm.data, val, true)
                    _.render(val);
                }
            });
            return val;
        };

        //可以将数据更新
        _.render = function(data) {
            data = __.render(data);
            V.forC(data, function(key, value) {
                switch (key) {
                    case 'title':
                        document.title = value;
                        if (data != _.vm.data) { delete data[key]; }
                        break;
                    case 'close':
                        _.dispose();
                        window.close();
                        break;
                    case 'vibrate':
                    case 'shake':
                        if (navigator.vibrate) { navigator.vibrate(v); } else console.log('浏览器不支持此方法!');
                        break;
                }
            });
            return data;
        };
        //动态添加控件到指定位置 如果不指定那么会添加到最后
        _.addControl = function(node, v) {
            var obj = _.middler.getObjectByAppName(W.APP, v.type);
            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
            node = node ? node : V.newEl('div').appendTo(_.node);
            obj.init(_, node, v.data);
            obj.page = _;
            _.controls.push(obj);
            var key = V.getValue(v.id, V.random());
            if (_.vs[key]) { V.showException('控件id为' + key + '的控件已经存在，请更换id名'); return; }
            _.vs[key] = obj;
            V.inherit.apply(v, [M.Control, []]);
            _.vm.vms[key] = v;
            _.readyLoad.ready = false;
            obj.bind(v);
            return v;
        };
        _.removeControl = function(id) {
            delete _.vm.vms[id];
            if (_.vs[id]) {
                var val = _.vs[id];
                delete _.vs[id];
                _.controls = $.grep(_.controls, function(v, i) { return v != val; });
                if (val) val.dispose();
                //V.tryC(function(){_.vs[id].node.remove();});
            }
        };
        _.clearControl = function() {
            if (_.controls) {
                var vs = _.vs
                var div = $('<div style="display:none;"></div>').appendTo(window.document.body);
                _.node.children().appendTo(div);
                V.forC(vs, function(k, v) { v.dispose(); }, function() { div.remove(); }, true);
            }
            _.controls = [];
            _.vs = {};
            _.vm.vms = {};
            _.models = _.vm.vms;
        };
    };
    //sessionAdapter添加处理业务逻辑 供人重新赋值
    M.SessionDataManager = function(ada) {
        var _ = this,
            __ = {}; {
            __.ada = ada;
            __.data = {};
            if (!__.ada) { throw new Error('SessionDataManager 需要设置SessionDataAdapter'); }
        }
        _.get = function(name) {
            if (!__.data[name]) {
                __.data[name] = {};
                __.data[name] = __.ada.fill(name);
            }
            return __.data[name];
        };
        _.data = _.get;
        //支持 session.update('会话key',[data]);
        _.update = function(name, data) {
            __.data[name] = V.merge(_.data(name), V.getValue(data, {}));
            __.ada.update(__.data[name], name);
        };
        //支持 session.clear('会话key',[data]);
        _.clear = function(name) {
            __.ada.clear(name);
        };
        _.updateAll = function() {
            var ret = [];
            for (var i in __.data) {
                ret.push({ key: i, value: __.data[i] });
            }
            V.whileC(function() { ret.shift(); }, function(v) { _.update(v.key, v.value); }, function() {}, true);
        };
        _.isLogin = function() { return false; };
    };
    M.SessionDataAdapter = function(resource) {
        var _ = this,
            __ = {}; {
            __.resource = resource;
            __.ress = {};
        }
        _.setResource = function(name, res) {
            __.ress[name] = res;
        };
        _.getResource = function(name) {
            return __.ress[name] ? __.ress[name] : __.resource;
        };
        _.fill = function(name) {
            return V.getValue(_.getResource(name).load(name), {});
        };
        _.update = function(data, name) {
            _.getResource(name).save(name, V.getValue(data, {}));
        };
        _.clear = function(name) {
            _.getResource(name).clear(name);
        }
    };
    //专门用于继承使用
    M.SessionDataResource = function() {
        var _ = this,
            __ = {}; {}
        _.load = function(name) { return ''; };
        _.save = function(name, data) {};
        _.clear = function(name) {};
    };
    M.SessionDataResourceDecorator = function() {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [M.SessionDataResource, []]);
            __.res = Array.prototype.slice(arguments, 0);
            console.log(__.res);
        }
        _.load = function(name) {
            var val = undefined;
            __.res.forEach(function(v) { try { val = val ? val : v.load(name); } catch (e) {} });
            return val;
        };
        _.save = function(name, data) {
            V.each(__.res, function(v) { try { v.save(name, data); } catch (e) {} });
        };
        _.clear = function(name) {
            V.each(__.res, function(v) { try { v.clear(name); } catch (e) {} });
        };
    };
    //定义时必须说明cookie.js的位置
    M.CookieDataResource = function(param) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [M.SessionDataResource, []]);
            if (!$.cookie) {
                V.include('ref/jquery.cookie.js');
            }
            if (!$.cookie) {
                V.showException('下载不到jquery.cookie.js')
            }
            __.param = V.getValue(param, {});
        }
        _.load = function(name) {
            var val = $.cookie(name);
            var data = {};
            if (val) {
                var args = decodeURIComponent(val).replace(/\+/g, ' ').split('&'); // parse out name/value pairs separated via &
                if (args.length == 1 && args[0].indexOf("{") == 0) {
                    return eval("(" + args[0] + ")");
                } else {
                    // split out each name=value pair
                    for (var i = 0; i < args.length; i++) {
                        var pair = args[i].split('=');
                        var name = decodeURIComponent(pair[0]);

                        var value = (pair.length == 2) ?
                            decodeURIComponent(pair[1]) :
                            name;
                        data[name] = value;
                    }
                    return data;
                }
            } else return {};
        };
        _.save = function(name, data) {
            //处理json变str
            switch (typeof(data)) {
                case 'string':
                case 'String':
                    $.cookie(name, data, __.param);
                    break;
                default:
                case 'object':
                case 'Object':
                    $.cookie(name, V.encHtml(V.toJsonString(V.getValue(data, {}))), __.param);
                    break;
            }
        };
        _.clear = function(name) {
            $.cookie(name, '', { expires: -1 });
        };
    };
    //处理localStorage与sessionStorage 与 全局对象ObjectDB
    M.StorageDataResource = function(storage, timeout) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [M.SessionDataResource, []]);
            __.storage = V.getValue(storage, window.sessionStorage);
            switch (typeof(__.storage)) {
                case 'string':
                    __.storage = eval('(' + __.storage + ')');
                    break;
                case 'object':
                    if (V.isArray(__.storage)) {
                        throw new Error('不能使用数组作为资源');
                    }
                    break;
                default:
                    throw new Error('M.StorageDataResource 无法找到<' + storage + '>对象');
            }
            //默认缓存8个小时
            __.timeout = V.getValue(timeout, { interval: 'h', number: '8' });
            if (!storage) {
                throw new Error('不可使用此对象缓存，当前浏览器版本不支持!');
            }
            _.load = function(name) {
                var val = null;
                if (__.storage.getItem) {
                    val = V.json(__.storage.getItem(name));
                } else {
                    val = __.storage[name];
                }
                if (val) {
                    if (val.date) {
                        if (parseFloat(val.date) < new Date().getTime()) {
                            delete __.storage[name];
                            return null;
                        }
                        return val.data;
                    }
                }
                return null;
            };
            _.save = function(name, str) {
                str = V.getValue(str, '');
                if (!str) {
                    if (__.storage.removeItem) {
                        __.storage.removeItem(name);
                    } else {
                        delete __.storage[name];
                    }
                    return;
                }
                if (__.storage.setItem) {
                    __.storage.setItem(name, V.toJsonString({
                        data: str,
                        date: (__.timeout ? new Date().add(__.timeout.interval, __.timeout.number).getTime() : false)
                    }));
                } else {
                    __.storage[name] = {
                        data: str,
                        date: (__.timeout ? new Date().add(__.timeout.interval, __.timeout.number).getTime() : false)
                    };
                }
            };
            _.clear = function(name) { _.save(name); };
        }
    };
    //todo 加解密DataResource

    //todo action 对象组
    //ValidateManager对象负责完成view.view控件对于data.validate的属性处理与默认值绑定工作。
    //将data.validate对象按照middler定义转换成真实的判断对象，并由控件主动调用绑定其特有的input对象, 提供render中默认的valid方法只针对value进行验证
    //注入view层对象valid方法 和三种onError,onClearError,onSuccess(因为无法进行联合的验证次数判断)和事件触发 清理异常这种事建议由各个控件自己负责,目前统一处理为下一次验证开始时就调用onClearError方法 其次view.control对象在onLoad中过滤onError事件，在render中提供valide方法支持就是调用被注入的validate(text)方法，调用ValidateManager的validate方法时需要设置node与input对象，由具体的reg决定是否跟随输入测试还是等待调用才测试。
    //针对reg子类允许其异步查询和调用onError事件 一般就是check(func)方法，一般地 允许返回func(true/false)来进行异步判断 false就是报错
    //针对reg子类允许remote验证 提交对应的方法和提示语 或者true false
    //允许 data:{valldate:{IsRequired:'请输入默认的提示语',IsNumber:'',IsFloat:'',Regular:{exp:'',error:''},Remote:{exp:function(){},error:''}}}
    //允许针对form提供统一的判断
    W.ValidateManager = function() {
        var _ = this,
            __ = {}; {}
        _.validate = function(control, input) {
            var middler = control.middler;
            var datas = control.get();
            if (datas.validate) {
                var regs = [];
                V.forC(datas.validate, function(k, v) {
                    var reg = middler.getObjectByAppName(W.APP, k);
                    if (!reg) throw new Error('没找到对应的reg处理对象' + k);
                    if (typeof(v) == 'string') {
                        v = { reg: '', error: v };
                    } else v = V.merge({ reg: '', error: '' }, v);
                    reg.init(control, v.reg, v.error, input);
                    regs.push(reg);
                }, function() {
                    control.valid = function(text, func) {
                        if (control.isError) {
                            control.onClearError();
                        }
                        var success = true;
                        var data = Array.prototype.slice.call(regs, 0);
                        V.whileC2(function() { return data.shift(); }, function(reg, next) {
                            reg.validate(text, function(suc) {
                                success = success && (suc && suc.length > 0);
                                if (success) {
                                    next();
                                } else {
                                    //警报
                                    control.isError = true;
                                    control.onError(reg.error);
                                }
                            });
                        }, function() {
                            if (success) {
                                control.isError = false;
                                control.onSuccess();
                                if (func) { func(text); }
                            }
                        });
                    };
                });
            }
        };
    };
    W.Regex = function(reg, error) {
        var _ = this,
            __ = {}; {
            __.reg = V.getValue(reg, '');
            __.error = V.getValue(error, '');
        }
        _.init = function(control, reg, error, input) {
            _.cont = control;
            _.reg = V.getValue(__.reg, reg);
            _.error = V.getValue(error, __.error);
            if (!V.isValid(_.reg)) throw new Error('Regex默认使用reg属性完成判断reg属性不能为空!');
            else if (typeof(_.reg) == 'string') { _.reg = eval(_.reg); };
        };
        _.validate = function(text, func) {
            func((text || '').match(_.reg));
        };
    };
})(VJ, jQuery);