const utils = require('./util');
const request = require('./request');

function pay(orderId, options) {
    const settings = utils.extend(options, {
        success(res) {
            wx.redirectTo({
                url: `/pages/illegal/order-detail/order-detail?orderId=${orderId}`,
            });
        },
    });
    wx.requestPayment(settings);
}

function prepay(orderId, payAccounts) {
    request({
        url: `${utils.apiUrl}/illegal/prepay`,
        data: {
            orderId,
            payAccounts,
        },
        method: 'POST',
        success: (res) => {
            if (res.success) {
                pay(orderId, res.data.resp);
            } else {
                utils.showErrorToast(res.message);
            }
        },
    });
}

module.exports = prepay;
