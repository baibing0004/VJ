;(function (V, W, $) {
  V.registScript(function (path, vm) {
    var _ = this, __ = {}
    {
    // 简历一个基础的3DObject对象，允许定义其position scale rotate move动画等等
    V.inherit.apply(_, [W.Control, [path || "<div style='display:none;'></div>", vm || {
      data: {
        type: 'plane',
        position: {x: 0,y: 0,z: 0},
        scale: 1.0,
        rotate: 0,
        width: 0,
        height: 0,
        deepth: 0,
        radius: 0,
        points: [],
        size: 'cover',
        color: {rgb: 0xffffff,opacity: 1.0},
        transparent: false,
        side: 0,
        image: '',
        style: 'basic',
        debug: false,
        Geometry: {type: 'line',points: [{x: 0,y: 0,z: 0}],radius: 1},
        Material: { type: 'line', side: 0,linewidth: 2,transparent: false, colors: [{ rgb: 0xeeeeee, opacity: 1.0 }, { rgb: 0xcccccc, opacity: 1.0 }] }
      }
    }]])
    _.is3D = true
    __.obj = null
    __.onLoad = _.onLoad
    __.render = _.render
    __.addControl = _.addControl
    __.removeControl = _.removeControl
    __.clearControl = _.clearControl
    __.dispose == _.dispose
    __.geometry = null
    __.meterial = null
    _.addDesc('three 3D基础控件')
    _.addDesc('属性:')
    _.addDesc('\ttype 类型mesh,line,cube,cylinder,sphere,plane')
    _.addDesc('\tposition {x,y,z}中心点方位')
    _.addDesc('\tscale 放大缩小')
    _.addDesc('\trotate 旋转')
    _.addDesc('\twidth 宽度适用于plane,cube')
    _.addDesc('\theight 高度适用plane,cube,cylinder')
    _.addDesc('\tdeepth 深度适用于cube,')
    _.addDesc('\tradius 半径适用于sphere,[top,bottom]两个半径适用于cylinder')
    _.addDesc('\tpoints 适用mesh,line')
    _.addDesc('\tsize cover,repeat,mirror适用于image属性,')
    _.addDesc('\tcolor 颜色适用于全部，多个颜色适用于mesh与line')
    _.addDesc('\ttransparent 是否透明适用于全部')
    _.addDesc('\tside 适用于正反面0 正面 1 反面 2 正反面')
    _.addDesc('\tstyle 适用于basic,lambert,phong,line')
    _.addDesc('\tGeometry 材质 type line需要输入points作为起点终点或者多个线/cube需要输入width,height,deepth/cylinder需要输入radius(topradius,bottomradius),height/sphere需要输入radius/plane/类型，side 0正面，1背面，2两面,transparent:false是否透明,color:{rgb:0xfff,opacity:1.0},colors')
    _.addDesc('\tMaterial 材质 type phong金属/Lambert暗光/Basic基础/line类型，side 0正面，1背面，2两面,transparent:false是否透明,color:{rgb:0xfff,opacity:1.0},colors:[{rgb:0xfff,opacity:1.0}]对应起止点或者多个点的颜色,linewidth:2,images:[""],size:"cover,repeat,mirror",map:"image,imagecube"')
    _.addDesc('\tbasic 材质 debug:线框模式')
    _.addDesc('定义:')
    _.addDesc("\tthreeobject: { path: '../../Scripts/ref/three.js;../../Scripts/module/part/tobj.js;' }")
    }
    _.onLoad = function (node) {
      if (!_.parent.is3D) throw new Error('ThreeObject必须运行在ThreeMovie中')
      _.scene = _.parent.scene
      _.obj = null
      V.forC(_.events, function (k, v) {
        switch (k.toLowerCase()) {
          case 'hover':
          case 'end':
          case 'click':
            break
          case 'mousedown':
            break
          case 'mouseup':
            break
          case 'mousemove':
            break
          default:
            _.bindEvent(_.node, k, v)
            break
        }
      }, function () {
        __.onLoad(node)
      })
    }
    _.render = function (data) {
      V.forC(data, function (k, v) {
        switch (k.toLowerCase()) {
          case 'type':
            switch (v.toLowerCase()) {
              default:
              case 'mesh':
              case 'line':
                // 多面体
                __.geometry = new THREE.Geometry()
                break
              case 'plane':
                __.geometry = new THREE.PlaneGeometry(data.width, data.height)
                break
              case 'cube':
                __.geometry = new THREE.CubeGeometry(data.width, data.height, data.deepth)
                break
              case 'sphere':
                __.geometry = new THREE.SphereGeometry(data.radius)
                break
              case 'cylinder':
                __.geometry = new THREE.CylinderGeometry(V.getValue(data.radius[0], data2.radius), V.getValue(data.radius[1], data2.radius), data2.height)
                break
            }

            if (data.points && data.points.length > 0) {
              V.each(data.points, function (v2) {
                __.geometry.vertices.push(new THREE.Vector3(v2.x, v2.y.v2.z))
              }, null, true)
            }
            if (data.color && V.isArray(data.color) && data.color.length > 1) {
              V.each(data.color, function (v2) {
                __.geometry.colors.push(new THREE.Color(v2.rgb, v2.opacity))
              }, null, true)
            }
            break
          case 'style':
            var data2 = {
              side: (function () {
                switch (data.side) {
                  default:
                  case 0:
                    return THREE.FrontSide
                  case 1:
                    return THREE.BackSide
                  case 2:
                    return THREE.DoubleSide
                }
              })(),
              transparent: data.transparent,
              needUpdate: true,
              color: (data.color && !V.isArray(data.color)) ? v.color.rgb : 0,
              opacity: (data.color && !V.isArray(data.color)) ? v.color.opacity : 1,
              perPixel: true,
              debug: data.debug
            }
            delete data.side
            delete data.transparent
            delete data.needUpdate
            switch (v.toLowerCase()) {
              default:
              case 'basic':
                if (data2.debug) {data2.wireframe = true;data2.wireframeLinecap = 'round';data2.wireframeLinewidth = 2;}
                __.meterial = new THREE.MeshBasicMaterial(data2)
                break
              case 'lambert':
                // ambient,emissive 两个可见与不可见光源
                __.meterial = new THREE.MeshLambertMaterial(data2)
                break
              case 'phong':
                data2 = V.merge({ shininess: 30, specular: data2.color}, data)
                __.meterial = new THREE.MeshPhongMaterial(data2)
                break
              case 'line':
                data2.vertexColors = true
                __.material = new THREE.LineBasicMaterial(data2)
                break
            }
            break
          case 'image':
            __.map = null
            if (v && V.isArray(v) && v.length == 6) {
              __.map = THREE.ImageUtils.loadTextureCube(v)
            } else {
              __.map = THREE.ImageUtils.loadTexture(v)
            }
            switch (data.size.toLowerCase()) {
              default:
              case 'cover':
                __.map.wrapS = __.map.wrapT = THREE.ClampToEdgeWrapping
                break
              case 'repeat':
                __.map.wrapS = __.map.wrapT = THREE.RepeatWrapping
                break
              case 'mirror':
                __.map.wrapS = __.map.wrapT = THREE.MirroredRepeatWrapping
                break
            }
            break
        }
      }, function () {
        if (_.obj == null || data.type || data.style) {
          if (__.map) __.metrial.map = __.map
          switch (data.type.toLowerCase()) {
            default:
            case 'sphere':
            case 'cylinder':
            case 'plane':
            case 'mesh':
              _.obj = new THREE.Mesh(__.geometry, __.meterial)
              break
            case 'line':
              _.obj = new THREE.Line(__.geometry, __.meterial, THREE.LinePieces)
              break
          }
        }
      // __.render(data)
      })
    }
    _.dispose = function () {
      V.tryC(function () { _.call('dispose'); if (_.obj) { _.parent.scene.remove(_.obj); _.parent.redraw(); } }); _.node.remove()
    }
    // 动态添加控件到指定位置 如果不指定那么会添加到最后
    _.addControl = function () {
      V.showException('tobj 不允许addControl')
    }
    _.removeControl = function () {
      V.showException('tobj 不允许removeControl')
    }
    _.clearControl = function () {
      V.showException('tobj 不允许clearControl')
    }
  })
})(VJ, VJ.view, jQuery)
