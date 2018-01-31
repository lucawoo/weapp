const config = require('../config/index');

// 格式化数字，比如把1格式化成01
exports.formatNumber = function(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
};

// 格式化日期
exports.formatDate = function(date, format) {
    var pattern = /^\d+$/;
    if (typeof date === 'string' && pattern.test(date)) {
        date = date - 0;
    }

    date = new Date(date);

    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t){
        var v = map[t];
        if(v !== undefined){
            if(all.length > 1){
                v = '0' + v;
                v = v.substr(v.length-2);
            }
            return v;
        }
        else if(t === 'y'){
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
};

// 判断手机号，兼容测试帐号10112345678
exports.isPhone = function(phone) {
    if (!/^1\d{10}$/.test(phone)){
        return false;
    }
    return true;
};

exports.isVcode = function(code) {
    if (!/\d{4}$/.test(code)){
        return false;
    }
    return true;
}

exports.showErrorToast = function(msg) {
    wx.showModal({
        content: msg,
        showCancel: false
    });
};

exports.showLoading = function() {
    wx.showToast({
        title: '加载中...',
        icon: 'loading',
        duration: 10000,
        mask: true,
    })
}

exports.hideLoading = function() {
    wx.hideToast();
}

exports.apiUrl = config.debug ? `${config.apiMockHost}/${config.apiBasePath}` 
    : `${config.apiHost}/${config.apiBasePath}`;


exports.extend = function() {
    const extended = {};
    for(let key in arguments) {
        const argument = arguments[key];
        for (let prop in argument) {
            if (Object.prototype.hasOwnProperty.call(argument, prop)) {
                extended[prop] = argument[prop];
            }
        }
    }
    return extended;
};

exports.toUpperCase = function(str) {
    const pattern = /[^0-9A-Z]/g;
    return str.toUpperCase().replace(pattern, '');
};
