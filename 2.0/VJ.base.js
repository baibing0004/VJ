//兼容IE7
/*
    减少语句路径
    少用pop,push 改为i++--操作和[length]=new
    频繁new的对象改为inherit2方法 尽管inherit2方法无法私有对象
    多用三元？少用if
    多用空方法 少用if
    除非必须 少用delete
    使用 || 代替 getValue 或者3元
    使用for if(i++>1) 判断是否为空
    使用substr lastIndexOf 代替split
    尽量使用原生方法（native）代替自己的方法
*/
window.console = console || {
    log: function(e) {}
};
Array.prototype.forEach = Array.prototype.forEach || function(func) {
    //没有index只能模拟凑合用
    VJ.each(this, func, null, true);
};
//命令注册变量
//很多地方用不了 接驳原型链报错 直接调用逻辑控件的update报错 "use strict"
(top.location == location) ? (
    VJ = window.top.VJ ? window.top.VJ : { load: false, cross: false }) : (
    VJ = window.VJ ? window.VJ : { load: false, cross: true }
);
(!VJ.load) ? (function(V, $) {
    V.load = true;
    V.isValid = function(data) {
        return (typeof(data) != "undefined" && data != null && data != 'null' && ((data.replace && data.replace(/\s/g, '') != '') || data.replace == undefined));
    };
    V.getValue = function(data, defaultData) {
        return V.isValid(data) ? data : defaultData;
    };

    //Bug处理
    V.isDebug = true;
    V.showException = function(name, e) {
        if (V.isDebug) {
            var content = name;
            if (V.isValid(e)) {
                content += ("\r\nmessage:" + e.message + (e.stack ? ("\r\nstack:" + e.stack + (e.fileName ? ("\r\nfile:" + e.fileName) : '') + (e.lineNumber ? ("\r\nlineNumber:" + e.lineNumber) : '')) : (e.description ? ("\r\ndescription:" + e.description) : "")));
            }
            //V.alert('未捕获异常',content);
            //alert('未捕获异常:' + content);
            console.log('未捕获异常:' + content + "\r\n");
            //throw e;
        }
    };
    var showException2 = function(e) { V.showException("", e) };
    V.tryC = function(func, errcall) { errcall = errcall || showException2; try { return func(); } catch (e) { try { errcall(e); } catch (e2) { showException2(e); } return false; } };
    V.tryC2 = function(err, func, errcall) { return err ? (errcall || showException2)(err) : V.tryC(func, errcall); };
    var start = null;
    var funrep1 = function(s, o) {
        var reg = /<%=[^(%>)]+%>/gi;
        return s.replace(reg, function(word) {
            var prop = word.replace(/<%=/g, '').replace(/%>/g, '');
            if (V.isValid(o[prop])) {
                return o[prop];
            } else {
                return "";
            }
        });
    }
    var funrep2 = function(s, o) {
        var reg = /\{[^(})]+\}/gi;
        return s.replace(reg, function(word) {
            var prop = word.replace(/\{/g, '').replace(/\}/g, '');
            if (V.isValid(o[prop])) {
                return o[prop];
            } else {
                return "";
            }
        });
    };
    V.format = function(s, o) {
        if (!s || !o) { return V.getValue(s, ''); }
        if (s.indexOf('<%=' >= 0)) { s = funrep1(s, o); }
        if (s.indexOf('{' >= 0)) { s = funrep2(s, o); }
        return s;
    };
    //定义的StringBuilder类
    var sb = function() {
        var _ = this,
            __ = this; {
            __.data = [];
            __._length = 0;
            __._append = function(str) {
                __.data[__.data.length] = str;
                __._length += str.length;
            };

        }
    };
    sb.prototype.append = function(str) {
        var _ = this,
            __ = this;
        str = V.isValid(str) ? __._append(str) : '';
        return _;
    };
    sb.prototype.appendFormat = function(format, data) {
        var _ = this,
            __ = this;
        return _.append(V.format(format, data));
    };
    sb.prototype.insert = function(start, data) {
        var _ = this,
            __ = this;
        var str = _.toString();
        data = data || '';
        __.data = [str.substr(0, start), data, str.substr(start)];
        __._length = str.length + data.length;
        return _;
    };
    sb.prototype.insertFormat = function(start, format, data) {
        var _ = this,
            __ = this;
        return _.insert(start, V.format(format, data));
    };
    sb.prototype.remove = function(start, length) {
        var _ = this,
            __ = this;
        var str = _.toString();
        __.data = [str.substr(0, start), str.substr(start + length)];
        __._length = Math.max(0, str.length - length);
        return _;
    };
    sb.prototype.toString = function() {
        var _ = this,
            __ = this;
        __.data = [__.data.join('')];
        return __.data[0];
    };
    sb.prototype.clear = function() {
        var _ = this,
            __ = this;
        var s = _.toString();
        __.data = []
        __._length = 0;
        return s;
    };
    sb.prototype.length = function() {
        var _ = this,
            __ = this;
        return __._length;
    };
    //定义的StringBuilder类
    V.sb = function() {
        return new sb();
    };

    //数组处理
    V.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    V.once = function(func, timeout) {
        timeout = timeout || 1;
        if (func.timeoutID) {
            window.clearTimeout(func.timeoutID);
        }
        func.timeoutID = window.setTimeout(function() { V.tryC(func) }, timeout);
    };
    //whileC 方法要求 四个参数 exp 给出需要处理的值，func进行处理，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的但是不保证前后两次调用是顺序的只能保证是异步的 第四个参数如果为真那么就是同步执行
    var emptyfunc = function() { return false; };
    var syncfunc = function(exp, func, finalf, val) {
        while (val) {
            try {
                func(val);
            } catch (e) {
                showException2(e);
            }
            val = exp();
        }
        try {
            finalf ? finalf() : null;
        } catch (e) {
            showException2(e);
        }
    };
    var asyncfunc = function(exp, func, finalf, val) {
        //不要基于递归
        V.once(function() {
            var ret = val ? {
                func: func,
                val: exp(),
                next: asyncfunc
            } : {
                func: finalf || emptyfunc,
                next: emptyfunc
            };
            try {
                ret.func(val);
            } catch (e) {
                showException2(e);
            };
            ret.next(exp, func, finalf, ret.val);
        });
    };
    //whileC 方法要求 四个参数 exp 给出需要处理的值，func进行处理，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的但是不保证前后两次调用是顺序的只能保证是异步的 第四个参数如果为真那么就是同步执行
    V.whileC = function(exp, func, finalf, isSync) {
        isSync ? syncfunc(exp, func, finalf, exp()) : asyncfunc(exp, func, finalf, exp());
    };
    var syncfunc2 = function(exp, func, finalf, val) {
        var ret = false;
        while (val) {
            try {
                ret = func(val, function() {
                    syncfunc2(exp, func, finalf, exp());
                });
            } catch (e) {
                showException2(e);
            }
            val = (ret === true || ret === undefined) ? null : exp();
        }
        try {
            (finalf && ret !== undefined) ? finalf(): null;
        } catch (e) {
            showException2(e);
        }
    };
    var asyncfunc2 = function(exp, func, finalf, val) {
        V.once(function() {
            var ret = val ? {
                func: func,
                val: exp(),
                next: asyncfunc2
            } : {
                func: finalf || emptyfunc,
                next: emptyfunc
            };
            try {
                var next = function() { ret.next(exp, func, finalf, ret.val); };
                var res = ret.func(val, next);
                if (res === true) ret.next(exp, func, finalf, false);
                else if (res !== undefined) next();
            } catch (err) {
                V.showException('', err);
                ret.next(exp, func, finalf, ret.val)
            };
        });
    };
    //whileC2 方法要求 四个参数 exp 给出需要处理的值，func进行处理，同时当处理完成是 调用 第二个参数执行next方法，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的而且保证前后两次调用是顺序的 第四个参数如果为真那么就是同步执行
    V.whileC2 = function(exp, func, finalf, isSync) {
        isSync ? syncfunc2(exp, func, finalf, exp()) : asyncfunc2(exp, func, finalf, exp());
    };
    //异步处理数组的方法
    V.each = function(data, func, finalF, isSync) {
        var i = 0;
        data = Array.prototype.slice.call(data, 0);
        V.whileC(function() { return data[i++]; }, func, finalF, isSync);
    };
    V.each2 = function(data, func, finalF, isSync) {
        var i = 0;
        data = Array.prototype.slice.call(data, 0);
        V.whileC2(function() { return data[i++]; }, func, finalF, isSync);
    };
    var forfunc = function(v, func) { return func(v.key, v.value); };
    //异步遍历对象的方法
    V.forC = function(data, func, finalf, isSync) {
        var ret = [],
            exp = emptyfunc,
            w = 0;
        if (func) {
            for (var i in data) ret[w++] = { key: i, value: data[i] };
            w = 0;
            exp = function() { return ret[w++] };
        }
        V.whileC(exp, function(v) { return forfunc(v, func) }, finalf, isSync);
    };
    var forfunc2 = function(v, func, n) { return func(v.key, v.value, n); };
    //异步链式遍历对象的方法,需要func显式调用传入的next方法
    V.forC2 = function(data, func, finalf, isSync) {
        var ret = [],
            exp = emptyfunc,
            w = 0;
        if (func) {
            for (var i in data) ret[w++] = { key: i, value: data[i] };
            w = 0;
            exp = function() { return ret[w++]; }
        }
        V.whileC2(exp, function(v, n) { return forfunc2(v, func, n) }, finalf, isSync);
    };
    //异步最终处理 其结果集最终处理的方式 function(共享的json对象 {})
    V.finalC = function() {
        var funs = [];
        for (var i = 0; i < arguments.length; i++) { if (typeof(arguments[i]) == 'function') funs[funs.length] = { key: funs.length, func: arguments[i] }; }
        if (funs.length > 1) {
            var data = {},
                finalF = funs.length > 0 ? funs.pop().func : null,
                len = funs.length,
                ret = {};
            var ff = function(key) { ret[key] = true; var retlen = 0; for (var k in ret) { retlen++; }; if (retlen == len) { finalF.apply(null, [data]); } };
            V.each(funs, function(v) {
                var value = v;
                value.func.apply(null, [data, function() { ff(value.key); }]);
            });
        } else { finalF.apply(null, [{}]); }
    };
    //异步顺序处理 其结果集最终处理的方式 function(共享的json对象 {})
    V.next = function() {
        var i = 0;
        var funs = arguments;
        var data = {};
        V.whileC2(function() { return funs[i++] }, function(v, next) {
            return (v || next || emptyfunc)(data, next)
        });
    };

    //类处理

    var emptyfunc = function() {};
    //callback(func,paras,call):允许被func直接返回值或者返回一个callback(call)，或者不返回值(undefined)但是默认接收最后一个参数为callback三种调用方式即，值，延迟回调,回调方式均可'
    V.callback = function(func, paras, call) {
        V.tryC(function() {
            var call2 = call ? call : emptyfunc;
            paras = paras || [];
            paras.push(call2);
            var data = func.apply(null, paras);
            switch (typeof(data)) {
                case 'function':
                    data(null, call2);
                    break;
                case 'undefined':
                    break;
                default:
                    call2.apply(null, data.length ? data : [null, data])
                    break;
            }
        }, call);
    };
    V.getType = function(x) {
        if (x == null) {
            return "null";
        }
        var t = typeof x;
        if (t != "object" && t != 'Object') {
            return t;
        }
        if (V.isArray(x)) {
            return 'Array';
        }
        var c = Object.prototype.toString.apply(x);
        c = c.substring(8, c.length - 1);
        if (c != "Object") {
            return c;
        }
        if (x.constructor == Object) {
            return c;
        }
        if (x.prototype && "classname" in x.prototype.constructor &&
            typeof x.prototype.constructor.classname == "string") {
            return x.constructor.prototype.classname;
        }
        return "ukObject";
    };
    //VJ.inherit.apply(this,[parent,[……args]])
    V.inherit = function(parent, args) {
        //绕过了parent的构造函数，重新链接原型链条
        var _temp = (function() {
            var F = function() {};
            F.prototype = parent.prototype;
            F.prototype.isF = true;
            return new F();
        })();
        _temp.constructor = parent;
        if (!this.prototype) {
            //这里确认是实例
            //确定是打断了原型链 使得this的原型为Object		
            parent.apply(this, args);
            //从新接驳原型链 使得原型链上的prototype都设置到最早的类的prototype上了
            if (this.__proto__ && !this.__proto__.isF) {
                this.__proto__.constructor.prototype = _temp.__proto__.constructor.prototype;
            }
            //son.prototype = _temp; //这里可以分层 但是会使得prototype实例变了又变 废弃
            this.__proto__ = _temp;
            //父类方法只能找到静态方法
            this.base = this.__proto__.constructor.prototype;
        } else {
            console.log('如果失败，需要配合子类构造函数中使用parent.apply(this,[***])');
            //这里确认是类定义
            this.prototype = _temp;
        }
    };
    /* 频繁创建的对象可以这样定义 常用不经常创建可采用第一种方式定义
    var pa = function(){
    	var _ = this;
    	_.a = 22;
    };
    V.merge(pa.prototype,{
    	test1:function(){console.log(this.a);}
    },true);
    var son = function(){
    	var _ = this;       
    	pa.apply(_,[]);
    	_.a = 33;
    	_.b = 44;
    };
    V.inherit2(son,pa,{
    	test2:function(){console.log(this.a);},
    	test1:function(){son.test1.apply(this);console.log(this.b);}
    });
    new son().test1();
     */
    V.inherit2 = function(son, father, methods) {
        var f = function() {};
        f.prototype = father.prototype;
        son.prototype = new f();
        son.inherits2 = true;
        for (var k in father.prototype) son[k] = father.prototype[k];
        for (var k in methods) {
            son.prototype[k] = methods[k];
        }
    };
    //使用new 新建类，要求传入的为类本身
    V.create2 = function(type, args) {
        if (typeof(type) == 'function') {
            args = V.isArray(args) ? args : [args];
            return true ? (function() {
                var ret = function() {
                    type.apply(this, args);
                };
                V.inherit2(ret, type, {});
                return new ret();
            })() : new function() { type.apply(this, args) };
        } else V.showException('请传入类定义');
    };
    //使用eval方式生成对象，要求类定义在this域中
    V.create3 = function(type, args) {
        var ret = '(new ' + type + '(';
        if (V.isArray(args)) {
            for (var i in args) {
                ret += 'args[' + i + '],'
            }
            if (args.length > 0) {
                ret = ret.substr(0, ret.length - 1);
            }
        }
        return eval(ret + '))');
    };
    //用于数组，对象的深度合并功能。moveIndex属性用于设定移动至的位置，mergeIndex只用于合并数组中的第几个对象 需要进入reference 当为true时会发生状态的改变
    //例如
    //var ret = V.merge({a:22,c:23},{a:34,b:33},{d:"2334",f:true,g:function(){alert("hahaha");}},{h:[1,2,3,4]});
    //var ret = V.merge({a:[{a:2},{b:3}]},{a:[{moveIndex:3,j:3},{k:4}],b:25});
    //var ret = V.merge({a:[{a:2},{b:3}]},{a:[{mergeIndex:3,j:3},{k:4}],b:25});
    var _clone = function(source) {
        switch (V.getType(source)) {
            case 'Object':
            case 'object':
            case 'ukObject':
                return _merge({}, source);
            case 'array':
            case 'Array':
                var aim = [];
                for (var i in source) {
                    aim.push(_clone(source[i]));
                }
                return aim;
            default:
                return source;
        }
    };
    var _merge = function(aim, source) {
        if (aim == undefined) return _clone(source);
        switch (V.getType(source)) {
            case 'Array':
                //处理数组
                var hasmergeIndex = false;
                for (var i3 = 0, k = source[i3]; i3 < source.length; i3++, k = source[i3]) {
                    if (k === null || k === undefined) continue;
                    if (typeof(k.mergeIndex) == "number") {
                        hasmergeIndex = true;
                        if (aim.length < (k.mergeIndex + 1)) {
                            aim[aim.length] = k;
                        } else {
                            aim[i3] = _merge(aim[i3], k);
                        }
                    } else if (typeof(k.moveIndex) == "number") {
                        hasmergeIndex = true;
                        aim.splice(k.moveIndex, 0, k);
                    }
                }
                if (!hasmergeIndex) {
                    aim = _clone(source);
                }
                return aim;
            case 'object':
            case 'Object':
            case 'ukObject':
                if (typeof(aim) == 'string') return source;
                else {
                    for (var i in source)
                        aim[i] = _merge(aim[i], source[i]);
                    return aim;
                }
                break;
            case 'null':
                return (source === undefined) ? aim : source;
            default:
                return source;
        }
    };
    V.merge = function() {
        var argu = arguments;
        if (argu.length < 2) { return argu[0] ? argu[0] : {} };
        if (argu.length > 0 && true == argu[argu.length - 1]) {
            var _ = argu[0];
            for (var i2 = 1; i2 < argu.length - 1; i2++)
                _ = _merge(_, argu[i2]);
            return _;
        } else {
            var _ = {};
            for (var i2 = 0; i2 < argu.length; i2++)
                _ = _merge(_, argu[i2]);
            return _;
        }
    };

    //自动判断获取userAgent状态
    V.userAgent = {
        ie: false,
        firefox: false,
        chrome: false,
        safari: false,
        opera: false,
        mobile: false,
        pc: false,
        pad: false,
        iphone: false,
        android: false,
        refresh: function() {
            V.userAgent.width = (function() {
                //兼容IOS 与 andriod 但是千万不要设置body的高度为定制 应该为100%
                if (document.body && document.body.clientWidth > 0)
                    return document.body.clientWidth;
                else
                    return document.documentElement.clientWidth;
            })();
            V.userAgent.height = (function() {
                //兼容IOS 与 andriod 但是千万不要设置body的高度为定制 应该为100%
                if (document.body && document.body.clientHeight > 0)
                    return document.body.clientHeight;
                else
                    return document.documentElement.clientHeight;
            })();
        }
    };
    V.userAgent.refresh();
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/msie ([\d]+)/)) ? V.userAgent.ie = s[1]:
        (s = ua.match(/firefox\/([\d.]+)/)) ? V.userAgent.firefox = s[1] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? V.userAgent.chrome = s[1] :
        (s = ua.match(/opera.([\d.]+)/)) ? V.userAgent.opera = s[1] :
        (s = ua.match(/version\/([\d.]+).*safari/)) ? V.userAgent.safari = s[1] : 0;
    (s = ua.match(/(mobile)/)) ? V.userAgent.mobile = true: false;
    (s = ua.match(/(ipad)|(mediapad)/)) ? (V.userAgent.pad = true, V.userAgent.mobile = false) : false;
    (s = ua.match(/(android)|(linux)/)) ? (V.userAgent.android = true) : false;
    (s = ua.match(/(iphone)|(mac)/)) ? (V.userAgent.iphone = true) : false;
    V.userAgent.pc = !(V.userAgent.mobile || V.userAgent.pad);
    for (var key in V.userAgent) { if (key != 'pc' && key != 'width' && key != 'height' && key != 'refresh' && V.getValue(V.userAgent[key], false)) { V.userAgent.name = key; } }
    console.log("VJ.userAgent:" + V.userAgent.name);
    if (V.getValue(V.userAgent.ie, false)) {
        var ver = V.userAgent.ie;
        eval('VJ.userAgent.ie' + ver + ' = true;V.userAgent.name=\'ie' + ver + '\';');
    }
    V.watch = function(restart) {
        if (!start || restart) {
            start = new Date();
            console.log('VJ.watch开始' + start);
        } else {
            console.log('VJ.watch 持续了:' + start.diff('ms', new Date()));
        }
    };

    //DOM处理

    /* 生成新元素
     *-- 参数1：tag 标签
     *-- 参数2：样式class
     *-- 参数3：标签内内容
     *-- 案例：V.newEl("div","divClass","我的div");
     */
    V.newEl = function(tag, style, txt) {
        var elm = $(document.createElement(tag));
        if (txt != "") {
            elm.html(txt);
        }
        if (style != "") {
            elm.addClass(style);
        }
        return elm;
    };
    V.encHtml = function(html) {
        //20120328 白冰 只转换标点符号!    
        //return encodeURIComponent(V.getValue(html, '').replace(/\r\n/g, ''));
        return (V.getValue(html, '').replace(/[\r\n]+/g, '>v>j>').replace(/\s+/g, ' ').replace(/>v>j>/g, '\r\n').replace(new RegExp('<|>|~|(\r\n)|!|@|#|\\$|%|\\^|;|\\*|\\(|\\)|_|\\+|\\{|\\}|\\||:|\"|\\?|`|\\-|=|\\[|\\]|\\\|;|\'|,|\\.|/|，|；', 'g'), function(a) { return encodeURIComponent(a); }));
    };
    //对字符串进行解码
    V.decHtml = function(html) {
        return decodeURIComponent(html || '');
    };
    V.setChecked = function(node, value) {
        function setCheckBox(node2, value) {
            $(node2).attr('checked', value);
            if (V.userAgent.ie6 || V.userAgent.ie7) {
                var chk = $(node2);
                if (V.isValid(chk.get(0))) {
                    chk.get(0).defaultChecked = value;
                    chk.get(0).checked = value;
                }
            }
        };
        if (node.length) {
            $(node).each(function(i, v) {
                setCheckBox(v, value);
            });
        } else {
            setCheckBox(node, value);
        }
    };
    V.getChecked = function(node) {
        if (V.userAgent.ie6 || V.userAgent.ie7) {
            if (V.isValid(node.get(0))) {
                return node.get(0).checked;
            }
            return null;
        } else {
            return node.prop ? node.prop('checked') : node.attr('checked');
        }
    };
    V.maxlength = function() {
        $("textarea[maxlength]").unbind('change').change(function(event) {
            var _ = $(this);
            _.val(_.val.substring(0, _.attr("maxlength")));
        });
    };
    //注册默认配置

    V._settings = {};
    V._exSettings = {};
    //设置默认配置
    V.getSettings = function(key, data) {
        if (!V.isValid(V._settings[key])) {
            if (V.isValid(V._exSettings[key])) {
                V._settings[key] = V.merge(V.getValue(data, {}), V._exSettings[key]);
                delete V._exSettings[key];
            } else
                V._settings[key] = V.getValue(data, {});
        }
        return V._settings[key];
    };
    //扩展默认配置
    V.extendSettings = function(key, data) {
        if (V.isValid(V._settings[key])) {
            V._settings[key] = V.merge(V._settings[key], data);
        } else {
            if (V.exSettings[key]) {
                V._exSettings[key] = V.merge(V._exSettings[key], V.getValue(data, {}));
            } else {
                V._exSettings[key] = V.getValue(data, {});
            }
        }
    };

    //ajax

    //处理自定义TJson格式 如一般是[包[库[表[行]]]] [['Rindex','ID'],['1','6e014f804b8f46e1b129faa4b923af2d'],['2','6e014f804b8f46e1b129faa4b923a23d']]
    V.evalTJson = function(data) {
        //转换表用的
        var _evalTJson = function(_dt) {
            var res = [];
            $(_dt).each(function(i, v) {
                if (0 == i) return;
                var s = {};
                $(v).each(function(q, v2) {
                    s[_dt[0][q]] = v2;
                });
                res[i - 1] = s;
            });
            return res;
        };
        data = data[0];
        var res = [];
        for (var i in data) {
            var v = data[i];
            res[i] = _evalTJson(v);
        };
        return res;
    };
    var checkValue = function(p) {
        switch (typeof(p)) {
            case 'number':
            case 'boolean':
                return p;
            case 'undefined':
            case 'object':
                return "\"\"";
            default:
                return "\"" + p + "\"";
        }
    };
    V.toTJson = function(data) {
        if (data) {
            if (!V.isArray(data)) data = [data];
            var res = [];
            if (V.isArray(data) && data[0] && V.isArray(data[0])) {
                for (var i in data) {
                    res[i] = V.toTJson(data[i]);
                }
            } else {
                //找到第一个不是数组的实例对象进行处理
                res[0] = [];
                for (var k in data[0]) {
                    res[0][res[0].length] = "\"" + k + "\"";
                }
                for (var v in data) {
                    var obj = [];
                    for (var k2 in data[v])
                        obj[obj.length] = checkValue(data[v][k2]);
                    res[res.length] = (obj);
                }
            }
            return res;
        } else return [];
    };
    /*
    V.ajax用于使用默认值
    --案例
    V.ajax({
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
    V.ajax = function(data) {
        var funcsucc = V.merge(V.getSettings("ajax", {
            async: true,
            type: "POST",
            dataType: "text",
            cache: false,
            beforeSend: function(request) {},
            success: function(data, status) {
                var _this = this;
                try {
                    var hasFalse = false;
                    switch (typeof(data)) {
                        case "string":
                            data = data.replace(/[\r\n]+/g, '');
                            if (data.replace(/^(\[+\]+)/g, '').length === 0) {
                                hasFalse = true;
                            } else {
                                hasFalse = (data.toLowerCase().indexOf('[false') >= 0 ?
                                    (data.toLowerCase().indexOf('[false:') >= 0 ? (function() {
                                        var _data = data.toLowerCase().match(/\[false:[^\]]+\]/g);
                                        if (_data && _data.length > 0) {
                                            return _data[0].substr(7, _data[0].length - 8);
                                        } else return true;
                                    })() : true) :
                                    false);
                            }
                            break;
                        case "object":
                            if (data) {
                                $(data).each(function(i, v) {
                                    v = v + '';
                                    hasFalse = (hasFalse || v == 'False' || v == 'false');
                                });
                            } else hasFalse = true;
                            break;
                        case 'undefined':
                        default:
                            V.showException('V.Query success方法 name:typeof错误 type:' + typeof(data));
                            hasFalse = true;
                            break;
                    }
                    if (!hasFalse) {
                        setTimeout(function() { V.tryC(function() { _this.bindData.apply(_this, [_this.filtData(eval(data))]); }); }, 1);
                    } else {
                        setTimeout(function() { V.tryC(function() { _this.noData(hasFalse); }); }, 1);
                    }
                } catch (e) {
                    V.showException('V._ajaxOption success方法', e);
                }
            },
            error: function(request, status, error) {
                V.showException('V._ajaxOption error方法 status:' + status, error);
            },
            complete: function(request, status) {
                //手动回收资源
                request = null;
            },
            filtData: function(data) {
                //用来处理数据过滤的
                return V.evalTJson(data)[0][0];
            },
            bindData: function(data) {
                //这里使用的是过滤后的数据
            },
            noData: function() {
                //这里说明没有获取到数据
            }
        }), data);
        if (data.jsonp) {
            if (!V._ajaxcall) {
                V._ajaxcall = {};
            }
            var random = V.random();
            V._ajaxcall[random] = function(data) {
                delete V._ajaxcall[random];
                funcsucc.success(data, null);
            };
            V.getRemoteJSON(data.url + (data.url.indexOf('?') >= 0 ? '&' : '?') + (data.jsonp == true ? '_bk' : data.jsonp) + '=VJ._ajaxcall[' + random + ']&' + $.param(data.data));
        } else {
            $.ajax(funcsucc);
        }
    };
    /*
    获取远程JSON
    --案例
    V.getRemoteJSON("");
    */
    V.getRemoteJSON = function(url) {
        var data = { filtURI: function(url) { return url; } };
        if (V.userAgent.ie) {
            //解决IE界面线程停滞，无法显示动画的问题
            window.setTimeout(function() {
                $.getScript(V.getSettings("getRemote", data).filtURI(url), function() {});
            }, 500);
        } else {
            $.getScript(V.getSettings("getRemote", data).filtURI(url), function() {});
        }
    };
    /* 同步获取js模块 */
    function _V_() {}
    /*_V_内部方法
     *-- 参数1：url， js或css的路径
     *-- 参数2：获取方式get，post
     *-- 参数3：post字符串
     *-- 参数4：是否异步，true,false
     *-- 参数5：回调方法
     */
    _V_.prototype.create = function(URL, fun, pStr, isSyn, callBack) {
            //1为新浏览器，用XMLHttpRequest；2为IE5、6，用ActiveXObject("Microsoft.XMLHTTP")；3为本地（火狐除外，fox还会用type：1来读本地xml）
            this.type = null;
            this.responseObj = null;
            //
            this.xmlURL = URL || null;
            this.xmlFun = fun || "get";
            this.postStr = pStr || "";
            if (!this.xmlURL) return;
            //获取xmlReq对象
            this.xhReq = this.getXMLReq();
            if (this.xhReq == null) {
                alert("Your browser does not support XMLHTTP.");
                return;
            }
            //请求处理函数，分为异步和同步分别处理，同步处理需要放在“提交请求”后，负责无效
            //异步的回调处理
            if (isSyn && (isSyn == true || isSyn == "true") && this.type != 3) {
                //alert("异步")
                //指定响应函数
                this.xhReq.onreadystatechange = function() {
                    if (this.readyState == 4 && (this.status == 200 || this.status == 0)) {
                        if (callBack) {
                            callBack(this.responseXML.documentElement);
                        } else
                            return this.responseXML.documentElement;
                    }
                };
            }
            //提交请求
            //alert(this.type)
            if (this.type != 3) {
                this.xhReq.open(this.xmlFun, this.xmlURL, (isSyn && (isSyn == true || isSyn == "true")) ? true : false);
                this.xhReq.send((this.xmlFun && this.xmlFun.toLowerCase() == "post") ? this.postStr : null);
                this.responseObj = this.xhReq.responseText;
            } else if (this.type == 3) //这是IE用来读取本地xml的方法
            {
                this.xhReq.open("get", this.xmlURL, "false");
                this.responseObj = this.xhReq;
            }
            //同步的回调处理
            if ((isSyn != null && (isSyn == false || isSyn == "false")) || this.type == 3) {
                if (callBack)
                    callBack(this.responseObj);
                else
                    return this.responseObj;
            }
        }
        /*获取DOM对象兼容各个浏览器，可能不完善，继续测试
         */
    _V_.prototype.getXMLReq = function() {
            var xmlhttp = null;
            if (window.XMLHttpRequest) { // code for all new browsers like IE7/8 & FF
                xmlhttp = new XMLHttpRequest();
                this.type = 1;
            } else if (window.ActiveXObject) { // code for IE5 and IE6
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                this.type = 2;
            }
            //如果读取本地文件，则使用AXObject，因为httpRequest读取本地文件会报拒绝访问
            if ((document.location.href.indexOf("http://") < 0 || document.location.href.indexOf("https://") < 0) && window.ActiveXObject) {
                xmlhttp = new ActiveXObject("Microsoft._V_");
                this.type = 3;
            }
            return xmlhttp;
        }
        /*请求失败
         */
    _V_.prototype.abort = function() {
        this.xhReq.abort();
    };
    /*获取js代码后，添加到页面内容下
     */
    function _V_AppendScript(data, callback) {
        var ua = navigator.userAgent.toLowerCase();
        var isOpera = ua.indexOf("opera") > -1
        var isIE = !isOpera && ua.indexOf("msie") > -1
        var head = document.getElementsByTagName("head")[0] || document.documentElement,
            script = document.createElement("script");
        script.type = "text/javascript";
        //不能使用 src 因为其已经获得了JS 只是需要加载入当前页面，所以不会有onload事件。
        /*
            var done = false;
			
            script.type = 'text/javascript';
            script.language = 'javascript';
            script.src = url;
            script.onload = script.onreadystatechange = function(){
            if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
            done = true;
            script.onload = script.onreadystatechange = null;
            if (callback){
            callback(script);
            }
            }
            }
            */
        if (isIE) script.text = data;
        else script.appendChild(document.createTextNode(data));
        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        // This arises when a base node is used (#2709).	
        head.insertBefore(script, head.firstChild);
        head.removeChild(script);
        if (callback) {
            callback(script);
        }
    };
    /* 添加 js 和 css 引用
    *-- 参数1：url， js或css的路径
    *-- 参数2：tag， 标签名称'head'或'body' ，可以为空，默认加在'head'内
    *-- 案例：V.include("script/jquery1.3/ui.core.js");
    todo 跨域同步
    */
    var getHost = function(url) {
        var ret = (url + '').match(/http[s]?:\/\/[^\/]+/g) + '';
        if (ret && ret.length > 0) { return ret.substr(7); } else { return ''; }
    };

    V.isCrossdomain = function(url) {
        var host = getHost(url);
        return !(host.eq('') || host.eq(getHost(window.location.href) + ''));
    };
    V.include = function(url, tag, callback) {
        //如果已经使用本方法加载过 就不再加载。
        if (V.getSettings("include")[url]) return;
        V.getSettings("include")[url] = true;
        if (tag == null) { tag = 'head'; }
        var parentNode = document.getElementsByTagName(tag).item(0);
        var s = url.split('.');
        var styleTag = s[s.length - 1].toLowerCase();
        if (styleTag.indexOf('?') >= 0) {
            styleTag = styleTag.substr(0, styleTag.indexOf('?'));
        }
        if (styleTag == "js") {
            //异步if(callback){
            //	$.getScript(url,function(res,status){
            //		if(status=='success'){
            //			//TODO 考虑h5缓存机制 可以直接eval
            //			callback();
            //		}
            //	});
            //异步if 
            if (V.isCrossdomain(url) && typeof(XDomainRequest) != 'undefined') {
                V.showException('跨域同步加载仅支持Chrome40以上，IE10以上版本，而且js跨域加载的IIS返回头部添加Access-Control-Allow-Origin: * 版本，如果仍然不可用请在config.js中将可能跨域请求path路径上的js的转入头部，或者在页面onStart时先获取原需要异步获取的对象!');
                var request = new XDomainRequest();
                request.open("GET", url);
                request.timeout = 5000;
                request.send();
                console.log('xdomainrequest');
                _V_AppendScript(request.responseText, callback)
                if (callback) {
                    callback();
                }
            } else {
                var thisJsDom = new _V_();
                thisJsDom.create(url, "get", null, false, function(data) {
                    _V_AppendScript(data, callback)
                });
                if (callback) {
                    callback();
                }
            }
        }
        if (styleTag == "css") {
            new_element = document.createElement("link");
            new_element.setAttribute("type", "text/css");
            new_element.setAttribute("rel", "stylesheet");
            new_element.setAttribute("href", url);
            new_element.setAttribute("media", 'screen');
            parentNode.appendChild(new_element);
            if (callback) {
                callback();
            }
        }
    };

    //添加regist call has clean Command与Event功能
    V.applyCommandAndEvent = function(S) {
        S._settings = {};
        S._exSettings = {};
        //获取不存在就配置
        S.getSettings = function(key, data) {
            if (!V.isValid(S._settings[key])) {
                if (V.isValid(S._exSettings[key])) {
                    S._settings[key] = V.merge(V.getValue(data, {}), S._exSettings[key]);
                    delete S._exSettings[key];
                } else
                    S._settings[key] = V.getValue(data, {});
            }
            return S._settings[key];
        };
        //扩展默认配置
        S.extendSettings = function(key, data) {
            if (V.isValid(S._settings[key])) {
                S._settings[key] = V.merge(S._settings[key], data);
            } else {
                if (S.exSettings[key]) {
                    S._exSettings[key] = V.merge(S._exSettings[key], V.getValue(data, {}));
                } else {
                    S._exSettings[key] = V.getValue(data, {});
                }
            }
        };
        S.clearSettings = function() { S._settings = {}; };
        S.registCommand = function(name, func) {
            var comms = S.getSettings('comms', []);
            var data = comms[name];
            if (V.isValid(data) && typeof(data) != 'function') {
                func.apply(null, data);
            }
            comms[name] = func;
        };
        /*
        V用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
        --案例
        S.callCommand('showXXList',[{id:1}])
        */
        S.callCommand = function(name, data) {
            var caller = arguments.caller;
            var comms = S.getSettings('comms', []);
            var func = comms[name];
            data = V.merge([], V.isArray(data) ? data : [data]);
            if (V.isValid(func) && typeof(func) == 'function') {
                V.once(function() { func.apply(caller, data); });
            } else {
                comms[name] = data;
            }
        };
        /*
        用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false;
        --案例
        if (!S.hasCommand('editor.open')) S.part("/FileServer/layout/editor/editor.htm");
        */
        S.hasCommand = function(name) {
            var comms = S.getSettings('comms', []);
            var func = comms[name];
            return (V.isValid(func) && typeof(func) == 'function');
        };

        /*
        仅限iframe方式调用时，先取消原页面添加的方法
        //业务逻辑深度交叉，iframe落后的控件连接方式时使用
        一定要在part前
        --案例
        S.cleanCommand('editor.open');
        S.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
        */
        S.cleanCommand = function(name) {
            var comms = S.getSettings('comms', []);
            delete comms[name];
        };
        /*
        V用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
        并约定1分钟内 允许注册者多次被触发
        --案例
        S.registEvent('showXXList',getData),S.registEvent(['showXXList',''],getData)
        */
        S.registEvent = function(name, func, isTop) {
            var fun = function(name, func, isTop) {
                var events = S.getSettings('events', []);
                var funs = events[name];
                if (!V.isValid(funs)) {
                    funs = [];
                    events[name] = funs;
                }
                if (typeof(func) == 'function') {
                    if (isTop && !funs.top) {
                        funs.top = func;
                        funs.unshift(func);
                    } else {
                        if (isTop && funs.top) { V.showException('S.registEvent:' + name + ' 事件已经有订阅者被置顶!'); }
                        funs.push(func);
                    }
                    var ecall = S.getSettings('eventcall', {});
                    ecall = ecall[name] ? ecall[name] : {};
                    if (ecall.time && ecall.time >= (new Date().getTime())) {
                        V.once(function() {
                            func.apply(ecall.caller, ecall.data);
                        });
                    }
                }
            };
            if (V.isArray(name)) {
                name.forEach(function(v) {
                    fun(v, func, isTop);
                });
            } else {
                fun(name, func, isTop);
            }
        };
        /*
        V用于调用被调用页面注册的事件以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
        并约定1分钟内 允许注册者多次被触发
        --案例
        S.callEvent('showXXList',[{id:1}])
        */
        S.callEvent = function(name, data) {
            var caller = arguments.caller;
            var events = S.getSettings('events', []);
            var funs = events[name];
            data = V.merge([], V.isArray(data) ? data : [data]);
            if (V.isValid(funs) && V.isArray(funs)) {
                V.each(funs, function(func) {
                    //报错不下火线
                    V.tryC(function() {
                        func.apply(caller, data);
                    });
                });
            }
            var ecall = S.getSettings('eventcall', {});
            if (!ecall[name]) { ecall[name] = {}; }
            ecall = ecall[name];
            ecall.time = new Date().add('n', 1).getTime();
            ecall.data = data;
            ecall.caller = caller;
        };
        /*
        用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false;
        --案例
        if (!S.hasEvent('editor.open')) S.part("/FileServer/layout/editor/editor.htm");
        */
        S.hasEvent = function(name) {
            var events = S.getSettings('events', []);
            var funs = events[name];
            if (V.isValid(funs) && V.isArray(funs)) {
                return true;
            }
            return false;
        };

        /*
        仅限iframe方式调用时，先取消原页面添加的方法
        //业务逻辑深度交叉，iframe落后的控件连接方式时使用
        一定要在part前
        --案例
        S.cleanEvent('editor.open');
        S.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
        */
        S.cleanEvent = function(name) {
            var events = S.getSettings('events', []);
            delete events[name];
        };
    };
    V.applyCommandAndEvent(V);

    //TOTest
    V.getEvent = function(event) {
        return event || window[event];
        //event || window.event;
    };
    V.getTarget = function(event) {
        return event.target || event.srcElement;
    };
    V.cancel = function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    };
    V.stopProp = function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBobble = true;
        }
    };

    //业务优化

    V.formatPrice = function(number, decimals, dec_point, thousands_sep) {
        number = (number + '').replace(/[^0-9+-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 2 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function(n, prec) {
                var k = Math.pow(10, prec);
                return '' + Math.round(n * k) / k;
            };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/B(?=(?:d{3})+(?!d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    };
    V.qs = new function(qs) { // optionally pass a querystring to parse
        this.params = {};
        if (qs == null) qs = location.search.substring(1, location.search.length);
        //等同_VJ_QueryString.prototype.get
        this.get = function(key, default_) {
            var value = this.params[key];
            return (value != null) ? value : default_;
        };
        this.contains = function(key) {
            var value = this.params[key];
            return (value != null);
        };
        if (qs.length == 0) return;
        // Turn <plus> back to <space>
        // See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
        qs = qs.replace(/\+/g, ' ');
        var args = qs.split('&'); // parse out name/value pairs separated via &

        // split out each name=value pair
        for (var i = 0; i < args.length; i++) {
            var pair = args[i].split('=');
            var name = decodeURIComponent(pair[0]);

            var value = (pair.length == 2) ?
                decodeURIComponent(pair[1]) :
                name;

            this.params[name] = value;
        }
    };

    /**
     * 获取字符串的哈希值
     * @param {String} str
     * @param {Boolean} caseSensitive
     * @return {Number} hashCode
     */
    V.hash = function(str, caseSensitive) {
            caseSensitive = V.getValue(caseSensitive, false);
            if (!caseSensitive) {
                str = str.toLowerCase();
            }
            // 1315423911=b'1001110011001111100011010100111'
            var hash = 1315423911,
                i, ch;
            for (i = str.length - 1; i >= 0; i--) {
                ch = str.charCodeAt(i);
                hash ^= ((hash << 5) + ch + (hash >> 2));
            }
            return (hash & 0x7FFFFFFF);
        }
        //处理永不重复的随机数

    var index = 0;
    V.random = function() {
        return parseInt('' + (new Date()).getTime() + (index++));
    };
    ['toJsonString', 'json'].forEach(function(v) {
        var m = v;
        V[v] = function(val) {
            if (!JSON)
                V.include('/Scripts/json.js');
            V.toJsonString = function() { return JSON.stringify.apply(JSON, arguments); };
            V.json = function() { return JSON.parse.apply(JSON, arguments); };
            return V[m](val);
        }
    });
})(VJ, jQuery) : 0;