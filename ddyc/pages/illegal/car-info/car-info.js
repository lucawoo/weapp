const request = require('../../../utils/request');
const utils = require('../../../utils/util');
// const broadcast = require('../../../utils/broadcast');

const app = getApp();

Page({
    data: {
        plateCity: '浙A',
        disabledQueryBtn: true,
        cityList: [],
        carId: '',

        hideFrameExample: true,
        hideEngineExample: true,

        needFrameNumber: -1,
        needEngineNumber: -1,

        plateNumber: '',
        showPage: false,

        type: 'add',
        carNum: '',
        brandId: '',
        brandName: '',
        seriesId: '',
        seriesName: '',
        modelId: '',
        modelName: '',
        cityIds: '',
        vin: '',
        engineNo: '',
        
    },
    toggleFrameExample: function() {
        this.setData({
            hideFrameExample: !this.data.hideFrameExample
        });
    },
    toggleEngineExample: function() {
        this.setData({
            hideEngineExample: !this.data.hideEngineExample
        });
    },
    selectPlate: function() {
        wx.navigateTo({
            url: '../select-plate/select-plate'
        });
    },
    selectBrand: function() {
        wx.navigateTo({
            url: '../select-brand/select-brand'
        });
    },
    selectCity: function() {
        wx.navigateTo({
            url: '../select-city/select-city'
        });
    },
    inputPlate: function(e) {
        this.setData({
            plateNumber: utils.toUpperCase(e.detail.value),
        });
        this.validate();
    },
    inputFrame: function(e) {
        this.setData({
            vin: utils.toUpperCase(e.detail.value),
        });
        this.validate();
    },
    inputEngine: function(e) {
        this.setData({
            engineNo: utils.toUpperCase(e.detail.value),
        });
        this.validate();
    },
    deleteCar: function() {
        wx.showModal({
            title: '删除车辆',
            content: '您确定要删除该车辆信息？',
            success: (res) => {
                if (res.confirm) {
                    request({
                        url: `${utils.apiUrl}/illegal/car`,
                        method: 'POST',
                        data: {
                            carId: this.data.carId,
                            type: 'delete',
                        },
                        success: (res) => {
                            if (res.success) {
                                if (app.illegal.carId == this.data.carId) {
                                    app.illegal.carId = '';
                                }
                                // broadcast.fire('deleteCarEvent');
                                wx.navigateBack();
                                // wx.navigateBack({
                                //     delta: getCurrentPages().length,
                                // });
                            } else {
                                utils.showErrorToast(res.message);
                            }
                        },
                    });
                }
            },
        });
        
    },
    query: function() {
        if (this.data.disabledQueryBtn) {
            return false;
        }
        const data = this.data;
        request({
            url: `${utils.apiUrl}/illegal/car`,
            method: 'POST',
            data: {
                carNum: data.plateCity + data.plateNumber,
                brandId: data.brandId,
                brandName: data.brandName,
                seriesId: data.seriesId,
                seriesName: data.seriesName,
                modelId: data.modelId,
                modelName: data.modelName,
                cityIds: data.cityList.map(i => i.id).join(','),
                vin: data.vin,
                engineNo: data.engineNo,
                
                carId: data.carId,
                type: data.type,
            },
            success: (res) => {
                if (res.success) {
                    app.illegal.carId = res.data;
                    wx.navigateBack({
                        delta: getCurrentPages().length
                    });
                    // wx.redirectTo({
                    //     url: `../record/record?carId=${this.data.carId}`
                    // })
                } else {
                    utils.showErrorToast(res.message || '查询失败');
                }
            }
        });
    },
    validate: function() {
        let disabledQueryBtn = this.data.disabledQueryBtn;
        let needFrameNumber = this.data.needFrameNumber;
        let needEngineNumber = this.data.needEngineNumber;

        if (needFrameNumber == -1) {
            needFrameNumber = 4;
        }

        if (needEngineNumber == -1) {
            needEngineNumber = 4;
        }

        if (this.data.plateNumber.length >= 5 && 
            (needFrameNumber == 0 || this.data.vin.length >= needFrameNumber) && 
            (needEngineNumber == 0 || this.data.engineNo.length >= needEngineNumber)) {
            disabledQueryBtn = false;
        } else {
            disabledQueryBtn = true;
        }

        this.setData({
            disabledQueryBtn: disabledQueryBtn
        });
    },
    deleteCityList: function(e) {
        const cityId = e.currentTarget.dataset.id;
        const cityList = this.data.cityList;
        cityList.forEach((city, i) => {
            if (city.id == cityId) {
                cityList.splice(i, 1);
            }
        });
        wx.setStorageSync('carInfo_searchCity', cityList);
        this.setData({
            cityList: cityList
        });
        this.calcNeedNumber();
        this.validate();
    },
    initData: function(carId) {
        request({
            url: `${utils.apiUrl}/illegal/car`,
            method: 'GET',
            data: {
                carId: carId
            },
            success: (res) => {
                if (res.success) {
                    const data = res.data;
                    const plateCity = data.plateNumbers.slice(0, 2);
                    
                    this.setData({
                        // carNum: data.plateNumbers,
                        brandId: data.brandId,
                        brandName: data.brandName,
                        seriesId: data.seriesId,
                        seriesName: data.seriesName,
                        modelId: data.modelId,
                        modelName: data.modelName,
                        vin: data.vin || '',
                        engineNo: data.ein || '',
                        // cityList: data.cityList,

                        carId: carId,
                        plateCity: plateCity,
                        plateNumber: data.plateNumbers.slice(2),
                        
                        type: 'edit',
                        disabledQueryBtn: false,
                    });

                    wx.setStorageSync('carInfo_searchCity', data.cityList);

                    this.calcNeedNumber();
                    this.validate();
                    this.initDefaultCity(plateCity, data.cityList);

                    // this.setData({
                    //     showPage: true,
                    // });
                }
            }
        });
    },
    initSn: function() {
        wx.getLocation({
            type: 'wgs84',
            success: (res) => {
                request({
                    url: `${utils.apiUrl}/base/address`,
                    method: 'GET',
                    data: {
                        lat: res.latitude,
                        lng: res.longitude,
                        sn: true,
                    },
                    success: (res) => {
                        if (res.success && res.data.sn) {
                            this.setData({
                                plateCity: res.data.sn,
                            });
                            this.initDefaultCity(res.data.sn);
                        } 
                    },
                });
            },
        });
    },
    initDefaultCity: function(vehicle, cityList = []) {
        request({
            url: `${utils.apiUrl}/illegal/defaultcity`,
            method: 'GET',
            data: {
                vehicle,
            },
            success: (res) => {
                if (res.success) {
                    if (res.data.tickets.isRegisteredAddress) {
                        cityList = cityList.filter((item) => {
                            return !item.isRegisteredAddress && item.id != res.data.tickets.id;
                        });
                        cityList.unshift(res.data.tickets);
                    } else {
                        cityList = cityList.filter((item) => {
                            return !item.isRegisteredAddress;
                        });
                    }
                    this.setData({
                        cityList,
                        showPage: true,
                    });
                    wx.setStorageSync('carInfo_searchCity', cityList);
                    this.calcNeedNumber();
                    this.validate();
                }
            },
        });
    },
    removeStorage: function() {
        wx.removeStorageSync('carInfo_plateCity');
        wx.removeStorageSync('carInfo_brandInfo');
        wx.removeStorageSync('carInfo_searchCity');
    },
    onLoad: function(options) {
        this.removeStorage();
        // options.carId = 2732129;
        if (options.carId) {
            this.initData(options.carId);
        } else {
            this.initSn();
            this.setData({
                showPage: true,
            });
        }
    },
    /**
     * needFrameNumber（需要填写的车架号位数）
     * -1: 全部车架号
     * 0 : 不需要车架号
     * 6: 输入车架号后6位
     * needEngineNumber同上
     */
    calcNeedNumber: function() {
        let frame = 0;
        let engine = 0;
        let cityList = this.data.cityList;

        if (cityList.length == 0) {
            frame = -1;
            engine = -1;
        } else {
            cityList.forEach((city, i) => {
                if (frame != -1 && city.needFrameNumber == -1) {
                    frame = -1
                } else if (frame != -1 && city.needFrameNumber > frame) {
                    frame = city.needFrameNumber
                }
                if (engine != -1 && city.needEngineNumber == -1) {
                    engine = -1
                } else if (engine != -1 && city.needEngineNumber > engine) {
                    engine = city.needEngineNumber
                }
            });
        }

        this.setData({
            // 需要的车架号位数大于已经填写的，就清空车架号，好让用户能够看到需要输入几位车架号
            vin: frame > String(this.data.vin).length ? '' : this.data.vin,
            engineNo: engine > String(this.data.engineNo).length ? '' : this.data.engineNo,
            needFrameNumber: Number(frame),
            needEngineNumber: Number(engine),
            framePlaceholder: frame == -1 ? '请输入全部车架号' : `请输入车架号后${frame}位`,
            enginePlaceholder: engine == -1 ? '请输入全部发动机号' : `请输入发动机号后${engine}位`,
        });
    },
    onShow: function() {
        const plateCity = wx.getStorageSync('carInfo_plateCity');
        const brandInfo = wx.getStorageSync('carInfo_brandInfo');
        const cityList = wx.getStorageSync('carInfo_searchCity');

        if (plateCity) {
            this.setData({
                plateCity: plateCity
            });
            this.initDefaultCity(plateCity);
        }

        if (brandInfo) {
            this.setData({
                brandId: brandInfo.brandId,
                brandName: brandInfo.brandName,
                seriesId: brandInfo.seriesId,
                seriesName: brandInfo.seriesName,
                modelId: brandInfo.modelId,
                modelName: brandInfo.modelName,
            });
        }

        if (cityList) {
            this.setData({
                cityList: cityList
            });
        }

        this.calcNeedNumber();
        this.validate();
    },
})