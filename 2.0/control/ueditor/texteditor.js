(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<script type="text/plain"></script>', V.merge({
                data: {
                    toolbars: {
						'fullscreen':false, 'source':false, 'undo':true, 'redo':true,
						'bold':true, 'italic':true, 'underline':true, 'fontborder':true, 'strike':true, 'sup':true, 'sub':true, 'removeformat':true, 'formatmatch':true, 'autotypeset':true, 'blockquote':false, 'pasteplain':true,'forecolor':true, 'backcolor':true,
						'insertorderedlist':true, 'insertunorderedlist':true, 'selectall':false, 'cleardoc':false,'rowspacingtop':true, 'rowspacingbottom':true, 'lineheight':true, 'fontfamily':true, 'fontsize':true, 
						'directionalityltr':false, 'directionalityrtl':false, 'indent':true, 
						'customstyle':true, 'paragraph':true, 
						'left':true, 'center':true, 'right':true, 'justify':true,  'touppercase':true, 'tolowercase':true, 
						'link':true, 'unlink':true, 'anchor':true,  'imagenone':false, 'imageleft':false, 'imageright':false, 'imagecenter':false, 
						'simpleupload':false, 'image':true, 'emotion':false, 'scrawl':false, 'insertvideo':false, 'music':false, 'attachment':true, 'map':false, 'gmap':false, 'insertframe':false, 'insertcode':false, 'webapp':false, 'pagebreak':false, 'template':false, 'background':true, 
						'hr':true, 'date':false, 'time':false, 'spechars':true, 'snapscreen':true, 'wordimage':true, 
						'inserttable':true, 'deletetable':true, 'insertparagraphbeforetable':true, 'insertrow':true, 'deleterow':true, 'insertcol':true, 'deletecol':true, 'mergecells':true, 'mergeright':true, 'mergedown':true, 'splittocells':true, 'splittorows':true, 'splittocols':true, 'charts':true, 
						'print':true, 'preview':true, 'searchreplace':true, 'drafts':true, 'help':false,'textbox':true,'checkbox':true,'radiobox':true,'select':true
                    },
                    width: '100%',
                    height: '300',
                    language: 'zh-cn',//lang 
                    icon: 'default',//theme
                    value: '',
					uploadimage:'',//执行上传图片或截图的action名称
					uploadscrawl:'',//执行上传涂鸦的action名称
					uploadvideo:'',//执行上传视频的action名称
					uploadfile:'',//controller里,执行上传视频的action名称
					catchimage:'',//执行抓取远程图片的action名称
					listimage:'',//执行列出图片的action名称
					listfile:''				
                }
            }, vm)]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
			__.dispose = _.dispose;
            _.addDesc('texteditor 对象');
            _.addDesc('非必填属性:');
            _.addDesc('\twidth 类型300px,100%');
            _.addDesc('\theight 类型300px,不支持百分比');
            _.addDesc("\ttoolbars'fullscreen':false,'source':false,'undo':true,'redo':true,'bold':true,'italic':true,'underline':true,'fontborder':true,'strike':true,'sup':true,'sub':true,'removeformat':true,'formatmatch':true,'autotypeset':true,'blockquote':true,'pasteplain':true,'forecolor':true,'backcolor':true,'insertorderedlist':true,'insertunorderedlist':true,'selectall':false,'cleardoc':false,'rowspacingtop':true,'rowspacingbottom':true,'lineheight':true,'customstyle':true,'paragraph':true,'fontfamily':true,'fontsize':true,'directionalityltr':false,'directionalityrtl':false,'indent':true,'left':true,'center':true,'right':true,'justify':true,'touppercase':true,'tolowercase':true,'link':true,'unlink':true,'anchor':true,'imagenone':true,'imageleft':true,'imageright':true,'imagecenter':true,'simpleupload':false,'image':true,'emotion':false,'scrawl':false,'insertvideo':false,'music':false,'attachment':true,'map':false,'gmap':false,'insertframe':false,'insertcode':false,'webapp':false,'pagebreak':false,'template':false,'background':true,'hr':true,'date':false,'time':false,'spechars':true,'snapscreen':true,'wordimage':true,'inserttable':true,'deletetable':true,'insertparagraphbeforetable':true,'insertrow':true,'deleterow':true,'insertcol':true,'deletecol':true,'mergecells':true,'mergeright':true,'mergedown':true,'splittocells':true,'splittorows':true,'splittocols':true,'charts':true,'print':true,'preview':true,'searchreplace':true,'drafts':true,'help':false,commands:[{icon:'new.gif',tooltip:'添加新控件',command:function(){initControl();}}]");
			_.addDesc('\t说明  commands表示要添加新的icon控件，支持N个,{新加的控件(icon:图标地址，tooltip:图标显示名称，command:要执行的函数)}');
            _.addDesc('\tlanguage  语言 类型 en zh-cn');
            _.addDesc('\tvalue  内容会被V.decHtml 同时获取的内容会被自动encHtml 另更新value时请至少等待100ms以防止渲染出现问题');
            _.addDesc("\t定义:editor:{path:'ueditor.config.js;ueditor.all.min.js;lang/zh-cn/zh-cn.js;../Scripts/module/part/texteditor.js',params:['',{data:{debug:true,image:'../../Scripts/ref/images/'}}]}");
            //_.addDesc('\tinit  新加的控件(icon:图标地址，tooltip:图标显示名称，command:要执行的函数)');
        }
        _.onLoad = function (node) {			
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'click':
					case 'onchange':
						break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
				__.id=node.attr('id');console.log('测试ID'+__.id);
				UE.Editor.prototype._bkGetActionUrl = UE.Editor.prototype.getActionUrl;
				UE.Editor.prototype.getActionUrl = function(action) {
					return _.vm.data[action];
				};
				UE.registerUI('input', function(editor, uiName) {	//注册按钮执行时的command命令，使用命令默认就会带有回退操作
					editor.registerCommand(uiName, {
						execCommand: function() {
							editor.execCommand('inserthtml', V.format("<img src='dialogs/input/input.png' id='{id}' _type='text' _data='{data}'/>",{id:V.random(),data:"{length:10}"}));
						}
					});
					//创建一个button
					var btn = new UE.ui.Button({
						//按钮的名字
						name: uiName,
						//提示
						title: '新建输入框',
						//添加额外样式，指定icon图标，这里默认使用一个重复的icon
						cssRules: 'background-position: -500px 0;',
						//点击时执行的命令
						onclick: function() {
							//这里可以不用执行命令,做你自己的操作也可
							editor.execCommand(uiName);
						}
					});
					//当点到编辑内容上时，按钮要做的状态反射
					editor.addListener('selectionchange', function() {
						var state = editor.queryCommandState(uiName);
						if (state == -1) {
							btn.setDisabled(true);
							btn.setChecked(false);
						} else {
							btn.setDisabled(false);
							btn.setChecked(state);
						}
					});
					//因为你是添加button,所以需要返回这个button
					return btn;
				});
				__.onLoad(node);
			});
        };
		_.dispose = function(){
			if(_.editor){
				_.editor.destroy();
				_.node.hide();
			}
			__.dispose();
		};
        _.transform = function (data) {
            var ret = V.merge({ toolbar: [], serverUrl:'',lang:data.language,theme:data.icon}, data);
            V.forC(data.toolbars, function (k, v) {
                switch (k.toLowerCase()) {
					case 'fullscreen':
					case 'source':
                        if (v) {
                            ret.toolbar[0] = ret.toolbar[0] ? ret.toolbar[0] : [];
                            ret.toolbar[0].push(k);
                        }
						break;
                    case 'cut':
                    case 'copy':
                    case 'paste':
                        break;
                    case 'undo':
                    case 'redo':
                        if (v) {
                            ret.toolbar[1] = ret.toolbar[1] ? ret.toolbar[1] : [];
                            ret.toolbar[1].push(k);
                        }
                        break;
                    case 'bold':
                    case 'italic':
                    case 'underline':
                    case 'fontborder':
					case 'fontfamily':
					case 'forecolor':
					case 'backcolor':
					case 'fontsize':
					case 'lineheight':
                    case 'touppercase':
                    case 'tolowercase':
                        if (v) {
                            ret.toolbar[2] = ret.toolbar[2] ? ret.toolbar[2] : [];
                            ret.toolbar[2].push(k);
                        }
                        break;
                    case 'strike':
                    case 'sup':
                    case 'sub':
                        if (v) {
                            ret.toolbar[2] = ret.toolbar[2] ? ret.toolbar[2] : [];
                            ret.toolbar[2].push(k+k=='strike'?'through':'script');
                        }
                        break;
                    case 'link':
                    case 'unlink':
					case 'anchor':
					case 'imagenone':
					case 'imageleft':
					case 'imageright':
					case 'imagecenter':
                    case 'image':
					case 'emotion':
					case 'scrawl':
					case 'insertvideo':
					case 'music':
					case 'attachment':
					case 'map':
					case 'gmap':
					case 'insertframe':
					case 'insertcode':
					case 'webapp':
					case 'pagebreak':
					case 'template':
					case 'date':
					case 'time':
					case 'snapascreen':
					case 'wordimage':
					case 'snapscreen':
					case 'spechars':
                        if (v) {
                            ret.toolbar[3] = ret.toolbar[3] ? ret.toolbar[3] : [];
                            ret.toolbar[3].push(k=='image'?'insertimage':k);
                        }
                        break;
                    case 'justify':
                    case 'left':
					case 'center': 
					case 'right':
                        if (v) {
                            ret.toolbar[4] = ret.toolbar[4] ? ret.toolbar[4] : [];
                            ret.toolbar[4].push('justify'+k);
                        }
                        break;
                    case 'paragraph':
					case 'insertorderedlist':
					case 'insertunorderedlist':
					case 'rowspacingtop':
					case 'rowspacingbottom':
					case 'customstyle':
					case 'directionalityltr':
					case 'directionalityrtl':
					case 'indent':
                        if (v) {
                            ret.toolbar[4] = ret.toolbar[4] ? ret.toolbar[4] : [];
                            ret.toolbar[4].push(k);
                        }
						break;
                    case 'removeformat':
                    case 'formatmatch':
                    case 'autotypeset':
					case 'blockquote':
					case 'pasteplain':
                    case 'hr':
					case 'background':
					case 'selectall':
					case 'cleardoc':
                        if (v) {
                            ret.toolbar[5] = ret.toolbar[5] ? ret.toolbar[5] : [];
                            ret.toolbar[5].push(k=='hr'?'horizontal':k);
                        }
                        break;					
                    case 'inserttable':
                    case 'deletetable':
                    case 'insertparagraphbeforetable':
					case 'insertrow':
					case 'deleterow':
                    case 'insertcol':
					case 'deletecol':
					case 'mergecells':
					case 'mergeright':
                    case 'mergedown':
					case 'splittocells':
					case 'splittorows':
					case 'splittocols':
                    case 'charts':				
                        if (v) {
                            ret.toolbar[6] = ret.toolbar[6] ? ret.toolbar[6] : [];
                            ret.toolbar[6].push(k);
                        }
						break;
					case 'commands':
					    if(V.isArray(v)){
							ret.toolbar[6] = ret.toolbar[6] ? ret.toolbar[6] : [];
							for(var i=0;i<v.length;i++){
								if(v[i]&&v[i].icon){
									 ret.toolbar[6].push(v[i]);
								}
							}
						}
						break;
					case 'print':
					case 'preview':
					case 'searchreplace':
                    case 'drafts':
                    case 'help':
                        if (v) {
                            ret.toolbar[7] = ret.toolbar[7] ? ret.toolbar[7] : [];
                            ret.toolbar[7].push(k);
                        }
						break;					
					default:
						console.log(k);
						break;
                }
            }, function () {
                var tools = ret.toolbar, toolbars = [];
                ret.toolbars = [];
                delete ret.toolbar;
                for (var i = 0; i < tools.length; i++) {
                    if (tools[i] && tools[i].length > 0) {
                        toolbars.push("|");
                        toolbars = toolbars.concat(tools[i]);
                    }
                    if ((i + 1) % 16 == 0 || i == tools.length - 1) {
                        toolbars.push("|");
                        ret.toolbars.push(toolbars);
                        toolbars = [];
                    }
                }
            }, true);
			console.log(ret);
            return ret;
        };
        _.fill = function () {return { value: _.editor ? V.encHtml(_.editor.getContent().replace(/</g, '&lt;').replace(/>/g, '&gt;')) : "", html: _.editor ? _.editor.getContent(): "" } };
        _.render = function (data) {			
			data = __.render(data);
            var ret = V.merge({}, data);//处理空数据
			var func = function(ret){
				V.forC(ret, function (k, v) {
					switch (k.toLowerCase()) {
						case 'visible':	
							if(v)
							_.editor.setShow();
							else							
							_.editor.setHide();
							break;
						case 'enable':
							if(v)
							_.editor.setEnabled();
							else							
							_.editor.setDisabled('fullscreen');
							break;
						case 'height':					
							_.editor.setHeight(v);
							break;
						case 'value':
							var val = V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;');
							_.editor.setContent(val);
							break;
						case 'addvalue':		
							var val = V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;');	
							_.editor.setContent(val,true);
							break;
					}
				}, function () {
					delete data.value;
					//data = __.render(data);
				});
			};
			V.forC(ret, function (k, v) {
				switch (k.toLowerCase()) {
					case 'width':
						_.node.width(v);
						break;						
				}
			},function(){
				var render = _.editor ? false : true;
				if(render){
					editor = UE.getEditor(__.id,_.transform(ret));
					editor.ready(function(){
						_.editor = editor;
						{
							//添加对应对话框 需要在all.min.js中添加对象
							//editor.options.iframeUrlMap["inputtext"]='~/dialog/input/inputtext.htm';						
							var dialog = new baidu.editor.ui.Dialog({
								iframeUrl:editor.ui.mapUrl('~/dialogs/input/inputtext.htm'),
								editor:editor,
								className:'edui-for-snapscreen',
								title:'text',
								buttons:[
									{
										className:'edui-okbutton',
										label:editor.getLang("ok"),
										editor:editor,
										onclick:function () {
											dialog.close(true);
										}
									},
									{
										className:'edui-cancelbutton',
										label:editor.getLang("cancel"),
										editor:editor,
										onclick:function () {
											dialog.close(false);
										}
									}
								]

							});
							editor.ui._dialogs["inputtext"] = dialog;
							editor.ui._dialogs["inputtext"].render();
						}
						func(ret);
					});
				} else func(ret);
			},true);
			
			return data;
        }
    });
})(VJ, VJ.view, jQuery);