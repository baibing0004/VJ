(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
			//简历一个基础的scene对象，允许用户定义3DObject对象，及其属性 scale rotate location属性，允许3DObject对象执行move等等操作，提供动画事件与mousemove，mouseover事件
            V.inherit.apply(_, [W.Control, [path || "<div></div>", vm || {
				data: {
					scene: {},
					lights: [{ type: 'Directional', position: { x: 0, y: 0, z: 0 }, color: { rgb: 0xFFFFFF, opacity: 1.0 } }],
					camera: { type: 'Perspective', angle: 60, near: 1, far: 10000, position: { x: 0, y: 0, z: 0 }, look: { x: 0, y: 0, z: 0 }, up: 'z' },
					render: { type: 'WebGL', antialias: true, precision: 2, hasShadow: true, background: { rgb: 0xFFFFFF, opacity: 1.0 } },
				}
			}]]);
			_.is3D = true;
            __.onLoad = _.onLoad;
            __.render = _.render;
			__.addControl = _.addControl;
			__.removeControl = _.removeControl;
			__.clearControl = _.clearControl;
            _.addDesc('three 3D基础控件');
            _.addDesc('属性:');
            _.addDesc('\tlights 对象数组[{type:"Directional"平行光源，position:方向}]');
            _.addDesc('\tcamera 镜头type Perspective angle视锥角度,near近处和far远处的阀值设置 当比例超出阀值设置时不可显示,position:{x,y,z}方位，look:{x,y,z}朝向的方向,up:{x,y,z}设定镜头的正向方向');
            _.addDesc('\tscene 场景 应规定场景的基本属性');
            _.addDesc('\trender 生成器type WebGL 生成器的基本属性 antialias:是否抗锯齿,precision:0低精度，1中精度，2高精度，hasShadow:是否允许阴影,background:{rgb:0xFFFFFF,opacity:1.0}背景颜色');
            _.addDesc('\tplay:true/false 播放或者停止');
            _.addDesc('\tstep:每秒帧数');
            _.addDesc("定义:");
            _.addDesc("\tthreemovie: { path: '../../Scripts/ref/three.js;../../Scripts/module/part/tc.js;' }");
        }
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
                    case 'end':
                    case 'click':
                        break;
					case 'mousedown':
						node.addEventListener("mousedown", function (e) { __.doMouse(e, 'mousedown'); }, false);
						break;
					case 'mouseup':
						node.addEventListener("mouseup", function (e) { __.doMouse(e, 'mouseup'); }, false);
						break
					case 'mousemove':
						node.addEventListener("mousemove", function (e) { __.doMouse(e, 'mousemove'); }, false);
						break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
				THREE = THREE | false;
				if (!THREE) {
					V.showException('没有加载到THREE.js');
					return;
				} else if (window.WebGLRenderingContext ? false : true) {
					V.showException('当前浏览器' + V.userAgent.name + '不支持WebGL');
					return;
				}
				_.scene = new THREE.Scene();
                {
					//动画方法适配
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
				__.onLoad(node);
            });
        };
        __.getPointOnCanvas = function (can, x, y) {
            var bbox = can.getBoundingClientRect();
            return {
                x: x - bbox.left * (can.width / bbox.width),
                y: y - bbox.top * (can.height / bbox.height)
            };
        };
        __.doMouse = function (e, name) {
            var x = e.pageX;
            var y = e.pageY;
            var canvas = e.target;
            var loc = __.getPointOnCanvas(canvas, x, y);
            _.call(name, { e: e, location: loc });
        };
		_.add3DObject = function (obj) {
			if (_.scene.fog) {
				obj.fog = _.scene.fog;
			}
			if(__.renderer && __.renderer.shadowMapEnabled){
				obj.castShadow = true;
				obj.receiveShadow = true;	
			}
			_.scene.add(obj);		
		};
		_.redraw = function () {
			if (_.renderer && _.scene && _.camera)
				_.renderer.render(_.scene, _.camera);
		};
        _.render = function (data) {
            var rebuild = false;
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
					case 'fog':
						if (v) _.scene.fog = new THREE.Fog(0xffffff, 0.015, 100);
						break;
                    case 'size':
                        _.node.width(v.width);
						_.node.height(v.height);
						if (__.renderer) __.renderer.reSize(v.width, v.height);
                        break;
					case 'play':
						if (v && typeof (v) == 'function') {
							var isStop = false;
							var id = '';
							var func = v;
							var go = function () {
								isStop = V.getValue(func.apply(this, []), false);
								if (!isStop) {
									id = window.requestAnimationFrame(go);
								} else {
									window.cancelAnimationFrame(id);
								}
							};
						}
						break;
					case 'render':
						var precision = (function () {
							switch (v.precision) {
								case 0:
									return 'lowp';
								case 1:
									return 'mediump';
								default:
								case 2:
									return 'highp';
							}
						})();
						switch (v.type.toLowerCase()) {
							case 'canvas':
								__.renderer = new THREE.CanvasRenderer({ antialias: v.antialias, precision: precision, alpha: v.background.opacity == 0 });
								break;
							case 'webgl':
							default:
								__.renderer = new THREE.WebGLRenderer({ antialias: v.antialias, precision: precision, alpha: v.background.opacity == 0 });
								break;
						}
						_.node.empty().append(__.renderer.domElement);
						__.renderer.reSize(_.node.width(), _.height.height());
						__.renderer.shadowMapEnabled = v.hasShadow;
						__.renderer.setClearColorHex(v.background.rgb, v.background.opacity);
						break;
					case 'camera':
						switch (V.getValue(v.type, 'Perspective').toLowerCase()) {
							case 'orthographic':
								//视角,宽高比,近处near和远处far的阀值设置 如果对象因为视角比例超出边界那么就不会显示了
								_.camera = new THREE.PerspectiveCamera(v.angle, node.width() / node.height(), v.near, v.far);
								break;
							case 'perspective':
							default:
								//视角,宽高比,近处near和远处far的阀值设置 如果对象因为视角比例超出边界那么就不会显示了
								_.camera = new THREE.PerspectiveCamera(v.angle, node.width() / node.height(), v.near, v.far);
								break;
						}
						if (_.camera.position.set)
							_.camera.position.set(v.position.x, v.position.y, v.position.z);
						else
							V.merge(_.camera.position, v.position, true);
						switch (v.up.toLowerCase()) {
							case 'x':
								V.merge(_.camera.up, { x: 1, y: 0, z: 0 }, true);
								break;
							case 'y':
								V.merge(_.camera.up, { x: 0, y: 1, z: 0 }, true);
								break;
							case 'z':
							default:
								V.merge(_.camera.up, { x: 0, y: 0, z: 1 }, true);
								break;
						}
						_.camera.lookAt(v.look);
						break;
					case 'lights':
						if (v) {
							V.each(v, function (v2) {
								var light = null;
								switch (v2.type.toLowerCase) {
									default:
									case 'directional':
										light = new THREE.DirectionalLight(v2.color.rgb, v2.color.opacity, 0);//设置平行光源
										break;
									case 'point':
										light = new THREE.PointLight(v2.color.rgb, v2.color.opacity, 0);//设置点光源
										break;
									case 'spot':
										light = new THREE.SpotLight(v2.color.rgb, v2.color.opacity, 0);//设置漫反射光源
										break;
									case 'ambient':
										light = new THREE.AmbientLight(v2.color.rgb, v2.color.opacity, 0);//设置背景光源
										break;
								}
								light.position.set(v2.position.x, v2.position.y, v2.position.z);//设置光源向量
								_.scene.add(light);// 追加光源到场景
							});
						}
						break;
                }
            }, function () {
				__.render(data);
			});
        }
	});
})(VJ, VJ.view, jQuery);