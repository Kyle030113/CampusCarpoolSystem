// pages/mine/mine.js
// "我的" 页面 - quitJoin updated to accept local-only leave if backend has no leave endpoint.

const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: null,
    ongoingList: [],
    finishedList: [],
    activeTab: 0,
    finishingId: null,
    locallyFinishedIds: []
  },

  onShow() {
    console.log('我的页面 onShow');
    try {
      const app = getApp();
      const storedUserId = wx.getStorageSync('userId') || null;
      const storedHasLogin = wx.getStorageSync('hasLogin') || !!storedUserId;
      const storedUserInfo = wx.getStorageSync('userInfo') || null;

      if ((!app || !app.globalData || !app.globalData.hasLogin) && storedHasLogin && storedUserId) {
        if (app && app.globalData) {
          app.globalData.userId = storedUserId;
          app.globalData.userInfo = storedUserInfo;
          app.globalData.hasLogin = true;
        }
        this.setData({ userInfo: storedUserInfo });
        console.log('从 storage 恢复登录状态，用户ID:', storedUserId);
      } else if (app && app.globalData && app.globalData.hasLogin) {
        this.setData({ userInfo: app.globalData.userInfo });
        console.log('已登录，用户ID:', app.globalData.userId);
      } else {
        this.setData({ userInfo: null });
        console.log('当前无登录信息（可通过登录页登录）');
      }
    } catch (e) {
      console.error('检查登录状态失败:', e);
      this.setData({ userInfo: null });
    }

    this.loadHistory();
  },

  // ----------------- Quit join / leave a carpool -----------------
  // Bound to <button bindtap="quitJoin" data-id="{{item.carpoolId}}">
  quitJoin(e) {
    const carpoolId = e.currentTarget.dataset.id || e.currentTarget.dataset.carpoolId;
    if (!carpoolId) {
      wx.showToast({ title: '行程ID缺失', icon: 'none' });
      return;
    }

    const app = getApp();
    const userId = (app && app.globalData && app.globalData.userId) || wx.getStorageSync('userId') || null;
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认退出',
      content: '确定要退出该行程吗？退出后你将不再显示为参与者。',
      success: (res) => {
        if (!res.confirm) return;

        // optimistic UI: remove item from lists locally
        const ongoing = (this.data.ongoingList || []).slice();
        const finished = (this.data.finishedList || []).slice();

        const removeById = (arr) => {
          const idx = arr.findIndex(i => (i.carpoolId === carpoolId || i.carpool_id === carpoolId || i.id === carpoolId));
          if (idx >= 0) {
            arr.splice(idx, 1);
            return true;
          }
          return false;
        };

        const removedFromOngoing = removeById(ongoing);
        const removedFromFinished = !removedFromOngoing && removeById(finished);

        this.setData({ ongoingList: ongoing, finishedList: finished });

        try {
          const key = 'recentJoinedCarpools';
          const stored = wx.getStorageSync(key) || [];
          if (Array.isArray(stored) && stored.length > 0) {
            const filtered = stored.filter(f => {
              const id = f && (f.carpoolId || f.carpool_id || f.id);
              return id && String(id) !== String(carpoolId) ? true : false;
            });
            wx.setStorageSync(key, filtered);
            console.log('recentJoinedCarpools removed id=', carpoolId);
          }
        } catch (e) {
          console.warn('更新 recentJoinedCarpools 失败', e);
        }

        // call backend to actually leave
        api.leaveCarpool({ carpoolId, userId }).then(resp => {
          const ok = resp && (resp.code === 200 || resp.code === '200' || resp.success === true);
          const localOnly = resp && resp.localOnly === true;
          if (ok || localOnly) {

            wx.showToast({ title: localOnly ? '已退出（本地）' : '已退出该行程', icon: 'success' });

            setTimeout(() => this.loadHistory(), 600);
          } else {
            wx.showToast({ title: (resp && (resp.message || resp.msg)) ? (resp.message || resp.msg) : '退出失败，请重试', icon: 'none' });

            setTimeout(() => this.loadHistory(), 600);
          }
        }).catch(err => {
          console.error('leaveCarpool error:', err);

          wx.showToast({ title: '退出失败，请重试', icon: 'none' });
          setTimeout(() => this.loadHistory(), 600);
        });
      }
    });
  },

  // ----------------- History / helpers -----------------
  _parseDepartureToMs(depRaw) {
    if (!depRaw) return NaN;
    try {
      const s = String(depRaw).trim();
      if (/[zZ]|[\+\-]\d{2}:?\d{2}$/.test(s)) {
        const t = Date.parse(s);
        if (!isNaN(t)) return t;
      }
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) {
        const t2 = Date.parse(s);
        if (!isNaN(t2)) return t2;
      }
      const t3 = Date.parse(s.replace('T', ' '));
      if (!isNaN(t3)) return t3;
      const t4 = new Date(s).getTime();
      if (!isNaN(t4)) return t4;
    } catch (e) {
      console.warn('parse departure error', e, depRaw);
    }
    return NaN;
  },

  loadHistory() {
    try {
      const app = getApp();
      const userId = (app && app.globalData && app.globalData.userId) || wx.getStorageSync('userId') || null;
      if (!userId) {
        console.log('loadHistory: 无用户ID，跳过');
        this.setData({ ongoingList: [], finishedList: [] });
        return;
      }

      console.log('加载历史记录并获取已加入列表，用户ID:', userId);


      let localJoined = [];
      try {
        const fallback = wx.getStorageSync('recentJoinedCarpools') || [];
        if (Array.isArray(fallback) && fallback.length > 0) {
          localJoined = fallback;
          console.log('loadHistory: using local recentJoinedCarpools count=', localJoined.length);
        }
      } catch (e) {
        console.warn('读取 recentJoinedCarpools 失败', e);
      }

      const pHistory = api.getHistory ? api.getHistory(userId).catch(err => {
        console.warn('getHistory failed', err);
        return null;
      }) : Promise.resolve(null);

      const pJoined = (localJoined.length > 0) ? Promise.resolve(localJoined) :
        (api.getJoinedCarpools ? api.getJoinedCarpools(userId).catch(err => {
          console.debug('getJoinedCarpools network failed, falling back to []', err);
          return [];
        }) : Promise.resolve([]));

      Promise.all([pHistory, pJoined]).then(results => {
        const [historyRes, joinedRes] = results;

        let publishedList = [];
        if (historyRes && (historyRes.success === true || historyRes.code === 200 || historyRes.code === '200')) {
          const content = historyRes.content || {};
          publishedList = (content.ongoing || []).concat(content.finished || []);
        } else if (Array.isArray(historyRes)) {
          publishedList = historyRes;
        }

        let joinedList = [];
        if (Array.isArray(joinedRes)) joinedList = joinedRes;
        else if (joinedRes && joinedRes.content && Array.isArray(joinedRes.content)) joinedList = joinedRes.content;
        else if (joinedRes && joinedRes.data && Array.isArray(joinedRes.data)) joinedList = joinedRes.data;
        else if (joinedRes && typeof joinedRes === 'object') {
          joinedList = joinedRes.content || joinedRes.data || [];
          if (!Array.isArray(joinedList)) joinedList = [];
        }

        // fallback to local recentJoinedCarpools if backend doesn't provide joined
        if ((!joinedList || joinedList.length === 0)) {
          try {
            const fallback = wx.getStorageSync('recentJoinedCarpools') || [];
            if (Array.isArray(fallback) && fallback.length > 0) {
              console.log('使用本地兜底 recentJoinedCarpools 条目:', fallback.length);
              joinedList = joinedList.concat(fallback);
            }
          } catch (e) {
            console.warn('读取 recentJoinedCarpools 失败', e);
          }
        }

        // merge and dedupe by id (published takes precedence)
        const dedupeMap = new Map();
        const getId = item => item && (item.carpoolId || item.carpool_id || item.id || null);

        publishedList.forEach(item => {
          const id = getId(item);
          if (!id) return;
          const copy = Object.assign({}, item, { relation: 'publisher' });
          if (!dedupeMap.has(id)) dedupeMap.set(id, copy);
        });

        joinedList.forEach(item => {
          const id = getId(item);
          if (!id) return;
          if (dedupeMap.has(id)) {
            const exist = dedupeMap.get(id);
            if (!exist.participants || exist.participants.length === 0) {
              exist.participants = item.participants || exist.participants;
            }
            dedupeMap.set(id, exist);
          } else {
            const copy = Object.assign({}, item, { relation: 'joined' });
            dedupeMap.set(id, copy);
          }
        });

        const allList = Array.from(dedupeMap.values());
        console.log('合并后的记录数:', allList.length);

        const nowMs = Date.now();
        const ongoing = [];
        const finished = [];

        allList.forEach(item => {
          const participants = Array.isArray(item.participants) ? item.participants : [];
          const app = getApp();
          const uid = (app && app.globalData && app.globalData.userId) || wx.getStorageSync('userId') || null;

          let relation = item.relation || 'other';
          if (uid && (item.userId === uid || item.user_id === uid)) relation = 'publisher';
          else if (relation !== 'publisher' && uid && participants.some(p => p && (p.userId === uid || p.user_id === uid))) relation = 'joined';

          const displayOrigin = item.origin || item.originCity || item.origin_detail || item.originDetail || '';
          const displayDestination = item.destination || item.destinationCity || item.destination_detail || item.destinationDetail || '';
          const displayDeparture = item.departureTime || item.departure_time || item.departure || '';

          const depMs = this._parseDepartureToMs(item.departureTime || item.departure_time || item.departure);
          let isFinished = false;
          if (!isNaN(depMs)) {
            isFinished = (depMs <= nowMs);
          } else {
            const statusNum = Number(item.status || 0);
            isFinished = (statusNum !== 1);
          }

          const mapped = Object.assign({}, item, {
            displayOrigin,
            displayDestination,
            displayDeparture,
            participants,
            relation,
            isFinished
          });

          if (isFinished) finished.push(mapped);
          else ongoing.push(mapped);
        });

        const sortByDep = (a, b) => {
          const ta = this._parseDepartureToMs(a.departureTime || a.departure_time || a.departure) || 0;
          const tb = this._parseDepartureToMs(b.departureTime || b.departure_time || b.departure) || 0;
          return ta - tb;
        };
        ongoing.sort(sortByDep);
        finished.sort(sortByDep);

        this.setData({ ongoingList: ongoing, finishedList: finished });
      }).catch(err => {
        console.error('loadHistory Promise.all error:', err);
        wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
        this.setData({ ongoingList: [], finishedList: [] });
      });
    } catch (e) {
      console.error('loadHistory outer error:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ ongoingList: [], finishedList: [] });
    }
  },

  // ----------------- UI Actions -----------------
  openDetail(e) {
    const carpoolId = e.currentTarget.dataset.id || e.currentTarget.dataset.carpoolId;
    if (!carpoolId) { wx.showToast({ title: '找不到该行程ID', icon: 'none' }); return; }
    wx.navigateTo({ url: `/pages/detail/detail?carpoolId=${encodeURIComponent(carpoolId)}` });
  },

  finishTrip(e) {
    const carpoolId = e.currentTarget.dataset.id || e.currentTarget.dataset.carpoolId;
    if (!carpoolId) { wx.showToast({ title: '行程ID缺失', icon: 'none' }); return; }
    if (this.data.finishingId === carpoolId) { return; }

    wx.showModal({
      title: '确认结束',
      content: '确定要结束此行程吗？此操作无法撤回。',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ finishingId: carpoolId });

        const ongoing = (this.data.ongoingList || []).slice();
        const finished = (this.data.finishedList || []).slice();
        const idx = ongoing.findIndex(i => (i.carpoolId === carpoolId || i.carpool_id === carpoolId));
        if (idx >= 0) {
          const optimisticItem = Object.assign({}, ongoing.splice(idx, 1)[0], { isFinished: true, relation: 'publisher' });
          finished.unshift(optimisticItem);
          this.setData({ ongoingList: ongoing, finishedList: finished });
        }

        api.finishCarpool(carpoolId).then(resp => {
          const ok = resp && (resp.code === 200 || resp.code === '200' || resp.success === true);
          if (ok) {
            wx.showToast({ title: '已结束', icon: 'success' });
            setTimeout(() => { this.setData({ finishingId: null }); this.loadHistory(); }, 600);
          } else {
            this.setData({ finishingId: null });
            wx.showToast({ title: resp && (resp.message || resp.msg) ? (resp.message || resp.msg) : '结束失败', icon: 'none' });
            this.loadHistory();
          }
        }).catch(err => {
          console.error('finishCarpool error:', err);
          this.setData({ finishingId: null });
          wx.showToast({ title: '请求失败，请重试', icon: 'none' });
          this.loadHistory();
        });
      }
    });
  },

  logout() {
    console.log('logout clicked');
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？退出后需重新登录才能使用发布/我的功能。',
      success: (res) => {
        if (!res.confirm) return;
        try {
          const keysToClear = ['userId', 'hasLogin', 'userInfo', 'openId', 'recentJoinedCarpools'];
          keysToClear.forEach(k => { try { wx.removeStorageSync(k); } catch (e) { } });
          const app = getApp();
          if (app && app.globalData) {
            app.globalData.userId = null;
            app.globalData.userInfo = null;
            app.globalData.openId = null;
            app.globalData.hasLogin = false;
          }
          this.setData({ userInfo: null, ongoingList: [], finishedList: [], activeTab: 0 });
          wx.showToast({ title: '已退出登录', icon: 'success', duration: 900 });
          setTimeout(() => { try { wx.reLaunch({ url: '/pages/login/login' }); } catch (e) { try { wx.redirectTo({ url: '/pages/login/login' }); } catch (e2) { } } }, 900);
        } catch (e) {
          console.error('logout cleanup error', e);
          wx.showToast({ title: '退出失败，请重试', icon: 'none' });
        }
      }
    });
  },

  switchTab(e) { const index = parseInt(e.currentTarget.dataset.index, 10); this.setData({ activeTab: index }); },
  onPullDownRefresh() { this.loadHistory(); wx.stopPullDownRefresh(); }
});