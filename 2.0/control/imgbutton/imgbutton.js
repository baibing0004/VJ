(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || '<div class="p_imgbutton"><img></img></div>', vm || {}]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.onLoad = function (node) {
            
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case "click":
                        _.node.on('click','img',function(e){
                            _.call('click');
                        });
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                __.onLoad(node);
            });

        };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'src':
                        _.node.find('img').attr('src',v);
                        break;
                }
            });
        };
    });
})(VJ, VJ.view, jQuery);