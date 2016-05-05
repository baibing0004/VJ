(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<span><span class="p_pagi_buttons"><span class="p_pagi_num">共{max}条记录,每页{pageSize}条，当前{value}/{maxvalue}页</span><span class="p_pagi_first">首页</span><span class="p_pagi_pre">上一页</span><span class="p_pagi_next">下一页</span><span class="p_pagi_last">末页</span>转到第<input type="textbox" length="10"/>页<span class="p_pagi_go">跳转</span></span>', vm || { data: { columns: {}, nodata: '没有找到任何数据', value: 1, maxvalue: 1, pageSize: 10,max:0 } }]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.onLoad = function (node) {
            _.first = node.find('span.p_pagi_first');
            _.last = node.find('span.p_pagi_last');
            _.pre = node.find('span.p_pagi_pre');
            _.next = node.find('span.p_pagi_next');
            _.nums = node.find('span.p_pagi_num');
            _.numscontent = _.nums.html();
            _.input = node.find('input');
            _.go = node.find('span.p_pagi_go');
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'change':
                        _.first.on(V.userAgent.pc ? 'click' : 'tap', function () {
                            if (_.get().value != 1)
                                _.call('change', { value: 1 });
                        });
                        _.last.on(V.userAgent.pc ? 'click' : 'tap', function () {
                            if (_.get().value != _.get().maxvalue)
                                _.call('change', { value: _.get().maxvalue });
                        });
                        _.pre.on(V.userAgent.pc ? 'click' : 'tap', function () {
                            var value = Math.max(1, _.get().value - 1);
                            if (_.get().value != value)
                                _.call('change', { value: value });
                        });
                        _.next.on(V.userAgent.pc ? 'click' : 'tap', function () {
                            var value = Math.min(_.get().maxvalue, _.get().value + 1);
                            if (_.get().value != value)
                                _.call('change', { value: value });
                        });
                        _.go.on(V.userAgent.pc ? 'click' : 'tap', function () {
                            _.query();
                        });
                        _.input.on('keypress', function (e) {
                            if (e.keyCode == 13) {
                                _.query();
                            }
                        })
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'value':
                        _.get().value = Math.min(_.get().maxvalue, Math.max(1, v));
                        _.nums.html(V.format(_.numscontent, _.get()));
                        break;
                    case 'max':
                        _.get().maxvalue = Math.max(Math.ceil(parseInt(v) * 1.0 / _.get().pageSize), 1);
                        _.get().max = Math.max(1, parseInt(v));
                        _.get().value = Math.min(_.get().maxvalue, Math.max(1, _.get().value));
                        _.nums.html(V.format(_.numscontent, _.get()));
                        break;
                }
            });
        };
        _.query = function () {
            if (_.input.val() && _.input.val().match(/\d/g)) {
                var value = Math.min(_.get().maxvalue, Math.max(1, parseInt(_.input.val())));
                if (_.get().value != value)
                    _.call('change', { value: value });
            } else _.input.val(_.get().value);
        };
    });
})(VJ, VJ.view, jQuery);