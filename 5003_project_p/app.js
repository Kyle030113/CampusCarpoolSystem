// app.js
App({
    globalData: {
      userInfo: null,
      userId: null,
      openId: null,
      hasLogin: false
    },
  
    onLaunch() {
      console.log('App Launch');
      // 检查登录状态
      this.checkLoginStatus();
    },
  
    // 检查登录状态
    checkLoginStatus() {
      const userInfo = wx.getStorageSync('userInfo');
      const userId = wx.getStorageSync('userId');
      const openId = wx.getStorageSync('openId');
      
      if (userInfo && userId && openId) {
        this.globalData.userInfo = userInfo;
        this.globalData.userId = userId;
        this.globalData.openId = openId;
        this.globalData.hasLogin = true;
        console.log('已登录，用户信息:', userInfo);
      } else {
        console.log('未登录');
      }
    },
  
    // 设置用户信息
    setUserInfo(userInfo, userId, openId) {
      this.globalData.userInfo = userInfo;
      this.globalData.userId = userId;
      this.globalData.openId = openId;
      this.globalData.hasLogin = true;
  
      // 持久化存储
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('userId', userId);
      wx.setStorageSync('openId', openId);
      
      console.log('用户信息已保存:', { userId, openId, userName: userInfo.nickName });
    },
  
    // 清除用户信息
    clearUserInfo() {
      this.globalData.userInfo = null;
      this.globalData.userId = null;
      this.globalData.openId = null;
      this.globalData.hasLogin = false;
  
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('userId');
      wx.removeStorageSync('openId');
      
      console.log('用户信息已清除');
    }
  })