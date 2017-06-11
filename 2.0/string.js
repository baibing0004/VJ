//添加string.endWith与startWith方法
String.prototype.endWith = function(str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
};

String.prototype.startWith = function(str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
};

String.prototype.eq = function(str, isOri) {
    str = str + '';
    return isOri ? (this == str) : (this.toLowerCase() == str.toLowerCase());
};

String.prototype.trim = function(chr) {
    switch (chr) {
        case '/':
        case '\\':
        case '?':
        case '[':
        case ']':
        case '.':
        case '*':
        case '(':
        case ')':
        case '{':
        case '}':
            chr = '\\' + chr;
            break;
    }　　
    return this.replace(V.isValid(chr) ? new RegExp('(^' + chr + '+)|(' + chr + '+$)') : /(^\s+)|(\s+$)/g, "");　　
}