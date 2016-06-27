(function (V, W, $) {
    V.registScript(function (middler, path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [path || ' <div oncontextmenu="self.event.returnValue=false"></div>', vm || {}]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
        }
        _.onLoad = function (node) {
			if(!THREE){return;}
			__.camera=null;
			__.scene=null;
			__.renderer=null;
			__.target = new THREE.Vector3();
			__.lon = 90;
			__.lat = 0;
			__.phi = 0;
			__.theta = 0;
			__.touchX = 0;
			__.touchY = 0;
			__.auto=false;//自动滚动
			__.runningdown=false;//控制鼠标拖动滚动  鼠标按下
			__.runningmove=false;//控制鼠标拖动滚动  鼠标移动
			__.id=V.random();
			__.step=0.1;
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
					case 'click':
					 case 'hover':
					break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () { __.onLoad(node) });
			    document.addEventListener( 'mousedown', __.onDocumentMouseDown, false );
				
				document.addEventListener( 'mousewheel',  __.onDocumentMouseWheel, false );
				window.addEventListener( 'resize', __.onWindowResize, false );
        };
		__.init=function(urls){
            __.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
			__.scene = new THREE.Scene();
			var sides = [
					{
						url: urls[1], //01
						position: [ -512, 0, 0 ],
						rotation: [ 0, Math.PI / 2, 0 ]
					},
					{
						url: urls[3], //03
						position: [ 512, 0, 0 ],
						rotation: [ 0, -Math.PI / 2, 0 ]
					},
					{
						url: urls[5], //04
						position: [ 0,  512, 0 ],
						rotation: [ Math.PI / 2, 0, Math.PI ]
					},
					{
						url: urls[4], //05
						position: [ 0, -512, 0 ],
						rotation: [ - Math.PI / 2, 0, Math.PI ]
					},
					{
						url: urls[0], //00
						position: [ 0, 0,  512 ],
						rotation: [ 0, Math.PI, 0 ]
					},
					{
						url: urls[2], //02
						position: [ 0, 0, -512 ],
						rotation: [ 0, 0, 0 ]
					}
				];
			for ( var i = 0; i < sides.length; i ++ ) {

					var side = sides[ i ];

					var element = document.createElement( 'img' );
					var path=side.url.split('/');
					element.id=path[path.length-1].split('.')[0];
					element.src = side.url;
					element.useMap="#"+__.id+element.id+'map';
					element.width = 1026; // 2 pixels extra to close the gap.
					

					var object = new THREE.CSS3DObject( element );
					object.position.fromArray( side.position );
					object.rotation.fromArray( side.rotation );
					__.scene.add( object );
				}
				__.renderer = new THREE.CSS3DRenderer();
				__.renderer.setSize( window.innerWidth, window.innerHeight );
				_.node.html(__.renderer.domElement);
				__.update();
				setTimeout(function(){
					__.animate();
				},400);
				//document.body.appendChild( renderer.domElement );
		};
		__.onWindowResize=function() {
				__.camera.aspect = window.innerWidth / window.innerHeight;
				__.camera.updateProjectionMatrix();
				__.renderer.setSize( window.innerWidth, window.innerHeight );
		};
		__.onDocumentMouseDown=function( event ) {
				event.preventDefault();
                __.runningmove=true;
				document.addEventListener( 'mousemove',  __.onDocumentMouseMove, false );
				document.addEventListener( 'mouseup',  __.onDocumentMouseUp, false );
		}
		__.onDocumentMouseMove=function ( event ) {
				var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
				__.lon -= movementX * 0.1;
				__.lat += movementY * 0.1;
                if( __.runningmove){
				__.runningdown=true;
				}
		}
		__.onDocumentMouseUp=function ( event ) {
				 __.runningdown=false;
				__.runningmove=false;
				document.removeEventListener( 'mousemove', __.onDocumentMouseMove );
				document.removeEventListener( 'mouseup', __.onDocumentMouseUp );
		}
		__.onDocumentMouseWheel=function( event ) {

				__.camera.fov -= event.wheelDeltaY * 0.05;
				__.camera.updateProjectionMatrix();
		}		
		__.animate=function() {
				requestAnimationFrame( __.animate );
				if(__.auto||__.runningdown){
				__.update();
				}
		}
		__.update=function() {           
				__.lon +=  __.step;
				__.lat = Math.max( - 85, Math.min( 85, __.lat ) );
				__.phi = THREE.Math.degToRad( 90 - __.lat );
				__.theta = THREE.Math.degToRad( __.lon );

				__.target.x = Math.sin( __.phi ) * Math.cos( __.theta );
				__.target.y = Math.cos( __.phi );
				__.target.z = Math.sin( __.phi ) * Math.sin( __.theta );

				__.camera.lookAt( __.target );
				__.renderer.render( __.scene, __.camera );
		}
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'imgs'://0=前面,1=右1,2-右2,3-右3（左1），4-top,5-bottom
					    if(V.isArray(v)&&v.length==6){
							__.init(v);
						}else{
							console.log('720渲染时，传入的图片必需是6张');
						}
					    break;
					case 'resize':
					   if(v&&v.w){
						   __.onWindowResize();
					   }
						break;
					case 'auto':
				       __.auto=v;
					   break;
					case 'maps':
					   if(V.isArray(v)&&v.length>0){
						   var sb=V.sb();
						   V.each(v, function (va) {
							   sb.append(V.format('<map name="{id}" id="{id}"> ', { id:__.id+va.id+'map' }));
							   V.forC(va.areas, function (k2, v2) {
								   sb.append(V.format(' <area shape="{shape}" title="{title}" coords="{coords}" href="{href}" alt="{title}" target="_blank"> ', v2 ));
							   },function(){
								   sb.append('</map>');
								   $("body").append(sb.clear());
							   });
                                }, function () {
								$('body').on('mouseover','area',function(e){
									e = e || window.event;
									e.href=$(this).attr('href');
							           _.call('areaMouseover',{areaE:e});
								});
								$('body').on('mouseout','area',function(e){
							           _.call('areaMouseout',{areaE:e});
								});
                                });
					   }
					   break;
					  case 'direction':
					       if(v=='left'){
							   __.step=0.1;
						   }else{
							   __.step=-0.1;
						   }
					     break;
                }
            });
        }
    });
})(VJ, VJ.view, jQuery);