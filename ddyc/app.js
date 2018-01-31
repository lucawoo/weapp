//app.js

App({
    onLaunch: function() {
        // 检查session是否过期，更新request方法header里的sessionId
        // debugger;
        // checkSession();
    },

    onHide:function(){
      console.log('隐藏')
    },
    onShow(){
    
    },
    illegal: {
      carId: ''
    }
})
;

var appInstance = getApp();

console.log(appInstance.globalData)