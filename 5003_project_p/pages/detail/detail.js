// pages/detail/detail.js
const api = require('../../utils/api.js');

Page({
  data: {
    item: {},
    participants: [],
    participantCount: 0
  },

  onLoad(options) {
    console.log('detail onLoad options:', options);
    const carpoolId = options.carpoolId || options.id;
    if (!carpoolId) {
      wx.showToast({ title: '缺少行程ID', icon: 'none' });
      return;
    }

    // 优先尝试从前一页读取缓存的 item（快速响应）
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prev = pages[pages.length - 2];
      if (prev && prev.data) {
        const maybe = (prev.data.ongoingList || []).concat(prev.data.finishedList || []).find(i =>
          (i.carpoolId === carpoolId || i.carpool_id === carpoolId || i.id === carpoolId)
        );
        if (maybe) {
          this._setItem(maybe);
          return;
        }
      }
    }

    // 如果没有本地缓存且后端有单条详情接口，调用它
    if (api.getCarpoolDetail) {
      api.getCarpoolDetail(carpoolId).then(res => {
        console.log('getCarpoolDetail resp', res);
        // 尝试兼容不同后端包装格式
        let data = null;
        if (res) {
          if (res.content) data = res.content;
          else if (res.data) data = res.data;
          else data = res;
        }
        if (data) {
          this._setItem(data);
        } else {
          wx.showToast({ title: '未获取到行程详情', icon: 'none' });
        }
      }).catch(err => {
        console.error('getCarpoolDetail error', err);
        wx.showToast({ title: '加载详情失败', icon: 'none' });
      });
    } else {
      // 没有后端详情接口，提示并返回
      wx.showToast({ title: '未找到行程详情', icon: 'none' });
    }
  },

  _setItem(item) {
    // Map display fields similarly于其它页面，避免 wxml 计算出错
    const displayOrigin = item.displayOrigin || item.origin || item.originCity || '';
    const displayDestination = item.displayDestination || item.destination || item.destinationCity || '';
    const displayDeparture = item.displayDeparture || item.departureTime || item.departure_time || item.departure || '';
    const participants = Array.isArray(item.participants) ? item.participants : [];

    this.setData({
      item: Object.assign({}, item, { displayOrigin, displayDestination, displayDeparture }),
      participants,
      participantCount: participants.length
    });
  },

  onClose() {
    wx.navigateBack();
  }
});