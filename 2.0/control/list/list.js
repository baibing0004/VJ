(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<ul class="p_list_contain"></ul>', vm || { data: { columns: {}, nodata: '没有找到任何数据', key: ''}}]]);
            __.values = [];
            __.onLoad = _.onLoad;
            __.render = _.render;
            __.replaceNode = _.replaceNode;
        }
        _.replaceNode = function () {
            __.innerhtml = _.node.html();
            _.content = '<li data-index="{_index}">' + __.innerhtml + '</li>';
            __.replaceNode.apply(_, arguments);
        };
        _.onLoad = function (node) {
            _.body = node;
            node.empty();
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
                        break;
                    case 'click':
                        _.body.on('click', 'a,input,.click', function (e) {
                            var _this = $(this);
                            console.log(_this.attr('vid'));
                            console.log(__.values);
                            var li = $(_this.parents('li[data-index]').get(0));
                            _.call('click', { e: e, value: __.values[li.attr('data-index')], vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name') });
                            V.stopProp(e);
                            return e.target.nodeName != 'A';
                        });
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        _.fill = function () { return { ids: (function () { var sb = []; _.body.find(':checked[value]').each(function (i, v) { sb.push(v.getAttribute('value')); }); return sb.join(';'); })()} };
        _.render = function (data) {
            var rebuild = false;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'removevalue':
                        _.body.children('li[data-index="' + v._index + '"]').remove();
                        __.values = __.values.splice(v._index, 1);
                        var i = 0;
                        V.each(__.values, function (v2) {
                            v2._index = i;
                            _.body.children('li:eq(' + i + ')').attr('data-index', i);
                            i++;
                        }, function () {
                            _.vm.data.values = __.values;
                        });
                        break;
                    case 'addvalue':
                    case 'addvalues':
                    case 'values':
                        console.log('hear');
                        if (k.toLowerCase() == 'values') __.values = [];
                        if (!V.isArray(v)) v = [v];
                        if (_.body.children('li.nodata').length > 0) { _.body.children('li.nodata').remove(); }
                        if (v.length == 0 && k.toLowerCase() == 'values' && _.get().nodata) {
                            _.body.html('<li class="nodata">' + _.get().nodata + '</li>');
                        } else {
                            var sb = VJ.sb();
                            V.each(v, function (v2) {
                                v2._index = __.values.length;
                                __.values.push(V.merge({},v2));
                                sb.appendFormat(_.content, v2);
                            }, function () {
                                _.vm.data.values = __.values;
                                if (k.toLowerCase() == 'values') _.body.empty();
                                _.body.append(sb.clear());
                                _.body.children('li:even').addClass('p_li_even');
                                _.body.children('li:odd').addClass('p_li_odd');
                                _.body.children('li').off('mouseenter').off('mouseover').off('mouseleave').hover(
                                    function (e) {
                                        var _this = $(this).addClass('p_list_hover');
                                        var li = _this;
                                        _this = _this.find('.click:first');
                                        _.call('hover', { e: e, hover: true, value: __.values[li.attr('data-index')], vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name') }, true);
                                    },
                                    function (e) {
                                        var _this = $(this).removeClass('p_list_hover');
                                        var li = _this;
                                        _this = _this.find('.click:first');
                                        _.call('hover', { e: e, hover: false, value: __.values[li.attr('data-index')], vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name') }, true);
                                    }
                                );
                                sb = null;
                                console.log(__.values[__.values.length - 1]);
                                if (data.select)
                                    _.body.children('li:eq(' + data.select + ')').addClass('active').siblings().removeClass('active');
                            });
                        }
                        break;
                    case 'value':
                        console.log(v);
                        if (V.isValid(v._index)) {
                            __.values[v._index] = V.merge({}, v);
                            _.body.children('li:eq(' + v._index + ')').html(V.format(__.innerhtml, v));
                        } else v._index = 0;
                        _.body.children('li:eq(' + v._index + ')').addClass('active').siblings().removeClass('active');
                        _.body.children('li:eq(' + v._index + ')').focus();
                        break;
                    case 'select':
                        _.body.children('li:eq(' + (v - 1) + ')').addClass('active').siblings().removeClass('active');
                        break;
                }
            }, function () {
                data = __.render(data);
            });
        }
    });
})(VJ, VJ.view, jQuery);