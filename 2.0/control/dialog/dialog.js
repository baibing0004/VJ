(function (V, W, $) {
    var _zindex = 999;
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<div class="p_dialog_contain" style="display:none;"><div class="p_dialog_title"></div><div class="p_dialog_content"></div><div class="p_dialog_buttons"></div></div>', vm || { data: { ok: "确 定", cancel: '取 消', autoclose: true, openanimate: 'fadeIn', closeanimate: 'fadeOut' } }]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('dialog 必填参数:');
            _.addDesc('\twidth:宽度');
            _.addDesc('\theight:高度');
            _.addDesc('\topen:true/动画名 打开dialog');
            _.addDesc('dialog 必填函数:');
            _.addDesc('\tonOK:ok关闭');
            _.addDesc('dialog可选参数:');
            _.addDesc('\tautoclose:true 是否自动关闭');
            _.addDesc('\tclose:true/动画名 关闭dialog');
            _.addDesc('\topenanimate:默认显示动画名');
            _.addDesc('\tcloseanimate:默认关闭动画名');
            _.addDesc('\tok:确定按钮说明');
            _.addDesc('\tcancel:取消按钮说明');
            _.addDesc('dialog可选函数:');
            _.addDesc('\tonCancel:cancel关闭');
            _.addDesc('\tonClose:关闭（总是触发）');
            _zindex = _zindex ? _zindex : 999;
        }
        _.onLoad = function (node) {
            _.back = V.newEl('div', 'p_dialog_back', '').css('display', 'none').css('z-index', _zindex++).appendTo($('body'));
            node.css('z-index', _zindex++).appendTo($('body'));
            _.title = node.find('div.p_dialog_title');
            _.body = node.find('div.p_dialog_content');
            _.buttons = node.find('div.p_dialog_buttons').empty();
            _.back.click(function () {
                if (_.vm.get().autoclose) { _.call('cancel'); __.close(); }
            });
            _.body.append(node.children(':gt(2)'));
            node.select();
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'confirm':
                    case 'close':
                    case 'open':
                    case 'cancel':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        __.close = function (v) {
            __.render({ hide: true == v ? _.vm.get().closeanimate : v });
            _.back.hide();
            _.call('close');
        };
        _.render = function (data) {
            var show = false;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'title':
                        if (_.title.length > 0) { _.title.html(v); }
                        break;
                    case 'ok':
                        if (v) {
                            if (typeof (__.ok) == 'undefined') {
                                __.ok = V.newEl('div', 'p_dialog_ok', v).click(function () {
                                    _.call('ok');
                                    if (_.vm.get().autoclose) { __.close(); __.ok.blur(); }
                                }).appendTo(_.buttons);
                            } else {
                                __.ok.html(v);
                            }
                        }
                        break;
                    case 'cancel':
                        console.log('cancel' + v);
                        if (v) {
                            if (typeof (__.cancel) == 'undefined') {
                                __.cancel = V.newEl('div', 'p_dialog_cancel', v).click(function () {
                                    _.call('cancel');
                                    if (_.vm.get().autoclose) { __.close(); __.cancel.blur(); }
                                }).appendTo(_.buttons);
                            } else {
                                __.cancel.html(v);
                            }
                        } else {
                            if (__.cancel) { __.cancel.remove(); delete __.cancel;}
                        }
                        break;
                    case 'open':
                        show = v;
                        break;
                    case 'close':
                        if (v) {
                            __.close(v);
                        }
                        break;
                }
            }, function () {
                __.render(data);
                if (show) {
                    //定位
                    var data = _.vm.get();
                    var left = data.width / -2;
                    var top = data.height / -2;
                    _.node.width(data.width).height(data.height).css('margin-left', left).css('margin-top', top);
                    _.buttons.css('margin-left', -50 * _.buttons.children().length);
                    __.render({ show: true == show ? _.vm.get().openanimate : show });
                    _.back.show();
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);