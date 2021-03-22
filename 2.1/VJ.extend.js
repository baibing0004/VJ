//常用基本操作/* 得到日期年月日等加数字后的日期 new Date().add('h',1)*/
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
};