(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {

            V.inherit.apply(_, [W.Control, [path || "<div><canvas></canvas></div>", vm || { data: { direction: 'left' } }]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            __.step = 3;
            __.direction = true;
            _.addDesc('360 view');
            _.addDesc('属性:');
            _.addDesc('\tdirection:移动方向 left');
            _.addDesc('\tvalues:["",""]图片地址数组越多越好');
            _.addDesc('\tplay:true/false 播放或者停止');
            _.addDesc('\tstep:每秒帧数');
            _.addDesc("定义:");
            _.addDesc("\tv360: { path: '../../Scripts/module/home/360view.js;' }");
        }
        _.onLoad = function (node) {
            _.canvas = node.find('canvas:first')[0];
            __.ctx = _.canvas.getContext("2d");
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
                    case 'end':
                    case 'click':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                _.canvas.width = node.width();
                _.canvas.height = node.height();
                _.canvas.addEventListener("mousedown", _.doMouseDown, false);
                _.canvas.addEventListener('mousemove', _.doMouseMove, false);
                _.canvas.addEventListener('mouseup', _.doMouseUp, false);
                __.onLoad(node);
                __.started = false;
                __.startedX = -1;
                {
                    var lastTime = 0;
                    var vendors = ['ms', 'moz', 'webkit', 'o'];
                    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
                    }
                    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = window.setTimeout(function () {
                            callback(currTime + timeToCall);
                        }, timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };
                    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
                        clearTimeout(id);
                    };
                }
            });
        };
        _.getPointOnCanvas = function (can, x, y) {
            var bbox = can.getBoundingClientRect();
            return {
                x: x - bbox.left * (can.width / bbox.width),
                y: y - bbox.top * (can.height / bbox.height)
            };
        };
        _.doMouseDown = function (e) {
            var x = e.pageX;
            var y = e.pageY;
            var canvas = e.target;
            var loc = _.getPointOnCanvas(canvas, x, y);
            //console.log("mouse down at point( x:" + loc.x + ", y:" + loc.y + ")");
            __.startedX = loc.x;
            __.startFrame = __.frame;
            __.started = true;
            __.isPlay = __.play;
            _.stop();
        };
        _.doMouseUp = function (e) {
            if (__.started) {
                _.doMouseMove(e);
                __.startedX = -1;
                __.startFrame = 0;
                __.started = false;
                if (__.isPlay) _.start();
            }
        };
        _.doMouseMove = function (e) {
            var x = e.pageX;
            var y = e.pageY;
            var canvas = e.target;
            var loc = _.getPointOnCanvas(canvas, x, y);
            if (__.started) {
                var step = canvas.width / __.images.length;
                var frame = (__.startFrame + Math.floor((loc.x - __.startedX) / step)) % __.images.length;
                frame = Math.min(__.images.length - 1, Math.max(0, frame > 0 ? frame : __.images.length + frame));
                _.redraw(frame);
            }
        };
        _.redraw = function (frame) {
            if (frame == __.frame) return;
            __.frame = frame;
            var imageObj = __.images[__.frame];
            __.ctx.clearRect(0, 0, _.canvas.width, _.canvas.height);
            __.ctx.drawImage(imageObj, 0, 0, _.canvas.width, _.canvas.height);
        };
        _.start = function () {
            __.play = true;
            _.go();
        };
        _.stop = function () {
            __.play = false;
        };
        var step = 0;
        _.go = function () {
            if (__.play) {
                if (step == 0) {
                    var frame = ((__.frame + (__.direction ? 1 : -1)) % __.images.length);
                    frame = Math.min(__.images.length - 1, Math.max(0, frame >= 0 ? frame : __.images.length + frame));
                    _.redraw(frame);
                }
                step = (step + 1) % __.step;
                //console.log(step);
                window.requestAnimationFrame(_.go);
            }
        };
        _.render = function (data) {
            data = __.render(data);
            var rebuild = false;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'width':
                        _.node.width(v);
                        _.canvas.width = v;
                        break;
                    case 'height':
                        _.node.height(v);
                        _.canvas.height = v;
                        break;
                    case 'values':
                        __.images = Array();
                        __.frame = -1;
                        V.each(v, function (v2) {
                            var img = new Image();
                            if (__.images.length == 0) {
                                img.onload = function () {
                                    console.log('ol');
                                    _.redraw(0);
                                };
                            } img.src = v2; __.images.push(img);
                        }, function () { if (data.play) { V.once(_.start, 400); } });
                        break;
                    case 'play':
                        if (data.values) { } else {
                            if (v)
                                _.start();
                            else
                                _.stop();
                        }
                        break;
                    case 'direction':
                        if ('left' == v.toLowerCase())
                            __.direction = true;
                        else
                            if ('right' == v.toLowerCase())
                                __.direction = false;
                        break;
                    case 'step':
                        __.step = Math.ceil(60 / v);
                        break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);