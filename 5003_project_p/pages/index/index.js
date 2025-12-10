// pages/index/index.js
const api = require('../../utils/api.js');
const regions = require('../../utils/regions.js');

Page({
  data: {
    carpoolList: [],
    filteredList: [],
    originCity: '',
    originDistrict: '',
    destinationCity: '',
    destinationDistrict: '',
    lastOriginFilter: '',
    lastDestinationFilter: ''
  },

  onLoad() {
    console.log('首页 onLoad');
    this.setData({ cities: regions.getCities() || [] });
  },

  onShow() {
    console.log('首页 onShow');
    this.loadCarpoolList();
  },


  _safe(val) {
    if (val === undefined || val === null) return '';
    return String(val).trim();
  },

  _formatDeparture(raw) {
    if (!raw) return '';
    const s = String(raw).replace('T', ' ');
    return s.length > 16 ? s.substring(0, 16) : s;
  },

  _mapItem(item) {
    const safe = this._safe;
    const displayOrigin =
      safe(item.origin) ||
      safe(item.originCity) ||
      safe(item.origin_detail) ||
      safe(item.originDetail) ||
      (safe(item.originCity) && safe(item.originDistrict) ? `${safe(item.originCity)} ${safe(item.originDistrict)}` : '') ||
      '';
    const displayDestination =
      safe(item.destination) ||
      safe(item.destinationCity) ||
      safe(item.destination_detail) ||
      safe(item.destinationDetail) ||
      (safe(item.destinationCity) && safe(item.destinationDistrict) ? `${safe(item.destinationCity)} ${safe(item.destinationDistrict)}` : '') ||
      '';
    const displayDeparture = this._formatDeparture(item.departureTime || item.departure_time || item.departure || '');
    const statusNum = Number(item.status || 0);
    const isFinished = (statusNum !== 1);
    return Object.assign({}, item, { displayOrigin, displayDestination, displayDeparture, statusNum, isFinished });
  },


  loadCarpoolList(origin = '', destination = '') {
    console.log('loadCarpoolList -> origin:', origin, 'destination:', destination);
    this.setData({ lastOriginFilter: origin, lastDestinationFilter: destination });

    api.browseCarpool(origin, destination).then(res => {
      const ok = res && (res.code === 200 || res.code === '200' || res.success === true);
      if (!ok) {
        console.error('browseCarpool returned not-ok:', res);
        wx.showToast({ title: res && (res.message || res.msg) ? (res.message || res.msg) : '加载失败', icon: 'none' });
        this.setData({ carpoolList: [], filteredList: [] });
        return;
      }

      let list = (res.content || []).map(item => this._mapItem(item));
      console.log('loaded list length:', list.length);
      if (list.length > 0) console.log('first loaded item:', JSON.stringify(list[0], null, 2));


      const originFilter = this._safe(origin).toLowerCase();
      const destFilter = this._safe(destination).toLowerCase();
      let filtered = list;
      if (originFilter) filtered = filtered.filter(i => (i.displayOrigin || '').toLowerCase().includes(originFilter));
      if (destFilter) filtered = filtered.filter(i => (i.displayDestination || '').toLowerCase().includes(destFilter));
      console.log('after client filter length:', filtered.length);

      this.setData({ carpoolList: list, filteredList: filtered });
      if (filtered.length === 0) {
        wx.showToast({ title: '暂无符合筛选的拼车信息', icon: 'none', duration: 1200 });
      }
    }).catch(err => {
      console.error('browseCarpool error:', err);
      wx.showToast({ title: '加载失败，请检查网络', icon: 'none' });
      this.setData({ carpoolList: [], filteredList: [] });
    });
  },


  showFilterPanel() {
    console.log('showFilterPanel -> start action-sheet based flow');
    wx.showToast({ title: '请选择出发城市', icon: 'none', duration: 800 });

    const cities = regions.getCities() || [];
    if (!cities || cities.length === 0) {
      wx.showToast({ title: '城市数据为空，无法筛选', icon: 'none' });
      return;
    }

    wx.showActionSheet({
      itemList: cities,
      success: (res) => {
        const originCity = cities[res.tapIndex];
        console.log('originCity selected:', originCity);
        const originDistricts = regions.getDistricts(originCity) || [];
        if (originDistricts.length === 0) {
          this._afterOriginPicked(originCity, '');
        } else {
          wx.showActionSheet({
            itemList: originDistricts,
            success: (res2) => {
              const originDistrict = originDistricts[res2.tapIndex];
              console.log('originDistrict selected:', originDistrict);
              this._afterOriginPicked(originCity, originDistrict);
            },
            fail: () => {
              console.log('origin district pick cancelled, use city only');
              this._afterOriginPicked(originCity, '');
            }
          });
        }
      },
      fail: () => {
        console.log('origin city pick cancelled');
      }
    });
  },

  _afterOriginPicked(originCity, originDistrict) {
    this.setData({ originCity, originDistrict });
    wx.showToast({ title: '请选择目的城市', icon: 'none', duration: 800 });

    const cities = regions.getCities() || [];
    wx.showActionSheet({
      itemList: cities,
      success: (res) => {
        const destinationCity = cities[res.tapIndex];
        const destDistricts = regions.getDistricts(destinationCity) || [];
        if (destDistricts.length === 0) {
          this._afterDestinationPicked(originCity, originDistrict, destinationCity, '');
        } else {
          wx.showActionSheet({
            itemList: destDistricts,
            success: (res2) => {
              const destinationDistrict = destDistricts[res2.tapIndex];
              this._afterDestinationPicked(originCity, originDistrict, destinationCity, destinationDistrict);
            },
            fail: () => {
              console.log('destination district pick cancelled, use city only');
              this._afterDestinationPicked(originCity, originDistrict, destinationCity, '');
            }
          });
        }
      },
      fail: () => {
        console.log('destination city pick cancelled');
        const origin = this._buildAddr(originCity, originDistrict);
        this.setData({ destinationCity: '', destinationDistrict: '' });
        this.loadCarpoolList(origin, '');
      }
    });
  },

  _afterDestinationPicked(originCity, originDistrict, destinationCity, destinationDistrict) {
    console.log('final picks ->', { originCity, originDistrict, destinationCity, destinationDistrict });
    this.setData({ originCity, originDistrict, destinationCity, destinationDistrict });

    const origin = this._buildAddr(originCity, originDistrict);
    const destination = this._buildAddr(destinationCity, destinationDistrict);
    console.log('apply filter -> origin:', origin, ' destination:', destination);

    this.loadCarpoolList(origin, destination);
  },

  _buildAddr(city, district) {
    const c = this._safe(city);
    const d = this._safe(district);
    if (c && d) return `${c} ${d}`;
    if (c) return c;
    if (d) return d;
    return '';
  },


  resetFilter() {
    console.log('resetFilter called');
    this.setData({
      originCity: '',
      originDistrict: '',
      destinationCity: '',
      destinationDistrict: ''
    });
    this.loadCarpoolList();
  },

  // other UI
  goToPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' });
  },

  joinCarpool(e) {
    const carpoolId = e.currentTarget.dataset.id;
    const item = (this.data.carpoolList || []).find(i => i.carpoolId === carpoolId);
    if (item && item.isFinished) { wx.showToast({ title: '此行程已结束', icon: 'none' }); return; }
    const app = getApp();
    const userId = (app && app.globalData && app.globalData.userId) || wx.getStorageSync('userId') || null;
    if (!userId) { wx.showToast({ title: '请先登录', icon: 'none' }); return; }

    wx.showModal({
      title: '确认加入',
      content: '确定要加入这个拼车行程吗?',
      success: (res) => {
        if (res.confirm) {
          api.joinCarpool({ carpoolId, userId }).then(resp => {
            const ok = resp && (resp.code === 200 || resp.code === '200' || resp.success === true);
            if (ok) {
              wx.showToast({ title: '加入成功', icon: 'success' });


              try {
                const key = 'recentJoinedCarpools';
                const existing = wx.getStorageSync(key) || [];

                const storedItem = {
                  carpoolId: item.carpoolId || item.id || item.carpool_id,
                  origin: item.origin || item.originCity || item.displayOrigin || '',
                  destination: item.destination || item.destinationCity || item.displayDestination || '',
                  departureTime: item.departureTime || item.departure_time || item.departure || '',
                  participants: item.participants || [],

                  userId: item.userId || item.user_id || null,
                  publisherName: item.publisherName || item.userName || null,
                  relation: 'joined'
                };

                const filtered = (existing || []).filter(f => f && (f.carpoolId || f.id || f.carpool_id) !== storedItem.carpoolId);
                filtered.unshift(storedItem);

                wx.setStorageSync(key, filtered.slice(0, 50));
                console.log('recentJoinedCarpools updated, id=', storedItem.carpoolId);
              } catch (e) {
                console.warn('保存 recentJoinedCarpools 失败', e);
              }


              setTimeout(() => {
                wx.switchTab({ url: '/pages/mine/mine' });
              }, 600);
            } else {
              wx.showToast({ title: resp && (resp.message || resp.msg) ? (resp.message || resp.msg) : '加入失败', icon: 'none' });
            }
          }).catch(err => {
            console.error('joinCarpool error', err);
            wx.showToast({ title: '加入失败', icon: 'none' });
          });
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadCarpoolList(this.data.lastOriginFilter || '', this.data.lastDestinationFilter || '');
    wx.stopPullDownRefresh();
  }
});