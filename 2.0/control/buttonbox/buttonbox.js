(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<div class="p_buttonbox"><div class="p_buttonbox_left"></div><div class="p_buttonbox_right"></div></div>', vm || {}]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.onLoad = function (node) {
            __.left = node.children('div:eq(0)');
            __.right = node.children('div:eq(1)');
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'click':
                        __.right.on('click', function () {
                            _.call('click');
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
                        __.left.html(v);
                        break;
                    case 'buntext':
                        __.right.html(v);
                        break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);