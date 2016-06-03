(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || "<div></div>", vm || { data: { inaction: 'fadeInUp', outaction: 'fadeOutUp', waitsecends: 0.4}}]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            __.replaceNode = _.replaceNode;
            __.count = 0;
            __.index = 0;
            __.canstart = true;
            _.addDesc('goround 走马灯');
            _.addDesc('属性:');
            _.addDesc('\tinaction:移动方向 fadeInLeft');
            _.addDesc('\toutaction:移动方向 fadeOutRight');
            _.addDesc('\twaitsecends:等待时间 0.4（秒）');
            _.addDesc('\twaitcount:等待数目 1 todo');
            _.addDesc('\tvalues:按照模板填充对象，然后等待移动');
            _.addDesc('事件:');
            _.addDesc('\tonClick:点击 传入value,vid,name属性');
            _.addDesc('\tonHover:鼠标浮动 传入value,vid,name,hover:ture/false');
            _.addDesc('\tonEnd:移动停止 已经重新开始');
            _.addDesc("定义:");
            _.addDesc("\tgoround: { path: '../../Scripts/module/home/goround.js' }");
        }
        _.replaceNode = function (node) {
            __.innerhtml = _.node.html();
            _.content = '<div style="display:none;">' + __.innerhtml + '</div>';
            __.replaceNode.apply(_, arguments);
        };
        _.onLoad = function (node) {
            _.body = node;
            node.empty();
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
                    case 'end':
                        break;
                    case 'click':
                        _.body.on('click', 'a,input,.click', function (e) {
                            var _this = $(this);
                            var li = $(_this.parents('div[data-index]').get(0));
                            _.call('click', { e: e, value: _.vm.data.values[li.attr('data-index')], vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name') });
                            V.stopProp(e);
                            return e.target.nodeName != 'A';
                        });
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                _.body.hover(function (e) {
                    var _this = $(this);
                    var li = $(_this.find('div[data-index]').get(0));
                    _this = _this.find('.click:first');
                    _.call('hover', { e: e, value: _.vm.data.values[li.attr('data-index')], vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name'), hover: true });
                    __.stop();
                }, function (e) {
                    var _this = $(this);
                    var li = $(_this.find('div[data-index]').get(0));
                    _this = _this.find('.click:first');
                    _.call('hover', { e: e, value: _.vm.data.values[li.attr('data-index')], vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name'), hover: false });
                    __.resume();
                });
                __.onLoad(node)
            });
        };
        _.fill = function () { return { ids: (function () { var sb = []; _.body.find(':checked[value]').each(function (i, v) { sb.push(v.getAttribute('value')); }); return sb.join(';'); })()} };
        _.render = function (data) {
            data = __.render(data);
            var rebuild = false;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'removevalue':
                        _.vm.data.values = (_.vm.data.values && _.vm.data.values.length > 0) ? $.grep(_.vm.data.values, function (v2) { return v != v2; }) : [];
                        __.count = _.vm.data.values.length;
                        __.start();
                        break;
                    case 'addvalues':
                        if (_.vm.data.values && _.vm.data.values.length > 0) _.vm.data.values.push(v); else _.vm.data.values = [v];
                        __.count = _.vm.data.values.length;
                        __.start();
                        break;
                    case 'values':
                        if (!V.isArray(v)) v = [v];
                        _.vm.data.values = v;
                        __.count = _.vm.data.values.length;
                        __.start(true);
                        break;
                }
            });
        }
        __.stop = function () { __.canstart = false; };
        __.resume = function () {
            __.canstart = true;
            __.start(false, true);
        };
        __.start = function (isstart, isresume) {
            if (!__.canstart) return;
            if (isstart) __.index = 0;
            var data = _.vm.get();
            if (__.count > 0 && __.index < __.count) {
                if (!__.canstart) return;
                _.node.append(V.format(_.content, data.values[__.index]));
                _.node.children(':last').attr('data-index', __.index);
                var fun = function () {
                    _.node.children(':last').show();
                    _._animate(data.inaction, _.node.children(':last'), function () {
                        __.index = (__.index + 1) % __.count;
                        if (__.index == 0) _.call('end');
                        V.once(__.start, data.waitsecends * 1000);
                    });
                }
                if (_.node.children().length > 1) {
                    V.once(function () {
                        _._animate(data.outaction, _.node.children().slice(0, _.node.children().length - 1), function () {
                            _.node.children().slice(0, _.node.children().length - 1).each(function (i, v) { $(v).hide().remove(); });
                            fun();
                        });
                    }, isresume ? data.waitsecends * 1000 : 1);
                } else fun();
            }
        };
    });
})(VJ, VJ.view, jQuery);