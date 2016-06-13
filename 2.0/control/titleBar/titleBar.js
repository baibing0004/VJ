(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<div class="titleBar"></div>', vm || {}]]);
            __.render = _.render;
            __.onLoad = _.onLoad;
        }
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'left':
                    case 'middler':
                    case 'right':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node); });
        };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'left':
                        _.node.append('<div class="titleBar-left">' + v + '</div>');
                        _.node.find('.titleBar-left').on('click', function () {
                            _.call('left');
                        });
                        break;
                    case 'middler':
                        var as = v.split(';'), html = '';

                        for (var i = 0; i < as.length; i++) {
                            html += '<a data-index="' + i + '">' + as[i] + '</a>';
                        };
                        _.node.append('<div class="titleBar-textButton">' + html + '</div>');
                        console.log(_.node.find('.titleBar-textButton a').length);
                        _.node.find('.titleBar-textButton a').on('click', function () {
                            if (_.node.find('.titleBar-textButton a').length > 1) {
                                var $this = $(this);
                                if ($this.hasClass('active')) { return; }
                                $this.addClass('active').siblings().removeClass('active');
                                _.call('middler', { value: $this.attr('data-index') });
                            }

                        });
                        break;
                    case 'right':
                        _.node.append('<div class="titleBar-rightButton">' + v + '</div>');
                        _.node.find('.titleBar-rightButton').on('click', function () {
                            _.call('right');
                        });
                        break;
                    case 'value':
                        v = v + 1;
                        _.node.find('.titleBar-textButton a:nth-child(' + v + ')').addClass('active').siblings().removeClass('active');
                        break;
                }
            });
            return data;
        };
    });
})(VJ, VJ.view, jQuery);
