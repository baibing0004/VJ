(function (V, $, W, M) {
    {
        W.TextBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<span><span style="display:none;"></span><input type="text"/></span>', vm || {}]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                _.txt = node.find('span:first');
                _.input = node.find('input:first');
                V.forC(_.events, function (k, v) {
                    switch (k) {
                        case 'hover':
                            _.node.hover(function () {
                                if (node.parents("[disabled]").length > 0) return;
                                _.call('Hover', { hover: true });
                            }, function () {
                                if (node.parents("[disabled]").length > 0) return;
                                _.call('Hover', { hover: false });
                            });
                            break;
                        case 'error':
                            if (_.get().validate) {
                                _.validate(_, _.input);
                            }
                            break;
                        default:
                            _.bindEvent(_.input, k, v);
                            break;
                    }
                }, function () { __.onLoad(node); }, true);
            };
            _.fill = function () {
                var value = $.trim(_.input.val());
                value = (value == _.vm.data.title || value == _.vm.data.error) ? "" : value;
                return { text: value, value: value };
            };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'enable':
                            if (value) { _.input.removeAttr('disabled'); } else { _.input.attr('disabled', 'disabled'); }
                            break;
                        case 'title':
                            if (value) {
                                _.input.focus(function () { if (_.input.val() == value || _.input.text() == value || _.input.val() == _.vm.data.error || _.input.text() == _.vm.data.error) { _.input.val(''); } });
                                _.input.off('blur').on('blur', function () { if (_.input.val() == '' && _.input.text() == '') _.render({ value: value }); });
                            } else {
                                _.input.off('blur').off('focus').focus(function () { if (_.input.val() == _.vm.data.error || _.input.text() == _.vm.data.error) { _.input.val(''); } });
                            }
                            break;
                        case 'text':
                        case 'value':
                            if (typeof (value) != 'boolean' && 'false' != ('' + value).toLowerCase() && 'undefined' != ('' + value).toLowerCase()) {
                                _.input.val(value);
                                if (_.vm.data.title && !V.isValid(value)) _.input.val(_.vm.data.title);
                            } else {
                                _.input.val('');
                            }
                            break;
                        case 'name':
                            _.input.attr('name', value);
                            delete data[key];
                            break;
                        case 'key':
                            _.txt.text(value).show();
                            delete data[key];
                            break;
                        case 'size':
                            _.input.attr('size', value);
                            delete data[key];
                            break;
                        case 'kind':
                            _.input.attr('type', value);
                            delete data[key];
                            break;
                        case 'maxlength':
                            _.input.attr('maxlength', value);
                            delete data[key];
                            break;
                    }
                });
                return data;
            };
            _.animate = function (name, func) {
                _._animate(name, _.input, func);
            };
        };
        W.RadioBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.TextBox, [path || '<span><span style="display:none;"></span><input type="radio"/></span>', vm]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.fill = function () {
                return { checked: _.input.attr('checked') ? true : false };
            };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'checked':
                            V.setChecked(_.input, value);
                            delete data[key];
                            break;
                    }
                });
                return data;
            };
        };
        W.CheckBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.RadioBox, [path || '<span><span style="display:none;"></span><input type="checkbox"/></span>', vm]]);
            }
        };
        W.Select = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<span><span style="display:none;"></span><select></select></span>', vm]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                _.txt = node.find('span:first');
                _.sel = node.find('select:first');
                V.forC(_.events, function (k, v) {
                    _.bindEvent(_.sel, k, v);
                }, null, true);
                if (_.events.error && _.get().validate) {
                    _.validate(_, _.input);
                }
                __.onLoad(node);
            };
            _.fill = function () {
                return { value: _.sel.find("option:selected").val() };
            };
            _.render = function (data) {
                data = __.render(data);
                var setValue = function (value) {
                    _.sel.find(':selected').attr('selected', false);
                    _.sel.find('option[value="' + value + '"]').attr('selected', true);
                };
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'values':
                            if (V.getType(value) == 'string') {
                                value = eval('(' + value + ')');
                            };

                            if (V.userAgent.ie7 || V.userAgent.ie8) {
                                V.forC(value, function (k, v) {
                                    var opn = document.createElement("OPTION");
                                    _.sel.get(0).appendChild(opn); //先追加
                                    if (_.vm.data.value && _.vm.data.value == v) {
                                        opn.selected = true;
                                    }
                                    opn.innerText = k;
                                    opn.value = v;
                                }, function () {
                                    //神奇的Bug select重新填写需要改样式
                                    V.once(function () { _.sel.css('display', 'none').css('display', 'block') });
                                }, true);
                            } else {
                                var sb = V.sb();
                                V.forC(value, function (k, v) {
                                    sb.appendFormat('<option value="{value}">{key}</option>', { key: k, value: v });
                                }, function () { _.sel.empty().html(sb.clear()); sb = null; if (_.vm.data.value) { setValue(_.vm.data.value); } });
                            }
                            break;
                        case 'value':
                            setValue(value);
                            break;
                        case 'name':
                            _.sel.attr('name', value);
                            break;
                        case 'key':
                            _.txt.text(value).show();
                            break;
                    }
                });
                return data;
            };
            _.animate = function (name, func) {
                _._animate(name, _.sel, func);
            };
        };
        W.RadioList = function (path, content, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<span class="p_RadioList"><span></span><ul></ul></span>', vm || {}]]);
                __.onLoad = _.onLoad;
                __.render = _.render;
                _.content = V.getValue(content, '<li><span class="p_RadioList_li"><input name="{name}" type="radio" value="{value}"/><span>{key}</span></span></li>');
            }
            _.fill = function () {
                return { value: _.ul.find(':radio:checked').val() };
            };
            _.onLoad = function (node) {
                _.title = node.find('span:first');
                _.ul = node.find('ul');
                _.vm.data.name = V.getValue(_.vm.data.name, 'radio');
                V.forC(_.events, function (k, v) {
                    _.bindEvent(node, k, v);
                }, function () { __.onLoad(node); });
            };
            _.render = function (data) {
                data = __.render(data);
                var setValue = function (value) {
                    V.setChecked(_.ul.find(":radio:checked"), false);
                    V.setChecked(_.ul.find(':radio[value="' + value + '"]'), true);
                };
                V.forC(data, function (k, v) {
                    switch (k) {
                        case 'key':
                            _.title.html(v);
                            break;
                        case 'values':
                            var sb = V.sb();
                            V.forC(v, function (k, v2) {
                                sb.appendFormat(_.content, { key: k, value: v2, name: _.vm.data.name });
                            }, function () {
                                _.ul.empty().append(sb.toString()); sb.clear(); sb = null;
                                if (_.vm.data.value) {
                                    setValue(_.vm.data.value);
                                }
                            });
                            break;
                        case 'value':
                            setValue(v);
                            break;
                        case 'name':
                            _.node.find(":radio").attr('name', v);
                            break;
                    }
                });
                return data;
            };
            _.animate = function (name, func) {
                _._animate(name, _.ul, func);
            };
        };
        W.CheckList = function (path, content, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<div class="p_CheckList"><span></span><ul></ul></div>', vm || {}]]);
                __.onLoad = _.onLoad;
                __.render = _.render;
                _.content = V.getValue(content, '<li><span class="p_CheckList_li"><input name="{name}" type="checkbox" value="{value}"/><span>{key}</span></span></li>');
            }
            _.fill = function () {
                //需要兼容没有数据未创建时的错误
                return _.ul.children().length > 0 ? {
                    value: (function () {
                        var ret = [];
                        _.ul.find(':checkbox:checked').each(function (i, v) {
                            ret.push($(v).val());
                        });
                        return ret.join(',');
                    })()
                } : {};
            };
            _.onLoad = function (node) {
                _.title = node.find('span:first');
                _.ul = node.find('ul');
                _.vm.data.name = V.getValue(_.vm.data.name, 'check');
                V.forC(_.events, function (k, v) {
                    _.bindEvent(node, k, v);
                }, function () { __.onLoad(node); });
            };
            _.render = function (data) {
                data = __.render(data);
                var setValue = function (value) {
                    value = V.getValue(value + '', '');
                    V.setChecked(_.ul.find(":checkbox:checked"), false);
                    V.each(value.split(','), function (v) { V.setChecked(_.ul.find(':checkbox[value="' + v + '"]'), true); });
                };
                //未能更简单实现list与value方法之间异步处理的问题。
                V.forC(data, function (k, v) {
                    switch (k) {
                        case 'key':
                            _.title.html(v);
                            break;
                        case 'values':
                            var sb = V.sb();
                            V.forC(v, function (k, v2) {
                                sb.appendFormat(_.content, { key: k, value: v2, name: _.vm.data.name });
                            }, function () {
                                _.ul.empty().append(sb.clear()); sb = null;
                                if (_.vm.data.value) {
                                    setValue(_.vm.data.value);
                                }
                            });
                            break;
                        case 'value':
                            setValue(v);
                            break;
                        case 'name':
                            _.node.find(":checkbox").attr('name', v);
                            break;
                    }
                });
                return data;
            };
            _.animate = function (name, func) {
                _._animate(name, _.sel, func);
            };
        };
        //todo file
        W.Hidden = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<input type="hidden"/>', vm]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                V.forC(_.events, function (k, v) {
                    switch (k.toLowerCase()) {
                        case 'error':
                            if (_.get().validate) {
                                _.validate(_, _.node);
                            }
                            break;
                        default:
                            _.bindEvent(node, k, v);
                            break;
                    }
                }, null, true);
                __.onLoad(node);
            };
            _.fill = function () {
                return { val: _.node.val() };
            };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'value':
                            _.node.val(value);
                            break;
                        case 'name':
                            _.node.attr('name', value);
                            break;
                    }
                });
                return data;
            };
        };
        W.PasswordBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.TextBox, [path || '<span><span style="display:none;"></span><input type="password"/></span>', vm]]);
                __.render = _.render;
            }
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'alt':
                        case 'passchar':
                            _.input.attr('alt', value);
                            break;
                    }
                });
                return data;
            };
        };
        W.Button = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.TextBox, [path || '<span><span style="display:none;"></span><input type="button"/></span>', vm]]);
                __.render = _.render;
            }
            _.fill = function () { return {}; };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'name':
                            _.input.attr('name', value);
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
        W.Submit = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Button, [path || '<span><span style="display:none;"></span><input type="submit"/></span>', vm]]);
            }
        };
        W.Reset = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Button, [path || '<span><span style="display:none;"></span><input type="reset"/></span>', vm]]);
            }
        };
        W.Form = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<form method="get" action=""></form>', vm || { data: { enctype: 'multipart/form-data'}}]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                V.forC(_.events, function (k, v) { _.bindEvent(node, k, v) }, function () { __.onLoad(node); }, true);
                _.cons = [];
                node.find('[_]').each(function (i, v) {
                    _.cons.push($(v).attr('id'));
                });
            };
            _.fill = function () {
                var value = {};
                if (_.cons)
                    V.each(_.cons, function (v) {
                        var vm = _.parent.vms[v] ? _.parent.vms[v] : _.page.vms[v];
                        if (vm && vm.nodeName != 'fill') {
                            value[v] = vm.get().value;
                        }
                    }, null, true);
                return { value: value };
            };
            _.render = function (data) {
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'method':
                            _.node.attr('method', value);
                            break;
                        case 'action':
                            _.node.attr('action', value);
                            break;
                        case 'target':
                            _.node.attr('target', value);
                            break;
                        case 'name':
                            _.node.attr('name', value);
                            break;
                        case 'enctype':
                            _.node.attr('enctype', value);
                            break;
                        case 'valid':
                            if (value) {
                                delete data.valid;
                                var cons = Array.prototype.slice.call(_.cons, 0);
                                V.whileC2(function () { return cons.shift(); }, function (v, next) {
                                    var vm = _.parent.vms[v] ? _.parent.vms[v] : _.page.vms[v];
                                    if (vm) {
                                        vm.update({ valid: next });
                                    }
                                }, function () {
                                    value.apply(null, []);
                                });
                            }
                            break;
                        case 'value':
                            if (value) {
                                V.each(_.cons, function (v) {
                                    var vm = _.parent.vms[v] ? _.parent.vms[v] : _.page.vms[v];
                                    if (vm) {
                                        if (vm.nodeName == 'fill') {
                                            vm.update({ value: value ? value : {} });
                                        } else
                                            vm.update({ value: value[v] });
                                    }
                                });
                            }
                            break;
                    }
                }, function () {
                    __.render(data);
                });
                return data;
            };
        };
        W.Router = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Panel, [path || '<div style="display:none;"></div>', vm || { data: { showaction: 'fadeInRight', hideaction: 'fadeOutRight'}}]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
                _.addDesc('Router:');
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
            }
            _.onLoad = function (node) {
                V.forC(_.events, function (k, v) {
                    switch (k.toLowerCase()) {
                        case 'change':
                            break;
                        default:
                            _.bindEvent(node, k, v);
                    }
                }, function () { __.onLoad(node); }, true);
                _.reload(node);
                if (__.cons.length > 0) _.vm.data.next = __.cons[0];
            };
            _.reload = function (node) {
                __.cons = [];
                __.vms = {};
                __.his = [];
                node.children().each(function (i, v) {
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
            _.render = function (data) {
                V.forC(data, function (key, value) {
                    switch (key.toLowerCase()) {
                        case 'next':
                            if (value) {
                                if (!(__.vms[value] && value != _.vm.data.value)) {
                                    value = null;
                                    //自动切换下一个
                                    var hasfind = false;
                                    for (var i = 0; i < __.cons.length; i++) {
                                        if (hasfind && V.getValue(__.vms[__.cons[i]].canActive, true)) {
                                            value = __.cons[i];
                                            i = __.cons.length;
                                        } else if (__.cons[i] == _.vm.data.value) {
                                            hasfind = true;
                                        }
                                    }
                                }
                                if (value) {
                                    __.his.push(value);
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
                            }
                            break;
                        case 'prev':
                            if (value) {
                                if (__.vms[value] && value != _.vm.data.value) {
                                    //查看是否历史上有前置，如果有需要删除掉所有前置历史
                                    var hasfind = false;
                                    var his = Array.prototype.slice.call(__.his, 0);
                                    V.whileC(function () { return !hasfind ? his.pop() : null; }, function (v) {
                                        if (v == value) { hasfind = true; __.his = his; __.his.push(v); }
                                    }, null, true);
                                    if (!hasfind || !V.getValue(__.vms[value].data.canActive, true)) value = null;
                                } else {
                                    value = null;
                                    V.whileC(function () { return value == null ? __.his.pop() : null; }, function (v) {
                                        if (V.getValue(__.vms[v].data.canActive, true)) value = v;
                                    }, null, true);
                                }
                                if (value) {
                                    __.vms[_.vm.data.value].update({ hide: _.vm.data.hideaction, isActive: false });
                                    __.vms[_.vm.data.value].call('inactive');
                                    __.vms[value].update({ showaction: _.vm.data.showaction, isActive: true });
                                    __.vms[value].call('active');
                                    _.call('change', { value: value });
                                }
                            }
                            break;
                        case 'size':
                            if (value && value.width && value.height) {
                                _.node.width(value.width);
                                _.node.height(value.height);
                                _.node.children().width(value.width);
                                _.node.children().height(value.height);
                                V.each(__.cons, function (v) { __.vms[v].call('size', { size: value }); });
                            }
                            break;
                        case 'clear':
                            V.forC(__.vms, function (k2,v2) { v2.dispose(); });
                            __.cons = [];
                            __.vms = {};
                            __.his = [];
                            break;
                        case 'addvalues':
                        case 'values':
                            if (key.toLowerCase() == 'values') {
                                V.forC(__.vms, function (k2, v2) { v2.dispose(); });
                            }
                            V.each(value, function (v2) {
                                v2.onActive = v2.onActive ? v2.onActive : function (D, I) { I.update({ show: D.showaction }); };
                                _.addControl(null, v2);
                            }, function () {
                                _.reload(_.node);
                                if (__.cons.length > 0) _.render({ size: _.vm.data.size, next: __.cons[0] });
                            })
                            break;
                    }
                }, function () {
                    __.render(data);
                });
                return data;
            };
        };
    }
})(VJ, jQuery, VJ.view, VJ.viewmodel);