// pages/login/login.js
const api = require('../../utils/api.js');

Page({
  data: {
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    userInfo: null,
    loggingIn: false
  },

  onLoad() {
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.hasLogin) {
        wx.switchTab({ url: '/pages/index/index' });
      }
    } catch (e) { /* ignore */ }
  },

  //获取用户信息并登录
  getUserProfile() {
    if (this.data.loggingIn) return;
    this.setData({ loggingIn: true });

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo || {};
        this.doLoginWithUserInfo(userInfo);
      },
      fail: (err) => {
        wx.showToast({ title: '授权失败，无法登录', icon: 'none' });
        this.setData({ loggingIn: false });
      }
    });
  },

  // 执行登录流程
  doLoginWithUserInfo(userInfo) {
    const that = this;

    wx.login({
      success(loginRes) {
        if (!loginRes || !loginRes.code) {
          wx.showToast({ title: '登录失败：获取 code 失败', icon: 'none' });
          that.setData({ loggingIn: false });
          return;
        }

        // 开发环境临时把 code 当作 openId；生产请后端用 code 换取真实 openId
        const openId = 'openid_' + loginRes.code;

        const loginData = {
          openId: openId,
          userName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          phoneNumber: ''
        };

        console.log('调用 /user/login 参数：', loginData);

        api.login(loginData).then(res => {
          console.log('/user/login 返回：', res);

          // 兼容后端两种常见返回格式：
          // 1) { code: 200, message: '', content: {...} }
          // 2) { success: true, message: '', content: {...} }
          const ok = (res && (res.code === 200 || res.code === '200' || res.success === true));

          if (ok) {
            const content = res.content || {};
            const userId = content.userId || content.user_id || null;

            // 保存用户信息（优先使用 app.setUserInfo）
            try {
              const app = getApp();
              if (app && typeof app.setUserInfo === 'function') {
                app.setUserInfo(userInfo, userId, openId);
              } else {
                wx.setStorageSync('userInfo', userInfo);
                if (userId) wx.setStorageSync('userId', userId);
                if (openId) wx.setStorageSync('openId', openId);
              }
            } catch (e) {
              wx.setStorageSync('userInfo', userInfo);
              if (userId) wx.setStorageSync('userId', userId);
              if (openId) wx.setStorageSync('openId', openId);
            }

            wx.showToast({ title: '登录成功', icon: 'success', duration: 1000 });
            setTimeout(() => {
              wx.switchTab({ url: '/pages/index/index' });
            }, 1000);
          } else {
            // 打印后端返回以便排查
            console.error('登录接口返回但被判定为失败：', res);
            const msg = (res && (res.message || res.msg)) ? (res.message || res.msg) : '登录失败';
            wx.showToast({ title: msg, icon: 'none' });
          }
        }).catch(err => {
          console.error('/user/login 调用失败：', err);
          wx.showToast({ title: '网络或服务器错误，登录失败', icon: 'none' });
        }).finally(() => {
          that.setData({ loggingIn: false });
        });
      },
      fail(err) {
        wx.showToast({ title: '登录失败', icon: 'none' });
        that.setData({ loggingIn: false });
      }
    });
  }
});