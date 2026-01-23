// apiHelper.js
window.APIHelper = (function() {
  const STORAGE_KEY = 'auth_token';
  const USE_SESSION = true; // 改 true 則改用 sessionStorage
  const store = USE_SESSION ? window.sessionStorage : window.localStorage;

  let token = ''; // 閉包內快取，效能較好

  // 啟動時先從 storage 讀回
  try {
    token = store.getItem(STORAGE_KEY) || '';
  } catch (_) { /* 某些隱私模式可能丟例外，忽略 */ }

  function setToken(newToken) {
    token = String(newToken || '');
    try { store.setItem(STORAGE_KEY, token); } catch (_) {}
  }

  function getToken() {
    return token;
  }

  function clearToken() {
    token = '';
    try { store.removeItem(STORAGE_KEY); } catch (_) {}
  }

  /**
   * 發送 API 請求
   * @param {Object} payload - 要送給後端的 JSON 資料
   * @param {Function} [onSuccess] - 可選成功 callback(responseData)
   * @param {Function} [onError] - 可選錯誤 callback(errorMessage)
   * @returns {Promise<any>} - 回傳 Promise，可用 await 接結果
   */
  async function postAPI(apiName, payload, onSuccess, onError) {
    try {
      if (sessionStorage.getItem('isLogin') !== 'yes') {
        return;
      }    
      payload.apiName = apiName;
        // payload.token = token;

      const headers = { 'Content-Type': 'application/json' };
      // 自動帶入 token（若存在）
      // if (token) headers['Authorization'] = token;

      // token = 'ABC123XYZ';
      headers['Authorization'] = token;

      const res = await fetch(window.API_CONFIG?.BASE_URL || '/api', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Server Error');

      const response = await res.json();

      if (response.result === 'success') {
        // 儲存最後回應
        window.lastServerResponse = response.data || [];
        if (typeof onSuccess === 'function') onSuccess(response.data);
        return response;
      } else {
        const msg = response.mesg || '查詢失敗';
        if (typeof onError === 'function') onError(msg);
        else alert(msg);
        return null;
      }

    } catch (err) {
      const msg = '連線失敗：' + (err?.message || err);
      if (typeof onError === 'function') onError(msg);
      else alert(msg);
      return null;
    }
  }

  // 匯出
  return { setToken, getToken, clearToken, postAPI };
})();
