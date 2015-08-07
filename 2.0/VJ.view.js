(function(V,$,W,M){
	{
		W.TextBox = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<span><span style="display:none;"></span><input type="text"></input></span>',vm || {}]]);
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
				},function(){__.onLoad(node);},true);
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
		W.RadioBox = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="radio"></input></span>',vm]]);
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
		W.CheckBox = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.RadioBox,[path || '<span><span style="display:none;"></span><input type="checkbox"></input></span>',vm]]);
			}
		};
		W.Select = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<span><span style="display:none;"></span><select></select></span>',vm]]);
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
		W.Hidden = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<input type="hidden"></input>',vm]]);
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
		W.PasswordBox = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="password"></input></span>',vm]]);
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
		W.Button = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.TextBox,[path || '<span><span style="display:none;"></span><input type="button"></input></span>',vm]]);
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
		W.Submit = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Button,[path || '<span><span style="display:none;"></span><input type="submit"></input></span>',vm]]);
			}
		};
		W.Reset = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Button,[path || '<span><span style="display:none;"></span><input type="reset"></input></span>',vm]]);
			}
		};
		//todo 获取其validata对象与方法 进行同步验证
		W.Form = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<form method="get" action=""></form>',vm || {data:{enctype:'multipart/form-data'}}]]);
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
		W.Box = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {}]]);
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
		W.RadioList = function(path,content,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="p_RadioList"><ul></ul></div>',vm || {}]]);
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
		W.CheckList = function(path,content,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="p_CheckList"><ul></ul></div>',vm || {}]]);
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
		W.SwiperPanel = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div class="swiper-container"></div>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.params = {direction:'horizontal',loop:false,simulateTouch:true};				
			}
			_.onLoad = function(node){				
				V.forC(_.events,function(k,v){
					switch(k){
						case 'change':
							_.params.onSlideChangeEnd = function(){_.call('change');};
							break;
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
						case 'visible':
							if(v && _.swiper){
								_.swiper.onResize();
							}
							break;
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
		W.FillControl = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {}]]);
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
		W.History = function(path,vm){
			var _ = this,__ ={};
			{
				V.inherit.apply(_,[W.Control,[path || '<span style="display:none;"></span>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
			}
			_.fill = function(){
				return {hash:window.location.hash};
			};
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'change':
							$(window).bind('hashchange', function (e) {
								_.call('change');
							});
							break;
					}
				},function(){__.onLoad(node);});
			};
			_.render = function(data){
				if(data){
					delete data.visible;
					delete data.invisible;
				}
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'add':
							if(!_.get().history){_.get().history = [];}
							_.get().history.push(window.location.hash);
							window.location.hash = v;
							break;
						case 'back':
							if(_.get().history && _.get().history.length>0 && v){
								window.location.hash = _.get().history.pop();
							}
							break;
					}
				});
				return data;
			};
		};
		//识别 上下左右滑动及其动画，同时支持滑入滑出，支持点击或者tap，支持加载动画
		//支持onUp向上滑动/onUpOut向上滑出/onDown向下滑动/onDownOut向下滑出/onLeft向左滑动/onLeftOut向左滑出/onRight向右滑动/onRightOut向右滑出/onDblClick双击/onScale(data(scale),self)双指改变大小/onRotate(data(angle),self)双指旋转 show('animatename')显示动画/hide('animatename')动画隐藏 limit动画事件响应阀值达到阀值后才触发事件，limitBack触发事件后是否立即回复正常
		W.Panel = function(path,vm,limit,limitBack){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				__.hasRender = false;
				__.status = {
					panelid:V.random(),
					transform:{
						tx: 0, ty: 0,
						scale: 1,
						angle: 0,
						rx: 0,
						ry: 0,
						rz: 0
					},
					callevent:{value:false},
					limit:V.getValue(limit,0),
					limitBack:V.getValue(limitBack,true)
				};
				__.moving = false;
				_.am = function(data,timeout){
					if(!__.moving) {
						V.once(function(){
							__.status.transform = V.merge(__.status.transform,data);
							var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d(0,0,0,{angle}deg)',__.status.transform);
							_.node.css('webkitTransform',value).css('mozTransform',value).css('transform',value);
							__.moving = false;
						}, timeout || (1000 / 60));
						__.moving = true;
					}
				};
			}
			//事件处理
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'up':
							V.merge(__.status,{
								vol:true,
								up:true
							},true);
							break;
						case 'down':
							V.merge(__.status,{
								vol:true,
								down:true
							},true);
							break;
						case 'upout':
							V.merge(__.status,{
								vol:true,
								upout:true
							},true);
							break;
						case 'downout':
							V.merge(__.status,{
								vol:true,
								downout:true
							},true);
							break;
						case 'left':
							V.merge(__.status,{
								hor:true,
								left:true
							},true);
							break;
						case 'right':
							V.merge(__.status,{
								hor:true,
								right:true
							},true);
							break;
						case 'leftout':
							V.merge(__.status,{
								hor:true,
								leftout:true
							},true);
							break;			
						case 'rightout':
							V.merge(__.status,{
								hor:true,
								rightout:true
							},true);
							break;
						case 'scale':
							V.merge(__.status,{
								pinch:true
							},true);
							break;
						case 'rotate':
							V.merge(__.status,{
								rotate:true
							},true);
							break;
						case 'dblclick':
							V.merge(__.status,{
								dblclick:true
							},true);
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){node.attr('panelid',__.status.panelid);__.status.panelaction=(function(){
					var ret = [];
					if(__.status.vol){ret.push('vol');}
					if(__.status.hor){ret.push('hor');}
					if(__.status.pinch){ret.push('pinch');}
					if(__.status.rotate){ret.push('rotate');}
					if(__.status.dblclick){ret.push('dblclick');}
					return ret;
				})(); node.attr('panelaction',__.status.panelaction.join(','));__.onLoad(node);});
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
						//当物理控件的相关事务返回真时，启动提前终止的动画操作
						__.finalMove = false;
						__.mc = new Hammer.Manager(_.node[0]);
						//最终动画方法和事件应该以便后面的控件自己控制移动和回滚的动画
						//应该允许后面的继承控件自己控制
						//事件的触发应该有阀值，在超出阀值时触发事件 并引发或者不引发回滚						
						__.mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));						
						//__.mc.add(new Hammer.Swipe()).recognizeWith(__.mc.get('pan'));						
						if(__.status.rotate){
							__.mc.add(new Hammer.Rotate({threshold:0})).recognizeWith(__.mc.get('pan'));
						} 
						if(__.status.pinch){
							__.mc.add(new Hammer.Pinch({threshold:0})).recognizeWith([__.mc.get('pan'), __.mc.get('rotate')]);
						}
						if(__.status.dblclick){
							__.mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
						}
						//__.mc.add(new Hammer.Tap());
						__.mc.on(V.format("{vol} {hor} {up} {down} {pinorrot} {doubleclick}",{
								hor:(__.status.hor?'panleft panright':''),
								vol:(__.status.vol?'panup pandown':''),
								pinorrot:__.status.rotate?'rotatestart rotatemove rotateend':(__.status.pinch?'pinchstart pinchmove pinchend':''),
								doubleclick:__.status.dblclick?'doubletap':''}),
							function(ev) {
								//开始就有一个panelid 判断发生的target是否有panelid 如果有panelid且不是自己则不处理这个事情，否则处理这个事情（解决同向的滚动问题）
								//修改为只要其定义的事件集合不包含我们的事件集合就可以处理
								if(ev.target.hasAttribute('panelid') && ev.target.getAttribute('panelid')!=__.status.panelid && ev.target.hasAttribute('panelaction') && ''!=ev.target.getAttribute('panelaction')){
									var action = ev.target.getAttribute('panelaction').split(',');
									switch(ev.type){
										case 'panright':
										case 'panleft':
											if($.inArray('hor',action)>=0) return;
											break;
										case 'panup':
										case 'pandown':
											if($.inArray('vol',action)>=0) return;
											break;
										case 'pinchstart':
										case 'pinchmove':
										case 'pinchin':
										case 'pinchout':
										case 'pinchend':
											if($.inArray('pinch',action)>=0) return;
											break;
										case 'rotatestart':
										case 'rotatemove':
										case 'rotateend':											
											if($.inArray('rotate',action)>=0) return;
											break;
										case 'doubletap':											
											if($.inArray('dblclick',action)>=0) return;
											break;
									}									
								}
								if(!__.finalMove){
									switch(ev.type){
										case 'panright':
											if(!__.rotating && !__.finalMove){
												_.node.removeClass('animate');
												__.status.lastAction = 'right';
												__.finalMove = false ||	_.onRight(ev,__.status);
											}
											break;
										case 'panleft':									
											if(!__.rotating && !__.finalMove){
												_.node.removeClass('animate');
												__.status.lastAction = 'left';											
												__.finalMove = false ||	_.onLeft(ev,__.status);
											}
											break;
										case 'panup':																
											if(!__.rotating && !__.finalMove){
												_.node.removeClass('animate');
												__.status.lastAction = 'up';							
												__.finalMove = false ||	_.onUp(ev,__.status);
											}
											break;
										case 'pandown':
											if(!__.rotating && !__.finalMove){
												_.node.removeClass('animate');
												__.status.lastAction = 'down';			
												__.finalMove = false ||	_.onDown(ev,__.status);
											}
											break;
										case 'pinchstart':
											__.rotating = true;
										case 'pinchmove':
											if(!__.finalMove) _.node.removeClass('animate');
											__.finalMove = false ||	_.onScale(ev,__.status);
											break;
										case 'pinchin':
										case 'pinchout':
											__.status.lastAction = 'scale';
											__.scale = ev.scale;
											break;
										case 'pinchend':									
											__.rotating = false;
											break;
										case 'rotatestart':
											__.rotating = true;
										case 'rotatemove':
											//完成一个panel基础版本 其事件类应该可以由子类触发 完成一个hswiperpanel版本 完成一个上下移动的SPA初级模块
											if(!__.finalMove) _.node.removeClass('animate');
											__.status.lastAction = 'rotate';
											__.status.angle = ev.angle;
											__.finalMove = false || _.onRotate(ev,__.status);
											if(__.pinch){__.status.scale = ev.scale};
											break;
										case 'rotateend':										
											__.rotating = false;
											break;
									}
									//仅处理还原
									if(__.finalMove){
										V.once(function(){
											_.node.addClass('animate');
											_.onBackAnimate(__.status);
											if(__.status.callevent.value) _.onFinal(__.status);
										},100);
									}
								}
							});
							__.mc.on("hammer.input", function(ev) {
								if(ev.isFinal && !__.finalMove) {
									V.once(function(){
										_.node.addClass('animate');
										_.onBackAnimate(__.status);
										if(__.status.callevent.value) _.onFinal(__.status);
										__.status.callevent.value = false;
										V.once(function(){__.finalMove = false;},300);
									},100);
								} else if(ev.isFinal){
									__.status.callevent.value = false;
									V.once(function(){__.finalMove = false;},100);
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
			
			//以方便继承类覆盖并执行动画
			_.onRight = function(ev,e){
				if(ev.distance < _.node.width()* e.limit) _.am({tx:(e.right||e.rightout)?ev.deltaX:Math.max(0,ev.deltaX),ty:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onLeft = function(ev,e){
				if(ev.distance < _.node.width()* e.limit) _.am({tx:(e.left||e.leftout)?ev.deltaX:Math.min(0,ev.deltaX),ty:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onUp = function(ev,e){
				if(ev.distance < _.node.height()* e.limit) _.am({ty:(e.up||e.upout)?ev.deltaY:Math.max(0,ev.deltaY),tx:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onDown = function(ev,e){				
				if(ev.distance < _.node.height()* e.limit) _.am({ty:(e.up||e.upout)?ev.deltaY:Math.min(0,ev.deltaY),tx:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onScale = function(ev,e){
				if(Math.abs(ev.scale-1)<e.limit) _.am({scale:ev.scale});
				else {e.callevent.value = true;}};
			_.onRotate = function(ev,e){_.am({angle:ev.angle,scale:e.pinch?ev.scale:1});e.callevent.value = true;};
			//最终执行动画并触发事件缓冲100毫秒发生			
			_.onBackAnimate = function(e){
				V.merge(e.transform,{tx:0,ty:0,scale:1,angle:0,rx:0,ry:0,rz:0},true);
				switch(e.lastAction){
					case 'left':										
						if(e.leftout){
							e.transform.tx = screen.width*-1;
						}
						break;	
					case 'right':
						if(e.rightout){
							e.transform.tx = screen.width;														
						}
						break;										
					case 'up':										
						if(e.upout){
							e.transform.ty = screen.height*-1;
						}
						break;										
					case 'down':										
						if(e.downout){
							e.transform.ty = screen.height;
						}
						break;
				}
				var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',e.transform);										
				_.node.css('webkitTransform',value).css('mozTransform',value).css('transform',value);
				switch(e.lastAction){
					case 'left':		
						if(e.leftout){
							_.node.hide();
						}
						break;	
					case 'right':		
						if(e.rightout){
							_.node.hide();
						}
						break;										
					case 'up':
						if(e.upout){
							_.node.hide();
						}
						break;										
					case 'down':		
						if(e.downout){
							_.node.hide();
						}
						break;
				}
			};
			_.onFinal = function(e){	
				switch(e.lastAction){
					case 'left':		
						if(e.leftout){
							_.call('leftout');
						}
						else
							_.call('left');
						break;	
					case 'right':		
						if(e.rightout){
							_.call('rightout');
						}
						else
							_.call('right');
						break;										
					case 'up':
						if(e.upout){
							_.call('upout');
						}
						else
							_.call('up');
						break;										
					case 'down':		
						if(e.downout){
							_.call('downout');
						}
						else
							_.call('down');
						break;
					case 'scale':										
						_.call('scale',{scale:e.scale});
						break;							
					case 'rotate':
						if(e.pinch){
							if(e.scale != 1) {_.call('scale',{scale:e.scale});}
						}
						_.call('rotate',{angle:e.angle});
						break;
				}
			};			
		};
	}
})(VJ,jQuery,VJ.view,VJ.viewmodel);