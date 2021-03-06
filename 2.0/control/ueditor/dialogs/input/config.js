﻿window.config = {
    Middler: {
        'VESH.view': {
            pack: 'VJ.view',
            method: 'constructor',
            mode: 'instance',
            host: '/Scripts/ref/',
            page: { type: '.Page' },
            //控件
            textbox: { type: '.TextBox', path: '../../../VJ.view.extend.js' },
            radiobox: { type: '.RadioBox', path: '../../../VJ.view.extend.js' },
            checkbox: { type: '.CheckBox', path: '../../../VJ.view.extend.js' },
            select: { type: '.Select', path: '../../../VJ.view.extend.js' },
            hidden: { type: '.Hidden', path: '../../../VJ.view.extend.js' },
            password: { type: '.PasswordBox', path: '../../../VJ.view.extend.js' },
            button: { type: '.Button', path: '../../../VJ.view.extend.js' },
            submit: { type: '.Submit', path: '../../../VJ.view.extend.js' },
            reset: { type: '.Reset', path: '../../../VJ.view.extend.js' },
            form: { type: '.Form', path: '../../../VJ.view.extend.js' },
            box: { type: '.Box' },
            radiolist: { type: '.RadioList' },
            checklist: { type: '.CheckList' },
            swiperpanel: { type: '.SwiperPanel', path: 'swiper3.07.min.css;animate.min.css;swiper3.07.jquery.min.js;swiper.animate1.0.2.min.js;../../../VJ.view.extend.js' },
            fill: { type: '.FillControl' },
            history: { type: '.History' },
            panel: { type: '.Panel', path: 'hammer.min.js' },
            rangepanel: { type: '.Panel', path: 'hammer.min.js', params: ['', {}, 0.4, true] },
            pagepanel: {
                type: '.PagePanel', params: [
                //{ type: 'VJ.middler.getTypeByAppName', params: [{ self: true }, 'VESH.view', 'panel'], method: 'factory', mode: 'static' },
                    {middler: true }, '', '', 0.4, false]
            },
            scrollpanel: {
                type: '.ScrollPanel', params: [
                //{ type: 'VJ.middler.getTypeByAppName', params: [{ self: true }, 'VESH.view', 'panel'], method: 'factory', mode: 'static' },
                    {middler: true }, '', '', 100, false]
            },
            //动画			
            bounce: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounce .4s linear'] },
            flash: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['flash .4s linear'] },
            pulse: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['pulse .4s linear'] },
            rubberBand: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rubberBand .4s linear'] },
            shake: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['shake .4s linear'] },
            swing: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['swing .4s linear'] },
            tada: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['tada .4s linear'] },
            wobble: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['wobble .4s linear'] },
            bounceIn: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceIn .4s linear'] },
            bounceInDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceInDown .4s linear'] },
            bounceInLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceInLeft .4s linear'] },
            bounceInRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceInRight .4s linear'] },
            bounceInUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceInUp .4s linear'] },
            bounceOut: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceOut .4s linear'] },
            bounceOutDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceOutDown .4s linear'] },
            bounceOutLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceOutLeft .4s linear'] },
            bounceOutRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceOutRight .4s linear'] },
            bounceOutUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['bounceOutUp .4s linear'] },
            fadeIn: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeIn .4s linear'] },
            fadeInDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInDown .4s linear'] },
            fadeInDownBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInDownBig .4s linear'] },
            fadeInLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInLeft .4s linear'] },
            fadeInLeftBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInLeftBig .4s linear'] },
            fadeInRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInRight .4s linear'] },
            fadeInRightBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInRightBig .4s linear'] },
            fadeInUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInUp .4s linear'] },
            fadeInUpBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeInUpBig .4s linear'] },
            fadeOut: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOut .4s linear'] },
            fadeOutDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutDown .4s linear'] },
            fadeOutDownBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutDownBig .4s linear'] },
            fadeOutLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutLeft .4s linear'] },
            fadeOutLeftBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutLeftBig .4s linear'] },
            fadeOutRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutRight .4s linear'] },
            fadeOutRightBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutRightBig .4s linear'] },
            fadeOutUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutUp .4s linear'] },
            fadeOutUpBig: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['fadeOutUpBig .4s linear'] },
            flip: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['flip .4s linear'] },
            flipInX: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['flipInX .4s linear'] },
            flipInY: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['flipInY .4s linear'] },
            flipOutX: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['flipOutX .4s linear'] },
            flipOutY: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['flipOutY .4s linear'] },
            lightSpeedIn: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['lightSpeedIn .4s linear'] },
            lightSpeedOut: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['lightSpeedOut .4s linear'] },
            rotateIn: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateIn .4s linear'] },
            rotateInDownLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateInDownLeft .4s linear'] },
            rotateInDownRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateInDownRight .4s linear'] },
            rotateInUpLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateInUpLeft .4s linear'] },
            rotateInUpRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateInUpRight .4s linear'] },
            rotateOut: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateOut .4s linear'] },
            rotateOutDownLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateOutDownLeft .4s linear'] },
            rotateOutDownRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateOutDownRight .4s linear'] },
            rotateOutUpLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateOutUpLeft .4s linear'] },
            rotateOutUpRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rotateOutUpRight .4s linear'] },
            hinge: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['hinge .4s linear'] },
            rollIn: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rollIn .4s linear'] },
            rollOut: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['rollOut .4s linear'] },
            zoomIn: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomIn .4s linear'] },
            zoomInDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomInDown .4s linear'] },
            zoomInLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomInLeft .4s linear'] },
            zoomInRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomInRight .4s linear'] },
            zoomInUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomInUp .4s linear'] },
            zoomOut: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomOut .4s linear'] },
            zoomOutDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomOutDown .4s linear'] },
            zoomOutLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomOutLeft .4s linear'] },
            zoomOutRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomOutRight .4s linear'] },
            zoomOutUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['zoomOutUp .4s linear'] },
            slideInDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideInDown .4s linear'] },
            slideInLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideInLeft .4s linear'] },
            slideInRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideInRight .4s linear'] },
            slideInUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideInUp .4s linear'] },
            slideOutDown: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideOutDown .4s linear'] },
            slideOutLeft: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideOutLeft .4s linear'] },
            slideOutRight: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideOutRight .4s linear'] },
            slideOutUp: { type: 'VJ.view.CssAction', mode: 'static', path: "animate.min.css", params: ['slideOutUp .4s linear'] },

            //验证 请注意双斜杠
            ValidateManager: { type: 'VJ.view.ValidateManager', mode: 'static' },
            Regex: { type: 'VJ.view.Regex' },
            isNumber: { type: 'VJ.view.Regex', params: ['/^((.?)|([0-9]+\\.{0,1}[0-9]{0,2})$/g'] },
            isInt: { type: 'VJ.view.Regex', params: ['/^((.?)|([0-9]+))$/g'] },
            isLetter: { type: 'VJ.view.Regex', params: ['/^((.?)|([A-Za-z]+))$/g'] },
            isPassword: { type: 'VJ.view.Regex', params: ['/^((.?)|(([a-zA-Z]|\\w){5,17}))$/g'] },
            isRequired: { type: 'VJ.view.Regex', params: ['/^(\\s*\\S\\s*)+$/g'] },
            isChinese: { type: 'VJ.view.Regex', params: ['/^((.?)|([\\u4e00-\\u9fa5]{0,}))$/g'] },
            isEmail: { type: 'VJ.view.Regex', params: ['/^((.?)|(\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*))$/g'] },
            isUrl: { type: 'VJ.view.Regex', params: ['/^((.?)|((http|https):\\/\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?))$/g'] },
            isPhone: { type: 'VJ.view.Regex', params: ['/^((.?)|((\\d{3}-\\d{8}|\\d{4}-\\d{7})))$/g'] },
            isMobile: { type: 'VJ.view.Regex', params: ['/^((.?)|(1[3|4|5|6|7|8][0-9]\\d{8}))$/g'] },
            isCard: { type: 'VJ.view.Regex', params: ['/^((.?)|((\\d{14}|\\d{17})(\\d|[a-zA-Z])))$/g'] },
            isQQ: { type: 'VJ.view.Regex', params: ['/^((.?)|([1-9]\\d{4,12}))$/g'] },
            isZipCode: { type: 'VJ.view.Regex', params: ['/^((.?)|([1-9]\\d{5}(?!\\d)))$/g'] },
            isIP: { type: 'VJ.view.Regex', params: ['/^((.?)|(([\\d+\\.]{3}|[\\d+\\.]{5})\\d+))$/g'] },
            isCurreny: { type: 'VJ.view.Regex', params: ['/^((.?)|(\\d+\\.\\d{2}))$/g'] },
            Required: { type: 'VJ.view.Regex', params: ['/^\\S.*\\S$|^\\S$/']}//首尾不为空的所有字符
        },
        'VESH.viewmodel': {
            pack: 'VJ.viewmodel',
            method: 'constructor',
            mode: 'instance',
            SessionDataManager: {
                type: '.SessionDataManager', mode: 'static', params: [
                    { ref: 'SessionDataAdapter' }
                ]
            },
            SessionDataAdapter: {
                type: '.SessionDataAdapter', method: 'constructorbean', mode: 'static', constructorparalength: 1, params: [
                    { ref: 'CookieDataResource' },
                    { params: 'Resource', 'abc': { ref: 'CookieDataResource'} },
                    { params: 'Resource', 'setlike': { ref: 'CookieDataResource'} }
                ]
            },
            CookieDataResource: { type: '.CookieDataResource', path: '/Scripts/ref/jquery.cookie.js', mode: 'static', params: [] },
            LocalDataResource: { type: '.StorageDataResource', mode: 'static', params: [window.top.localStorage] }
        },
        Ni: {
            pack: 'VJ.ni',
            constructorparalength: false, size: 50, app: '33',
            method: 'constructor',
            mode: 'static',
            ajaxresource: { type: '.NiAjaxDataFactory' },
            objresource: { type: '.NiObjectDataFactory' },
            sqlitefactory: { type: '.NiSqliteDataFactory' },
            //测试JS是否支持多个
            cm1: { type: 'VJ.config.getApplicationConfigManagerFromJS', params: ['ni', '../../Scripts/ni/ni.js'], method: 'factory' },
            cm2: { type: 'VJ.config.getApplicationConfigManagerFromObj', params: [window.ni], method: 'factory' },
            cm: { type: 'VJ.config.getApplicationConfigManagerFromObj', params: [VJ.merge(window.templateni, window.ni)], method: 'factory' },
            mobile: {
                type: '.NiTemplate', mode: 'instance', params: [
                    { type: '.NiStaticDataResource', params: [{ ref: 'objresource' }, { resource: window.app, dbtype: 'json'}] },
                    { ref: 'cm' }
                ]
            },
            template3: {
                type: '.NiTemplate', mode: 'instance', params: [
                    { type: '.NiPoolDataResource', params: [{ ref: 'ajaxresource' }, { dbtype: 'tjson', jsonp: '_bk'}] },
                    { ref: 'cm' }
                ]
            },
            template21: {
                type: '.NiTemplateDecorator', mode: 'instance', params: [
                    { type: '.NiStaticDataResource', params: [{ ref: 'ajaxresource' }, { dbtype: 'tjson', host: '../../Module/', timeout: 60000}] },
                    { type: '.NiStaticDataResource', params: [{ ref: 'objresource' }, { resource: window.sessionStorage}] },
                    { ref: 'cm' },
                    { timeout: { interval: 's', number: 50} }
                ]
            },
            template2: {
                type: '.NiLazyTemplateDecorator', mode: 'instance', params: [
                    { type: '.NiStaticDataResource', params: [{ ref: 'ajaxresource' }, { dbtype: 'tjson'}] },
                    { type: '.NiStaticDataResource', params: [{ ref: 'objresource' }, { resource: window.sessionStorage}] },
                    { ref: 'cm' },
                    { timeout: { interval: 's', number: 50} }
                ]
            },
            template1: {
                type: '.NiTemplate', mode: 'instance', params: [
                    { type: '.NiStaticDataResource', params: [{ ref: 'ajaxresource' }, { dbtype: 'tjson', host: '../../Module/', timeout: 60000}] },
                    { ref: 'cm' }
                ]
            },
            template: {
                type: '.NiMultiTemplateDecorator', mode: 'instance', params: [
                    { type: '.NiStaticDataResource', params: [{ ref: 'ajaxresource' }, { dbtype: 'tjson'}] },
                    { ref: 'cm' },
                    { self: true },
                    'Ni'
                ]
            },
            sqltemp: {
                type: '.NiTemplateDecorator', mode: 'instance', params: [
                    { type: '.NiStaticDataResource', params: [{ ref: 'sqlitefactory' }, { name: 'baibings', version: '1.0', desc: 'baibings', size: 2 * 1024 * 1024}] },
                    { type: '.NiStaticDataResource', params: [{ ref: 'objresource' }, { resource: window.sessionStorage}] },
                    { ref: 'cm' },
                    { timeout: { interval: 's', number: 50} }
                ]
            }
        }
    }
};

if (top.location == location) {
    window.top.config = window.config;
}