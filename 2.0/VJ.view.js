(function(V,$,W,M){
	{
		W.TextBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<span><span style="display:none;"></span><input type="text"></input></span>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				_.txt = node.find('span:first');
				_.input = node.find('input:first');
				V.forC(_.events,function(k,v){
					switch(k){
						case 'hover':
							_.node.hover(function(){
								_.call('Hover',{hover:true});
							},function(){
								_.call('Hover',{hover:false});
							});
							break;
						default:
							_.bindEvent(_.input,k,v);
							break;
					}
				},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {text:_.input.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'text':
							_.input.val(value);
							delete data[key];
							break;
						case 'name':
							_.input.attr('name',value);
							delete data[key];
							break;
						case 'key':
							_.txt.text(value).show();
							delete data[key];
							break;
						case 'size':
							_.input.attr('size',value);
							delete data[key];
							break;
					}
				});
				return data;
			};			
		};
		W.RadioBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="radio"></input></span>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.fill = function(){
				return {checked:_.input.attr('checked')?true:false};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'checked':
							V.setChecked(_.input,value);
							delete data[key];
							break;
					}
				});
				return data;
			};
		};
		W.CheckBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.RadioBox,[path || '<span><span style="display:none;"></span><input type="checkbox"></input></span>']]);
			}
		};
		//totest
		W.Select = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<span><span style="display:none;"></span><select></select></span>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				_.txt = node.find('span:first');
				_.sel = node.find('select:first');
				V.forC(_.events,function(k,v){
					_.bindEvent(_.sel,k,v);
				},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {value:_.sel.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'options':
							_.sel.empty();
							if(V.getType(value) == 'string'){
								value = eval('('+value+')');
							};
							V.forC(value,function(k,v){
								_.sel.append('<option value="'+v+'">'+k+'</option>');
							});
							break;
						case 'value':
							_.sel.val(value);
							break;
						case 'name':
							_.sel.attr('name',value);
							break;
						case 'key':
							_.txt.text(value).show();
							break;
					}
				});
				return data;
			};
		};
		W.Hidden = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<input type="hidden"></input>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){_.bindEvent(node,k,v);},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {val:_.node.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'value':
							_.node.val(value);
							break;
						case 'name':
							_.node.attr('name',value);
							break;
					}
				});
				return data;
			};
		};		
		W.PasswordBox = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="password"></input></span>']]);
				__.render = _.render;
			}
			_.render = function(data){
				data = __.render(data);				
				V.forC(data,function(key,value){
					switch(key){
						case 'alt':
						case 'passchar':
							_.input.attr('alt',value);							
							break;
					}
				});
				return data;
			};
		};		
		W.Button = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="button"></input></span>']]);
				__.render = _.render;
			}
			_.fill = function(){return {};};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'name':
							_.input.attr('name',value);
							break;
						case 'key':
							_.txt.text(value).show();
							break;
						case 'text':
							_.input.val(value);
							break;
					}
				});
				return data;
			};
		};
		W.Submit = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Button,[path || '<span><span style="display:none;"></span><input type="submit"></input></span>']]);
			}
		};
		W.Reset = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Button,[path || '<span><span style="display:none;"></span><input type="reset"></input></span>']]);
			}
		};
		W.Form = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<form method="get" action=""></form>',{enctype:'multipart/form-data'}]]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){_.bindEvent(node,k,v)},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {value:_.node.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'method':
							_.node.attr('method',value);
							break;
						case 'action':
							_.node.attr('action',value);
							break;
						case 'target':
							_.node.attr('target',value);
							break;
						case 'name':
							_.node.attr('name',value);
							break;
						case 'enctype':
							_.node.attr('enctype',value);
							break;							
						case 'enctype':
							_.node.attr('enctype',value);
							break;
					}
				});
				return data;
			};
		};
		W.Box = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>']]);
				__.render = _.render;
				__.onLoad = _.onLoad;
			}			
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					_.bindEvent(_.node,k,v);					
				},null,true);
				__.onLoad(node);
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'key':							
							_.node.css({'text-align':'center','line-height':_.node.height()+'px','vertical-align':'middle',border:'solid 1px',margin:'0 auto','minwidth':'40px','minheight':'20px'}).html(v);
							break;
					}
				});
			};
		};
		//totest radiolist checklist 
		
		W.RadioList = function(path,content){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="p_radioList"><ul></ul></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.content = V.getValue(content,'<li><span><%=key%>:</span><span class="p_radiolist"><input name="<%=name%>" type="radio" value="<%=value%>"/></span></li>');
			}
			_.fill = function(){
				return {value:_.node.find(':radio:checked').val()};
			};
			_.onLoad = function(node){
				_.ul = node.find('ul');
				_.vm.data.name = V.getValue(_.vm.data.name,'radio');
				V.forC(_.events,function(k,v){
					_.bindEvent(node,k,v);
				},function(){__.onLoad(node);});
			};
			
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k){
						case 'list':
							var sb = new V.StringBuilder();
							V.each(v,function(v2){
								if(v2){
									v2.name = _.vm.data.name;
									sb.appendFormat(_.content,v2);
								}
							},function(){_.ul.empty().append(sb.toString());sb.clear();sb=null;});
							break;
						case 'value':
							var ret = [];
							_.node.find(":radio:checked").each(function(i,v){ret.push(v);});
							V.each(ret,function(v){V.setChecked(v,false)});
							V.setChecked(_.node.find(':radio[value="'+v+'"]'),true);
							break;
						case 'name':
							_.node.find(":radio:checked").attr('name',v);
							break;
					}
				});
			};
		};
		W.CheckList = function(path,content){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="p_checkList"><ul></ul></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.content = V.getValue(content,'<li><span><%=key%>:</span><span class="p_radiolist"><input name="<%=name%>" type="checkbox" value="<%=value%>"/></span></li>');
			}
			_.fill = function(){
				return {value:_.node.find(':check:checked').val()};
			};
			_.onLoad = function(node){
				_.ul = node.find('ul');
				_.vm.data.name = V.getValue(_.vm.data.name,'check');
				V.forC(_.events,function(k,v){
					_.bindEvent(node,k,v);
				},function(){__.onLoad(node);});
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k){
						case 'list':
							var sb = new V.StringBuilder();
							V.each(v,function(v2){
								if(v2){
									v2.name = _.vm.data.name;
									sb.appendFormat(_.content,v2);
								}
							},function(){_.ul.empty().append(sb.toString());sb.clear();sb=null;});
							break;
						case 'value':
							var ret = [];
							_.node.find(":radio:checked").each(function(i,v){ret.push(v);});
							V.each(ret,function(v){V.setChecked(v,false)},function(){V.setChecked(_.node.find(':radio[value="'+v+'"]'),true);});							
							break;
						case 'name':
							_.node.find(":radio:checked").attr('name',v);
							delete data[k];
							break;

					}
				});
			}
		};
		//todo panel 容器类对象的controls对象设置 bind方法设置 与 validate框架设置 move类对象动画设置
		//todo file
	}
})(VJ,jQuery,VJ.view,VJ.viewmodel);