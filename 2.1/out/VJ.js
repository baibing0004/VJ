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
    window.VJ = window.top.VJ ? window.top.VJ : { load: false, cross: false }) : (
    window.VJ = window.VJ ? window.VJ : { load: false, cross: true }
);
(!VJ.load) ? (function(V, $) {
    V.load = true;
    V.isValid = function(data) {
        return (typeof(data) != "undefined" && data != null && data != 'null' && data !== false && ((data.replace && data.replace(/\s/g, '').length > 0) || data.replace == undefined));
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
                __.data.push(str);
                __._length += str.length;
            };

        }
    };
    sb.prototype.append = function(str) {
        var _ = this,
            __ = this;
        str = !!(str) ? __._append(str) : '';
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
    V.each = function(data, func, finalf, isSync) {
        if (isSync) {
            if (!V.isArray(data)) data = Array.prototype.slice.call(data, 0);
            for (var i in data) {
                try {
                    func && func(data[i], i);
                } catch (e) {
                    showException2(e);
                }
            }
            try {
                finalf && finalf();
            } catch (e) {
                showException2(e);
            }
        } else {
            data = Array.prototype.slice.call(data, 0);
            V.whileC(function() { return data.shift(); }, func, finalf, isSync);
        }
    };
    V.each2 = function(data, func, finalf, isSync) {
        data = Array.prototype.slice.call(data, 0);
        V.whileC2(function() { return data.shift(); }, func, finalf, isSync);
    };
    //var forfunc = function(v, func) { return func(v.key, v.value); };
    //异步遍历对象的方法
    V.forC = function(data, func, finalf, isSync) {
        if (isSync) {
            for (var i in data) {
                try {
                    func(i, data[i]);
                } catch (e) {
                    showException2(e);
                }
            }
            try {
                finalf && finalf();
            } catch (e) {
                showException2(e);
            }
        } else {
            var ret = [];
            for (var i in data) ret.push({ key: i, value: data[i] });
            var exp = func && function() { return ret.shift(); } || emptyfunc;
            V.whileC(exp, function(v) { return func(v.key, v.value); }, finalf, false);
        }
    };
    //var forfunc2 = function(v, func, n) { return func(v.key, v.value, n); };
    //异步链式遍历对象的方法,需要func显式调用传入的next方法
    V.forC2 = function(data, func, finalf, isSync) {
        var ret = [];
        for (var i in data) ret.push({ key: i, value: data[i] });
        var exp = func && function() { return ret.shift(); } || emptyfunc;
        V.whileC2(exp, function(v, n) { return func(v.key, v.value, n); }, finalf, isSync);
    };
    //异步最终处理 其结果集最终处理的方式 function(共享的json对象 {})
    V.finalC = function() {
        var funs = [];
        for (var i = 0; i < arguments.length; i++) { if (typeof(arguments[i]) == 'function') funs.push({ key: funs.length, func: arguments[i] }); }
        if (funs.length > 1) {
            var data = {},
                finalf = funs.length > 0 ? funs.pop().func : null,
                len = funs.length,
                ret = {};
            var ff = function(key) { ret[key] = true; var retlen = 0; for (var k in ret) { retlen++; }; if (retlen == len) { finalf.apply(null, [data]); } };
            V.each(funs, function(v) {
                var value = v;
                value.func.apply(null, [data, function() { ff(value.key); }]);
            });
        } else { finalf.apply(null, [{}]); }
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

    V.tnext = function() {
        var i = 0;
        var funs = arguments;
        var data = {},
            goerr = function() { throw new Error('请在第' + i + '个对象定义g或者go方法') },
            rollbacks = [],
            rollfunc = function() {
                var r = 0;
                V.whileC2(function() { return rollbacks[r++] }, function(v, next) {
                    return (v || next || emptyfunc)(data, next);
                });
            };
        V.whileC2(function() { return funs[i++] }, function(v, next) {
            try {
                var n = function(e) {
                    try {
                        if (e && e.__proto__) {
                            if (e.__proto__.name == "Error") throw e;
                        }
                        rollbacks.unshift(v.r || v.rollback || (function() {
                            throw new Error('请在第' + i + '个对象定义r或者rollback方法');
                        })());
                        if (e) {
                            if (typeof e === 'string') throw new Error(e);
                            throw new Error('第' + i + '个对象条件不满足开始回滚!');
                        }
                        next();
                    } catch (ne) {
                        rollbacks.push(function() {
                            throw ne;
                        });
                        rollfunc();
                    }
                };
                var ret = (v.g || v.go || goerr).apply(v, [data, n]);
            } catch (e) {
                rollfunc();
            }
            return ret;
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
    var _merge = function(aim, source, isLightMerge) {
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
                            aim.push(k);
                        } else {
                            aim[i3] = _merge(aim[i3], k, isLightMerge);
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
                        aim[i] = isLightMerge ? _clone(source[i]) : _merge(aim[i], source[i]);
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
    V.lightMerge = function() {
        var argu = arguments;
        if (argu.length < 2) { return argu[0] ? argu[0] : {} };
        if (argu.length > 0 && true == argu[argu.length - 1]) {
            var _ = argu[0];
            for (var i2 = 1; i2 < argu.length - 1; i2++)
                _ = _merge(_, argu[i2], true);
            return _;
        } else {
            var _ = {};
            for (var i2 = 0; i2 < argu.length; i2++)
                _ = _merge(_, argu[i2], true);
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
    var __s = null;
    V.watch = function(restart) {
        if (!__s || restart) {
            __s = new Date();
            console.log('VJ.watch开始' + __s);
        } else {
            console.log('VJ.watch 持续了:' + __s.diff('ms', new Date()));
        }
        return __s.diff('ms', new Date());
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
        //*()_-'. encodeURIComponent 不能替换
        var other = { "(": "%28", ")": "%29", "*": "%2a", "'": '%27', ".": "%2e", "-": "%2d", "_": "%5f" };
        return ((V.getValue(html, '')
                .match(/[ a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]|<|>|~|(\r\n)|!|@|#|\$|%|\^|;|\*|\(|\)|_|\+|\{|\}|\||:|\"|\?|`|\-|=|\[|\]|\\|;|\'|,|\.|\/|，|；|\s/g) || []).join('')
            .replace(/<|>|~|(\r\n)|!|@|#|\$|%|\^|;|\*|\(|\)|_|\+|\{|\}|\||:|\"|\?|`|\-|=|\[|\]|\\|;|\'|,|\.|\/|，|；|\s/g, function(e) { return other[e] || encodeURIComponent(e); }));
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
            _dt.forEach && _dt.forEach(function(v, i) {
                if (0 == i) return;
                var s = {};
                v.forEach && v.forEach(function(v2, q) {
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
                            data.startWith('{') ? (_this.filtData = function(v) { return v[0]; }, data = '[' + data + ']') : (_this.filtData = function(v) { return V.evalTJson(v)[0][0]; });
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
                            }!hasFalse && V.tryC(function() { _this.bindData.apply(_this, [_this.filtData(eval(data))]); });
                            break;
                        case "object":
                            if (data && data.length) {
                                (data).forEach(function(v) {
                                    v = v + '';
                                    hasFalse = (hasFalse || v == 'False' || v == 'false');
                                });
                            } else hasFalse = true;
                            !hasFalse && V.tryC(function() { _this.bindData.apply(_this, [data]); });
                            break;
                        case 'undefined':
                        default:
                            V.showException('V.Query success方法 name:typeof错误 type:' + typeof(data));
                            hasFalse = true;
                            break;
                    }
                    (hasFalse) && V.tryC(function() { _this.noData(true); });

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
            data.cross && funcsucc && (
                funcsucc.crossDomain = true,
                funcsucc.xhrFields = {
                    withCredentials: true
                }
            )
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
    V.includeversion = '';
    V.include = function(url, tag, callback) {
        //如果已经使用本方法加载过 就不再加载。
        if ((url || '').startWith('~') && V.getSettings("include")['last']) {
            var prefix = V.getSettings("include")['last'].split('/');
            prefix.pop();
            url = prefix.join('/') + url.replace(/~/, '');
        }
        if (V.getSettings("include")[url]) return;
        V.getSettings("include")[url] = true;
        V.getSettings("include")['last'] = url;
        V.includeversion && url.indexOf('?') < 0 && (url = url + (url.indexOf('?') > 0 ? '&' : '?') + V.includeversion);
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
        S.callCommand = function(name) {
            var caller = arguments.caller;
            var comms = S.getSettings('comms', []);
            var func = comms[name];
            var data = Array.prototype.slice.apply(arguments, [1]);
            //主动降维 兼容旧版代码 但是存在可能降错维度的可能
            V.isArray(data[0]) && data.length == 1 && (data = data[0]);
            if (V.isValid(func) && typeof(func) == 'function') {
                V.once(function() {
                    var rets = [];
                    data.forEach(function(v) {
                        try {
                            rets.push('object'.eq(V.getType(v)) ? JSON.parse(JSON.stringify(v)) : v);
                        } catch (e) {
                            rets.push(v);
                        }
                    });
                    func.apply(caller, rets);
                });
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
        S.callEvent = function(name) {
            var caller = arguments.caller;
            var events = S.getSettings('events', []);
            var funs = events[name];
            var data = Array.prototype.slice.apply(arguments, [1]);
            //主动降维 兼容旧版代码 但是存在可能降错维度的可能
            V.isArray(data[0]) && data.length == 1 && (data = data[0]);
            if (V.isValid(funs) && V.isArray(funs)) {
                V.each(funs, function(func) {
                    //报错不下火线
                    V.tryC(function() {

                        var rets = [];
                        data.forEach(function(v) {
                            try {
                                rets.push('object'.eq(V.getType(v)) ? JSON.parse(JSON.stringify(v)) : v);
                            } catch (e) {
                                rets.push(v);
                            }
                        });

                        func.apply(caller, rets);
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
    V.cancel = function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    };
    V.stopProp = function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBobble = true;
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
        return ('' + (index++) + (new Date()).getTime());
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
})(VJ, jQuery) : 0;(function(V, $) {
    V.config = {};
    var C = V.config;
    C.Configs = {
        ConfigConverts: {
            AppSettings: { type: 'VJ.config.AppSettingsConfigConvert' }
        }
    };
    C.Config = function() {
        var _ = this;
        _.data = {};
        _.getValue = function(key) { return _.data[key]; };
        _.setValue = function(key, value) { _.data[key] = value; };
        _.merge = function(config) {
            _.data = V.merge(_.data, config.data);
        };
    };
    //ConfigConvert的基础类模型说明 基本上只有接口定义 未实现任何功能
    C.ConfigConvert = function() {
        var _ = this;
        _.toConfig = function(val) { return null; };
        _.toStrings = function(config) { return ""; };
        _.needConfig = false;
    };
    C.AppSettingsConfigConvert = function() {
        var _ = this; {
            V.inherit.apply(_, [C.ConfigConvert, []]);
        }
        _.toConfig = function(val) {
            var conf = new C.Config();
            val = V.getValue(val, {});
            for (var i in val) {
                conf.data[i] = val[i];
            }
            return conf;
        };
    };
    C.ConfigManager = function(parent, resource) {
        var _ = this;
        var dic = {};
        var data = {};
        var hasUpdate = false;
        _.getConfig = function(key) {
            if (!V.isValid(data[key])) {
                data[key] = new C.ProxyConfig(_, key);
            }
            return data
        };
        _.getConfigValue = function(config, key) {
            var func = function() {
                if (parent) {
                    return parent.getConfigValue(config, key);
                } else return null;
            };
            //console.log(dic);
            if (!dic[config]) {
                return func.apply(_, []);
            } else {
                var value = dic[config].getValue(key);
                return !value ? func.apply(_, []) : value;
            }
        };
        _.setConfigValue = function(config, key, value) {
            hasUpdate = true;
            var func = function() {
                if (parent) {
                    parent.setConfigValue(config, key, value);
                }
            };
            if (!dic[config]) {
                func.apply(_, []);
            } else {
                dic[config].setValue(key, value);
            }
        };
        _.update = function() {
            if (hasUpdate) {
                _.adapter.update(_, dic, resource);
            }
        }; {
            var that = _;
            if (parent == null) {
                //根解析器默认添加类解析器 ConvertsConfig
                //ConfigConverts是一个Config对象 Config对象中包含第一个基础解析器ConfigConverts，基础解析器解析出来的是一个Config对象。
                dic['ConfigConverts'] = new function() {
                    var _ = this; {
                        V.inherit.apply(_, [C.Config, []]);
                        //创建ConfigConverts解析器
                        _.data['ConfigConverts'] = new function() {
                            var _ = this;
                            //根据val获取对应的ConfigConvert, ConfigConverts：{'AppSettings':{type:'',path:''}}
                            _.toConfig = function(val) {
                                return new function() {
                                    var _ = this;
                                    V.inherit.apply(_, [C.Config, []]);
                                    for (var i in val) {
                                        _.data[i] = (function() {
                                            var conf = val[i];
                                            if (conf.path) {
                                                V.include(conf.path);
                                            }
                                            return V.create3(conf.type, []);
                                        })();
                                    }
                                };
                            };
                            _.toStrings = function(config) { V.showException('基础解析器不支持此功能'); };
                        };
                    }
                };
            }
            _.adapter = C.ConfigAdapter.prototype.getInstance();
            _.adapter.fill(_, dic, resource);
        }
    };
    C.ProxyConfig = function(config, confkey) {
        var _ = this;
        V.inhert(C.Config, []);
        _.getValue = function(key) { return config.getConfigValue(confkey, key); };
        _.setValue = function(key, value) { return config.setConfigValue(confkey, key, value); };
        _.merge = function(config) { V.showException('不支持的功能'); };
    };
    C.ConfigAdapter = function() {
        var _ = this;
        _.fill = function(cm, dic, resource) {
            resource = resource.load();
            if (typeof(resource) == 'string') {
                resource = eval('(' + resource + ')');
            }
            for (var i in resource) {
                var convert = cm.getConfigValue('ConfigConverts', i);
                if (!convert) {
                    V.showException('ConfigConverts 没有找到对应的解析器' + i);
                } else {
                    var val = convert.toConfig(resource[i], convert.needConfig ? cm : null);
                    if (!val) {
                        console.log('ConfigConverts 解析失败' + i + ':');
                        console.log(resource[i]);
                    } else {
                        if (dic[i]) {
                            dic[i].merge(val);
                        } else {
                            dic[i] = val;
                        }
                    }
                }
            }
        };
        _.update = function(cm, dic, resource) {
            var data = {};
            for (var i in dic) {
                var convert = cm.getConfigValue('ConfigConverts', i);
                if (!convert) {
                    V.showException('ConfigConverts 没有找到对应的解析器' + i);
                } else {
                    var val = convert.toString(dic[i]);
                    if (!val) {
                        console.log('ConfigConverts 解析失败' + i + ':');
                        console.log(dic[i]);
                    } else {
                        data[i] = val;
                    }
                }
            }
            resource.save((function() {
                var ret = '{';
                for (var i in data) {
                    ret = ret + i + ':' + data[i] + ',';
                }
                if (ret.substr(ret.length - 1) == ',') {
                    ret = ret.substr(0, ret.length - 1);
                }
                return ret + '}';
            })());
        };
    };
    C.ConfigAdapter.prototype.getInstance = function() {
        if (!C.ConfigAdapter.prototype.instance) {
            C.ConfigAdapter.prototype.instance = new C.ConfigAdapter();
        }
        return C.ConfigAdapter.prototype.instance;
    };
    C.getConfigManagerFromObj = function(cm, obj) {
        if (!obj) return cm;
        return new C.ConfigManager(cm, (function() {
            return new function() {
                var _ = this;
                if (typeof(obj) === 'string') {
                    obj = eval('(' + obj + ')');
                }
                _.load = function() { return obj; };
                _.save = function() { V.showException('getConfigManagerFromObj不支持此方式'); }
            };
        })());
    };
    C.getConfigManagerFromJS = function(cm, name, path) {
        if (!name) return cm;
        if (path) {
            if (typeof(path) == 'string' && path.indexOf(';') >= 0) { path = path.split(';'); }
            if (V.isArray(path)) {
                for (var i in path) {
                    V.include(path[i]);
                }
            } else
                V.include(path);
        }
        return new C.ConfigManager(cm, (function() {
            return new function() {
                var _ = this;
                if (typeof(name) === 'string') {
                    name = eval('(' + name + ')');
                }
                _.load = function() { return name; };
                _.save = function() { V.showException('getConfigManagerFromJS不支持此方式'); }
            };
        })());
    };
    C.getBaseConfigManager = function() {
        if (!C.baseConfig) {
            C.baseConfig = C.getConfigManagerFromObj(null, C.Configs);
        }
        return C.baseConfig;
    };
    C.getApplicationConfigManagerFromJS = function(name, path) {
        return C.getConfigManagerFromJS(C.getBaseConfigManager(), name, path);
    };
    C.getApplicationConfigManagerFromObj = function(obj) {
        return C.getConfigManagerFromObj(C.getBaseConfigManager(), obj);
    };
})(VJ, jQuery);//常用基本操作/* 得到日期年月日等加数字后的日期 new Date().add('h',1)*/
Date.prototype.add = function(interval, number) {
        var d = new Date(this.getTime());
        var k = { 'y': 'FullYear', 'q': 'Month', 'm': 'Month', 'w': 'Date', 'd': 'Date', 'h': 'Hours', 'n': 'Minutes', 's': 'Seconds', 'ms': 'MilliSeconds' };
        var n = { 'q': 3, 'w': 7 };
        eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
        return d;
    }
    /* 计算两日期相差的日期年月日等 new Date().diff('h',new Date().add('d',1)); */
Date.prototype.diff = function(interval, objDate2) {
        var d = this,
            i = {},
            t = d.getTime(),
            t2 = objDate2.getTime();
        i['y'] = objDate2.getFullYear() - d.getFullYear();
        i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
        i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
        i['ms'] = objDate2.getTime() - d.getTime();
        // i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
        // i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
        // i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
        // i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
        // i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
        i['w'] = Math.floor((t2 - t) / (604800000.0));
        i['d'] = Math.floor((t2 - t) / 86400000.0);
        i['h'] = Math.floor((t2 - t) / 3600000.0);
        i['n'] = Math.floor((t2 - t) / 60000.0);
        i['s'] = Math.floor((t2 - t) / 1000.0);
        return i[interval];
    }
    /* 计算两日期相差的日期年月日等 new Date().diff('h',new Date().add('d',1)); */
Date.prototype.sub = function(interval, objDate2) {
        return Date.prototype.diff.apply(objDate2, [interval, this]);
    }
    /* 计算两日期相差的日期年月日等 new Date().toString('yyyy-MM-dd'); */
Date.prototype.toString = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份           
        "d+": this.getDate(), //日           
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时           
        "H+": this.getHours(), //小时           
        "m+": this.getMinutes(), //分           
        "s+": this.getSeconds(), //秒           
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度           
        "S": this.getMilliseconds() //毫秒           
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (fmt) {} else {
        fmt = 'yyyy/MM/dd HH:mm:ss';
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
//添加string.endWith与startWith方法
String.prototype.endWith = function(str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
};

String.prototype.startWith = function(str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
};

String.prototype.eq = function(str, isOri) {
    str = str + '';
    return isOri ? (this == str) : (this.toLowerCase() == str.toLowerCase());
};
String.prototype.trim = function(chr) {
    switch (chr) {
        case '/':
        case '\\':
        case '?':
        case '[':
        case ']':
        case '.':
        case '*':
        case '(':
        case ')':
        case '{':
        case '}':
        case '|':
        case '^':
        case '$':
        case '+':
            chr = '\\' + chr;
            break;
    }
    return this.replace(VJ.isValid(chr) ? new RegExp('(^(' + chr + ')+)|((' + chr + ')+$)', 'g') : /(^\s+)|(\s+$)/g, "");
}
String.prototype.loadVJ = true;
// /**
//  * 高精度 乘法
//  */
// Math.X = function(a, b) {
//     var ia = a + "";
//     var dig_a = ia.lastIndexOf('.') >= 0 ? (ia.length - ia.lastIndexOf('.') - 1) : 0;
//     var ib = b + '';
//     var dig_b = ib.lastIndexOf('.') >= 0 ? (ib.length - ib.lastIndexOf('.') - 1) : 0;
//     a = a * Math.pow(10, dig_a);
//     b = b * Math.pow(10, dig_b);
//     return (a * b) / Math.pow(10, dig_a + dig_b)
// };
// /**
//  * 高精度 除法
//  */
// Math.D = function(a, b) {
//     var ia = a + "";
//     var dig_a = ia.lastIndexOf('.') >= 0 ? (ia.length - ia.lastIndexOf('.') - 1) : 0;
//     var ib = b + '';
//     var dig_b = ib.lastIndexOf('.') >= 0 ? (ib.length - ib.lastIndexOf('.') - 1) : 0;
//     a = a * Math.pow(10, dig_a);
//     b = b * Math.pow(10, dig_b);
//     return (a / b) / Math.pow(10, dig_a + dig_b)
// };

/**
 * 高精度 加法
 */
Math.A = function() {
    var args = [];
    for (var k in arguments) args.push(arguments[k]);
    let ret = args.shift() * 1000;
    while (args.length)
        ret += (args.shift() * 1000)
    return ret / 1000;
}

/**
 * 高精度 减法
 */
Math.S = function() {
    var args = [];
    for (var k in arguments) args.push(arguments[k]);
    let ret = args.shift() * 1000;
    while (args.length)
        ret -= (args.shift() * 1000)
    return ret / 1000;
}

/**
 * 高精度 乘法
 */
Math.X = function() {
    var args = [];
    for (var k in arguments) args.push(arguments[k]);
    let ret = args.shift() * 1000;
    while (args.length)
        ret *= args.shift();
    return ret / 1000;
};

/**
 * 高精度 除法
 */
Math.D = function() {
    var args = [];
    for (var k in arguments) args.push(arguments[k]);
    let ret = args.shift() * 1000;
    while (args.length)
        ret /= args.shift();
    return ret / 1000;
};(function(V, $) {
    V.middler = {};
    V.config.Configs = V.merge(V.config.Configs, { ConfigConverts: { Middler: { type: 'VJ.middler.MiddlerConfigConvert' } } });
    var M = V.middler;
    M.Middler = function(cm) {
        var _ = this;
        var KEY = 'Middler'; {}
        _.getObjectByAppName = function(app, name) {
            try {
                return cm.getConfigValue(KEY, new function() {
                    var _ = this; {}
                    _.getValue = function(config) {
                        return config.getValueByName(app, name);
                    };
                });
            } catch (e) {
                V.showException(app + ":" + name, e);
            }
        };
        _.setObjectByAppName = function(app, name, val) {
            try {
                return cm.setConfigValue(KEY, new function() {
                    var _ = this; {}
                    _.setValue = function(config, val) {
                        return config.setValueByName(app, name, val);
                    };
                }, val);
            } catch (e) {
                V.showException(app + ":" + name, e);
            }
        };
        _.getTypeByAppName = function(app, name) {
            try {
                return cm.getConfigValue(KEY, new function() {
                    var _ = this; {}
                    _.getValue = function(config) {
                        return config.getTypeByName(app, name);
                    };
                });
            } catch (e) {
                V.showException(app + ":" + name, e);
            }
        };
    };
    M.MiddlerConfig = function() {
        var _ = this; {
            V.inherit.apply(_, [V.config.Config, []]);
        }
        _.getValue = function(key) {
            return key.getValue(_);
        };
        _.setValue = function(key, val) {
            return key.setValue(_, val);
        };
        _.merge = function(config) {
            if (config.data) {
                _.data = {};
                for (var i in config.data) {
                    _.data[i] = config.data[i];
                }
            }
        };
        _.getValueByName = function(app, name) {
            if (_.data[app]) {
                if (_.data[app][name])
                    return _.data[app][name].getValue();
                else return _.data[app].getValue(name);
            } else return null;
        };
        _.setValueByName = function(app, name, val) {
            if (_.data[app] && _.data[app][name]) {
                return _.data[app][name].setValue(val);
            } else return null;
        };
        _.getTypeByName = function(app, name) {
            if (_.data[app]) {
                if (_.data[app][name])
                    return _.data[app][name].getType();
                else return _.data[app].getType(name);
            } else return null;
        };
    };
    /*
    Middler:{
    	appName:{
    		method:'',
    		mode:'',
    		path:'',
    		host:'',
    		pack:'',
    		ObjectName:{type:'',path:'',method:'',mode:'',constractparalength:'',params:[
    			{type:'',path:'',method:'',mode:'',constractparalength:''},
    			{ref:''},
    			{a:1,b:2},
    			{a:1},
    			{b:2},
    			'',
    			1,
    			{middler:true},
    			{self:true}
    		]},
    		ObjectsName:{path:'',method:'',mode:'',constractparalength:'',params:[
    			{type:'',path:'',method:'',mode:'',constractparalength:''},
    			{ref:''},
    		]}
    	}
    }
    */
    M.MiddlerConfigConvert = function() {
        var _ = this;
        //私有
        var __ = {}; {
            //继承关系需要以后由Middler管理	
            V.inherit.apply(_, [V.config.ConfigConvert, []]);
            __.scripts = {}, __.spascripts = [];
            __.loadScript = function(key) {
                if (__.scripts[key]) { console.log(key + '代码已经注入'); } else if (__.scripts._skey) { console.log(__.scripts._skey + '已注册但是尚未有代码注入'); } else if (__.spascripts.length > 0) { __.scripts[key] = __.spascripts.pop(); } else __.scripts._skey = key;
            };
            __.clearload = function() { delete __.scripts._skey; };
            __.hasScript = function(key) { return __.scripts[key] };
            __.getScript = function(key, config) {
                var scr = __.scripts[key];
                if (scr && scr.path) {
                    V.each(scr.path.replace(/,/g, ';').split(';'), function(v) {
                        V.include(v);
                    }, function() { delete scr.path; }, true);
                }
                return (scr && scr.func) ? { inherit: scr.inherit, func: scr.func } : null;
            };
            //切记在代码中使用V.registScript的对象在被继承时必须使用middler重新获取类型方可继承
            //todo 找不到的控件使用host方式默认加载尝试，regist应可说明自己使用前置JS和css
            V.registScript = __.registScript = function() {
                var args = arguments.length > 2 ? { path: arguments[0], inherit: arguments[1].replace(/,/g, ';').split(';'), func: arguments[2], regist: true } : arguments.length > 1 ? { path: arguments[0], func: arguments[1], regist: true } : { func: arguments[0], regist: true };
                if (__.scripts._skey) {
                    var key = __.scripts._skey;
                    delete __.scripts._skey;
                    __.scripts[key] = args;
                } else __.spascripts.push(args);
            }
            _.needConfig = true;
            //生成参数管理器
            __.convertParas = function(config, params, defParam, app, pcm) {
                var _ = this;
                var paras = []; {
                    params = V.getValue(params, []);
                    for (var i in params) {
                        var val = params[i];
                        if (typeof(val) == 'object') {
                            if (val === null || val === undefined) {
                                paras.push(null);
                            } else if (val.ref) {
                                var index = val.ref.indexOf('/') >= 0 ? val.ref.indexOf('/') : val.ref.indexOf('\\') >= 0 ? val.ref.indexOf('\\') : -1;
                                var appName = index >= 0 ? val.ref.substr(0, index) : defParam.app;
                                var name = appName ? val.ref.substr(index + 1) : val.ref;
                                //paras.push(config.getValueByName(appName,name));
                                paras.push({ ref: appName, name: name });
                            } else if (val.type || val.path) {
                                var name = V.random() + '';
                                app[name] = __.convertContainer(config, val, defParam, app, pcm);
                                paras.push({ ref: defParam.app, name: name });
                            } else if (val.self) {
                                paras.push(pcm);
                            } else if (val.middler) {
                                paras.push(new M.Middler(pcm));
                            } else if (val.params && val.param) {
                                var name = V.random() + '';
                                app[name] = __.convertContainer(config, val, defParam, app, pcm);
                                paras.push({ ref: defParam.app, name: name, param: val.param });
                            } else if (V.isArray(val)) {
                                //objects
                                var name = V.random() + '';
                                app[name] = __.convertContainer(config, { params: val }, defParam, app, pcm);
                                paras.push({ ref: defParam.app, name: name });
                            } else {
                                //普通JSON
                                paras.push(val);
                            }
                        } else {
                            paras.push(val);
                        }
                    }
                }
                return new function() {
                    var _ = this; {}
                    _.getParas = function() {
                        var ret = [];
                        for (var i in paras) {
                            var val = paras[i];
                            (val !== null && val !== undefined && val.ref) && (val = config.getValueByName(val.ref, val.name));
                            ret.push(val);
                        }
                        return ret;
                    };
                };
            };
            __.createValue = function(type, paras, pcm) {
                var script = __.hasScript(type);
                if (script.regist && !paras.length)
                    paras = [null, null];
                script = __.getScript(type);
                if (script.inherit) script.inherit.forEach(function(v) {
                    paras.push(pcm.Middler.getTypeByAppName(V.view.APP || 'VESH.view', v));
                });
                script = script.func;
                return V.create2(script, paras)
            };
            //生成生成器
            __.convertCreater = function(config, v, defParam, app, pcm) {
                var method = V.getValue(v.method, defParam.method);
                var path = V.getValue(v.path, defParam.path);
                var spapath = V.getValue(v.spapath, false);
                var host = V.getValue(v.host, defParam.host);
                var type = ((V.isValid(v.type) && v.type.indexOf('\.') == 0) ? defParam.pack : '') + v.type;
                if (type == 'undefined' && !V.isValid(v.ref)) {
                    if (V.isValid(v.path) || V.isValid(v.spapath)) {
                        type = v.type = '' + V.random();
                    } else if (V.isValid(v.params)) {
                        method = "objects";
                    } else {
                        method = "self";
                    }
                }
                var constructorparalength = V.getValue(v.constructorparalength, defParam.constructorparalength);
                //使用Objects的默认配置对下传递 仅仅传递 path 和 pack
                var para = __.convertParas(config, v.params, V.merge(defParam, { path: path, pack: defParam.pack, host: host }), app, pcm);
                if (spapath) {
                    __.spaloadScript(type);
                    __.clearload();
                }
                return new function() {
                    var _ = this;
                    _.getType = function() {
                        if (path) {
                            __.loadScript(type);
                            V.each(path.split(';'), function(v) {
                                if (defParam.host && v.toLowerCase().indexOf('../') < 0 && v.toLowerCase().indexOf('http://') < 0 && v.toLowerCase().indexOf('https://') < 0) {
                                    v = defParam.host + v;
                                }
                                V.include(v);
                            }, function() {
                                __.clearload();
                            }, true);
                        } else if (spapath) {
                            __.spaloadScript(type);
                        }
                        var paras = para.getParas();
                        return __.hasScript(type) ? __.getScript(type).func : eval('(' + type + ')');
                    };
                    _.getValue = function() {
                        if (path) {
                            //以后可以修改 目前是有缓存的 path改为支持;号隔开的各个路径
                            __.loadScript(type);
                            V.each(path.split(';'), function(v) {
                                if (defParam.host && v.toLowerCase().indexOf('../') < 0 && v.toLowerCase().indexOf('http://') < 0 && v.toLowerCase().indexOf('https://') < 0) {
                                    v = defParam.host + v;
                                }
                                V.include(v);
                            }, function() {
                                __.clearload();
                            }, true);
                        } else if (spapath) {
                            __.spaloadScript(type);
                        }
                        var paras = para.getParas();
                        switch (method) {
                            case "self":
                                return v;
                            case "objects":
                                return paras;
                            default:
                            case 'constructor':
                                return __.hasScript(type) ? __.createValue(type, paras, pcm) : V.create3(type, paras);
                            case 'bean':
                                var val = __.hasScript(type) ? __.createValue(type, [], pcm) : eval('(new ' + type + '())');
                                //bean设置出错
                                if (val && paras) {
                                    for (var i in paras) {
                                        if (typeof(paras[i]) === 'object') {
                                            if (v.params[i].name && val['set' + v.params[i].name]) {
                                                val['set' + v.params[i].name].apply(val, [paras[i]]);
                                            } else if (v.params[i].param && val['set' + v.params[i].param]) {
                                                val['set' + v.params[i].param].apply(val, paras[i]);
                                            } else {
                                                val = V.merge(val, paras[i]);
                                            }
                                        }
                                    }
                                }
                                return val;
                            case 'factory':
                                var script = __.hasScript(type);
                                if (script) {
                                    if (script.regist && !paras.length)
                                        paras = [null, null];
                                    script = __.getScript(type);
                                    if (script.inherit) script.inherit.forEach(function(v) {
                                        paras.push(pcm.Middler.getTypeByAppName(V.view || 'VESH.view', v));
                                    });
                                    script = script.func;
                                }
                                return script ? script.apply(script, paras) : eval('(' + type + '.apply(' + type + ',paras))');
                            case 'factorybean':
                                var script = __.hasScript(type);
                                if (script) {
                                    if (script.regist && !paras.length)
                                        paras = [null, null];
                                    script = __.getScript(type);
                                    if (script.inherit) script.inherit.forEach(function(v) {
                                        paras.push(pcm.Middler.getTypeByAppName(V.view || 'VESH.view', v));
                                    });
                                    script = script.func;
                                }
                                var val = script ? script.apply(script, paras) : eval('(' + type + '.apply(' + type + ',paras))');
                                if (paras && val) {
                                    for (var i in paras) {
                                        if ((!constructorparalength || i >= constructorparalength) && typeof(paras[i]) === 'object') {
                                            if (v.params[i].name && val['set' + v.params[i].name]) {
                                                val['set' + v.params[i].name].apply(val, [paras[i]]);
                                            } else if (v.params[i].param && val['set' + v.params[i].param]) {
                                                val['set' + v.params[i].param].apply(val, paras[i]);
                                            } else {
                                                val = V.merge(val, paras[i]);
                                            }
                                        }
                                    }
                                }
                                return val;
                            case 'constructorbean':
                                var val = __.hasScript(type) ? __.createValue(type, paras, pcm) : V.create3(type, paras);
                                if (paras && val) {

                                    for (var i in paras) {
                                        if ((!constructorparalength || i >= constructorparalength) && typeof(paras[i]) === 'object') {
                                            if (v.params[i].name && val['set' + v.params[i].name]) {
                                                val['set' + v.params[i].name].apply(val, [paras[i]]);
                                            } else if (v.params[i].param && val['set' + v.params[i].param]) {
                                                val['set' + v.params[i].param].apply(val, paras[i]);
                                            } else {
                                                val = V.merge(val, paras[i]);
                                            }
                                        }
                                    }
                                }
                                return val;
                        }
                    };
                }
            };
            //转换成Container对象
            __.convertContainer = function(config, v, defParam, app, pcm) {
                    var mode = V.getValue(v.mode, defParam.mode);
                    var size = V.getValue(v.size, defParam.size);
                    var creater = __.convertCreater(config, v, defParam, app, pcm);
                    var getType = function() { return creater.getType(); };
                    //生成保持器
                    {
                        switch (mode) {
                            default:
                                case 'static':
                                return new function() {
                                var obj = null;
                                var _ = this;
                                _.getType = getType;
                                _.getValue = function() {
                                    if (obj == null) {
                                        obj = creater.getValue();
                                    }
                                    return obj;
                                };
                                _.setValue = function(val) {
                                    if (obj === val) {} else {
                                        //todo 彻底删除变量
                                        val = null;
                                    }
                                };
                            };
                            case 'instance':
                                    return new function() {
                                    var _ = this;
                                    _.getType = getType;
                                    _.getValue = function() {
                                        return creater.getValue();
                                    };
                                    _.setValue = function(v) {
                                        if (v.dispose) {
                                            V.tryC(v.dispose);
                                        }
                                    };
                                };
                            case 'pool':
                                    return new function() {
                                    var _ = this;
                                    _.getType = getType;
                                    V.collection && V.include('/scripts/VJ.collection.min.js');
                                    var pool = new V.collection.Pool(size, function() { return creater.getValue(); });
                                    _.getValue = function() {
                                        return pool.getValue();
                                    };
                                    _.setValue = function(v) {
                                        pool.setValue(v);
                                    };
                                };
                        }
                    }
                }
                //转换成App对象 todo app成为默认关键词 不可重复定义
            __.convertApp = function(config, v, app, pcm) {
                var keys = { method: 'constructor', mode: 'static', path: false, pack: false, constructorparalength: false, size: 50, app: app, host: '' };
                return new function() {
                    var _ = this;
                    var defParam = {};
                    for (var i in keys) {
                        defParam[i] = V.getValue(v[i], keys[i]);
                    }
                    defParam['app'] = app;
                    for (var i in v) {
                        if (keys[i] || keys[i] == false) {
                            //console.log('过滤的'+i);
                        } else {
                            //转换成Container对象
                            _[i] = __.convertContainer(config, v[i], defParam, _, pcm);
                        }
                    }
                    //根据name默认计算并添加对象 对应registScirpt使用
                    _.getValue = function(name) {
                        _[name] = __.convertContainer(config, { path: name.replace(/[\._]/g, '/') + '.js' }, defParam, _, pcm);
                        return _[name].getValue();
                    };
                    _.getType = function(name) {
                        _[name] = __.convertContainer(config, { path: name.replace(/[\._]/g, '/') + '.js' }, defParam, _, pcm);
                        return _[name].getType();
                    };
                };
            };
        }
        _.toConfig = function(val, pcm) {
            var config = new M.MiddlerConfig();
            if (!pcm.Middler) pcm.Middler = new M.Middler(pcm);
            for (var i in val) {
                //处理app
                var app = __.convertApp(config, val[i], i, pcm);
                config.data[i] = app;
            }
            return config;
        };
        _.toStrings = function(val) {
            V.showException('Middler 不支持此操作');
        };
    };
    M.getMiddlerFromJS = function(type, path) {
        return new M.Middler(V.config.getApplicationConfigManagerFromJS(type, path));
    };
    M.getMiddlerFromObj = function(obj) {
        return new M.Middler(V.config.getApplicationConfigManagerFromObj(obj));
    };
    M.getObjectByAppName = function(cm, app, name) {
        if (!V.middlers) {
            V.middlers = {};
        }
        if (!cm.randomid) {
            cm.randomid = V.random();
            V.middlers[cm.randomid] = new M.Middler(cm);
        }
        return V.middlers[cm.randomid].getObjectByAppName(app, name);
    };
    M.getTypeByAppName = function(cm, app, name) {
        if (!V.middlers) {
            V.middlers = {};
        }
        if (!cm.randomid) {
            cm.randomid = V.random();
            V.middlers[cm.randomid] = new M.Middler(cm);
        }
        return V.middlers[cm.randomid].getTypeByAppName(app, name);
    };
})(VJ, jQuery);(function(V, $) {
    V.ni = {};
    var N = V.ni;
    //依托Middler框架完成对数据类型文件的处理，包括ajax jsonp localStorage sessionStorage Sqlite ObjectDB(即自定义function) WebSocket等等数据源类型的操作
    //实现对如下格式文件的处理 分别定义ajax
    /*
    	Ni:{
    		ajaxtest2:{command:'http://localhost/VESHTest/Module/help/test.tjsonp?_n=recorder',dbtype:'tjson',params:{limit:11},template:'template1'},
    		ajaxtest1:{command:'http://localhost/KDAPI/Module/GetOrderTrackItems.tjsonp?_n=Order',dbtype:'tjson',params:{},template:'template1'},
    		'ajaxtest1.Cache':{command:function(res,params){return res[params.cacheKey];不写即使用默认值},dbtype:'json',params:{},template:'template2'},
    		'ajaxtest1.Set':{command:function(res,params){res[params.cacheKey] = params.cacheValue;不写即使用默认值},dbtype:'json',params:{timeout1:{interval:'s',number:50}},template:'template2'},
    		sqlinsert:{command:'create table if not exists table1(name Text,message text,time integer);insert into table1 values(?,?,?);',dbtype:'json',params:{data:[]},template:'sqltemp'},
    		sqlselect:{command:'select * from table1;',dbtype:'json',params:{data:[]},template:'sqltemp'},
    		sqlselect2:{command:'select * from table1 where name=?',dbtype:'json',params:{data:[]},template:'sqltemp'},		
    		Name1:{command:'',params:{},dbtype:'json/tjson',template:'仅在Middler中调用NiMultiTemplateDecorator时启用'},
    		wstest1: { command: 'abc.json', dbtype: 'json', params: {}, template: 'ws' },
    		wstest2: { command: 'bcd.json?_n=MT, dbtype: 'json', params: {}, template: 'ws' }
    	}
    */
    /*
    var t = middler.getObjectByAppName('Ni','templatename');
    var res = t.execute('aaa.GetProductDetail',{ProductID:111},function(result){
    	var res = result.last();
    });
    middler.setObjectByAppName('Ni','templatename',t);
    */
    //分离NiDataConfig完成Ni格式文件处理
    //分离NiDataConfigConvert完成对Ni格式转成Config
    //用于处理 Ni文件定义
    {
        V.config.Configs = V.merge(V.config.Configs, { ConfigConverts: { Ni: { type: 'VJ.ni.NiDataConfigConvert' } } });
        N.NiDataConfig = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [V.config.Config, []]);
                __.getValue = _.getValue;
                _.getValue = function() { var ret = __.getValue.apply(this, arguments); if (ret) { ret.merge = V.getValue(ret.merge, V.merge); } return ret; };
            }
        };
        N.NiDataConfigConvert = function() {
            var _ = this,
                __ = {}; { V.inherit.apply(_, [V.config.ConfigConvert, []]); }
            _.toConfig = function(val) {
                var ret = new N.NiDataConfig();
                if (val) {
                    if (typeof(val) == 'object') {
                        for (var i in val) {
                            if (val[i]) {
                                ret.data[i] = VJ.merge({ params: {} }, val[i]);
                            }
                        }
                    }
                }
                return ret;
            };
            _.toStrings = function(config) { V.showException('VJ.ni.NiDataConfigConvert不支持此功能'); };
        };
    }
    //分离NiTemplate进行连续事务提交和顺序操作
    {
        /**
         * 
         * @param {数据源} res 
         * @param {ni对象configManager对象} cm 
         * @param {转换URL地址的后缀 默认'.tjson?_n=MT'} defExt 
         */
        N.NiTemplate = function(res, cm, defExt, merge) {
            var _ = this,
                __ = this; {
                _.lstCmd = [];
                _.KEY = 'Ni';
                _.result = new N.NiDataResult();
                _.transaction = false;
                _.res = res;
                _.cm = cm;
                _.defExt = defExt || '.tjson?_n=MT';
                _.dbtype = _.defExt.split('?')[0].trim('.');
                _.jsonp = _.dbtype.indexOf('p') >= 0 ? '_bk' : false;
                _.dbtype = _.dbtype.indexOf('tjson') >= 0 ? 'tjson' : 'json';
                _.merge = merge || function() {
                    var ret = VJ.merge.apply(this, arguments);
                    //mysql特有
                    if (!ret.hasMarge && ret.PageIndex) { ret.hasMarge = true, ret.PageIndex = ret.PageIndex * ret.PageSize; }
                    return ret;
                };
            }
        };
        N.NiTemplate.inherit2 = true;
        V.merge(N.NiTemplate.prototype, {
            _addCommand: function(name, params, func) {
                var _ = this;
                var cmd = _.cm.getConfigValue(_.KEY, name);
                if (cmd) {
                    _.lstCmd.push(V.merge(cmd, {
                        name: cmd.command,
                        params: (cmd.merge || _.merge)(cmd.params, V.getValue(params, {})),
                        func: func,
                        key: name,
                        jsonp: cmd.jsonp || _.jsonp,
                        dbtype: cmd.dbtype || _.dbtype
                    }));
                } else {
                    //如果没有覆盖那么采用默认路径转换
                    _.lstCmd.push({
                        name: (name.indexOf('http') < 0 || name.startWith('/')) ? (name.replace(/[\.\/\\]/g, '/') + _.defExt) : (name || ''),
                        params: _.merge(V.getValue(params, {})),
                        func: func,
                        key: name,
                        jsonp: _.jsonp,
                        dbtype: _.dbtype
                    })
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _.res.getDBConnection();
                        if (_cms.length > 1) { conn.transaction = true; }
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        var i = 0;
                        delete _.result.error;
                        V.whileC2(function() { return _cms[i++]; }, function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                error && (_.result.error = error);
                                _.result.add((!data || (V.isArray(data) && data.length == 0)) ? false : data, v.key);
                                V.tryC(function() { _func(_.result); });
                                next();
                            });
                        }, function() {
                            if (conn.transaction && conn.commit) { conn.commit(); }
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            },
            execute: function(name, params, func) {
                var _ = this;
                _._addCommand(name, params, func);
                if (!_.transaction) {
                    _.commit();
                }
                return _.result;
            },
            excute: function() {
                return this.execute.apply(this, arguments);
            },
            commit: function() {
                var _ = this;
                return _._execute();
            }
        }, true);
        N.NiTemplateManager = function(cm, appName) {
            var _ = this,
                __ = this; {
                _.KEY = V.getValue(appName, 'Ni');
                __.middler = new V.middler.Middler(cm);
            }
        };
        N.NiTemplateManager.prototype.execute = function(tempName, name, params, func) {
            var _ = this,
                __ = this;
            var temp = __.middler.getObjectByAppName(_.KEY, tempName);
            if (temp) {
                temp.execute(name, params, function(data) {
                    V.tryC(function() { func(data); });
                    __.middler.setObjectByAppName(_.KEY, tempName, temp);
                });
            } else { throw new Error('没有找到Template:' + tempName); }
        };

        N.NiTemplateManager.prototype.excute = N.NiTemplateManager.prototype.execute;

        //获取json对象 使得不管json还是tjson都按照最终结果进行使用
        //分离NiDataResult完成获取数据工作	
        N.NiDataResult = function() {
            var _ = this,
                __ = this; {
                __.data = {};
                __.kv = {};
                __.datas = [];
            }
        };
        V.merge(N.NiDataResult.prototype, {
            get: function(key) {
                var _ = this,
                    __ = this;
                return __.data[key] ? __.data[key] : __.kv[key] ? __.kv[key][1] : null;
            },
            add: function(data, name) {
                var _ = this,
                    __ = this;
                if (data && !__.kv[name]) {
                    __.data[__.datas.length] = data;
                    __.kv[name] = [__.datas.length, data];
                    __.datas.push(data);
                } else if (__.kv[name]) {
                    var id = __.kv[name][0];
                    __.data[id] = data;
                    __.kv[name] = [__.datas.length, data];
                    __.datas[id] = data;
                }
            },
            single: function() {
                var _ = this,
                    __ = this;
                return (_.hasData()) ? (function() {
                    var data = _.get(__.datas.length - 1);
                    return (data[0] && data[0][0]) ? data[0][0] : {};
                })() : null;
            },
            last: function() {
                var _ = this,
                    __ = this;
                return _.get(__.datas.length - 1);
            },
            each: function(key, func) {
                var _ = this,
                    __ = this;
                var val = _.get(key);
                if (val && V.isArray(val)) {
                    V.each(val, func);
                }
            },
            clear: function() {
                var _ = this,
                    __ = this;
                __.datas = [];
                __.data = {};
                __.kv = {};
            },
            hasData: function(key) {
                var _ = this,
                    __ = this;
                return key ? (function() {
                    var v = _.get(key);
                    if (v) { for (var k in v) return true; }
                    return false;
                })() : (__.datas.length > 0 && (function() {
                    var hasData = false;
                    __.datas.forEach(function(v) {
                        if (!hasData && v) {
                            for (var k in v) hasData = true;
                        }
                    });
                    return hasData;
                })());
            }
        }, true);
    }
    //分离NiDataResource完成static instance pool各种调用方式
    {
        N.NiDataResource = function(factory, params) {
            var _ = this,
                __ = {}; {
                _.fac = factory;
                _.params = V.getValue(params, {});
            }
            _.getDBConnection = function() {
                var conn = _.fac.createDBConnection();
                conn.params = V.merge(conn.params, _.params);
                conn.params.resource = V.getValue(_.params.resource, conn.params.resource);
                if (!conn.isOpen) {
                    conn.open();
                }
                return conn;
            };
            _.backDBConnection = function(conn) { _.fac.backDBConnection(conn); }
            _.getDBCommand = function() { return _.fac.createDBCommand(); }
        };
        N.NiInstanceDataResource = function(factory, params) {
            var _ = this; {
                V.inherit.apply(_, [N.NiDataResource, [factory, params]]);
            }
        };
        N.NiStaticDataResource = function(factory, params) {
            var _ = this,
                __ = {}; {
                __.conn = null;
                V.inherit.apply(_, [N.NiDataResource, [factory, params]]);
                __.getDBConnection = _.getDBConnection;
            }
            _.getDBConnection = function() {
                if (!__.conn) {
                    __.conn = __.getDBConnection();
                }
                return __.conn;
            };
            _.backDBConnection = function(conn) { if (conn != __.conn) { if (conn.isOpen && conn.close) { conn.close(); } } };
        };
        N.NiPoolDataResource = function(factory, params, size) {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataResource, [factory, params]]);
                __.getDBConnection = _.getDBConnection;
                size = V.getValue(size, 50);
                __.pool = new VJ.collection.Pool(size, function() {
                    var conn = __.getDBConnection();
                    conn.dispose = conn.close;
                    return conn;
                });
            }
            _.getDBConnection = function() {
                var val = __.pool.getValue();
                return val;
            };
            _.backDBConnection = function(conn) {
                __.pool.setValue(conn);
            };
        };
    }
    //DataFactory常用基类
    {
        N.NiDataFactory = function() {
            var _ = this,
                __ = {}; {}
            _.createDBConnection = function() { return new NiDataConnection(); };
            _.createDBCommand = function() { return new N.NiDataCommand(); }
            _.backDBConnection = function(conn) {
                if (conn.isOpen) {
                    conn.close();
                }
            };
        };
        N.NiDataConnection = function() {
            var _ = this,
                __ = {}; {
                _.isOpen = false;
                _.params = {};
            }
            _.open = function() { _.isOpen = true; };
            _.close = function() { _.isOpen = false };
            _.invoke = function(cmd, func) { func(false); };
        };
        N.NiDataCommand = function() {
            var _ = this,
                __ = {}; {
                _.connection = null;
                _.command = '';
                _.params = { dbtype: 'json' };
            }
            _.execute = function(result, func) {
                if (!_.connection || !_.connection.isOpen) {
                    V.showException('数据库未连接');
                    if (func) { func(false); }
                    return;
                } else {
                    _.connection.invoke(_, function(data, error) {
                        try {
                            var hasFalse = false;
                            switch (typeof(data)) {
                                case "string":
                                    data = data.replace(/[\r\n]+/g, '');
                                    if (data.startWith('{')) {
                                        _.dbtype = 'json';
                                        data = '[[' + data + ']]'
                                    };
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
                                    if (!hasFalse) {
                                        //如何判断tjson
                                        try {
                                            data = eval('(' + data.replace(/[\r\n]+/g, '') + ')');
                                        } catch (e) { console.log(data); }
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
                                    V.showException('V.NiDataCommand success方法 name:typeof错误 type:' + data);
                                    hasFalse = true;
                                    break;
                            }
                            if (hasFalse) {
                                data = (hasFalse == true ? false : hasFalse);
                            } else {
                                switch (_.dbtype) {
                                    default:
                                        case 'json':
                                        break;
                                    case 'tjson':
                                            data = V.evalTJson(data);
                                        break;
                                }
                            }
                            if (func) { func(data, data && data[0] && data[0][0] && data[0][0].error || error); }
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    });
                }
            };
            _.excute = _.execute;
        };
    }
    //NiTemplateDecorator NiMultiTemplateDecorator 装饰类 使得TemplateDecorator可以添加缓存，NiMultiTemplateDecorator可以根据Ni文件中定义的template进行操作
    {
        N.NiTemplateDecorator = function(res, cacheres, cm, params, defExt, merge) {
            var _ = this,
                __ = this; {
                N.NiTemplate.apply(_, [res, cm, defExt, merge]);
                _.KEY = 'Ni';
                _.lstCmd2 = {};
                __.params = V.getValue(params, {});
                _.cacheres = cacheres;
            }
        };
        V.inherit2(N.NiTemplateDecorator, N.NiTemplate, {
            setCommand: function(res, params) {
                var _ = this,
                    __ = this;
                params = V.merge(__.params, params);
                //兼容localStorage不可用的状态
                try {
                    if (res.setItem) {
                        res.setItem(params.cacheKey, V.toJsonString({
                            data: params.cacheValue,
                            date: (params.timeout ? new Date().add(params.timeout.interval, params.timeout.number).getTime() : false)
                        }));
                    } else {
                        res[params.cacheKey] = V.toJsonString({
                            data: params.cacheValue,
                            date: (params.timeout ? new Date().add(params.timeout.interval, params.timeout.number).getTime() : false)
                        });
                    }
                } catch (error) {
                    console.log('localStorage/sessionStorage可能不被支持或者跨域:' + e.message);
                }
                return null;
            },
            //可以根据业务逻辑改为根据某个公共字段进行删除
            clearCommand: function(res, params) {
                try {
                    if (res.removeItem) {
                        res.removeItem(params.cacheKey, null);
                    } else if (res[params.cacheKey]) {
                        delete res[params.cacheKey];
                    }
                    return null;
                } catch (error) {
                    console.log('localStorage/sessionStorage可能不被支持或者跨域:' + e.message);
                }
            },
            cacheCommand: function(res, params) {
                try {
                    var val = null;
                    if (res.getItem) {
                        val = V.json(res.getItem(params.cacheKey));
                    } else {
                        if (res[params.cacheKey]) {
                            val = V.json(res[params.cacheKey]);
                        }
                    }
                    if (val) {
                        if (val.date) {
                            if (parseFloat(val.date) < new Date().getTime()) {
                                delete res[params.cacheKey];
                                return null;
                            }
                        }
                        return val.data;
                    } else return null;
                } catch (error) {
                    console.log('localStorage/sessionStorage可能不被支持或者跨域:' + e.message);
                }
            },
            _addCommand: function(name, params, func) {
                var _ = this,
                    __ = this;
                var index = _.lstCmd.length;
                N.NiTemplateDecorator._addCommand.apply(_, [name, params, func]);
                if (_.lstCmd.length != index) {
                    var command = null;
                    var cmd = _.cm.getConfigValue(_.KEY, name + '.Cache');
                    if (!cmd) {
                        cmd = _.cm.getConfigValue(_.KEY, name + '.Clear');
                        if (cmd) {
                            command = cmd.command || _.clearCommand;
                        }
                    } else {
                        command = cmd.command || _.cacheCommand;
                    }
                    if (cmd) {
                        _.lstCmd2[index] = {
                            name: command,
                            key: name,
                            params: cmd.merge(_.lstCmd[_.lstCmd.length - 1].params, { cacheKey: V.hash(name + '.Set.' + V.toJsonString(_.lstCmd[_.lstCmd.length - 1].params)) })
                        }
                    }
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        delete _.result.error;
                        var func = function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    _.result.add(data ? data : false, v.key);
                                    if (_func) {
                                        V.tryC(function() {
                                            _func(_.result);
                                        });
                                    }
                                });
                                if (data && data.length > 0 && !(data.length == 1 && data[0].length == 0)) {
                                    //新增缓存
                                    var _nicmd = cm.getConfigValue(_.KEY, v.key + '.Set');
                                    if (_nicmd) {
                                        var _conn = _.cacheres.getDBConnection();
                                        var _cmd = _.cacheres.getDBCommand();
                                        _cmd.connection = _conn;
                                        _cmd.command = V.getValue(_nicmd.command, _.setCommand);
                                        _cmd.params = _nicmd.merge(_nicmd.params, cmd.params, {
                                            cacheKey: V.hash(v.key + '.Set.' + V.toJsonString(cmd.params)),
                                            cacheValue: data
                                        });
                                        _cmd.execute(_.result, function(data) {
                                            V.tryC(function() { _.cacheres.backDBConnection(_conn); });
                                        });
                                    }
                                }
                                i++;
                                next();
                            });
                        };
                        var i = 0;
                        V.whileC2(function() { return _cms.shift(); }, function(v, next) {
                            var _nicmd = _.lstCmd2[i];
                            //准备处理缓存
                            if (_nicmd) {
                                i++;
                                var _conn = _.cacheres.getDBConnection();
                                var _cmd = _.cacheres.getDBCommand();
                                _cmd.connection = _conn;
                                _cmd.command = _nicmd.name;
                                _cmd.params = V.merge(_nicmd.params, v.params);
                                delete _.result.error;
                                _cmd.execute(_.result, function(data, error) {
                                    V.tryC(function() {
                                        try { _.cacheres.backDBConnection(_conn); } catch (e) {}
                                        error && (_.result.error = error);
                                        if (data) {
                                            _.result.add(data, v.key);
                                            if (v.func) {
                                                V.tryC(function() {
                                                    v.func(_.result);
                                                });
                                            }
                                            next();
                                        } else {
                                            func(v, next);
                                        }
                                    });
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            }
        });
        /**
         * 使用一致的缓存命令和设置命令 继承自NiTemplateDecorator
         * @param {*} res 
         * @param {*} cacheres 
         * @param {*} cm 
         * @param {*} params 
         * @param {*} defExt 
         * @param {*} merge 
         * @param {*} cachecommand 
         * @param {*} setcommand 
         */
        N.NiTemplateCacheDecorator = function(res, cacheres, cm, params, defExt, merge, cachecommand, setcommand) {
            N.NiTemplateDecorator.apply(_, [res, cacheres, cm, defExt, merge]);
            _.cachecommand = cachecommand;
            _.setcommand = setcommand;
        };
        V.inherit2(N.NiTemplateCacheDecorator, N.NiTemplateDecorator, {
            _addCommand: function(name, params, func) {
                var _ = this,
                    __ = this;
                var index = _.lstCmd.length;
                N.NiTemplate._addCommand.apply(_, [name, params, func]);
                if (_.lstCmd.length != index) {
                    var command = null;
                    var cmd = _.cm.getConfigValue(_.KEY, _.cachecommand);
                    if (cmd) {
                        command = cmd.command || _.cacheCommand;
                        _.lstCmd2[index] = {
                            name: command,
                            key: name,
                            params: cmd.merge(_.lstCmd[_.lstCmd.length - 1].params, { cacheKey: V.hash(name + '.Set.' + V.toJsonString(_.lstCmd[_.lstCmd.length - 1].params)) })
                        }
                    }
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        delete _.result.error;
                        var func = function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    _.result.add(data ? data : false, v.key);
                                    if (_func) {
                                        V.tryC(function() {
                                            _func(_.result);
                                        });
                                    }
                                });
                                if (data && data.length > 0 && !(data.length == 1 && data[0].length == 0)) {
                                    //新增缓存
                                    var _nicmd = cm.getConfigValue(_.KEY, _.setcommand);
                                    if (_nicmd) {
                                        var _conn = _.cacheres.getDBConnection();
                                        var _cmd = _.cacheres.getDBCommand();
                                        _cmd.connection = _conn;
                                        _cmd.command = V.getValue(_nicmd.command, _.setCommand);
                                        _cmd.params = _nicmd.merge(_nicmd.params, cmd.params, {
                                            cacheKey: V.hash(v.key + '.Set.' + V.toJsonString(cmd.params)),
                                            cacheValue: data
                                        });
                                        _cmd.execute(_.result, function(data) {
                                            V.tryC(function() { _.cacheres.backDBConnection(_conn); });
                                        });
                                    }
                                }
                                i++;
                                next();
                            });
                        };
                        var i = 0;
                        V.whileC2(function() { return _cms.shift(); }, function(v, next) {
                            var _nicmd = _.lstCmd2[i];
                            //准备处理缓存
                            if (_nicmd) {
                                i++;
                                var _conn = _.cacheres.getDBConnection();
                                var _cmd = _.cacheres.getDBCommand();
                                _cmd.connection = _conn;
                                _cmd.command = _nicmd.name;
                                _cmd.params = V.merge(_nicmd.params, v.params);
                                delete _.result.error;
                                _cmd.execute(_.result, function(data, error) {
                                    V.tryC(function() {
                                        try {
                                            error && (_.result.error = error);
                                            _.cacheres.backDBConnection(_conn);
                                        } catch (e) {}
                                        if (data) {
                                            _.result.add(data, v.key);
                                            if (v.func) {
                                                V.tryC(function() {
                                                    v.func(_.result);
                                                });
                                            }
                                            next();
                                        } else {
                                            func(v, next);
                                        }
                                    });
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            }
        });
        //用于先读取缓存同步请求真实数据的情况
        N.NiLazyTemplateDecorator = function(res, cacheres, cm, params, defExt, merge) {
            var _ = this,
                __ = this; {
                __.lazyExp = V.getValue(params.lazyExp, function(p) { return true; });
                params = V.merge({}, params);
                if (params && params.lazyExp) { delete params.lazyExp; }
                N.NiTemplateDecorator.apply(_, [res, cacheres, cm, params, defExt, merge]);
            }
        };
        V.inherit2(N.NiLazyTemplateDecorator, N.NiTemplateDecorator, {
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _.res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        var i = 0;
                        delete _.result.error;
                        var func = function(v) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    if (!data) {
                                        data = false;
                                    }
                                    _.result.add(data, v.key);
                                    if (_func) {
                                        V.tryC(function() {
                                            _func(_.result);
                                        });
                                    }
                                });
                                if (data && data.length > 0 && !(data.length == 1 && data[0].length == 0) && __.lazyExp(v.params)) {
                                    //新增缓存
                                    var _nicmd = _.cm.getConfigValue(_.KEY, v.key + '.Set');
                                    if (_nicmd) {
                                        var _conn = _.cacheres.getDBConnection();
                                        var _cmd = _.cacheres.getDBCommand();
                                        _cmd.connection = _conn;
                                        _cmd.command = V.getValue(_nicmd.command, _.setCommand);
                                        _cmd.params = _nicmd.merge(_nicmd.params, cmd.params, {
                                            cacheKey: V.hash(v.key + '.Set.' + V.toJsonString(cmd.params)),
                                            cacheValue: data
                                        });
                                        _cmd.execute(_.result, function(data) {
                                            V.tryC(function() { cacheres.backDBConnection(_conn); });
                                        });
                                    }
                                }
                            });
                        };
                        V.whileC2(function() { return _cms.shift(); }, function(v, next) {
                            var _nicmd = _.lstCmd2[i];
                            //准备处理缓存
                            if (_nicmd && __.lazyExp(v.params)) {
                                i++;
                                var _conn = _.cacheres.getDBConnection();
                                var _cmd = _.cacheres.getDBCommand();
                                _cmd.connection = _conn;
                                _cmd.command = _nicmd.name;
                                _cmd.params = V.merge(_nicmd.params, v.params);
                                delete _.result.error;
                                _cmd.execute(_.result, function(data, error) {
                                    V.tryC(function() {
                                        try {
                                            error && (_.result.error = error);
                                            _.cacheres.backDBConnection(_conn);
                                        } catch (e) {}
                                        if (!data) {
                                            data = false;
                                        }
                                        if (data) {
                                            _.result.add(data, v.key);
                                            if (v.func) {
                                                V.tryC(function() {
                                                    v.func(_.result);
                                                });
                                            }
                                        }
                                        func(v, next);
                                    });
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            },

        });
        /**
         * 使用很多Template来完成相关操作，否则就使用默认值进行处理
         * @param {真实数据源} res 
         * @param {ni.js的ConfigManager} cm 
         * @param {config.js的ConfigManager} relcm 
         * @param {config.js的AppName} appName 
         * @param {自动扩展后缀} defExt 
         * @param {参数过滤方法} merge 
         * @param {默认模板 如果不设置 那么使用真实数据源} template 
         */
        N.NiMultiTemplateDecorator = function(res, cm, relcm, appName, defExt, merge, template) {
            var _ = this,
                __ = this; {
                N.NiTemplate.apply(_, [res, cm, defExt, merge]);
                _.KEY = V.getValue(appName, 'Ni');
                __.ni = new N.NiTemplateManager(relcm, _.KEY);
                //__._addCommand = _._addCommand;
                //__._execute = _._execute;
                __.lstCmd2 = {};
                _.template = template || false;
            }
        };
        V.inherit2(N.NiMultiTemplateDecorator, N.NiTemplate, {
            _addCommand: function(name, params, func) {
                var _ = this,
                    __ = this;
                var index = _.lstCmd.length;
                N.NiMultiTemplateDecorator._addCommand.apply(_, [name, params, func]);
                if (_.lstCmd.length != index) {
                    var cmd = _.lstCmd[_.lstCmd.length - 1];
                    cmd.template = cmd.template || _.template;
                    if (cmd.template) {
                        //调用templdate优先 复用其次
                        __.lstCmd2[index] = true;
                    }
                }
            },
            _execute: function() {
                var _ = this,
                    __ = this;
                var _cms = _.lstCmd;
                _.lstCmd = [];
                if (_cms.length > 0) {
                    V.tryC(function() {
                        var conn = _.res.getDBConnection();
                        var cmd = _.res.getDBCommand();
                        cmd.connection = conn;
                        delete _.result.error;
                        var func = function(v, next) {
                            cmd.command = v.name;
                            cmd.params = v.params;
                            cmd.dbtype = v.dbtype;
                            cmd.jsonp = v.jsonp;
                            var _func = v.func;
                            cmd.execute(_.result, function(data, error) {
                                V.tryC(function() {
                                    error && (_.result.error = error);
                                    _.result.add(data ? data : false, v.key);
                                    if (_func) {
                                        _func(_.result);
                                    }
                                });
                                next();
                            });
                        };
                        var i = 0;
                        var _cms2 = __.lstCmd2;
                        __.lstCmd2 = {};
                        V.whileC2(function() { return _cms.shift(); }, function(_v, next) {
                            var v = _v;
                            //准备处理缓存
                            if (_cms2[i]) {
                                i++;
                                __.ni.execute(v.template, v.key, v.params, function(result) {
                                    V.tryC(function() {
                                        _.result.add((result && result.get(v.key)) ? result.get(v.key) : [], v.key);
                                        v.func(_.result);
                                    });
                                    next();
                                });
                            } else {
                                i++;
                                func(v, next);
                            }
                        }, function() {
                            _.res.backDBConnection(conn);
                            _cms2 = null;
                        });
                    });
                } else { V.showException('不能调用空的命令对象!'); }
                return _.result;
            }
        })
    }
    //分离NiDBFactory产生NiDBConnection(Invoke) ajax localStorage sessionStorage js jsonp/getScript websocket Sqlite ObjectDB等各种资源
    {
        //ajax jsonp/getScript 构造参数可修改ajax默认参数并新增host(../|http://www.abc.con)与dbtype(json/tjson)两个属性。
        //默认dbtype为json js 建议static
        N.NiAjaxDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                __.AjaxConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ host: '', dbtype: 'json' }, _.params);
                    }
                    _.invoke = function(cmd, func) {
                        V.ajax(V.merge(_.params, {
                            url: ((cmd.command.indexOf('http:') >= 0 || cmd.command.indexOf('https:') >= 0) ? '' : _.params.host) + cmd.command,
                            data: cmd.params,
                            jsonp: cmd.jsonp,
                            success: function(data, status) {
                                try {
                                    if (func) { func(data); }
                                } catch (e) {
                                    V.showException('V._ajaxOption success方法', e);
                                }
                            },
                            error: function(request, status, error) {
                                V.showException('V._ajaxOption error方法 status:' + status, error);
                                func && func(false, request.responseText ? new Error(request.responseText) : error);
                            }
                        }));
                    }
                };
            }
            _.createDBConnection = function() { return new __.AjaxConnection(); };
            _.backDBConnection = function() { console.log('back conn'); };
        };
        //localStorage sessionStorage js ObjectDB
        N.NiObjectDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                __.ObjectConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ resource: {} }, _.params);
                        __.open = _.open;
                        __.close = _.close;
                    }
                    _.open = function() {
                        switch (typeof(_.params.resource)) {
                            case 'string':
                                _.params.resource = eval('(' + _.params.resource + ')');
                                break;
                            case 'object':
                                if (V.isArray(_.params.resource)) {
                                    throw new Error('不能使用数组作为资源');
                                }
                                break;
                            default:
                                throw new Error('N.NiObjectDataFactory 无法找到<' + _.params.resource + '>对象');
                        }
                        __.open();
                    };
                    _.close = function() {
                        if (_.params.resource) {
                            delete _.params.resource;
                        }
                        __.close();
                    };
                    _.invoke = function(cmd, func) {
                        //如何区分Insert还是select
                        //针对 localStorage,sessionStorage,JS对象 function(res,params){res[params.key] = params.value; return 0;}	
                        //function(res,params){return res[params.key];}	
                        //function(res,p){return res.func(p);}
                        try {
                            var data = null;
                            if (typeof(cmd.command) == 'function') {
                                data = cmd.command(_.params.resource, cmd.params);
                            } else {
                                data = eval('(' + cmd.command + ')(_.params.resource,cmd.params)');
                            }
                            if (typeof(data) == 'function') {
                                V.tryC(function() { if (func) { data(func); } });
                            } else {
                                V.tryC(function() { if (func) { func(data); } });
                            }
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    }
                };
            }
            _.createDBConnection = function() { return new __.ObjectConnection(); };
        };
        //webSocket {url:''}  totest
        N.NiSocketDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                var ws = window.WebSocket || window.MozWebSocket;
                if (!ws) {
                    throw new Error(V.userAgent.name + '不支持WebSocket!');
                }
                __.SocketConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge({ url: '', veshurl: '' }, _.params);
                        __.open = _.open;
                        __.close = _.close;
                        __.conn = null;
                        __.datas = [];
                        __.senddatas = [];
                        __.calls = {};
                        //处理接受
                        __.addData = function(data) {
                            __.datas.push(data);
                            __.callback();
                        };
                        __.callback = function() {
                            if (__.datas.length > 0) {
                                V.whileC(function() { return __.datas.shift(); }, function(val) {
                                    if (typeof(val) == 'string') {
                                        val = eval('(' + val + ')');
                                    }
                                    if (val._id && val.response) {
                                        if (__.calls[val._id]) {
                                            __.calls[val._id].datas.push(val.response);
                                        } else {
                                            __.calls[val._id] = { datas: [], func: null, index: val._id };
                                            __.calls[val._id].datas.push(val.response);
                                        }
                                        __.callfunc(val._id);
                                    } else {
                                        V.showException('未找到消息处理者' + V.toJsonString(val));
                                    }
                                    return false;
                                });
                            }
                        };
                        __.callfunc = function(index) {
                            var oCall = __.calls[index];
                            if (oCall && oCall.datas.length > 0 && oCall.func) {
                                V.whileC(function() { return oCall.datas.shift(); }, function(val) {
                                    oCall.func(val, oCall.index);
                                    return false;
                                }, function() { //delete __.calls[index]; 
                                });
                            }
                        };
                        //处理发送
                        __.addCalls = function(cmd, func) {
                            var index = cmd.params._id ? cmd.params._id : V.random();
                            if (!__.calls[index]) {
                                __.calls[index] = { datas: [], func: func, index: index };
                            } else if (cmd.params._id) {
                                //delete cmd.params._id;
                            } else {
                                __.calls[index].func = func;
                            }
                            //默认conn是Open的
                            var val = { _id: index, request: {} };
                            val.request[cmd.command] = cmd.params;
                            __.senddatas.push(V.toJsonString(val));
                            __.callsend();
                        };
                        __.callsend = function() {
                            if (_.isOpen) {
                                V.whileC(function() { return __.senddatas.shift() }, function(v) { __.conn.send(v); return false; });
                            }
                        };
                    }

                    _.open = function() {
                        if (!_.isOpen && !__.conn) {
                            __.conn = new ws(_.params.url);
                            __.conn.onopen = function() {
                                _.isError = false;
                                __.open();
                                __.conn.send(V.toJsonString({ cookies: document.cookie }));
                                __.callsend();
                            };
                            __.conn.onclose = function() {
                                __.close();
                                __.conn = null;
                                if (_.params.reopen) V.once(_.open, 1000);
                            };
                            __.conn.onmessage = function(evt) {
                                try {
                                    //console.log(evt.data);
                                    _.isError = false;
                                    if (evt.data) { __.addData(evt.data); }
                                } catch (e) {
                                    V.showException('VJ.ni.NiSocketDataFactory.onmessage', e);
                                }
                            };
                            __.conn.onerror = function(e) {
                                try {
                                    if (!_.isError && (e.currentTarget.readyState == 2 || e.currentTarget.readyState == 3) && _.params.veshurl) {
                                        //连接失败 尝试调用veshurl 开启websocket
                                        V.ajax({
                                            url: _.params.veshurl,
                                            jsonp: _.params.jsonp,
                                            data: {},
                                            success: function(data, status) {
                                                try {
                                                    console.log("--------------------------------------------");
                                                    console.log(data);
                                                    _.open();
                                                    //重新尝试一次连接
                                                } catch (e) {
                                                    V.showException('V._ajaxOption success方法', e);
                                                }
                                            },
                                            error: function(request, status, error) {
                                                V.showException('V._ajaxOption error方法 status:' + status, error);
                                                if (func) { func(false); }
                                            }
                                        });
                                    } else {
                                        __.addData(false);
                                    }
                                    _.isError = true;
                                    __.conn = null;
                                    V.showException('VJ.ni.NiSocketDataFactory.onerror:' + V.toJsonString(e));
                                } catch (e) {
                                    V.showException('VJ.ni.NiSocketDataFactory.onerror', e);
                                }
                            };
                        }
                    };
                    _.close = function() {
                        _.params.reopen = false;
                        __.conn.close();
                    };
                    _.invoke = function(cmd, func) {
                        //如何区分新发起的会话 还是 旧有的会话	res._id res.firstregist
                        try {
                            __.addCalls(cmd, func);
                        } catch (e) {
                            V.showException('V._ajaxOption success方法', e);
                            if (func) { func(false); }
                        }
                    }
                };
                __.SocketCommand = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataCommand, []]);
                    }
                    _.execute = function(result, func) {
                        if (!_.connection || _.connection.isError) {
                            V.showException('WebSocket连接失败');
                            if (func) { func(false); }
                            return;
                        } else {
                            _.connection.invoke(_, function(data, _id) {
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
                                            if (!hasFalse) {
                                                //如何判断tjson
                                                data = eval('(' + data.replace(/[\r\n]+/g, '').replace(/\\"/g, '"') + ')');
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
                                            V.showException('V.NiSocketDataCommand success方法 name:typeof错误 type:' + (data));
                                            hasFalse = true;
                                            break;
                                    }
                                    if (result.firstregist) result.firstregist = false;
                                    if (hasFalse) {
                                        data = false;
                                    } else if (data._regist) {
                                        //声明注册完成
                                        result.firstregist = true;
                                        data = false;
                                    } else {
                                        switch (_.dbtype) {
                                            default:
                                                case 'json':
                                                break;
                                            case 'tjson':
                                                    data = V.evalTJson(data);
                                                break;
                                        }
                                    }
                                    //特别地当回{close:true}时，关闭websocket
                                    result._id = _id;
                                    if (func) { var val = func(data, _id); if (val && val.close) { __.conn.close(); } }
                                } catch (e) {
                                    V.showException('V.ni.NiSocketCommand invoke方法', e);
                                    if (func) { func(false); }
                                }
                            });
                        }
                    };
                    _.excute = _.execute;
                };
            }
            _.createDBConnection = function() { return new __.SocketConnection(); };
            _.backDBConnection = function() { console.log('back conn'); };

            _.createDBCommand = function() { return new __.SocketCommand(); }
        };
        //{name:'',version:'1.0',desc:'',size:2*1024*1024}
        N.NiSqliteDataFactory = function() {
            var _ = this,
                __ = {}; {
                V.inherit.apply(_, [N.NiDataFactory, []]);
                __.SqliteConnection = function() {
                    var _ = this,
                        __ = {}; {
                        V.inherit.apply(_, [N.NiDataConnection, []]);
                        _.params = V.merge(_.params, { name: '', version: '1.0', desc: '', size: 2 * 1024 * 1024 });
                        __.open = _.open;
                        __.close = _.close;
                    }
                    _.open = function() {
                        if (!_.isOpen) {
                            if (openDatabase) {
                                __.conn = openDatabase(_.params.name, _.params.version, _.params.desc, _.params.size);
                                __.open();
                            } else {
                                V.showException(V.userAgent.name + '不支持WebDB!');
                            }
                        }
                    };
                    _.close = function() {
                        delete __.conn;
                        __.close();
                    };
                    _.invoke = function(cmd, func) {
                        if (!_.isOpen || !__.conn) {
                            throw new Error('数据库连接已关闭');
                        }
                        V.tryC(function() {
                            var cms = cmd.command.split(';');
                            var params = V.getValue(cmd.params.data, []);
                            if ((cmd.command.split('?').length - 1) != params.length) {
                                V.showException(cmd.command + '参数数目与输入值数目不符!!');
                                if (func) { func(false); }
                            }
                            var w = 0;
                            var ret = [];
                            var cmslength = cms.length - 1;
                            V.whileC(function() { var command = cms.shift(); return '' == command ? null : command; }, function(command) {
                                //需要计算出这次使用的参数
                                var _w = command.split('?').length - 1;
                                var p = params.slice(w, w + _w);
                                w += _w;
                                __.conn.transaction(function(tx) {
                                    tx.executeSql(command, p, function(tran, data) {
                                        var i = -1;
                                        var _data = [];
                                        V.whileC(
                                            function() {
                                                i++;
                                                return i < data.rows.length ? data.rows.item(i) : null;
                                            },
                                            function(v) {
                                                _data.push(V.merge({}, v));
                                            },
                                            function() {
                                                ret.push(_data);
                                                if (ret.length >= cmslength) {
                                                    if (func) { func(ret); }
                                                }
                                            }, true);
                                    }, function(tran, error) {
                                        console.log(error);
                                        V.showException(error);
                                        if (func) { func(false); }
                                    });
                                });
                            }, function() {}, true);
                        });
                    };
                };
            }
            _.createDBConnection = function() { return new __.SqliteConnection(); };
        };
    }
})(VJ, jQuery);(function(V, $) {
    V.viewmodel = { APP: 'VESH.viewmodel', NIAPP: 'Ni' };
    var M = V.viewmodel;
    V.view = { APP: 'VESH.view' };
    var W = V.view;
    V.hasRight = function(name, isAdmin) {
        if (V.getValue(isAdmin, false) && (typeof(User) == 'undefined' || !V.isValid(User))) { return false; }
        if (User) {
            //添加后门
            if (!V.isValid(Pers)) { V.showException("permission.js不存在"); return false; }
            if (V.getValue(isAdmin, false) && Pers) return true;
            var id = V.getValue(Pers[name], '_');
            return ((',' + V.getValue(User.PIDS, '') + ',').indexOf(',' + id + ',') >= 0);
        }
        return false;
    };
    //定义业务逻辑层的两个基本对象页面与控件
    //首先页面实例化M.Page 然后 页面绑定 W.Page 然后W.Page 调用Document.ready 将界面根据middler进行设置，并针对_对象进行初始化设置并进行binding binding完成后直接发布document.ready事件
    //一般的viewmodel层通过type定义其Middler中的控件类型实现与前端的绑定
    //一般的view层生成后通过bind命令绑定viewmodel，并提供fill命令更新viewmodel的相关字段，将自身的render命令注入viewmodel的update命令更新控件，viewmodel定义事件并由view调用，一般会在调用事件时自动调用自身的fill方法更新viewmodel，然后在属性调用时根据返回的参数更新自身。在viewmodel更新状态后，可调用update(更新{})方法完成数据在view层的填充,同时将属性更新viewmodel。


    //分别定义view与viewmodel的Control 控件本身只支持先构建，构建与init合并，最后执行bind操作
    M.Control = function() {
        //data属性的定义 on事件的处理 update方法的主动更新
        var _ = this,
            __ = {}; {
            _.bind = function(view) {
                _.v = view;
                _.config = _.v.config;
                _.middler = _.v.middler;
                _.ni = _.v.ni;
                _.session = _.v.session;
            };
            _.data = _.data || {};
        }
    };
    var WTemplates = {};
    var FuncTmp = function() {
        var _ = this;
        _.__ = { funs: [], node: $('<div style="display:none;"></div>').appendTo(window.document.body) }
    };
    V.merge(FuncTmp.prototype, {
        addCallback: function(fun) {
            var _ = this,
                __ = _.__;
            (__.template) ? fun($(__.template)): fun && __.funs.push(fun);
        },
        callback: function() {
            var __ = this.__;
            V.whileC(function() { return __.funs.shift() }, function(v) { v($(__.template)); });
        },
        init: function(path) {
            var _ = this,
                __ = this.__;
            if (path.indexOf('<') >= 0) {
                __.node.append(path);
                __.template = __.node[0].innerHTML;
                __.node.remove();
            } else {
                if ((path || '').startWith('~') && V.getSettings("include")['last']) {
                    var prefix = V.getSettings("include")['last'].split('/');
                    prefix.pop();
                    path = prefix.join('/') + path.replace(/~/, '');
                }
                __.node.load(path, function() {
                    __.template = __.node[0].innerHTML
                    __.node.remove();
                    _.callback();
                });
            }
        }
    }, true);
    W.getTemplate = function(path, func) {
        if (!V.isValid(path) || V.getType(path) != 'string') {
            throw new Error('控件模板不能为空或者非字符串!');
        }
        if (!WTemplates[path]) {
            WTemplates[path] = new FuncTmp();
            WTemplates[path].init(path);
        }
        WTemplates[path].addCallback(func);
    };
    //动画基类，用于提供默认的方法定义 供真实的动画进行处理 譬如抖动 移动 翻转 等等
    W.Action = function() {
        this.go = function(node, func) { if (func) { func(); } };
    };
    //css专用的属性动画设置 默认可使用animate.min.css 进行动画设置
    W.CssAction = function(css) {
        var __ = {};
        V.inherit.apply(this, [W.Action, []]);
        __.go = this.go;
        __.css = V.getValue(css, '');
        this.go = function(node, func) {
            if (V.isValid(__.css)) {
                node = $(node);
                var _f = func;
                var _c = function() {
                    node.off('animationend').css('-webkit-animation', '').css('-moz-animation', '').css('-o-animation', '');
                    if (_f) {
                        var _s = _f;
                        _f = null;
                        _s();
                    };
                };
                node.off('webkitAnimationEnd').on('webkitAnimationEnd', _c);
                node.off('mozAnimationEnd').on('mozAnimationEnd', _c);
                node.off('MSAnimationEnd').on('MSAnimationEnd', _c);
                node.off('oanimationend').on('oanimationend', _c);
                node.off('animationend').on('animationend', _c);
                node.css('animation', css).css('-webkit-animation', css).css('-webkit-animation-play-state', 'running').css('-moz-animation', css).css('-moz-animation-play-state', 'running').css('-o-animation', css).css('-o-animation-play-state', 'running');
            }
        };
    };

    W.readyLoad = function(_) {
        //_.readyLoad.wait唯一判断是否出现子控件 当出现子控件时 需要子控件全部完成（有异步加载的需要判断 父控件的wait为false而且本级全部子控件的ready为真，无异步加载的需要父控件判断 本级全部子控件的ready为真）才能启动onload方法调用并确定父控件的ready为真 并开始启动上级判断。 应确保父控件的ready
        if (!_.readyLoad.ready && _.controls && _.controls.length) {
            //此为本级无异步加载的父控件判断
            if (!_.controls.filter(function(v) { return !v.readyLoad.ready }).length) {
                //console.log('readyLoad', _, _.readyLoad.ready ? '' : '', _.readyLoad.wait ? '锁定' : '不锁');
                // _.controls.forEach(function(v) {
                //     console.log('readyLoad2', v, v.readyLoad.ready);
                // });
                _.controls.forEach(function(v) {
                    try {
                        //特别注意 必须首先设置hasLoad为真，否则onLoad会无限循环
                        !v.readyLoad.hasLoad && (v.readyLoad.hasLoad = true, v.readyLoad.onLoad(v.readyLoad.node));
                    } catch (e) {
                        console.log('W.readyLoad Error:', v, e.stack);
                    }
                });
                _.readyLoad.ready = true;
                //console.log('非叶子控件 全部完成!', _, _.parent);
                (_.parent && _.parent.readyLoad && !_.parent.readyLoad.wait) && W.readyLoad(_.parent);
            }
            // else console.log('无异步但是有未完成', _.controls.filter(function(v) {
            //     if (!v.readyLoad.ready)
            //         console.log(v, v.readyLoad.ready);
            //     return !v.readyLoad.ready;
            // }).length);
        } else {
            //console.log('叶子节点判断', _, !_.readyLoad.ready, _.controls, _.controls && _.controls.length);
            //有异步加载的需要判断 父控件的wait为false而且本级全部子控件的ready为真，无异步加载的需要父控件判断 本级全部子控件的ready为真
            //叶子控件
            _.readyLoad.ready = true;
            //(_.parent && _.parent.readyLoad && !_.parent.readyLoad.wait) && console.log('readyLoad parent', _.parent, _.parent ? '有父亲' : '无父亲', _.parent.readyLoad ? "父亲有readyLoad" : '', _.parent.readyLoad.wait ? "父亲被锁定" : '');
            (_.parent && _.parent.readyLoad && !_.parent.readyLoad.wait) && W.readyLoad(_.parent);
        }
    };
    //html与css的加载 其对应的节点的替换 事件的统一触发与处理 update事件的注入 控件均支持先创建 再init 然后bind绑定的过程 再调用onLoad和render事件
    W.Control = function(path, params) {
        var _ = this,
            __ = { drag: {}, drop: {} }; {
            _.path = path;
            _.vm = null;
            _.events = {};
            _.params = V.getValue(params, {});
            __.desc = "";
            _.addDesc = function(d) { __.desc += (d + "\r\n"); };
            _.desc = function() { console.log(__.desc + 'VJ.view.Control\r\n数据定义：\r\npath:html模板定义\r\nvm:虚拟控件对象\r\nevents:事件对象\r\nparams:默认参数对象\r\n'); };
        }
        //处理控件下载完成后的操作
        _.onLoad = function(node) {
            _.render(V.merge({}, _.vm.data));
            _.call('load');
        };
        //在更新_.vm.data
        _.fill = function() {
            return {};
        };
        //可以将数据更新到标签上
        _.render = function(data) {
            V.forC(data, function(key, value) {
                switch (key.toLowerCase()) {
                    case 'dispose':
                        (value) && _.dispose();
                        break;
                    case 'css':
                        V.forC(value, function(k, v) { _.node.css(k, v); });
                        break;
                    case 'attr':
                        V.forC(value, function(k, v) { _.node.attr(k, v); });
                        break;
                    case 'hasright':
                        if (true === value || V.hasRight(value)) {
                            if (__.ebbody) {
                                _.node.show().append(__.ebbody.children());
                                __.ebbody.remove();
                                delete __.ebbody;
                            }
                        } else {
                            __.ebbody = V.newEl('div').append(_.node.children());
                            _.node.hide().empty();
                        };
                        break;
                    case 'enable':
                        if (value) { _.node.removeAttr('disabled'); } else { _.node.attr('disabled', 'disabled'); }
                        break;
                    case 'invisible':
                        if (value) {
                            _.node.children().show();
                        } else {
                            _.node.children().hide();
                        }
                        break;
                    case 'visible':
                        if (value) { _.node.show(); } else { _.node.hide(); }
                        break;
                    case 'addclass':
                        _.node.addClass(value);
                        break;
                    case 'removeclass':
                        _.node.removeClass(value);
                        break;
                    case 'drag':
                        //drag node说明可移动的对象,mode true,false是否许可继续进行 move,copy,none(默认),func可产生移动对象
                        value = typeof(value) === 'string' ? { mode: { helper: value } } : { node: value.node || _.node, mode: value };
                        delete value.mode.node;
                        if (value.mode.mode && !value.mode.helper) value.mode.helper = value.mode.mode;
                        !!value.mode ? _.setDrag(value.node, value.mode) : _.clearDrag(value.node);
                        break;
                    case 'drop':
                        //drop node说明可移动的对象,mode true,false是否许可继续进行 move,copy,none(默认)可产生移动对象
                        value = typeof(value) === 'string' ? { mode: { helper: value } } : { node: value.node || _.node, mode: value };
                        delete value.mode.node;
                        if (value.mode.mode && !value.mode.helper) value.mode.helper = value.mode.mode;
                        !!value.mode ? _.setDrop(value.node || _.node, value.mode) : _.clearDrop(value.node || _.node);
                        break;
                    case 'animate':
                        //仅处理简单类型的动画 譬如一次性调用的动画名或者一个动画名带一个回调函数，可支持多个
                        if (typeof(value) == 'string') {
                            _.animate(value);
                        } else {
                            var ret = [];
                            V.forC(value, function(k2, v2) {
                                ret.push([k2, v2]);
                            }, function() {
                                var i = 0;
                                //异步处理
                                var _f = function() {
                                    var v2 = ret[i];
                                    i++;
                                    _.animate(v2[0], function() {
                                        if (typeof(v2[1]) == 'function')
                                            V.tryC(function() { v2[1](); });
                                        if (i < ret.length) { _f(); }
                                    });
                                };
                                _f();
                            });
                        }
                        break;
                    case 'globalposition':
                        {
                            value += '';
                            _.node.attr('position', value.toLowerCase());
                            _.node.css('position', 'absolute');
                            var parent = $(window);
                            switch (value.toLowerCase()) {
                                case 'top':
                                    parent.scroll(function() {
                                        _.node.css('top', document.body.scrollTop + "px");
                                    });
                                    _.node.css('top', document.body.scrollTop + "px");
                                    break;
                                case 'bottom':
                                    parent.scroll(function() {
                                        _.node.css('top', (document.body.scrollTop + $(window).height() - _.node.height()) + "px");
                                    });
                                    _.node.css('top', (document.body.scrollTop + $(window).height() - _.node.height()) + "px");
                                    break;
                            }
                        }
                        break;
                    case 'position':
                        //此方法不支持重复设置 
                        {
                            value += '';
                            _.node.attr('position', value.toLowerCase());
                            _.node.css('position', 'absolute');
                            var parent = _.node.parent();
                            switch (value.toLowerCase()) {
                                case 'top':
                                    parent.scroll(function() {
                                        _.node.css('top', parent[0].scrollTop + "px");
                                    });
                                    _.node.css('top', parent[0].scrollTop + "px");
                                    break;
                                case 'bottom':
                                    parent.scroll(function() {
                                        _.node.css('top', (parent[0].scrollTop + $(document).height() - _.node.height()) + "px");
                                    });
                                    _.node.css('top', (parent[0].scrollTop + $(document).height() - _.node.height()) + "px");
                                    break;
                            }
                        }
                        break;
                    case 'valid':
                        V.merge(_.get(), _.fill(), true);
                        if (_.valid) { _.valid(data.value || _.get().value, value); } else if (value) value();
                        break;
                    case 'validate':
                        {
                            var inputs = _.node.find('input');
                            _.validate(_, inputs.length ? inputs : _.node);
                        }
                        break;
                    case 'show':
                        _.vm.data.visible = true;
                        _.animate(value, function() {});
                        V.once(function() { _.node.show(); }, 1);
                        break;
                    case 'hide':
                        _.animate(value, function() {
                            _.node.hide();
                            _.vm.data.visible = false;
                        });
                        break;
                    case 'desc':
                        (value) && _.desc();
                        break;
                }
            });
            return data;
        };
        _.init = function(parent, node, params) {
            _.parent = parent;
            _.config = _.parent.config;
            _.middler = _.parent.middler;
            _.ni = _.parent.ni;
            _.session = _.parent.session;
            _.node = node;
            _.params = V.merge(_.params, { data: V.getValue(params, {}) });
        };
        //初始化viewmodel操作
        _.bind = function(vm) {
            //完成配置合并
            _.vm = V.merge(_.params, vm || { data: {} });
            V.forC(_.vm, function(k, v) {
                vm[k] = v;
                (k.toLowerCase().indexOf('on') == 0) && (
                    _.events[k.toLowerCase().substring(2)] = v
                )
            }, null, true);
            _.vm = vm;
            //用于获取绑定对象的数据
            _.get = function() { return _.vm.data; }
                //完成类型名注入
            _.vm.nodeName = _.nodeName;
            //完成方法注入
            _.vm.update = function() {
                if (arguments.length == 0) {
                    _.vm.data = V.lightMerge(_.vm.data, _.fill());
                } else {
                    var as = Array.prototype.slice.call(arguments);
                    //as = V.getValue(as, [null]);
                    if (as[0]) V[!!as[1] ? 'merge' : 'lightMerge'](_.vm.data, as[0], true);
                    as[0] = as[0] ? as[0] : V.lightMerge({}, _.vm.data);
                    _.render.apply(_, as);
                }
                return _.vm.data;
            };
            _.vm.call = function() { return _.call.apply(_.parent.vms, arguments); };
            _.vm.add = function() { _.addControl.apply(_, arguments); };
            _.vm.remove = function() { _.removeControl.apply(_, arguments); };
            _.vm.desc = _.desc;
            _.vm.get = function(key) { _.vm.data = V.merge(_.vm.data, _.fill()); return key ? _.vm.data[key] : _.vm.data; };
            _.vm.bind(_);
            _.readyLoad = {
                ready: false,
                node: null,
                onLoad: _.onLoad,
                path: _.path,
                wait: false //等待递归调用readyLoad方法时等待父类的replaceNode执行完成
            };
            if (_.path) {
                W.getTemplate(_.path, function(node) {
                    _.replaceNode(node);
                    _.readyLoad.wait = false;
                    _.readyLoad.node = node;
                    _.preonload && _.preonload(node);
                    W.readyLoad(_);
                    //_.onLoad(node);
                });
            } else {
                _.node.show();
                _.readyLoad.wait = false;
                _.readyLoad.node = _.node;
                _.preonload && _.preonload(_.node);
                W.readyLoad(_);
                //_.onLoad(_.node);
            }
        };
        //用于扩展给主要对象绑定事件使用 一般用于bind事件的默认值
        _.bindEvent = function(node, k, v) {
            node = $(node);
            try {
                ($._data(node[0], "events"));
            } catch (e) { console.log('发现有极端情况会报nodeName错误!', k); return; }
            if (typeof(node[k]) == 'function' && (!$._data(node[0], "events") || !$._data(node[0], "events")[k])) {
                switch (k.toLowerCase()) {
                    case 'hover':
                        if ((!$._data(node[0], "events") || (!$._data(node[0], "events")['mouseenter']) && !$._data(node[0], "events")['mouseleave']))
                            node[k](function(e) {
                                if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                                _.call(k, { e: e, hover: true });
                            }, function(e) {
                                if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                                _.call(k, { e: e, hover: false });
                            });
                        break;
                    case 'resize':
                        node[0].onresize = function(e) {
                            if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                            _.call(k, { e: e, width: node.width(), height: node.height() });
                        }
                        break;
                    default:
                        node[k](function(e) {
                            if (node.attr('disabled') || node.parents('[disabled]').length > 0 || false === _.vm.data.disable || false === _.vm.data.enable) return;
                            _.call(k, { e: e });
                        });
                }
            }
        };
        _.initControls = function(vm, node) {
            //此处进行内部控件生成需要判定controls属性
            (vm.controls || node.find('[_]').length > 0) && (function() {
                _.readyLoad.wait = true;
                var cons = vm.controls || {};
                _.controls = [];
                _.vs = {};
                _.vms = cons;
                _.models = _.vms;
                V.each(node.find('[_]').toArray(), function(v1) {
                    var v = $(v1);
                    var id = v.attr('id');
                    var json = eval("({" + v.attr('_') + "})");
                    var type = json.type ? json.type : (id && cons[id] && cons[id].type) ? cons[id].type : null;
                    //对于容器类对象的处理方式
                    var nodeName = type ? type.toLowerCase() : v[0].nodeName.toLowerCase();
                    var obj = _.middler.getObjectByAppName(W.APP, nodeName);
                    if (!obj) V.showException('配置文件中没有找到对象类型定义:' + nodeName);
                    obj.init(_, v, V.isValid(v.attr('_')) ? json : null);
                    obj.page = _.page;
                    _.controls.push(obj);
                    if (!id) {
                        id = nodeName + V.random();
                    }
                    obj.nodeName = nodeName;
                    if (!cons[id]) {
                        cons[id] = { data: {} };
                    }
                    _.vs[id] = obj;
                    V.inherit.apply(cons[id], [M.Control, []]);
                    obj.bind(cons[id]);
                }, function() {
                    //实现通过type属性完成数据初始化的功能
                    V.forC(cons, function(key, v) {
                        if (v.type && !v.v) {
                            var obj = _.middler.getObjectByAppName(W.APP, v.type);
                            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
                            var node2 = V.newEl('div');
                            node.append(node2);
                            obj.init(_, node2, null);
                            obj.page = _.page;
                            _.controls.push(obj);
                            _.vs[key] = obj;
                            V.inherit.apply(v, [M.Control, []]);
                            obj.bind(v);
                        }
                    }, null, true)
                }, true);
            })();
        };
        _.replaceNode = function(node) {
            node = $(node);
            var attrs = _.node[0].attributes;
            if (attrs) {
                var i = attrs.length;
                V.whileC(function() { i--; return i >= 0 ? { key: attrs[i].name, val: attrs[i].value } : null }, function(v) {
                    var n = v.key.toLowerCase() == 'id' ? $(node[0]) : node;
                    if (n.length > 1) {
                        for (var i = 0; i < n.length; i++) {
                            var _n = $(n[i]);
                            if (V.isValid(v.val) && v.val != 'false') {
                                _n.attr(v.key, ((V.isValid(_n.attr(v.key)) && _n.attr(v.key) != v.val) ? _n.attr(v.key) + " " : "") + v.val);
                            }
                        }
                    } else {
                        if (V.isValid(v.val) && v.val != 'false') {
                            n.attr(v.key, ((V.isValid(n.attr(v.key)) && n.attr(v.key) != v.val) ? n.attr(v.key) + " " : "") + v.val);
                        }
                    }
                }, null, true);
            }
            _.initControls(_.vm, node);
            node.append(_.node.children());
            if (_.node[0].nodeName.toLowerCase() == 'body') {
                _.node.empty().append(node);
            } else {
                _.node.after(node).remove();
            }
            _.node = node;
        };
        _.call = function(name, param, tparam) {
            name = name.toLowerCase();
            var val = null;
            //所有的事件调用全部采用异步调用方式 V.once
            V.lightMerge(_.vm.data, _.fill(), param || {}, true);
            param = V.merge(_.vm.data, tparam || {});
            (_.events[name]) && V.tryC(function() {
                val = _.events[name].apply(_.parent.vms, [param, _.vm]);
                if (val && V.toJsonString(val).length > 2) {
                    V.merge(_.vm.data, val, true)
                    _.render(val);
                }
            });
            return val;
        };
        _.dispose = function(e) {
            V.tryC(function() {
                _.call('dispose', { e: e });
                _.clearControl();
            });
            _.node.remove();
        };
        //这里提供子类用于覆盖同名函数，修改动画对象。
        _.animate = function(name, func) {
            _._animate(name, null, func);
        };
        //动画方法 用于将middler获取到的动画对象进行动画设置并返回设置函数 而动画对象本身应该仅仅具有业务意义 譬如active hide append等等
        _._animate = function(name, node, func) {
            name = name || '';
            var action = _.middler.getObjectByAppName(W.APP, name);
            if (action) {
                action.go(node ? node : _.node, func || null);
            }
        };
        //用于绑定验证控件
        _.validate = function(input) {
            if (_.middler) {
                var obj = _.middler.getObjectByAppName(W.APP, 'ValidateManager');
                if (obj) { obj.validate(_, input); }
            }
        };
        //用于说明错误提示
        _.onError = function(text) {
            _.get().isError = true;
            _.call('error', { error: text });
        };
        //用于清理错误提示
        _.onClearError = function() { _.call('clearerror'); };
        //用于说明正确信息
        _.onSuccess = function() {
            delete _.get().isError;
            _.call('success')
        };
        //控件处理
        _.addControl = function(node, v) {
            if (!_.controls) {
                _.controls = [];
                _.vs = {};
                _.vms = {};
                _.models = _.vms;
            }
            var obj = _.middler.getObjectByAppName(W.APP, v.type);
            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
            node = node ? node : V.newEl('div').appendTo(_.node);
            obj.init(_, node, v.data);
            obj.page = _.page;
            _.controls.push(obj);
            var key = V.getValue(v.id, V.random());
            if (_.vs[key]) { V.showException('控件id为' + key + '的子控件已经存在，请更换id名'); return; }
            node.attr('id', key);
            _.vs[key] = obj;
            V.inherit.apply(v, [M.Control, []]);
            _.vms[key] = v;
            _.readyLoad.ready = false;
            obj.bind(v);
            return v;
        };
        _.removeControl = function(id) {
            delete _.vms[id];
            if (_.vs[id]) {
                var val = _.vs[id];
                delete _.vs[id];
                _.controls = $.grep(_.controls, function(v, i) { return v != val; });
                if (val) val.dispose();
                V.tryC(function() { val.node.remove(); });
            }
        };
        _.clearControl = function() {
            if (_.controls) {
                var vs = _.vs;
                _.controls = [];
                _.vms = {};
                _.models = _.vms;
                _.vs = {};
                var div = $('<div style="display:none;"></div>').appendTo(window.document.body);
                _.node.children().appendTo(div);
                _.node.empty();
                V.forC(vs, function(k, v) { v.dispose(); }, function() { div.remove(); }, true);
            } else {
                _.controls = [];
                _.vms = {};
                _.models = _.vms;
                _.vs = {};
            }
        };
        V.applyCommandAndEvent(this);
        _.getPosition = function(node, isLast) {
            var docs = node;
            var pos = { x: 0, y: 0 };
            while (docs) {
                var off = [];
                if (docs.style && docs.style.transform && docs.style.transform.indexOf('translate3d') >= 0) {
                    docs.style.transform.replace(/[+-]\d+(px)/g, function(v) {
                        //一般第一个是 x 第二个是y
                        off.push(parseInt(v));
                    });
                }
                pos.x += (off[0] ? off[0] : 0) + docs.offsetLeft; //不断叠加与祖先级的距离
                pos.y += (off[1] ? off[1] : 0) + docs.offsetTop;
                docs = docs.offsetParent;
                if (isLast && docs && (docs == isLast || (typeof(isLast) == 'boolean' && !!docs.getAttribute('_dragid')))) docs = null;
            }
            return pos;
        };
        _.setDrag = function(node, option) {
            node = $(node);
            var point = { x: 0, y: 0 };
            if (!node.draggable) console.log('setDrag不生效，请先引入jquery.ui.js');
            var id = node.attr('_dragid') || V.random();
            if (option.helper && typeof(option.helper) == "string")
                switch (option.helper.toLowerCase()) {
                    case 'move':
                        delete option.helper;
                        break;
                    case 'copy':
                        option.helper = 'clone';
                        break;
                    case 'none':
                        option.helper = function(e) {
                            point = { x: e.offsetX, y: e.offsetY };
                            return V.newEl('div', '', '').css({
                                width: 10,
                                height: 10,
                                left: 0,
                                top: 0,
                                background: 'transaction'
                            }).appendTo(node);
                        }
                        break;
                }
            if (W.Control.drag[id]) {
                node.draggable('option', option);
            } else {
                W.Control.drag[id] = { node: node, vm: _.vm };
                node.attr('_dragid', id);
                //https://www.runoob.com/jqueryui/api-draggable.html
                option = V.merge({
                    start: function(e, ui) {
                        var pos = { left: ui.position.left + point.x, top: ui.position.top + point.y },
                            off = { left: ui.offset.left + point.x, top: ui.offset.top + point.y };
                        var val = _.call('dragstart', { e: e, target: ui.helper, position: pos, offset: off, dragData: { oriposition: pos, orioffset: off } });
                        W.Control.dragSession = {
                            id: id,
                            vm: _.vm,
                            data: V.merge(_.vm.data.drag || _.vm.data.innerdrag || {}, val || {}, { dragid: id, oriposition: pos, orioffset: off })
                        };
                    },
                    drag: function(e, ui) {
                        var pos = { left: ui.position.left + point.x, top: ui.position.top + point.y },
                            off = { left: ui.offset.left + point.x, top: ui.offset.top + point.y };
                        var val = _.call('drag', { e: e, target: ui.helper, position: pos, offset: off, dragData: W.Control.dragSession.data });
                        val && V.merge(W.Control.dragSession.data, val, true);
                    },
                    stop: function(e, ui) {
                        var pos = { left: ui.position.left + point.x, top: ui.position.top + point.y },
                            off = { left: ui.offset.left + point.x, top: ui.offset.top + point.y };
                        var val = _.call('dragend', { e: e, target: ui.helper, position: pos, offset: off, dragData: W.Control.dragSession.data });
                        val && V.merge(W.Control.dragSession.data, val, true);
                    },
                    //配置文件 https://www.runoob.com/jqueryui/api-draggable.html#event-start
                    //同级
                    appendTo: 'parent',
                    delay: 300,
                    distance: 10,
                    //限制 containment
                    //helper:'clone',
                    iframeFix: true,
                    //revert: 'invalid',
                    //revertDuration: 100,
                    scroll: true,
                    scrollSensitivity: 100,
                    snap: true,
                    snapMode: 'both',
                    //会要求如下对象遮挡在拖动框前面
                    //stack:
                    //拖动对象的Index
                    zIndex: 9999
                }, option);
                node.draggable(option);
            }
        };
        _.setDrop = function(node, option) {
            node = $(node);
            if (!node.droppable) console.log('setDrop不生效，请先引入jquery.ui.js');
            var id = node.attr('_dropid') || V.random();
            if (option.helper && typeof(option.helper) == "string") {
                _.vm.data.drop = option.helper.toLowerCase();
                switch (option.helper.toLowerCase()) {
                    case 'move':
                        delete option.helper;
                        break;
                    case 'copy':
                        option.helper = 'clone';
                        break;
                    case 'none':
                        option.helper = function() {
                            return V.newEl('div', '', '').css({
                                width: 10,
                                height: 10,
                                background: "transparent"
                            });
                        }
                        break;
                }
            }


            if (W.Control.drop[id]) {
                node.droppable('option', option);
            } else {
                W.Control.drop[id] = { node: node, vm: _.vm };
                node.attr('_dropid', id);
                //https://www.runoob.com/jqueryui/api-droppable.html
                var func = function(e, ui, key) {
                    var pos = _.getPosition(e.target, true);
                    var dropPosition = {
                        left: ui.offset.left - pos.x,
                        top: ui.offset.top - pos.y
                    };
                    return V.merge(_.call(key, { e: e, target: ui.helper, draggable: ui.draggable, position: ui.position, offset: ui.offset, dragData: W.Control.dragSession.data, dropPosition: dropPosition }) || {}, { dropPosition: dropPosition });
                };
                option = V.merge({
                    over: function(e, ui) {
                        func(e, ui, 'dropover');
                    },
                    out: function(e, ui) {
                        func(e, ui, 'dropout');
                    },
                    drop: function(e, ui) {
                        if (e.target == ui.draggable[0] || e.target == ui.draggable.parent()[0]) return;
                        //这个方法后触发dragend
                        var val = func(e, ui, 'drop') || _.vm.data.drop.mode || _.vm.data.drop;
                        if (e.target == (val.node || ui.draggable)[0] || e.target == (val.node || ui.draggable).parent()[0]) return;
                        switch ((val.mode || val) + '') {
                            case 'clone':
                                $(e.target).append((val.node || ui.draggable).clone().css(val.dropPosition));
                                break;
                            case 'move':
                                $(e.target).append((val.node || ui.draggable).css(val.dropPosition));
                                break;
                            case 'none':
                            default:
                                break;
                        }
                    },
                    //然而，通过设置该选项为 true，任何父元素的 droppable 将无法接收该元素
                    greedy: true
                }, option);
                node.droppable(option);
            }
        };
        //实现自定义拖拽
        _.clearDrag = function(node) {
            node = $(node);
            if (!node.draggable) console.log('clearDrag不生效，请先引入jquery.ui.js');
            else {
                node.draggable('destroy');
                delete W.Control.drag[node.attr('_dragid')];
                node.removeAttr('_dragid');
            }
        };
        _.clearDrop = function(node) {
            node = $(node);
            if (!node.droppable) console.log('clearDrop不生效，请先引入jquery.ui.js');
            else {
                node.droppable('destroy');
                delete W.Control.drop[node.attr('_dropid')];
                node.removeAttr('_dropid');
            }
        };

        _.wheel = function(node, func) {
            var $node = $(node);
            //不兼容FF
            $node.on('mousewheel', function(e) {
                V.cancel(e);
                var data = Math.abs(e.originalEvent.deltaY);
                (Math.floor(data) == data) ?
                func({ name: 'wheel', e: e, deltaX: e.originalEvent.deltaX, deltaY: e.originalEvent.deltaY }):
                    func({ name: 'scale', e: e, scale: e.originalEvent.wheelDelta > 0 ? 1 : -1 });
            });
            $node.on('mousemove', function(e) { $node.select(); })
        }
    };
    W.Control.drag = {};
    W.Control.drop = {};

    {

        //配置JSON数据格式定义的控件
        /**
     * 
     * VJ.registScript(path,function(){
    var __ = {};
    var _ = this;
    VJ.inherit.apply(_,[VJ.view.WControl,	{
		template:'',
		vm:{
			data:{},
			controls:{}
			onLoad:function(D,I){}
		},
		onLoad:{k:function(node){}}, // {}
		fill:function(){ return {} },// {}
		render:{k:function(v,data){}},//{}
	}]);
})
     * @param {*} json 
     */

        W.Control2 = function(json) {
            var __ = V.merge({
                template: '',
                vm: {},
                onLoad: {},
                render: {}
            }, json);
            __.event = __.event || __.onLoad;
            var _ = this; {
                V.inherit.apply(this, [W.Control, [__.template, __.vm]]);
                __.prerender = _.render;
                //__.preonLoad = _.onLoad;
                _.fill = __.fill || _.fill;
                //todo 定义所有可监听的事件 默认这里未添加BindEvent的默认内容
                _.Events = {};
                //todo 定义所有属性 默认这里属性和方法必须决定是否同步或者异步执行 应该先取代再瘦身
                //todo 父子类无法简单继承 要求 父类的json和子类的json不是覆盖关系
                _.Propertis = {};
                _.desc = function() { return { Event: _.Events, Propertis: _.Propertis }; };
                __.async = {};
                __.sync = {};
                __.finally = {};
                __.merge = {};
                V.forC(__.render || {}, function(k, v) {
                    var k2 = k.toLowerCase();
                    v = typeof(v) === 'function' ? {
                        Desc: '属性没有任何描述',
                        sync: true, //默认为同步处理,
                        finally: false, //finally一定是异步的
                        override: false, //是否覆盖父类方法
                        merge: false, //是否采用深度复制
                        Method: v
                    } : V.merge({
                        Desc: '属性没有任何描述',
                        sync: true, //默认为同步处理,
                        finally: false, //finally一定是异步的
                        override: false, //是否覆盖父类方法
                        merge: false, //是否采用深度复制
                    }, v);
                    //Method为false或者未定义则不可作为可用属性出现
                    v && (function() {
                        v.Method = v.Method || function() {};
                        _.Propertis[k] = { Desc: v.Desc || '属性没有任何描述', all: v.all };
                        var poi = v.finally ? 'finally' : v.sync ? 'sync' : 'async';
                        __[poi][k2] = v;
                        v.merge === true && (__.merge[k2] = true);
                        v.as && (v.as = V.isArray(v.as) ? v.as : [v.as]) && v.as.forEach(function(v2) {
                            __[poi][v2.toLowerCase()] = v;
                            _.Propertis[v2] = v.Desc;
                        });
                    })();
                }, null, true);
            }
            _.call = function(name, param, tparam) {
                name = name.toLowerCase();
                var val = null;
                V.lightMerge(_.vm.data, _.fill(), param || {}, true);
                param = V.merge(_.vm.data, tparam || {});
                (_.events[name]) && V.tryC(function() {
                    val = _.events[name].apply(_.parent.vms, [param, _.vm]);
                    if (val && V.toJsonString(val).length > 2) {
                        V.merge(_.vm.data, val, true)
                        _.render(val);
                    }
                });
                return val;
            };
            _.preonload = function(node) {
                var em = V.merge({}, __.event);
                V.forC(em, function(k, v) {
                    v = typeof(v) === 'function' ? {
                        Desc: '没有任何描述',
                        Method: v
                    } : v;
                    em[k.toLowerCase()] = v;
                    !'init'.eq(k) && (_.Events[k] = v.Desc || '没有任何描述');
                }, function() {
                    //提供load方法作为控件初始化使用
                    em['init'] && em['init'].Method.apply(_, [node]);
                    V.forC(_.events, function(k, v) {
                        k = k.toLowerCase();
                        ((em[k] && em[k].Method) ? em[k].Method : _.bindEvent).apply(_, [node, k, v]);
                    }, function() {
                        //__.preonLoad(node); 不再调用父类的onLoad方法由Control统一控制完成
                        em['finally'] && em['finally'].Method.apply(_, [node]);
                    }, true);
                }, true);
            };
            _.render = function(data) {
                //如何实现在这种情况下对父类方法的覆盖和复用?
                var ret = { async: [], sync: [], finally: [] };
                var rdata = {};
                V.forC(data, function(k, v) {
                    var k2 = k.toLowerCase();
                    var name = !!__.sync[k2] ? 'sync' : (!!__.async[k2] ? 'async' : !!__.finally[k2] ? 'finally' : false);
                    name && ret[name].push({ func: __[name][k2].Method, data: v, name: k2 });
                    !(name && __[name][k2].override) && (rdata[k2] = (v && v.Method) || v);
                    //保证完整赋值
                    !__.merge[k2] && (_.vm.data[k] = v);
                }, function() {
                    rdata = __.prerender(rdata);
                    //保证同异步同时启动 一般会是同步先执行完 然后 执行异步 最后是finally方法
                    ret.sync.forEach(function(v) {
                        try {
                            v.func.apply(_, [v.data, data, v.name]);
                        } catch (e) {
                            console.log(v, _, e.stack);
                        }
                    });
                    V.each(ret.async, function(v) {
                        try {
                            v.func.apply(_, [v.data, data, v.name]);
                        } catch (e) {
                            console.log(v, _, e.stack);
                        }
                    }, function() {
                        V.each(ret.finally, function(v) {
                            try {
                                v.func.apply(_, [v.data, data, v.name]);
                            } catch (e) {
                                console.log(v, _, e.stack);
                            }
                        })
                    });
                }, true);
                return rdata;
            };
        };
        //专门为Control2继承而使用
        var _mergefunc = function(_, ret, json, json2, name) {
                ret[name] = !!json[name] && !!json2[name] ? (function() {
                    var em = json[name];
                    var em2 = json2[name];
                    var data = {};
                    V.forC(em, function(k, v) {
                        data[k] = !!em2[k] ? (function() {
                            var v1 = typeof(v) == 'function' ? { Method: v, override: false } : v,
                                v2 = typeof(em2[k]) == 'function' ? { Method: em2[k], override: false } : em2[k];
                            delete em2[k];
                            var data2 = V.merge(v1, v2);
                            data2.Method = v2.override ? data2.Method : function() {
                                return v1.Method.apply(this, arguments) & v2.Method.apply(this, arguments);
                            };
                            return data2;
                        })() : v;
                    }, function() {
                        data = V.merge(data, em2);
                    }, true);
                    return data;
                })() : (json[name] || ret[name]);
            }
            /**
             * 专门为Control2继承而使用
             * @param {*} json 
             * @param {*} json 
             */
        var _merge = function(json, json2) {
            var _ = this;
            var ret = V.merge(json, json2);
            ret.template = json2.template || json.template;
            _mergefunc(_, ret, json, json2, 'onLoad');
            _mergefunc(_, ret, json, json2, 'fill');
            _mergefunc(_, ret, json, json2, 'render');
            ret.fill && (ret.fill = (ret.fill.Method || ret.fill));
            return ret;
        };
        W.Control2.merge = function() {
            var _ = this;
            var as = (arguments.length > 0 ? Array.prototype.slice.call(arguments) : [{}])
            as.forEach(function(v, i) {
                i > 0 && (as[0] = _merge.apply(_, [as[0], v]));
            });
            return as[0];
        };
    }
    //分别定义view与viewmodel的Page
    M.Page = function(cm, data) {
        var _ = this,
            __ = {};
        _.vms = V.getValue(data, {});
        _.models = _.vms;
        //默认使用配置作为事件定义
        V.inherit.apply(_, [M.Control, []]);
        _.page = _.vms.page || {};
        _.data = _.page.data || {};
        if (cm) {
            switch (V.getType(cm)) {
                case 'object':
                case 'Object':
                    if (cm.getConfigValue) {
                        _.config = cm;
                    } else {
                        _.config = V.config.getApplicationConfigManagerFromObj(cm);
                    }
                    break;
                case 'string':
                    cm = eval('(' + cm + ')');
                    _.config = V.config.getApplicationConfigManagerFromObj(cm);
            }
        } else {
            _.config = V.config.getApplicationConfigManagerFromObj();
        }
        _.middler = new V.middler.Middler(_.config);
        _.ni = new V.ni.NiTemplateManager(_.config, M.NIAPP);
        _.session = _.middler.getObjectByAppName(M.APP, 'SessionDataManager');
        _.getModels = function(id) { return id ? (_.vms[id] ? _.vms[id] : null) : _.vms; };
        _.setModels = function(id, v) { _.vms[id] = v; };
        __.bind = _.bind;
        _.bind = function(view) {
                __.bind(view);
                _.page.v = view;
            }
            //初始化操作
        var _page = _.middler.getObjectByAppName(W.APP, 'page');
        if (!_page) { throw new Error('没有找到page对应的页面view层对象'); }
        //所有页面的操作起点
        _page.ready(function() {
            _page.init(_, $(document.body));
            _page.bind(_);
        });
    };
    W.Page = function(path) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [W.Control, [path]]);
            _.vs = {};
            _.controls = [];
            __.render = _.render;
            __.onLoad = _.onLoad;
            __.dispose = _.dispose;
        }
        //用于重载触发方式 ready{init,bind(replace,onload),bindControl{onReady}}
        _.ready = function(func) {
            $(function() {
                func();
                _.bindControl(_.node);
            });
            window.onbeforeunload = function(e) {
                _.events['close'] ? (e.returnValue = _.vm.get().close || '请稍等……', _.call('close', { e: e })) : _.dispose();
            };
        };
        //一般调用M.Page对象都比较特殊
        _.bind = function(page) {
            var vm = page.page;
            _.page = page;
            if (vm) {
                //仅针对page节点
                _.vm = vm;
                //完成配置合并
                _.vm.data = V.merge(_.params, V.getValue(_.vm.data, {}));
                //完成方法注入
                _.vm.update = function() {
                    if (arguments.length == 0) {
                        _.vm.data = V.lightMerge(_.vm.data, _.fill());
                    } else {
                        var as = Array.prototype.slice.call(arguments);
                        as[0] = (as.length > 0 && as[0]) ? (function() {
                            V[!!as[1] ? 'merge' : 'lightMerge'](_.vm.data, as[0], true);
                            return as[0];
                        })() : V.lightMerge({}, _.vm.data);
                        _.render.apply(_, as);
                    }
                    return _.vm.data;
                };
                _.vm.call = function() { return _.call.apply(_.page.getModels(), arguments); };
                _.vm.add = function() { _.addControl.apply(_, arguments); };
                _.vm.remove = function() { _.removeControl.apply(_, arguments); };
                _.vm.desc = _.desc;
                _.vm.get = function(key) { _.vm.data = V.merge(_.vm.data, _.fill()); return key ? _.vm.data[key] : _.vm.data; };
                _.page.registEvent = _.registEvent;
                _.page.callEvent = _.callEvent;
                _.page.hasEvent = _.hasEvent;
                _.page.clearEvent = _.clearEvent;
                _.page.registCommand = _.registCommand;
                _.page.callCommand = _.callCommand;
                _.page.hasCommand = _.hasCommand;
                _.page.clearCommand = _.clearCommand;

                V.forC(vm, function(key, value) {
                    key = key.toLowerCase();
                    if (key.indexOf('on') == 0) {
                        //事件注册
                        _.events[key.substring(2)] = value;
                    }
                }, function() { page.bind(_); }, true);
            } else {
                _.vm = { data: V.merge(_.params, {}) };
            }
            _.vms = _.page.vms;
            _.models = _.vms;
            _.middler = page.middler
            _.ni = page.ni;
            _.session = page.session;
            _.config = page.config;
            _.readyLoad = {
                ready: false,
                node: null,
                onLoad: _.onLoad,
                path: _.path,
                wait: false //等待递归调用readyLoad方法时等待父类的replaceNode执行完成
            };
            if (_.path) {
                W.getTemplate(_.path, function(node) {
                    _.replaceNode(node);
                    _.readyLoad.wait = false;
                    _.readyLoad.node = node;
                    _.preonload && _.preonload(node);
                    W.readyLoad({
                        readyLoad: _.readyLoad,
                        controls: _.controls
                    });
                    //_.onLoad(node);
                });
            } else {
                _.node.show();
                _.readyLoad.wait = false;
                _.readyLoad.node = _.node;
                _.preonload && _.preonload(_.node);
                // W.readyLoad({
                //     readyLoad: _.readyLoad,
                //     controls: _.controls
                // });
                //_.onLoad(_.node);
            }
        };
        _.preonload = function(node) {
            V.forC(_.events, function(k, v) {
                switch (k) {
                    case 'close':
                        break;
                    case 'size':
                        $(window).resize(function() {
                            V.userAgent.refresh();
                            _.call('size', {
                                height: V.userAgent.height,
                                width: V.userAgent.width
                            });
                        });
                        break;
                    case 'wheel':
                        var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";
                        //todo 兼容版本 判断为向下
                        node[0].addEventListener(wheelEvent, function(e) { _.call('wheel', { e: e, isDown: e.wheelDelta < 0 }) }, false);
                        break;
                    default:
                        _.bindEvent(node, k, v);
                        break;
                }
            }, null, true);
        };
        //用于绑定对应的控件
        _.bindControl = function(node) {
            //这里应该由真实的View层调用使用document.ready实现
            V.each(node.find('[_]').toArray(), function(v1) {
                _.readyLoad.wait = true;
                var v = $(v1);
                var id = v.attr('id');
                var json = eval("({" + v.attr('_') + "})");
                var type = json.type ? json.type : (id && _.page.getModels(id) && _.page.getModels(id).type) ? _.page.getModels(id).type : null;
                //对于容器类对象的处理方式
                var nodeName = type ? type.toLowerCase() : v[0].nodeName.toLowerCase();
                var obj = _.middler.getObjectByAppName(W.APP, nodeName);
                if (!obj) V.showException('配置文件中没有找到对象类型定义:' + nodeName);
                obj.init(_, v, V.isValid(v.attr('_')) ? json : null);
                obj.page = _;
                _.controls.push(obj);
                if (!id) {
                    id = nodeName + V.random();
                }
                obj.nodeName = nodeName;
                if (!_.page.getModels(id)) {
                    _.page.setModels(id, { data: {} });
                }
                _.vs[id] = obj;
                V.inherit.apply(_.page.getModels(id), [M.Control, []]);
                obj.bind(_.page.getModels(id));
            }, function() {
                //实现通过type属性完成数据初始化的功能
                V.forC(_.page.getModels(), function(key, v) {
                    if (v.type && !v.v) {
                        _.readyLoad.wait = true;
                        var obj = _.middler.getObjectByAppName(W.APP, v.type);
                        if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
                        var node2 = V.newEl('div');
                        node.append(node2);
                        obj.init(_, node2, null);
                        obj.page = _;
                        _.controls.push(obj);
                        _.vs[key] = obj;
                        V.inherit.apply(v, [M.Control, []]);
                        obj.bind(v);
                    }
                }, function() {
                    _.onReady();
                    _.readyLoad.wait = false;
                    W.readyLoad({
                        readyLoad: _.readyLoad,
                        controls: _.controls
                    });
                    _.call('start');
                }, true);
            });
        };
        _.dispose = function(e) {
            _.session.updateAll();
            _.call('dispose');
            $('body').empty();
        };
        //用于覆盖引起页面布局改变
        _.onReady = function() {};
        _.call = function(name, param, imme) {
            //所有的事件调用全部采用异步调用方式 V.once				
            param = V.lightMerge(_.vm.data, param || {});
            name = name.toLowerCase();
            var val = null;
            (_.events[name]) && V.tryC(function() {
                val = _.events[name].apply(_.parent.getModels(), [imme ? param : _.vm.data, _.vm]);
                imme && V.merge(_.vm.data, param, true);
                if (val && V.toJsonString(val).length > 2) {
                    V.merge(_.vm.data, val, true)
                    _.render(val);
                }
            });
            return val;
        };

        //可以将数据更新
        _.render = function(data) {
            data = __.render(data);
            V.forC(data, function(key, value) {
                switch (key) {
                    case 'title':
                        document.title = value;
                        if (data != _.vm.data) { delete data[key]; }
                        break;
                    case 'close':
                        _.dispose();
                        window.close();
                        break;
                    case 'vibrate':
                    case 'shake':
                        if (navigator.vibrate) { navigator.vibrate(v); } else console.log('浏览器不支持此方法!');
                        break;
                }
            });
            return data;
        };
        //动态添加控件到指定位置 如果不指定那么会添加到最后
        _.addControl = function(node, v) {
            var obj = _.middler.getObjectByAppName(W.APP, v.type);
            if (!obj) throw new Error('配置文件中没有找到对象类型定义:' + v.type);
            node = node ? node : V.newEl('div').appendTo(_.node);
            obj.init(_, node, v.data);
            obj.page = _;
            _.controls.push(obj);
            var key = V.getValue(v.id, V.random());
            if (_.vs[key]) { V.showException('控件id为' + key + '的控件已经存在，请更换id名'); return; }
            _.vs[key] = obj;
            V.inherit.apply(v, [M.Control, []]);
            _.vm.vms[key] = v;
            _.readyLoad.ready = false;
            obj.bind(v);
            return v;
        };
        _.removeControl = function(id) {
            delete _.vm.vms[id];
            if (_.vs[id]) {
                var val = _.vs[id];
                delete _.vs[id];
                _.controls = $.grep(_.controls, function(v, i) { return v != val; });
                if (val) val.dispose();
                //V.tryC(function(){_.vs[id].node.remove();});
            }
        };
        _.clearControl = function() {
            if (_.controls) {
                var vs = _.vs
                var div = $('<div style="display:none;"></div>').appendTo(window.document.body);
                _.node.children().appendTo(div);
                V.forC(vs, function(k, v) { v.dispose(); }, function() { div.remove(); }, true);
            }
            _.controls = [];
            _.vs = {};
            _.vm.vms = {};
            _.models = _.vm.vms;
        };
    };
    //sessionAdapter添加处理业务逻辑 供人重新赋值
    M.SessionDataManager = function(ada) {
        var _ = this,
            __ = {}; {
            __.ada = ada;
            __.data = {};
            if (!__.ada) { throw new Error('SessionDataManager 需要设置SessionDataAdapter'); }
        }
        _.get = function(name) {
            if (!__.data[name]) {
                __.data[name] = {};
                __.data[name] = __.ada.fill(name);
            }
            return __.data[name];
        };
        _.data = _.get;
        //支持 session.update('会话key',[data]);
        _.update = function(name, data) {
            __.data[name] = V.merge(_.data(name), V.getValue(data, {}));
            __.ada.update(__.data[name], name);
        };
        //支持 session.clear('会话key',[data]);
        _.clear = function(name) {
            __.ada.clear(name);
        };
        _.updateAll = function() {
            var ret = [];
            for (var i in __.data) {
                ret.push({ key: i, value: __.data[i] });
            }
            V.whileC(function() { ret.shift(); }, function(v) { _.update(v.key, v.value); }, function() {}, true);
        };
        _.isLogin = function() { return false; };
    };
    M.SessionDataAdapter = function(resource) {
        var _ = this,
            __ = {}; {
            __.resource = resource;
            __.ress = {};
        }
        _.setResource = function(name, res) {
            __.ress[name] = res;
        };
        _.getResource = function(name) {
            return __.ress[name] ? __.ress[name] : __.resource;
        };
        _.fill = function(name) {
            return V.getValue(_.getResource(name).load(name), {});
        };
        _.update = function(data, name) {
            _.getResource(name).save(name, V.getValue(data, {}));
        };
        _.clear = function(name) {
            _.getResource(name).clear(name);
        }
    };
    //专门用于继承使用
    M.SessionDataResource = function() {
        var _ = this,
            __ = {}; {}
        _.load = function(name) { return ''; };
        _.save = function(name, data) {};
        _.clear = function(name) {};
    };
    M.SessionDataResourceDecorator = function() {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [M.SessionDataResource, []]);
            __.res = Array.prototype.slice(arguments, 0);
            console.log(__.res);
        }
        _.load = function(name) {
            var val = undefined;
            __.res.forEach(function(v) { try { val = val ? val : v.load(name); } catch (e) {} });
            return val;
        };
        _.save = function(name, data) {
            V.each(__.res, function(v) { try { v.save(name, data); } catch (e) {} });
        };
        _.clear = function(name) {
            V.each(__.res, function(v) { try { v.clear(name); } catch (e) {} });
        };
    };
    //定义时必须说明cookie.js的位置
    M.CookieDataResource = function(param) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [M.SessionDataResource, []]);
            if (!$.cookie) {
                V.include('ref/jquery.cookie.js');
            }
            if (!$.cookie) {
                V.showException('下载不到jquery.cookie.js')
            }
            __.param = V.getValue(param, {});
        }
        _.load = function(name) {
            var val = $.cookie(name);
            var data = {};
            if (val) {
                var args = decodeURIComponent(val).replace(/\+/g, ' ').split('&'); // parse out name/value pairs separated via &
                if (args.length == 1 && args[0].indexOf("{") == 0) {
                    return eval("(" + args[0] + ")");
                } else {
                    // split out each name=value pair
                    for (var i = 0; i < args.length; i++) {
                        var pair = args[i].split('=');
                        var name = decodeURIComponent(pair[0]);

                        var value = (pair.length == 2) ?
                            decodeURIComponent(pair[1]) :
                            name;
                        data[name] = value;
                    }
                    return data;
                }
            } else return {};
        };
        _.save = function(name, data) {
            //处理json变str
            switch (typeof(data)) {
                case 'string':
                case 'String':
                    $.cookie(name, data, __.param);
                    break;
                default:
                case 'object':
                case 'Object':
                    $.cookie(name, V.encHtml(V.toJsonString(V.getValue(data, {}))), __.param);
                    break;
            }
        };
        _.clear = function(name) {
            $.cookie(name, '', { expires: -1 });
        };
    };
    //处理localStorage与sessionStorage 与 全局对象ObjectDB
    M.StorageDataResource = function(storage, timeout) {
        var _ = this,
            __ = {}; {
            V.inherit.apply(_, [M.SessionDataResource, []]);
            __.storage = V.getValue(storage, window.sessionStorage);
            switch (typeof(__.storage)) {
                case 'string':
                    __.storage = eval('(' + __.storage + ')');
                    break;
                case 'object':
                    if (V.isArray(__.storage)) {
                        throw new Error('不能使用数组作为资源');
                    }
                    break;
                default:
                    throw new Error('M.StorageDataResource 无法找到<' + storage + '>对象');
            }
            //默认缓存8个小时
            __.timeout = V.getValue(timeout, { interval: 'h', number: '8' });
            if (!storage) {
                throw new Error('不可使用此对象缓存，当前浏览器版本不支持!');
            }
            _.load = function(name) {
                var val = null;
                if (__.storage.getItem) {
                    val = V.json(__.storage.getItem(name));
                } else {
                    val = __.storage[name];
                }
                if (val) {
                    if (val.date) {
                        if (parseFloat(val.date) < new Date().getTime()) {
                            delete __.storage[name];
                            return null;
                        }
                        return val.data;
                    }
                }
                return null;
            };
            _.save = function(name, str) {
                str = V.getValue(str, '');
                if (!str) {
                    if (__.storage.removeItem) {
                        __.storage.removeItem(name);
                    } else {
                        delete __.storage[name];
                    }
                    return;
                }
                if (__.storage.setItem) {
                    __.storage.setItem(name, V.toJsonString({
                        data: str,
                        date: (__.timeout ? new Date().add(__.timeout.interval, __.timeout.number).getTime() : false)
                    }));
                } else {
                    __.storage[name] = {
                        data: str,
                        date: (__.timeout ? new Date().add(__.timeout.interval, __.timeout.number).getTime() : false)
                    };
                }
            };
            _.clear = function(name) { _.save(name); };
        }
    };
    //todo 加解密DataResource

    //todo action 对象组
    //ValidateManager对象负责完成view.view控件对于data.validate的属性处理与默认值绑定工作。
    //将data.validate对象按照middler定义转换成真实的判断对象，并由控件主动调用绑定其特有的input对象, 提供render中默认的valid方法只针对value进行验证
    //注入view层对象valid方法 和三种onError,onClearError,onSuccess(因为无法进行联合的验证次数判断)和事件触发 清理异常这种事建议由各个控件自己负责,目前统一处理为下一次验证开始时就调用onClearError方法 其次view.control对象在onLoad中过滤onError事件，在render中提供valide方法支持就是调用被注入的validate(text)方法，调用ValidateManager的validate方法时需要设置node与input对象，由具体的reg决定是否跟随输入测试还是等待调用才测试。
    //针对reg子类允许其异步查询和调用onError事件 一般就是check(func)方法，一般地 允许返回func(true/false)来进行异步判断 false就是报错
    //针对reg子类允许remote验证 提交对应的方法和提示语 或者true false
    //允许 data:{valldate:{IsRequired:'请输入默认的提示语',IsNumber:'',IsFloat:'',Regular:{exp:'',error:''},Remote:{exp:function(){},error:''}}}
    //允许针对form提供统一的判断
    W.ValidateManager = function() {
        var _ = this,
            __ = {}; {}
        _.validate = function(control, input) {
            var middler = control.middler;
            var datas = control.get();
            if (datas.validate) {
                var regs = [];
                V.forC(datas.validate, function(k, v) {
                    var reg = middler.getObjectByAppName(W.APP, k);
                    if (!reg) throw new Error('没找到对应的reg处理对象' + k);
                    if (typeof(v) == 'string') {
                        v = { reg: '', error: v };
                    } else v = V.merge({ reg: '', error: '' }, v);
                    reg.init(control, v.reg, v.error, input);
                    regs.push(reg);
                }, function() {
                    control.valid = function(text, func) {
                        if (control.isError) {
                            control.onClearError();
                        }
                        var success = true;
                        var data = Array.prototype.slice.call(regs, 0);
                        V.whileC2(function() { return data.shift(); }, function(reg, next) {
                            reg.validate(text, function(suc) {
                                success = success && (suc && suc.length > 0);
                                if (success) {
                                    next();
                                } else {
                                    //警报
                                    control.isError = true;
                                    control.onError(reg.error);
                                }
                            });
                        }, function() {
                            if (success) {
                                control.isError = false;
                                control.onSuccess();
                                if (func) { func(text); }
                            }
                        });
                    };
                });
            }
        };
    };
    W.Regex = function(reg, error) {
        var _ = this,
            __ = {}; {
            __.reg = V.getValue(reg, '');
            __.error = V.getValue(error, '');
        }
        _.init = function(control, reg, error, input) {
            _.cont = control;
            _.reg = V.getValue(__.reg, reg);
            _.error = V.getValue(error, __.error);
            if (!V.isValid(_.reg)) throw new Error('Regex默认使用reg属性完成判断reg属性不能为空!');
            else if (typeof(_.reg) == 'string') { _.reg = eval(_.reg); };
        };
        _.validate = function(text, func) {
            func((text || '').match(_.reg));
        };
    };
})(VJ, jQuery);