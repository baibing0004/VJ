(function (V, W, $) {
    //实现按照columns{列值:{name:'列名',input:checkbox/radiobox}}为基本填充规则的列定义
    V.registScript(function (path, vm) {
        var _ = this, __ = {};
        {
            V.inherit.apply(_, [W.Control, [V.getValue(path, '<ul class="ztree"></ul>'), V.getValue(vm, {
                data: {
                    isChecked: false
                }
            })]]);
            __.onLoad = _.onLoad;
            __.render = _.render;
            _.addDesc('Tree.js\r\n使用zTree制作\r\n数据格式:{ID:"",name:"",isParent:true/false}');
            _.addDesc('属性\r\n');
            _.addDesc('menu\t {新增:{key:"操作ID",icon:"url"},删除:**}格式定义也可简写为{新增:"add"},并在onMenuClick事件中监听D.name区分不同命令');
            _.addDesc('value\t 更新对应节点{ID,name,isParent}的属性注意ID属性如果修改相当于重新选中并自动设置checkbox');
            _.addDesc('add\t 在value节点下添加新的节点并排在最后{ID,name,isParent:true/false}');
            _.addDesc('remove\t 在value节点下删除新的节点{ID 必需,name,isParent:true/false}');
            _.addDesc('values\t [{ID,name,isParent}] 数组方式添加一系列子节点一般用于Expend时的加载使用');
            _.addDesc('事件：\r\n onExpend(value) 仅在树或者子树第一次加载时调用 可用于动态加载子菜单，特别地在首次加载时value值为空，请注意处理');
            _.addDesc('onClick\t(value) 点击事件');
            _.addDesc('onMenuClick\t(value,name) 菜单点击事件');
            _.addDesc('定义 tree: {path: "zTreeStyle.css;jquery.ztree.core-3.5.min.js;../../Style/module/part/tree.css;../../Scripts/module/part/tree.js" },');
            __.setting = {
                check: {
                    enable: _.params.data.isChecked
                },
                callback: { //回调函数  
                    onRightClick: function (e, id, json, flag) {
                        if (_.menu && json) {
                            json.clickFlag = flag;
                            _.menu.css({ top: e.clientY - 10, left: e.clientX - 10, display: 'block' }).show();
                            _.menu.focus();
                            __.nodes[json.ID] = json;
                            _.vm.data.value = __.datas[json.ID];
                        }
                        V.stopProp(e);
                        return false;
                    },   //处理为菜单事件  
                    onClick: function (e, id, json, clickFlag) {
                        json.clickFlag = clickFlag;
                        __.nodes[json.ID] = json;
                        _.vm.data.value = null;
                        _.call('click', { value: __.datas[json.ID] });
                    },
                    onExpand: function (e, id, json) {
                        _.vm.data.value = null;
                        __.nodes[json.ID] = json;
                        if (!json.children)
                            _.call('expand', { value: __.datas[json.ID] });
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
                    case 'menuclick':
                        break;
                    default:
                        _.bindEvent(_.node, k, v);
                        break;
                }
            }, function () {
                __.onLoad(node);
                _.tree = $.fn.zTree.init(node, __.setting, null);
                node[0].oncontextmenu = function () { return false; }
                //第一次触发扩展事件
                _.call('expand', { value: null });
            });
        };
        //_.fill = function () { return { value: _.tree ? _.tree.getSelectedNodes() : null} }; //todo 
        __.datas = {};
        __.nodes = {};
        _.render = function (data) {
            V.forC(data, function (k, v) {
                switch (k.toLowerCase()) {
                    case 'values':
                        var vals = [];
                        V.each(v, function (v2) {
                            __.datas[v2.ID] = v2;
                            vals.push({ ID: v2.ID, name: v2.name, isParent: v2.isParent });
                        }, function () {
                            var pnode = _.vm.data.value ? __.nodes[_.vm.data.value.ID] : null;
                            _.tree.addNodes(pnode, vals);
                        });
                        break;
                    case 'value':
                        if (v.ID && __.nodes[v.ID]) {
                            __.datas[v.ID] = v;
                            V.merge(__.nodes[v.ID], { ID: v.ID, name: v.name, isParent: v.isParent, checked: true }, true);
                            //兼容check模式
                            _.tree.updateNode(__.nodes[v.ID]);
                            _.tree.selectNode(__.nodes[v.ID]);
                        }
                        break;
                    case 'add':
                        if (_.vm.data.value && _.vm.data.value.ID && __.nodes[_.vm.data.value.ID]) {
                            __.datas[v.ID] = v;
                            var pnode = _.vm.data.value ? __.nodes[_.vm.data.value.ID] : null;
                            _.tree.addNodes(pnode, [{ ID: v.ID, name: v.name, isParent: v.isParent }]);
                        }
                        break;
                    case 'remove':
                        if (v.ID && __.nodes[v.ID]) {
                            delete __.datas[v.ID];
                            _.tree.removeNode(__.nodes[v.ID]);
                            delete __.nodes[v.ID];
                        }
                        break;
                    case 'menu':
                        if (_.menu) _.menu.remove();
                        else {
                            _.menu = V.newEl('div', 'c_tree', '').hide().on('click', 'span', function (e) {
                                var _this = $(this);
                                var par = _this.parent('div');
                                if (par.attr('name')) {
                                    _.call('menuclick', { name: par.attr('name') });
                                    _.menu.hide();
                                }
                            }).hover(function () { }, function () { $(this).hide(); }).appendTo(document.body);
                            var menu = V.newEl('div', 'c_tree_inner', '').appendTo(_.menu);
                            V.forC(v, function (k2, v2) {
                                var item = V.newEl('div', 'c_tree_item', '').appendTo(menu);
                                if (!v2.name) v2 = { name: v2, icon: '' };
                                item.attr('name', v2.name).append('<span class="c_tree_icon" style="background-image:url(' + v2.icon + ');">&nbsp;</span><span class="c_tree_name">' + k2 + '</span>');
                            });
                        }
                        break;
                }
            }, function () {
                data = __.render(data);
            });
        }
    });
})(VJ, VJ.view, jQuery);