(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<div class="htmlc-control"><div class="htmlc-control-se"><select><option value="" selected>- 标签 -</option></select></div><div class="htmlc-control-urls"><ul datarole="attrs"></ul></div><p class="htmlc-control-buttons" style="clear: both;"><input class="htmlc-control-save" type="button" value="保存"/><input class="htmlc-control-delete" type="button" value="删除" /> <input class="htmlc-control-cancel" type="button" value="取消" /> </p></div>', V.getValue({
            data:{
				controls:{
					text:{displayname:'输入框', style:{width:'宽度'},attrs:{title:'标题',value:'值'}},
					select:{displayname:'下拉框',style:{width:'宽度'}}
				}
			}
    }, vm)]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
			_.addDesc('htmlc 对象：动态生成元素，获取');
            _.addDesc('非必填属性:');
			_.addDesc('\twidth,height 定义控件的宽，高，一般在外面加样式，适合扩展，一般是绝对定位的。');
			_.addDesc('\tcontrols 类型定义需要显示哪些类型,目前支持文本框和下拉框');
			_.addDesc('\t示例：');
			_.addDesc("controls:{text:{displayname:'输入框', style:{width:'宽度'},attrs:{title:'标题',value:'值'}},select:{displayname:'下拉框',style:{width:'宽度'}}}");
			_.addDesc('\t说明：text表示文本框类型，displayname是对应的显示名称，stye表示样式，符合css标准，attrs表示元素属性，符合html标准。');
			_.addDesc('\t说明：元素显示时，是用图片img表示，以_control属性为准，动态加的元素都有这个属性，获取时，以此属性会查找条件，找到对应的动态元素html.');
			_.addDesc('\tinit 初始化元素种类和参数，一般用在要打开时，代替show属性');
			_.addDesc('\t说明：editControl函数，是在对应显示的图片上点击鼠标右键，调用编辑动态元素页面的时候调用此函数，传入图片jquery对象');
			_.addDesc('\t说明：getControls函数，取保存所有动态元素的对象，格式是{"1467962814044841": "<input type="text" class="edit_control" _control="text" value="fsd"  style="width:100px;" type="text" />"}');
			_.addDesc('\t"1467962814044841"表示一个动态元素，值为动态元素的outhtml包含自己');
			_.addDesc('\t说明：setControls函数，设置动态元素集合（属性controlHtmls)，一般为动态加载之前生成的元素保存，方便编辑动态元素');
			_.addDesc('\t说明：save函数，保存当时添加或编辑的元素，并把type（元素类型,例下拉框(select)）,id(随机值，唯一表示该元素的)属性返回，加到想加到的地方，生成的html为<img src="./images/default/{type}.png" data-id="{id}" _control="{type}" />,  并把元素信息保存到动态元素集合controlHtmls对象中');
			_.addDesc('\tdemo：editor页面中的htmlc元素');
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
			__.editElement=null;
			__.controlHtmls={};//保存所有动态添加的元素
			
			__.sel_control=node.find('.htmlc-control-se select');
			__.urls=node.find('.htmlc-control-urls');
			console.log(__);
			//__.buSave=node.find('.htmlc-control-save');
			//__.buCancel=node.find('.htmlc-control-cancel');
			//__.buDelete=node.find('.htmlc-control-delete');
			__.sel_control.change(function(){
				_.selControl($(this).val());
			});
			node.on('click','.htmlc-control-save',function(e){
				_.save();
			});
			node.on('click','.htmlc-control-cancel',function(e){
				__.editElement=null;
				node.hide();
			});
			node.on('click','.htmlc-control-delete',function(e){
				if(__.editElement){
					delete __.controlHtmls[__.editElement.attr('data-id')];
					__.editElement.remove();
					node.hide();
				}else{
					console.log('元素不存在');
				}
			});
			__.urls.on('click','li .addline',function(){
				var _this=$(this);
				switch(_this.attr('datarole')){
					case 'select':
					$(this).closest('ul').append('<li datarole="html">显示名:<input type="text" dataRole="display" />值：<input type="text" dataRole="key" /><input class="addline" type="button" value="添加一行" datarole="select" /><input type="button" datarole="select"  class="deleteone" value="删除" /></li>');
					break;
				}
			});
			__.urls.on('click','li .deleteone',function(){
				$(this).closest("li").remove();
			});
        };
		_.selControl = function (name) {
			__.editElement=null;
			__.urls.empty();
			var style="",attrs="",controls=__.controls;
			for(v in controls[name].style){
				style+='<li datarole="style" name="'+v+'">'+controls[name].style[v]+':<input type="text" value="'+''+'" /></li>';
			}
			for(v in controls[name].attrs){
				attrs+='<li datarole="attrs" name="'+v+'">'+controls[name].attrs[v]+':<input type="text" value="'+''+'" /></li>';
			}
			switch(name){
				case 'select':
				__.urls.html('<ul datarole="html"><li datarole="html">显示名:<input type="text" datarole="display" />值：<input type="text" datarole="key" /><input class="addline" type="button" value="添加一行" datarole="select" /><input type="button" datarole="select"  class="deleteone" value="删除" /></li></ul>');
				break;  
			}
			if(style.length>0){
				__.urls.append('<ul datarole="style">'+style+'</ul>');
			}
			if(attrs.length>0){
				__.urls.append('<ul datarole="attrs">'+attrs+'</ul>');
			}
		};
		_.editControl=function(c){
			__.editElement=c;
			var temp=$(__.controlHtmls[c.attr('data-id')]);
			if(__.sel_control.find('option').length==1){
				var html='';
				for (v in __.controls){
					html+='<option value="'+v+'" >'+__.controls[v].displayname+'</option>';
				}
				__.sel_control.append(html);
			}
			var type=c.attr('_control');
			var style="",attrs="",html="";
			for(v in __.controls[type].style){
				if((v=='width'||v=='height')&&temp.css(v)=='0px'){
					style+='<li datarole="style" name="'+v+'">'+__.controls[type].style[v]+':<input type="text" value="'+''+'" /></li>';
				}else{
					style+='<li datarole="style" name="'+v+'">'+__.controls[type].style[v]+':<input type="text" value="'+(temp.css(v)||'').replace('px','')+'" /></li>';
				}
			}
			for(v in __.controls[type].attrs){
				attrs+='<li datarole="attrs" name="'+v+'">'+__.controls[type].attrs[v]+':<input type="text" value="'+(temp.attr(v)||'')+'" /></li>';
			}
			switch(type){
				case 'text':
		  
					break;
				case 'select':
					temp.find('option').each(function(index,v){
					html+='<li datarole="html">显示名:<input type="text" datarole="display" value="'+$(this).text()+'" />值：<input type="text" datarole="key" value="'+$(this).val()+'" /><input class="addline" type="button" value="添加一行" datarole="select" /><input type="button" datarole="select"  class="deleteone" value="删除" /></li>';
					});
					break;
			}
			__.urls.empty();
			__.sel_control.find("option[value='"+type+"']").attr("selected", true); 
			if(html.length>0){
				__.urls.append('<ul datarole="html">'+html+'</ul>');
			}
			if(style.length>0){
				__.urls.append('<ul datarole="style">'+style+'</ul>');
			}
			if(attrs.length>0){
				__.urls.append('<ul datarole="attrs">'+attrs+'</ul>');
			}
			_.node.show();
		}
		_.save=function(){
			var type=__.sel_control.val();
			var style="",attrs="",html='';
			__.urls.find("ul li[datarole=style]").each(function(index,val){
				var _this=$(this);
				var text1=_this.find('input').val(),name=_this.attr('name');
				if(text1.length>0){
					if(name=='width'||name=='height'){
						if(text1.length>0){
							text1=text1+'px';
						}
					}
					style+=name+":"+text1+';';
				}
			});
			if(style.length>0){
				style=' style="'+style+'"';
			}
			__.urls.find("ul li[datarole=attrs]").each(function(index,val){
				var _this=$(this);
				attrs+=_this.attr('name')+'="'+_this.find('input').val()+'" ';
			});
			switch(type){
				case 'select':
					html+='<select class="edit_control" _control="select" '+attrs+style+'>';
					__.urls.find("ul li[datarole=html]").each(function(index,val){
						var _this=$(this);
						html+='<option value="'+_this.find('input[datarole=key]').val()+'">'+_this.find('input[datarole=display]').val()+'</option>';
					});
					html+='</select>';
					break;
				case 'text':
					html+='<input type="text" class="edit_control" _control="text" '+attrs+style+' type="text" />';
					break;
			}
			var id=''+parseInt(''+(new Date()).getTime()+(10000*Math.random()));
			if(__.editElement){
				id=__.editElement.attr('data-id').length>0?__.editElement.attr('data-id'):id;
			}
			if(html.length>0){
				__.controlHtmls[id]=html;
				_.node.hide();
				if(!__.editElement){
					_.call('save',{type:type,id:id});
					//hb_icon_set_green.insert_text('<img src="./images/default/'+type+'.png" data-id="'+id+'" _control="'+type+'" />');
					// $((window.frames["ha_html"].document||window.frames["ha_html"].contentWindow.document).body).off('mousedown contextmenu','img[_control]').on('contextmenu','img[_control]',function(){return false;}).on('mousedown','img[_control]',function(e){if(e.which==3){editControl($(this));} });
				}else{
					__.editElement=null;
				}
			}
		}
		_.init1=function(data){
			 if(__.sel_control.find('option').length==1){
				var html='';
				for (v in data.controls){
					html+='<option value="'+v+'" >'+data.controls[v].displayname+'</option>';
				}
				__.sel_control.append(html);
			}
			__.sel_control.find('option:eq(0)').attr("selected", true); 
			__.urls.empty();
			_.node.show();
		}
		_.getControls=function(){
			return __.controlHtmls;
		}
		_.setControls=function(value){
			__.controlHtmls=value||{};
		}
		  _.render = function (data) {
            data = __.render(data);
			//var render = _.editor?false:true;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'width':
					   _.node.css('width',v);
					    break;
					case 'height':
					   _.node.css('height',v);
						break;
					case 'controls':
					__.controls=v;
						break;
					case 'init':
						 _.init1(_.vm.get());
					    break;
                }
            },function(){
				//if(render){
					//_.editor=true;	
					//_.node.htmlbox(_.transform(data));
				//}
			});
        }
	});
})(VJ, VJ.view, jQuery);