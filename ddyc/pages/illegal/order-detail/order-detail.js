const request = require('../../../utils/request');
const utils = require('../../../utils/util');
const pay = require('../../../utils/pay');

Page({
    data: {
        order: null,
    },
    callPhone(e) {
        const phone = String(e.currentTarget.dataset.phone);
        wx.makePhoneCall({
            phoneNumber: phone,
        });
    },
    pay() {
        pay(this.data.order.orderId);
    },
    getData(orderId) {
        request({
            url: `${utils.apiUrl}/illegal/order`,
            data: {
                type: 'detail',
                id: orderId,
            },
            method: 'GET',
            success: (res) => {
                if (res.success) {
                    this.setData({
                        order: res.data,
                    });
                } else {
                    utils.showErrorToast(res.message);
                }
            },
        });
    },
    onLoad(option) {
        this.orderId = option.orderId;
    },
    onShow() {
        this.getData(this.orderId);
    },
});
