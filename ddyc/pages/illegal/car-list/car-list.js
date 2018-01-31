const request = require('../../../utils/request');
const utils = require('../../../utils/util');
const broadcast = require('../../../utils/broadcast');

const app = getApp();

Page({
    data: {
        carList: [],
        showPage: false,
    },
    add: function() {
        wx.navigateTo({
            url: `../car-info/car-info`
        })
    },
    edit: function(e) {
        const carId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `../car-info/car-info?carId=${carId}`
        })
    },
    gotoRecord: function(e) {
        const carId = e.currentTarget.dataset.id;
        app.illegal.carId = carId;
        wx.navigateBack();
    },
    getCarList: function() {
        request({
            url: `${utils.apiUrl}/illegal/car`,
            method: 'GET',
            success: (res) => {
                if (res.success) {
                    this.setData({
                        showPage: true,
                        carList: res.data,
                    });
                }
            }
        });
    },
    onShow: function() {
        this.getCarList();
    },
    // onLoad: function() {
    //     broadcast.on('deleteCarEvent', (data) => {
    //         this.getCarList();
    //     });

    //     this.getCarList();
    // },
    
})