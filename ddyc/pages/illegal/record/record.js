const request = require('../../../utils/request');
const utils = require('../../../utils/util');

const app = getApp();

let appkey = 'UZEI2UW4EGZRIKCY';

Page({
    data: {
        illegalResult: null,
        carInfo: null,
        navIndex: 0,
        orderList: [],
        isHideMore: true,
        showDealBtn: false,
        canDeal: true,
        animationData: {},
        showProgress: true,
    },
    pageNumber: 1,
    viewCarList() {
        wx.navigateTo({
            url: '../car-list/car-list',
        });
    },
    addCar() {
        wx.navigateTo({
            url: '../car-info/car-info',
        });
    },
    editCar() {
        wx.navigateTo({
            url: `../car-info/car-info?carId=${this.data.carInfo.id}`,
        });
    },
    dealData(data) {
        if (!data.data) {
            data.data = {};
        }
        const illegalResult = data.data.illegalResult;
        let errCode = '';
        let message = '';

        // 处理错误类型
        if (data.code == 4001) {
            errCode = 'noCar';
        } else if (data.code == 4002 || [2003, 2004, 1006, 9998, 1020, 1013, 1021, 1022,
            1030, 1031, 1032, 1033, 1035, 1036, 2002].indexOf(Number(data.errCode)) != -1) {
            errCode = 'carError';
            message = data.message;
        } else if (data.errCode) {
            errCode = 'netError';
            message = data.message || '服务器繁忙，请稍后重试';
        }

        // 是否显示去处理按钮
        let showDealBtn = false;
        if (illegalResult && illegalResult.violations && illegalResult.violations.length > 0) {
            illegalResult.violations.forEach((item, index) => {
                if (item.processStatus == 1 && item.canSelect) {
                    illegalResult.violations[index].selected = true;
                    showDealBtn = true;
                }
            });
        }

        this.setData({
            carInfo: data.data.carInfo || null,
            illegalResult: data.data.illegalResult || { flag: true },
            errCode,
            message,
            showDealBtn,
        });
    },
    toggleNav(e) {
        const index = e.currentTarget.dataset.index;
        if (index == this.data.navIndex) {
            return;
        }
        if (index == 1) {
            this.refreshOrder();
        } else {
            this.getRecord();
        }
        this.setData({
            navIndex: index,
        });
    },
    getOrders() {
        request({
            url: `${utils.apiUrl}/illegal/order`,
            data: {
                type: 'list',
                pageSize: 20,
                pageNumber: this.pageNumber,
            },
            method: 'GET',
            success: (res) => {
                wx.stopPullDownRefresh();
                if (res.success) {
                    if (res.pageNumber <= res.pageCount) {
                        this.setData({
                            orderList: this.data.orderList.concat(res.data),
                        });
                        this.pageNumber = res.pageNumber + 1;
                    }
                    this.setData({
                        pageCount: res.pageCount,
                        isHideMore: res.pageNumber >= res.pageCount ? true : false,
                    });
                } else {
                    utils.showErrorToast(res.message);
                }
            },
        });
    },
    getMore() {
        this.getOrders();
    },
    gotoDetail(e) {
        const orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `../order-detail/order-detail?orderId=${orderId}`,
        });
    },
    toggleSelected(e) {
        const index = e.currentTarget.dataset.index;
        const illegalResult = this.data.illegalResult;
        let canDeal = false;

        illegalResult.violations[index].selected = !illegalResult.violations[index].selected;

        illegalResult.violations.forEach((item) => {
            if (item.selected) {
                canDeal = true;
            }
        });

        this.setData({
            illegalResult,
            canDeal,
        });
    },
    gotoDeal() {
        if (!this.data.canDeal) {
            return;
        }

        const codes = [];
        this.data.illegalResult.violations.forEach((item) => {
            if (item.selected) {
                codes.push(item.code);
            }
        });

        wx.navigateTo({
            url: `../deal/deal?carId=${this.data.carInfo.id}&codes=${codes.join(',')}`,
        });
    },
    // startProgress() {
    //     const duration = 10000;
    //     const steps = [70, 90, 99];
    //     const animation = wx.createAnimation({ duration });
    //     let count = 0;
    //     const run = () => {
    //         if (count >= steps.length) return;
    //         animation.width(`${steps[count]}%`).step();
    //         this.setData({
    //             animationData: animation.export(),
    //         });
    //         this.timer = setTimeout(() => {
    //             count += 1;
    //             run();
    //         }, duration);
    //     };

    //     run();
    //     this.animation = animation;

    //     this.setData({
    //         showProgress: true,
    //         animationData: animation.export(),
    //     });
    // },
    // stopProgress() {
    //     clearTimeout(this.timer);
    //     this.animation.width('0%').step({
    //         duration: 0,
    //     });
    //     this.setData({
    //         showProgress: false,
    //         animationData: this.animation.export(),
    //     });
    // },
    startProgress() {
        this.setData({
            showProgress: true,
        });
        setTimeout(() => {
            this.setData({
                progressWidth: '99%',
            });
        }, 100);
    },
    stopProgress() {
        setTimeout(() => {
            this.setData({
                showProgress: false,
                progressWidth: '0%',
            });
        }, 100);
    },
    getRecord() {
        this.startProgress();
        request({
            loading: false,
            url: `${utils.apiUrl}/illegal/result`,
            data: {
                appkey,
                carId: app.illegal.carId || '',
            },
            method: 'POST',
            success: (res) => {
                this.stopProgress();
                wx.stopPullDownRefresh();
                this.dealData(res);
                // this.carId = res.data.carInfo ? res.data.carInfo.id : '';
            },
        }, true);
    },
    refreshOrder() {
        this.setData({
            orderList: [],
        });
        this.pageNumber = 1;
        this.getOrders();
    },
    refreshData() {
        if (this.data.navIndex == 1) {
            this.refreshOrder();
        } else {
            this.getRecord();
        }
    },
    onLoad(options) {
        if (options.appkey) {
            appkey = options.appkey;
        }
    },
    onShow() {
        this.refreshData();
    },
    onPullDownRefresh() {
        this.refreshData();
    },
    onShareAppMessage() {
        return {
            title: '违章处理神器',
            // desc: 'HI朋友，我一直用【典典养车】处理违章，不用请假、不用排队，1-3个工作日搞定。有违章，找典典！',
            path: '/pages/illegal/record/record',
        };
    },
});
