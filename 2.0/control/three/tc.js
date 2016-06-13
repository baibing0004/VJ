(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
			//简历一个基础的scene对象，允许用户定义3DObject对象，及其属性 scale rotate location属性，允许3DObject对象执行move等等操作，提供动画事件与mousemove，mouseover事件
            V.inherit.apply(_, [W.Control, [path || "<div></div>", V.merge({
				data: {
					scene: {},
					stats: true,
					size: { width: V.userAgent.width, height: V.userAgent.height },
					lights: [{ type: 'Ambient', color: { rgb: 0xffffff, opacity: 1 }, position: { x: 100, y: 100, z: 200 } }],
					camera: { type: 'Perspective', size: { width: V.userAgent.width, height: V.userAgent.height }, angle: 60, near: 1, far: 10000, rotate: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, look: { x: 0, y: 0, z: 0 }, up: 'y' },
					render: { type: 'WebGL', antialias: true, precision: 2, hasShadow: true, background: { rgb: 0xFFFFFF, opacity: 1.0 } },
				}
			}, V.getValue(vm, {}))]]);
			_.is3D = true;
			_.objs = { count: 0 };
			_.camera = null;
            __.onLoad = _.onLoad;
            __.render = _.render;
			__.addControl = _.addControl;
			__.removeControl = _.removeControl;
			__.clearControl = _.clearControl;
            _.addDesc('threemovie 3D基础控件');
            _.addDesc('属性:');
            _.addDesc('\tlights 对象数组[{type:"Directional"平行光源，position:方向}]');
            _.addDesc('\tcamera 镜头type Orthographic left,right,top,bottom,near,far/Perspective angle视锥角度,near近处和far远处的阀值设置 当比例超出阀值设置时不可显示,position:{x,y,z}方位，look:{x,y,z}朝向的方向,up:{x,y,z}设定镜头的正向方向');
            _.addDesc('\trender 生成器type WebGL 生成器的基本属性 antialias:是否抗锯齿,precision:0低精度，1中精度，2高精度，hasShadow:是否允许阴影,background:{rgb:0xFFFFFF,opacity:1.0}背景颜色');
            _.addDesc("定义:");
            _.addDesc("\tthreemovie: { path: '../../Scripts/ref/three.min.js;../../Scripts/ref/stats.min.js;../../Scripts/module/part/tc.js;' }");
        }
        _.onLoad = function (node) {
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
						node.hover(function (e) {
							_.call('hover', { e: e, hover: true, D2Location: _.getPointOnCanvas(e.target, e.pageX, e.pageY) });
						}, function (e) {
							_.call('hover', { e: e, hover: false, D2Location: _.getPointOnCanvas(e.target, e.pageX, e.pageY) });
						});
						break;
                    case 'click':
						node.click(function (e) {
							V.stopProp(e);
							_.call('click', { e: e, D2Location: _.getPointOnCanvas(e.target, e.pageX, e.pageY) });
						});
						break;
					case 'mousedown':
					case 'mouseup':
					case 'mousemove':
						break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
				if (!THREE) {
					V.showException('没有加载到THREE.js');
					return;
				} else if (window.WebGLRenderingContext ? false : true) {
					V.showException('当前浏览器' + V.userAgent.name + '不支持WebGL');
					return;
				}
				_.scene = new THREE.Scene();
				_.objarray = _.scene.children;
				node.mousedown(function (e) { __.doMouse(e, 'mousedown'); });
				node.mouseup(function (e) { __.doMouse(e, 'mouseup'); });
				node.mousemove(function (e) { __.doMouse(e, 'mousemove'); });
				__.onLoad(node);
            });
        };

		{
			//位置服务
			__.getPointOnCanvas = function (can, x, y) {
				var bbox = can.getBoundingClientRect();
				return {
					x: x - bbox.left * (can.width / bbox.width),
					y: y - bbox.top * (can.height / bbox.height)
				};
			};
			__.objhover = null;
			__.clicktime = null;
			__.doMouse = function (e, name) {
				e.preventDefault();
				var x = e.pageX;
				var y = e.pageY;
				var canvas = e.target;
				var loc = __.getPointOnCanvas(canvas, x, y);
				_.call(name, { e: e, D2Position: loc });
				//進行3D視線撲捉最上層的3D对象 判断vid 找到物理控件进行事件触发
				var obj = _.objectFromMouse(x, y);
				if (obj.obj)
					switch (name.toLowerCase()) {
						case 'mousedown':
							__.clicktime = new Date();
							obj.obj.call('mousedown', { e: e, D2Position: loc, D3Position: obj.point });
							break;
						case 'mouseup':
							if (new Date().sub('ms', __.clicktime) <= 500)
								obj.obj.call('click', { e: e, D2Position: loc, D3Position: obj.point });
							obj.obj.call('mouseup', { e: e, D2Position: loc, D3Position: obj.point });
							break;
						case 'mousemove':
							if (__.objhover == null) {
								__.objhover = obj.object.vid;
								obj.obj.call('hover', { e: e, hover: true, D2Position: loc, D3Position: obj.point });
							} else if (__.objhover != obj.object.vid) {
								_.objs[__.objhover].call('hover', { e: e, hover: false, D2Position: loc, D3Position: obj.point });
								__.objhover = obj.object.vid;
								obj.obj.call('hover', { e: e, hover: true, D2Position: loc, D3Position: obj.point });
							}
							obj.obj.call('mousemove', { e: e, hover: true, D2Position: loc, D3Position: obj.point });
							break;
						case 'mousewheel':
							//todo;
							break;
					}
				else if (__.objhover) {
					_.objs[__.objhover].call('hover', { e: e, hover: false, D2Position: loc, D3Position: obj.point });
					__.objhover = null;
				}
			};
			//位置服务
			_.projector = new THREE.Projector();
			_.get2DPosition = function (o3d) {
				var mat = o3d.matrixWorld;
				var pos = new THREE.Vector3();
				pos = mat.multiplyVector3(pos);

				projected = pos.clone();
				_.projector.projectVector(projected, _.camera);

				var eltx = (1 + projected.x) * _.node[0].offsetWidth / 2;
				var elty = (1 - projected.y) * _.node[0].offsetHeight / 2;

				var offset = $(__.renderer.domElement).offset();
				eltx += offset.left;
				elty += offset.top;

				return { x: eltx, y: elty };
			};
			_.objectFromMouse = function (pagex, pagey) {
				if (__.renderer) {
					// Translate page coords to element coords
					var offset = $(__.renderer.domElement).offset();
					//转换为div坐标
					var eltx = pagex - offset.left;
					var elty = pagey - offset.top;

					//转换为相机视野坐标
					var vpx = (eltx / _.node[0].offsetWidth) * 2 - 1;
					var vpy = -(elty / _.node[0].offsetHeight) * 2 + 1;

					var vector = new THREE.Vector3(vpx, vpy, 0.5);

					//_.projector.unprojectVector(vector, _.camera);
					vector.unproject(_.camera);
					//生成视界射线
					var ray = new THREE.Raycaster(_.camera.position, vector.sub(_.camera.position).normalize(), _.camera.near, _.camera.far);
					//获取到相交的对象
					var intersects = ray.intersectObjects(_.scene.children, true);
					ray = null;
					if (intersects.length > 0) {
						var i = 0;
						while (!intersects[i].object.visible) {
							i++;
						}
						var intersected = intersects[i];
						//var mat = new THREE.Matrix4().getInverse(intersected.object.matrixWorld);
						//var point = mat.multiplyVector3(intersected.point);
						if (intersected)
							return (_.findObjectFromIntersected(intersected.object, intersected.point, intersected.face ? intersected.face.normal : null, intersected));
					} else {
						return { object: null, point: null, normal: null, source: null };
					}
				} else return {};
			};
			_.findObjectFromIntersected = function (object, point, normal, source) {
				if (object.vid) {
					return { object: object, point: point, normal: normal, source: source, obj: _.objs[object.vid] };
				} else if (object.parent) {
					return _.findObjectFromIntersected(object.parent, point, normal, source);
				} else {
					return { object: null, point: null, normal: null, source: null };
				}
			};
		}
		_.add3DObject = function (d3o) {
			var obj = d3o.obj;
			if (_.scene.fog) {
				obj.fog = _.scene.fog;
			}
			if (__.renderer && __.renderer.shadowMapEnabled) {
				obj.castShadow = true;
				obj.receiveShadow = true;
			}
			//视线捕捉时使用
			obj.vid = V.getValue(obj.vid, V.random());
			_.objs[obj.vid] = d3o;
			_.objs.count++;
			_.scene.add(obj);
			_.redraw();
		};
		_.redraw = function () {
			if (__.renderer && _.scene && _.camera && _.objs.count > 0) {
				__.renderer.render(_.scene, _.camera);
			}
		};
        _.render = function (data) {
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
					case 'visible':
						if (v) _.redraw();
						else if (__.renderer) __.renderer.clear();
						break;
					case 'fog':
						//雾
						if (v) _.scene.fog = new THREE.Fog(0xffffff, 0.015, 100);
						break;
                    case 'size':
                        _.node.width(v.width);
						_.node.height(v.height);
						if (_.camera) {
							_.camera.aspect = v.width / v.height;
							_.camera.updateProjectionMatrix();
						}
						if (__.renderer) {
							__.renderer.setSize(v.width, v.height);
							_.redraw();
						}
                        break;
					case 'stats':
						if (v && Stats) {
							if (_.stats) {
								if (0 <= v) _.stats.setMode(v);
							}
							else {
								_.stats = new Stats();
								_.node.append($(_.stats.domElement).css('position', 'absolute').css('left', '0').css('top', '0'));
								if (0 <= v) _.stats.setMode(v);
							}
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
						__.renderer.domElement.addEventListener("webglcontextlost", function (e) {
							V.showException('webgl上下文丢失，重建render');
							_.render({ render: _.vm.get().render });
						});
						__.renderer.setSize(data.size.width, data.size.height);
						//todo 报错__.renderer.shadowMapEnabled = v.hasShadow;
						__.renderer.setClearColor(v.background.rgb, v.background.opacity);
						break;
					case 'camera':
						if (_.camera == null)
							switch (V.getValue(v.type, 'Perspective').toLowerCase()) {
								case 'orthographic':
									//视角,宽高比,近处near和远处far的阀值设置 如果对象因为视角比例超出边界那么就不会显示了
									_.camera = new THREE.OrthographicCamera(data.size.width / - 2, data.size.width / 2, data.size.height / 2, data.size.height / - 2, v.near, v.far);
									break;
								case 'perspective':
								default:
									//视角,宽高比,近处near和远处far的阀值设置 如果对象因为视角比例超出边界那么就不会显示了
									_.camera = new THREE.PerspectiveCamera(v.angle, data.size.width / data.size.height, v.near, v.far);
									break;
							}
						V.forC(v, function (k2, v2) {
							switch (k2.toLowerCase()) {
								case 'position':
									if (_.camera.position.set)
										_.camera.position.set(v2.x, v2.y, v2.z);
									else
										V.merge(_.camera.position, v2, true);
									break;
								case 'rotate':
									if (_.camera.rotation.set)
										_.camera.rotation.set(v2.x, v2.y, v2.z);
									else
										V.merge(_.camera.rotation, v2, true);
									break;
								case 'up':
									switch (v2.toLowerCase()) {
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
									break;
								case 'look':
									if (v2) {
										_.camera.lookAt(v2);
									}
									break;
							}
						}, function () {
							//_.camera.updateProjectionMatrix();
						});
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
										light = new THREE.SpotLight(v2.color.rgb, v2.color.opacity, 0, V.getValue(v2.color.angle, 0));//设置漫反射光源
										break;
									case 'ambient':
										light = new THREE.AmbientLight(v2.color.rgb, v2.color.opacity, 0);//设置背景光源
										break;
									case 'area':
										light = new THREE.AreaLight(v2.color.rgb, v2.color.opacity, 0);//设置区域光源
										break;
								}
								if (v2.position)
									light.position.set(v2.position.x, v2.position.y, v2.position.z);//设置光源向量
								_.scene.add(light);// 追加光源到场景
							});
						}
						break;
                }
            }, function () {
				__.render(data);
				if (data.play != undefined) {
					var v2 = data.play;
					if (v2 && typeof (v2) == 'function') {
						var id = '';
						var func = v2;
						var go = function () {
							if (_.stats) _.stats.update();
							if (_.vm.get().play) {
								id = window.requestAnimationFrame(go);
							} else {
								__.resumego = go;
								window.cancelAnimationFrame(id);
							}
							func.apply(_.parent.vms, [_.vm.data, _.vm]);
							//_.parent.redraw();
						};
						go();
					} else if (true === v2 && __.resumego) {
						__.resumego();
					}
				}
				_.redraw();
			});
        };
	});
})(VJ, VJ.view, jQuery);