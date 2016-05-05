(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            //warning", "error", "success" and "info
            V.inherit.apply(_, [W.Control, [path || '<div style="display:none;"></div>', vm || { data: { msgtype: 'error', ok: '确 定', cancel: '取 消', title: '温馨提示!' } }]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('Y.Alert:');
            _.addDesc('autobind:true\r\n\tV.callCommand("alert",["提示内容",function(){}])');
            _.addDesc('\tV.callCommand("confirm",["提示内容",function(){发生true时的点击事件}])');
            _.addDesc('\tV.callCommand("waitting",["提示内容"])');
            _.addDesc('\tV.callCommand("endwaitting")');
            _.addDesc('\tV.callCommand("input",["提示问题",function(text){return true;如果是false，请使用endwaitting关闭界面,如果是文字会显示在错误提示中},"holdertext"])');
        }
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'ok':
                    case 'cancle':
                    case 'click':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        _.transform = function (data) {
            var ret = { closeOnConfirm: true, animation: true, html: false, text: ' ', showCancelButton: false, confirmButtonColor: '#8CD4F5', func: function () { } };
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'func':
                        if (v) {
                            ret.func = v;
                        }
                        break;
                    case 'msgtype':
                        ret['type'] = v;
                        break;
                    case 'value':
                        ret['text'] = v;
                        break;
                    case 'class':
                        ret['customClass'] = v;
                        break;
                    case 'cancel':
                        if (v) {
                            ret["confirmButtonColor"] = "#DD6B55";
                            ret['showCancelButton'] = true;
                            ret['cancelButtonText'] = v;
                        }
                        break;
                    case 'ok':
                        if (v) {
                            ret['showConfirmButton'] = true;
                            ret['confirmButtonText'] = v;
                        } else {
                            ret['showConfirmButton'] = false;
                        }
                        break;
                    case 'image':
                        ret['imageUrl'] = v;
                        ret['imageSize'] = '80x80';
                        break;
                    default:
                        ret[k] = v;
                        break;
                }
            }, null, true);
            return ret;
        };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'value':
                        var val = _.transform(V.merge(_.vm.get(), { value: v }));
                        if (swal && v) swal(val, val.func ? val.func : function () { });
                        break;
                    case 'close':
                        if (swal) swal.close();
                        break;
                    case 'autobind':
                        if (v == true) {
                            V.registCommand('alert', function (text, func) {
                                __.ok = data.ok || __.ok;
                                __.cancel = data.cancel || __.cancel;
                                V.once(function () { _.vm.update({ msgtype: 'error', cancel: false, ok: __.ok, closeOnConfirm: true, animation: true, value: text, func: func ? func : function () { } }); }, 100);
                            });
                            V.registCommand('confirm', function (text, func) {
                                __.ok = data.ok || __.ok;
                                __.cancel = data.cancel || __.cancel;
                                V.once(function () { _.vm.update({ msgtype: 'error', cancel: __.cancel, ok: __.ok, closeOnConfirm: true, animation: true, value: text, func: func ? func : function () { } }); }, 100);
                            });
                            V.registCommand('waitting', function (text, func) {
                                __.ok = data.ok || __.ok;
                                __.cancel = data.cancel || __.cancel;
                                V.once(function () { _.vm.update({ msgtype: 'error', cancel: false, ok: false, closeOnConfirm: true, animation: true, value: text, func: func ? func : function () { } }); }, 100);
                            });
                            V.registCommand('endwaitting', function () {
                                _.vm.update({ close: true });
                            });
                            V.registCommand('input', function (text, func, holdertext) {
                                __.ok = data.ok || __.ok;
                                __.cancel = data.cancel || __.cancel;
                                V.once(function () {
                                    _.vm.update({
                                        msgtype: 'input', cancel: __.cancel, ok: __.ok, value: text, inputPlaceholder: holdertext, closeOnConfirm: false, animation: "slide-from-top", func: func ? function (text) {
                                            var ret = func(text);
                                            if (ret == true) { swal.close(); }
                                            else if (ret && swal) swal.showInputError(ret);
                                            return false;
                                        } : function (text) { swal.close(); }
                                    });
                                }, 100);
                            });
                        }
                        break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);