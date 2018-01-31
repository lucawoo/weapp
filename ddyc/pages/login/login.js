const request = require('../../utils/request');
const utils = require('../../utils/util');

Page({
    data: {
        canLogin: false,
        canGetVcode: false,
        vcodeText: '获取验证码',
        vcodeStatus: 0,
    },
    phone: '',
    vcode: '',
    bindPhoneChange: function(e) {
        this.phone = e.detail.value;
        this.validate();
    },
    bindVcodeChange: function(e) {
        this.vcode = e.detail.value;
        this.validate();
    },
    validate: function() {
        const isPhone = utils.isPhone(this.phone);
        const isVcode = utils.isVcode(this.vcode);

        this.setData({
            canGetVcode: isPhone,
            canLogin: isPhone && isVcode
        });
    },
    countDown: function() {
        let seconds = 30;
        const count = () => {
            if (seconds <= 0) {
                this.setData({
                    vcodeStatus: 0,
                    vcodeText: '获取验证码'
                });
                return;
            }

            this.setData({
                vcodeText: `剩余${seconds}秒`
            });
            
            setTimeout(() => {
                seconds--;
                count();
            }, 1000);
        };
        count();
    },
    getVcode: function() {
        if (!this.data.canGetVcode || this.data.vcodeStatus == 1) {
            return;
        }

        if (!utils.isPhone(this.phone)) {
            utils.showErrorToast('手机号格式错误');
            return;
        }

        this.setData({
            vcodeText: '发送中...',
            vcodeStatus: 1
        });

        request({
            url: `${utils.apiUrl}/login/code`,
            method: 'POST',
            data: {
                phone: this.phone
            },
            success: (res) => {
                this.countDown();
                if (res.success) {
                    // if (utils.isVcode(res.data)) {
                    //     wx.showToast({
                    //         title: res.data
                    //     });
                    // }
                } else {
                    utils.showErrorToast(res.message);
                }
            }
        });
    },
    login: function() {
        // if (!utils.isPhone(this.phone)) {
        //     utils.showErrorToast('手机号格式错误');
        //     return;
        // }
        // if (!utils.isVcode(this.vcode)) {
        //     utils.showErrorToast('验证码格式错误');
        //     return;
        // }
        if (!this.data.canLogin) {
            return;
        }
        request({
            url: `${utils.apiUrl}/login/index`,
            method: 'POST',
            data: {
                phone: this.phone,
                code: this.vcode
            },
            success: function(res) {
                if (res.success) {
                    wx.redirectTo({
                        url: '/pages/illegal/record/record'
                    });
                    // wx.navigateBack();
                } else {
                    utils.showErrorToast(res.message);
                }
            }
        });
    },
    onLoad: function(options) {
        //Do some initialize when page load.
        
    },
})