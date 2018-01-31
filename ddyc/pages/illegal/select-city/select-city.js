const request = require('../../../utils/request');
const utils = require('../../../utils/util');

Page({
    data: {
        provinceList: null,
        cityList: null,
        selectedCityList: [],
        hideCity: true,
    },
    selectProvince: function(e) {
        const provinceId = e.currentTarget.dataset.id;
        const provinceList = this.data.provinceList;
        let cityList = null;
        provinceList.forEach((province, i) => {
            if (province.id == provinceId) {
                provinceList[i].current = true;
                cityList = province.cities;
            } else {
                provinceList[i].current = false;
            }
        });

        this.setData({
            provinceList: provinceList,
            cityList: cityList,
            hideCity: false
        });

    },
    selectCity: function(e) {
        if (this.data.selectedCityList.length >= 3) {
            return utils.showErrorToast('最多选择3个城市');
        }
        const cityId = e.currentTarget.dataset.id;
        const cityName = e.currentTarget.dataset.name;
        const cityList = this.data.cityList;
        const selectedCityList = this.data.selectedCityList;
        let selectedCity = null;

        // 看是否在已选择城市列表里
        for (let i = 0; i < selectedCityList.length; i++) {
            if (selectedCityList[i].id == cityId) {
                return;
            }
        }

        this.data.cityList.forEach((city, i) => {
            if (city.id == cityId) {
                selectedCity = cityList[i];
                cityList[i].current = true;
            } else {
                cityList[i].current = false;
            }
        });
        this.setData({
            cityList: cityList,
            selectedCityList: selectedCityList.concat(selectedCity)
            // selectedCityList: selectedCityList.concat({
            //     id: cityId,
            //     name: cityName
            // })
        });

    },
    deleteCity: function(e) {
        const cityId = e.currentTarget.dataset.id;
        const selectedCityList = this.data.selectedCityList;

        selectedCityList.forEach((city, i) => {
            if (city.id == cityId) {
                selectedCityList.splice(i, 1);
            }
        });
        this.setData({
            selectedCityList: selectedCityList
        });
    },
    confirm: function() {
        wx.setStorageSync('carInfo_searchCity', this.data.selectedCityList);
        wx.navigateBack();
    },
    onLoad: function(options) {
        request({
            url: `${utils.apiUrl}/illegal/cities`,
            method: 'GET',
            success: (res) => {
                if (res.success) {
                    this.setData({ provinceList: res.data.provinceList });
                }
            }
        });

        this.setData({
            selectedCityList: wx.getStorageSync('carInfo_searchCity') || []
        });
    },
})