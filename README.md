#![VJ](https://raw.githubusercontent.com/baibing0004/VJ/master/chm/img/VJ.png)
##VJ是什么，能干什么？
* VJ本身提供的不是一个瑰丽的UI框架，甚至特别绚丽的单一界面功能,而是更加方便地在不改动原有代码的情况下应用各种炫控件和新逻辑的可能：
    * 它首先改变的是 **你对JS的看法**；
    * 它是一个将页面甚至应用进行 **层次分明，抽丝剥茧的划分与配合的思想体系**；
    * 它是一个 **为了节省代码又能很好的配置化插入式编程**的代码工具；
    * 它是一个鼓励 **js控件、组件、模块开发、复用甚至在不同公司间分享**的跨越所谓的AMD,CMD划分的社区；
    * 它是一个很好的实现 **逻辑归逻辑、设计归设计、数据归数据** 的前端开发模式；
    * 是一个允许 **随时兼容各种新的H5技术和框架又不需要改动任何原有逻辑代码** 就可以完成升级的神奇架构设计；
    * 是一个可以 **一键升级替换所有控件与表现层又能保证业务逻辑正确** 的神马框架。 
    
---                      

### 那么问题来了VJ是怎么实现呢？  
 * 根据快速UI更新，快速迭代的需求与写的越少，错的越少的编程规律，分层化控件化成为VJ提高效率不加班快速开发的核心方法思想，所以**代码=框架+构件（控件，组件，模块)+例外(单页面的逻辑代码）**成为VJ的设计思路
 * 于是VJ将 **控件（跨行业通用UI控件譬如 按钮)\组件(行业专用的UI控件譬如 商品列表)\模块(公司专用的独立业务逻辑的完整控件譬如 购物车)** 与其业务逻辑和调用分离成两个部分:
    * 控组模部分：控件、组件、模块通过继承自VJ.view.Control的独立js代码段+html代码段或者文件/css进行独立开发和发布（如下代称`控组模`）
    * 逻辑代码部分：Html内通过'_'属性来定义的自定义的标签，
    通过自定义的html标签名表明自定义控件的类型，通过定义Id与逻辑控件绑定。
    用户页面代码（例外代码）通过继承`VJ.viewmodel.Page`并填写构造参数json设
    置与id对应的相关控件、组件、模块的JS逻辑控件属性与事件
    ，最终由`VJ.view.Page`类完成页面控件创建，初始化，替换标签与绑定工作，
    调用页面逻辑控件处理业务逻辑。
    
---

 * 要想完成这个过程就必须有个地方来管理用户自定义标签对应的控组模：
     * VJ通过`VJ.middler.Middler`定义的IOC容器分别将公共控件库，公共逻辑对象，数据访问对象分别定义和组织了起来，这样就需要一个独立的json配置代码段或者json配置文件，一般是根目录下的***config.js*** 配合`VJ.viewmodel.Page`完成了这个工作。
     * 为了完成业务逻辑会话和数据交互是必不可少的，VJ将逻辑代码中与会话和数据操作有关的部分再次分离，完成了五花八门的业务处理与乱七八糟的数据访问分离的任务。这就是独立json配置代码段或者json配置文件一般是根目录下的***ni.js*** 配合`VJ.viewmodel.Page`完成了这个工作。 

            那为毛不用$.cookie,$.ajax非要换成`this.session`,`this.ni`去调用呢?  
            因为基于统一的Middler容器，VJ框架才可以:  
            * 在不改动用户代码的情况下仅修改config.js便可以更换用户标签对应的UI控件、组件、模块  
            * 在不改动用户代码的情况下仅修改config.js更改某个会话是存放cookie还是sessionStorage,是明文还是加密，  
            * 在不改动用户代码的情况下仅修改ni.js配置某个数据请求是否需要缓存，是json还是jsonp，是ajax还是webdb甚至是WebSocket。  

 * 具体来说，就是用户的页面代码继承`VJ.viewmodel.Page`，用获取到的内置的会话管理对象`this.session(data(key),update(key,{json}))`完成了会话管理，通过内置的数据管理对象`this.ni(excute(command，params，function))`完成了数据访问管理。
        	是的，这一切都是可以通过配置在 不改动用户代码 的情况下，分分钟搞定的。
 * 至此VJ将开发人员做了清晰的分类：  
		1. config.js+公共控组模由前端架构组负责  
		2. page.html+page.js+私有组模由业务开发组+UI负责  
		3. ni.js+各种后端由服务组+架构组负责。  
 * 这样前端架构组就可以不断的研究新的技术和更新目前的控件，业务人员简单快速响应业务需求并提请架构组改进控件（实际上SQL也应该由业务人员开发保证快速开发，VESH.Net已经实现SQL的自动转换成数据而无需编译），然后后端服务架构组人员根据业务人员编写的***ni.js***和后端SQL快速修改成适合线上架构的服务和部署配置.
 * 如此三方职责清晰，工作有序地将业务开发组的高人，全人，能人抽取出来做持续的事情，让业务开发无需复杂快速完成工作，让后端集中考虑性能和优化，让任务不再全摊到每个业务人员的身上，解决想做高大全的事情却总做出来低小烂的困惑，是一件多么惬意的事情啊！
 * 发散的想，PC，平板，手机三合一已经喊了许久，怎么能更好的实现呢？目前看还是手机统一其他两个平台居多，其他两个平台都是被动兼容手机样式的，很多IM的网页版就是这样做的。在VJ里其实很简单，如果配置文件也是动态加载的那么问题就解决了。不管是后台生成***config.js***还是页面根据userAgent加载不同的***config.js***这都是不错的选择（因为Page控件也是动态加载替换的），这也将是VJ3.0的努力方向，2.0将主力解决各种平台下对逻辑控件种类和标准属性的定义，推荐产生某些方面的控件库解决方案。
 
 ---

###好了，VJ介绍完了，再说点题外话：

 * VJ是属于Web 4层架构**VESH**中的V层实现，**VESH**本身也是分层分控件思想下的Web架构产物，VJ与VESH结合产生更多神奇的功能，具体可参见附录A

##简单例子
 * 简单类定义  VJ类定义的推荐格式，当然仅仅是推荐。核心仍然是VJ.inherit.apply方法的调用
```
var classname = function(构造参数){
    //分别定义公共this与私有对象为_,__
    var _ = this,__ = {};
    {
        VJ.inherit.apply(_,[父类名,[父类构造参数]]);
        //执行私有/公开的属性定义与私有方法定义
        __.funcA = funtion(){};
        __.propertyA = 1;
        _.propertyA = 1;
        //__.父类方法名 = _.父类方法名 准备用于覆盖父类方法，并准备父类方法的调用方式
        __.funcB = _.funcB
    }
    //准备公开方法定义
    _.funcA = function(){};
    //执行覆盖的父类方法
    _.funcB = function(){__.funcB();};
    {
        //初始化完成 调用构造方法
        __.funcA();
    }
}
```
 * 简单页面应用
```
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta charset="UTF-8"/>
        <title>VJ demo</title>
        <script src="VJ/jquery-1.8.0.min.js" type="text/javascript"></script>
        <script src="VJ/VJ.min.js" type="text/javascript"></script>
        <!--通用IOC配置文件-->
    	<script src="config.js" type="text/javascript"></script>
        <!--通用ni数据访问配置文件-->
    	<script src="ni.js" type="text/javascript"></script>
    </head>
    <body>
        <form id='frmMain' Action="" _>
    		<p><TextBox id="txt" _="key:'输入框:'"></TextBox></p>
            <p><div id="txt2" _="key:'输入框2:',type:'TextBox'"></div></p>
    	</form>
        <script type="text/javascript">
            //根据尾部的定义 分别定义VJ的假名为V,VJ.viewmodel的假名为M,jQuery的假名为$,当然不用也可，这里仅仅是为了定义独立的命名空间和统一替换框架所用。
            (function(V,M,$){
                //定义VJ的状态为测试状态
        		V.isDebug = true;
                //定义页面类的子类
    			new function(){
    				var _ = this,__ = {};
    				{
    					var cm = V.merge(window.top.config,{
    						Middler:{
                                //用于覆盖或者新增控件/组件/模块定义
                                //一般地使用VJ.view.Box作为新控组模的暂时替代类，测试控组模的位置和大小
                                //这里的test就是控件的标签名，必须小写以满足用户对标签的各种写法,type就是类全路径定义
    							'VESH.view':{                                    
                                    test:{type:'VJ.view.Box'}
                                },
                                //一般用于覆盖或者新增公共业务对象，其方法可以作为ni定义的ObjectDB数据库类型的一个实例被调用
                                //这里的类定义可以定义path:“path1;path2”方式定义为懒加载模式噢
                                'VESH.viewmodel':{}
    						}
    					});
                        //逻辑控件定义
    					var models = {
    						txt:{
                                //按照ID与html对应的控件绑定
                                //所有的属性定义都在data中
                                data:{value:'hello world!'},
                                //所有的事件定义都以on开头，控件决定实现那些事件
                                onClick:function(data,self){
                                    //看看现在的txt属性都有啥
                                    console.log(data);
                                    //所有页面控件都会在this中对应按照id访问
                                    console.log(this.txt2.get().value);
                                    //所有的更新方法都只能通过update({属性定义})方式调用控件进行 而且控件的属性在执行完成后会更新到他的data属性上。
                                    this.txt2.update({value:'hello'});
                                },
                                onLoad:function(data,self){
                                    //this代表所有的逻辑控件组成的json对象而self仅代表当前逻辑控件，data也是当前逻辑控件的最新data属性                                    
                                    self.update({key:'再输入',value:'这真是一个VJ.helloword!'});
                                }
                            },
                            //当前页面的ID默认为page 不可修改
    						page:{
                                //这是个页面初始化方法而各个控件都有自己的onLoad事件
    							onStart:function(data,self){
    								console.log('页面初始化完成'));
                                    self.update({title:'VJ来了!'});
    							}
                                onDispose:function(data,self){
                                    //页面发生跳转或者关闭时的事件处理
                                }
    						}
    					};
                        //继承并调用其构造方法，完成页面的定义
    					V.inherit.apply(_,[M.Page,[cm,models]]);
    				}
    			 };
    		})(VJ,VJ.viewmodel,jQuery);
    	</script>
    </body>
</html>
```
## 复杂例子
```
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta charset="UTF-8"/>
        <title>VJ demo</title>
        <!--添加对jQuery的引用，目前对jQuery没有版本高低限定-->
        <script src=VJ/jquery-1.8.0.min.js" type="text/javascript"></script>
        <!--添加对VJ2.0的引用-->
        <script src="VJ/VJ.min.js" type="text/javascript"></script>
        <!--添加对通用config.js的引用-->
        <script src="config.js" type="text/javascript"></script>
        <!--添加对通用ni.js的引用或者通过config.js配置为lazy加载也可以-->
        <script src="ni.js" type="text/javascript"></script>
    </head>
    <body>
        <form id='frmMain' Action="" _>
            <!--请注意自定义控件标签需要用"_"声明，其标签名需要与configs文件中VESH.view中的控件类名一致,其ID属性会与viewmodel中的同名对象进行绑定，如果没有对应的对象依然会在Page.controls 与 Page.view中访问的到，但是ID会是一个随机值。其"_"的信息会与控件的data属性信息合并，优先级为控件的data默认值<html中该控件的_属性<js中该控件的逻辑控件的data属性-->
            <p><textbox id="txt" _="key:'输入框:'"></textbox></p>
            <!--请注意如果自定义标签内还有html内容的，请用div定义然后在_的属性或者js对应ID的data属性中定义type:'控件类名'以取代直接说明标签名，否则其内部html内容会被原生JS抛弃,而且_属性的type定义高于js中的定义高于直接写明标签名，其余设置一切同上-->
            <p><div id="txt" _="key:'输入框:',type:'SwiperPanel'"><div>1</div><div>2</div><div>3</div></div></p>
            <script type="text/javascript">
                //VJ 范式定义独立的函数命名空间防止公共函数名彼此干扰，并将VJ,VJ.viewmodel,jQuery,config.js中的configs对象作为缩写传入命名空间。
                (function(V,M,$,cm){
                    /*自定义控件，需要实现三个方法分别是onLoad,fill,render,并在继承VJ.view.Control时修改构造函数的值为控件真实的地址或者html*/
                    var textbox = function(){
                        var _ = this,__ = {};
                        //默认这里是构造方法进行继承、变量定义与私有方法定义
                        {
                            //这里注意修改其第二个方括号中的字符串为控件html地址或者html标签代码
                            VJ.inherit.apply(_,[VJ.view.Control,['<input type="text" style="display:none;"></input>']]);
                            //这里注意将父类中的方法使用__私有对象进行保持以便后面调用
                            __.render = _.render;
                            __.onLoad = _.onLoad;
                        }
                        //在控件替换成真实的控件Html时调用，其参数node与_.node不同，请使用node参数对象进行变量定义与事件绑定工作，一般地_.events对象是默认的构造函数分析逻辑控件的on开头的方法后放入的键值对，这里调用父类方法bindEvent是使用jQuery定义的事件方法绑定了node对象上的同名事件，如果没用定义上默认也不会发出警告，只是逻辑控件的事件函数不会被正常调用。第三个函数表示在异步处理的最后阶段调用父类的onLoad方法完成标签对象替换和onLoad（VJ对每个逻辑控件都有）事件触发。
                        _.onLoad = fucntion(node){
                            V.forC(_.events,function(k,v){_.bindEvent(node,k,v);},function(){__.onLoad(node);});
                        };
                        //默认在每次调用事件时调用此方法更新逻辑对象的data属性
                        _.fill = function(){return {text:_.node.val()}};
                        //在父类onLoad事件和逻辑对象的update({})命令中被调用，在onLoad事件中是在控件标签替换完成之后调用的，所以可以使用_.node或者onLoad方法中定义的各种控件部分对象。该方法本质就是处理逻辑控件修改data后对真实控件标签完成处理，本质上只有在每次onLoad调用时才会传入完整的data属性进行处理，在处理逻辑控件的data对象时，仅仅处理更新的部分，保证处理效率。
                        _.render = function(data){
                            //先调用父类方法完成对enable visible attr属性设置，addClass,removeClass等命令
                            data = __.render(data);
                            //再处理控件的特有属性与方法的设置
                            VJ.forC(data,function(key,value){
                                switch(key){
                                    case 'text':
                                        _.node.val(value);
                                    break;
                                }
                            });
                        };
                    };
                    //页面开始
                    new function(){
                        //VJ OO对象的范式 首先定义 _ 为 this __ 为所有私有对象的
                        var _ = this,__ = {};
                        {
                            //设置VJ的debug状态为真
                            V.isDebug = true;
                            //继承VJ.viewmodel.Page对象并进行初始化
                            V.inherit.apply(_,[M.Page,[cm,{
                                txt:{
                                    //针对页面上已有的id为txt控件，其构造类型以html为准但是如果没有id相对应那么会以type属性定义的控件为准
                                    type:'textbox',
                                    //构造参数默认值，其控件的所有属性都由fill方法填充此属性
                                    data:{text:'hello world'},
                                    onLoad:function(data,self){
                                        //在对应控件完成标签替换和生成后调用 请注意函数内部的this 不等于页面的_ 而是页面的逻辑对象 譬如 在这里调用this.txt.data就可以访问到自身对象的data属性
                                        //当然this.txt == self，this.txt.data == data,在这个方法开始逻辑控件就可以调用this.txt.update({text:'abc'})，这个方法由其对应的页面控件定义注入到逻辑控件中
                                        //如下三个方法是等价的 this.txt.update({text:'abc'}) == self.update({text:'abc'}) == return {text:'abc'};
                                    },
                                    onClick:function(data){
                                        //绑定的控件点击事件
                                        //jQuery默认事件都可以通过 data.e获取jQuery定义的事件对象
                                    },
                                    onHover:function(data){
                                        //绑定的控件特有的hover事件 这个事件与jQuery中的hover事件冲突 需要控件单独实现 否则这里只能获取到进入状态。
                                        console.log(data);
                                    },
                                    onKeyPress:function(data,self){
                                        //这里的事件名会自动转换成小写字符以便与jQuery中的keypress事件相绑定
                                        console.log(data);
                                    }
                                },
                                //规定page为页面逻辑控件
                                page:{
                                    data:{title:'测试页面'},
                                    onStart:function(data,self){
                                        //页面初始化事件，默认在这里开始就可以访问父类提供的 _.configs,_.middler,_.ni,_.session对象
                                        //_.config为配置对象与Page构造函数传入的config对象不同，是VJ.configs框架的实例，提供getConfig('configs二级节点名').getValue('configs三级节点名由二级节点名的框架决定将配置文件的中的对应节点转换成的JS对象方式')的继承式链式配置文件服务。
                                        //_.middler为IOC对象 提供getObjectByAppName与getTypeByAppName方法供用户使用IOC反射出来的JS对象
                                        //_.ni为DB对象 提供excute方法供用户访问各种数据媒介和缓存数据逻辑
                                        //_.session为会话对象 提供兼容多种数据媒介的会话记录
                                        var __ = this;
                                        VJ.once(function(){
                                            __.txt.update({enable:true,visiable:true,text:'22233'});
                                        },2000);
                                        //调用的是template对象执行ni文件中的ajaxtest1方法，传入参数是 SONumber 处理数据的方法是 function(res) res是一个数据存放中介 调用res.get(方法名)或者res.each(方法名,function(){});可以遍历获取到的数据 如果需要多个template连续执行那么需要先使用_.middler获取tempate对象然后设置transaction=true 再连续调用excute之后 commit即可。
                                        _.ni.excute('template','ajaxtest1',{SONumber:10001103386854},function(res){
                                            //访问并循环数据访问，查找并遍历数据
                                            res.each('ajaxtest1',function(v){V.each(v,function(v){console.log(v);});});
                                        });
                                        //获取一个新的SessionDataManager对象 这里没有放回，一般在对象使用完成后需要调用_.middler.setObjectByAppName('APP名','对象名',对象实例) 才能实现对Middler框架中的对象保持机制的完整调用（一般适用于池方式,另外及时销毁也是一个对象使用的好习惯）
                                        console.log(_.middler.getObjectByAppName(M.APP,'SessionDataManager'));
                                        //session对象是SessionDataManager的实例 提供 _.session.get('会话名')+_.session.updateAll/ _.session.update()或者直接调用_.session.update('会话名',{会话改变值}) 两种方式都会更新会话信息其会话具体媒介和相关逻辑由传入Page构造函数时的第三个参数定义的Middler配置设置。
                                        _.session.update('ssss',{aaaa:22});                          
                                    },
                                    onDispose:function(){
                                        //默认当页面退出时调用的命令
                                        console.log('dispose');
                                    }
                                }
                            }]]);
                        }
                    }
                })(VJ,VJ.viewmodel,jQuery,VJ.merge(window.top.config,{
                    //递归合并config文件内容和特殊定义内容，由本页面的某些特殊配置覆盖公用配置实现对某些特有控件的创建与调用或者覆盖公共控件的具体类或者本页面的特殊对象定义等等功能
                    Middler:{
                        'VESH.view':{
                            //本页面特有控件 替换同名基础textbox控件
                            textbox:{type:'textbox',params:[]},
                        },
                        'VESH.viewmodel':{}
                    }                    
                }));
            </script>
        </form>
    </body>
</html>
```
##配置文件
 * config.js 配置文件 由继承VJ.config的多个VJ框架使用，最多的用于VJ.middler配置使用。
     * Middler节点是VJ.middler框架的配置节点，原理是由注册在VJ.config.Configs上的VJ.middler.MiddlerConfigConvert转换器负责将该节点的Json内容转换成VJ.config.Config的一个子类并覆盖getValue方法将对应的json配置转换成对应的JS对象。
     * Middler节点配置例子如下：  
```
    Middler:{
        //在一个AppName下可以设置默认的method,mode,path,pack等等参数
        appName:{
            //method 说明该AppName下的默认JS构造方法，如果不定义则默认为constructor，该值共有五种 constructor(构造函数也就是new这种方式)/bean(无参构造函数+set/get属性名方式设置属性方式)/factory(直接调用js方法方式)/constructorbean(构造函数+bean方式)/factorybean(工厂方法+bean方式) 后两种方式需要配合constructorparalength参数说明构造函数的参数个数
            method:'',
            //mode 说明该AppName下的JS对象保持方式，如果不定义则默认为Static，该值共有3种 static(静态单例)/instance(每次请求都新建)/pool(对象池模式保证池内对象数随着使用频率增减)
            mode:'',
            //host 说明该AppName下的host的path参数如果不用http://开始那么会自动添加host联合组成完整的地址
            host:'',
            //path 说明该AppName下的JS对象都来自于一个JS地址，如果不定义则默认为空,可以用;号隔开多个地址，VJ保证文件仅加载一次
            path:'',
            //
            //pack 说明该AppName下的JS对象都来自的包地址，如果不定义则默认为空，即使定义也仅限于具体对象的type属性以'.'开头时生效
            pack:'',
            //type属性定义了js对象的生成路径譬如(VJ.viewmodel.SessionDataManager)如果以'.'开头则将AppName的pack属性值+type属性值构成完整的type属性值 如果不定义type属性则被视作Objects数组定义，只返回params对象的转换值。
            //path属性定义了js对象的所在文件路径 如果不定义那么使用AppName下的默认值，如果多个js对象的path值相同那么在整个页面执行期间仅加载js文件一次
            //method属性定义js对象的构造方法，如果不定义那么使用AppName下的默认值
            //mode属性定义js对象的保持方式，如果不定义那么使用AppName下的默认值
            //constructorparalength属性仅在method为constructorbean/factorybean时生效，以区分构造函数或者工厂方法需要的参数个数，其后的参数使用bean方式进行设置
            //params 属性定义js对象的构造参数数组，其内部类型可以定义为一个AppName下的json对象定义，另一个AppName下的json对象定义，一个bean方式赋值使用的json对象，使用setItem方式赋值使用的json对象，原始的js类型（数字，字符串，js对象）等等，{self：true}对象会导致middler对象将当前的完整Config链实例作为参数。
            ObjectName:{type:'',path:'',method:'',mode:'',constractparalength:'',params:[
                //一个新的JS对象定义 其各个属性值都可以使用父对象的属性值作为默认值 当然其params属性还可以类似的进一步定义下去。这个js对象因为没有ObjectName所以无法被外部通过middler.getObjectByAppName方式访问，但是会被随机命名后放置在当前Middler的config空间中保存。从而实现CMD模型。
                {type:'',path:'',method:'',mode:'',constractparalength:''},
                //一个已有的JS对象引用，ref的定义格式使用'appName/objectName'方式定义路径，如果没有appName则默认是当前AppName下的对象
                {ref:''},，
                //一个json方式设置的属性值，如果在constructor模式下，会作为参数之一传递给构造函数，如果是bean模式下会自动添加在js对象上
                {a:1,b:2},
                //一个json方式设置的属性值，如果在constructor模式下，会作为参数之一传递给构造函数，如果是bean模式下会自动添加在js对象上 其定义效果与上个参数相同但是同名属性会覆盖上个参数中的同名属性
                {a:3},
                //一个json方式设置的属性值，如果在constructor模式下，会作为参数之一传递给构造函数，如果是bean模式下会自动添加在js对象上 其定义效果与上个参数相同但是同名属性会覆盖上个参数中的同名属性
                {b:4},
                //一个json方式设置的属性值，如果在constructor模式下，会作为参数之一直接传递给构造函数，如果是bean模式下会调用js对象的set属性名方法，将剩余属性作为两个参数调用该方法同样的属性值既可以是默认类型也可以是middler规定的js对象定义格式。
                {params:'属性名',a:1,b:2},
                //传统的js数据,不能作为bean方式下调用的数据
                '',
                //传统的js数据,不能作为bean方式下调用的数据
                1,
                //middler对象将当前的完整Config链实例作为参数传入仅能在constructor或者factory下使用或者作为bean方法模式下的一个子值
                {self:"true"},
				//middler对象允许通过这种方式获取定义对象的类作为参数，从而供这个类对象的构造函数获取到父类实现AMD功能
				{type:'VJ.middler.getTypeByAppName',params:[{self:true},'VESH.view','panel'],method:'factory',mode:'static'}				
            ]},
            //middler框架中对象数组的定义方式（不定义type属性，而且其各个属性值作为参数中的默认值向下传递，返回的数组对象为其params中定义的值
            ObjectsName:{path:'',method:'',mode:'',constractparalength:'',params:[
                {type:'',path:'',method:'',mode:'',constractparalength:''},
                {ref:''}
            ]}
        }
    }
```
     * 调用方法如下
```
    
    var middler = VJ.middler.getMiddlerFromObj(window.top.config);
    var session = middler.getObjectByAppName('VESH.viewmodel','SessionDataManager');
    session.get('key')
    session.update('key',{k:1,b:2});
```
     * 真实config.js

            1. 设计上Middler容易允许js对象的参数为一个新的js对象并且无限迭代定义下一级参数为一个新的对象。可以说是一个没下限的JS IOC框架。  
            2. 在VJ.viewmodel框架中要求定义'VESH.view'为控件命名空间，其中ObjectName为自定义控件的标签名（纯小写）;  
            3. 定义'VESH.viewmodel'为框架对象库，一般地最重要的是SessionDataManager的定义，其构造参数要求第一个参数为SessionDataAdapter，其负责将Page.session对象中的数据怎么按照session名同步到具体的会话媒介上，所以其构造参数第一个为默认的会话源，剩下的参数按照params的setResource方法分别设置特殊的会话源，并可以根据需求设置成加密的会话源;
            4. 定义'Ni'为框架template对象库，一般地定义template类型对象为最基础的Ni框架模板对象允许其执行excute命令完成数据访问工作，其构造参数中第一个为NiDataResource实例定义数据源的数据类型、相关连接串、数据类型与jsonp参数名，第二个为VJ.config.ConfigManager对象即对VJ.ni.NiConfigConvert转换的Ni结构的json实例的。
            5. 在template类型对象基础之上有三种高级装饰器，但是其对用户提供的方法excute的调用方式没有任何不同。仅仅是逻辑不同  
            6. 对象NiTemplateDecorator 缓存template装饰器，其允许传入两个NiDataResource实例，第一个为真实Resource，第二个为缓存Resource实例，第三个参数为缓存的默认缓存时间其逻辑允许用户在执行excute命令时，先查询命令.Clear或者命令.Cache是否存在如果存在那么先调用缓存方法如果存在缓存信息则不再执行真实的查询，如果没有缓存则执行查询并将结果按照命令.Set查询具体的命令方式存入缓存并传入cacheKey与cacheValue和原有参数供缓存命令选择使用，
            7. 对象NiLazyTemplateDecorator 懒加载缓存template装饰器，其参数类型与NiTemplateDecorator一致，但是逻辑不通，其允许用户执行命令时，选读取缓存，不管是否有缓存都会进行真实的查询，并调用命令.Set设置缓存 
            8. 对象NiMultiTemplateDecorator多节点Template装饰器，其前两个参数与NiTemplate相同，但是第三个参数为当前文件的ConfigManager对象，第四个参数为Middler下的Template类库AppName一般地为Ni，其允许在执行excute命令时根据命令定义的template参数重新查找template对象执行，否则就使用NiMultiTemplateDecorator的默认NiDataResource执行。
```
    window.top.config = {
        Middler:{
    		'VESH.view':{
    			pack:'VJ.view',
    			method:'constructor',
    			mode:'instance',
    			host:'../../VJ/2.0/',
    			page:{type:'.Page'},
    			textbox:{type:'.TextBox'},
    			radiobox:{type:'.RadioBox'},
    			checkbox:{type:'.CheckBox'},
    			select:{type:'.Select'},
    			hidden:{type:'.Hidden'},
    			passwordbox:{type:'.PasswordBox'},
    			button:{type:'.Button'},
    			submit:{type:'.Submit'},
    			reset:{type:'.Reset'},
    			form:{type:'.Form'},
    			box:{type:'.Box'},
    			radiolist:{type:'.RadioList'},
    			checklist:{type:'.CheckList'},
    			swiperpanel:{type:'.SwiperPanel',path:'swiper3.07.min.css;animate.min.css;swiper3.07.jquery.min.js;swiper.animate1.0.2.min.js'}
    		},
    		'VESH.viewmodel':{
    			pack:'VJ.viewmodel',
    			method:'constructor',
    			mode:'instance',
    			SessionDataManager:{type:'.SessionDataManager',mode:'static',params:[
    				{ref:'SessionDataAdapter'}
    			]},
    			SessionDataAdapter:{type:'.SessionDataAdapter',method:'constructorbean',mode:'static',constructorparalength:1,params:[
    				{ref:'CookieDataResource'},
    				{params:'Resource','abc':{ref:'CookieDataResource'}}
    			]},
    			CookieDataResource:{type:'.CookieDataResource',path:'2.0/jquery.cookie.js',mode:'static',params:[]}			
    		},
    		Ni:{
    			pack:'VJ.ni',
    			constructorparalength:false,size:50,app:'33',
    			method:'constructor',
    			mode:'static',
    			ajaxresource:{type:'.NiAjaxDataFactory'},
    			objresource:{type:'.NiObjectDataFactory'},
    			sqlitefactory:{type:'.NiSqliteDataFactory'},
    			cm:{type:'VJ.config.getApplicationConfigManagerFromJS',params:['ni','ni.js'],method:'factory'},
    			cm1:{type:'VJ.config.getApplicationConfigManagerFromObj',params:[window.top.ni],method:'factory'},
    			template3:{type:'.NiTemplate',mode:'instance',params:[
    				{type:'.NiPoolDataResource',params:[{ref:'ajaxresource'},{dbtype:'tjson',jsonp:'_bk'}]},
    				{ref:'cm'}
    			]},
    			template21:{type:'.NiTemplateDecorator',mode:'instance',params:[
    				{type:'.NiStaticDataResource',params:[{ref:'ajaxresource'},{dbtype:'tjson',jsonp:'_bk'}]},
    				{type:'.NiStaticDataResource',params:[{ref:'objresource'},{resource:window.sessionStorage}]},
    				{ref:'cm'},
    				{timeout:{interval:'s',number:50}}
    			]},
    			template2:{type:'.NiLazyTemplateDecorator',mode:'instance',params:[
    				{type:'.NiStaticDataResource',params:[{ref:'ajaxresource'},{dbtype:'tjson',jsonp:'_bk'}]},
    				{type:'.NiStaticDataResource',params:[{ref:'objresource'},{resource:window.sessionStorage}]},
    				{ref:'cm'},
    				{timeout:{interval:'s',number:50}}
    			]},
    			template1:{type:'.NiTemplate',mode:'instance',params:[
    				{type:'.NiPoolDataResource',params:[{ref:'ajaxresource'},{dbtype:'tjson',jsonp:'_bk'}]},
    				{ref:'cm'}
    			]},				
    			template:{type:'.NiMultiTemplateDecorator',mode:'instance',params:[
    				{type:'.NiStaticDataResource',params:[{ref:'ajaxresource'},{dbtype:'tjson',jsonp:'_bk'}]},
    				{ref:'cm'},
    				{self:true},
    				'Ni'
    			]},
    			sqltemp:{type:'.NiTemplateDecorator',mode:'instance',params:[
    				{type:'.NiStaticDataResource',params:[{ref:'sqlitefactory'},{name:'baibings',version:'1.0',desc:'baibings',size:2*1024*1024}]},
    				{type:'.NiStaticDataResource',params:[{ref:'objresource'},{resource:window.sessionStorage}]},
    				{ref:'cm'},
    				{timeout:{interval:'s',number:50}}
    			]}
    		}
    	}
    };
 ```
 * ni.js 配置文件 由继承VJ.config的多个VJ框架使用，最多的用于VJ.ni配置使用。
     * Ni节点是VJ.ni框架的配置节点，原理是由注册在VJ.config.Configs上的VJ.ni.NiConfigConvert转换器负责将该节点的Json内容转换成VJ.config.Config的一个子类并覆盖getValue方法将对应的json配置转换成对应的JS对象。
     * Ni节点配置说明和例子如下：

            1. Ni节点下的对象名为NiTemplate的excute命令中的第一个参数 其参数类型有command 即其对应的template的执行命令譬如针对使用ajax数据源的默认为ajax地址，dbtype为其返回的数据类型有json与tjson两种，params为其需要的参数默认值，template属性类型仅在用户使用NiMultiTemplateDecorator类型时有效指明其真正的template对象
            2. 特别注意命令.Cache/.Clear/.Set一般情况下是不需要写明command参数的缓存默认识别js对象/localStorage/sessionStorage的存取方式，如果需要覆盖则command需要为一个function,传入参数为用户调用template传入参数与命令默认参数和cacheKey,cacheValue的递归合并结果，返回一个满足dbType类型定义的数组对象
            3. 一般地Ni框架要求返回的对象尽可能满足如下格式 json类型的数据格式：([[{},{}],[{},{}]]) 第一级大括号为多表库，第二级大括号为具体的表，第三级json对象对应每行，当然也允许用户返回其特定的数据格式，但是尽可能是json格式,而tjson类型则是json格式进一步精简格式为([[[键名,键名],[键值,键值],[键值,键值]],[[],[],[]]]) 其中第一第二级与json格式相同，第三级将json中的键值对的键名抽取出来作为独立的一行，然后剩下的行则是各个json对象的值，其顺序与键名顺序对应，在Ni框架中会自动转换成与json类型相同的数据格式供用户访问。 json格式与VESH.Net中的*.json/*.jsonp的返回值对应，tjson格式与VESH.Net中的*.tjson/*.tjsonp的返回值相对应，一般情况下tjson只能处理多表数据，其传输大小会比传统json少1/3到1/2
```
    window.top.ni = {
        Ni:{
            ajaxtest11:{command:'http://localhost/VESHTest/Module/help/test.tjsonp?_n=recorder',dbtype:'tjson',params:{limit:11},template:'template2'},
            ajaxtest1:{command:'http://localhost/KDAPI/Module/GetOrderTrackItems.tjsonp?_n=Order',dbtype:'tjson',params:{},template:'template2'},
            'ajaxtest1.Cache':{dbtype:'json',params:{},template:'template2'},
            'ajaxtest1.Set':{dbtype:'json',params:{timeout:{interval:'h',number:24}},template:'template2'},
            sqlinsert:{command:'create table if not exists table1(name Text,message text,time integer);insert into table1 values(?,?,?);',dbtype:'json',params:{data:[]},template:'sqltemp'},
            sqlselect:{command:'select * from table1;',dbtype:'json',params:{data:[]},template:'sqltemp'},
            sqlselect2:{command:'select * from table1 where name=?',dbtype:'json',params:{data:[]},template:'sqltemp'}
    	}
    };
```
     * 调用方式如下：
```   
   //接上文 
    var ni = middler.getObjectByAppName("Ni",'template');
    ni.excute('template','ajaxtest1',{SONumber:10001103386854},function(res){
        res.each('ajaxtest1',function(v){V.each(v,function(v){console.log(v);});});
	})
```

##有问题反馈

 * 在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流  
 * 邮件：[@白冰](baibing0004@sohu.com)   
 * QQ: 26342049 群：3793554  

##VJ的构成

 * VJ中对应V2CES的5层划分,从下到上分别实现了如下层次:
     * VJ.base 提供对常用方法的封装，提供诸如对象继承、创建与递归合并的OO方法，提供同步+缓存的js/css加载功能，提供统一异常管理，提供异步的被动/主动方式循环处理对象与数组的方法，提供异步的循环处理方法，提供异步注册调用的统一事件处理机制，提供对Date对象与String的常用方法扩展，提供异步控件加载方法。是VJ其它框架的基础
     * VJ.config 作为基础框架为VJ的上层框架提供可继承的链式配置文件访问方式，保证由叶子到根部的配置节点方式，提供基础类库为上层框架配置对象解析支持。
     * VJ.collection 作为基础框架为VJ.middler框架提供Pool池方式的对象保持机制，提供对象池的自动增长，最大容量，自动缩减等等功能
     * VJ.middler 提供了一个支持**构造函数/Bean(无参构造+get/set属性名方式)/静态方法/构造+Bean方式/静态方法+Bean方式** 5种构造方法与 **Instance/Static/Pool**3种对象保持方式，**本地/远程懒加载**两种加载方式，**getObjectByAppName/getTypeByAppName** 两种对象访问方式的JS对象IOC反射容器框架，并依托config框架为ni框架和view,viewmodel层提供可继承的链式配置文件访问结构
     * VJ.ni 对应**VESH.view.storage**层次提供了一个可配置化的支持**localStorage/sessionStorage/JS对象/function/ajax/jsonp/webdb/websocket**等多种访问媒介，**直接读取/缓存再读取/缓存同步懒读取**等多种读取逻辑，**顺序与随机**两种读取方式，**js数组/json/tjson**三种dbtype数据类型的统一数据访问方法的dbstorage框架
     * VJ.viewmodel 对应 **VESH.view.viewmodel** 实现了对逻辑控件（就是``{data:{},on事件名:function(data,self){self.update({});}}``就可以定义一个纯粹的逻辑上的控件）定义与VESH.view.view层控件的绑定方式交互方法，提供SessionDataManager对象屏蔽了**Cookie/JS对象/localStorage/sessionStorage/ajax/jsonp**等多种存取渠道与**加解密存取方式**的无缝会话管理。提供VJ.viewmodel.Page实现了VESH.view.control的方法与导航管理，提供VJ.viewmodel.Control作为用户逻辑代码的处理基类。
     * VJ.view 对应 **VESH.view.view** 实现对逻辑控件的实现和扩展控件基类``VJ.view.Control``，提供了统一的Control加载处理，提供了自定义控件标签解析与统一事件触发机制管理机制``_.render``与``_.call``方法
 

##字典

###VJ.base
####VJ基础类

 * isValid:判断对象是否为undefined,null,"",false返回false
    * 例子：```VJ.isValid('') == false```
 * getValue:如果对象满足isValid那么返回对象，否则返回默认值
    * 例子 ```VJ.getValue('','未定义')```
 * format:格式化字符串，根据字符串中<%=key%>或者{key}的值将后续对象中的key值替换指定值，否则将格式化字符串的值替换为空
     * 例子：``` VJ.format('这是一个<%=key%>,{key}',{key:'测试'})```
 * sb:用于返回一个类StringBuilder实例，其方法有:
 > append function(data) 用于在最后添加一段文本  
 > appendFormat function(format,data) 用于按照格式化的方式添加一段文本  
 > insert function(start,data) 用于按照字符串的位置一段文本  
 > insertFormat function(start,format,data) 用于按照格式化的方法在指定位置插入一段文本  
 > remove function(start,length) 用于在指定的位置删除插入一段指定长度的文本  
 > toString function() 返回内部存储的字符串  
 > clear function() 清理内部存储的字符串 并一次性返回string结果，清理完成后实例仍然可以继续使用  
 > length function() 返回字符串的长度  

    * 例子
    ```
    var sb = VJ.sb();  
    var str = sb.append('{').appendFormat("{x}=={y}",obj).append('}').clear();
    ```
    
####VJ数组处理
 * isArray:判断对象是否是数组
    * 例子 ```VJ.isArray([1,2,3]) == true```
 * each:异步循环数组处理方法，其内部抛出的错误信息已经被VJ.tryC方法捕获 会在VJ.isDebug为真时，打印日志到Console上。
    * 例子 ```VJ.each([1,2,3],function(v){},[function(){处理完成时的方法},是否同步处理]) ```
 * once:一次性异步方法调用，如果该方法在等待时间内被多次调用那么会以最后一次执行时间为准，保证仅执行一次，且错误信息已经被捕获
    * 例子:```VJ.once(function(){},[随机时长 一般为1毫秒]);```
 * forC：异步对象属性循环处理方法，且错误信息已经被捕获
    * 例子：```VJ.forC(function(k,v){}[,function(){最终执行方法},是否同步执行]);```
 * forC2:异步对象属性循环处理方法，与forC不同的是next方法需要由单步处理函数调用，如果不调用不会自动向下执行，用于自由度更大的循环控制。且错误信息已经被捕获 
    * 例子:```VJ.forC2(function(k,v,next){next();}[,function(){最终执行方法},是否同步执行]); ```
 * whileC:异步条件循环处理方法 四个参数 exp 给出需要处理的值，func进行处理，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的保证前后两次调用是顺序的 第四个参数如果为真那么就是同步执行 且错误信息已经被捕获  
	* 例子:```VJ.whileC(function(){return array.shift();},function(v){}[,function(){最终执行方法},是否同步执行]);```
 * whileC2:异步条件循环处理方法 与whileC不同的是next方法需要由单步处理函数调用，如果不调用不会自动向下执行，用于自由度更大的循环控制。 且错误信息已经被捕获
    * 例子:```VJ.whileC2(function(){return array.shift();},function(v,next){next()}[,function(){最终执行方法},是否同步执行]);```

####VJ类处理
 * getType:获取JS对象的真实父类类型 一般是通过prototype方式实现的继承模式 同时也返回各种基础对象类型 譬如 string,function,object,number,Array,ukObject,父类名等等 
    * 例子:```VJ.getType({})```
 * inherit 使得当前子类继承父类的对象同时链接prototype原型链条，并调用父类的构造函数。尽可能使得JS的继承类似高级语言，但是请慎用对prototype继承的类采用此方法，经测试对非prototype类方法的继承和父类构造函数调用多级别或者多父类的继承都正常，但是对于prototype类型的连续继承超过2次以上就导致较底层次的prototype方法丢失。
    * 例子: ```VJ.inherit.apply(this,[parent,[……args]])```
 * create 使用类继承方法新建一个JS类的实例，适用于动态生成对象实例场景，有可能打断prototype类型的继承。
	 * 例子: ```var obj = VJ.create(Page,[para1,para2]);```
 * create2 使用eval原生命令方法新建一个JS类的实例，适用于动态生成对象实例的场景，不会打断prototype类型的继承，完全JS原生方法解释执行，但是类名要求使用string声明，而且eval的执行效率上理论较第一种较慢一些 
	 * 例子: ```var obj = VJ.create2('Page',[para1,para2]);```
 * merge 用于数组/json对象的递归合并功能，一般地jQuery的merge功能只能合并对象的一级属性，而这个方法可以用于递归合并各级属性或者数组，并支持多个对象进行合并，且用后者合并前者。moveIndex属性用于设定移动至的数组位置，mergeIndex只用于合并数组中的第几个对象
     * 例子：
    ```
        var ret = VJ.merge({a:22,c:23},{a:34,b:33},{d:"2334",f:true,g:function(){alert("hahaha");}},{h:[1,2,3,4]});
        var ret = VJ.merge({a:[{a:2},{b:3}]},{a:[{moveIndex:3,j:3},{k:4}],b:25});
        var ret = VJ.merge({a:[{a:2},{b:3}]},{a:[{mergeIndex:3,j:3},{k:4}],b:25});
    ```
 * userAgent 自动判断获取当前userAgent状态 分为ie/firefox/chrome/safari/opera/mobile/pad/pc等多种浏览器类型和手机，平板或者PC端 userAgent.name说明当前浏览器类型
   *  例如：```VJ.userAgent.name```
   *  例如：```var isDrag = false;$node.on('touchmove',function(){isDrag=true;})  
   $node.on(VJ.userAgent.pc?'click':'touchend',function(){if(!isDrag){**真实点击事件**}isDrag=false;})```
   
####VJ的Bug处理
 * isDebug 设置或者获取VJ的Debug状态默认为false，当其为真时，VJ.showException 会打印错误信息 否则不会打印 
	 * 例子:```VJ.isDebug = true;VJ.showException　//当VJ.isDebug为真是自动打印日志到console ```
	 * 例子:``` VJ.showException("这是测试:",new Error('错误信息'))```
     * 例子:``` VJ.tryC(function(){业务内容});//tryC 执行作为参数注入的function同时对抛出的异常按照调用showException进行处理 ```

####DOM处理
 * newEl 生成新元素单并不注入body中 参数：tag 标签/样式class/标签内内容 
	 * 例子:```VJ.newEl("div","divClass","我的div");```
 * encHtml 只转换标点符号并不太大扩大输入串的转换值 
	 * 例子：```VJ.encHtml('<input/>');```
 * decHtml 将转码后的脚本进行解码 
	 * 例子:``` VJ.decHtml('<input%2F>')```
 * setChecked 用于将checked对象在不同浏览器中都设置成需要的值
    * 例如:```VJ.setChecked($node,true);```
 * maxlength 用于所有的textarea通过JS方法绑定maxlength属性 保证当大于一定值时自动截取
 * fill 用于使用数据填充带有'\_\_'属性的控件，默认自动处理input/textarea/select/img/div/span等等类型节点，当标签属性\_\_定义了field时会寻找data中的对应数据value进行填充，如果\_\_属性中定义了formatter属性那么会调用其进行数据格式化 
	 * 例子:
    ```$node = '<input __="field:a"/>;';VJ.fill($node,{a:1,b:2});```
 * fillTo 用于使用数据根据模块控件的定义不断创建子控件填充指定对象,sor指定填充的模板控件，data填充的数据，aim填充到的目标节点，func返回新创建的子空间。特别地sor控件一般和aim是一个对象，也可以是不同对象，但是是display:none;的用于有关字段的节点都使用\_\_标示，而且\_\_的属性值可以有field,cssClass,click函数等等属性 
	 * 例子: ```VJ.fillTo($sor,[{},{}],$aim,function(){return VJ.newEl('li');});```
 * getClipBoardText 兼容IE与FireFox用于获取剪贴板的内容 
	 * 例子: ```VJ.getClipBoardText([e]);//jQuery copy事件中的e```
 * setClipBoardText 兼容IE与FireFox用于设置剪贴板的内容 
	 * 例子: ```VJ.setClipBoardText([e],text)```

####VJ配置注册管理
 * getSettings 按照key值获取VJ管理的配置信息否则设置并返回第二个值作为默认值 
	 * 例子: ```VJ.getSettings('ajax',{jsonp:true});```
 * extendSettings 按照key值扩展VJ管理的配置信息 
	 * 例子: ```VJ.extendSettings('ajax',{jsonp:false});```

####VJ ajax方法
 * evalTJson 将tjson数组转换为json数组 TJson格式 一般是：```[库[表[列,行,行]]]```
    * 例如 ```[['Rindex','ID'],['1','6e014f804b8f46e1b129faa4b923af2d'],['2','6e014f804b8f46e1b129faa4b923a23d']]```
    * 转换为 传统Json数组格式：```[库[表[{行},{行},{行}]]]```
    * 例如：```VJ.evalTJson([[['Rindex','ID'],['1','6e014f804b8f46e1b129faa4b923af2d'],['2','6e014f804b8f46e1b129faa4b923a23d']]]);```
    * 特别地evalTjson支持多层，递归转换，无论多少层都可以转换完成
 * ajax VJ的ajax命令支持json与jsonp属性设置即可访问json或者jsonp方法 默认属性有
        async: false,
        type: "POST",
        dataType: "text", 
        cache: false,
        filtData:function(data){return VJ.evalTJson(data);},
        bindData:function(data){},
        noData:function(){}
    * 一般filtData会完成tjson或者json方式的解析，
    * bindData用于异步获取最终的json数据,
    * noData用于判断访问错误或者确实没有数据时的情况
    * 例如:
        ```VJ.ajax{url:'',data:{},bindData:function(){}}```
 * getRemoteJSON VJ的jsonp命令 用于根据url获取js对象的访问一般地在参数中可以设置```VJ.extendSettings('getRemote',{filtURI:function(data){用于将json或者tjson住换成一致的json对象}})```
    * 例子：
        ```VJ.getRemoteJSON(url)```  
 * include VJ的js与css资源文件加载命令一般地如果url曾经使用include加载过就不再加载。 
    * 例如:```VJ.include('http://url');```
 * part VJ的控件加载命令，用于将指定url的html内容按照iframe/jsonp方法获取 其参数提供(url,放入的节点node, mode(iframe/), callback) 
    * 例子:```VJ.part(url,node,null,function(){init})```
    
####VJ异步触发事件处理 
 * 一般用于part未完成时，尚未定义方法与事件就已经被调用了这种情况，现在也被用于模块间通讯，一般用于未定义先调用的事件或者命令处理
 * registCommand 事件注册命令与事件调用命令用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
    *  例如 ```VJ.registCommand('showXXList',getData);```这样保证事件通知与处理可以无缝的异步进行。
 * callCommand用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。
    * 例如 ```VJ.callCommand('showXXList',[{id:1}])``` 一般情况下代码都是不需要等待下载完成
 * hasCommand用于判断是否已经定义该方法或者调用该方法
    *  例如  
```
        if (!V.hasCommand('editor.open')){
            V.part("/FileServer/layout/editor/editor.htm");
        }
```
 * clearCommand 仅限iframe方式调用时，先取消原页面添加的方法 一定要在part前
    * 例如 ```V.cleanCommand('editor.open');```
    * VJ.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){}); 仅限iframe方式调用时，先取消原页面添加的方法
 * registEvent VJ用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。 
	 * 例子: ```V.registEvent('showXXList',getData)```
 * callEvent VJ用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。 
	 * 例子: ```V.callEvent('showXXList',[{id:1}])```
 * haseEvent VJ用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false; 
	 * 例子: ```if (!V.hasEvent('editor.open')) V.part("/FileServer/layout/editor/editor.htm");```
 * clearEvent VJ仅限iframe方式调用时，先取消原页面添加的方法，业务逻辑深度交叉，iframe落后的控件连接方式时使用时一定要在part前使用该方法
	 * 例子: ```V.cleanEvent('editor.open'); V.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});```
     
 * getTarget 通过事件对象获取发生事件的真实标签
    * 例如 ```function(e){console.log(VJ.getTarget(e));}```
 * cancel 通过事件对象取消事件
    * 例如 ```VJ.cancel(事件实体)```
 * stopProp = 阻止事件向上冒泡
    * 例如 ```VJ.stopProp(事件实体)```
    
####VJ业务优化
 * formatPrice 价格输出的格式化方式 
	 * 例子: ```VJ.formatPrice(2,2232.2,'.','`')```
 * qs 返回当前页面的QueryString参数对象支持get与contain方法
    * 例如 ```VJ.qs.get('abc'),VJ.qs.contain('abc')```
 * Date.add 为Date对象添加add方法 支持如下字段的加法运算 'y':'FullYear', 'q':'Month', 'm':'Month', 'w':'Date', 'd':'Date', 'h':'Hours', 'n':'Minutes', 's':'Seconds', 'ms':'MilliSeconds'
    * 例如 ```new Date().add('h',1)```
 * Date.diff 为计算两日期相差的日期年月日等前比后面的数值高的方式
     * 例如 ```Date().diff('h',new Date().add('d',1));```
 * Date.sub计算两日期相差的日期年月日等
    * 例如 ```new Date().sub('h',new Date().add('d',1));```
 * Date.toString 可以根据样式定义譬如 yyyy/MM/dd HH:mm:ss' 
    * 例如 ```new Date().toString('yyyy-MM-dd');```
    
####VJ处理永不重复的随机数

 * random 保证随机生成在单页面运行期间不会相同，值规则是时间+次数的一个整数 
	 * 例子: ```VJ.random()```
 * hash 获取字符串的hash散列值，第二个参数为是否忽略大小写
    * 例如 ```VJ.hash('test',false)```
 * string.startWith与string.endwith,string.eq说明是否不忽略大小写匹配字符串
    //添加string.endWith与startWith方法 
	 * 例子: ```"abc".startWith('a') "abc".endWith('C'); "true".eq(value[,true/false])```
 * json2 将json2对象全部引入VJ.base框架
    * toJsonString 该方法调用json2的功能将任意类格式化
    * 例如 ```VJ.toJsonString({a:1,b:2});```
    * json 该方法调用json2的功能将字符串反格式化 
    * 例如 ```VJ.json('{a:1,b:2}');```


###VJ.config框架
 * VJ.config 作为基础框架为VJ的上层框架提供可继承的链式配置文件访问方式，保证由叶子到根部的配置节点方式，提供基础类库为上层框架配置对象解析支持。
 * VJ.config定义ConfigManager类管理一个配置文件的配置信息转换成的Config对象实例字典，同时通过自组织方式按照父子关系组成链式的配置文件查找树，基本逻辑是当下级ConfigManager找不到指定的Config对象或者指定的Config对象返回的值为空时请求父级节点的完成查找配置的相关信息，一直到根节点也找不到此类信息为止才会返回null。
 * 同时其通过ConfigAdapter类的一个静态实例完成配置信息到指定Config对象的工作，在这个类工作原理是先读取ConfigManager初始化时注入的DataResource参数获取配置信息，然后从ConfigManager中找到Config一级节点的对应解析器将其转换为Config对象按照字典格式设置给ConfigManager，同时如果ConfigManager中某些配置项发生了改变，一旦调用update方法ConfigManager也会调用Config对应的解析器转换成json信息再交由DataResource数据源修改配置。
 * 配置解析器定义在VJ.config.Configs.ConfigConverts中，并且都继承自VJ.config.ConfigConvert,其需要实现ToConfig方法与可修改的ToString方法与一个needConfigs这个属性，
 * 第一个基础的配置解析器ConfigConverts节点解析器默认注册在根节点的ConfigManager中，其按照键值对方法认为键就是解析器对应的标签名，值type与[path]说明了解析器类的地址与类名，
    * 例如 
 ``` 
    ConfigConverts:{
        AppSettings:{type:'VJ.config.AppSettingsConfigConvert'}
    }
```
就配置了AppSettings这个标签的解析器类，这样各个解析器类定义的扩展Config对象就可以返回各种类型的对象
 * 同时其ConfigResource的设计也使得ConfigManager的配置对象的生成更加多源，可以对应不同种类的Resource获取ajax,Json,甚至websocket传入的配置节点。
 * 下面是对VJ.config各对象的详情说明
 * VJ.config.Configs 基本配置节点,是默认构造方法的根节点
    * 例子：```VJ.config.Configs = VJ.merge(VJ.config.Configs,{'ConfigConvert':{XXXConfigConvert:{type:'',[path:'']}}});```
 * VJ.config.Config 转换后的Config配置基类，具有getValue,setValue,merge等方法，_.data是其基本属性
    * 例子 ```return new function(){VJ.inherit.apply(this,[VJ.config.Config,[]]);this.getValue = function(key){return this.data[key];}};```
 * VJ.config.ConfigConvert 转换器基类，具有toConfig(json),toString(json)等方法与needConfig属性如果具有该属性那么解析时会自动设置解析器实例的configManagere对象为this的一个属性
    * 例子 ```VJ.inherit.apply(this,[VJ.config.ConfigConvert,[]]);```
 * VJ.config.ConfigResource 数据源基类，具有load(),save(string)方法获取与存储数据源数据
 * VJ.config.AppSettingsConfigConvert AppSettings配置解析器类 将AppSettings属性解析为传统字典格式
 * VJ.config.ConfigManager 配置管理器类 拥有getConfig(config),get/setConfigValue(config,key),update方法 
 * VJ.config.ProxyConfig ConfigManager专用代理类 返回getConfig结果，将其getValue方法转换为getConfigValue方法
 * VJ.config.ConfigAdapter Config适配器类，用于调用ConfigManger的resource将ConfigManaager的内容与resource之间进行相互调用 提供fill/update方法 并提供prototype.getInstance方法实现单例调用
 * VJ.config.getConfigManagerFromObj 通过JS对象生成ConfigManager并提供匿名Resource类将JS对象单向转换为ConfigManager 例如 VJ.config.getConfigManagerFromObj(parent,{});
 * VJ.config.getConfigManagerFromJS 通过JS文件获取JS对象生成ConfigManager,并提供匿名Resource类将JS对象单向转换为ConfigManager
	 * 例如 ```VJ.config.getConfigManagerFromJS(parent,name,path);//这里允许path是路径数组，且引用对象首先通过merge方法进行自我扩展。```
 * VJ.config.getBaseConfigManager 通过直接使用VJ.config.Configs 生成基本节点ConfigManager
 * VJ.config.getApplicationConfigManagerFromJS 将上一个方法的BaseConfigManger作为根节点按照JS文件方式向下创建配置树 例子 var conf = VJ.config.getApplicationConfigManagerFromJS('classname',[path/[path1,path2,p3,p4]])
 * VJ.config.getApplicationConfigManagerFromObj 将上一个方法的BaseConfigManger作为根节点按照Json方式向下创建配置树 
     * 例子 ```var conf = VJ.config.getApplicationConfigManagerFromObj ({AppSettings:{a:1},Middler:{……}})```
 
###VJ.collection
 * VJ.collection 作为基础框架为VJ.middler框架提供Pool池方式的对象保持机制，提供对象池的自动增长，最大容量，自动缩减等等功能
 * VJ.collection.Pool 池类，构造函数需要输入size最大池容量，func创建对象方法，timeout闲对象保持时间，它的基本原理是内部管理了一个栈和队列，栈用来处理空闲的对象，队列用来处理栈内始终未访问到的空闲对象，当到达过期时间时会自动启动掉队列里的栈与队列中空闲对象。
    * 其方法有
    
    ```
        getValue() 当池容量不足时会返回null 需要继续等待然后重新获取，
        setValue 用于将使用状态的对象设置到空闲对象，等待清除任务的执行。
        clear 彻底清理池
    ```

###VJ.middler框架
 * VJ.middler 提供了一个支持 **构造函数/Bean(无参构造+get/set属性名方式)/静态方法/构造+Bean方式/静态方法+Bean方式** 5种构造方法与 **Instance/Static/Pool** 3种对象保持方式，**本地/远程**两种加载方式，**getObjectByAppName/getTypeByAppName**两种对象访问方式的JS对象IOC生成框架，并依托config框架为ni框架和view,viewmodel层提供可继承的链式配置文件访问结构
 * 
 ``` 
    //定义Middler节点的解析器
    V.config.Configs = V.merge(V.config.Configs,{ConfigConverts:{Middler:{type:'VJ.middler.MiddlerConfigConvert'}}});
 ```
 * VJ.middler.Middler 中介者管理容器，其提供3个方法供外部获取配置文件定义的对象```get/setObjectByAppName(appName,name),getTypeByAppName(appName,name)```
    * 例子:
```
 var test = function(){};
 var mid = new VJ.middler.Middler(VJ.config.getApplicationConfigManagerFromObj({
           Middler:{test:{type:'test'}}
 }));
``` 
 * getTypeByAppName配合Middler配置节点定义的Path属性实现了CMD对象定义方式
 * getObjectByAppName配合Middler配置节点定义与Path属性实现了AMD对象定义方式
 * **AMD与CMD真不是太大的技术创新，早就有无数先辈用过，不过是没有西方的新名词+大嗓门和中方的录音机而已。**
 * VJ.middler.getMiddlerFromJS 直接使用上文所提到的写法完成Middler创建 
    * 例子 ```var mid = VJ.middler.getMiddlerFromJS(className,[path/[path]])```
 * VJ.middler.getMiddlerFromObj 直接使用上文所提到的写法完成Middler创建 
    * 例子 ```var mid = VJ.middler.getMiddlerFromObj ({});```

###VJ.ni框架
 * VJ.ni 对应VESH.view.storage层次提供了一个可配置化的支持**localStorage/sessionStorage/JS对象/function/ajax/jsonp/webdb/websocket**等多种访问媒介，**直接读取/缓存再读取/缓存同步懒读取**等多种读取逻辑，**顺序与随机**两种读取方式，**js数组/json/tjson**三种dbtype数据类型的统一数据访问方法的storage框架 
 * 他的核心思想是充当VESH中的表现层与实体逻辑层之间适配器，提供统一的接口给业务开发人员，屏蔽底层获取数据的地址 方式 逻辑 缓存等等情况，由配置config文件与ni.js文件就能修改架构级别的逻辑表现机制，框架名泥巴就是随处都可贴都可使用的意思.
 * 注册ni节点解释器
    * ```V.config.Configs = V.merge(V.config.Configs,{ConfigConverts:{Ni:{type:'VJ.ni.NiDataConfigConvert'}}});```
 * Ni继承的Config子类
 * ```VJ.ni.NiDataConfig```
 * Ni继承的NiDataConfigConvert子类负责将ni标签定义转化为NiDataConfig对象
 * ```VJ.ni.NiDataConfigConvert```
 * Ni框架的核心对象NiTemplate,高级装饰器与扩展类都以其为基础，一般通过Middler的getObjectByAppName获取，构造函数有NiDataResource res,Ni配置节点的ConfigManager对象 cm,在使用完成后通过Middler.setObjectByAppName再返回Middler容器(兼容Pool模式)：
    * 主方法 ```excute excute('命令',{参数},function(res){res.get('命令')});```处理回调，特别注意如果没查找到数据那么返回false}) 特别地如果命令是NiTemplate的cm中可以对应的Ni命令那么会调用真实的Ni命令执行，否则将直接交由初始化时定义的Resource执行命令，譬如DataResource中的DBFactory如果是AjaxFactory则认为输入的命令是个url，如果是ObjectDBFactory那么则认为输入的命令是个function，如果是SqlitFactory则认为输入的是一个完整SQL。所以推荐命令参数输入的是构造参数cm引用的ni配置对象的Ni命令名，而真实的Ni命令则可以针对开发的不同阶段和状态修改为不同的方式，而且缓存装饰器必须使用Ni命令名才可使用。
    * 主属性 result NiDataResult实例 具有add(data,name),get(name),last(),each(name,func),clear() 这几个主要方法
    * 事务属性 transaction false 当设置为真时，excute命令都不会立即执行，而是存储起来，等待commit命令 或者设置为false时 下一次excute命令
    * 事务方法 commit commit() 当transaction为真时 依次提交excute时存储起来的命令，并顺序调用回调函数 这时在回调函数时应尽量避免调用res.last()方法 而直接使用res.get(key)方法
 * Ni框架的高级操作类 NiTemplateManager,Template管理者类，初始化时需要设置ConfigManager实例，与Middler的AppName（默认是Ni）。其只提供了excute方法，命令参数有 Middler中定义被调用的template名字，命令，参数，回调函数，与NiTemplate不同的是这个类不支持事务，仅适用单次独立调用的情景。
    * 例子 
    ```
    var ni = new NiTemplateManager(cm,"Ni"); //这里res.get(name)与res.last返回结果一致。
    ni.excute('templatename','GetData',{a:1},function(res){console.log(res.last())});
    ```
 * Ni框架的数据集合实例,result:NiDataResult，每一个Template都有一个独立的NiDataResult对象属性，负责将DataResource中获取到的数据按照dbType进行状态转换和判断一般地如果没有找到数据或者数据执行错误，result所对应的命令的数据结果都是false,通过这个可以判断是否返回了数据 其主要方法：**add(data,name),get(name),last(),each(name,func),clear()**。Template的两个主要函数excute,commit的返回值都是template的result属性.
 * Ni框架的数据源基类 一共实现了**static instance pool**三种不同的管理数据源的数据源类，提供get/backDBConnection方法,getDBCommand方法，由Middler创建注入NiTemplate构造函数，不在外部使用。
    * 其构造参数统一的有两个(各种NiDBFactory实例，其对应产生的DBConnection的默认配置(一般有dbtype:json/tjson,jsonp:ajax特有说明jsonp的回调参数名VESH框架一般使用_bk,host:ajax特有说明默认的站点路径与Ni配置定义的具体url共同拼装成完整URL(Ni配置定义含http的除外),resource：objectdb特有说明其操作的JS对象实例譬如window.top.sessionStorage
 * ```VJ.ni.NiInstanceDataResource/VJ.ni.NiStaticDataResource/VJ.ni.NiPoolDataResource```
     * Ni框架数据源抽象工厂基类，其负责产生与回收具体的NiDBConnection与NiDBCommand,一般在Middler容器中作为NiDataResource的构造参数被注入，一般对外使用
     * Ni框架数据连接基类，其负责打开与关闭具体的链接，提供invoke方法完成真实的DB操作，方法有：
     * 
    ``` 
        open() 默认仅仅更新isOpen属性为真
        isOpen false 标示链接是否已打开
        params {} 标示完成对应的DB链接所需要的参数由DBResource的第二个构造参数注入,可在Open时真实使用
        close 默认仅仅设置isOpen属性为假
        invoke invoke(cmd,func(data)) 调用cmd的配置信息，配合cmd完成真实的数据查询然后调用func回传数据
    ```
 * Ni框架DataCommand基类，会被传入connection DB连接,command 命令文本或者函数 ,params 命令参数
	* 提供excute(result,func)主方法，一般是调用connection.invoke(this,func(data))方法，处理数据格式化等等情况，一般不需要重载
	
###特别需要注意的是如果要创建新的DBFactory以访问各种新的DB资源类型，那么就需要重写DBConnection，甚至DBCommand类型。如下为Ni框架中已经实现的DBFactory:

 * VJ.ni.NiAjaxDataFactory 实现ajax jsonp/getScript方式获取数据的DBFactory 其DBResource的参数可作为jQuery.ajax的默认参数并新增host(../|http://www.abc.con)与dbtype(json/tjson)两个属性。
 * VJ.ni.NiObjectDataFactory 实现对JS对象,localStorage sessionStorage json等等资源获取数据的DBFacotry 其DBResource的参数需要设置resource参数指定JS数据源或者是JS数据源的名字，其Ni命令要求是function(resource,params){return data/function(callback){callback(data)};} 或者是resource对象上的方法名，其定义的结构同上
 * VJ.ni.NiSocketDataFactory 实现对WebSocket方式的持续通讯，DBResource的参数要求设置url参数，其Ni文件中的命令要求是命令字符串，参数的jsonstring为其对应值，服务端必须实现对niid字段的支持以实现命令与回调的对应
 * VJ.ni.NiSqliteDataFactory 实现对WebDB方法的支持，其DBResource的参数要求是{name:'dbname',version:'dbver',desc:'',size:容量*1024*1024},其Ni命令要求是sqlite/SQL
 * NiTemplate装饰器类，是NiTemplate的子类可以按照NiTemplate方式调用，但是其业务逻辑都进行了一定的修改。缓存类一般调用的都是ObjectDBFactory类型，并且请注意其缓存的参数都是在原命令参数的基础上添加了cacheKey与cackeValue(仅限.Set命令) cacheKey是所有参数的jsonstring的hash字符串
 * VJ.ni.NiTemplateDecorator 缓存类,如果想在Middler中使用相关类则可以将原有NiTemplate的配置复制一份然后修改type为NiTemplateDecorator,params的第二个参数改为缓存的DBResource即可，其实现逻辑是首先在Ni节点的配置中查找命令.Clear命令，然后查找命令.Cache,如果找到命令并且返回可用的数据那么就直接返回，不再进行真实的数据查找，如果没有找到缓存那么执行真实的数据查找然后寻找命令.Set命令进行缓存设置以备下次使用,同样的其构造方法可以设置缓存的过期时间 {timeout:{interval:'s',number:50}} 其类型参见VJ.base中定义的Date.prototype.add
 * VJ.ni.NiLazyTemplateDecorator 懒加载缓存类，其构造参数与使用方式与NiTemplateDecorator相同，但是其实现逻辑与NiTemplateDecorator不一致的是获取缓存后继续请求真实数据然后再次设置缓存，主要用于无线设备访问离线数据后再次刷新数据的情况，在这里一次请求的回调函数可能被调用两次，请尽量保证回调函数按照res.get(命令)的方式进行处理即可。请特别注意构造函数最后一个默认配置参数 需要添加**lazyExp**函数，以说明是否可以读取缓存
 * VJ.ni.NiMultiTemplateDecorator 多媒介装饰器,其构造参数与Template相比第三个参数为{self:true}，第四个为Middler中定义template的appName(一般为Ni），其访问逻辑是如果在Ni配置节点中找到的命令定义了template属性，那么使用这个属性定义的template处理该命令，否则调用自身定义的默认DBResource执行DB操作。
 
###VJ.viewmodel框架
 * VJ.viewmodel 对应 VESH.view.viewmodel实现了对逻辑控件（就是```{data:{},on事件名:function(data,self){}}```就可以定义一个纯粹的逻辑上的控件）的实现与VESH.view.view层控件的绑定，提供SessionDataManager对象屏蔽了***ookie/JS对象/localStorage/sessionStorage/ajax/jsonp***等多种存取渠道与***加解密存取方式的无缝会话管理。提供Page实现了VESH.view.control的事件处理与初始化绑定，提供VJ.viewmodel.Control作为用户逻辑代码的处理基类。
 * 其页面处理逻辑是 首先用户代码继承VJ.viewmodel.Page 然后 Page构造函数绑定 VJ.view.Page 并交由VJ.view.Page 调用Document.ready事件，当页面OnReady事件发生后，VJ.view.Page 将Html上属性有"_"的自定义控件按照middler在VESH.view的控件库中进行创建、替换、初始化设置和相同ID的逻辑控件进行绑定，并确认逻辑控件中如果存在没有绑定的控件且type不为空那么自动创建一个新的控件加在页面后，等待全部操作完成后再触发Page.onStart事件调用业务代码。
 * 其要求定义VJ.viewmodel中默认的```Middler.AppName```为'VESH.viewmodel'，定义其调用的NiTemplate对象所在的Middler.AppName为'Ni',定义VJ.view默认搜索控件库的Middler.AppName为'VESH.view'
    * 例如:
	
	```
       VJ.viewmodel = {APP:'VESH.viewmodel',NIAPP:'Ni'};VJ.view = {APP:'VESH.view'};
	```
        
 * 逻辑控件基类，默认会定义属性data说明全部的数据信息,属性v说明对应的view层控件，一般是不使用的；一个默认方法update({data json})交由view层控件按照属性定义更新逻辑控件的data属性，同时重新更新view层控件 而业务调用这个类一般是在继承VJ.viewmodel.Page的时候 作为构造参数之一中按照ID对应的逻辑控件，特别地逻辑控件事件会有两个默认的事件onReady（大小写不敏感）和onLoad是分别在控件的标签内容在替换前和替换后触发的一般在onLoad中处理业务逻辑代码。提供get([key])方法用于获取该逻辑控件刷新后的data属性，如果输入参数则更新后返回该参数的对应值否则为null，如果没有输入参数，那么会返回整个data属性 
 
   ``` VJ.viewmodel.Control = function(){//data属性的定义 on事件的处理 update方法的主动更新 get方法的主动获取}；```
 * VJ.view.Action定义有
 
	 * ```go function(node,params,callback)```
	 * 该方法会对control传入的节点和参数进行指定的动画操作，完成动画后调用callback回调。将逻辑上的动画操作与真实的用户控件分离，完成统一格式的动画定义
	 
 * VJ.view.Control定义 其负责html与css的加载 其对应的节点的替换 事件的统一触发与处理 update事件的注入 所有的控件均支持先创建、init、然后bind绑定、再调用onLoad和render事件 如果需要扩展或者创建一个新的自定义控件需要重载onLoad方法,fill方法，render方法，事件触发顺序是Constructor>init>onLoad>render>fill>on***>render的顺序执行的。
 * 请开发者切记，如果控件的某个属性的处理会导致控件内Html子节点的变化而不仅仅是html属性值的变化，譬如select\radiolist\checklist的values属性会导致options\input\checkbox的数量的变化，那么在处理fill方法时需要判断当前节点是否不为空，否则不要修改values属性的值，在处理render方法时需要在处理values和value两个属性时都要添加对value属性的处理，否则子节点的属性就是有残缺的。
 * 推荐使用VJ.forC异步处理对{}的处理，使用VJ.each异步处理对[]的处理，使用VJ.whileC异步处理对更复杂表达式的处理，尤其是在UI渲染时，否则容易导致页面长时间不响应，也防止白页的出现，虽然我们可以通过在方法的第四个参数上设置为true改为同步处理模式，但是如上优点也会丧失。
 * 事件中返回的json自动调用方法更新vm的data属性，然后根据事件调用时返回的参数更新自身和vm.data，逻辑控件也可调用update(更新{})方法完成数据在view层的填充,同时将属性更新

 * VJ.view.Control定义有
	 * constructor (path,vm) 构造函数 允许传入html模板与逻辑控件默认值，一般地当传入逻辑控件默认值时允许构造成含有页面和逻辑的独立模块控件其结构为
			```{  
				子控件id:{data:{},  
					onLoad:function(data,self){
						//特别地这里的this对象指向的是该控件的子控件字典,而不是整个页面的控件字典，data,self与普通控件事件方法指向相同，调用方式相同。一般子控件与页面内控件的交互方式建议以V.callCommand/Event或者V.registCommand/Event方式进行。
					}
				}  
			}
			```。
     * path string (控件html路径或者代码段)
     * vm object（逻辑控件对象),
     * config configManager对象，是其它configConvert子类的父类实例和基础。
     * middler 中介者对象，用于获取或者新建其它对象的实例和类，可用于AMD与CMD模式
     * session 会话对象，根据config.js配置当前会话的存储路径和加解密逻辑
     * ni 数据对象，根据config.js+ni.js+ni的name执行数据操作，兼容各种数据渠道。
     * events {} (所有逻辑控件on开头的function 事件判断上大小写不敏感)
     * params {} 逻辑控件默认值
	 * parent object 父对象，一般可以通过this.parent.middler/config/session/ni获取到当前页面的公共资源或者在逻辑控件中,页面内的控件该属性与page属性的结果相同
	 * controls object 子控件（特指本控件模板中定义的子控件，页面上定义控件时放置在控件内的VJ控件不是子控件而是页面控件）的逻辑控件对象(id与页面相同ID不会冲突)
     * page object 所在页面 一般可以通过this.page.middler/config/session/ni获取到当前页面的公共资源或者在逻辑控件中
     * init function(path,node,params) VJ.view.Page的实例，对应控件标签的原始对象，控件标签'_'属性的属性值
     * call function(name,params) 调用viewmodel对应的事件，同时更新vm.data属性，如果事件未被监听则不调用
     * fill function() 返回一个json以更新vm.data属性，一般在调用call之时被调用
     * bind function(vm) 完成控件标签替换，并一次性顺序调用onLoad方法，fill方法与render方法完成控件的渲染
     * 其中一般在onLoad方法中先绑定用户的处理事件，再调用父类的onLoad事件(必须调用) ，
	 * animate function(name,callback) 基类中默认调用_animate方法对_.node执行动画方法
	 * _animate function(name,node,callback) 按照name在middler中VESH.view下寻找对应的动画对象（继承自VJ.view.Action/CssAction(go(node,callback)))定义，然后调用指定对象完成动画生成，再调用回调函数，目前不支持多个连续动画，需要开发者手动完成。
	 * valid function() 由ValidateManager注入的方法，会自动绑定逻辑控件中的data.validate属性根据其键值查找config.js中对应的验证判断 譬如data:{validate:{isRequired:'必须输入值',isNumber:'请输入数字!'}}等等
     * onSuccess function() 一般会触发success事件
	 * onError function() 一般会触发error事件，逻辑事件可以通过data.error属性获取到错误信息提示 并采取对应的处理，一般地控件可以覆盖这个方法进行错误处理，但是必须调用其父类方法以触发逻辑控件的onError事件
	 * onClearError function() 一般会触发clearerror事件
	 * addControl function(node,{type:'',data:{},id:'',onLoad:function}) 允许动态添加VJ控件到指定的控件内,并与该控件的子控件同级,id为可选项可以与父级的id重复，但是不可与控件内的子控件id重复
	 
	 * 一般提供bindEvent(node,k,v)方法供扩展时进行默认事件绑定。这里一般会绑定用户定义的jquery事件。请注意不要调用this.node以为此时的node是尚替换的，而应该使用输入的参数node是替换后的jquery对象，而且传入的node参数本身具有原标签的所有属性
     * 一般在fill方法中获取当前对象的约定真实值，不用调用父类
     * 一般在render方法中完成控件的属性处理和判断,这里要先调用父类的render事件 保证完成真正的控件标签替换后再进行特殊属性的绘制，譬如data.products属性的处理。一般父类已经实现了attr属性,visible属性,enable属性,addClass属性,removeClass属性,invisible属性(与visible不同仅显示或者隐藏子节点)的处理
     * replaceNode function(node) 默认完成控件替换的核心方法，如果path说明是页面地址会自动将path获取到本地然后加载，如果不是那么会主动创建节点.然后复制标签属性，替换innerHTML为原节点的innerHTML完成bind操作
 * VJ.viewmodel.Page 要求两个输入参数一个是ConfigManager需要的json代码段，一个是models定义
    * 例如: ```VJ.inherit.apply(this,[VJ.viewmodel.Page,[window.top.configs,{page:{onStart:function(){}}}]]);```
    * 这是一切业务代码的开始，这里允许
    * VJ.merge(window.top.configs,{Middler:{'VESH.view':{},'VESH.viewmodel':{},Ni:{}}})来扩展控件库，公共会话对象与公共数据访问对象，保证私有控件的使用。具有：
    * models {} 按照ID管理的所有控件
    * page VJ.view.Page 其所绑定的页面对象
    * this.middler object 
    * this.config object
    * this.ni object
    * this.session object
    * this.update function 
    * this.getModels([id]) function
    * this.setModels(id,object) function
 * 同时它又继承了VJ.viewmodel.Control对象拥有data/v属性和update方法并提供```this.middler,this.config,this.ni,this.session对象``` 并提供给getModels，setModels方法供绑定的VJ.view.Page调用设置models属性
 *  VJ.view.Page要求一个输入参数 一般情况是空的仅仅做div替换 继承自VJ.view.Control对象具有:
     * vm object VJ.viewmodel.Page
     *  views {} 页面上定义的全部的控件
     * controls [] 页面上定义的全部的控件
     * fill function() 更新vm.data
     * bind function(node) 重写了bind方法，并查看内部的自定义控件对象完成控件初始化与绑定操作
     * ready function(callback) 特有方法，一般在document.ready时调用 如果调用多次，会导致控件初始化多次
     * bindControl function(node) 特有方法，一般用于查看内部的自定义控件并完成控件初始化与绑定操作
     * addControl function(node,v) 特有方法，用于向指定位置自增自定义的控件。

####这里使用SessionDataManager完成会话管理工作 

 * VJ.viewmodel.SessionDataManager 构造参数需要传入SessionDataAdapter,
    * get function('会话名') 获取对应的会话字典信息
    * updateAll function() 更新全部的会话信息 一般在页面退出时自动调用
    * update function('会话名',{会话改变值}) 更新具体的会话信息其会话具体媒介和相关逻辑由SessionDataAdapter决定
    * clear function('会话名') 删除对应的会话信息，其具体的会话信息有SessionDataAdapter决定
 * VJ.viewmodel.SessionDataAdapter 构造参数需要说明默认的会话数据源
    * setResource function(name,SessionDataResource) 设定指定会话使用的SessionDataResource否则使用默认数据源
    * getResource function(name)获取指定数据源如果没有指定会话数据源会返回默认数据源
    * fill function(name)获取自定数据源的数据更新SessionDataManager
 * VJ.viewmodel.SessionDataResource SessionData数据源基类
    * load function(name) 用于获取指定的会话信息
    * save function(name,data) 用户设置指定的会话信息
    * clear function(name) 用于清理指定的会话信息
 * VJ.viewmodel.CookieDataResource 定义时必须说明cookie.js的位置 允许输入的参数作为cookie会话的默认值譬如过期时间 domain等等值实现基类的load/save/clear方法
 * VJ.viewmodel.StorageDataResource 定义时需要设置会话对象或者timeout 属性参见VJ.base中定义的Date.prototype.add方法属性 处理localStorage与sessionStorage 与 全局对象object 实现基类的load/save/clear方法并设定缓存时间

###VJ.view框架
 * VJ.view 对应 VESH.view.view 实现对逻辑控件的实现和扩展控件基类VJ.view.Control，提供了统一的Control加载处理，提供了自定义控件标签解析与统一事件触发机制管理机制。VJ2.0默认实现里如下类型的控件
 * 因为VJ.view.控件都继承自VJ.view.Control所以天然可以设置如下参数
    * attr 按照键值对设置attr
    * enable 设置控件是否可用
    * visible 设置控件是否可视
    * addClass 设置控件添加样式
    * removeClass 设置控件删除样式
    
            VJ.view.TextBox 设置一个支持标题和text输入框的对象，绑定jQuery的对应事件，其属性有
             * text 输入框的内容
             * name 输入框的name
             * key 输入框的标题
             * size 输入框的大小限制
             * onHover 将jQuery hover事件改为onHover事件
             * 例如 ```<textbox id="" _></textbox>```
 * VJ.view.RadioBox 继承自TextBox 并新增
     * checked 设置/获取节点是否已经设置为checked
     * 例如 ```<radiobox name="ra1" id="" _><radiobox>```
 * VJ.view.CheckBox 继承自RadioBox
     * 例如 ```<checkbox name="ch1" id="" _><checkbox>```
 * VJ.view.Select 设置一个支持标题和text输入框的对象，绑定jQuery的对应事件，其属性有
     * value 获取/设置select的值
     * values 选择框的options json定义
     * name 输入框的name
     * key 输入框的标题 
 * VJ.view.Hidden 设置一个hidden输入框的对象除基础方法后再设置属性
     * value 获取/设置值
 * VJ.view.PasswordBox 继承自TextBox设置一个带说明的密码输入框的对象，新增一个属性
     * alt、passchar 都可设置密码的字符
 * VJ.view.Button 定义的一个带标签的Button，需要设置的内容
     * text/value 输入框的内容
     * name 输入框的name
     * key 输入框的标题
  * VJ.view.Submit 继承在Button 完成submit操作
  * VJ.view.Reset 继承在Button 完成reset操作
  * VJ.view.Form 继承和实现了Form属性的控制管理。
     * method 设置发送的方法 进而研究人们的购买力
     * action 请求的路径
     * target 请求是否重新打开新的页面
     * name 设置form的name属性
     * enctype 设置的语言类型eak;                
 * VJ.view.Box 测试神器，一般用于测算位置和固定大小需要设置的属性有
     * width
     * height
     * key 说明
 * VJ.view.RadioList 通过设置list属性，自动生成一串对象
     * values json 获取并生成RadioList
     * value 获取radiolist的value
 * VJ.view.CheckList 通过设置list属性，自动生成一串对象
     * values json 获取并生成CheckList
     * value 获取或者设置Checklist的value
 * VJ.view.SwiperPanel 通过设置属性，生成兼容PC,手机的触摸式滑动面板，注意请用div+_='type:"SwiperPanel"'方式定义，因为其是容器控件，其内部需要放置同级的div作为滑动面板的内容
     * direction 'horizontal'/'vertical' 横向，纵向 默认为横向
     * width,height 请通过css或者class定义
     * autoplay 3000/0/true/false 请设置每帧自动播放的等待时间，默认为false 不自动播放
     * loop bool 设置到达头尾部后是否为循环切换 默认false
     * scrollbar bool 设置是否允许滚动条 默认false
     * effect cube/coverflow/true/false 设置切换样式是否为立体，滑片，淡入淡出，否等特殊样式
     * buttons bool 设置是否允许出现翻页键 默认false
     * pagination bool 设置是否允许出现底部导航点 默认false
     * touch bool 设置是否允许识别鼠标、手势 滑动 默认false
     * value index 设置从0开始的当前页面
 * VJ.view.FillControl 通过设置value属性，将value属性对应的json对象值填充到界面上，界面按照控件内的html内容根据VJ.format定义的<%=key%>或者{key}格式进行替换  
	 * value {} 对象内容 后期将根据实际需求进行增强 添加譬如循环 条件等判断 特别地这里不做格式转换 转换工作请在逻辑控件中完成
 * VJ.view.Panel 通过设置方法，使用hammers.js，生成兼容PC,手机的触摸式自由滑动面板，注意请用div+_='type:"Panel"'方式定义，因为其是容器控件，其内部需要放置同级的div作为滑动面板的内容,使用其请务必设置```<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">```;
	 * onnUp 支持向上滑动  
	 * onUpOut 支持向上滑出  
	 * onDown 支持向下滑动  
	 * onDownOut 支持向下滑出  
	 * onLeft 支持向左滑动  
	 * onLeftOut 支持向左滑出  
	 * onRight 支持向右滑动  
	 * onRightOut 支持向右滑出  
	 * onDblClick 支持双击  
	 * onScale(data(scale),self) 双指改变大小事件
	 * onRotate(data(angle),self)双指旋转事件
	 * show('animatename') 先显示，然后运行动画  
	 * hide('animatename') 先运行动画 然后隐藏
####2.1 todo panel 容器类对象的控件信息重新绑定，逻辑控件的data标准定义基本上确定可以有width,height,values,value,visible,invisible,key
 

##附录A VESH架构简介
### VESH架构图：
![VESH 架构图](https://raw.githubusercontent.com/baibing0004/VJ/master/chm/img/VESH.jpeg)
#### VESH.Net2.0即将发布，但是文档需要延后才能提供了，使用上如果有疑问的同学请联系我的[QQ](26342049) 
 * VESH.net框架系列是对VESH架构的.Net+JS版本实现 将来会迁移到nodeJS+JS方向
 * VESH.net框架分为
     * VJ.js:对应VESH架构中的View层
     * PublicClass.Project.VESH 对应VESH架构中的Entity层
     * 其使用PublicClass类库为基础构建了
	 
			以PublicClass.Bean.Middler为核心IOC容器
			以PublicClass.IO.Config为配置文件管理基础框架
			以PublicClass.DB.Ni为ECMI层次中的Interface层屏蔽Entity层对下层SS服务层访问的架构层次。
         * 并提供了SessionDataManager对象这种可配置化的统一接口方式访问与管理***Cookie/DB/NoSQL***等多种会话存储媒介与***登陆用户信息/登录用户的权限信息/加密安全会话/多语言版本***等多种会话信息内容，与***Status/DBResult***等等有关会话控制的应答级的临时会话属性以实现MVC方式控制
		 
	> 怎么样是不是和VJ有点像，其实VJ的语法和类划分就是参照VESH的框架实现设计的，配置文件都很像，实现了只要学习了VJ就会用VESH了
	
         * 提供web.pcf文件为IOC反射类容器配置文件
         * 提供Ni/*.ni文件为DB层访问配置文件
         * 提供IAction作为Model基础接口为不同文件夹下的页面与对应Ni文件中的SQL与类SQL命令提供Model层Action类的入口
         * 提供APageBase,AScirptPage,APage,AContentPage作为不同主题（SystemID)下纯页面、加公共JS/css引用的页面、加公共JS/CSS/头尾标签的页面、加公共JS/CSS/头尾标签/菜单的页面的公共基类
         * 提供V/view/(SystemID)文件夹为不同主题提供公共JS/CSS/头尾标签/菜单的存放地址
         * 提供APart为即可拖拽aspx页面使用，也可通过*.part(静态html)/*.jnp(静态JS)JS引入方式使用的ascx自定义控件的公共基类
         * 提供*.json/*.jsonp/*.tjson/*.tjsonp/*.string/*.void/*.x/*.part/*.jnp/*.page等多种访问后缀给前台JS自由访问
         * 提供_a=1与_n=pcf中的ni/模板名为js提供动态访问Action与Ni对象还是不动态访问仅仅返回aspx页面或者数据的开关
		 
#### VESH 架构思想与技术分层图谱

![VESH 技术谱系图](https://raw.githubusercontent.com/baibing0004/VJ/master/chm/img/VESH分类.jpg)

## 附录B 自动链接与压缩命令
 * 请先安装Java，并在windows的path变量中设置java/bin的访问路径
 * 请执行2.0/bulid.bat
 * 复制VJ.min.js或者VJ.js使用
 
			>>当然也可以修改2.0/build.bat 将VJ.view.js排除在外或者换个实现的类 一键替换线上控件 呵呵
