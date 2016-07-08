(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<textarea></textarea>', V.getValue({
      data: {
		width: '100%',
		height: '300',
		language: 'zh-cn',
		icon:'default',
		image:'./images/'
      }
    }, vm)]]);
	        __.toolbars=[
							["separator","cut","copy","paste","separator","undo","redo","separator","bold","italic","underline","strike","sup","sub","separator","link","unlink","image"],
							["separator","justify","left","center","right","separator","removeformat","striptags","hr","paragraph"]
						];
            __.onLoad = _.onLoad;
            __.render = _.render;
			_.addDesc('texteditor 对象');
			_.addDesc('\t所有icon图标:');
			_.addDesc('\t{"bold":"粗体","center":"中心","code":"显示代码","copy":"复制","cut":"粘贴","hr":"插入一行","link":"插入链接","image":"插入图片","indent":"缩进","italic":"字体","justify":"Justify","left":"居左","ol":"Numbered List","outdent":"Outdent","paragraph":"Insert Paragraph","paste":"粘贴","quote":"Quote","redo":"Redo","removeformat":"Remove Format","right":"居右","strike":"Strikethrough","striptags":"Strip Tags","sub":"Subscript","sup":"Superscript","ul":"Bulleted List","underline":"下划线","undo":"撤销","unlink":"移除链接"},"separator":"分隔符"');
            _.addDesc('非必填属性:');
			_.addDesc('\twidth 类型300px,100%');
			_.addDesc('\theight 类型300px,不支持百分比');
			_.addDesc('\ttoolbars 类型头部button     [{icons:[第一行的icon],add:{新加的控件}},{icons:[第二行的icon],add:[{新加的控件}]}] separator为分隔符,没有就不需要输入或采用默认值 例:');
			_.addDesc('\ttoolbars:[{icons:["separator","cut","copy","paste","separator","undo","redo","separator","bold","italic","separator"],add:[{icon:"new.gif",tooltip:"添加新控件",command:function(){initControl();}}]},{icons:["separator","sup","sub","separator","link","unlink","image","separator"],add:[{icon:"new.gif",tooltip:"添加新控件",command:function(){initControl();}}]}]');
			_.addDesc('\tskin  皮肤色 类型 blue red green silver  默认值不用加');
			_.addDesc('\tlanguage  语言 类型 en zh-cn');
			_.addDesc('\tvalue  内容会被V.decHtml 同时获取的内容会被自动encHtml 另更新value时请至少等待100ms以防止渲染出现问题');
        }
		 _.onLoad = function (node) {
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
        };//[{icons:[],add:[{icon:"new.gif",tooltip:"添加新控件",command:function(){initControl();}}]}]
		_.transform = function (data) {
			var ret = V.merge({ about: false, toolbar: [],idir:data.image },data);
			if(V.isArray(data.toolbars)){
				for(var i=0;i<data.toolbars.length;i++){
					var one=data.toolbars[i],news=[];
					if(one.icons&&V.isArray(one.icons)){
						if(one.icons.length>0){
							news=one.icons;
						}
					}
					if(V.isArray(one.add)){
						for(var j=0;j<one.add.length;j++){
							var two=one.add[j];
							if(two&&two.icon){
								news.push(two);
							}
						}
					}
					if(news.length>0){
						if(i<2){
							__.toolbars[i]=news;
						}else{
							__.toolbars.push(news);
						}
					}
				}
			}
			ret.toolbars=__.toolbars;
			return ret;
		};
		  _.render = function (data) {
            data = __.render(data);
			var render = _.editor?false:true;
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
					case 'value':
						if(_.editor) {V.once(function(){_.node.set_text(V.decHtml(v));_.call('changed');},100);};
						break;
					case 'addvalue':
					   if(_.editor) {V.once(function(){_.node.insert_text(V.decHtml(v));_.call('changed');},100);};
					    break;
                }
            },function(){
				if(render){
					_.editor=true;	
					_.node.htmlbox(_.transform(data));
				}
			});
        }
	});
})(VJ, VJ.view, jQuery);