const utils = require('./util');
const config = require('../config/index');

let callback = null;

// 检查微信的登录态是否过期
function checkWxSession() {
    wx.checkSession({
        success: function(){
            checkInnerSession();
        },
        fail: function(){
            loginWx();
        },
    });
}

// 检查内部的session是否过期
function checkInnerSession() {
    const sessionId = wx.getStorageSync('sessionId');
    if (!sessionId) {
        loginWx();
    }
}

// 微信登录
function loginWx() {
    wx.login({
        success: function(res) {
            if(res.code) {
                wx.getUserInfo({
                    success: function(info) {
                        getSessionId({
                            code: res.code,
                            encryptedData: info.encryptedData,
                            iv: info.iv,
                            rawData: info.rawData,
                            signature: info.signature
                        });
                    }
                })
            } else {
                console.log(res.errMsg)
            }
        }
    })
}

// 获取sessionId
function getSessionId(data) {
    wx.request({
        // url: `${utils.apiUrl}/auth/weapp`,
        url: `${utils.apiUrl}/auth/weapp`,
        data: data,
        header: {
            'Content-Type': 'application/json',
            weapp: config.weappType
        },
        success: function(res) {
            if (res.data.success) {
                const sessionId = res.data.data;
                wx.setStorageSync('sessionId', sessionId);
                typeof callback == 'function' && callback(sessionId);
            } else {
                utils.showErrorToast(res.data.message);
            }
        }
    });
}

exports.checkSession = function() {
    checkWxSession();
}

exports.updateSession = function(cb) {
    callback = cb;
    loginWx();
}
