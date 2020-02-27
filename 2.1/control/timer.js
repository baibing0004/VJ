(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<span></span>', vm || {}]]);
            __.render = _.render;
            __.onLoad = _.onLoad;
            __.replaceNode = _.replaceNode;
            __.step = 0;
        }
        _.replaceNode = function () {
            //必须覆盖这个方法否则_.node就是替换后的了
            __.content = _.node.html() || path;
            _.node.empty();
            __.replaceNode.apply(_, arguments);
        };
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k) {
                    case 'end':
                    case 'load':
                        break;
                    default:
                        _.bindEvent(node, k, v);
                        break;
                }
            }, function () { __.onLoad(node); }, true);
        };
        _.fill = function () {
            if (_.get().value && _.get().value.add) {
                var leftTime = _.get().value.getTime() - (new Date().getTime() - __.step);
                var leftsecond = parseInt(leftTime / 1000);
                var ret = {
                    dd: Math.floor(leftsecond / 86400),
                    hh: Math.floor((leftsecond / 3600) % 24),
                    mm: Math.floor((leftsecond / 60) % 60),
                    ss: Math.floor(leftsecond % 60)
                };
                ret.hh = ret.hh < 10 ? ("0" + ret.hh) : ret.hh;
                ret.mm = ret.mm < 10 ? ("0" + ret.mm) : ret.mm;
                ret.ss = ret.ss < 10 ? ("0" + ret.ss) : ret.ss;
                return ret;
            } else return {};
        };
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (key, value) {
                switch (key) {
                    case 'value':
                        if (typeof (value) == 'string') {
                            V.tryC(function () {
                                value = new Date(Date.parse(value.replace(/-/g, "/")));
                            });
                        } else if (!value.add) {
                            V.showException('timer 这不是个正经的时间串' + value);
                        }
                        _.get().value = value;
                        if (!_.id) {
                            _.id = window.setInterval(_.loop, 500);
                        }
                        break;
                    case 'now':
                        if (typeof (value) == 'string') {
                            V.tryC(function () {
                                value = new Date(Date.parse(value.replace(/-/g, "/")));
                            });
                        } else if (!value.add) {
                            V.showException('timer 这不是个正经的时间串' + value);
                        }
                        //获取时间差
                        __.step = new Date().getTime() - value.getTime();
                        break;
                    case "stop":
                        if (_.id) {
                            window.clearInterval(_.id);
                            _.id = null;
                        }
                        break;
                }
            });
        }
        _.loop = function () {
            if (!_.get().value || !_.get().value.add || new Date() > _.get().value) {
                if (_.id) {
                    window.clearInterval(_.id);
                    _.id = null;
                }
                _.node.html('');
                _.call("end");
            } else {
                _.node.html(V.format(__.content, _.fill()));
            }
        };
    });
})(VJ, VJ.view, jQuery);