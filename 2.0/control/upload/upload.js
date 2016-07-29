(function (V, W, $) {
    //http://www.gouguoyin.cn/demo/uploadview/index.html opcity:0
    var _zindex = 999;
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || '<div></div>', vm || {
                data: { url: '', filter: '', uid: '_' + V.random(), dataType: 'text', secureuri: false, visible: true, enable: true }
            }]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            __.fill = _.fill;
            _zindex = _zindex ? (_zindex + 1) : 999;
        }
        _.fill = function () { return {}; };
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'success':
                    case 'error':
                    case 'loading':
                    case 'loadend':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
        };
        //filevalidate 参数｛｝，对上传的附件做哪些限制,size:大小（M），types:[] （文件类型,[".png"])
        _.jsValide = function (targett) {
            var error = '', target = targett.files ? targett : targett.target;
            if (_.vm.data.filevalidate) {
                var filePath = target.value;
                if (_.vm.data.filevalidate.types) {
                    if (filePath) {
                        var isnext = false;
                        var fileend = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
                        _.vm.data.file = filePath;
                        _.vm.data.fileend = fileend;
                        if (_.vm.data.filevalidate.types.length > 0) {
                            for (var i = 0; i < _.vm.data.filevalidate.types.length; i++) {
                                if (_.vm.data.filevalidate.types[i].toLowerCase() == fileend) {
                                    isnext = true;
                                    break;
                                }
                            }
                        }
                        if (!isnext) {
                            error = "不接受此文件类型！";
                            //target.value = "";
                            return error;
                        }
                    } else {
                        error = "请上传附件！";
                        //target.value = "";
                        return error;
                    }
                }

                if (_.vm.data.filevalidate.size) {
                    var fileSize = 0, filemaxsize = 1024 * _.vm.data.filevalidate.size; //2M 
                    var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
                    try {
                        if (isIE && !target.files) {
                            var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
                            if (!fileSystem.FileExists(filePath)) {
                                error = "上传附件不存在，请重新输入！";
                                return error;
                            }
                            var file = fileSystem.GetFile(filePath);
                            fileSize = file.Size;
                        } else {
                            fileSize = target.files[0].size;
                        }

                        var size = fileSize / 1024;
                        if (size > filemaxsize) {
                            error = "上传附件大小不能大于" + filemaxsize / 1024 + "M！";
                            //target.value = "";
                            return error;
                        }
                        if (size <= 0) {
                            error = "上传附件大小不能为0M！";
                            //target.value = "";
                            return error;
                        }
                    } catch (e) {
                        console.log(e);
                        return error;
                    }
                }
            }
            return error;
        }
        _.render = function (data) {
            data = __.render(data);
            var click = false;
            var callback = function (e) {
                var error = _.jsValide(e);
                if (error.length > 0) {
                    _.call('error', { value: error });
                    bindinput();
                    return;
                }
                _.call('loading', { load: 1, length: 1 });
                $.ajaxFileUpload({
                    url: _.vm.data.url, //需要链接到服务器地址 
                    secureuri: _.vm.data.secureuri,
                    fileElementId: _.vm.data.uid, //文件选择框的id属性 
                    dataType: 'text', //服务器返回的格式，可以是json、xml 
                    success: function (data, status) {
                        data = data.substring(data.indexOf('>') + 1, data.lastIndexOf('<'));
                        data = eval('(' + data + ')');
                        _.call('loadend', {});
                        _.call(data.state ? 'success' : 'error', { value: data.value, values: data });
                        bindinput();
                    },
                    error: function (s, data, status, e) {
                        _.call('loadend', {});
                        //相当于java中catch语句块的用法 
                        _.call('error', { value: '服务器错误!' + data });
                        bindinput();
                    },
                    xhr: function () {
                        // 获取JQuery内部使用的XMLHttpRequest对象
                        var xhr = $.ajaxSettings.xhr();

                        // 上传进度监控
                        if (xhr.upload)
                            xhr.upload.addEventListener('progress', function (e) {
                                if (e.lengthComputable) {
                                    var percentComplete = e.loaded / e.total;
                                    _.call('loading', { load: e.loaded, length: e.total, percent: percentComplete });
                                } else {
                                    // 不能计算进度
                                }
                            }, false);
                        else // 下载进度监控
                            xhr.addEventListener('progress', function (e) {
                                if (e.lengthComputable) {
                                    var percentComplete = e.loaded / e.total;
                                    _.call('loading', { load: e.loaded, length: e.total, percent: percentComplete });
                                } else {
                                    // 不能计算进度
                                }
                            }, false);
                        return xhr;//一定要返回，不然jQ没有XHR对象用了
                    }
                });
            };
            var bindinput = function () {
                click = false;
                var text = '<input type="file" name="upload" id="' + _.vm.data.uid + '" accept="' + _.vm.data.filter + '" style="z-index: ' + _zindex + ';cursor:pointer;" />'
                if (_.input) {
                    _.input.after(text).remove();
                }
                else
                    _.node.append('<div style="z-index: ' + _zindex + ';opacity:0;-ms-filter:\'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\';filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=0);padding: 0px;">' + text + '</div>')
                _.input = _.node.find('input[type=file]');
                var firstChild = _.node.children(':not(input)').css('position', 'absolute');
                var width = firstChild.width();
                var height = firstChild.height();
                _.input.click(function (e) {
                    if (click || !V.isValid(_.vm.data.url)) { V.stopProp(e); return false; };
                    if (!_.vm.data.enable) {
                        V.stopProp(e);
                        _.call('error', { value: '控件不可用!' });
                        return false;
                    }
                    var target = e.files ? e : e.target;
                    if (target.value != "") click = true;
                }).change(callback).width(width).height(height);
            };
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'url':
                        bindinput();
                        break;
                    case 'enable':
                        if (v) { _.input.removeAttr('disabled'); } else { _.input.attr('disabled', 'disabled'); }
                        break;
                    default:
                        break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);