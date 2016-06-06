(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
			//简历一个基础的3DObject对象，允许定义其position scale rotate move动画等等
            V.inherit.apply(_, [W.Control, [path || "<div style='display:none;'></div>", vm || {
				data: {

					Material: { type: 'line', side: 0, transparent: false, colors: [{ rgb: 0xeeeeee, opacity: 1.0 }, { rgb: 0xcccccc, opacity: 1.0 }] }
				}
			}]]);
			_.is3D = true;
			__.obj = null;
            __.onLoad = _.onLoad;
            __.render = _.render;
			__.addControl = _.addControl;
			__.removeControl = _.removeControl;
			__.clearControl = _.clearControl;
			__.dispose == _.dispose;
            _.addDesc('three 3D基础控件');
            _.addDesc('属性:');
            _.addDesc('\tposition {x,y,z}方位');
            _.addDesc('\tscale 放大缩小');
            _.addDesc('\trotate 旋转');
            _.addDesc('\tMaterial 材质 type phong金属/Lambert暗光/Basic基础/类型，side 0正面，1背面，2两面,transparent:false是否透明,color:{rgb:0xfff,opacity:1.0},files:[""]');
            _.addDesc('\tbasic 材质 debug:线框模式');
            _.addDesc("定义:");
            _.addDesc("\tthreeobject: { path: '../../Scripts/ref/three.js;../../Scripts/module/part/tobj.js;' }");
        }
        _.onLoad = function (node) {
			if (!_.parent.is3D) throw new Error('ThreeObject必须运行在ThreeMovie中');
			_.scene = _.parent.scene;
			_.obj = null;
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'hover':
                    case 'end':
                    case 'click':
                        break;
					case 'mousedown':
						break;
					case 'mouseup':
						break
					case 'mousemove':
						break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
				__.onLoad(node);
            });
        };
		_.create = function (data) {
			//todo
		};
        _.render = function (data) {
			if (_.obj == null) {
				_.obj = _.create(data);
				_.parent.scene.add(_.obj);
				_.parent.redraw();
			} else
				V.forC(data, function (k, v) {
					switch (k.toLowerCase()) {
						case 'material':
							var data = {
								side: (function () {
									switch (v.side) {
										default:
										case 0:
											return THREE.FrontSide;
										case 1:
											return THREE.BackSide;
										case 2:
											return THREE.DoubleSide;
									}
								})(),
								transparent:v.transparent,
								needUpdate:true,
								color:v.color?v.color.rgb:0,
								opacity:v.color?v.color.opacity:1,
								perPixel:true,
								map:(function () {
									V.each(v.files,function (v2) {
										THREE.ImageUtils.loadTexture(v2);
									},true)
								})()
							};
							delete v.side;
							delete v.transparent;
							delete v.needUpdate;
							delete v.color;
							V.merge(data,v,true);
							switch (v.toLowerCase()) {
								default:
								case 'basic':
									if(data.debug) {data.wireframe = true;data.wireframeLinecap='round';data.wireframeLinewidth=2;}
									__.meterial = new THREE.MeshBasicMaterial(data);
									break;
								case 'line':
									data.vertexColors= true;
									__.material = new THREE.LineBasicMaterial(data);
									break;
								case 'lambert':
									//ambient,emissive 两个可见与不可见光源
									__.meterial = new THREE.MeshBasicMaterial(data);
									break;
								case 'phong':
									v = V.merge({ shininess: 30, specular: v.color.rgb, color: v.color.rgb }, v);
									__.meterial = new THREE.MeshPhongMaterial(v);
									break;
							}
							break;
						case '':
							break;
						default:
							break;
					}
				}, function () {
					//__.render(data);
				});
        };
		_.dispose = function () {
			V.tryC(function () { _.call('dispose'); if (_.obj) { _.parent.scene.remove(_.obj); _.parent.redraw(); } }); _.node.remove();
		};
		//动态添加控件到指定位置 如果不指定那么会添加到最后
		_.addControl = function () {
			V.showException('tobj 不允许addControl');
		};
		_.removeControl = function () {
			V.showException('tobj 不允许removeControl');
		};
		_.clearControl = function () {
			V.showException('tobj 不允许clearControl');
		};
	});
})(VJ, VJ.view, jQuery);