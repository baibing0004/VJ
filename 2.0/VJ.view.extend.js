(function (V, $, W, M) {
    {
        W.TextBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<span><span style="display:none;"></span><input type="text"/></span>', vm || {}]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                _.txt = node.find('span:first');
                _.input = node.find('input:first');
                V.forC(_.events, function (k, v) {
                    switch (k) {
                        case 'hover':
                            _.node.hover(function () {
                                if (node.parents("[disabled]").length > 0) return;
                                _.call('Hover', { hover: true });
                            }, function () {
                                if (node.parents("[disabled]").length > 0) return;
                                _.call('Hover', { hover: false });
                            });
                            break;
                        case 'error':
                            if (_.get().validate) {
                                _.validate(_, _.input);
                            }
                            break;
                        default:
                            _.bindEvent(_.input, k, v);
                            break;
                    }
                }, function () { __.onLoad(node); }, true);
            };
            _.fill = function () {
                var value = $.trim(_.input.val());
                value = (value == _.vm.data.title || value == _.vm.data.error) ? "" : value;
                return { text: value, value: value };
            };
            _.render = function (data) {
                data = __.render(data);
                _.input.off('focus').on('focus', function () { if (_.input.val() == _.vm.data.error || _.input.text() == _.vm.data.error) { _.input.val(''); } });
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'enable':
                            if (value) { _.input.removeAttr('disabled'); } else { _.input.attr('disabled', 'disabled'); }
                            break;
                        case 'title':
                            if (value) {
                                _.input.off('mousedown').on('mousedown', function () { console.log('focus'); if (_.input.val() == value || _.input.text() == value || _.input.val() == _.vm.data.error || _.input.text() == _.vm.data.error) { _.input.val(''); } });
                                _.input.off('blur').on('blur', function () { if (_.input.val() == '' && _.input.text() == '') _.render({ value: value }); });
                            }
                            break;
                        case 'text':
                        case 'value':
                            if (typeof (value) != 'boolean' && 'false' != ('' + value).toLowerCase() && 'undefined' != ('' + value).toLowerCase()) {
                                _.input.val(value);
                                if (_.vm.data.title && !V.isValid(value)) _.input.val(_.vm.data.title);
                            } else {
                                _.input.val('');
                            }
                            break;
                        case 'name':
                            _.input.attr('name', value);
                            delete data[key];
                            break;
                        case 'key':
                            _.txt.text(value).show();
                            delete data[key];
                            break;
                        case 'size':
                            _.input.attr('size', value);
                            delete data[key];
                            break;
                        case 'kind':
                            _.input.attr('type', value);
                            delete data[key];
                            break;
                        case 'maxlength':
                            _.input.attr('maxlength', value);
                            delete data[key];
                            break;
                    }
                });
                return data;
            };
            _.animate = function (name, func) {
                _._animate(name, _.input, func);
            };
        };
        W.RadioBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.TextBox, [path || '<span><span style="display:none;"></span><input type="radio"/></span>', vm]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.fill = function () {
                return { checked: _.input.attr('checked') ? true : false };
            };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'checked':
                            V.setChecked(_.input, value);
                            delete data[key];
                            break;
                    }
                });
                return data;
            };
        };
        W.CheckBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.RadioBox, [path || '<span><span style="display:none;"></span><input type="checkbox"/></span>', vm]]);
            }
        };
        W.Select = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<span><span style="display:none;"></span><select></select></span>', vm]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                _.txt = node.find('span:first');
                _.sel = node.find('select:first');
                V.forC(_.events, function (k, v) {
                    _.bindEvent(_.sel, k, v);
                }, null, true);
                if (_.events.error && _.get().validate) {
                    _.validate(_, _.input);
                }
                __.onLoad(node);
            };
            _.fill = function () {
                return { value: _.sel.find("option:selected").val() };
            };
            _.render = function (data) {
                data = __.render(data);
                var setValue = function (value) {
                    _.sel.find(':selected').attr('selected', false);
                    _.sel.find('option[value="' + value + '"]').attr('selected', true);
                };
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'values':
                            if (V.getType(value) == 'string') {
                                value = eval('(' + value + ')');
                            };

                            if (V.userAgent.ie7 || V.userAgent.ie8) {
                                V.forC(value, function (k, v) {
                                    var opn = document.createElement("OPTION");
                                    _.sel.get(0).appendChild(opn); //先追加
                                    if (_.vm.data.value && _.vm.data.value == v) {
                                        opn.selected = true;
                                    }
                                    opn.innerText = k;
                                    opn.value = v;
                                }, function () {
                                    //神奇的Bug select重新填写需要改样式
                                    V.once(function () { _.sel.css('display', 'none').css('display', 'block') });
                                }, true);
                            } else {
                                var sb = V.sb();
                                V.forC(value, function (k, v) {
                                    sb.appendFormat('<option value="{value}">{key}</option>', { key: k, value: v });
                                }, function () { _.sel.empty().html(sb.clear()); sb = null; if (_.vm.data.value) { setValue(_.vm.data.value); } });
                            }
                            break;
                        case 'value':
                            setValue(value);
                            break;
                        case 'name':
                            _.sel.attr('name', value);
                            break;
                        case 'key':
                            _.txt.text(value).show();
                            break;
                    }
                });
                return data;
            };
            _.animate = function (name, func) {
                _._animate(name, _.sel, func);
            };
        };
        W.Hidden = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<input type="hidden"/>', vm]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                V.forC(_.events, function (k, v) {
                    switch (k.toLowerCase()) {
                        case 'error':
                            if (_.get().validate) {
                                _.validate(_, _.node);
                            }
                            break;
                        default:
                            _.bindEvent(node, k, v);
                            break;
                    }
                }, null, true);
                __.onLoad(node);
            };
            _.fill = function () {
                return { val: _.node.val() };
            };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'value':
                            _.node.val(value);
                            break;
                        case 'name':
                            _.node.attr('name', value);
                            break;
                    }
                });
                return data;
            };
        };
        W.PasswordBox = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.TextBox, [path || '<span><span style="display:none;"></span><input type="password"/></span>', vm]]);
                __.render = _.render;
            }
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'alt':
                        case 'passchar':
                            _.input.attr('alt', value);
                            break;
                    }
                });
                return data;
            };
        };
        W.Button = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.TextBox, [path || '<span><span style="display:none;"></span><input type="button"/></span>', vm]]);
                __.render = _.render;
            }
            _.fill = function () { return {}; };
            _.render = function (data) {
                data = __.render(data);
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'name':
                            _.input.attr('name', value);
                            break;
                        case 'key':
                            _.txt.text(value).show();
                            break;
                        case 'text':
                            _.input.val(value);
                            break;
                    }
                });
                return data;
            };
        };
        W.Submit = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Button, [path || '<span><span style="display:none;"></span><input type="submit"/></span>', vm]]);
            }
        };
        W.Reset = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Button, [path || '<span><span style="display:none;"></span><input type="reset"/></span>', vm]]);
            }
        };
        //todo 获取其validata对象与方法 进行同步验证
        W.Form = function (path, vm) {
            var _ = this, __ = {};
            {
                V.inherit.apply(_, [W.Control, [path || '<form method="get" action=""></form>', vm || { data: { enctype: 'multipart/form-data' } }]]);
                __.render = _.render;
                __.onLoad = _.onLoad;
            }
            _.onLoad = function (node) {
                V.forC(_.events, function (k, v) { _.bindEvent(node, k, v) }, function () { __.onLoad(node); }, true);
                _.cons = [];
                node.find('[_]').each(function (i, v) {
                    _.cons.push($(v).attr('id'));
                });
            };
            _.fill = function () {
                var value = {};
                if (_.cons)
                    V.each(_.cons, function (v) {
                        var vm = _.parent.vms[v] ? _.parent.vms[v] : _.page.vms[v];
                        if (vm && vm.nodeName != 'fill') {
                            value[v] = vm.get().value;
                        }
                    }, null, true);
                return { value: value };
            };
            _.render = function (data) {
                V.forC(data, function (key, value) {
                    switch (key) {
                        case 'method':
                            _.node.attr('method', value);
                            break;
                        case 'action':
                            _.node.attr('action', value);
                            break;
                        case 'target':
                            _.node.attr('target', value);
                            break;
                        case 'name':
                            _.node.attr('name', value);
                            break;
                        case 'enctype':
                            _.node.attr('enctype', value);
                            break;
                        case 'valid':
                            if (value) {
                                delete data.valid;
                                var cons = Array.prototype.slice.call(_.cons, 0);
                                V.whileC2(function () { return cons.shift(); }, function (v, next) {
                                    var vm = _.parent.vms[v] ? _.parent.vms[v] : _.page.vms[v];
                                    if (vm) {
                                        vm.update({ valid: next });
                                    }
                                }, function () {
                                    value.apply(null, []);
                                });
                            }
                            break;
                        case 'value':
                            if (value) {
                                V.each(_.cons, function (v) {
                                    var vm = _.parent.vms[v] ? _.parent.vms[v] : _.page.vms[v];
                                    if (vm) {
                                        if (vm.nodeName == 'fill') {
                                            vm.update({ value: value ? value : {} });
                                        } else
                                            vm.update({ value: value[v] });
                                    }
                                });
                            }
                            break;
                    }
                }, function () {
                    __.render(data);
                });
                return data;
            };
        };
        //构建时需要swiper.js	
        /*2016-1-18 被pagePanel取代	
        W.SwiperPanel = function(path,vm){
        var _ = this,__ = {};
        {
        V.inherit.apply(_,[W.Control,[path || '<div class="swiper-container"></div>',vm || {}]]);
        __.onLoad = _.onLoad;
        __.render = _.render;
        _.params = {direction:'horizontal',loop:false,simulateTouch:true};				
        }
        _.onLoad = function(node){				
        V.forC(_.events,function(k,v){
        switch(k){
        case 'change':
        _.params.onSlideChangeEnd = function(){_.call('change');};
        break;
        default:
        _.bindEvent(node,k,v);
        break;
        }
        });
        __.onLoad(node);
        };
        _.fill = function(){
        return {value:_.swiper?_.swiper.activeIndex:undefined};
        };
        _.render = function(data){
        var needRB = false;
        data = __.render(data);
        if(!_.swiper){
        var child = _.node.children().addClass('swiper-slide');
        _.node.append('<div class="swiper-wrapper"></div>');				
        _.wrapper = _.node.find('.swiper-wrapper');
        _.wrapper.append(child);					
        }
        _.params.simulateTouch = true;
        V.forC(data,function(k,v){				
        switch(k.toLowerCase()){
        case 'visible':
        if(v && _.swiper){
        _.swiper.onResize();
        }
        break;
        case 'direction':
        needRB = true;
        _.params.direction = v;
        switch(v){
        case 'vertical':
        _.node.attr('panelaction','vol');
        break;
        case 'horizontal':
        _.node.attr('panelaction','hor');
        }
        break;
        case 'autoplay':
        needRB = true;
        if(v){
        _.params = V.merge(_.params,{
        autoplayDisableOnInteraction : false,
        autoplay:true==v?3000:parseInt(v+'')
        });
        } else {
        _.params = V.merge(_.params,{
        autoplayDisableOnInteraction : true,
        autoplay:0
        });							
        }
        break;
        case 'loop':		
        needRB = true;			
        if('true'==(v+'').toLowerCase()){
        _.params = V.merge(_.params,{
        freeMode : false,
        freeModeSticky : false,
        freeModeMomentumRatio:0,
        loop:true
        });
        } else {
        _.params = V.merge(_.params,{
        freeMode : true,
        freeModeSticky : true,
        freeModeMomentumRatio:0,
        loop:false
        });								
        }
        break;
        case 'scrollbar':
        needRB = true;
        if('true'==(v+'').toLowerCase()){
        if(_.node.find('div.swiper-scrollbar').length==0){
        _.node.append('<div class="swiper-scrollbar"></div>');
        }
        _.params.scrollbar = _.node.find('div.swiper-scrollbar')[0];								
        _.params.simulateTouch = false;
        } else if(_.node.find('div.swiper-scrollbar').length>0){
        _.node.find('div.swiper-scrollbar').remove();
        delete _.params.scrollbar;
        }							
        break;
        case 'effect':
        needRB = true;
        switch((v+'').toLowerCase()){
        case 'true':
        _.params.effect = 'fade';
        break;
        case 'false':
        delete _.params.effect;
        break;
        case 'cube':
        case 'coverflow':
        _.params.effect = (v+'').toLowerCase();
        break;
        }							
        break;
        case 'buttons':
        needRB = true;
        if('true'==(v+'').toLowerCase()){
        if(_.node.find('div.swiper-button-prev').length==0){
        _.node.append('<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>');
        }
        _.params = V.merge(_.params,{
        prevButton:_.node.find('div.swiper-button-prev')[0],
        nextButton:_.node.find('div.swiper-button-next')[0],
        simulateTouch:false
        });
        } else if(_.node.find('div.swiper-button-prev').length>0){
        _.node.find('div.swiper-button-prev').remove();
        _.node.find('div.swiper-button-next').remove();
        delete _.params.prevButton;
        delete _.params.nextButton;
        }							
        break;
        case 'pagination':
        needRB = true;
        if('true'==(v+'').toLowerCase()){
        if(_.node.find('div.swiper-pagination').length==0){
        _.node.append('<div class="swiper-pagination"></div>');
        }
        _.params = V.merge(_.params,{
        pagination :_.node.find('div.swiper-pagination')[0],
        paginationClickable:true,
        simulateTouch:false
        });
        } else if(_.node.find('div.swiper-pagination').length>0){
        _.node.find('div.swiper-pagination').remove();
        delete _.params.pagination;
        delete _.params.paginationClickable;
        }							
        break;
        case 'touch':
        needRB = true;
        if('true'==(v+'').toLowerCase()){								
        _.params.simulateTouch=true;
        _.params.onlyExternal = false;
        } else {															
        _.params.simulateTouch=false;
        _.params.onlyExternal = true;
        }		
        break;
        case 'value':
        if(_.swiper){
        _.swiper.slideTo(v);
        } else {
        _.params.initialSlide = v;
        }
        break;
        }
        },function(){
        if(needRB){
        if(_.swiper){
        _.swiper.destroy(true);
        _.swiper = null;
        }
        if(!Swiper) {throw new Error('请更新config.js中SwiperPanel节点对Swiper.js引用');}
        _.swiper = new Swiper(_.node[0],V.merge({},_.params));
        }					
        });
        return data;
        };
        };
        */
    }
})(VJ, jQuery, VJ.view, VJ.viewmodel);