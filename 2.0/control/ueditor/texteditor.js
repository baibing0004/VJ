(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<script type="text/plain"></script>', V.merge({
                data: {
                    toolbars: {
						'fullscreen':false, 'source':false, 'undo':true, 'redo':true,
						'bold':true, 'italic':true, 'underline':true, 'fontborder':true, 'strike':true, 'sup':true, 'sub':true, 'removeformat':true, 'formatmatch':true, 'autotypeset':true, 'blockquote':true, 'pasteplain':true,'forecolor':true, 'backcolor':true,
						'insertorderedlist':true, 'insertunorderedlist':true, 'selectall':false, 'cleardoc':false,'rowspacingtop':true, 'rowspacingbottom':true, 'lineheight':true, 
						'customstyle':true, 'paragraph':true, 'fontfamily':true, 'fontsize':true, 
						'directionalityltr':false, 'directionalityrtl':false, 'indent':true, 
						'left':true, 'center':true, 'right':true, 'justify':true,  'touppercase':true, 'tolowercase':true, 
						'link':true, 'unlink':true, 'anchor':true,  'imagenone':true, 'imageleft':true, 'imageright':true, 'imagecenter':true, 
						'simpleupload':false, 'image':true, 'emotion':false, 'scrawl':false, 'insertvideo':false, 'music':false, 'attachment':true, 'map':false, 'gmap':false, 'insertframe':false, 'insertcode':false, 'webapp':false, 'pagebreak':false, 'template':false, 'background':true, 
						'hr':true, 'date':false, 'time':false, 'spechars':true, 'snapscreen':true, 'wordimage':true, 
						'inserttable':true, 'deletetable':true, 'insertparagraphbeforetable':true, 'insertrow':true, 'deleterow':true, 'insertcol':true, 'deletecol':true, 'mergecells':true, 'mergeright':true, 'mergedown':true, 'splittocells':true, 'splittorows':true, 'splittocols':true, 'charts':true, 
						'print':true, 'preview':true, 'searchreplace':true, 'drafts':true, 'help':false
                    },
                    width: '100%',
                    height: '300',
                    language: 'zh-cn',//lang 
                    icon: 'default',//theme
                    value: '',
                    image: './images/'
                }
            }, vm)]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
			__.dispose = _.dispose;
            _.addDesc('texteditor 对象');
            _.addDesc('非必填属性:');
            _.addDesc('\twidth 类型300px,100%');
            _.addDesc('\theight 类型300px,不支持百分比');
            _.addDesc("\ttoolbars'fullscreen':false,'source':false,'undo':true,'redo':true,'bold':true,'italic':true,'underline':true,'fontborder':true,'strike':true,'sup':true,'sub':true,'removeformat':true,'formatmatch':true,'autotypeset':true,'blockquote':true,'pasteplain':true,'forecolor':true,'backcolor':true,'insertorderedlist':true,'insertunorderedlist':true,'selectall':false,'cleardoc':false,'rowspacingtop':true,'rowspacingbottom':true,'lineheight':true,'customstyle':true,'paragraph':true,'fontfamily':true,'fontsize':true,'directionalityltr':false,'directionalityrtl':false,'indent':true,'left':true,'center':true,'right':true,'justify':true,'touppercase':true,'tolowercase':true,'link':true,'unlink':true,'anchor':true,'imagenone':true,'imageleft':true,'imageright':true,'imagecenter':true,'simpleupload':false,'image':true,'emotion':false,'scrawl':false,'insertvideo':false,'music':false,'attachment':true,'map':false,'gmap':false,'insertframe':false,'insertcode':false,'webapp':false,'pagebreak':false,'template':false,'background':true,'hr':true,'date':false,'time':false,'spechars':true,'snapscreen':true,'wordimage':true,'inserttable':true,'deletetable':true,'insertparagraphbeforetable':true,'insertrow':true,'deleterow':true,'insertcol':true,'deletecol':true,'mergecells':true,'mergeright':true,'mergedown':true,'splittocells':true,'splittorows':true,'splittocols':true,'charts':true,'print':true,'preview':true,'searchreplace':true,'drafts':true,'help':false,commands:[{icon:"new.gif",tooltip:"添加新控件",command:function(){initControl();}}]");
			_.addDesc('\t说明  commands表示要添加新的icon控件，支持N个,{新加的控件(icon:图标地址，tooltip:图标显示名称，command:要执行的函数)}');
            _.addDesc('\tlanguage  语言 类型 en zh-cn');
            _.addDesc('\tvalue  内容会被V.decHtml 同时获取的内容会被自动encHtml 另更新value时请至少等待100ms以防止渲染出现问题');
            _.addDesc("\t定义:editor:{path:'ueditor.config.js;ueditor.all.min.js;lang/zh-cn/zh-cn.js;../Scripts/module/part/texteditor.js',params:['',{data:{debug:true,image:'../../Scripts/ref/images/'}}]}");
            //_.addDesc('\tinit  新加的控件(icon:图标地址，tooltip:图标显示名称，command:要执行的函数)');
			/*
			UE.Editor.prototype._bkGetActionUrl = UE.Editor.prototype.getActionUrl;
			UE.Editor.prototype.getActionUrl = function(action) {
				if (action == 'uploadimage' || action == 'uploadscrawl' || action == 'uploadimage') {
					return 'http://a.b.com/upload.php';
				} else if (action == 'uploadvideo') {
					return 'http://a.b.com/video.php';
				} else {
					return this._bkGetActionUrl.call(this, action);
				}
			}
			action类型以及说明
			uploadimage：//执行上传图片或截图的action名称
			uploadscrawl：//执行上传涂鸦的action名称
			uploadvideo：//执行上传视频的action名称
			uploadfile：//controller里,执行上传视频的action名称
			catchimage：//执行抓取远程图片的action名称
			listimage：//执行列出图片的action名称
			listfile：//执行列出文件的action名称
			*/
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
            }, function () {__.id=node.attr('id');console.log('测试ID'+__.id); __.onLoad(node) });
        };
		_.dispose = function(){
			if(_.editor){
				_.editor.destroy();
				_.node.hide();
			}
			__.dispose();
		};
        _.transform = function (data) {
            var ret = V.merge({ about: false, toolbar: [], idir: data.image }, data);
            V.forC(data.toolbars, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'cut':
                    case 'copy':
                    case 'paste':
                        if (v) {
                            ret.toolbar[0] = ret.toolbar[0] ? ret.toolbar[0] : [];
                            ret.toolbar[0].push(k);
                        }
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
                    case 'strike':
                    case 'sup':
                    case 'sub':
                        if (v) {
                            ret.toolbar[2] = ret.toolbar[2] ? ret.toolbar[2] : [];
                            ret.toolbar[2].push(k);
                        }
                        break;
                    case 'link':
                    case 'unlink':
                    case 'image':
                        if (v) {
                            ret.toolbar[3] = ret.toolbar[3] ? ret.toolbar[3] : [];
                            ret.toolbar[3].push(k);
                        }
                        break;
                    case 'justify':
                    case 'left': case 'center': case 'right':
                        if (v) {
                            ret.toolbar[4] = ret.toolbar[4] ? ret.toolbar[4] : [];
                            ret.toolbar[4].push(k);
                        }
                        break;
                    case 'removeformat':
                    case 'striptags':
                    case 'hr':
                    case 'paragraph':
                        if (v) {
                            ret.toolbar[5] = ret.toolbar[5] ? ret.toolbar[5] : [];
                            ret.toolbar[5].push(k);
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
                    default:
                        if (v) {
                            ret.toolbar[6] = ret.toolbar[6] ? ret.toolbar[6] : [];
                            ret.toolbar[6].push(k);
                        }
                        break;
                }
            }, function () {
                var tools = ret.toolbar, toolbars = [];
                ret.toolbars = [];
                delete ret.toolbar;
                for (var i = 0; i < tools.length; i++) {
                    if (tools[i] && tools[i].length > 0) {
                        toolbars.push("separator");
                        toolbars = toolbars.concat(tools[i]);
                    }
                    if ((i + 1) % 6 == 0 || i == tools.length - 1) {
                        toolbars.push("separator");
                        ret.toolbars.push(toolbars);
                        toolbars = [];
                    }
                }
            }, true);
            return ret;
        };
        _.fill = function () { return { value: _.node.get_html ? V.encHtml(_.node.get_html().replace(/</g, '&lt;').replace(/>/g, '&gt;')) : "", html: _.node.get_html ? _.node.get_html() : "" } };
        _.render = function (data) {
			console.log(data);
			//data = __.render(data);
            var ret = V.merge({}, data);//处理空数据
            var render = _.editor ? false : true;
            V.forC(ret, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'width':
                        _.node.css('width', v);
                        break;
                    case 'height':
                        _.node.css('height', v);
                        break;
                    case 'language':
                    case 'images':
                        render = true;
                        break;
                    case 'value':
					console.log('value'+v);
                        if (_.editor) {
                            V.once(function () {
                                _.node.set_text(V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;'));_.call('changed');
                            }, 100);
                        } else render = true;
                        break;
					case 'addvalue':
						console.log(v);
					   if(_.editor) {V.once(function(){_.node.insert_text(V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;'));_.call('changed');},100);};
					    break;
                }
            }, function () {
                if (render && !_.editor) {
                    _.editor = true;
                    ret = _.transform(ret);
                    _.node.htmlbox(ret);
                    if (data.value) {
                        _.node.set_text(V.decHtml(data.value).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;'));
                    }
                }
                delete data.value;
                data = __.render(data);
            }, true);
        }
    });
})(VJ, VJ.view, jQuery);