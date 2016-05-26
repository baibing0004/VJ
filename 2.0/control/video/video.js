(function (V, W, $) {
    V.registScript(function (middler, path, vm) {
        var _ = this, __ = {};
        {
            __.id = 'video_' + V.random();
            V.inherit.apply(_, [W.Control, [path || ' <div class="video_box" style="width:20000px;height:20000px;"><video id="' + __.id + '" class="video-js vjs-default-skin" autobuffer="autobuffer" preload="auto" oncontextmenu="return false" style="width:100%;height:auto;"></video></div>', vm || { data: { controls: false, inaction: 'fadeIn', outaction: 'fadeOut'}}]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('video 初级');
            _.addDesc('属性:');
            _.addDesc('\twidth:移动方向 fadeInLeft');
            _.addDesc('\theight:移动方向 fadeOutRight');
            _.addDesc('\tcontrol:是否出现控制条');
            _.addDesc('\tposter:预览图片');
            _.addDesc('\tsrc：播放地址');
            _.addDesc('\tplay：true/false 播放/暂停');
            _.addDesc('\tinaction：fadeIn');
            _.addDesc('\toutaction：fadeOut');
            _.addDesc('事件:');
            _.addDesc('\tonEnded:视频播放完成');
            _.addDesc('引用:');
            _.addDesc("\tvideo:{ path: '../../Scripts/ref/video.min.js;../../Scripts/ref/video-js.css;../../Style/module/part/video.css;../../Scripts/module/part/video.js', params: [{ middler: true }] }");

        }
        _.onLoad = function (node) {
            if (!videojs) { return; }
            videojs.options.flash.swf = "video-js.swf";
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'click':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                V.once(function () {
                    __.play = videojs(__.id);
                    _.player = _.node.find('video:first');
                    __.play.on("ended", function () {
                        _.call('ended');
                    });
                    __.onLoad(node)
                }, 1);
            });
        };
        _.change = function (first) {
            if (!first) {
                _.render({ hide: _.vm.data.outaction });
            }
            var data = _.vm.data.values[__.curIndex];
            V.once(function () {
                var ret = { src: data.src, poster: data.poster, play: true };
                if (!first) ret.show = _.vm.data.inaction;
                _.render(ret);
            }, first ? 1 : 600);
        }
        _.render = function (data) {
            if (__.play)
                V.forC(data, function (k, v) {
                    switch (k.toLowerCase()) {
                        case 'width':
                            __.play.width(v);
                            _.node.css({ width: v });
                            break;
                        case 'height':
                            __.play.height(v);
                            _.node.css({ height: v });
                            break;
                        case 'controls':
                            __.play.controls(v);
                            break;
                        case 'poster':
                            //__.play.poster(v);
                            if (_.player.length > 0)
                                _.player.attr('poster', v);
                            break;
                        case 'src':
                        case 'value':
                            __.play.src(v);
                            //__.play.play();
                            break;
                        case 'play':
                            if (v) {
                                if (data.values) { }
                                else
                                    __.play.play();
                            } else {
                                __.play.pause();
                            }
                            break;
                        case 'values':
                            if (v && v.length > 0) {
                                __.curIndex = 0;
                                __.count = v.length;
                                if (data.play) _.change(true);
                            }
                            break;
                        case 'prev':
                            if (v) {
                                __.curIndex = (__.curIndex + __.count - 1) % __.count;
                                _.change(false);
                            }
                            break;
                        case 'next':
                            if (v) {
                                __.curIndex = (__.curIndex + 1) % __.count;
                                _.change(false);
                            }
                            break;
                    }
                }, function () {
                    data = __.render(data);
                });
        }
    });
})(VJ, VJ.view, jQuery);