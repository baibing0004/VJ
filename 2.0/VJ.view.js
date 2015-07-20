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
						case 'error':
							if(_.get().validate){
								_.validate(_,_.input);
							}
							break;
						default:
							_.bindEvent(_.input,k,v);
							break;
					}
				},null,true);
				__.onLoad(node);
			};
			_.fill = function(){
				return {text:_.input.val(),value:_.input.val()};
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(key,value){
					switch(key){
						case 'text':
						case 'value':
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
			_.animate = function(name,func){
				_._animate(name,_.input,func);
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
				if(_.events.error && _.get().validate){
					_.validate(_,_.input);
				}				
				__.onLoad(node);
			};
			_.fill = function(){
				return {value:_.sel.find("option:selected").val()};
			};
			_.render = function(data){
				data = __.render(data);
				var setValue = function(value){
					_.sel.find(':selected').attr('selected',false);
					_.sel.find('option[value="'+value+'"]').attr('selected',true);
				};
				V.forC(data,function(key,value){
					switch(key){
						case 'values':
							if(V.getType(value) == 'string'){
								value = eval('('+value+')');
							};
							var sb = V.sb();
							V.forC(value,function(k,v){								
								sb.appendFormat('<option value="{value}">{key}</option>',{key:k,value:v});
							},function(){_.sel.empty().append(sb.clear());sb = null;if(_.vm.data.value){setValue(_.vm.data.value);}});
							break;
						case 'value':							
							setValue(value);
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
			_.animate = function(name,func){
				_._animate(name,_.sel,func);
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
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'error':
							if(_.get().validate){
								_.validate(_,_.node);
							}
							break;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},null,true);
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
		//todo 获取其validata对象与方法 进行同步验证
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
				return data;
			};
		};
		W.RadioList = function(path,content){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="p_RadioList"><ul></ul></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.content = V.getValue(content,'<li><span>{key}:</span><span class="p_RadioList_li"><input name="{name}" type="radio" value="{value}"/></span></li>');
			}
			_.fill = function(){
				return {value:_.ul.find(':radio:checked').val()};
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
				var setValue = function(value){					
					V.setChecked(_.ul.find(":radio:checked"),false);
					V.setChecked(_.ul.find(':radio[value="'+value+'"]'),true);
				};
				V.forC(data,function(k,v){
					switch(k){
						case 'values':
							var sb = V.sb();
							V.forC(v,function(k,v2){
								sb.appendFormat(_.content,{key:k,value:v2,name:_.vm.data.name});
							},function(){
								_.ul.empty().append(sb.toString());sb.clear();sb=null;
								if(_.vm.data.value){
									setValue(_.vm.data.value);
								}
							});
							break;
						case 'value':
							setValue(v);
							break;
						case 'name':
							_.node.find(":radio").attr('name',v);
							break;
					}
				});
				return data;
			};						
			_.animate = function(name,func){
				_._animate(name,_.ul,func);
			};
		};
		W.CheckList = function(path,content){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="p_CheckList"><ul></ul></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.content = V.getValue(content,'<li><span>{key}:</span><span class="p_CheckList_li"><input name="{name}" type="checkbox" value="{value}"/></span></li>');
			}
			_.fill = function(){
				//需要兼容没有数据未创建时的错误
				return  _.ul.children().length>0?{value:(function(){
					var ret = [];
					_.ul.find(':checkbox:checked').each(function(i,v){
						ret.push($(v).val());
					});
					return ret.join(',');
				})()}:{};
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
				var setValue = function(value){
					value = V.getValue(value+'','');
					V.setChecked(_.ul.find(":checkbox:checked"),false);
					V.each(value.split(','),function(v){V.setChecked(_.ul.find(':checkbox[value="'+v+'"]'),true);});
				};
				//未能更简单实现list与value方法之间异步处理的问题。
				V.forC(data,function(k,v){
					switch(k){
						case 'values':
							var sb = V.sb();
							V.forC(v,function(k,v2){
								sb.appendFormat(_.content,{key:k,value:v2,name:_.vm.data.name});
							},function(){
								_.ul.empty().append(sb.clear());sb=null;
								if(_.vm.data.value){
									setValue(_.vm.data.value);
								}
							});
							break;
						case 'value':
							setValue(v);
							break;
						case 'name':
							_.node.find(":checkbox").attr('name',v);
							break;
					}
				});
				return data;
			};			
			_.animate = function(name,func){
				_._animate(name,_.sel,func);
			};
		};
		//构建时需要swiper.js
		W.SwiperPanel = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="swiper-container"></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.params = {direction:'horizontal',loop:false,simulateTouch:true};				
			}
			_.onLoad = function(node){				
				V.forC(_.events,function(k,v){
					switch(k){
						default:
							_.bindEvent(node,k,v);
							break;
					}
				});
				__.onLoad(node);
			};
			_.fill = function(){
				return {value:_.swiper?_.swiper.activeIndex:undefined};
			};
			_.render = function(data){
				var needRB = false;
				data = __.render(data);
				if(!_.swiper){
					var child = _.node.children().addClass('swiper-slide');
					_.node.append('<div class="swiper-wrapper"></div>');				
					_.wrapper = _.node.find('.swiper-wrapper');
					_.wrapper.append(child);					
				}
				_.params.simulateTouch = true;
				V.forC(data,function(k,v){				
					switch(k.toLowerCase()){
						case 'direction':
							needRB = true;
							_.params.direction = v;
							break;
						case 'autoplay':
							needRB = true;
							if(v){
								_.params = V.merge(_.params,{
									autoplayDisableOnInteraction : false,
									autoplay:true==v?3000:parseInt(v+'')
								});
							} else {
								_.params = V.merge(_.params,{
									autoplayDisableOnInteraction : true,
									autoplay:0
								});							
							}
							break;
						case 'loop':		
							needRB = true;			
							if('true'==(v+'').toLowerCase()){
								_.params = V.merge(_.params,{
									freeMode : false,
									freeModeSticky : false,
									freeModeMomentumRatio:0,
									loop:true
								});
							} else {
								_.params = V.merge(_.params,{
									freeMode : true,
									freeModeSticky : true,
									freeModeMomentumRatio:0,
									loop:false
								});								
							}
							break;
						case 'scrollbar':
							needRB = true;
							if('true'==(v+'').toLowerCase()){
								if(_.node.find('div.swiper-scrollbar').length==0){
									_.node.append('<div class="swiper-scrollbar"></div>');
								}
								_.params.scrollbar = _.node.find('div.swiper-scrollbar')[0];								
								_.params.simulateTouch = false;
							} else if(_.node.find('div.swiper-scrollbar').length>0){
								_.node.find('div.swiper-scrollbar').remove();
								delete _.params.scrollbar;
							}							
							break;
						case 'effect':
							needRB = true;
							switch((v+'').toLowerCase()){
								case 'true':
									_.params.effect = 'fade';
									break;
								case 'false':
									delete _.params.effect;
									break;
								case 'cube':
								case 'coverflow':
									_.params.effect = (v+'').toLowerCase();
									break;
							}							
							break;
						case 'buttons':
							needRB = true;
							if('true'==(v+'').toLowerCase()){
								if(_.node.find('div.swiper-button-prev').length==0){
									_.node.append('<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>');
								}
								_.params = V.merge(_.params,{
									prevButton:_.node.find('div.swiper-button-prev')[0],
									nextButton:_.node.find('div.swiper-button-next')[0],
									simulateTouch:false
								});
							} else if(_.node.find('div.swiper-button-prev').length>0){
								_.node.find('div.swiper-button-prev').remove();
								_.node.find('div.swiper-button-next').remove();
								delete _.params.prevButton;
								delete _.params.nextButton;
							}							
							break;
						case 'pagination':
							needRB = true;
							if('true'==(v+'').toLowerCase()){
								if(_.node.find('div.swiper-pagination').length==0){
									_.node.append('<div class="swiper-pagination"></div>');
								}
								_.params = V.merge(_.params,{
									pagination :_.node.find('div.swiper-pagination')[0],
									paginationClickable:true,
									simulateTouch:false
								});
							} else if(_.node.find('div.swiper-pagination').length>0){
								_.node.find('div.swiper-pagination').remove();
								delete _.params.pagination;
								delete _.params.paginationClickable;
							}							
							break;
						case 'touch':
							needRB = true;
							if('true'==(v+'').toLowerCase()){								
								_.params.simulateTouch=true;
								_.params.onlyExternal = false;
							} else {															
								_.params.simulateTouch=false;
								_.params.onlyExternal = true;
							}		
							break;
						case 'value':
							if(_.swiper){
								_.swiper.slideTo(v);
							} else {
								_.params.initialSlide = v;
							}
							break;
					}
				},function(){
					if(needRB){
						if(_.swiper){
							_.swiper.destroy(true);
							_.swiper = null;
						}
						if(!Swiper) {throw new Error('请更新config.js中SwiperPanel节点对Swiper.js引用');}
						_.swiper = new Swiper(_.node[0],V.merge({},_.params));
					}					
				});
				return data;
			};
		};
		//todo panel 容器类对象的controls对象设置 bind方法设置
		//todo file
		W.FillControl = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				__.replaceNode = _.replaceNode
			}
			__.onLoad = function(node){
				V.forC(_.events,function(k,v){
					_.bindEvent(_.node,k,v);					
				},null,true);
				__.onLoad(node);
			};
			_.replaceNode = function(){
				//必须覆盖这个方法否则_.node就是替换后的了
				__.content = _.node.html();
				__.replaceNode.apply(_,arguments);
				_.node.html(__.content);
			};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'value':							
							_.node.html(V.format(__.content,v));
							break;
					}
				});
				return data;
			};
		};
		//识别 上下左右滑动及其动画，同时支持滑入滑出，支持点击或者tap，支持加载动画
		//支持onUp向上滑动/onUpOut向上滑出/onDown向下滑动/onDownOut向下滑出/onLeft向左滑动/onLeftOut向左滑出/onRight向右滑动/onRightOut向右滑出/onDblClick双击/onScale(data(scale),self)双指改变大小/onRotate(data(angle),self)双指旋转 show('animatename')显示动画/hide('animatename')动画隐藏
		W.Panel = function(path){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[V.view.Control,[path || '<div style="background:blue;width:50px;height:50px;"></div>']]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				__.hasRender = false;
				__.transform = {
					tx: 0, ty: 0,
					scale: 1,
					angle: 0,
					rx: 0,
					ry: 0,
					rz: 0
				};
				__.am = function(data,timeout){
					if(!__.moving) {
						V.once(function(){
							__.transform = V.merge(__.transform,data);
							var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d(0,0,0,{angle}deg)',__.transform);
							_.node.css('webkitTransform',value).css('mozTransform',value).css('transform',value);
							__.moving = false;
						}, timeout || (1000 / 60));
						__.moving = true;
					}
				};
			}
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'up':
						case 'down':
							__.vol = true;
							break;
						case 'upout':
							__.vol = true;
							__.upout = true;
							break;
						case 'downout':
							__.hor = true;
							__.downout = true;
							break;
						case 'left':
						case 'right':
							__.hor = true;
							break;
						case 'leftout':
							__.hor = true;
							__.leftout = true;
							break;				
						case 'rightout':
							__.hor = true;
							__.rightout = true;
							break;
						case 'scale':
							__.pinch = true;
							break;
						case 'rotate':
							__.rotate = true;
							break;
						case 'dblclick':
							__.dblclick = true;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){__.onLoad(node);});
			};
			_.fill = function(){return {};};
			_.render = function(data){
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'show':
							_.vm.data.visible = true;
							_.node.show();
							_.animate(v);
							break;
						case 'hide':
							_.animate(v,function(){_.node.hide();_.vm.data.visible = false;});
							break;							
					}
				},function(){
					if(!__.hasRender){
						__.hasRender = true;							
						__.mc = new Hammer.Manager(_.node[0]);
						__.mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
						//__.mc.add(new Hammer.Swipe()).recognizeWith(__.mc.get('pan'));
						__.mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(__.mc.get('pan'));
						__.mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([__.mc.get('pan'), __.mc.get('rotate')]);
						__.mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
						//__.mc.add(new Hammer.Tap());
						__.mc.on(V.format("{hor} {vol} {pinorrot} {doubleclick}",{hor:__.hor?'panleft panright':'',vol:__.vol?'panup pandown':'',doubleclick:__.dblclick?'doubletap':'',pinorrot:__.rotate?'rotatestart rotatemove rotateend':(__.pinch?'pinchstart pinchmove pinchend':'')}), function(ev) {
							switch(ev.type){
								case 'panright':
									if(!__.rotating){
										_.node.removeClass('animate');
										__.am({tx:ev.deltaX,ty:0});
										__.lastAction = 'right';
									}
									break;
								case 'panleft':									
									if(!__.rotating){
										_.node.removeClass('animate');
										__.am({tx:ev.deltaX,ty:0});	
										__.lastAction = 'left';
									}
									break;
								case 'panup':																
									if(!__.rotating){
										_.node.removeClass('animate');
										__.am({ty:ev.deltaY,tx:0});
										__.lastAction = 'up';
									}
									break;
								case 'pandown':																							
									if(!__.rotating){
										_.node.removeClass('animate');
										__.am({ty:ev.deltaY,tx:0});
										__.lastAction = 'down';
									}
									break;
								case 'pinchstart':
									__.rotating = true;
								case 'pinchmove':
									_.node.removeClass('animate');
									__.am({scale:ev.scale});
									break;
								case 'pinchin':
								case 'pinchout':
									__.lastAction = 'scale';
									__.scale = ev.scale;
									break;																										
									__.lastAction = 'out';
									__.scale = ev.scale;
									break;
								case 'pinchend':									
									__.rotating = false;
									break;
								case 'rotatestart':
									__.rotating = true;
								case 'rotatemove':
									_.node.removeClass('animate');
									__.am({angle:ev.angle,scale:__.pinch?ev.scale:1});
									__.lastAction = 'rotate';
									__.angle = ev.angle;
									if(__.pinch){__.scale = ev.scale};
									break;
								case 'rotateend':										
									__.rotating = false;
									break;
							}
						});
						__.mc.on("hammer.input", function(ev) {
							if(ev.isFinal) {
								V.once(function(){
									__.transform = V.merge(__.transform,{tx:0,ty:0,scale:1,angle:0,rx:0,ry:0,rz:0});
									__.eventname = '';
									switch(__.lastAction){
										case 'left':										
											if(__.leftout){
												__.transform.tx = screen.width*-1;
											}
											break;	
										case 'right':
											if(__.rightout){
												__.transform.tx = screen.width;														
											}
											break;										
										case 'up':										
											if(__.upout){
												__.transform.ty = screen.height*-1;
											}
											break;										
										case 'down':										
											if(__.downout){
												__.transform.ty = screen.height;
											}
											break;
									}
									var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',__.transform);										
									_.node.addClass('animate').css('webkitTransform',value).css('mozTransform',value).css('transform',value);
									switch(__.lastAction){
										case 'left':		
											if(__.leftout){
												_.node.hide();
												_.call('leftout');
											}
											else
												_.call('left');
											break;	
										case 'right':		
											if(__.rightout){
												_.node.hide();
												_.call('rightout');
											}
											else
												_.call('right');
											break;										
										case 'up':
											if(__.upout){
												_.node.hide();
												_.call('upout');
											}
											else
												_.call('up');
											break;										
										case 'down':		
											if(__.downout){
												_.node.hide();
												_.call('downout');
											}
											else
												_.call('down');
											break;
										case 'scale':										
											_.call('scale',{scale:__.scale});
											break;							
										case 'rotate':
											if(__.pinch){
												if(__.scale != 1) {_.call('scale',{scale:__.scale});}
											}
											_.call('rotate',{angle:__.angle});
											break;
									}
								}, 100);							
							}
						});
						/*
						__.mc.on("swipe", onSwipe);
						__.mc.on("tap", onTap);
						*/
					}
				});
				return data;
			};
		};
	}
})(VJ,jQuery,VJ.view,VJ.viewmodel);