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
			swiperpanel:{type:'.SwiperPanel',path:'swiper3.07.min.css;animate.min.css;swiper3.07.jquery.min.js;swiper.animate1.0.2.min.js'},
			
			//∂Øª≠			
			bounce:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounce .4s linear']},
			flash:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['flash .4s linear']},
			rubberBand:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['rubberBand .4s linear']},
			shake:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['shake .4s linear']},
			swing:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['swing .4s linear']},
			tada:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['tada .4s linear']},
			wobble:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['wobble .4s linear']},
			bounceIn:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounceIn .4s linear']},
			bounceInDown:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounceInDown .4s linear']},
			bounceInLeft:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounceInLeft .4s linear']},
			bounceInRight:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounceInRight .4s linear']},
			bounceInUp:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounceInUp .4s linear']},
			bounceOut:{type:'VJ.view.CSSAction',mode:'static',path="animate.min.css;",params['bounceOut .4s linear']},
			
			//—È÷§
			ValidateManager:{type:'VJ.view.ValidateManager',mode:'static'},
			Regex:{type:'VJ.view.Regex'},
			isNumber:{type:'VJ.view.Regex',params:['/^[0-9]+\.{0,1}[0-9]{0,2}$/g']},
			isInt:{type:'VJ.view.Regex',params:['/^[0-9]+$/g']},
			isLetter:{type:'VJ.view.Regex',params:['/^[A-Za-z]+$/g']},
			isPassword:{type:'VJ.view.Regex',params:['/^([a-zA-Z]|\w){5,17}$/g']},
			isRequired:{type:'VJ.view.Regex',params:['/^[\S]+$/g']},
			isChinese:{type:'VJ.view.Regex',params:['/^[\u4e00-\u9fa5]{0,}$/g']},
			isEmail:{type:'VJ.view.Regex',params:['/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g']},
			isUrl:{type:'VJ.view.Regex',params:['/^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$/g']},
			isPhone:{type:'VJ.view.Regex',params:['/^(\d{3}-\d{8}|\d{4}-\d{7})$/g']},
			isMoble:{type:'VJ.view.Regex',params:['/^1\d{10}$/g']}
			isCard:{type:'VJ.view.Regex',params:['/^(\d{14}|\d{17})(\d|[a-zA-Z])$/g']},
			isQQ:{type:'VJ.view.Regex',params:['/^[1-9]\d{4,12}$/g']},
			isZipCode:{type:'VJ.view.Regex',params:['/^[1-9]\d{5}(?!\d)$/g']},
			isIP:{type:'VJ.view.Regex',params:['/^([\d+\.]{3}|[\d+\.]{5})\d+$/g']},
			isCurreny:{type:'VJ.view.Regex',params:['/^\d+\.\d{2}$/g']}
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
			test1:{type:'test',params:[4,{self:true}]},
			test:{type:'test',method:'bean',params:[{params:'Item','a':1,b:2,c:3,d:{type:'test',method:'constructor',params:[4,{self1:true}]}}]},
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