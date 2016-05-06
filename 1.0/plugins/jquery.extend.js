var exlang = {
    // common
    common_confirm: "确定"
    // common
    , common_button_del: "删除"
    , common_button_save: "保存"
    , common_button_cancel: "取消"
    , common_button_modify: "修改"
    , common_button_confirm: "确定"
    , common_button_edit: "编辑"
    , common_button_export: "导出"
	, const_daysofweek: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期天"]
    // index.htm
    , organization_update_success: "保存成功！"
    , organization_dataNull: "公司数据为空，请联系系统管理员。"

    // page function
	, page_nav_status: ["当前第", "页，共", "页，总记录数"]

    // listNotice
    , listNotice_Add: "新建系统通知"
    , listNotice_Edit: "编辑系统通知"
    , listNotice_Success_Delete: "删除系统通知成功！"

    // listOrder.htm
	, treeview_name_tip: "名称不能为空，且不能包含特殊字符！"
    , delete_Order_Success: "删除成功！"
    , listOrder_delete_Success: "解除订购关系成功！"
    , getThemePackage_Fail: "获取该公司皮肤包失败，请稍后重试。"
    , themePackage_Delete_Confirm: "确定删除此皮肤吗？"
    , uploadThemePackage_Summary_Title: "上传皮肤压缩包"
    , uploadThemePackage_Fail: "上传自定义皮肤包失败，请稍后重试。"
    , deleteThemePackage_Fail: "删除皮肤失败！"
    , delete_themePackage_Success: "删除皮肤成功"


    // listOrganization.htm
    , listOrganization_Summary_title: ["共有", "条记录"]
    , listOrganization_Confirm_Delete: "确定要删除该合作伙伴吗？"
    , listOrganization_Delete_Success: "删除合作伙伴成功！"

    // orgStructure.htm
    , listUser_Summary_title: ["共有", "个用户"]
    , listOrg_SaveOrg_Title: "新建组织"
    , listOrg_addOrg_Success: "新建同级组织成功！"
    , listOrg_addSubOrg_Success: "新建子级组织成功！"

    // listUser
    , profile_Update_Success: "修改个人资料成功！"
    , deleteUser_Confirm: "确定要删除该用户吗？"
    , deleteUser_Success: "删除用户成功！"

    // format
    , format_date_short: ["年", "月", "日"]

    // management/listRole.htm
	, listRole_Confirm_Delete: ["确定要删除'", "'该角色吗？"]
	, listRole_Create: "创建一个新的角色"
	, listRole_Success_CreateRole: "新建角色成功!"
	, listRole_Success_DeleteRole: "成功删除指定角色！"

    // management/listPermission.htm
	, listPermission_Create: "创建一个新的权限"
	, listPermission_Confirm_Delete: ["确定要删除'", "'该权限吗？"]
	, listPermission_Success_CreatePermission: "新建权限成功!"
	, listPermission_Success_DeletePermission: "成功删除指定权限！"
	, listPermission_Success_update: "修改成功！"

    //card/generatorCard.htm
    , v_postilInfo_tooLong: "批次信息超过最大长度限制！"
    , v_AuthorizationCardNum_tooBig: "授权码数量超过10000的最大限制！"
    , v_Card_AuthorizationCardError: "输入的授权码数量中包含非数字！"

    //card/managerCard.htm
    , listCourseGroup_del_postilCard: "确实要删除该批次的授权码？"
    , listCourseGroup_card_start: "点击该图标发布该批次的授权码！"
    , listCourseGroup_card_alreadystart: "该批次的授权码已经发布，不能进行发布或停止发布操作！"
    , listCourseGroup_book_title: "确定"
    , listCourseGroup_book_msg: "确定要发布该批次的授权码吗？"

    // validate
	, formValidate_Error: "请正确填写信息。"
    , v_isUserName: "用户名只能包括中文字、英文字母、数字和下划线"
    , v_isEnUserName: "用户名只能包括英文字母、数字和下划线"
    , v_isMobile: "请正确填写您的手机号码"
    , v_isPhone: "请正确填写您的电话号码"
    , v_url: "请填写合法的URL地址。"
    , v_isZipCode: "请正确填写您的邮政编码"
    , v_NickName_maxlen: "您的昵称长度超过最大长度限制了。"
    , v_ContactPhone_maxlen: "请您填写正确的电话号码。"
    , v_WorkPhone_maxlen: "请您填写正确的工作电话。"
    , v_Mobile_maxlen: "请您填写正确的手机号码。"
    , v_isOrgName: "请输入中文名称。"
    //, v_isOrgEnName                                     : "Please fill in English name correctly."
    , v_isOrgEnName: "请输入英文名称。"
    , v_isOrgEnName2: "用户名不能包括中文字"
    , v_Fax: "请正确您填写的传真号码。"
    , v_Address_maxlen: "您填写的地址太长了。"
    , remote_permission: "权限名{0}已经被使用"
    , remote_Role: "角色名{0}已经被使用"
    , v_MaxLength: "最大长度超过了最大限度"
	, datepicker: {
	    clearText: '清除', // Display text for clear link
	    clearStatus: 'Erase the current date', // Status text for clear link
	    closeText: '关闭', // Display text for close link
	    closeStatus: 'Close without change', // Status text for close link
	    prevText: '&#x3c;上个月', // Display text for previous month link
	    prevStatus: 'Show the previous month', // Status text for previous month link
	    nextText: '下个月&#x3e;', // Display text for next month link
	    nextStatus: 'Show the next month', // Status text for next month link
	    currentText: '今天', // Display text for current month link
	    currentStatus: 'Show the current month', // Status text for current month link
	    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
			                            '七月', '八月', '九月', '十月', '十一月', '十二月'], // Names of months for drop-down and formatting
	    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
	    monthStatus: 'Show a different month', // Status text for selecting a month
	    yearStatus: 'Show a different year', // Status text for selecting a year
	    weekHeader: 'Wk', // Header for the week of the year column
	    weekStatus: 'Week of the year', // Status text for the week of the year column
	    dayNames: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], // For formatting
	    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
	    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'], // Column headings for days starting at Sunday
	    dayStatus: 'Set DD as first week day', // Status text for the day of the week selection
	    dateStatus: 'Select DD, M d', // Status text for the date selection
	    dateFormat: 'yy-mm-dd', // See format options on parseDate
	    firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
	    initStatus: 'Select a date', // Initial Status text on opening
	    isRTL: false // True if right-to-left language, false if left-to-right
	}



    , userName: "请输入用户名"
	, userNameValidate: "用户名只能以字母或\"_\"开始，可以包含数字，最长64个字符"
	, userNameUnused: "用户名中包含无效字符"
	, userNameDisenable: "用户名{0}已经被使用！"
	, userEmail: "请输入电子邮箱"
	, userEmailValidate: "请输入格式正确的电子邮箱地址"
	, userEmailDisenable: "电子邮箱{0}已经被使用！"
	, userEmailNotExist: "电子邮箱{0}不存在！"
	, userOldPassword: "请输入原始密码"
	, userPassword: "请输入密码"
	, confirmPassword: "请再次输入密码"
	, userPasswordValidate: "密码中不能包含空格"
	, nickName: "请输入昵称"
    , realName: "请输入真实姓名"
	, certCode: "请输入验证码"
	, certCodeError: "请输入正确的验证码"
	, userNameOrPasswordError: "请输入正确的用户名和密码"
	, userPortraitCancel: "请确定是否删除"
	, userMobileNumber: "请输入正确的手机号码"
	, userPhoneNumber: "请输入正确的电话号码格式！"
	, stringRangelength: "请输入一个长度介于 {0} 和 {1} 之间的字符串"
	, valueEqualTo: "请再次输入相同的值"
	, comFullName: "请输入公司的全称"
	, comPhone: "请输入公司的电话"
	, phoneNumber: "请输入正确的电话号码格式！"
	, homePage: "请输入格式正确的主页地址"
	, faxNumber: "请输入正确的传真地址"
	, spFullName: "请输入服务提供商的全称"
	, spPhone: "请输入服务提供商的电话"
	, searchUser: "搜索栏中不能包含无效字符‘%’"
	, userNickname: "昵称不允许包含无效字符“\\`~!@#$%^&*()_+-=[]{}<>,.?”"
	, userRealname: "真实姓名不允许包含无效字符“\\`~!@#$%^&*()_+-=[]{}<>,.?”"
	, v_isFax: "请输入格式正确的传真号码"
	, v_isURL: "请输入合法网址!"
	, v_password: "必选且密码不能输入空格"

    // listNotice.htm
    , listNotice_Success_CreateNotice: "新建通知成功！"
    , listNotice_Success_UpdateNotice: "更新通知成功！"
    , listNotice_Success_Delete: "删除通知成功！"
    , logoffInfo: "您的帐户已在其它地点，稍后将自动退出本系统！"

    // studentmagagement.htm
    , confirm_checkUser: "确认审核通过吗？"
    , confirm_freezUser: "确定是否'冻结'这些学员的账号,一旦确定,这些学员将无法登录本系统，但这些学员的账号和学习记录还将保留，并可以在本操作之后，进行'取消冻结'的操作，以恢复这些学员的正常登录"
    , confirm_delete: "确定是否删除这些学员的账号，一旦删除，还将级联删除该账号关联的个人数据，但学习记录，共享的笔记、帖子、套餐订购记录等还将保留(用于统计等)!"
    , confirm_cancel: "确定是否'取消冻结'，一旦确定，这些学员的账号就可以正常登录本系统。"

    //accountConfiguration.htm
    , updateAccountConfiguration_Success: "账户配置模式修改成功！"
};

/*
* Translated default messages for the $ validation plugin.
* Language: CN
* Author: Fayland Lam <fayland at gmail dot com>
*/
$.extend(
    $.validator.messages, {
        required: "必选字段",
        remote: "请修正该字段",
        email: "请输入正确格式的电子邮件",
        url: "请输入合法的网址",
        date: "请输入合法的日期",
        dateISO: "请输入合法的日期 (ISO).",
        number: "请输入合法的数字",
        digits: "只能输入整数",
        creditcard: "请输入合法的信用卡号",
        equalTo: "请再次输入相同的值",
        accept: "请输入拥有合法后缀名的字符串",
        maxlength: $.format("请将输入的内容控制在{0}个字数以内"),
        minlength: $.format("请将输入的内容控制在{0}个字数以上"),
        rangelength: $.format("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
        range: $.format("请输入一个介于 {0} 和 {1} 之间的值"),
        max: $.format("请输入一个最大为 {0} 的值"),
        min: $.format("请输入一个最小为 {0} 的值")
    }
);

// 扩展$ Validate，符合中国国情
// 用户名字符验证 
$.validator.addMethod("isUserName", function(value, element) {
    return this.optional(element) || /^[\u0391-\uFFE5\w]+$/.test(value);
}, exlang.v_isUserName);
// 公司组织中文名称验证
$.validator.addMethod("isOrgName", function(value, element) {
    return this.optional(element) || /^[\u4e00-\u9fa5]+$/.test(value);   
}, exlang.v_isOrgName);
// 公司组织英文字符验证，包含空格
$.validator.addMethod("isOrgEnName", function(value, element) {
return this.optional(element) || /^[A-Z|a-z|0-9| ]+$/.test(value);
}, exlang.v_isOrgEnName);
// 手机号码验证 
$.validator.addMethod("isMobile", function(value, element) {
    return this.optional(element) || /^[1][3,5,8][0-9]{9}$/.test(value);
}, exlang.v_isMobile);

// 电话号码验证 
$.validator.addMethod("isPhone", function(value, element) {
    return this.optional(element) || /^0[1-9]\d{1}[-]?[1-9]\d{7}$|^0[1-9]\d{2}[-]?[1-9]\d{7}$|^0[1-9]\d{2}[-]?[1-9]\d{6}$/.test(value);    
}, exlang.v_isPhone);
//传真号码验证
$.validator.addMethod("isFax", function(value, element) {
    return this.optional(element) || /^0[1-9]\d{1}[-]?[1-9]\d{7}$|^0[1-9]\d{2}[-]?[1-9]\d{7}$|^0[1-9]\d{2}[-]?[1-9]\d{6}$/.test(value); 
}, exlang.v_isFax);
// 邮政编码验证 
$.validator.addMethod("isZipCode", function(value, element) {
    var tel = /^[0-9]{6}$/;
    return this.optional(element) || (tel.test(value));
}, exlang.v_isZipCode);

// 中文字符验证 
$.validator.addMethod("isChinese", function(value, element) {
    var ch = /[\u4e00-\u9fa5]/g;
    return this.optional(element) || (ch.test(value));
}, exlang.v_isOrgName);

// 非中文字符验证 
$.validator.addMethod("isNoChinese", function(value, element) {
    var nch = /^[^\u4e00-\u9fa5]{0,}$/;
    return this.optional(element) || (nch.test(value));
}, exlang.v_isOrgEnName2);

// 网址url的验证
$.validator.addMethod("isURL", function(value, element) {
    var url = /\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/;
    return this.optional(element) || (url.test(value));
}, exlang.v_isURL);

/* Chinese initialisation for the $ UI date picker plugin. */
/* Written by Cloudream (cloudream@gmail.com). */
$(function($) {
    if($.datepicker == undefined) return;
    $.datepicker.regional['zh-CN'] = {
        clearText: '清除', clearStatus: '清除已选日期',
        closeText: '关闭', closeStatus: '不改变当前选择',
        prevText: '&#x3c;上月', prevStatus: '显示上月',
        prevBigText: '&#x3c;&#x3c;', prevBigStatus: '显示上一年',
        nextText: '下月&#x3e;', nextStatus: '显示下月',
        nextBigText: '&#x3e;&#x3e;', nextBigStatus: '显示下一年',
        currentText: '今天', currentStatus: '显示本月',
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
             '七月', '八月', '九月', '十月', '十一月', '十二月'],
        monthNamesShort: ['一', '二', '三', '四', '五', '六',
             '七', '八', '九', '十', '十一', '十二'],
        monthStatus: '选择月份', yearStatus: '选择年份',
        weekHeader: '周', weekStatus: '年内周次',
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
        dayStatus: '设置 DD 为一周起始', dateStatus: '选择 m月 d日, DD',
        dateFormat: 'yy-mm-dd', firstDay: 1,
        initStatus: '请选择日期', isRTL: false
    };
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
}); 

//$ validator 

$.validator.addMethod("userName", function(value, element) { 
  return this.optional(element) || /^[_a-zA-Z]+[a-zA-Z0-9_]{0,63}$/.test(value); 
}, exlang.userNameValidate);

$.validator.addMethod("userEmail", function(value, element) { 
  return this.optional(element) || /^ *[a-zA-Z0-9._%-]{1,61}[@][a-zA-Z0-9-]{1,60}([.][a-zA-Z0-9]{1,61}){1,} *$/.test(value); 
}, exlang.userEmailValidate);

$.validator.addMethod("userMobile", function(value, element) { 
  return this.optional(element) || /^[1][3,5,8][0-9]{9}$/.test(value); 
}, exlang.userMobileNumber);

$.validator.addMethod("userPhone", function(value, element) { 
  return this.optional(element) || /^([\d-])+$/.test(value); 
}, exlang.userPhoneNumber);

$.validator.addMethod("userPassword", function(value, element) { 
  return this.optional(element) || /^\S+$/.test(value); 
}, exlang.userPasswordValidate);

$.validator.addMethod("searchUser", function(value, element) { 
  return this.optional(element) || /^[^%]+$/.test(value); 
}, exlang.searchUser);

$.validator.addMethod("userNickname", function(value, element) { 
  return this.optional(element) || /^[^~!@#\$%`\^&\*()\\\_\+\-\=\[\]\{\}\<\>\,\.\?]+$/.test(value); 
}, exlang.userNickname);

$.validator.addMethod("userRealname", function(value, element) { 
  return this.optional(element) || /^[^~!@#\$%`\^&\*()\\\_\+\-\=\[\]\{\}\<\>\,\.\?]+$/.test(value); 
}, exlang.userRealname);