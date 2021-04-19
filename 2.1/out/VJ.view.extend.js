(function(V, $, W, M) {
    W.Box = function(path, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<div class="c_box"></div>',
                vm: { border: 1 },
                render: {
                    border: function(v) { _.node.css({ border: 'solid ' + v + 'px;' }); },
                    key: function(v) { _.node.css({ 'text-align': 'center', 'line-height': _.node.height() + 'px', 'vertical-align': 'middle', margin: '0 auto', 'minwidth': '40px', 'minheight': '20px' }).html(v); }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
    };
    W.FillControl = function(path, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<div class="c_fillControl"></div>',
                vm: vm,
                event: {
                    init: function(node) {
                        if (__.firstHide) {
                            __.timeshow = window.setTimeout(function() {
                                delete __.firstHide;
                                node.show();
                            }, 500);
                        }
                    },
                    click: function(node) {
                        _.node.on('click', 'input', function(e) {
                            var _this = $(this);
                            _.call('click', { e: e, vid: _this.val(), name: _this.attr('name') });
                            return false;
                        });
                        _.node.on('click', 'a,.click', function(e) {
                            var _this = $(this);
                            if (_this.attr('href') && (_this.attr('href').indexOf('http://') >= 0 || _this.attr('href').indexOf('https://') >= 0)) {
                                return true;
                            } else {
                                _.call('click', { e: e, vid: _this.attr('vid') || _this.attr('href'), name: _this.attr('name') });
                                return false;
                            }
                        });
                    }
                },
                render: {
                    value: function(v) {
                        _.node.html(V.format(__.content, v));
                    },
                    visible: function(v) {
                        if (!v && __.timeshow) {
                            window.clearTimeout(__.timeshow);
                            delete __.timeshow;
                        }
                        v ? _.node.show() : _.node.hide();
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
            __.replaceNode = _.replaceNode
        }
        _.replaceNode = function() {
            //必须覆盖这个方法否则_.node就是替换后的了
            __.content = _.node.html();
            if (!'none'.eq(_.node.css('display'))) {
                _.node.hide();
                __.firstHide = true;
            }
            __.replaceNode.apply(_, arguments);
        };
    };
    W.History = function(path, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<span class="c_history" style="display:none;"></span>',
                onLoad: {
                    change: function(node, k, v) {
                        $(window).bind('hashchange', function(e) {
                            if (_.lastAction != window.location.hash.replace(/#/g, '')) {
                                _.call('change', { lastAction: _.lastAction });
                                _.lastAction = _.get().history.pop();
                            }
                        });
                    }
                },
                fill: function() {
                    return { hash: window.location.hash.replace(/#/g, '') };
                },
                render: {
                    //todo 如何取消父类操作 使用override操作 默认为false
                    visible: {
                        override: true,
                        Method: false
                    },
                    invisible: {
                        override: true,
                        Method: false
                    },
                    add: function(v) {
                        _.get().history = _.get().history || [];
                        (window.location.hash) && (function() {
                            var his = _.get().history;
                            (!(his.length > 0 && his[his.length - 1] == window.location.hash.replace(/#/g, ''))) && his.push(window.location.hash.replace(/#/g, ''));
                        })();
                        v = v.replace(/#/g, '');
                        (_.lastAction != v) && (function() {
                            window.location.hash = v;
                            _.lastAction = v;
                        })();
                    },
                    remove: function(v) {
                        _.get().history.pop();
                    },
                    back: function(v) {
                        (_.get().history && _.get().history.length > 0 && v) &&
                        (window.location.hash = _.get().history.pop());
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
    };
    W.TextBox = function(path, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<span class="c_textBox"><span style="display:none;"></span><input type="text"/></span>',
                vm: vm || {},
                onLoad: {
                    init: function(node) {
                        _.txt = node.find('span:first');
                        _.input = node.find('input:first');
                    },
                    hover: function(node, k, v) {
                        _.node.hover(function() {
                            if (_.node.parents("[disabled]").length > 0) return;
                            _.call('Hover', { hover: true });
                        }, function() {
                            if (_.node.parents("[disabled]").length > 0) return;
                            _.call('Hover', { hover: false });
                        });
                    },
                    blur: function(node, k, v) {
                        _.input && _.input.blur(function() {
                            _.call('blur');
                        });
                    }
                },
                fill: function() {
                    var value = $.trim(_.input.val());
                    value = (value == _.vm.data.title || value == _.vm.data.error) ? "" : value;
                    return { text: value, value: value };
                },
                render: {
                    'enable': function(v, data) {
                        v ? _.input.removeAttr('disabled') : _.input.attr('disabled', 'disabled');
                    },
                    'title': function(v, data) {
                        v && _.input.attr('placeholder', data.placeholder || v).attr('title', v);
                    },
                    'value': {
                        override: true,
                        as: ['text'],
                        Method: function(v, data) {
                            _.input.val(v || '');
                        }
                    },
                    'name': {
                        override: true,
                        Method: function(v, data) {
                            _.input.attr('name', v);
                        }
                    },
                    'key': {
                        override: true,
                        Method: function(v, data) {
                            _.txt.html(v).show();
                        }
                    },
                    'size': {
                        override: true,
                        Method: function(v, data) {
                            _.input.attr('size', v)
                        }
                    },
                    'kind': {
                        override: true,
                        Method: function(v, data) {
                            _.input.attr('type', v)
                        }
                    },
                    'maxlength': {
                        override: true,
                        Method: function(v, data) {
                            _.input.attr('maxlength', v)
                        }
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
        _.animate = function(name, func) {
            _._animate(name, _.input, func);
        };
    };
    W.RadioBox = function(path, vm) {
        var _ = this;
        V.inherit.apply(_, [W.TextBox, [W.Control2.merge({
            template: '<span class="c_radioBox"><span style="display:none;"></span><input type="radio"/></span>',
            vm: vm,
            fill: {
                override: true,
                Method: function() {
                    var ret = { checked: _.input.attr('checked') ? true : false };
                    ret.value = ret.checked;
                    return ret;
                }
            },
            render: {
                value: {
                    override: true,
                    as: ['checked'],
                    Method: function(v) {
                        V.setChecked(_.input, !!v);
                    }
                }
            }
        }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
    };
    W.CheckBox = function(path, vm) {
        var _ = this;
        V.inherit.apply(_, [W.RadioBox, [path || '<span class="c_checkBox"><span style="display:none;"></span><input type="checkbox"/></span>', vm]]);
    };
    W.Select = function(path, vm) {
        var _ = this,
            __ = {
                setValue: function(value) {
                    _.vm.data.preValue = _.input.val();
                    _.input.val(value);
                }
            };
        V.inherit.apply(_, [W.TextBox, [W.Control2.merge({
            template: '<span class="c_select"><span style="display:none;"></span><select></select></span>',
            vm: vm,
            onLoad: {
                init: function(node, k, v) {
                    _.txt = node.find('span:first');
                    _.input = node.find('select:first');
                    (_.events.error && _.get().validate) &&
                    _.validate(_, _.input);
                }
            },
            fill: {
                override: true,
                Method: function() {
                    return { value: _.input.val() };
                }
            },
            render: {
                values: function(v) {
                    v = (V.getType(v) == 'string') ? eval('(' + v + ')') : v;
                    (V.userAgent.ie7 || V.userAgent.ie8) ?
                    V.forC(v, function(k2, v2) {
                            var opn = document.createElement("OPTION");
                            _.input.get(0).appendChild(opn); //先追加
                            if (_.vm.data.value && _.vm.data.value == v2) {
                                opn.selected = true;
                            }
                            opn.innerText = k2;
                            opn.v = v2;
                        }, function() {
                            //神奇的Bug select重新填写需要改样式
                            V.once(function() { _.input.css('display', 'none').css('display', 'block') });
                        }, true):
                        (function() {
                            var sb = V.sb();
                            V.forC(v, function(k2, v2) {
                                sb.appendFormat('<option value="{value}">{key}</option>', { key: k2, value: v2 });
                            }, function() {
                                _.input.empty().html(sb.clear());
                                sb = null;
                                if (_.vm.data.value) { __.setValue(_.vm.data.value); }
                            }, true);
                        })();
                },
                'value': __.setValue,
            }
        }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        _.animate = function(name, func) {
            _._animate(name, _.input, func);
        };
    };
    W.RadioList = function(path, content, vm) {
        var _ = this,
            __ = {
                content: content || '<li><span class="c_RadioList_li"><input name="{name}" type="radio" value="{value}"/><span>{key}</span></span></li>'
            }; {
            _.paths = ':radio';
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<span class="c_RadioList"><span></span><ul></ul></span>',
                vm: vm,
                fill: function() {
                    return { value: _.ul.find(_.paths + ':checked').val() };
                },
                onLoad: {
                    init: function(node) {
                        _.title = node.find('span:first');
                        _.ul = node.find('ul');
                        _.vm.data.name = V.getValue(_.vm.data.name, _.paths.trim(':') + V.random());
                    }
                },
                render: {
                    'key': function(v) {
                        _.title.html(v);
                    },
                    'values': function(v) {
                        var sb = V.sb();
                        V.forC(v, function(k, v2) {
                            sb.appendFormat(__.content, { key: k, value: v2, name: _.vm.data.name });
                        }, function() {
                            _.ul.empty().append(sb.toString());
                            sb.clear();
                            sb = null;
                            if (_.vm.data.value) {
                                _.setValue(_.vm.data.value);
                            }
                        });
                    },
                    'value': function(v) {
                        _.setValue(v);
                    },
                    'name': function(v) {
                        _.node.find(_.paths).attr('name', v);
                    },
                    'enable': function(v) {
                        v ? _.node.find(_.paths).removeAttr('disabled') : _.node.find(_.paths).attr('disabled', 'disabled');
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
        _.setValue = function(v) {
            V.setChecked(_.ul.find(_.paths + ":checked"), false);
            V.setChecked(_.ul.find(_.paths + '[value="' + v + '"]'), true);
        }
        _.animate = function(name, func) {
            _._animate(name, _.ul, func);
        };
    };
    W.CheckList = function(path, content, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.RadioList, [W.Control2.merge({
                template: '<div class="c_CheckList"><span></span><ul></ul></div>',
                vm: vm,
                fill: {
                    override: true,
                    Method: function() {
                        //需要兼容没有数据未创建时的错误
                        return _.ul.children().length > 0 ? {
                            value: (function() {
                                var ret = [];
                                _.ul.find(':checkbox:checked').each(function(i, v) {
                                    ret.push($(v).val());
                                });
                                return ret.join(',');
                            })()
                        } : {};
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {})), V.getValue(content, '<li><span class="c_CheckList_li"><input name="{name}" type="checkbox" value="{value}"/><span>{key}</span></span></li>')]]);
            _.paths = ":checkbox";
        }
        _.setValue = function(value) {
            value = V.getValue(value + '', '');
            V.setChecked(_.ul.find(":checkbox:checked"), false);
            V.each(value.split(','), function(v) {
                V.setChecked(_.ul.find(':checkbox[value="' + v + '"]'), true);
            });
        };
        _.animate = function(name, func) {
            _._animate(name, _.sel, func);
        };
    };
    W.Hidden = function(path, vm) {
        var _ = this; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<input class="c_hidden" type="hidden"/>',
                vm: vm,
                fill: function() {
                    return { val: _.node.val() };
                },
                render: {
                    value: function(v) { _.node.val(v) },
                    name: function(v) { _.node.attr('name', value) }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
    };
    W.PasswordBox = function(path, vm) {
        var _ = this; {
            V.inherit.apply(_, [W.TextBox, [W.Control2.merge({
                template: '<span class="c_passwordBox"><span style="display:none;"></span><input type="password"/></span>',
                vm: vm,
                render: {
                    passchar: { as: ['alt'], Method: function(v, data, key) { _.input.attr(key, v); } }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
    };
    W.Button = function(path, vm) {
        var _ = this; {
            V.inherit.apply(_, [W.TextBox, [W.Control2.merge({
                template: '<span class="c_button"><span style="display:none;"></span><input type="button"/></span>',
                vm: vm,
                fill: {
                    override: true,
                    Method: function() {
                        return {};
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
        }
    };
    W.Submit = function(path, vm) {
        var _ = this; {
            V.inherit.apply(_, [W.Button, [path || '<span class="c_submit"><span style="display:none;"></span><input type="submit"/></span>', vm]]);
        }
    };
    W.Reset = function(path, vm) {
        var _ = this; {
            V.inherit.apply(_, [W.Button, [path || '<span class="c_reset"><span style="display:none;"></span><input type="reset"/></span>', vm]]);
        }
    };
    W.Form = function(path, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                    template: '<form method="get" action="" class="c_form"></form>',
                    vm: { data: { enctype: 'multipart/form-data' } },
                    onLoad: {
                        init: function(node) {
                            _.cons = [];
                            node.find('[_]').each(function(i, v) {
                                _.cons.push($(v).attr('id'));
                            });
                            _.controls = _.controls || [];
                        }
                    },
                    fill: function() {
                        var value = {};
                        _.vm.data.value = {};
                        if (_.cons) {
                            if (_.cons && _.controls && !_.cons.length && !!_.controls.length) {
                                var rets = [];
                                _.controls.forEach(function(v) {
                                    rets.push(v.vm.id);
                                })
                                _.cons = rets;
                            }
                            (_.cons.length) &&
                            _.cons.forEach(function(v) {
                                var vm = (_.vms ? _.vms[v] : null) || _.parent.vms[v] || _.page.vms[v];
                                //处理控件异步初始化 导致执行事件时内部控件未初始化完成。比较特殊 因为其包含其它控件 但是其它控件内部尚未初始化 使用Control2下的preonload和onload分离方式实现 对控件事件初始化和onLoad时间的分离
                                (vm && vm.nodeName != 'fill') && (value[v] = vm.update().value);
                            });
                        }
                        return { value: value };
                    },
                    render: {
                        method: function(v) { _.node.attr('method', v) },
                        action: function(v) { _.node.attr('action', v) },
                        target: function(v) { _.node.attr('target', v) },
                        name: function(v) { _.node.attr('name', v) },
                        enctype: function(v) { _.node.attr('enctype', v) },
                        valid: {
                            override: true,
                            Method: function(value) {
                                value && (function() {
                                    var cons = [];
                                    if (_.cons.length)
                                        cons = Array.prototype.slice.apply(_.cons);
                                    else
                                        _.controls.forEach(function(v) {
                                            cons.push(v.vm.id);
                                        })

                                    V.whileC2(function() { return cons.shift(); }, function(v, next) {
                                        var vm = (_.vms ? _.vms[v] : null) || _.parent.vms[v] || _.page.vms[v];
                                        (vm) && vm.update({ valid: next });
                                    }, function() {
                                        value(_.fill().value);
                                    });
                                })();
                            }
                        },
                        enable: function(v) {
                            if (!_.cons.length)
                                _.controls.forEach(function(v) {
                                    _.cons.push(v.vm.id);
                                })
                            V.each(_.cons, function(v2) {
                                var vm = (_.vms ? _.vms[v2] : null) || _.parent.vms[v2] || _.page.vms[v2];
                                (vm) && vm.update({ enable: v });
                            })
                        },
                        value: function(v) {
                            _.node[0].reset();
                            _.vm.data.value = v || {};
                            if (!_.cons.length)
                                _.controls.forEach(function(v) {
                                    _.cons.push(v.vm.id);
                                })
                            V.each(_.cons, function(v2) {
                                var vm = (_.vms ? _.vms[v2] : null) || _.parent.vms[v2] || _.page.vms[v2];
                                (vm) && (
                                    (vm.nodeName == 'fill') ? vm.update({ value: v || {} }) :
                                    vm.update({ value: v[v2] || false })
                                );
                            });
                        },
                        clear: function() {
                            _.cons = [];
                            _.clearControl();
                        }
                    }
                },
                typeof(path) == 'string' ? { template: path, vm: vm } : (path || {}))]]);
        }
    };
    //识别 上下左右滑动及其动画，同时支持滑入滑出，支持点击或者tap，支持加载动画
    //支持onUp向上滑动/onUpOut向上滑出/onDown向下滑动/onDownOut向下滑出/onLeft向左滑动/onLeftOut向左滑出/onRight向右滑动/onRightOut向右滑出/onDblClick双击/onScale(data(scale),self)双指改变大小/onRotate(data(angle),self)双指旋转 show('animatename')显示动画/hide('animatename')动画隐藏 limit动画事件响应阀值达到阀值后才触发事件，limitBack触发事件后是否立即回复正常
    W.Panel = function(path, vm, limit, limitBack, lock) {
        var _ = this,
            __ = {
                hasRender: false,
                status: {
                    panelid: 'p' + V.random(),
                    transform: {
                        tx: 0,
                        ty: 0,
                        scale: 1,
                        angle: 0,
                        rx: 0,
                        ry: 0,
                        rz: 0
                    },
                    callevent: { value: false },
                    limit: V.getValue(limit, 0),
                    limitBack: V.getValue(limitBack, true),
                    lock: lock ? lock : false,
                    startX: 0,
                    startY: 0,
                    moving: false,
                    panelaction: {}
                }
            }; {
            V.inherit.apply(_, [W.Control2, [W.Control2.merge({
                template: '<div class="c_panel"></div>',
                vm: V.merge(vm || {}, { data: { '_': true } }),
                onLoad: {
                    init: function(node) {
                        node.attr('panelid', __.status.panelid);
                    },
                    finally: function(node) {
                        var ret = [];
                        V.forC(__.status.panelaction, function(k, v) {
                            v && (ret.push(k));
                        }, function() {
                            _.node.attr('panelaction', ret.join(','));
                        }, true);
                    },
                    'up': function(node) {
                        V.merge(__.status.panelaction, {
                            vol: true,
                            down: true
                        }, true);
                    },
                    'down': function() {
                        V.merge(__.status.panelaction, {
                            vol: true,
                            down: true
                        }, true);
                    },
                    'upout': function() {
                        V.merge(__.status.panelaction, {
                            vol: true,
                            upout: true
                        }, true);
                    },
                    'downout': function() {
                        V.merge(__.status.panelaction, {
                            vol: true,
                            downout: true
                        }, true);
                    },
                    'left': function() {
                        V.merge(__.status.panelaction, {
                            hor: true,
                            left: true
                        }, true);
                    },
                    'right': function() {
                        V.merge(__.status.panelaction, {
                            hor: true,
                            right: true
                        }, true);
                    },
                    'leftout': function() {
                        V.merge(__.status.panelaction, {
                            hor: true,
                            leftout: true
                        }, true);
                    },
                    'rightout': function() {
                        V.merge(__.status.panelaction, {
                            hor: true,
                            rightout: true
                        }, true);
                    },
                    'scale': function() {
                        __.status.panelaction.pinch = true;
                    },
                    'rotate': function() {
                        __.status.panelaction.rotate = true;
                    },
                    'dblclick': function() {
                        __.status.panelaction.dblclick = true;
                    }
                },
                render: {
                    width: function(v) {
                        _.node.width(v);
                    },
                    height: function(v) {
                        _.node.height(v);
                    },
                    '_': {
                        finally: true,
                        Method: function(v) {
                            !__.hasRender && (function() {
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
                                if (__.status.panelaction.rotate || __.status.panelaction.pinch) {
                                    __.mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(__.mc.get('pan'));
                                }
                                if (__.status.panelaction.pinch) {
                                    __.mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([__.mc.get('pan'), __.mc.get('rotate')]);
                                }
                                if (__.status.panelaction.dblclick) {
                                    __.mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
                                }
                                //__.mc.add(new Hammer.Tap());swipeleft swiperight swipeup swipedown 
                                __.mc.on(V.format("panleft panright panup pandown {pinorrot} {doubleclick}", {
                                        //hor:(__.status.hor?'panleft panright':''),
                                        //vol:(__.status.vol?'panup pandown':''),
                                        pinorrot: __.status.panelaction.rotate ? 'rotatestart rotatemove rotateend rotate' : (__.status.panelaction.pinch ? 'pinchstart pinchmove pinchend' : ''),
                                        doubleclick: __.status.panelaction.dblclick ? 'doubletap' : ''
                                    }),
                                    function(ev) {
                                        //开始就有一个panelid 判断发生的target是否有panelid 如果有panelid且不是自己则不处理这个事情，否则处理这个事情（解决同向的滚动问题）
                                        //修改为只要其定义的事件集合不包含我们的事件集合就可以处理
                                        //需要过滤掉panelid相等但是不是本身的
                                        var parent = ev.target.hasAttribute('panelid') ? $(ev.target) : $(ev.target).parents('[panelid]:first');
                                        parent = parent.length > 0 ? parent : null;
                                        (parent && parent.attr('panelid') == __.status.panelid) && (function() {
                                            switch (ev.type) {
                                                case 'panright':
                                                case 'panleft':
                                                case 'swiperight':
                                                case 'swipeleft':
                                                    !__.status.panelaction['hor'] && (function() {
                                                        parent = $(parent).parents('[panelid]:first');
                                                        parent = parent.length > 0 ? parent : null;
                                                    })();
                                                    break;
                                                case 'panup':
                                                case 'pandown':
                                                case 'swipeup':
                                                case 'swipedown':
                                                    !__.status.panelaction['vol'] && (function() {
                                                        parent = $(parent).parents('[panelid]:first');
                                                        parent = parent.length > 0 ? parent : null;
                                                    })();
                                                    break;
                                                case 'pinchstart':
                                                case 'pinchmove':
                                                case 'pinchin':
                                                case 'pinchout':
                                                case 'pinchend':
                                                    !__.status.panelaction['pinch'] && (function() {
                                                        parent = $(parent).parents('[panelid]:first');
                                                        parent = parent.length > 0 ? parent : null;
                                                    })();
                                                    break;
                                                case 'rotate':
                                                case 'rotatestart':
                                                case 'rotatemove':
                                                case 'rotateend':
                                                    !__.status.panelaction['rotate'] && (function() {
                                                        parent = $(parent).parents('[panelid]:first');
                                                        parent = parent.length > 0 ? parent : null;
                                                    })();
                                                    break;
                                                case 'doubletap':
                                                    !__.status.panelaction['dblclick'] && (function() {
                                                        parent = $(parent).parents('[panelid]:first');
                                                        parent = parent.length > 0 ? parent : null;
                                                    })();
                                                    break;
                                            }
                                        })();
                                        (parent && parent.attr('panelid') != __.status.panelid && parent.attr('panelaction') != '') && (function() {
                                            var action = parent.attr('panelaction').split(',');
                                            switch (ev.type) {
                                                case 'panright':
                                                case 'panleft':
                                                case 'swiperight':
                                                case 'swipeleft':
                                                    if ($.inArray('hor', action) >= 0) return;
                                                    break;
                                                case 'panup':
                                                case 'pandown':
                                                case 'swipeup':
                                                case 'swipedown':
                                                    if ($.inArray('vol', action) >= 0) return;
                                                    break;
                                                case 'pinchstart':
                                                case 'pinchmove':
                                                case 'pinchin':
                                                case 'pinchout':
                                                case 'pinchend':
                                                    if ($.inArray('pinch', action) >= 0) return;
                                                    break;
                                                case 'rotate':
                                                case 'rotatestart':
                                                case 'rotatemove':
                                                case 'rotateend':
                                                    if ($.inArray('rotate', action) >= 0) return;
                                                    break;
                                                case 'doubletap':
                                                    if ($.inArray('dblclick', action) >= 0) return;
                                                    break;
                                            }
                                        })()
                                        if (!__.finalMove) {
                                            //这里会出现闪烁，除非立即设定现在的位置 按理说finalMove应保护最终动画的完成
                                            _.node.removeClass('animate').find('.animate').removeClass('animate');
                                            switch (ev.type) {
                                                case 'panright':
                                                case 'swiperight':
                                                    if (__.status.hor && !__.rotating && !__.finalMove && Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
                                                        __.status.lastAction = 'right';
                                                        __.finalMove = false || _.onRight(ev, __.status);
                                                    } else if (!__.status.hor && document.body.clientWidth < document.body.scrollWidth) {
                                                        //改为以一个固定的起始点+位移为处理方法 这样可以避免移动加倍的问题。
                                                        if (__.status.startX == 0) __.status.startX = __.document.scrollLeft();
                                                        __.document.scrollLeft(Math.max(__.status.startX - ev.deltaX, 0));
                                                    }
                                                    break;
                                                case 'panleft':
                                                case 'swipeleft':
                                                    if (__.status.hor && !__.rotating && !__.finalMove && Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
                                                        __.status.lastAction = 'left';
                                                        __.finalMove = false || _.onLeft(ev, __.status);
                                                    } else if (!__.status.hor && document.body.clientWidth < document.body.scrollWidth) {
                                                        if (__.status.startX == 0) __.status.startX = __.document.scrollLeft();
                                                        __.document.scrollLeft(Math.min(__.status.startX - ev.deltaX, document.body.scrollWidth - document.body.clientWidth));
                                                    }
                                                    break;
                                                case 'panup':
                                                case 'swipeup':
                                                    if (__.status.vol && !__.rotating && !__.finalMove && Math.abs(ev.deltaX) < Math.abs(ev.deltaY)) {
                                                        __.status.lastAction = 'up';
                                                        __.finalMove = false || _.onUp(ev, __.status);
                                                    } else if (!__.status.vol && window.screen.availHeight < document.body.scrollHeight) {
                                                        if (__.status.startY == 0) __.status.startY = __.document.scrollTop();
                                                        __.document.scrollTop(Math.max(__.status.startY - ev.deltaY, document.body.scrollHeight - document.body.clientHeight));
                                                    }
                                                    break;
                                                case 'pandown':
                                                case 'swipedown':
                                                    if (__.status.vol && !__.rotating && !__.finalMove && Math.abs(ev.deltaX) < Math.abs(ev.deltaY)) {
                                                        __.status.lastAction = 'down';
                                                        __.finalMove = false || _.onDown(ev, __.status);
                                                    } else if (!__.status.vol && window.screen.availHeight < document.body.scrollHeight) {
                                                        if (__.status.startY == 0) __.status.startY = __.document.scrollTop();
                                                        __.document.scrollTop(Math.min(__.status.startY - ev.deltaY, document.body.scrollHeight));
                                                    }
                                                    break;
                                                case 'pinchstart':
                                                    __.rotating = true;
                                                case 'pinchmove':
                                                    __.finalMove = false || _.onScale(ev, __.status);
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
                                                    __.finalMove = false || _.onRotate(ev, __.status);
                                                    if (__.pinch) { __.status.scale = ev.scale };
                                                    break;
                                                case 'rotateend':
                                                    __.rotating = false;
                                                    break;
                                            }
                                            //仅处理还原
                                            if (__.finalMove) {
                                                V.once(function() {
                                                    if (__.status.callevent.value) _.onFinal(__.status);
                                                    _.onBackAnimate(_.node, __.status);
                                                    __.status.callevent.value = false;
                                                    V.once(function() { __.finalMove = false; }, 300);
                                                }, 100);
                                            }
                                        };
                                    });
                                __.mc.on("hammer.input", function(ev) {
                                    (ev.isFinal && !__.finalMove) && (function() {
                                        V.once(function() {
                                            if (__.status.callevent.value) _.onFinal(__.status);
                                            _.onBackAnimate(_.node, __.status);
                                            __.status.callevent.value = false;
                                            V.once(function() { __.finalMove = false; }, 300);
                                        }, 100);
                                    })();
                                });
                                /*
                                __.mc.on("swipe", onSwipe);
                                __.mc.on("tap", onTap);
                                */
                            })();
                        }
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {}))]]);
            _.status = __.status;
        }
        _.am = function(node, data, timeout) {
            if (!__.status.lock && !__.moving) {
                V.once(function() {
                    __.status.transform = V.merge(__.status.transform, data);
                    var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d(0,0,0,{angle}deg)', __.status.transform);
                    node.css('webkitTransform', value).css('mozTransform', value).css('transform', value);
                    __.moving = false;
                }, timeout || (1000 / 60));
                __.moving = true;
            }
        };
        //以方便继承类覆盖并执行动画
        _.onLeft = function(ev, e) {
            //使用速度计算距离不是太合理 Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
            if (Math.abs(ev.deltaX) < Math.max(30, _.node.width() * e.limit)) { _.am(_.node, { tx: (e.left || e.leftout) ? ev.deltaX : Math.max(0, ev.deltaX), ty: 0 }); } else { e.callevent.value = true; return e.limitBack; }
        };
        _.onRight = function(ev, e) {
            if (Math.abs(ev.deltaX) < Math.max(30, _.node.width() * e.limit)) _.am(_.node, { tx: (e.right || e.rightout) ? ev.deltaX : Math.max(0, ev.deltaX), ty: 0 });
            else { e.callevent.value = true; return e.limitBack; }
        };
        _.onUp = function(ev, e) {
            if (Math.abs(ev.deltaY) < Math.max(30, _.node.height() * e.limit)) _.am(_.node, { ty: (e.up || e.upout) ? ev.deltaY : Math.max(0, ev.deltaY), tx: 0 });
            else { e.callevent.value = true; return e.limitBack; }
        };
        _.onDown = function(ev, e) {
            if (Math.abs(ev.deltaY) < Math.max(30, _.node.height() * e.limit)) _.am(_.node, { ty: (e.down || e.downout) ? ev.deltaY : Math.min(0, ev.deltaY), tx: 0 });
            else { e.callevent.value = true; return e.limitBack; }
        };
        _.onScale = function(ev, e) {
            if (Math.abs(ev.scale - 1) < e.limit) _.am(_.node, { scale: ev.scale });
            else { e.callevent.value = true; }
        };
        _.onRotate = function(ev, e) {
            _.am(_.node, { angle: ev.rotation, scale: e.pinch ? ev.scale : 1 });
            e.callevent.value = true;
        };
        //最终执行动画并触发事件缓冲100毫秒发生			
        _.onBackAnimate = function(node, e) {
            V.merge(e.transform, { tx: 0, ty: 0, scale: 1, angle: 0, rx: 0, ry: 0, rz: 0, startX: 0, startY: 0 }, true);
            switch (e.lastAction) {
                case 'left':
                    if (e.leftout) {
                        e.transform.tx = screen.width * -1;
                    }
                    break;
                case 'right':
                    if (e.rightout) {
                        e.transform.tx = screen.width;
                    }
                    break;
                case 'up':
                    if (e.upout) {
                        e.transform.ty = screen.height * -1;
                    }
                    break;
                case 'down':
                    if (e.downout) {
                        e.transform.ty = screen.height;
                    }
                    break;
            }
            var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)', e.transform);
            node.addClass('animate').css('webkitTransform', value).css('mozTransform', value).css('transform', value);
            switch (e.lastAction) {
                case 'left':
                    if (e.leftout) {
                        node.hide();
                    }
                    break;
                case 'right':
                    if (e.rightout) {
                        node.hide();
                    }
                    break;
                case 'up':
                    if (e.upout) {
                        node.hide();
                    }
                    break;
                case 'down':
                    if (e.downout) {
                        node.hide();
                    }
                    break;
            }
        };
        //最后触发的事件
        _.onFinal = function(e) {
            switch (e.lastAction) {
                case 'left':
                    if (e.leftout) {
                        _.call('leftout');
                    } else
                        _.call('left');
                    break;
                case 'right':
                    if (e.rightout) {
                        _.call('rightout');
                    } else
                        _.call('right');
                    break;
                case 'up':
                    if (e.upout) {
                        _.call('upout');
                    } else
                        _.call('up');
                    break;
                case 'down':
                    if (e.downout) {
                        _.call('downout');
                    } else
                        _.call('down');
                    break;
                case 'scale':
                    _.call('scale', { scale: e.scale });
                    break;
                case 'rotate':
                    if (e.pinch) {
                        if (e.scale != 1) { _.call('scale', { scale: e.scale }); }
                    }
                    _.call('rotate', { angle: e.angle });
                    break;
            }
        };
    };
    W.PagePanel = function(middler, path, vm, limit, limitBack) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [middler.getTypeByAppName('VESH.view', 'panel'), [W.Control2.merge({
                template: '<div style="overflow:hidden;"  class="c_pagePanel"><div style="display:none;"></div></div>',
                vm: V.merge(V.getValue(vm, {}), {
                    data: { direction: 'hor', value: 0 },
                    onLeft: function(data, self) { _.change(true); },
                    onRight: function(data, self) { _.change(false); },
                    onUp: function(data, self) { _.change(true); },
                    onDown: function(data, self) { _.change(false); }
                }, true),
                onLoad: {
                    init: function(node) {
                        node.removeClass('animate');
                        _.panel = node.find('div:first');
                        _.children = _.panel.siblings();
                        //if(_.children.length==0) {}
                        _.length = _.children.length;
                        //_.children.width(node.width()).height(node.height()).css('overflow', 'hidden').css('position', 'relative');
                        _.children.css('overflow', 'hidden').css('position', 'relative');
                        _.children.addClass('noactive');
                        _.panel.append(_.children);
                        //根据direction覆盖监听操作 同时修改panelaction
                        var dir = _.get().direction;
                        switch (dir) {
                            case 'vol':
                                _.vol = true;
                                delete _.events.left;
                                delete _.events.right;
                                //取消水平操作动画
                                _.panel.css('height', _.length + '00%').css('width', '100%');
                                _.children.css('height', Math.floor(10000 / _.length) / 100 + '%').css('width', '100%')
                                break;
                            case 'hor':
                            default:
                                //取消垂直操作动画
                                _.hor = true;
                                delete _.events.up;
                                delete _.events.down;
                                _.panel.css('width', _.length + '00%').css('height', '100%'); //.css('display','flex');			
                                _.children.css('width', Math.floor(10000 / _.length) / 100 + '%').css('height', '100%').css('float', 'left');
                                break;
                        }
                    },
                    change: { override: true, Method: function() {} }
                },
                render: {
                    'value': function(v) {
                        _.change(v, true, __.first);
                        __.first = false;
                    },
                    'lock': {
                        as: ['freeze'],
                        Method: function(v) {
                            _.lock = v;
                        }
                    },
                    'height': {
                        override: true,
                        Method: function() {
                            //_.panel.children().height(v);
                        }
                    },
                    'width': {
                        override: true,
                        Method: function() {
                            //_.panel.children().width(v);
                        }
                    },
                    'add': function(v) {
                        var contain = V.newEl('div').prependTo(_.panel);
                        _.addControl(V.newEl('div').appendTo(contain), v);
                        _.vm.update({ values: Array.prototype.slice.apply(_.panel.children()) });
                    },
                    'remove': function(v) {
                        if (_.vms[v]) {
                            var node = _.vms[v].v.node.parents('div.noactive');
                            _.removeControl(v);
                            node && node.remove();
                            _.vm.data.values = Array.prototype.slice.apply(_.panel.children());
                        }
                    },
                    'values': function(v) {
                        var lst = V.newEl('div', '', '').css('display', 'none;');
                        V.each(v, function(v2) {
                            lst.append(v2);
                        }, function() {
                            _.children = lst.children();
                            _.length = _.children.length;
                            _.children.css('overflow', 'hidden').css('position', 'relative');
                            _.children.addClass('noactive');
                            _.panel.empty().append(_.children).show();
                            if (_.vol) {
                                _.panel.css('height', _.length + '00%').css('width', '100%');
                                _.children.css('height', Math.floor(10000 / _.length) / 100 + '%').css('width', '100%');
                            } else {
                                _.panel.css('width', _.length + '00%').css('height', '100%');
                                _.children.css('width', Math.floor(10000 / _.length) / 100 + '%').css('height', '100%');
                                _.children.css('float', 'left');
                            }
                            _.change(_.index == NaN ? 0 : _.index, true, true);
                            lst.remove();
                        });
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {})), null, limit || 0.2, limitBack || true, true]]);
            //width:100%;height:100%;
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.lock = false;
        }
        //以方便继承类覆盖并执行动画
        __.onLeft = _.onLeft;
        _.onLeft = function(ev, e) {
            if (_.vol || _.lock) return;
            __.distance = Math.abs(ev.deltaX); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
            return __.onLeft(ev, e);
        };
        __.onRight = _.onRight;
        _.onRight = function(ev, e) {
            if (_.vol || _.lock) return;
            __.distance = Math.abs(ev.deltaX); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
            return __.onRight(ev, e);
        };
        __.onUp = _.onUp;
        _.onUp = function(ev, e) {
            if (_.hor || _.lock) return;
            __.distance = Math.abs(ev.deltaY); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
            return __.onUp(ev, e);
        };
        __.onDown = _.onDown;
        _.onDown = function(ev, e) {
            if (_.hor || _.lock) return;
            __.distance = Math.abs(ev.deltaY); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
            return __.onDown(ev, e);
        };
        //low设计需要区别第一次
        __.first = true;
        _.change = function(val, nofire, first) {
            val = ('' + val).toLowerCase();
            var num = Math.ceil(__.distance / (_.hor ? _.node.width() : _.node.height()));
            val = Math.max(0, Math.min(_.children.length - 1, val == 'true' ? (_.get().value + num) : (val == 'false' ? (_.get().value - num) : parseInt(val))));
            _.index = val;
            if (!nofire && val != parseInt(_.get().value)) { _.call('change', { value: val }); } else { _.onBackAnimate(_.panel, _.status, first); }
        };
        _.onBackAnimate = function(node, e, first) {
            V.once(function() {
                //等待1秒是希望在触发事件更新Index之后再处理动画才能合理显示
                V.merge(e.transform, { tx: 0, ty: 0, scale: 1, angle: 0, rx: 0, ry: 0, rz: 0, startX: 0, startY: 0 }, true);
                if (_.hor) { e.transform.tx -= (_.node.width() * _.index); } else if (_.vol) { e.transform.ty -= (_.node.height() * _.index); }
                var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)', e.transform);
                if (!first) { _.panel.addClass('animate') };
                _.panel.css('webkitTransform', value).css('mozTransform', value).css('transform', value).show(); //.addClass('animate')
                /*var cur = $(_.children.get(_.index));
                if(cur.hasClass('noactive')){
                	cur.removeClass('noactive').addClass('active');
                	//不仅仅是动画 需要显示
                	_._animate('fadeOut',_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active'),function(){
                		_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active').hide().removeClass('active').addClass('noactive');
                	})
                	_._animate('fadeIn',cur,function(){cur.show();});
                }*/
            }, 10);
        };
    };

    //上下或者左右滚动的方法的基本类，继承者注意重载onValue(v,func)函数 其中v代表按照value,values,addValues传入的数据，传入时已整理为数组，func是参数为字符串的对象，如果不适用，那么请{}方式添加子控件
    W.ScrollPanel = function(middler, path, vm, limit, limitBack) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [middler.getTypeByAppName('VESH.view', 'panel'), [W.Control2.merge({
                template: '<div style="overflow:hidden;"  class="c_scrollPanel"><div style="display:none;"></div></div>',
                vm: V.merge(V.getValue(vm, {}), {
                    data: { direction: 'vol', _: true },
                    onLeft: function(data, self) { _.call('next') },
                    onRight: function(data, self) { _.call('reload') },
                    onUp: function(data, self) { _.call('next') },
                    onDown: function(data, self) { _.call('reload'); }
                }, true),
                onLoad: {
                    init: function(node) {
                        node.removeClass('animate');
                        _.panel = node.find('div:first');
                        _.children = _.panel.siblings();
                        //if(_.children.length==0) return;
                        _.length = _.children.length;
                        _.value = Math.max(0, Math.min(_.children.length, parseInt(_.value)));
                        _.children.css('position', 'relative');
                        _.children.addClass('noactive');
                        _.panel.append(_.children);
                        //根据direction覆盖监听操作 同时修改panelaction
                        var dir = _.get().direction;
                        switch (dir) {
                            case 'vol':
                                _.vol = true;
                                delete _.events.left;
                                delete _.events.right;
                                //取消水平操作动画
                                _.panel.css('width', '100%');
                                _.children.css('width', '100%')
                                break;
                            case 'hor':
                            default:
                                //取消垂直操作动画
                                _.hor = true;
                                delete _.events.up;
                                delete _.events.down;
                                _.panel.css('height', '100%');
                                (_.children.width()) && _.panel.width(_.children.width()); //.css('display','flex');				
                                _.children.css('height', '100%').css('float', 'left');
                                break;
                        }
                    },
                    next: { as: ['reload'], override: true, Method: function() {} }
                },
                render: {
                    'value': function(v) {
                        _.onValue([v], function(content) {
                            switch (typeof(content)) {
                                case 'string':
                                    _.panel.empty().append(content)
                                    break;
                                case 'object':
                                    _.panel.empty();
                                    _.addControl(null, content);
                                    break;
                            }
                        });
                    },
                    'values': function(v) {
                        _.onValue(v, function(content) {
                            switch (typeof(content)) {
                                case 'string':
                                    _.panel.empty().append(content)
                                    break;
                                case 'object':
                                    if (!V.isArray(content)) { content = [content]; }
                                    _.panel.empty();
                                    V.each(content, function(v) { _.addControl(null, v); });
                                    break;
                            }
                        });
                    },
                    'addvalues': function(v) {
                        _.onValue(v, function(content) {
                            switch (typeof(content)) {
                                case 'string':
                                    _.panel.append(content)
                                    break;
                                case 'object':
                                    if (!V.isArray(content)) { content = [content]; }
                                    V.each(content, function(v) { _.addControl(null, v); });
                                    break;
                            }
                        });
                    },
                    'top': function(v) {
                        (v) && (function() {
                            _.get().top = false;
                            _.onBackAnimate(_.node, V.merge(_.status, { transform: { tx: 0, ty: 0 } }, true));
                        })();
                    },
                    'bottom': function(v) {
                        (v) && (function() {
                            _.get().bottom = false;
                            _.onBackAnimate(_.node, V.merge(_.status, { transform: { tx: _.status.vol ? 0 : (_.node.width() - _.panel.width()), ty: _.status.hor ? 0 : (_.node.height() - _.panel.height()) } }, true));
                        })();
                    },
                    'lock': {
                        as: ['freeze'],
                        Method: function(v) { _.lock = v; }
                    },
                    _: function() {
                        _.panel.show();
                    }
                }
            }, typeof(path) == 'string' ? { template: path } : (path || {})), null, limit || 0.2, limitBack || true, true]]);
            _.lock = false;
            V.merge(_.status.transform, { x: 0, y: 0 }, true);
        }
        //以方便继承类覆盖并执行动画
        _.onLeft = function(ev, e) {
            if (_.vol || _.lock) return;
            __.distance = Math.abs(ev.deltaX); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
            var x = e.transform.x + ev.deltaX;
            if (x < (_.node.width() - 5 - _.panel.width())) { e.callevent.value = true; }
            if (x > Math.min(-e.limit, (_.node.width() - e.limit - _.panel.width()))) { _.am(_.panel, { tx: (e.left || e.leftout) ? x : Math.max(0, ev.deltaX), ty: 0 }); } else return e.limitBack;
        };
        _.onRight = function(ev, e) {
            if (_.vol || _.lock) return;
            __.distance = Math.abs(ev.deltaX); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
            var x = e.transform.x + ev.deltaX;
            if (x > 5) { e.callevent.value = true; }
            if (x < e.limit) { _.am(_.panel, { tx: (e.right || e.rightout) ? x : Math.max(0, ev.deltaX), ty: 0 }); } else return e.limitBack;
        };
        _.onUp = function(ev, e) {
            if (_.hor || _.lock) return;
            __.distance = Math.abs(ev.deltaY); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
            var y = e.transform.y + ev.deltaY;
            if (y < (_.node.height() - 5 - _.panel.height())) { e.callevent.value = true; }
            if (y > Math.min(-e.limit, (_.node.height() - e.limit - _.panel.height()))) { _.am(_.panel, { ty: (e.up || e.upout) ? y : Math.max(0, ev.deltaY), tx: 0 }); } else return e.limitBack;
        };
        _.onDown = function(ev, e) {
            if (_.hor || _.lock) return;
            __.distance = Math.abs(ev.deltaY); //Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
            var y = e.transform.y + ev.deltaY;
            if (y > 5) { e.callevent.value = true; }
            if (y < e.limit) { _.am(_.panel, { ty: (e.down || e.downout) ? y : Math.max(0, ev.deltaY), tx: 0 }); } else return e.limitBack;
        };
        _.onScale = function(ev, e) {
            if (Math.abs(ev.scale - 1) * Math.min(_.node.width(), _.node.height) < e.limit) _.am(_.panel, { scale: ev.scale });
            else { e.callevent.value = true; }
        };
        _.addControl = function(node, v) {
            if (!_.controls) {
                _.controls = [];
                _.vs = {};
                _.vms = {};
                _.models = _.vms;
            }
            var obj = _.middler.getObjectByAppName(W.APP, v.type);
            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
            node = node ? node : V.newEl('div').appendTo(_.panel);
            obj.init(_, node, v.data);
            obj.page = _.page;
            _.controls.push(obj);
            var key = V.getValue(v.id, V.random());
            if (_.vs[key]) { V.showException('控件id为' + id + '的子控件已经存在，请更换id名'); return; }
            _.vs[key] = obj;
            V.inherit.apply(v, [M.Control, []]);
            _.vms[key] = v;
            obj.bind(v);
            return v;
        };
        //一般需要重载此方法即可
        _.onValue = function(v, func) {
            if (!V.isArray(v)) v = [v];
            var sb = V.sb();
            V.each(v, function(v2) { if (typeof(v2) == 'string') { sb.append(v2); } else sb.append(V.toJsonString(v2)); }, function() {
                func(sb.clear());
                sb = null;
            });
        };
        _.onBackAnimate = function(node, e) {
            V.once(function() {
                if (e.vol && e.transform.ty < 0 && e.transform.ty > (_.node.height() - _.panel.height())) { e.transform.y = e.transform.ty; return; }
                if (e.hor && e.transform.tx < 0 && e.transform.tx > (_.node.width() - _.panel.width())) { e.transform.x = e.transform.tx; return; }
                V.merge(e.transform, {
                    tx: Math.min(0, Math.max(_.node.width() - _.panel.width(), e.transform.tx)),
                    ty: Math.min(0, Math.max(_.node.height() - _.panel.height(), e.transform.ty)),
                    scale: 1,
                    angle: 0,
                    rx: 0,
                    ry: 0,
                    rz: 0,
                    startX: 0,
                    startY: 0
                }, true);
                V.merge(e.transform, { x: e.transform.tx, y: e.transform.ty }, true);
                //等待1秒是希望在触发事件更新Index之后再处理动画才能合理显示
                var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)', e.transform);
                _.panel.addClass('animate').css('webkitTransform', value).css('mozTransform', value).css('transform', value).show();
                /*var cur = $(_.children.get(_.index));
                if(cur.hasClass('noactive')){
                    cur.removeClass('noactive').addClass('active');
                    //不仅仅是动画 需要显示
                    _._animate('fadeOut',_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active'),function(){
                        _.panel.children(':lt('+_.index+').active,:gt('+_.index+').active').hide().removeClass('active').addClass('noactive');
                    })
                    _._animate('fadeIn',cur,function(){cur.show();});
                }*/
            }, 10);
        };
    }

    /**
     * _.addDesc('Router:');
            _.addDesc('\t负责提供SPA条件下的页面的前进和后退转换与大小统一设置允许定义 showaction与hideaction作为显示隐藏动画 而且默认显示第一个页面并调用其Active事件和canActive属性 isActive属性，Resize事件 ');
            _.addDesc('属性:');
            _.addDesc('\tshowaction:config中定义的show动画');
            _.addDesc('\thideaction:config中定义的hide动画');
            _.addDesc('\tnext:按照顺序进行下一个canActive的控件 当输入id时按照ID进行切换,并通知内部子控件的Active事件');
            _.addDesc('\tprev:按照顺序回滚上一个canActive的控件 当输入id时按照ID进行寻找如果属于子控件，而且历史上访问过子控件那么将子控件之后的历史全部删除，如果子控件已经canActive为真且切换至子控件，否则只删除记录不切换。并通知内部子控件的Active事件');
            _.addDesc('\tsize:设置控件的高宽，并通知内部控件onSize事件');
            _.addDesc('\tvalues:清理内部控件，重新addControl内部控件，设置其隐藏状态，并自动设置其size属性和第一个控件的active事件');
            _.addDesc('\taddvalues:addControl新内部控件，并自动设置其size和第一个可用控件的active事件');
            _.addDesc('事件:');
            _.addDesc('\tonChange:不论前进还是后退更新当前value（子控件ID）值');
            _.addDesc('附加给内部子控件的事件:');
            _.addDesc('\tActive:触发内部控件的事件，并设置其isActive属性为真');
            _.addDesc('\tonInactive:触发内部控件的事件，并设置其isActive属性为假');
            _.addDesc('\tonResize:触发内部控件的事件，并设置其width,height,size属性');
            _.addDesc('附加给内部子控件的属性:');
            _.addDesc('\tcanActive:为真时不可被重新设置到');
     * @param {*} path 
     * @param {*} vm 
     */
    W.Router = function(path, vm) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Panel, [W.Control2.merge({
                template: '<div style="display:none;" class="c_router"></div>',
                vm: vm || { data: { showaction: 'fadeInRight', hideaction: 'fadeOutRight' } },
                onLoad: {
                    change: { override: true, Method: function() {} },
                    finally: function(node) {
                        _.reload(node);
                        if (__.cons.length > 0) _.vm.data.next = __.cons[0];
                    }
                },
                render: {
                    'value': function(v) {
                        __.his.push(v);
                        _.change(v);
                    },
                    'next': function(v) {
                        (v && v != _.vm.data.value) && (function() {
                            (!(__.vms[v] && v != _.vm.data.value)) && (function() {
                                //自动切换下一个
                                var hasfind = false;
                                for (var i = 0; i < __.cons.length; i++) {
                                    (hasfind && V.getValue(__.vms[__.cons[i]].canActive, true)) ? (function() {
                                        v = __.cons[i];
                                        i = __.cons.length;
                                    })() : (__.cons[i] == _.vm.data.value) && (hasfind = true);
                                }
                            })();
                            __.his.push(v);
                            _.change(v);
                        })();
                    },
                    'prev': function(v) {
                        (v && v != _.vm.data.value) && (function() {
                            (__.vms[v] && v != _.vm.data.value) ? (function() {
                                //查看是否历史上有前置，如果有需要删除掉所有前置历史
                                var hasfind = false;
                                var his = Array.prototype.slice.call(__.his, 0);
                                V.whileC(function() { return !hasfind ? his.pop() : null; }, function(v2) {
                                    (v2 == v) && (function() {

                                        hasfind = true;
                                        __.his = his;
                                        __.his.push(v);
                                    })();
                                }, function() {
                                    (!hasfind || !V.getValue(__.vms[value].data.canActive, true)) && (value = null);
                                }, true);
                            })() : (function() {
                                value = null;
                                V.whileC(function() { return value == null ? __.his.pop() : null; }, function(v) {
                                    (V.getValue(__.vms[v].data.canActive, true)) && (value = v);
                                }, null, true);
                            })();
                            _.change(value);
                        })();
                    },
                    'size': function(v) {
                        (v && v.width && v.height) && (function() {
                            _.node.width(v.width);
                            _.node.height(v.height);
                            _.node.children().width(v.width);
                            _.node.children().height(v.height);
                            V.each(__.cons, function(v2) { __.vms[v2].call('size', { size: v }); });
                        })();
                    },
                    'clear': function(v) {
                        V.forC(__.vms, function(k2, v2) {
                            _.removeControl(k2);
                        }, function() {
                            __.cons = [];
                            __.vms = {};
                            __.his = [];
                            delete _.vm.data.value;
                        });
                    },
                    'values': {
                        as: 'addvalues',
                        Method: function(v) {
                            V.next(function(data, next) {
                                if (key.toLowerCase() == 'values') {
                                    V.forC(__.vms, function(k2, v2) {
                                        _.removeControl(k2);
                                    }, function() {
                                        __.cons = [];
                                        __.vms = {};
                                        __.his = [];
                                        delete _.vm.data.value;
                                        next();
                                    });
                                } else next();
                            }, function(data, next) {
                                V.each(value, function(v2) {
                                    v2.onActive = v2.onActive ? v2.onActive : function(D, I) {
                                        I.update({ show: D.showaction });
                                        V.once(function() { I.call('showed'); }, 500);
                                    };
                                    _.addControl(null, v2);
                                }, function() {
                                    _.reload(_.node);
                                    if (__.cons.length > 0) _.render({ size: _.vm.data.size, value: __.cons[0] });
                                })
                            });
                        }
                    }
                }
            }, typeof(path) == 'string' ? { template: path, vm: vm } : (path || {}))]]);
            __.render = _.render;
            __.onLoad = _.onLoad;

        }
        _.reload = function(node) {
            __.cons = [];
            __.vms = {};
            __.his = [];
            node.children().each(function(i, v) {
                var id = $(v).hide().attr('id');
                if (id) {
                    var vm = _.vms[id] ? _.vms[id] : (_.parent.vms[id] ? _.parent.vms[id] : _.page.vms[id]);
                    if (vm) {
                        __.cons.push(id);
                        __.vms[id] = vm;
                        V.merge(vm, { canActive: (vm.data && vm.data.canActive) || true, isActive: false }, true);
                    } else { V.showException("不是VJ控件，自动隐藏"); }
                } else { V.showException('没有找到id,自动隐藏'); }
            });
        };
        _.change = function(value) {
            if (value) {
                if (_.vm.data.value) {
                    __.vms[_.vm.data.value].update({ hide: _.vm.data.hideaction, isActive: false });
                    __.vms[_.vm.data.value].call('inactive');
                }
                if (__.vms[value]) {
                    __.vms[value].update({ showaction: _.vm.data.showaction, isActive: true });
                    __.vms[value].call('active');
                } else {

                }
                _.call('change', { value: value, visible: true });
            }
        };
    };
})(VJ, jQuery, VJ.view, VJ.viewmodel);