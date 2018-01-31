const { updateSession } = require('./session');
const config = require('../config/index');
const utils = require('./util');

let header = {
    'Content-Type': 'application/json',
    weapp: config.weappType,
    xkzone: config.debug ? config.xkzone : '',
    'session-id': wx.getStorageSync('sessionId')
};

function request(options, disableLoading) {
    if (!disableLoading) {
        utils.showLoading();
    }
    const defaults = {
        header: utils.extend(header, options.header),
        success: function(res) {
            if (!disableLoading) {
                utils.hideLoading();
            }
            // session过期
            if (res.data.code == -2) {
                updateSession((sessionId) => {
                    header['session-id'] = sessionId;
                    request(options);
                });
                return;
            }
            // 需要绑定手机号
            if (res.data.code == -1) {
                wx.redirectTo({
                    url: '/pages/login/login'
                });
                return;
            }

            if (typeof options.success === 'function') {
                options.success(res.data);
            }
        }
    }

    const settings = utils.extend({}, options, defaults);

    wx.request(settings);
}

module.exports = request;