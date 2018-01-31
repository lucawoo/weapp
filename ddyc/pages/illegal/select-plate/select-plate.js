const { cityList, provinceList } = require('./data');

let selectedProvince = '';

Page({
    data: {
        hideProvince: false,
        hideCity: true,
        provinceList,
        cityList,

    },
    tapProvince: function(e) {
        selectedProvince = e.target.dataset.sn;
        this.setData({
            hideProvince: true,
            hideCity: false
        });
    },
    tapCity: function(e) {
        wx.setStorageSync('carInfo_plateCity', selectedProvince + e.target.dataset.text);
        wx.navigateBack();
    },
    onLoad: function(options) {
        //Do some initialize when page load.
        
    },
    onReady: function() {
        //Do some when page ready.
        
    },
    onShow: function() {
        //Do some when page show.
        
    },
    onHide: function() {
        //Do some when page hide.
        
    },
    onUnload: function() {
        //Do some when page unload.
        
    },
    onPullDownRefresh: function() {
        //Do some when page pull down.
        
    }
})