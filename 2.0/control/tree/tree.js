(function (V, W, $) {
    window.Atel = V.getValue(window.Atel, { view: {} });
    var Y = Atel.view;
    //实现按照columns{列值:{name:'列名',input:checkbox/radiobox}}为基本填充规则的列定义
    Y.Tree = function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [V.getValue(path, '<ul class="ztree"></ul>'), V.getValue(vm, {
                data: {
                    isChecked: false,
                    menu: {}
                }
            })]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('Tree.js\r\n使用zTree制作\r\n数据格式:{id:"",name:"",isParent:true/false}');
            __.setting = {
                check: {
                    enable: _.params.data.isChecked
                },
                callback: { //回调函数  
                    onRightClick: function (e, id, json, flag) { },   //处理为菜单事件  
                    onClick: function (e, id, json, clickFlag) { json.clickFlag = clickFlag; _.call('click', { value: json }) },
                    onExpand: function (e, id, json) {
                        _.call('expand', { value: json });
                    }
                },
                view: {
                    showIcon: false,
                    selectedMulti: false
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: 'id',
                        pIdKey: 'pid',
                        rootPId: null
                    }
                }
            };
        }
        _.onLoad = function (node) {
            _.addDesc('事件定义:\r\nexpand:扩展事件 tree控件会传递children对象需要判断data.value为空或者data.value.isParent为真而且data.value.children为空时调用\r\nclick:点击事件\r\n');
            __.setting.treeObj = node;
            V.forC(_.events, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'expand':
                        break;
                    case 'click':
                        break;
                    case 'move':
                        break;
                    case 'menu':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                __.onLoad(node);
                _.tree = $.fn.zTree.init(node, __.setting, null);
                //第一次触发扩展事件
                _.call('expand', { value: null })
            });
        };
        //_.fill = function () { return { value: _.tree ? _.tree.getSelectedNodes() : null} }; //todo 
        _.render = function (data) {
            data = __.render(data);
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'values':
                        var pnode = data.pnode ? data.pnode : null;
                        V.tryC(function () { _.tree.addNodes(pnode, v); });
                        break;
                }
            });
        }
    };
})(VJ, VJ.view, jQuery);