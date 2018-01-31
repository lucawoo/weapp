const request = require('../../../utils/request');
const utils = require('../../../utils/util');
const pay = require('../../../utils/pay');

Page({
    data: {
        violations: null,
        showDetail: false,
        bonuses: [],
        selectedBonusIndex: -1,
        selectedBonusAmount: 0,
        totalPrice: 0,
        isShowBonus: false,
        isShowPage: false,
    },
    dealData(violations) {
        const totalCount = violations.length;
        let totalFine = 0;
        let totalServiceFee = 0;

        violations.forEach((v) => {
            totalFine += Number(v.fine);
            totalServiceFee += Number(v.serviceFee) || 0;
        });

        this.setData({
            violations,
            totalCount,
            totalFine,
            totalServiceFee,
            totalPrice: totalFine + totalServiceFee,
        });
    },
    toggleDetail() {
        this.setData({
            showDetail: !this.data.showDetail,
        });
    },
    getPayAccounts() {
        const payStr = `WEIXIN||${this.data.totalPrice}`;
        let bonusStr = '';

        if (this.data.selectedBonusIndex !== -1) {
            const bonus = this.data.bonuses[this.data.selectedBonusIndex];
            bonusStr = `,BONUS|${bonus.id}|${bonus.amount}`;
        }

        return `${payStr}${bonusStr}`;
    },
    gotoPay() {
        wx.getLocation({
            type: 'wgs84',
            success: (res) => {
                request({
                    url: `${utils.apiUrl}/illegal/order`,
                    data: {
                        lat: res.latitude,
                        lng: res.longitude,
                        token: this.token,
                        totalPrice: this.data.totalPrice,
                        violationCodes: this.codes,
                    },
                    method: 'POST',
                    success: (res) => {
                        if (res.success) {
                            pay(res.data.orderId, this.getPayAccounts());
                        } else {
                            utils.showErrorToast(res.message);
                        }
                    },
                });
            },
        });
    },
    openBonusDialog() {
        this.setData({
            isShowBonus: true,
        });
    },
    selectBonus(e) {
        const index = e.currentTarget.dataset.index;
        const selectedBonusAmount = index === -1 ? 0 : this.data.bonuses[index].amount;
        let totalPrice = (this.data.totalFine + this.data.totalServiceFee) - selectedBonusAmount;

        if (totalPrice < 0) {
            totalPrice = 0;
        }

        this.setData({
            isShowBonus: false,
            selectedBonusIndex: index,
            selectedBonusAmount,
            totalPrice,
        });
    },
    closeBonusDialog() {
        this.setData({
            isShowBonus: false,
        });
    },
    requestBonus() {
        request({
            url: `${utils.apiUrl}/illegal/bonuses`,
            data: {},
            method: 'GET',
            success: (res) => {
                if (res.success) {
                    this.setData({
                        bonuses: res.data,
                    });
                } else {
                    utils.showErrorToast(res.message);
                }
            },
        });
    },
    onLoad(options) {
        this.codes = options.codes;
        request({
            url: `${utils.apiUrl}/illegal/violation/preorder`,
            data: options,
            method: 'GET',
            success: (res) => {
                if (res.success) {
                    this.requestBonus();
                    this.token = res.data.token;
                    this.dealData(res.data.violations);
                    this.setData({
                        isShowPage: true,
                    });
                } else {
                    utils.showErrorToast(res.message);
                }
            },
        });
    },
});
