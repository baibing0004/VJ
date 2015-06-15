#VJ
##VJ是什么，能干什么？
* VJ本身提供的不是一个瑰丽的UI框架，甚至特别绚丽的单一界面功能,而是更加方便的提供给你方便地在不改动原有代码的情况下应用各种炫控件和新逻辑的可能：
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
 * 于是VJ将 **控件（不含业务逻辑的UI件)\组件(含有业务逻辑的UI控件)\模块(含有完整业务逻辑的完整控件)** 与其业务逻辑和调用分离成两个部分:
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
                                        //session对象是SessionDataManager的实例 提供 _.session.data('会话名')+_.session.updateAll/ _.session.update()或者直接调用_.session.update('会话名',{会话改变值}) 两种方式都会更新会话信息其会话具体媒介和相关逻辑由传入Page构造函数时的第三个参数定义的Middler配置设置。
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
                //一个新的JS对象定义 其各个属性值都可以使用父对象的属性值作为默认值 当然其params属性还可以类似的进一步定义下去。这个js对象因为没有ObjectName所以无法被外部通过middler.getObjectByAppName方式访问，但是会被随机命名后放置在当前Middler的config空间中保存。
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
                {self:"true"}
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
    session.data('key')
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
     * VJ.view 对应 **VESH.view.view** 实现对逻辑控件的实现和扩展控件基类``VJ.view.Control``，提供了统一的Control加载处理，提供了自定义控件标签解析与统一事件触发机制管理机制``_.call``与``_.render``方法
 

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
    * 例子:```VJ.forC2(function(k,v,next){next();}[,function(){最终执行方法},是否同步执行]); whileC:异步条件循环处理方法 四个参数 exp 给出需要处理的值，func进行处理，finalf是当exp返回null值调用的关闭函数 这里保证func是异步于当前线程运行的保证前后两次调用是顺序的 第四个参数如果为真那么就是同步执行 且错误信息已经被捕获 例子 VJ.whileC(function(){return array.shift();},function(v){}[,function(){最终执行方法},是否同步执行]);```
 * whileC2:异步条件循环处理方法 与whileC不同的是next方法需要由单步处理函数调用，如果不调用不会自动向下执行，用于自由度更大的循环控制。 且错误信息已经被捕获
    * 例子:```VJ.whileC2(function(){return array.shift();},function(v,next){next()}[,function(){最终执行方法},是否同步执行]);```

####VJ类处理
 * getType:获取JS对象的真实父类类型 一般是通过prototype方式实现的继承模式 同时也返回各种基础对象类型 譬如 string,function,object,number,Array,ukObject,父类名等等 
    * 例子:```VJ.getType({})```
 * inherit 使得当前子类继承父类的对象同时链接prototype原型链条，并调用父类的构造函数。尽可能使得JS的继承类似高级语言，但是请慎用对prototype继承的类采用此方法，经测试对非prototype类方法的继承和父类构造函数调用多级别或者多父类的继承都正常，但是对于prototype类型的连续继承超过2次以上就导致较底层次的prototype方法丢失。 例子 VJ.inherit.apply(this,[parent,[……args]])
 * create 使用类继承方法新建一个JS类的实例，适用于动态生成对象实例场景，有可能打断prototype类型的继承。
	 * 例子: var obj = VJ.create(Page,[para1,para2]);
 * create2 使用eval原生命令方法新建一个JS类的实例，适用于动态生成对象实例的场景，不会打断prototype类型的继承，完全JS原生方法解释执行，但是类名要求使用string声明，而且eval的执行效率上理论较第一种较慢一些 
	 * 例子: var obj = VJ.create2('Page',[para1,para2]);
 * merge 用于数组/json对象的递归合并功能，一般地jQuery的merge功能只能合并对象的一级属性，而这个方法可以用于递归合并各级属性或者数组，并支持多个对象进行合并，且用后者合并前者。moveIndex属性用于设定移动至的数组位置，mergeIndex只用于合并数组中的第几个对象
     * 例子：
    ```
        var ret = V.merge({a:22,c:23},{a:34,b:33},{d:"2334",f:true,g:function(){alert("hahaha");}},{h:[1,2,3,4]});
        var ret = V.merge({a:[{a:2},{b:3}]},{a:[{moveIndex:3,j:3},{k:4}],b:25});
        var ret = V.merge({a:[{a:2},{b:3}]},{a:[{mergeIndex:3,j:3},{k:4}],b:25});
    ```
 * userAgent 自动判断获取当前userAgent状态 分为ie/firefox/chrome/safari/opera等多种浏览器类型 userAgent.name说明当前浏览器类型
   *  例如：```VJ.userAgent.name```
   
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
    
####VJ异步触发事件处理 一般用于part未完成时，尚未定义方法与事件就已经被调用了这种情况，现在也被用于模块间通讯，一般用于未定义先调用的事件或者命令处理
 * registCommand 事件注册命令与事件调用命令用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。 例如 VJ.registCommand('showXXList',getData);这样保证事件通知与处理可以无缝的异步进行。
callCommand用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。例如 VJ.callCommand('showXXList',[{id:1}]) 一般情况下代码都是不需要等待下载完成
hasCommand用于判断是否已经定义该方法或者调用该方法 例如 if (!V.hasCommand('editor.open')) V.part("/FileServer/layout/editor/editor.htm");
clearCommand 仅限iframe方式调用时，先取消原页面添加的方法 一定要在part前 例如 V.cleanCommand('editor.open');
 V.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){}); 仅限iframe方式调用时，先取消原页面添加的方法
registEvent VJ用于被调用页面注册命令以处理异步命令调用,当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。 
	 * 例子: V.registEvent('showXXList',getData)
callEvent VJ用于调用被调用页面注册的命令以处理异步命令调用，当命令尚未注册而已经被调用时，参数会先被缓存下来，然后当命令注册时，已知的参数再被调用。 
	 * 例子:V.callEvent('showXXList',[{id:1}])
 haseEvent VJ用来判断是否调用页面,当已经调用过(part)，返回true,否则返回false; 
	 * 例子: if (!V.hasEvent('editor.open')) V.part("/FileServer/layout/editor/editor.htm");
 clearEvent VJ仅限iframe方式调用时，先取消原页面添加的方法，业务逻辑深度交叉，iframe落后的控件连接方式时使用一定要在part前 
	 * 例子: V.cleanEvent('editor.open'); V.part("/FileServer/layout/editor/editor.htm",null,"iframe",function(){});
 
 V.cleanEvent(事件名)
getTarget 通过事件对象获取发生事件的真实标签 例如 function(bean)
cancel 通过事件对象取消事件 例如 VJ.cancel(事件实体)
stopProp = 阻止事件向上冒泡 例如 VJ.stopProp(事件实体)
 VJ业务优化
formatPrice 价格输出的格式化方式 
	 * 例子: VJ.formatPrice(2,2232.2,'.','`')
qs 当前页面的QueryString参数对象支持get与contain方法 例如 VJ.qs.get('abc'),VJ.qs.contain('abc')
Date.add 为Date对象添加add方法 支持如下字段的加法运算 'y':'FullYear', 'q':'Month', 'm':'Month', 'w':'Date', 'd':'Date', 'h':'Hours', 'n':'Minutes', 's':'Seconds', 'ms':'MilliSeconds' 例如 new Date().add('h',1)
Date.diff 为计算两日期相差的日期年月日等前比后面的数值高caiwei new Date().diff('h',new Date().add('d',1));
Date.sub计算两日期相差的日期年月日等 new Date().sub('h',new Date().add('d',1));
Date.toString 可以根据样式定义譬如 yyyy/MM/dd HH:mm:ss' 例如new Date().toString('yyyy-MM-dd');
VJ处理永不重复的随机数
random 保证随机生成在单页面运行期间不会相同，值规则是时间+次数的一个整数 
	 * 例子: VJ.random()
hash 获取字符串的hash散列值，第二个参数为是否忽略大小写 例如VJ.hash('test',false){
 string.startWith与string.ed
 //添加string.endWith与startWith方法 
	 * 例子: "abc".startWith('a') "abc".endWith('C');
 json2 将json2对象全部引入VJ.base框架
toJsonString 该方法调用json2的功能将任意类格式化 例如 VJ.toJsonString({a:1,b:2});
json 该方法调用json2的功能将字符串反格式化 例如 VJ.json('{a:1,b:2}');


###VJ.config框架

###VJ.collection

###VJ.middler框架

###VJ.ni框架

###VJ.viewmodel框架

###VJ.view框架

##附录A VESH架构简介
