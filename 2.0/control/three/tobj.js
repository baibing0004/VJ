(function (V, W, $) {
  V.registScript(function (path, vm) {
    var _ = this, __ = {}
    {
      // 简历一个基础的3DObject对象，允许定义其position scale rotate move动画等等
      V.inherit.apply(_, [W.Control, [path || "<div style='display:none;'></div>", V.getValue({
        data: {
          type: 'plane',
          position: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rotate: { x: 0, y: 0, z: 0 },
          width: 0,
          height: 0,
          deepth: 0,
          radius: 0,
          points: [],
          size: 'cover',
          color: { rgb: 0xffffff, opacity: 1.0 },
          transparent: false,
          side: 0,
          style: 'basic',
          debug: false
        }
      }, vm)]])
      _.is3D = true
      __.obj = null
      __.onLoad = _.onLoad
      __.render = _.render
      __.addControl = _.addControl
      __.removeControl = _.removeControl
      __.clearControl = _.clearControl
      __.dispose == _.dispose
      _.geometry = null
      _.material = null
      _.addDesc('three3D 对象')
      _.addDesc('属性:')
      _.addDesc('\ttype 类型mesh,line,cube,cylinder,sphere,plane')
      _.addDesc('\tposition {x,y,z}中心点方位')
      _.addDesc('\tscale 放大缩小')
      _.addDesc('\trotate 旋转')
      _.addDesc('\twidth 宽度适用于plane,cube,line')
      _.addDesc('\theight 高度适用plane,cube,cylinder')
      _.addDesc('\tdeepth 深度适用于cube,')
      _.addDesc('\tradius 半径适用于sphere,[top,bottom]两个半径适用于cylinder')
      _.addDesc('\tpoints 适用mesh,line')
      _.addDesc('\tsize cover,repeat,mirror适用于image属性,')
      _.addDesc('\tcolor 颜色适用于全部，多个颜色适用于mesh与line')
      _.addDesc('\ttransparent 是否透明适用于全部')
      _.addDesc('\tside 适用于正反面0 正面 1 反面 2 正反面')
      _.addDesc('\tstyle 适用于basic,lambert,phong,line')
      _.addDesc('\tdebug:线框模式')
      _.addDesc('定义:')
      _.addDesc("\tthreeobject: { path: '../../Scripts/ref/three.js;../../Scripts/module/part/tobj.js;' }")
    }
    _.onLoad = function (node) {
      _.movie = (_.parent.vs[node.parent().attr('id')]);
      if (!_.movie.is3D) throw new Error('ThreeObject必须运行在ThreeMovie中')
      _.scene = _.movie.scene
      _.obj = null
      V.forC(_.events, function (k, v) {
        switch (k.toLowerCase()) {
          case 'hover':
          case 'click':
          case 'mousedown':
          case 'mouseup':
          case 'mousemove':
            break
          default:
            _.bindEvent(_.node, k, v)
            break
        }
      }, function () {
        __.onLoad(node)
      })
    };
    _.fill = function () { if (_.obj) return { EPosition: _.obj.position.clone(), ERotate: _.obj.rotation.clone(), EScale: _.obj.scale.clone() }; else return {}; };
    _.get2DPosition = function () { if (_.obj && _.movie) { return _.movie.get2DPosition(_.obj); } else return {}; };
    _.render = function (data) {
      V.forC(data, function (k, v) {
        switch (k.toLowerCase()) {
          case 'desc':
            _.desc();
            break;
          case 'visible':
            if (_.obj) _.obj.visible = v ? true : false;
            break;
          case '2dposition':
            if (v && typeof (v) == 'function') {
              v.apply(_, [_.get2DPosition()]);
            }
            break;
          case 'type':
            switch (v.toLowerCase()) {
              default:
              case 'mesh':
              case 'line':
                // 多面体
                _.geometry = new THREE.Geometry();
                break
              case 'text':
                _.geometry = new THREE.TextGeometry(data.text, {});
                break;
              case 'plane':
                if (data.width && data.height)
                  _.geometry = new THREE.PlaneGeometry(data.width, data.height);
                else V.showException('请输入width,height作为参数');
                break
              case 'cube':
                if (data.width && data.height && data.deepth)
                  _.geometry = new THREE.CubeGeometry(data.width, data.height, data.deepth);
                else V.showException('请输入width,height,deepth作为参数');
                break
              case 'sphere':
                if (data.radius) {
                  _.geometry = new THREE.SphereGeometry(data.radius, 32, 32);
                } else V.showException('请输入radius作为半径参数');
                break
              case 'cylinder':
                if (data.radius) {
                  if (V.isArray(data.radius))
                    _.geometry = new THREE.CylinderGeometry(data.radius[0], data.radius[1], data.height, 32, 32);
                  else
                    _.geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32, 8);
                } else V.showException('请输入radius作为半径参数');
                break
            }

            if (data.points && data.points.length > 0) {
              V.each(data.points, function (v2) {
                _.geometry.vertices.push(new THREE.Vector3(v2.x, v2.y, v2.z));
              }, null, true)
            }
            if (data.color && V.isArray(data.color) && data.color.length > 1) {
              V.each(data.color, function (v2) {
                _.geometry.colors.push(new THREE.Color(v2.rgb, v2.opacity))
              }, null, true)
            }
            break
          case 'style':
            __.data2 = {
              side: (function () {
                switch (data.side) {
                  default:
                  case 0:
                    return THREE.FrontSide;
                  case 1:
                    return THREE.BackSide;
                  case 2:
                    return THREE.DoubleSide;
                }
              })(),
              transparent: data.transparent,
              needUpdate: true,
              color: (data.color && !V.isArray(data.color)) ? data.color.rgb : 0,
              opacity: (data.color && !V.isArray(data.color)) ? data.color.opacity : 1,
              perPixel: true,
              debug: data.debug
            }

            if (__.data2.debug) { __.data2.wireframe = true; __.data2.wireframeLinecap = 'round'; __.data2.wireframeLinewidth = 2; }
            delete data.side;
            delete data.transparent;
            delete data.needUpdate;
            delete data.debug;
            switch (v.toLowerCase()) {
              default:
              case 'basic':
                _.material = new THREE.MeshBasicMaterial(__.data2);
                break
              case 'lambert':
                // ambient,emissive 两个可见与不可见光源
                _.material = new THREE.MeshLambertMaterial(__.data2);
                break
              case 'phong':
                __.data2 = V.merge({ shininess: 30, specular: __.data2.color }, __.data2);
                _.material = new THREE.MeshPhongMaterial(__.data2);
                break
              case 'line':
                __.data2.vertexColors = true;
                __.data2.linewidth = V.getValue(data.width, 1);
                _.material = new THREE.LineBasicMaterial(__.data2);
                break
            }
            break
          case 'file':
            _.map = null;
            switch (data.size.toLowerCase()) {
              default:
              case 'cover':
                _.map.wrapS = _.map.wrapT = THREE.ClampToEdgeWrapping
                break
              case 'repeat':
                _.map.wrapS = _.map.wrapT = THREE.RepeatWrapping
                break
              case 'mirror':
                _.map.wrapS = _.map.wrapT = THREE.MirroredRepeatWrapping
                break
            }
            _.map = null;
            var wrap = (function () {
              switch (data.size.toLowerCase()) {
                default:
                case 'cover':
                  return THREE.ClampToEdgeWrapping;
                case 'repeat':
                  return THREE.RepeatWrapping;
                case 'mirror':
                  return THREE.MirroredRepeatWrapping;
              }
            })();
            if (v && V.isArray(v) && v.length > 1) {
              var textures = [];
              var data2 = V.merge({}, __.data2);
              V.each(v, function (v2) {
                var map = THREE.ImageUtils.loadTexture(v2);
                map.wrapS = map.wrapT = wrap;
                var mesh = new THREE.MeshBasicMaterial({ color: data2.color, opacity: data2.opacity, map: map, side: data2.side });
                textures.push(mesh);
              }, function () {
                _.material = new THREE.MeshFaceMaterial(textures);
              }, true);
            } else {
              //todo canvas 播放视频或者6个视频 进行处理
              var canvas = V.newEl('canvas', '', '').width(data.width).height(data.height).appendTo(_.movie.node);
              console.log('new canvas');
              //todo canvas设置播放视频
              _.map = new THREE.Texture(canvas);
              _.map.wrapS = _.map.wrapT = wrap;
            }
            break
          case 'image':
            _.map = null;
            var wrap = (function () {
              switch (data.size.toLowerCase()) {
                default:
                case 'cover':
                  return THREE.ClampToEdgeWrapping;
                case 'repeat':
                  return THREE.RepeatWrapping;
                case 'mirror':
                  return THREE.MirroredRepeatWrapping;
              }
            })();
            if (v && V.isArray(v) && v.length > 1) {
              var textures = [];
              var data2 = V.merge({}, __.data2);
              V.each(v, function (v2) {
                var map = THREE.ImageUtils.loadTexture(v2);
                map.wrapS = map.wrapT = wrap;
                var mesh = new THREE.MeshBasicMaterial({ color: data2.color, opacity: data2.opacity, map: map, side: data2.side });
                textures.push(mesh);
              }, function () {
                _.material = new THREE.MeshFaceMaterial(textures);
              }, true);
            } else {
              _.map = THREE.ImageUtils.loadTexture(v);
              _.map.wrapS = _.map.wrapT = wrap;
            }
            break
        }
      }, function () {
        if (data.type) {
          if (_.map) _.material.map = _.map;
          //对材质的设置必须在生成Mesh之前否则就是更新Mesh.Material也无济于事，可能是更新的属性不对导致的或者其属性是clone的
          switch (data.type.toLowerCase()) {
            default:
            case 'sphere':
            case 'cylinder':
            case 'plane':
            case 'mesh':
            case 'cube':
            case 'text':
              _.obj = new THREE.Mesh(_.geometry, _.material)
              break
            case 'line':
              _.obj = new THREE.Line(_.geometry, _.material, THREE.LinePieces)
              break
          }
          _.movie.add3DObject(_);
        }
        if (_.obj)
          V.forC(data, function (k2, v2) {
            switch (k2.toLowerCase()) {
              case 'position':
                V.merge(_.obj.position, v2, true);
                break;
              case 'rotate':
                V.forC(v2, function (k3, v3) {
                  _.obj.rotation[k3] = v3 * Math.PI / 180;
                }, null, true);
                break;
              case 'scale':
                V.merge(_.obj.scale, v2, true);
                break;
              case 'play':
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
                    func.apply(_.movie.vms, [_.vm.data, _.vm]);
                    //_.movie.redraw();
                  };
                  go();
                } else if (true === v2 && __.resumego) {
                  __.resumego();
                }
                break;
            }
          }, _.movie.redraw)

      })
    }
    _.dispose = function () {
      V.tryC(function () { _.call('dispose'); if (_.obj) { _.movie.scene.remove(_.obj); _.movie.redraw(); } }); _.node.remove()
    }
    // 动态添加控件到指定位置 如果不指定那么会添加到最后
    _.addControl = function () {
      V.showException('tobj 不允许addControl');
    }
    _.removeControl = function () {
      V.showException('tobj 不允许removeControl');
    }
    _.clearControl = function () {
      V.showException('tobj 不允许clearControl');
    }
  })
})(VJ, VJ.view, jQuery);
