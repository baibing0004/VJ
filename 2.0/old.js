if (!V._V_Part_Map) {
    V._V_Part_Map = [];
}
V.part = function(url, node, mode, callback) {
    var parts = V._V_Part_Map;
    if (!V.isValid(node)) {
        node = $(document.createDocumentFragment());
        node.appendTo($(document.body));
    }
    if ($(node).get(0).tagName.toLowerCase() == "iframe") {
        /* 在iframe中加载url 指定的网页内容*/
        return $(node).attr("src", url);
    } else if (V.getValue(mode, '') == "iframe") {
        //动态创建iframe,追加到指定的node内
        return $(node).append("<IFRAME class=g_iframe border=0 marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=no allowTransparency=true src=\"" + url + "\"></IFRAME>");
    } else if (V.getValue(mode, '') == 'jsonp') {
        var randomid = Math.round(Math.random() * 100000000);
        node = $(node).hide();
        parts[randomid] = function(html) {
            html = decodeURIComponent(html);
            delete parts[randomid];
            node.append(html).show();
            if (callback) callback();
        };
        V.getRemoteJSON(url.replace(/\.html/g, ".jnp") + (url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._V_Part_Map[' + randomid + ']');
    } else {
        node = $(node);
        //一旦有 callback就是 post了
        window.setTimeout(function() {
            node.hide().load(url, function() {
                window.setTimeout(function() {
                    if (!(node.hasClass('ui-dialog-content') || node.hasClass('g_hide'))) {
                        node.show();
                    }
                }, 1);
                if (callback) callback();
            });
        }, 1);
        //普通元素
        return node;
        // return $(node).load(url,null,callback);
    }
};

//使用eval方式生成对象，要求传入的为类本身 建议不使用
V.create = function(type, args) {
    if (typeof(type) == 'function') {
        args = V.isArray(args) ? args : [args];
        var ret = '(new type(';
        if (V.isArray(args)) {
            for (var i in args) {
                ret += 'args[' + i + '],'
            }
            if (args.length > 0) {
                ret = ret.substr(0, ret.length - 1);
            }
        }
        return eval(ret + '))');
    } else V.showException('请传入类定义');
};