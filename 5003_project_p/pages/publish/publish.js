// pages/publish/publish.js

const api = require('../../utils/api.js');
const regions = require('../../utils/regions.js');

Page({
  data: {

    citiesRaw: [],
    citiesDisplay: [],

    originCityIndex: 0,
    originDistrictIndex: 0,
    originDistricts: [],
    originCity: '',
    originDistrict: '',

    destinationCityIndex: 0,
    destinationDistrictIndex: 0,
    destinationDistricts: [],
    destinationCity: '',
    destinationDistrict: '',

    departureDate: '',
    departureTime: '',
    minDate: '',

    remarks: '',
    publishing: false
  },

  onLoad() {

    const raw = (regions.getCities && typeof regions.getCities === 'function') ? (regions.getCities() || []) : (regions.cities || []);
    const citiesRaw = Array.isArray(raw) ? raw : [];
    const citiesDisplay = citiesRaw.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.name || item.city || item.label || String(item.value || '');
      return String(item || '');
    });

    const today = this.formatDate(new Date());

    const now = new Date();
    const nowHHmm = this._formatTimeHHMM(now);

    this.setData({
      citiesRaw,
      citiesDisplay,
      minDate: today,
      departureDate: today,
      departureTime: nowHHmm
    });

    console.log('publish onLoad - cities loaded:', citiesDisplay.length, citiesDisplay, 'initial time:', nowHHmm);
  },


  onOriginCityChange(e) {
    const idx = Number(e.detail.value);
    const safeIdx = this._safeIndex(idx, this.data.citiesDisplay);
    const city = this.data.citiesDisplay[safeIdx] || '';
    const districts = this._getDistrictsForCity(city);
    this.setData({
      originCityIndex: safeIdx,
      originCity: city,
      originDistrictIndex: 0,
      originDistricts: districts,
      originDistrict: ''
    });
    console.log('origin city selected:', safeIdx, city, 'districts:', (districts || []).length);
  },

  onOriginDistrictChange(e) {
    const idx = Number(e.detail.value);
    const safeIdx = this._safeIndex(idx, this.data.originDistricts);
    const district = this.data.originDistricts[safeIdx] || '';
    this.setData({ originDistrictIndex: safeIdx, originDistrict: district });
    console.log('origin district selected:', safeIdx, district);
  },

  onDestinationCityChange(e) {
    const idx = Number(e.detail.value);
    const safeIdx = this._safeIndex(idx, this.data.citiesDisplay);
    const city = this.data.citiesDisplay[safeIdx] || '';
    const districts = this._getDistrictsForCity(city);
    this.setData({
      destinationCityIndex: safeIdx,
      destinationCity: city,
      destinationDistrictIndex: 0,
      destinationDistricts: districts,
      destinationDistrict: ''
    });
    console.log('destination city selected:', safeIdx, city, 'districts:', (districts || []).length);
  },

  onDestinationDistrictChange(e) {
    const idx = Number(e.detail.value);
    const safeIdx = this._safeIndex(idx, this.data.destinationDistricts);
    const district = this.data.destinationDistricts[safeIdx] || '';
    this.setData({ destinationDistrictIndex: safeIdx, destinationDistrict: district });
    console.log('destination district selected:', safeIdx, district);
  },

  onDepartureDateChange(e) {
    this.setData({ departureDate: e.detail.value });
    console.log('departure date chosen:', e.detail.value);
  },

  onDepartureTimeChange(e) {
    this.setData({ departureTime: e.detail.value });
    console.log('departure time chosen:', e.detail.value);
  },

  onRemarksInput(e) {
    const v = (e.detail && e.detail.value) ? String(e.detail.value) : '';
    this.setData({ remarks: v });
  },


  async publish() {
    if (this.data.publishing) return;
    if (!this._validateForm()) return;

    const { originCity, originDistrict, destinationCity, destinationDistrict, departureDate, departureTime, remarks } = this.data;
    const { userId, userName } = this._getUserInfo();
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => wx.redirectTo({ url: '/pages/login/login' }), 1200);
      return;
    }


    const dateObj = this._buildDepartureDate(departureDate, departureTime);
    if (!dateObj) {
      wx.showToast({ title: '出发时间格式错误', icon: 'none' });
      return;
    }
    const formattedDepartureISO = this.formatDateTimeISOLocal(dateObj);

    const payload = {
      userId: userId,
      publisherName: userName,
      origin: originCity || '',
      originDetail: originDistrict || '',
      destination: destinationCity || '',
      destinationDetail: destinationDistrict || '',
      departureTime: formattedDepartureISO,
      remarks: remarks || '',
      status: 1
    };

    console.log('publish payload (object):', payload);
    console.log('publish payload (stringified):', JSON.stringify(payload));

    this.setData({ publishing: true });
    wx.showLoading({ title: '发布中...', mask: true });

    try {
      const res = await api.publishCarpool(payload);
      console.log('发布响应:', res);
      const ok = res && (res.code === 200 || res.code === '200' || res.success === true);
      if (ok) {
        wx.hideLoading();
        wx.showToast({ title: '发布成功', icon: 'success', duration: 1200 });
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1200);
      } else {
        wx.hideLoading();
        console.error('发布被判定为失败，后端返回：', res);
        wx.showToast({ title: (res && (res.message || res.msg)) || '发布失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('发布失败:', err);
      wx.showToast({ title: (err && err.statusCode) ? `发布失败: ${err.statusCode}` : '网络或服务器错误，发布失败', icon: 'none' });
    } finally {
      this.setData({ publishing: false });
    }
  },

  // ---------- Utilities ----------
  _getUserInfo() {
    const app = getApp() || {};
    const userId = app && app.globalData ? app.globalData.userId : null;
    const userName = (app && app.globalData && app.globalData.userInfo && app.globalData.userInfo.nickName) || '用户';
    return { userId, userName };
  },

  _buildDepartureDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const isoLocal = `${dateStr}T${timeStr}`;
    let d = new Date(isoLocal);
    if (isNaN(d.getTime())) {
      d = new Date(`${dateStr} ${timeStr}`);
      if (isNaN(d.getTime())) return null;
    }
    return d;
  },

  _formatTimeHHMM(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  formatDateTimeISOLocal(dateObj) {
    const yyyy = dateObj.getFullYear();
    const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
  },

  _validateForm() {
    const { originCity, originDistrict, destinationCity, destinationDistrict, departureDate, departureTime } = this.data;
    if (!originCity || !originDistrict) { wx.showToast({ title: '请选择出发地', icon: 'none' }); return false; }
    if (!destinationCity || !destinationDistrict) { wx.showToast({ title: '请选择目的地', icon: 'none' }); return false; }
    if (!departureDate || !departureTime) { wx.showToast({ title: '请选择出发时间', icon: 'none' }); return false; }
    return true;
  },

  _getDistrictsForCity(city) {
    try {
      if (!city) return [];
      if (regions.getDistricts && typeof regions.getDistricts === 'function') {
        const d = regions.getDistricts(city);
        return Array.isArray(d) ? d : [];
      }

      const found = (this.data.citiesRaw || []).find(item => {
        if (typeof item === 'string') return item === city;
        if (item && typeof item === 'object') {
          const name = item.name || item.city || item.label;
          return name === city;
        }
        return false;
      });
      if (found && typeof found === 'object' && Array.isArray(found.districts)) return found.districts;
    } catch (e) {
      console.warn('getDistrictsForCity error', e);
    }
    return [];
  },

  _safeIndex(idx, arr) {
    const i = Number.isFinite(Number(idx)) ? Number(idx) : 0;
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    if (i < 0) return 0;
    if (i >= arr.length) return arr.length - 1;
    return i;
  }
});