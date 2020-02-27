(function (V, W, $) {
    V.registScript(function (path, content, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<ul class="p_navTab"></ul>', vm || {}]]);
            __.content = content || '<li data_navindex="{index}"><span class="p_brandsTab"><sub>{name}</sub></span></li>';
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.fill = function () {
            return { value: _.node.children('li.p_active').attr('data_navindex'), activeNode: _.node.children('li.p_active:first') };
        };
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'change':
                        _.node.on('click', 'li', function (e) {
                            var li = $(this);
                            if (li.attr('data_navindex') != (_.vm.get().value + '')) {
                                _.call('change', { value: li.attr('data_navindex') });
                                _.render({ value: li.attr('data_navindex') });
                            }
                            V.stopProp(e);
                            V.cancel(e);
                        })
                        break;
                    case 'click':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        _.render = function (data) {
            data = __.render(data);
            var setIndex = function (index) {
                _.node.children('li.p_active').removeClass('p_active');
                if (_.node.children('li[data_navindex="' + index + '"]').length > 0) _.node.children('li[data_navindex="' + index + '"]').addClass('p_active');
            };
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'values':
                        var sb = V.sb();
                        V.each(v, function (v2) {
                            sb.appendFormat(__.content, v2);
                        }, function () {
                            _.node.empty().append(sb.clear());
                            sb = null;
                            setIndex(data.value);
                        });
                        break;
                    case 'value':
                        setIndex(v);
                        break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);