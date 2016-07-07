(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<textarea></textarea>', V.merge({
                data: {
                    toolbars: {
                        cut: true, copy: true, paste: true, undo: true, redo: true, bold: true, italic: true, underline: true, strike: true, sup: true, sub: true, link: true, unlink: true, image: true, justify: true, left: true, center: true, right: true, removeformat: true, hr: true, paragraph: true
                    },
                    width: '100%',
                    height: '300',
                    language: 'zh-cn',
                    icon: 'default',
                    value: '',
                    image: './images/'
                    /*
                    about: false
                    [
                    ["separator", "cut", "copy", "paste", "separator", "undo", "redo", "separator", "bold", "italic", "underline", "strike", "sup", "sub", "separator", "link", "unlink", "image"],
                    ["separator", "justify", "left", "center", "right", "separator", "removeformat", "striptags", "hr", "paragraph"]
                    ],icon:'default',skin:''*/
                }
            }, vm)]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('texteditor 对象');
            _.addDesc('非必填属性:');
            _.addDesc('\twidth 类型300px,100%');
            _.addDesc('\theight 类型300px,不支持百分比');
            _.addDesc('\ttoolbars cut:true,copy:true,paste:true,undo:true,redo:true,bold:true,italic:true,underline:true,strike:true,sup:true,sub:true,link:true,unlink:true,image:true,justify:true,left:true,center:true,right:true,removeformat:true,hr:true,paragraph:true');
            _.addDesc('\tlanguage  语言 类型 en zh-cn');
            _.addDesc('\tvalue  内容会被V.decHtml 同时获取的内容会被自动encHtml 另更新value时请至少等待100ms以防止渲染出现问题');
            _.addDesc("\t定义:editor:{path:'xhtml.js;htmlbox.js;../Scripts/module/part/texteditor.js',params:['',{data:{debug:true,image:'../../Scripts/ref/images/'}}]}");
            //_.addDesc('\tinit  控件初始化生成texteditor');
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
            }, function () { __.onLoad(node) });
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
            var ret = V.merge({ value: '' }, data);//处理空数据
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
                        if (_.editor) {
                            V.once(function () {
                                _.node.set_text(V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;'));
                            }, 100);
                        } else render = true;
                        break;
                }
            }, function () {
                if (render && !_.editor) {
                    _.editor = true;
                    ret = _.transform(ret);
                    _.node.htmlbox(ret);
                    if (data.value) {
                        _.node.set_text(V.decHtml(v).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<script/g, '&lt;script').replace(/script>/g, 'script&gt;'));
                    }
                }
                delete data.value;
                data = __.render(data);
            }, true);
        }
    });
})(VJ, VJ.view, jQuery);