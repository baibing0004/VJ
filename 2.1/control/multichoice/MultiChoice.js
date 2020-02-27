(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path, vm || {
                data: {
                    addTemplateName: '',
                    removeTemplateName: '',
                    refreshLeftTemplateName: '',
                    refreshRightTemplateName: '',
                    params: {}
                },
                onActive: function (D, I) {
                    //创建
                    __.hasedit = false;
                    I.controls.dia.update({ open: true });
                    _.vm.refresh();
                },
                addItem: function (val) {
                    _.ni.excute('template', _.vm.data.addTemplateName, V.merge(_.vm.data.params, _.vm.data.value, val), function (res) {
                        if (res.hasData()) {
                            var ret = res.last()[0][0];
                            if (ret.count > 0) {
                                _.vms.lstLeft.update({ removevalue: val });
                                _.vms.lstRight.update({ addvalues: [val] });
                                __.hasedit = true;
                            } else V.callCommand("alert", "数据更新失败,请联系管理员");
                        }
                    });
                },
                removeItem: function (val) {
                    _.ni.excute('template', _.vm.data.removeTemplateName, V.merge(_.vm.data.params, _.vm.data.value, val), function (res) {
                        if (res.hasData()) {
                            var ret = res.last()[0][0];
                            if (ret.count > 0) {
                                _.vms.lstRight.update({ removevalue: val });
                                _.vms.lstLeft.update({ addvalues: [val] });
                                __.hasedit = true;
                            } else V.callCommand("alert", "数据更新失败,请联系管理员");
                        }
                    });
                },
                refresh: function () {
                    _.ni.excute('template', _.vm.data.refreshLeftTemplateName, V.merge(_.vm.data.params, _.vm.data.value), function (res) {
                        if (res.hasData()) {
                            _.vms.lstLeft.update({ values: res.last()[0] });
                        }
                    });
                    _.ni.excute('template', _.vm.data.refreshRightTemplateName, V.merge(_.vm.data.params, _.vm.data.value), function (res) {
                        if (res.hasData()) {
                            _.vms.lstRight.update({ values: res.last()[0] });
                        }
                    });
                },
                controls: {
                    dia: {
                        data: { title: '', cancel: false },
                        onClose: function (D, I) {
                            _.call('close');
                            if (__.hasedit) _.call('confirm');
                        }
                    },
                    lstLeft: {
                        onClick: function (D, I) {
                            if (D.vid && D.name == 'add') {
                                _.vm.addItem(D.value);
                            }
                        }
                    },
                    lstRight: {
                        onClick: function (D, I) {
                            if (D.vid && D.name == 'remove') {
                                _.vm.removeItem(D.value);
                            }
                        }
                    }
                }
            }]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('MultiChoice 必填参数:');
            _.addDesc('\tvalue:操作对象绑定对象');
			_.addDesc('\ttitle:标题');
            _.addDesc('\taddTemplateName:由左向右添加时的template的方法名(一般在ni.js中定义)参数为params与value属性（一般用于定义UID）和li>span下定义的PID合并成调用参数集合');
            _.addDesc('\tremoveTemplateName:由左向右添加时的template的方法名(一般在ni.js中定义)参数定义同上');
            _.addDesc('\trefreshLeftTemplateName:刷新左侧未绑定参数集合的方法名(一般在ni.js中定义)参数定义为params与value属性的集合，ni返回值应注意UID与PID，一般地UID为主，PID为绑定的对象ID');
            _.addDesc('\trefreshRightTemplateName:刷新右侧已绑定参数集合的方法名(一般在ni.js中定义)参数定义同上');
            _.addDesc('MultiChoice 必填函数:');
            _.addDesc('\tonConfirm:修改并关闭');
            _.addDesc('\tonClose:关闭');
            _.addDesc('\t定义:');
            _.addDesc("\tlist: { path: '../../Style/module/part/list.css;../../Scripts/module/part/list.js' },\r\ndialog: { path: '../../Style/module/part/dialog.css;../../Scripts/module/part/dialog.js' },\r\nmchoice: { path: '../../Style/module/admin/multichoice.css;../../Scripts/module/admin/multichoice.js', params: ['../../Module/admin/MultiChoice.part'] }:'");
        }
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'confirm':
                    case 'close':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        _.render = function (data) {
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'value':
                        __.editstate = v ? true : false;
                        _.vm.get().value = v;
                        _.call('active', {});
                        break;
                    case 'title':
                        _.vms.dia.update({ title: v });
                        break;
                }
            }, function () {
                __.render(data);
            });
        }
    });
})(VJ, VJ.view, jQuery);