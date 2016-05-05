(function (V, W, $) {
    //实现按照columns{列值:{name:'列名',input:checkbox/radiobox}}为基本填充规则的列定义
    V.registScript(function (path, content, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<div class="p_table_contain"><div class="p_table_titleback"><div class="p_table_title"></div></div><table class="p_table"><thead></thead><tbody></tbody></table></div>', vm || { data: { columns: {}, nodata: '没有找到任何数据', key: '' } }]]);
            __.content = content || '<td></td>';
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.onLoad = function (node) {
            _.head = node.find('thead');
            _.body = node.find('tbody');
            _.title = node.find('div.p_table_title');
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
                        break;
                    case 'click':
                        _.head.on('change', 'input', function (e) { V.stopProp(e); });
                        _.body.on('change', 'input', function (e) { V.stopProp(e); });
                        _.body.on('click', 'a,input,.click', function (e) { var _this = $(this); _.call('click', { e: e, vid: _this.attr('vid') || _this.val() || _this.attr('href'), name: _this.attr('name') }); V.stopProp(e); return e.target.nodeName != 'A'; });
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        _.fill = function () { return { ids: (function () { var sb = []; _.body.find(':checked[value]').each(function (i, v) { sb.push(v.getAttribute('value')); }); return sb.join(';'); })() } };
        _.render = function (data) {
            data = __.render(data);
            var rebuild = false;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'key':
                        if (_.title.length > 0) { _.title.html(v); }
                        break;
                    case 'columns':
                        var sb = V.sb(), sb2 = V.sb(), length = 0;
                        V.forC(v, function (k2, v2) {
                            sb.append('<td class="p_table_' + k2 + '">' + (typeof (v2) == 'string' ? v2 :
                                (function () {
                                    switch (v2.input) {
                                        case 'checkbox':
                                            return '<input type="checkbox" name="all" value=""/>';
                                        case 'radiobox':
                                        default:
                                            return v2.name;
                                    }
                                })()) + '</td>');
                            sb2.append('<td class="p_table_' + k2 + '">' + (typeof (v2) == 'string' ? ("{" + k2 + "}") : (function () {
                                switch (v2.input) {
                                    case 'checkbox':
                                        return '<input type="checkbox" name="' + k2 + '" value="{' + k2 + '}"/>';
                                    case 'radiobox':
                                        return '<input type="radio" name="' + k2 + '" value="{' + k2 + '}"/>';
                                    default:
                                        return '';
                                }
                            })()) + '</td>');
                            length++;
                        }, function () {
                            _.head.html(V.format("<tr>{tr}</tr>", { tr: sb.clear() })).on('click', 'input', function (e) {
                                var all = $(this);
                                var val = V.getChecked(all);
                                _.body.find(':checkbox').each(function () {
                                    V.setChecked($(this), val);
                                });
                                _.call('click', { e: e, vid: val, name: all.attr('name') || 'all' });
                                V.stopProp(e);
                            });
                            _.content = V.format("<tr>{tr}</tr>", { tr: sb2.clear() });
                            sb = null;
                            sb2 = null;
                            rebuild = true;
                            __.columnlength = length;
                        }, true);
                        break;
                    case 'values':
                        if (_.head.find(':checked').length > 0) {
                            V.setChecked(_.head.find(':checked'), false);
                        }
                        rebuild = true;
                        break;
                }
            }, function () {
                if (!rebuild) return;
                _.vm.data.ids = '';
                if (_.get().values && V.isArray(_.get().values)) {
                    if (_.get().values.length == 0) {
                        _.body.html('<tr><td class="p_table_nodata" colspan="' + __.columnlength + '">' + _.get().nodata + '</td></tr>');
                    } else {
                        var sb = VJ.sb();
                        V.each(_.get().values, function (v) {                           
                            sb.appendFormat(_.content, v);
                        }, function () {
                            _.body.html(sb.clear());
                            if (_.events.hover) {
                                _.body.find('tr').hover(
                                function (e) { $(this).addClass('p_table_hover'); _.call('hover', { e: e, hover: true }) },
                                function (e) { $(this).removeClass('p_table_hover'); _.call('hover', { e: e, hover: false }) });
                            }
                            sb = null;
                        });
                    }
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);