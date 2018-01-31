const request = require('../../../utils/request');
const utils = require('../../../utils/util');

const info = {};

Page({
    data: {
        brands: null,
        series: null,
        models: null,
        hideSeries: true,
        hideModels: true,
    },
    dealBrand: function(data) {
        const brandKeys = [];
        const brands = [];

        data.forEach(brand => {
            if(brandKeys.indexOf(brand.alphaCode) == -1){
                brandKeys.push(brand.alphaCode);
                brands.push({
                    title:brand.alphaCode,
                    items:[{
                        icon:brand.icon,
                        value:brand.brandId,
                        name:brand.brandName
                    }]
                })
            }else{
                brands.map(bd => {
                    if(bd.title == brand.alphaCode){
                        bd.items.push({
                            icon:brand.icon,
                            value:brand.brandId,
                            name:brand.brandName
                        })
                    }
                    return bd
                })
            }
        });

        return brands;
    },
    tapBrand: function(e) {
        const brandId = e.currentTarget.dataset.id;
        const brandName = e.currentTarget.dataset.name;
        info.brandId = brandId;
        info.brandName = brandName;
        request({
            url: `${utils.apiUrl}/illegal/series`,
            method: 'POST',
            data: {
                brandId: brandId
            },
            success: (res) => {
                if (res.success) {
                    this.setData({
                        series: res.data,
                        hideSeries: false,
                    });
                }
            }
        });
    },
    tapSeries: function(e) {
        const seriesId = e.currentTarget.dataset.id;
        const seriesName = e.currentTarget.dataset.name;
        info.seriesId = seriesId;
        info.seriesName = seriesName;
        request({
            url: `${utils.apiUrl}/illegal/model`,
            method: 'POST',
            data: {
                seriesId: seriesId
            },
            success: (res) => {
                if (res.success) {
                    this.setData({
                        models: res.data,
                        hideSeries: true,
                        hideModels: false,
                    });
                }
            }
        });
        
    },
    tapModel: function(e) {
        const modelId = e.currentTarget.dataset.id;
        const modelName = e.currentTarget.dataset.name;
        info.modelId = modelId;
        info.modelName = modelName;

        wx.setStorageSync('carInfo_brandInfo', info);
        wx.navigateBack();
    },
    tapLetter: function(e) {
        this.setData({
            toLetter: 'letter-' + e.currentTarget.dataset.letter
        })
    },
    scroll: function() {
        console.log(11)
    },
    hideSeries: function() {
        this.setData({
            hideSeries: true
        });
    },
    hideModels: function() {
        this.setData({
            hideModels: true
        });
    },
    initData: function(brands) {
        const letters = brands.map(item => item.title);
        this.setData({
            brands: brands,
            letters: letters,
        })
    },
    onLoad: function(options) {
        //Do some initialize when page load.
        const brands = wx.getStorageSync('carInfo_brands');

        if (brands) {
            this.initData(brands);
            return;
        }
        request({
            url: `${utils.apiUrl}/illegal/brand`,
            method: 'POST',
            success: (res) => {
                if (res.success) {
                    const brands = this.dealBrand(res.data);   
                    this.initData(brands);
                    wx.setStorageSync('carInfo_brands', brands);
                }
            }
        });
    },
})