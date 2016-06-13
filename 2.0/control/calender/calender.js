(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<input type="text"/>', vm || { data: { dateFormat: 'yy-mm-dd', defaultDate: null}}]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'change':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                __.onLoad(node);
                if (node.datepicker) {
                    node.datepicker({
                        changeMonth: true,
                        defaultDate: _.get().defaultDate,
                        dateFormat: _.get().dateFormat,
                        onSelect: function (text, inst) { _.call('change', { value: text }); }
                    });
                }
            });
        };
        _.fill = function () { return { value: _.node.val() }; };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'value':
                        _.node.val(v ? v : '');
                        if (V.isValid(v)) {
                            _.node.datepicker('setDate', v);
                        }
                        break;
                    case 'mindate':
                        _.node.datepicker("option", "minDate", v);
                        _.node.datepicker('setDate', new Date());
                        break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);