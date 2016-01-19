(function(V,$,W,M){
	{
		W.Box = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {border:1}]]);
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
						case 'border':
							_.node.css({border:'solid '+v+'px'});
							break;
						case 'key':							
							_.node.css({'text-align':'center','line-height':_.node.height()+'px','vertical-align':'middle',margin:'0 auto','minwidth':'40px','minheight':'20px'}).html(v);
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
		//todo file
		W.FillControl = function(path,vm){
			var _ = this,__ = {};
			{
				V.inherit.apply(_,[W.Control,[path || '<div></div>',vm || {}]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				__.replaceNode = _.replaceNode
			}			
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					if(k.toLowerCase() == 'click'){
						_.node.on('click', 'input', function (e) { var _this = $(this); _.call('click', { e: e, vid: _this.val(), name: _this.attr('name') }); V.stopProp(e); return false;});
						_.node.on('click', 'a', function (e) { var _this = $(this); _.call('click', { e: e, vid: _this.attr('href'), name: _this.attr('name') }); V.stopProp(e); return false; });
					} else _.bindEvent(_.node,k,v);					
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
				return {hash:window.location.hash.replace(/#/g,'')};
			};
			_.onLoad = function(node){
				V.forC(_.events,function(k,v){
					switch(k.toLowerCase()){
						case 'change':
							$(window).bind('hashchange', function (e) {
								if(_.lastAction != window.location.hash.replace(/#/g,'')){
									_.call('change',{lastAction:_.lastAction});
									_.lastAction = _.get().history.pop();
								}						
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
							if(window.location.hash){
								var his = _.get().history;
								if(!(his.length>0 && his[his.length-1]==window.location.hash.replace(/#/g,''))){
									his.push(window.location.hash.replace(/#/g,''));
								}
							}							
							v = v.replace(/#/g,'');
							if(_.lastAction != v){
								window.location.hash = v;
								_.lastAction = v;
							}
							break;
						case 'remove':
							_.get().history.pop();
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
		W.Panel = function(path,vm,limit,limitBack,lock){
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
					limitBack:V.getValue(limitBack,true),
					lock:lock?lock:false,
					startX:0,startY:0
				};
				_.status = __.status;
				__.moving = false;
				_.am = function(node,data,timeout){
					if(!__.status.lock && !__.moving) {
						V.once(function(){
							__.status.transform = V.merge(__.status.transform,data);
							var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d(0,0,0,{angle}deg)',__.status.transform);
							node.css('webkitTransform',value).css('mozTransform',value).css('transform',value);
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
						case 'width':
							_.node.width(v);
							break;
						case 'height':
							_.node.height(v);
							break;
					}
				},null,true);
				if(!__.hasRender){
					__.document = $(document);
					__.hasRender = true;
					//当物理控件的相关事务返回真时，启动提前终止的动画操作
					__.finalMove = false;
					__.mc = new Hammer.Manager(_.node[0]);
					//最终动画方法和事件应该以便后面的控件自己控制移动和回滚的动画
					//应该允许后面的继承控件自己控制
					//事件的触发应该有阀值，在超出阀值时触发事件 并引发或者不引发回滚						
					__.mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));						
					//__.mc.add(new Hammer.Swipe({velocity:0.6})).recognizeWith(__.mc.get('pan'));						
					if(__.status.rotate || __.status.pinch){
						__.mc.add(new Hammer.Rotate({threshold:0})).recognizeWith(__.mc.get('pan'));
					} 
					if(__.status.pinch){
						__.mc.add(new Hammer.Pinch({threshold:0})).recognizeWith([__.mc.get('pan'), __.mc.get('rotate')]);
					}
					if(__.status.dblclick){
						__.mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
					}
					//__.mc.add(new Hammer.Tap());swipeleft swiperight swipeup swipedown 
					__.mc.on(V.format("panleft panright panup pandown {pinorrot} {doubleclick}",{
							//hor:(__.status.hor?'panleft panright':''),
							//vol:(__.status.vol?'panup pandown':''),
							pinorrot:__.status.rotate?'rotatestart rotatemove rotateend':(__.status.pinch?'pinchstart pinchmove pinchend':''),
							doubleclick:__.status.dblclick?'doubletap':''}),
						function(ev) {
							//开始就有一个panelid 判断发生的target是否有panelid 如果有panelid且不是自己则不处理这个事情，否则处理这个事情（解决同向的滚动问题）
							//修改为只要其定义的事件集合不包含我们的事件集合就可以处理
							//需要过滤掉panelid相等但是不是本身的
							var parent = ev.target.hasAttribute('panelid')?$(ev.target):$(ev.target).parents('[panelid]:first');
							parent = parent.length>0?parent:null;
							if(parent && parent.attr('panelid') ==__.status.panelid){							
								switch(ev.type){
									case 'panright':
									case 'panleft':
									case 'swiperight':
									case 'swipeleft':
										if($.inArray('hor',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'panup':
									case 'pandown':
									case 'swipeup':
									case 'swipedown':
										if($.inArray('vol',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'pinchstart':
									case 'pinchmove':
									case 'pinchin':
									case 'pinchout':
									case 'pinchend':
										if($.inArray('pinch',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'rotatestart':
									case 'rotatemove':
									case 'rotateend':							
										if($.inArray('rotate',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
									case 'doubletap':								
										if($.inArray('dblclick',__.status.panelaction)<0) {
											parent = $(parent).parents('[panelid]:first');
											parent = parent.length>0?parent:null;
										};
										break;
								}
							}							
							if(parent && parent.attr('panelid') !=__.status.panelid && parent.attr('panelaction') !=''){
								var action = parent.attr('panelaction').split(',');
								switch(ev.type){
									case 'panright':
									case 'panleft':
									case 'swiperight':
									case 'swipeleft':
										if($.inArray('hor',action)>=0) return;
										break;
									case 'panup':
									case 'pandown':
									case 'swipeup':
									case 'swipedown':
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
								//这里会出现闪烁，除非立即设定现在的位置 按理说finalMove应保护最终动画的完成
								_.node.removeClass('animate').find('.animate').removeClass('animate');
								switch(ev.type){
									case 'panright':
									case 'swiperight':										
										if(__.status.hor && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)>Math.abs(ev.deltaY)){
											__.status.lastAction = 'right';
											__.finalMove = false ||	_.onRight(ev,__.status);
										} else if(!__.status.hor && document.body.clientWidth < document.body.scrollWidth){
											//改为以一个固定的起始点+位移为处理方法 这样可以避免移动加倍的问题。
											if(__.status.startX == 0) __.status.startX = __.document.scrollLeft();
											__.document.scrollLeft(Math.max(__.status.startX-ev.deltaX,0));
										}
										break;
									case 'panleft':	
									case 'swipeleft':								
										if(__.status.hor && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)>Math.abs(ev.deltaY)){
											__.status.lastAction = 'left';											
											__.finalMove = false ||	_.onLeft(ev,__.status);
										} else if(!__.status.hor && document.body.clientWidth < document.body.scrollWidth){
											if(__.status.startX == 0) __.status.startX = __.document.scrollLeft();
											__.document.scrollLeft(Math.min(__.status.startX-ev.deltaX,document.body.scrollWidth - document.body.clientWidth));
										}
										break;
									case 'panup':
									case 'swipeup':																
										if(__.status.vol && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)<Math.abs(ev.deltaY)){
											__.status.lastAction = 'up';							
											__.finalMove = false ||	_.onUp(ev,__.status);
										} else if(!__.status.vol && window.screen.availHeight < document.body.scrollHeight){
											if(__.status.startY == 0) __.status.startY = __.document.scrollTop();
											__.document.scrollTop(Math.max(__.status.startY-ev.deltaY,document.body.scrollHeight - document.body.clientHeight));
										}
										break;
									case 'pandown':
									case 'swipedown':	
										if(__.status.vol && !__.rotating && !__.finalMove && Math.abs(ev.deltaX)<Math.abs(ev.deltaY)){
											__.status.lastAction = 'down';			
											__.finalMove = false ||	_.onDown(ev,__.status);
										} else if(!__.status.vol && window.screen.availHeight < document.body.scrollHeight){
											if(__.status.startY == 0) __.status.startY = __.document.scrollTop();
											__.document.scrollTop(Math.min(__.status.startY-ev.deltaY,document.body.scrollHeight));
										}
										break;
									case 'pinchstart':
										__.rotating = true;
									case 'pinchmove':
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
										if(__.status.callevent.value) _.onFinal(__.status);
										_.onBackAnimate(_.node,__.status);											
										__.status.callevent.value = false;
										V.once(function(){__.finalMove = false;},300);
									},100);
								}
							}
						});
						__.mc.on("hammer.input", function(ev) {
							if(ev.isFinal && !__.finalMove) {
								V.once(function(){
									if(__.status.callevent.value) _.onFinal(__.status);
									_.onBackAnimate(_.node,__.status);
									__.status.callevent.value = false;
									V.once(function(){__.finalMove = false;},300);
								},100);
							}
						});
					/*
					__.mc.on("swipe", onSwipe);
					__.mc.on("tap", onTap);
					*/
				}
				return data;
			};
			
			//以方便继承类覆盖并执行动画
			_.onLeft = function(ev,e){
				//使用速度计算距离不是太合理 Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				if(Math.abs(ev.deltaX) < Math.max(30,_.node.width()* e.limit)) {_.am(_.node,{tx:(e.left||e.leftout)?ev.deltaX:Math.max(0,ev.deltaX),ty:0});}
				else {e.callevent.value = true;return e.limitBack;}
				};
			_.onRight = function(ev,e){
				if(Math.abs(ev.deltaX) < Math.max(30,_.node.width()* e.limit)) _.am(_.node,{tx:(e.right||e.rightout)?ev.deltaX:Math.max(0,ev.deltaX),ty:0});	
				else {e.callevent.value = true;return e.limitBack;}
				};
			_.onUp = function(ev,e){
				if(Math.abs(ev.deltaY) < Math.max(30,_.node.height()* e.limit)) _.am(_.node,{ty:(e.up||e.upout)?ev.deltaY:Math.max(0,ev.deltaY),tx:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onDown = function(ev,e){				
				if(Math.abs(ev.deltaY) < Math.max(30,_.node.height()* e.limit)) _.am(_.node,{ty:(e.down||e.downout)?ev.deltaY:Math.min(0,ev.deltaY),tx:0});
				else {e.callevent.value = true;return e.limitBack;}};
			_.onScale = function(ev,e){
				if(Math.abs(ev.scale-1)<e.limit) _.am(_.node,{scale:ev.scale});
				else {e.callevent.value = true;}};
			_.onRotate = function(ev,e){_.am(_.node,{angle:ev.angle,scale:e.pinch?ev.scale:1});e.callevent.value = true;};
			//最终执行动画并触发事件缓冲100毫秒发生			
			_.onBackAnimate = function(node,e){
				V.merge(e.transform,{tx:0,ty:0,scale:1,angle:0,rx:0,ry:0,rz:0,startX:0,startY:0},true);
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
				node.addClass('animate').css('webkitTransform',value).css('mozTransform',value).css('transform',value);
				switch(e.lastAction){
					case 'left':		
						if(e.leftout){
							node.hide();
						}
						break;	
					case 'right':		
						if(e.rightout){
							node.hide();
						}
						break;										
					case 'up':
						if(e.upout){
							node.hide();
						}
						break;										
					case 'down':		
						if(e.downout){
							node.hide();
						}
						break;
				}
			};
			//最后触发的事件
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
		W.PagePanel = function(middler,path,vm,limit,limitBack){
			var _ = this,__ = {};
			{	
				V.inherit.apply(_,[middler.getTypeByAppName('VESH.view','panel'),[V.getValue(path, '<div style="overflow:hidden;"><div style="display:none;"></div></div>'),V.merge(V.getValue(vm,{}),{
					data:{direction:'hor',value:0},						
					onLeft:function(data,self){_.change(true);},
					onRight:function(data,self){_.change(false);},
					onUp:function(data,self){_.change(true);},
					onDown:function(data,self){_.change(false);}
				},true),limit || 0.2,limitBack || true,true]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.lock = false;
			}
			_.onLoad = function(node){
				node.removeClass('animate');
				_.panel = node.find('div:first');
				_.children  = _.panel.siblings();
				//if(_.children.length==0) {}
				_.length = _.children.length;
				_.children.width(node.width()).height(node.height()).css('overflow','hidden').css('position','relative');
				_.children.addClass('noactive');
				_.panel.append(_.children);
				//根据direction覆盖监听操作 同时修改panelaction
				var dir = _.get().direction;
				switch(dir){
					case 'vol':
						_.vol = true;
						delete _.events.left;
						delete _.events.right;
						//取消水平操作动画
						_.panel.css('height',_.length+'00%').css('width','100%');
						break;
					case 'hor':
					default:
						//取消垂直操作动画
						_.hor = true;
						delete _.events.up;
						delete _.events.down;
						_.panel.css('width',_.length+'00%').css('height','100%');//.css('display','flex');						
						_.children.css('float','left');
						break;
				}
				V.forC(_.events,function(k,v){
					k = k.toLowerCase();
					switch(k){
						case 'change':								
							break;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){__.onLoad(node);});
			};
			//以方便继承类覆盖并执行动画
			__.onLeft = _.onLeft;
			_.onLeft = function(ev,e){
				if(_.vol || _.lock) return;
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onLeft(ev,e);
			};
			__.onRight = _.onRight;
			_.onRight = function(ev,e){
				if(_.vol || _.lock) return;
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onRight(ev,e);
			};
			__.onUp = _.onUp;
			_.onUp = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onUp(ev,e);
			};
			__.onDown = _.onDown;
			_.onDown = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				return __.onDown(ev,e);
			};
			//low设计需要区别第一次
			__.first = true;
			_.render = function(data){				
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'value':
							_.change(v,true,__.first);
							__.first = false;
							break;
						case 'freeze':
						case 'lock':
							_.lock = v;
							break;
						case 'height':
							_.children.height(v);
							break;
						case 'width':							
							_.children.width(v);
							break;
						case 'values':
							var lst = V.newEl('div','','').css('display','none;');
							V.each(v,function(v2){
								lst.append(v2);
							},function(){
								_.children = lst.children();
								_.length = _.children.length;
								_.children.width(_.node.width()).height(_.node.height()).css('overflow','hidden').css('position','relative');
								_.children.addClass('noactive');						
								_.panel.empty().append(_.children);
								if(_.vol){_.panel.css('height',_.length+'00%').css('width','100%');}else{_.panel.css('width',_.length+'00%').css('height','100%');_.children.css('float','left');}
								_.change(_.index==NaN?0:_.index,true,true);
								lst.remove();								
							},false);
							break;
					}
				},function(){
				},true);
			};
			_.change = function(val,nofire,first){
				val = (''+val).toLowerCase();
				var num = Math.ceil(__.distance/(_.hor?_.node.width():_.node.height()));
				val=Math.max(0,Math.min(_.children.length-1,val=='true'?(_.get().value+num):(val == 'false'?(_.get().value-num):parseInt(val))));
				_.index = val;
				if(!nofire && val != parseInt(_.get().value)) {_.call('change',{value:val});}
				else {_.onBackAnimate(_.panel,_.status,first);}
			};
			_.onBackAnimate = function(node,e,first){
				V.once(function(){
					//等待1秒是希望在触发事件更新Index之后再处理动画才能合理显示
					V.merge(e.transform,{tx:0,ty:0,scale:1,angle:0,rx:0,ry:0,rz:0,startX:0,startY:0},true);
					if(_.hor){e.transform.tx-=(_.node.width()*_.index);} else if(_.vol){e.transform.ty-=(_.node.height()*_.index);}
					var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',e.transform);
					if(!first) {_.panel.addClass('animate')};
					_.panel.css('webkitTransform',value).css('mozTransform',value).css('transform',value).show();//.addClass('animate')
					/*var cur = $(_.children.get(_.index));
					if(cur.hasClass('noactive')){
						cur.removeClass('noactive').addClass('active');
						//不仅仅是动画 需要显示
						_._animate('fadeOut',_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active'),function(){
							_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active').hide().removeClass('active').addClass('noactive');
						})
						_._animate('fadeIn',cur,function(){cur.show();});
					}*/
				},10);
			};
		};
		//上下或者左右滚动的方法的基本类，继承者注意重载onValue(v,func)函数 其中v代表按照value,values,addValues传入的数据，传入时已整理为数组，func是参数为字符串的对象，如果不适用，那么请{}方式添加子控件
		W.ScrollPanel = function(middler,path,vm,limit,limitBack){
			var _ = this,__ = {};
			{	
				V.inherit.apply(_,[middler.getTypeByAppName('VESH.view','panel'),[V.getValue(path, '<div style="overflow:hidden;"><div style="display:none;"></div></div>'),V.merge(V.getValue(vm,{}),{
					data:{direction:'vol'},						
					onLeft:function(data,self){_.call('next')},
					onRight:function(data,self){_.call('reload')},
					onUp:function(data,self){_.call('next')},
					onDown:function(data,self){_.call('reload');}
				},true),limit || 0.2,limitBack || true]]);
				__.onLoad = _.onLoad;
				__.render = _.render;
				_.lock = false;
				V.merge(_.status.transform,{x:0,y:0},true);
			}
			_.onLoad = function(node){
				node.removeClass('animate');
				_.panel = node.find('div:first');
				_.children  = _.panel.siblings();
				//if(_.children.length==0) return;
				_.length = _.children.length;					
				_.value = Math.max(0,Math.min(_.children.length,parseInt(_.value)));
				_.children.css('position','relative');
				_.children.addClass('noactive');
				_.panel.append(_.children);
				//根据direction覆盖监听操作 同时修改panelaction
				var dir = _.get().direction;
				switch(dir){
					case 'vol':
						_.vol = true;
						delete _.events.left;
						delete _.events.right;
						//取消水平操作动画
						_.panel.css('width','100%');
						_.children.css('width','100%')
						break;
					case 'hor':
					default:
						//取消垂直操作动画
						_.hor = true;
						delete _.events.up;
						delete _.events.down;
						_.panel.css('height','100%');//.css('display','flex');						
						_.children.css('height','100%').css('float','left');
						break;
				}
				V.forC(_.events,function(k,v){
					k = k.toLowerCase();
					switch(k){
						case 'next':
						case 'reload':
							break;
						default:
							_.bindEvent(node,k,v);
							break;
					}
				},function(){__.onLoad(node);});
			};
			//以方便继承类覆盖并执行动画
			_.onLeft = function(ev,e){
				if(_.vol || _.lock) return;				
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
				var x = e.transform.x+ev.deltaX;
				if(x < (_.node.width()-5-_.panel.width())){e.callevent.value=true;}
				if(x > Math.min(-e.limit,(_.node.width()-e.limit-_.panel.width()))) {_.am(_.panel,{tx:(e.left||e.leftout)?x:Math.max(0,ev.deltaX),ty:0});} else return e.limitBack;
			};
			_.onRight = function(ev,e){
				if(_.vol || _.lock) return;
				__.distance = Math.abs(ev.deltaX);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
				var x = e.transform.x+ev.deltaX;
				if(x > 5){e.callevent.value=true;}
				if(x < e.limit){_.am(_.panel,{tx:(e.right||e.rightout)?x:Math.max(0,ev.deltaX),ty:0});} else return e.limitBack;
			};
			_.onUp = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance)
				var y = e.transform.y+ev.deltaY;
				if(y < (_.node.height()-5-_.panel.height())){e.callevent.value=true;}
				if(y > Math.min(-e.limit,(_.node.height()-e.limit-_.panel.height()))) {_.am(_.panel,{ty:(e.up||e.upout)?y:Math.max(0,ev.deltaY),tx:0});} else return e.limitBack;
			};
			_.onDown = function(ev,e){
				if(_.hor || _.lock) return;
				__.distance = Math.abs(ev.deltaY);//Math.max(Math.abs(ev.velocity*ev.deltaTime),ev.distance);					
				var y = e.transform.y+ev.deltaY;
				if(y > 5){e.callevent.value=true;}
				if(y < e.limit){_.am(_.panel,{ty:(e.down||e.downout)?y:Math.max(0,ev.deltaY),tx:0});} else return e.limitBack;
			};
			_.onScale = function(ev,e){
				if(Math.abs(ev.scale-1)*Math.min(_.node.width(),_.node.height)<e.limit) _.am(_.panel,{scale:ev.scale});
				else {e.callevent.value = true;}};
			_.addControl = function(node,v){
				if(!_.controls){
					_.controls = [];
					_.views = {};
					_.models = {};
				}
				var obj = _.middler.getObjectByAppName(W.APP,v.type);
				if(!obj) throw new Error('配置文件中没有找到对象类型定义:'+v.type);
				node = node?node:V.newEl('div').appendTo(_.panel);
				obj.init(_,node,v);
				obj.page = _.page;
				_.controls.push(obj);
				var key = V.getValue(v.id,V.random());
				if(_.views[key]){V.showException('控件id为'+id+'的子控件已经存在，请更换id名');return;}
				_.views[key] = obj;
				V.inherit.apply(v,[M.Control,[]]);
				_.models[key]=v;
				obj.bind(v);
				return v;
			};
			_.render = function(data){				
				data = __.render(data);
				V.forC(data,function(k,v){
					switch(k.toLowerCase()){
						case 'value':
							_.onValue([v],function(content){
								switch(typeof(content)){
									case 'string':
										_.panel.empty().append(content)
										break;
									case 'object':
										_.panel.empty();
										_.addControl(null,content);
										break;
								}
							});
							break;
						case 'values':
							_.onValue(v,function(content){
								switch(typeof(content)){
									case 'string':
										_.panel.empty().append(content)
										break;
									case 'object':
										if(!V.isArray(content)){content = [content];}
										_.panel.empty();
										V.each(content,function(v){_.addControl(null,v);});
										break;
								}
							});
							break;
						case 'addvalues':						
							_.onValue(v,function(content){
								switch(typeof(content)){
									case 'string':
										_.panel.append(content)
										break;
									case 'object':
										if(!V.isArray(content)){content = [content];}
										V.each(content,function(v){_.addControl(null,v);});
										break;
								}});
							break;
						case 'top':
							if(v){
								_.get().top = false;
								_.onBackAnimate(_.node,V.merge(_.status,{transform:{tx:0,ty:0}},true));
							}
							break;
						case 'bottom':
							if(v){
								_.get().bottom = false;
								_.onBackAnimate(_.node,V.merge(_.status,{transform:{tx:_.status.vol?0:(_.node.width() - _.panel.width()),ty:_.status.hor?0:(_.node.height() - _.panel.height())}},true));
							}
							break;
						case 'freeze':
						case 'lock':
							_.lock = v;
							break;
					}
				},function(){
				},true);
				_.panel.show();
				return data;
			};
			//一般需要重载此方法即可
			_.onValue = function(v,func){
				if(!V.isArray(v)) v = [v];
				var sb = V.sb();
				V.each(v,function(v2){if(typeof(v2)=='string') {sb.append(v2);} else sb.append(V.toJsonString(v2));},function(){func(sb.clear());sb = null;});
			};			
			_.onBackAnimate = function(node,e){
				V.once(function(){
					if(e.vol && e.transform.ty<0 && e.transform.ty > (_.node.height() - _.panel.height())){e.transform.y = e.transform.ty;return;}
					if(e.hor && e.transform.tx<0 && e.transform.tx > (_.node.width() - _.panel.width())){e.transform.x = e.transform.tx;return;}
					V.merge(e.transform,{
						tx:Math.min(0,Math.max(_.node.width() - _.panel.width(),e.transform.tx)),
						ty:Math.min(0,Math.max(_.node.height() - _.panel.height(),e.transform.ty)),
						scale:1,angle:0,rx:0,ry:0,rz:0,startX:0,startY:0},true);
					V.merge(e.transform,{x:e.transform.tx,y:e.transform.ty},true);
					//等待1秒是希望在触发事件更新Index之后再处理动画才能合理显示
					var value = V.format('translate3d({tx}px,{ty}px,0px) scale({scale},{scale}) rotate3d({rx},{ry},{rz},{angle}deg)',e.transform);
					_.panel.addClass('animate').css('webkitTransform',value).css('mozTransform',value).css('transform',value).show();
					/*var cur = $(_.children.get(_.index));
					if(cur.hasClass('noactive')){
						cur.removeClass('noactive').addClass('active');
						//不仅仅是动画 需要显示
						_._animate('fadeOut',_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active'),function(){
							_.panel.children(':lt('+_.index+').active,:gt('+_.index+').active').hide().removeClass('active').addClass('noactive');
						})
						_._animate('fadeIn',cur,function(){cur.show();});
					}*/
				},10);
			};
		}
	}
})(VJ,jQuery,VJ.view,VJ.viewmodel);