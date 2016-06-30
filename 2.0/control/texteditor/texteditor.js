(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<textarea></textarea>', V.getValue({
      data: {
        toolbars:[
		["separator","cut","copy","paste","separator","undo","redo","separator","bold","italic","underline","strike","sup","sub","separator","link","unlink","image"],
		["separator","justify","left","center","right","separator","removeformat","striptags","hr","paragraph"]
		],
		about:false
      }
    }, vm)]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
			_.addDesc('texteditor 对象');
            _.addDesc('属性:');
			_.addDesc('\twidth 类型300px,100%');
			_.addDesc('\theight 类型300px,不支持百分比');
			_.addDesc('\ttoolbars 类型头部button     [[第一行],[第二行]] 例 :');
			_.addDesc('\ttoolbars:[["separator","cut","copy","paste","separator","undo","redo","separator","bold","italic","underline","strike","sup","sub","separator","link","unlink","image"],["separator","justify","left","center","right","separator","removeformat","striptags","hr","paragraph"]]');
			_.addDesc('\tskin  皮肤色 类型 blue red green silver  默认值不用加');
			_.addDesc('\tlanguage  语言 类型 en zh-cn');
			_.addDesc('\tinit  控件初始化生成texteditor');
        }
		 _.onLoad = function (node) {
			 console.log(node);
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
					case 'click':
					 case 'hover':
					break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });  
        };
		  _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'width':
					   _.node.css('width',v);
					    break;
					case 'height':
					   _.node.css('height',v);
						break;
					case 'toolbars':
					    break;
					case 'init':
				      _.node.htmlbox(_.vm.get());
					   break;
                }
            });
        }
	});
})(VJ, VJ.view, jQuery);