(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
			//简历一个基础的3DObject对象，允许定义其position scale rotate move动画等等
            V.inherit.apply(_, [W.Control, [path || "<div style='display:none;'></div>", vm || { data: {
			} }]]);
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
            _.addDesc('\tmesh 材质');
            _.addDesc("定义:");
            _.addDesc("\tthreeobject: { path: '../../Scripts/ref/three.js;../../Scripts/module/part/tobj.js;' }");
        }
        _.onLoad = function (node) {
			if(!_.parent.is3D) throw new Error('ThreeObject必须运行在ThreeMovie中');
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
		_.create = function(data){
			//todo
		};
        _.render = function (data) {
			if(_.obj ==  null) {
				_.obj = _.create(data);
				_.parent.scene.add(_.obj);
				_.parent.redraw();
			} else
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    default:
						break;
                }
            },function(){
				//__.render(data);
			});
        };
		_.dispose = function(){
			V.tryC(function(){_.call('dispose');if(_.obj){_.parent.scene.remove(_.obj);_.parent.redraw();}});_.node.remove();};
		};
		//动态添加控件到指定位置 如果不指定那么会添加到最后
		_.addControl = function(){
			V.showException('tobj 不允许addControl');
		};
		_.removeControl = function(){
			V.showException('tobj 不允许removeControl');
		};
		_.clearControl = function(){
			V.showException('tobj 不允许clearControl');
		};
	});
})(VJ, VJ.view, jQuery);