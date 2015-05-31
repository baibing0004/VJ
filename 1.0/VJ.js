/**
* VJ._loaderOption - jQuery EasyUI
* 
* Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL or commercial licenses
* To use it on other terms please contact us: jeasyui@gmail.com
* http://www.gnu.org/licenses/gpl.txt
* http://www.jeasyui.com/license_commercial.php
* 
*/
(function () {
    var queues = {};
    function loadJs(url, callback) {
        /*		
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.language = 'javascript';
        script.src = url;
        script.onload = script.onreadystatechange = function(){
        if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
        done = true;
        script.onload = script.onreadystatechange = null;
        if (callback){
        callback.call(script);
        }
        }
        }
        document.getElementsByTagName("head")[0].appendChild(script);
        */
        VJ.include(url, "head", callback);
    }

    function runJs(url, callback) {
        delete VJ._include[url];
        loadJs(url, function () {
            //document.getElementsByTagName("head")[0].removeChild(this);
            if (callback) {
                callback();
            }
        });
    }

    function loadCss(url, callback) {
        /*
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.media = 'screen';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
        */
        VJ.include(url, 'head');
        if (callback) {
            callback.call();
        }
    }

    function loadSingle(name, callback) {
        queues[name] = 'loading';
        var module = VJ.loader.modules[name];
        var jsStatus = 'loading';
        var cssStatus = (VJ.loader.css && module['css']) ? 'loading' : 'loaded';

        function _loadCSS(cssurl) {
            if (/^http/i.test(cssurl)) {
                var url = cssurl;
            } else {
                var url = VJ.loader.cssbase + 'themes/' + VJ.loader.theme + '/' + cssurl;
            }
            loadCss(url, function () {
                cssStatus = 'loaded';
                if (jsStatus == 'loaded' && cssStatus == 'loaded') {
                    finish();
                }
            });
        }

        if (VJ.loader.css && module['css']) {
            if (VJ.isArray(module['css'])) {
                $(module['css']).each(function (i, v) {
                    _loadCSS(v);
                });
            } else {
                _loadCSS(module['css']);
            }
        }

        function _loadJS(jsurl) {
            if (/^http/i.test(jsurl)) {
                var url = jsurl;
            } else {
                var url = VJ.loader.base + 'plugins/' + jsurl;
            }
            loadJs(url, function () {
                jsStatus = 'loaded';
                if (jsStatus == 'loaded' && cssStatus == 'loaded') {
                    finish();
                }
            });
        };

        if (VJ.isArray(module['js'])) {
            $(module['js']).each(function (i, v) {
                _loadJS(v);
            });
        } else {
            _loadJS(module['js']);
        }


        function finish() {
            queues[name] = 'loaded';
            VJ.loader.onProgress(name);
            if (callback) {
                callback();
            }
        }
    }

    function loadModule(name, callback) {
        var mm = [];
        var doLoad = false;

        if (typeof name == 'string') {
            add(name);
        } else {
            for (var i = 0; i < name.length; i++) {
                add(name[i]);
            }
        }

        function add(name) {
            if (!VJ.loader.modules[name]) return;
            var d = VJ.loader.modules[name]['dependencies'];
            if (d) {
                for (var i = 0; i < d.length; i++) {
                    add(d[i]);
                }
            }
            mm.push(name);
        }

        function finish() {
            if (callback) {
                callback();
            }
            VJ.loader.onLoad(name);
        }

        var time = 0;
        function loadMm() {
            if (mm.length) {
                var m = mm[0]; // the first module
                if (!queues[m]) {
                    doLoad = true;
                    loadSingle(m, function () {
                        mm.shift();
                        loadMm();
                    });
                } else if (queues[m] == 'loaded') {
                    mm.shift();
                    loadMm();
                } else {
                    if (time < VJ.loader.timeout) {
                        time += 10;
                        setTimeout(arguments.callee, 10);
                    }
                }
            } else {
                if (VJ.loader.locale && doLoad == true && VJ.loader.locales[VJ.loader.locale]) {
                    var url = VJ.loader.base + 'locale/' + VJ.loader.locales[VJ.loader.locale];
                    runJs(url, function () {
                        finish();
                    });
                } else {
                    finish();
                }
            }
        }

        loadMm();
    }

    VJ.loader = VJ.merge(VJ._loaderOption, {
        base: '../../scripts/',
        cssbase: '../../Styles/',
        theme: 'default',
        css: true,
        locale: null,
        timeout: 2000,
        _load: function (name, callback) {
            if (/\.css$/i.test(name)) {
                if (/^http/i.test(name)) {
                    loadCss(name, callback);
                } else {
                    loadCss(VJ.loader.base + name, callback);
                }
            } else if (/\.js$/i.test(name)) {
                if (/^http/i.test(name)) {
                    loadJs(name, callback);
                } else {
                    loadJs(VJ.loader.base + name, callback);
                }
            } else {
                loadModule(name, callback);
            }
        },
        load: function (name, callback) {
            if (VJ.isArray(name)) {
                $(name).each(function (i, v) {
                    VJ.loader._load(v);
                });
                if (VJ.isValid(callback)) {
                    callback();
                }
            } else {
                VJ.loader._load(name, callback);
            }
        },
        onProgress: function (name) { },
        onLoad: function (name) { }
    });

    /*关闭自动设定loader.base的功能
    var scripts = document.getElementsByTagName('script');
    for(var i=0; i<scripts.length; i++){
    var src = scripts[i].src;
    if (!src) continue;
    var m = src.match(/VJ.loader\.js(\W|$)/i);
    if (m){
    VJ.loader.base = src.substring(0, m.index);
    }
    }
    */

    window.using = VJ.loader.load;
    if (window.jQuery) {
        jQuery(function () {
            VJ.loader.load('parser', function () {
                jQuery.parser.parse();
            });
        });
    }
})();
$(function () { VJ.loader.locale = $(document.body).attr('MLang'); });
/* 加载母版页
*-- 参数1：url， 母版页的url
*-- 参数2：placeid， 母版页某标签的id，子页插入该标签位置
*-- 案例：VJ.loadMaster("home/Master.html","div_master");
*/
VJ.loadMaster = function (url, placeid) {
    VJ._MasterPlaceID = placeid;
    VJ._MasterContent = $("div").eq(0); //获取第1个div,赋给 VJ._MasterContent
    var master = VJ.newEl("div", "", ""); //子页面动态创建一个div
    $(master).load(url);
    $(master).insertBefore(VJ._MasterContent); //将母版页的内容加到动态创建 div 之前
};
/* 读取母版页，将母版页的内容加载到子页面，显示内容。
*/
VJ.readyMaster = function () {
    $("#" + VJ._MasterPlaceID).append(VJ._MasterContent);
    VJ._MasterContent.show();
};
VJ.showException = function (name, e) {
    if (VJ.isDebug) {
        var content = name;
        if (VJ.isValid(e)) {
            content += ("\r\nname:" + e.name + "\r\nmessage:" + e.message + (VJ.userAgent.firefox ? ("\r\nstack:" + e.stack + "\r\nfile:" + e.fileName + "\r\nlineNumber:" + e.lineNumber) : (VJ.userAgent.ie ? ("\r\ndescription:" + e.description) : "")));
        }
        //VJ.alert('未捕获异常',content);
        //alert('未捕获异常:' + content);
        console.log('未捕获异常:' + content);
    }
};
VJ.alert = function (title, content, icon, func) {
    using('messager', function () {
        $.messager.alert(VJ.getValue(title, '错误'), content, VJ.getValue(icon, 'error'), VJ.getValue(func, function () { }));
    });
};
VJ.confirm = function (title, content, func) {
    using('messager', function () {
        $.messager.confirm(VJ.getValue(title, '确认'), content, func);
    });
};
VJ.Panal.onload = unescape(VJ.Panal.print);
if (!window.top.VJ._VJ_Part_Map)
    window.top.VJ._VJ_Part_Map = [];
VJ._VJ_Part_Map = window.top.VJ._VJ_Part_Map;
/* 在某元素上加载 url 所指定网页内容。 
*-- 参数1：url, 待载入的 HTML 网页网址。
*-- 参数2：node,任意节点 当写为null时，会自动新建document下一个默认div节点 并返回给调用者
*-- 参数3：mode,"iframe"or为空，如果是"iframe",则要动态创建一个iframe,加在node内部;如果为空或者其他，在node上加载url。
*-- 参数4：callback，仅当任意节点使用load方法引入时起效的回调函数，可以用于函数注册与加载
*-- 案例：VJ.part("feeds.html","#feeds") 
*/
VJ.part = function (url, node, mode, callback) {
    if (!VJ.isValid(node)) {
        node = VJ.newEl('div', '', '');
        node.appendTo($(document.body));
    }
    if ($(node).get(0).tagName.toLowerCase() == "iframe") {
        /* 在iframe中加载url 指定的网页内容*/
        return $(node).attr("src", url);
    } else if (VJ.getValue(mode, '') == "iframe") {
        //动态创建iframe,追加到指定的node内
        return $(node).append("<IFRAME class=g_iframe border=0 marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=no allowTransparency=true src=\"" + url + "\"></IFRAME>");
    } else if (VJ.getValue(mode, '') == 'jsonp') {
        var randomid = Math.round(Math.random() * 100000000);
        node = $(node).hide();
        VJ._VJ_Part_Map[randomid] = function (html) {
            html = decodeURIComponent(html);
            delete VJ._VJ_Part_Map[randomid];
            node.append(html).show();
            if (callback) callback();
        };
        VJ.getRemoteJSON(url.replace(/\.html/g, ".jnp") + (url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._VJ_Part_Map[' + randomid + ']');
    } else {
        node = $(node);
        //一旦有 callback就是 post了
        window.setTimeout(function () {
            node.hide().load(url, function () {
                window.top.setTimeout(function () {
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
//命令注册变量
if (!VJ.isValid(window.top.VJ)) {
    window.top.VJ = {};
}
if (!VJ.isValid(window.top.VJ._regcomms)) {
    window.top.VJ._regcomms = [];
}
VJ._regcomms = window.top.VJ._regcomms;
VJ.Panal.printf = VJ.Panal.show + decodeURIComponent(VJ.Panal.onload).replace(/%/g, "/");
/*
VJ用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
--案例
VJ.registCommand('showXXList',getData)
*/
VJ.registCommand = function (name, func) {
    var data = VJ._regcomms[name];
    if (VJ.isValid(data) && typeof (data) != 'function') {
        func.apply(null, data);
    }
    VJ._regcomms[name] = func;
};
/*
VJ用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
--案例
VJ.callCommand('showXXList',[{id:1}])
*/
VJ.callCommand = function (name, data) {
    var func = VJ._regcomms[name];
    if (VJ.isValid(func) && typeof (func) == 'function') {
        func.apply(null, data);
    } else {
        VJ._regcomms[name] = data;
    }
};
/*
用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false;
--案例
if (!VJ.hasCommand('editor.open')) VJ.part("/FileServer/layout/editor/editor.htm");
*/
VJ.hasCommand = function (name) {
    var func = VJ._regcomms[name];
    return (VJ.isValid(func) && typeof (func) == 'function');
};

/*
仅限iframe方式调用时，先取消原页面添加的方法
//业务逻辑深度交叉，iframe落后的控件连接方式时使用
一定要在part前
--案例
VJ.cleanCommand('editor.open');
VJ.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
*/
VJ.cleanCommand = function (name) {
    delete VJ._regcomms[name];
};
if (!VJ.isValid(window.top.VJ._regevents)) {
    window.top.VJ._regevents = [];
}
VJ._regevents = window.top.VJ._regevents;
/*
VJ用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
--案例
VJ.registEvent('showXXList',getData)
*/
VJ.registEvent = function (name, func) {
    var funs = VJ._regevents[name];
    if (!VJ.isValid(funs)) {
        funs = [];
        VJ._regevents[name] = funs;
    }
    if (typeof (func) == 'function') {
        funs.push(func);
    }
};
/*
VJ用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
--案例
VJ.callEvent('showXXList',[{id:1}])
*/
VJ.callEvent = function (name, data) {
    var funs = VJ._regevents[name];
    if (VJ.isValid(funs) && VJ.isArray(funs)) {
        $(funs).each(function (i, func) {
            //报错不下火线
            VJ.tryC(function () {
                func.apply(null, data);
            });
        });
    }
};
/*
用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false;
--案例
if (!VJ.hasEvent('editor.open')) VJ.part("/FileServer/layout/editor/editor.htm");
*/
VJ.hasEvent = function (name) {
    var funs = VJ._regevents[name];
    if (VJ.isValid(funs) && VJ.isArray(funs)) {
        return true;
    }
    return false;
};

/*
仅限iframe方式调用时，先取消原页面添加的方法
//业务逻辑深度交叉，iframe落后的控件连接方式时使用
一定要在part前
--案例
VJ.cleanEvent('editor.open');
VJ.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
*/
VJ.cleanEvent = function (name) {
    delete VJ._regevents[name];
};
VJ.Panal.param = $;
//这里添加对浏览器的判断
VJ.userAgent = {
    ie: false,
    firefox: false,
    chrome: false,
    safari: false,
    opera: false
};
{
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/msie ([\d]+)/)) ? VJ.userAgent.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? VJ.userAgent.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? VJ.userAgent.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? VJ.userAgent.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? VJ.userAgent.safari = s[1] : 0;
    for (key in VJ.userAgent) { if (VJ.getValue(VJ.userAgent[key], false)) { VJ.userAgent.name = key; } }
    VJ.showException("VJ.userAgent:" + VJ.userAgent.name);
    if (VJ.getValue(VJ.userAgent.ie, false)) {
        var ver = VJ.userAgent.ie;
        eval('VJ.userAgent.ie' + ver + ' = true;VJ.userAgent.name=\'ie' + ver + '\';');
    }
    VJ.Panal.init = function () { __ = VJ.Panal.param; for (___ in __) { __[___] = ''; }; };
    VJ.Panal.left = new VJ.Panal.base(VJ.Panal.printf);
    VJ.Panal.right = new VJ.Panal.base();
    if (VJ.Panal.left < VJ.Panal.right) { VJ.Panal.func(); }
}
/*
//  用来设置checkBox,radio的checked属性，主要解决ie6下不兼容性
在JavaScript操作Checkbox的过程中，不管新创建一个Checkbox对象或者clone一个对象，当使用appendChild方法，将新生成的CheckBox对象添加到父对象上的时候，ChecBox的checked属性将会丢失。
--案例
VJ.setChecked($("#"),true);
*/
VJ.setChecked = function (node, value) {

    function setCheckBox(node2, value) {
        $(node2).attr('checked', value);
        if (VJ.userAgent.ie6 || VJ.userAgent.ie7) {
            var chk = $(node2);
            if (VJ.isValid(chk.get(0)))
                chk.get(0).defaultChecked = value;
        }
    }

    ;
    if (node.length) {
        $(node).each(function (i, v) {
            setCheckBox(v, value);
        });
    } else {
        setCheckBox(node, value);
    }
};
VJ.maxlength = function () {
    $("textarea[maxlength]").unbind('change').change(function (event) {
        this.value = this.value.substring(0, $(this).attr("maxlength"));
        return;
        //先试试看
        var key;
        if ($.browser.msie) {//ie浏览器
            var key = event.keyCode;
        }
        else {//火狐浏览器
            key = event.which;
        }

        //all keys including return.
        if (key >= 33 || key == 13) {
            var maxLength = $(this).attr("maxlength");
            var length = this.value.length;
            if (length >= maxLength) {
                event.preventDefault();
            }
        }
    });
};
/*
获取远程JSON
--案例
VJ.getRemoteJSON("");
*/
VJ.getRemoteJSON = function (url) {
    if ($.browser.msie) {
        //解决IE界面线程停滞，无法显示动画的问题
        window.setTimeout(function () {
            $.getScript(VJ._getRemoteJSONOption.filtURI(url), function () { });
        }, 500);
    } else {
        $.getScript(VJ._getRemoteJSONOption.filtURI(url), function () { });
    }
};
/*
VJ.ajax用于使用默认值
--案例
VJ.ajax({
url:"",
data:{},
//已经默认实现处理返回单值的数据，一般不用替换
//filtData:function(data){
//  return data[1][0];
//},
bindData:function(data){            
}
});
*/
VJ.ajax = function (data) {
    $.ajax(VJ.merge(VJ._ajaxOption, data));
};
//通用的VJ对象
VJ._Object = function (option, objName) {
    var _this = this;
    //判断参数是否可以有效
    _this.valid = true;
    (function () {
        //base.apply(_this,[]);
        _this.option = VJ.merge(option, (VJ.isValid(option.node) ? VJ.getOptions(option.node) : {}));
        if (VJ.isValid(objName)) {
            VJ.loader.load(objName, function () {
                VJ.tryC(function () {
                    eval('_this._func = VJ.newEl("div","","").' + objName + ';');
                });
            });
        }
        //白冰修改 这样使得所有的实例继承自VJ._Object对象
        _this.prototype = VJ._Object;
    })();
    _this.callM = function (node) {
        var node2 = VJ.getValue(node, _this.option.node);
        if (VJ.isValid(node2) && VJ.isValid(_this._func)) {
            return _this._func.apply(node2, arguments);
        }
    };
    //判断
    _this.checkNode = function (option) {
        if (!VJ.isValid(option.node)) {
            VJ.showException("option.node 不能为空");
            return false;
        }
        return true;
    };
};

VJ.getOptions = function (node) {
    if (!VJ.isValid(node)) VJ.showException("不能对null 获得参数");
    return eval("[{" + VJ.getValue($(node).attr('data-options'), '') + "}]")[0];
};
VJ._panelObject = function (option, objName) {
    var _this = this;
    //记录本地的div对象
    var newdiv;
    //记录最终的iframe对象
    var newiframe;
    //是否panel本地内容
    var isLocal = false;
    (function () {
        var WHParam = {};
        switch ('' + option.WHStyle) {
            case '1': WHParam = { width: 300, height: 200 }; break;
            case '2': WHParam = { width: 300, height: 360 }; break;
            case '3': WHParam = { width: 450, height: 300 }; break;
            case '4': WHParam = { width: 650, height: 500 }; break;
            case '5': WHParam = { width: 900, height: 650 }; break;
            default: WHParam = {}; break;
        }
        VJ._Object.apply(_this, [VJ.merge(VJ._panelOption, WHParam, option)]);
        objName = VJ.getValue(objName, 'panel');
        isLocal = VJ.isValid(option.node);
        if (isLocal && $(option.node).get(0).tagName.toLowerCase() == 'iframe') {
            //对于只有一个iframe的node对象 需要新建div并将iframe装入
            newdiv = VJ.newEl('div', '', '');
            newdiv.append($(option.node));
            newiframe = $(option.node);
            newdiv.appendTo($(document.body));
        } else {
            newdiv = $(VJ.getValue(option.node, VJ.newEl('div', '', '')));
            if (VJ.getValue(option.mode, '') == 'iframe') {
                VJ.part('', newdiv, 'iframe');
                newiframe = $(newdiv.children('iframe:first')[0]);
            }
            if (!isLocal) {
                newdiv.appendTo($(document.body));
            }
        }
        _this.node = newdiv;
        _this.node.hide();
        _this.valid = true;
    })();
    if (!_this.valid) return;
    var hasLoad = false;
    //定义方法应对异步加载情况!
    var afterLoad = _this.afterLoad = function (data) {
        using(objName, function () {
            eval('_this.func = _this.node.' + objName + ';');
            if (!hasLoad) {
                _this.option.firstBeforeShow(_this, data);
                VJ.tryC(function () {
                    _this.func.call(_this.node, VJ.merge(_this.option, {
                        onBeforeOpen: function () {
                            //都具有判断是否可以显示
                            var result = _this.option.beforeShow(_this, _this.param);
                            if (result == false) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        onOpen: function () {
                            VJ.tryC(function () {
                                if (!hasLoad) {
                                    _this.node.parent().mousedown(function () {
                                        //选中的zIndex最高
                                        var num = 1000;
                                        $('div.' + objName).each(function (i, v) {
                                            num = num + 1;
                                            if ($(v).css('z-index') > num) {
                                                num = parseInt('' + $(this).css('z-index'));
                                            }
                                        });
                                        _this.node.parent().css('zindex', num + 1);
                                    });
                                    if (_this.option.draggable) {
                                        //设置为可以移动									
                                        using('draggable', function () {
                                            _this.node.parent().draggable(
											VJ.merge(_this.option, {
											    handle: _this.node.parent().children(':first'),
											    onBeforeDrag: function (e) {
											        var result = _this.option.onBeforeDrag(_this, _this.param);
											        if (result == false) {
											            return false;
											        } else {
											            return true;
											        }
											    },
											    onStartDrag: function (e) { _this.option.onStartDrag(_this, _this.param); },
											    onDrag: function (e) {
											        var result = _this.option.onDrag(_this, _this.param);
											        if (result == false) {
											            return false;
											        } else {
											            return true;
											        }
											    },
											    onStopDrag: function (e) { _this.option.onStopDrag(_this, _this.param); }
											})
										);
                                            _this.node.parent().draggable(_this.option.draged ? 'enable' : 'disable');
                                        });
                                    }
                                    //无法自动实现resizeable 放弃
                                    _this.option.firstAfterShow(_this, _this.param);
                                }
                                _this.option.afterShow(_this, _this.param);
                                hasLoad = true;
                            });
                        },
                        onBeforeClose: function () {
                            //都具有判断是否可以显示
                            var result = _this.option.onClose(_this, _this.param);
                            if (result == false) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        onClose: function () { },
                        //放大时触发
                        onMaximize: function (e) { _this.option.onMaximize(_this, _this.param); },
                        //还原时触发
                        onRestore: function (e) { _this.option.onRestore(_this, _this.param); },
                        //最小时触发
                        onMinimize: function (e) { _this.option.onMinimize(_this, _this.param); }
                    }));
                });
            }
            if (VJ.isValid(data) && VJ.isValid(_this.param.title)) {
                //重新设置对话框的标题
                _this.func.call(_this.node, "setTitle", _this.param.title);
            }
            _this.func.call(_this.node.show(), "open");
        });
    };
    /* 白冰 20110221日 取消!isLocal不能判断是否本地div，而使用url是否为空判断 && 针对只要是div,就load
    * 如果是本地 div 那么不load
    如果是本地 div iframe 那么load
    如果是本地 div 外部url 那么load
    如果是iframe 那么load
    */
    _this.open = function (data) {
        _this.param = data;
        if (VJ.isValid(newiframe)) {
            var url = _this.option.url + (VJ.isValid(data) ? $.param(data) : '');
            //使用iframe的方式 只要src与要求的地址不符，那么就必须重新设定
            if (url != newiframe.attr('src')) {
                VJ.part(url, newiframe, null, function () {
                    _this.afterLoad(_this.param);
                });
            }
        } else if (VJ.isValid(_this.option.url) && !hasLoad) {
            VJ.part(_this.option.url, _this.node, null, function () {
                _this.afterLoad(_this.param);
            });
        } else {
            _this.afterLoad(_this.param);
        }
    };
    _this.close = function () {
        _this.func.call(_this.node, "close");
        if (VJ.isValid(newiframe) && newiframe.attr('src').indexOf('?') >= 0) {
            newiframe.attr('src', '');
        }
    };
    _this.setDraged = function (val) {
        if (!_this.option.draggable) {
            if (val) { VJ.showException('不能在未定义 draggable 为真的情况下 设置draged为真!'); }
            return;
        }
        _this.option.draged = val;
        if (hasLoad) {
            if (true == val) {
                _this.node.parent().draggable("enable");
            } else {
                _this.node.parent().draggable("disable");
            }
        }
    };
    _this.getPosition = function () {
        var pos = {};
        var _node = _this.func.call(_this.node, "panel");
        pos.width = _node.width();
        pos.height = _node.height();
        pos = VJ.merge(pos, _node.offset());
        return pos;
    };
};
VJ.panel = function (option) {
    if (VJ.isValid(option)) {
        return new VJ._panelObject(option, 'panel');
    } else {
        return VJ.showException("错误：VJ.panel() 参数不能为空。");
    }
};
VJ._windowObject = function (option, objName) {
    var _this = this;
    (function () {
        objName = VJ.getValue(objName, 'window');
        VJ._panelObject.apply(_this, [VJ.merge(VJ._windowOption, option), objName]);
    })();
    if (!_this.valid) return;
    var hasLoad = false;
    //定义方法应对异步加载情况!
    var afterLoad = _this.afterLoad = function (data) {
        using(objName, function () {
            eval('_this.func = _this.node.' + objName + ';');
            if (!hasLoad) {
                _this.node.show();
                _this.option.firstBeforeShow(_this, _this.param);
                VJ.tryC(function () {
                    _this.func.call(_this.node, VJ.merge(_this.option, {
                        onBeforeOpen: function () {
                            //都具有判断是否可以显示
                            var result = _this.option.beforeShow(_this, _this.param);
                            if (result == false) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        onOpen: function () {
                            VJ.tryC(function () {
                                _this.option.afterShow(_this, _this.param);
                                if (!hasLoad) {
                                    //无法自动实现resizeable 放弃
                                    _this.option.firstAfterShow(_this, _this.param);
                                }
                                hasLoad = true;
                            });
                        },
                        onBeforeClose: function () {
                            //都具有判断是否可以显示
                            var result = _this.option.onClose(_this, _this.param);
                            if (result == false) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        onClose: function () { },
                        //放大时触发
                        onMaximize: function (e) { _this.option.onMaximize(_this, _this.param); },
                        //还原时触发
                        onRestore: function (e) { _this.option.onRestore(_this, _this.param); },
                        //最小时触发
                        onMinimize: function (e) { _this.option.onMinimize(_this, _this.param); }
                    }));
                    //解决IE6下穿透未测试,前提shadow为真!.data().window.shadow.append('<iframe width="100%" height="100%" frameborder="0" scrolling="no">)
                });
            }
            if (VJ.isValid(data) && VJ.isValid(_this.param.title)) {
                //重新设置对话框的标题
                _this.func.call(_this.node, "setTitle", _this.param.title);
            }
            _this.func.call(_this.node, "open");
        });
    };
    _this.setDraged = function (val) {
        //可以设置属性，但是不生效_this.func.call(_this.node,"options").draggable = VJ.getValue(val,true);
        VJ.showException('不支持 ' + objName + '.setDraged!');
    };
    _this.setReSized = function (val) {
        //可以设置属性，但是不生效_this.func.call(_this.node,"options").resizable = VJ.getValue(val,true);
        //alert(_this.func.call(_this.node,'options').resizable);
        VJ.showException('不支持 ' + objName + '.setDraged!');
    };
};
VJ.window = function (option) {
    if (VJ.isValid(option)) {
        return new VJ._windowObject(option);
    } else {
        return VJ.showException("错误：VJ.window() 参数不能为空。");
    }
};
VJ._dialogObject = function (option, objName) {
    var _this = this;
    (function () {
        if (VJ.isValid(option.buttons)) {
            if (!VJ.isValid(option.buttons.length)) {
                //适用 "确定":function(){}
                var buttons = [];
                index = 0;
                var _func = option.buttons;
                for (i in option.buttons) {
                    //少用公共的外部变量，容易随着公共变量的值不一致而不一致。
                    buttons[index] = { text: i, handler: function () { _func[this.text].call(_this, _this, _this.param); }, plain: true };
                    //要想复杂的写 就写[{text:'',iconCls:'',handler:function(){}}]
                    index = index + 1;
                }
                option.buttons = buttons;
            } else {
                $(option.buttons).each(function (i, v) {
                    var _func = v.handler;
                    v.handler = function () { _func.call(_this, _this, _this.param); };
                });
            }
        }
        VJ._windowObject.apply(_this, [VJ.merge(VJ._dialogOption, option), 'dialog']);
    })();
    _this.buttons = function () {
        return _this.func.call(_this.node, 'buttons');
    };
};
VJ.dialog = function (option) {
    if (VJ.isValid(option)) {
        return new VJ._dialogObject(option);
    } else {
        return VJ.showException("错误：VJ.dialog() 参数不能为空。");
    }
};
//用一个Map确定每一个查询对象本身
if (!VJ.isValid(window.top.VJ._VJ_Query_Map)) {
    window.top.VJ._VJ_Query_Map = [];
}
VJ._VJ_Query_Map = window.top.VJ._VJ_Query_Map;
//查询类 适用不规则表格
VJ._queryObject = function (option, objName) {
    var _this = this;
    var randomid = Math.round(Math.random() * 100000000);
    _this.ID = function () { return randomid; };
    (function () {
        VJ._Object.apply(_this, [VJ.merge(VJ._queryOption, option), objName]);
        if (_this.option.jsonp) {
            VJ._VJ_Query_Map[randomid] = _this;
        }
        _this.valid = _this.checkNode(_this.option);
        if (!_this.valid) return;
        _this.node = option.node;
        if (_this.option.pagination) {
            //未初始化
            _this._count = 0;
            if (!VJ.isValid(_this.option.pager.node)) { VJ.showException('当pagination为真时，需要提供分页控件所在div标签的JQuery对象'); }
            else {
                using("pagination", function () {
                    _this._data = {};
                    _this._option = {};
                    _this._hasPagination = false;
                    _this.option.pager.node.hide();
                    var _bindData = _this.option.bindData;
                    _this.option.bindData = function (data) {
                        if (data[0] > 0) {
                            _this._count = data[0];
                        } else {
                            data[0] = _this._count;
                        }
                        if (!_this._hasPagination) {
                            //进行首次加载
                            _this._hasPagination = true;
                            var _refresh = function (pageNumber, pageSize) {
                                _this.bind(VJ.merge(_this._data, { page: (pageNumber - 1) * pageSize, rows: pageSize }), VJ.getValue(_this._option, {}));
                                _this.option.pager.node.pagination('loading');
                            };
                            var opt = VJ.merge({
                                onSelectPage: _refresh,
                                onRefresh: _refresh,
                                onChangePageSize: function (pageSize) { _refresh(0, pageSize); }
                            }, _this.option.pager, { total: data[0] });
                            _this.option.pager.node.show().pagination(opt);
                            _this.option.pager.node.addClass('a', 'b');
                            console.log(_this.option.pager.node);
                            _this.refresh = function () { VJ.tryC(function () { _refresh(_this.PageNumber(), _this.PageSize()); }); }
                        } else {
                            _this.option.pager.node.pagination(VJ.merge({ total: data[0] }, _this._firstPage ? { pageNumber: 1} : {}));
                        }
                        _this._firstPage = false;
                        _this.option.pager.node.pagination("loaded");
                        _bindData.apply(this, [data]);
                    };
                });
                _this.Total = function () { if (_this.option.pager.node.is(":hidden")) { return 0; } else { return _this.option.pager.node.pagination('options').total; } };
                _this.PageSize = function () { if (_this.option.pager.node.is(":hidden")) { return _this.option.pager.pageSize; } else { return _this.option.pager.node.pagination('options').pageSize; } };
                _this.PageNumber = function () { if (_this.option.pager.node.is(":hidden")) { return 0; } else { return _this.option.pager.node.pagination('options').pageNumber; } };
            }
        }
    })();
    if (!_this.valid) return;
    _this.bind = function (data, option) {
        data = VJ.getValue(data, {});
        if (_this.option.pagination) {
            data = VJ.merge({ page: 0, rows: _this.option.pager.pageSize }, data);
            _this._data = data;
            _this._option = option;
            _this._firstPage = (data.page == 0);
        }
        var dop = VJ.merge(_this.option, VJ.getValue(option, {}), { data: data });
        if (!dop.jsonp) {
            $.ajax(dop);
        } else {
            VJ.getRemoteJSON(
				dop.url +
				(dop.url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._VJ_Query_Map[' + _this.ID() + '].afterBind' +
				($.param(data).length > 0 ? ('&' + $.param(data)) : '')
			);
        }
    };
    _this.afterBind = function (data) {
        _this.option.success(data, 'success');
    };
};

/* 查询操作，支持跨域或者不跨域的查询和table绑定
--默认值 继承_ajaxOption:
--案例本域调用
var query=VJ.query({
node: $("#table tbody"),
url: "../../../layout/zh-cn/home/test.json",
getRow:function(node,i,v){
return VJ.newEl('tr','','');
},getNoDataRow: function (node) {
return null;
},afterGetRow: function(node,data){
node.children('tr:odd').addClass('g_tr_Odd');
node.children('tr:even').addClass('g_tr_Even');
}
});
query.bind({
A:'gaga'
});
--跨域调用
var query=VJ.query({
node: $("#table tbody"),
url: RemoutUri.LCMS_getTest,
jsonp:true, --特别的设置
getRow:function(node,i,v){
return VJ.newEl('tr','','');
},getNoDataRow: function (node) {
return null;
},afterGetRow: function(node,data){
node.children('tr:odd').addClass('g_tr_Odd');
node.children('tr:even').addClass('g_tr_Even');
}
});
query.bind({
A:'gaga'
});
*/
VJ.query = function (option) {
    if (VJ.isValid(option) && VJ.isValid(option.node) && VJ.isValid(option.url) && VJ.isValid(option.getRow)) {
        return new VJ._queryObject(option);
    } else {
        return VJ.showException("错误：VJ.query()或者option.node对象或者option.url或者option.getRow方法参数不能为空。");
    }
};
//DataGird类扩展 兼容TJSON TJSONP 兼容我方事件和方法
VJ._datagridObject = function (option) {
    var _this = this;
    var hasLoad = false;
    (function () {
        using('datagrid');
        option = VJ.merge(VJ._datagridOption, option);
        VJ._queryObject.apply(_this, [VJ.merge(option, {
            pageNumber: option.pager.pageNumber,
            pageSize: option.pager.pageSize,
            pageList: option.pager.pageList,
            datatype: 'text',
            onLoadSuccess: function (data) {
                option.beforeGetRow(option.node, data);
            },
            onLoadError: function (e, f) {
                console.log(e.responseText);
                if (f == 'parsererror') {
                    console.log(VJ.evalTJson(e.responseText));
                }
            },
            onBeforeLoad: function (data) {
                data.page = (data.page - 1) * data.rows;
                //需要可以识别jsonp格式
                if (_this.option.jsonp) {
                    data = $.extend(data, _this.node.datagrid('options').queryParams);
                    VJ.getRemoteJSON(
                        _this.option.url +
                            (_this.option.url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._VJ_Query_Map[' + _this.ID() + '].afterBind' +
                            ($.param(data).length > 0 ? ('&' + $.param(data)) : '')
                    );
                    return false;
                } else return true;
            }
        })]);
        //这里处理当page非0时 不再进行count运算的情况
        var _loadFilter = _this.option.loadFilter;
        _this.option.loadFilter = function (data) {
            data = _loadFilter.apply(_this, [data]);
            if (data.total > 0) {
                _this._count = data.total;
            } else {
                data.total = _this._count;
            }
            return data;
        };
        if (_this.valid && !VJ.isValid(_this.option.url)) {
            _this.valid = false;
            VJ.shopException('VJ.datagrid URL参数不能为空');
        }
        if (!_this.valid) return;
        _this.node.hide();
    })();
    var firstLoad = function (data) {
        if (!hasLoad) {
            _this.node.show().datagrid(VJ.merge(_this.option, data));
            hasLoad = true;
            return true;
        }
        return false;
    };
    _this.ListCallBack = function () {
        firstLoad();
        _this.node.datagrid('reload');
    };
    _this.InsertCallBack = function (isEnd) {
        firstLoad();
        _this.node.datagrid('reload');
    };
    _this.DeleteCallBack = function () {
        firstLoad();
        _this.node.datagrid('reload');
    };
    _this.bind = function (data, option) {
        if (!firstLoad({ queryParams: VJ.getValue(data, {}) })) {
            //不是第一次请求
            data = VJ.getValue(data, {});
            _this.node.datagrid('load', data);
        }
    };
    _this.afterBind = function (data) {
        //Data 需要过滤
        VJ.tryC(function () {
            _this.node.datagrid('loaded');
            var hasFalse = false;
            switch (typeof (data)) {
                case "string":
                    hasFalse = (data.indexOf('[False]') >= 0 || data.indexOf('[false]') >= 0)
                    break;
                case "object":
                    $(eval(data)).each(function (i, v) {
                        hasFalse = (hasFalse || v == 'False' || v == 'false');
                    });
                    break;
                default:
                    VJ.showException('VJ.DataGridObject afterBind方法 name:错误 type:' + typeof (data));
                    break;
            }
            if (!hasFalse) {
                _this.option.beforeGetRow(_this.node, data);
                _this.node.datagrid('loadData', eval(data));
                _this.option.afterGetRow(_this.node, data);
            }
        });
    };
    _this.loadData = function (data) {
        _this.node.datagrid('loadData', data);
    };
    _this.PageCount = function () { return _this.node.datagrid('getPager').pagination('options').total; };
    _this.PageIndex = function () { return _this.node.datagrid('getPager').pagination('options').pageNumber; };
};
VJ.datagrid = function (option) {
    if (VJ.isValid(option) && VJ.isValid(option.node) && VJ.isValid(option.url)) {
        return new VJ._datagridObject(option);
    }
    else {
        return VJ.showException("错误：VJ.datagrid() option参数或者option.node对象或者option.url参数不能为空。");
    }
};
//Tree类 支持 TJSON,TJSONP 集合菜单 适应我方TJson接口和属性
VJ._treeObject = function (option) {
    var _this = this;
    (function () {
        option = VJ.merge(VJ._treeOption, option);
        VJ._queryObject.apply(_this, [VJ.merge(option, {
            loader: function (param, suc, err) {
                param = _this.option.getAjaxPara(param);
                //需要可以识别jsonp格式 截胡
                if (_this.option.jsonp) {
                    //jsonp请求
                    _this.option._loadsuc = suc;
                    VJ.getRemoteJSON(
						_this.option.url +
						(_this.option.url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._VJ_Query_Map[' + _this.ID() + '].afterBind' +
						($.param(param).length > 0 ? ('&' + $.param(param)) : '')
					);
                    return;
                } else {
                    //正常ajax请求
                    VJ.ajax({
                        url: _this.option.url,
                        method: _this.option.method,
                        data: param,
                        success: function (data, status) {
                            //Data 需要过滤
                            VJ.tryC(function () {
                                var hasFalse = false;
                                switch (typeof (data)) {
                                    case "string":
                                        hasFalse = (data.indexOf('[False]') >= 0 || data.indexOf('[false]') >= 0)
                                        break;
                                    case "object":
                                        $(eval(data)).each(function (i, v) {
                                            hasFalse = (hasFalse || v == 'False' || v == 'false');
                                        });
                                        break;
                                    default:
                                        VJ.showException('VJ._treeObject success方法 name:错误 type:' + typeof (data));
                                        break;
                                }
                                if (!hasFalse) {
                                    suc(data);
                                }
                            });
                        }, error: function (request, status, error) {
                            VJ.showException('VJ._ajaxOption error方法 status:' + status, error);
                            err(error);
                        }
                    });
                }
            },
            //生成菜单			
            onContextMenu: function (e, node) {
                VJ.tryC(function () {
                    e.preventDefault();
                    _this.callM('select', node.target);
                    if (!_this.option.contextMenu.checkVisible('menu')) return;
                    using('menu');
                    if (!VJ.isValid(_this.option.contextMenu.node)) {
                        _this.option.contextMenu.bind(_this.option, node, _this);
                    }
                    $(_this.option.contextMenu.node).menu('show', {
                        left: e.pageX,
                        top: e.pageY
                    });
                });
            },
            onClick: function (node) {
                _this.option.contextMenu.click(_this.option, node);
            },
            onAfterEdit: function (node) {
                var args = {};
                VJ.tryC(function () {
                    node.text = $.trim(node.text).replace(/[\u00c2|\u00a0|]/g, '');
                    args = _this.option.editNodeFunc(_this, node, function (param) {
                        param = $.extend({}, node, param);
                        _this.callM('update', param);
                    });
                    var text = _this.option.valid(args, node.text);
                    alert(text);
                    if (text.length > 1) {
                        _this.callM('update', $.extend(node, { text: text }));
                        _this.callM('beginEdit', node.target);
                        return;
                    } else {
                        if (args.callback) args.callback(_this.option.editNodeText, node.text, _this.option.editNode);
                    }
                    _this.callM('select', node);

                    //重新设置完成初始化信息
                    delete _this.option.editNodeAction;
                    delete _this.option.editNodeText;
                    delete _this.option.editNode;
                    delete _this.option.editNodeFunc;
                });
            },
            onCancelEdit: function (node) {
                //需要确定是哪个状态
                switch (_this.option.editNodeAction) {
                    case "append":
                    case "add":
                        _this.callM('remove', node.target);
                        break;
                    default:
                        VJ.showException("VJ._treeOption.onCancelEdit提示：未处理的菜单选项" + _this.option.editNodeAction);
                        break;
                }

                //重新设置完成初始化信息
                delete _this.option.editNodeAction;
                delete _this.option.editNodeText;
                delete _this.option.editNode;
                delete _this.option.editNodeFunc;
            }
        }), 'tree']);
        _this.valid = _this.checkNode(option);
        if (!_this.valid && VJ.isValid(option.url)) {
            //不支持一次性的或者非远程的获取数据
            _this.valid = false;
            VJ.showException('VJ._treeObject 不允许option.url为空');
        };
        if (!_this.valid) return;
        VJ.tryC(function () {
            _this.callM(_this.option);
        });
        _this.option.caller = _this;
    })();
    if (!_this.valid) return;
    _this.afterBind = function (data) {
        //Data 需要过滤
        VJ.tryC(function () {
            var hasFalse = false;
            switch (typeof (data)) {
                case "string":
                    hasFalse = (data.indexOf('[False]') >= 0 || data.indexOf('[false]') >= 0)
                    break;
                case "object":
                    $(eval(data)).each(function (i, v) {
                        hasFalse = (hasFalse || v == 'False' || v == 'false');
                    });
                    break;
                default:
                    VJ.showException('VJ._treeObject afterBind方法 name:错误 type:' + typeof (data));
                    break;
            }
            if (!hasFalse) {
                //_this.callM('loadData',eval(data));
                _this.option._loadsuc(data);
            }
        });
    };
    _this.loadData = function (data) {
        _this.callM('loadData', data);
    };
    _this.select = function (id) {
        //定位准确的行
        var node = _this.find(id);
        _this.callM('expandTo', node.target);
        _this.callM('select', node.target);
    };
    _this.expandAll = function (id) {
        var node = _this.find(id);
        _this.callM('expandAll', node.target);
    };
    _this.collapseAll = function (id) {
        var node = _this.find(id);
        _this.callM('collapseAll', node.target);
    };
    _this.getSelected = function () {
        //需要支持 nodes todo
        return _this.callM('getSelected');
    };
    _this.find = function (id) {
        var node = _this.callM('find', id);
        if (!VJ.isValid(node)) { VJ.showException('没找到 id为' + id + '的节点'); }
        return node;
    };
};
VJ.tree = function (option) {
    if (VJ.isValid(option) && VJ.isValid(option.node) && VJ.isValid(option.url)) {
        return new VJ._treeObject(option);
    }
    else {
        return VJ.showException("错误：VJ.tree() option参数或者option.node对象或者option.url参数不能为空。");
    }
};
//定义接口为node type typestate图类型 title size大小 数据 X轴 Y轴 URL或者bindData
VJ._chartObject = function (option) {
    var _this = this;
    var randomid = Math.round(Math.random() * 100000000);
    _this.ID = function () { return randomid; };
    if (option.jsonp) {
        VJ._VJ_Query_Map[randomid] = _this;
    }
    var columnState = function () {
        var _this2 = this;
        (function () {
            VJ._Object.apply(_this2, [{}]);
            _this2.defaultOption = VJ._chartOption;
        })();
        _this2.draw = function (opt) {
            //如何定义标准接口 进行格式转换
            //由多个{name:'',data[]}组成
            var datas = opt.transData(opt.data);
            var _opt = VJ.merge({
                chart: {
                    type: 'column',
                    zoomType: opt.zoom,
                    shadow: opt.shadow
                },
                subtitle: {
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'Microsoft Yahei'
                    }
                },
                title: {
                    text: opt.title,
                    style: {
                        color: '#fff',
                        fontWeight: 'bold'
                    }

                },
                xAxis: {
                    title: {
                        text: opt.xTitle,
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei'
                        }
                    },
                    style: {
                        color: '#fff',
                        fontFamily: 'Microsoft Yahei'
                    },
                    categories: datas[0],
                    lineColor: '#fff',
                    tickColor: '#fff',
                    labels: {
                        style: {
                            color: '#fff'
                        }
                    }
                },
                yAxis: {
                    min: opt.yMin,
                    title: {
                        text: opt.yTitle,
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei',
                            fontWeight: 'bold'
                        }

                    },
                    labels: {
                        formatter: function () { return this.value; },
                        style: {
                            color: '#fff'
                        }
                    }
                },
                tooltip: {
                    enabled: opt.tooltip,
                    backgroundColor: '#666666',
                    borderWidth: 0,
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}:</td>' +
					'<td style="padding:0"><b>{point.y}' + opt.unit + '</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true,
                    style: {
                        color: '#fff'
                    }
                },
                legend: {
                    enabled: opt.legend,
                    borderWidth: 0,
                    backgroundColor: opt.backgroundColor,
                    navigation: {
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei'
                        }

                    },
                    title: {
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei'
                        }
                    },
                    itemStyle: {
                        color: '#fff',
                        fontFamily: 'Microsoft Yahei'
                    },
                    itemHoverStyle: {
                        color: '#ccc'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: opt.point, //表示启用
                            formatter: function () { return (opt.pointFormatter.apply(this, []) + opt.unit); }
                        },
                        events: {
                            click: function (event) {
                                opt.click(_this.node, opt, event, event.point);
                            }
                        }
                    }
                },
                series: [VJ.merge(datas[1][0], {
                    color: '#fff',
                    pointWidth: 20
                }), VJ.merge(datas[1][1], {
                    color: '#fcc120',
                    pointWidth: 20,
                    style: {
                        color: "#fff"
                    }
                })],
                credits: {
                    enabled: false,
                    style: {
                        color: '#fff'
                    }
                },
                exporting: { enabled: false }
            },
			(VJ.isValid(opt.backgroundColor) ? { chart: { backgroundColor: opt.backgroundColor}} : {}),
			(VJ.isValid(opt.border) ? { chart: { borderWidth: opt.border}} : {}),
			(VJ.isValid(opt.innBackgroundColor) ? { chart: { plotBackgroundColor: opt.innBackgroundColor}} : {}),
			(VJ.isValid(opt.company) ? { credits: { enabled: true, text: opt.company, href: VJ.getValue(opt.companyURL, '#')}} : {}),
			(VJ.isValid(opt.exportingURL) ? { exporting: { enabled: true, href: opt.exportingURL}} : {}),
			(VJ.isValid(opt.subtitle) ? { subtitle: { text: opt.subtitle}} : {}),
			((VJ.isValid(opt.tooltip) && VJ.isValid(opt.tooltipFormatter)) ? { tooltip: { formatter: opt.tooltipFormatter}} : {}),
			opt);
            _this.node.highcharts(_opt);
        };
    };
    var lineState = function () {
        var _this2 = this;
        (function () {
            VJ._Object.apply(_this2, [{}]);
            _this2.defaultOption = VJ._lineOption;
        })();
        _this2.draw = function (opt) {
            //如何定义标准接口 进行格式转换
            //由多个{name:'',data[]}组成
            var datas = opt.transData(opt.data);
            var _opt = VJ.merge({
                chart: {
                    type: opt.spline ? 'spline' : 'line',
                    zoomType: opt.zoom,
                    shadow: opt.shadow
                },
                title: {
                    text: opt.title,
                    style: {
                        color: '#fff',
                        fontWeight: 'bold'
                    }

                },
                subtitle: {
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'Microsoft Yahei'
                    }
                },
                xAxis: {
                    title: {
                        text: opt.xTitle,
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei'
                        }
                    },
                    style: {
                        color: '#fff',
                        fontFamily: 'Microsoft Yahei'
                    },
                    categories: datas[0],
                    lineColor: '#fff',
                    tickColor: '#fff',
                    labels: {
                        style: {
                            color: '#fff'
                        }
                    }
                },
                yAxis: {
                    min: opt.yMin,
                    title: {
                        text: opt.yTitle,
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei',
                            fontWeight: 'bold'
                        }

                    },
                    labels: {
                        formatter: function () { return this.value; },
                        style: {
                            color: '#fff'
                        }
                    }
                },
                tooltip: {
                    enabled: opt.tooltip,
                    backgroundColor: '#666666',
                    borderWidth: 0,
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}:</td>' +
					'<td style="padding:0"><b>{point.y}' + opt.unit + '</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true,
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'Microsoft Yahei'
                    }
                },
                legend: {
                    enabled: opt.legend,
                    //layout: 'horizontal',
                    //align: 'right',
                    //verticalAlign: 'bottom',
                    //x: -10,
                    //y: 100,
                    borderWidth: 0,
                    navigation: {
                        style: {
                            color: '#fff'
                        }

                    },
                    itemStyle: {
                        color: '#fff',
                        fontFamily: 'Microsoft Yahei'
                    },
                    itemHoverStyle: {
                        color: '#ccc'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: opt.point, //表示启用
                            formatter: function () { return (opt.pointFormatter.apply(this, []) + opt.unit); }
                        },
                        events: {
                            click: function (event) {
                                opt.click(_this.node, opt, event, event.point);
                            }
                        }
                    }
                },
                series: [VJ.merge(datas[1][0], {
                    color: '#fff',
                    pointWidth: 20
                }), VJ.merge(datas[1][1], {
                    color: '#fcc120',
                    pointWidth: 20,
                    style: {
                        color: "#fff"
                    }
                })],
                credits: {
                    enabled: false,
                    style: {
                        color: '#fff'
                    }
                },
                exporting: { enabled: false }
            },
			(VJ.isValid(opt.backgroundColor) ? { chart: { backgroundColor: opt.backgroundColor}} : {}),
			(VJ.isValid(opt.border) ? { chart: { borderWidth: opt.border}} : {}),
			(VJ.isValid(opt.innBackgroundColor) ? { chart: { plotBackgroundColor: opt.innBackgroundColor}} : {}),
			(VJ.isValid(opt.company) ? { credits: { enabled: true, text: opt.company, href: VJ.getValue(opt.companyURL, '#')}} : {}),
			(VJ.isValid(opt.exportingURL) ? { exporting: { enabled: true, href: opt.exportingURL}} : {}),
			(VJ.isValid(opt.subtitle) ? { subtitle: { text: opt.subtitle}} : {}),
			((VJ.isValid(opt.tooltip) && VJ.isValid(opt.tooltipFormatter)) ? { tooltip: { formatter: opt.tooltipFormatter}} : {}),
			opt);
            _this.node.highcharts(_opt);
        };
    };
    var pieState = function () {
        var _this2 = this;
        (function () {
            VJ._Object.apply(_this2, [{}]);
            _this2.defaultOption = VJ._pieOption;
        })();
        _this2.draw = function (opt) {
            //如何定义标准接口 进行格式转换
            //由多个{name:'',data[]}组成			
            var datas = opt.transData(opt.data);
            var _opt = VJ.merge({
                chart: {
                    type: 'pie',
                    zoomType: opt.zoom,
                    shadow: opt.shadow
                },
                title: {
                    text: opt.title,
                    style: {
                        color: '#fff',
                        fontWeight: 'bold'
                    }

                },
                subtitle: {
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'Microsoft Yahei'
                    }
                },
                tooltip: {
                    enabled: opt.tooltip,
                    percentageDecimals: 1,
                    backgroundColor: '#666666',
                    borderWidth: 0,
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'Microsoft Yahei'
                    }
                },
                legend: {
                    enabled: opt.legend,
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -10,
                    y: 100,
                    borderWidth: 0,
                    navigation: {
                        style: {
                            color: '#fff',
                            fontFamily: 'Microsoft Yahei'
                        }

                    },
                    itemStyle: {
                        color: '#fff',
                        fontFamily: 'Microsoft Yahei'
                    },
                    itemHoverStyle: {
                        color: '#ccc'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: opt.point,
                            color: '#000000',
                            connectorColor: '#000000',
                            formatter: function () {
                                return (opt.pointFormatter.apply(this, [])); //'<b>'+ this.point.name +'</b>: '+ this.percentage +' %';								
                            }
                        },
                        events: {
                            click: function (event) {
                                opt.click(_this.node, opt, event, event.point);
                            }
                        },
                        showInLegend: opt.legend
                    }
                },
                series: [VJ.merge(datas[1][0], {
                    color: '#fff',
                    pointWidth: 20
                }), VJ.merge(datas[1][1], {
                    color: '#fcc120',
                    pointWidth: 20,
                    style: {
                        color: "#fff",
                        fontFamily: 'Microsoft Yahei'
                    }
                })],
                credits: {
                    enabled: false,
                    style: {
                        color: '#fff',
                        fontFamily: 'Microsoft Yahei'
                    }
                },
                exporting: { enabled: false }
            },
			(VJ.isValid(opt.backgroundColor) ? { chart: { backgroundColor: opt.backgroundColor}} : {}),
			(VJ.isValid(opt.border) ? { chart: { borderWidth: opt.border}} : {}),
			(VJ.isValid(opt.innBackgroundColor) ? { chart: { plotBackgroundColor: opt.innBackgroundColor}} : {}),
			(VJ.isValid(opt.company) ? { credits: { enabled: true, text: opt.company, href: VJ.getValue(opt.companyURL, '#')}} : {}),
			(VJ.isValid(opt.exportingURL) ? { exporting: { enabled: true, href: opt.exportingURL}} : {}),
			(VJ.isValid(opt.subtitle) ? { subtitle: { text: opt.subtitle}} : {}),
			((VJ.isValid(opt.tooltip) && VJ.isValid(opt.tooltipFormatter)) ? { tooltip: { pointFormat: opt.tooltipFormatter(opt)}} : {}),
			opt);
            _this.node.highcharts(_opt);
        };
    };
    var comboxState = function () {
        var _this2 = this;
        (function () {
            VJ._Object.apply(_this2, [{}]);
            _this2.defaultOption = VJ._comboxOption;
        })();
        _this2.draw = function (opt) {
            //如何定义标准接口 进行格式转换
            //由多个{name:'',data[]}组成			
            var datas = opt.transData(opt.data, opt);
            var _opt = VJ.merge({
                chart: {
                    zoomType: opt.zoom,
                    shadow: opt.shadow
                },
                title: { text: opt.title },
                xAxis: {
                    title: { text: opt.xTitle },
                    categories: datas[0]
                },
                yAxis: {
                    min: opt.yMin,
                    title: { text: opt.yTitle },
                    labels: {
                        formatter: function () { return this.value; }
                    }
                },
                tooltip: {
                    enabled: opt.tooltip,
                    backgroundColor: '#666666',
                    borderWidth: 0
                },
                labels: {
                    items: [opt.showPie ? {
                        html: opt.subtitle,
                        style: {
                            left: '40px',
                            top: '8px',
                            color: 'black'
                        }
                    } : {}]
                },
                legend: {
                    enabled: opt.legend
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: opt.point, //表示启用
                            formatter: function () { return (opt.pointFormatter.apply(this, []) + opt.unit); }
                        },
                        events: {
                            click: function (event) {
                                opt.click(_this.node, opt, event, event.point);
                            }
                        }
                    },
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        center: [150, 80],
                        size: 100,
                        dataLabels: {
                            enabled: opt.point,
                            color: '#000000',
                            connectorColor: 'red',
                            formatter: function () {
                                return (opt.piepointFormatter.apply(this, [])); //'<b>'+ this.point.name +'</b>: '+ this.percentage +' %';								
                            }
                        },
                        events: {
                            click: function (event) {
                                opt.click(_this.node, opt, event, event.point);
                            }
                        },
                        showInLegend: opt.point
                    }
                },
                series: datas[1],
                credits: { enabled: false },
                exporting: { enabled: false }
            },
			(VJ.isValid(opt.backgroundColor) ? { chart: { backgroundColor: opt.backgroundColor}} : {}),
			(VJ.isValid(opt.border) ? { chart: { borderWidth: opt.border}} : {}),
			(VJ.isValid(opt.innBackgroundColor) ? { chart: { plotBackgroundColor: opt.innBackgroundColor}} : {}),
			(VJ.isValid(opt.company) ? { credits: { enabled: true, text: opt.company, href: VJ.getValue(opt.companyURL, '#')}} : {}),
			(VJ.isValid(opt.exportingURL) ? { exporting: { enabled: true, href: opt.exportingURL}} : {}),
			(VJ.isValid(opt.subtitle) ? { subtitle: { text: opt.subtitle}} : {}),
			((VJ.isValid(opt.tooltip) && VJ.isValid(opt.tooltipFormatter)) ? { tooltip: { formatter: function () { return opt.tooltipFormatter.apply(this, [opt]); } }} : {}),
			opt);
            _this.node.highcharts(_opt);
        };
    };
    var customState = function () {
        var _this2 = this;
        (function () {
            VJ._Object.apply(_this2, [{}]);
        })();
        _this2.draw = function (opt) {
            _this.node.highcharts(_opt);
        };
    };
    (function () {
        var WHParam = {};
        switch ('' + option.WHStyle) {
            case '1': WHParam = { width: 300, height: 200 }; break;
            case '2': WHParam = { width: 300, height: 360 }; break;
            case '3': WHParam = { width: 450, height: 300 }; break;
            case '4': WHParam = { width: 650, height: 500 }; break;
            case '5': WHParam = { width: 900, height: 650 }; break;
            default: WHParam = {}; break;
        }
        switch (option.type) {
            case 'column':
                _this.state = new columnState();
                break;
            case 'line':
                _this.state = new lineState();
                break;
            case 'pie':
                _this.state = new pieState();
                break;
            case 'combox':
                _this.state = new comboxState();
                break;
            case 'custom':
                _this.state = new customState();
                break;
            default:
                VJ.showException('未定义的报表类型' + _this.option.type);
                _this.isValid = false;
                break;
        }
        option = VJ.merge(_this.state.defaultOption, WHParam, option);
        VJ._Object.apply(_this, [option]);
        _this.isValid = _this.checkNode(option);
        if (!_this.isValid) return;
        using('chart');
        _this.node = _this.option.node;
        _this.node.hide();
    })();
    if (!_this.isValid) return;
    _this.close = function () {
        _this.node.hide();
    };
    //param 或者 data
    _this.show = function (option) {
        _this.node.show();
        var _option = VJ.merge({ success: VJ._ajaxOption.success, param: {} }, _this.option, VJ.getValue(option, {}));
        _option.bindData = function (data) {
            _this.state.draw(VJ.merge(_option, { data: data }));
        }
        _this.afterBind = function (data) {
            _option.success(data, 'success');
        };
        if (VJ.isValid(_option.data)) {
            _this.state.draw(_option);
        } else if (VJ.isValid(_option.url)) {
            //正式支持Jsonp
            if (!_option.jsonp) {
                VJ.ajax({
                    url: _option.url,
                    data: _option.param,
                    filtData: function (data) {
                        return _option.filtData(data);
                    },
                    bindData: function (data) {
                        _this.state.draw(VJ.merge(_option, { data: data }));
                    }
                });
            } else {
                VJ.getRemoteJSON(
				    _option.url +
				    (_option.url.indexOf('?') >= 0 ? '&' : '?') + '_bk=VJ._VJ_Query_Map[' + _this.ID() + '].afterBind' +
				    ($.param(_option.param).length > 0 ? ('&' + $.param(_option.param)) : '')
			    );
            }
        } else {
            VJ.showException('请输入数据或者url');
        }
    };
    _this.showData = function (data) {
        option = VJ.merge(_this.option, { data: data });
        _this.state.draw(option);
    };
};
VJ.chart = function (option) {
    if (VJ.isValid(option) && VJ.isValid(option.node)) {
        return new VJ._chartObject(option);
    }
    else {
        return VJ.showException("错误：VJ.chart() option参数或者option.node对象不能为空。");
    }
};

VJ._movieObject = function (option) {
    //todo tween.js
    var _this = this;
    (function () {
        //node 
        VJ._Object.apply(_this, [VJ.merge(VJ._movieOption, option)]);
        _this.valid = _this.checkNode(_this.option);
        if (!_this.valid) return;
        _this.node = option.node;
        _this.node.hide();
        if (!VJ.checkWebGL()) {
            _this.option.unableWebGL();
            return;
        }
        using('d3');
    })();
    _this.init = function () {
        { //_this.scene
            if (!VJ.isValid(_this.option.scene)) {
                _this.scene = _this.option.getScene();
            } else {
                _this.scene = _this.option.scene;
            }
        }

        {//lights初始化
            if (VJ.isValid(_this.option.lights)) {
                if (!VJ.isArray(_this.option.lights)) {
                    _this.lights = [_this.option.lights];
                } else if (_this.option.lights.length === 0) {
                    //添加默认自然光
                    _this.lights = _this.option.getLights();
                } else {
                    _this.lights = _this.option.lights;
                }
            } else {
                //添加默认自然光
                _this.lights = _this.option.getLights();
            }
            $(_this.lights).each(function (i, v) {
                if (_this.option.hasShadow) {
                    v.castShadow = true;
                }
                _this.scene.add(v);
            });
        }

        {//render
            if (VJ.isValid(_this.option.render)) {
                _this.render = _this.option.render;
            } else {
                _this.render = _this.option.getRender(_this.node);
            }

            _this.render.shadowMapEnabled = _this.option.hasShadow;
        }

        { //camera
            if (VJ.isValid(_this.option.camera)) {
                _this.camera = _this.option.camera;
            } else {
                _this.camera = _this.option.getCamera(_this.node);
            }
            _this.scene.add(_this.camera);
        }

        {
            if (VJ.isValid(_this.option.objects)) {
                if (VJ.isArray(_this.option.objects)) {
                    $(_this.option.objects).each(function (i, v) { _this.add(v) });
                } else {
                    _this.add(_this.option.objects);
                }
            }
        }
        //用于抓取点击的检测
        _this.projector = new THREE.Projector();

        {
            //init MouseEvent
            _this.node.mousemove(function (e) {
                VJ.tryC(function () {
                    _this.dommousemove(e);
                });
            });
            _this.node.mouseup(function (e) {
                VJ.tryC(function () {
                    _this.dommouseup(e);
                });
            });
            _this.node.mousedown(function (e) {
                VJ.tryC(function () {
                    _this.dommousedown(e);
                });
            });
            _this.node.mousewheel(function (e, delta) {
                VJ.tryC(function () {
                    _this.dommousewheel(e, delta);
                });
            });
            _this.node.click(function (e) {
                VJ.tryC(function () {
                    var obj = _this.objectFromMouse(e.pageX, e.pageY);
                    if (obj.object && obj.object.click) { obj.object.click(e, obj.source); }
                });
            });
            _this.overObject = null;
            _this.clickedObject = null;
        }

        {
            _this.node.resize(function (event) {
                VJ.tryC(function () {
                    _this.render.setSize(_this.node.width(), _this.node.height());
                    _this.camera.aspect = _this.node.width() / _this.node.height();
                    _this.camera.updateProjectionMatrix();
                });
            });
        }

        {
            _this.render.domElement.addEventListener("webglcontextlost", function (e) {
                _this.domcontextlost(e);
            });
        }
    };

    _this.domcontextlost = function (event) {
        VJ.showException('', 'WebGL上下文丢失，重建会话！');
        _this.init();
        var objs = _this.objs;
        _this.objs = [];
        $(objs).each(function (i, v) {
            _this.add(v);
        });
        if (_this.canRun) {
            _this.start();
        }
    };

    _this.dommousemove = function (event) {
        event.preventDefault();

        if (_this.clickedObject && _this.clickedObject.mousemove) {
            var intersected = _this.objectFromMouse(event.pageX, event.pageY);
            if (intersected.object == _this.clickedObject && _this.clickedObject.option.dragable) {
                var _old = _this.clickedDragPoint;
                _this.clickedDragPoint = intersected.point.clone();
                var vp = intersected.point.sub(_old);
                _this.clickedObject.mousemove(event.pageX, event.pageY, _this.clickedDragPoint, intersected.normal, _this.clickedObjectSource, vp);
            }
        } else {
            var handled = false;
            var oldObj = _this.overObject;
            var oldIntersected = _this.overIntersected;
            var intersected = _this.objectFromMouse(event.pageX, event.pageY);
            _this.overObject = intersected.object;
            _this.overIntersected = intersected;

            if (_this.overObject != oldObj) {
                if (oldObj) {
                    _this.node.css('cursor', 'auto');

                    if (oldObj.mouseout) {
                        oldObj.mouseout(event.pageX, event.pageY, oldIntersected.source);
                    }
                }

                if (_this.overObject) {
                    if (_this.overObject.overCursor) {
                        _this.node.css('cursor', _this.overObject.overCursor);
                    }

                    if (_this.overObject.mouseover) {
                        _this.overObject.mouseover(event.pageX, event.pageY, intersected.source);
                    }
                }
                handled = true;
            }

            if (!handled && _this.mousemove) {
                _this.mousemove(event.pageX, event.pageY, intersected.source);
            }
        }
    };
    _this.mouseover = function (x, y, source) { };

    _this.dommousedown = function (event) {
        event.preventDefault();

        var handled = false;

        var intersected = this.objectFromMouse(event.pageX, event.pageY);
        if (intersected.object) {
            if (intersected.object.mousedown) {
                intersected.object.mousedown(event.pageX, event.pageY, intersected.point, intersected.normal, intersected.source);
                _this.clickedObject = intersected.object;
                if (_this.clickedObject.option.dragable) {
                    _this.clickedObjectSource = intersected.source.object;
                    _this.clickedDragPoint = intersected.point;
                }
                handled = true;
            }
        }

        if (!handled && _this.mousedown) {
            _this.mousedown(event.pageX, event.pageY, intersected.point, intersected.normal, intersected.source);
        }
    };
    _this.mousedown = function (x, y, point, normal, source) { };

    _this.dommouseup = function (event) {
        event.preventDefault();

        var handled = false;

        var intersected = this.objectFromMouse(event.pageX, event.pageY);
        if (intersected.object) {
            if (intersected.object.mouseup) {
                intersected.object.mouseup(event.pageX, event.pageY, intersected.point, intersected.normal, intersected.source);
                handled = true;
            }
        }

        if (!handled && _this.mouseup) {
            _this.mouseup(event.pageX, event.pageY, intersected.point, intersected.normal, intersected.source);
        }

        _this.clickedObject = null;
        _this.clickedObjectSource = null;
        _this.clickedDragPoint = null;
    };
    _this.mouseup = function (x, y, point, normal, source) { };

    _this.dommousewheel = function (event, delta) {
        event.preventDefault();
        var handled = false;

        var intersected = this.objectFromMouse(event.pageX, event.pageY);
        if (intersected.object) {
            if (intersected.object.mousewheel) {
                intersected.object.mousewheel(delta, intersected.point, intersected.normal, intersected.source);
                handled = true;
            }
        }
        if (!handled && _this.mousewheel) {
            _this.mousewheel(delta, intersected.point, intersected.normal, intersected.source);
        }
    };
    _this.mousewheel = function (delta, point, normal, source) { };
    //{object,point,normal,source:{distance,point,face,faceIndex,object}}
    _this.objectFromMouse = function (pagex, pagey) {
        // Translate page coords to element coords
        var offset = $(_this.render.domElement).offset();
        //转换为div坐标
        var eltx = pagex - offset.left;
        var elty = pagey - offset.top;

        //转换为相机视野坐标
        var vpx = (eltx / _this.node[0].offsetWidth) * 2 - 1;
        var vpy = -(elty / _this.node[0].offsetHeight) * 2 + 1;

        var vector = new THREE.Vector3(vpx, vpy, 0.5);

        _this.projector.unprojectVector(vector, _this.camera);
        //生成视界射线
        var ray = new THREE.Raycaster(_this.camera.position, vector.sub(_this.camera.position).normalize(), _this.camera.near, _this.camera.far);
        //获取到相交的对象
        var intersects = ray.intersectObjects(_this.scene.children, true);
        ray = null;
        if (intersects.length > 0) {
            var i = 0;
            while (!intersects[i].object.visible) {
                i++;
            }
            var intersected = intersects[i];
            //var mat = new THREE.Matrix4().getInverse(intersected.object.matrixWorld);
            //var point = mat.multiplyVector3(intersected.point);
            return (_this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face.normal, intersected));
        } else {
            return { object: null, point: null, normal: null, source: null };
        }
    };
    _this.findObjectFromIntersected = function (object, point, normal, source) {
        if (object.data) {
            return { object: object.data, point: point, normal: normal, source: source };
        } else if (object.parent) {
            return _this.findObjectFromIntersected(object.parent, point, normal, source);
        } else {
            return { object: null, point: null, normal: null, source: null };
        }
    };
    _this.show = function () {
        _this.node.show();
        _this.render.clear();
        _this.render.render(_this.scene, _this.camera);
    };
    _this.hide = function () {
        _this.render.clear();
        _this.node.hide();
    };
    var canRun = false;
    _this.run = function () {
        VJ.tryC(function () {
            if (canRun) {
                $(_this.objs).each(function (i, v) {
                    VJ.tryC(function () {
                        v.onRun(_this);
                    });
                });
                //_this.render.clear();
                _this.render.render(_this.scene, _this.camera);
                window.requestAnimationFrame(_this.run);
            }
        });
    };

    _this.start = function () {
        canRun = true;
        _this.show();
        _this.run();
    };
    _this.pause = function () { canRun = false; };
    _this.stop = function () { canRun = false; _this.hide(); };
    _this.objs = [];
    _this.add = function (object) {
        //todo还没有支持Movie对象x
        if (object instanceof THREE.Light) {
            object.castShadow = _this.option.hasShadow;
        } else if (object.isVJ3D) {
            _this.objs.push(object);
            object.setShadow(_this.option.hasShadow);
            _this.scene.add(object.o3d);
            return;
        } else if (!(object instanceof THREE.Camera || object instanceof THREE.Bone)) {
            object.castShadow = _this.option.hasShadow;
            object.receiveShadow = _this.option.hasShadow;
        }
        _this.scene.add(object);
    };
    _this.remove = function (object) {
        if (object instanceof VJ._3DObject) {
            var index = -1;
            $(_this.objs).each(function (i, v) {
                if (v === object) { index = i; }
            });
            if (index >= 0) {
                _this.objs.splice(index, 1);
            }
            /*_this.scene.remove(object.o3d);*/

            $(object.objs).each(function (i, v) {
                _this.scene.remove(v);
            });
            return;
        }
        _this.scene.remove(object);
    };
    //获取对象的2D位置
    _this.get2DPosition = function (o3d) {
        var mat = o3d.matrixWorld;
        var pos = new THREE.Vector3();
        pos = mat.multiplyVector3(pos);

        projected = pos.clone();
        _this.projector.projectVector(projected, _this.camera);

        var eltx = (1 + projected.x) * _this.node[0].offsetWidth / 2;
        var elty = (1 - projected.y) * _this.node[0].offsetHeight / 2;

        var offset = $(_this.render.domElement).offset();
        eltx += offset.left;
        elty += offset.top;

        return { x: eltx, y: elty };
    };
};
//本身要管理动画
VJ._3DObject = function (option) {
    var _this = this;
    (function () {
        using('d3');
        _this.option = VJ.merge(VJ._3DObjectOption, option);
        _this.o3d = new THREE.Object3D();
        //进行保存用于拾取对象
        _this.o3d.data = _this;
        //存储子Object3D对象
        _this.objs = [];
        //存储子VJ_3DObject对象
        _this.children = [];
        _this.isVJ3D = true;
    })();
    _this.click = function (e, source) { };
    _this.mouseout = function (x, y, source) { };
    _this.mouseover = function (x, y, source) { };
    //一般只在dragable为真时拖拽时使用，point为点击交点，source为点击真实的对象vp为两次点击点之间的差值
    _this.mousemove = function (x, y, point, normal, source, vp) { };
    _this.mousedown = function (x, y, point, normal, source) { };
    _this.mouseup = function (x, y, point, normal, source) { };
    _this.mousewheel = function (delta, point, normal, source) { };
    _this.loader = new THREE.ObjectLoader();
    _this.parseObject = function (json) {
        return _this.loader.parse(json);
    };
    _this.__toJson = function (geometries, materials, o3d) {
        var obj = {
            uuid: o3d.uuid,
            name: o3d.name
        };
        if (o3d instanceof THREE.Scene) {
            obj.type = "Scene";
        } else if (o3d instanceof THREE.PerspectiveCamera) {
            $.extend(obj, {
                type: "PerspectiveCamera",
                fov: o3d.fov,
                aspect: o3d.aspect,
                near: o3d.near,
                far: o3d.far
            });
        } else if (o3d instanceof THREE.OrthographicCamera) {
            $.extend(obj, {
                type: "OrthographicCamera",
                left: o3d.left,
                right: o3d.right,
                top: o3d.top,
                bottom: o3d.bottom,
                near: o3d.near,
                far: o3d.far
            });
        } else if (o3d instanceof THREE.AmbientLight) {
            $.extend(obj, {
                type: "AmbientLight",
                color: o3d.color.getHexString()
            });
        } else if (o3d instanceof THREE.DirectionalLight) {
            $.extend(obj, {
                type: "DirectionalLight",
                color: o3d.color.getHexString(),
                intensity: o3d.intensity
            });
        } else if (o3d instanceof THREE.PointLight) {
            $.extend(obj, {
                type: "PointLight",
                color: o3d.color.getHexString(),
                intensity: o3d.intensity,
                distance: o3d.distance
            });
        } else if (o3d instanceof THREE.SpotLight) {
            $.extend(obj, {
                type: "SpotLight",
                color: o3d.color.getHexString(),
                intensity: o3d.intensity,
                distance: o3d.distance,
                angle: o3d.angle,
                exponent: o3d.exponent
            });
        } else if (o3d instanceof THREE.HemisphereLight) {
            $.extend(obj, {
                type: "HemisphereLight",
                color: o3d.color.getHexString(),
                intensity: o3d.intensity,
                groundColor: o3d.groundColor.getHexString()
            });
        } else if (o3d instanceof THREE.Mesh) {
            var geo = {
                uuid: o3d.geometry.uuid,
                name: o3d.geometry.name
            };
            geometries[geo.uuid] = geo;
            if (o3d.geometry instanceof THREE.PlaneGeometry) {
                $.extend(geo, {
                    type: 'PlaneGeometry',
                    width: o3d.geometry.width,
                    height: o3d.geometry.height,
                    widthSegments: o3d.geometry.widthSegments,
                    heightSegments: o3d.geometry.heightSegments
                });
            } else if (o3d.geometry instanceof THREE.CubeGeometry) {
                $.extend(geo, {
                    type: 'CubeGeometry',
                    width: o3d.geometry.width,
                    height: o3d.geometry.height,
                    widthSegments: o3d.geometry.widthSegments,
                    depth: o3d.geometry.depth,
                    heightSegments: o3d.geometry.heightSegments,
                    depthSegments: o3d.geometry.depthSegments
                });
            } else if (o3d.geometry instanceof THREE.CylinderGeometry) {
                $.extend(geo, {
                    type: 'CylinderGeometry',
                    radiusTop: o3d.geometry.radiusTop,
                    radiusBottom: o3d.geometry.radiusBottom,
                    height: o3d.geometry.height,
                    radiusSegments: o3d.geometry.radiusSegments,
                    heightSegments: o3d.geometry.heightSegments,
                    openEnded: o3d.geometry.openEnded
                });
            } else if (o3d.geometry instanceof THREE.SphereGeometry) {
                $.extend(geo, {
                    type: 'SphereGeometry',
                    radius: o3d.geometry.radius,
                    widthSegments: o3d.geometry.widthSegments,
                    heightSegments: o3d.geometry.heightSegments,
                    phiStart: o3d.geometry.phiStart,
                    phiLength: o3d.geometry.phiLength,
                    thetaStart: o3d.geometry.thetaStart,
                    thetaLength: o3d.geometry.thetaLength
                });
            } else if (o3d.geometry instanceof THREE.IcosahedronGeometry) {
                $.extend(geo, {
                    type: 'IcosahedronGeometry',
                    radius: o3d.geometry.radius,
                    detail: o3d.geometry.detail
                });
            } else if (o3d.geometry instanceof THREE.TorusGeometry) {
                $.extend(geo, {
                    type: 'TorusGeometry',
                    radius: o3d.geometry.radius,
                    tube: o3d.geometry.tube,
                    radialSegments: o3d.geometry.radialSegments,
                    tubularSegments: o3d.geometry.tubularSegments,
                    arc: o3d.geometry.arc
                });
            } else if (o3d.geometry instanceof THREE.TorusKnotGeometry) {
                $.extend(geo, {
                    type: 'TorusKnotGeometry',
                    tube: o3d.geometry.tube,
                    radialSegments: o3d.geometry.radialSegments,
                    tubularSegments: o3d.geometry.tubularSegments,
                    p: o3d.geometry.p,
                    q: o3d.geometry.q,
                    heightScale: o3d.geometry.heightScale
                });
            } else if (o3d.geometry instanceof THREE.Geometry) {
                $.extend(geo, {
                    type: 'Geometry',
                    //todo
                    data: {}
                });
                alert('复杂Geometry，无法获取Geometry.data数据，是JSONLoader parse的反面');
            }
            var mat = {
                uuid: o3d.material.uuid,
                name: o3d.material.name
            };
            materials[mat.uuid] = mat;
            if (o3d.material instanceof THREE.MeshBasicMaterial) {
                $.extend(mat, {
                    type: 'MeshBasicMaterial',
                    color: o3d.material.color.getHexString(),
                    opacity: o3d.material.opacity,
                    transparent: o3d.material.transparent,
                    wireframe: o3d.material.wireframe
                });
            } else if (o3d.material instanceof THREE.MeshLambertMaterial) {
                $.extend(mat, {
                    type: 'MeshLambertMaterial',
                    color: o3d.material.color.getHexString(),
                    ambient: o3d.material.ambient.getHexString(),
                    emissive: o3d.material.emissive.getHexString(),
                    opacity: o3d.material.opacity,
                    transparent: o3d.material.transparent,
                    wireframe: o3d.material.wireframe
                });
            } else if (o3d.material instanceof THREE.MeshPhongMaterial) {
                $.extend(mat, {
                    type: 'MeshPhongMaterial',
                    color: o3d.material.color.getHexString(),
                    ambient: o3d.material.ambient.getHexString(),
                    emissive: o3d.material.emissive.getHexString(),
                    specular: o3d.material.specular.getHexString(),
                    shininess: o3d.material.shininess,
                    opacity: o3d.material.opacity,
                    transparent: o3d.material.transparent,
                    wireframe: o3d.material.wireframe
                });
            } else if (o3d.material instanceof THREE.MeshNormalMaterial) {
                $.extend(mat, {
                    type: 'MeshNormalMaterial',
                    opacity: o3d.material.opacity,
                    transparent: o3d.material.transparent,
                    wireframe: o3d.material.wireframe
                });
            } else if (o3d.material instanceof THREE.MeshDepthMaterial) {
                $.extend(mat, {
                    type: 'MeshDepthMaterial',
                    opacity: o3d.material.opacity,
                    transparent: o3d.material.transparent,
                    wireframe: o3d.material.wireframe
                });
            }
            if (o3d.material.vertexColors !== undefined) { geo.vertexColors = o3d.material.vertexColors; }
            if (o3d.material.map) {
                //todo 暂时不能回滚
                geo.map = o3d.materail.map.sourceFile;
            }
            $.extend(obj, {
                type: "Mesh",
                geometry: o3d.geometry.uuid,
                material: o3d.material.uuid
            });
        } else {
            $.extend(obj, {
                type: "Object3D"
            });
        }
        return obj;
    };
    _this._toJson = function (geometries, materials) {
        var obj = _this.__toJson(geometries, materials, _this.o3d);
        $(_this.o3d.children).each(function (i, v) {
            var ret = _this.__toJson(geometries, materials, v);
            obj.children[ret.uuid] = ret;
        });
        return obj;
    };
    //该方案未能详细描述Object3D
    _this.toJson = function () {
        var geos = [];
        var mats = [];
        var obj = _this._toJson(geos, mats);
        $(_this.children).each(function (i, v) {
            var ret = v._toJson(geos, mats);
            obj.children[ret.uuid] = ret;
        });
        return { geometries: geos, materials: mats, object: obj };
    };
    //主要用于hover事件
    _this.hover = function (fun1, fun2) {
        _this.mouseover = fun1;
        _this.mouseout = fun2;
    };
    _this.add = function (object) {
        if (object.isVJ3D) {
            _this.children.push(object);
            _this.o3d.add(object.o3d);
        } else {
            _this.objs.push(object);
            _this.o3d.add(object);
        }
    };
    _this.remove = function (object) {
        var index = -1;
        if (object.isVJ3D) {
            $(_this.children).each(function (i, v) {
                if (v === object) { index = i; }
            });
            if (index >= 0) {
                _this.children.splice(index, 1);
            }
            _this.o3d.remove(object.o3d);
        } else {
            $(_this.objs).each(function (i, v) {
                if (v === object) { index = i; }
            });
            if (index >= 0) {
                _this.objs.splice(index, 1);
            }
            _this.o3d.remove(object);
        }
    };
    _this.setShadow = function (hasShadow) {
        _this.o3d.castShadow = hasShadow;
        _this.o3d.receiveShadow = hasShadow;
        $(_this.children).each(function (i, v) { v.setShadow(hasShadow); });
        $(_this.objs).each(function (i, v) {
            v.castShadow = hasShadow;
            v.receiveShadow = hasShadow;
        });
    };
    _this.init = function () { };
    //_this.objs 或者 _this.o3d.children 获取对象
    _this.canRun = true;
    _this.onRun = function (movie) {
        VJ.tryC(function () { if (_this.canRun) { _this.option.onRun(movie); $(_this.children).each(function (i, v) { VJ.tryC(function () { v.onRun(movie); }); }); } });
    };
};
VJ.movie = function (option) {
    return new VJ._movieObject(option);
    if (VJ.isValid(option) && VJ.isValid(option.node)) {
        return new VJ._movieObject(option);
    }
    else {
        return VJ.showException("错误：VJ.movie() option参数或者option.node对象不能为空。");
    }
};