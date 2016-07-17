(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<div class="c_textshower"><div id="fill" _="type:\'fill\'" class="c_textshower_inner">{html}</div></div>', V.merge({
                data: {                    	
                },
				controls:{
					fill:{}
				}
            }, vm)]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('textshower 对象');
            _.addDesc('非必填属性:');
            _.addDesc('\twidth 类型300px,100%');
            _.addDesc('\theight 类型300px,不支持百分比');      
            _.addDesc('\ttemplate  接入texteditor的模板内容');      
            _.addDesc('\tvalue  接入其实际内容');
            _.addDesc("\t定义:editor:{path:'ueditor.config.js;ueditor.all.min.js;lang/zh-cn/zh-cn.js;../Scripts/module/part/texteditor.js',params:['',{data:{debug:true,image:'../../Scripts/ref/images/'}}]}");
            //_.addDesc('\tinit  新加的控件(icon:图标地址，tooltip:图标显示名称，command:要执行的函数)');
        }
        _.onLoad = function (node) {			
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'click':
						break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
				__.onLoad(node);
			});
        };
        _.fill = function () {return { value:(function(){
			var val = {};
			$(_.vms.fill.v.node.find('[_type]')).each(function(i,v){
				v = $(v);
				var id = v.attr('id');
				if(id)
					switch (v[0].tagName.toLowerCase()) {
						case 'input':
						case 'select':
							val[id]=val[id] || v.val();
							break;
						case 'textarea':
							val[id]=val[id] || v.val() || v.text();
							break;
						case 'img':
							val[id]=val[id] || v.attr('src');
							break;
						default:
							val[id]=val[id] || v.html();
							break;
					}
			});
			return val;
		})()} };
        _.render = function (data) {
            var ret = V.merge({}, data);//处理空数据
			V.forC(ret, function (k, v) {
				switch (k.toLowerCase()) {
					case 'template':
						var val = V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;').replace(/<img[^>]+>/g,function(txt){
							var id = txt.match(/id\s*=\s*['"][^'"]+['"]/);
							if(id.length>0){id=id[0].split('\"')[1];} else id='';
							var type = txt.match(/_type\s*=\s*['"][^'"]+['"]/);
							if(type.length>0){type=type[0].split('\"')[1];} else type='';
							var data = txt.match(/_data\s*=\s*['"][^'"]+['"]/);
							if(data.length>0){data=eval('('+(V.decHtml(data[0].split('\"')[1]).replace(/&quot;/g,"\""))+')');} else data={};
							V.merge(data,{id:id,type:type},true);
							switch(data.type){
								case 'text':
									return V.format("<input type='{type}' id='{id}' maxlength='{length}' _type='{type}' class='c_{type}'/>",data);
								case 'textarea':
									return V.format("<p><textarea type='{type}' id='{id}' cols='{cols}' rows='{rows}' _type='{type}' class='c_{type}'></textarea></p>",data);
								default:
									return '';
							}
						});
						_.vms.fill.update({value:{html:val}});
						break;
					case 'value':
						$(_.vms.fill.v.node.find('[_type]')).each(function (i, v2) {
							v2 = $(v2);
							var id = V.getValue(v2.attr('id'),'');
							var val = V.getValue(v[id],'');
							if (V.isValid(val) || val === '') {
								switch (v2[0].tagName.toLowerCase()) {
									case 'input':
										if (v2.attr('type') == 'checkbox') {
											V.setChecked(v2,(val == true || val == 1 || val == "1") ? true : false);
										} else {
											v2.val(val);
										}
										break;
									case 'textarea':
									case 'select':
										v2.val(val);
										break;
									case 'img':
										v2.attr('src',val);
										break;
									default:
										v2.html(val);
										break;
								}
							}
						});
						break;
				}
			}, function () {
				delete data.value;
				data = __.render(data);
			});
			return data;
        }
    });
})(VJ, VJ.view, jQuery);