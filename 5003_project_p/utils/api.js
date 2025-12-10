// utils/api.js

const BASE_URL = 'http://localhost:7001';
function request({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({ statusCode: res.statusCode, data: res.data, url });
        }
      },
      fail(err) {
        reject({ error: err, url });
      }
    });
  });
}

module.exports = {
  login(payload = {}) {
    return request({
      url: '/user/login',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: payload
    }).catch(() => {
      return request({
        url: '/login',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: payload
      });
    });
  },

  browseCarpool(origin = '', destination = '') {
    const qs = `?origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}`;
    return request({ url: `/carpool/browse${qs}`, method: 'GET' });
  },

  publishCarpool(payload = {}) {
    return request({
      url: '/carpool/publish',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: payload
    });
  },

  getHistory(userId) {
    const qs = `?userId=${encodeURIComponent(userId || '')}`;
    return request({ url: `/carpool/history${qs}`, method: 'GET' });
  },

  getJoinedCarpools(userId) {
    const endpoints = [
      `/carpool/joined?userId=${encodeURIComponent(userId || '')}`,
      `/carpool/join-list?userId=${encodeURIComponent(userId || '')}`,
      `/carpool/joined-list?userId=${encodeURIComponent(userId || '')}`,
      `/carpool/participant/list?userId=${encodeURIComponent(userId || '')}`
    ];

    const tryEndpoint = (idx) => {
      if (idx >= endpoints.length) return Promise.resolve([]);
      const url = endpoints[idx];
      return request({ url, method: 'GET' })
        .then(res => {
          if (Array.isArray(res)) return res;
          if (res && Array.isArray(res.content)) return res.content;
          if (res && Array.isArray(res.data)) return res.data;
          return res;
        })
        .catch(err => {
          const code = err && err.statusCode;
          if (code && (code >= 400 && code < 500)) {

            return tryEndpoint(idx + 1);
          }
          console.debug(`getJoinedCarpools: endpoint ${url} failed`, err);
          return tryEndpoint(idx + 1);
        });
    };

    return tryEndpoint(0);
  },

  joinCarpool(payload = {}) {
    return request({
      url: '/carpool/join',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: payload
    });
  },


  leaveCarpool(payload = {}) {
    const cached = wx.getStorageSync('leaveEndpoint');

    if (cached === 'none') {
      return Promise.resolve({ success: true, localOnly: true });
    }

    if (cached && typeof cached === 'string' && cached !== 'none') {
      const url = cached.indexOf('?') >= 0 ? `${cached}` : `${cached}`;

      const data = url.indexOf('?') >= 0 ? {} : payload;
      return request({ url, method: 'POST', header: { 'content-type': 'application/json' }, data })
        .then(res => res)
        .catch(err => {
          try { wx.removeStorageSync('leaveEndpoint'); } catch (e) { /* ignore */ }
          console.debug('leaveCarpool: cached endpoint failed, will probe alternatives', err);
          return module.exports.leaveCarpool(payload);
        });
    }

    const endpoints = [
      { url: '/carpool/leave', method: 'POST' },
      { url: '/carpool/unjoin', method: 'POST' },
      { url: '/carpool/quit', method: 'POST' },
      { url: `/carpool/leave?carpoolId=${encodeURIComponent(payload.carpoolId || '')}&userId=${encodeURIComponent(payload.userId || '')}`, method: 'POST' }
    ];

    const tryEndpoint = (idx) => {
      if (idx >= endpoints.length) {
        try { wx.setStorageSync('leaveEndpoint', 'none'); } catch (e) { /* ignore */ }
        return Promise.resolve({ success: true, localOnly: true });
      }
      const ep = endpoints[idx];
      const data = ep.url.indexOf('?') >= 0 ? {} : payload;
      return request({ url: ep.url, method: ep.method, header: { 'content-type': 'application/json' }, data })
        .then(res => {
          try { wx.setStorageSync('leaveEndpoint', ep.url); } catch (e) { /* ignore */ }
          return res;
        })
        .catch(err => {
          const code = err && err.statusCode;
          if (code && (code >= 400 && code < 500)) {
            return tryEndpoint(idx + 1);
          }
          console.debug(`leaveCarpool: endpoint ${ep.url} failed`, err);
          return tryEndpoint(idx + 1);
        });
    };

    return tryEndpoint(0);
  },

  finishCarpool(carpoolId) {
    const qs = `?carpoolId=${encodeURIComponent(carpoolId)}`;
    return request({
      url: `/carpool/finish${qs}`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {}
    });
  },

  finishCarpoolForm(carpoolId) {
    const body = `carpoolId=${encodeURIComponent(carpoolId)}`;
    return request({
      url: '/carpool/finish',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: body
    });
  }
};