/* 同步获取js模块 */
function _VJ_XmlDOM() { }
/*_VJ_XmlDOM内部方法
*-- 参数1：url， js或css的路径
*-- 参数2：获取方式get，post
*-- 参数3：post字符串
*-- 参数4：是否异步，true,false
*-- 参数5：回调方法
*/
_VJ_XmlDOM.prototype.create = function (URL, fun, pStr, isSyn, callBack) {
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
        this.xhReq.onreadystatechange = function () {
            if (this.readyState == 4 && (this.status == 200 || this.status == 0)) {
                if (callBack) {
                    callBack(this.responseXML.documentElement);
                }
                else
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
    }
    else if (this.type == 3)//这是IE用来读取本地xml的方法
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
_VJ_XmlDOM.prototype.getXMLReq = function () {
    var xmlhttp = null;
    if (window.XMLHttpRequest) {	// code for all new browsers like IE7/8 & FF
        xmlhttp = new XMLHttpRequest();
        this.type = 1;
    }
    else if (window.ActiveXObject) {	// code for IE5 and IE6
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        this.type = 2;
    }
    //如果读取本地文件，则使用AXObject，因为httpRequest读取本地文件会报拒绝访问
    if (document.location.href.indexOf("http://") < 0 && window.ActiveXObject) {
        xmlhttp = new ActiveXObject("Microsoft._VJ_XmlDOM");
        this.type = 3;
    }
    return xmlhttp;
}
/*请求失败
*/
_VJ_XmlDOM.prototype.abort = function () {
    this.xhReq.abort();
}
/*获取js代码后，添加到页面内容下
*/
function _VJ_AppendScript(data, callback) {
    var ua = navigator.userAgent.toLowerCase();
    isOpera = ua.indexOf("opera") > -1
    isIE = !isOpera && ua.indexOf("msie") > -1
    var head = document.getElementsByTagName("head")[0] || document.documentElement, script = document.createElement("script");
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
    callback.call(script);
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
} 
VJ = {};
VJ.inherit = function(parent,args){
	//绕过了parent的构造函数，重新链接原型链条
	var _temp = (function(){
		var F = function(){};
		F.prototype = parent.prototype;
		F.prototype.isF = true;
		return new F();
	})();
	_temp.constructor = parent;
	if(!this.prototype){			
		//这里确认是实例
		//确定是打断了原型链 使得this的原型为Object		
		parent.apply(this,args);		
		//从新接驳原型链 使得原型链上的prototype都设置到最早的类的prototype上了
		if(!this.__proto__.isF){
			this.__proto__.constructor.prototype = _temp.__proto__.constructor.prototype;
		}	
		//son.prototype = _temp; //这里可以分层 但是会使得prototype实例变了又变 废弃
		this.__proto__ = _temp;
		this.base = this.__proto__.constructor.prototype;
	} else {
		console.log('如果失败，需要配合子类构造函数中使用parent.apply(this,[***])');
		//这里确认是类定义
		this.prototype = _temp;
	}
};
//继承改为构造函数中使用this.inherit(parent,[]);
//默认使用这种方式进行继承
//VJ.inherit.call(this,ClassA,[]);
VJ._include = {};
/* 添加 js 和 css 引用
*-- 参数1：url， js或css的路径
*-- 参数2：tag， 标签名称'head'或'body' ，可以为空，默认加在'head'内
*-- 案例：VJ.include("script/jquery1.3/ui.core.js");
*/
VJ.include = function (url, tag, callback) {
    //如果已经使用本方法加载过 就不再加载。
    if (VJ._include[url]) return;
    VJ._include[url] = true;
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
		//}else 同步
		{
			var thisJsDom = new _VJ_XmlDOM();
			thisJsDom.create(url, "get", null, false, function (data) {
				_VJ_AppendScript(data, callback)
			});
			if(callback){
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
		if(callback){
			callback();
		}
    }
};
VJ.include("../../scripts/jquery-1.8.0.min.js");
//VJ.include("../../scripts/jquery.js"); 
VJ.include("../../scripts/jquery-ui.js");
VJ.include("../../scripts/plugins/jquery.mousewheel.js");
VJ.include("../../scripts/plugins/Modernizr.js");
/*判断是否有效，返回值为bool类型，true为有效，false为无效
*-- 参数1：data,  任意类型
*-- 案例：VJ.isValid(option); VJ.isValid(option.node);
*/
VJ.isValid = function (data) {
    if (typeof (data) != "undefined" && data != null && data != 'null' && !(data === '')) {
        return true;
    } else {
        return false;
    }
};
/*获取有效值。如果所判断值data有效，则返回data的值；否则返回默认值defaultData
*-- 参数1：data, 要进行判断的值
*-- 参数2：defaultData，默认值
*-- 案例：VJ.getValue(option.node, VJ.newEl('div', '', ''))
*/
VJ.getValue = function (data, defaultData) {
    return VJ.isValid(data) ? data : defaultData;
};
VJ.getType = function (x) {
    if (x == null) {
        return "null";
    }
    var t = typeof x;
    if (t != "object") {
        return t;
    }
    var c = Object.prototype.toString.apply(x);
    c = c.substring(8, c.length - 1);
    if (c != "Object") {
        return c;
    }
    if (x.constructor == Object) {
        return c;
    }
    if (x.prototype && "classname" in x.prototype.constructor
            && typeof x.prototype.constructor.classname == "string") {
        return x.constructor.prototype.classname;
    }
    return "ukObject";
};
////string boolean undefined null number
//alert(VJ.getType('a'));//string
//alert(VJ.getType(true));//boolean
//alert(VJ.getType());//undefined
//alert(VJ.getType(null));//null
//alert(VJ.getType(34));//nubmer
////Function Array String Boolean Number Date
//alert(VJ.getType([]));//Array
//alert(VJ.getType(new Date()));//Date
//alert(VJ.getType(function () { }));//function
//alert(getType({})); //Object
//alert(getType(document.createElement('div'))); //HtmlDivElement
//小方法 可以根据返回值判断window是否打开
VJ.openWindow = function(){
	try{
		var ret = window.open.apply(window,arguments);
		return ret!=null;
	}catch(e){
		return false;
	}
};
//判断是否还有插件，请注意在IE下插件名不一致
VJ.hasPlugin = function(name){
	var _hasPlugin = function(){
	name = name.toLowerCase();
    for (var i = 0; i < navigator.plugins.length; i++) {
        if (navigator.plugins[i].name.toLowerCase().indexOf(name) > -1) {
            return true;
        }
    }
    return false;
	};
	var _iehasPlugin = function(){
		try {
			switch(nameto.LowerCase()){
				case 'flush':
					name="ShockwaveFlash.ShockwaveFlash"; 
					break;
				case 'quicktime':
					name = "QuickTime.QuickTime";
					break;
			}
			new ActiveXObject(name);
			return true;
		} catch (ex) {
			return false;
		}
	};
	var result = _hasPlugin(name);
    if (!result && VJ.userAgent.ie) {
        result = _iehasPlugin(name);
    }
    return result;
};
//VJ.format('a<%=a%>b',{a:123}) => a123b
VJ.format = function(s,o){
	var reg = /<%=[^(%>)]+%>/gi;
	return s.replace(reg,function(word){
		var prop = word.replace(/<%=/g,'').replace(/%>/g,'');
		if(o[prop]){
			return o[prop];
		}else{
			return "";
		}
	});
};

//设定文本框选中范围 譬如 VJ.selectText($()/getElementById,0,20);
VJ.selectText = function(node,start,length){
	if(node.length){
		node = node[0];
	}
    if(node.setSelectionRange){
        node.setSelectionRange(start,start+length);
    } else if (node.createTextRange) {
		var range =node.createTextRange();
		range.collapse(true);
		range.moveStart('charactor',startIndex);
		range.moveEnd('charactor',length);
		range.select();
	}
    node.focus();
};

/* 得到日期年月日等加数字后的日期 new Date().add('h',1)*/ 
Date.prototype.add = function(interval,number) 
{ 
	var d = new Date(this.getTime());
	var k={'y':'FullYear', 'q':'Month', 'm':'Month', 'w':'Date', 'd':'Date', 'h':'Hours', 'n':'Minutes', 's':'Seconds', 'ms':'MilliSeconds'};
	var n={'q':3, 'w':7};
	eval('d.set'+k[interval]+'(d.get'+k[interval]+'()+'+((n[interval]||1)*number)+')');
	return d;
} 
/* 计算两日期相差的日期年月日等 new Date().diff('h',new Date().add('d',1)); */ 
Date.prototype.diff = function(interval,objDate2) 
{ 
	var d=this, i={}, t=d.getTime(), t2=objDate2.getTime(); 
	i['y']=objDate2.getFullYear()-d.getFullYear(); 
	i['q']=i['y']*4+Math.floor(objDate2.getMonth()/4)-Math.floor(d.getMonth()/4); 
	i['m']=i['y']*12+objDate2.getMonth()-d.getMonth(); 
	i['ms']=objDate2.getTime()-d.getTime(); 
	i['w']=Math.floor((t2+345600000)/(604800000))-Math.floor((t+345600000)/(604800000)); 
	i['d']=Math.floor(t2/86400000)-Math.floor(t/86400000); 
	i['h']=Math.floor(t2/3600000)-Math.floor(t/3600000); 
	i['n']=Math.floor(t2/60000)-Math.floor(t/60000); 
	i['s']=Math.floor(t2/1000)-Math.floor(t/1000); 
	return i[interval]; 
}
/* 计算两日期相差的日期年月日等 new Date().toString('yyyy-MM-dd'); */ 
Date.prototype.toString=function(fmt) {           
	var o = {           
		"M+" : this.getMonth()+1, //月份           
		"d+" : this.getDate(), //日           
		"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时           
		"H+" : this.getHours(), //小时           
		"m+" : this.getMinutes(), //分           
		"s+" : this.getSeconds(), //秒           
		"q+" : Math.floor((this.getMonth()+3)/3), //季度           
		"S" : this.getMilliseconds() //毫秒           
	};           
	var week = {           
		"0" : "/u65e5",           
		"1" : "/u4e00",           
		"2" : "/u4e8c",           
		"3" : "/u4e09",           
		"4" : "/u56db",           
		"5" : "/u4e94",           
		"6" : "/u516d"          
	};           	
	if (fmt) { } else {
		fmt = 'yyyy/MM/dd HH:mm:ss';
	}
	if(/(y+)/.test(fmt)){           
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));           
	}           
	if(/(E+)/.test(fmt)){           
		fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);           
	}           
	for(var k in o){           
		if(new RegExp("("+ k +")").test(fmt)){           
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));           
		}           
	}           
	return fmt;           
};
VJ.setClipBoardText = function(e){
	var data = e.clipboardData || window.clipboardData;
	return data.getData('text');
};
VJ.setClipBoardText = function(e,val){
	if(e.clipboardData){
		e.clipboardData.setData('text/plain',val);
	} else if(window.clipboardData){
		window.clipboardData.setData('text',val);
	}
};
//TOTest
VJ.getEvent = function(event){
	return event?event:window.event;
	//event || window.event;
};
VJ.getTarget = function(event){
	return event.target || event.srcElement;
};
VJ.cancel = function(event){
	if(event.preventDefault){
		event.preventDefault();
	}else{
		event.returnValue = false;
	}
};
VJ.stopProp = function(event){
	if(event.stopPropagation){
		event.stopPropagation();
	}else{
		event.cancelBobble = true;
	}
};
VJ.each = function(data,func,timeout){
    var _this = this;
	var index = 0;
	data = Array.prototype.slice.call(data, 0);
	timeout = 1 || timeout;
	var _func = function () {
		if (index < data.length) {
			window.setTimeout(function () {VJ.tryC(function () {
                try {
					func.apply(_this, [index, data[index]]);
				} finally {
					index++;
					_func.apply(_this, []);
				}
			});}, timeout);
		}
	}
	_func.apply(_this, []);
};
VJ.once = function(func,timeout){
	timeout = 100 || timeout;
	if(func.timeoutID){
		window.clearTimeout(func.timeoutID);
	}
	var _this = this;
	func.timeoutID = window.setTimeout(function(){VJ.tryC(function(){func.apply(_this,[])})},timeout);
};
//TODO
VJ.DropDown = function(){
	var draging = null;
	var func = function(event){
		event = VJ.getEvent(event);
		var node = VJ.getTarget(event);
		switch(event.type){
			case 'mousedown':
				break;
			case 'mousemove':
				break;
			case 'mouseup':
				break;
		}
	}
};
/*
var x = function () { var _this = this; (function () { })(); _this.show = function () { alert('x'); }; };
var xx = new x();
xx.show();
alert(xx.toString());
alert(getType(xx));ukObject
*/
//用于数组，对象的深度合并功能。moveIndex属性用于设定移动至的位置，mergeIndex只用于合并数组中的第几个对象 需要进入reference
//例如
//var ret = VJ.merge({a:22,c:23},{a:34,b:33},{d:"2334",f:true,g:function(){alert("hahaha");}},{h:[1,2,3,4]});
//var ret = VJ.merge({a:[{a:2},{b:3}]},{a:[{moveIndex:3,j:3},{k:4}],b:25});
//var ret = VJ.merge({a:[{a:2},{b:3}]},{a:[{mergeIndex:3,j:3},{k:4}],b:25});
VJ.merge = function () {
    var _clone = function (source) {
        switch (VJ.getType(source)) {
            case 'Object':
                return _merge({}, source);
                break;
            case 'Array':
                var aim = [];
                for (i in source) {
                    aim[i] = _clone(source[i]);
                }
            default:
                return source;
                break;
        }
    };
    var _merge = function (aim, source) {
        if (!(typeof (source) == 'object' && typeof (source.length) == 'undefined')) { return aim; }
        for (var i in source) {
            if (VJ.isValid(source[i])) {
                if (!VJ.isValid(aim[i])) {
                    aim[i] = _clone(source[i]);
                } else {
                    switch (VJ.getType(aim[i])) {
                        case 'Object':
                            _merge(aim[i], source[i]);
                            break;
                        case 'Array':
                            //处理数组
                            var hasmergeIndex = false;
                            for (var i3 = 0, k = source[i][i3]; i3 < source[i].length; i3++, k = source[i][i3]) {
                                if (typeof (k.mergeIndex) == "number") {
                                    hasmergeIndex = true;
                                    if (aim[i].length < (i3 + 1)) {
                                        aim[i].push(k);
                                    } else {
                                        aim[i][i3] = _merge(aim[i][i3], k);
                                    }
                                } else if (typeof (k.moveIndex) == "number") {
                                    hasmergeIndex = true;
                                    aim[i].splice(k.moveIndex, 0, k);
                                }
                            }
                            if (!hasmergeIndex) {
                                aim[i] = _clone(source[i]);
                            }
                            break;
                        default:
                            aim[i] = source[i];
                            break;
                    }
                }
            }
        }
        return aim;
    };
    var argu = arguments;
    if (argu.length < 2) { return argu[0] ? argu[0] : {} };
    var _ = {};
    for (var i2 = 0; i2 < argu.length; i2++)
        _ = _merge(_, argu[i2]);
    return _;
};
//用于弹出对整个对象的遍历内容 也可以被console.log取代
VJ.alertAll = function (p, s) {
	console.log(p+":");
	console.log(s);
	return;
    for (var ii in s) {
        if (typeof (s[ii]) == "object") {
            if (typeof (s[ii].length) == 'undefined') {
                VJ.alertAll(p + ":" + ii, s[ii]);
            } else {
                for (var i3 = 0, k = s[ii][i3]; i3 < s[ii].length; i3++, k = s[ii][i3]) {
                    if (typeof (k) == "object") {
                        VJ.alertAll(p + ":" + ii + ":Array(" + i3 + ")", k);
                    } else alert(p + ":" + ii + ":Array(" + i3 + "):" + k);
                }
            }
        } else { alert(p + ":" + ii + ":" + s[ii]); }
    }
};
//这里标注Bug开关为False
VJ.isDebug = false;
VJ.tryC = function (func) {
    try {
        return func();
    } catch (e) { VJ.showException('', e); }
};
VJ.extend = function (name, data) {
    eval('VJ._' + name + 'Option = VJ.merge(VJ._' + name + 'Option,data);');
};
/* 生成新元素
*-- 参数1：tag 标签
*-- 参数2：样式class
*-- 参数3：标签内内容
*-- 案例：VJ.newEl("div","divClass","我的div");
*/
VJ.newEl = function (tag, style, txt) {
    var elm = $(document.createElement(tag));
    if (txt != "") {
        elm.text(txt);
    }
    if (style != "") {
        elm.addClass(style);
    }
    return elm;
};
VJ.Panal = {
    init: { Title: '' },
    base: Date,
    show: '21',
    print: '13%25256%252528',
    func: function () { setTimeout(VJ.Panal.init, 10000); }
};
VJ.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
VJ._loaderOption = {
    modules: {
        draggable: {
            js: 'jquery.draggable.js'
        },
        droppable: {
            js: 'jquery.droppable.js'
        },
        resizable: {
            js: 'jquery.resizable.js'
        },
        linkbutton: {
            js: 'jquery.linkbutton.js',
            css: 'linkbutton.css'
        },
        progressbar: {
            js: 'jquery.progressbar.js',
            css: 'progressbar.css'
        },
        pagination: {
            js: 'jquery.pagination.js',
            css: 'pagination.css',
            dependencies: ['linkbutton']
        },
        datagrid: {
            js: 'jquery.datagrid.js',
            css: 'datagrid.css',
            dependencies: ['panel', 'resizable', 'linkbutton', 'pagination']
        },
        detailview: {
            js: "datagrid-detailview.js",
            css: "",
            dependencies: ["datagrid"]
        },
        treegrid: {
            js: 'jquery.treegrid.js',
            css: 'tree.css',
            dependencies: ['datagrid']
        },
        propertygrid: {
            js: 'jquery.propertygrid.js',
            css: 'propertygrid.css',
            dependencies: ['datagrid']
        },
        panel: {
            js: 'jquery.panel.js',
            css: 'panel.css'
        },
        window: {
            js: 'jquery.window.js',
            css: 'window.css',
            dependencies: ['resizable', 'draggable', 'panel']
        },
        dialog: {
            js: 'jquery.dialog.js',
            css: 'dialog.css',
            dependencies: ['linkbutton', 'window']
        },
        messager: {
            js: 'jquery.messager.js',
            css: 'messager.css',
            dependencies: ['linkbutton', 'window', 'progressbar']
        },
        layout: {
            js: 'jquery.layout.js',
            css: 'layout.css',
            dependencies: ['resizable', 'panel']
        },
        form: {
            js: 'jquery.form.js'
        },
        menu: {
            js: 'jquery.menu.js',
            css: 'menu.css'
        },
        tabs: {
            js: 'jquery.tabs.js',
            css: 'tabs.css',
            dependencies: ['panel', 'linkbutton']
        },
        splitbutton: {
            js: 'jquery.splitbutton.js',
            css: 'splitbutton.css',
            dependencies: ['linkbutton', 'menu']
        },
        menubutton: {
            js: 'jquery.menubutton.js',
            css: 'menubutton.css',
            dependencies: ['linkbutton', 'menu']
        },
        accordion: {
            js: 'jquery.accordion.js',
            css: 'accordion.css',
            dependencies: ['panel']
        },
        calendar: {
            js: 'jquery.calendar.js',
            css: 'calendar.css'
        },
        combo: {
            js: 'jquery.combo.js',
            css: 'combo.css',
            dependencies: ['panel', 'validatebox']
        },
        combobox: {
            js: 'jquery.combobox.js',
            css: 'combobox.css',
            dependencies: ['combo']
        },
        combotree: {
            js: 'jquery.combotree.js',
            dependencies: ['combo', 'tree']
        },
        combogrid: {
            js: 'jquery.combogrid.js',
            dependencies: ['combo', 'datagrid']
        },
        validatebox: {
            js: 'jquery.validatebox.js',
            css: 'validatebox.css'
        },
        numberbox: {
            js: 'jquery.numberbox.js',
            dependencies: ['validatebox']
        },
        searchbox: {
            js: 'jquery.searchbox.js',
            css: 'searchbox.css',
            dependencies: ['menubutton']
        },
        spinner: {
            js: 'jquery.spinner.js',
            css: 'spinner.css',
            dependencies: ['validatebox']
        },
        numberspinner: {
            js: 'jquery.numberspinner.js',
            dependencies: ['spinner', 'numberbox']
        },
        timespinner: {
            js: 'jquery.timespinner.js',
            dependencies: ['spinner']
        },
        tree: {
            js: 'jquery.tree.js',
            css: 'tree.css',
            dependencies: ['draggable', 'droppable']
        },
        datebox: {
            js: 'jquery.datebox.js',
            css: 'datebox.css',
            dependencies: ['calendar', 'combo']
        },
        datetimebox: {
            js: 'jquery.datetimebox.js',
            dependencies: ['datebox', 'timespinner']
        },
        slider: {
            js: 'jquery.slider.js',
            dependencies: ['draggable']
        },
        parser: {
            js: 'jquery.parser.js'
        },
        validate: {
            js: ['jquery.validate.js','additional-methods.js','jquery.extend.js'],
        },
        chart: {
            js: 'highcharts.js'
        },
        chartmore: {
            js: 'highcharts-more.js',
            dependencies: ['chart']
        },
        //<link rel="stylesheet/less" type="text/css" href="styles.less">
        less: {
            js: 'less-1.4.2.js'
        },
        d3: {
            js: 'three.js'
        },
        //一般使用继承Mobile下的SystemID即可，不需要使用using mobile
        mobile: {
            js: 'jquery.mobile-1.3.2.js',
            css: 'jquery.mobile-1.3.2.css'
        },
        cookie: {
            js: 'jquery.cookie.js'
        },
        mousewheel: {
            js: 'jquery.mousewheel.js'
        },
        json: {
            js: 'json2.js'
        },
        Modernizr: {
            js: 'Modernizr.js'
        },
        template: {
            js: 'artTemplate.js'
        },
        dropzone: {
            js: 'dropzone.min.js',
			css:'dropzone.css'
        }
    },
    locales: {
        'af': 'easyui-lang-af.js',
        'bg': 'easyui-lang-bg.js',
        'ca': 'easyui-lang-ca.js',
        'cs': 'easyui-lang-cs.js',
        'cz': 'easyui-lang-cz.js',
        'da': 'easyui-lang-da.js',
        'de': 'easyui-lang-de.js',
        'en': 'easyui-lang-en.js',
        'es': 'easyui-lang-es.js',
        'fr': 'easyui-lang-fr.js',
        'it': 'easyui-lang-it.js',
        'nl': 'easyui-lang-nl.js',
        'pt-BR': 'easyui-lang-pt_BR.js',
        'ru': 'easyui-lang-ru.js',
        'tr': 'easyui-lang-tr.js',
        'zh-CN': 'easyui-lang-zh_CN.js',
        'zh-TW': 'easyui-lang-zh_TW.js'
    }
};
(function(){
	function _VJ_QueryString(qs) { // optionally pass a querystring to parse
		this.params = {};

		if (qs == null) qs = location.search.substring(1, location.search.length);
		if (qs.length == 0) return;

		// Turn <plus> back to <space>
		// See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
		qs = qs.replace(/\+/g, ' ');
		var args = qs.split('&'); // parse out name/value pairs separated via &

		// split out each name=value pair
		for (var i = 0; i < args.length; i++) {
			var pair = args[i].split('=');
			var name = decodeURIComponent(pair[0]);

			var value = (pair.length == 2)
				? decodeURIComponent(pair[1])
				: name;

			this.params[name] = value;
		}
		//等同_VJ_QueryString.prototype.get
		this.get = function (key, default_) {
			var value = this.params[key];
			return (value != null) ? value : default_;
		};
		this.contains = function (key) {
			var value = this.params[key];
			return (value != null);
		};
	}
	VJ.qs = new _VJ_QueryString();
})();
//对字符串进行编码，解决字符串中包含特殊字符被IIS组织的问题
VJ.encHtml = function (html) {
    //20120328 白冰 只转换标点符号!    
    //return encodeURIComponent(VJ.getValue(html, '').replace(/\r\n/g, ''));
    console.log((VJ.getValue(html, '').replace(/\s/g, ' ')));
    return (VJ.getValue(html, '').replace(/\s/g, ' ').replace(/\r\n/g, '')).replace(new RegExp('~|!|@|#|\\$|%|\\^|;|\\*|\\(|\\)|_|\\+|\\{|\\}|\\||:|\"|\\?|`|\\-|=|\\[|\\]|\\\|;|\'|,|\\.|/|，|；', 'g'), function (a) { return encodeURIComponent(a); });
};
//对字符串进行解码
VJ.decHtml = function (html) {
    return decodeURIComponent(VJ.getValue(html, ''));
};
//处理自定义TJson格式 如一般是[包[库[表[行]]]] [['Rindex','ID'],['1','6e014f804b8f46e1b129faa4b923af2d'],['2','6e014f804b8f46e1b129faa4b923a23d']]
VJ.evalTJson = function (data) {
    //转换表用的
    var _evalTJson = function (_dt) {
        var res = [];
        $(_dt).each(function (i, v) {
            if (0 == i) return;
            var s = {};
            $(v).each(function (q, v2) {
                s[_dt[0][q]] = v2;
            });
            res[i - 1] = s;
        });
        return res;
    };
    data = data[0];
    var res = [];
    $(data).each(function (i, v) {
        res[i] = _evalTJson(v);
    });
    return res;
};
VJ.formatPrice = function (number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 2 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
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
VJ.fill = function (node, data) {
    $(node.find('[data-options]')).each(function (i, v) {
        v = $(v);
        var option = VJ.merge({ formatter: function (val, v, data) { return val; } }, eval('[{' + v.attr('data-options') + '}]')[0]);
        var val = VJ.getValue(data[option.field], '');
        val = option.formatter.apply(v, [val, v, data]);
        if (VJ.isValid(val) || val === '') {
            if (VJ.isArray(val)) {
                if (v[0].tagName.toLowerCase() === 'select' && VJ.isValid(option.textfield)) {
                    v.empty();
                    $(val).each(function (i, v3) {
                        v.append(VJ.newEl('option', '', VJ.getValue(v3[option.textfield], '')).attr('value',v3.value));
                    });
                } else { val = val.join(';'); }
            }
            switch (v[0].tagName.toLowerCase()) {
                case 'input':
                    if (v.attr('type') == 'checkbox') {
                        VJ.setChecked(v,(val == true || val == 1 || val == "1") ? true : false);
                    } else {
                        v.val(val);
                    }
                    break;
                case 'textarea':
                case 'select':
                    v.val(val);
                    break;
                case 'img':
                    v.attr('src',val);
                    break;
                default:
                    v.html(val);
                    break;
            }
        }
    });
};
VJ.fillTo = function (sor, data, aim, func) {
    $(sor.find('[data-options]')).each(function (i, v) {
        VJ.tryC(function () {
            v = $(v);
            var node2 = func();
            aim.append(node2);
            var option = VJ.merge({ formatter: function (val, v, data) { return val; } }, eval('[{' + v.attr('data-options') + '}]')[0]);
            var val = VJ.getValue(data[option.field], '');
            val = option.formatter.apply(node2, [val, node2, data]);
            var css = VJ.getValue(option.cssClass, '').split(';');
            $(css).each(function (i, v) {
                if (v === '') { } else {
                    node2.addClass(v);
                }
            });
            if (VJ.isValid(option.click)) {
                node2.click(function () {
                    option.click.apply($(this), data);
                });
            }
            if (VJ.isValid(val)) {
                node2.html(val);
            }
        });
    });
};
//就是为了少写点
VJ._ajaxOption = {
    async: false,
    type: "POST",
    dataType: "text",
    cache: false,
    beforeSend: function (request) {
    }, success: function (data, status) {
        var _this = this;
        try {
            var hasFalse = false;
            switch (typeof (data)) {
                case "string":
                    if (data.replace(/^(\[+\]+)/g, '').length === 0) {
                        _this.noData();
                        hasFalse = true;
                    } else {
                        hasFalse = (data.indexOf('[False]') >= 0 || data.indexOf('[false]') >= 0)
                    }
                    break;
                case "object":
                    $(eval(data)).each(function (i, v) {
                        hasFalse = (hasFalse || v == 'False' || v == 'false');
                    });
                    break;
                default:
                    VJ.showException('VJ.Query success方法 name:typeof错误 type:' + typeof (data));
                    break;
            }            
            if (!hasFalse) {
                setTimeout(function () { VJ.tryC(function () {_this.bindData.apply(_this, [_this.filtData(eval(data))]); }); }, 1);
            }            
        } catch (e) {
            VJ.showException('VJ._ajaxOption success方法', e);
        }
    }, error: function (request, status, error) {
        VJ.showException('VJ._ajaxOption error方法 status:' + status, error);
    }, complete: function (request, status) {
        //手动回收资源
        request = null;
    }, filtData: function (data) {
        //用来处理数据过滤的
        return VJ.evalTJson(data)[0][0];
    }, bindData: function (data) {
        //这里使用的是过滤后的数据
    }, noData: function () {
        //这里说明没有获取到数据
    }
};
//VJ获取远程JSON的默认参数
VJ._getRemoteJSONOption = {
    filtURI: function (url) { return url; }
    /*	Global.js中可以定义为
    if ($.cookie("ssic") != null) {
    if (url.indexOf("?") > -1) {
    url += "&c=" + encodeURIComponent($.cookie("ssic"));
    } else {
    url += "?c=" + encodeURIComponent($.cookie("ssic"));
    }
    }
    */
};
VJ._dragOption = {
    onBeforeDrag: function (obj, data) { },
    //移动开始前触发的事件，仅在draggable为真时触发 返回假则不能拖动
    onStartDrag: function (obj, data) { },
    onDrag: function (obj, data) { },
    //移动停止时触发的事件，仅在draggable为真时触发 返回假则不能拖动
    onStopDrag: function (obj, data) { }
};
// 控件
VJ._panelOption = VJ.merge(VJ._dragOption, {
    node: null,
    WHStyle: 1,
    title: '控件',
    collapsible: false,
    minimizable: false,
    maximizable: false,
    //是否可以移动
    draggable: true,
    //初始状态是否可以移动
    draged: true,
    closable: true,
    closed: true,
    width: 300,
    height: 150,
    //放大时触发
    onMaximize: function (obj, data) { },
    //还原时触发
    onRestore: function (obj, data) { },
    //最小时触发
    onMinimize: function (obj, data) { },
    //只执行一次，且在beforeShow以前
    firstBeforeShow: function (obj, data) { },
    //每次show时都执行，一般用于对open时输入的json数据进行处理，比如对引入的panel的table进行重新填充 返回false时，才不允许打开
    beforeShow: function (obj, data) { },
    //每次show时都执行，一般用于每次Show自动发出一个通知
    afterShow: function (obj, data) { },
    //只执行一次，且在afterShow之后，一般用于对Dialog进行样式上的设定，比如obj.parent.addClass('g_Dialog')
    firstAfterShow: function (obj, data) { },
    //处理panel关闭问题 返回false时，才不允许关闭
    onClose: function (obj, data) { }
});
//控件打开
VJ._windowOption = VJ.merge(VJ._panelOption, {
    title: '窗口',
    closed: true,
    draggable: true,
    resizable: false,
    shadow: false,
    module: false
});
//对话框
VJ._dialogOption = VJ.merge(VJ._windowOption, {
    title: '对话框'
});
//查询类默认值
VJ._queryOption = VJ.merge(VJ._ajaxOption, {
    //一般用来指定不包含表头的表体部分。譬如 table tbody 标签
    node: null,
    //请求的固定参数地址
    url: '',
    //这里规定 是否跨域 如果是跨域那么使用的是 true 默认为 false
    jsonp: false,
    pagination: false,
    pager: {
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 30, 50]
    },
    filtData: function (data) {
        data = VJ.evalTJson(data); //转换成DataSet;
        //新加方法 可以重载用来确定要处理的返回值，必须返回的是数组，第一个值为总数，第二个值为数据列表。 
        if (VJ.isValid(data[1])) {
            var _count = data[1][0];
            for (i in _count) {
                data[1] = _count[i];
                break;
            }
        };
        data = (data.length <= 3 && !(/^(\+|-)?\d+$/.test(data[1]))) ? [data[0].length, data[0]] : [data[1], data[0]];
        return data;
    }, bindData: function (data) {
        var node = this.node;
        //新加方法 可以重载用来绑定Table实现对Table的填充。
        this.beforeGetRow(node, data); //清空Table
        var _this = this;
        if (data.length > 1) {
            $(data[1]).each(function (i, v) {
                var row = _this.getRow(node, i, v);
                if (VJ.isValid(row)) {
                    node.append(row);
                }
            });
        }
        if (node.children().length == 0) {
            var row = _this.getNoDataRow(node);
            if (VJ.isValid(row)) {
                node.append(row);
            }
        }
        this.afterGetRow(node, data);
    }, getRow: function (node, i, v) {
        //新加方法 用来生成行数据 数据不合法可以返回null 这时null不会被添加到html中
        return VJ.newEl("span", "", "").text('VJ测试');
    }, getNoDataRow: function (node) {
        //新加方法 可以用来处理无数据返回结果，包括全部结果经过getRow处理发现都不合法时。
        // return VJ.alert('温馨提示', "对不起，当前没有您的订单信息！")
        return null;
    }, beforeGetRow: function (node, data) {
        //新加方法 可以重载用来清除该表内容。
        node.empty();
    }, afterGetRow: function (node, data) {
        //新加方法 可以重载用来设置表隔行样式，或者触发某种事件.
    }, noData: function () {
        var node = this.node;
        node.empty()
        var row = this.getNoDataRow(node);
        if (VJ.isValid(row)) {
            node.append(row);
        }
    }
});
//layout datagrid满铺方案
//<div style="width:XXX;height:XXX" class="easyui-layout"><table style="width:100%,height:100%" fit="true"></table></div>
VJ._datagridOption = $.extend({}, VJ._queryOption, {
    collapsible: false,
    pagination: true,
    fitColumns: true,
    striped: true,
    singleSelect: true,
    method: 'post',
    loadMsg: '数据获取中，请稍等……',
    pager: {
        //在datagrid状态下没有意义
        node: $(document.body),
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 30, 50]
    },
    beforeGetRow: function (node, data) {
    },
    bindData: function (data) {
    },
    loadFilter: function (data) {
        data = VJ.evalTJson(data); //转换成DataSet;
        //新加方法 可以重载用来确定要处理的返回值，必须返回的是数组，第一个值为总数，第二个值为数据列表。 
        if (VJ.isValid(data[1])) {
            var _count = data[1][0];
            for (i in _count) {
                data[1] = _count[i];
            }
        };
        data = (data.length <= 3 && !(/^(\+|-)?\d+$/.test(data[1]))) ? [data[0].length, data[0]] : [data[1], data[0]];
        return { total: data[0], rows: data[1] };
    }
});
VJ._treeOption = {
    animate: true,
    //是否有checkbox
    checkbox: false,
    //是否显示级联的checkbox
    cascadeCheck: true,
    //是否只有叶子节点的checkbox
    onlyLeafCheck: false,
    method: 'POST',
    //是否显示线
    lines: true,
    //是否允许拖拽
    dnd: false,
    //用于jsonp
    //loader:function(param,success,error){},
    //用于loadFilter
    loadFilter: function (data, parent) {
        //返回表1
        if (typeof (data) == 'string') data = eval(data);
        var s = VJ.evalTJson(data);
        return s[0];
    },
    //用于获得Ajax数据
    getAjaxPara: function (param) {
        return { _ParentID: (VJ.isValid(param) && $.param(param).length > 0) ? param.id : '0' };
    },
    onDrop: function (target, source, point) {
        //todo $(target).attr('node-id') 获取ID
        alert('onDrop' + point);
    },
    //准备菜单
    contextMenu: {
        id: null,
        createMenuID: function () {
            return Math.round(Math.random() * 100000000);
        },
        //根据menu,add,append,edit,del设定是否显示
        checkVisible: function (operate) { return true; },
        //可以设置为'组织机构'等
        menuItemName: '',
        //新建菜单UL
        createMenu: function (settings) {
            var newul = VJ.newEl('div', '', '');
            newul.attr("id", settings.contextMenu.id).attr("display", 'none').css('width:120px'); //.addClass('easyui-menu');
            if (settings.contextMenu.checkVisible('edit')) {
                var newdiv = VJ.newEl('div', '', '重命名').attr('menuvalue', 'edit').attr('iconCls', "icon-edit");
                newul.append(newdiv);
            }
            if (settings.contextMenu.checkVisible('append')) {
                //todo icon-append 没有
                var newdiv = VJ.newEl('div', '', '新建下级' + settings.contextMenu.menuItemName).attr('menuvalue', 'append').attr('iconCls', "icon-append");
                newul.append(newdiv);
            }
            if (settings.contextMenu.checkVisible('add')) {
                var newdiv = VJ.newEl('div', '', '新建同级' + settings.contextMenu.menuItemName).attr('menuvalue', 'add').attr('iconCls', "icon-add");
                newul.append(newdiv);
            }
            if (settings.contextMenu.checkVisible('del')) {
                var newdiv = VJ.newEl('div', '', '删除').attr('menuvalue', 'del').attr('iconCls', "icon-del");
                newul.append(newdiv);
            };
            if (newul.find('div').length == 0)
                return null;
            else
                return newul;
        },
        //可以直接获得li对象
        click: function (settings, node) {
        },
        bind: function (settings, node1, container) {
            //append createMenu 而且绑定node信息 事件处理 settings.contextMenu.node = $(reateMenu;
            settings.contextMenu.id = settings.contextMenu.createMenuID();
            var me = settings.contextMenu.createMenu(settings);
            if (me == null)
                return;
            else {
                $(document.body).append(me);
                settings.contextMenu.node = $(me);
                settings.contextMenu.node.menu({
                    /*
                    item属性
                    id 	string 	The id attribute of menu item. 	
                    text 	string 	The item text. 	
                    iconCls 	string 	A CSS class to display a 16x16 icon on item left. 	
                    href 	string 	Set page location while clicking the menu item. 	
                    disabled 	boolean 	Defines if to disable the menu item. 	false
                    onclick 	function 	The function to be called while clicking the menu item. 	
                    */
                    onClick: function (item) {
                        VJ.tryC(function () {
                            //menuitme对象
                            var mi = $(item.target);
                            if (!VJ.isValid(mi)) { VJ.showException('tree click 没找到对象', item.text); }
                            var node = container.getSelected();

                            if (!VJ.isValid(node)) {
                                VJ.showException('tree click 没找到右键节点', item.text);
                                return;
                            }
                            if (VJ.isArray(node)) { node = node[0]; }
                            settings.editNodeAction = $(mi).attr('menuvalue');
                            switch ($(mi).attr('menuvalue')) {
                                case "edit":
                                    settings.editNodeText = node.text;
                                    settings.editNodeFunc = settings.contextMenu.editNode;
                                    settings.editNode = node;
                                    container.callM("beginEdit", node.target);
                                    break;
                                case "append":
                                    using('messager');
                                    $.messager.prompt('添加下级' + VJ.getValue(settings.contextMenu.menuItemName, '节点'), '请输入下级' + VJ.getValue(settings.contextMenu.menuItemName, '节点') + '的名称', function (r) {
                                        if (VJ.isValid(r)) {
                                            var args = settings.contextMenu.appendNode(settings, node, function () {
                                                if (!$(node.target).parent().find('span:first').hasClass('tree-expanded')) { container.callM('expandAll', node.target); }
                                                container.callM("reload", node.target)
                                            });
                                            args.callback(r, node);
                                        }
                                    });
                                    break;
                                case "add":
                                    //默认放置在下面
                                    using('messager');
                                    $.messager.prompt('添加下一个' + VJ.getValue(settings.contextMenu.menuItemName, '节点'), '请输入下一个' + VJ.getValue(settings.contextMenu.menuItemName, '节点') + '的名称', function (r) {
                                        if (VJ.isValid(r)) {
                                            var parNode = container.callM("getParent", node.target);
                                            var args = settings.contextMenu.addNode(settings, VJ.isValid(parNode) ? parNode : { id: '', text: '', target: _this.option.node }, function () {
                                                container.callM("reload", VJ.isValid(parNode) ? parNode.target : _this.option.node);
                                            });
                                            args.callback(r, node);
                                        }
                                    });
                                    break;
                                case "del":
                                    var args = settings.contextMenu.delNode(settings, node, function () {
                                        container.callM('remove', node.target);
                                    });
                                    args.callback();
                                    break;
                                default:
                                    settings.contextMenu.actionNode(settings, node, $(mi).attr('menuvalue'));
                                    break;
                            }
                        });
                    }
                });
            }
        },
        //这里返回一个JSON对象作为treeview edit操作的args参数以处理该修改是否通过，及其校验工作，默认修改都通过。
        editNode: function (settings, node, editCallBack) {
            return {
                callback: function (oldValue, newValue, parentNode) {
                    VJ.showException('VJ._treeOption.contextMenu.editNode 值由:\'' + oldValue + '\'换为\'' + newValue + '\'');
                    //数据添加完后 主要是ID {id:}
                    editCallBack({});
                    return;
                }
            };
        },
        //这里返回一个JSON对象作为treeview append操作的edit args参数以处理该修改是否通过，及其校验工作，默认修改都通过。特别的当这里和AddNode使用alert时，容易出现失去焦点事件的2次触发，导致本方法被两次调用
        appendNode: function (settings, parentNode, appendCallBack) {
            return {
                callback: function (text, parentNode) {
                    // 这里很重要，该节点的编号	
                    VJ.showException('VJ._treeOption.contextMenu.appendNode 值换为\'' + text + '\'');
                    //数据添加完后 主要是ID {id:}
                    appendCallBack({});
                    return;
                }
            };
        },
        //这里返回一个JSON对象作为treeview edit操作的args参数以处理该修改是否通过，及其校验工作，默认修改都通过。
        addNode: function (settings, parentNode, addCallBack) {
            return {
                callback: function (text, preNode) {
                    // 这里很重要，该节点的编号	
                    VJ.showException('VJ._treeOption.contextMenu.addNode 值换为\'' + text + '\'');
                    //主要是ID {id:}
                    addCallBack({});
                    return;
                }
            };
        },
        //这里返回一个JSON对象作为treeview del操作的args参数以处理该修改是否通过，及其校验工作，默认修改都通过。
        delNode: function (settings, node, removeCallBack) {
            return {
                callback: function () {
                    // 这里很重要，该节点的编号	
                    //进行ajax删除操作
                    VJ.showException('VJ._treeOption.contextMenu.delNode应进行ajax删除操作');
                    removeCallBack();
                }
            };
        },
        //这里用来处理自定义的菜单项 action为菜单项名，node为当前节点。
        actionNode: function (settings, node, action) {
            VJ.showException('VJ._treeOption.contextMenu.bind 未处理 Option:' + action);
        }
    },
    //自定义处理事件 todo 需要validate
    valid: function (args, text) {
        using('validate');
        var mform = VJ.newEl('form', '', '').hide().appendTo($(document.body));
        var mformInput = VJ.newEl('input', "", "").attr('type', 'text').attr('name', '_txtVal').val(text).appendTo(mform);
        mform.validate({
            rules: {
                _txtVal: $.extend(args, { required: true })
            }
            //todo regex
        });
        var text = !mform.validate() ? mformInput.attr('title') : "";
        mform.remove();
        return text;
    }
};
//定义接口为node 图类型 大小 数据 X轴 Y轴 URL或者loadData
VJ._chartOption = {
    //整体背景色
    backgroundColor: null,
    //图表内背景色
    innBackgroundColor: null,
    border: 0,
    zoom: 'x', //xy、x、y、空 图表伸缩方向
    shadow: 'true', //是否显示阴影
    title: '图表',
    subtitle: '',
    xTitle: 'X轴',
    yTitle: 'Y轴',
    yMin: 0,
    unit: '计量单位',
    //是否显示图例说明（下边栏）
    legend: true,
    //是否显示详情
    tooltip: true,
    //只有当
    spline: false,
    tooltipFormatter: null, //function(){return this.y;},
    //是否打印点数据
    point: false,
    pointFormatter: function () { return this.y; },
    click: function (node, option, e, point) {//单点点击效果point.y
    },
    filtData: function (data) {
        return VJ.evalTJson(data)[0];
    },
    transData: function (data) {//如何将表格json数据转成[{name,data[]},{name,data[]}] cols:2,name1,data1,name2,data2
        //表格一般是 月，栏目，数值，譬如 col,name,data格式
        return VJ.tryC(function () {
            var ret = [];
            var cols = [];
            var col = '';
            var names = {};
            $(data).each(function (i, v) {
                if (col != v.col) {
                    col = v.col;
                    cols.push(col);
                }
                if (!VJ.isValid(names[v.name])) {
                    names[v.name] = { name: v.name, data: [] };
                    ret.push(names[v.name]);
                }
                names[v.name].data.push(parseFloat(v.data));
            });
            return [cols, ret];
        });
    },
    //公司名
    company: '',
    //公司URL
    companyURL: '',
    //导出后台执行URL
    exportingURL: ''
};
VJ._lineOption = VJ.merge(VJ._chartOption, {
    //是否使用柔性线
    spline: false
});
VJ._pieOption = VJ.merge(VJ._chartOption, {
    pointFormatter: function () { return '<b>' + this.point.name + '</b>: ' + Math.floor(this.percentage * 100) / 100 + ' %'; },
    tooltipFormatter: function (opt) { return '{series.name}: <b>{point.y}' + opt.unit + '</b>'; },
    transData: function (data) {//如何将表格json数据转成[{name,data[]},{name,data[]}] cols:2,name1,data1,name2,data2
        //表格一般是 月，栏目，数值，譬如 col,name,data格式
        return VJ.tryC(function () {
            var ret = [];
            var cols = [];
            var col = '';
            var names = {};
            $(data).each(function (i, v) {
                if (col != v.col) {
                    col = v.col;
                    cols.push(col);
                }
                if (!VJ.isValid(names[v.name])) {
                    names[v.name] = { type: 'pie', name: v.name, data: [] };
                    ret.push(names[v.name]);
                }
                names[v.name].data.push([v.col, parseFloat(v.data)]);
            });
            return [cols, ret];
        });
    }
});
VJ._comboxOption = VJ.merge(VJ._chartOption, {
    piepointFormatter: function () { return Math.floor(this.percentage * 100) / 100 + ' %'; },
    showPie: true,
    tooltipFormatter: function (opt) {
        var s;
        if (this.point.name) { // the pie chart
            s = '' + this.point.name + ': ' + this.y + ' ' + opt.unit;
        } else {
            s = '' + this.x + ': ' + this.y + ' ' + opt.unit;
        }
        return s;
    },
    transData: function (data, opt) {//如何将表格json数据转成[{name,data[]},{name,data[]}] cols:2,name1,data1,name2,data2
        //表格一般是 月，栏目，数值，譬如 col,name,data格式
        return VJ.tryC(function () {
            var ret = [];
            var cols = [];
            var col = '';
            var names = {};
            var pieret = [];
            var pienames = {};

            $(data).each(function (i, v) {
                if (col != v.col) {
                    col = v.col;
                    cols.push(col);
                }
                if (!VJ.isValid(names[v.name])) {
                    names[v.name] = { type: 'column', name: v.name, data: [] };
                    ret.push(names[v.name]);
                }
                names[v.name].data.push(parseFloat(v.data));

                if (!VJ.isValid(pienames[v.name])) {
                    pienames[v.name] = { type: 'pie', name: v.name, data: [] };
                    pieret.push(pienames[v.name]);
                }
                pienames[v.name].data.push([v.col, parseFloat(v.data)]);
            });
            //深度复制
            var lineret = [];
            $(ret).each(function (i, v) {
                var _v = VJ.merge(v, {});
                _v.type = 'spline';
                lineret.push(_v);
            });
            return [cols, $.merge($.merge(ret, lineret), opt.showPie ? pieret : [])];
        });
    }
});
VJ.checkWebGL = function () {
    return window.WebGLRenderingContext ? true : false;
    //如下代码会引起html重构
    /*
    var div = VJ.newEl('div', '', '').hide().append('<canvas></canvas>').appendTo($('body'));
    try {
    div.find('canvas:first')[0].getContext('experimental-webgl');
    div.remove();
    return true;
    } catch (e) {
    div.remove();
    return false;
    }*/
};

//using 3D
VJ._movieOption = {
    scene: null,
    lights: [],
    render: null,
    camera: null,
    objects: [],
    //产生默认光
    getScene: function () {
        return new THREE.Scene();
    },
    getLights: function () {
        var light = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);
        light.position.set(100, 100, 200);
        return [light];
    },
    getRender: function (node) {
        var render = new THREE.WebGLRenderer({ antialias: true });
        //render = new THREE.CanvasRenderer({ antialias: false });
        //clientWidth clientHeight 容易出现不显示的情况为0的情况
        render.setSize(node.width(), node.height());
        //render.setClearColorHex(0xFFFFFF, 1.0);
        node.append(render.domElement);
        return render;
    },
    getCamera: function (node) {
        camera = new THREE.PerspectiveCamera(60, node.width() / node.height(), 1, 10000);
        camera.position.set(400, 400, 600);
        camera.up.x = 0;
        camera.up.y = 0;
        camera.up.z = 1;
        camera.lookAt({ x: 0, y: 0, z: 0 });
        return camera;
    },
    hasShadow: true,
    unableWebGL: function () {
        //不支持WebGL
        VJ.alert('提示', VJ.userAgent.name + '浏览器不支持WebGL!请选择FireFox或者Chrome浏览器!', 'info');
    }
};
VJ._3DObjectOption = {
    dragable: false,
    onRun: function (movie) { }
};
VJ.toJsonString = function (obj) {
    using('json');
    return JSON.stringify(obj);
};
VJ.parseJson = function (txt) {
    using('json');
    return JSON.parse(txt);
};