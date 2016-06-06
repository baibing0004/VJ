(function (V, W, $) {
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
			//����һ��������3DObject������������position scale rotate move�����ȵ�
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
            _.addDesc('three 3D�����ؼ�');
            _.addDesc('����:');
            _.addDesc('\tposition {x,y,z}��λ');
            _.addDesc('\tscale �Ŵ���С');			
            _.addDesc('\trotate ��ת');
            _.addDesc('\tmesh ����');
            _.addDesc("����:");
            _.addDesc("\tthreeobject: { path: '../../Scripts/ref/three.js;../../Scripts/module/part/tobj.js;' }");
        }
        _.onLoad = function (node) {
			if(!_.parent.is3D) throw new Error('ThreeObject����������ThreeMovie��');
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
		//��̬��ӿؼ���ָ��λ�� �����ָ����ô����ӵ����
		_.addControl = function(){
			V.showException('tobj ������addControl');
		};
		_.removeControl = function(){
			V.showException('tobj ������removeControl');
		};
		_.clearControl = function(){
			V.showException('tobj ������clearControl');
		};
	});
})(VJ, VJ.view, jQuery);