(function (V, W, $) {
    V.registScript(function (middler, path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [middler.getTypeByAppName('VESH.view', 'textbox'), [V.getValue(path, '<span><span style="display:none;"></span><textarea></textarea></span>'), V.getValue(vm, {
                data: { rows: '10', cols: '60' }
            })]]);
            __.render = _.render;
            __.onLoad = _.onLoad;
        }
        _.onLoad = function (node) {
            __.onLoad(node);
            _.txt = node.find('span:first');
            _.input = node.find('textarea:first');
            V.forC(_.events, function (k, v) {
                switch (k) {
                    case 'error':
                        if (_.get().validate) {
                            _.validate(_, _.input);
                        }
                        break;
                    default:
                        _.bindEvent(_.input, k, v);
                        break;
                }
            }, null, true);
        };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (key, value) {
                switch (key) {
                    case 'rows':
                        _.input.attr('rows', value);
                        delete data[key];
                        break;
                    case 'cols':
                        _.input.attr('cols', value);
                        delete data[key];
                        break;
                    case 'value':
                        _.input.scrollTop(0)
                        break;
                }
            });
            return data;
        };
    });
})(VJ, VJ.view, VJ.middler, jQuery);